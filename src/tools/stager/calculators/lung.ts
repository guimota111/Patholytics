/* ==========================================================================
   Carcinoma de Pulmão — AJCC 9ª versão
   Base: CAP Protocol – Lung (Resection) v5.1.0.0.
   ⚠️ Conteúdo para conferência pelo patologista responsável.
   O texto original da CAP está citado em comentário ao lado de cada opção.
   ========================================================================== */

import type { Calculator } from '../types'
import { strOf } from '../types'
import { MOD_FIELD, MULTI_FIELD, prefix, stagingLine, pmToken } from './_shared'

const calculator: Calculator = {
  id: 'lung',
  name: 'Carcinoma de Pulmão',
  section: 'Tórax / Pulmão',
  system: 'AJCC 9ª versão',
  version: 'CAP — Lung (Resection) v5.1.0.0',
  reference: 'AJCC Cancer Staging System, version 9',
  summary: 'Estadiamento pTNM de carcinoma de pulmão em espécime de ressecção (tamanho = componente invasivo).',

  fields: [
    MOD_FIELD,
    {
      id: 'pT', label: 'Categoria pT — Tumor primário', type: 'select', default: 'T1b',
      hint: 'Em adenocarcinoma não mucinoso com componente lepídico, o tamanho é o do componente invasivo.',
      options: [
        { value: 'T0',   label: 'pT0 — sem evidência de tumor primário' },                                                                                        // pT0: No evidence of primary tumor
        { value: 'Tis',  label: 'pTis — carcinoma in situ (SCIS; ou AIS: lepídico puro ≤3 cm)' },                                                                 // pTis: Carcinoma in situ; or Squamous cell carcinoma in situ (SCIS); or Adenocarcinoma in situ (AIS): adenocarcinoma with pure lepidic pattern, less than or equal to 3 cm in greatest dimension
        { value: 'T1mi', label: 'pT1mi — adenocarcinoma minimamente invasivo (≤3 cm, lepídico predominante, invasão ≤5 mm)' },                                   // pT1mi: Minimally invasive adenocarcinoma: adenocarcinoma (≤3 cm) with a predominantly lepidic pattern and ≤5 mm invasion in greatest dimension
        { value: 'T1a',  label: 'pT1a — ≤1 cm; ou tumor superficial de qualquer tamanho com componente invasivo limitado à parede brônquica' },                  // pT1a: Tumor less than or equal to 1 cm in greatest dimension OR Tumor of any size whose invasive component is limited to the bronchial wall and may extend proximal to the main bronchus (this is an uncommon superficial, spreading tumor)
        { value: 'T1b',  label: 'pT1b — >1 cm e ≤2 cm' },                                                                                                         // pT1b: Tumor greater than 1 cm but less than or equal to 2 cm in greatest dimension
        { value: 'T1c',  label: 'pT1c — >2 cm e ≤3 cm' },                                                                                                         // pT1c: Tumor greater than 2 cm but less than or equal to 3 cm in greatest dimension
        { value: 'T1',   label: 'pT1 — ≤3 cm, subgrupo indeterminado' },                                                                                          // pT1 (subgroup cannot be determined)
        { value: 'T2a',  label: 'pT2a — >3 a 4 cm; ou ≤4 cm com invasão de pleura visceral, lobo adjacente, ou brônquio principal / atelectasia ou pneumonite obstrutiva até o hilo' }, // pT2a: Tumor greater than 3 cm but less than or equal to 4 cm in greatest dimension OR Tumor less than or equal to 4 cm in greatest dimension with one or more of the following features: Invades visceral pleura; or Invades an adjacent lobe; or Involves main bronchus (up to but not including the carina) or associated with atelectasis or obstructive pneumonitis, extending to the hilar regions, involving either part of or the entire lung
        { value: 'T2b',  label: 'pT2b — >4 a 5 cm, com ou sem as características acima' },                                                                        // pT2b: Tumor greater than 4 cm but less than or equal to 5 cm in greatest dimension with or without any of the following features (...)
        { value: 'T2',   label: 'pT2 — subgrupo indeterminado' },                                                                                                 // pT2 (subgroup cannot be determined)
        { value: 'T3',   label: 'pT3 — >5 a 7 cm; ou ≤7 cm com invasão de pleura parietal/parede torácica, pericárdio, n. frênico, v. ázigos, raízes nervosas torácicas ou gânglio estrelado; ou nódulo(s) separado(s) no mesmo lobo' }, // pT3: Tumor greater than 5 cm but less than or equal to 7 cm in greatest dimension OR Tumor less than or equal to 7 cm with one or more of the following features: Invades parietal pleura or chest wall; or Invades pericardium, phrenic nerve or azygos vein; or Invades thoracic nerve roots (i.e., T1, T2) or stellate ganglion; or Separate tumor nodule(s) in the same lobe as the primary
        { value: 'T4',   label: 'pT4 — >7 cm; ou qualquer tamanho invadindo mediastino, timo, traqueia, carina, n. laríngeo recorrente, n. vago, esôfago, diafragma, coração, grandes vasos, a. supra-aórticas, v. braquiocefálicas, vasos subclávios, corpo vertebral, lâmina, canal medular, raízes cervicais ou plexo braquial; ou nódulo(s) em lobo ipsilateral diferente' }, // pT4: Tumor greater than 7 cm in greatest dimension OR Tumor of any size with one or more of the following features: (...) or Separate tumor nodule(s) in a different ipsilateral lobe than that of the primary
      ],
    },
    MULTI_FIELD,
    {
      id: 'pN', label: 'Categoria pN — Linfonodos regionais', type: 'select', default: 'none',
      options: [
        { value: 'none', label: 'pN não atribuído (sem linfonodos ou não determinável)' },
        { value: 'N0',  label: 'pN0 — sem acometimento de linfonodo regional' },                                                                                   // pN0: No tumor involvement of regional lymph node(s)
        { value: 'N1',  label: 'pN1 — peribrônquicos, hilares e/ou intrapulmonares ipsilaterais (incl. por extensão direta)' },                                   // pN1: Tumor involvement of ipsilateral peribronchial and / or ipsilateral hilar and / or ipsilateral intrapulmonary lymph node station(s), including involvement by direct extension
        { value: 'N2a', label: 'pN2a — estação mediastinal ipsilateral única, ou estação subcarinal' },                                                            // pN2a: Tumor involvement of a single ipsilateral mediastinal nodal station or of the subcarinal nodal station
        { value: 'N2b', label: 'pN2b — múltiplas estações mediastinais ipsilaterais, com ou sem subcarinal' },                                                    // pN2b: Tumor involvement of multiple ipsilateral mediastinal nodal stations with or without involvement of the subcarinal nodal station
        { value: 'N2',  label: 'pN2 — subgrupo indeterminado' },                                                                                                   // pN2 (subgroup cannot be determined)
        { value: 'N3',  label: 'pN3 — mediastinais ou hilares contralaterais, escalenos ou supraclaviculares (ipsi ou contralaterais)' },                          // pN3: Tumor involvement of contralateral mediastinal, contralateral hilar, ipsilateral / contralateral scalene, or ipsilateral / contralateral supraclavicular lymph node station(s)
      ],
    },
    {
      id: 'M', label: 'Categoria pM — Metástase à distância', type: 'select', default: 'na',
      options: [
        { value: 'na',   label: 'Não aplicável — pM não determinável neste espécime' },
        { value: 'M1a',  label: 'pM1a — nódulos pleurais/pericárdicos, derrame pleural/pericárdico maligno, e/ou nódulo(s) em lobo contralateral' },             // pM1a: Microscopic confirmation of metastasis in pleural or pericardial nodules, and / or malignant pleural or pericardial effusions, and / or separate tumor nodule(s) in a contralateral lobe
        { value: 'M1b',  label: 'pM1b — metástase extratorácica única em um único sistema de órgãos (incl. linfonodo não regional único)' },                      // pM1b: Microscopic confirmation of single extrathoracic metastasis in a single organ system (including involvement of a single non-regional node)
        { value: 'M1c1', label: 'pM1c1 — múltiplas metástases extratorácicas em um único sistema de órgãos' },                                                    // pM1c1: Microscopic confirmation of multiple extrathoracic metastases in a single organ system
        { value: 'M1c2', label: 'pM1c2 — múltiplas metástases extratorácicas em múltiplos sistemas de órgãos' },                                                  // pM1c2: Microscopic confirmation of multiple extrathoracic metastases in multiple organ systems
        { value: 'M1c',  label: 'pM1c — subgrupo indeterminado' },                                                                                                 // pM1c (subgroup cannot be determined)
        { value: 'M1',   label: 'pM1 — subgrupo indeterminado' },                                                                                                  // pM1 (subgroup cannot be determined)
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
