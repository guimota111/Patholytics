/* ==========================================================================
   HER2 na mama — ASCO/CAP 2018 com a atualização de 2023 (HER2-low e ultralow).
   Imuno: 0, 1+, 2+, 3+ pelo padrão de membrana. 2+ vai para ISH; dupla sonda
   entra nos cinco grupos de 2018, com o desempate pela imuno.
   ========================================================================== */

import type { Calculator, CalculatorResult } from '@/tools/stager/types'
import { numOf, strOf } from '@/tools/stager/types'
import { fmt } from '@/tools/suites/types'

const IHC: Record<string, { score: '0' | '1+' | '2+' | '3+'; ultralow?: boolean }> = {
  none: { score: '0' },
  faint10: { score: '0', ultralow: true },
  faint: { score: '1+' },
  weak: { score: '2+' },
  strong10: { score: '2+' },
  strong: { score: '3+' },
}

const calculator: Calculator = {
  id: 'her2-breast',
  name: 'HER2 na mama — imuno e ISH',
  section: 'HER2',
  system: 'ASCO/CAP 2018 · 2023',
  reference: 'Wolff AC et al. ASCO/CAP HER2 guideline, J Clin Oncol 2018; atualização 2023 (HER2-low)',
  summary: 'Padrão de membrana vira 0/1+/2+/3+; nos 2+ a ISH de sonda única ou dupla entra nos grupos de 2018 e sai o status final, com HER2-low e ultralow.',
  fields: [
    {
      id: 'ihc', label: 'Padrão da imuno-histoquímica', type: 'select', default: 'weak',
      hint: 'Só marcação de membrana conta; citoplasma isolado não. Porcentagens referem-se às células invasoras.',
      options: [
        { value: 'none', label: 'Sem marcação' },
        { value: 'faint10', label: 'Membrana incompleta, fraca/quase imperceptível, em ≤10% das células' },
        { value: 'faint', label: 'Membrana incompleta, fraca/quase imperceptível, em >10% das células' },
        { value: 'weak', label: 'Membrana completa, fraca a moderada, em >10% das células' },
        { value: 'strong10', label: 'Membrana completa e intensa em ≤10% das células' },
        { value: 'strong', label: 'Membrana completa e intensa em >10% das células' },
      ],
    },
    {
      id: 'ish', label: 'Hibridização in situ (ISH)', type: 'select', default: 'dual',
      when: (v) => IHC[strOf(v.ihc)]?.score === '2+',
      options: [
        { value: 'dual', label: 'Dupla sonda (HER2/CEP17)' },
        { value: 'single', label: 'Sonda única (HER2)' },
        { value: 'none', label: 'Não realizada / pendente' },
      ],
    },
    {
      id: 'ratio', label: 'Razão HER2/CEP17', type: 'number', min: 0, default: 2.4,
      when: (v) => IHC[strOf(v.ihc)]?.score === '2+' && strOf(v.ish) === 'dual',
    },
    {
      id: 'copies', label: 'Média de cópias de HER2 por célula', type: 'number', min: 0, default: 5.2,
      hint: 'Mínimo de 20 células contadas, na área que o patologista selecionou na imuno.',
      when: (v) => IHC[strOf(v.ihc)]?.score === '2+' && strOf(v.ish) !== 'none',
    },
  ],
  compute: (v): CalculatorResult => {
    const ihc = IHC[strOf(v.ihc)]
    if (!ihc) return { report: '' }
    const warnings: string[] = []
    let status = ''
    let ishLine = ''
    let low = false

    if (ihc.score === '3+') status = 'positivo'
    else if (ihc.score === '0' || ihc.score === '1+') {
      status = 'negativo'
      low = ihc.score === '1+'
    } else {
      const mode = strOf(v.ish)
      const ratio = numOf(v.ratio)
      const copies = numOf(v.copies)
      if (mode === 'none') {
        status = 'equívoco — aguarda ISH'
      } else if (mode === 'single') {
        if (copies === null) status = 'equívoco — aguarda ISH'
        else if (copies >= 6) {
          status = 'positivo'
          ishLine = ` ISH sonda única: ${fmt(copies)} cópias/célula (≥6,0), amplificado.`
        } else if (copies >= 4) {
          status = 'equívoco'
          ishLine = ` ISH sonda única: ${fmt(copies)} cópias/célula (4,0–5,9).`
          warnings.push('Sonda única entre 4,0 e 5,9 cópias: o ASCO/CAP pede dupla sonda (ou reteste) antes de definir o status.')
        } else {
          status = 'negativo'
          low = true
          ishLine = ` ISH sonda única: ${fmt(copies)} cópias/célula (<4,0), não amplificado.`
        }
      } else if (ratio === null || copies === null) {
        status = 'equívoco — aguarda ISH'
      } else {
        const g = ratio >= 2 ? (copies >= 4 ? 1 : 2) : copies >= 6 ? 3 : copies >= 4 ? 4 : 5
        const desc = `razão ${fmt(ratio, 2)}, ${fmt(copies)} cópias/célula (grupo ${g} do ASCO/CAP 2018)`
        if (g === 1) {
          status = 'positivo'
          ishLine = ` ISH dupla sonda: ${desc}, amplificado.`
        } else if (g === 2) {
          status = 'negativo'
          low = true
          ishLine = ` ISH dupla sonda: ${desc}; com imuno 2+, resultado final negativo.`
          warnings.push('Grupo 2 (razão ≥2,0 com <4,0 cópias): com imuno 2+ é negativo; seria positivo só com imuno 3+. Recomenda-se segundo observador.')
        } else if (g === 3) {
          status = 'positivo'
          ishLine = ` ISH dupla sonda: ${desc}; com imuno 2+, resultado final positivo.`
          warnings.push('Grupo 3 (razão <2,0 com ≥6,0 cópias): positivo com imuno 2+ ou 3+ após revisão por segundo observador; seria negativo com imuno 0/1+.')
        } else if (g === 4) {
          status = 'negativo'
          low = true
          ishLine = ` ISH dupla sonda: ${desc}; com imuno 2+, resultado final negativo.`
          warnings.push('Grupo 4 (razão <2,0 com 4,0–5,9 cópias): recontar ≥20 células por segundo observador; permanece negativo com imuno 2+ (positivo só com 3+).')
        } else {
          status = 'negativo'
          low = true
          ishLine = ` ISH dupla sonda: ${desc}, não amplificado.`
        }
      }
    }

    const tags: string[] = []
    if (status === 'negativo' && low) tags.push('HER2-low')
    if (status === 'negativo' && ihc.ultralow) tags.push('HER2-ultralow')
    const qualifier = tags.length ? ` (${tags.join(', ')})` : ''
    if (ihc.ultralow) warnings.push('Marcação de membrana fraca e incompleta em ≤10% é escore 0 pelo ASCO/CAP, mas hoje se descreve como "ultralow" (HER2 0 com marcação) por relevância terapêutica.')
    if (status === 'positivo' && ihc.score === '3+') warnings.push('3+ exige membrana completa, intensa e circunferencial em >10% das células invasoras; heterogeneidade deve ser descrita.')

    return {
      tnm: [
        { k: 'Imuno', v: ihc.score },
        { k: 'HER2', v: status },
        { k: 'Low/ultralow', v: tags.length ? tags.join(' · ') : '—' },
      ],
      warnings,
      report: `HER2: ${status}${qualifier}. Imuno-histoquímica escore ${ihc.score}.${ishLine}`,
    }
  },
}

export default calculator
