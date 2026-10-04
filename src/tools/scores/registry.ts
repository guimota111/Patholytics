/* ==========================================================================
   scores/registry.ts — os escores de imuno-histoquímica, uma página só no
   menu. Para acrescentar um escore: crie `calculators/<nome>.ts` e importe
   aqui.
   ========================================================================== */

import type { CalculatorSuite } from '@/tools/suites/types'
import allred from './calculators/allred'
import her2Breast from './calculators/her2_breast'
import her2Gastric from './calculators/her2_gastric'
import hscore from './calculators/hscore'
import ki67 from './calculators/ki67'
import mmr from './calculators/mmr'
import p53 from './calculators/p53'
import pdl1 from './calculators/pdl1'

export const scoresSuite: CalculatorSuite = {
  id: 'scores',
  basePath: '/tools/escores',
  toolKey: 'ihcScores',
  i18nKey: 'scores',
  calculators: [allred, her2Breast, her2Gastric, pdl1, ki67, hscore, mmr, p53],
  sectionOrder: ['Receptores hormonais', 'HER2', 'Imunoterapia', 'Proliferação', 'Semiquantificação', 'Reparo de DNA e p53'],
}
