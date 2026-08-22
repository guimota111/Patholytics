/* ==========================================================================
   Carcinoma de Pênis — AJCC 8ª edição
   Base: CAP Protocol – Penis v4.2.0.0, set/2023.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, PM_FIELD, prefix, stagingLine, pmToken } from './_shared'

const calculator: Calculator = {
  id: 'penis',
  name: 'Carcinoma de Pênis',
  section: 'Trato Geniturinário',
  system: 'AJCC 8ª ed.',
  version: 'CAP — Penis v4.2.0.0',
  reference: 'AJCC Cancer Staging Manual, 8th ed.',
  summary: 'Estadiamento pTNM de carcinoma espinocelular do pênis em penectomia, glandectomia ou excisão.',

  fields: [
    MOD_FIELD,
    {
      id: 'pT', label: 'Categoria pT — Tumor primário', type: 'select', default: 'T1a',
      options: [
        { value: 'T0',  label: 'pT0 — sem evidência de tumor primário' },                                                                       // pT0: No evidence of primary tumor
        { value: 'Tis', label: 'pTis — carcinoma in situ (neoplasia intraepitelial peniana, PeIN)' },                                           // pTis: Carcinoma in situ (Penile intraepithelial neoplasia [PeIN])
        { value: 'Ta',  label: 'pTa — carcinoma espinocelular localizado não invasivo' },                                                       // pTa: Noninvasive localized squamous cell carcinoma
        { value: 'T1a', label: 'pT1a — invade lâmina própria (glande) / derme, lâmina própria ou dartos (prepúcio) / conjuntivo entre epiderme e corpos (haste); sem invasão linfovascular ou perineural e não alto grau' }, // pT1a: Tumor is without lymphovascular invasion or perineural invasion and is not high grade (i.e., grade 3 or sarcomatoid)
        { value: 'T1b', label: 'pT1b — idem, com invasão linfovascular e/ou perineural, ou alto grau (G3 ou sarcomatoide)' },                  // pT1b: Tumor exhibits lymphovascular invasion and / or perineural invasion or is high grade (i.e., grade 3 or sarcomatoid)
        { value: 'T1',  label: 'pT1 — subcategoria indeterminada' },                                                                             // pT1 (subcategory cannot be determined)
        { value: 'T2',  label: 'pT2 — invade o corpo esponjoso (glande ou haste ventral), com ou sem invasão uretral' },                        // pT2: Tumor invades into corpus spongiosum (either glans or ventral shaft) with or without urethral invasion
        { value: 'T3',  label: 'pT3 — invade o corpo cavernoso (incl. túnica albugínea), com ou sem invasão uretral' },                         // pT3: Tumor invades into corpora cavernosum (including tunica albuginea) with or without urethral invasion
        { value: 'T4',  label: 'pT4 — invade estruturas adjacentes (escroto, próstata, osso púbico)' },                                         // pT4: Tumor invades into adjacent structures (i.e., scrotum, prostate, pubic bone)
      ],
    },
    MULTI_FIELD,
    {
      id: 'pN', label: 'Categoria pN — Linfonodos regionais', type: 'select', default: 'none',
      options: [
        { value: 'none', label: 'pN não atribuído (sem linfonodos ou não determinável)' },
        { value: 'N0',   label: 'pN0 — sem metástase linfonodal' },                                                          // pN0: No lymph node metastasis
        { value: 'N1',   label: 'pN1 — ≤2 metástases inguinais unilaterais, sem extensão extranodal' },                      // pN1: less than or equal to 2 unilateral inguinal metastases, no extranodal extension
        { value: 'N2',   label: 'pN2 — ≥3 metástases inguinais unilaterais ou bilaterais, sem extensão extranodal' },        // pN2: greater than or equal to 3 unilateral inguinal metastases or bilateral metastases, no ENE
        { value: 'N3',   label: 'pN3 — extensão extranodal ou metástase em linfonodo pélvico' },                              // pN3: Extranodal extension of lymph node metastases or pelvic lymph node metastases
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
