/* ==========================================================================
   p53 — leitura por padrão (selvagem × mutante), no molde do que o WHO e o
   ProMisE usam para endométrio e ovário. Três padrões mutantes: super-
   expressão difusa, nulo (ausência com controle interno) e citoplasmático.
   ========================================================================== */

import type { Calculator, CalculatorResult } from '@/tools/stager/types'
import { strOf } from '@/tools/stager/types'

const calculator: Calculator = {
  id: 'p53',
  name: 'p53 — padrão selvagem ou mutante',
  section: 'Reparo de DNA e p53',
  system: 'Köbel · WHO 2020',
  reference: 'Köbel M et al. Int J Gynecol Pathol 2019 e J Pathol Clin Res 2016; WHO Female Genital Tumours 5ª ed. (2020)',
  summary: 'Descreva a marcação nuclear e o controle interno: sai a interpretação (selvagem ou mutante e qual padrão) e a ressalva do subclonal.',
  fields: [
    {
      id: 'pattern', label: 'Padrão observado', type: 'select', default: 'wild',
      options: [
        { value: 'wild', label: 'Heterogêneo — núcleos com intensidade variável, de negativos a fortes' },
        { value: 'over', label: 'Superexpressão — forte e difusa em praticamente todos os núcleos tumorais (≥80%)' },
        { value: 'null', label: 'Nulo — ausência completa nos núcleos tumorais, com controle interno positivo' },
        { value: 'cyto', label: 'Citoplasmático — marcação citoplasmática inequívoca, com núcleo variável' },
        { value: 'subclonal', label: 'Subclonal — áreas com padrão mutante e áreas com padrão selvagem, bem delimitadas' },
        { value: 'nocontrol', label: 'Ausência total sem controle interno positivo' },
      ],
    },
    {
      id: 'site', label: 'Contexto', type: 'select', default: 'endometrium',
      options: [
        { value: 'endometrium', label: 'Carcinoma de endométrio (classificação molecular)' },
        { value: 'ovary', label: 'Carcinoma seroso de ovário/tuba' },
        { value: 'other', label: 'Outro' },
      ],
    },
  ],
  compute: (v): CalculatorResult => {
    const p = strOf(v.pattern)
    const site = strOf(v.site)
    const warnings: string[] = []
    let verdict = ''
    let detail = ''
    switch (p) {
      case 'wild':
        verdict = 'padrão selvagem'
        detail = 'Compatível com TP53 sem mutação (ou com mutação que não altera a expressão, em <5% dos casos).'
        break
      case 'over':
        verdict = 'padrão mutante (superexpressão)'
        detail = 'Sugere mutação missense de TP53.'
        break
      case 'null':
        verdict = 'padrão mutante (nulo)'
        detail = 'Sugere mutação truncante, deleção ou splice de TP53. Só vale com linfócitos, estroma ou epitélio normal marcando.'
        break
      case 'cyto':
        verdict = 'padrão mutante (citoplasmático)'
        detail = 'Padrão raro, associado a mutações que afetam o sinal de localização nuclear.'
        break
      case 'subclonal':
        verdict = 'padrão subclonal'
        detail = 'Duas populações. No endométrio, quase sempre acompanha tumor POLE-mutado ou dMMR: classificar primeiro por POLE e MMR; se ambos negativos, o componente mutante conta como p53 anormal.'
        break
      default:
        verdict = 'não interpretável'
        detail = 'Sem controle interno não se distingue nulo de reação falha: repetir a reação.'
    }
    if (site === 'endometrium' && (p === 'over' || p === 'null' || p === 'cyto')) {
      warnings.push('p53 anormal no endométrio só define o grupo "p53abn" depois de excluir POLE ultramutado e dMMR (ordem do ProMisE/WHO).')
    }
    if (site === 'ovary' && p === 'wild') {
      warnings.push('Carcinoma seroso de alto grau é p53 mutante em >95% dos casos: padrão selvagem pede rever o diagnóstico (seroso de baixo grau, endometrioide, células claras).')
    }
    if (detail) warnings.push(detail)
    return {
      tnm: [{ k: 'p53', v: verdict }],
      warnings,
      report: p === 'nocontrol' ? '' : `p53: ${verdict}${p === 'subclonal' ? '' : p === 'wild' ? ', expressão heterogênea' : ''}.`,
    }
  },
}

export default calculator
