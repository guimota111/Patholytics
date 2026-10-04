/* ==========================================================================
   Proteínas de reparo de pareamento (MMR) — MLH1, PMS2, MSH2, MSH6.
   O padrão de perda aponta o gene e o próximo passo: perda MLH1/PMS2 pede
   metilação do promotor de MLH1 (ou BRAF V600E no colorretal) antes de falar
   em Lynch; perda MSH2/MSH6, PMS2 ou MSH6 isolada vai direto para a genética.
   ========================================================================== */

import type { Calculator, CalculatorResult } from '@/tools/stager/types'
import { strOf } from '@/tools/stager/types'

const OPTIONS = [
  { value: 'retained', label: 'Preservada (nuclear)' },
  { value: 'lost', label: 'Perdida (com controle interno positivo)' },
  { value: 'indeterminate', label: 'Indeterminada / sem controle interno' },
]

const calculator: Calculator = {
  id: 'mmr',
  name: 'MMR — padrão de perda e próximo passo',
  section: 'Reparo de DNA e p53',
  system: 'MLH1 · PMS2 · MSH2 · MSH6',
  reference: 'CAP/AMP/ASCO/ASCP e NCCN sobre Lynch; Shia J. J Mol Diagn 2008; Bartley AN et al. Arch Pathol Lab Med 2022',
  summary: 'Preservada ou perdida em cada uma das quatro proteínas: sai dMMR/pMMR, o gene provável e o teste que vem depois.',
  fields: [
    { id: 'mlh1', label: 'MLH1', type: 'radio', default: 'retained', options: OPTIONS },
    { id: 'pms2', label: 'PMS2', type: 'radio', default: 'retained', options: OPTIONS },
    { id: 'msh2', label: 'MSH2', type: 'radio', default: 'retained', options: OPTIONS },
    { id: 'msh6', label: 'MSH6', type: 'radio', default: 'retained', options: OPTIONS },
    {
      id: 'site', label: 'Sítio', type: 'select', default: 'colorectal',
      options: [
        { value: 'colorectal', label: 'Colorretal' },
        { value: 'endometrium', label: 'Endométrio' },
        { value: 'other', label: 'Outro' },
      ],
    },
    {
      id: 'neoadj', label: 'Houve quimio ou radioterapia neoadjuvante?', type: 'radio', default: 'no',
      options: [
        { value: 'no', label: 'Não' },
        { value: 'yes', label: 'Sim' },
      ],
    },
  ],
  compute: (v): CalculatorResult => {
    const s = (k: string) => strOf(v[k])
    const lost = (k: string) => s(k) === 'lost'
    const ind = ['mlh1', 'pms2', 'msh2', 'msh6'].filter((k) => s(k) === 'indeterminate')
    const lostList = ['mlh1', 'pms2', 'msh2', 'msh6'].filter(lost)
    const warnings: string[] = []
    if (ind.length) warnings.push(`${ind.map((k) => k.toUpperCase()).join(', ')} sem controle interno: repetir a reação (linfócitos, estroma e criptas normais devem marcar) antes de interpretar.`)

    let status = lostList.length ? 'dMMR (deficiente)' : 'pMMR (proficiente)'
    let gene = '—'
    let next = ''
    const site = s('site')
    const methyl = site === 'colorectal'
      ? 'pesquisar BRAF V600E e/ou hipermetilação do promotor de MLH1'
      : 'pesquisar hipermetilação do promotor de MLH1 (BRAF não serve fora do cólon)'

    if (lostList.length === 0) {
      next = ind.length ? '' : 'Expressão preservada das quatro proteínas. Mutações missense podem manter a proteína antigênica e não funcional: se a suspeita clínica for alta, complementar com MSI por PCR ou NGS.'
    } else if (lost('mlh1') && lost('pms2') && !lost('msh2') && !lost('msh6')) {
      gene = 'MLH1 (PMS2 perde por instabilidade do heterodímero)'
      next = `Perda de MLH1/PMS2: a causa mais comum é esporádica (hipermetilação de MLH1). Antes de sugerir Lynch, ${methyl}; se negativos, encaminhar para pesquisa de variante germinativa em MLH1.`
    } else if (lost('pms2') && !lost('mlh1') && !lost('msh2') && !lost('msh6')) {
      gene = 'PMS2 (raramente MLH1 com proteína antigênica)'
      next = 'Perda isolada de PMS2: quase sempre variante germinativa de PMS2; encaminhar para aconselhamento genético. Pseudogenes complicam o sequenciamento, avisar o laboratório.'
    } else if (lost('msh2') && lost('msh6') && !lost('mlh1') && !lost('pms2')) {
      gene = 'MSH2 (ou deleção de EPCAM)'
      next = 'Perda de MSH2/MSH6: fortemente sugestiva de síndrome de Lynch; encaminhar para pesquisa germinativa de MSH2 e deleção de EPCAM. Metilação não explica esse padrão.'
    } else if (lost('msh6') && !lost('msh2') && !lost('mlh1') && !lost('pms2')) {
      gene = 'MSH6'
      next = 'Perda isolada de MSH6: sugere variante germinativa de MSH6; encaminhar para genética. Pode ser secundária (mutação somática em tumores MLH1-metilados) ou artefato pós-neoadjuvância.'
      if (s('neoadj') === 'yes') warnings.push('Após quimio ou radioterapia a expressão de MSH6 pode cair de forma reversível: interpretar com cautela e, se possível, repetir na amostra pré-tratamento.')
    } else if (lost('msh2') && !lost('msh6')) {
      gene = 'MSH2 (padrão atípico)'
      next = 'Perda de MSH2 com MSH6 preservada é incomum: confirmar a leitura e repetir; se persistir, tratar como suspeita de Lynch (MSH2/EPCAM).'
    } else if (lost('mlh1') && !lost('pms2')) {
      gene = 'MLH1 (padrão atípico)'
      next = 'Perda de MLH1 com PMS2 preservada é incomum: confirmar a leitura e repetir; se persistir, seguir a via da perda de MLH1.'
    } else {
      gene = 'mais de um heterodímero'
      status = 'dMMR (deficiente) — padrão complexo'
      next = 'Perda em mais de um par: rever controles internos e a qualidade da reação. Perda dos quatro em paciente jovem sugere deficiência constitucional de MMR (CMMRD); considerar também dois eventos somáticos.'
    }

    const summary = lostList.length ? `perda de ${lostList.map((k) => k.toUpperCase()).join(', ')}` : 'expressão preservada de MLH1, PMS2, MSH2 e MSH6'
    if (next) warnings.push(next)
    return {
      tnm: [
        { k: 'Status', v: status },
        { k: 'Gene provável', v: gene },
      ],
      warnings,
      report: `Imuno-histoquímica para proteínas de reparo: ${summary} — ${status}.${lostList.length ? ` Gene provável: ${gene}.` : ''}`,
    }
  },
}

export default calculator
