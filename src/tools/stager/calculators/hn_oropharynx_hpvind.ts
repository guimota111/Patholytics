/* ==========================================================================
   Carcinoma de Orofaringe HPV-independente e Hipofaringe — AJCC 8ª edição
   Base: CAP Protocol – HPV-Independent Oropharynx and Hypopharynx v1.0.0.0, abr/2026.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, PM_FIELD, HN_PN_OPTIONS, prefix, stagingLine, pmToken } from './_shared'

const calculator: Calculator = {
  id: 'hn-oropharynx-hpvind',
  name: 'Carcinoma de Orofaringe HPV-independente / Hipofaringe',
  section: 'Cabeça e Pescoço',
  system: 'AJCC 8ª ed.',
  version: 'CAP — HPV-Independent Oropharynx and Hypopharynx v1.0.0.0',
  reference: 'AJCC Cancer Staging Manual, 8th ed.',
  summary: 'Estadiamento pTNM de carcinoma de orofaringe HPV-independente (p16−) ou de hipofaringe.',

  fields: [
    MOD_FIELD,
    {
      id: 'site', label: 'Sítio', type: 'radio', default: 'oropharynx',
      options: [
        { value: 'oropharynx',  label: 'Orofaringe HPV-independente' },   // HPV-independent oropharynx
        { value: 'hypopharynx', label: 'Hipofaringe' },                   // Hypopharynx
      ],
    },
    {
      id: 'pTo', label: 'Categoria pT — orofaringe', type: 'select', default: 'T1',
      when: (v) => v.site === 'oropharynx',
      options: [
        { value: 'Tis', label: 'pTis — carcinoma in situ' },                                                                                                   // pTis: Carcinoma in situ
        { value: 'T1',  label: 'pT1 — ≤2 cm' },                                                                                                                // pT1: Tumor 2 cm or smaller in greatest dimension
        { value: 'T2',  label: 'pT2 — >2 a 4 cm' },                                                                                                            // pT2: Tumor larger than 2 cm but not larger than 4 cm in greatest dimension
        { value: 'T3',  label: 'pT3 — >4 cm ou extensão à superfície lingual da epiglote' },                                                                  // pT3: Tumor larger than 4 cm in greatest dimension or extension to lingual surface of epiglottis
        { value: 'T4a', label: 'pT4a — invade laringe, músculo extrínseco da língua, pterigoide medial, palato duro ou mandíbula' },                          // pT4a: Moderately advanced local disease. Tumor invades larynx, extrinsic muscle of tongue, medial pterygoid, hard palate, or mandible
        { value: 'T4b', label: 'pT4b — invade pterigoide lateral, lâminas pterigoides, nasofaringe lateral, base do crânio, ou envolve a carótida' },        // pT4b: Very advanced local disease. Tumor invades lateral pterygoid muscle, pterygoid plates, lateral nasopharynx, or skull base, or encases carotid artery
        { value: 'T4',  label: 'pT4 — subcategoria indeterminada' },                                                                                           // pT4 (subcategory cannot be determined)
      ],
    },
    {
      id: 'pTh', label: 'Categoria pT — hipofaringe', type: 'select', default: 'T1',
      when: (v) => v.site === 'hypopharynx',
      options: [
        { value: 'Tis', label: 'pTis — carcinoma in situ' },                                                                                                                   // pTis: Carcinoma in situ
        { value: 'T1',  label: 'pT1 — limitado a um subsítio da hipofaringe e/ou ≤2 cm' },                                                                                    // pT1: Tumor limited to one subsite of hypopharynx and / or 2 cm or smaller in greatest dimension
        { value: 'T2',  label: 'pT2 — mais de um subsítio ou sítio adjacente, ou >2 a 4 cm, sem fixação da hemilaringe' },                                                    // pT2: Tumor invades more than one subsite of hypopharynx or an adjacent site, or measures larger than 2 cm but not larger than 4 cm in greatest dimension without fixation of hemilarynx
        { value: 'T3',  label: 'pT3 — >4 cm, ou fixação da hemilaringe, ou extensão à mucosa esofágica' },                                                                     // pT3: Tumor larger than 4 cm in greatest dimension or with fixation of hemilarynx or extension to esophageal mucosa
        { value: 'T4a', label: 'pT4a — invade cartilagem tireoide/cricoide, osso hioide, tireoide, musculatura esofágica ou partes moles do compartimento central' },           // pT4a: Moderately advanced local disease. Tumor invades thyroid / cricoid cartilage, hyoid bone, thyroid gland, esophageal muscle, or central compartment soft tissue
        { value: 'T4b', label: 'pT4b — invade fáscia pré-vertebral, envolve carótida ou estruturas mediastinais' },                                                            // pT4b: Very advanced local disease. Tumor invades prevertebral fascia, encases carotid artery, or involves mediastinal structures
        { value: 'T4',  label: 'pT4 — subcategoria indeterminada' },                                                                                                           // pT4 (subcategory cannot be determined)
      ],
    },
    MULTI_FIELD,
    {
      id: 'pN', label: 'Categoria pN — Linfonodos regionais', type: 'select', default: 'none',
      hint: 'Linfonodos de linha média contam como ipsilaterais. ENE = extensão extranodal.',
      options: HN_PN_OPTIONS,
    },
    PM_FIELD,
  ],

  compute(v) {
    const warnings: string[] = [];
    const pre = prefix(strOf(v.mod));
    const T = v.site === 'hypopharynx' ? strOf(v.pTh) : strOf(v.pTo);
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
