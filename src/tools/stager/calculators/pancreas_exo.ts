/* ==========================================================================
   Carcinoma de Pâncreas Exócrino — AJCC 8ª edição
   Base: CAP Protocol – Pancreas (Exocrine) v4.3.0.0, jun/2025.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { numOf, strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, NODE_FIELDS, PM_FIELD, prefix, stagingLine, pmToken, nodeCategory, countWarning } from './_shared'

const calculator: Calculator = {
  id: 'pancreas-exocrine',
  name: 'Carcinoma de Pâncreas (exócrino)',
  section: 'Pâncreas e Ampola',
  system: 'AJCC 8ª ed.',
  version: 'CAP — Pancreas (Exocrine) v4.3.0.0',
  reference: 'AJCC Cancer Staging Manual, 8th ed.',
  summary: 'Estadiamento pTNM de adenocarcinoma ductal e outros carcinomas exócrinos do pâncreas (pT por tamanho do componente invasivo).',

  fields: [
    MOD_FIELD,
    {
      id: 'ptMode', label: 'Tumor primário', type: 'select', default: 'size',
      options: [
        { value: 't0',   label: 'pT0 — sem evidência de tumor primário' },                                                           // pT0: No evidence of primary tumor
        { value: 'tis',  label: 'pTis — carcinoma in situ (PanIN de alto grau, IPMN/ITPN/MCN com displasia de alto grau)' },        // pTis: Carcinoma in situ (...)
        { value: 'size', label: 'Classificar pelo tamanho do componente invasivo (pT1–pT3)' },
        { value: 't4',   label: 'pT4 — envolve tronco celíaco, a. mesentérica superior e/ou a. hepática comum, independente do tamanho' }, // pT4: Tumor involves the celiac axis or the superior mesenteric artery, and / or common hepatic artery, regardless of size
      ],
    },
    {
      id: 'sizeCm', label: 'Maior dimensão do componente invasivo (cm)', type: 'number', min: 0,
      when: (v) => v.ptMode === 'size',
      hint: 'pT1a ≤0,5; pT1b >0,5 a <1; pT1c 1–2; pT2 >2 a 4; pT3 >4 cm.',
    },
    MULTI_FIELD,
    ...NODE_FIELDS,
    PM_FIELD,
  ],

  compute(v) {
    const warnings: string[] = [];
    const pre = prefix(strOf(v.mod));
    let T = '';
    if (v.ptMode === 't0') T = 'T0';
    else if (v.ptMode === 'tis') T = 'Tis';
    else if (v.ptMode === 't4') T = 'T4';
    else {
      const s = numOf(v.sizeCm);
      // pT1a: ≤0.5 cm / pT1b: >0.5 and <1 cm / pT1c: 1-2 cm / pT2: >2 and ≤4 cm / pT3: >4 cm
      if (s == null) { T = 'TX'; warnings.push('Informe o tamanho do componente invasivo para definir pT1–pT3.'); }
      else if (s <= 0.5) T = 'T1a';
      else if (s < 1) T = 'T1b';
      else if (s <= 2) T = 'T1c';
      else if (s <= 4) T = 'T2';
      else T = 'T3';
    }
    const mSuffix = v.multi === 'yes' ? '(m)' : '';
    const pos = numOf(v.nPositive), exam = numOf(v.nExamined);

    // pN1: Metastasis in one to three regional lymph nodes / pN2: four or more
    const N = nodeCategory(pos, [[0, 'N0'], [3, 'N1'], [Infinity, 'N2']]);
    const w = countWarning(exam, pos); if (w) warnings.push(w);

    const pT = `${pre}${T}${mSuffix}`;
    const pN = N ? `${pre}${N}` : null;
    const pM = pmToken(strOf(v.M));

    return {
      tnm: [ { k: 'pT', v: pT }, { k: 'pN', v: pN ?? '—' }, { k: 'pM', v: pM ?? '—' } ],
      stageGroup: null,
      warnings,
      report: stagingLine([pT, pN, pM]),
    };
  },
};

export default calculator
