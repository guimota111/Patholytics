/* ==========================================================================
   Mesotelioma Pleural Difuso — AJCC 9ª versão
   Base: CAP Protocol – Pleura and Pericardium v5.0.1.0, jun/2025.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, PM_FIELD, prefix, stagingLine, pmToken } from './_shared'

const calculator: Calculator = {
  id: 'pleural-mesothelioma',
  name: 'Mesotelioma Pleural Difuso',
  section: 'Tórax / Pulmão',
  system: 'AJCC 9ª versão',
  version: 'CAP — Pleura and Pericardium v5.0.1.0',
  reference: 'AJCC Cancer Staging System, version 9',
  summary: 'Estadiamento pTNM de mesotelioma pleural difuso. Descritores TNM não se aplicam ao mesotelioma pleural localizado.',

  fields: [
    MOD_FIELD,
    {
      id: 'pT', label: 'Categoria pT — Tumor primário', type: 'select', default: 'T1',
      options: [
        { value: 'T0', label: 'pT0 — sem evidência de tumor primário' },                                                                                                  // pT0: No evidence of primary tumor
        { value: 'T1', label: 'pT1 — limitado à pleura ipsilateral, sem envolvimento da fissura' },                                                                       // pT1: Tumor limited to the ipsilateral pleura with no involvement of the fissure
        { value: 'T2', label: 'pT2 — pleura ipsilateral com: envolvimento da fissura; ou invasão do parênquima pulmonar ipsilateral; ou invasão não transmural do diafragma' }, // pT2: Tumor involving the ipsilateral pleura and with any of the following: Involvement of the fissure; or Ipsilateral lung parenchyma invasion; or Diaphragm (non-transmural) invasion
        { value: 'T3', label: 'pT3 — limitado à pleura ipsilateral (± fissura) com invasão de gordura mediastinal, superfície do pericárdio, fáscia endotorácica, ou área solitária de partes moles da parede torácica' }, // pT3: Tumor limited to the ipsilateral pleura (with or without fissure involvement) and with invasion of any of the following: Mediastinal fat; or Surface of pericardium; or Endothoracic fascia; or Solitary area of chest wall soft tissue
        { value: 'T4', label: 'pT4 — invasão óssea da parede torácica (costela); órgãos mediastinais (coração, coluna, esôfago, traqueia, grandes vasos); invasão difusa da parede; invasão transmural de diafragma ou pericárdio; extensão direta à pleura contralateral; ou derrame pericárdico maligno' }, // pT4: Tumor with invasion of any of the following: Chest wall bony invasion (rib); or Mediastinal organs (heart, spine, esophagus, trachea, great vessels); or Diffuse chest wall invasion; or Transmural invasion of the diaphragm or pericardium; or Direct extension to the contralateral pleura; or Presence of malignant pericardial effusion
      ],
    },
    MULTI_FIELD,
    {
      id: 'pN', label: 'Categoria pN — Linfonodos regionais', type: 'select', default: 'none',
      options: [
        { value: 'none', label: 'pN não atribuído (mesotelioma localizado, sem linfonodos, ou não determinável)' },
        { value: 'N0', label: 'pN0 — sem acometimento de linfonodo regional' },                                                                                            // pN0: No tumor involvement of regional lymph node(s)
        { value: 'N1', label: 'pN1 — broncopulmonares, hilares ou mediastinais ipsilaterais (incl. mamária interna, peridiafragmáticos, coxim pericárdico, intercostais)' }, // pN1: Tumor involvement of ipsilateral bronchopulmonary, hilar, or mediastinal (including the internal mammary, peridiaphragmatic, pericardial fat pad, or intercostal lymph nodes) regional lymph nodes
        { value: 'N2', label: 'pN2 — mediastinais contralaterais, ou supraclaviculares ipsi/contralaterais' },                                                             // pN2: Tumor involvement of contralateral mediastinal, ipsilateral or contralateral supraclavicular lymph nodes
      ],
    },
    PM_FIELD,
  ],

  compute(v) {
    const warnings: string[] = [];
    const pre = prefix(strOf(v.mod));
    const T = strOf(v.pT);
    const mSuffix = v.multi === 'yes' ? '(m)' : '';
    const N = v.pN === 'none' ? null : strOf(v.pN);

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
