/* ==========================================================================
   heat.ts — cor de cada célula no mapa 2D e no modelo 3D.
   Matiz = padrão de Gleason predominante (3 amarelo, 4 laranja, 5 vermelho);
   intensidade = % de tumor no cassete. Célula sem tumor fica neutra.
   ========================================================================== */

import type { Pattern } from './types'

export type Theme = 'light' | 'dark'

export const PATTERN_HEX: Record<Pattern, string> = { 3: '#f5c518', 4: '#f97316', 5: '#dc2626' }

const NEUTRAL: Record<Theme, string> = { light: '#e4e7ec', dark: '#36405a' }
const STROKE: Record<Theme, string> = { light: '#ffffff', dark: '#0a0e14' }

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

function rgbToHex([r, g, b]: [number, number, number]): string {
  return '#' + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, '0')).join('')
}

export function mixHex(a: string, b: string, t: number): string {
  const ra = hexToRgb(a)
  const rb = hexToRgb(b)
  return rgbToHex([ra[0] + (rb[0] - ra[0]) * t, ra[1] + (rb[1] - ra[1]) * t, ra[2] + (rb[2] - ra[2]) * t])
}

/** Cor de preenchimento de uma célula. */
export function cellColor(dominant: Pattern | null, tumorPct: number, theme: Theme): string {
  if (!dominant || tumorPct <= 0) return NEUTRAL[theme]
  const t = 0.3 + 0.7 * Math.min(1, tumorPct / 100)
  return mixHex(NEUTRAL[theme], PATTERN_HEX[dominant], t)
}

export const strokeColor = (theme: Theme) => STROKE[theme]

export const MARGIN_HEX = '#e11d48'
export const EPE_HEX = '#7c5cff'
