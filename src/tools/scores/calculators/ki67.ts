/* ==========================================================================
   Ki-67 — índice de proliferação a partir da contagem, com a leitura por
   contexto: mama (IKWG 2021), tumores neuroendócrinos gastroenteropancreáticos
   (WHO 2019/2022) e contagem livre.
   ========================================================================== */

import type { Calculator, CalculatorResult } from '@/tools/stager/types'
import { numOf, strOf } from '@/tools/stager/types'
import { fmt } from '@/tools/suites/types'

const calculator: Calculator = {
  id: 'ki-67',
  name: 'Ki-67 — índice de proliferação',
  section: 'Proliferação',
  system: 'IKWG 2021 · WHO NET',
  reference: 'Nielsen TO et al. IKWG, J Natl Cancer Inst 2021; WHO Classification of Tumours, Digestive System 5ª ed. (2019) e Endocrine 5ª ed. (2022)',
  summary: 'Núcleos positivos sobre núcleos contados viram o índice, com a faixa de leitura da mama (IKWG) ou o grau do tumor neuroendócrino.',
  fields: [
    {
      id: 'context', label: 'Contexto', type: 'select', default: 'breast',
      options: [
        { value: 'breast', label: 'Carcinoma de mama (IKWG)' },
        { value: 'net', label: 'Tumor neuroendócrino gastroenteropancreático (WHO)' },
        { value: 'free', label: 'Outro — só o índice' },
      ],
    },
    {
      id: 'positive', label: 'Núcleos tumorais positivos', type: 'number', min: 0, default: 60,
      hint: 'Qualquer intensidade nuclear conta. Não conte linfócitos, estroma nem células in situ.',
    },
    {
      id: 'total', label: 'Núcleos tumorais contados', type: 'number', min: 1, default: 500,
      hint: 'Mama (IKWG): ≥500 células pelo método global ponderado. NET: 500–2000 células no hotspot.',
    },
  ],
  compute: (v): CalculatorResult => {
    const pos = numOf(v.positive)
    const total = numOf(v.total)
    const context = strOf(v.context)
    if (pos === null || total === null || total <= 0) return { report: '' }
    const warnings: string[] = []
    if (pos > total) warnings.push('Positivos acima do total contado.')
    const index = (pos / total) * 100
    let reading = '—'
    let reportTail = ''
    if (context === 'breast') {
      if (total < 500) warnings.push('IKWG recomenda contar pelo menos 500 células, pelo método global ponderado, para que o índice seja reprodutível.')
      reading = index <= 5 ? 'baixo (≤5%)' : index >= 30 ? 'alto (≥30%)' : 'intermediário (5–30%)'
      if (index > 5 && index < 30) warnings.push('Entre 5% e 30% o IKWG considera o Ki-67 pouco reprodutível para decisão clínica isolada; a faixa deve ser laudada como tal.')
      reportTail = `; faixa IKWG: ${reading}`
    } else if (context === 'net') {
      if (total < 500) warnings.push('WHO: contar 500 a 2000 células no hotspot (área de maior marcação), preferencialmente por contagem manual em impressão ou câmera.')
      const grade = index < 3 ? 'G1' : index <= 20 ? 'G2' : 'G3'
      reading = grade
      warnings.push('O grau final é o mais alto entre Ki-67 e contagem mitótica (G1 <2/2 mm²; G2 2–20; G3 >20). Ki-67 >20% com morfologia pouco diferenciada é carcinoma neuroendócrino, não NET G3.')
      reportTail = `; grau ${grade} pelo Ki-67 (G1 <3%, G2 3–20%, G3 >20%)`
    }
    return {
      tnm: [
        { k: 'Ki-67', v: `${fmt(index)}%` },
        { k: 'Contadas', v: `${pos}/${total}` },
        { k: 'Leitura', v: reading },
      ],
      warnings,
      report: `Ki-67: ${fmt(index)}% (${pos} núcleos positivos em ${total} contados${reportTail}).`,
    }
  },
}

export default calculator
