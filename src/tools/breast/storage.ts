/* ==========================================================================
   storage.ts — estado inicial, sanitização de dados vindos do navegador (ou
   de um código de mapa colado) e persistência por usuário. O caso da
   macroscopia e o da laudagem são independentes: cada um tem a sua chave.
   ========================================================================== */

import { clampGrid } from './cassettes'
import { clampSlices, coherentFrom } from './geometry'
import { DEFAULT_INKS } from './inks'
import {
  DEEP_PLANES,
  EMPTY_MICRO_CELL,
  HISTOLOGIC_TYPES,
  INKS,
  LESION_COLORS,
  LESION_CONSISTENCIES,
  LESION_KINDS,
  LESION_SHAPES,
  MARGIN_STATUSES,
  MARGINS,
  MAX_LESIONS,
  PRESENCES,
  QUADRANTS,
  SIDES,
  SKIN_CHANGES,
  SPECIMEN_TYPES,
  type AxillaState,
  type CassettePlan,
  type Dims3,
  type ExtraCassette,
  type InkColor,
  type Lesion,
  type MacroState,
  type Margin,
  type MicroCell,
  type MicroGlobals,
  type MicroState,
  type NodesState,
  type Point3,
  type RcbOverrides,
  type SkinState,
  type Slicing,
  type SpecimenState,
} from './types'

const MACRO_KEY = 'patholytics.breast.macro.v1'
const MICRO_KEY = 'patholytics.breast.micro.v1'
const INKS_KEY = 'patholytics.breast.inks.v1'

const keyFor = (prefix: string, uid: string | null | undefined) => `${prefix}:${uid ?? 'anon'}`

export function newId(prefix = 'l'): string {
  return `${prefix}${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

export const DEFAULT_SKIN: SkinState = { present: false, length: null, width: null, nipple: false, nippleDiameter: null, change: 'none' }
export const DEFAULT_AXILLA: AxillaState = { present: false, nodes: null, largestMm: null }

export const DEFAULT_SPECIMEN: SpecimenState = {
  type: 'segmentectomy',
  side: 'left',
  dims: { ml: 80, si: 60, ap: 30 },
  weightGrams: null,
  skin: DEFAULT_SKIN,
  deep: 'none',
  quadrant: 'auto',
  orientation: '',
  axilla: DEFAULT_AXILLA,
  notes: '',
}

export const DEFAULT_PLAN: CassettePlan = { prefix: 'A', start: 1, rows: 2, cols: 3, perOtherSlice: 1 }

export function makeLesion(partial: Partial<Lesion> = {}): Lesion {
  return {
    id: partial.id ?? newId('l'),
    label: partial.label ?? '1',
    kind: partial.kind ?? 'mass',
    shape: partial.shape ?? 'spiculated',
    size: partial.size ?? { ml: 20, si: 18, ap: 15 },
    center: partial.center ?? { x: 0, y: 0, z: 0 },
    clip: partial.clip ?? false,
    color: partial.color ?? 'white',
    consistency: partial.consistency ?? 'hard',
    cassettes: partial.cassettes ?? { ...DEFAULT_PLAN },
  }
}

export const DEFAULT_SLICING: Slicing = { axis: 'ml', from: 'lateral', count: 8 }

export const DEFAULT_MACRO: MacroState = {
  specimen: DEFAULT_SPECIMEN,
  inks: DEFAULT_INKS,
  slicing: DEFAULT_SLICING,
  lesions: [makeLesion({ id: 'l-default-1' })],
  extraCassettes: [],
  units: 'cm',
}

export const DEFAULT_NODES: NodesState = {
  examined: null,
  positive: null,
  largestMm: null,
  itcOnly: false,
  extranodal: 'notAssessed',
  treatmentEffect: 'notAssessed',
}

export const DEFAULT_MICRO_GLOBALS: MicroGlobals = {
  histType: '',
  grade: null,
  largestInvasiveMm: null,
  treatmentEffect: 'notAssessed',
  lvi: 'notAssessed',
  marginsInvasive: 'notAssessed',
  marginsDcis: 'notAssessed',
  closestMargin: null,
  closestMarginMm: null,
  skinInvolved: false,
  chestWallInvolved: false,
  preTreatmentPositiveNode: false,
  inoperable: false,
}

export const EMPTY_OVERRIDES: RcbOverrides = { d1: null, d2: null, ca: null, cis: null }

export const DEFAULT_MICRO: MicroState = {
  map: DEFAULT_MACRO,
  cells: {},
  rcbLesionId: null,
  overrides: EMPTY_OVERRIDES,
  nodes: DEFAULT_NODES,
  globals: DEFAULT_MICRO_GLOBALS,
}

/* ---- Sanitização ---------------------------------------------------------- */

const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null)
const numOr = (v: unknown, fallback: number): number => num(v) ?? fallback
const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback)
const bool = (v: unknown): boolean => v === true
const oneOf = <T extends string>(v: unknown, options: readonly T[], fallback: T): T =>
  options.includes(v as T) ? (v as T) : fallback

function sanitizeDims(raw: unknown, fallback: Dims3): Dims3 {
  const p = (raw ?? {}) as Partial<Dims3>
  return { ml: num(p.ml) ?? fallback.ml, si: num(p.si) ?? fallback.si, ap: num(p.ap) ?? fallback.ap }
}

function sanitizePoint(raw: unknown): Point3 {
  const p = (raw ?? {}) as Partial<Point3>
  return { x: numOr(p.x, 0), y: numOr(p.y, 0), z: numOr(p.z, 0) }
}

function sanitizeSkin(raw: unknown): SkinState {
  const p = (raw ?? {}) as Partial<SkinState>
  return {
    present: bool(p.present),
    length: num(p.length),
    width: num(p.width),
    nipple: bool(p.nipple),
    nippleDiameter: num(p.nippleDiameter),
    change: oneOf(p.change, SKIN_CHANGES, 'none'),
  }
}

function sanitizeAxilla(raw: unknown): AxillaState {
  const p = (raw ?? {}) as Partial<AxillaState>
  return { present: bool(p.present), nodes: num(p.nodes), largestMm: num(p.largestMm) }
}

export function sanitizeSpecimen(raw: unknown): SpecimenState {
  const p = (raw ?? {}) as Partial<SpecimenState>
  return {
    type: oneOf(p.type, SPECIMEN_TYPES, DEFAULT_SPECIMEN.type),
    side: oneOf(p.side, SIDES, DEFAULT_SPECIMEN.side),
    dims: sanitizeDims(p.dims, DEFAULT_SPECIMEN.dims),
    weightGrams: num(p.weightGrams),
    skin: sanitizeSkin(p.skin),
    deep: oneOf(p.deep, DEEP_PLANES, 'none'),
    quadrant: oneOf(p.quadrant, QUADRANTS, 'auto'),
    orientation: str(p.orientation).slice(0, 400),
    axilla: sanitizeAxilla(p.axilla),
    notes: str(p.notes).slice(0, 2000),
  }
}

export function sanitizeInks(raw: unknown): Record<Margin, InkColor> {
  const p = (raw ?? {}) as Partial<Record<Margin, InkColor>>
  const out = { ...DEFAULT_INKS }
  for (const m of MARGINS) out[m] = oneOf(p[m], INKS, DEFAULT_INKS[m])
  return out
}

function sanitizeSlicing(raw: unknown): Slicing {
  const p = (raw ?? {}) as Partial<Slicing>
  const s: Slicing = {
    axis: oneOf(p.axis, ['ml', 'si', 'ap'] as const, DEFAULT_SLICING.axis),
    from: oneOf(p.from, MARGINS, DEFAULT_SLICING.from),
    count: clampSlices(numOr(p.count, DEFAULT_SLICING.count)),
  }
  return { ...s, from: coherentFrom(s) }
}

function sanitizePlan(raw: unknown): CassettePlan {
  const p = (raw ?? {}) as Partial<CassettePlan>
  return {
    prefix: str(p.prefix, 'A').slice(0, 3) || 'A',
    start: Math.max(1, Math.floor(numOr(p.start, 1)) || 1),
    rows: clampGrid(numOr(p.rows, DEFAULT_PLAN.rows)),
    cols: clampGrid(numOr(p.cols, DEFAULT_PLAN.cols)),
    perOtherSlice: Math.max(0, Math.min(8, Math.floor(numOr(p.perOtherSlice, DEFAULT_PLAN.perOtherSlice)) || 0)),
  }
}

function sanitizeLesion(raw: unknown, index: number): Lesion | null {
  if (!raw || typeof raw !== 'object') return null
  const p = raw as Partial<Lesion>
  return {
    id: typeof p.id === 'string' && p.id ? p.id : newId('l'),
    label: str(p.label, String(index + 1)).slice(0, 12) || String(index + 1),
    kind: oneOf(p.kind, LESION_KINDS, 'mass'),
    shape: oneOf(p.shape, LESION_SHAPES, 'spiculated'),
    size: sanitizeDims(p.size, { ml: 20, si: 18, ap: 15 }),
    center: sanitizePoint(p.center),
    clip: bool(p.clip),
    color: oneOf(p.color, LESION_COLORS, ''),
    consistency: oneOf(p.consistency, LESION_CONSISTENCIES, ''),
    cassettes: sanitizePlan(p.cassettes),
  }
}

function sanitizeExtra(raw: unknown): ExtraCassette | null {
  if (!raw || typeof raw !== 'object') return null
  const p = raw as Partial<ExtraCassette>
  return { id: typeof p.id === 'string' && p.id ? p.id : newId('x'), label: str(p.label).slice(0, 12), description: str(p.description).slice(0, 200) }
}

export function sanitizeMacro(raw: unknown): MacroState {
  const p = (raw ?? {}) as Partial<MacroState>
  const lesions = Array.isArray(p.lesions)
    ? p.lesions
        .slice(0, MAX_LESIONS)
        .map(sanitizeLesion)
        .filter((l): l is Lesion => l !== null)
    : DEFAULT_MACRO.lesions.map((l) => ({ ...l }))
  const extras = Array.isArray(p.extraCassettes)
    ? p.extraCassettes
        .slice(0, 40)
        .map(sanitizeExtra)
        .filter((x): x is ExtraCassette => x !== null)
    : []
  return {
    specimen: sanitizeSpecimen(p.specimen),
    inks: sanitizeInks(p.inks),
    slicing: sanitizeSlicing(p.slicing),
    lesions,
    extraCassettes: extras,
    units: oneOf(p.units, ['cm', 'mm'] as const, 'cm'),
  }
}

function sanitizeCell(raw: unknown): MicroCell {
  const p = (raw ?? {}) as Partial<MicroCell>
  const ca = num(p.ca)
  const cis = num(p.cis)
  return {
    ca: ca === null ? null : Math.max(0, Math.min(100, ca)),
    cis: cis === null ? null : Math.max(0, Math.min(100, cis)),
    lvi: bool(p.lvi),
    margin: oneOf(p.margin, MARGINS, null as unknown as Margin) || null,
  }
}

function sanitizeNodes(raw: unknown): NodesState {
  const p = (raw ?? {}) as Partial<NodesState>
  return {
    examined: num(p.examined),
    positive: num(p.positive),
    largestMm: num(p.largestMm),
    itcOnly: bool(p.itcOnly),
    extranodal: oneOf(p.extranodal, PRESENCES, 'notAssessed'),
    treatmentEffect: oneOf(p.treatmentEffect, PRESENCES, 'notAssessed'),
  }
}

function sanitizeGlobals(raw: unknown): MicroGlobals {
  const p = (raw ?? {}) as Partial<MicroGlobals>
  const grade = p.grade === 1 || p.grade === 2 || p.grade === 3 ? p.grade : null
  return {
    histType: oneOf(p.histType, HISTOLOGIC_TYPES, ''),
    grade,
    largestInvasiveMm: num(p.largestInvasiveMm),
    treatmentEffect: oneOf(p.treatmentEffect, PRESENCES, 'notAssessed'),
    lvi: oneOf(p.lvi, PRESENCES, 'notAssessed'),
    marginsInvasive: oneOf(p.marginsInvasive, MARGIN_STATUSES, 'notAssessed'),
    marginsDcis: oneOf(p.marginsDcis, MARGIN_STATUSES, 'notAssessed'),
    closestMargin: MARGINS.includes(p.closestMargin as Margin) ? (p.closestMargin as Margin) : null,
    closestMarginMm: num(p.closestMarginMm),
    skinInvolved: bool(p.skinInvolved),
    chestWallInvolved: bool(p.chestWallInvolved),
    preTreatmentPositiveNode: bool(p.preTreatmentPositiveNode),
    inoperable: bool(p.inoperable),
  }
}

function sanitizeOverrides(raw: unknown): RcbOverrides {
  const p = (raw ?? {}) as Partial<RcbOverrides>
  return { d1: num(p.d1), d2: num(p.d2), ca: num(p.ca), cis: num(p.cis) }
}

export function sanitizeMicro(raw: unknown): MicroState {
  const p = (raw ?? {}) as Partial<MicroState>
  const cells: Record<string, MicroCell> = {}
  if (p.cells && typeof p.cells === 'object') {
    for (const [id, data] of Object.entries(p.cells)) cells[id] = { ...EMPTY_MICRO_CELL, ...sanitizeCell(data) }
  }
  return {
    map: sanitizeMacro(p.map),
    cells,
    rcbLesionId: typeof p.rcbLesionId === 'string' ? p.rcbLesionId : null,
    overrides: sanitizeOverrides(p.overrides),
    nodes: sanitizeNodes(p.nodes),
    globals: sanitizeGlobals(p.globals),
  }
}

/* ---- Persistência --------------------------------------------------------- */

function read<T>(key: string, sanitize: (raw: unknown) => T, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    return raw ? sanitize(JSON.parse(raw)) : fallback
  } catch {
    return fallback
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // sem persistência a ferramenta continua funcionando na sessão
  }
}

export const loadMacro = (uid: string | null | undefined) => read(keyFor(MACRO_KEY, uid), sanitizeMacro, DEFAULT_MACRO)
export const saveMacro = (uid: string | null | undefined, s: MacroState) => write(keyFor(MACRO_KEY, uid), s)
export const loadMicro = (uid: string | null | undefined) => read(keyFor(MICRO_KEY, uid), sanitizeMicro, DEFAULT_MICRO)
export const saveMicro = (uid: string | null | undefined, s: MicroState) => write(keyFor(MICRO_KEY, uid), s)
export const loadInkDefaults = (uid: string | null | undefined): Record<Margin, InkColor> | null =>
  read(keyFor(INKS_KEY, uid), (raw) => (raw ? sanitizeInks(raw) : null), null)
export const saveInkDefaults = (uid: string | null | undefined, inks: Record<Margin, InkColor> | null) => {
  if (!inks) {
    try {
      localStorage.removeItem(keyFor(INKS_KEY, uid))
    } catch {
      // idem
    }
    return
  }
  write(keyFor(INKS_KEY, uid), inks)
}

/* ---- Código do mapa (macro → laudagem) ------------------------------------ */

const CODE_PREFIX = 'PMAP1.'

function toBase64Url(s: string): string {
  const bytes = new TextEncoder().encode(s)
  let bin = ''
  for (const b of bytes) bin += String.fromCharCode(b)
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(s: string): string {
  const b64 = s.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (s.length % 4)) % 4)
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

/** Texto compacto que o macroscopista cola no sistema e o patologista cola aqui. */
export function encodeMapCode(map: MacroState): string {
  const { specimen } = map
  // O texto livre não viaja: só o que a laudagem precisa para reconstruir a peça.
  const slim: MacroState = {
    ...map,
    specimen: { ...specimen, orientation: '', notes: '' },
    extraCassettes: map.extraCassettes,
  }
  return CODE_PREFIX + toBase64Url(JSON.stringify(slim))
}

export function decodeMapCode(text: string): MacroState | null {
  const clean = text.replace(/\s+/g, '')
  const i = clean.indexOf(CODE_PREFIX)
  if (i < 0) return null
  const body = clean.slice(i + CODE_PREFIX.length).match(/^[A-Za-z0-9_-]+/)?.[0]
  if (!body) return null
  try {
    return sanitizeMacro(JSON.parse(fromBase64Url(body)))
  } catch {
    return null
  }
}
