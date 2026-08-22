/* ==========================================================================
   Carcinoma Colorretal — AJCC 8ª edição
   Base: CAP Protocol – Colon and Rectum (Resection).
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   ========================================================================== */

import type { Calculator } from '../types'
import { numOf, strOf } from '../types'

const calculator: Calculator = {
  id: 'colorectal',
  name: 'Carcinoma Colorretal',
  section: 'Trato Gastrointestinal',
  system: 'AJCC 8ª ed.',
  version: 'CAP — Colon & Rectum (Resection)',
  reference: 'AJCC Cancer Staging Manual, 8th ed.',
  summary: 'Estadiamento pTNM de adenocarcinoma de cólon e reto em espécime de ressecção.',

  fields: [
    {
      id: 'pT', label: 'Categoria pT — Tumor primário', type: 'select',
      default: 'T3',
      options: [
        { value: 'Tis', label: 'pTis — carcinoma in situ / intramucoso (lâmina própria ou muscular da mucosa)' },
        { value: 'T1',  label: 'pT1 — invade a submucosa' },
        { value: 'T2',  label: 'pT2 — invade a muscular própria' },
        { value: 'T3',  label: 'pT3 — atravessa a muscular própria até tecidos pericolorretais' },
        { value: 'T4a', label: 'pT4a — penetra a superfície do peritônio visceral' },
        { value: 'T4b', label: 'pT4b — invade/adere a órgãos ou estruturas adjacentes' },
      ],
    },
    {
      id: 'nExamined', label: 'Linfonodos regionais examinados', type: 'number',
      min: 0, hint: 'Total de linfonodos identificados no espécime.',
    },
    {
      id: 'nPositive', label: 'Linfonodos regionais positivos', type: 'number',
      min: 0, hint: 'Nº de linfonodos com metástase.',
    },
    {
      id: 'deposits', label: 'Depósitos tumorais (satélites) presentes?', type: 'radio',
      default: 'no',
      hint: 'Focos no tecido pericolorretal sem linfonodo residual identificável.',
      options: [ { value: 'no', label: 'Não' }, { value: 'yes', label: 'Sim' } ],
    },
    {
      id: 'M', label: 'Categoria M — Metástase à distância', type: 'select',
      default: 'M0',
      options: [
        { value: 'M0',  label: 'M0 — sem metástase à distância' },
        { value: 'M1a', label: 'M1a — metástase em 1 órgão/sítio (sem peritônio)' },
        { value: 'M1b', label: 'M1b — metástase em ≥2 órgãos/sítios (sem peritônio)' },
        { value: 'M1c', label: 'M1c — metástase peritoneal (± outros sítios)' },
      ],
    },
  ],

  compute(v) {
    const warnings: string[] = [];

    // --- Categoria N a partir das contagens ---
    const pos = numOf(v.nPositive);
    const exam = numOf(v.nExamined);
    let N: string | null = null;

    if (pos == null) {
      N = null;
    } else if (pos === 0) {
      if (v.deposits === 'yes') { N = 'N1c'; }
      else { N = 'N0'; }
    } else if (pos === 1) { N = 'N1a'; }
    else if (pos <= 3)    { N = 'N1b'; }
    else if (pos <= 6)    { N = 'N2a'; }
    else                  { N = 'N2b'; }

    if (exam != null && pos != null && pos > exam) {
      warnings.push('Nº de linfonodos positivos maior que o total examinado — verifique as contagens.');
    }
    if (exam != null && exam > 0 && exam < 12 && v.pT !== 'Tis') {
      warnings.push('Menos de 12 linfonodos examinados — recomenda-se documentar (adequação da amostragem).');
    }

    const T = strOf(v.pT);
    const M = strOf(v.M);

    // --- Grupo prognóstico (AJCC 8ª ed.) ---
    const group = stageGroup(T, N, M);

    // --- Texto do laudo (formato enxuto) ---
    const tokens = [
      'p' + T,
      N ? 'p' + N : null,
      M === 'M0' ? null : 'p' + M,
    ].filter(Boolean);
    const report = `Estadiamento patológico (AJCC 8ªed.): ${tokens.join(' ')}.`;

    return {
      tnm: [
        { k: 'pT', v: 'p' + T },
        { k: 'pN', v: N ? 'p' + N : '—' },
        { k: 'pM', v: M === 'M0' ? 'pM0' : 'p' + M },
      ],
      stageGroup: group,
      warnings,
      report,
    };
  },
}

/* --- Tabela de grupos prognósticos AJCC 8ª ed. (cólon e reto) --- */
function stageGroup(T: string, N: string | null, M: string): string | null {
  if (!N) return null;

  // Doença metastática domina o grupo
  if (M === 'M1a') return 'Estádio IVA';
  if (M === 'M1b') return 'Estádio IVB';
  if (M === 'M1c') return 'Estádio IVC';

  // M0
  if (T === 'Tis' && N === 'N0') return 'Estádio 0';

  const isN1 = ['N1a', 'N1b', 'N1c'].includes(N);
  const isN2a = N === 'N2a';
  const isN2b = N === 'N2b';

  if (N === 'N0') {
    if (T === 'T1' || T === 'T2') return 'Estádio I';
    if (T === 'T3') return 'Estádio IIA';
    if (T === 'T4a') return 'Estádio IIB';
    if (T === 'T4b') return 'Estádio IIC';
  }

  if (isN1) {
    if (T === 'T1' || T === 'T2') return 'Estádio IIIA';
    if (T === 'T3' || T === 'T4a') return 'Estádio IIIB';
    if (T === 'T4b') return 'Estádio IIIC';
  }

  if (isN2a) {
    if (T === 'T1') return 'Estádio IIIA';
    if (T === 'T2' || T === 'T3') return 'Estádio IIIB';
    if (T === 'T4a') return 'Estádio IIIC';
    if (T === 'T4b') return 'Estádio IIIC';
  }

  if (isN2b) {
    if (T === 'T1' || T === 'T2') return 'Estádio IIIB';
    if (T === 'T3' || T === 'T4a' || T === 'T4b') return 'Estádio IIIC';
  }

  return null;
}

export default calculator
