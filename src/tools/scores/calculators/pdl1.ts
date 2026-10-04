/* ==========================================================================
   PD-L1 — TPS, CPS e escore de células imunes (IC), com o corte da indicação.
   TPS = células tumorais PD-L1+ / células tumorais viáveis × 100.
   CPS = (células tumorais PD-L1+ + linfócitos e macrófagos PD-L1+) / células
   tumorais viáveis × 100, truncado em 100. IC = % da área tumoral ocupada por
   células imunes PD-L1+. Mínimo de 100 células tumorais viáveis.
   Os cortes são os dos ensaios que embasaram cada aprovação; confira a bula
   vigente e o clone do seu laboratório.
   ========================================================================== */

import type { Calculator, CalculatorResult } from '@/tools/stager/types'
import { numOf, strOf } from '@/tools/stager/types'
import { fmt } from '@/tools/suites/types'

type Method = 'TPS' | 'CPS' | 'IC'

interface Indication {
  label: string
  method: Method
  clone: string
  cutoffs: { value: number; note: string }[]
}

const INDICATIONS: Record<string, Indication> = {
  nsclc_22c3: { label: 'Pulmão não pequenas células (22C3)', method: 'TPS', clone: '22C3', cutoffs: [{ value: 1, note: '≥1%: pembrolizumabe em 1ª linha com quimio ou monoterapia em 2ª linha' }, { value: 50, note: '≥50%: pembrolizumabe em monoterapia de 1ª linha' }] },
  nsclc_sp263: { label: 'Pulmão não pequenas células (SP263)', method: 'TPS', clone: 'SP263', cutoffs: [{ value: 1, note: '≥1%: atezolizumabe adjuvante (estádios II–IIIA)' }, { value: 50, note: '≥50%: monoterapia de 1ª linha' }] },
  gastric_22c3: { label: 'Gástrico e junção esofagogástrica (22C3)', method: 'CPS', clone: '22C3', cutoffs: [{ value: 1, note: 'CPS ≥1: pembrolizumabe com quimio em 1ª linha (aprovação original)' }, { value: 5, note: 'CPS ≥5: nivolumabe com quimio em 1ª linha' }, { value: 10, note: 'CPS ≥10: maior benefício em várias análises' }] },
  esophageal_22c3: { label: 'Esôfago, carcinoma escamoso (22C3)', method: 'CPS', clone: '22C3', cutoffs: [{ value: 10, note: 'CPS ≥10: pembrolizumabe com quimio em 1ª linha' }] },
  hnscc_22c3: { label: 'Cabeça e pescoço, carcinoma escamoso (22C3)', method: 'CPS', clone: '22C3', cutoffs: [{ value: 1, note: 'CPS ≥1: pembrolizumabe com quimio ou em monoterapia' }, { value: 20, note: 'CPS ≥20: maior benefício da monoterapia' }] },
  cervix_22c3: { label: 'Colo uterino (22C3)', method: 'CPS', clone: '22C3', cutoffs: [{ value: 1, note: 'CPS ≥1: pembrolizumabe' }] },
  tnbc_22c3: { label: 'Mama triplo-negativa (22C3)', method: 'CPS', clone: '22C3', cutoffs: [{ value: 10, note: 'CPS ≥10: pembrolizumabe com quimio na doença avançada' }] },
  tnbc_sp142: { label: 'Mama triplo-negativa (SP142)', method: 'IC', clone: 'SP142', cutoffs: [{ value: 1, note: 'IC ≥1%: atezolizumabe com nab-paclitaxel' }] },
  urothelial_22c3: { label: 'Urotelial (22C3)', method: 'CPS', clone: '22C3', cutoffs: [{ value: 10, note: 'CPS ≥10: pembrolizumabe em 1ª linha em inelegíveis à cisplatina' }] },
  urothelial_sp142: { label: 'Urotelial (SP142)', method: 'IC', clone: 'SP142', cutoffs: [{ value: 5, note: 'IC ≥5%: atezolizumabe em 1ª linha em inelegíveis à cisplatina' }] },
  other_tps: { label: 'Outro — informar TPS', method: 'TPS', clone: '—', cutoffs: [] },
  other_cps: { label: 'Outro — informar CPS', method: 'CPS', clone: '—', cutoffs: [] },
}

const method = (v: Record<string, unknown>) => INDICATIONS[strOf(v.indication as string)]?.method

const calculator: Calculator = {
  id: 'pd-l1',
  name: 'PD-L1 — TPS, CPS e IC',
  section: 'Imunoterapia',
  system: 'TPS · CPS · IC',
  reference: 'Guias de interpretação PD-L1 IHC 22C3 pharmDx (Agilent), SP263 e SP142 (Ventana); bulas vigentes',
  summary: 'Contagens de células tumorais e imunes PD-L1 positivas viram TPS, CPS ou IC, comparados ao corte da indicação escolhida.',
  fields: [
    {
      id: 'indication', label: 'Indicação e clone', type: 'select', default: 'nsclc_22c3',
      options: Object.entries(INDICATIONS).map(([value, ind]) => ({ value, label: ind.label })),
    },
    {
      id: 'tumorTotal', label: 'Células tumorais viáveis avaliadas', type: 'number', min: 0, default: 500,
      hint: 'Mínimo de 100 células tumorais viáveis para o resultado valer. Exclua necrose, carcinoma in situ e células normais.',
      when: (v) => method(v) !== 'IC',
    },
    {
      id: 'tumorPos', label: 'Células tumorais com marcação de membrana (parcial ou completa)', type: 'number', min: 0, default: 120,
      hint: 'Qualquer intensidade. Marcação só citoplasmática não conta.',
      when: (v) => method(v) !== 'IC',
    },
    {
      id: 'immunePos', label: 'Linfócitos e macrófagos PD-L1+ (dentro do tumor e no estroma associado)', type: 'number', min: 0, default: 40,
      hint: 'Só células imunes mononucleares diretamente associadas à resposta ao tumor; neutrófilos e plasmócitos não entram.',
      when: (v) => method(v) === 'CPS',
    },
    {
      id: 'icArea', label: 'Área tumoral ocupada por células imunes PD-L1+, %', type: 'number', min: 0, max: 100, default: 2,
      hint: 'Área do tumor (células tumorais + estroma intratumoral e peritumoral contíguo) coberta por células imunes marcadas.',
      when: (v) => method(v) === 'IC',
    },
  ],
  compute: (v): CalculatorResult => {
    const ind = INDICATIONS[strOf(v.indication)]
    if (!ind) return { report: '' }
    const warnings: string[] = []
    let score: number | null = null
    let label = ''

    if (ind.method === 'IC') {
      score = numOf(v.icArea)
      label = 'IC'
    } else {
      const total = numOf(v.tumorTotal)
      const pos = numOf(v.tumorPos) ?? 0
      const imm = numOf(v.immunePos) ?? 0
      if (total === null || total <= 0) return { report: '', warnings: ['Informe o número de células tumorais viáveis avaliadas.'] }
      if (total < 100) warnings.push(`Só ${total} células tumorais viáveis: abaixo de 100 a amostra é inadequada para PD-L1.`)
      if (pos > total) warnings.push('Há mais células tumorais positivas do que células tumorais avaliadas.')
      if (ind.method === 'TPS') {
        score = (pos / total) * 100
        label = 'TPS'
      } else {
        score = Math.min(100, ((pos + imm) / total) * 100)
        label = 'CPS'
      }
    }
    if (score === null) return { report: '' }

    const shown = ind.method === 'CPS' ? String(Math.round(score)) : `${fmt(score)}%`
    const reached = ind.cutoffs.filter((c) => score! >= c.value)
    const best = reached[reached.length - 1]
    const verdict = ind.cutoffs.length === 0 ? '—' : best ? `≥${best.value}${ind.method === 'CPS' ? '' : '%'}` : `<${ind.cutoffs[0].value}${ind.method === 'CPS' ? '' : '%'}`
    for (const c of ind.cutoffs) warnings.push(`${score >= c.value ? '✓' : '✗'} ${c.note}.`)
    if (ind.method === 'TPS' && score >= 1 && score < 50) warnings.push('TPS entre 1% e 49% é "expressão baixa"; ≥50% é "expressão alta".')

    const cloneText = ind.clone === '—' ? '' : ` (clone ${ind.clone})`
    return {
      tnm: [
        { k: label, v: shown },
        { k: 'Corte', v: verdict },
        { k: 'Clone', v: ind.clone },
      ],
      warnings,
      report: `PD-L1${cloneText}: ${label} ${shown}${ind.cutoffs.length ? ` (${best ? 'atinge' : 'não atinge'} o corte de ${ind.cutoffs[0].value}${ind.method === 'CPS' ? '' : '%'}${best && best.value !== ind.cutoffs[0].value ? `; atinge ${best.value}${ind.method === 'CPS' ? '' : '%'}` : ''})` : ''}.`,
    }
  },
}

export default calculator
