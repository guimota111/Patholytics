/* ==========================================================================
   Tumor Neuroendócrino Bem Diferenciado do Apêndice — AJCC 9ª versão
   Base: CAP Protocol – Appendix NET v5.0.0.0, dez/2023.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { numOf, strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, NODE_FIELDS, PM_NET_OPTIONS, prefix, stagingLine, pmToken, nodeCategory, countWarning } from './_shared'

const calculator: Calculator = {
  id: 'net-appendix',
  name: 'NET de Apêndice',
  section: 'Trato Gastrointestinal',
  system: 'AJCC 9ª versão',
  version: 'CAP — Appendix.NET v5.0.0.0',
  reference: 'AJCC Cancer Staging System, version 9',
  summary: 'Estadiamento pTNM de tumor neuroendócrino bem diferenciado do apêndice. Carcinomas neuroendócrinos usam o checklist de carcinoma de apêndice.',

  fields: [
    MOD_FIELD,
    {
      id: 'pT', label: 'Categoria pT — Tumor primário', type: 'select', default: 'T1',
      options: [
        { value: 'T0', label: 'pT0 — sem evidência de tumor primário' },                                                              // pT0: No evidence of primary tumor
        { value: 'T1', label: 'pT1 — ≤2 cm na maior dimensão' },                                                                      // pT1: Tumor less than or equal to 2 cm in greatest dimension
        { value: 'T2', label: 'pT2 — >2 cm e ≤4 cm' },                                                                                // pT2: Tumor greater than 2 cm but less than or equal to 4 cm in greatest dimension
        { value: 'T3', label: 'pT3 — >4 cm, ou invasão da subserosa, ou envolvimento do mesoapêndice' },                              // pT3: Tumor greater than 4 cm in greatest dimension, or with subserosal invasion, or involvement of the mesoappendix
        { value: 'T4', label: 'pT4 — perfura o peritônio ou invade órgãos/estruturas adjacentes (ex.: parede abdominal, músculo esquelético)' }, // pT4: Tumor perforates the peritoneum, or directly invades other adjacent organs or structures (excluding direct mural extension to adjacent subserosa of adjacent bowel), e.g., abdominal wall and skeletal muscle
      ],
    },
    MULTI_FIELD,
    ...NODE_FIELDS,
    { id: 'M', label: 'Categoria pM — Metástase à distância', type: 'select', default: 'na', options: PM_NET_OPTIONS },
  ],

  compute(v) {
    const warnings: string[] = [];
    const pre = prefix(strOf(v.mod));
    const T = strOf(v.pT);
    const mSuffix = v.multi === 'yes' ? '(m)' : '';
    const pos = numOf(v.nPositive), exam = numOf(v.nExamined);

    // pN0: No tumor involvement of regional lymph node(s) / pN1: Tumor involvement of regional lymph node(s)
    const N = nodeCategory(pos, [[0, 'N0'], [Infinity, 'N1']]);
    const w = countWarning(exam, pos); if (w) warnings.push(w);

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
