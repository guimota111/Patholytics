import { clampTotal, DEFAULT_MAPPING, makeGroup } from './mapping'
import {
  EMPTY_CELL,
  LEVELS,
  REGIONS,
  SIDES,
  TISSUES,
  type CaseGlobals,
  type CaseState,
  type CassetteGroup,
  type CellData,
  type MappingConfig,
  type MappingTemplate,
} from './types'

/** Caso em andamento e modelos de mapeamento ficam no navegador, por usuário. */
const CASE_PREFIX = 'patholytics.prostate.case.v2'
const TEMPLATE_PREFIX = 'patholytics.prostate.templates.v2'

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

export const DEFAULT_CASE: CaseState = { mapping: DEFAULT_MAPPING, cells: {}, globals: DEFAULT_GLOBALS }

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null)
const oneOf = <T extends string>(v: unknown, options: readonly T[], fallback: T): T =>
  options.includes(v as T) ? (v as T) : fallback

function sanitizeGroup(raw: unknown): CassetteGroup | null {
  const p = (raw ?? {}) as Partial<CassetteGroup>
  if (typeof p.name !== 'string' && typeof p.range !== 'string') return null
  return makeGroup({
    id: typeof p.id === 'string' && p.id ? p.id : undefined,
    name: typeof p.name === 'string' ? p.name : '',
    range: typeof p.range === 'string' ? p.range : '',
    side: oneOf(p.side, SIDES, 'B'),
    region: oneOf(p.region, REGIONS, 'whole'),
    level: oneOf(p.level, LEVELS, 'whole'),
    tissue: oneOf(p.tissue, TISSUES, 'prostate'),
  })
}

export function sanitizeMapping(raw: unknown): MappingConfig {
  const p = (raw ?? {}) as Partial<MappingConfig>
  const groups = Array.isArray(p.groups)
    ? p.groups.map(sanitizeGroup).filter((g): g is CassetteGroup => g !== null)
    : []
  return {
    total: clampTotal(num(p.total) ?? DEFAULT_MAPPING.total),
    groups: groups.length || Array.isArray(p.groups) ? groups : DEFAULT_MAPPING.groups,
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
    for (const [id, data] of Object.entries(p.cells)) {
      if (/^c\d+$/.test(id)) cells[id] = { ...EMPTY_CELL, ...sanitizeCell(data) }
    }
  }
  return { mapping: sanitizeMapping(p.mapping), cells, globals: sanitizeGlobals(p.globals) }
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

export function loadTemplates(uid: string | null | undefined): MappingTemplate[] {
  try {
    const raw = localStorage.getItem(templateKey(uid))
    if (!raw) return []
    const list = JSON.parse(raw) as unknown
    if (!Array.isArray(list)) return []
    return list
      .filter((t): t is MappingTemplate => typeof t === 'object' && t !== null && typeof (t as MappingTemplate).name === 'string')
      .map((t) => ({ name: t.name, mapping: sanitizeMapping(t.mapping) }))
  } catch {
    return []
  }
}

export function saveTemplates(uid: string | null | undefined, templates: MappingTemplate[]): void {
  try {
    localStorage.setItem(templateKey(uid), JSON.stringify(templates))
  } catch {
    // idem
  }
}
