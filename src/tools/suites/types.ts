/* ==========================================================================
   suites/types.ts — uma "suíte" é um índice de calculadoras que compartilham
   o motor do Estadiador (campos declarativos + `compute` puro) mas vivem sob
   outra entrada do menu: os escores de imuno e as graduações histológicas.
   Cada suíte declara o caminho base, as chaves de texto e o seu registro.
   ========================================================================== */

import type { Calculator } from '@/tools/stager/types'

export interface CalculatorSuite {
  id: string
  /** Caminho do índice; a calculadora fica em `${basePath}/${calculator.id}`. */
  basePath: string
  /** Chave em `tools.<key>.name` para o título. */
  toolKey: string
  /** Chave raiz em `suites.<key>` com `subtitle` e `disclaimer`. */
  i18nKey: string
  calculators: Calculator[]
  /** Ordem das seções no índice; seções fora da lista vão para o fim. */
  sectionOrder: string[]
}

export function groupBySection(suite: CalculatorSuite, items: Calculator[] = suite.calculators): [string, Calculator[]][] {
  const map = new Map<string, Calculator[]>()
  for (const calc of items) {
    const list = map.get(calc.section) ?? []
    list.push(calc)
    map.set(calc.section, list)
  }
  const rank = (section: string) => {
    const i = suite.sectionOrder.indexOf(section)
    return i === -1 ? suite.sectionOrder.length : i
  }
  return [...map.entries()].sort((a, b) => rank(a[0]) - rank(b[0]) || a[0].localeCompare(b[0], 'pt-BR'))
}

export const getSuiteCalculator = (suite: CalculatorSuite, id: string | undefined) =>
  suite.calculators.find((calc) => calc.id === id) ?? null

/** Formata um número com vírgula decimal e o número de casas pedido. */
export const fmt = (value: number, digits = 1) =>
  value.toLocaleString('pt-BR', { minimumFractionDigits: 0, maximumFractionDigits: digits })

/** Opções 0..n com rótulo por valor. */
export const scale = (labels: string[]) => labels.map((label, value) => ({ value: String(value), label: `${value} — ${label}` }))
