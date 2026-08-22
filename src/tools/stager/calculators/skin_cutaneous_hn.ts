/* ==========================================================================
   Carcinoma Cutâneo de Cabeça e Pescoço — AJCC 8ª edição
   Base: CAP Protocol – Cutaneous Carcinoma of the Head and Neck v1.2.0.0, abr/2026.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, PM_FIELD, HN_PN_OPTIONS, prefix, stagingLine, pmToken } from './_shared'

const calculator: Calculator = {
  id: 'skin-cutaneous-hn',
  name: 'Carcinoma Cutâneo de Cabeça e Pescoço',
  section: 'Pele',
  system: 'AJCC 8ª ed.',
  version: 'CAP — Cutaneous Carcinoma of the Head and Neck v1.2.0.0',
  reference: 'AJCC Cancer Staging Manual, 8th ed.',
  summary: 'Estadiamento pTNM de carcinoma espinocelular (e outros carcinomas) da pele de cabeça e pescoço.',

  fields: [
    MOD_FIELD,
    {
      id: 'pT', label: 'Categoria pT — Tumor primário', type: 'select', default: 'T1',
      hint: 'Invasão profunda = além da gordura subcutânea (fáscia, músculo, pericôndrio, periósteo) ou >6 mm da camada granulosa. Invasão perineural para pT3 = nervo abaixo da derme ou ≥0,1 mm de calibre.',
      options: [
        { value: 'Tis', label: 'pTis — carcinoma in situ' },                                                                                                   // pTis: Carcinoma in situ
        { value: 'T1',  label: 'pT1 — ≤2 cm' },                                                                                                                // pT1: Tumor smaller than or equal to 2 cm in greatest dimension
        { value: 'T2',  label: 'pT2 — >2 cm e ≤4 cm' },                                                                                                        // pT2: Tumor larger than 2 cm, but smaller than or equal to 4 cm in greatest dimension
        { value: 'T3',  label: 'pT3 — >4 cm, ou erosão óssea mínima, ou invasão perineural, ou invasão profunda' },                                            // pT3: Tumor larger than 4 cm in maximum dimension or minor bone erosion or perineural invasion or deep invasion
        { value: 'T4a', label: 'pT4a — invasão macroscópica de osso cortical / medula' },                                                                      // pT4a: Tumor with gross cortical bone / marrow invasion
        { value: 'T4b', label: 'pT4b — invasão da base do crânio e/ou forames da base' },                                                                      // pT4b: Tumor with skull base invasion and / or skull base foramen involvement
        { value: 'T4',  label: 'pT4 — subcategoria indeterminada' },                                                                                           // pT4 (subcategory cannot be determined)
      ],
    },
    MULTI_FIELD,
    {
      id: 'pN', label: 'Categoria pN — Linfonodos regionais', type: 'select', default: 'none',
      hint: 'Linfonodos de linha média contam como ipsilaterais. ENE = extensão extranodal.',
      options: HN_PN_OPTIONS,
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
