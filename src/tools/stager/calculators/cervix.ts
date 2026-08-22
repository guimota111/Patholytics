/* ==========================================================================
   Carcinoma do Colo Uterino — AJCC 9ª versão / FIGO 2018
   Base: CAP Protocol – Uterine Cervix (Resection) v5.1.1.0, abr/2023.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, prefix, stagingLine, pmToken } from './_shared'

const calculator: Calculator = {
  id: 'cervix',
  name: 'Carcinoma do Colo Uterino',
  section: 'Trato Ginecológico',
  system: 'AJCC 9ª versão',
  version: 'CAP — Uterine Cervix (Resection) v5.1.1.0',
  reference: 'AJCC Cancer Staging System, version 9; FIGO 2018 (corrigendum)',
  summary: 'Estadiamento pTNM de carcinoma do colo uterino em histerectomia/traquelectomia, com estádio FIGO derivado.',

  fields: [
    MOD_FIELD,
    {
      id: 'pT', label: 'Categoria pT — Tumor primário', type: 'select', default: 'T1b1',
      hint: 'Invasão linfovascular e extensão lateral não alteram o pT.',
      options: [
        { value: 'T0',   label: 'pT0 — sem evidência de tumor primário' },                                                            // pT0: No evidence of primary tumor
        { value: 'T1a1', label: 'pT1a1 — invasão estromal medida ≤3 mm de profundidade' },                                            // pT1a1: Measured stromal invasion less than or equal to 3 mm in depth
        { value: 'T1a2', label: 'pT1a2 — invasão estromal >3 mm e ≤5 mm' },                                                           // pT1a2: Measured stromal invasion greater than 3 mm and less than or equal to 5 mm in depth
        { value: 'T1a',  label: 'pT1a — subcategoria indeterminada (só microscópico, ≤5 mm)' },                                       // pT1a (subcategory cannot be determined)
        { value: 'T1b1', label: 'pT1b1 — invasão >5 mm e ≤2 cm na maior dimensão' },                                                  // pT1b1: Invasive carcinoma greater than 5 mm depth of stromal invasion and less than or equal to 2 cm in greatest dimension
        { value: 'T1b2', label: 'pT1b2 — >2 cm e ≤4 cm' },                                                                            // pT1b2: Invasive carcinoma greater than 2 cm and less than or equal to 4 cm in greatest dimension
        { value: 'T1b3', label: 'pT1b3 — >4 cm' },                                                                                    // pT1b3: Invasive carcinoma greater than 4 cm in greatest dimension
        { value: 'T1b',  label: 'pT1b — subcategoria indeterminada' },                                                                // pT1b (subcategory cannot be determined)
        { value: 'T1',   label: 'pT1 — confinado ao colo, subcategoria indeterminada' },                                              // pT1 (subcategory cannot be determined)
        { value: 'T2a1', label: 'pT2a1 — 2/3 superiores da vagina sem paramétrio, ≤4 cm' },                                           // pT2a1: Invasive carcinoma less than or equal to 4 cm in greatest dimension
        { value: 'T2a2', label: 'pT2a2 — 2/3 superiores da vagina sem paramétrio, >4 cm' },                                           // pT2a2: Invasive carcinoma greater than 4 cm in greatest dimension
        { value: 'T2a',  label: 'pT2a — subcategoria indeterminada' },                                                                // pT2a (subcategory cannot be determined)
        { value: 'T2b',  label: 'pT2b — invasão parametrial, sem atingir a parede pélvica' },                                         // pT2b: With parametrial invasion but not up to the pelvic wall
        { value: 'T2',   label: 'pT2 — além do útero, subcategoria indeterminada' },                                                  // pT2 (subcategory cannot be determined)
        { value: 'T3a',  label: 'pT3a — 1/3 inferior da vagina, sem extensão à parede pélvica' },                                     // pT3a: Carcinoma involves lower third of the vagina, with no extension to the pelvic wall
        { value: 'T3b',  label: 'pT3b — parede pélvica e/ou hidronefrose ou rim não funcionante' },                                   // pT3b: Extension to the pelvic wall and/or hydronephrosis or nonfunctioning kidney (unless known to be due to another cause)
        { value: 'T3',   label: 'pT3 — subcategoria indeterminada' },                                                                 // pT3 (subcategory cannot be determined)
        { value: 'T4',   label: 'pT4 — mucosa da bexiga ou reto (comprovada por biópsia), ou órgãos adjacentes' },                    // pT4: Carcinoma has involved (biopsy-proven) the mucosa of the bladder or rectum, or has spread to adjacent organs
      ],
    },
    MULTI_FIELD,
    {
      id: 'pN', label: 'Categoria pN — Linfonodos regionais', type: 'select', default: 'none',
      hint: 'Regionais: pélvicos e para-aórticos. Outros = pM1.',
      options: [
        { value: 'none',   label: 'pN não atribuído (sem linfonodos ou não determinável)' },
        { value: 'N0',     label: 'pN0 — sem metástase em linfonodo regional' },                                                     // pN0: No regional lymph node metastasis
        { value: 'N0(i+)', label: 'pN0(i+) — células tumorais isoladas ≤0,2 mm (ou ≤200 células)' },                                 // pN0(i+): Isolated tumor cells in regional lymph node(s) less than or equal to 0.2 mm, or single cells or clusters of cells less than or equal to 200 cells in a single lymph node cross section
        { value: 'N1mi',   label: 'pN1mi — micrometástase (>0,2 a 2 mm) em linfonodo pélvico' },                                     // pN1mi: Regional lymph node metastasis (greater than 0.2 mm but less than or equal to 2.0 mm) to pelvic lymph nodes
        { value: 'N1a',    label: 'pN1a — metástase >2 mm em linfonodo pélvico' },                                                   // pN1a: Regional lymph node metastasis (greater than 2.0 mm diameter) to pelvic lymph nodes
        { value: 'N1',     label: 'pN1 — pélvico, subcategoria indeterminada' },                                                     // pN1 (subcategory cannot be determined)
        { value: 'N2mi',   label: 'pN2mi — micrometástase em linfonodo para-aórtico (± pélvicos)' },                                 // pN2mi: Regional lymph node metastasis to para-aortic lymph nodes (greater than 0.2 mm but less than or equal to 2.0 mm), with or without positive pelvic lymph nodes
        { value: 'N2a',    label: 'pN2a — metástase >2 mm em linfonodo para-aórtico (± pélvicos)' },                                 // pN2a: Regional lymph node metastasis to para-aortic lymph nodes (greater than 2.0 mm in diameter), with or without positive pelvic lymph nodes
        { value: 'N2',     label: 'pN2 — para-aórtico, subcategoria indeterminada' },                                                // pN2 (subcategory cannot be determined)
      ],
    },
    {
      id: 'M', label: 'Categoria pM — Metástase à distância', type: 'select', default: 'na',
      hint: 'Inclui linfonodos inguinais, doença intraperitoneal, serosa uterina e anexos; exclui pélvicos/para-aórticos e vagina.',
      options: [
        { value: 'na', label: 'Não aplicável — pM não determinável neste espécime' },
        { value: 'M1', label: 'pM1 — metástase à distância' },                              // pM1: Distant metastasis (includes metastasis to inguinal lymph nodes, intraperitoneal disease, lung, liver, or bone)
      ],
    },
  ],

  compute(v) {
    const warnings: string[] = [];
    const pre = prefix(strOf(v.mod));
    const T = strOf(v.pT);
    const mSuffix = v.multi === 'yes' ? '(m)' : '';
    const N = v.pN === 'none' ? null : strOf(v.pN);
    const M1 = v.M === 'M1';

    const pT = `${pre}${T}${mSuffix}`;
    const pN = N ? `${pre}${N}` : null;
    const pM = pmToken(strOf(v.M));

    return {
      tnm: [ { k: 'pT', v: pT }, { k: 'pN', v: pN ?? '—' }, { k: 'pM', v: pM ?? '—' } ],
      stageGroup: figo2018(T, N, M1),
      warnings,
      report: stagingLine([pT, pN, pM], 'AJCC 9ª versão'),
    };
  },
};

/* FIGO 2018 (corrigendum), conforme listado no checklist da CAP:
   IIIC1 = pélvicos (incl. micrometástases); IIIC2 = para-aórticos;
   IVA = mucosa de bexiga/reto ou órgãos adjacentes; IVB = à distância. */
function figo2018(T: string, N: string | null, M1: boolean): string | null {
  if (M1) return 'FIGO IVB';
  if (T === 'T4') return 'FIGO IVA';
  if (N && N.startsWith('N2')) return 'FIGO IIIC2';
  if (N && N.startsWith('N1')) return 'FIGO IIIC1';
  const byT: Record<string, string> = {
    T1a1: 'IA1', T1a2: 'IA2', T1a: 'IA', T1b1: 'IB1', T1b2: 'IB2', T1b3: 'IB3', T1b: 'IB', T1: 'I',
    T2a1: 'IIA1', T2a2: 'IIA2', T2a: 'IIA', T2b: 'IIB', T2: 'II',
    T3a: 'IIIA', T3b: 'IIIB', T3: 'III',
  };
  const stage = byT[T];
  return stage ? `FIGO ${stage}` : null;
}

export default calculator
