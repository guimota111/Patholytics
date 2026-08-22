/* ==========================================================================
   Carcinoma de Tireoide — AJCC 8ª edição
   Base: CAP Protocol – Thyroid v4.4.0.0, jul/2026.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, PM_FIELD, prefix, stagingLine, pmToken } from './_shared'

const calculator: Calculator = {
  id: 'thyroid',
  name: 'Carcinoma de Tireoide',
  section: 'Sistema Endócrino',
  system: 'AJCC 8ª ed.',
  version: 'CAP — Thyroid v4.4.0.0',
  reference: 'AJCC Cancer Staging Manual, 8th ed.',
  summary: 'Estadiamento pTNM de carcinomas de células foliculares (incl. anaplásico) e carcinoma medular da tireoide.',

  fields: [
    MOD_FIELD,
    {
      id: 'pT', label: 'Categoria pT — Tumor primário', type: 'select', default: 'T1a',
      hint: 'Mesmas categorias para carcinomas de células foliculares e medular. Extensão extratireoidiana = macroscópica.',
      options: [
        { value: 'T0',  label: 'pT0 — sem evidência de tumor primário' },                                                                                     // pT0: No evidence of primary tumor
        { value: 'T1a', label: 'pT1a — ≤1 cm, limitado à tireoide' },                                                                                         // pT1a: Tumor less than or equal to 1 cm in greatest dimension, limited to the thyroid
        { value: 'T1b', label: 'pT1b — >1 cm e ≤2 cm, limitado à tireoide' },                                                                                 // pT1b: Tumor greater than 1 cm but less than or equal to 2 cm in greatest dimension, limited to the thyroid
        { value: 'T1',  label: 'pT1 — ≤2 cm, subcategoria indeterminada' },                                                                                   // pT1 (subcategory cannot be determined)
        { value: 'T2',  label: 'pT2 — >2 cm e ≤4 cm, limitado à tireoide' },                                                                                  // pT2: Tumor greater than 2 cm but less than or equal to 4 cm in greatest dimension, limited to thyroid
        { value: 'T3a', label: 'pT3a — >4 cm, limitado à tireoide' },                                                                                         // pT3a: Tumor greater than 4 cm limited to the thyroid
        { value: 'T3b', label: 'pT3b — extensão extratireoidiana macroscópica apenas aos músculos pré-tireoidianos (esterno-hióideo, esternotireóideo, tíreo-hióideo, omo-hióideo), qualquer tamanho' }, // pT3b: Gross extrathyroidal extension invading only strap muscles (sternohyoid, sternothyroid, thyrohyoid, or omohyoid muscles) from a tumor of any size
        { value: 'T3',  label: 'pT3 — subcategoria indeterminada' },                                                                                          // pT3 (subcategory cannot be determined)
        { value: 'T4a', label: 'pT4a — extensão macroscópica a subcutâneo, laringe, traqueia, esôfago ou nervo laríngeo recorrente' },                        // pT4a: Gross extrathyroidal extension invading subcutaneous soft tissues, larynx, trachea, esophagus, or recurrent laryngeal nerve from a tumor of any size
        { value: 'T4b', label: 'pT4b — extensão macroscópica à fáscia pré-vertebral, ou envolve a carótida ou vasos mediastinais' },                          // pT4b: Gross extrathyroidal extension invading prevertebral fascia or encasing the carotid artery or mediastinal vessels from a tumor of any size
        { value: 'T4',  label: 'pT4 — subcategoria indeterminada' },                                                                                          // pT4 (subcategory cannot be determined)
      ],
    },
    MULTI_FIELD,
    {
      id: 'pN', label: 'Categoria pN — Linfonodos regionais', type: 'select', default: 'none',
      options: [
        { value: 'none', label: 'pN não atribuído (sem linfonodos ou não determinável)' },
        { value: 'N0a',  label: 'pN0a — um ou mais linfonodos benignos confirmados citológica/histologicamente' },                         // pN0a: One or more cytologically or histologically confirmed benign lymph nodes
        { value: 'N0',   label: 'pN0 — subcategoria indeterminada' },                                                                       // pN0 (subcategory cannot be determined)
        { value: 'N1a',  label: 'pN1a — nível VI ou VII (pré-traqueal, paratraqueal, pré-laríngeo/Delphian, mediastino superior), uni ou bilateral' }, // pN1a: Metastasis to level VI or VII (pretracheal, paratracheal, or prelaryngeal / Delphian, or upper mediastinal) lymph nodes. This can be unilateral or bilateral disease.
        { value: 'N1b',  label: 'pN1b — cervicais laterais (níveis I–V) uni/bi/contralaterais ou retrofaríngeos' },                       // pN1b: Metastasis to unilateral, bilateral, or contralateral lateral neck lymph nodes (levels I, II, III, IV, or V) or retropharyngeal lymph nodes
        { value: 'N1',   label: 'pN1 — subcategoria indeterminada' },                                                                       // pN1 (subcategory cannot be determined)
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
