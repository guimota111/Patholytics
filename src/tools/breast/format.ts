import type { TFunction } from 'i18next'
import type { Dims3, Margin, TextUnit } from './types'

export function fmtN(n: number | null | undefined, digits = 1, locale = 'pt-BR'): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—'
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: digits }).format(n)
}

/** Comprimento em mm formatado na unidade do texto ("2,4 cm" / "24 mm"). */
export function fmtLen(mm: number | null | undefined, unit: TextUnit, locale: string, withUnit = true): string {
  if (mm === null || mm === undefined || !Number.isFinite(mm)) return '—'
  // Em cm o texto macroscópico sempre traz uma casa decimal ("8,0 × 6,0 × 3,0 cm").
  const value =
    unit === 'cm'
      ? new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(mm / 10)
      : fmtN(mm, 1, locale)
  return withUnit ? `${value} ${unit}` : value
}

/** "8,0 × 6,0 × 3,0 cm" (ML × SI × AP). */
export function fmtDims(d: Dims3, unit: TextUnit, locale: string): string {
  const parts = [d.ml, d.si, d.ap].map((v) => fmtLen(v, unit, locale, false))
  return `${parts.join(' × ')} ${unit}`
}

export function fmtWeight(g: number | null | undefined, locale: string): string {
  if (g === null || g === undefined || !Number.isFinite(g)) return '—'
  return `${fmtN(g, 1, locale)} g`
}

export function joinList(items: string[], and: string): string {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} ${and} ${items[items.length - 1]}`
}

export const marginName = (m: Margin, t: TFunction) => t(`breast.margin.${m}`)
