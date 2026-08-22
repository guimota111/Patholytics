/* ==========================================================================
   Carcinoma de Cavidade Nasal e Seios Paranasais — AJCC 8ª edição
   Base: CAP Protocol – Nasal Cavity and Paranasal Sinuses v4.3.0.0.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, PM_FIELD, HN_PN_OPTIONS, prefix, stagingLine, pmToken } from './_shared'

const calculator: Calculator = {
  id: 'hn-nasal',
  name: 'Carcinoma Nasossinusal',
  section: 'Cabeça e Pescoço',
  system: 'AJCC 8ª ed.',
  version: 'CAP — Nasal Cavity and Paranasal Sinuses v4.3.0.0',
  reference: 'AJCC Cancer Staging Manual, 8th ed.',
  summary: 'Estadiamento pTNM de carcinoma do seio maxilar ou da cavidade nasal / seio etmoidal.',

  fields: [
    MOD_FIELD,
    {
      id: 'site', label: 'Sítio', type: 'radio', default: 'maxillary',
      options: [
        { value: 'maxillary',   label: 'Seio maxilar' },                          // Maxillary sinus
        { value: 'nasoethmoid', label: 'Cavidade nasal e seio etmoidal' },        // Nasal cavity and ethmoid sinus
      ],
    },
    {
      id: 'pTm', label: 'Categoria pT — seio maxilar', type: 'select', default: 'T1',
      when: (v) => v.site === 'maxillary',
      options: [
        { value: 'Tis', label: 'pTis — carcinoma in situ' },                                                                                                                   // pTis: Carcinoma in situ
        { value: 'T1',  label: 'pT1 — limitado à mucosa do seio maxilar, sem erosão/destruição óssea' },                                                                      // pT1: Tumor limited to the maxillary sinus mucosa with no erosion or destruction of bone
        { value: 'T2',  label: 'pT2 — erosão/destruição óssea incl. palato duro e/ou meato nasal médio, exceto parede posterior do seio e lâminas pterigoides' },             // pT2: Tumor causing bone erosion or destruction including extension into the hard palate and / or middle nasal meatus, except extension to posterior wall of maxillary sinus and pterygoid plates
        { value: 'T3',  label: 'pT3 — invade osso da parede posterior do seio, subcutâneo, assoalho ou parede medial da órbita, fossa pterigoide ou seios etmoidais' },        // pT3: Tumor invades any of the following: bone of the posterior wall of maxillary sinus, subcutaneous tissues, floor or medial wall of orbit, pterygoid fossa, ethmoid sinuses
        { value: 'T4a', label: 'pT4a — invade conteúdo orbitário anterior, pele da bochecha, lâminas pterigoides, fossa infratemporal, lâmina crivosa, seios esfenoidal ou frontal' }, // pT4a: Moderately advanced local disease. Tumor invades anterior orbital contents, skin of cheek, pterygoid plates, infratemporal fossa, cribriform plate, sphenoid or frontal sinuses
        { value: 'T4b', label: 'pT4b — invade ápice orbitário, dura, cérebro, fossa craniana média, nervos cranianos (exceto V2), nasofaringe ou clivo' },                       // pT4b: Very advanced local disease. Tumor invades any of the following: orbital apex, dura, brain, middle cranial fossa, cranial nerves other than maxillary division of trigeminal nerve (V2), nasopharynx, or clivus
        { value: 'T4',  label: 'pT4 — subcategoria indeterminada' },                                                                                                            // pT4 (subcategory cannot be determined)
      ],
    },
    {
      id: 'pTn', label: 'Categoria pT — cavidade nasal e etmoide', type: 'select', default: 'T1',
      when: (v) => v.site === 'nasoethmoid',
      options: [
        { value: 'Tis', label: 'pTis — carcinoma in situ' },                                                                                                                   // pTis: Carcinoma in situ
        { value: 'T1',  label: 'pT1 — restrito a um subsítio, com ou sem invasão óssea' },                                                                                    // pT1: Tumor restricted to any one subsite, with or without bony invasion
        { value: 'T2',  label: 'pT2 — invade dois subsítios de uma região ou região adjacente do complexo nasoetmoidal, com ou sem invasão óssea' },                          // pT2: Tumor invading two subsites in a single region or extending to involve an adjacent region within the nasoethmoidal complex, with or without bony invasion
        { value: 'T3',  label: 'pT3 — invade parede medial ou assoalho da órbita, seio maxilar, palato ou lâmina crivosa' },                                                  // pT3: Tumor extends to invade the medial wall or floor of the orbit, maxillary sinus, palate, or cribriform plate
        { value: 'T4a', label: 'pT4a — invade conteúdo orbitário anterior, pele do nariz/bochecha, extensão mínima à fossa craniana anterior, lâminas pterigoides, seios esfenoidal ou frontal' }, // pT4a: Moderately advanced local disease. Tumor invades any of the following: anterior orbital contents, skin of nose or cheek, minimal extension to anterior cranial fossa, pterygoid plates, sphenoid or frontal sinuses
        { value: 'T4b', label: 'pT4b — invade ápice orbitário, dura, cérebro, fossa craniana média, nervos cranianos (exceto V2), nasofaringe ou clivo' },                       // pT4b: Very advanced local disease. Tumor invades any of the following: orbital apex, dura, brain, middle cranial fossa, cranial nerves other than (V2), nasopharynx, or clivus
        { value: 'T4',  label: 'pT4 — subcategoria indeterminada' },                                                                                                            // pT4 (subcategory cannot be determined)
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
    const T = v.site === 'nasoethmoid' ? strOf(v.pTn) : strOf(v.pTm);
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
