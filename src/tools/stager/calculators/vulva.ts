/* ==========================================================================
   Carcinoma de Vulva — AJCC 9ª versão / FIGO 2021
   Base: CAP Protocol – Vulva (Resection) v5.1.0.0, jun/2024.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, PM_FIELD, prefix, stagingLine, pmToken } from './_shared'

const calculator: Calculator = {
  id: 'vulva',
  name: 'Carcinoma de Vulva',
  section: 'Trato Ginecológico',
  system: 'AJCC 9ª versão',
  version: 'CAP — Vulva (Resection) v5.1.0.0',
  reference: 'AJCC Cancer Staging System, version 9; FIGO 2021',
  summary: 'Estadiamento pTNM de carcinoma de vulva em vulvectomia/excisão, com estádio FIGO derivado.',

  fields: [
    MOD_FIELD,
    {
      id: 'pT', label: 'Categoria pT — Tumor primário', type: 'select', default: 'T1b',
      hint: 'Profundidade medida da membrana basal da crista epitelial adjacente mais profunda livre de tumor até o ponto mais profundo de invasão.',
      options: [
        { value: 'T0',  label: 'pT0 — sem evidência de tumor primário' },                                                                     // pT0: No evidence of primary tumor
        { value: 'T1a', label: 'pT1a — ≤2 cm e invasão estromal ≤1 mm' },                                                                     // pT1a: Tumor size less than or equal to 2 cm in greatest dimension and stromal invasion less than or equal to 1 mm
        { value: 'T1b', label: 'pT1b — >2 cm ou invasão estromal >1 mm' },                                                                    // pT1b: Tumor size greater than 2 cm in greatest dimension or stromal invasion greater than 1 mm
        { value: 'T1',  label: 'pT1 — confinado à vulva, subcategoria indeterminada' },                                                       // pT1 (subcategory cannot be determined)
        { value: 'T2',  label: 'pT2 — qualquer tamanho, extensão ao 1/3 inferior da uretra, 1/3 inferior da vagina ou ânus' },                // pT2: Tumor of any size with extension to lower one-third of urethra, lower one-third of vagina, or anus
        { value: 'T3',  label: 'pT3 — qualquer tamanho, extensão aos 2/3 superiores da uretra/vagina, mucosa da bexiga ou do reto' },          // pT3: Tumor of any size with disease extension to upper two-thirds of urethra, upper two-thirds of vagina, bladder mucosa, rectal mucosa
        { value: 'T4',  label: 'pT4 — fixo ao osso pélvico' },                                                                                // pT4: Tumor fixed to pelvic bone
      ],
    },
    MULTI_FIELD,
    {
      id: 'pN', label: 'Categoria pN — Linfonodos regionais', type: 'select', default: 'none',
      hint: 'Regionais: inguinais e femorais. Pélvicos = pM1.',
      options: [
        { value: 'none',   label: 'pN não atribuído (sem linfonodos ou não determinável)' },
        { value: 'N0',     label: 'pN0 — sem metástase em linfonodo regional' },                                                      // pN0: No regional lymph node metastasis
        { value: 'N0(i+)', label: 'pN0(i+) — células tumorais isoladas ≤0,2 mm (ou ≤200 células)' },                                  // pN0(i+): Isolated tumor cells in regional lymph node(s) less than or equal to 0.2 mm, or single cells or clusters of cells less than or equal to 200 cells in a single lymph node cross-section
        { value: 'N1mi',   label: 'pN1mi — acometimento >0,2 mm e ≤2 mm' },                                                           // pN1mi: Tumor involvement greater than 0.2 mm but less than or equal to 2.0 mm in diameter of regional lymph nodes
        { value: 'N1a',    label: 'pN1a — acometimento >2 mm e ≤5 mm' },                                                              // pN1a: Tumor involvement greater than 2.0 mm but less than or equal to 5 mm of regional lymph nodes
        { value: 'N1b',    label: 'pN1b — acometimento >5 mm' },                                                                      // pN1b: Tumor involvement greater than 5 mm of regional lymph nodes
        { value: 'N1c',    label: 'pN1c — com extensão extranodal (ENE)' },                                                           // pN1c: Tumor involvement of regional lymph nodes with extranodal extension (ENE)
        { value: 'N1',     label: 'pN1 — linfonodos não fixos/não ulcerados, subcategoria indeterminada' },                           // pN1 (subcategory cannot be determined)
        { value: 'N2',     label: 'pN2 — linfonodos regionais fixos ou ulcerados' },                                                  // pN2: Tumor involvement of fixed or ulcerated regional lymph nodes
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
      stageGroup: figo2021(T, N, M1),
      warnings,
      report: stagingLine([pT, pN, pM], 'AJCC 9ª versão'),
    };
  },
};

/* FIGO 2021, conforme listado no checklist da CAP:
   IIIA = extensão às partes superiores das estruturas adjacentes OU linfonodos ≤5 mm;
   IIIB = linfonodos >5 mm; IIIC = extensão extracapsular;
   IVA = fixo ao osso pélvico OU linfonodos fixos/ulcerados; IVB = à distância. */
function figo2021(T: string, N: string | null, M1: boolean): string | null {
  if (M1) return 'FIGO IVB';
  if (T === 'T4' || N === 'N2') return 'FIGO IVA';
  if (N === 'N1c') return 'FIGO IIIC';
  if (N === 'N1b') return 'FIGO IIIB';
  if (N === 'N1mi' || N === 'N1a' || T === 'T3') return 'FIGO IIIA';
  if (N === 'N1') return 'FIGO III';
  if (T === 'T2') return 'FIGO II';
  if (T === 'T1a') return 'FIGO IA';
  if (T === 'T1b') return 'FIGO IB';
  if (T === 'T1') return 'FIGO I';
  return null;
}

export default calculator
