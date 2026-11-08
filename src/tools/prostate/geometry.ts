/* ==========================================================================
   geometry.ts — o esqueleto espacial da glândula, compartilhado pelo modelo
   3D e pela análise de nódulos. Cada cassete prostático ocupa uma fatia da
   "noz": um lado (D/E ou ambos), uma face (anterior/posterior ou ambas) e um
   intervalo ao longo do eixo ápice–base. É esse paralelepípedo curvo que diz
   quem é vizinho de quem.

   Eixos: +y = anterior, +x = lado direito do paciente, +z = base.
   ========================================================================== */

import type { Cell, Span } from './types'

export const X = 2.0 // meia-largura (D–E)
export const Y = 1.45 // meia-altura (anterior–posterior)
export const Z = 2.2 // meio-comprimento (ápice–base)

/** A glândula alarga em direção à base. */
export const taper = (z: number) => 1 + 0.16 * (z / Z)

/** Os cones de ápice e base são só as pontinhas: ~9 % do comprimento cada. */
export const CONE = 0.18 * Z

/** Faixa de z do grupo e se os cassetes correm do ápice para a base. */
export const spanRange = (span: Span): { z0: number; z1: number; reversed: boolean } => {
  if (span === 'apexOnly') return { z0: -Z, z1: -Z + CONE, reversed: false }
  if (span === 'baseOnly') return { z0: Z - CONE, z1: Z, reversed: false }
  return { z0: -Z, z1: Z, reversed: span === 'baseToApex' }
}

/** Intervalo de z ocupado por um cassete, dado o seu lugar na fila do grupo. */
export function cellZRange(cell: Pick<Cell, 'span' | 'indexInGroup' | 'groupSize'>): { za: number; zb: number } {
  const { z0, z1, reversed } = spanRange(cell.span)
  const n = Math.max(1, cell.groupSize)
  const k = reversed ? n - 1 - cell.indexInGroup : cell.indexInGroup
  const step = (z1 - z0) / n
  return { za: z0 + step * k, zb: z0 + step * (k + 1) }
}
