import { clampCone, clampSlices, DEFAULT_GRID } from './grid'
import {
  EMPTY_CELL,
  type CaseGlobals,
  type CaseState,
  type CellData,
  type GridConfig,
  type GridTemplate,
  type SectorCount,
} from './types'

/** Caso em andamento e modelos de grade ficam no navegador, por usuário. */
const CASE_PREFIX = 'patholytics.prostate.case.v1'
const TEMPLATE_PREFIX = 'patholytics.prostate.templates.v1'

const caseKey = (uid: string | null | undefined) => `${CASE_PREFIX}:${uid ?? 'anon'}`
const templateKey = (uid: string | null | undefined) => `${TEMPLATE_PREFIX}:${uid ?? 'anon'}`

export const DEFAULT_GLOBALS: CaseGlobals = {
  g45Mode: 'ofTumor',
  cribMode: 'global',
  idcMode: 'global',
  cribriform: null,
  intraductal: 'notAssessed',
  weightGrams: null,
  seminalVesicles: 'free',
  bladderNeck: 'free',
  adjacentInvasion: false,
  lnPositive: null,
  lnTotal: null,
  perineural: 'notAssessed',
  lymphovascular: 'notAssessed',
}

export const DEFAULT_CASE: CaseState = { grid: DEFAULT_GRID, cells: {}, globals: DEFAULT_GLOBALS }

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null)
const oneOf = <T extends string>(v: unknown, options: readonly T[], fallback: T): T =>
  options.includes(v as T) ? (v as T) : fallback

export function sanitizeGrid(raw: unknown): GridConfig {
  const p = (raw ?? {}) as Partial<GridConfig>
  const labels: Record<string, string> = {}
  if (p.labels && typeof p.labels === 'object') {
    for (const [k, v] of Object.entries(p.labels)) if (typeof v === 'string') labels[k] = v
  }
  return {
    slices: clampSlices(num(p.slices) ?? DEFAULT_GRID.slices),
    sectors: ([2, 4, 6, 8] as SectorCount[]).includes(p.sectors as SectorCount)
      ? (p.sectors as SectorCount)
      : DEFAULT_GRID.sectors,
    apexCassettes: clampCone(num(p.apexCassettes) ?? DEFAULT_GRID.apexCassettes),
    baseCassettes: clampCone(num(p.baseCassettes) ?? DEFAULT_GRID.baseCassettes),
    numbering: oneOf(p.numbering, ['bySlice', 'bySector'] as const, 'bySlice'),
    sliceOrder: oneOf(p.sliceOrder, ['apexToBase', 'baseToApex'] as const, 'apexToBase'),
    labels,
  }
}

function sanitizeCell(raw: unknown): CellData {
  const p = (raw ?? {}) as Partial<CellData>
  return {
    tumor: num(p.tumor),
    g4: num(p.g4),
    g5: num(p.g5),
    crib: num(p.crib),
    idc: p.idc === true,
    margin: p.margin === true,
    marginMm: num(p.marginMm),
    marginPattern: p.marginPattern === 3 || p.marginPattern === 4 || p.marginPattern === 5 ? p.marginPattern : null,
    epe: oneOf(p.epe, ['none', 'focal', 'established'] as const, 'none'),
  }
}

function sanitizeGlobals(raw: unknown): CaseGlobals {
  const p = (raw ?? {}) as Partial<CaseGlobals>
  const presence = ['notAssessed', 'absent', 'present'] as const
  return {
    g45Mode: oneOf(p.g45Mode, ['ofTumor', 'ofCassette'] as const, DEFAULT_GLOBALS.g45Mode),
    cribMode: oneOf(p.cribMode, ['global', 'perCassette'] as const, DEFAULT_GLOBALS.cribMode),
    idcMode: oneOf(p.idcMode, ['global', 'perCassette'] as const, DEFAULT_GLOBALS.idcMode),
    cribriform: num(p.cribriform),
    intraductal: oneOf(p.intraductal, presence, DEFAULT_GLOBALS.intraductal),
    weightGrams: num(p.weightGrams),
    seminalVesicles: oneOf(
      p.seminalVesicles,
      ['notIdentified', 'free', 'right', 'left', 'bilateral'] as const,
      DEFAULT_GLOBALS.seminalVesicles,
    ),
    bladderNeck: oneOf(p.bladderNeck, ['notAssessed', 'free', 'involved'] as const, DEFAULT_GLOBALS.bladderNeck),
    adjacentInvasion: p.adjacentInvasion === true,
    lnPositive: num(p.lnPositive),
    lnTotal: num(p.lnTotal),
    perineural: oneOf(p.perineural, presence, DEFAULT_GLOBALS.perineural),
    lymphovascular: oneOf(p.lymphovascular, presence, DEFAULT_GLOBALS.lymphovascular),
  }
}

export function sanitizeCase(raw: unknown): CaseState {
  const p = (raw ?? {}) as Partial<CaseState>
  const cells: Record<string, CellData> = {}
  if (p.cells && typeof p.cells === 'object') {
    for (const [id, data] of Object.entries(p.cells)) cells[id] = { ...EMPTY_CELL, ...sanitizeCell(data) }
  }
  return { grid: sanitizeGrid(p.grid), cells, globals: sanitizeGlobals(p.globals) }
}

export function loadCase(uid: string | null | undefined): CaseState {
  try {
    const raw = localStorage.getItem(caseKey(uid))
    return raw ? sanitizeCase(JSON.parse(raw)) : DEFAULT_CASE
  } catch {
    return DEFAULT_CASE
  }
}

export function saveCase(uid: string | null | undefined, state: CaseState): void {
  try {
    localStorage.setItem(caseKey(uid), JSON.stringify(state))
  } catch {
    // sem persistência a ferramenta continua funcionando na sessão
  }
}

export function loadTemplates(uid: string | null | undefined): GridTemplate[] {
  try {
    const raw = localStorage.getItem(templateKey(uid))
    if (!raw) return []
    const list = JSON.parse(raw) as unknown
    if (!Array.isArray(list)) return []
    return list
      .filter((t): t is GridTemplate => typeof t === 'object' && t !== null && typeof (t as GridTemplate).name === 'string')
      .map((t) => ({ name: t.name, grid: sanitizeGrid(t.grid) }))
  } catch {
    return []
  }
}

export function saveTemplates(uid: string | null | undefined, templates: GridTemplate[]): void {
  try {
    localStorage.setItem(templateKey(uid), JSON.stringify(templates))
  } catch {
    // idem
  }
}
