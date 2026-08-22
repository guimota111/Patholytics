/* ==========================================================================
   Carcinoma de Orofaringe HPV-associado — AJCC 9ª versão
   Base: CAP Protocol – HPV-Associated Oropharynx (Resection) v1.1.0.0, jun/2026.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, PM_FIELD, prefix, stagingLine, pmToken } from './_shared'

const calculator: Calculator = {
  id: 'hn-oropharynx-hpv',
  name: 'Carcinoma de Orofaringe HPV-associado',
  section: 'Cabeça e Pescoço',
  system: 'AJCC 9ª versão',
  version: 'CAP — HPV-Associated Oropharynx (Resection) v1.1.0.0',
  reference: 'AJCC Cancer Staging System, version 9',
  summary: 'Estadiamento pTNM de carcinoma de orofaringe associado ao HPV (p16+).',

  fields: [
    MOD_FIELD,
    {
      id: 'pT', label: 'Categoria pT — Tumor primário', type: 'select', default: 'T1',
      hint: 'Extensão mucosa à superfície lingual da epiglote a partir de base da língua/valécula não é invasão da laringe.',
      options: [
        { value: 'T0', label: 'pT0 — sem evidência de tumor primário' },                                                                                                                                  // pT0: No evidence of primary tumor
        { value: 'T1', label: 'pT1 — ≤2 cm' },                                                                                                                                                            // pT1: Tumor is less than or equal to 2 cm in greatest dimension
        { value: 'T2', label: 'pT2 — >2 a 4 cm' },                                                                                                                                                        // pT2: Tumor greater than 2 cm but less than or equal to 4 cm in greatest dimension
        { value: 'T3', label: 'pT3 — >4 cm ou extensão à superfície lingual da epiglote' },                                                                                                              // pT3: Tumor is greater than 4 cm in greatest dimension or extension to lingual surface of epiglottis
        { value: 'T4', label: 'pT4 — invade laringe; músculos extrínsecos/profundos da língua; pterigoides; palato duro; mandíbula; lâminas pterigoides; nasofaringe; base do crânio; ou envolve a carótida' }, // pT4: Tumor invades any of the following: larynx; OR deep / extrinsic muscle of the tongue; OR pterygoid muscles; OR hard palate; OR mandible; OR pterygoid plates; OR nasopharynx; OR skull base; OR encases carotid artery
      ],
    },
    MULTI_FIELD,
    {
      id: 'pN', label: 'Categoria pN — Linfonodos regionais', type: 'select', default: 'none',
      hint: 'Mínimo de 6 linfonodos para atribuir pN0 (AJCC v9).',
      options: [
        { value: 'none', label: 'pN não atribuído (sem linfonodos ou não determinável)' },
        { value: 'N0',  label: 'pN0 — sem acometimento de linfonodo regional' },                                                      // pN0: No tumor involvement of regional lymph node(s)
        { value: 'N1a', label: 'pN1a — 1 linfonodo sem extensão extranodal patológica definitiva' },                                  // pN1a: Tumor involvement of 1 lymph node without definitive pathological extranodal extension
        { value: 'N1b', label: 'pN1b — 2 a 4 linfonodos sem extensão extranodal patológica definitiva' },                             // pN1b: Tumor involvement of 2-4 lymph nodes without definitive pathological extranodal extension
        { value: 'N1',  label: 'pN1 — 1 a 4 linfonodos sem ENE, subcategoria indeterminada' },                                        // pN1 (subcategory cannot be determined)
        { value: 'N2',  label: 'pN2 — 1 a 4 linfonodos com ENE patológica definitiva, ou >4 linfonodos sem ENE' },                    // pN2: Tumor involvement of 1-4 lymph nodes with definitive pathological extranodal extension OR Tumor involvement of greater than 4 lymph nodes without definitive pathological extranodal extension
        { value: 'N3',  label: 'pN3 — >4 linfonodos com ENE patológica definitiva' },                                                 // pN3: Tumor involvement of greater than 4 lymph nodes with definitive pathological extranodal extension
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
      report: stagingLine([pT, pN, pM], 'AJCC 9ª versão'),
    };
  },
};

export default calculator
