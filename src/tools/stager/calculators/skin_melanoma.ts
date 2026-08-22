/* ==========================================================================
   Melanoma Cutâneo Invasivo — AJCC 8ª edição
   Base: CAP Protocol – Invasive Melanoma of the Skin (Resection) v1.2.0.0, mar/2025.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { numOf, strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, prefix, stagingLine, pmToken } from './_shared'

const calculator: Calculator = {
  id: 'skin-melanoma',
  name: 'Melanoma Cutâneo',
  section: 'Pele',
  system: 'AJCC 8ª ed.',
  version: 'CAP — Invasive Melanoma of the Skin (Resection) v1.2.0.0',
  reference: 'AJCC Cancer Staging Manual, 8th ed.',
  summary: 'Estadiamento pTNM de melanoma cutâneo invasivo (pT por espessura de Breslow e ulceração).',

  fields: [
    MOD_FIELD,
    {
      id: 'ptMode', label: 'Tumor primário', type: 'select', default: 'breslow',
      options: [
        { value: 't0',      label: 'pT0 — sem evidência de tumor primário (primário desconhecido ou regressão completa)' }, // pT0: No evidence of primary tumor (e.g., unknown primary or completely regressed melanoma)
        { value: 'breslow', label: 'Classificar por espessura (Breslow) e ulceração' },
      ],
    },
    {
      id: 'breslowMm', label: 'Espessura de Breslow (mm)', type: 'number', min: 0,
      when: (v) => v.ptMode === 'breslow',
      hint: 'pT1 ≤1,0; pT2 >1,0 a 2,0; pT3 >2,0 a 4,0; pT4 >4,0 mm.',
    },
    {
      id: 'ulcer', label: 'Ulceração', type: 'radio', default: 'no',
      when: (v) => v.ptMode === 'breslow',
      options: [
        { value: 'no',      label: 'Ausente' },
        { value: 'yes',     label: 'Presente' },
        { value: 'unknown', label: 'Desconhecida / não especificada' },
      ],
    },
    MULTI_FIELD,
    {
      id: 'pN', label: 'Categoria pN — Linfonodos regionais', type: 'select', default: 'none',
      hint: 'pN1b/2b/3b dependem de informação clínica; sem ela, use a categoria-mãe (pN1/pN2/pN3).',
      options: [
        { value: 'none', label: 'pN não atribuído (sem linfonodos ou não determinável)' },
        { value: 'N0',  label: 'pN0 — sem metástase linfonodal regional e sem metástase em trânsito / satélite' },                                                                 // pN0: No regional lymph node metastases detected and absence of in-transit, and / or, (macroscopic or microscopic) satellite metastases
        { value: 'N1a', label: 'pN1a — 1 linfonodo clinicamente oculto (sentinela); sem em trânsito / satélite' },                                                                 // pN1a: One clinically occult tumor-involved regional lymph node (i.e., detected by sentinel lymph node biopsy) and absence of in-transit, and / or satellite metastases
        { value: 'N1b', label: 'pN1b — 1 linfonodo clinicamente detectado; sem em trânsito / satélite' },                                                                          // pN1b: One clinically detected tumor-involved regional lymph node and absence of in-transit, and / or satellite metastases
        { value: 'N1c', label: 'pN1c — sem linfonodo acometido, com metástase em trânsito e/ou satélite' },                                                                        // pN1c: No regional lymph node disease with presence of in-transit, and / or satellite metastases
        { value: 'N1',  label: 'pN1 — subcategoria indeterminada' },                                                                                                               // pN1 (subcategory cannot be determined)
        { value: 'N2a', label: 'pN2a — 2–3 linfonodos clinicamente ocultos; sem em trânsito / satélite' },                                                                         // pN2a: Two or three clinically occult tumor-involved regional lymph nodes (i.e., detected by sentinel lymph node biopsy) and absence of in-transit, and / or satellite metastases
        { value: 'N2b', label: 'pN2b — 2–3 linfonodos, ao menos 1 clinicamente detectado; sem em trânsito / satélite' },                                                           // pN2b: Two or three tumor-involved regional lymph nodes, at least one of which was clinically detected and absence of in-transit, and / or satellite metastases
        { value: 'N2c', label: 'pN2c — 1 linfonodo (oculto ou detectado) com metástase em trânsito e/ou satélite' },                                                               // pN2c: One clinically occult or clinically detected tumor-involved regional lymph node with presence of in-transit, and / or satellite metastases
        { value: 'N2',  label: 'pN2 — subcategoria indeterminada' },                                                                                                               // pN2 (subcategory cannot be determined)
        { value: 'N3a', label: 'pN3a — ≥4 linfonodos clinicamente ocultos; sem em trânsito / satélite' },                                                                          // pN3a: Four or more clinically occult tumor-involved regional lymph nodes (i.e., detected by sentinel lymph node biopsy) and absence of in-transit, and / or satellite metastases
        { value: 'N3b', label: 'pN3b — ≥4 linfonodos, ao menos 1 clinicamente detectado, ou linfonodos coalescentes; sem em trânsito / satélite' },                                // pN3b: Four or more tumor-involved regional lymph nodes, at least one of which was clinically detected and absence of in-transit, and / or satellite metastases; OR presence of any number of matted lymph nodes, and absence of in-transit, and / or satellite metastases
        { value: 'N3c', label: 'pN3c — ≥2 linfonodos (ocultos ou detectados) e/ou coalescentes, com metástase em trânsito e/ou satélite' },                                        // pN3c: Two or more clinically occult or clinically detected tumor-involved regional lymph nodes with presence of in-transit, and / or satellite metastases; AND / OR any number of matted lymph nodes and presence of in-transit, and / or satellite metastases
        { value: 'N3',  label: 'pN3 — subcategoria indeterminada' },                                                                                                               // pN3 (subcategory cannot be determined)
      ],
    },
    {
      id: 'M', label: 'Categoria pM — Metástase à distância', type: 'select', default: 'na',
      options: [
        { value: 'na',  label: 'Não aplicável — pM não determinável neste espécime' },
        { value: 'M1a', label: 'pM1a — pele (incl. subcutâneo), partes moles incl. músculo e/ou linfonodos não regionais' }, // pM1a: Distant metastasis in skin (including subcutaneous tissues), soft tissues including muscle and / or non-regional lymph node(s)
        { value: 'M1b', label: 'pM1b — pulmão, com ou sem sítios M1a' },                                                      // pM1b: Distant metastasis to lung with or without M1a sites of disease
        { value: 'M1c', label: 'pM1c — vísceras não SNC, com ou sem sítios M1a/M1b' },                                        // pM1c: Distant metastasis to non-CNS visceral sites with or without M1a or M1b sites of disease
        { value: 'M1d', label: 'pM1d — SNC, com ou sem sítios M1a/M1b/M1c' },                                                 // pM1d: Distant metastasis to CNS with or without M1a, M1b, or M1c sites of disease
        { value: 'M1',  label: 'pM1 — subcategoria indeterminada' },                                                          // pM1 (subcategory cannot be determined)
      ],
    },
  ],

  compute(v) {
    const warnings: string[] = [];
    const pre = prefix(strOf(v.mod));
    let T = '';
    if (v.ptMode === 't0') T = 'T0';
    else {
      const b = numOf(v.breslowMm);
      const u = strOf(v.ulcer); // 'no' | 'yes' | 'unknown'
      const sub = (base: string) => (u === 'no' ? base + 'a' : u === 'yes' ? base + 'b' : base);
      if (b == null) { T = 'TX'; warnings.push('Informe a espessura de Breslow para definir pT1–pT4.'); }
      // pT1a: <0.8 mm without ulceration / pT1b: <0.8 mm with ulceration, or 0.8–1.0 mm with or without ulceration
      else if (b < 0.8) T = sub('T1');
      else if (b <= 1.0) T = 'T1b';
      // pT2: >1.0–2.0 mm / pT3: >2.0–4.0 mm / pT4: >4.0 mm (a = without, b = with ulceration)
      else if (b <= 2.0) T = sub('T2');
      else if (b <= 4.0) T = sub('T3');
      else T = sub('T4');
      if (b != null && b >= 0.8 && b <= 1.0 && u === 'unknown') {
        warnings.push('Entre 0,8 e 1,0 mm a categoria é pT1b independentemente da ulceração.');
      }
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
