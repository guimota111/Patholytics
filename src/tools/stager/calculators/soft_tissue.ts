/* ==========================================================================
   Sarcomas de Partes Moles — AJCC 8ª edição
   Base: CAP Protocol – Soft Tissue (Resection) v4.2.0.0.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { numOf, strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, NODE_FIELDS, PM_FIELD, prefix, stagingLine, pmToken, nodeCategory, countWarning } from './_shared'

const calculator: Calculator = {
  id: 'soft-tissue',
  name: 'Sarcoma de Partes Moles',
  section: 'Tecidos Moles e Osso',
  system: 'AJCC 8ª ed.',
  version: 'CAP — Soft Tissue (Resection) v4.2.0.0',
  reference: 'AJCC Cancer Staging Manual, 8th ed.',
  summary: 'Estadiamento pTNM de sarcomas de partes moles; a escala de pT depende do sítio anatômico. Inclui grau FNCLCC.',

  fields: [
    MOD_FIELD,
    {
      id: 'site', label: 'Sítio anatômico', type: 'select', default: 'trunk',
      options: [
        { value: 'headneck', label: 'Cabeça e pescoço' },                                   // Head and Neck
        { value: 'trunk',    label: 'Tronco e extremidades' },                             // Trunk and Extremities
        { value: 'visceral', label: 'Órgãos viscerais abdominais e torácicos' },           // Abdomen and Thoracic Visceral Organs
        { value: 'retro',    label: 'Retroperitônio (e cavidades peritoneal/pleural/mediastinal sem órgão de origem)' }, // Retroperitoneum
        { value: 'orbit',    label: 'Órbita' },                                            // Orbit
      ],
    },
    {
      id: 'pTh', label: 'Categoria pT — cabeça e pescoço', type: 'select', default: 'T1',
      when: (v) => v.site === 'headneck',
      options: [
        { value: 'T1',  label: 'pT1 — ≤2 cm' },                                                                                                              // pT1: Tumor less than or equal to 2 cm
        { value: 'T2',  label: 'pT2 — >2 a 4 cm' },                                                                                                          // pT2: Tumor greater than 2 cm to less than or equal to 4 cm
        { value: 'T3',  label: 'pT3 — >4 cm' },                                                                                                              // pT3: Tumor greater than 4 cm
        { value: 'T4a', label: 'pT4a — invade órbita, base do crânio/dura, vísceras do compartimento central, esqueleto facial ou músculos pterigoides' },  // pT4a: Tumor with orbital invasion, skull base / dural invasion, invasion of central compartment viscera, involvement of facial skeleton, or invasion of pterygoid muscles
        { value: 'T4b', label: 'pT4b — invade parênquima cerebral, envolve carótida, músculos pré-vertebrais, ou SNC por disseminação perineural' },         // pT4b: Tumor with brain parenchymal invasion, carotid artery encasement, prevertebral muscle invasion, or central nervous system involvement via perineural spread
        { value: 'T4',  label: 'pT4 — subcategoria indeterminada' },                                                                                         // pT4 (subcategory cannot be determined)
      ],
    },
    {
      id: 'pTt', label: 'Categoria pT — tronco e extremidades', type: 'select', default: 'T1',
      when: (v) => v.site === 'trunk',
      options: [
        { value: 'T0', label: 'pT0 — sem evidência de tumor primário' },   // pT0: No evidence of primary tumor
        { value: 'T1', label: 'pT1 — ≤5 cm' },                             // pT1: Tumor 5 cm or less in greatest dimension
        { value: 'T2', label: 'pT2 — >5 a 10 cm' },                        // pT2: Tumor more than 5 cm and less than or equal to 10 cm in greatest dimension
        { value: 'T3', label: 'pT3 — >10 a 15 cm' },                       // pT3: Tumor more than 10 cm and less than or equal to 15 cm in greatest dimension
        { value: 'T4', label: 'pT4 — >15 cm' },                            // pT4: Tumor more than 15 cm in greatest dimension
      ],
    },
    {
      id: 'pTv', label: 'Categoria pT — vísceras abdominais e torácicas', type: 'select', default: 'T1',
      when: (v) => v.site === 'visceral',
      options: [
        { value: 'T1',  label: 'pT1 — confinado ao órgão' },                                                          // pT1: Organ confined
        { value: 'T2a', label: 'pT2a — invade serosa ou peritônio visceral' },                                        // pT2a: Invades serosa or visceral peritoneum
        { value: 'T2b', label: 'pT2b — extensão além da serosa (mesentério)' },                                       // pT2b: Extension beyond serosa (mesentery)
        { value: 'T2',  label: 'pT2 — subcategoria indeterminada' },                                                  // pT2 (subcategory cannot be determined)
        { value: 'T3',  label: 'pT3 — invade outro órgão (incl. diafragma, parede abdominal, parede pélvica)' },      // pT3: Invades another organ (including other structures such as diaphragm, abdominal wall, or pelvic side wall)
        { value: 'T4a', label: 'pT4a — multifocal (2 sítios)' },                                                      // pT4a: Multifocal (2 sites)
        { value: 'T4b', label: 'pT4b — multifocal (3–5 sítios)' },                                                    // pT4b: Multifocal (3 - 5 sites)
        { value: 'T4c', label: 'pT4c — multifocal (>5 sítios)' },                                                     // pT4c: Multifocal (greater than 5 sites)
        { value: 'T4',  label: 'pT4 — subcategoria indeterminada' },                                                  // pT4 (subcategory cannot be determined)
      ],
    },
    {
      id: 'pTr', label: 'Categoria pT — retroperitônio', type: 'select', default: 'T1',
      when: (v) => v.site === 'retro',
      options: [
        { value: 'T0', label: 'pT0 — sem evidência de tumor primário' },   // pT0: No evidence of primary tumor
        { value: 'T1', label: 'pT1 — ≤5 cm' },                             // pT1: Tumor 5 cm or less in greatest dimension
        { value: 'T2', label: 'pT2 — >5 a 10 cm' },                        // pT2: Tumor more than 5 cm and less than or equal to 10 cm in greatest dimension
        { value: 'T3', label: 'pT3 — >10 a 15 cm' },                       // pT3: Tumor more than 10 cm and less than or equal to 15 cm in greatest dimension
        { value: 'T4', label: 'pT4 — >15 cm' },                            // pT4: Tumor more than 15 cm in greatest dimension
      ],
    },
    {
      id: 'pTo', label: 'Categoria pT — órbita', type: 'select', default: 'T1',
      when: (v) => v.site === 'orbit',
      options: [
        { value: 'T0', label: 'pT0 — sem evidência de tumor primário' },                                                                                 // pT0: No evidence of primary tumor
        { value: 'T1', label: 'pT1 — ≤2 cm' },                                                                                                           // pT1: Tumor less than or equal to 2 cm in greatest dimension
        { value: 'T2', label: 'pT2 — >2 cm sem invasão das paredes ósseas ou do globo' },                                                                // pT2: Tumor greater than 2 cm in greatest dimension without invasion of bony walls or globe
        { value: 'T3', label: 'pT3 — qualquer tamanho com invasão das paredes ósseas' },                                                                 // pT3: Tumor of any size with invasion of bony walls
        { value: 'T4', label: 'pT4 — qualquer tamanho com invasão do globo ou estruturas periorbitárias (pálpebra, conjuntiva, fossa temporal, cavidade nasal, seios, SNC)' }, // pT4: Tumor of any size with invasion of globe or periorbital structures (...)
      ],
    },
    {
      id: 'grade', label: 'Grau histológico (FNCLCC)', type: 'select', default: '',
      options: [
        { value: '',   label: 'Não informar / não graduável' },
        { value: 'G1', label: 'G1 — escore total (diferenciação + mitoses + necrose) 2 ou 3' },   // G1, total differentiation, mitotic count and necrosis score 2 or 3
        { value: 'G2', label: 'G2 — escore total 4 ou 5' },                                       // G2, total differentiation, mitotic count and necrosis score 4 or 5
        { value: 'G3', label: 'G3 — escore total 6, 7 ou 8' },                                    // G3, total differentiation, mitotic count and necrosis score of 6, 7, or 8
      ],
    },
    MULTI_FIELD,
    ...NODE_FIELDS,
    PM_FIELD,
  ],

  compute(v) {
    const warnings: string[] = [];
    const pre = prefix(strOf(v.mod));
    const site = strOf(v.site);
    const T = site === 'headneck' ? strOf(v.pTh)
      : site === 'visceral' ? strOf(v.pTv)
      : site === 'retro' ? strOf(v.pTr)
      : site === 'orbit' ? strOf(v.pTo)
      : strOf(v.pTt);
    const mSuffix = v.multi === 'yes' ? '(m)' : '';
    const pos = numOf(v.nPositive), exam = numOf(v.nExamined);

    // pN0: No regional lymph node metastasis / pN1: Regional lymph node metastasis
    const N = nodeCategory(pos, [[0, 'N0'], [Infinity, 'N1']]);
    const w = countWarning(exam, pos); if (w) warnings.push(w);

    const pT = `${pre}${T}${mSuffix}`;
    const pN = N ? `${pre}${N}` : null;
    const pM = pmToken(strOf(v.M));
    const grade = strOf(v.grade);

    const parts = [stagingLine([pT, pN, pM])];
    if (grade) parts.push(`Grau histológico (FNCLCC): ${grade}.`);

    return {
      tnm: [
        { k: 'pT', v: pT }, { k: 'pN', v: pN ?? '—' }, { k: 'pM', v: pM ?? '—' },
        { k: 'Grau', v: grade || '—' },
      ],
      stageGroup: null,
      warnings,
      report: parts.join(' '),
    };
  },
};

export default calculator
