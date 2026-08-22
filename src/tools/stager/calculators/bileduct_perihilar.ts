/* ==========================================================================
   Colangiocarcinoma Peri-hilar (ducto biliar) — AJCC 8ª edição
   Base: CAP — Perihilar Bile Ducts (v4.3.0.0).
   Aplica-se apenas a carcinomas peri-hilares (não intra-hepáticos nem distais).
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   ========================================================================== */

import { stagingLine } from './_shared';
import type { Calculator } from '../types'
import { numOf } from '../types'

const calculator: Calculator = {
  id: 'bileduct-perihilar',
  name: 'Colangiocarcinoma Peri-hilar',
  section: 'Fígado e Vias Biliares',
  system: 'AJCC 8ª ed.',
  version: 'CAP — Perihilar Bile Ducts v4.3',
  reference: 'AJCC 8th ed. / CAP BileDuctPH 4.3.0.0',
  summary: 'Estadiamento pTNM do carcinoma peri-hilar das vias biliares.',

  fields: [
    {
      id: 'pT', label: 'Categoria pT — Tumor primário', type: 'select', default: 'T2a',
      options: [
        { value: 'T0',  label: 'pT0 — sem evidência de tumor primário' },
        { value: 'Tis', label: 'pTis — carcinoma in situ / displasia de alto grau' },
        { value: 'T1',  label: 'pT1 — confinado ao ducto biliar (até camada muscular/tecido fibroso)' },
        { value: 'T2a', label: 'pT2a — além da parede do ducto, até o tecido adiposo circundante' },
        { value: 'T2b', label: 'pT2b — invade o parênquima hepático adjacente' },
        { value: 'T3',  label: 'pT3 — invade ramos unilaterais da veia porta ou da artéria hepática' },
        { value: 'T4',  label: 'pT4 — veia porta principal/ramos bilaterais, artéria hepática comum, ou radicais de 2ª ordem unilaterais com envolvimento vascular contralateral' },
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

    // pN por contagem (1–3 = N1; ≥4 = N2)
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
