/* ==========================================================================
   TNE bem diferenciado — Duodeno e Ampola de Vater — AJCC 8ª edição
   Base: CAP — DuodAmp.NET (v2.0.0.1).
   As definições de pT diferem entre duodeno e ampola.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   ========================================================================== */

import { stagingLine, PM_NET_OPTIONS, pmNetToken } from './_shared';
import type { Calculator } from '../types'
import { strOf } from '../types'

const calculator: Calculator = {
  id: 'net-duodamp',
  name: 'TNE — Duodeno / Ampola',
  section: 'Trato Gastrointestinal',
  system: 'AJCC 8ª ed.',
  version: 'CAP — DuodAmp.NET v2.0',
  reference: 'AJCC 8th ed. / CAP DuodAmp.NET 2.0.0.1',
  summary: 'Estadiamento pTNM do tumor neuroendócrino bem diferenciado do duodeno e da ampola de Vater.',

  fields: [
    {
      id: 'site', label: 'Sítio', type: 'radio', default: 'duod',
      hint: 'A definição de pT muda conforme o sítio.',
      options: [ { value: 'duod', label: 'Duodeno' }, { value: 'amp', label: 'Ampola de Vater' } ],
    },
    {
      id: 'pTduod', label: 'Categoria pT (duodeno)', type: 'select', default: 'T2',
      when: v => v.site === 'duod',
      options: [
        { value: 'T1', label: 'pT1 — mucosa/submucosa apenas, ≤1 cm' },
        { value: 'T2', label: 'pT2 — invade a muscular própria OU >1 cm' },
        { value: 'T3', label: 'pT3 — invade o pâncreas ou o tecido adiposo peripancreático' },
        { value: 'T4', label: 'pT4 — invade o peritônio visceral (serosa) ou outros órgãos' },
      ],
    },
    {
      id: 'pTamp', label: 'Categoria pT (ampola)', type: 'select', default: 'T2',
      when: v => v.site === 'amp',
      options: [
        { value: 'T1', label: 'pT1 — ≤1 cm e confinado ao esfíncter de Oddi' },
        { value: 'T2', label: 'pT2 — através do esfíncter até submucosa/muscular própria duodenal OU >1 cm' },
        { value: 'T3', label: 'pT3 — invade o pâncreas ou o tecido adiposo peripancreático' },
        { value: 'T4', label: 'pT4 — invade o peritônio visceral (serosa) ou outros órgãos' },
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
      options: PM_NET_OPTIONS,
    },
  ],

  compute(v) {
    const Tcat = v.site === 'amp' ? v.pTamp : v.pTduod;
    const mSuffix = v.multi === 'yes' ? '(m)' : '';
    const pTtoken = `p${Tcat}${mSuffix}`;
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
