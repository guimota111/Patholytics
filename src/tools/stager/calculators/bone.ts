/* ==========================================================================
   Tumores Malignos do Osso — AJCC 8ª edição
   Base: CAP Protocol – Bone (Resection) v4.2.0.0.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { numOf, strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, NODE_FIELDS, prefix, stagingLine, pmToken, nodeCategory, countWarning } from './_shared'

const calculator: Calculator = {
  id: 'bone',
  name: 'Tumor Maligno do Osso',
  section: 'Tecidos Moles e Osso',
  system: 'AJCC 8ª ed.',
  version: 'CAP — Bone (Resection) v4.2.0.0',
  reference: 'AJCC Cancer Staging Manual, 8th ed.',
  summary: 'Estadiamento pTNM de sarcomas ósseos; a escala de pT muda entre esqueleto apendicular/tronco/crânio, coluna e pelve.',

  fields: [
    MOD_FIELD,
    {
      id: 'site', label: 'Sítio anatômico', type: 'radio', default: 'appendicular',
      options: [
        { value: 'appendicular', label: 'Esqueleto apendicular, tronco, crânio e ossos da face' }, // Appendicular skeleton, trunk, skull, and facial bones
        { value: 'spine',        label: 'Coluna vertebral' },                                       // Spine
        { value: 'pelvis',       label: 'Pelve' },                                                  // Pelvis
      ],
    },
    {
      id: 'pTa', label: 'Categoria pT — apendicular / tronco / crânio / face', type: 'select', default: 'T1',
      when: (v) => v.site === 'appendicular',
      options: [
        { value: 'T0', label: 'pT0 — sem evidência de tumor primário' },                    // pT0: No evidence of primary tumor
        { value: 'T1', label: 'pT1 — ≤8 cm na maior dimensão' },                            // pT1: Tumor less than or equal to 8 cm in greatest dimension
        { value: 'T2', label: 'pT2 — >8 cm na maior dimensão' },                            // pT2: Tumor greater than 8 cm in greatest dimension
        { value: 'T3', label: 'pT3 — tumores descontínuos no sítio ósseo primário' },       // pT3: Discontinuous tumors in the primary bone site
      ],
    },
    {
      id: 'pTs', label: 'Categoria pT — coluna', type: 'select', default: 'T1',
      when: (v) => v.site === 'spine',
      options: [
        { value: 'T0',  label: 'pT0 — sem evidência de tumor primário' },                                                  // pT0: No evidence of primary tumor
        { value: 'T1',  label: 'pT1 — confinado a um segmento vertebral ou dois adjacentes' },                             // pT1: Tumor confined to one vertebral segment or two adjacent vertebral segments
        { value: 'T2',  label: 'pT2 — confinado a três segmentos adjacentes' },                                            // pT2: Tumor confined to three adjacent vertebral segments
        { value: 'T3',  label: 'pT3 — quatro ou mais segmentos adjacentes, ou segmentos não adjacentes' },                 // pT3: Tumor confined to four or more adjacent vertebral segments, or any nonadjacent vertebral segments
        { value: 'T4a', label: 'pT4a — extensão ao canal medular' },                                                       // pT4a: Extension into the spinal canal
        { value: 'T4b', label: 'pT4b — invasão vascular macroscópica ou trombo tumoral nos grandes vasos' },               // pT4b: Evidence of gross vascular invasion or tumor thrombus in the great vessels
        { value: 'T4',  label: 'pT4 — subcategoria indeterminada' },                                                       // pT4 (subcategory cannot be determined)
      ],
    },
    {
      id: 'pTp', label: 'Categoria pT — pelve', type: 'select', default: 'T1a',
      when: (v) => v.site === 'pelvis',
      options: [
        { value: 'T0',  label: 'pT0 — sem evidência de tumor primário' },                                                                    // pT0: No evidence of primary tumor
        { value: 'T1a', label: 'pT1a — um segmento pélvico sem extensão extraóssea, ≤8 cm' },                                                // pT1a: Tumor less than or equal to 8 cm in greatest dimension (confined to one pelvic segment with no extraosseous extension)
        { value: 'T1b', label: 'pT1b — um segmento pélvico sem extensão extraóssea, >8 cm' },                                                // pT1b: Tumor greater than 8 cm in greatest dimension
        { value: 'T1',  label: 'pT1 — subcategoria indeterminada' },                                                                         // pT1 (subcategory cannot be determined)
        { value: 'T2a', label: 'pT2a — um segmento com extensão extraóssea, ou dois segmentos sem; ≤8 cm' },                                 // pT2a: Tumor less than or equal to 8 cm (confined to one pelvic segment with extraosseous extension or two segments without extraosseous extension)
        { value: 'T2b', label: 'pT2b — idem, >8 cm' },                                                                                       // pT2b: Tumor greater than 8 cm in greatest dimension
        { value: 'T2',  label: 'pT2 — subcategoria indeterminada' },                                                                         // pT2 (subcategory cannot be determined)
        { value: 'T3a', label: 'pT3a — dois segmentos pélvicos com extensão extraóssea, ≤8 cm' },                                            // pT3a: Tumor less than or equal to 8 cm (spanning two pelvic segments with extraosseous extension)
        { value: 'T3b', label: 'pT3b — idem, >8 cm' },                                                                                       // pT3b: Tumor greater than 8 cm in greatest dimension
        { value: 'T3',  label: 'pT3 — subcategoria indeterminada' },                                                                         // pT3 (subcategory cannot be determined)
        { value: 'T4a', label: 'pT4a — envolve a articulação sacroilíaca e estende-se medialmente ao forame sacral' },                       // pT4a: Tumor involves sacroiliac joint and extends medial to the sacral neuroforamen
        { value: 'T4b', label: 'pT4b — envolve os vasos ilíacos externos ou trombo tumoral macroscópico nos grandes vasos pélvicos' },       // pT4b: Tumor encasement of external iliac vessels or presence of gross tumor thrombus in major pelvic vessels
        { value: 'T4',  label: 'pT4 — subcategoria indeterminada' },                                                                         // pT4 (subcategory cannot be determined)
      ],
    },
    MULTI_FIELD,
    ...NODE_FIELDS,
    {
      id: 'M', label: 'Categoria pM — Metástase à distância', type: 'select', default: 'na',
      options: [
        { value: 'na',  label: 'Não aplicável — pM não determinável neste espécime' },
        { value: 'M1a', label: 'pM1a — pulmão' },                           // pM1a: Lung
        { value: 'M1b', label: 'pM1b — osso ou outros sítios distantes' },  // pM1b: Bone or other distant sites
        { value: 'M1',  label: 'pM1 — subcategoria indeterminada' },        // pM1 (subcategory cannot be determined)
      ],
    },
  ],

  compute(v) {
    const warnings: string[] = [];
    const pre = prefix(strOf(v.mod));
    const T = v.site === 'spine' ? strOf(v.pTs) : v.site === 'pelvis' ? strOf(v.pTp) : strOf(v.pTa);
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
