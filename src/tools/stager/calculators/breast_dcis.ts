/* ==========================================================================
   Mama — Carcinoma Ductal In Situ / DCIS (Ressecção) — AJCC 8ª edição
   Base: CAP — Breast DCIS, Resection (v4.5.0.1).
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   ========================================================================== */

import { prefix, axillaryPN, stagingLine, PN_OPTIONS } from './_shared';
import type { Calculator } from '../types'
import { numOf, strOf } from '../types'

const calculator: Calculator = {
  id: 'breast-dcis-res',
  name: 'Mama — Carcinoma Ductal In Situ (ressecção)',
  section: 'Mama',
  system: 'AJCC 8ª ed.',
  version: 'CAP — Breast DCIS Res. v4.5',
  reference: 'AJCC 8th ed. / CAP Breast.DCIS 4.5.0.1',
  summary: 'Estadiamento pTis do DCIS da mama em espécime de ressecção (inclui Paget e carcinoma papilar in situ).',

  fields: [
    {
      id: 'mod', label: 'Modificador de classificação', type: 'select', default: '',
      options: [
        { value: '',  label: 'Nenhum' },
        { value: 'y', label: 'y (pós-neoadjuvância)' },
        { value: 'r', label: 'r (recorrência)' },
      ],
    },
    {
      id: 'ptis', label: 'Categoria pTis', type: 'select', default: 'DCIS',
      hint: 'Papilar encapsulado/sólido in situ e Paget com DCIS subjacente = pTis (DCIS).',
      options: [
        { value: 'DCIS',  label: 'pTis (DCIS) — carcinoma ductal in situ' },
        { value: 'Paget', label: 'pTis (Paget) — doença de Paget SEM carcinoma/DCIS subjacente' },
      ],
    },
    {
      id: 'multi', label: 'Múltiplas áreas de DCIS?', type: 'radio', default: 'no',
      hint: 'Tis permanece a categoria; o sufixo (m) pode ser acrescentado.',
      options: [ { value: 'no', label: 'Não' }, { value: 'yes', label: 'Sim → (m)' } ],
    },

    /* ---- pN ---- */
    {
      id: 'nodeInput', label: 'Linfonodos regionais', type: 'select', default: 'none',
      hint: 'No DCIS, com frequência não há linfonodos; a maioria dos achados é ITC → pN0.',
      options: [
        { value: 'none',   label: 'Nenhum linfonodo submetido → pN não atribuído' },
        { value: 'counts', label: 'Informar contagens (axilares)' },
        { value: 'manual', label: 'Selecionar categoria pN' },
      ],
    },
    { id: 'nMacro', label: 'Linfonodos com macrometástase (>2 mm)', type: 'number', min: 0, default: 0, when: v => v.nodeInput === 'counts' },
    { id: 'nMicro', label: 'Linfonodos com micrometástase (>0,2–2 mm)', type: 'number', min: 0, default: 0, when: v => v.nodeInput === 'counts' },
    { id: 'nITC',   label: 'Linfonodos só com células tumorais isoladas (≤0,2 mm)', type: 'number', min: 0, default: 0, when: v => v.nodeInput === 'counts' },
    { id: 'pnManual', label: 'Categoria pN', type: 'select', default: 'N0', when: v => v.nodeInput === 'manual', options: PN_OPTIONS },
    {
      id: 'nSuffix', label: 'Sufixo de pN', type: 'select', default: '',
      when: v => v.nodeInput !== 'none',
      options: [
        { value: '',     label: 'Nenhum' },
        { value: '(sn)', label: '(sn) — sentinela' },
        { value: '(f)',  label: '(f) — PAAF / core' },
      ],
    },

    /* ---- pM ---- */
    {
      id: 'pm', label: 'Metástase à distância (pM)', type: 'radio', default: 'na',
      hint: 'Metástase em DCIS é excepcional; investigar invasão oculta.',
      options: [
        { value: 'na', label: 'Não aplicável' },
        { value: 'm1', label: 'pM1 (comprovada)' },
      ],
    },
  ],

  compute(v) {
    const warnings: string[] = [];
    const pre = prefix(strOf(v.mod));

    const Tlabel = v.ptis === 'Paget' ? 'Tis (Paget)' : 'Tis (DCIS)';
    const mSuffix = v.multi === 'yes' ? ' (m)' : '';
    const pTtoken = `${pre}${Tlabel}${mSuffix}`;

    let Ncat: string | null = null;
    if (v.nodeInput === 'none') { Ncat = null; }
    else if (v.nodeInput === 'manual') {
      Ncat = strOf(v.pnManual);
    } else {
      const r = axillaryPN(numOf(v.nMacro), numOf(v.nMicro), numOf(v.nITC));
      Ncat = r.cat;
      if (Ncat !== 'N0' && Ncat !== 'N0(i+)') {
        warnings.push('Metástase nodal além de ITC no contexto de DCIS sugere invasão oculta — reavaliar.');
      }
    }
    const nSuf = (v.nodeInput !== 'none') ? (v.nSuffix || '') : '';
    const pNtoken = Ncat ? `${pre}${Ncat}${nSuf}` : null;

    const pMtoken = (v.pm === 'm1') ? 'pM1' : null;

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
