/* ==========================================================================
   heat.ts — cor de cada cassete pela celularidade de carcinoma (%CA): sem
   avaliação = neutro; 0 % = verde-claro (avaliado, sem carcinoma); acima
   disso, quanto mais celular, mais intenso o carmim.
   ========================================================================== */

import type { RcbClass } from './rcb'

export type Theme = 'light' | 'dark'

const NEUTRAL: Record<Theme, string> = { light: '#e4e7ec', dark: '#36405a' }
const CLEAR: Record<Theme, string> = { light: '#c7efd6', dark: '#1f4d3a' }
const STROKE: Record<Theme, string> = { light: '#ffffff', dark: '#0a0e14' }
export const CA_HEX = '#be123c'
export const LVI_HEX = '#7c5cff'
export const MARGIN_HEX = '#e11d48'

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

export function caColor(ca: number | null, theme: Theme): string {
  if (ca === null) return NEUTRAL[theme]
  if (ca <= 0) return CLEAR[theme]
  const t = 0.3 + 0.7 * Math.min(1, ca / 100)
  return mixHex(NEUTRAL[theme], CA_HEX, t)
}

/** Texto legível sobre a cor de uma célula. */
export const caTextColor = (ca: number | null, theme: Theme) => (ca !== null && ca >= 40 ? '#ffffff' : theme === 'dark' ? '#e6eaf0' : '#151a22')

export const strokeColor = (theme: Theme) => STROKE[theme]

export const RCB_CLASS_HEX: Record<RcbClass, string> = {
  'RCB-0': '#15905f',
  'RCB-I': '#65a30d',
  'RCB-II': '#d97706',
  'RCB-III': '#dc2626',
}
