/* ==========================================================================
   heat.ts — cor de cada célula no mapa 2D, na tabela e no modelo 3D.
   Matiz = PIOR padrão de Gleason presente no cassete (3 verde, 4 amarelo,
   5 vermelho — a cor mais grave prevalece); intensidade = % de tumor.
   Célula sem tumor fica neutra.
   ========================================================================== */

import type { Pattern } from './types'

export type Theme = 'light' | 'dark'

export const PATTERN_HEX: Record<Pattern, string> = { 3: '#16a34a', 4: '#eab308', 5: '#dc2626' }

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

/** Cor de preenchimento de uma célula, dado o pior padrão presente. */
export function cellColor(worst: Pattern | null, tumorPct: number, theme: Theme): string {
  if (!worst || tumorPct <= 0) return NEUTRAL[theme]
  const t = 0.35 + 0.65 * Math.min(1, tumorPct / 100)
  return mixHex(NEUTRAL[theme], PATTERN_HEX[worst], t)
}

export const strokeColor = (theme: Theme) => STROKE[theme]

export const MARGIN_HEX = '#e11d48'
export const EPE_HEX = '#7c5cff'
