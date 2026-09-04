/* ==========================================================================
   analysis.ts — agrega os achados por cassete em volume, gradação global e
   por grupo, margens, extensão extraprostática, lateralidade e sugestão de
   estadiamento. Função pura: recebe o estado, devolve números.
   ========================================================================== */

import { buildCells, type MappingWarnings } from './mapping'
import { dominantPattern, gradeGleason, type GleasonResult, type PatternShares } from './gleason'
import {
  EMPTY_CELL,
  type CaseState,
  type Cell,
  type CellData,
  type EpeStatus,
  type Pattern,
  type Presence,
  type Side,
} from './types'

export interface CellResult {
  cell: Cell
  data: CellData
  /** % do cassete com tumor (0–100). */
  tumor: number
  /** Frações do tumor deste cassete, normalizadas para 100. */
  shares: PatternShares | null
  gleason: GleasonResult | null
  dominant: Pattern | null
  /** G4 + G5 coerentes com o modo escolhido. */
  valid: boolean
}

export interface RegionResult {
  key: string
  name: string
  cellsTotal: number
  cellsInvolved: number
  tumorSum: number
  /** Média de % tumor nas células da região. */
  pctOfRegion: number
  /** Contribuição da região para o volume do órgão (só próstata). */
  pctOfGland: number
  shares: PatternShares | null
  gleason: GleasonResult | null
}

export type MarginSite =
  | 'apical'
  | 'basal'
  | 'anterior'
  | 'posterolateral'
  | 'seminalVesicle'
  | 'vasDeferens'
  | 'other'

export interface SiteRef {
  site: MarginSite
  side: Side
  /** Nome do grupo, para o texto do laudo. */
  groupName: string
}

export interface MarginFocus extends SiteRef {
  cell: Cell
  mm: number | null
  pattern: Pattern | null
}

export interface Warning {
  key: string
  params?: Record<string, string | number>
}

export interface Analysis {
  cells: CellResult[]
  mappingWarnings: MappingWarnings
  prostateCells: number
  involvedCells: number
  volumePct: number
  tumorGrams: number | null
  shares: PatternShares | null
  gleason: GleasonResult | null
  cribriformOfG4: number | null
  cribriformOfTumor: number | null
  idc: Presence
  idcCells: Cell[]
  byGroup: RegionResult[]
  bySide: RegionResult[]
  laterality: 'right' | 'left' | 'bilateral' | null
  margins: {
    foci: MarginFocus[]
    totalMm: number
    maxMm: number
    extent: 'focal' | 'extensive' | null
    patterns: Pattern[]
  }
  epe: {
    status: EpeStatus
    cells: { cell: Cell; status: EpeStatus; site: SiteRef }[]
  }
  /** Tumor em cassetes de vesícula seminal, por lado. */
  svCells: Cell[]
  /** Tumor em cassetes de linfonodo. */
  lnCells: Cell[]
  staging: {
    pT: 'pT2' | 'pT3a' | 'pT3b' | 'pT4' | null
    pN: 'pN0' | 'pN1' | 'pNX'
    r: 'R0' | 'R1' | null
  }
  warnings: Warning[]
}

const clamp = (v: number | null, max = 100) => Math.max(0, Math.min(max, v ?? 0))

export function siteOf(cell: Cell): SiteRef {
  const groupName = cell.group?.name ?? ''
  let site: MarginSite = 'other'
  if (cell.tissue === 'seminalVesicle') site = 'seminalVesicle'
  else if (cell.tissue === 'vasDeferens') site = 'vasDeferens'
  else if (cell.level === 'apex') site = 'apical'
  else if (cell.level === 'base') site = 'basal'
  else if (cell.region === 'anterior') site = 'anterior'
  else if (cell.region === 'posterior') site = 'posterolateral'
  return { site, side: cell.side, groupName }
}

function readCell(cell: Cell, data: CellData, g45Mode: CaseState['globals']['g45Mode']): CellResult {
  const tumor = clamp(data.tumor)
  const v4 = clamp(data.g4)
  const v5 = clamp(data.g5)
  let f4: number
  let f5: number
  let valid: boolean
  if (g45Mode === 'ofCassette') {
    f4 = tumor > 0 ? (v4 / tumor) * 100 : 0
    f5 = tumor > 0 ? (v5 / tumor) * 100 : 0
    valid = v4 + v5 <= tumor + 0.01
  } else {
    f4 = v4
    f5 = v5
    valid = v4 + v5 <= 100.01
  }
  if (f4 + f5 > 100) {
    const s = f4 + f5
    f4 = (f4 * 100) / s
    f5 = (f5 * 100) / s
  }
  const shares = tumor > 0 ? { p3: 100 - f4 - f5, p4: f4, p5: f5 } : null
  return {
    cell,
    data,
    tumor,
    shares,
    gleason: shares ? gradeGleason(shares) : null,
    dominant: shares ? dominantPattern(shares) : null,
    valid,
  }
}

function aggregate(key: string, name: string, cells: CellResult[], glandCells: number): RegionResult {
  let tumorSum = 0
  let w4 = 0
  let w5 = 0
  let involved = 0
  for (const c of cells) {
    if (c.tumor <= 0 || !c.shares) continue
    involved++
    tumorSum += c.tumor
    w4 += c.shares.p4 * c.tumor
    w5 += c.shares.p5 * c.tumor
  }
  const shares =
    tumorSum > 0 ? { p3: 100 - w4 / tumorSum - w5 / tumorSum, p4: w4 / tumorSum, p5: w5 / tumorSum } : null
  return {
    key,
    name,
    cellsTotal: cells.length,
    cellsInvolved: involved,
    tumorSum,
    pctOfRegion: cells.length ? tumorSum / cells.length : 0,
    pctOfGland: glandCells ? tumorSum / glandCells : 0,
    shares,
    gleason: shares ? gradeGleason(shares) : null,
  }
}

export function analyze(state: CaseState): Analysis {
  const { globals } = state
  const { cells: cellDefs, warnings: mappingWarnings } = buildCells(state.mapping)
  const cells = cellDefs.map((cell) => readCell(cell, state.cells[cell.id] ?? EMPTY_CELL, globals.g45Mode))
  const prostate = cells.filter((c) => c.cell.tissue === 'prostate')
  const glandCells = prostate.length
  const warnings: Warning[] = []

  for (const c of cells) {
    if (!c.valid) warnings.push({ key: 'invalidCell', params: { label: c.cell.label } })
    if (c.tumor <= 0 && (clamp(c.data.g4) > 0 || clamp(c.data.g5) > 0)) {
      warnings.push({ key: 'patternWithoutTumor', params: { label: c.cell.label } })
    }
  }

  const overall = aggregate('all', '', prostate, glandCells)
  const volumePct = overall.pctOfGland
  const tumorGrams =
    globals.weightGrams && globals.weightGrams > 0 ? (globals.weightGrams * volumePct) / 100 : null

  // Cribriforme — % do padrão 4.
  let cribriformOfG4: number | null = null
  if (globals.cribMode === 'global') {
    cribriformOfG4 = globals.cribriform
  } else {
    let num = 0
    let den = 0
    for (const c of prostate) {
      if (!c.shares || c.tumor <= 0 || c.data.crib === null) continue
      const w = c.shares.p4 * c.tumor
      num += clamp(c.data.crib) * w
      den += w
    }
    cribriformOfG4 = den > 0 ? num / den : null
  }
  const cribriformOfTumor =
    cribriformOfG4 !== null && overall.shares ? (cribriformOfG4 * overall.shares.p4) / 100 : null

  // Carcinoma intraductal.
  const idcCells = globals.idcMode === 'perCassette' ? cells.filter((c) => c.data.idc).map((c) => c.cell) : []
  const idc: Presence =
    globals.idcMode === 'global'
      ? globals.intraductal
      : idcCells.length
        ? 'present'
        : overall.cellsInvolved
          ? 'absent'
          : 'notAssessed'

  // Regiões: por grupo (na ordem do mapeamento) e por lado (só próstata).
  const byGroup: RegionResult[] = state.mapping.groups.map((g) =>
    aggregate(g.id, g.name, cells.filter((c) => c.cell.group?.id === g.id), glandCells),
  )
  const unmapped = cells.filter((c) => !c.cell.group)
  if (unmapped.length) byGroup.push(aggregate('unmapped', '', unmapped, glandCells))
  const bySide = (['D', 'E'] as Side[]).map((side) =>
    aggregate(`side:${side}`, side, prostate.filter((c) => c.cell.side === side), glandCells),
  )

  const involvedSides = new Set(prostate.filter((c) => c.tumor > 0).map((c) => c.cell.side))
  let laterality: Analysis['laterality'] = null
  if (involvedSides.size) {
    if (involvedSides.has('B') || (involvedSides.has('D') && involvedSides.has('E'))) laterality = 'bilateral'
    else if (involvedSides.has('D')) laterality = 'right'
    else laterality = 'left'
  }

  // Margens.
  const foci: MarginFocus[] = cells
    .filter((c) => c.data.margin)
    .map((c) => ({ cell: c.cell, mm: c.data.marginMm, pattern: c.data.marginPattern, ...siteOf(c.cell) }))
  const mmValues = foci.map((f) => f.mm ?? 0)
  const totalMm = mmValues.reduce((a, b) => a + b, 0)
  const maxMm = mmValues.reduce((a, b) => Math.max(a, b), 0)
  const margins: Analysis['margins'] = {
    foci,
    totalMm,
    maxMm,
    extent: foci.length ? (maxMm > 3 ? 'extensive' : 'focal') : null,
    patterns: [...new Set(foci.map((f) => f.pattern).filter((p): p is Pattern => p !== null))].sort(),
  }
  for (const f of foci) {
    const cr = cells.find((c) => c.cell.id === f.cell.id)!
    if (cr.tumor <= 0) warnings.push({ key: 'marginWithoutTumor', params: { label: f.cell.label } })
  }

  // Extensão extraprostática (só faz sentido em cassetes de próstata).
  const epeCells = cells
    .filter((c) => c.data.epe !== 'none' && c.cell.tissue === 'prostate')
    .map((c) => ({ cell: c.cell, status: c.data.epe, site: siteOf(c.cell) }))
  const epeStatus: EpeStatus = epeCells.some((e) => e.status === 'established')
    ? 'established'
    : epeCells.length
      ? 'focal'
      : 'none'
  for (const e of epeCells) {
    const cr = cells.find((c) => c.cell.id === e.cell.id)!
    if (cr.tumor <= 0) warnings.push({ key: 'epeWithoutTumor', params: { label: e.cell.label } })
  }

  // Vesículas e linfonodos vindos do mapeamento.
  const svCells = cells.filter((c) => c.cell.tissue === 'seminalVesicle' && c.tumor > 0).map((c) => c.cell)
  const lnCells = cells.filter((c) => c.cell.tissue === 'lymphNode' && c.tumor > 0).map((c) => c.cell)

  // Estadiamento sugerido (AJCC 8ª: pT2 sem subdivisão).
  const svInvolved = svCells.length > 0 || ['right', 'left', 'bilateral'].includes(globals.seminalVesicles)
  let pT: Analysis['staging']['pT'] = null
  if (overall.cellsInvolved || svInvolved || globals.adjacentInvasion) {
    if (globals.adjacentInvasion) pT = 'pT4'
    else if (svInvolved) pT = 'pT3b'
    else if (epeCells.length || globals.bladderNeck === 'involved') pT = 'pT3a'
    else pT = 'pT2'
  }
  const lnPos = globals.lnPositive ?? 0
  const lnTot = globals.lnTotal ?? 0
  const pN: Analysis['staging']['pN'] = lnPos > 0 || lnCells.length ? 'pN1' : lnTot > 0 ? 'pN0' : 'pNX'
  if (lnPos > lnTot && lnTot > 0) warnings.push({ key: 'lnCount' })
  const r: Analysis['staging']['r'] = foci.length ? 'R1' : overall.cellsInvolved ? 'R0' : null

  return {
    cells,
    mappingWarnings,
    prostateCells: glandCells,
    involvedCells: overall.cellsInvolved,
    volumePct,
    tumorGrams,
    shares: overall.shares,
    gleason: overall.gleason,
    cribriformOfG4,
    cribriformOfTumor,
    idc,
    idcCells,
    byGroup,
    bySide,
    laterality,
    margins,
    epe: { status: epeStatus, cells: epeCells },
    svCells,
    lnCells,
    staging: { pT, pN, r },
    warnings,
  }
}
