/* ==========================================================================
   HER2 gastroesofágico — critérios de Hofmann/Rüschoff (ToGA) adotados pelo
   CAP/ASCO/ASCP 2016. A marcação é basolateral ou lateral (não precisa ser
   circunferencial); o corte é ≥10% das células na ressecção e um agrupamento
   de ≥5 células coesas na biópsia.
   ========================================================================== */

import type { Calculator, CalculatorResult } from '@/tools/stager/types'
import { numOf, strOf } from '@/tools/stager/types'
import { fmt } from '@/tools/suites/types'

const calculator: Calculator = {
  id: 'her2-gastric',
  name: 'HER2 gastroesofágico — imuno e ISH',
  section: 'HER2',
  system: 'Rüschoff/Hofmann · CAP/ASCO/ASCP 2016',
  reference: 'Hofmann M et al. Histopathology 2008; Rüschoff J et al. Mod Pathol 2012; Bartley AN et al. CAP/ASCO/ASCP, Arch Pathol Lab Med 2016',
  summary: 'Adenocarcinoma gástrico e da junção: padrão basolateral em biópsia (agrupamento de ≥5 células) ou ressecção (≥10%), com a ISH nos 2+.',
  fields: [
    {
      id: 'specimen', label: 'Tipo de amostra', type: 'radio', default: 'biopsy',
      options: [
        { value: 'biopsy', label: 'Biópsia endoscópica' },
        { value: 'resection', label: 'Ressecção cirúrgica' },
      ],
    },
    {
      id: 'ihc', label: 'Padrão da imuno-histoquímica', type: 'select', default: '2',
      hint: 'Biópsia: o critério é um agrupamento coeso de ≥5 células tumorais. Ressecção: ≥10% das células tumorais.',
      options: [
        { value: '0', label: 'Sem marcação, ou marcação abaixo do critério (<10% / sem agrupamento de 5 células)' },
        { value: '1', label: '1+ — membrana fraca / quase imperceptível, atingindo o critério' },
        { value: '2', label: '2+ — membrana completa, basolateral ou lateral, fraca a moderada, atingindo o critério' },
        { value: '3', label: '3+ — membrana completa, basolateral ou lateral, intensa, atingindo o critério' },
      ],
    },
    {
      id: 'ish', label: 'ISH (dupla sonda)', type: 'select', default: 'done',
      when: (v) => strOf(v.ihc) === '2',
      options: [
        { value: 'done', label: 'Realizada' },
        { value: 'none', label: 'Não realizada / pendente' },
      ],
    },
    { id: 'ratio', label: 'Razão HER2/CEP17', type: 'number', min: 0, default: 2.5, when: (v) => strOf(v.ihc) === '2' && strOf(v.ish) === 'done' },
    { id: 'copies', label: 'Média de cópias de HER2 por célula', type: 'number', min: 0, default: 5, when: (v) => strOf(v.ihc) === '2' && strOf(v.ish) === 'done' },
  ],
  compute: (v): CalculatorResult => {
    const ihc = strOf(v.ihc)
    const specimen = strOf(v.specimen) === 'biopsy' ? 'biópsia' : 'ressecção'
    const warnings: string[] = []
    let status = ''
    let ishLine = ''
    if (ihc === '3') status = 'positivo'
    else if (ihc === '0' || ihc === '1') status = 'negativo'
    else if (strOf(v.ish) === 'none') status = 'equívoco — aguarda ISH'
    else {
      const ratio = numOf(v.ratio)
      const copies = numOf(v.copies)
      if (ratio === null || copies === null) status = 'equívoco — aguarda ISH'
      else if (ratio >= 2) {
        status = 'positivo'
        ishLine = ` ISH: razão HER2/CEP17 ${fmt(ratio, 2)} (≥2,0), amplificado.`
      } else if (copies >= 6) {
        status = 'positivo'
        ishLine = ` ISH: razão ${fmt(ratio, 2)}, ${fmt(copies)} cópias/célula (≥6,0), amplificado.`
      } else if (copies >= 4) {
        status = 'equívoco'
        ishLine = ` ISH: razão ${fmt(ratio, 2)}, ${fmt(copies)} cópias/célula (4,0–5,9).`
        warnings.push('Zona equívoca da ISH: contar mais 20 células (ou outra área/bloco) antes de concluir.')
      } else {
        status = 'negativo'
        ishLine = ` ISH: razão ${fmt(ratio, 2)}, ${fmt(copies)} cópias/célula (<4,0), não amplificado.`
      }
    }
    if (ihc === '1' && specimen === 'biópsia') warnings.push('Heterogeneidade é comum no estômago: em biópsia negativa com forte suspeita clínica, vale testar mais fragmentos ou a peça.')
    warnings.push('Marcação citoplasmática ou só em componente intestinal metaplásico não conta. O mesmo critério vale para a junção esofagogástrica.')
    return {
      tnm: [
        { k: 'Imuno', v: ihc === '0' ? '0' : `${ihc}+` },
        { k: 'HER2', v: status },
      ],
      warnings,
      report: `HER2 (${specimen}): ${status}. Imuno-histoquímica escore ${ihc === '0' ? '0' : `${ihc}+`} pelos critérios de Rüschoff/Hofmann.${ishLine}`,
    }
  },
}

export default calculator
