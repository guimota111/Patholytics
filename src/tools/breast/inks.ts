import type { InkColor, Margin } from './types'

/** Cor de cada tinta na tela e no 3D. "none" = superfície sem tinta (gordura). */
export const INK_HEX: Record<InkColor, string> = {
  black: '#1f2328',
  blue: '#1d4ed8',
  green: '#15803d',
  yellow: '#eab308',
  red: '#dc2626',
  orange: '#ea580c',
  violet: '#7e22ce',
  none: '#e9cf9c',
}

/** Cor do texto sobre um chip pintado. */
export const inkText = (ink: InkColor) => (ink === 'yellow' || ink === 'none' ? '#1f2328' : '#ffffff')

/** Esquema inicial — o laboratório troca e salva o seu. */
export const DEFAULT_INKS: Record<Margin, InkColor> = {
  superior: 'blue',
  inferior: 'green',
  medial: 'red',
  lateral: 'orange',
  anterior: 'yellow',
  posterior: 'black',
}

export const FAT_HEX = '#e9cf9c'
export const SKIN_HEX = '#d9a679'
export const NIPPLE_HEX = '#8a4b3a'
export const MASS_HEX = '#f1f0ec'
export const BED_HEX = '#f7f4ee'

/** Cores fixas por posição da lesão (mapa 2D, tabela, 3D). */
export const LESION_COLORS = ['#be123c', '#2563eb', '#059669', '#9333ea', '#d97706', '#0891b2']
export const lesionColor = (index: number) => LESION_COLORS[index % LESION_COLORS.length]
