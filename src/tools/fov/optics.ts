/**
 * Óptica do campo de visão.
 *
 * Diâmetro do campo no plano do espécime = número de campo da ocular (FN, em mm)
 * ÷ (aumento da objetiva × fator de tubo / lente intermediária).
 * Área = π · (d/2)².
 *
 * Referências: Nikon MicroscopyU, "Field of View Diameter"; CAP, protocolos de
 * mama e partes moles ("Field diameter = Objective Field Number / Objective
 * Magnification"); Cree IA et al. Mod Pathol 2021;34:1651 ("Counting mitoses:
 * SI(ze) matters!").
 */

export type ConfigMode = 'fieldNumber' | 'measured'

export interface MicroscopeConfig {
  mode: ConfigMode
  /** Número de campo da ocular (mm). Costuma vir gravado nela: "10x/22". */
  fieldNumber: number
  /** Aumento de lente intermediária / trocador de aumento. 1 = nenhum. */
  tubeFactor: number
  /** Objetiva usada na medição direta com micrômetro de platina. */
  measuredObjective: number
  /** Diâmetro medido com micrômetro (mm) naquela objetiva. */
  measuredDiameterMm: number
}

export const OBJECTIVES = [2, 4, 10, 20, 40, 60, 100] as const

/** Números de campo comuns nas oculares de microscopia clínica. */
export const COMMON_FIELD_NUMBERS = [18, 20, 22, 25, 26.5] as const

export const DEFAULT_CONFIG: MicroscopeConfig = {
  mode: 'fieldNumber',
  fieldNumber: 22,
  tubeFactor: 1,
  measuredObjective: 40,
  measuredDiameterMm: 0.55,
}

const isPositive = (n: number) => Number.isFinite(n) && n > 0

export function isConfigValid(c: MicroscopeConfig): boolean {
  if (!isPositive(c.tubeFactor)) return false
  if (c.mode === 'fieldNumber') return isPositive(c.fieldNumber)
  return isPositive(c.measuredObjective) && isPositive(c.measuredDiameterMm)
}

/**
 * Número de campo efetivo. Na medição direta, recupera-se a constante do
 * sistema (d × objetiva × tubo) — o método "com régua" descrito pela CAP —
 * e a partir dela derivam-se as demais objetivas.
 */
export function effectiveFieldNumber(c: MicroscopeConfig): number {
  if (c.mode === 'fieldNumber') return c.fieldNumber
  return c.measuredDiameterMm * c.measuredObjective * c.tubeFactor
}

export function fieldDiameter(c: MicroscopeConfig, objective: number): number {
  return effectiveFieldNumber(c) / (objective * c.tubeFactor)
}

export function areaOfDiameter(diameterMm: number): number {
  const r = diameterMm / 2
  return Math.PI * r * r
}

export function fieldArea(c: MicroscopeConfig, objective: number): number {
  return areaOfDiameter(fieldDiameter(c, objective))
}

/**
 * Quantos campos cobrem uma área. As tabelas da CAP e da OMS arredondam para o
 * inteiro mais próximo (0,55 mm → 42 campos para 10 mm²); devolvemos o valor
 * exato e o arredondado para a interface mostrar ambos.
 */
export function fieldsToCover(areaMm2: number, fieldAreaMm2: number): { exact: number; rounded: number } {
  const exact = areaMm2 / fieldAreaMm2
  return { exact, rounded: Math.max(1, Math.round(exact)) }
}

/** Contagem em N campos → densidade por mm². */
export function densityPerMm2(count: number, nFields: number, fieldAreaMm2: number): number {
  return count / (nFields * fieldAreaMm2)
}

/** Densidade por `unitAreaMm2` (ex.: por 2 mm²) → quantas figuras em N campos. */
export function countInFields(
  perUnit: number,
  unitAreaMm2: number,
  nFields: number,
  fieldAreaMm2: number,
): number {
  return (perUnit / unitAreaMm2) * nFields * fieldAreaMm2
}

/** Formata número com casas fixas em pt-BR/en conforme o locale do navegador. */
export function fmt(n: number, digits = 2, locale?: string): string {
  if (!Number.isFinite(n)) return '—'
  return new Intl.NumberFormat(locale, { maximumFractionDigits: digits, minimumFractionDigits: 0 }).format(n)
}
