/* ==========================================================================
   types.ts — o mapa de TMA: dimensões, os campos que o usuário responde em
   cada core e as respostas em si. Serializado direto no localStorage.
   ========================================================================== */

export type TmaFieldKind = 'text' | 'choice'

/** Uma pergunta respondida em cada core, definida pelo próprio usuário. */
export interface TmaField {
  id: string
  label: string
  kind: TmaFieldKind
  /** Só para `choice`: as opções que viram botões, na ordem. */
  options: string[]
}

/** Respostas de um core, por id de campo. Campo vazio não tem chave. */
export type CoreAnswers = Record<string, string>

/** Estado completo de um mapa de TMA. */
export interface TmaState {
  rows: number
  cols: number
  fields: TmaField[]
  /** Respostas por core, com chave `linha-coluna` (índices base 0). */
  results: Record<string, CoreAnswers>
  /** Índice do core atual dentro da ordem de leitura. */
  current: number
}

export const MIN_DIMENSION = 1
export const MAX_DIMENSION = 40
export const MAX_FIELDS = 8

let seq = 0
export const newFieldId = () => `f${Date.now().toString(36)}${(seq++).toString(36)}`

/** O campo com que todo mapa começa: um resultado em texto livre. */
export const defaultField = (label: string): TmaField => ({ id: 'result', label, kind: 'text', options: [] })

/** Chave de armazenamento de um core. */
export const keyOf = (row: number, col: number) => `${row}-${col}`

/** Colunas são números: 1, 2, 3... */
export const colLabel = (col: number) => String(col + 1)

/** Linhas são letras: A..Z, depois AA, AB... */
export function rowLabel(row: number): string {
  let n = row
  let label = ''
  do {
    label = String.fromCharCode(65 + (n % 26)) + label
    n = Math.floor(n / 26) - 1
  } while (n >= 0)
  return label
}

export const coordOf = (row: number, col: number) => `${rowLabel(row)}${colLabel(col)}`

/** Ordem de leitura: linha a linha, da esquerda para a direita. */
export function buildOrder(rows: number, cols: number): [number, number][] {
  const order: [number, number][] = []
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) order.push([r, c])
  }
  return order
}

export const clampDimension = (value: number) =>
  Math.max(MIN_DIMENSION, Math.min(MAX_DIMENSION, Math.floor(value) || MIN_DIMENSION))

/** Quantos campos de um core têm resposta. */
export function answeredCount(answers: CoreAnswers | undefined, fields: TmaField[]): number {
  if (!answers) return 0
  return fields.filter((field) => (answers[field.id] ?? '').trim()).length
}

export type CoreFill = 'empty' | 'partial' | 'complete'

/** Vazio, parcial (alguns campos) ou completo (todos os campos). */
export function fillOf(answers: CoreAnswers | undefined, fields: TmaField[]): CoreFill {
  const n = answeredCount(answers, fields)
  if (n === 0) return 'empty'
  return n >= fields.length ? 'complete' : 'partial'
}

/** Limpa uma lista de campos vinda de um formulário: sem rótulo vazio, sem opção vazia, no máximo MAX_FIELDS. */
export function sanitizeFields(fields: TmaField[], fallbackLabel: string): TmaField[] {
  const clean = fields
    .map((field) => ({
      id: field.id || newFieldId(),
      label: field.label.trim(),
      kind: field.kind === 'choice' ? ('choice' as const) : ('text' as const),
      options: field.kind === 'choice' ? uniqueOptions(field.options) : [],
    }))
    .filter((field) => field.label)
    .slice(0, MAX_FIELDS)
  return clean.length > 0 ? clean : [defaultField(fallbackLabel)]
}

function uniqueOptions(options: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const raw of options) {
    const option = raw.trim()
    if (!option || seen.has(option)) continue
    seen.add(option)
    out.push(option)
  }
  return out
}

/** Opções digitadas numa linha só, separadas por vírgula, ponto e vírgula ou quebra de linha. */
export const parseOptions = (text: string): string[] => uniqueOptions(text.split(/[,;\n]/))
