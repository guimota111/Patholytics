/* ==========================================================================
   Carcinoma de Intestino Delgado — AJCC 8ª edição
   Base: CAP Protocol – Small Intestine (Resection) v4.3.0.0, jun/2025.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { numOf, strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, NODE_FIELDS, PM_FIELD, prefix, stagingLine, pmToken, nodeCategory, countWarning } from './_shared'

const calculator: Calculator = {
  id: 'small-intestine',
  name: 'Carcinoma de Intestino Delgado',
  section: 'Trato Gastrointestinal',
  system: 'AJCC 8ª ed.',
  version: 'CAP — Small Intestine v4.3.0.0',
  reference: 'AJCC Cancer Staging Manual, 8th ed.',
  summary: 'Estadiamento pTNM de carcinoma de duodeno, jejuno e íleo em espécime de ressecção.',

  fields: [
    MOD_FIELD,
    {
      id: 'pT', label: 'Categoria pT — Tumor primário', type: 'select', default: 'T3',
      options: [
        { value: 'T0',  label: 'pT0 — sem evidência de tumor primário' },                                  // pT0: No evidence of primary tumor
        { value: 'Tis', label: 'pTis — displasia de alto grau / carcinoma in situ' },                      // pTis: High-grade dysplasia / carcinoma in situ
        { value: 'T1a', label: 'pT1a — invade a lâmina própria' },                                          // pT1a: Tumor invades the lamina propria
        { value: 'T1b', label: 'pT1b — invade a submucosa' },                                               // pT1b: Tumor invades the submucosa
        { value: 'T1',  label: 'pT1 — subcategoria indeterminada' },                                        // pT1 (subcategory cannot be determined)
        { value: 'T2',  label: 'pT2 — invade a muscular própria' },                                         // pT2: Tumor invades the muscularis propria
        { value: 'T3',  label: 'pT3 — atravessa a muscular própria até subserosa ou tecido perimuscular não peritonizado (mesentério/retroperitônio), sem penetrar a serosa' }, // pT3: Tumor invades through the muscularis propria into the subserosa, or extends into nonperitonealized perimuscular tissue (mesentery or retroperitoneum) without serosal penetration
        { value: 'T4',  label: 'pT4 — perfura o peritônio visceral ou invade outros órgãos/estruturas (alças, mesentério adjacente, parede abdominal; duodeno: pâncreas ou ducto biliar)' }, // pT4: Tumor perforates the visceral peritoneum or directly invades other organs or structures (...)
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

    // pN1: Metastasis in one or two regional lymph nodes
    // pN2: Metastasis in three or more regional lymph nodes
    const N = nodeCategory(pos, [[0, 'N0'], [2, 'N1'], [Infinity, 'N2']]);
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
