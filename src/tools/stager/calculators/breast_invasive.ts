/* ==========================================================================
   Mama — Carcinoma Invasor (Ressecção) — AJCC 8ª edição
   Base: CAP — Breast Invasive Carcinoma, Resection (v4.11.0.0).
   Saída enxuta: "Estadiamento patológico (AJCC 8ªed.): pT.. pN.. pM1."
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   ========================================================================== */

import { prefix, axillaryPN, stagingLine, PN_OPTIONS } from './_shared';
import type { Calculator } from '../types'
import { numOf, strOf } from '../types'

const calculator: Calculator = {
  id: 'breast-invasive-res',
  name: 'Mama — Carcinoma Invasor (ressecção)',
  section: 'Mama',
  system: 'AJCC 8ª ed.',
  version: 'CAP — Breast Invasive Res. v4.11',
  reference: 'AJCC 8th ed. / CAP Breast.Invasive.Res 4.11.0.0',
  summary: 'Estadiamento pTNM do carcinoma invasor da mama em espécime de ressecção.',

  fields: [
    {
      id: 'mod', label: 'Modificador de classificação', type: 'select', default: '',
      hint: 'y = pós-neoadjuvância; r = recorrência.',
      options: [
        { value: '',  label: 'Nenhum' },
        { value: 'y', label: 'y (pós-neoadjuvância)' },
        { value: 'r', label: 'r (recorrência)' },
      ],
    },

    /* ---- pT ---- */
    {
      id: 'ptMode', label: 'Categoria pT — como determinar', type: 'select', default: 'size',
      options: [
        { value: 'size',  label: 'Por tamanho do maior foco invasor (mm)' },
        { value: 'mi',    label: 'Microinvasão apenas (≤1 mm) → pT1mi' },
        { value: 'ypTis', label: 'Sem invasão residual, DCIS residual → ypTis' },
        { value: 'ypT0',  label: 'Sem tumor residual → ypT0' },
      ],
    },
    {
      id: 'sizeMm', label: 'Maior foco invasor contíguo (mm)', type: 'number', min: 0, default: 22,
      hint: 'Não inclui DCIS nem satélites >5 mm. Medidas 1,1–1,9 mm são arredondadas para 2 mm.',
      when: v => v.ptMode === 'size',
    },
    {
      id: 't4', label: 'Extensão local (define pT4)', type: 'select', default: 'none',
      hint: 'Invasão apenas da derme NÃO é pT4.',
      when: v => v.ptMode === 'size',
      options: [
        { value: 'none', label: 'Nenhuma — usar o tamanho' },
        { value: 'T4a',  label: 'Parede torácica (pT4a)' },
        { value: 'T4b',  label: 'Ulceração / nódulos satélites macroscópicos / edema (peau d’orange) (pT4b)' },
        { value: 'T4c',  label: 'Parede torácica + pele (pT4c)' },
        { value: 'T4d',  label: 'Carcinoma inflamatório (pT4d)' },
      ],
    },
    {
      id: 'multi', label: 'Múltiplos focos invasores macroscopicamente distintos?', type: 'radio', default: 'no',
      hint: 'Se sim, acrescenta o sufixo (m). Satélites só microscópicos não recebem (m).',
      when: v => v.ptMode === 'size',
      options: [ { value: 'no', label: 'Não' }, { value: 'yes', label: 'Sim → (m)' } ],
    },

    /* ---- pN ---- */
    {
      id: 'nodeInput', label: 'Linfonodos regionais', type: 'select', default: 'counts',
      options: [
        { value: 'counts', label: 'Informar contagens (axilares)' },
        { value: 'manual', label: 'Selecionar categoria pN (casos especiais)' },
        { value: 'none',   label: 'Nenhum linfonodo submetido → pN não atribuído' },
      ],
    },
    {
      id: 'nMacro', label: 'Linfonodos com macrometástase (>2 mm)', type: 'number', min: 0, default: 0,
      when: v => v.nodeInput === 'counts',
    },
    {
      id: 'nMicro', label: 'Linfonodos com micrometástase (>0,2–2 mm)', type: 'number', min: 0, default: 0,
      when: v => v.nodeInput === 'counts',
    },
    {
      id: 'nITC', label: 'Linfonodos só com células tumorais isoladas (≤0,2 mm)', type: 'number', min: 0, default: 0,
      when: v => v.nodeInput === 'counts',
    },
    {
      id: 'pnManual', label: 'Categoria pN', type: 'select', default: 'N0',
      when: v => v.nodeInput === 'manual',
      options: PN_OPTIONS,
    },
    {
      id: 'nSuffix', label: 'Sufixo de pN', type: 'select', default: '',
      hint: '(sn) = <6 linfonodos por sentinela; (f) = confirmado por PAAF/core.',
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
      hint: 'pM0 não é categoria patológica válida; só se informa pM1 quando comprovado.',
      options: [
        { value: 'na', label: 'Não aplicável' },
        { value: 'm1', label: 'pM1 (comprovada, >0,2 mm)' },
      ],
    },
  ],

  compute(v) {
    const warnings: string[] = [];

    // Modificador efetivo (ypTis/ypT0 implicam y)
    let effMod = strOf(v.mod);
    if ((v.ptMode === 'ypTis' || v.ptMode === 'ypT0') && effMod !== 'y') {
      effMod = 'y';
      warnings.push('pT residual pós-neoadjuvância assume prefixo “yp”.');
    }
    const pre = prefix(effMod);

    /* ---------- pT ---------- */
    let Tcat = '';
    if (v.ptMode === 'mi') Tcat = 'T1mi';
    else if (v.ptMode === 'ypTis') Tcat = 'Tis';
    else if (v.ptMode === 'ypT0') Tcat = 'T0';
    else {
      // por tamanho, com possível override de pT4
      if (v.t4 && v.t4 !== 'none') {
        Tcat = strOf(v.t4);
      } else {
        const s = numOf(v.sizeMm);
        if (s == null) Tcat = '';
        else if (s <= 1) { Tcat = 'T1mi'; warnings.push('Foco ≤1 mm equivale a microinvasão (pT1mi).'); }
        else if (s <= 5) Tcat = 'T1a';
        else if (s <= 10) Tcat = 'T1b';
        else if (s <= 20) Tcat = 'T1c';
        else if (s <= 50) Tcat = 'T2';
        else Tcat = 'T3';
      }
    }

    const mSuffix = (v.ptMode === 'size' && v.multi === 'yes') ? '(m)' : '';
    const pTtoken = Tcat ? `${pre}${Tcat}${mSuffix}` : `${pre}TX`;

    /* ---------- pN ---------- */
    let Ncat: string | null = null;
    if (v.nodeInput === 'none') {
      Ncat = null;
    } else if (v.nodeInput === 'manual') {
      Ncat = strOf(v.pnManual);
    } else {
      const r = axillaryPN(numOf(v.nMacro), numOf(v.nMicro), numOf(v.nITC));
      Ncat = r.cat;
    }
    const nSuf = (v.nodeInput !== 'none') ? (v.nSuffix || '') : '';
    const pNtoken = Ncat ? `${pre}${Ncat}${nSuf}` : null;

    /* ---------- pM ---------- */
    const pMtoken = (v.pm === 'm1') ? 'pM1' : null;

    const report = stagingLine([pTtoken, pNtoken, pMtoken]);

    return {
      tnm: [
        { k: 'pT', v: pTtoken },
        { k: 'pN', v: pNtoken || '— (não atribuído)' },
        { k: 'pM', v: pMtoken || '—' },
      ],
      stageGroup: null, // AJCC 8ª ed. não define grupo anatômico sem biomarcadores
      warnings,
      report,
    };
  },
}

export default calculator
