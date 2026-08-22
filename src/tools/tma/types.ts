/** Estado completo de um mapa de TMA. Serializado direto no localStorage. */
export interface TmaState {
  rows: number
  cols: number
  /** Resultado por core, com chave `linha-coluna` (indices base 0). */
  results: Record<string, string>
  /** Indice do core atual dentro da ordem de leitura. */
  current: number
}

export const MIN_DIMENSION = 1
export const MAX_DIMENSION = 40

/** Chave de armazenamento de um core. */
export const keyOf = (row: number, col: number) => `${row}-${col}`

/** Colunas sao numeros: 1, 2, 3... */
export const colLabel = (col: number) => String(col + 1)

/** Linhas sao letras: A..Z, depois AA, AB... */
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
