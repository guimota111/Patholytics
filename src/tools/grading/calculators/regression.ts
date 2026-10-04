/* ==========================================================================
   Regressão tumoral pós-neoadjuvância — a mesma descrição do tumor residual
   traduzida nos sistemas em uso: CAP/Ryan modificado (0–3), Mandard (TRG 1–5),
   Becker (1a–3) e Dworak (0–4, reto).
   ========================================================================== */

import type { Calculator, CalculatorResult } from '@/tools/stager/types'
import { strOf } from '@/tools/stager/types'

const calculator: Calculator = {
  id: 'tumor-regression',
  name: 'Regressão tumoral — CAP, Mandard, Becker e Dworak',
  section: 'Tubo digestivo',
  system: 'CAP/Ryan · Mandard · Becker · Dworak',
  reference: 'Ryan R et al. Histopathology 2005; Mandard AM et al. Cancer 1994; Becker K et al. Cancer 2003; Dworak O et al. Int J Colorectal Dis 1997; CAP protocols',
  summary: 'Descreva o que sobrou de tumor viável em relação à fibrose: a calculadora devolve o grau em cada sistema, com a linha do laudo.',
  fields: [
    {
      id: 'residual', label: 'Tumor residual viável no leito tumoral', type: 'radio', default: 'near',
      hint: 'Lagos de mucina acelular e fibrose não contam como tumor. Avaliar todo o leito, com cortes adicionais quando não há tumor no primeiro exame.',
      options: [
        { value: 'complete', label: 'Nenhuma célula tumoral viável' },
        { value: 'near', label: 'Células isoladas ou raros grupos pequenos' },
        { value: 'partial', label: 'Tumor residual com regressão evidente (fibrose predomina)' },
        { value: 'poor', label: 'Tumor residual extenso, com pouca ou nenhuma regressão' },
      ],
    },
    {
      id: 'fibrosis', label: 'Há alguma fibrose/regressão, mesmo que mínima?', type: 'radio', default: 'yes',
      when: (v) => strOf(v.residual) === 'poor',
      options: [
        { value: 'yes', label: 'Sim — tumor ultrapassa a fibrose' },
        { value: 'no', label: 'Não — sem sinais de regressão' },
      ],
    },
    {
      id: 'nodes', label: 'Linfonodos: regressão sem tumor viável?', type: 'radio', default: 'na',
      options: [
        { value: 'na', label: 'Não avaliado / sem linfonodos com fibrose' },
        { value: 'yes', label: 'Sim — fibrose ou mucina acelular nodal sem tumor viável' },
        { value: 'viable', label: 'Tumor viável em linfonodo' },
      ],
    },
  ],
  compute: (v): CalculatorResult => {
    const r = strOf(v.residual)
    const warnings: string[] = []
    let cap = ''
    let capLabel = ''
    let mandard = ''
    let becker = ''
    let dworak = ''
    if (r === 'complete') {
      cap = '0'
      capLabel = 'resposta completa'
      mandard = 'TRG 1'
      becker = '1a'
      dworak = '4'
    } else if (r === 'near') {
      cap = '1'
      capLabel = 'resposta quase completa'
      mandard = 'TRG 2'
      becker = '1b (<10% de tumor residual)'
      dworak = '3'
    } else if (r === 'partial') {
      cap = '2'
      capLabel = 'resposta parcial'
      mandard = 'TRG 3'
      becker = '2 (10–50% de tumor residual)'
      dworak = '2'
    } else {
      cap = '3'
      capLabel = 'resposta pobre ou ausente'
      const fib = strOf(v.fibrosis) === 'yes'
      mandard = fib ? 'TRG 4' : 'TRG 5'
      becker = '3 (>50% de tumor residual)'
      dworak = fib ? '1' : '0'
    }
    if (r === 'complete' && strOf(v.nodes) === 'viable') {
      warnings.push('Tumor viável em linfonodo: o sítio primário é ypT0, mas a resposta patológica não é completa (ypN+). O CAP gradua a regressão pelo primário e o pN separadamente.')
    }
    if (strOf(v.nodes) === 'yes') warnings.push('Linfonodo com fibrose ou mucina acelular sem célula viável conta como negativo (ypN0), mas vale descrever a regressão nodal.')
    warnings.push('Ryan modificado é o sistema do CAP para esôfago, estômago, reto e pâncreas. Becker vale para gástrico; Dworak e Mandard são de origem retal e esofágica, respectivamente.')
    return {
      tnm: [
        { k: 'CAP / Ryan', v: cap },
        { k: 'Mandard', v: mandard },
        { k: 'Becker', v: becker.split(' ')[0] },
        { k: 'Dworak', v: dworak },
      ],
      warnings,
      report: `Grau de regressão tumoral: ${cap} (${capLabel}) pelo sistema de Ryan modificado/CAP; Mandard ${mandard}; Becker ${becker}; Dworak ${dworak}.`,
    }
  },
}

export default calculator
