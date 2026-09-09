/* Máscara: segmento mamário — tintas por margem e achados aos cortes. */

import { capitalize, fmtMedidasX, joinComma } from '../text'
import type { Med3Por } from './tireoide'

export const MAMA_MARGENS_TINTA: { key: string; label: string; cor: string }[] = [
  { key: 'superior', label: 'superior', cor: 'azul' },
  { key: 'medial', label: 'medial', cor: 'vermelho' },
  { key: 'inferior', label: 'inferior', cor: 'verde' },
  { key: 'lateral', label: 'lateral', cor: 'laranja' },
  { key: 'anterior', label: 'anterior', cor: 'amarelo' },
  { key: 'profunda', label: 'profunda', cor: 'preto' },
]

export const MAMA_MARGENS_DIST = ['medial', 'lateral', 'anterior', 'profunda', 'superior', 'inferior']
export const MAMA_MARCACAO_PADRAO = '1 fio superior, 2 fios inferior, 3 fios medial'
const DESC_M = 'irregular, endurecido e espiculado'
const DESC_F = 'irregular, endurecida e espiculada'

export type MamaTipoKey = 'nodulo' | 'lesao' | 'area' | 'outro'

export const MAMA_TIPOS: { key: MamaTipoKey; label: string; sing: string; plural: string; genero: 'm' | 'f' }[] = [
  { key: 'nodulo', label: 'Nódulo', sing: 'nódulo', plural: 'nódulos', genero: 'm' },
  { key: 'lesao', label: 'Lesão', sing: 'lesão', plural: 'lesões', genero: 'f' },
  { key: 'area', label: 'Área brancacenta', sing: 'área brancacenta', plural: 'áreas brancacentas', genero: 'f' },
  { key: 'outro', label: 'Outro (escrever)', sing: '', plural: '', genero: 'f' },
]

export interface MamaAchado {
  id: number
  tipo: MamaTipoKey
  tipoCustom: string
  desc: string
  med: Med3Por
  dist: Record<string, string>
}

export interface MamaData {
  peso: string
  medidas: Med3Por
  comMarcacao: boolean
  marcacao: string
  tintas: Record<string, string>
  nextId: number
  achados: MamaAchado[]
  /** { 'id1_id2': '1,5' } — distância entre os achados. */
  distEntre: Record<string, string>
}

const mamaTipo = (key: MamaTipoKey) => MAMA_TIPOS.find((t) => t.key === key) ?? MAMA_TIPOS[0]

export const mamaAchadoNome = (a: MamaAchado) => (a.tipo === 'outro' ? a.tipoCustom.trim() || '[achado]' : mamaTipo(a.tipo).sing)

export const mamaDescPadrao = (a: MamaAchado) => (mamaTipo(a.tipo).genero === 'm' ? DESC_M : DESC_F)

/** Só reescreve enquanto for uma das padrão — texto do usuário fica. */
export function syncMamaDesc(a: MamaAchado): MamaAchado {
  const atual = a.desc.trim()
  if (atual && atual !== DESC_M && atual !== DESC_F) return a
  return { ...a, desc: mamaDescPadrao(a) }
}

export function defaultMamaAchado(id: number): MamaAchado {
  const dist: Record<string, string> = {}
  MAMA_MARGENS_DIST.forEach((k) => (dist[k] = ''))
  const a: MamaAchado = { id, tipo: 'nodulo', tipoCustom: '', desc: '', med: { c: '', l: '', ap: '' }, dist }
  return { ...a, desc: mamaDescPadrao(a) }
}

export function defaultMamaData(): MamaData {
  const tintas: Record<string, string> = {}
  MAMA_MARGENS_TINTA.forEach((m) => (tintas[m.key] = m.cor))
  return {
    peso: '',
    medidas: { c: '', l: '', ap: '' },
    comMarcacao: true,
    marcacao: MAMA_MARCACAO_PADRAO,
    tintas,
    nextId: 2,
    achados: [defaultMamaAchado(1)],
    distEntre: {},
  }
}

const parKey = (a: number, b: number) => (a < b ? `${a}_${b}` : `${b}_${a}`)

export function mamaPares(d: MamaData) {
  const out: { i: number; j: number; a: MamaAchado; b: MamaAchado; key: string }[] = []
  for (let i = 0; i < d.achados.length; i++) {
    for (let j = i + 1; j < d.achados.length; j++) {
      out.push({ i, j, a: d.achados[i], b: d.achados[j], key: parKey(d.achados[i].id, d.achados[j].id) })
    }
  }
  return out
}

export function sanitizeMamaDistEntre(d: MamaData): MamaData {
  const vivos = new Set(mamaPares(d).map((p) => p.key))
  const distEntre: Record<string, string> = {}
  for (const [k, v] of Object.entries(d.distEntre)) if (vivos.has(k)) distEntre[k] = v
  return { ...d, distEntre }
}

function mamaDistFrase(dist: Record<string, string>): string {
  return joinComma(
    MAMA_MARGENS_DIST.map((k, i) => {
      const v = String(dist[k] || '').trim() || '_'
      return `${v} cm da ${i === 0 ? 'margem ' : ''}${k}`
    }),
  )
}

function mamaAchadoFrase(a: MamaAchado, num: number, total: number): string {
  const nome = mamaAchadoNome(a)
  const cabeca = total > 1 ? `${capitalize(nome)} ${num}` : nome
  const desc = a.desc.trim() || '[características]'
  return `${cabeca}, ${desc}, medindo ${fmtMedidasX([a.med.c, a.med.l, a.med.ap])}, distando ${mamaDistFrase(a.dist)}.`
}

function mamaDistEntreFrases(d: MamaData): string {
  const pares = mamaPares(d)
  if (!pares.length) return ''
  const frases = pares.map((p) => {
    const mesmo = p.a.tipo === p.b.tipo && p.a.tipo !== 'outro'
    const t = mesmo ? mamaTipo(p.a.tipo) : null
    const grupo = t ? `${t.genero === 'm' ? 'Os' : 'As'} ${t.plural}` : 'As lesões'
    const v = String(d.distEntre[p.key] || '').trim() || '_'
    return `${grupo} ${p.i + 1} e ${p.j + 1} distam ${v} cm entre si`
  })
  return `${capitalize(joinComma(frases.map((f, i) => (i ? f.charAt(0).toLowerCase() + f.slice(1) : f))))}.`
}

export function buildMamaMacro(d: MamaData): string {
  let cabecalho = `segmento mamário pesando ${d.peso.trim() || '[peso]'}g, medindo ${fmtMedidasX([d.medidas.c, d.medidas.l, d.medidas.ap])}`
  if (d.comMarcacao) cabecalho += `, exibindo marcação cirúrgica prévia: ${d.marcacao.trim() || '[marcação]'}`
  cabecalho += '. A peça foi pintada com tinta nanquim, sendo:'
  const tintas = MAMA_MARGENS_TINTA.map((m) => `${String(d.tintas[m.key] || '').trim() || '[cor]'} em sua margem ${m.label}`)
  const lines = [cabecalho, `${capitalize(joinComma(tintas))}.`]
  if (d.achados.length === 1) {
    lines[1] += ` Aos cortes apresenta ${mamaAchadoFrase(d.achados[0], 1, 1)}`
  } else if (d.achados.length > 1) {
    lines[1] += ' Aos cortes apresenta:'
    d.achados.forEach((a, i) => lines.push(mamaAchadoFrase(a, i + 1, d.achados.length)))
    lines.push(mamaDistEntreFrases(d))
  }
  return lines.join('\n')
}

export const mamaNomePeca = () => 'Segmento mamário'
