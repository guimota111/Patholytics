/* ==========================================================================
   mohs.ts — cirurgia de Mohs: a geometria dos quadrantes no relógio, o
   agrupamento dos cassetes e o texto do laudo. Tudo puro.
   ========================================================================== */

import { capitalize, dataAssinatura, fmtMedidasX, isquemiaTexto, joinComma } from './text'
import {
  defaultCron,
  sanitizeCron,
  sanitizeFrag,
  type MohsAmpliacao,
  type MohsDivisao,
  type MohsDoc,
  type MohsFrag,
  type MohsPrincipal,
  type MohsShape,
} from './types'

export const MOHS_TINTAS: { nome: string; hex: string }[] = [
  { nome: 'azul', hex: '#2563eb' },
  { nome: 'verde', hex: '#16a34a' },
  { nome: 'amarelo', hex: '#eab308' },
  { nome: 'vermelho', hex: '#dc2626' },
  { nome: 'preto', hex: '#111827' },
  { nome: 'laranja', hex: '#f97316' },
  { nome: 'roxo', hex: '#9333ea' },
  { nome: 'rosa', hex: '#ec4899' },
  { nome: 'branco', hex: '#f8fafc' },
]

export function tintaHex(nome: string): string {
  const key = String(nome || '').trim().toLowerCase()
  if (!key) return 'transparent'
  return MOHS_TINTAS.find((t) => t.nome === key)?.hex ?? '#64748b'
}

/* ---- Geometria ----------------------------------------------------------- */

export function polarToXY(cx: number, cy: number, r: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

export const normDeg = (deg: number) => ((deg % 360) + 360) % 360

export function sectorPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const sweep = endDeg - startDeg
  if (sweep >= 359.9) {
    return `M ${cx} ${(cy - r).toFixed(2)} A ${r} ${r} 0 1 1 ${cx} ${(cy + r).toFixed(2)} A ${r} ${r} 0 1 1 ${cx} ${(cy - r).toFixed(2)} Z`
  }
  const p1 = polarToXY(cx, cy, r, startDeg)
  const p2 = polarToXY(cx, cy, r, endDeg)
  const largeArc = sweep > 180 ? 1 : 0
  return `M ${cx} ${cy} L ${p1.x.toFixed(2)} ${p1.y.toFixed(2)} A ${r} ${r} 0 ${largeArc} 1 ${p2.x.toFixed(2)} ${p2.y.toFixed(2)} Z`
}

/** 0° → "12", 45° → "1:30" — meia hora mais próxima. */
export function degToClock(deg: number): string {
  let h = Math.round(normDeg(deg) / 15) / 2
  if (h >= 12) h -= 12
  const cheia = Math.floor(h)
  const hh = cheia === 0 ? 12 : cheia
  return h % 1 ? `${hh}:30` : `${hh}`
}

export const clockLabel = (startDeg: number, endDeg: number) => `${degToClock(startDeg)}-${degToClock(endDeg)}h`

export const fragRotacao = (frag: { rotacao?: number }) => normDeg(Number(frag?.rotacao) || 0)

export function sectorAngles(shape: MohsShape, rot: number, n: number, i: number) {
  if (shape === 'circle') {
    const step = 360 / n
    return { start: rot + i * step, end: rot + (i + 1) * step }
  }
  const step = 180 / n
  return { start: rot - 90 + i * step, end: rot - 90 + (i + 1) * step }
}

export function autoLabel(shape: MohsShape, rot: number, n: number, i: number): string {
  if (n <= 1) return shape === 'circle' ? 'Peça inteira' : 'Extensão total'
  const a = sectorAngles(shape, rot, n, i)
  return clockLabel(a.start, a.end)
}

/** Rótulos que o usuário não editou acompanham a rotação do eixo. */
export function relabelDivisoes(frag: MohsFrag): MohsFrag {
  const n = frag.divisoes.length
  const rot = fragRotacao(frag)
  return {
    ...frag,
    divisoes: frag.divisoes.map((d, i) => (d.labelAuto !== false ? { ...d, label: autoLabel(frag.shape, rot, n, i) } : d)),
  }
}

export function buildDivisoes(shape: MohsShape, numDivisoes: number, casseteStart = 1, rot = 0): MohsDivisao[] {
  const n = Math.max(1, numDivisoes || 1)
  const r = normDeg(rot || 0)
  return Array.from({ length: n }, (_, i) => ({
    label: autoLabel(shape, r, n, i),
    labelAuto: true,
    cor: '',
    tumor: false,
    cassete: String(casseteStart + i),
  }))
}

/* ---- Cassetes: um campo pode listar vários ------------------------------ */

/** "5" → ['5'] · "5,6" → ['5','6'] · "5-7" → ['5','6','7']. */
export function parseCassetes(value: string): string[] {
  const out: string[] = []
  String(value ?? '')
    .split(/[,;/]+/)
    .forEach((part) => {
      const t = part.trim()
      if (!t) return
      const m = /^(\d+)\s*(?:-|–|a|até)\s*(\d+)$/i.exec(t)
      if (m) {
        let a = parseInt(m[1], 10)
        let b = parseInt(m[2], 10)
        if (a > b) [a, b] = [b, a]
        for (let n = a; n <= b && n - a < 60; n++) out.push(String(n))
      } else {
        out.push(t)
      }
    })
  return out.length ? out : ['']
}

export function maxCasseteEm(lista: string[]): number {
  let max = 0
  lista.forEach((v) =>
    parseCassetes(v).forEach((c) => {
      const n = parseInt(c, 10)
      if (!Number.isNaN(n) && n > max) max = n
    }),
  )
  return max
}

/* ---- Defaults ------------------------------------------------------------ */

export function defaultMohsFrag(shape: MohsShape, casseteStart = 1): MohsFrag {
  const numDivisoes = shape === 'circle' ? 4 : 2
  return {
    shape,
    nome: '',
    medidas: { c: '', l: '', a: '' },
    rotacao: 0,
    numDivisoes,
    divisoes: buildDivisoes(shape, numDivisoes, casseteStart, 0),
  }
}

export function defaultMohsPrincipal(): MohsPrincipal {
  const f = defaultMohsFrag('circle', 1)
  return {
    ...f,
    letter: 'A',
    comDebulking: true,
    debulkingNome: 'debulking',
    debulkingMedidas: { c: '', l: '' },
    debulkingCassete: String(f.numDivisoes + 1),
    cron: defaultCron(),
  }
}

export function defaultMohsAmpliacao(letter: string): MohsAmpliacao {
  return { letter, nome: `Ampliação ${letter}`, cron: defaultCron(), fragmentos: [defaultMohsFrag('halfmoon', 1)] }
}

export function defaultMohsDoc(): MohsDoc {
  return {
    hospital: '',
    paciente: '',
    cirurgiao: '',
    patologistas: '',
    tipoTumor: '',
    informeClinicoVisible: false,
    informeClinico: '',
    pecaPrincipal: defaultMohsPrincipal(),
    ampliacoes: [],
  }
}

/** Completa documentos salvos antes dos campos novos (rotação, cronômetro, labelAuto). */
export function sanitizeMohsDoc(raw: unknown): MohsDoc {
  const base = defaultMohsDoc()
  if (!raw || typeof raw !== 'object') return base
  const p = raw as Partial<MohsDoc>
  const str = (v: unknown, fallback = '') => (typeof v === 'string' ? v : fallback)
  const rawPrincipal = (p.pecaPrincipal ?? {}) as Partial<MohsPrincipal>
  const frag = sanitizeFrag(rawPrincipal, 'circle')
  const fixFrag = (f: MohsFrag): MohsFrag =>
    f.divisoes.length ? f : { ...f, divisoes: buildDivisoes(f.shape, f.numDivisoes || 1, 1, f.rotacao), numDivisoes: f.numDivisoes || 1 }
  const principalFrag = fixFrag(frag)
  const principal: MohsPrincipal = {
    ...principalFrag,
    numDivisoes: principalFrag.divisoes.length,
    letter: 'A',
    comDebulking: typeof rawPrincipal.comDebulking === 'boolean' ? rawPrincipal.comDebulking : true,
    debulkingNome: str(rawPrincipal.debulkingNome, 'debulking'),
    debulkingMedidas: {
      c: str(rawPrincipal.debulkingMedidas?.c),
      l: str(rawPrincipal.debulkingMedidas?.l),
    },
    debulkingCassete: str(rawPrincipal.debulkingCassete, String(principalFrag.divisoes.length + 1)),
    cron: sanitizeCron(rawPrincipal.cron),
  }
  const ampliacoes: MohsAmpliacao[] = Array.isArray(p.ampliacoes)
    ? p.ampliacoes.map((a, i) => {
        const q = (a ?? {}) as Partial<MohsAmpliacao>
        const letter = String.fromCharCode(66 + i)
        const fragmentos = Array.isArray(q.fragmentos) ? q.fragmentos.map((f) => fixFrag(sanitizeFrag(f, 'halfmoon'))) : []
        return {
          letter,
          nome: str(q.nome, `Ampliação ${letter}`),
          cron: sanitizeCron(q.cron),
          fragmentos: fragmentos.length ? fragmentos.map((f) => ({ ...f, numDivisoes: f.divisoes.length })) : [defaultMohsFrag('halfmoon', 1)],
        }
      })
    : []
  return {
    hospital: str(p.hospital),
    paciente: str(p.paciente),
    cirurgiao: str(p.cirurgiao),
    patologistas: str(p.patologistas),
    tipoTumor: str(p.tipoTumor),
    informeClinicoVisible: p.informeClinicoVisible === true,
    informeClinico: str(p.informeClinico),
    pecaPrincipal: principal,
    ampliacoes,
  }
}

export function mohsHasTumor(doc: MohsDoc): boolean {
  return doc.pecaPrincipal.divisoes.some((d) => d.tumor) || doc.ampliacoes.some((a) => a.fragmentos.some((f) => f.divisoes.some((d) => d.tumor)))
}

/** Maior número de cassete já usado numa ampliação (ignorando o fragmento exceptIdx). */
export function ampMaxCassete(amp: MohsAmpliacao, exceptIdx: number): number {
  const vals: string[] = []
  amp.fragmentos.forEach((f, fi) => {
    if (fi === exceptIdx) return
    f.divisoes.forEach((d) => vals.push(d.cassete))
  })
  return maxCasseteEm(vals)
}

export const principalMaxDivCassete = (p: MohsPrincipal) => maxCasseteEm(p.divisoes.map((d) => d.cassete))

/* ---- Texto --------------------------------------------------------------- */

const NUMERO = ['', 'um', 'dois', 'três', 'quatro', 'cinco', 'seis', 'sete', 'oito', 'nove', 'dez']
const numeroPorExtenso = (n: number) => NUMERO[n] ?? String(n)

export function buildTintasFrase(frag: MohsFrag): string {
  const withColor = frag.divisoes.filter((d) => d.cor && d.cor.trim())
  if (!withColor.length) return ''
  const groups: { key: string; cor: string; labels: string[] }[] = []
  for (const d of withColor) {
    const key = d.cor.trim().toLowerCase()
    let g = groups.find((x) => x.key === key)
    if (!g) {
      g = { key, cor: d.cor.trim(), labels: [] }
      groups.push(g)
    }
    g.labels.push(d.label)
  }
  const frases = groups.map((g) => {
    const cor = g.cor.toLowerCase()
    return g.labels.length > 1
      ? `as margens ${joinComma(g.labels)} foram tingidas de ${cor}`
      : `a margem ${g.labels[0]} foi tingida de ${cor}`
  })
  return `${capitalize(joinComma(frases))}.`
}

/** "12-3h" + "3-6h" → "12-3-6h". */
export function mergeClockLabels(labels: string[]): string | null {
  const parsed = labels.map((l) => {
    const m = /^(\d{1,2}(?::\d{2})?)-(\d{1,2}(?::\d{2})?)h$/.exec(String(l).trim())
    return m ? [m[1], m[2]] : null
  })
  if (!parsed.every(Boolean)) return null
  const list = parsed as string[][]
  const chain = list.slice(1)
  const nums = [list[0][0], list[0][1]]
  let progress = true
  while (chain.length && progress) {
    progress = false
    for (let i = 0; i < chain.length; i++) {
      if (chain[i][0] === nums[nums.length - 1]) {
        nums.push(chain[i][1])
        chain.splice(i, 1)
        progress = true
        break
      }
      if (chain[i][1] === nums[0]) {
        nums.unshift(chain[i][0])
        chain.splice(i, 1)
        progress = true
        break
      }
    }
  }
  return chain.length ? null : `${nums.join('-')}h`
}

function margemDesc(labels: string[]): string {
  const merged = mergeClockLabels(labels)
  if (merged) return `margem ${merged}`
  if (labels.length === 1) return `margem ${labels[0]}`
  return `margens ${joinComma(labels)}`
}

interface CasseteEntry {
  cassete: string
  kind: 'margem' | 'deb'
  label?: string
  fragIdx?: number
}

function buildCasseteGroups(entries: CasseteEntry[]) {
  const groups = new Map<string, { key: string; entries: CasseteEntry[] }>()
  let blank = 0
  for (const e of entries) {
    const key = String(e.cassete || '').trim() || `__vazio${blank++}`
    if (!groups.has(key)) groups.set(key, { key, entries: [] })
    groups.get(key)!.entries.push(e)
  }
  return [...groups.values()].sort((a, b) => {
    const na = parseInt(a.key, 10)
    const nb = parseInt(b.key, 10)
    if (Number.isNaN(na) && Number.isNaN(nb)) return 0
    if (Number.isNaN(na)) return 1
    if (Number.isNaN(nb)) return -1
    return na - nb
  })
}

function casseteGroupDesc(group: { entries: CasseteEntry[] }, multiFrag: boolean, debNome: string | null, fragNames: string[] | null): string {
  const margens = group.entries.filter((e) => e.kind === 'margem')
  const debs = group.entries.filter((e) => e.kind === 'deb')
  const parts: string[] = []
  if (margens.length) {
    if (multiFrag) {
      const byFrag = new Map<number, string[]>()
      for (const e of margens) {
        const idx = e.fragIdx ?? 0
        byFrag.set(idx, [...(byFrag.get(idx) ?? []), e.label ?? ''])
      }
      const subs = [...byFrag.entries()].map(([fi, labels]) => `${fragNames?.[fi] ?? `fragmento ${fi + 1}`}, ${margemDesc(labels)}`)
      parts.push(`${subs.join('; ')}/profunda`)
    } else {
      parts.push(`${margemDesc(margens.map((e) => e.label ?? ''))}/profunda`)
    }
  }
  if (debs.length) parts.push(`${debNome || 'debulking'}.`)
  return parts.join(' + ')
}

export function principalCasseteEntries(p: MohsPrincipal): CasseteEntry[] {
  const entries: CasseteEntry[] = []
  p.divisoes.forEach((d) => parseCassetes(d.cassete).forEach((c) => entries.push({ cassete: c, kind: 'margem', label: d.label, fragIdx: 0 })))
  if (p.comDebulking) parseCassetes(p.debulkingCassete).forEach((c) => entries.push({ cassete: c, kind: 'deb' }))
  return entries
}

export function ampCasseteEntries(amp: MohsAmpliacao): CasseteEntry[] {
  const entries: CasseteEntry[] = []
  amp.fragmentos.forEach((f, fi) => f.divisoes.forEach((d) => parseCassetes(d.cassete).forEach((c) => entries.push({ cassete: c, kind: 'margem', label: d.label, fragIdx: fi }))))
  return entries
}

/** Cassetes seguidos com a mesma descrição viram faixa: "A5 a A7 – margem 12-3h/profunda". */
export function buildMohsCassetes(letter: string, entries: CasseteEntry[], multiFrag: boolean, debNome: string | null, fragNames: string[] | null = null): string[] {
  const grupos = buildCasseteGroups(entries).map((g) => {
    const n = parseInt(g.key, 10)
    return { num: n, id: letter + (Number.isNaN(n) ? '?' : n), desc: casseteGroupDesc(g, multiFrag, debNome, fragNames) }
  })
  const linhas: string[] = []
  let i = 0
  while (i < grupos.length) {
    let j = i
    while (j + 1 < grupos.length && !Number.isNaN(grupos[j].num) && !Number.isNaN(grupos[j + 1].num) && grupos[j + 1].num === grupos[j].num + 1 && grupos[j + 1].desc === grupos[i].desc) j++
    const faixa = j > i ? `${grupos[i].id} a ${grupos[j].id}` : grupos[i].id
    linhas.push(`${faixa} – ${grupos[i].desc}`)
    i = j + 1
  }
  return linhas
}

export const fragCasseteName = (f: MohsFrag, i: number) => (f.nome && f.nome.trim() ? f.nome.trim() : `fragmento ${i + 1}`)

export function mohsPecaCorpo(p: MohsPrincipal): string {
  let corpo = `o material foi recebido a fresco para exame de congelação e consiste em produto de cirurgia de Mohs medindo ${fmtMedidasX([p.medidas.c, p.medidas.l, p.medidas.a])}`
  if (p.comDebulking) corpo += `, com ${p.debulkingNome || 'debulking'} medindo ${fmtMedidasX([p.debulkingMedidas.c, p.debulkingMedidas.l])}`
  corpo += '.'
  const tintas = buildTintasFrase(p)
  if (tintas) corpo += ` ${tintas}`
  corpo += ' Aos cortes, o tecido é elástico e brancacento.'
  corpo += ` Todo material foi enviado para estudo histológico – ${buildCasseteGroups(principalCasseteEntries(p)).length}B/VF.`
  return corpo
}

export function mohsAmpCorpo(amp: MohsAmpliacao): string {
  let corpo = 'o material foi recebido a fresco para exame de congelação e consiste em produto de ampliação de margem cirúrgica'
  const frags = amp.fragmentos
  if (frags.length === 1) {
    corpo += ` medindo ${fmtMedidasX([frags[0].medidas.c, frags[0].medidas.l, frags[0].medidas.a])}.`
    const t = buildTintasFrase(frags[0])
    if (t) corpo += ` ${t}`
  } else {
    corpo += ` constituído por ${numeroPorExtenso(frags.length)} fragmentos.`
    frags.forEach((f, fi) => {
      corpo += ` Fragmento ${fi + 1} mede ${fmtMedidasX([f.medidas.c, f.medidas.l, f.medidas.a])}.`
      const t = buildTintasFrase(f)
      if (t) corpo += ` No fragmento ${fi + 1}, ${t.charAt(0).toLowerCase()}${t.slice(1)}`
    })
  }
  corpo += ' Aos cortes, o tecido é elástico e brancacento.'
  corpo += ` Todo material foi enviado para estudo histológico – ${buildCasseteGroups(ampCasseteEntries(amp)).length}B/VF.`
  return corpo
}

export function buildPrincipalResultLines(p: MohsPrincipal, tipoTumor: string): string[] {
  const tumorNome = (tipoTumor || '').trim() || 'neoplasia'
  const comp = p.divisoes.filter((d) => d.tumor).map((d) => d.label)
  const livre = p.divisoes.filter((d) => !d.tumor).map((d) => d.label)
  const lines: string[] = []
  if (comp.length) {
    const pl = comp.length > 1
    lines.push(`${pl ? 'Margens dos quadrantes' : 'Margem do quadrante'} ${joinComma(comp)} comprometida${pl ? 's' : ''} por ${tumorNome}.`)
  }
  if (livre.length) {
    const pl = livre.length > 1
    lines.push(`${pl ? 'Margens dos quadrantes' : 'Margem do quadrante'} ${joinComma(livre)} livre${pl ? 's' : ''} de comprometimento neoplásico.`)
  }
  return lines.length ? lines : ['[Resultado]']
}

export function buildAmpResultLines(amp: MohsAmpliacao, tipoTumor: string): string[] {
  const tumorNome = (tipoTumor || '').trim() || 'neoplasia'
  const multi = amp.fragmentos.length > 1
  const nameOf = (f: MohsFrag, i: number) => (f.nome && f.nome.trim() ? f.nome.trim() : multi ? `Fragmento ${i + 1}` : '')
  const comp: string[] = []
  const livre: string[] = []
  amp.fragmentos.forEach((f, i) => (f.divisoes.some((d) => d.tumor) ? comp : livre).push(nameOf(f, i)))
  const lines: string[] = []
  if (comp.length) {
    const names = comp.filter(Boolean)
    const pl = comp.length > 1
    lines.push(capitalize(names.length ? `${joinComma(names)} comprometida${pl ? 's' : ''} por ${tumorNome}.` : `Comprometida${pl ? 's' : ''} por ${tumorNome}.`))
  }
  if (livre.length) {
    if (!comp.length) {
      lines.push('Livre de comprometimento neoplásico.')
    } else {
      const names = livre.filter(Boolean)
      const pl = livre.length > 1
      lines.push(capitalize(names.length ? `${joinComma(names)} livre${pl ? 's' : ''} de comprometimento neoplásico.` : `Livre${pl ? 's' : ''} de comprometimento neoplásico.`))
    }
  }
  return lines.length ? lines : ['[Resultado]']
}

export function isquemiaLine(stage: { cron: { inicio: string | null; formol: string | null } }, now: number): string | null {
  const t = isquemiaTexto(stage.cron, now)
  return t ? `Tempo de isquemia fria: ${t}.` : null
}

export function buildMohsText(doc: MohsDoc, now: Date = new Date()): string {
  const p = doc.pecaPrincipal
  const lines: string[] = []
  lines.push(doc.hospital || '[Hospital]')
  lines.push(`Paciente: ${doc.paciente || '[Paciente]'}`)
  lines.push(`Cirurgião: ${doc.cirurgiao || '[Cirurgião]'}`)
  lines.push(`Patologistas: ${doc.patologistas || '[Patologistas]'}`)
  if (doc.informeClinicoVisible && doc.informeClinico.trim()) lines.push(`Informe clínico: ${doc.informeClinico.trim()}`)
  lines.push('')
  lines.push('EXAME TRANSOPERATÓRIO (CONGELAÇÃO)')
  lines.push(`${p.letter}) ${p.nome || '[Nome da Peça]'}: ${mohsPecaCorpo(p)}`)
  lines.push(...buildMohsCassetes(p.letter, principalCasseteEntries(p), false, p.debulkingNome))
  const isqP = isquemiaLine(p, now.getTime())
  if (isqP) lines.push(isqP)
  for (const amp of doc.ampliacoes) {
    lines.push('')
    lines.push(`${amp.letter}) ${amp.nome || '[Nome da Ampliação]'}: ${mohsAmpCorpo(amp)}`)
    lines.push(...buildMohsCassetes(amp.letter, ampCasseteEntries(amp), amp.fragmentos.length > 1, null, amp.fragmentos.map(fragCasseteName)))
    const isqA = isquemiaLine(amp, now.getTime())
    if (isqA) lines.push(isqA)
  }
  lines.push('')
  lines.push('Resultado do exame de congelação')
  lines.push(`${p.letter}) ${p.nome || '[Nome da Peça]'}: `)
  for (const r of buildPrincipalResultLines(p, doc.tipoTumor)) lines.push(`- ${r}`)
  lines.push('')
  for (const amp of doc.ampliacoes) {
    lines.push(`${amp.letter}) ${amp.nome || '[Nome da Ampliação]'}: `)
    for (const r of buildAmpResultLines(amp, doc.tipoTumor)) lines.push(`- ${r}`)
    lines.push('')
  }
  lines.push(dataAssinatura(now))
  lines.push('')
  lines.push('___________________________________________')
  lines.push(doc.patologistas ? `Dr(a). ${doc.patologistas}` : '[Patologista]')
  return lines.join('\n')
}
