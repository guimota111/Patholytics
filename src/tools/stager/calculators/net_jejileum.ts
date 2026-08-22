/* ==========================================================================
   TNE bem diferenciado — Jejuno e Íleo — AJCC 8ª edição
   Base: CAP — Jejunum_Ileum.NET (v2.0.0.0).
   Particularidade: pN1 (<12 linfonodos) vs pN2 (massas mesentéricas >2 cm
   e/ou ≥12 depósitos nodais).
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   ========================================================================== */

import { stagingLine, PM_NET_OPTIONS, pmNetToken } from './_shared';
import type { Calculator } from '../types'
import { numOf, strOf } from '../types'

const calculator: Calculator = {
  id: 'net-jejileum',
  name: 'TNE — Jejuno e Íleo',
  section: 'Trato Gastrointestinal',
  system: 'AJCC 8ª ed.',
  version: 'CAP — Jejunum/Ileum.NET v2.0',
  reference: 'AJCC 8th ed. / CAP Jejunum_Ileum.NET 2.0.0.0',
  summary: 'Estadiamento pTNM do tumor neuroendócrino bem diferenciado do jejuno e íleo.',

  fields: [
    {
      id: 'pT', label: 'Categoria pT — Tumor primário', type: 'select', default: 'T2',
      options: [
        { value: 'T0', label: 'pT0 — sem evidência de tumor primário' },
        { value: 'T1', label: 'pT1 — invade mucosa/submucosa, ≤1 cm' },
        { value: 'T2', label: 'pT2 — invade a muscular própria OU >1 cm' },
        { value: 'T3', label: 'pT3 — atravessa a muscular própria até a subserosa, sem serosa' },
        { value: 'T4', label: 'pT4 — invade o peritônio visceral (serosa) ou outros órgãos/estruturas' },
      ],
    },
    {
      id: 'multi', label: 'Múltiplos tumores primários sincrônicos?', type: 'radio', default: 'no',
      hint: 'Se sim, acrescenta o sufixo (m); usa-se o maior tumor para o pT.',
      options: [ { value: 'no', label: 'Não' }, { value: 'yes', label: 'Sim → (m)' } ],
    },
    {
      id: 'nodeInput', label: 'Linfonodos regionais', type: 'select', default: 'counts',
      options: [
        { value: 'counts', label: 'Informar contagem / massa mesentérica' },
        { value: 'none',   label: 'Nenhum linfonodo submetido → pN não atribuído' },
      ],
    },
    {
      id: 'nPositive', label: 'Depósitos / linfonodos regionais acometidos', type: 'number', min: 0, default: 0,
      when: v => v.nodeInput === 'counts',
    },
    {
      id: 'bigMass', label: 'Massa mesentérica >2 cm e/ou depósitos que envolvem os vasos mesentéricos?', type: 'radio', default: 'no',
      hint: 'Massas ≤2 cm são registradas, mas não alteram o estágio.',
      when: v => v.nodeInput === 'counts',
      options: [ { value: 'no', label: 'Não' }, { value: 'yes', label: 'Sim → pN2' } ],
    },
    {
      id: 'pm', label: 'Metástase à distância (pM)', type: 'select', default: 'na',
      options: PM_NET_OPTIONS,
    },
  ],

  compute(v) {
    const warnings: string[] = [];
    const mSuffix = v.multi === 'yes' ? '(m)' : '';
    const pTtoken = `p${v.pT}${mSuffix}`;

    // pN: N0 / N1 (<12, sem massa grande) / N2 (≥12 ou massa >2cm)
    let Ncat: string | null = null;
    if (v.nodeInput !== 'none') {
      const n = numOf(v.nPositive) || 0;
      if (v.bigMass === 'yes' || n >= 12) Ncat = 'N2';
      else if (n >= 1) Ncat = 'N1';
      else Ncat = 'N0';
    }
    const pNtoken = Ncat ? `p${Ncat}` : null;
    const pMtoken = pmNetToken(strOf(v.pm));

    const report = stagingLine([pTtoken, pNtoken, pMtoken]);

    return {
      tnm: [
        { k: 'pT', v: pTtoken },
        { k: 'pN', v: pNtoken || '— (não atribuído)' },
        { k: 'pM', v: pMtoken || '—' },
      ],
      stageGroup: null,
      warnings,
      report,
    };
  },
}

export default calculator
