/* ==========================================================================
   analysis.ts — da laudagem por cassete ao RCB: celularidade média do leito,
   fração in situ, extensão dos cassetes com carcinoma, linfonodos, e o índice
   com a classe. Função pura: recebe o estado, devolve números e avisos.
   ========================================================================== */

import { planCassettes, type CassetteDef, type LesionCassettes } from './cassettes'
import { computeRcb, suggestYpN, suggestYpT, type RcbClass, type RcbInputs, type RcbResult, type YpN, type YpT } from './rcb'
import { EMPTY_MICRO_CELL, type Margin, type MicroCell, type MicroState } from './types'

export interface CellResult {
  def: CassetteDef
  cell: MicroCell
  assessed: boolean
}

export interface LesionAnalysis {
  plan: LesionCassettes
  cells: CellResult[]
  /** Só os cassetes do maior corte (os que entram na média do RCB). */
  gridCells: CellResult[]
  assessed: number
  positive: number
  /** Média de %CA nos cassetes avaliados do maior corte. */
  caMean: number | null
  /** % in situ ponderada pela celularidade de cada cassete. */
  cisMean: number | null
  /** Extensão (mm) coberta pelos cassetes com carcinoma no maior corte. */
  positiveExtent: { d1: number; d2: number } | null
  /** Tamanho macroscópico do leito no plano da fatia. */
  gross: { d1: number; d2: number }
  lviCells: CassetteDef[]
  marginCells: { def: CassetteDef; margin: Margin }[]
  anyInvasive: boolean
  anyDcis: boolean
}

export interface Warning {
  key: string
  params?: Record<string, string | number>
}

export type InputSource = 'override' | 'computed' | 'gross' | 'missing'

export interface MicroAnalysis {
  lesions: LesionAnalysis[]
  rcbLesion: LesionAnalysis | null
  /** Valores calculados a partir dos cassetes (sem os ajustes manuais). */
  computed: RcbInputs
  /** Valores efetivamente usados (ajuste manual > calculado). */
  inputs: RcbInputs
  sources: Record<'d1' | 'd2' | 'ca' | 'cis', InputSource>
  rcb: RcbResult | null
  /** Classe imposta pela situação clínica (inoperável = RCB-III). */
  forcedClass: RcbClass | null
  /** Linfonodo positivo retirado antes do tratamento: o RCB não vale. */
  invalid: boolean
  ypT: YpT | null
  ypN: YpN
  pcr: boolean | null
  warnings: Warning[]
}

function analyzeLesion(plan: LesionCassettes, cells: Record<string, MicroCell>): LesionAnalysis {
  const results: CellResult[] = plan.all.map((def) => {
    const cell = cells[def.id] ?? EMPTY_MICRO_CELL
    return { def, cell, assessed: cell.ca !== null }
  })
  const grid = results.filter((r) => r.def.kind === 'grid')
  const assessedGrid = grid.filter((r) => r.assessed)
  const positiveGrid = assessedGrid.filter((r) => (r.cell.ca ?? 0) > 0)

  const caMean = assessedGrid.length ? assessedGrid.reduce((s, r) => s + (r.cell.ca ?? 0), 0) / assessedGrid.length : null
  let wCis = 0
  let wCa = 0
  for (const r of positiveGrid) {
    const ca = r.cell.ca ?? 0
    wCa += ca
    wCis += ca * (r.cell.cis ?? 0)
  }
  const cisMean = assessedGrid.length ? (wCa > 0 ? wCis / wCa : 0) : null

  let positiveExtent: LesionAnalysis['positiveExtent'] = null
  if (positiveGrid.length) {
    const u0 = Math.min(...positiveGrid.map((r) => r.def.u0))
    const u1 = Math.max(...positiveGrid.map((r) => r.def.u1))
    const v0 = Math.min(...positiveGrid.map((r) => r.def.v0))
    const v1 = Math.max(...positiveGrid.map((r) => r.def.v1))
    const a = u1 - u0
    const b = v1 - v0
    positiveExtent = { d1: Math.max(a, b), d2: Math.min(a, b) }
  } else if (assessedGrid.length) {
    positiveExtent = { d1: 0, d2: 0 }
  }

  const all = results.filter((r) => r.assessed)
  return {
    plan,
    cells: results,
    gridCells: grid,
    assessed: assessedGrid.length,
    positive: positiveGrid.length,
    caMean,
    cisMean,
    positiveExtent,
    gross: { d1: Math.max(plan.gridSizeU, plan.gridSizeV), d2: Math.min(plan.gridSizeU, plan.gridSizeV) },
    lviCells: results.filter((r) => r.cell.lvi).map((r) => r.def),
    marginCells: results.filter((r) => r.cell.margin).map((r) => ({ def: r.def, margin: r.cell.margin as Margin })),
    anyInvasive: all.some((r) => (r.cell.ca ?? 0) > 0 && (r.cell.cis ?? 0) < 100),
    anyDcis: all.some((r) => (r.cell.ca ?? 0) > 0 && (r.cell.cis ?? 0) > 0),
  }
}

export function analyzeMicro(state: MicroState): MicroAnalysis {
  const plans = planCassettes(state.map)
  const lesions = plans.map((p) => analyzeLesion(p, state.cells))
  const rcbLesion = lesions.find((l) => l.plan.lesion.id === state.rcbLesionId) ?? lesions[0] ?? null
  const warnings: Warning[] = []
  const { nodes, globals, overrides } = state

  for (const l of lesions) {
    for (const r of l.cells) {
      if (r.cell.ca === null && r.cell.cis !== null) warnings.push({ key: 'cisWithoutCa', params: { label: r.def.label } })
      if ((r.cell.ca ?? 0) === 0 && (r.cell.cis ?? 0) > 0 && r.cell.ca !== null) warnings.push({ key: 'cisWithZeroCa', params: { label: r.def.label } })
    }
  }

  // d1/d2: o leito macroscópico é o ponto de partida; o patologista revisa se
  // a extensão microscópica for claramente diferente.
  const grossD1 = rcbLesion ? rcbLesion.gross.d1 : null
  const grossD2 = rcbLesion ? rcbLesion.gross.d2 : null
  const computed: RcbInputs = {
    d1: grossD1,
    d2: grossD2,
    ca: rcbLesion?.caMean ?? null,
    cis: rcbLesion?.cisMean ?? null,
    ln: nodes.itcOnly ? 0 : nodes.positive,
    dmet: nodes.itcOnly ? 0 : nodes.largestMm,
  }
  const pick = (key: 'd1' | 'd2' | 'ca' | 'cis'): [number | null, InputSource] => {
    if (overrides[key] !== null) return [overrides[key], 'override']
    if (computed[key] !== null) return [computed[key], key === 'd1' || key === 'd2' ? 'gross' : 'computed']
    return [null, 'missing']
  }
  const [d1, s1] = pick('d1')
  const [d2, s2] = pick('d2')
  const [ca, s3] = pick('ca')
  const [cis, s4] = pick('cis')
  const inputs: RcbInputs = { d1, d2, ca, cis, ln: computed.ln, dmet: computed.dmet }

  if ((inputs.ln ?? 0) > 0 && inputs.dmet === null) warnings.push({ key: 'dmetMissing' })
  if ((nodes.positive ?? 0) > (nodes.examined ?? 0) && (nodes.examined ?? 0) > 0) warnings.push({ key: 'lnCount' })
  if (rcbLesion && rcbLesion.assessed < rcbLesion.gridCells.length) {
    warnings.push({ key: 'unassessed', params: { n: rcbLesion.gridCells.length - rcbLesion.assessed, label: rcbLesion.plan.lesion.label } })
  }
  if (rcbLesion && rcbLesion.positiveExtent && rcbLesion.positive > 0 && s1 === 'gross') {
    const { d1: e1 } = rcbLesion.positiveExtent
    if (e1 < rcbLesion.gross.d1 * 0.6) warnings.push({ key: 'extentSmaller' })
  }
  if (globals.preTreatmentPositiveNode) warnings.push({ key: 'preTreatmentNode' })
  if (globals.inoperable) warnings.push({ key: 'inoperable' })

  const rcb = computeRcb(inputs)
  const forcedClass: RcbClass | null = globals.inoperable ? 'RCB-III' : null
  const residualInvasive = inputs.ca === null ? null : inputs.ca > 0 && (inputs.cis ?? 0) < 100
  const residualDcis = (rcbLesion?.anyDcis ?? false) || ((inputs.ca ?? 0) > 0 && (inputs.cis ?? 0) > 0)
  const ypT = suggestYpT({
    largestInvasiveMm: globals.largestInvasiveMm,
    residualInvasive,
    residualDcis,
    skin: globals.skinInvolved,
    chestWall: globals.chestWallInvolved,
  })
  const ypN = suggestYpN({ examined: nodes.examined, positive: nodes.positive, largestMm: nodes.largestMm, itcOnly: nodes.itcOnly })
  const pcr = rcb ? rcb.index <= 0 : residualInvasive === false && (inputs.ln ?? 0) === 0 && inputs.ln !== null ? true : null

  return {
    lesions,
    rcbLesion,
    computed,
    inputs,
    sources: { d1: s1, d2: s2, ca: s3, cis: s4 },
    rcb,
    forcedClass,
    invalid: globals.preTreatmentPositiveNode,
    ypT,
    ypN,
    pcr,
    warnings,
  }
}
