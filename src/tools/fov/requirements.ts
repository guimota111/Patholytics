/**
 * Áreas de contagem exigidas por entidade.
 *
 * Cada entrada cita a fonte de onde a área, o denominador e os limiares foram
 * lidos. As fontes CAP são os PDFs oficiais (versão indicada); o artigo de
 * Cree et al. (Mod Pathol 2021) é a referência geral para contagem por mm².
 * ⚠️ Conteúdo para conferência pelo patologista responsável.
 */

export type CountMethod = 'hotspot' | 'average' | 'consecutive'

export type RequirementKind =
  /** Examinar uma área fixa e laudar por um denominador fixo. */
  | 'area'
  /** Contar 10 campos do próprio microscópio e pontuar pela tabela por diâmetro (mama). */
  | 'tenFields'
  /** A fonte usa HPF sem definir o campo — não há conversão segura. */
  | 'undefinedHpf'

export interface LegacyReference {
  /** Diâmetro do campo de referência histórico (mm). */
  diameterMm: number
  /** Nº de campos de referência que a fonte usava (ex.: 10 HPF, 50 HPF). */
  fields: number
  label: string
}

export interface Requirement {
  id: string
  name: string
  group: 'mitoses' | 'other'
  kind: RequirementKind
  /** Área a examinar (mm²). */
  areaMm2?: number
  /** Denominador do laudo (mm²). */
  reportPerMm2?: number
  method: CountMethod
  thresholds: string
  legacy?: LegacyReference
  source: string
  note?: string
}

export const REQUIREMENTS: Requirement[] = [
  {
    id: 'melanoma',
    name: 'Melanoma cutâneo invasivo',
    group: 'mitoses',
    kind: 'area',
    areaMm2: 1,
    reportPerMm2: 1,
    method: 'hotspot',
    thresholds: 'Laudar o número inteiro de mitoses/mm² (componente invasivo dérmico). Se o tumor ocupa <1 mm², registrar como se fosse 1 mm² (ex.: 1 mitose em 0,5 mm² = 1/mm², não 2/mm²).',
    source: 'CAP — Invasive Melanoma of the Skin (Resection) v1.2.0.0, Nota F; AJCC 8ª ed.',
    note: 'Achar o "hot spot" dérmico; contar o campo inicial e estender a campos adjacentes não sobrepostos até 1 mm².',
  },
  {
    id: 'merkel',
    name: 'Carcinoma de células de Merkel',
    group: 'mitoses',
    kind: 'area',
    areaMm2: 1,
    reportPerMm2: 1,
    method: 'hotspot',
    thresholds: 'Laudar mitoses/mm² (número inteiro). Limiares de risco não estão estabelecidos; a CAP pede "≥1/mm²" como dado.',
    source: 'CAP — Merkel Cell Carcinoma of the Skin v4.2.0.0, Nota E',
    note: 'A literatura antiga usa ">10 mitoses/HPF" com HPF não definido (≈0,15 mm² para ocular 10× e objetiva 40×).',
  },
  {
    id: 'net-gi',
    name: 'Tumor neuroendócrino bem diferenciado do TGI e pâncreas',
    group: 'mitoses',
    kind: 'area',
    areaMm2: 10,
    reportPerMm2: 2,
    method: 'hotspot',
    thresholds: 'G1 <2; G2 2–20; G3 >20 mitoses por 2 mm². Ki-67: <3%, 3–20%, >20%. Com os dois métodos, prevalece o grau mais alto.',
    source: 'CAP — Appendix NET v5.0.0.0 e Stomach NET v5.0.0.0, Nota C/D (OMS 2019)',
    note: 'Exemplo da CAP: campo de 0,55 mm → contar 42 campos (10 mm²) e dividir o total por 5.',
  },
  {
    id: 'net-lung',
    name: 'Tumor neuroendócrino de pulmão e timo (carcinoide)',
    group: 'mitoses',
    kind: 'area',
    areaMm2: 2,
    reportPerMm2: 2,
    method: 'hotspot',
    thresholds: 'Carcinoide típico <2; carcinoide atípico 2–10; carcinoma neuroendócrino >10 mitoses por 2 mm².',
    source: 'OMS Classificação de Tumores Torácicos, 5ª ed. (2021); critério por 2 mm² vigente desde a 2ª ed. (1999) — Cree et al. 2021',
  },
  {
    id: 'net-hn',
    name: 'Tumor neuroendócrino de cabeça e pescoço',
    group: 'mitoses',
    kind: 'area',
    areaMm2: 2,
    reportPerMm2: 2,
    method: 'hotspot',
    thresholds: 'Grau 1 <2 mitoses/2 mm², sem necrose; grau 2: 2–10/2 mm², necrose presente; carcinomas neuroendócrinos >10/2 mm².',
    source: 'CAP — protocolos de laringe, cavidade oral, nasossinusal, glândula salivar e orofaringe (Tabela "WHO Classification of Head and Neck Neuroendocrine Tumors")',
  },
  {
    id: 'gist',
    name: 'GIST — tumor estromal gastrointestinal',
    group: 'mitoses',
    kind: 'area',
    areaMm2: 5,
    reportPerMm2: 5,
    method: 'consecutive',
    thresholds: 'G1 (baixo grau) ≤5; G2 (alto grau) >5 mitoses por 5 mm². A estratificação de risco (Miettinen) usa o mesmo corte.',
    legacy: { diameterMm: 0.357, fields: 50, label: '50 HPF de microscópios antigos ≈ 5 mm²' },
    source: 'CAP — GIST (Resection) v4.3.0.0, Nota B',
    note: 'Microscópios modernos de campo largo precisam de ~20–25 campos para 5 mm² — medir o campo é o que a CAP recomenda.',
  },
  {
    id: 'soft-tissue',
    name: 'Sarcoma de partes moles (FNCLCC)',
    group: 'mitoses',
    kind: 'area',
    areaMm2: 1.734,
    reportPerMm2: 1,
    method: 'consecutive',
    thresholds: 'Score 1: 0–9/10 HPF (0–5/mm²); score 2: 10–19/10 HPF (6–11/mm²); score 3: >19/10 HPF (>11/mm²). Perto do corte, repetir a contagem.',
    legacy: { diameterMm: 0.47, fields: 10, label: '10 HPF de 0,1734 mm² (sistema original FNCLCC)' },
    source: 'CAP — Soft Tissue (Resection) v4.2.0.0, Nota G, Tabelas 5 e 6',
    note: 'Alternativa da CAP: fator de correção = 0,1734 ÷ área do seu campo 40×; multiplicar a contagem em 10 campos por ele.',
  },
  {
    id: 'bone',
    name: 'Sarcoma ósseo',
    group: 'mitoses',
    kind: 'area',
    areaMm2: 1.734,
    reportPerMm2: 1,
    method: 'consecutive',
    thresholds: 'Mesma conversão do FNCLCC: 10 HPF de 0,1734 mm² ou 1 mm²; laudar por mm² ou por 10 HPF com o campo definido.',
    legacy: { diameterMm: 0.47, fields: 10, label: '10 HPF de 0,1734 mm²' },
    source: 'CAP — Bone (Resection) v4.2.0.0, Nota G, Tabela 2',
  },
  {
    id: 'breast',
    name: 'Carcinoma invasivo de mama (Nottingham)',
    group: 'mitoses',
    kind: 'tenFields',
    method: 'consecutive',
    thresholds: 'Score 1/2/3 conforme a tabela por diâmetro do campo (abaixo). Somar aos scores de túbulos e pleomorfismo: 3–5 = grau 1; 6–7 = grau 2; 8–9 = grau 3.',
    source: 'CAP — Invasive Carcinoma of the Breast (Resection) v4.11.0.0, Nota E, Tabela 1 (NHSBSP/RCPath 2005)',
    note: 'Contar 10 campos consecutivos na área de maior atividade mitótica; só figuras inequívocas.',
  },
  {
    id: 'phyllodes',
    name: 'Tumor phyllodes da mama',
    group: 'mitoses',
    kind: 'area',
    areaMm2: 2,
    reportPerMm2: 1,
    method: 'hotspot',
    thresholds: 'Benigno ≤4/10 HPF (<2,5/mm²); borderline 5–9/10 HPF (2,5–5/mm²); maligno ≥10/10 HPF (≥5/mm²), junto aos demais critérios estromais.',
    legacy: { diameterMm: 0.5, fields: 10, label: '10 HPF "objetiva 40× + ocular 10×" (campo não definido; a equivalência da CAP assume ≈0,2 mm²/campo)' },
    source: 'CAP — Phyllodes Tumor of the Breast v1.1.0.1, Nota E, Tabela 1 (OMS Mama 5ª ed.)',
    note: 'A CAP aceita laudar por 10 HPF ou por mm²; prefira mm² e registre a área do seu campo.',
  },
  {
    id: 'uterine-lms',
    name: 'Leiomiossarcoma uterino',
    group: 'mitoses',
    kind: 'area',
    areaMm2: 2.4,
    reportPerMm2: 1,
    method: 'hotspot',
    thresholds: 'Fusocelular: ≥4/mm² (≥10/10 HPF); epitelioide: ≥1,6/mm² (≥4/10 HPF); mixoide: >0,4/mm² (>1/10 HPF) — cada um combinado aos demais critérios (atipia, necrose).',
    legacy: { diameterMm: 0.55, fields: 10, label: '10 HPF de 0,55 mm (0,24 mm²) = 2,4 mm²' },
    source: 'CAP — Uterine Sarcoma v4.4.0.0, Nota A (OMS 2020)',
  },
  {
    id: 'ovary-silverberg',
    name: 'Carcinoma de ovário — grau de Silverberg',
    group: 'mitoses',
    kind: 'area',
    areaMm2: 3.45,
    reportPerMm2: 3.45,
    method: 'hotspot',
    thresholds: 'Score mitótico 1: 0–9; 2: 10–24; 3: ≥25 por 10 HPF de 0,663 mm (0,345 mm²); só metáfases, anáfases e telófases inequívocas.',
    legacy: { diameterMm: 0.663, fields: 10, label: '10 HPF de 0,663 mm (ocular 10× campo largo + objetiva 40×) = 3,45 mm²' },
    source: 'CAP — Ovary, Fallopian Tube, or Primary Peritoneum v1.5.0.0, Nota (grau)',
  },
  {
    id: 'mesothelioma',
    name: 'Mesotelioma pleural epitelioide — grau nuclear',
    group: 'mitoses',
    kind: 'area',
    areaMm2: 2,
    reportPerMm2: 2,
    method: 'hotspot',
    thresholds: 'Score mitótico 1: até 1; 2: 2–4; 3: ≥5 mitoses por 2 mm². Grau nuclear = atipia + mitoses (2–3 = 1; 4–5 = 2; 6 = 3).',
    source: 'CAP — Pleura and Pericardium v5.0.1.0 (checklist de grau)',
  },
  {
    id: 'thyroid',
    name: 'Carcinoma de tireoide — alto grau / pouco diferenciado',
    group: 'mitoses',
    kind: 'area',
    areaMm2: 2,
    reportPerMm2: 2,
    method: 'hotspot',
    thresholds: 'Alto grau: ≥5 mitoses/2 mm² e/ou necrose (diferenciados e medular). Pouco diferenciado (Turim): ≥3/2 mm², necrose ou convolução nuclear. NIFTP exige <3/2 mm².',
    source: 'CAP — Thyroid v4.4.0.0, Notas E/H (OMS 2022)',
  },
  {
    id: 'sft',
    name: 'Tumor fibroso solitário (modelo de risco de Demicco)',
    group: 'mitoses',
    kind: 'undefinedHpf',
    method: 'hotspot',
    thresholds: 'Mitoses por 10 HPF: 0 = 0 pontos; 1–3 = 1; ≥4 = 2 (somado a idade, tamanho e necrose).',
    source: 'CAP — Soft Tissue (Resection) v4.2.0.0 (tabela de risco para TFS)',
    note: 'O campo não é definido na fonte; não existe conversão segura para mm². Registre o diâmetro do seu campo ao laudar.',
  },
  {
    id: 'tumor-budding',
    name: 'Tumor budding colorretal (ITBCC 2016)',
    group: 'other',
    kind: 'area',
    areaMm2: 0.785,
    reportPerMm2: 0.785,
    method: 'hotspot',
    thresholds: 'Bd1 baixo: 0–4; Bd2 intermediário: 5–9; Bd3 alto: ≥10 brotos em um campo de 0,785 mm² (campo 20× em alguns microscópios).',
    source: 'CAP — Colon and Rectum (Resection) v4.4.0.1, Nota H',
    note: 'Use a objetiva 20× na tabela ao lado: 0,785 mm² corresponde a um campo de 1,0 mm de diâmetro.',
  },
  {
    id: 'follicular-lymphoma',
    name: 'Linfoma folicular — centroblastos por HPF',
    group: 'other',
    kind: 'area',
    areaMm2: 1.59,
    reportPerMm2: 1.59,
    method: 'average',
    thresholds: 'Grau 1–2: 0–15; grau 3: >15 centroblastos por HPF de 0,159 mm², média de 10 folículos (OMS 2017). Com um campo de 0,23 mm² contam-se ~30% a mais — ajuste o número de campos.',
    legacy: { diameterMm: 0.45, fields: 10, label: '10 HPF de 0,159 mm² (0,45 mm) = 1,59 mm²' },
    source: 'OMS Hematolinfoide 4ª ed. rev. (2017), via Cree et al. Mod Pathol 2021',
  },
]
