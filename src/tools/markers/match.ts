/* ==========================================================================
   match.ts — das escolhas (sítio, morfologia, idade e sexo, resultados de
   imuno) à lista ordenada de diagnósticos. Funções puras: recebem o
   conteúdo e as escolhas, devolvem cada tumor com a pontuação e, marcador a
   marcador, o que bateu, o que não bateu e o que bateu por exceção, para a
   tela mostrar por que ele apareceu ali.

   A pontuação é uma soma de log-verossimilhanças: para cada marcador
   informado, ln(p) se foi positivo e ln(1 − p) se foi negativo, onde p é a
   porcentagem de positividade daquele marcador naquele tumor. Positivo num
   marcador que só 10% marcam custa ln(0,10) = −2,3; negativo num marcador
   que 95% marcam custa ln(0,05) = −3,0; positivo num que 95% marcam custa
   quase nada. Um tumor sem dado para o marcador recebe ln(0,5), para não
   ganhar vantagem por ignorância. Sítio, morfologia e demografia entram como
   prior e como ajustes menores.
   ========================================================================== */

import {
  AGE_BANDS,
  bandOf,
  findMarker,
  pctMid,
  type AgeBand,
  type Band,
  type MarkerResult,
  type Pattern,
  type Sex,
  type SiteRole,
  type Tumor,
} from './types'

export type Result = 'pos' | 'neg'

export interface MarkerInput {
  result: Result
  /** Padrão observado, quando o patologista quis informar. */
  pattern?: Pattern
}

export interface Choice {
  site: string | null
  cells: Set<string>
  architecture: Set<string>
  features: Set<string>
  age: AgeBand | null
  sex: Sex | null
  markers: Map<string, MarkerInput>
  query: string
}

export const emptyChoice = (): Choice => ({
  site: null,
  cells: new Set(),
  architecture: new Set(),
  features: new Set(),
  age: null,
  sex: null,
  markers: new Map(),
  query: '',
})

/**
 * Veredito de um marcador informado, para um tumor:
 * - bate: o resultado é o esperado (positivo em ≥ 70%, negativo em ≤ 30%);
 * - compativel: o marcador é variável nesse tumor (30 a 70%);
 * - excecao: o resultado ocorre, mas é exceção (positivo em < 30% ou
 *   negativo em > 70%: "só 10% marcam S100");
 * - nao-bate: positivo num marcador quase nunca positivo (< 10%) ou negativo
 *   num quase sempre positivo (≥ 90%);
 * - padrao: positivo num marcador esperado, mas com padrão diferente do
 *   esperado (ex.: β-catenina só membranosa quando o tumor a tem nuclear);
 * - sem-dados: o conteúdo não tem esse marcador para esse tumor.
 */
export type Verdict = 'bate' | 'compativel' | 'excecao' | 'nao-bate' | 'padrao' | 'sem-dados'

export interface MarkerVerdict {
  marker: string
  input: MarkerInput
  entry?: MarkerResult
  verdict: Verdict
  /** Porcentagem (ponto médio) usada no cálculo. */
  pct?: number
  band?: Band
  ll: number
}

export interface Suggestion {
  tumor: Tumor
  score: number
  /** Como o tumor aparece no sítio escolhido; null quando não ocorre lá. */
  siteRole: SiteRole | null
  siteFreq: 1 | 2 | 3 | null
  morphHits: string[]
  morphMisses: string[]
  ageHit: boolean | null
  sexMismatch: boolean
  markers: MarkerVerdict[]
  /** Soma das log-verossimilhanças dos marcadores (antes do peso). */
  markerScore: number
  /** Quantos marcadores informados têm dado neste tumor. */
  covered: number
}

export const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v))

const PRIOR_BY_FREQ: Record<1 | 2 | 3, number> = { 3: 1.2, 2: 0.4, 1: -0.4 }
const METASTASIS_PENALTY = 0.6
const MARKER_WEIGHT = 1.5
const LN_HALF = Math.log(0.5)

/** Padrões compatíveis entre si (o observado pode ser um subconjunto do esperado). */
const patternCompatible = (observed: Pattern | undefined, expected: Pattern | undefined) => {
  if (!observed || !expected || expected === 'var' || observed === 'var') return true
  if (observed === expected) return true
  const pairs: Record<string, Pattern[]> = {
    NC: ['N', 'C'],
    CM: ['C', 'M'],
    dot: ['C'],
    C: ['dot', 'CM', 'NC'],
    N: ['NC'],
    M: ['CM'],
  }
  return pairs[expected]?.includes(observed) ?? false
}

export function judgeMarker(tumor: Tumor, id: string, input: MarkerInput): MarkerVerdict {
  const entry = tumor.markers.find((m) => m.marker === id)
  if (!entry) return { marker: id, input, verdict: 'sem-dados', ll: LN_HALF }
  const pct = pctMid(entry.pct)
  const p = clamp(pct / 100, 0.03, 0.97)
  const band = bandOf(entry.pct)
  const expected = entry.pattern ?? findMarker(id)?.pattern

  if (input.result === 'pos') {
    if (!patternCompatible(input.pattern, expected) && pct >= 30) {
      // Marcou, mas não do jeito esperado: conta como meio positivo.
      return { marker: id, input, entry, verdict: 'padrao', pct, band, ll: Math.log(Math.min(p, 0.5)) }
    }
    const verdict: Verdict = pct >= 70 ? 'bate' : pct >= 30 ? 'compativel' : pct >= 10 ? 'excecao' : 'nao-bate'
    return { marker: id, input, entry, verdict, pct, band, ll: Math.log(p) }
  }
  const verdict: Verdict = pct <= 30 ? 'bate' : pct < 70 ? 'compativel' : pct < 90 ? 'excecao' : 'nao-bate'
  return { marker: id, input, entry, verdict, pct, band, ll: Math.log(1 - p) }
}

export function scoreTumor(tumor: Tumor, choice: Choice): Suggestion {
  // Sítio: prior pela frequência; metástase vale menos que primário.
  let score = 0
  let siteRole: SiteRole | null = null
  let siteFreq: 1 | 2 | 3 | null = null
  if (choice.site) {
    const at = tumor.sites.filter((s) => s.site === choice.site).sort((a, b) => b.freq - a.freq || (a.role === 'primario' ? -1 : 1))[0]
    if (at) {
      siteRole = at.role
      siteFreq = at.freq
      score += PRIOR_BY_FREQ[at.freq] - (at.role === 'metastase' ? METASTASIS_PENALTY : 0)
    }
  } else {
    const best = Math.max(...tumor.sites.map((s) => s.freq)) as 1 | 2 | 3
    score += PRIOR_BY_FREQ[best] * 0.5
  }

  // Morfologia: cada escolha que o tumor tem sobe, cada uma que não tem desce.
  const morphHits: string[] = []
  const morphMisses: string[] = []
  const check = (chosen: Set<string>, have: string[] | undefined, hit: number, miss: number) => {
    for (const id of chosen) {
      if (have?.includes(id)) {
        morphHits.push(id)
        score += hit
      } else {
        morphMisses.push(id)
        score -= miss
      }
    }
  }
  check(choice.cells, tumor.cells, 1.2, 1.0)
  check(choice.architecture, tumor.architecture, 0.8, 0.4)
  check(choice.features, tumor.features, 0.8, 0.5)

  // Idade e sexo.
  let ageHit: boolean | null = null
  if (choice.age && tumor.ages && tumor.ages.length > 0) {
    ageHit = tumor.ages.includes(choice.age)
    score += ageHit ? 0.5 : -0.7
  }
  const sexMismatch = choice.sex !== null && tumor.sex !== undefined && tumor.sex !== choice.sex
  if (sexMismatch) score -= 1.5

  // Marcadores.
  const markers: MarkerVerdict[] = []
  let markerScore = 0
  let covered = 0
  for (const [id, input] of choice.markers) {
    const v = judgeMarker(tumor, id, input)
    markers.push(v)
    markerScore += v.ll
    if (v.entry) covered++
  }
  score += MARKER_WEIGHT * markerScore

  return { tumor, score, siteRole, siteFreq, morphHits, morphMisses, ageHit, sexMismatch, markers, markerScore, covered }
}

const hasEvidence = (c: Choice) => c.cells.size + c.architecture.size + c.features.size + c.markers.size > 0

/**
 * Lista ordenada. Com sítio escolhido, os tumores que ocorrem lá formam a
 * lista principal; os de outros sítios só entram no "considere também"
 * quando a morfologia ou a imuno os sustenta (pontuação de evidência
 * positiva), para lembrar de metástases e de tumores fora do lugar.
 */
export function suggest(tumors: Tumor[], choice: Choice): { primary: Suggestion[]; secondary: Suggestion[] } {
  const q = normalize(choice.query.trim())
  const primary: Suggestion[] = []
  const secondary: Suggestion[] = []
  const evidence = hasEvidence(choice)

  for (const tumor of tumors) {
    if (q) {
      const hay = normalize([tumor.name, ...(tumor.aka ?? [])].join(' '))
      if (!hay.includes(q)) continue
    }
    const s = scoreTumor(tumor, choice)
    if (q) {
      primary.push(s)
      continue
    }
    if (choice.site === null) {
      if (!evidence) continue
      primary.push(s)
      continue
    }
    if (s.siteRole) {
      primary.push(s)
    } else if (evidence) {
      // Só morfologia: precisa bater em tudo. Com imuno: a soma dos marcadores
      // tem de estar acima do "não sei" (ln 0,5 por marcador) com folga.
      const fits =
        s.markers.length === 0
          ? s.morphHits.length > 0 && s.morphMisses.length === 0
          : s.covered > 0 && s.markerScore > LN_HALF * s.markers.length + 0.5 && s.morphMisses.length <= s.morphHits.length
      if (fits) secondary.push(s)
    }
  }

  const byScore = (a: Suggestion, b: Suggestion) => b.score - a.score || (b.siteFreq ?? 0) - (a.siteFreq ?? 0) || a.tumor.name.localeCompare(b.tumor.name, 'pt-BR')
  primary.sort(byScore)
  secondary.sort(byScore)
  return { primary, secondary: secondary.slice(0, 12) }
}

/* ---- Próximos marcadores ------------------------------------------------------ */

export interface NextMarker {
  marker: string
  /** Ganho de informação esperado (bits) sobre os candidatos considerados. */
  gain: number
  /** Porcentagem em cada candidato (null = sem dado). */
  perCandidate: { tumor: Tumor; pct: number | null }[]
}

const entropy = (ws: number[]) => {
  let h = 0
  for (const w of ws) if (w > 0) h -= w * Math.log2(w)
  return h
}

/**
 * Entre os candidatos do topo (pesos por softmax da pontuação), qual
 * marcador ainda não pedido mais separa uns dos outros? Ganho de informação
 * esperado do resultado binário, descontado quando faltam dados em parte
 * dos candidatos.
 */
export function nextMarkers(candidates: Suggestion[], tested: Set<string>, limit = 8, topN = 6): NextMarker[] {
  const top = candidates.slice(0, topN)
  if (top.length < 2) return []
  const max = top[0].score
  const raw = top.map((s) => Math.exp(s.score - max))
  const sum = raw.reduce((a, b) => a + b, 0)
  const w = raw.map((r) => r / sum)
  const h0 = entropy(w)
  if (h0 < 0.05) return []

  const ids = new Set<string>()
  for (const s of top) for (const m of s.tumor.markers) if (!tested.has(m.marker)) ids.add(m.marker)

  const out: NextMarker[] = []
  for (const id of ids) {
    const ps = top.map((s) => {
      const e = s.tumor.markers.find((m) => m.marker === id)
      return e ? clamp(pctMid(e.pct) / 100, 0.03, 0.97) : null
    })
    const withData = ps.filter((p) => p !== null).length
    if (withData < 2) continue
    const pFilled = ps.map((p) => p ?? 0.5)
    const pPos = w.reduce((acc, wi, i) => acc + wi * pFilled[i], 0)
    const postPos = w.map((wi, i) => (wi * pFilled[i]) / pPos)
    const postNeg = w.map((wi, i) => (wi * (1 - pFilled[i])) / (1 - pPos))
    const gain = h0 - (pPos * entropy(postPos) + (1 - pPos) * entropy(postNeg))
    const coverage = w.reduce((acc, wi, i) => acc + (ps[i] === null ? 0 : wi), 0)
    out.push({
      marker: id,
      gain: gain * coverage,
      perCandidate: top.map((s, i) => ({ tumor: s.tumor, pct: ps[i] === null ? null : pctMid(s.tumor.markers.find((m) => m.marker === id)!.pct) })),
    })
  }
  return out.sort((a, b) => b.gain - a.gain).slice(0, limit)
}

/* ---- Comparação --------------------------------------------------------------- */

export interface CompareRow {
  marker: string
  pcts: (MarkerResult | null)[]
  /** Diferença máxima de porcentagem entre os tumores comparados. */
  spread: number
}

export function compareTumors(tumors: Tumor[]): CompareRow[] {
  const ids = new Set<string>()
  for (const t of tumors) for (const m of t.markers) ids.add(m.marker)
  const rows: CompareRow[] = []
  for (const id of ids) {
    const pcts = tumors.map((t) => t.markers.find((m) => m.marker === id) ?? null)
    const vals = pcts.filter((p): p is MarkerResult => p !== null).map((p) => pctMid(p.pct))
    const spread = vals.length >= 2 ? Math.max(...vals) - Math.min(...vals) : -1
    rows.push({ marker: id, pcts, spread })
  }
  return rows.sort((a, b) => b.spread - a.spread || a.marker.localeCompare(b.marker))
}

export const ageLabel = (id: AgeBand) => AGE_BANDS.find((a) => a.id === id)?.label ?? id
