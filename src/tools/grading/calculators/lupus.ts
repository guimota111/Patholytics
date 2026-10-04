/* ==========================================================================
   Nefrite lúpica — classe ISN/RPS 2003 com a revisão de 2018 (Bajema), que
   substituiu os modificadores A/C e IV-S/IV-G pelos índices de atividade
   (0–24) e cronicidade (0–12) do NIH modificado.
   ========================================================================== */

import type { Calculator, CalculatorResult } from '@/tools/stager/types'
import { strOf } from '@/tools/stager/types'

const s03 = (labels: string[]) => labels.map((label, value) => ({ value: String(value), label: `${value} — ${label}` }))
const PCT = s03(['ausente', '<25% dos glomérulos', '25–50%', '>50%'])

const CLASSES: Record<string, { name: string; text: string }> = {
  I: { name: 'Classe I', text: 'nefrite lúpica mesangial mínima: glomérulos normais à microscopia óptica, com depósitos imunes mesangiais' },
  II: { name: 'Classe II', text: 'nefrite lúpica mesangial proliferativa: hipercelularidade mesangial pura com depósitos mesangiais' },
  III: { name: 'Classe III', text: 'nefrite lúpica focal: lesões endocapilares ou extracapilares, ativas ou crônicas, em <50% dos glomérulos' },
  IV: { name: 'Classe IV', text: 'nefrite lúpica difusa: lesões endocapilares ou extracapilares, ativas ou crônicas, em ≥50% dos glomérulos' },
  V: { name: 'Classe V', text: 'nefrite lúpica membranosa: depósitos subepiteliais globais ou segmentares' },
  VI: { name: 'Classe VI', text: 'nefrite lúpica esclerosante avançada: ≥90% dos glomérulos globalmente esclerosados sem atividade residual' },
}

const calculator: Calculator = {
  id: 'lupus-isn-rps',
  name: 'Nefrite lúpica — ISN/RPS e índices NIH',
  section: 'Nefropatologia e transplante',
  system: 'ISN/RPS 2003 · revisão 2018',
  reference: 'Weening JJ et al. Kidney Int 2004; Bajema IM et al. Kidney Int 2018',
  summary: 'Descrição do padrão dá a classe I a VI; as lesões ativas e crônicas somam os índices de atividade (0–24) e cronicidade (0–12).',
  fields: [
    {
      id: 'cls', label: 'Padrão predominante', type: 'select', default: 'IV',
      options: [
        { value: 'I', label: 'Glomérulos normais à MO, só depósitos mesangiais (IF/ME)' },
        { value: 'II', label: 'Hipercelularidade mesangial pura' },
        { value: 'III', label: 'Lesões endocapilares/extracapilares em <50% dos glomérulos' },
        { value: 'IV', label: 'Lesões endocapilares/extracapilares em ≥50% dos glomérulos' },
        { value: 'V', label: 'Depósitos subepiteliais (membranosa) sem proliferação' },
        { value: 'VI', label: '≥90% dos glomérulos globalmente esclerosados, sem atividade' },
      ],
    },
    {
      id: 'plusV', label: 'Componente membranoso associado (depósitos subepiteliais em ≥50% da alça em ≥50% dos glomérulos)?', type: 'radio', default: 'no',
      when: (v) => strOf(v.cls) === 'III' || strOf(v.cls) === 'IV',
      options: [
        { value: 'no', label: 'Não' },
        { value: 'yes', label: 'Sim (III + V ou IV + V)' },
      ],
    },
    { id: 'endo', label: 'Atividade: hipercelularidade endocapilar', type: 'radio', default: '2', options: PCT },
    { id: 'neut', label: 'Atividade: neutrófilos / cariorrexe', type: 'radio', default: '1', options: PCT },
    { id: 'necrosis', label: 'Atividade: necrose fibrinoide (peso 2)', type: 'radio', default: '0', options: PCT },
    { id: 'hyaline', label: 'Atividade: depósitos hialinos (wire loops / trombos hialinos)', type: 'radio', default: '1', options: PCT },
    { id: 'crescents', label: 'Atividade: crescentes celulares ou fibrocelulares (peso 2)', type: 'radio', default: '0', options: PCT },
    { id: 'interstitial', label: 'Atividade: inflamação intersticial', type: 'radio', default: '1', options: s03(['ausente', '<25% do córtex', '25–50%', '>50%']) },
    { id: 'sclerosis', label: 'Cronicidade: glomeruloesclerose global', type: 'radio', default: '0', options: PCT },
    { id: 'fibcrescents', label: 'Cronicidade: crescentes fibrosos', type: 'radio', default: '0', options: PCT },
    { id: 'atrophy', label: 'Cronicidade: atrofia tubular', type: 'radio', default: '0', options: s03(['ausente', '<25% do córtex', '25–50%', '>50%']) },
    { id: 'fibrosis', label: 'Cronicidade: fibrose intersticial', type: 'radio', default: '0', options: s03(['ausente', '<25% do córtex', '25–50%', '>50%']) },
  ],
  compute: (v): CalculatorResult => {
    const n = (k: string) => Number(strOf(v[k]))
    const cls = strOf(v.cls)
    const info = CLASSES[cls]
    if (!info) return { report: '' }
    const activity = n('endo') + n('neut') + 2 * n('necrosis') + n('hyaline') + 2 * n('crescents') + n('interstitial')
    const chronicity = n('sclerosis') + n('fibcrescents') + n('atrophy') + n('fibrosis')
    const plusV = (cls === 'III' || cls === 'IV') && strOf(v.plusV) === 'yes'
    const className = plusV ? `${info.name} + V` : info.name
    const warnings: string[] = []
    if ((cls === 'I' || cls === 'II' || cls === 'V') && activity > 0) warnings.push('Lesões ativas (endocapilares, crescentes, necrose) não cabem nas classes I, II ou V puras: reveja a classe.')
    if (cls === 'III' || cls === 'IV') warnings.push('A revisão de 2018 aboliu os subtipos IV-S/IV-G e os modificadores (A), (A/C) e (C): use os índices de atividade e cronicidade no lugar.')
    warnings.push('Relatar também podocitopatia lúpica, microangiopatia trombótica e lesões vasculares, que ficam fora da classe.')
    return {
      tnm: [
        { k: 'Classe', v: className },
        { k: 'Atividade', v: `${activity}/24` },
        { k: 'Cronicidade', v: `${chronicity}/12` },
      ],
      warnings,
      report: `Nefrite lúpica ${className} (ISN/RPS 2003, revisão 2018) — ${info.text}${plusV ? ', com componente membranoso associado' : ''}. Índice de atividade NIH modificado: ${activity}/24; índice de cronicidade: ${chronicity}/12.`,
    }
  },
}

export default calculator
