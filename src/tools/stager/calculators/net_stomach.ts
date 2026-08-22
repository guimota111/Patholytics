/* ==========================================================================
   Tumor Neuroendócrino Bem Diferenciado do Estômago — AJCC 9ª versão
   Base: CAP Protocol – Stomach NET v5.0.0.0, dez/2023.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { numOf, strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, NODE_FIELDS, PM_NET_OPTIONS, prefix, stagingLine, pmToken, nodeCategory, countWarning } from './_shared'

const calculator: Calculator = {
  id: 'net-stomach',
  name: 'NET de Estômago',
  section: 'Trato Gastrointestinal',
  system: 'AJCC 9ª versão',
  version: 'CAP — Stomach.NET v5.0.0.0',
  reference: 'AJCC Cancer Staging System, version 9',
  summary: 'Estadiamento pTNM de tumor neuroendócrino bem diferenciado do estômago. Carcinomas neuroendócrinos usam o checklist de carcinoma gástrico.',

  fields: [
    MOD_FIELD,
    {
      id: 'pT', label: 'Categoria pT — Tumor primário', type: 'select', default: 'T1',
      options: [
        { value: 'T0', label: 'pT0 — sem evidência de tumor primário' },                                                   // pT0: No evidence of primary tumor
        { value: 'T1', label: 'pT1 — invade mucosa ou submucosa e ≤1 cm' },                                                // pT1: Tumor invades the mucosa or submucosa, and is less than or equal to 1 cm in greatest dimension
        { value: 'T2', label: 'pT2 — invade a muscular própria ou >1 cm' },                                                // pT2: Tumor invades the muscularis propria or is greater than 1 cm in greatest dimension
        { value: 'T3', label: 'pT3 — atravessa a muscular própria até a subserosa, sem penetrar a serosa' },               // pT3: Tumor invades through the muscularis propria into subserosal tissue without penetration of overlying serosa
        { value: 'T4', label: 'pT4 — invade o peritônio visceral (serosa) ou outros órgãos/estruturas adjacentes' },       // pT4: Tumor invades visceral peritoneum (serosal) or other organs or adjacent structures
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
