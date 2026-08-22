/**
 * Score mitótico de Nottingham por diâmetro de campo.
 *
 * Transcrito da Tabela 1 (Nota E) do CAP Protocol — Invasive Carcinoma of the
 * Breast (Resection) v4.11.0.0, jun/2026, que por sua vez adapta "Pathology
 * Reporting of Breast Disease" (NHSBSP / RCPath, 2005). A contagem é feita em
 * 10 campos consecutivos na área de maior atividade mitótica.
 *
 * [diâmetro (mm), área (mm²), máx. para score 1, máx. para score 2]
 * Score 3 = acima do máximo do score 2.
 */
export const BREAST_MITOTIC_TABLE: readonly [number, number, number, number][] = [
  [0.40, 0.125, 4, 9],
  [0.41, 0.132, 4, 9],
  [0.42, 0.139, 5, 10],
  [0.43, 0.145, 5, 10],
  [0.44, 0.152, 5, 11],
  [0.45, 0.159, 5, 11],
  [0.46, 0.166, 6, 12],
  [0.47, 0.173, 6, 12],
  [0.48, 0.181, 6, 13],
  [0.49, 0.189, 6, 13],
  [0.50, 0.196, 7, 14],
  [0.51, 0.204, 7, 14],
  [0.52, 0.212, 7, 15],
  [0.53, 0.221, 8, 16],
  [0.54, 0.229, 8, 16],
  [0.55, 0.238, 8, 17],
  [0.56, 0.246, 8, 17],
  [0.57, 0.255, 9, 18],
  [0.58, 0.264, 9, 19],
  [0.59, 0.273, 9, 19],
  [0.60, 0.283, 10, 20],
  [0.61, 0.292, 10, 21],
  [0.62, 0.302, 11, 22],
  [0.63, 0.312, 11, 22],
  [0.64, 0.322, 11, 23],
  [0.65, 0.332, 12, 24],
  [0.66, 0.342, 12, 24],
  [0.67, 0.353, 12, 25],
  [0.68, 0.363, 13, 26],
  [0.69, 0.374, 13, 27],
]

export interface BreastScoreRow {
  diameter: number
  area: number
  score1Max: number
  score2Max: number
  /** `true` quando o diâmetro pedido caiu fora de 0,40–0,69 mm e foi limitado. */
  clamped: boolean
}

/** Linha da tabela mais próxima do diâmetro informado (passo de 0,01 mm). */
export function breastRowFor(diameterMm: number): BreastScoreRow {
  const first = BREAST_MITOTIC_TABLE[0]
  const last = BREAST_MITOTIC_TABLE[BREAST_MITOTIC_TABLE.length - 1]
  const clamped = diameterMm < first[0] - 0.005 || diameterMm > last[0] + 0.005
  let best = first
  for (const row of BREAST_MITOTIC_TABLE) {
    if (Math.abs(row[0] - diameterMm) < Math.abs(best[0] - diameterMm)) best = row
  }
  return { diameter: best[0], area: best[1], score1Max: best[2], score2Max: best[3], clamped }
}

export function breastScore(row: BreastScoreRow, mitosesPer10Fields: number): 1 | 2 | 3 {
  if (mitosesPer10Fields <= row.score1Max) return 1
  if (mitosesPer10Fields <= row.score2Max) return 2
  return 3
}
