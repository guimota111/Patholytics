/* ==========================================================================
   FNCLCC — grau dos sarcomas de partes moles (Trojani/Coindre).
   Diferenciação (1–3) + mitoses (1–3) + necrose (0–2); total 2–3 = G1,
   4–5 = G2, 6–8 = G3. A contagem mitótica original é por 10 campos de
   0,1734 mm² (1,734 mm²); reescalada aqui pelo diâmetro do campo.
   ========================================================================== */

import type { Calculator, CalculatorResult } from '@/tools/stager/types'
import { numOf, strOf } from '@/tools/stager/types'
import { fmt } from '@/tools/suites/types'

const REF_AREA = 1.734

const calculator: Calculator = {
  id: 'fnclcc',
  name: 'Partes moles — grau FNCLCC',
  section: 'Partes moles e osso',
  system: 'FNCLCC · WHO 2020',
  reference: 'Trojani M et al. Int J Cancer 1984; Coindre JM. Arch Pathol Lab Med 2006; WHO Soft Tissue and Bone Tumours 5ª ed.',
  summary: 'Escore de diferenciação por histotipo, mitoses por 10 campos (reescaladas ao campo de referência) e necrose somam o grau 1, 2 ou 3.',
  fields: [
    {
      id: 'diff', label: 'Escore de diferenciação (pelo histotipo)', type: 'radio', default: '2',
      hint: '1: sarcomas que lembram o tecido adulto (lipossarcoma bem diferenciado, leiomiossarcoma bem diferenciado). 2: histotipo definido (lipossarcoma mixoide, leiomiossarcoma convencional, mixofibrossarcoma). 3: sarcomas embrionários, indiferenciados, sinovial, Ewing, rabdomiossarcoma, epitelioide, células claras, desdiferenciado. Tabela completa no WHO.',
      options: [
        { value: '1', label: '1' },
        { value: '2', label: '2' },
        { value: '3', label: '3' },
      ],
    },
    { id: 'count', label: 'Mitoses em 10 campos de grande aumento (área mais ativa)', type: 'number', min: 0, default: 12 },
    {
      id: 'diameter', label: 'Diâmetro do campo de 40×, mm', type: 'number', min: 0.1, max: 1, default: 0.47,
      hint: 'O campo de referência do FNCLCC tem 0,1734 mm² (≈0,47 mm de diâmetro). Se o seu é maior, a contagem é reduzida proporcionalmente.',
    },
    {
      id: 'necrosis', label: 'Necrose tumoral', type: 'radio', default: '1',
      options: [
        { value: '0', label: '0 — ausente' },
        { value: '1', label: '1 — menos de 50% do tumor' },
        { value: '2', label: '2 — 50% ou mais' },
      ],
    },
  ],
  compute: (v): CalculatorResult => {
    const diff = Number(strOf(v.diff))
    const necrosis = Number(strOf(v.necrosis))
    const count = numOf(v.count)
    const d = numOf(v.diameter)
    if (count === null || d === null || d <= 0) return { report: '' }
    const area10 = 10 * Math.PI * (d / 2) ** 2
    const adjusted = (count * REF_AREA) / area10
    const mit = adjusted < 10 ? 1 : adjusted < 20 ? 2 : 3
    const total = diff + mit + necrosis
    const grade = total <= 3 ? 1 : total <= 5 ? 2 : 3
    const warnings: string[] = []
    if (Math.abs(area10 - REF_AREA) / REF_AREA > 0.05) {
      warnings.push(`Seus 10 campos cobrem ${fmt(area10, 2)} mm²; as ${count} mitoses equivalem a ${fmt(adjusted)} por 1,734 mm² (referência do FNCLCC: 0–9 = 1, 10–19 = 2, ≥20 = 3).`)
    }
    warnings.push('O grau não se aplica (ou tem valor limitado) a: tumor desmoide, DFSP, angiossarcoma, MPNST de baixo grau, sarcoma epitelioide, células claras e alveolar, que são graduados pelo histotipo. Grau em amostra pós-tratamento ou em biópsia pequena pode subestimar.')
    return {
      tnm: [
        { k: 'Grau', v: `G${grade}` },
        { k: 'Escore', v: `${total}/8` },
        { k: 'Dif.', v: String(diff) },
        { k: 'Mitoses', v: String(mit) },
        { k: 'Necrose', v: String(necrosis) },
        { k: 'Mit./1,7 mm²', v: fmt(adjusted) },
      ],
      warnings,
      report: `Grau histológico FNCLCC: ${grade} de 3 (escore ${total}/8 — diferenciação ${diff}, mitoses ${mit} [${count}/10 campos de ${fmt(d, 2)} mm], necrose ${necrosis}).`,
    }
  },
}

export default calculator
