/* ==========================================================================
   Mama — Tumor Phyllodes maligno (Ressecção) — AJCC 8ª edição
   Base: CAP — Breast Phyllodes, Resection (v1.1.0.1).
   Estadiamento pTNM aplica-se APENAS a tumores malignos, pelas regras de
   sarcoma de partes moles de tronco. pT/pN não se atribuem a benigno/borderline.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   ========================================================================== */

import { prefix, stagingLine } from './_shared';
import type { Calculator } from '../types'
import { numOf, strOf } from '../types'

const calculator: Calculator = {
  id: 'breast-phyllodes',
  name: 'Mama — Tumor Phyllodes (maligno)',
  section: 'Mama',
  system: 'AJCC 8ª ed.',
  version: 'CAP — Breast Phyllodes v1.1',
  reference: 'AJCC 8th ed. (sarcoma de partes moles, tronco) / CAP Breast.Phyllodes 1.1.0.1',
  summary: 'Estadiamento pTNM do tumor Phyllodes MALIGNO (não se aplica a benigno/borderline).',

  fields: [
    {
      id: 'grade', label: 'Classificação histológica', type: 'select', default: 'malignant',
      hint: 'Só o maligno é estadiado.',
      options: [
        { value: 'malignant', label: 'Maligno' },
        { value: 'other',     label: 'Benigno ou borderline (não se estadia)' },
      ],
    },
    {
      id: 'mod', label: 'Descritor', type: 'select', default: '',
      options: [
        { value: '',  label: 'Nenhum' },
        { value: 'y', label: 'y (pós-tratamento)' },
        { value: 'r', label: 'r (recorrente)' },
      ],
      when: v => v.grade === 'malignant',
    },
    {
      id: 'sizeMm', label: 'Maior dimensão do tumor (mm)', type: 'number', min: 0, default: 60,
      hint: 'pT1 ≤50; pT2 >50–100; pT3 >100–150; pT4 >150.',
      when: v => v.grade === 'malignant',
    },
    {
      id: 'nodeInput', label: 'Linfonodos regionais', type: 'select', default: 'none',
      hint: 'Metástase nodal é incomon; sem linfonodos, pN não é atribuído (pNX não se usa).',
      options: [
        { value: 'none', label: 'Nenhum linfonodo → pN não atribuído' },
        { value: 'N0',   label: 'pN0 — sem metástase regional' },
        { value: 'N1',   label: 'pN1 — metástase em linfonodo regional' },
      ],
      when: v => v.grade === 'malignant',
    },
    {
      id: 'pm', label: 'Metástase à distância (pM)', type: 'radio', default: 'na',
      options: [
        { value: 'na', label: 'Não aplicável' },
        { value: 'm1', label: 'pM1 (à distância)' },
      ],
      when: v => v.grade === 'malignant',
    },
  ],

  compute(v) {
    if (v.grade !== 'malignant') {
      return {
        tnm: [{ k: 'pT', v: '—' }, { k: 'pN', v: '—' }, { k: 'pM', v: '—' }],
        stageGroup: null,
        warnings: ['Tumores Phyllodes benignos e borderline NÃO recebem estadiamento pTNM.'],
        report: 'Tumor Phyllodes benigno/borderline — não se aplica estadiamento pTNM (AJCC 8ª ed.).',
      };
    }

    const warnings: string[] = [];
    const pre = prefix(strOf(v.mod));

    // pT por tamanho (mm)
    let Tcat = '';
    const s = numOf(v.sizeMm);
    if (s == null) Tcat = 'TX';
    else if (s <= 50) Tcat = 'T1';
    else if (s <= 100) Tcat = 'T2';
    else if (s <= 150) Tcat = 'T3';
    else Tcat = 'T4';
    const pTtoken = `${pre}${Tcat}`;

    // pN
    let Ncat: string | null = null;
    if (v.nodeInput === 'N0') Ncat = 'N0';
    else if (v.nodeInput === 'N1') Ncat = 'N1';
    const pNtoken = Ncat ? `${pre}${Ncat}` : null;

    const M1 = v.pm === 'm1';
    const pMtoken = M1 ? 'pM1' : null;

    const report = stagingLine([pTtoken, pNtoken, pMtoken]);

    return {
      tnm: [
        { k: 'pT', v: pTtoken },
        { k: 'pN', v: pNtoken || '— (não atribuído)' },
        { k: 'pM', v: pMtoken || '—' },
      ],
      stageGroup: null,
      warnings,
      report,
    };
  },
}

export default calculator
