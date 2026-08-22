/* ==========================================================================
   Tumor Estromal Gastrointestinal (GIST) — AJCC 8ª edição
   Base: CAP Protocol – GIST (Resection) v4.3.0.0, dez/2022.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { numOf, strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, PM_FIELD, prefix, stagingLine, pmToken } from './_shared'

const calculator: Calculator = {
  id: 'gist',
  name: 'GIST — Tumor Estromal Gastrointestinal',
  section: 'Trato Gastrointestinal',
  system: 'AJCC 8ª ed.',
  version: 'CAP — GIST (Resection) v4.3.0.0',
  reference: 'AJCC Cancer Staging Manual, 8th ed.',
  summary: 'Estadiamento pTNM de GIST por tamanho, com grau histológico pelo índice mitótico (por 5 mm²).',

  fields: [
    MOD_FIELD,
    {
      id: 'ptMode', label: 'Tumor primário', type: 'select', default: 'size',
      options: [
        { value: 't0',   label: 'pT0 — sem evidência de tumor primário' },   // pT0: No evidence of primary tumor
        { value: 'size', label: 'Classificar pelo tamanho (pT1–pT4)' },
      ],
    },
    {
      id: 'sizeCm', label: 'Maior dimensão do tumor (cm)', type: 'number', min: 0,
      when: (v) => v.ptMode === 'size',
      hint: 'pT1 ≤2; pT2 >2 a 5; pT3 >5 a 10; pT4 >10 cm.',
    },
    {
      id: 'mitoses', label: 'Índice mitótico (mitoses por 5 mm²)', type: 'number', min: 0,
      hint: 'G1 (baixo grau) ≤5; G2 (alto grau) >5 por 5 mm².',
    },
    MULTI_FIELD,
    {
      id: 'pN', label: 'Categoria pN — Linfonodos regionais', type: 'select', default: 'none',
      hint: 'Sem linfonodos no espécime (comum em GIST) o pN não é atribuído — pNX não se usa.',
      options: [
        { value: 'none', label: 'pN não atribuído (sem linfonodos submetidos/encontrados)' }, // pN not assigned (no nodes submitted or found) — pNX is not used for GIST
        { value: 'N0',   label: 'pN0 — sem metástase em linfonodo regional' },                 // pN0: No regional lymph node metastasis
        { value: 'N1',   label: 'pN1 — metástase em linfonodo regional' },                     // pN1: Regional lymph node metastasis
      ],
    },
    PM_FIELD,
  ],

  compute(v) {
    const warnings: string[] = [];
    const pre = prefix(strOf(v.mod));
    let T = '';
    if (v.ptMode === 't0') T = 'T0';
    else {
      const s = numOf(v.sizeCm);
      // pT1: 2 cm or less / pT2: >2 but ≤5 / pT3: >5 but ≤10 / pT4: >10 cm
      if (s == null) { T = 'TX'; warnings.push('Informe o tamanho do tumor para definir pT1–pT4.'); }
      else if (s <= 2) T = 'T1';
      else if (s <= 5) T = 'T2';
      else if (s <= 10) T = 'T3';
      else T = 'T4';
    }
    const mSuffix = v.multi === 'yes' ? '(m)' : '';
    const N = v.pN === 'none' ? null : strOf(v.pN);

    // G1, low grade (mitotic rate ≤5 per 5 mm²) / G2, high grade (>5 per 5 mm²)
    const mit = numOf(v.mitoses);
    const grade = mit == null ? null : (mit <= 5 ? 'G1' : 'G2');

    const pT = `${pre}${T}${mSuffix}`;
    const pN = N ? `${pre}${N}` : null;
    const pM = pmToken(strOf(v.M));

    const parts = [stagingLine([pT, pN, pM])];
    if (grade) parts.push(`Grau histológico: ${grade} (${mit} mitoses/5 mm²).`);

    return {
      tnm: [
        { k: 'pT', v: pT }, { k: 'pN', v: pN ?? '—' }, { k: 'pM', v: pM ?? '—' },
        { k: 'Grau', v: grade ?? '—' },
      ],
      stageGroup: null,
      warnings,
      report: parts.join(' '),
    };
  },
};

export default calculator
