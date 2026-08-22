/* ==========================================================================
   Tumores Epiteliais do Timo — AJCC 9ª versão
   Base: CAP Protocol – Thymus v5.0.0.0.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, prefix, stagingLine, pmToken } from './_shared'

const calculator: Calculator = {
  id: 'thymus',
  name: 'Timoma / Carcinoma Tímico',
  section: 'Tórax / Pulmão',
  system: 'AJCC 9ª versão',
  version: 'CAP — Thymus v5.0.0.0',
  reference: 'AJCC Cancer Staging System, version 9',
  summary: 'Estadiamento pTNM de timoma, carcinoma tímico e tumores neuroendócrinos do timo em timectomia.',

  fields: [
    MOD_FIELD,
    {
      id: 'pT', label: 'Categoria pT — Tumor primário', type: 'select', default: 'T1a',
      options: [
        { value: 'T0',  label: 'pT0 — sem evidência de tumor primário' },                                                                                   // pT0: No evidence of primary tumor
        { value: 'T1a', label: 'pT1a — ≤5 cm: limitado ao timo (± encapsulado), ou invade só gordura mediastinal, ou invade pleura mediastinal sem outra estrutura' }, // pT1a: Tumor ≤5 cm limited to the thymus with or without encapsulation; or ≤5 cm that directly invades into the mediastinal fat only; or ≤5 cm that directly invades the mediastinal pleura but does not involve any other mediastinal structure
        { value: 'T1b', label: 'pT1b — >5 cm: limitado ao timo, ou só gordura mediastinal, ou pleura mediastinal sem outra estrutura' },                     // pT1b: Tumor >5 cm (same criteria)
        { value: 'T1',  label: 'pT1 — subcategoria indeterminada' },                                                                                         // pT1 (subcategory cannot be determined)
        { value: 'T2',  label: 'pT2 — invade diretamente pericárdio (parcial ou total), pulmão ou nervo frênico' },                                           // pT2: Tumor with direct invasion of the pericardium (either partial or full thickness), or the lung, or the phrenic nerve
        { value: 'T3',  label: 'pT3 — invade v. braquiocefálica, veia cava superior, parede torácica, ou a./v. pulmonares extrapericárdicas' },              // pT3: Tumor with direct invasion into any of the following: brachiocephalic vein, superior vena cava, chest wall, or extrapericardial pulmonary arteries or veins
        { value: 'T4',  label: 'pT4 — invade aorta (ascendente, arco ou descendente), vasos do arco, a./v. pulmonares intrapericárdicas, miocárdio, traqueia ou esôfago' }, // pT4: Tumor with direct invasion into any of the following: aorta (ascending, arch, or descending), arch vessels, intrapericardial pulmonary artery or veins, myocardium, trachea, esophagus
      ],
    },
    MULTI_FIELD,
    {
      id: 'pN', label: 'Categoria pN — Linfonodos regionais', type: 'select', default: 'none',
      options: [
        { value: 'none', label: 'pN não atribuído (sem linfonodos ou não determinável)' },
        { value: 'N0', label: 'pN0 — sem acometimento de linfonodo regional' },                                                                              // pN0: No tumor involvement of regional lymph node(s)
        { value: 'N1', label: 'pN1 — linfonodos anteriores (peritímicos)' },                                                                                 // pN1: Tumor involvement of anterior (perithymic) lymph nodes
        { value: 'N2', label: 'pN2 — linfonodos intratorácicos profundos ou cervicais (paratraqueais, subcarinais, janela aortopulmonar, hilares, jugulares, supraclaviculares)' }, // pN2: Tumor involvement of deep intrathoracic or cervical lymph nodes (e.g., paratracheal, subcarinal, aortopulmonary window, hilar, jugular and / or supraclavicular nodes)
      ],
    },
    {
      id: 'M', label: 'Categoria pM — Metástase à distância', type: 'select', default: 'na',
      options: [
        { value: 'na',  label: 'Não aplicável — pM não determinável neste espécime' },
        { value: 'M1a', label: 'pM1a — nódulo(s) pleural(is) ou pericárdico(s) separado(s)' },                          // pM1a: Microscopic confirmation of separate pleural or pericardial nodule(s)
        { value: 'M1b', label: 'pM1b — nódulo intraparenquimatoso pulmonar ou outra metástase à distância' },            // pM1b: Microscopic confirmation of pulmonary intraparenchymal nodule or other distant metastasis
        { value: 'M1',  label: 'pM1 — subcategoria indeterminada' },                                                      // pM1 (subcategory cannot be determined)
      ],
    },
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
