/* ==========================================================================
   Carcinoma de Células de Merkel — AJCC 8ª edição
   Base: CAP Protocol – Merkel Cell Carcinoma of the Skin v4.2.0.0.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, prefix, stagingLine, pmToken } from './_shared'

const calculator: Calculator = {
  id: 'skin-merkel',
  name: 'Carcinoma de Células de Merkel',
  section: 'Pele',
  system: 'AJCC 8ª ed.',
  version: 'CAP — Merkel Cell Carcinoma v4.2.0.0',
  reference: 'AJCC Cancer Staging Manual, 8th ed.',
  summary: 'Estadiamento pTNM de carcinoma de células de Merkel (pT pelo diâmetro clínico máximo).',

  fields: [
    MOD_FIELD,
    {
      id: 'pT', label: 'Categoria pT — Tumor primário', type: 'select', default: 'T1',
      hint: 'O pT usa o diâmetro clínico máximo do tumor.',
      options: [
        { value: 'T0',  label: 'pT0 — sem evidência de tumor primário' },                       // pT0: No evidence of primary tumor
        { value: 'Tis', label: 'pTis — tumor primário in situ' },                                // pTis: In situ primary tumor
        { value: 'T1',  label: 'pT1 — diâmetro clínico máximo ≤2 cm' },                         // pT1: Maximum clinical tumor diameter less than or equal to 2 cm
        { value: 'T2',  label: 'pT2 — >2 cm e ≤5 cm' },                                         // pT2: Maximum clinical tumor diameter greater than 2 cm but less than or equal to 5 cm
        { value: 'T3',  label: 'pT3 — >5 cm' },                                                 // pT3: Maximum clinical tumor diameter greater than 5 cm
        { value: 'T4',  label: 'pT4 — invade fáscia, músculo, cartilagem ou osso' },            // pT4: Primary tumor invades fascia, muscle, cartilage, or bone
      ],
    },
    MULTI_FIELD,
    {
      id: 'pN', label: 'Categoria pN — Linfonodos regionais', type: 'select', default: 'none',
      hint: 'pN1b depende de informação clínica; sem ela, use pN1.',
      options: [
        { value: 'none',    label: 'pN não atribuído (sem linfonodos ou não determinável)' },
        { value: 'N0',      label: 'pN0 — sem metástase linfonodal regional à avaliação patológica' },                                          // pN0: No regional lymph node metastasis detected on pathological evaluation
        { value: 'N1a(sn)', label: 'pN1a(sn) — metástase clinicamente oculta identificada só em linfonodo sentinela' },                         // pN1a(sn): Clinically occult regional lymph node metastasis identified only by sentinel lymph node biopsy
        { value: 'N1a',     label: 'pN1a — metástase clinicamente oculta após dissecção linfonodal' },                                          // pN1a: Clinically occult regional lymph node metastasis following lymph node dissection
        { value: 'N1b',     label: 'pN1b — metástase detectada clínica/radiologicamente, confirmada microscopicamente' },                       // pN1b: Clinically and / or radiologically detected regional lymph node metastasis, microscopically confirmed
        { value: 'N1',      label: 'pN1 — subcategoria indeterminada' },                                                                        // pN1 (subcategory cannot be determined)
        { value: 'N2',      label: 'pN2 — metástase em trânsito sem metástase linfonodal' },                                                    // pN2: In-transit metastasis (discontinuous from primary tumor; located between primary tumor and draining regional nodal basin, or distal to the primary tumor) without lymph node metastasis
        { value: 'N3',      label: 'pN3 — metástase em trânsito com metástase linfonodal' },                                                    // pN3: In-transit metastasis (...) with lymph node metastasis
      ],
    },
    {
      id: 'M', label: 'Categoria pM — Metástase à distância', type: 'select', default: 'na',
      options: [
        { value: 'na',  label: 'Não aplicável — pM não determinável neste espécime' },
        { value: 'M1a', label: 'pM1a — pele distante, subcutâneo distante ou linfonodo(s) distante(s)' }, // pM1a: Metastasis to distant skin, distant subcutaneous tissue, or distant lymph node(s), microscopically confirmed
        { value: 'M1b', label: 'pM1b — pulmão' },                                                         // pM1b: Metastasis to lung, microscopically confirmed
        { value: 'M1c', label: 'pM1c — todos os outros sítios distantes' },                               // pM1c: Metastasis to all other distant sites, microscopically confirmed
        { value: 'M1',  label: 'pM1 — subcategoria indeterminada' },                                      // pM1 (subcategory cannot be determined)
      ],
    },
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
