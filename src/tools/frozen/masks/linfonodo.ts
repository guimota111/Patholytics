/* Máscara: linfonodo sentinela — a única que preenche macroscopia, cassetes e resultado. */

import { capitalize, fmtMedidasX, numeroExtenso, pad } from '../text'
import type { Cassete } from '../types'
import { fmtMedidas2, type Med2 } from './fragmentos'
import type { Med3Por } from './tireoide'

export const LINFO_TOPOGRAFIAS = ['axila direita', 'axila esquerda', 'cervical direita', 'cervical esquerda', 'inguinal direita', 'inguinal esquerda']

export type LinfoTipoKey = 'macro' | 'micro' | 'cti'

export const LINFO_TIPOS: { key: LinfoTipoKey; label: string; achado: string; achadoPlural: string; livre: string }[] = [
  { key: 'macro', label: 'Macrometástase', achado: 'Macrometástase', achadoPlural: 'Macrometástases', livre: 'macrometástases' },
  { key: 'micro', label: 'Micrometástase', achado: 'Micrometástase', achadoPlural: 'Micrometástases', livre: 'micrometástases' },
  { key: 'cti', label: 'Células isoladas', achado: 'Células tumorais isoladas', achadoPlural: 'Células tumorais isoladas', livre: 'células tumorais isoladas' },
]

export interface Linfonodo {
  cassetes: string
  comprometido: boolean
}

export interface LinfonodoData {
  topografia: string
  gordura: Med3Por
  linfonodos: Linfonodo[]
  medirMenor: boolean
  maior: Med2
  menor: Med2
  /** Cassetes só com gordura, depois dos linfonodos. */
  gorduraCassetes: string
  tipo: LinfoTipoKey
  neoplasia: string
}

export const defaultLinfonodo = (): Linfonodo => ({ cassetes: '1', comprometido: false })

export const defaultLinfonodoData = (): LinfonodoData => ({
  topografia: 'axila direita',
  gordura: { c: '', l: '', ap: '' },
  linfonodos: [defaultLinfonodo()],
  medirMenor: true,
  maior: { a: '', b: '' },
  menor: { a: '', b: '' },
  gorduraCassetes: '1',
  tipo: 'macro',
  neoplasia: 'carcinoma',
})

/** Ajusta a quantidade preservando o que já foi marcado. */
export function setLinfonodoQtd(d: LinfonodoData, n: number): LinfonodoData {
  const alvo = Math.max(1, Math.min(40, n))
  const linfonodos = d.linfonodos.slice(0, alvo)
  while (linfonodos.length < alvo) linfonodos.push(defaultLinfonodo())
  return { ...d, linfonodos }
}

export const linfonodoComprometidos = (d: LinfonodoData) => d.linfonodos.filter((l) => l.comprometido).length

export function linfonodoNomePeca(d: LinfonodoData): string {
  const topo = d.topografia.trim()
  return topo ? `Linfonodo sentinela ${topo}` : 'Linfonodo sentinela'
}

export function buildLinfonodoMacro(d: LinfonodoData): string {
  const total = d.linfonodos.length
  let s = `segmento de tecido adiposo medindo ${fmtMedidasX([d.gordura.c, d.gordura.l, d.gordura.ap])}, `
  if (total === 1) return `${s}de onde foi dissecada 1 estrutura nodular medindo ${fmtMedidas2(d.maior)}.`
  s += `de onde foram dissecadas ${total} estruturas nodulares, a maior medindo ${fmtMedidas2(d.maior)}`
  if (d.medirMenor) s += ` e a menor medindo ${fmtMedidas2(d.menor)}`
  return `${s}.`
}

/** Um bloco por linfonodo (ou mais, se ele for grande) e a gordura no fim. */
export function linfonodoCassetes(d: LinfonodoData): Cassete[] {
  const out: Cassete[] = []
  let n = 1
  d.linfonodos.forEach((ln, i) => {
    const qtd = Math.max(1, parseInt(ln.cassetes, 10) || 1)
    const fim = n + qtd - 1
    out.push({ inicio: String(n), fim: qtd > 1 ? String(fim) : '', descricao: `Linfonodo sentinela ${i + 1}` })
    n = fim + 1
  })
  const g = Math.max(0, parseInt(d.gorduraCassetes, 10) || 0)
  if (g > 0) {
    const fim = n + g - 1
    out.push({ inicio: String(n), fim: g > 1 ? String(fim) : '', descricao: 'Gordura' })
  }
  return out
}

/** "Macrometástase de carcinoma em 01 de 03 linfonodos avaliados (01/03)." */
export function linfonodoResultado(d: LinfonodoData): string {
  const total = d.linfonodos.length
  const comp = linfonodoComprometidos(d)
  const t = LINFO_TIPOS.find((x) => x.key === d.tipo) ?? LINFO_TIPOS[0]
  const contagem = `(${pad(comp)}/${pad(total)})`
  if (comp === 0) {
    const nome = total === 1 ? 'linfonodo livre' : 'linfonodos livres'
    return `${capitalize(numeroExtenso(total))} ${nome} de ${t.livre} ${contagem}.`
  }
  const neo = d.neoplasia.trim() || '[neoplasia]'
  const achado = comp > 1 ? t.achadoPlural : t.achado
  const avaliados = total === 1 ? 'linfonodo avaliado' : 'linfonodos avaliados'
  return `${achado} de ${neo} em ${pad(comp)} de ${pad(total)} ${avaliados} ${contagem}.`
}
