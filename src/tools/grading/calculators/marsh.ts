/* ==========================================================================
   Doença celíaca — Marsh–Oberhuber e Corazza–Villanacci.
   Linfócitos intraepiteliais (≥25 por 100 enterócitos), hiperplasia de
   criptas e atrofia vilositária definem Marsh 0, 1, 2, 3a/3b/3c; Corazza
   simplifica em A (não atrófico) e B1/B2 (atrófico).
   ========================================================================== */

import type { Calculator, CalculatorResult } from '@/tools/stager/types'
import { numOf, strOf } from '@/tools/stager/types'

const calculator: Calculator = {
  id: 'marsh',
  name: 'Duodeno — Marsh–Oberhuber e Corazza',
  section: 'Tubo digestivo',
  system: 'Marsh–Oberhuber · Corazza–Villanacci',
  reference: 'Oberhuber G et al. Eur J Gastroenterol Hepatol 1999; Corazza GR, Villanacci V. J Clin Pathol 2005; ESPGHAN 2020',
  summary: 'Contagem de linfócitos intraepiteliais, hiperplasia de criptas e grau de atrofia vilositária dão a classe de Marsh e a de Corazza.',
  fields: [
    {
      id: 'iel', label: 'Linfócitos intraepiteliais por 100 enterócitos', type: 'number', min: 0, default: 40,
      hint: 'Contar na ponta das vilosidades, em cortes bem orientados; ≥25 é aumentado (alguns serviços usam 30). CD3 ajuda quando a contagem está no limite.',
    },
    {
      id: 'crypts', label: 'Hiperplasia de criptas', type: 'radio', default: 'yes',
      options: [
        { value: 'no', label: 'Ausente' },
        { value: 'yes', label: 'Presente (criptas alongadas, mitoses aumentadas)' },
      ],
    },
    {
      id: 'atrophy', label: 'Atrofia vilositária', type: 'radio', default: 'partial',
      hint: 'Só em cortes orientados: pelo menos 3–4 vilosidades adjacentes bem cortadas. Relação vilosidade:cripta normal ≥3:1.',
      options: [
        { value: 'none', label: 'Ausente (relação vilosidade:cripta ≥3:1)' },
        { value: 'partial', label: 'Parcial (vilosidades encurtadas, ainda reconhecíveis)' },
        { value: 'subtotal', label: 'Subtotal (vilosidades rudimentares)' },
        { value: 'total', label: 'Total (mucosa plana)' },
      ],
    },
  ],
  compute: (v): CalculatorResult => {
    const iel = numOf(v.iel)
    if (iel === null) return { report: '' }
    const raised = iel >= 25
    const crypts = strOf(v.crypts) === 'yes'
    const atrophy = strOf(v.atrophy)
    const warnings: string[] = []
    let marsh = ''
    let corazza = ''
    if (atrophy === 'none') {
      if (!raised) {
        marsh = '0'
        corazza = 'normal'
      } else if (!crypts) {
        marsh = '1'
        corazza = 'A'
      } else {
        marsh = '2'
        corazza = 'A'
      }
    } else {
      marsh = atrophy === 'partial' ? '3a' : atrophy === 'subtotal' ? '3b' : '3c'
      corazza = atrophy === 'total' ? 'B2' : 'B1'
      if (!raised) warnings.push('Atrofia vilositária sem aumento de linfócitos intraepiteliais é atípica para doença celíaca: considerar má orientação, enteropatia por medicamento (olmesartana), imunodeficiência, giardíase, enteropatia autoimune, doença de Crohn.')
    }
    if (marsh === '1') warnings.push('Linfocitose intraepitelial com arquitetura preservada é inespecífica (H. pylori, AINEs, doenças autoimunes, celíaca em fase inicial): a sorologia decide.')
    if (marsh !== '0') warnings.push('O diagnóstico é clinicopatológico: correlacionar com anti-transglutaminase IgA e, quando pedido, HLA-DQ2/DQ8 e dieta. Pacientes já sem glúten podem ter biópsia normal.')
    return {
      tnm: [
        { k: 'Marsh', v: marsh },
        { k: 'Corazza', v: corazza },
        { k: 'LIE', v: `${iel}/100` },
      ],
      warnings,
      report: `Classificação de Marsh–Oberhuber: ${marsh}${marsh === '0' ? ' (mucosa sem alterações)' : ''} — linfócitos intraepiteliais ${iel}/100 enterócitos${crypts ? ', hiperplasia de criptas' : ''}${atrophy !== 'none' ? `, atrofia vilositária ${atrophy === 'partial' ? 'parcial' : atrophy === 'subtotal' ? 'subtotal' : 'total'}` : ''}. Corazza–Villanacci: ${corazza}.`,
    }
  },
}

export default calculator
