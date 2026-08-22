/* ==========================================================================
   Melanoma Mucoso de Cabeça e Pescoço — AJCC 8ª edição
   Base: CAP Protocol – Mucosal Melanoma of the Head and Neck (Resection) v1.1.0.0, jun/2026.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, PM_FIELD, prefix, stagingLine, pmToken } from './_shared'

const calculator: Calculator = {
  id: 'hn-mucosal-melanoma',
  name: 'Melanoma Mucoso de Cabeça e Pescoço',
  section: 'Cabeça e Pescoço',
  system: 'AJCC 8ª ed.',
  version: 'CAP — Mucosal Melanoma of the Head and Neck (Resection) v1.1.0.0',
  reference: 'AJCC Cancer Staging Manual, 8th ed.',
  summary: 'Estadiamento pTNM de melanoma mucoso de cabeça e pescoço. Não há pT1/pT2: a categoria mínima é pT3.',

  fields: [
    MOD_FIELD,
    {
      id: 'pT', label: 'Categoria pT — Tumor primário', type: 'select', default: 'T3',
      options: [
        { value: 'T3',  label: 'pT3 — limitado à mucosa e partes moles imediatamente subjacentes, independente de espessura ou dimensão' },                                                         // pT3: Tumors limited to the mucosa and immediately underlying soft tissue, regardless of thickness or greatest dimension; for example, polypoid nasal disease, pigmented or nonpigmented lesions of the oral cavity, pharynx, or larynx
        { value: 'T4a', label: 'pT4a — envolve partes moles profundas, cartilagem, osso ou pele sobrejacente' },                                                                                   // pT4a: Moderately advanced disease. Tumor involving deep soft tissue, cartilage, bone, or overlying skin
        { value: 'T4b', label: 'pT4b — envolve cérebro, dura, base do crânio, nervos cranianos baixos (IX–XII), espaço mastigador, carótida, espaço pré-vertebral ou estruturas mediastinais' }, // pT4b: Very advanced disease. Tumor involving brain, dura, skull base, lower cranial nerves (IX, X, XI, XII), masticator space, carotid artery, prevertebral space, or mediastinal structures
        { value: 'T4',  label: 'pT4 — subgrupo indeterminado' },                                                                                                                                    // pT4 (subgroup cannot be determined)
      ],
    },
    MULTI_FIELD,
    {
      id: 'pN', label: 'Categoria pN — Linfonodos regionais', type: 'select', default: 'none',
      options: [
        { value: 'none', label: 'pN não atribuído (sem linfonodos ou não determinável)' },
        { value: 'N0', label: 'pN0 — sem metástase em linfonodo regional' },       // pN0: No regional lymph node metastases
        { value: 'N1', label: 'pN1 — metástase em linfonodo regional presente' },  // pN1: Regional lymph node metastases present
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
