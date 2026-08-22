/* ==========================================================================
   Carcinoma de Glândula Salivar — AJCC 9ª versão
   Base: CAP Protocol – Salivary Gland (Resection) v1.0.0.0, abr/2026.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, PM_FIELD, prefix, stagingLine, pmToken } from './_shared'

const calculator: Calculator = {
  id: 'hn-salivary',
  name: 'Carcinoma de Glândula Salivar',
  section: 'Cabeça e Pescoço',
  system: 'AJCC 9ª versão',
  version: 'CAP — Salivary Gland (Resection) v1.0.0.0',
  reference: 'AJCC Cancer Staging System, version 9',
  summary: 'Estadiamento pTNM de carcinomas de glândulas salivares maiores e menores.',

  fields: [
    MOD_FIELD,
    {
      id: 'pT', label: 'Categoria pT — Tumor primário', type: 'select', default: 'T1',
      hint: 'Extensão extraparenquimatosa = evidência clínica ou macroscópica; só microscópica não conta.',
      options: [
        { value: 'T0',  label: 'pT0 — sem evidência de tumor primário' },                                                                                                                  // pT0: No evidence of primary tumor
        { value: 'Tis', label: 'pTis — carcinoma in situ' },                                                                                                                               // pTis: Carcinoma in situ
        { value: 'T1',  label: 'pT1 — ≤2 cm sem extensão extraparenquimatosa' },                                                                                                           // pT1: Tumor is less than or equal to 2 cm in greatest dimension without extraparenchymal extension
        { value: 'T2',  label: 'pT2 — >2 a 4 cm sem extensão extraparenquimatosa' },                                                                                                       // pT2: Tumor is greater than 2 cm but less than or equal to 4 cm in greatest dimension without extraparenchymal extension
        { value: 'T3',  label: 'pT3 — >4 cm e/ou extensão extraparenquimatosa macroscópica (glândulas maiores)' },                                                                         // pT3: Tumor is greater than 4 cm and / or gross extraparenchymal extension (for major salivary glands)
        { value: 'T4a', label: 'pT4a — invade estruturas imediatamente adjacentes: pele, osso, cartilagem, parênquima de órgão sólido, esôfago, traqueia, nervo nomeado' },                // pT4a: Tumor invades any immediately adjacent structures, including: skin, bone, cartilage, solid organ parenchyma, esophagus, trachea, named nerve
        { value: 'T4b', label: 'pT4b — invade além das estruturas adjacentes: carótida, base do crânio (exceto nasofaringe), coluna, intracraniano, ápice orbitário, pré-vertebral, mediastino, espaço mastigador' }, // pT4b: Tumor invades beyond any adjacent structures, including: encasement of carotid artery, base of skull invasion (except nasopharynx), spinal column invasion, intracranial invasion, orbital apex, prevertebral space, mediastinal structures, masticator space
        { value: 'T4',  label: 'pT4 — subcategoria indeterminada' },                                                                                                                        // pT4 (subcategory cannot be determined)
      ],
    },
    MULTI_FIELD,
    {
      id: 'pN', label: 'Categoria pN — Linfonodos regionais', type: 'select', default: 'none',
      options: [
        { value: 'none', label: 'pN não atribuído (sem linfonodos ou não determinável)' },
        { value: 'N0', label: 'pN0 — sem acometimento de linfonodo regional' },                                                                 // pN0: No tumor involvement of regional lymph node(s)
        { value: 'N1', label: 'pN1 — 1 a 3 linfonodos, sem extensão extranodal patológica definitiva' },                                        // pN1: Tumor involvement of 1-3 lymph node(s) without definitive pathological extranodal extension
        { value: 'N2', label: 'pN2 — >3 linfonodos, ou qualquer linfonodo com extensão extranodal patológica definitiva' },                     // pN2: Tumor involvement of greater than 3 lymph nodes OR Tumor involvement of any lymph node(s) with definitive pathological extranodal extension
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
