/* ==========================================================================
   Grau nucleolar WHO/ISUP — carcinoma de células renais (células claras e
   papilífero). Substituiu o Fuhrman: graus 1–3 pela visibilidade do nucléolo,
   grau 4 pelo pleomorfismo extremo, células gigantes, rabdoide ou sarcomatoide.
   ========================================================================== */

import type { Calculator, CalculatorResult } from '@/tools/stager/types'
import { strOf } from '@/tools/stager/types'

const calculator: Calculator = {
  id: 'rcc-who-isup',
  name: 'Rim — grau nucleolar WHO/ISUP',
  section: 'Rim e urotélio',
  system: 'WHO/ISUP 2016 · WHO 2022',
  reference: 'Delahunt B et al. Am J Surg Pathol 2013; Moch H et al. WHO Urinary and Male Genital Tumours 5ª ed. (2022)',
  summary: 'Nucléolo visível em que aumento, pleomorfismo extremo e diferenciação rabdoide/sarcomatoide definem o grau 1 a 4 do CCR de células claras e papilífero.',
  fields: [
    {
      id: 'nucleoli', label: 'Área de maior grau: como está o nucléolo', type: 'radio', default: 'g2',
      hint: 'Avalie a pior área, mesmo focal.',
      options: [
        { value: 'g1', label: 'Ausente ou inconspícuo a 400×' },
        { value: 'g2', label: 'Conspícuo e eosinofílico a 400×, mas não a 100×' },
        { value: 'g3', label: 'Conspícuo e eosinofílico a 100×' },
      ],
    },
    {
      id: 'g4', label: 'Pleomorfismo extremo, células gigantes tumorais, diferenciação rabdoide ou sarcomatoide?', type: 'radio', default: 'no',
      options: [
        { value: 'no', label: 'Não' },
        { value: 'yes', label: 'Sim' },
      ],
    },
    {
      id: 'histotype', label: 'Histotipo', type: 'select', default: 'clear',
      options: [
        { value: 'clear', label: 'Células claras' },
        { value: 'papillary', label: 'Papilífero' },
        { value: 'chromophobe', label: 'Cromófobo' },
        { value: 'other', label: 'Outro' },
      ],
    },
  ],
  compute: (v): CalculatorResult => {
    const g4 = strOf(v.g4) === 'yes'
    const base = { g1: 1, g2: 2, g3: 3 }[strOf(v.nucleoli)] ?? 2
    const grade = g4 ? 4 : base
    const warnings: string[] = []
    const histotype = strOf(v.histotype)
    if (histotype === 'chromophobe') warnings.push('O grau WHO/ISUP não se aplica ao CCR cromófobo (usar, se quiser, o sistema de Paner). Sarcomatoide e rabdoide continuam sendo relatados.')
    if (histotype === 'other') warnings.push('Validado para células claras e papilífero; nos outros histotipos o grau é opcional e deve ser dito como tal.')
    if (g4) warnings.push('Descrever a porcentagem do componente sarcomatoide/rabdoide: qualquer proporção já define grau 4 e tem impacto prognóstico próprio.')
    return {
      tnm: [{ k: 'Grau WHO/ISUP', v: `${grade} de 4` }],
      warnings,
      report: histotype === 'chromophobe' ? '' : `Grau nucleolar WHO/ISUP: ${grade} de 4${g4 ? ' (diferenciação sarcomatoide/rabdoide ou pleomorfismo extremo)' : ''}.`,
    }
  },
}

export default calculator
