import type { CoreFill } from './types'

/** A bolinha de um core na tela: vazia, parcial (alguns campos) ou completa. */
export const FILL_CLASS: Record<CoreFill, string> = {
  empty: 'border-line bg-surface hover:border-line-strong',
  partial: 'border-dashed border-accent/70 bg-accent-soft/50 hover:border-accent',
  complete: 'border-accent/50 bg-accent-soft hover:border-accent',
}
