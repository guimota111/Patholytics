/* ==========================================================================
   Hepatite crônica — atividade e fibrose em METAVIR e Ishak.
   Atividade METAVIR (A0–A3) sai do cruzamento de necrose em saca-bocado
   (interface) 0–3 com necrose lobular 0–2. A fibrose é descrita uma vez e
   traduzida em METAVIR F0–F4 e Ishak 0–6.
   ========================================================================== */

import type { Calculator, CalculatorResult } from '@/tools/stager/types'
import { strOf } from '@/tools/stager/types'

/** [interface][lobular] → A. */
const ACTIVITY = [
  ['A0', 'A1', 'A2'],
  ['A1', 'A1', 'A2'],
  ['A2', 'A2', 'A3'],
  ['A3', 'A3', 'A3'],
]

const FIBROSIS: Record<string, { label: string; metavir: string; ishak: string }> = {
  f0: { label: 'Sem fibrose', metavir: 'F0', ishak: '0' },
  f1a: { label: 'Expansão fibrosa de alguns espaços-porta, sem septos', metavir: 'F1', ishak: '1' },
  f1b: { label: 'Expansão fibrosa da maioria dos espaços-porta, sem septos', metavir: 'F1', ishak: '2' },
  f2: { label: 'Expansão portal com raros septos (porta-porta ou porta-centro)', metavir: 'F2', ishak: '3' },
  f3a: { label: 'Numerosos septos em ponte, sem nódulos', metavir: 'F3', ishak: '4' },
  f3b: { label: 'Septos em ponte com nódulos ocasionais (cirrose incompleta)', metavir: 'F3', ishak: '5' },
  f4: { label: 'Cirrose (nódulos delimitados por fibrose)', metavir: 'F4', ishak: '6' },
}

const calculator: Calculator = {
  id: 'hepatitis-metavir-ishak',
  name: 'Fígado — hepatite crônica (METAVIR e Ishak)',
  section: 'Fígado',
  system: 'METAVIR · Ishak',
  reference: 'Bedossa P, Poynard T. Hepatology 1996 (METAVIR); Ishak K et al. J Hepatol 1995',
  summary: 'Necrose de interface e lobular dão a atividade A0–A3; a descrição da fibrose sai em METAVIR F e Ishak ao mesmo tempo.',
  fields: [
    {
      id: 'interfaceN', label: 'Hepatite de interface (necrose em saca-bocado)', type: 'radio', default: '1',
      options: [
        { value: '0', label: '0 — ausente' },
        { value: '1', label: '1 — leve, focal' },
        { value: '2', label: '2 — moderada, em vários espaços-porta' },
        { value: '3', label: '3 — acentuada, difusa' },
      ],
    },
    {
      id: 'lobular', label: 'Necrose lobular', type: 'radio', default: '1',
      options: [
        { value: '0', label: '0 — ausente ou mínima' },
        { value: '1', label: '1 — focal (corpos acidófilos, focos isolados)' },
        { value: '2', label: '2 — acentuada (necrose confluente ou em ponte)' },
      ],
    },
    {
      id: 'fibrosis', label: 'Fibrose (tricrômico ou reticulina)', type: 'select', default: 'f2',
      hint: 'Fragmento adequado: ≥15 mm e ≥10 espaços-porta completos; abaixo disso, dizer que o estadiamento é limitado.',
      options: Object.entries(FIBROSIS).map(([value, f]) => ({ value, label: f.label })),
    },
  ],
  compute: (v): CalculatorResult => {
    const i = Number(strOf(v.interfaceN))
    const l = Number(strOf(v.lobular))
    const a = ACTIVITY[i][l]
    const f = FIBROSIS[strOf(v.fibrosis)]
    if (!f) return { report: '' }
    const warnings: string[] = []
    if (f.metavir === 'F3' || f.metavir === 'F4') warnings.push('Fibrose avançada: procurar sinais de hipertensão portal e lesões precursoras; em cirrose, descrever a atividade e o padrão (micro/macronodular).')
    warnings.push('Os escores foram desenhados para hepatites virais; em hepatite autoimune, colestáticas e esteato-hepatite descrevem, mas o sistema de eleição é outro (MASLD tem calculadora própria).')
    return {
      tnm: [
        { k: 'METAVIR', v: `${a} ${f.metavir}` },
        { k: 'Ishak fibrose', v: `${f.ishak}/6` },
      ],
      warnings,
      report: `Hepatite crônica com atividade ${a} e fibrose ${f.metavir} (METAVIR); fibrose ${f.ishak}/6 pelo escore de Ishak — ${f.label.toLowerCase()}.`,
    }
  },
}

export default calculator
