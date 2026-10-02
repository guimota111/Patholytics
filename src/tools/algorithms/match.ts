/* ==========================================================================
   match.ts — das respostas à lista ordenada de entidades, ao "próximo passo"
   e ao estado de cada ramo do esquema. Funções puras.

   A pontuação segue o Marker Helper: soma de log-verossimilhanças. Para cada
   resposta dada, cada entidade contribui ln(p), onde p é a frequência com
   que a entidade mostra aquela opção (típico 0,90 … nunca 0,02). Uma
   resposta que a entidade "nunca" mostra custa ln(0,02) ≈ −3,9: derruba a
   barra de plausibilidade, mas não apaga a entidade da lista, porque o
   patologista precisa ver o que a derrubou.

   O "próximo passo" é a pergunta ainda não respondida com maior ganho de
   informação esperado sobre os candidatos do topo, pesados por softmax da
   pontuação.
   ========================================================================== */

import { DEFAULT_LIKELIHOOD, LIKELIHOOD_P, type Algorithm, type Branch, type Entity, type Likelihood, type Question } from './types'

/** Pergunta → opções marcadas (uma só nas `single`). */
export type Answers = Map<string, Set<string>>

export const emptyAnswers = (): Answers => new Map()

export const isAnswered = (answers: Answers, q: string) => (answers.get(q)?.size ?? 0) > 0

/** Marca ou desmarca uma opção, respeitando `single`. */
export function toggleAnswer(answers: Answers, q: Question, option: string): Answers {
  const next = new Map(answers)
  const current = new Set(next.get(q.id) ?? [])
  if (current.has(option)) current.delete(option)
  else if (q.kind === 'single') {
    current.clear()
    current.add(option)
  } else current.add(option)
  if (current.size === 0) next.delete(q.id)
  else next.set(q.id, current)
  return next
}

export function clearQuestion(answers: Answers, q: string): Answers {
  const next = new Map(answers)
  next.delete(q)
  return next
}

export const countAnswers = (answers: Answers) => [...answers.values()].reduce((n, s) => n + s.size, 0)

/* ---- Pontuação ---------------------------------------------------------------- */

export type Verdict = 'bate' | 'possivel' | 'contra' | 'exclui'

export const verdictOf = (l: Likelihood): Verdict => (l === 'tipico' || l === 'comum' ? 'bate' : l === 'possivel' ? 'possivel' : l === 'raro' ? 'contra' : 'exclui')

export interface AnswerVerdict {
  question: string
  option: string
  likelihood: Likelihood
  verdict: Verdict
  ll: number
}

export const likelihoodOf = (e: Entity, q: string, option: string): Likelihood => e.profile[q]?.[option] ?? DEFAULT_LIKELIHOOD

export interface Ranked {
  entity: Entity
  score: number
  verdicts: AnswerVerdict[]
  /** Razão de verossimilhança contra o primeiro colocado (0 a 1). */
  plausibility: number
  /** Quantas respostas a entidade "nunca" mostra. */
  excluded: number
}

const PRIOR_BY_FREQ: Record<1 | 2 | 3, number> = { 3: 0.5, 2: 0, 1: -0.5 }

export function scoreEntity(a: Algorithm, e: Entity, answers: Answers): Omit<Ranked, 'plausibility'> {
  let score = PRIOR_BY_FREQ[e.frequency]
  const verdicts: AnswerVerdict[] = []
  let excluded = 0
  for (const [qid, chosen] of answers) {
    const q = a.questions.find((x) => x.id === qid)
    if (!q) continue
    const w = q.weight ?? 1
    for (const option of chosen) {
      const likelihood = likelihoodOf(e, qid, option)
      const ll = w * Math.log(LIKELIHOOD_P[likelihood])
      const verdict = verdictOf(likelihood)
      if (verdict === 'exclui') excluded++
      verdicts.push({ question: qid, option, likelihood, verdict, ll })
      score += ll
    }
  }
  return { entity: e, score, verdicts, excluded }
}

export function rank(a: Algorithm, answers: Answers): Ranked[] {
  const scored = a.entities.map((e) => scoreEntity(a, e, answers))
  const best = Math.max(...scored.map((s) => s.score))
  return scored
    .map((s) => ({ ...s, plausibility: Math.exp(s.score - best) }))
    .sort((x, y) => y.score - x.score || y.entity.frequency - x.entity.frequency || x.entity.name.localeCompare(y.entity.name, 'pt-BR'))
}

/** Faixa de leitura da plausibilidade. */
export type Standing = 'lider' | 'em-jogo' | 'improvavel' | 'excluido'

export const standingOf = (r: Ranked): Standing => (r.excluded > 0 || r.plausibility < 0.01 ? 'excluido' : r.plausibility >= 0.5 ? 'lider' : r.plausibility >= 0.08 ? 'em-jogo' : 'improvavel')

/* ---- Próximo passo ---------------------------------------------------------------- */

export interface NextStep {
  question: Question
  /** Ganho de informação esperado, em bits, sobre os candidatos do topo. */
  gain: number
  /** Para cada candidato do topo, a opção mais típica dele nesta pergunta. */
  expected: { entity: Entity; option: string | null; likelihood: Likelihood }[]
}

const entropy = (ws: number[]) => {
  let h = 0
  for (const w of ws) if (w > 0) h -= w * Math.log2(w)
  return h
}

/** Candidatos do topo com peso softmax; só os que ainda estão em jogo. */
export function topCandidates(ranked: Ranked[], topN = 6): { list: Ranked[]; weights: number[] } {
  const alive = ranked.filter((r) => standingOf(r) !== 'excluido').slice(0, topN)
  if (alive.length === 0) return { list: [], weights: [] }
  const max = alive[0].score
  const raw = alive.map((r) => Math.exp(r.score - max))
  const sum = raw.reduce((x, y) => x + y, 0)
  return { list: alive, weights: raw.map((r) => r / sum) }
}

function gainSingle(q: Question, top: Ranked[], w: number[]): number {
  // Distribuição de cada candidato sobre as opções (verossimilhanças normalizadas).
  const dist = top.map((r) => {
    const ls = q.options.map((o) => LIKELIHOOD_P[likelihoodOf(r.entity, q.id, o.id)])
    const s = ls.reduce((x, y) => x + y, 0)
    return ls.map((l) => l / s)
  })
  const h0 = entropy(w)
  let expected = 0
  q.options.forEach((_, oi) => {
    const pO = w.reduce((acc, wi, i) => acc + wi * dist[i][oi], 0)
    if (pO <= 0) return
    const post = w.map((wi, i) => (wi * dist[i][oi]) / pO)
    expected += pO * entropy(post)
  })
  return h0 - expected
}

function gainMulti(q: Question, top: Ranked[], w: number[]): number {
  // Cada opção é uma observação binária; a pergunta vale pela melhor delas.
  const h0 = entropy(w)
  let best = 0
  for (const o of q.options) {
    const ps = top.map((r) => LIKELIHOOD_P[likelihoodOf(r.entity, q.id, o.id)])
    const pPos = w.reduce((acc, wi, i) => acc + wi * ps[i], 0)
    const postPos = w.map((wi, i) => (wi * ps[i]) / pPos)
    const postNeg = w.map((wi, i) => (wi * (1 - ps[i])) / (1 - pPos))
    const g = h0 - (pPos * entropy(postPos) + (1 - pPos) * entropy(postNeg))
    if (g > best) best = g
  }
  return best
}

export function nextSteps(a: Algorithm, ranked: Ranked[], answers: Answers, limit = 4): NextStep[] {
  const { list, weights } = topCandidates(ranked)
  if (list.length < 2 || entropy(weights) < 0.05) return []
  const out: NextStep[] = []
  for (const q of a.questions) {
    if (isAnswered(answers, q.id)) continue
    const gain = q.kind === 'single' ? gainSingle(q, list, weights) : gainMulti(q, list, weights)
    if (gain < 0.02) continue
    const expected = list.map((r) => {
      let bestOpt: string | null = null
      let bestL: Likelihood = 'possivel'
      for (const o of q.options) {
        const l = likelihoodOf(r.entity, q.id, o.id)
        if (LIKELIHOOD_P[l] > LIKELIHOOD_P[bestL] || (bestOpt === null && l === 'possivel' && q.kind === 'single')) {
          bestOpt = o.id
          bestL = l
        }
      }
      return { entity: r.entity, option: bestL === 'possivel' ? null : bestOpt, likelihood: bestL }
    })
    out.push({ question: q, gain: gain * (q.weight ?? 1), expected })
  }
  return out.sort((x, y) => y.gain - x.gain).slice(0, limit)
}

/* ---- Esquema ---------------------------------------------------------------------- */

export type BranchState = 'ativo' | 'parcial' | 'aberto' | 'fechado'

/**
 * - ativo: todas as condições respondidas e satisfeitas;
 * - parcial: as respondidas satisfazem, mas falta responder alguma;
 * - aberto: nenhuma condição respondida;
 * - fechado: alguma condição respondida contradiz o ramo.
 */
export function branchState(b: Branch, answers: Answers): BranchState {
  let answered = 0
  for (const c of b.when) {
    const chosen = answers.get(c.question)
    if (!chosen || chosen.size === 0) continue
    answered++
    if (!c.options.some((o) => chosen.has(o))) return 'fechado'
  }
  if (answered === 0) return 'aberto'
  return answered === b.when.length ? 'ativo' : 'parcial'
}

/* ---- Conclusão ------------------------------------------------------------------------ */

export interface Conclusion {
  kind: 'nenhuma' | 'aberta' | 'favorece' | 'forte'
  leader: Ranked | null
  /** Quem ainda disputa com o líder (plausibilidade ≥ 0,08). */
  rivals: Ranked[]
}

export function conclude(ranked: Ranked[], answers: Answers): Conclusion {
  if (countAnswers(answers) === 0 || ranked.length === 0) return { kind: 'nenhuma', leader: null, rivals: [] }
  const leader = ranked[0]
  if (standingOf(leader) === 'excluido') return { kind: 'aberta', leader: null, rivals: [] }
  const rivals = ranked.slice(1).filter((r) => standingOf(r) === 'em-jogo' || standingOf(r) === 'lider')
  const second = ranked[1]?.plausibility ?? 0
  const kind: Conclusion['kind'] = second < 0.02 && countAnswers(answers) >= 3 ? 'forte' : second < 0.2 ? 'favorece' : 'aberta'
  return { kind, leader, rivals }
}
