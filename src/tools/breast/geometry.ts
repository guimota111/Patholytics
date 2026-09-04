/* ==========================================================================
   geometry.ts — do mapa (peça + lesões + cortes) aos números: distâncias às
   margens, quadrante e posição horária, fatias que contêm cada lesão,
   distância entre lesões. Funções puras sobre o referencial da peça.
   ========================================================================== */

import {
  AXIS_COORD,
  AXIS_MARGINS,
  MARGIN_AXIS,
  MARGIN_SIGN,
  MARGINS,
  MAX_SLICES,
  type Axis,
  type Dims3,
  type Lesion,
  type MacroState,
  type Margin,
  type Point3,
  type Quadrant,
  type Side,
  type Slicing,
} from './types'

/** Dimensão ou um valor de fallback razoável, para a geometria nunca quebrar. */
export const FALLBACK_DIMS: Record<Axis, number> = { ml: 80, si: 60, ap: 30 }
export const dim = (dims: Dims3, axis: Axis): number => {
  const v = dims[axis]
  return v !== null && Number.isFinite(v) && v > 0 ? v : FALLBACK_DIMS[axis]
}
export const half = (dims: Dims3, axis: Axis) => dim(dims, axis) / 2

export const coord = (p: Point3, axis: Axis) => p[AXIS_COORD[axis]]
export const sizeOn = (l: Lesion, axis: Axis) => {
  const v = l.size[axis]
  return v !== null && Number.isFinite(v) && v >= 0 ? v : 0
}

export interface MarginDistance {
  margin: Margin
  axis: Axis
  /** Distância da borda da lesão à margem (mm); 0 quando a lesão a alcança. */
  mm: number
  /** A lesão ultrapassa ou toca a margem. */
  reached: boolean
}

/** Distâncias da lesão a cada uma das seis margens, no modelo em bloco. */
export function marginDistances(l: Lesion, dims: Dims3): MarginDistance[] {
  return MARGINS.map((margin) => {
    const axis = MARGIN_AXIS[margin]
    const sign = MARGIN_SIGN[margin]
    const edge = coord(l.center, axis) * sign + sizeOn(l, axis) / 2
    const raw = half(dims, axis) - edge
    return { margin, axis, mm: Math.max(0, raw), reached: raw <= 0.05 }
  })
}

export function closestMargin(l: Lesion, dims: Dims3): MarginDistance {
  return marginDistances(l, dims).reduce((m, d) => (d.mm < m.mm ? d : m))
}

/** Novo centro ao fixar a distância a uma margem (o tamanho fica). */
export function centerFromDistance(l: Lesion, dims: Dims3, margin: Margin, mm: number): Point3 {
  const axis = MARGIN_AXIS[margin]
  const sign = MARGIN_SIGN[margin]
  const edge = half(dims, axis) - Math.max(0, mm)
  const c = (edge - sizeOn(l, axis) / 2) * sign
  return { ...l.center, [AXIS_COORD[axis]]: c }
}

/** Mantém a lesão dentro da peça (o centro pode encostar na margem, não sair). */
export function clampCenter(l: Lesion, dims: Dims3): Point3 {
  const out = { ...l.center }
  for (const axis of ['ml', 'si', 'ap'] as Axis[]) {
    const h = half(dims, axis)
    const k = AXIS_COORD[axis]
    out[k] = Math.max(-h, Math.min(h, out[k]))
  }
  return out
}

/** Raio do elipsoide da lesão na direção unitária (dx, dy, dz). */
function radiusAlong(l: Lesion, d: Point3): number {
  const a = sizeOn(l, 'ml') / 2
  const b = sizeOn(l, 'si') / 2
  const c = sizeOn(l, 'ap') / 2
  const q = (a ? (d.x / a) ** 2 : 0) + (b ? (d.y / b) ** 2 : 0) + (c ? (d.z / c) ** 2 : 0)
  if (q <= 0) return 0
  return 1 / Math.sqrt(q)
}

/** Distância aproximada entre as superfícies de duas lesões (0 se se tocam). */
export function lesionGap(a: Lesion, b: Lesion): number {
  const dx = b.center.x - a.center.x
  const dy = b.center.y - a.center.y
  const dz = b.center.z - a.center.z
  const dist = Math.hypot(dx, dy, dz)
  if (dist < 1e-6) return 0
  const u = { x: dx / dist, y: dy / dist, z: dz / dist }
  const ra = radiusAlong(a, u)
  const rb = radiusAlong(b, { x: -u.x, y: -u.y, z: -u.z })
  return Math.max(0, dist - ra - rb)
}

export interface ClockPosition {
  /** 1–12; null quando a lesão está sobre o mamilo. */
  hour: number | null
  /** Distância do centro da lesão ao mamilo no plano frontal, mm. */
  fromNippleMm: number
}

/** Posição horária vista de frente: na mama esquerda o lateral fica às 3 h; na direita, às 9 h. */
export function clockPosition(l: Lesion, side: Side): ClockPosition {
  const vx = side === 'left' ? l.center.x : -l.center.x
  const vy = l.center.y
  const r = Math.hypot(vx, vy)
  if (r < 5) return { hour: null, fromNippleMm: r }
  const deg = ((Math.atan2(vx, vy) * 180) / Math.PI + 360) % 360
  let hour = Math.round(deg / 30)
  if (hour === 0) hour = 12
  return { hour, fromNippleMm: r }
}

/** Quadrante derivado da posição (peça de mastectomia, mamilo no centro). */
export function derivedQuadrant(l: Lesion, centralMm = 15): Quadrant {
  const { x, y } = l.center
  if (Math.hypot(x, y) <= centralMm) return 'central'
  const outer = x > 0
  const upper = y > 0
  if (Math.abs(y) < 5) return outer ? 'outer' : 'inner'
  if (Math.abs(x) < 5) return upper ? 'upper' : 'lower'
  if (upper) return outer ? 'usq' : 'uiq'
  return outer ? 'lsq' : 'liq'
}

/* ---- Cortes -------------------------------------------------------------- */

export const clampSlices = (n: number) => Math.max(1, Math.min(MAX_SLICES, Math.floor(n) || 1))

/** Se a numeração começa pela margem negativa do eixo (ex.: medial, inferior, posterior). */
export const startsNegative = (s: Slicing) => MARGIN_SIGN[s.from] === -1

/** A margem `from` precisa pertencer ao eixo; devolve uma coerente. */
export function coherentFrom(s: Slicing): Margin {
  return MARGIN_AXIS[s.from] === s.axis ? s.from : AXIS_MARGINS[s.axis][1]
}

export const sliceThickness = (s: Slicing, dims: Dims3) => dim(dims, s.axis) / clampSlices(s.count)

/** Fatia (1..N) que contém a coordenada `c` ao longo do eixo de corte. */
export function sliceAt(c: number, s: Slicing, dims: Dims3): number {
  const n = clampSlices(s.count)
  const h = half(dims, s.axis)
  const t = sliceThickness(s, dims)
  const fromStart = startsNegative(s) ? c + h : h - c
  return Math.max(1, Math.min(n, Math.floor(fromStart / t + 1e-9) + 1))
}

/** Coordenada (no eixo de corte) do centro da fatia k. */
export function sliceCenter(k: number, s: Slicing, dims: Dims3): number {
  const h = half(dims, s.axis)
  const t = sliceThickness(s, dims)
  const fromStart = (k - 0.5) * t
  return startsNegative(s) ? -h + fromStart : h - fromStart
}

/** Coordenadas dos planos de corte (entre fatias), do início ao fim. */
export function cutPlanes(s: Slicing, dims: Dims3): number[] {
  const n = clampSlices(s.count)
  const h = half(dims, s.axis)
  const t = sliceThickness(s, dims)
  const out: number[] = []
  for (let k = 1; k < n; k++) out.push(startsNegative(s) ? -h + k * t : h - k * t)
  return out
}

export interface LesionSlices {
  first: number
  last: number
  /** Fatia do maior corte (a que passa pelo centro). */
  central: number
}

export function lesionSlices(l: Lesion, s: Slicing, dims: Dims3): LesionSlices {
  const c = coord(l.center, s.axis)
  const r = sizeOn(l, s.axis) / 2
  const a = sliceAt(c - r + 1e-6, s, dims)
  const b = sliceAt(c + r - 1e-6, s, dims)
  return { first: Math.min(a, b), last: Math.max(a, b), central: sliceAt(c, s, dims) }
}

/** Eixos do plano de cada fatia: [linhas, colunas] — as fileiras correm no primeiro. */
export function planeAxes(axis: Axis): [Axis, Axis] {
  if (axis === 'ml') return ['si', 'ap']
  if (axis === 'si') return ['ml', 'ap']
  return ['si', 'ml']
}

/** Qual lesão está em cada fatia, na ordem de numeração. */
export function slicesWithLesions(m: MacroState): { slice: number; lesionIds: string[] }[] {
  const n = clampSlices(m.slicing.count)
  const out = Array.from({ length: n }, (_, i) => ({ slice: i + 1, lesionIds: [] as string[] }))
  for (const l of m.lesions) {
    const { first, last } = lesionSlices(l, m.slicing, m.specimen.dims)
    for (let k = first; k <= last; k++) out[k - 1].lesionIds.push(l.id)
  }
  return out
}

/** Formata "4–7" ou "5". */
export const sliceRange = (r: LesionSlices) => (r.first === r.last ? String(r.first) : `${r.first}–${r.last}`)

/** Centro proposto para uma lesão nova: um pouco deslocado das existentes. */
export function suggestCenter(m: MacroState): Point3 {
  const n = m.lesions.length
  const hx = half(m.specimen.dims, 'ml')
  const hy = half(m.specimen.dims, 'si')
  if (n === 0) return { x: 0, y: 0, z: 0 }
  const angle = (n * 2 * Math.PI) / 3
  return { x: Math.round(Math.cos(angle) * hx * 0.45), y: Math.round(Math.sin(angle) * hy * 0.45), z: 0 }
}
