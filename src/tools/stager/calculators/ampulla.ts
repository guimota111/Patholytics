/* ==========================================================================
   Carcinoma da Ampola de Vater — AJCC 8ª edição
   Base: CAP Protocol – Ampulla of Vater v4.3.0.0, jun/2025.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { numOf, strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, NODE_FIELDS, PM_FIELD, prefix, stagingLine, pmToken, nodeCategory, countWarning } from './_shared'

const calculator: Calculator = {
  id: 'ampulla',
  name: 'Carcinoma da Ampola de Vater',
  section: 'Pâncreas e Ampola',
  system: 'AJCC 8ª ed.',
  version: 'CAP — Ampulla of Vater v4.3.0.0',
  reference: 'AJCC Cancer Staging Manual, 8th ed.',
  summary: 'Estadiamento pTNM de carcinoma ampular em ampulectomia ou duodenopancreatectomia.',

  fields: [
    MOD_FIELD,
    {
      id: 'pT', label: 'Categoria pT — Tumor primário', type: 'select', default: 'T2',
      options: [
        { value: 'T0',  label: 'pT0 — sem evidência de tumor primário' },                                                // pT0: No evidence of primary tumor
        { value: 'Tis', label: 'pTis — carcinoma in situ' },                                                              // pTis: Carcinoma in situ
        { value: 'T1a', label: 'pT1a — limitado à ampola de Vater ou ao esfíncter de Oddi' },                            // pT1a: Tumor limited to ampulla of Vater or sphincter of Oddi
        { value: 'T1b', label: 'pT1b — invade além do esfíncter de Oddi (periesfincteriana) e/ou submucosa duodenal' },  // pT1b: Tumor invades beyond the sphincter of Oddi (perisphincteric invasion) and / or into the duodenal submucosa
        { value: 'T1',  label: 'pT1 — subcategoria indeterminada' },                                                      // pT1 (subcategory cannot be determined)
        { value: 'T2',  label: 'pT2 — invade a muscular própria do duodeno' },                                            // pT2: Tumor invades into the muscularis propria of the duodenum
        { value: 'T3a', label: 'pT3a — invade diretamente o pâncreas (até 0,5 cm)' },                                     // pT3a: Tumor directly invades pancreas (up to 0.5 cm)
        { value: 'T3b', label: 'pT3b — >0,5 cm no pâncreas, ou tecido peripancreático/periduodenal ou serosa duodenal, sem tronco celíaco/AMS' }, // pT3b: Tumor extends more than 0.5 cm into the pancreas, or extends into peripancreatic tissue or periduodenal tissue or duodenal serosa without involvement of the celiac axis or superior mesenteric artery
        { value: 'T3',  label: 'pT3 — subcategoria indeterminada' },                                                      // pT3 (subcategory cannot be determined)
        { value: 'T4',  label: 'pT4 — envolve tronco celíaco, a. mesentérica superior e/ou a. hepática comum' },          // pT4: Tumor involves the celiac axis, superior mesenteric artery, and / or common hepatic artery, irrespective of size
      ],
    },
    MULTI_FIELD,
    ...NODE_FIELDS,
    PM_FIELD,
  ],

  compute(v) {
    const warnings: string[] = [];
    const pre = prefix(strOf(v.mod));
    const T = strOf(v.pT);
    const mSuffix = v.multi === 'yes' ? '(m)' : '';
    const pos = numOf(v.nPositive), exam = numOf(v.nExamined);

    // pN1: Metastasis to one to three regional lymph nodes / pN2: four or more
    const N = nodeCategory(pos, [[0, 'N0'], [3, 'N1'], [Infinity, 'N2']]);
    const w = countWarning(exam, pos); if (w) warnings.push(w);

    const pT = `${pre}${T}${mSuffix}`;
    const pN = N ? `${pre}${N}` : null;
    const pM = pmToken(strOf(v.M));

    return {
      tnm: [ { k: 'pT', v: pT }, { k: 'pN', v: pN ?? '—' }, { k: 'pM', v: pM ?? '—' } ],
      stageGroup: null,
      warnings,
      report: stagingLine([pT, pN, pM]),
    };
  },
};

export default calculator
