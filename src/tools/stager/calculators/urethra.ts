/* ==========================================================================
   Carcinoma de Uretra — AJCC 8ª edição
   Base: CAP Protocol – Urethra (Resection) v4.3.0.0, dez/2024.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, PM_FIELD, prefix, stagingLine, pmToken } from './_shared'

const calculator: Calculator = {
  id: 'urethra',
  name: 'Carcinoma de Uretra',
  section: 'Trato Geniturinário',
  system: 'AJCC 8ª ed.',
  version: 'CAP — Urethra (Resection) v4.3.0.0',
  reference: 'AJCC Cancer Staging Manual, 8th ed.',
  summary: 'Estadiamento pTNM de carcinoma uretral; a escala de pT muda entre uretra peniana/feminina e uretra prostática.',

  fields: [
    MOD_FIELD,
    {
      id: 'site', label: 'Sítio', type: 'radio', default: 'penile',
      options: [
        { value: 'penile',    label: 'Uretra peniana (masculina) ou uretra feminina' }, // For the Male Penile Urethra and Female Urethra
        { value: 'prostatic', label: 'Uretra prostática' },                              // For the Prostatic Urethra
      ],
    },
    {
      id: 'pTp', label: 'Categoria pT — uretra peniana / feminina', type: 'select', default: 'T1',
      when: (v) => v.site !== 'prostatic',
      options: [
        { value: 'T0',  label: 'pT0 — sem evidência de tumor primário' },                                      // pT0: No evidence of primary tumor
        { value: 'Ta',  label: 'pTa — carcinoma papilífero não invasivo' },                                    // pTa: Non-invasive papillary carcinoma
        { value: 'Tis', label: 'pTis — carcinoma in situ' },                                                   // pTis: Carcinoma in situ
        { value: 'T1',  label: 'pT1 — invade o tecido conjuntivo subepitelial' },                              // pT1: Tumor invades subepithelial connective tissue
        { value: 'T2',  label: 'pT2 — invade corpo esponjoso ou músculo periuretral' },                        // pT2: Tumor invades any of the following: corpus spongiosum, periurethral muscle
        { value: 'T3',  label: 'pT3 — invade corpo cavernoso ou parede vaginal anterior' },                    // pT3: Tumor invades any of the following: corpus cavernosum, anterior vagina
        { value: 'T4',  label: 'pT4 — invade outros órgãos adjacentes (ex.: parede vesical)' },                // pT4: Tumor invades other adjacent organs (e.g., invasion of the bladder wall)
      ],
    },
    {
      id: 'pTpr', label: 'Categoria pT — uretra prostática', type: 'select', default: 'T1',
      when: (v) => v.site === 'prostatic',
      options: [
        { value: 'T0',  label: 'pT0 — sem evidência de tumor primário' },                                                                          // pT0: No evidence of primary tumor
        { value: 'Ta',  label: 'pTa — carcinoma papilífero não invasivo' },                                                                        // pTa: Non-invasive papillary carcinoma
        { value: 'Tis', label: 'pTis — carcinoma in situ na uretra prostática ou ductos periuretrais/prostáticos, sem invasão estromal' },         // pTis: Carcinoma in situ involving the prostatic urethra or periurethral or prostatic ducts without stromal invasion
        { value: 'T1',  label: 'pT1 — invade o conjuntivo subepitelial imediatamente abaixo do urotélio' },                                        // pT1: Tumor invades urethral subepithelial connective tissue immediately underlying the urothelium
        { value: 'T2',  label: 'pT2 — invade o estroma prostático ao redor dos ductos (por extensão direta ou a partir dos ductos)' },             // pT2: Tumor invades the prostatic stroma surrounding ducts either by direct extension from the urothelial surface or by invasion from prostatic ducts
        { value: 'T3',  label: 'pT3 — invade a gordura periprostática' },                                                                          // pT3: Tumor invades the periprostatic fat
        { value: 'T4',  label: 'pT4 — invade outros órgãos adjacentes (parede vesical extraprostática, parede retal)' },                           // pT4: Tumor invades other adjacent organs (e.g., extraprostatic invasion of the bladder wall, rectal wall)
      ],
    },
    MULTI_FIELD,
    {
      id: 'pN', label: 'Categoria pN — Linfonodos regionais', type: 'select', default: 'none',
      options: [
        { value: 'none', label: 'pN não atribuído (sem linfonodos ou não determinável)' },
        { value: 'N0',   label: 'pN0 — sem metástase em linfonodo regional' },                                                            // pN0: No regional lymph node metastasis
        { value: 'N1',   label: 'pN1 — metástase em linfonodo regional único (inguinal, pelve verdadeira ou pré-sacral)' },               // pN1: Single regional lymph node metastasis in the inguinal region or true pelvis (...), or presacral lymph node
        { value: 'N2',   label: 'pN2 — metástases em múltiplos linfonodos regionais (inguinais, pelve verdadeira ou pré-sacrais)' },     // pN2: Multiple regional lymph node metastasis (...)
      ],
    },
    PM_FIELD,
  ],

  compute(v) {
    const warnings: string[] = [];
    const pre = prefix(strOf(v.mod));
    const T = v.site === 'prostatic' ? strOf(v.pTpr) : strOf(v.pTp);
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
