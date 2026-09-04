/* ==========================================================================
   types.ts — modelo de dados do mapeador de prostatectomia radical.

   A peça é descrita como o patologista clivou: N cassetes numerados,
   agrupados em "grupos" definidos pelo usuário (ex.: "Lobo direito
   anterior, cassetes 1-8"). Cada grupo diz de que lado, região e nível da
   glândula ele vem e que tecido contém; os cassetes prostáticos de um
   grupo são fatias consecutivas do ápice para a base. É essa descrição que
   alimenta a análise, o mapa 2D e o modelo 3D.
   ========================================================================== */

export type Side = 'D' | 'E' | 'B'
export type Region = 'anterior' | 'posterior' | 'whole'
/**
 * Sentido dos cassetes do grupo ao longo da glândula: um lobo inteiro corre
 * do ápice para a base (ou o contrário, conforme a numeração); um cone de
 * ápice ou de base fica só naquela ponta.
 */
export type Span = 'apexToBase' | 'baseToApex' | 'apexOnly' | 'baseOnly'
export type Tissue = 'prostate' | 'seminalVesicle' | 'vasDeferens' | 'lymphNode' | 'other'

export const SIDES: Side[] = ['D', 'E', 'B']
export const REGIONS: Region[] = ['anterior', 'posterior', 'whole']
export const SPANS: Span[] = ['apexToBase', 'baseToApex', 'apexOnly', 'baseOnly']
export const TISSUES: Tissue[] = ['prostate', 'seminalVesicle', 'vasDeferens', 'lymphNode', 'other']

export interface CassetteGroup {
  id: string
  name: string
  /** Faixa de cassetes: "1-8", "9, 11", "1-4, 7". */
  range: string
  side: Side
  region: Region
  span: Span
  tissue: Tissue
}

export interface MappingConfig {
  /** Total de cassetes da peça (numerados 1..total). */
  total: number
  groups: CassetteGroup[]
}

export interface Cell {
  /** `c<n>` */
  id: string
  number: number
  label: string
  group: CassetteGroup | null
  /** Posição dentro do grupo (0 = mais apical) e tamanho do grupo. */
  indexInGroup: number
  groupSize: number
  side: Side
  region: Region
  span: Span
  tissue: Tissue
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
  mapping: MappingConfig
  cells: Record<string, CellData>
  globals: CaseGlobals
}

export interface MappingTemplate {
  name: string
  mapping: MappingConfig
}

export const MAX_CASSETTES = 200

/** Limiar ISUP para "padrão menor/terciário" e para ignorar padrão de menor grau. */
export const MINOR_PATTERN_THRESHOLD = 5

export const cellIdOf = (n: number) => `c${n}`
