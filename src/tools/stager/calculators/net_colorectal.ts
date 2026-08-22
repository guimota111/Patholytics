/* ==========================================================================
   TNE bem diferenciado — Cólon e Reto — AJCC 8ª edição
   Base: CAP — ColoRectal.NET (v5.0.0.0).
   Aplica-se a tumores neuroendócrinos BEM diferenciados (carcinoides).
   NÃO se aplica a carcinoma neuroendócrino pouco diferenciado nem a MiNEN.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   ========================================================================== */

import { stagingLine, PM_NET_OPTIONS, pmNetToken } from './_shared';
import type { Calculator } from '../types'
import { strOf } from '../types'

const calculator: Calculator = {
  id: 'net-colorectal',
  name: 'TNE — Cólon e Reto',
  section: 'Trato Gastrointestinal',
  system: 'AJCC 8ª ed.',
  version: 'CAP — ColoRectal.NET v5.0',
  reference: 'AJCC 8th ed. / CAP ColoRectal.NET 5.0.0.0',
  summary: 'Estadiamento pTNM do tumor neuroendócrino bem diferenciado (carcinoide) de cólon e reto.',

  fields: [
    {
      id: 'pT', label: 'Categoria pT — Tumor primário', type: 'select', default: 'T2',
      options: [
        { value: 'T0',  label: 'pT0 — sem evidência de tumor primário' },
        { value: 'T1a', label: 'pT1a — mucosa/submucosa, ≤1 cm' },
        { value: 'T1b', label: 'pT1b — mucosa/submucosa, >1–2 cm' },
        { value: 'T1',  label: 'pT1 — mucosa/submucosa, ≤2 cm (subcategoria indeterminada)' },
        { value: 'T2',  label: 'pT2 — invade a muscular própria OU >2 cm com invasão de mucosa/submucosa' },
        { value: 'T3',  label: 'pT3 — atravessa a muscular própria até a subserosa, sem serosa' },
        { value: 'T4',  label: 'pT4 — invade o peritônio visceral (serosa) ou outros órgãos/estruturas' },
      ],
    },
    {
      id: 'multi', label: 'Múltiplos tumores primários sincrônicos?', type: 'radio', default: 'no',
      hint: 'Se sim, acrescenta o sufixo (m); usa-se o maior tumor para o pT.',
      options: [ { value: 'no', label: 'Não' }, { value: 'yes', label: 'Sim → (m)' } ],
    },
    {
      id: 'pN', label: 'Linfonodos regionais (pN)', type: 'select', default: 'none',
      options: [
        { value: 'none', label: 'Nenhum linfonodo submetido → pN não atribuído' },
        { value: 'N0',   label: 'pN0 — sem acometimento de linfonodos regionais' },
        { value: 'N1',   label: 'pN1 — acometimento de linfonodo(s) regional(is)' },
      ],
    },
    {
      id: 'pm', label: 'Metástase à distância (pM)', type: 'select', default: 'na',
      hint: 'pM0 não é categoria patológica válida; só se informa quando comprovado.',
      options: PM_NET_OPTIONS,
    },
  ],

  compute(v) {
    const mSuffix = v.multi === 'yes' ? '(m)' : '';
    const pTtoken = `p${v.pT}${mSuffix}`;
    const pNtoken = (v.pN === 'none') ? null : `p${v.pN}`;
    const pMtoken = pmNetToken(strOf(v.pm));

    const report = stagingLine([pTtoken, pNtoken, pMtoken]);

    return {
      tnm: [
        { k: 'pT', v: pTtoken },
        { k: 'pN', v: pNtoken || '— (não atribuído)' },
        { k: 'pM', v: pMtoken || '—' },
      ],
      stageGroup: null,
      warnings: [],
      report,
    };
  },
}

export default calculator
