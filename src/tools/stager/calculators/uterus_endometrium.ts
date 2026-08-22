/* ==========================================================================
   Carcinoma do Endométrio — AJCC 8ª ed. + FIGO 2009 + FIGO 2023
   Base: CAP — Endometrium (v5.1.0.0), Nota N.
   - AJCC pTNM e FIGO 2009 derivam da extensão anatômica + linfonodos + M.
   - FIGO 2023 incorpora histotipo (agressivo/não), LVSI e molecular
     (POLEmut → IAmPOLEmut; p53abn → IICmp53abn), com subestádios.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   ========================================================================== */

import type { Calculator } from '../types'
import { strOf } from '../types'

const EXT_OPTIONS = [
  { value: 't0',        label: 'Sem tumor primário evidente (pT0)' },
  { value: 'endo',      label: 'Limitado ao endométrio ou pólipo (pT1a)' },
  { value: 'mlt',       label: 'Invade <½ do miométrio (pT1a)' },
  { value: 'mge',       label: 'Invade ≥½ do miométrio (pT1b)' },
  { value: 'cx',        label: 'Invade o estroma cervical, sem extensão extrauterina (pT2)' },
  { value: 'ovary',     label: 'Ovário e/ou trompa (pT3a)' },
  { value: 'serosa',    label: 'Serosa/subserosa uterina (pT3a)' },
  { value: 't3b',       label: 'Vagina e/ou parametrio (pT3b)' },
  { value: 'pelvperit', label: 'Peritônio pélvico (pT3a)' },
  { value: 't4',        label: 'Mucosa de bexiga e/ou intestino (pT4)' },
];

const PN_OPTIONS = [
  { value: 'none',   label: 'Nenhum linfonodo submetido → pN não atribuído' },
  { value: 'N0',     label: 'pN0 — sem metástase regional' },
  { value: 'N0(i+)', label: 'pN0(i+) — células tumorais isoladas (≤0,2 mm)' },
  { value: 'N1mi',   label: 'pN1mi — pélvicos, micrometástase (0,2–2 mm)' },
  { value: 'N1a',    label: 'pN1a — pélvicos, macrometástase (>2 mm)' },
  { value: 'N1',     label: 'pN1 — pélvicos (subcategoria indeterminada)' },
  { value: 'N2mi',   label: 'pN2mi — para-aórticos, micrometástase (± pélvicos)' },
  { value: 'N2a',    label: 'pN2a — para-aórticos, macrometástase (± pélvicos)' },
  { value: 'N2',     label: 'pN2 — para-aórticos (subcategoria indeterminada)' },
];

// ---------- AJCC pT a partir da extensão ----------
function ajccT(ext: string): string | undefined {
  const table: Record<string, string> = {
    t0: 'T0', endo: 'T1a', mlt: 'T1a', mge: 'T1b', cx: 'T2',
    ovary: 'T3a', serosa: 'T3a', pelvperit: 'T3a', t3b: 'T3b', t4: 'T4',
  };
  return table[ext];
}

// ---------- FIGO 2009 ----------
function figo2009(ext: string, Ncat: string | null, M1: boolean): string | null {
  if (ext === 't0') return null;
  const nodePelvic = ['N1mi', 'N1a', 'N1'].includes(Ncat ?? '');
  const nodePara   = ['N2mi', 'N2a', 'N2'].includes(Ncat ?? '');
  if (M1) return 'IVB';
  if (ext === 't4') return 'IVA';
  if (nodePara) return 'IIIC2';
  if (nodePelvic) return 'IIIC1';
  if (ext === 'ovary' || ext === 'serosa' || ext === 'pelvperit') return 'IIIA';
  if (ext === 't3b') return 'IIIB';
  if (ext === 'cx') return 'II';
  if (ext === 'mge') return 'IB';
  if (ext === 'endo' || ext === 'mlt') return 'IA';
  return null;
}

// ---------- FIGO 2023 ----------
function figo2023(
  ext: string,
  histo: string,
  lvsi: string,
  mol: string,
  Ncat: string | null,
  mMode: string,
  ia3: boolean,
): string | null {
  if (ext === 't0') return null;
  const nodePelvic = ['N1mi', 'N1a', 'N1'].includes(Ncat ?? '');
  const nodePara   = ['N2mi', 'N2a', 'N2'].includes(Ncat ?? '');
  const M1perit = mMode === 'perit';
  const M1dist  = mMode === 'distant';

  // Estágio IV
  if (M1dist) return 'IVC';
  if (M1perit) return 'IVB';
  if (ext === 't4') return 'IVA';

  // Estágio III — linfonodos têm precedência dentro do III
  if (nodePara) {
    if (Ncat === 'N2mi') return 'IIIC2i';
    if (Ncat === 'N2a')  return 'IIIC2ii';
    return 'IIIC2';
  }
  if (nodePelvic) {
    if (Ncat === 'N1mi') return 'IIIC1i';
    if (Ncat === 'N1a')  return 'IIIC1ii';
    return 'IIIC1';
  }
  if (ext === 't3b') return 'IIIB1';
  if (ext === 'pelvperit') return 'IIIB2';
  if (ext === 'ovary') return (ia3 && histo === 'nonaggr') ? 'IA3' : 'IIIA1';
  if (ext === 'serosa') return 'IIIA2';

  // Estágio inicial (confinado ao corpo/colo): endo, mlt, mge, cx
  const anyMI = (ext === 'mlt' || ext === 'mge');

  // Reclassificação molecular (só estágio inicial)
  if (mol === 'pole') return 'IAmPOLEmut';
  if (mol === 'p53' && anyMI) return 'IICmp53abn';

  if (histo === 'aggr') {
    if (ext === 'endo') return 'IC';
    return 'IIC'; // qualquer envolvimento miometrial/cervical em histotipo agressivo
  }
  // não-agressivo
  if (ext === 'cx') return 'IIA';
  if (lvsi === 'substantial') return 'IIB';
  if (ext === 'endo') return 'IA1';
  if (ext === 'mlt') return 'IA2';
  if (ext === 'mge') return 'IB';
  return null;
}

const calculator: Calculator = {
  id: 'uterus-endometrium',
  name: 'Endométrio — Carcinoma',
  section: 'Trato Ginecológico',
  system: 'AJCC 8 + FIGO 2009/2023',
  version: 'CAP — Endometrium v5.1',
  reference: 'AJCC 8th ed. + FIGO 2009 e 2023 / CAP Uterus 5.1.0.0',
  summary: 'Estadiamento do carcinoma do endométrio: pTNM (AJCC 8ª ed.), FIGO 2009 e FIGO 2023 (molecular).',

  fields: [
    {
      id: 'ext', label: 'Extensão anatômica do tumor', type: 'select', default: 'mlt',
      options: EXT_OPTIONS,
    },
    {
      id: 'ia3', label: 'Caso especial IA3 (FIGO 2023)?', type: 'radio', default: 'no',
      hint: 'Endometrioide de baixo grau sincrônico limitado a útero + ovário (bom prognóstico) → IA3.',
      when: v => v.ext === 'ovary',
      options: [ { value: 'no', label: 'Não' }, { value: 'yes', label: 'Sim → IA3' } ],
    },
    {
      id: 'histo', label: 'Tipo histológico (FIGO 2023)', type: 'select', default: 'nonaggr',
      options: [
        { value: 'nonaggr', label: 'Não-agressivo (endometrioide de baixo grau, G1–G2)' },
        { value: 'aggr',    label: 'Agressivo (alto grau/G3, seroso, células claras, carcinossarcoma, indiferenciado, misto, mesonéfrico, gástrico)' },
      ],
    },
    {
      id: 'lvsi', label: 'Invasão linfovascular (LVSI) (FIGO 2023)', type: 'select', default: 'nonefocal',
      options: [
        { value: 'nonefocal',   label: 'Ausente ou focal' },
        { value: 'substantial', label: 'Substancial (≥5 vasos)' },
      ],
    },
    {
      id: 'mol', label: 'Classificação molecular (FIGO 2023)', type: 'select', default: 'unknown',
      hint: 'POLEmut reclassifica para IAmPOLEmut; p53abn com invasão miometrial → IICmp53abn.',
      options: [
        { value: 'unknown', label: 'Desconhecida / não realizada' },
        { value: 'pole',    label: 'POLEmut (POLE mutado)' },
        { value: 'mmrd',    label: 'MMRd (dMMR)' },
        { value: 'nsmp',    label: 'NSMP (p53 selvagem)' },
        { value: 'p53',     label: 'p53abn (p53 aberrante)' },
      ],
    },
    {
      id: 'multi', label: 'Múltiplos tumores primários sincrônicos?', type: 'radio', default: 'no',
      options: [ { value: 'no', label: 'Não' }, { value: 'yes', label: 'Sim → (m)' } ],
    },
    {
      id: 'pN', label: 'Linfonodos regionais (pN)', type: 'select', default: 'none',
      hint: 'Pélvicos = N1/IIIC1; para-aórticos = N2/IIIC2. mi = micro; a = macro.',
      options: PN_OPTIONS,
    },
    {
      id: 'nSuffix', label: 'Sufixo de pN', type: 'select', default: '',
      when: v => v.pN !== 'none',
      options: [
        { value: '',     label: 'Nenhum' },
        { value: '(sn)', label: '(sn) — linfonodo sentinela' },
        { value: '(f)',  label: '(f) — PAAF / core' },
      ],
    },
    {
      id: 'pm', label: 'Metástase à distância (pM)', type: 'select', default: 'na',
      options: [
        { value: 'na',      label: 'Não aplicável' },
        { value: 'perit',   label: 'Metástase peritoneal abdominal além da pelve (FIGO 2023: IVB)' },
        { value: 'distant', label: 'Metástase à distância — pulmão, fígado, osso, linfonodos acima dos vasos renais (FIGO 2023: IVC)' },
      ],
    },
  ],

  compute(v) {
    const warnings: string[] = [];
    const ext = strOf(v.ext);
    const Ncat = (v.pN === 'none') ? null : strOf(v.pN);
    const nSuf = (v.pN !== 'none') ? (v.nSuffix || '') : '';
    const M1 = (v.pm === 'perit' || v.pm === 'distant');

    // AJCC
    const Tcat = ajccT(ext);
    const mSuffix = v.multi === 'yes' ? '(m)' : '';
    const pTtoken = `p${Tcat}${mSuffix}`;
    const pNtoken = Ncat ? `p${Ncat}${nSuf}` : null;
    const pMtoken = M1 ? 'pM1' : null;
    const ajcc = [pTtoken, pNtoken, pMtoken].filter(Boolean).join(' ');

    if (v.pN === 'none' && !M1 && ext !== 't0') {
      warnings.push('Estádios calculados assumindo linfonodos negativos (nenhum avaliado).');
    }

    // FIGO
    const f2009 = figo2009(ext, Ncat, M1);
    const f2023 = figo2023(ext, strOf(v.histo), strOf(v.lvsi), strOf(v.mol), Ncat, strOf(v.pm), v.ia3 === 'yes');
    if (v.mol === 'unknown' && f2023 && /^(IA1|IA2|IB|IC|IIA|IIB|IIC)$/.test(f2023)) {
      warnings.push('FIGO 2023 sem reclassificação molecular (classificação molecular desconhecida).');
    }

    const parts = [`Estadiamento patológico (AJCC 8ªed.): ${ajcc}.`];
    if (f2009) parts.push(`FIGO 2009: ${f2009}.`);
    if (f2023) parts.push(`FIGO 2023: ${f2023}.`);
    const report = parts.join(' ');

    return {
      tnm: [
        { k: 'pT', v: pTtoken },
        { k: 'pN', v: pNtoken || '—' },
        { k: 'FIGO 09', v: f2009 || '—' },
        { k: 'FIGO 23', v: f2023 || '—' },
      ],
      stageGroup: null,
      warnings,
      report,
    };
  },
}

export default calculator
