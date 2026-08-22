/* ==========================================================================
   Carcinoma de Vagina — AJCC 8ª edição / FIGO
   Base: CAP Protocol – Vagina (Resection) v4.3.0.1, nov/2021.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, PM_FIELD, prefix, stagingLine, pmToken } from './_shared'

const calculator: Calculator = {
  id: 'vagina',
  name: 'Carcinoma de Vagina',
  section: 'Trato Ginecológico',
  system: 'AJCC 8ª ed.',
  version: 'CAP — Vagina (Resection) v4.3.0.1',
  reference: 'AJCC Cancer Staging Manual, 8th ed.; FIGO',
  summary: 'Estadiamento pTNM de carcinoma primário da vagina em vaginectomia/excisão, com estádio FIGO derivado.',

  fields: [
    MOD_FIELD,
    {
      id: 'pT', label: 'Categoria pT — Tumor primário', type: 'select', default: 'T1a',
      options: [
        { value: 'T0',  label: 'pT0 — sem evidência de tumor primário' },                                                         // pT0: No evidence of primary tumor
        { value: 'T1a', label: 'pT1a — confinado à vagina, ≤2 cm' },                                                              // pT1a: Tumor confined to the vagina, measuring less than or equal to 2.0 cm
        { value: 'T1b', label: 'pT1b — confinado à vagina, >2 cm' },                                                              // pT1b: Tumor confined to the vagina, measuring greater than 2.0 cm
        { value: 'T1',  label: 'pT1 — confinado à vagina, subcategoria indeterminada' },                                          // pT1 (subcategory cannot be determined)
        { value: 'T2a', label: 'pT2a — invade tecidos paravaginais (não até a parede pélvica), ≤2 cm' },                          // pT2a: Tumor invading paravaginal tissues but not to pelvic wall, measuring less than or equal to 2.0 cm
        { value: 'T2b', label: 'pT2b — invade tecidos paravaginais (não até a parede pélvica), >2 cm' },                          // pT2b: Tumor invading paravaginal tissues but not to pelvic wall, measuring greater than 2.0 cm
        { value: 'T2',  label: 'pT2 — subcategoria indeterminada' },                                                              // pT2 (subcategory cannot be determined)
        { value: 'T3',  label: 'pT3 — estende-se à parede pélvica e/ou causa hidronefrose ou rim não funcionante' },              // pT3: Tumor extending to the pelvic sidewall and / or causing hydronephrosis or nonfunctioning kidney
        { value: 'T4',  label: 'pT4 — invade mucosa da bexiga ou do reto e/ou além da pelve verdadeira' },                        // pT4: Tumor invading the mucosa of the bladder or rectum and / or extending beyond the true pelvis (bullous edema is not sufficient evidence to classify a tumor as T4)
      ],
    },
    MULTI_FIELD,
    {
      id: 'pN', label: 'Categoria pN — Linfonodos regionais', type: 'select', default: 'none',
      hint: '2/3 superiores: pélvicos e para-aórticos. 1/3 inferior: inguinais e femorais.',
      options: [
        { value: 'none',   label: 'pN não atribuído (sem linfonodos ou não determinável)' },
        { value: 'N0',     label: 'pN0 — sem metástase em linfonodo regional' },              // pN0: No regional lymph node metastasis
        { value: 'N0(i+)', label: 'pN0(i+) — células tumorais isoladas ≤0,2 mm' },            // pN0(i+): Isolated tumor cells in regional lymph node(s) no greater than 0.2 mm
        { value: 'N1',     label: 'pN1 — metástase em linfonodo pélvico ou inguinal' },       // pN1: Pelvic or inguinal lymph node metastasis
      ],
    },
    PM_FIELD,
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
      stageGroup: figoVagina(T, N, M1),
      warnings,
      report: stagingLine([pT, pN, pM]),
    };
  },
};

/* FIGO conforme listado no checklist da CAP:
   III = parede pélvica/hidronefrose OU T1–T3 com N1; IVA = T4 (qualquer N); IVB = M1. */
function figoVagina(T: string, N: string | null, M1: boolean): string | null {
  if (M1) return 'FIGO IVB';
  if (T === 'T4') return 'FIGO IVA';
  if (T === 'T3' || N === 'N1') return 'FIGO III';
  if (T.startsWith('T2')) return 'FIGO II';
  if (T.startsWith('T1')) return 'FIGO I';
  return null;
}

export default calculator
