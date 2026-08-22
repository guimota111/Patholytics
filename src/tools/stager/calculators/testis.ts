/* ==========================================================================
   Tumor de Células Germinativas do Testículo — AJCC 8ª edição
   Base: CAP Protocol – Testis (Orchiectomy) v4.3.0.0, mar/2025.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, prefix, stagingLine, pmToken } from './_shared'

const calculator: Calculator = {
  id: 'testis',
  name: 'Tumor de Testículo (orquiectomia)',
  section: 'Trato Geniturinário',
  system: 'AJCC 8ª ed.',
  version: 'CAP — Testis (Orchiectomy) v4.3.0.0',
  reference: 'AJCC Cancer Staging Manual, 8th ed.',
  summary: 'Estadiamento pTNM de tumores germinativos do testículo em orquiectomia, com marcadores séricos (S).',

  fields: [
    MOD_FIELD,
    {
      id: 'pT', label: 'Categoria pT — Tumor primário', type: 'select', default: 'T1',
      hint: 'A subdivisão pT1a/pT1b aplica-se apenas ao seminoma puro.',
      options: [
        { value: 'T0',  label: 'pT0 — sem evidência de tumor primário' },                                                                 // pT0: No evidence of primary tumor
        { value: 'Tis', label: 'pTis — neoplasia de células germinativas in situ (GCNIS)' },                                              // pTis: Germ cell neoplasia in situ
        { value: 'T1a', label: 'pT1a — limitado ao testículo (incl. rete testis), sem invasão linfovascular, <3 cm (seminoma puro)' },    // pT1a: Tumor smaller than 3 cm in size — subclassification applies only to pure seminoma
        { value: 'T1b', label: 'pT1b — limitado ao testículo (incl. rete testis), sem invasão linfovascular, ≥3 cm (seminoma puro)' },    // pT1b: Tumor 3 cm or larger in size
        { value: 'T1',  label: 'pT1 — limitado ao testículo (incl. rete testis), sem invasão linfovascular' },                            // pT1: Tumor limited to testis (including rete testis invasion) without lymphovascular invasion
        { value: 'T2',  label: 'pT2 — limitado ao testículo com invasão linfovascular; ou invade tecido hilar, epidídimo, ou penetra a camada mesotelial visceral da túnica albugínea' }, // pT2: Tumor limited to testis (including rete testis invasion) with lymphovascular invasion, or tumor invading hilar soft tissue or epididymis or penetrating visceral mesothelial layer covering the external surface of tunica albuginea with or without lymphovascular invasion
        { value: 'T3',  label: 'pT3 — invade diretamente o tecido do cordão espermático' },                                               // pT3: Tumor directly invades spermatic cord soft tissue with or without lymphovascular invasion
        { value: 'T4',  label: 'pT4 — invade o escroto' },                                                                                // pT4: Tumor invades scrotum with or without lymphovascular invasion
      ],
    },
    MULTI_FIELD,
    {
      id: 'pN', label: 'Categoria pN — Linfonodos regionais', type: 'select', default: 'none',
      options: [
        { value: 'none', label: 'pN não atribuído (sem linfonodos ou não determinável)' },
        { value: 'N0',   label: 'pN0 — sem metástase em linfonodo regional' },                                                                           // pN0: No regional lymph node metastasis
        { value: 'N1',   label: 'pN1 — massa linfonodal ≤2 cm e ≤5 linfonodos positivos, nenhum >2 cm' },                                                // pN1: Metastasis with a lymph node mass 2 cm or smaller in greatest dimension and less than or equal to five nodes positive, none larger than 2 cm in greatest dimension
        { value: 'N2',   label: 'pN2 — massa >2 a 5 cm; ou >5 linfonodos positivos, nenhum >5 cm; ou extensão extranodal' },                             // pN2: Metastasis with a lymph node mass larger than 2 cm but not larger than 5 cm in greatest dimension; or more than five nodes positive, none larger than 5 cm; or evidence of extranodal extension of tumor
        { value: 'N3',   label: 'pN3 — massa linfonodal >5 cm' },                                                                                        // pN3: Metastasis with a lymph node mass larger than 5 cm in greatest dimension
      ],
    },
    {
      id: 'M', label: 'Categoria pM — Metástase à distância', type: 'select', default: 'na',
      options: [
        { value: 'na',  label: 'Não aplicável — pM não determinável neste espécime' },
        { value: 'M1a', label: 'pM1a — metástase linfonodal não retroperitoneal ou pulmonar' }, // pM1a: Non-retroperitoneal nodal or pulmonary metastases
        { value: 'M1b', label: 'pM1b — metástase visceral não pulmonar' },                      // pM1b: Non-pulmonary visceral metastases
        { value: 'M1',  label: 'pM1 — subcategoria indeterminada' },                            // pM1 (subcategory cannot be determined)
      ],
    },
    {
      id: 'S', label: 'Marcadores séricos (S)', type: 'select', default: 'SX',
      options: [
        { value: 'SX', label: 'SX — não disponíveis / não realizados' },                                                     // SX (serum marker studies not available or performed)
        { value: 'S0', label: 'S0 — dentro dos limites normais' },                                                           // S0 (serum marker study levels within normal limits)
        { value: 'S1', label: 'S1 — LDH <1,5× LSN e hCG <5.000 mUI/mL e AFP <1.000 ng/mL' },                                 // S1 (less than 1.5 x the upper limit of normal for the LDH assay, and HCG less than 5,000 mIU / mL, and AFP less than 1,000 ng / mL)
        { value: 'S2', label: 'S2 — LDH 1,5–10× LSN ou hCG 5.000–50.000 mUI/mL ou AFP 1.000–10.000 ng/mL' },                 // S2 (1.5-10 x the upper limit of normal for the LDH assay, or HCG 5,000-50,000 mIU / mL, or AFP 1,000-10,000 ng / mL)
        { value: 'S3', label: 'S3 — LDH >10× LSN ou hCG >50.000 mUI/mL ou AFP >10.000 ng/mL' },                              // S3 (greater than 10 x the upper limit of normal for the LDH assay, or HCG greater than 50,000 mIU / mL, or AFP greater than 10,000 ng / mL)
      ],
    },
  ],

  compute(v) {
    const warnings: string[] = [];
    const pre = prefix(strOf(v.mod));
    const T = strOf(v.pT);
    const mSuffix = v.multi === 'yes' ? '(m)' : '';
    const N = v.pN === 'none' ? null : strOf(v.pN);
    const S = strOf(v.S);

    const pT = `${pre}${T}${mSuffix}`;
    const pN = N ? `${pre}${N}` : null;
    const pM = pmToken(strOf(v.M));

    const parts = [stagingLine([pT, pN, pM])];
    if (S && S !== 'SX') parts.push(`Marcadores séricos: ${S}.`);

    return {
      tnm: [
        { k: 'pT', v: pT }, { k: 'pN', v: pN ?? '—' }, { k: 'pM', v: pM ?? '—' },
        { k: 'S', v: S || '—' },
      ],
      stageGroup: null,
      warnings,
      report: parts.join(' '),
    };
  },
};

export default calculator
