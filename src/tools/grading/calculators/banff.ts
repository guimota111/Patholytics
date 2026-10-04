/* ==========================================================================
   Banff — rejeição do enxerto renal. Das lesões elementares (i, t, v, g, ptc,
   C4d) saem a categoria de rejeição celular (borderline, IA, IB, IIA, IIB,
   III) pelas regras de 2019 e o quanto dos critérios histológicos de rejeição
   mediada por anticorpos está presente. A RMA exige DSA (ou substituto
   molecular), que o laudo histológico não tem: aqui só se diz o que a lâmina
   preenche.
   ========================================================================== */

import type { Calculator, CalculatorResult } from '@/tools/stager/types'
import { strOf } from '@/tools/stager/types'

const opt = (labels: string[]) => labels.map((label, value) => ({ value: String(value), label: `${value} — ${label}` }))

const calculator: Calculator = {
  id: 'banff-kidney',
  name: 'Transplante renal — Banff (rejeição)',
  section: 'Nefropatologia e transplante',
  system: 'Banff 2019/2022',
  reference: 'Loupy A et al. Am J Transplant 2020 (Banff 2019); Naesens M et al. Am J Transplant 2024 (Banff 2022); Roufosse C et al. Transplantation 2018 (referência das lesões)',
  summary: 'Escores i, t, v, g, ptc e C4d viram a categoria de rejeição celular e a lista do que falta para rejeição por anticorpos.',
  fields: [
    { id: 'i', label: 'i — inflamação intersticial (córtex não fibrosado)', type: 'radio', default: '2', options: opt(['<10%', '10–25%', '26–50%', '>50%']) },
    { id: 't', label: 't — tubulite (células por corte de túbulo)', type: 'radio', default: '2', options: opt(['nenhuma', '1–4 células', '5–10 células', '>10 células ou destruição da membrana basal']) },
    { id: 'v', label: 'v — arterite intimal', type: 'radio', default: '0', options: opt(['ausente', 'leve a moderada em ≥1 artéria', 'grave (>25% da luz)', 'transmural / necrose fibrinoide']) },
    { id: 'g', label: 'g — glomerulite', type: 'radio', default: '0', options: opt(['ausente', 'segmentar ou global em <25% dos glomérulos', '25–75%', '>75%']) },
    { id: 'ptc', label: 'ptc — capilarite peritubular', type: 'radio', default: '0', options: opt(['<10% dos capilares com células', '≥1 célula em ≥10%; máximo 3–4 células', 'máximo 5–10 células', 'máximo >10 células']) },
    { id: 'c4d', label: 'C4d em capilares peritubulares', type: 'radio', default: '0', options: opt(['negativo', 'mínimo (<10%; IF <10% / IHQ 1–9%)', 'focal (10–50%)', 'difuso (>50%)']) },
    {
      id: 'ifta', label: 'Inflamação em áreas de fibrose (i-IFTA) com tubulite (t-IFTA) moderadas ou mais?', type: 'radio', default: 'no',
      options: [
        { value: 'no', label: 'Não' },
        { value: 'yes', label: 'Sim (i-IFTA ≥2 com t-IFTA ≥2)' },
      ],
    },
  ],
  compute: (v): CalculatorResult => {
    const n = (k: string) => Number(strOf(v[k]))
    const i = n('i'), t = n('t'), vv = n('v'), g = n('g'), ptc = n('ptc'), c4d = n('c4d')
    const warnings: string[] = []

    let tcmr = 'sem evidência de rejeição celular aguda'
    if (vv === 3) tcmr = 'rejeição celular aguda grau III'
    else if (vv === 2) tcmr = 'rejeição celular aguda grau IIB'
    else if (vv === 1) tcmr = 'rejeição celular aguda grau IIA'
    else if (i >= 2 && t === 3) tcmr = 'rejeição celular aguda grau IB'
    else if (i >= 2 && t === 2) tcmr = 'rejeição celular aguda grau IA'
    else if ((t >= 1 && i === 1) || (t === 1 && i >= 2)) tcmr = 'borderline (suspeito de rejeição celular)'
    else if (t >= 1 && i === 0) warnings.push('Tubulite com i0 não é mais "borderline" desde Banff 2019: precisa de pelo menos i1.')
    if (strOf(v.ifta) === 'yes') warnings.push('i-IFTA ≥2 com t-IFTA ≥2 (e inflamação total ti ≥2) define rejeição celular crônica ativa — grau IA/IB pela tubulite, ou II com arterite crônica.')

    const mvi = g + ptc
    const histo: string[] = []
    if (mvi >= 2 || vv > 0) histo.push(`inflamação microvascular presente (g${g} + ptc${ptc} = ${mvi}${vv > 0 ? ', arterite' : ''})`)
    if (c4d >= 2) histo.push(`C4d ${c4d} (positivo)`)
    let abmr = ''
    if (histo.length === 2) abmr = 'critérios histológicos e de interação anticorpo-endotélio presentes: RMA ativa se houver DSA (ou C4d positivo já substitui o DSA em 2019, com ressalva)'
    else if (mvi >= 2 || vv > 0) abmr = 'inflamação microvascular sem C4d: RMA depende de DSA ou de assinatura molecular; sem os dois, Banff 2022 chama de "inflamação microvascular DSA-negativa, C4d-negativa"'
    else if (c4d >= 2) abmr = 'C4d positivo sem inflamação microvascular: "C4d sem evidência de rejeição" se não houver DSA nem lesão'
    else abmr = 'sem critérios histológicos de rejeição mediada por anticorpos'
    if (mvi >= 2 && g >= 1 && ptc >= 1) warnings.push('Para o critério de inflamação microvascular (g + ptc ≥2) valer na presença de rejeição celular ou borderline, é preciso ptc ≥1 e g ≥1 — atendido.')
    else if (mvi >= 2 && tcmr !== 'sem evidência de rejeição celular aguda') warnings.push('Com rejeição celular ou borderline concomitante, g + ptc ≥2 só conta para RMA se g ≥1 e ptc ≥1.')
    warnings.push('Rejeição mediada por anticorpos exige DSA circulante (ou C4d/assinatura molecular como substituto): confirmar com o laboratório de histocompatibilidade antes de fechar.')

    return {
      tnm: [
        { k: 'Celular', v: tcmr },
        { k: 'MVI (g+ptc)', v: String(mvi) },
        { k: 'C4d', v: String(c4d) },
      ],
      warnings,
      report: `Banff: i${i} t${t} v${vv} g${g} ptc${ptc} C4d${c4d}. Rejeição celular: ${tcmr}. Anticorpos: ${abmr}.`,
    }
  },
}

export default calculator
