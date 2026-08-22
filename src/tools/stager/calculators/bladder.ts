/* ==========================================================================
   Carcinoma de Bexiga (cistectomia) — AJCC 8ª edição
   Base: CAP Protocol – Urinary Bladder (Resection) v4.2.0.0, set/2023.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, prefix, stagingLine, pmToken } from './_shared'

const calculator: Calculator = {
  id: 'bladder',
  name: 'Carcinoma de Bexiga (cistectomia)',
  section: 'Trato Geniturinário',
  system: 'AJCC 8ª ed.',
  version: 'CAP — Urinary Bladder (Resection) v4.2.0.0',
  reference: 'AJCC Cancer Staging Manual, 8th ed.',
  summary: 'Estadiamento pTNM de carcinoma urotelial e outros carcinomas da bexiga em espécime de cistectomia.',

  fields: [
    MOD_FIELD,
    {
      id: 'pT', label: 'Categoria pT — Tumor primário', type: 'select', default: 'T2a',
      options: [
        { value: 'T0',  label: 'pT0 — sem evidência de tumor primário' },                                         // pT0: No evidence of primary tumor
        { value: 'Ta',  label: 'pTa — carcinoma papilífero não invasivo' },                                       // pTa: Non-invasive papillary carcinoma
        { value: 'Tis', label: 'pTis — carcinoma urotelial in situ ("tumor plano")' },                            // pTis: Urothelial carcinoma in situ: "flat tumor"
        { value: 'T1',  label: 'pT1 — invade a lâmina própria (tecido conjuntivo subepitelial)' },                // pT1: Tumor invades lamina propria (subepithelial connective tissue)
        { value: 'T2a', label: 'pT2a — invade a muscular própria superficial (metade interna)' },                 // pT2a: Tumor invades superficial muscularis propria (inner half)
        { value: 'T2b', label: 'pT2b — invade a muscular própria profunda (metade externa)' },                    // pT2b: Tumor invades deep muscularis propria (outer half)
        { value: 'T2',  label: 'pT2 — subcategoria indeterminada' },                                               // pT2 (subcategory cannot be determined)
        { value: 'T3a', label: 'pT3a — invade tecido perivesical microscopicamente' },                            // pT3a: Tumor invades perivesical soft tissue microscopically
        { value: 'T3b', label: 'pT3b — invade tecido perivesical macroscopicamente (massa extravesical)' },       // pT3b: Tumor invades perivesical soft tissue macroscopically (extravesicular mass)
        { value: 'T3',  label: 'pT3 — subcategoria indeterminada' },                                               // pT3 (subcategory cannot be determined)
        { value: 'T4a', label: 'pT4a — extravesical, invade estroma prostático, útero ou vagina' },               // pT4a: Extravesical tumor invades directly into prostatic stroma, uterus, or vagina
        { value: 'T4b', label: 'pT4b — extravesical, invade parede pélvica ou parede abdominal' },                // pT4b: Extravesical tumor invades pelvic wall, abdominal wall
        { value: 'T4',  label: 'pT4 — subcategoria indeterminada' },                                               // pT4 (subcategory cannot be determined)
      ],
    },
    MULTI_FIELD,
    {
      id: 'pN', label: 'Categoria pN — Linfonodos regionais', type: 'select', default: 'none',
      options: [
        { value: 'none', label: 'pN não atribuído (sem linfonodos ou não determinável)' },
        { value: 'N0',   label: 'pN0 — sem metástase linfonodal' },                                                                          // pN0: No lymph node metastasis
        { value: 'N1',   label: 'pN1 — metástase em linfonodo único da pelve verdadeira (perivesical, obturador, ilíaco interno/externo, sacral)' }, // pN1: Single regional lymph node metastasis in the true pelvis (...)
        { value: 'N2',   label: 'pN2 — metástases em múltiplos linfonodos da pelve verdadeira' },                                           // pN2: Multiple regional lymph node metastasis in the true pelvis (...)
        { value: 'N3',   label: 'pN3 — metástase em linfonodo(s) ilíaco(s) comum(ns)' },                                                    // pN3: Lymph node metastasis to the common iliac lymph nodes
      ],
    },
    {
      id: 'M', label: 'Categoria pM — Metástase à distância', type: 'select', default: 'na',
      options: [
        { value: 'na',  label: 'Não aplicável — pM não determinável neste espécime' },
        { value: 'M1a', label: 'pM1a — metástase limitada a linfonodos além das ilíacas comuns' }, // pM1a: Distant metastasis limited to lymph nodes beyond the common iliacs
        { value: 'M1b', label: 'pM1b — metástase à distância não linfonodal' },                    // pM1b: Non-lymph-node distant metastases
        { value: 'M1',  label: 'pM1 — subcategoria indeterminada' },                               // pM1 (subcategory cannot be determined)
      ],
    },
  ],

  compute(v) {
    const warnings: string[] = [];
    const pre = prefix(strOf(v.mod));
    const T = strOf(v.pT);
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
