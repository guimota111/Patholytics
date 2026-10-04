/* ==========================================================================
   grading/registry.ts — as graduações histológicas que não cabem no
   Estadiador (que é só pTNM), numa página só. Para acrescentar uma: crie
   `calculators/<nome>.ts` e importe aqui.
   ========================================================================== */

import type { CalculatorSuite } from '@/tools/suites/types'
import banff from './calculators/banff'
import fnclcc from './calculators/fnclcc'
import hepatitis from './calculators/hepatitis'
import lupus from './calculators/lupus'
import marsh from './calculators/marsh'
import masld from './calculators/masld'
import nottingham from './calculators/nottingham'
import olga from './calculators/olga'
import rccGrade from './calculators/rcc_grade'
import regression from './calculators/regression'

export const gradingSuite: CalculatorSuite = {
  id: 'grading',
  basePath: '/tools/graduacoes',
  toolKey: 'grading',
  i18nKey: 'grading',
  calculators: [nottingham, fnclcc, rccGrade, regression, olga, marsh, hepatitis, masld, banff, lupus],
  sectionOrder: ['Mama', 'Partes moles e osso', 'Rim e urotélio', 'Tubo digestivo', 'Fígado', 'Nefropatologia e transplante'],
}
