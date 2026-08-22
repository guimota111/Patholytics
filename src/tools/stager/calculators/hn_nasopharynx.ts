/* ==========================================================================
   Carcinoma de Nasofaringe — AJCC 9ª versão
   Base: CAP Protocol – Nasopharynx (Resection) v1.0.0.0, abr/2026.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, prefix, stagingLine, pmToken } from './_shared'

const calculator: Calculator = {
  id: 'hn-nasopharynx',
  name: 'Carcinoma de Nasofaringe',
  section: 'Cabeça e Pescoço',
  system: 'AJCC 9ª versão',
  version: 'CAP — Nasopharynx (Resection) v1.0.0.0',
  reference: 'AJCC Cancer Staging System, version 9',
  summary: 'Estadiamento pTNM de carcinoma de nasofaringe.',

  fields: [
    MOD_FIELD,
    {
      id: 'pT', label: 'Categoria pT — Tumor primário', type: 'select', default: 'T1',
      options: [
        { value: 'T0',  label: 'pT0 — sem evidência de tumor primário, mas linfonodo(s) cervical(is) EBV-positivo(s)' },                                                                  // pT0: No evidence of primary tumor, but EBV-positive cervical node(s) involvement
        { value: 'Tis', label: 'pTis — carcinoma in situ' },                                                                                                                               // pTis: Carcinoma in situ
        { value: 'T1',  label: 'pT1 — confinado à nasofaringe, ou extensão a orofaringe/cavidade nasal sem envolvimento parafaríngeo' },                                                  // pT1: Tumor confined to nasopharynx; OR Tumor with extension to any of the following without parapharyngeal involvement: oropharynx or nasal cavity
        { value: 'T2',  label: 'pT2 — extensão ao espaço parafaríngeo, ou partes moles adjacentes (pterigoide medial/lateral, músculos pré-vertebrais)' },                                // pT2: Tumor with extension to any of the following: Parapharyngeal space; or adjacent soft tissue involvement of medial pterygoid, lateral pterygoid, prevertebral muscles
        { value: 'T3',  label: 'pT3 — infiltração inequívoca de base do crânio (incl. estruturas pterigoides), seios paranasais ou vértebras cervicais' },                                // pT3: Tumor with unequivocal infiltration into any of the following bony structures: Skull base (including pterygoid structures); or paranasal sinuses; or cervical vertebrae
        { value: 'T4',  label: 'pT4 — extensão intracraniana; nervos cranianos; hipofaringe; órbita (incl. fissura orbitária inferior); parótida; ou infiltração extensa além da superfície anterolateral do pterigoide lateral' }, // pT4: Tumor with any of the following: Intracranial extension; or unequivocal radiological and / or clinical involvement of cranial nerves; or involvement of hypopharynx; or involvement of orbit (including inferior orbital fissure); or involvement of parotid gland; or extensive soft tissue infiltration beyond the anterolateral surface of the lateral pterygoid muscle
      ],
    },
    MULTI_FIELD,
    {
      id: 'pN', label: 'Categoria pN — Linfonodos regionais', type: 'select', default: 'none',
      options: [
        { value: 'none', label: 'pN não atribuído (sem linfonodos ou não determinável)' },
        { value: 'N0', label: 'pN0 — sem acometimento de linfonodo regional' },                                                                                                           // pN0: No tumor involvement of regional lymph node(s)
        { value: 'N1', label: 'pN1 — cervical unilateral e/ou retrofaríngeo uni/bilateral; todos ≤6 cm, acima da borda caudal da cricoide, sem ENE avançada' },                           // pN1: Tumor involvement of any of the following: Unilateral cervical lymph node(s) or unilateral or bilateral retropharyngeal lymph node(s); AND all of the following: Less than or equal to 6 cm in greatest dimension; and above the caudal border of cricoid cartilage; and without advanced extranodal extension
        { value: 'N2', label: 'pN2 — cervicais bilaterais; todos ≤6 cm, acima da borda caudal da cricoide, sem ENE avançada' },                                                            // pN2: Tumor involvement of bilateral cervical lymph nodes AND all of the following: Less than or equal to 6 cm in greatest dimension; and above the caudal border of cricoid cartilage; and without advanced extranodal extension
        { value: 'N3', label: 'pN3 — cervical uni/bilateral com qualquer: >6 cm; extensão abaixo da borda caudal da cricoide; ou ENE radiológica avançada (músculos adjacentes, pele e/ou feixe neurovascular)' }, // pN3: Tumor involvement of unilateral or bilateral cervical lymph node(s); AND any of the following: Greater than 6 cm in greatest dimension; or extension below the caudal border of cricoid cartilage; or advanced radiologic extranodal extension with involvement of adjacent muscles, skin, and / or neurovascular bundle
      ],
    },
    {
      id: 'M', label: 'Categoria pM — Metástase à distância', type: 'select', default: 'na',
      options: [
        { value: 'na',  label: 'Não aplicável — pM não determinável neste espécime' },
        { value: 'M1a', label: 'pM1a — ≤3 lesões metastáticas em um ou mais órgãos/sítios' },   // pM1a: Microscopic confirmation of less than or equal to 3 metastatic lesions in one or more organs / sites
        { value: 'M1b', label: 'pM1b — >3 lesões metastáticas em um ou mais órgãos/sítios' },   // pM1b: Microscopic confirmation of greater than 3 metastatic lesions in one or more organs / sites
        { value: 'M1',  label: 'pM1 — subgrupo indeterminado' },                                  // pM1 (subgroup cannot be determined)
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
      report: stagingLine([pT, pN, pM], 'AJCC 9ª versão'),
    };
  },
};

export default calculator
