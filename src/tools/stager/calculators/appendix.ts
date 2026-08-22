/* ==========================================================================
   Carcinoma de Apêndice — AJCC 9ª versão
   Base: CAP Protocol – Appendix (Resection) v5.1.0.0, dez/2022.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { numOf, strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, NODE_FIELDS, prefix, stagingLine, pmToken, countWarning } from './_shared'

const calculator: Calculator = {
  id: 'appendix',
  name: 'Carcinoma de Apêndice',
  section: 'Trato Gastrointestinal',
  system: 'AJCC 9ª versão',
  version: 'CAP — Appendix v5.1.0.0',
  reference: 'AJCC Cancer Staging System, version 9',
  summary: 'Estadiamento pTNM de adenocarcinoma, LAMN/HAMN e carcinoma de células caliciformes do apêndice.',

  fields: [
    MOD_FIELD,
    {
      id: 'pT', label: 'Categoria pT — Tumor primário', type: 'select', default: 'T3',
      options: [
        { value: 'T0',        label: 'pT0 — sem evidência de tumor primário' },                                         // pT0: No evidence of primary tumor
        { value: 'Tis',       label: 'pTis — carcinoma in situ / intramucoso (lâmina própria ou até a muscular da mucosa)' }, // pTis: Carcinoma in situ (intramucosal carcinoma; invasion of the lamina propria or extension into but not through the muscularis mucosae)
        { value: 'Tis(LAMN)', label: 'pTis (LAMN) — neoplasia mucinosa apendicular de baixo grau confinada à muscular própria' }, // pTis (LAMN): Low-grade appendiceal mucinous neoplasm confined to the muscularis propria — aplicável só a LAMN; HAMN estadia como adenocarcinoma mucinoso
        { value: 'T1',        label: 'pT1 — invade a submucosa' },                                                        // pT1: Tumor invades the submucosa (through the muscularis mucosa but not into the muscularis propria)
        { value: 'T2',        label: 'pT2 — invade a muscular própria' },                                                 // pT2: Tumor invades the muscularis propria
        { value: 'T3',        label: 'pT3 — atravessa a muscular própria até subserosa ou mesoapêndice' },               // pT3: Tumor invades through the muscularis propria into the subserosa or the mesoappendix
        { value: 'T4a',       label: 'pT4a — invade o peritônio visceral (incl. mucina acelular ou epitélio mucinoso na serosa do apêndice/mesoapêndice)' }, // pT4a: Tumor invades through the visceral peritoneum, including the acellular mucin or mucinous epithelium involving the serosa of the appendix or serosa of the mesoappendix
        { value: 'T4b',       label: 'pT4b — invade diretamente (ou adere a) órgãos/estruturas adjacentes' },            // pT4b: Tumor directly invades (or adheres to) adjacent organs or structures
        { value: 'T4',        label: 'pT4 — subcategoria indeterminada' },                                               // pT4 (subcategory cannot be determined)
      ],
    },
    MULTI_FIELD,
    ...NODE_FIELDS,
    {
      id: 'deposits', label: 'Depósitos tumorais presentes?', type: 'radio', default: 'no',
      hint: 'Sem linfonodo acometido, qualquer nº de depósitos = pN1c.',
      options: [ { value: 'no', label: 'Não' }, { value: 'yes', label: 'Sim' } ],
    },
    {
      id: 'M', label: 'Categoria pM — Metástase à distância', type: 'select', default: 'na',
      options: [
        { value: 'na',  label: 'Não aplicável — pM não determinável neste espécime' },
        { value: 'M1a', label: 'pM1a — mucina acelular intraperitoneal, sem células tumorais identificáveis' }, // pM1a: Intraperitoneal acellular mucin, without identifiable tumor cells in the disseminated peritoneal mucinous deposits
        { value: 'M1b', label: 'pM1b — metástase intraperitoneal apenas (incl. depósitos mucinosos com células tumorais)' }, // pM1b: Intraperitoneal metastasis only, including peritoneal mucinous deposits containing tumor cells
        { value: 'M1c', label: 'pM1c — metástase em sítios além do peritônio (confirmada)' },               // pM1c: Microscopic confirmation of metastasis to sites other than peritoneum
        { value: 'M1',  label: 'pM1 — subcategoria indeterminada' },                                        // pM1 (subcategory cannot be determined)
      ],
    },
  ],

  compute(v) {
    const warnings: string[] = [];
    const pre = prefix(strOf(v.mod));
    const T = strOf(v.pT);
    const mSuffix = v.multi === 'yes' ? '(m)' : '';
    const pos = numOf(v.nPositive), exam = numOf(v.nExamined);

    // pN1a: one node / pN1b: two or three / pN1c: no nodes but tumor deposits / pN2: four or more
    let N: string | null = null;
    if (pos == null) N = null;
    else if (pos === 0) N = v.deposits === 'yes' ? 'N1c' : 'N0';
    else if (pos === 1) N = 'N1a';
    else if (pos <= 3) N = 'N1b';
    else N = 'N2';
    if (pos != null && pos > 0 && v.deposits === 'yes') {
      warnings.push('Depósitos tumorais com linfonodo positivo: a categoria segue a contagem de linfonodos (pN1c só se aplica sem linfonodo acometido).');
    }
    const w = countWarning(exam, pos); if (w) warnings.push(w);

    const pT = `${pre}${T}${mSuffix}`;
    const pN = N ? `${pre}${N}` : null;
    const pM = pmToken(strOf(v.M));

    return {
      tnm: [ { k: 'pT', v: pT }, { k: 'pN', v: pN ?? '—' }, { k: 'pM', v: pM ?? '—' } ],
      stageGroup: null,
      warnings,
      report: stagingLine([pT, pN, pM], 'AJCC 9ª versão'),
    };
  },
};

export default calculator
