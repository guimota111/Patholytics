/* ==========================================================================
   _shared.ts — utilidades comuns a varias calculadoras (AJCC 8ª ed.)
   ========================================================================== */

import type { Field, FieldOption } from '../types'

/** Prefixo do estadiamento patológico conforme o modificador. */
export function prefix(mod: string): string {
  if (mod === 'y') return 'yp';
  if (mod === 'r') return 'rp';
  return 'p';
}

export interface PnResult {
  cat: string
  desc: string
}

/**
 * Categoria pN axilar a partir das contagens.
 * macro = linfonodos com macrometástase (>2 mm)
 * micro = linfonodos com micrometástase (>0,2–2 mm)
 * itc   = linfonodos só com células tumorais isoladas (≤0,2 mm)
 * Regras AJCC 8ª ed. (via só axila):
 *  - só ITC .......................... N0(i+)
 *  - nenhum positivo, sem ITC ........ N0
 *  - só micrometástase(s) ............ N1mi (independe do nº)
 *  - 1–3 positivos (≥1 macro) ........ N1a
 *  - 4–9 positivos ................... N2a
 *  - ≥10 positivos ................... N3a
 */
export function axillaryPN(
  macro: number | null,
  micro: number | null,
  itc: number | null,
): PnResult {
  const ma = macro || 0, mi = micro || 0, it = itc || 0;
  const total = ma + mi; // ITC não conta para o total do pN
  if (total === 0) {
    if (it > 0) return { cat: 'N0(i+)', desc: 'somente células tumorais isoladas (≤0,2 mm)' };
    return { cat: 'N0', desc: 'sem metástase em linfonodos regionais' };
  }
  if (ma === 0 && mi > 0) return { cat: 'N1mi', desc: 'micrometástase(s) (>0,2–2 mm)' };
  if (total <= 3) return { cat: 'N1a', desc: `${total} linfonodo(s) axilar(es) com macrometástase` };
  if (total <= 9) return { cat: 'N2a', desc: `${total} linfonodos axilares acometidos` };
  return { cat: 'N3a', desc: `${total} linfonodos axilares acometidos` };
}

/** Monta a linha final de estadiamento a partir dos tokens não vazios. */
export function stagingLine(
  tokens: (string | null | undefined | false)[],
  edition = 'AJCC 8ªed.',
): string {
  const body = tokens.filter(Boolean).join(' ');
  return `Estadiamento patológico (${edition}): ${body}.`;
}

/** Opções de pM para tumores neuroendócrinos do TGI (AJCC 8ª ed.). */
export const PM_NET_OPTIONS: FieldOption[] = [
  { value: 'na',  label: 'Não aplicável' },
  { value: 'M1a', label: 'pM1a — metástase confinada ao fígado' },
  { value: 'M1b', label: 'pM1b — metástase extra-hepática (≥1 sítio)' },
  { value: 'M1c', label: 'pM1c — metástase hepática + extra-hepática' },
  { value: 'M1',  label: 'pM1 — subcategoria indeterminada' },
];

/** Token de pM para NET; retorna null quando não aplicável. */
export function pmNetToken(val: string): string | null {
  return (!val || val === 'na') ? null : 'p' + val;
}

/** Lista de categorias pN para seleção manual (casos especiais). */
export const PN_OPTIONS: FieldOption[] = [
  { value: 'N0',      label: 'pN0 — sem metástase / só ITC' },
  { value: 'N0(i+)',  label: 'pN0(i+) — só células tumorais isoladas' },
  { value: 'N0(mol+)',label: 'pN0(mol+) — RT-PCR positivo, sem ITC' },
  { value: 'N1mi',    label: 'pN1mi — micrometástases' },
  { value: 'N1a',     label: 'pN1a — 1–3 axilares (≥1 macro)' },
  { value: 'N1b',     label: 'pN1b — mamária interna sentinela (excl. ITC)' },
  { value: 'N1c',     label: 'pN1c — pN1a + pN1b' },
  { value: 'N2a',     label: 'pN2a — 4–9 axilares (≥1 macro)' },
  { value: 'N2b',     label: 'pN2b — mamária interna clínica, axila negativa' },
  { value: 'N3a',     label: 'pN3a — ≥10 axilares ou infraclavicular' },
  { value: 'N3b',     label: 'pN3b — combinações (ver protocolo)' },
  { value: 'N3c',     label: 'pN3c — supraclavicular ipsilateral' },
];

/* --------------------------------------------------------------------------
   Blocos reutilizados pelas calculadoras derivadas dos protocolos CAP.
   -------------------------------------------------------------------------- */

/** Modificadores y/r — mesmo formato da calculadora de mama. */
export const MOD_FIELD: Field = {
  id: 'mod', label: 'Modificador de classificação', type: 'select', default: '',
  hint: 'y = pós-neoadjuvância; r = recorrência.',
  options: [
    { value: '',  label: 'Nenhum' },
    { value: 'y', label: 'y (pós-neoadjuvância)' },
    { value: 'r', label: 'r (recorrência)' },
  ],
};

/** Sufixo (m) — múltiplos tumores primários sincrônicos no mesmo órgão. */
export const MULTI_FIELD: Field = {
  id: 'multi', label: 'Múltiplos tumores primários sincrônicos (m)?', type: 'radio', default: 'no',
  options: [ { value: 'no', label: 'Não' }, { value: 'yes', label: 'Sim' } ],
};

/** Contagem de linfonodos; positivos em branco = pN não atribuído. */
export const NODE_FIELDS: Field[] = [
  {
    id: 'nExamined', label: 'Linfonodos regionais examinados', type: 'number',
    min: 0, hint: 'Total de linfonodos identificados no espécime.',
  },
  {
    id: 'nPositive', label: 'Linfonodos regionais positivos', type: 'number',
    min: 0, hint: 'Nº de linfonodos com metástase. Em branco = pN não atribuído.',
  },
];

/** pM binário: "Not applicable - pM cannot be determined" ou pM1. */
export const PM_FIELD: Field = {
  id: 'M', label: 'Categoria pM — Metástase à distância', type: 'select', default: 'na',
  options: [
    { value: 'na', label: 'Não aplicável — pM não determinável neste espécime' },
    { value: 'M1', label: 'pM1 — metástase à distância confirmada' },
  ],
};

/** Token de pM genérico (mesma regra do NET). */
export const pmToken = pmNetToken;

/** Categoria N por faixas de contagem: [[max, 'N0'], [max, 'N1'], ...]. */
export function nodeCategory(pos: number | null, steps: [number, string][]): string | null {
  if (pos == null) return null;
  for (const [max, cat] of steps) if (pos <= max) return cat;
  return null;
}

/** Aviso padrão quando as contagens não fecham. */
export function countWarning(exam: number | null, pos: number | null): string | null {
  if (exam != null && pos != null && pos > exam) {
    return 'Nº de linfonodos positivos maior que o total examinado — verifique as contagens.';
  }
  return null;
}

/**
 * Categorias pN comuns aos carcinomas de cabeça e pescoço (AJCC 8ª ed.):
 * laringe, cavidade oral, cavidade nasal/seios, orofaringe HPV-independente,
 * hipofaringe e carcinoma cutâneo de cabeça e pescoço. Linfonodos de linha
 * média contam como ipsilaterais. ENE = extensão extranodal.
 */
export const HN_PN_OPTIONS: FieldOption[] = [
  { value: 'none', label: 'pN não atribuído (sem linfonodos ou não determinável)' },
  { value: 'N0',  label: 'pN0 — sem metástase em linfonodo regional' },                                                                                      // pN0: No regional lymph node metastasis
  { value: 'N1',  label: 'pN1 — linfonodo único ipsilateral ≤3 cm, ENE(−)' },                                                                                // pN1: Metastasis in a single ipsilateral lymph node, 3 cm or smaller in greatest dimension and ENE(-)
  { value: 'N2a', label: 'pN2a — único ipsilateral ≤3 cm com ENE(+); ou único ipsilateral >3 a 6 cm, ENE(−)' },                                             // pN2a: Metastasis in single ipsilateral node 3 cm or smaller in greatest dimension and ENE(+); OR a single ipsilateral node larger than 3 cm but not larger than 6 cm in greatest dimension and ENE(-)
  { value: 'N2b', label: 'pN2b — múltiplos ipsilaterais, nenhum >6 cm, ENE(−)' },                                                                            // pN2b: Metastases in multiple ipsilateral nodes, none larger than 6 cm in greatest dimension and ENE(-)
  { value: 'N2c', label: 'pN2c — bilaterais ou contralaterais, nenhum >6 cm, ENE(−)' },                                                                      // pN2c: Metastases in bilateral or contralateral lymph node(s), none larger than 6 cm in greatest dimension and ENE(-)
  { value: 'N2',  label: 'pN2 — subcategoria indeterminada' },                                                                                                // pN2 (subcategory cannot be determined)
  { value: 'N3a', label: 'pN3a — linfonodo >6 cm, ENE(−)' },                                                                                                 // pN3a: Metastasis in a lymph node larger than 6 cm in greatest dimension and ENE(-)
  { value: 'N3b', label: 'pN3b — único ipsilateral >3 cm com ENE(+); ou múltiplos ipsi/contra/bilaterais com qualquer ENE(+); ou único contralateral de qualquer tamanho com ENE(+)' }, // pN3b: Metastasis in a single ipsilateral node larger than 3 cm in greatest dimension and ENE(+); OR multiple ipsilateral, contralateral, or bilateral nodes any with ENE(+); OR a single contralateral node of any size and ENE(+)
  { value: 'N3',  label: 'pN3 — subcategoria indeterminada' },                                                                                                // pN3 (subcategory cannot be determined)
];
