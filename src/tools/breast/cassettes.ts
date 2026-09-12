/* ==========================================================================
   cassettes.ts — da grade planejada por lesão (prefixo, fatia mapeada,
   fileiras × colunas, cassetes por fatia adicional) aos cassetes com rótulo,
   fatia e retângulo no plano da fatia. É o que a laudagem preenche e o 3D
   desenha.

   A peça costuma ter uma letra só: a segunda lesão continua no "A", com a
   numeração seguindo de onde a primeira parou. Por isso o número inicial é
   resolvido lendo todas as lesões na ordem, e não guardado em cada uma.
   ========================================================================== */

import { clampSlices, coord, half, lesionSlices, planeAxes, sizeOn } from './geometry'
import { AXIS_MARGINS, MAX_GRID, cassetteIdOf, type Axis, type ExtraCassette, type Lesion, type MacroState, type Margin } from './types'

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
  /** Fatia que recebeu a grade — a escolhida pelo patologista ou a do maior corte. */
  mapped: number
  /** A fatia que passa pelo centro da lesão (a sugestão, quando ele não escolhe). */
  largest: number
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
export const clampPerSlice = (n: number) => Math.max(0, Math.min(MAX_GRID, Math.floor(n) || 0))
export const prefixOf = (l: Lesion) => (l.cassettes.prefix || 'A').trim().toUpperCase() || 'A'

/** A fatia mapeada: a que o patologista informou, ou a do maior corte. */
export function mappedSlice(l: Lesion, m: MacroState): number {
  const { central } = lesionSlices(l, m.slicing, m.specimen.dims)
  const chosen = l.cassettes.slice
  if (chosen === null || !Number.isFinite(chosen)) return central
  return Math.max(1, Math.min(clampSlices(m.slicing.count), Math.floor(chosen)))
}

/** Quantos cassetes a lesão gera ao todo (grade + fatias adicionais). */
export function cassetteCount(l: Lesion, m: MacroState): number {
  const { first, last } = lesionSlices(l, m.slicing, m.specimen.dims)
  const mapped = mappedSlice(l, m)
  const per = clampPerSlice(l.cassettes.perOtherSlice)
  let others = 0
  for (let k = first; k <= last; k++) if (k !== mapped) others += per
  return clampGrid(l.cassettes.rows) * clampGrid(l.cassettes.cols) + others
}

/**
 * O primeiro número de cada lesão. Quem não fixou um número continua a
 * contagem da letra onde a lesão anterior parou — é assim que a lesão 2 vira
 * A7 e não B1.
 */
export function resolveStarts(m: MacroState): Record<string, number> {
  const counters: Record<string, number> = {}
  const out: Record<string, number> = {}
  for (const l of m.lesions) {
    const prefix = prefixOf(l)
    const fixed = l.cassettes.start
    const start = fixed !== null && Number.isFinite(fixed) ? Math.max(1, Math.floor(fixed)) : (counters[prefix] ?? 1)
    out[l.id] = start
    counters[prefix] = start + cassetteCount(l, m)
  }
  return out
}

/** Onde a numeração da peça chegou: o rótulo livre seguinte ("A7"). */
export function nextCassetteLabel(m: MacroState, extras: ExtraCassette[] = m.extraCassettes): { prefix: string; n: number } {
  const prefix = m.lesions.length ? prefixOf(m.lesions[m.lesions.length - 1]) : 'A'
  const starts = resolveStarts(m)
  let n = 1
  for (const l of m.lesions) {
    if (prefixOf(l) !== prefix) continue
    n = Math.max(n, starts[l.id] + cassetteCount(l, m))
  }
  for (const x of extras) {
    const match = x.label.trim().toUpperCase().match(/^([A-Z]{1,3})(\d+)$/)
    if (match && match[1] === prefix) n = Math.max(n, Number(match[2]) + 1)
  }
  return { prefix, n }
}

export function planLesionCassettes(l: Lesion, m: MacroState): LesionCassettes {
  const { slicing } = m
  const dims = m.specimen.dims
  const { first, last, central } = lesionSlices(l, slicing, dims)
  const mapped = mappedSlice(l, m)
  const [uAxis, vAxis] = planeAxes(slicing.axis)
  const rows = clampGrid(l.cassettes.rows)
  const cols = clampGrid(l.cassettes.cols)
  const prefix = prefixOf(l)
  let n = resolveStarts(m)[l.id] ?? 1

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
        slice: mapped,
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
  const per = clampPerSlice(l.cassettes.perOtherSlice)
  if (per > 0) {
    for (let k = first; k <= last; k++) {
      if (k === mapped) continue
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
    mapped,
    largest: central,
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

/** Letra de uma lesão nova: a mesma da anterior — a peça costuma ter uma letra só. */
export const inheritedPrefix = (m: MacroState): string => (m.lesions.length ? prefixOf(m.lesions[m.lesions.length - 1]) : 'A')
