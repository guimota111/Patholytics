/* ==========================================================================
   Carcinoma de Cavidade Oral — AJCC 8ª edição
   Base: CAP Protocol – Oral Cavity v4.3.0.0.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { numOf, strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, PM_FIELD, HN_PN_OPTIONS, prefix, stagingLine, pmToken } from './_shared'

const calculator: Calculator = {
  id: 'hn-oral',
  name: 'Carcinoma de Cavidade Oral',
  section: 'Cabeça e Pescoço',
  system: 'AJCC 8ª ed.',
  version: 'CAP — Oral Cavity v4.3.0.0',
  reference: 'AJCC Cancer Staging Manual, 8th ed.',
  summary: 'Estadiamento pTNM de carcinoma da cavidade oral; pT1–pT4a derivados do tamanho e da profundidade de invasão (DOI).',

  fields: [
    MOD_FIELD,
    {
      id: 'ptMode', label: 'Tumor primário', type: 'select', default: 'auto',
      options: [
        { value: 'tis',  label: 'pTis — carcinoma in situ' },                                                                                                                  // pTis: Carcinoma in situ
        { value: 'auto', label: 'Classificar por tamanho e profundidade de invasão (pT1–pT4a)' },
        { value: 't4a',  label: 'pT4a — invade estruturas adjacentes (osso cortical da mandíbula/maxila, seio maxilar, pele da face), independente do tamanho/DOI' },          // pT4a: (...) or tumor invades adjacent structures only (e.g., through cortical bone of the mandible or maxilla or involves the maxillary sinus or skin of the face)
        { value: 't4b',  label: 'pT4b — invade espaço mastigador, lâminas pterigoides ou base do crânio, e/ou envolve a carótida interna' },                                   // pT4b: Very advanced local disease. Tumor invades masticator space, pterygoid plates, or skull base, and / or encases internal carotid artery
        { value: 't4',   label: 'pT4 — subgrupo indeterminado' },                                                                                                              // pT4 (subgroup cannot be determined)
      ],
    },
    {
      id: 'sizeCm', label: 'Maior dimensão do tumor (cm)', type: 'number', min: 0,
      when: (v) => v.ptMode === 'auto',
    },
    {
      id: 'doiMm', label: 'Profundidade de invasão — DOI (mm)', type: 'number', min: 0,
      when: (v) => v.ptMode === 'auto',
      hint: 'Erosão superficial de osso/alvéolo por primário gengival não basta para pT4.',
    },
    MULTI_FIELD,
    {
      id: 'pN', label: 'Categoria pN — Linfonodos regionais', type: 'select', default: 'none',
      hint: 'Linfonodos de linha média contam como ipsilaterais. ENE = extensão extranodal.',
      options: HN_PN_OPTIONS,
    },
    PM_FIELD,
  ],

  compute(v) {
    const warnings: string[] = [];
    const pre = prefix(strOf(v.mod));
    let T = '';
    const mode = strOf(v.ptMode);
    if (mode === 'tis') T = 'Tis';
    else if (mode === 't4a') T = 'T4a';
    else if (mode === 't4b') T = 'T4b';
    else if (mode === 't4') T = 'T4';
    else {
      const s = numOf(v.sizeCm), d = numOf(v.doiMm);
      if (s == null || d == null) { T = 'TX'; warnings.push('Informe tamanho e DOI para definir pT1–pT4a.'); }
      // pT1: ≤2 cm with DOI ≤5 mm
      else if (s <= 2 && d <= 5) T = 'T1';
      // pT2: ≤2 cm with DOI >5 mm, or >2–4 cm with DOI ≤10 mm
      else if ((s <= 2 && d > 5) || (s > 2 && s <= 4 && d <= 10)) T = 'T2';
      // pT3: >2–4 cm with DOI >10 mm, or >4 cm with DOI ≤10 mm
      else if ((s > 2 && s <= 4 && d > 10) || (s > 4 && d <= 10)) T = 'T3';
      // pT4a: >4 cm with DOI >10 mm
      else T = 'T4a';
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
      report: stagingLine([pT, pN, pM]),
    };
  },
};

export default calculator
