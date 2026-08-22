/**
 * Contrato de uma calculadora de estadiamento.
 *
 * Cada tumor vive no seu proprio arquivo em `calculators/` e descreve apenas
 * *dados*: os campos do formulario e uma funcao `compute` pura. O motor
 * (`components/`) cuida de renderizar, coletar valores e montar o resultado —
 * adicionar um tumor novo nao toca em nenhum arquivo de layout.
 */

export type FieldValue = string | number | null

export type CalculatorValues = Record<string, FieldValue>

export interface FieldOption {
  value: string
  label: string
}

export type FieldType = 'select' | 'radio' | 'number' | 'text'

export interface Field {
  id: string
  label: string
  type: FieldType
  hint?: string
  /** Obrigatorio para `select` e `radio`. */
  options?: FieldOption[]
  min?: number
  max?: number
  default?: string | number
  /** Campo condicional: so aparece quando devolve `true`. */
  when?: (values: CalculatorValues) => boolean
}

/** Par mostrado nos badges do painel de resultado (`pT`, `pN`, `pM`...). */
export interface TnmBadge {
  k: string
  v: string | null
}

export interface CalculatorResult {
  tnm?: TnmBadge[]
  /**
   * Grupo prognostico (Estadio I..IV). Calculado quando o protocolo define um,
   * mas so chega a tela se `SHOW_STAGE_GROUP` estiver ligado — ver `config.ts`.
   */
  stageGroup?: string | null
  /** Texto multilinha pronto para colar no laudo. */
  report?: string
  warnings?: string[]
}

export interface Calculator {
  id: string
  name: string
  section: string
  system: string
  version?: string
  reference?: string
  summary?: string
  fields: Field[]
  compute: (values: CalculatorValues) => CalculatorResult
}

/** Le um valor numerico do formulario; devolve `null` quando em branco. */
export function numOf(value: FieldValue): number | null {
  if (value == null || value === '') return null
  const parsed = typeof value === 'number' ? value : Number(value)
  return Number.isNaN(parsed) ? null : parsed
}

/** Le um valor textual do formulario. */
export function strOf(value: FieldValue): string {
  return value == null ? '' : String(value)
}
