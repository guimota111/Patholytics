/* ==========================================================================
   Carcinoma de Canal Anal — AJCC 9ª versão
   Base: CAP Protocol – Anus (Resection) v5.0.0.0, jun/2022.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { numOf, strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, PM_FIELD, prefix, stagingLine, pmToken } from './_shared'

const calculator: Calculator = {
  id: 'anus',
  name: 'Carcinoma de Canal Anal',
  section: 'Trato Gastrointestinal',
  system: 'AJCC 9ª versão',
  version: 'CAP — Anus (Resection) v5.0.0.0',
  reference: 'AJCC Cancer Staging System, version 9',
  summary: 'Estadiamento pTNM de carcinoma do canal anal em ressecção abdominoperineal (pT por tamanho).',

  fields: [
    MOD_FIELD,
    {
      id: 'ptMode', label: 'Tumor primário', type: 'select', default: 'size',
      options: [
        { value: 't0',   label: 'pT0 — sem evidência de tumor primário' },                            // pT0: No evidence of primary tumor
        { value: 'size', label: 'Classificar pelo tamanho (pT1–pT3)' },
        { value: 't4',   label: 'pT4 — qualquer tamanho, invade órgão adjacente (vagina, uretra, bexiga)' }, // pT4: Tumor of any size invading adjacent organ(s), such as the vagina, urethra, or bladder
      ],
    },
    {
      id: 'sizeCm', label: 'Maior dimensão do tumor (cm)', type: 'number', min: 0,
      when: (v) => v.ptMode === 'size',
      hint: 'pT1 ≤2 cm; pT2 >2 a 5 cm; pT3 >5 cm.',
    },
    MULTI_FIELD,
    {
      id: 'pN', label: 'Categoria pN — Linfonodos regionais', type: 'select', default: 'none',
      options: [
        { value: 'none', label: 'pN não atribuído (sem linfonodos ou não determinável)' },
        { value: 'N0',   label: 'pN0 — sem acometimento de linfonodo regional' },                                              // pN0: No tumor involvement of regional lymph node(s)
        { value: 'N1a',  label: 'pN1a — inguinal, mesorretal, retal superior, ilíaco interno ou obturador' },                  // pN1a: Tumor involvement of inguinal, mesorectal, superior rectal, internal iliac or obturator lymph node(s)
        { value: 'N1b',  label: 'pN1b — ilíaco externo' },                                                                     // pN1b: Tumor involvement of external iliac lymph node(s)
        { value: 'N1c',  label: 'pN1c — ilíaco externo (N1b) + qualquer linfonodo N1a' },                                      // pN1c: Tumor involvement of N1b (external iliac) with any N1a node(s)
        { value: 'N1',   label: 'pN1 — subcategoria indeterminada' },                                                         // pN1 (subcategory cannot be determined)
      ],
    },
    PM_FIELD,
  ],

  compute(v) {
    const warnings: string[] = [];
    const pre = prefix(strOf(v.mod));
    let T = '';
    if (v.ptMode === 't0') T = 'T0';
    else if (v.ptMode === 't4') T = 'T4';
    else {
      const s = numOf(v.sizeCm);
      // pT1: ≤2 cm / pT2: >2 but ≤5 cm / pT3: >5 cm
      if (s == null) { T = 'TX'; warnings.push('Informe o tamanho do tumor para definir pT1–pT3.'); }
      else if (s <= 2) T = 'T1';
      else if (s <= 5) T = 'T2';
      else T = 'T3';
    }
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
