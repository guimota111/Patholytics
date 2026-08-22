/* ==========================================================================
   Sarcoma Uterino — AJCC 8ª edição / FIGO
   Base: CAP Protocol – Uterine Sarcoma v4.4.0.0, mar/2022.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { strOf } from '../types'
import { MOD_FIELD, prefix, stagingLine, pmToken } from './_shared'

const calculator: Calculator = {
  id: 'uterine-sarcoma',
  name: 'Sarcoma Uterino',
  section: 'Trato Ginecológico',
  system: 'AJCC 8ª ed.',
  version: 'CAP — Uterine Sarcoma v4.4.0.0',
  reference: 'AJCC Cancer Staging Manual, 8th ed.; FIGO',
  summary: 'Estadiamento pTNM de leiomiossarcoma, sarcoma do estroma endometrial, sarcoma indiferenciado e adenossarcoma, com estádio FIGO derivado.',

  fields: [
    MOD_FIELD,
    {
      id: 'histo', label: 'Tipo', type: 'radio', default: 'sarcoma',
      options: [
        { value: 'sarcoma',      label: 'Leiomiossarcoma / sarcoma do estroma endometrial / sarcoma indiferenciado' }, // For All Sarcomas Excluding Adenosarcoma
        { value: 'adenosarcoma', label: 'Adenossarcoma' },                                                             // For Adenosarcoma
      ],
    },
    {
      id: 'pTs', label: 'Categoria pT — Tumor primário', type: 'select', default: 'T1a',
      when: (v) => v.histo !== 'adenosarcoma',
      options: [
        { value: 'T0',  label: 'pT0 — sem evidência de tumor primário' },                          // pT0: No evidence of primary tumor
        { value: 'T1a', label: 'pT1a — limitado ao útero, ≤5 cm' },                                // pT1a: Tumor 5 cm or less in greatest dimension
        { value: 'T1b', label: 'pT1b — limitado ao útero, >5 cm' },                                // pT1b: Tumor more than 5 cm
        { value: 'T1',  label: 'pT1 — limitado ao útero, subcategoria indeterminada' },            // pT1 (subcategory cannot be determined)
        { value: 'T2a', label: 'pT2a — envolve anexos' },                                          // pT2a: Tumor involves adnexa
        { value: 'T2b', label: 'pT2b — envolve outros tecidos pélvicos' },                         // pT2b: Tumor involves other pelvic tissues
        { value: 'T2',  label: 'pT2 — além do útero, na pelve, subcategoria indeterminada' },      // pT2 (subcategory cannot be determined)
        { value: 'T3a', label: 'pT3a — infiltra tecidos abdominais em um sítio' },                 // pT3a: Tumor infiltrates abdominal tissues in one site
        { value: 'T3b', label: 'pT3b — infiltra tecidos abdominais em mais de um sítio' },         // pT3b: Tumor infiltrates abdominal tissues in more than one site
        { value: 'T3',  label: 'pT3 — subcategoria indeterminada' },                               // pT3 (subcategory cannot be determined)
        { value: 'T4',  label: 'pT4 — invade bexiga ou reto' },                                    // pT4: Tumor invades bladder or rectum
      ],
    },
    {
      id: 'pTa', label: 'Categoria pT — Tumor primário (adenossarcoma)', type: 'select', default: 'T1a',
      when: (v) => v.histo === 'adenosarcoma',
      options: [
        { value: 'T0',  label: 'pT0 — sem evidência de tumor primário' },                          // pT0: No evidence of primary tumor
        { value: 'T1a', label: 'pT1a — limitado ao endométrio / endocérvice' },                    // pT1a: Tumor limited to the endometrium / endocervix
        { value: 'T1b', label: 'pT1b — invade menos da metade do miométrio' },                     // pT1b: Tumor invades to less than half of the myometrium
        { value: 'T1c', label: 'pT1c — invade metade ou mais do miométrio' },                      // pT1c: Tumor invades one half or more of the myometrium
        { value: 'T1',  label: 'pT1 — limitado ao útero, subcategoria indeterminada' },            // pT1 (subcategory cannot be determined)
        { value: 'T2a', label: 'pT2a — envolve anexos' },                                          // pT2a: Tumor involves adnexa
        { value: 'T2b', label: 'pT2b — envolve outros tecidos pélvicos' },                         // pT2b: Tumor involves other pelvic tissues
        { value: 'T2',  label: 'pT2 — além do útero, na pelve, subcategoria indeterminada' },      // pT2 (subcategory cannot be determined)
        { value: 'T3a', label: 'pT3a — infiltra tecidos abdominais em um sítio' },                 // pT3a: Tumor infiltrates abdominal tissues in one site
        { value: 'T3b', label: 'pT3b — infiltra tecidos abdominais em mais de um sítio' },         // pT3b: Tumor infiltrates abdominal tissues in more than one site
        { value: 'T3',  label: 'pT3 — subcategoria indeterminada' },                               // pT3 (subcategory cannot be determined)
        { value: 'T4',  label: 'pT4 — invade bexiga ou reto' },                                    // pT4: Tumor invades bladder or rectum
      ],
    },
    {
      id: 'pN', label: 'Categoria pN — Linfonodos regionais', type: 'select', default: 'none',
      options: [
        { value: 'none',   label: 'pN não atribuído (sem linfonodos ou não determinável)' },
        { value: 'N0',     label: 'pN0 — sem metástase em linfonodo regional' },              // pN0: No regional lymph node metastasis
        { value: 'N0(i+)', label: 'pN0(i+) — células tumorais isoladas ≤0,2 mm' },            // pN0(i+): Isolated tumor cells in regional lymph node(s) no greater than 0.2 mm
        { value: 'N1',     label: 'pN1 — metástase em linfonodo regional' },                  // pN1: Regional lymph node metastasis
      ],
    },
    {
      id: 'M', label: 'Categoria pM — Metástase à distância', type: 'select', default: 'na',
      options: [
        { value: 'na', label: 'Não aplicável — pM não determinável neste espécime' },
        { value: 'M1', label: 'pM1 — metástase à distância (excl. anexos, tecidos pélvicos/abdominais e linfonodos regionais)' }, // pM1: Distant metastasis (excluding adnexa, pelvic, abdominal tissues, and regional lymph nodes)
      ],
    },
  ],

  compute(v) {
    const warnings: string[] = [];
    const pre = prefix(strOf(v.mod));
    const adeno = v.histo === 'adenosarcoma';
    const T = adeno ? strOf(v.pTa) : strOf(v.pTs);
    const N = v.pN === 'none' ? null : strOf(v.pN);
    const M1 = v.M === 'M1';

    const pT = `${pre}${T}`;
    const pN = N ? `${pre}${N}` : null;
    const pM = pmToken(strOf(v.M));

    return {
      tnm: [ { k: 'pT', v: pT }, { k: 'pN', v: pN ?? '—' }, { k: 'pM', v: pM ?? '—' } ],
      stageGroup: figoSarcoma(T, N, M1),
      warnings,
      report: stagingLine([pT, pN, pM]),
    };
  },
};

/* FIGO conforme listado no checklist da CAP (mesma tabela para sarcomas e
   adenossarcoma, com IC só no adenossarcoma): IIIC = linfonodos pélvicos/para-aórticos;
   IVA = bexiga/reto; IVB = à distância. */
function figoSarcoma(T: string, N: string | null, M1: boolean): string | null {
  if (M1) return 'FIGO IVB';
  if (T === 'T4') return 'FIGO IVA';
  if (N === 'N1') return 'FIGO IIIC';
  const byT: Record<string, string> = {
    T1a: 'IA', T1b: 'IB', T1c: 'IC', T1: 'I',
    T2a: 'IIA', T2b: 'IIB', T2: 'II',
    T3a: 'IIIA', T3b: 'IIIB', T3: 'III',
  };
  const stage = byT[T];
  return stage ? `FIGO ${stage}` : null;
}

export default calculator
