/* ==========================================================================
   types.ts — modelo de dados do mapeador de mama (macroscopia + RCB).

   A peça é um bloco de tecido com seis margens (superior, inferior, medial,
   lateral, anterior e posterior/profunda), cada uma pintada com uma tinta.
   As lesões são elipsoides posicionados dentro desse bloco, em milímetros a
   partir do centro da peça; a partir da posição e do tamanho saem as
   distâncias às margens, as fatias que contêm a lesão e a grade de cassetes
   do maior corte. O módulo de laudagem reconstrói o mesmo mapa e preenche a
   celularidade por cassete para calcular o Residual Cancer Burden.

   Eixos (referencial da peça): x = médio-lateral (+ lateral),
   y = súpero-inferior (+ superior), z = ântero-posterior (+ anterior).
   ========================================================================== */

export type SpecimenType = 'mastectomy' | 'segmentectomy'
export type Side = 'right' | 'left'
export type Axis = 'ml' | 'si' | 'ap'
export type Margin = 'superior' | 'inferior' | 'medial' | 'lateral' | 'anterior' | 'posterior'
export type InkColor = 'black' | 'blue' | 'green' | 'yellow' | 'red' | 'orange' | 'violet' | 'none'
export type Quadrant = 'auto' | 'usq' | 'lsq' | 'uiq' | 'liq' | 'central' | 'upper' | 'lower' | 'outer' | 'inner' | 'unknown'

export const SPECIMEN_TYPES: SpecimenType[] = ['segmentectomy', 'mastectomy']
export const SIDES: Side[] = ['right', 'left']
export const AXES: Axis[] = ['ml', 'si', 'ap']
export const MARGINS: Margin[] = ['superior', 'inferior', 'medial', 'lateral', 'anterior', 'posterior']
export const INKS: InkColor[] = ['black', 'blue', 'green', 'yellow', 'red', 'orange', 'violet', 'none']
export const QUADRANTS: Quadrant[] = ['auto', 'usq', 'lsq', 'uiq', 'liq', 'central', 'upper', 'lower', 'outer', 'inner', 'unknown']

/** Eixo de cada margem e o sentido (+1 = extremo positivo do eixo). */
export const MARGIN_AXIS: Record<Margin, Axis> = {
  superior: 'si',
  inferior: 'si',
  medial: 'ml',
  lateral: 'ml',
  anterior: 'ap',
  posterior: 'ap',
}
export const MARGIN_SIGN: Record<Margin, 1 | -1> = {
  superior: 1,
  inferior: -1,
  medial: -1,
  lateral: 1,
  anterior: 1,
  posterior: -1,
}
/** As duas margens de cada eixo, [negativa, positiva]. */
export const AXIS_MARGINS: Record<Axis, [Margin, Margin]> = {
  ml: ['medial', 'lateral'],
  si: ['inferior', 'superior'],
  ap: ['posterior', 'anterior'],
}
export const AXIS_COORD: Record<Axis, 'x' | 'y' | 'z'> = { ml: 'x', si: 'y', ap: 'z' }

export interface Dims3 {
  ml: number | null
  si: number | null
  ap: number | null
}

export interface Point3 {
  x: number
  y: number
  z: number
}

export type SkinChange = 'none' | 'retraction' | 'ulceration' | 'edema' | 'scar'
export type DeepPlane = 'none' | 'fascia' | 'muscle'
export const SKIN_CHANGES: SkinChange[] = ['none', 'retraction', 'ulceration', 'edema', 'scar']
export const DEEP_PLANES: DeepPlane[] = ['none', 'fascia', 'muscle']

export interface SkinState {
  present: boolean
  /** Elipse de pele: comprimento (médio-lateral) × largura (súpero-inferior), mm. */
  length: number | null
  width: number | null
  nipple: boolean
  nippleDiameter: number | null
  change: SkinChange
}

export interface AxillaState {
  /** Conteúdo axilar em continuidade (cauda / esvaziamento). */
  present: boolean
  nodes: number | null
  largestMm: number | null
}

export interface SpecimenState {
  type: SpecimenType
  side: Side
  /** Dimensões da peça em mm: médio-lateral, súpero-inferior, ântero-posterior. */
  dims: Dims3
  weightGrams: number | null
  skin: SkinState
  deep: DeepPlane
  /** Quadrante informado na requisição (segmentectomia). */
  quadrant: Quadrant
  /** Marcação cirúrgica recebida (fios, clipes) — texto livre. */
  orientation: string
  axilla: AxillaState
  notes: string
}

export type LesionKind = 'mass' | 'tumorBed'
export type LesionShape = 'spiculated' | 'rounded' | 'illDefined'
export type LesionColor = '' | 'white' | 'gray' | 'yellow' | 'brown' | 'hemorrhagic'
export type LesionConsistency = '' | 'hard' | 'firm' | 'elastic' | 'soft' | 'gelatinous'
export const LESION_KINDS: LesionKind[] = ['mass', 'tumorBed']
export const LESION_SHAPES: LesionShape[] = ['spiculated', 'rounded', 'illDefined']
export const LESION_COLORS: LesionColor[] = ['', 'white', 'gray', 'yellow', 'brown', 'hemorrhagic']
export const LESION_CONSISTENCIES: LesionConsistency[] = ['', 'hard', 'firm', 'elastic', 'soft', 'gelatinous']

export interface CassettePlan {
  /** Letra dos cassetes desta lesão ("A"). */
  prefix: string
  start: number
  /** Grade no maior corte: fileiras × colunas. */
  rows: number
  cols: number
  /** Cassetes por fatia adicional que contém a lesão (0 = só o maior corte). */
  perOtherSlice: number
}

export interface Lesion {
  id: string
  /** Rótulo curto ("1", "2") — o texto diz "lesão 1". */
  label: string
  kind: LesionKind
  shape: LesionShape
  /** Tamanho em mm nos três eixos da peça. */
  size: Dims3
  /** Centro da lesão em mm a partir do centro da peça. */
  center: Point3
  clip: boolean
  color: LesionColor
  consistency: LesionConsistency
  cassettes: CassettePlan
}

export interface Slicing {
  axis: Axis
  /** Margem por onde a numeração começa (fatia 1). Precisa estar no eixo. */
  from: Margin
  count: number
}

export interface ExtraCassette {
  id: string
  label: string
  description: string
}

export type TextUnit = 'cm' | 'mm'

export interface MacroState {
  specimen: SpecimenState
  inks: Record<Margin, InkColor>
  slicing: Slicing
  lesions: Lesion[]
  extraCassettes: ExtraCassette[]
  units: TextUnit
}

/* ---- Laudagem (microscopia / RCB) ---------------------------------------- */

export type Presence = 'notAssessed' | 'absent' | 'present'
export const PRESENCES: Presence[] = ['notAssessed', 'absent', 'present']

export interface MicroCell {
  /** % da área do leito tumoral neste cassete ocupada por carcinoma (invasivo + in situ). */
  ca: number | null
  /** % desse carcinoma que é in situ. */
  cis: number | null
  lvi: boolean
  /** Margem comprometida vista neste cassete. */
  margin: Margin | null
}

export const EMPTY_MICRO_CELL: MicroCell = { ca: null, cis: null, lvi: false, margin: null }

/** Valores previstos no protocolo: décimos, mais 1 % e 5 % para baixa celularidade. */
export const CA_STEPS = [0, 1, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 95, 100]
export const CIS_STEPS = [0, 5, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100]

export interface NodesState {
  examined: number | null
  positive: number | null
  /** Maior metástase, mm. */
  largestMm: number | null
  /** Só células tumorais isoladas (≤ 0,2 mm): ypN0(i+), LN = 0 no RCB. */
  itcOnly: boolean
  extranodal: Presence
  treatmentEffect: Presence
}

export type HistologicType = '' | 'nst' | 'lobular' | 'mixed' | 'mucinous' | 'other'
export const HISTOLOGIC_TYPES: HistologicType[] = ['', 'nst', 'lobular', 'mixed', 'mucinous', 'other']
export type MarginStatus = 'notAssessed' | 'free' | 'involved'
export const MARGIN_STATUSES: MarginStatus[] = ['notAssessed', 'free', 'involved']

export interface MicroGlobals {
  histType: HistologicType
  grade: 1 | 2 | 3 | null
  /** Maior foco contíguo de carcinoma invasivo residual, mm — define o ypT. */
  largestInvasiveMm: number | null
  treatmentEffect: Presence
  lvi: Presence
  marginsInvasive: MarginStatus
  marginsDcis: MarginStatus
  closestMargin: Margin | null
  closestMarginMm: number | null
  skinInvolved: boolean
  chestWallInvolved: boolean
  /** Linfonodo sentinela positivo retirado antes da neoadjuvância: invalida o RCB. */
  preTreatmentPositiveNode: boolean
  /** Doença inoperável ou progressão: RCB-III por definição. */
  inoperable: boolean
}

export interface RcbOverrides {
  d1: number | null
  d2: number | null
  ca: number | null
  cis: number | null
}

export interface MicroState {
  /** O mapa reconstruído (ou importado) da macroscopia. */
  map: MacroState
  cells: Record<string, MicroCell>
  /** Lesão usada no RCB (maior leito residual). */
  rcbLesionId: string | null
  overrides: RcbOverrides
  nodes: NodesState
  globals: MicroGlobals
}

export const MAX_SLICES = 60
export const MAX_LESIONS = 6
export const MAX_GRID = 8

export const cassetteIdOf = (lesionId: string, index: number) => `${lesionId}:${index}`
