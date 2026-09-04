/* ==========================================================================
   cassettes.ts — da grade planejada por lesão (prefixo, fileiras × colunas no
   maior corte, cassetes por fatia adicional) aos cassetes com rótulo, fatia e
   retângulo no plano da fatia. É o que a laudagem preenche e o 3D desenha.
   ========================================================================== */

import { coord, half, lesionSlices, planeAxes, sizeOn } from './geometry'
import { AXIS_MARGINS, MAX_GRID, cassetteIdOf, type Axis, type Lesion, type MacroState, type Margin } from './types'

export interface CassetteDef {
  id: string
  label: string
  lesionId: string
  slice: number
  kind: 'grid' | 'other'
  row: number
  col: number
  /** Retângulo no plano da fatia (mm): u = eixo das fileiras, v = eixo das colunas. */
  u0: number
  u1: number
  v0: number
  v1: number
  uAxis: Axis
  vAxis: Axis
}

export interface LesionCassettes {
  lesion: Lesion
  central: number
  first: number
  last: number
  grid: CassetteDef[]
  others: CassetteDef[]
  all: CassetteDef[]
  /** Tamanho da lesão no plano da fatia (fileiras × colunas), mm. */
  gridSizeU: number
  gridSizeV: number
  /** Sentido das fileiras e das colunas, como margens [de → para]. */
  rowDirection: [Margin, Margin]
  colDirection: [Margin, Margin]
}

export const clampGrid = (n: number) => Math.max(1, Math.min(MAX_GRID, Math.floor(n) || 1))

export function planLesionCassettes(l: Lesion, m: MacroState): LesionCassettes {
  const { slicing } = m
  const dims = m.specimen.dims
  const { first, last, central } = lesionSlices(l, slicing, dims)
  const [uAxis, vAxis] = planeAxes(slicing.axis)
  const rows = clampGrid(l.cassettes.rows)
  const cols = clampGrid(l.cassettes.cols)
  const prefix = (l.cassettes.prefix || 'A').trim()
  let n = Math.max(1, Math.floor(l.cassettes.start) || 1)

  // As fileiras correm do extremo positivo ao negativo (superior → inferior,
  // anterior → posterior); as colunas idem no segundo eixo.
  const cu = coord(l.center, uAxis)
  const cv = coord(l.center, vAxis)
  const su = Math.max(sizeOn(l, uAxis), 2)
  const sv = Math.max(sizeOn(l, vAxis), 2)
  const uTop = Math.min(half(dims, uAxis), cu + su / 2)
  const uBot = Math.max(-half(dims, uAxis), cu - su / 2)
  const vTop = Math.min(half(dims, vAxis), cv + sv / 2)
  const vBot = Math.max(-half(dims, vAxis), cv - sv / 2)
  const du = (uTop - uBot) / rows
  const dv = (vTop - vBot) / cols

  const grid: CassetteDef[] = []
  let index = 0
  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      grid.push({
        id: cassetteIdOf(l.id, index++),
        label: `${prefix}${n++}`,
        lesionId: l.id,
        slice: central,
        kind: 'grid',
        row: r,
        col: c,
        u0: uTop - (r + 1) * du,
        u1: uTop - r * du,
        v0: vTop - (c + 1) * dv,
        v1: vTop - c * dv,
        uAxis,
        vAxis,
      })
    }
  }

  const others: CassetteDef[] = []
  const per = Math.max(0, Math.min(MAX_GRID, Math.floor(l.cassettes.perOtherSlice) || 0))
  if (per > 0) {
    for (let k = first; k <= last; k++) {
      if (k === central) continue
      // Uma fatia adicional vira `per` cassetes lado a lado ao longo das colunas.
      const dvk = (vTop - vBot) / per
      for (let c = 0; c < per; c++) {
        others.push({
          id: cassetteIdOf(l.id, index++),
          label: `${prefix}${n++}`,
          lesionId: l.id,
          slice: k,
          kind: 'other',
          row: 0,
          col: c,
          u0: uBot,
          u1: uTop,
          v0: vTop - (c + 1) * dvk,
          v1: vTop - c * dvk,
          uAxis,
          vAxis,
        })
      }
    }
  }

  return {
    lesion: l,
    central,
    first,
    last,
    grid,
    others,
    all: [...grid, ...others],
    gridSizeU: uTop - uBot,
    gridSizeV: vTop - vBot,
    rowDirection: [AXIS_MARGINS[uAxis][1], AXIS_MARGINS[uAxis][0]],
    colDirection: [AXIS_MARGINS[vAxis][1], AXIS_MARGINS[vAxis][0]],
  }
}

export function planCassettes(m: MacroState): LesionCassettes[] {
  return m.lesions.map((l) => planLesionCassettes(l, m))
}

/** "A1–A6" ou "A1" para uma lista de rótulos consecutivos. */
export function labelSpan(defs: CassetteDef[]): string {
  if (!defs.length) return ''
  if (defs.length === 1) return defs[0].label
  return `${defs[0].label}–${defs[defs.length - 1].label}`
}

/** Prefixo livre para uma lesão nova: a letra seguinte à última usada. */
export function nextPrefix(m: MacroState): string {
  const used = new Set(m.lesions.map((l) => l.cassettes.prefix.toUpperCase()))
  for (let i = 0; i < 26; i++) {
    const c = String.fromCharCode(65 + i)
    if (!used.has(c)) return c
  }
  return 'Z'
}
