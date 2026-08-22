/* ==========================================================================
   Colangiocarcinoma Intra-hepático — AJCC 8ª edição
   Base: CAP Protocol – Intrahepatic Bile Ducts v4.3.0.0, jun/2025.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { numOf, strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, NODE_FIELDS, PM_FIELD, prefix, stagingLine, pmToken, nodeCategory, countWarning } from './_shared'

const calculator: Calculator = {
  id: 'bileduct-intrahepatic',
  name: 'Colangiocarcinoma Intra-hepático',
  section: 'Fígado e Vias Biliares',
  system: 'AJCC 8ª ed.',
  version: 'CAP — Intrahepatic Bile Ducts v4.3.0.0',
  reference: 'AJCC Cancer Staging Manual, 8th ed.',
  summary: 'Estadiamento pTNM de carcinoma de ductos biliares intra-hepáticos em ressecção hepática.',

  fields: [
    MOD_FIELD,
    {
      id: 'pT', label: 'Categoria pT — Tumor primário', type: 'select', default: 'T1a',
      options: [
        { value: 'T0',  label: 'pT0 — sem evidência de tumor primário' },                                                     // pT0: No evidence of primary tumor
        { value: 'Tis', label: 'pTis — carcinoma in situ (tumor intraductal)' },                                               // pTis: Carcinoma in situ (intraductal tumor)
        { value: 'T1a', label: 'pT1a — tumor solitário ≤5 cm, sem invasão vascular' },                                         // pT1a: Solitary tumor less than or equal to 5 cm without vascular invasion
        { value: 'T1b', label: 'pT1b — tumor solitário >5 cm, sem invasão vascular' },                                         // pT1b: Solitary tumor greater than 5 cm without vascular invasion
        { value: 'T1',  label: 'pT1 — subcategoria indeterminada' },                                                           // pT1 (subcategory cannot be determined)
        { value: 'T2',  label: 'pT2 — solitário com invasão vascular intra-hepática, ou múltiplos (com ou sem invasão vascular)' }, // pT2: Solitary tumor with intrahepatic vascular invasion or multiple tumors, with or without vascular invasion
        { value: 'T3',  label: 'pT3 — perfura o peritônio visceral' },                                                         // pT3: Tumor perforating the visceral peritoneum
        { value: 'T4',  label: 'pT4 — invade diretamente estruturas extra-hepáticas locais' },                                 // pT4: Tumor involving local extrahepatic structures by direct invasion
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

    // pN0: No regional lymph node metastasis / pN1: Regional lymph node metastasis present
    const N = nodeCategory(pos, [[0, 'N0'], [Infinity, 'N1']]);
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
