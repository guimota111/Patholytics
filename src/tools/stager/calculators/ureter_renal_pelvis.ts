/* ==========================================================================
   Carcinoma de Pelve Renal e Ureter — AJCC 8ª edição
   Base: CAP Protocol – Ureter, Renal Pelvis (Resection) v2.4.0.0, mar/2025.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, PM_FIELD, prefix, stagingLine, pmToken } from './_shared'

const calculator: Calculator = {
  id: 'ureter-renal-pelvis',
  name: 'Carcinoma de Pelve Renal e Ureter',
  section: 'Trato Geniturinário',
  system: 'AJCC 8ª ed.',
  version: 'CAP — Ureter, Renal Pelvis (Resection) v2.4.0.0',
  reference: 'AJCC Cancer Staging Manual, 8th ed.',
  summary: 'Estadiamento pTNM de carcinoma urotelial do trato urinário superior em nefroureterectomia ou ureterectomia.',

  fields: [
    MOD_FIELD,
    {
      id: 'pT', label: 'Categoria pT — Tumor primário', type: 'select', default: 'T1',
      options: [
        { value: 'T0',  label: 'pT0 — sem evidência de tumor primário' },                                                                     // pT0: No evidence of primary tumor
        { value: 'Ta',  label: 'pTa — carcinoma papilífero não invasivo' },                                                                   // pTa: Papillary noninvasive carcinoma
        { value: 'Tis', label: 'pTis — carcinoma in situ' },                                                                                  // pTis: Carcinoma in situ
        { value: 'T1',  label: 'pT1 — invade o tecido conjuntivo subepitelial' },                                                             // pT1: Tumor invades subepithelial connective tissue
        { value: 'T2',  label: 'pT2 — invade a muscular' },                                                                                   // pT2: Tumor invades the muscularis
        { value: 'T3',  label: 'pT3 — pelve renal: além da muscular até gordura peripélvica ou parênquima renal; ureter: até gordura periureteral' }, // pT3: For renal pelvis only-Tumor invades beyond muscularis into peripelvic fat or into the renal parenchyma or For ureter only-Tumor invades beyond muscularis into periureteric fat
        { value: 'T4',  label: 'pT4 — invade órgãos adjacentes, ou através do rim até a gordura perirrenal' },                                // pT4: Tumor invades adjacent organs, or through the kidney into the perinephric fat
      ],
    },
    MULTI_FIELD,
    {
      id: 'pN', label: 'Categoria pN — Linfonodos regionais', type: 'select', default: 'none',
      options: [
        { value: 'none', label: 'pN não atribuído (sem linfonodos ou não determinável)' },
        { value: 'N0',   label: 'pN0 — sem metástase em linfonodo regional' },                                    // pN0: No regional lymph node metastasis
        { value: 'N1',   label: 'pN1 — metástase ≤2 cm em linfonodo único' },                                     // pN1: Metastasis less than or equal to 2 cm in greatest dimension, in a single lymph node
        { value: 'N2',   label: 'pN2 — metástase >2 cm em linfonodo único, ou múltiplos linfonodos' },             // pN2: Metastasis greater than 2 cm, in a single lymph node; or multiple lymph nodes
      ],
    },
    PM_FIELD,
  ],

  compute(v) {
    const warnings: string[] = [];
    const pre = prefix(strOf(v.mod));
    const T = strOf(v.pT);
    const mSuffix = v.multi === 'yes' ? '(m)' : '';
    const N = v.pN === 'none' ? null : strOf(v.pN);

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
