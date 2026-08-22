/* ==========================================================================
   Carcinoma de Vias Biliares Extra-hepáticas Distais — AJCC 8ª edição
   Base: CAP Protocol – Distal Extrahepatic Bile Ducts v4.3.0.0, jun/2025.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { numOf, strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, NODE_FIELDS, PM_FIELD, prefix, stagingLine, pmToken, nodeCategory, countWarning } from './_shared'

const calculator: Calculator = {
  id: 'bileduct-distal',
  name: 'Carcinoma de Via Biliar Distal',
  section: 'Fígado e Vias Biliares',
  system: 'AJCC 8ª ed.',
  version: 'CAP — Distal Extrahepatic Bile Ducts v4.3.0.0',
  reference: 'AJCC Cancer Staging Manual, 8th ed.',
  summary: 'Estadiamento pTNM de carcinoma do colédoco distal (pT pela profundidade de invasão na parede).',

  fields: [
    MOD_FIELD,
    {
      id: 'pT', label: 'Categoria pT — Profundidade de invasão', type: 'select', default: 'T2',
      options: [
        { value: 'Tis', label: 'pTis — carcinoma in situ / displasia de alto grau' },                              // pTis: Carcinoma in situ / high-grade dysplasia
        { value: 'T1',  label: 'pT1 — invade a parede do ducto com profundidade <5 mm' },                           // pT1: Tumor invades the bile duct wall with a depth less than 5 mm
        { value: 'T2',  label: 'pT2 — invade a parede do ducto com profundidade de 5 a 12 mm' },                    // pT2: Tumor invades the bile duct wall with a depth of 5-12 mm
        { value: 'T3',  label: 'pT3 — invade a parede do ducto com profundidade >12 mm' },                          // pT3: Tumor invades the bile duct wall with a depth greater than 12 mm
        { value: 'T4',  label: 'pT4 — envolve tronco celíaco, a. mesentérica superior e/ou a. hepática comum' },    // pT4: Tumor involves the celiac axis, superior mesenteric artery, and / or common hepatic artery
      ],
    },
    MULTI_FIELD,
    ...NODE_FIELDS,
    PM_FIELD,
  ],

  compute(v) {
    const warnings: string[] = [];
    const pre = prefix(strOf(v.mod));
    const T = strOf(v.pT);
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
