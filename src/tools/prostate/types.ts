/* ==========================================================================
   types.ts — modelo de dados do mapeador de prostatectomia radical.

   A peça é descrita como uma grade: N fatias transversais (do ápice para a
   base), cada uma dividida em setores angulares, mais cones de ápice e de
   base cortados parassagitalmente (direita → esquerda). Cada célula dessa
   grade corresponde a um cassete e recebe os achados microscópicos.
   ========================================================================== */

export type Side = 'D' | 'E' | 'B'
export type SectorCount = 2 | 4 | 6 | 8
export type SectorRegion = 'anterior' | 'anterolateral' | 'lateral' | 'posterolateral' | 'posterior' | 'hemi'

export interface SectorDef {
  id: string
  side: Side
  region: SectorRegion
  /** Ângulos em graus no plano transversal: 0° = linha média anterior,
      positivo para o lado direito do paciente, 180° = linha média posterior. */
  start: number
  end: number
}

export type CellKind = 'slice' | 'apex' | 'base'

export interface Cell {
  id: string
  kind: CellKind
  /** Fatia 1 = adjacente ao ápice (apenas kind === 'slice'). */
  slice?: number
  sector?: SectorDef
  /** Índice do cassete dentro do cone, da direita para a esquerda (apex/base). */
  index?: number
  side: Side
  /** Rótulo impresso no cassete (número ou texto). */
  label: string
}

export type Numbering = 'bySlice' | 'bySector'
export type SliceOrder = 'apexToBase' | 'baseToApex'

export interface GridConfig {
  slices: number
  sectors: SectorCount
  apexCassettes: number
  baseCassettes: number
  numbering: Numbering
  sliceOrder: SliceOrder
  /** Rótulos personalizados, por id de célula. Vazio = numeração automática. */
  labels: Record<string, string>
}

export type EpeStatus = 'none' | 'focal' | 'established'
export type Pattern = 3 | 4 | 5

export interface CellData {
  /** % da área do cassete ocupada por tumor. */
  tumor: number | null
  /** Gleason 4 e 5 — interpretação definida por CaseGlobals.g45Mode. */
  g4: number | null
  g5: number | null
  /** % do padrão 4 que é cribriforme (modo por cassete). */
  crib: number | null
  /** Carcinoma intraductal presente (modo por cassete). */
  idc: boolean
  margin: boolean
  marginMm: number | null
  marginPattern: Pattern | null
  epe: EpeStatus
}

export const EMPTY_CELL: CellData = {
  tumor: null,
  g4: null,
  g5: null,
  crib: null,
  idc: false,
  margin: false,
  marginMm: null,
  marginPattern: null,
  epe: 'none',
}

export type G45Mode = 'ofTumor' | 'ofCassette'
export type DetailMode = 'global' | 'perCassette'
export type Presence = 'notAssessed' | 'absent' | 'present'
export type SeminalVesicles = 'notIdentified' | 'free' | 'right' | 'left' | 'bilateral'
export type BladderNeck = 'notAssessed' | 'free' | 'involved'

export interface CaseGlobals {
  g45Mode: G45Mode
  cribMode: DetailMode
  idcMode: DetailMode
  /** % do padrão 4 que é cribriforme (modo global). */
  cribriform: number | null
  intraductal: Presence
  weightGrams: number | null
  seminalVesicles: SeminalVesicles
  bladderNeck: BladderNeck
  adjacentInvasion: boolean
  lnPositive: number | null
  lnTotal: number | null
  perineural: Presence
  lymphovascular: Presence
}

export interface CaseState {
  grid: GridConfig
  cells: Record<string, CellData>
  globals: CaseGlobals
}

export interface GridTemplate {
  name: string
  grid: GridConfig
}

export const MAX_SLICES = 20
export const MAX_CONE_CASSETTES = 8

/** Limiar ISUP para "padrão menor/terciário" e para ignorar padrão de menor grau. */
export const MINOR_PATTERN_THRESHOLD = 5
