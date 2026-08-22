/* ==========================================================================
   Carcinoma Gástrico — AJCC 8ª edição (estadiamento patológico, pTNM)
   Base: CAP Protocol – Stomach (Resection).
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   ========================================================================== */

import type { Calculator } from '../types'
import { numOf, strOf } from '../types'

const calculator: Calculator = {
  id: 'gastric',
  name: 'Carcinoma Gástrico',
  section: 'Trato Gastrointestinal',
  system: 'AJCC 8ª ed.',
  version: 'CAP — Stomach (Resection)',
  reference: 'AJCC Cancer Staging Manual, 8th ed.',
  summary: 'Estadiamento pTNM de adenocarcinoma gástrico em espécime de ressecção.',

  fields: [
    {
      id: 'pT', label: 'Categoria pT — Tumor primário', type: 'select',
      default: 'T2',
      options: [
        { value: 'Tis', label: 'pTis — carcinoma in situ (intraepitelial, sem invasão da lâmina própria)' },
        { value: 'T1a', label: 'pT1a — invade a lâmina própria ou a muscular da mucosa' },
        { value: 'T1b', label: 'pT1b — invade a submucosa' },
        { value: 'T2',  label: 'pT2 — invade a muscular própria' },
        { value: 'T3',  label: 'pT3 — invade a subserosa, sem penetrar o peritônio visceral' },
        { value: 'T4a', label: 'pT4a — penetra a serosa (peritônio visceral)' },
        { value: 'T4b', label: 'pT4b — invade estruturas/órgãos adjacentes' },
      ],
    },
    {
      id: 'nExamined', label: 'Linfonodos regionais examinados', type: 'number', min: 0,
      hint: 'Recomenda-se avaliar ≥16 linfonodos.',
    },
    {
      id: 'nPositive', label: 'Linfonodos regionais positivos', type: 'number', min: 0,
    },
    {
      id: 'M', label: 'Categoria M — Metástase à distância', type: 'select',
      default: 'M0',
      options: [
        { value: 'M0', label: 'M0 — sem metástase à distância' },
        { value: 'M1', label: 'M1 — metástase à distância presente' },
      ],
    },
  ],

  compute(v) {
    const warnings: string[] = [];
    const pos = numOf(v.nPositive), exam = numOf(v.nExamined);

    // --- Categoria N ---
    let N: string | null = null;
    if (pos == null) { N = null; }
    else if (pos === 0) { N = 'N0'; }
    else if (pos <= 2)  { N = 'N1'; }
    else if (pos <= 6)  { N = 'N2'; }
    else if (pos <= 15) { N = 'N3a'; }
    else                { N = 'N3b'; }

    if (exam != null && pos != null && pos > exam) {
      warnings.push('Nº de linfonodos positivos maior que o total examinado — verifique as contagens.');
    }
    if (exam != null && exam > 0 && exam < 16 && v.pT !== 'Tis') {
      warnings.push('Menos de 16 linfonodos examinados — documentar adequação da amostragem.');
    }

    // normaliza T1a/T1b -> T1 para a tabela de grupos
    const Traw = strOf(v.pT);
    const T = (Traw === 'T1a' || Traw === 'T1b') ? 'T1' : Traw;
    const M = strOf(v.M);

    const group = stageGroup(T, N, M);

    const tokens = [
      'p' + Traw,
      N ? 'p' + N : null,
      M === 'M0' ? null : 'pM1',
    ].filter(Boolean);
    const report = `Estadiamento patológico (AJCC 8ªed.): ${tokens.join(' ')}.`;

    return {
      tnm: [
        { k: 'pT', v: 'p' + Traw },
        { k: 'pN', v: N ? 'p' + N : '—' },
        { k: 'pM', v: M === 'M0' ? 'pM0' : 'pM1' },
      ],
      stageGroup: group,
      warnings,
      report,
    };
  },
}

/* Tabela de grupos prognósticos patológicos — AJCC 8ª ed. (estômago) */
function stageGroup(T: string, N: string | null, M: string): string | null {
  if (!N) return null;
  if (M === 'M1') return 'Estádio IV';
  if (T === 'Tis' && N === 'N0') return 'Estádio 0';

  const key = `${T}|${N}`;
  const table: Record<string, string> = {
    'T1|N0': 'IA',
    'T1|N1': 'IB', 'T2|N0': 'IB',
    'T1|N2': 'IIA', 'T2|N1': 'IIA', 'T3|N0': 'IIA',
    'T1|N3a': 'IIB', 'T2|N2': 'IIB', 'T3|N1': 'IIB', 'T4a|N0': 'IIB',
    'T2|N3a': 'IIIA', 'T3|N2': 'IIIA', 'T4a|N1': 'IIIA', 'T4a|N2': 'IIIA', 'T4b|N0': 'IIIA',
    'T1|N3b': 'IIIB', 'T2|N3b': 'IIIB', 'T3|N3a': 'IIIB', 'T4a|N3a': 'IIIB', 'T4b|N1': 'IIIB', 'T4b|N2': 'IIIB',
    'T3|N3b': 'IIIC', 'T4a|N3b': 'IIIC', 'T4b|N3a': 'IIIC', 'T4b|N3b': 'IIIC',
  };
  const g = table[key];
  return g ? `Estádio ${g}` : null;
}

export default calculator
