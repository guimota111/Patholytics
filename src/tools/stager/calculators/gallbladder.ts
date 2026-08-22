/* ==========================================================================
   Carcinoma da Vesícula Biliar — AJCC 8ª edição
   Base: CAP — Gallbladder (v4.3.0.0).
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   ========================================================================== */

import { stagingLine } from './_shared';
import type { Calculator } from '../types'
import { numOf } from '../types'

const calculator: Calculator = {
  id: 'gallbladder',
  name: 'Carcinoma da Vesícula Biliar',
  section: 'Fígado e Vias Biliares',
  system: 'AJCC 8ª ed.',
  version: 'CAP — Gallbladder v4.3',
  reference: 'AJCC 8th ed. / CAP Gallbladder 4.3.0.0',
  summary: 'Estadiamento pTNM do carcinoma da vesícula biliar.',

  fields: [
    {
      id: 'pT', label: 'Categoria pT — Tumor primário', type: 'select', default: 'T2a',
      options: [
        { value: 'T0',  label: 'pT0 — sem evidência de tumor primário' },
        { value: 'Tis', label: 'pTis — carcinoma in situ' },
        { value: 'T1a', label: 'pT1a — invade a lâmina própria' },
        { value: 'T1b', label: 'pT1b — invade a camada muscular' },
        { value: 'T2a', label: 'pT2a — tecido conjuntivo perimuscular no lado peritoneal, sem serosa' },
        { value: 'T2b', label: 'pT2b — tecido conjuntivo perimuscular no lado hepático, sem extensão ao fígado' },
        { value: 'T3',  label: 'pT3 — perfura a serosa e/ou invade o fígado e/ou 1 órgão/estrutura adjacente' },
        { value: 'T4',  label: 'pT4 — invade a veia porta principal/artéria hepática ou ≥2 órgãos/estruturas extra-hepáticos' },
      ],
    },
    {
      id: 'multi', label: 'Múltiplos tumores primários sincrônicos?', type: 'radio', default: 'no',
      options: [ { value: 'no', label: 'Não' }, { value: 'yes', label: 'Sim → (m)' } ],
    },
    {
      id: 'nodeInput', label: 'Linfonodos regionais', type: 'select', default: 'counts',
      options: [
        { value: 'counts', label: 'Informar nº de linfonodos positivos' },
        { value: 'none',   label: 'Nenhum linfonodo submetido → pN não atribuído' },
      ],
    },
    {
      id: 'nPositive', label: 'Linfonodos regionais positivos', type: 'number', min: 0, default: 0,
      hint: '1–3 = pN1; ≥4 = pN2.',
      when: v => v.nodeInput === 'counts',
    },
    {
      id: 'pm', label: 'Metástase à distância (pM)', type: 'radio', default: 'na',
      options: [
        { value: 'na', label: 'Não aplicável' },
        { value: 'm1', label: 'pM1 (metástase à distância)' },
      ],
    },
  ],

  compute(v) {
    const warnings: string[] = [];
    const mSuffix = v.multi === 'yes' ? '(m)' : '';
    const pTtoken = `p${v.pT}${mSuffix}`;

    let Ncat: string | null = null;
    if (v.nodeInput !== 'none') {
      const n = numOf(v.nPositive) || 0;
      if (n === 0) Ncat = 'N0';
      else if (n <= 3) Ncat = 'N1';
      else Ncat = 'N2';
    }
    const pNtoken = Ncat ? `p${Ncat}` : null;

    const M1 = v.pm === 'm1';
    const pMtoken = M1 ? 'pM1' : null;

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
