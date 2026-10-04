/* ==========================================================================
   OLGA e OLGIM — estadiamento da gastrite atrófica (Sydney atualizado).
   Escore de atrofia (OLGA) ou de metaplasia intestinal (OLGIM) no antro e no
   corpo, 0–3 cada, cruzados na tabela de estádios 0–IV. Estádios III e IV
   são os de alto risco para adenocarcinoma e indicam vigilância.
   ========================================================================== */

import type { Calculator, CalculatorResult } from '@/tools/stager/types'
import { strOf } from '@/tools/stager/types'

/** [corpo][antro] → estádio. */
const TABLE = [
  ['0', 'I', 'II', 'II'],
  ['I', 'I', 'II', 'III'],
  ['II', 'II', 'III', 'IV'],
  ['III', 'III', 'IV', 'IV'],
]

const SCORE = [
  { value: '0', label: '0 — ausente' },
  { value: '1', label: '1 — leve (1–30% das glândulas)' },
  { value: '2', label: '2 — moderada (31–60%)' },
  { value: '3', label: '3 — acentuada (>60%)' },
]

const calculator: Calculator = {
  id: 'olga-olgim',
  name: 'Estômago — OLGA e OLGIM',
  section: 'Tubo digestivo',
  system: 'OLGA · OLGIM',
  reference: 'Rugge M et al. Gut 2007 e Dig Liver Dis 2008; Capelle LG et al. Gastrointest Endosc 2010; MAPS II (Endoscopy 2019)',
  summary: 'Escore de atrofia ou de metaplasia intestinal no antro (com incisura) e no corpo, 0 a 3, cruzados na tabela de estádio 0 a IV.',
  fields: [
    {
      id: 'system', label: 'Sistema', type: 'radio', default: 'olga',
      options: [
        { value: 'olga', label: 'OLGA — atrofia (perda glandular, com ou sem metaplasia)' },
        { value: 'olgim', label: 'OLGIM — só metaplasia intestinal' },
      ],
    },
    {
      id: 'antrum', label: 'Antro (incluindo incisura) — escore médio dos fragmentos', type: 'radio', default: '2',
      hint: 'Protocolo de Sydney: 2 fragmentos de antro + 1 de incisura formam o compartimento antral; 2 de corpo formam o oxíntico.',
      options: SCORE,
    },
    { id: 'corpus', label: 'Corpo — escore médio dos fragmentos', type: 'radio', default: '1', options: SCORE },
    {
      id: 'hp', label: 'Helicobacter pylori', type: 'radio', default: 'neg',
      options: [
        { value: 'neg', label: 'Ausente' },
        { value: 'pos', label: 'Presente' },
      ],
    },
  ],
  compute: (v): CalculatorResult => {
    const antrum = Number(strOf(v.antrum))
    const corpus = Number(strOf(v.corpus))
    const stage = TABLE[corpus][antrum]
    const name = strOf(v.system) === 'olga' ? 'OLGA' : 'OLGIM'
    const warnings: string[] = []
    if (stage === 'III' || stage === 'IV') warnings.push(`${name} ${stage} é estádio de alto risco: as diretrizes (MAPS II) sugerem vigilância endoscópica a cada 3 anos, ou menos com história familiar.`)
    if (corpus >= 2 && antrum === 0) warnings.push('Atrofia restrita ao corpo com antro poupado lembra gastrite atrófica autoimune: correlacionar com hiperplasia de células ECL, anticorpos anti-célula parietal e gastrina.')
    if (strOf(v.hp) === 'pos') warnings.push('H. pylori presente: o estádio pode regredir após erradicação; reestadiar na biópsia de controle.')
    return {
      tnm: [
        { k: name, v: `estádio ${stage}` },
        { k: 'Antro', v: String(antrum) },
        { k: 'Corpo', v: String(corpus) },
      ],
      warnings,
      report: `${name}: estádio ${stage} (antro ${antrum}, corpo ${corpus}). Helicobacter pylori: ${strOf(v.hp) === 'pos' ? 'presente' : 'ausente'}.`,
    }
  },
}

export default calculator
