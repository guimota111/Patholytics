/* ==========================================================================
   Carcinoma de Células Renais — AJCC 8ª edição
   Base: CAP Protocol – Kidney (Resection) v4.3.0.0, jun/2026.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { numOf, strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, NODE_FIELDS, prefix, stagingLine, pmToken, nodeCategory, countWarning } from './_shared'

const calculator: Calculator = {
  id: 'kidney',
  name: 'Carcinoma de Células Renais',
  section: 'Trato Geniturinário',
  system: 'AJCC 8ª ed.',
  version: 'CAP — Kidney (Resection) v4.3.0.0',
  reference: 'AJCC Cancer Staging Manual, 8th ed.',
  summary: 'Estadiamento pTNM de carcinoma de células renais em nefrectomia parcial ou radical.',

  fields: [
    MOD_FIELD,
    {
      id: 'pT', label: 'Categoria pT — Tumor primário', type: 'select', default: 'T1a',
      options: [
        { value: 'T0',  label: 'pT0 — sem evidência de tumor primário' },                                                                    // pT0: No evidence of primary tumor
        { value: 'T1a', label: 'pT1a — ≤4 cm, limitado ao rim' },                                                                            // pT1a: Tumor less than or equal to 4 cm in greatest dimension, limited to the kidney
        { value: 'T1b', label: 'pT1b — >4 a 7 cm, limitado ao rim' },                                                                        // pT1b: Tumor greater than 4 cm but less than or equal to 7 cm in greatest dimension limited to the kidney
        { value: 'T1',  label: 'pT1 — subcategoria indeterminada (≤7 cm, limitado ao rim)' },                                                // pT1 (subcategory cannot be determined)
        { value: 'T2a', label: 'pT2a — >7 a 10 cm, limitado ao rim' },                                                                       // pT2a: Tumor greater than 7 cm but less than or equal to 10 cm in greatest dimension, limited to the kidney
        { value: 'T2b', label: 'pT2b — >10 cm, limitado ao rim' },                                                                           // pT2b: Tumor greater than 10 cm, limited to the kidney
        { value: 'T2',  label: 'pT2 — subcategoria indeterminada (>7 cm, limitado ao rim)' },                                                // pT2 (subcategory cannot be determined)
        { value: 'T3a', label: 'pT3a — veia renal ou ramos segmentares, sistema pielocalicial, ou gordura perirrenal/seio renal, sem ultrapassar a fáscia de Gerota' }, // pT3a: Tumor extends into the renal vein or its segmental branches, or invades the pelvicalyceal system, or invades perirenal and / or renal sinus fat but not beyond Gerota's fascia
        { value: 'T3b', label: 'pT3b — veia cava abaixo do diafragma' },                                                                     // pT3b: Tumor extends into the vena cava below the diaphragm
        { value: 'T3c', label: 'pT3c — veia cava acima do diafragma ou invade a parede da cava' },                                           // pT3c: Tumor extends into the vena cava above the diaphragm or invades the wall of the vena cava
        { value: 'T3',  label: 'pT3 — subcategoria indeterminada' },                                                                         // pT3 (subcategory cannot be determined)
        { value: 'T4',  label: 'pT4 — além da fáscia de Gerota (incl. extensão contígua à adrenal ipsilateral)' },                           // pT4: Tumor invades beyond Gerota's fascia (including contiguous extension into the ipsilateral adrenal gland)
      ],
    },
    MULTI_FIELD,
    ...NODE_FIELDS,
    {
      id: 'M', label: 'Categoria pM — Metástase à distância', type: 'select', default: 'na',
      options: [
        { value: 'na', label: 'Não aplicável — pM não determinável neste espécime' },
        { value: 'M1', label: 'pM1 — metástase à distância (incl. adrenal acometida não contiguamente)' }, // pM1: Distant metastasis (including non-contiguous adrenal gland involvement)
      ],
    },
  ],

  compute(v) {
    const warnings: string[] = [];
    const pre = prefix(strOf(v.mod));
    const T = strOf(v.pT);
    const mSuffix = v.multi === 'yes' ? '(m)' : '';
    const pos = numOf(v.nPositive), exam = numOf(v.nExamined);

    // pN0: No regional lymph node metastasis / pN1: Metastasis in regional lymph node(s)
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
