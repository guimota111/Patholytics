/* ==========================================================================
   TNE bem diferenciado — Pâncreas — AJCC 8ª edição
   Base: CAP — Panc.Endo (v5.0.1.0).
   Aplica-se a tumores neuroendócrinos bem diferenciados do pâncreas.
   Observação: extensão ao tecido adiposo peripancreático NÃO altera o pT.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   ========================================================================== */

import { stagingLine, PM_NET_OPTIONS, pmNetToken } from './_shared';
import type { Calculator } from '../types'
import { strOf } from '../types'

const calculator: Calculator = {
  id: 'net-pancreas',
  name: 'TNE — Pâncreas',
  section: 'Trato Gastrointestinal',
  system: 'AJCC 8ª ed.',
  version: 'CAP — Panc.Endo v5.0',
  reference: 'AJCC 8th ed. / CAP Panc.Endo 5.0.1.0',
  summary: 'Estadiamento pTNM do tumor neuroendócrino bem diferenciado do pâncreas.',

  fields: [
    {
      id: 'pT', label: 'Categoria pT — Tumor primário', type: 'select', default: 'T2',
      hint: '“Limitado ao pâncreas” = sem invasão de órgãos adjacentes/grandes vasos. Adiposo peripancreático não conta.',
      options: [
        { value: 'T1', label: 'pT1 — limitado ao pâncreas, ≤2 cm' },
        { value: 'T2', label: 'pT2 — limitado ao pâncreas, >2–4 cm' },
        { value: 'T3', label: 'pT3 — limitado ao pâncreas, >4 cm; ou invade duodeno, ampola de Vater ou colédoco' },
        { value: 'T4', label: 'pT4 — invade órgãos adjacentes (estômago, baço, cólon, adrenal) ou a parede de grandes vasos' },
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
