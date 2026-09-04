/* ==========================================================================
   engine.ts — o "fluxograma interativo": passos de escolha, formulários
   numéricos e resultados, ligados por ids. O estado é só a trilha de passos
   visitados e as respostas; voltar é tirar o último passo da trilha.
   ========================================================================== */

import type { CodeKey } from './codes'

export type AnswerValue = string | number | number[]
export type Answers = Record<string, AnswerValue>

export interface ChoiceOption {
  value: string
  label: string
  description?: string
  next: string
}

export interface NumberField {
  key: string
  label: string
  hint?: string
  min?: number
  max?: number
  default?: number
  /** Lista de números separados por vírgula (ex.: lâminas por lesão). */
  list?: boolean
}

export interface ChoiceStep {
  id: string
  kind: 'choice'
  title: string
  hint?: string
  options: ChoiceOption[]
}

export interface FormStep {
  id: string
  kind: 'form'
  title: string
  hint?: string
  fields: NumberField[]
  next: string | ((answers: Answers) => string)
}

export interface LineItem {
  code: CodeKey
  qty: number
  /** Por que esta linha existe ("1 por frasco", "cada 6 linfonodos"...). */
  reason: string
}

export interface ResultData {
  items: LineItem[]
  /** Observações da regra aplicada. */
  notes: string[]
  /** Limites aplicados ou situações a conferir. */
  warnings: string[]
  /** Trecho/referência da cartilha. */
  rule: string
}

export interface ResultStep {
  id: string
  kind: 'result'
  title: string
  compute: (answers: Answers) => ResultData
}

export type Step = ChoiceStep | FormStep | ResultStep

export interface Flow {
  start: string
  steps: Record<string, Step>
}

export const num = (a: Answers, key: string, fallback = 0): number => {
  const v = a[key]
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback
}

export const list = (a: Answers, key: string): number[] => {
  const v = a[key]
  return Array.isArray(v) ? v : []
}

export const str = (a: Answers, key: string): string => {
  const v = a[key]
  return typeof v === 'string' ? v : ''
}

/** Linha só entra no resultado se a quantidade for positiva. */
export const line = (code: CodeKey, qty: number, reason: string): LineItem[] =>
  qty > 0 ? [{ code, qty, reason }] : []

/** "8, 6, 5" → [8, 6, 5] */
export function parseList(raw: string): number[] {
  return raw
    .split(/[,;\s]+/)
    .map((s) => Number(s))
    .filter((n) => Number.isFinite(n) && n > 0)
}

export function resolveNext(step: FormStep, answers: Answers): string {
  return typeof step.next === 'function' ? step.next(answers) : step.next
}
