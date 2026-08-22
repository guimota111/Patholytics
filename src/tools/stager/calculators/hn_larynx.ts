/* ==========================================================================
   Carcinoma de Laringe — AJCC 8ª edição
   Base: CAP Protocol – Larynx v4.3.0.0.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, PM_FIELD, HN_PN_OPTIONS, prefix, stagingLine, pmToken } from './_shared'

const calculator: Calculator = {
  id: 'hn-larynx',
  name: 'Carcinoma de Laringe',
  section: 'Cabeça e Pescoço',
  system: 'AJCC 8ª ed.',
  version: 'CAP — Larynx v4.3.0.0',
  reference: 'AJCC Cancer Staging Manual, 8th ed.',
  summary: 'Estadiamento pTNM de carcinoma de laringe; a escala de pT depende do subsítio (supraglote, glote, subglote).',

  fields: [
    MOD_FIELD,
    {
      id: 'site', label: 'Subsítio', type: 'radio', default: 'glottis',
      options: [
        { value: 'supraglottis', label: 'Supraglote' },  // Supraglottis
        { value: 'glottis',      label: 'Glote' },       // Glottis
        { value: 'subglottis',   label: 'Subglote' },    // Subglottis
      ],
    },
    {
      id: 'pTsg', label: 'Categoria pT — supraglote', type: 'select', default: 'T1',
      when: (v) => v.site === 'supraglottis',
      options: [
        { value: 'Tis', label: 'pTis — carcinoma in situ' },                                                                                                                                   // pTis: Carcinoma in situ
        { value: 'T1',  label: 'pT1 — limitado a um subsítio da supraglote, com mobilidade normal das pregas vocais' },                                                                        // pT1: Tumor limited to one subsite of supraglottis with normal vocal cord mobility
        { value: 'T2',  label: 'pT2 — invade mucosa de mais de um subsítio adjacente da supraglote ou glote, ou região fora da supraglote (base da língua, valécula, parede medial do seio piriforme), sem fixação da laringe' }, // pT2: Tumor invades mucosa of more than one adjacent subsite of supraglottis or glottis or region outside the supraglottis (e.g., mucosa of base of tongue, vallecula, medial wall of pyriform sinus) without fixation of the larynx
        { value: 'T3',  label: 'pT3 — limitado à laringe com fixação de prega vocal e/ou invade área pós-cricoide, espaço pré-epiglótico, espaço paraglótico e/ou córtex interno da cartilagem tireoide' }, // pT3: Tumor limited to larynx with vocal cord fixation and / or invades any of the following: postcricoid area, preepiglottic space, paraglottic space, and / or inner cortex of thyroid cartilage
        { value: 'T4a', label: 'pT4a — invade através do córtex externo da cartilagem tireoide e/ou tecidos além da laringe (traqueia, partes moles do pescoço incl. músculos extrínsecos profundos da língua, pré-tireoidianos, tireoide, esôfago)' }, // pT4a: Moderately advanced local disease. Tumor invades through the outer cortex of the thyroid cartilage and / or invades tissues beyond the larynx (...)
        { value: 'T4b', label: 'pT4b — invade espaço pré-vertebral, envolve carótida ou invade estruturas mediastinais' },                                                                     // pT4b: Very advanced local disease. Tumor invades prevertebral space, encases carotid artery, or invades mediastinal structures
        { value: 'T4',  label: 'pT4 — subgrupo indeterminado' },                                                                                                                               // pT4 (subgroup cannot be determined)
      ],
    },
    {
      id: 'pTg', label: 'Categoria pT — glote', type: 'select', default: 'T1a',
      when: (v) => v.site === 'glottis',
      options: [
        { value: 'Tis', label: 'pTis — carcinoma in situ' },                                                                                                         // pTis: Carcinoma in situ
        { value: 'T1a', label: 'pT1a — limitado a uma prega vocal (pode envolver comissura anterior ou posterior), mobilidade normal' },                             // pT1a: Tumor limited to one vocal cord
        { value: 'T1b', label: 'pT1b — envolve ambas as pregas vocais, mobilidade normal' },                                                                          // pT1b: Tumor involves both vocal cords
        { value: 'T1',  label: 'pT1 — limitado às pregas vocais, subgrupo indeterminado' },                                                                          // pT1 (subgroup cannot be determined)
        { value: 'T2',  label: 'pT2 — estende-se à supraglote e/ou subglote, e/ou mobilidade diminuída da prega vocal' },                                            // pT2: Tumor extends to supraglottis and / or subglottis, and / or with impaired vocal cord mobility
        { value: 'T3',  label: 'pT3 — limitado à laringe com fixação de prega vocal e/ou invasão do espaço paraglótico e/ou córtex interno da cartilagem tireoide' }, // pT3: Tumor limited to the larynx with vocal cord fixation and / or invasion of paraglottic space and / or inner cortex of the thyroid cartilage
        { value: 'T4a', label: 'pT4a — invade através do córtex externo da cartilagem tireoide e/ou tecidos além da laringe (traqueia, cricoide, partes moles do pescoço, tireoide, esôfago)' }, // pT4a: Moderately advanced local disease. Tumor invades through the outer cortex of the thyroid cartilage and / or invades tissues beyond the larynx (e.g., trachea, cricoid cartilage, soft tissues of neck including deep extrinsic muscle of the tongue, strap muscles, thyroid, or esophagus)
        { value: 'T4b', label: 'pT4b — invade espaço pré-vertebral, envolve carótida ou invade estruturas mediastinais' },                                           // pT4b: Very advanced local disease. Tumor invades prevertebral space, encases carotid artery, or invades mediastinal structures
        { value: 'T4',  label: 'pT4 — subgrupo indeterminado' },                                                                                                     // pT4 (subgroup cannot be determined)
      ],
    },
    {
      id: 'pTsb', label: 'Categoria pT — subglote', type: 'select', default: 'T1',
      when: (v) => v.site === 'subglottis',
      options: [
        { value: 'Tis', label: 'pTis — carcinoma in situ' },                                                                                                         // pTis: Carcinoma in situ
        { value: 'T1',  label: 'pT1 — limitado à subglote' },                                                                                                        // pT1: Tumor limited to subglottis
        { value: 'T2',  label: 'pT2 — estende-se à(s) prega(s) vocal(is), com mobilidade normal ou diminuída' },                                                     // pT2: Tumor extends to vocal cord(s) with normal or impaired mobility
        { value: 'T3',  label: 'pT3 — limitado à laringe com fixação de prega vocal e/ou invasão do espaço paraglótico e/ou córtex interno da cartilagem tireoide' }, // pT3: Tumor limited to larynx with vocal cord fixation and / or invasion of paraglottic space and / or inner cortex of the thyroid cartilage
        { value: 'T4a', label: 'pT4a — invade cartilagem cricoide ou tireoide e/ou tecidos além da laringe (traqueia, partes moles do pescoço, tireoide, esôfago)' }, // pT4a: Moderately advanced local disease. Tumor invades cricoid or thyroid cartilage and / or invades tissues beyond the larynx (...)
        { value: 'T4b', label: 'pT4b — invade espaço pré-vertebral, envolve carótida ou invade estruturas mediastinais' },                                           // pT4b: Very advanced local disease. Tumor invades prevertebral space, encases carotid artery, or invades mediastinal structures
        { value: 'T4',  label: 'pT4 — subgrupo indeterminado' },                                                                                                     // pT4 (subgroup cannot be determined)
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
    const T = v.site === 'supraglottis' ? strOf(v.pTsg) : v.site === 'subglottis' ? strOf(v.pTsb) : strOf(v.pTg);
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
