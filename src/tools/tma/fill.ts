import type { CoreFill } from './types'

/** A bolinha de um core na tela: vazia, parcial (alguns campos) ou completa. */
export const FILL_CLASS: Record<CoreFill, string> = {
  empty: 'border-line bg-surface hover:border-line-strong',
  partial: 'border-dashed border-accent/70 bg-accent-soft/50 hover:border-accent',
  complete: 'border-accent/50 bg-accent-soft hover:border-accent',
}

/** Core de controle: âmbar, com a letra C dentro, respondido ou não. */
export const CONTROL_CLASS = 'border-warning/60 bg-warning-soft text-warning hover:border-warning'
