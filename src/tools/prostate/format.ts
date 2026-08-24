import type { TFunction } from 'i18next'
import type { Cell, Side } from './types'
import type { GleasonResult } from './gleason'

export function fmtN(n: number | null | undefined, digits = 1, locale = 'pt-BR'): string {
  if (n === null || n === undefined || !Number.isFinite(n)) return '—'
  return new Intl.NumberFormat(locale, { minimumFractionDigits: 0, maximumFractionDigits: digits }).format(n)
}

export const gleasonText = (g: GleasonResult | null) => (g ? `${g.primary}+${g.secondary}=${g.score}` : '—')

/** Nome curto de uma célula: "Fatia 3 · AD", "Ápice D 1". */
export function cellName(cell: Cell, t: TFunction): string {
  if (cell.kind === 'slice') return `${t('prostate.region.slice', { n: cell.slice })} · ${cell.sector!.id}`
  const region = t(`prostate.region.${cell.kind}`)
  return `${region} ${t(`prostate.side.${cell.side}`)} ${cell.index! + 1}`
}

export const sideText = (side: Side, t: TFunction) => t(`prostate.side.${side}`)

/** "1-3, 7, 9-10" a partir de rótulos numéricos; rótulos não numéricos entram literais. */
export function compactLabels(labels: string[]): string {
  const nums = labels.map((l) => Number(l)).filter((n) => Number.isInteger(n))
  const others = labels.filter((l) => !Number.isInteger(Number(l)))
  nums.sort((a, b) => a - b)
  const parts: string[] = []
  let i = 0
  while (i < nums.length) {
    let j = i
    while (j + 1 < nums.length && nums[j + 1] === nums[j] + 1) j++
    parts.push(j > i + 1 ? `${nums[i]}-${nums[j]}` : j === i + 1 ? `${nums[i]}, ${nums[j]}` : String(nums[i]))
    i = j + 1
  }
  return [...parts, ...others].join(', ')
}

export function joinList(items: string[], and: string): string {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} ${and} ${items[items.length - 1]}`
}
