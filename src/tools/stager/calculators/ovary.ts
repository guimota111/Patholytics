/* ==========================================================================
   Carcinoma de Ovário, Tuba Uterina e Peritônio — AJCC 8ª edição / FIGO 2014
   Base: CAP Protocol – Ovary, Fallopian Tube, or Primary Peritoneum v1.5.0.0, jun/2024.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, prefix, stagingLine, pmToken } from './_shared'

const calculator: Calculator = {
  id: 'ovary',
  name: 'Carcinoma de Ovário / Tuba / Peritônio',
  section: 'Trato Ginecológico',
  system: 'AJCC 8ª ed.',
  version: 'CAP — Ovary, Fallopian Tube, or Primary Peritoneum v1.5.0.0',
  reference: 'AJCC Cancer Staging Manual, 8th ed.; FIGO 2014',
  summary: 'Estadiamento pTNM de tumores malignos e borderline do ovário, tuba uterina e peritônio primário, com estádio FIGO derivado.',

  fields: [
    MOD_FIELD,
    {
      id: 'pT', label: 'Categoria pT — Tumor primário', type: 'select', default: 'T1a',
      options: [
        { value: 'T0',   label: 'pT0 — sem evidência de tumor primário' },                                                                                  // pT0: No evidence of primary tumor
        { value: 'T1a',  label: 'pT1a — limitado a um ovário (cápsula íntegra) ou tuba; sem tumor na superfície; lavado/ascite negativos' },               // pT1a: Tumor limited to one ovary (capsule intact) or fallopian tube, no tumor on ovarian or fallopian tube surface; no malignant cells in ascites or peritoneal washings
        { value: 'T1b',  label: 'pT1b — limitado a ambos os ovários (cápsulas íntegras) ou tubas; sem tumor na superfície; lavado/ascite negativos' },     // pT1b: Tumor limited to both ovaries (capsules intact) or fallopian tubes; no tumor on ovarian or fallopian tube surface; no malignant cells in ascites or peritoneal washings
        { value: 'T1c1', label: 'pT1c1 — rotura cirúrgica (surgical spill)' },                                                                              // pT1c1: Surgical spill
        { value: 'T1c2', label: 'pT1c2 — cápsula rota antes da cirurgia ou tumor na superfície ovariana/tubária' },                                         // pT1c2: Capsule ruptured before surgery or tumor on ovarian or fallopian tube surface
        { value: 'T1c3', label: 'pT1c3 — células malignas na ascite ou no lavado peritoneal' },                                                             // pT1c3: Malignant cells in ascites or peritoneal washings
        { value: 'T1',   label: 'pT1 — limitado a ovários/tubas, subcategoria indeterminada' },                                                             // pT1 (subcategory cannot be determined)
        { value: 'T2a',  label: 'pT2a — extensão e/ou implantes em útero, tubas e/ou ovários' },                                                            // pT2a: Extension and / or implants on the uterus and / or fallopian tube(s) and / or ovaries
        { value: 'T2b',  label: 'pT2b — extensão e/ou implantes em outros tecidos pélvicos' },                                                             // pT2b: Extension to and / or implants on other pelvic tissues
        { value: 'T2',   label: 'pT2 — extensão pélvica, subcategoria indeterminada' },                                                                     // pT2 (subcategory cannot be determined)
        { value: 'T3a',  label: 'pT3a — metástase peritoneal extrapélvica microscópica (± linfonodos retroperitoneais)' },                                  // pT3a: Microscopic extrapelvic (above the pelvic brim) peritoneal involvement with or without positive retroperitoneal lymph nodes
        { value: 'T3b',  label: 'pT3b — metástase peritoneal extrapélvica macroscópica ≤2 cm (± linfonodos retroperitoneais)' },                            // pT3b: Macroscopic peritoneal metastasis beyond pelvis 2 cm or less in greatest dimension with or without metastasis to the retroperitoneal lymph nodes
        { value: 'T3c',  label: 'pT3c — metástase peritoneal extrapélvica macroscópica >2 cm (incl. cápsula hepática/esplênica sem parênquima)' },         // pT3c: Macroscopic peritoneal metastasis beyond the pelvis more than 2 cm in greatest dimension with or without metastasis to the retroperitoneal lymph nodes (includes extension of tumor to capsule of liver and spleen without parenchymal involvement of either organ)
        { value: 'T3',   label: 'pT3 — subcategoria indeterminada' },                                                                                      // pT3 (subcategory cannot be determined)
      ],
    },
    MULTI_FIELD,
    {
      id: 'pN', label: 'Categoria pN — Linfonodos regionais', type: 'select', default: 'none',
      hint: 'Regionais: pélvicos, para-aórticos e retroperitoneais. Tamanho = do depósito, não do linfonodo.',
      options: [
        { value: 'none',   label: 'pN não atribuído (sem linfonodos ou não determinável)' },
        { value: 'N0',     label: 'pN0 — sem metástase em linfonodo regional' },                                     // pN0: No regional lymph node metastasis
        { value: 'N0(i+)', label: 'pN0(i+) — células tumorais isoladas ≤0,2 mm' },                                   // pN0(i+): Isolated tumor cells in regional lymph node(s) no greater than 0.2 mm
        { value: 'N1a',    label: 'pN1a — metástase retroperitoneal até 10 mm' },                                    // pN1a: Metastasis up to and including 10 mm in greatest dimension
        { value: 'N1b',    label: 'pN1b — metástase retroperitoneal >10 mm' },                                       // pN1b: Metastasis more than 10 mm in greatest dimension
        { value: 'N1',     label: 'pN1 — subcategoria indeterminada' },                                              // pN1 (subcategory cannot be determined)
      ],
    },
    {
      id: 'M', label: 'Categoria pM — Metástase à distância', type: 'select', default: 'na',
      options: [
        { value: 'na',  label: 'Não aplicável — pM não determinável neste espécime' },
        { value: 'M1a', label: 'pM1a — derrame pleural com citologia positiva' },                                                                  // pM1a: Pleural effusion with positive cytology
        { value: 'M1b', label: 'pM1b — parênquima hepático/esplênico; órgãos extra-abdominais (incl. linfonodos inguinais/extra-abdominais); intestino transmural' }, // pM1b: Liver or splenic parenchymal metastases; metastases to extra-abdominal organs (including inguinal lymph nodes and lymph nodes outside the abdominal cavity); transmural involvement of intestine
        { value: 'M1',  label: 'pM1 — subcategoria indeterminada' },                                                                               // pM1 (subcategory cannot be determined)
      ],
    },
  ],

  compute(v) {
    const warnings: string[] = [];
    const pre = prefix(strOf(v.mod));
    const T = strOf(v.pT);
    const mSuffix = v.multi === 'yes' ? '(m)' : '';
    const N = v.pN === 'none' ? null : strOf(v.pN);
    const M = strOf(v.M);

    const pT = `${pre}${T}${mSuffix}`;
    const pN = N ? `${pre}${N}` : null;
    const pM = pmToken(M);

    return {
      tnm: [ { k: 'pT', v: pT }, { k: 'pN', v: pN ?? '—' }, { k: 'pM', v: pM ?? '—' } ],
      stageGroup: figo2014(T, N, M),
      warnings,
      report: stagingLine([pT, pN, pM]),
    };
  },
};

/* FIGO 2014, conforme listado no checklist da CAP. IIIA1 = só linfonodos
   retroperitoneais positivos (i ≤10 mm, ii >10 mm); doença peritoneal
   extrapélvica (pT3) prevalece sobre os linfonodos. */
function figo2014(T: string, N: string | null, M: string): string | null {
  if (M === 'M1a') return 'FIGO IVA';
  if (M === 'M1b') return 'FIGO IVB';
  if (M === 'M1') return 'FIGO IV';
  const byT3: Record<string, string> = { T3a: 'IIIA2', T3b: 'IIIB', T3c: 'IIIC', T3: 'III' };
  if (byT3[T]) return `FIGO ${byT3[T]}`;
  if (N === 'N1a') return 'FIGO IIIA1(i)';
  if (N === 'N1b') return 'FIGO IIIA1(ii)';
  if (N === 'N1') return 'FIGO IIIA1';
  const byT: Record<string, string> = {
    T1a: 'IA', T1b: 'IB', T1c1: 'IC1', T1c2: 'IC2', T1c3: 'IC3', T1: 'I',
    T2a: 'IIA', T2b: 'IIB', T2: 'II',
  };
  const stage = byT[T];
  return stage ? `FIGO ${stage}` : null;
}

export default calculator
