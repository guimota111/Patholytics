/* ==========================================================================
   Adenocarcinoma de Próstata (prostatectomia radical) — AJCC 8ª edição
   Base: CAP Protocol – Prostate (Radical Prostatectomy) v4.3.0.0, set/2023.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { numOf, strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, NODE_FIELDS, prefix, stagingLine, pmToken, nodeCategory, countWarning } from './_shared'

const calculator: Calculator = {
  id: 'prostate',
  name: 'Adenocarcinoma de Próstata (prostatectomia)',
  section: 'Trato Geniturinário',
  system: 'AJCC 8ª ed.',
  version: 'CAP — Prostate (Radical Prostatectomy) v4.3.0.0',
  reference: 'AJCC Cancer Staging Manual, 8th ed.',
  summary: 'Estadiamento pTNM em prostatectomia radical, com grupo de grau (Gleason). Não existe pT1 patológico.',

  fields: [
    MOD_FIELD,
    {
      id: 'pT', label: 'Categoria pT — Tumor primário', type: 'select', default: 'T2',
      hint: 'Não há classificação pT1 (patológica).',
      options: [
        { value: 'T2',  label: 'pT2 — confinado ao órgão' },                                                                                          // pT2: Organ confined
        { value: 'T3a', label: 'pT3a — extensão extraprostática ou invasão microscópica do colo vesical' },                                           // pT3a: Extraprostatic extension or microscopic invasion of bladder neck
        { value: 'T3b', label: 'pT3b — invade vesícula(s) seminal(is)' },                                                                              // pT3b: Tumor invades seminal vesicle(s)
        { value: 'T3',  label: 'pT3 — subcategoria indeterminada' },                                                                                   // pT3 (subcategory cannot be determined)
        { value: 'T4',  label: 'pT4 — fixo ou invade estruturas adjacentes além das vesículas (esfíncter externo, reto, bexiga, elevadores, parede pélvica)' }, // pT4: Tumor is fixed or invades adjacent structures other than seminal vesicles such as external sphincter, rectum, bladder, levator muscles, and / or pelvic wall
      ],
    },
    MULTI_FIELD,
    ...NODE_FIELDS,
    {
      id: 'M', label: 'Categoria pM — Metástase à distância', type: 'select', default: 'na',
      hint: 'Com mais de um sítio, usa-se a categoria mais avançada (M1c).',
      options: [
        { value: 'na',  label: 'Não aplicável — pM não determinável neste espécime' },
        { value: 'M1a', label: 'pM1a — linfonodo(s) não regional(is)' },                 // pM1a: Nonregional lymph node(s)
        { value: 'M1b', label: 'pM1b — osso(s)' },                                       // pM1b: Bone(s)
        { value: 'M1c', label: 'pM1c — outro(s) sítio(s), com ou sem doença óssea' },    // pM1c: Other site(s) with or without bone disease
        { value: 'M1',  label: 'pM1 — subcategoria indeterminada' },                     // pM1 (subcategory cannot be determined)
      ],
    },
    {
      id: 'gg', label: 'Grupo de grau (Gleason)', type: 'select', default: '',
      options: [
        { value: '',  label: 'Não informar' },
        { value: '1', label: 'Grupo 1 — Gleason 3+3=6' },                 // Grade group 1 (Gleason Score 3 + 3 = 6)
        { value: '2', label: 'Grupo 2 — Gleason 3+4=7' },                 // Grade group 2 (Gleason Score 3 + 4 = 7)
        { value: '3', label: 'Grupo 3 — Gleason 4+3=7' },                 // Grade group 3 (Gleason Score 4 + 3 = 7)
        { value: '4', label: 'Grupo 4 — Gleason 8 (4+4, 3+5 ou 5+3)' },   // Grade group 4 (Gleason Score 4 + 4 = 8 / 3 + 5 = 8 / 5 + 3 = 8)
        { value: '5', label: 'Grupo 5 — Gleason 9–10 (4+5, 5+4 ou 5+5)' }, // Grade group 5 (Gleason Score 4 + 5 = 9 / 5 + 4 = 9 / 5 + 5 = 10)
      ],
    },
  ],

  compute(v) {
    const warnings: string[] = [];
    const pre = prefix(strOf(v.mod));
    const T = strOf(v.pT);
    const mSuffix = v.multi === 'yes' ? '(m)' : '';
    const pos = numOf(v.nPositive), exam = numOf(v.nExamined);

    // pN0: No positive regional nodes / pN1: Metastasis in regional nodes
    const N = nodeCategory(pos, [[0, 'N0'], [Infinity, 'N1']]);
    const w = countWarning(exam, pos); if (w) warnings.push(w);

    const pT = `${pre}${T}${mSuffix}`;
    const pN = N ? `${pre}${N}` : null;
    const pM = pmToken(strOf(v.M));
    const gg = strOf(v.gg);

    const parts = [stagingLine([pT, pN, pM])];
    if (gg) parts.push(`Grupo de grau ${gg}.`);

    return {
      tnm: [
        { k: 'pT', v: pT }, { k: 'pN', v: pN ?? '—' }, { k: 'pM', v: pM ?? '—' },
        { k: 'GG', v: gg || '—' },
      ],
      stageGroup: null,
      warnings,
      report: parts.join(' '),
    };
  },
};

export default calculator
