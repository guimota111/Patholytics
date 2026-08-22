/* ==========================================================================
   Carcinoma Hepatocelular — AJCC 8ª edição
   Base: CAP Protocol – Hepatocellular Carcinoma v4.3.0.0, jun/2022.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { numOf, strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, NODE_FIELDS, PM_FIELD, prefix, stagingLine, pmToken, nodeCategory, countWarning } from './_shared'

const calculator: Calculator = {
  id: 'hcc',
  name: 'Carcinoma Hepatocelular',
  section: 'Fígado e Vias Biliares',
  system: 'AJCC 8ª ed.',
  version: 'CAP — Hepatocellular Carcinoma v4.3.0.0',
  reference: 'AJCC Cancer Staging Manual, 8th ed.',
  summary: 'Estadiamento pTNM de carcinoma hepatocelular em ressecção hepática.',

  fields: [
    MOD_FIELD,
    {
      id: 'pT', label: 'Categoria pT — Tumor primário', type: 'select', default: 'T1b',
      options: [
        { value: 'T0',  label: 'pT0 — sem evidência de tumor primário' },                                                       // pT0: No evidence of primary tumor
        { value: 'T1a', label: 'pT1a — tumor solitário ≤2 cm' },                                                                // pT1a: Solitary tumor less than or equal to 2 cm
        { value: 'T1b', label: 'pT1b — tumor solitário >2 cm, sem invasão vascular' },                                          // pT1b: Solitary tumor greater than 2 cm without vascular invasion
        { value: 'T1',  label: 'pT1 — subcategoria indeterminada' },                                                            // pT1 (subcategory cannot be determined)
        { value: 'T2',  label: 'pT2 — solitário >2 cm com invasão vascular, ou múltiplos, nenhum >5 cm' },                     // pT2: Solitary tumor greater than 2 cm with vascular invasion, or multiple tumors, none greater than 5 cm
        { value: 'T3',  label: 'pT3 — múltiplos, ao menos um >5 cm' },                                                          // pT3: Multiple tumors, at least one of which is greater than 5 cm
        { value: 'T4',  label: 'pT4 — ramo principal da v. porta ou v. hepática; invasão direta de órgão adjacente (exceto vesícula); ou perfuração do peritônio visceral' }, // pT4: Single tumor or multiple tumors of any size involving a major branch of the portal vein or hepatic vein, or tumor(s) with direct invasion of adjacent organs other than the gallbladder or with perforation of visceral peritoneum
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

    // pN0: No regional lymph node metastasis / pN1: Regional lymph node metastasis
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
