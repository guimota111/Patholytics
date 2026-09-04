/* ==========================================================================
   gleason.ts — escore de Gleason e grupo de grau a partir das porcentagens
   dos padrões, seguindo as regras ISUP 2014/2019 para prostatectomia:

   • Primário = padrão mais extenso; em empate prevalece o grau mais alto.
   • Padrão de grau MENOR que o primário com ≤ 5 % do tumor é ignorado
     (ex.: 4 = 96 %, 3 = 4 % → 4+4=8).
   • Padrão de grau MAIOR que o primário entra no escore em qualquer
     quantidade quando é o segundo mais extenso (ex.: 3 = 97 %, 4 = 3 % → 3+4).
   • Com três padrões, o de grau mais alto quando é o terceiro mais extenso:
     ≤ 5 % → "padrão terciário/menor" (anotado, fora do escore);
     > 5 % → passa a secundário (ISUP 2014: 3 + 4 + 5(>5 %) → 3+5=8).
   ========================================================================== */

import { MINOR_PATTERN_THRESHOLD, type Pattern } from './types'

export interface PatternShares {
  p3: number
  p4: number
  p5: number
}

export interface GleasonResult {
  primary: Pattern
  secondary: Pattern
  score: number
  gradeGroup: 1 | 2 | 3 | 4 | 5
  /** Padrão menor de grau mais alto, fora do escore. */
  tertiary: { pattern: Pattern; pct: number } | null
  /** Padrão de grau menor ignorado por ser ≤ limiar. */
  ignoredMinor: { pattern: Pattern; pct: number } | null
}

export function gradeGroupOf(primary: Pattern, secondary: Pattern): 1 | 2 | 3 | 4 | 5 {
  const score = primary + secondary
  if (score <= 6) return 1
  if (score === 7) return primary === 3 ? 2 : 3
  if (score === 8) return 4
  return 5
}

/** Normaliza para somar 100 (tolerando ruído de arredondamento). */
export function normalizeShares(s: PatternShares): PatternShares {
  const total = s.p3 + s.p4 + s.p5
  if (total <= 0) return { p3: 0, p4: 0, p5: 0 }
  return { p3: (s.p3 / total) * 100, p4: (s.p4 / total) * 100, p5: (s.p5 / total) * 100 }
}

export function gradeGleason(
  shares: PatternShares,
  threshold: number = MINOR_PATTERN_THRESHOLD,
): GleasonResult | null {
  const s = normalizeShares(shares)
  const present = (
    [
      { pattern: 3 as Pattern, pct: s.p3 },
      { pattern: 4 as Pattern, pct: s.p4 },
      { pattern: 5 as Pattern, pct: s.p5 },
    ] as { pattern: Pattern; pct: number }[]
  ).filter((p) => p.pct > 0.05)
  if (present.length === 0) return null

  present.sort((a, b) => b.pct - a.pct || b.pattern - a.pattern)
  const primary = present[0]

  // Padrão de grau menor que o primário, ≤ limiar: ignorado.
  let ignoredMinor: GleasonResult['ignoredMinor'] = null
  const kept = present.filter((p) => {
    if (p !== primary && p.pattern < primary.pattern && p.pct <= threshold) {
      if (!ignoredMinor || p.pct > ignoredMinor.pct) ignoredMinor = { pattern: p.pattern, pct: p.pct }
      return false
    }
    return true
  })

  let secondary = kept[1] ?? primary
  let tertiary: GleasonResult['tertiary'] = null

  const third = kept[2]
  if (third && third.pattern > secondary.pattern && third.pattern > primary.pattern) {
    if (third.pct > threshold) secondary = third
    else tertiary = { pattern: third.pattern, pct: third.pct }
  }

  return {
    primary: primary.pattern,
    secondary: secondary.pattern,
    score: primary.pattern + secondary.pattern,
    gradeGroup: gradeGroupOf(primary.pattern, secondary.pattern),
    tertiary,
    ignoredMinor,
  }
}

/** Pior padrão presente (acima do ruído): manda na cor do cassete. */
export function worstPattern(shares: PatternShares): Pattern | null {
  const s = normalizeShares(shares)
  if (s.p3 + s.p4 + s.p5 <= 0) return null
  if (s.p5 > 0.5) return 5
  if (s.p4 > 0.5) return 4
  return 3
}

/** Padrão predominante (para o mapa de calor). */
export function dominantPattern(shares: PatternShares): Pattern | null {
  const s = normalizeShares(shares)
  if (s.p3 + s.p4 + s.p5 <= 0) return null
  if (s.p5 >= s.p4 && s.p5 >= s.p3) return 5
  if (s.p4 >= s.p3) return 4
  return 3
}
