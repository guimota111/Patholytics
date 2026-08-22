/* ==========================================================================
   Carcinoma de Esôfago e Junção Esofagogástrica — AJCC 8ª edição
   Base: CAP Protocol – Esophagus (Resection) v4.2.0.1, jun/2022.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { numOf, strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, NODE_FIELDS, PM_FIELD, prefix, stagingLine, pmToken, nodeCategory, countWarning } from './_shared'

const calculator: Calculator = {
  id: 'esophagus',
  name: 'Carcinoma de Esôfago / JEG',
  section: 'Trato Gastrointestinal',
  system: 'AJCC 8ª ed.',
  version: 'CAP — Esophagus v4.2.0.1',
  reference: 'AJCC Cancer Staging Manual, 8th ed.',
  summary: 'Estadiamento pTNM de carcinoma de esôfago e junção esofagogástrica em espécime de ressecção.',

  fields: [
    MOD_FIELD,
    {
      id: 'pT', label: 'Categoria pT — Tumor primário', type: 'select', default: 'T2',
      options: [
        { value: 'T0',  label: 'pT0 — sem evidência de tumor primário' },                                   // pT0: No evidence of primary tumor
        { value: 'Tis', label: 'pTis — displasia de alto grau (células malignas confinadas ao epitélio)' }, // pTis: High-grade dysplasia, defined as malignant cells confined to the epithelium by the basement membrane
        { value: 'T1a', label: 'pT1a — invade lâmina própria ou muscular da mucosa' },                      // pT1a: Tumor invades the lamina propria or muscularis mucosae
        { value: 'T1b', label: 'pT1b — invade a submucosa' },                                                // pT1b: Tumor invades the submucosa
        { value: 'T1',  label: 'pT1 — subcategoria indeterminada' },                                         // pT1 (subcategory cannot be determined)
        { value: 'T2',  label: 'pT2 — invade a muscular própria' },                                          // pT2: Tumor invades the muscularis propria
        { value: 'T3',  label: 'pT3 — invade a adventícia' },                                                // pT3: Tumor invades adventitia
        { value: 'T4a', label: 'pT4a — invade pleura, pericárdio, veia ázigos, diafragma ou peritônio' },    // pT4a: Tumor invades the pleura, pericardium, azygos vein, diaphragm, or peritoneum
        { value: 'T4b', label: 'pT4b — invade outras estruturas adjacentes (aorta, corpo vertebral, via aérea)' }, // pT4b: Tumor invades other adjacent structures, such as the aorta, vertebral body, or airway
        { value: 'T4',  label: 'pT4 — subcategoria indeterminada' },                                         // pT4 (subcategory cannot be determined)
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

    // pN0: No regional lymph node metastasis
    // pN1: Metastasis in one or two regional lymph nodes
    // pN2: Metastasis in three to six regional lymph nodes
    // pN3: Metastasis in seven or more regional lymph nodes
    const N = nodeCategory(pos, [[0, 'N0'], [2, 'N1'], [6, 'N2'], [Infinity, 'N3']]);
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
