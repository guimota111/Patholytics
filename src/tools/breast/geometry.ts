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
  type SpecimenState,
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
  /** Distância usada no laudo: a medida pelo patologista, ou a do modelo. */
  mm: number
  /** A distância que sai da posição da lesão no modelo. */
  modelMm: number
  /** O valor veio da régua (o modelo não o reescreve). */
  fromRuler: boolean
  /** A lesão ultrapassa ou toca a margem. */
  reached: boolean
}

/** Distância medida na bancada até uma margem, se o patologista digitou alguma. */
export const measuredMargin = (l: Lesion, margin: Margin): number | null => {
  const v = l.measured?.[margin]
  return typeof v === 'number' && Number.isFinite(v) && v >= 0 ? v : null
}

/**
 * Distâncias da lesão a cada uma das seis margens. Cada margem traz o valor do
 * modelo e, quando existe, o medido na bancada — que é o que vale no laudo.
 */
export function marginDistances(l: Lesion, dims: Dims3): MarginDistance[] {
  return MARGINS.map((margin) => {
    const axis = MARGIN_AXIS[margin]
    const sign = MARGIN_SIGN[margin]
    const edge = coord(l.center, axis) * sign + sizeOn(l, axis) / 2
    const modelMm = Math.max(0, half(dims, axis) - edge)
    const ruler = measuredMargin(l, margin)
    const mm = ruler ?? modelMm
    return { margin, axis, mm, modelMm, fromRuler: ruler !== null, reached: mm <= 0.05 }
  })
}

export function closestMargin(l: Lesion, dims: Dims3): MarginDistance {
  return marginDistances(l, dims).reduce((m, d) => (d.mm < m.mm ? d : m))
}

/** Mantém o centro dentro da caixa da peça — a rede de segurança de containCenter. */
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

/* ---- Superfície da peça ---------------------------------------------------
   A peça não é uma caixa: é um superelipsoide (segmento arredondado;
   mastectomia em cúpula, com a face profunda quase plana). Quem desenha o 3D
   e quem posiciona a lesão precisam da mesma superfície, senão a lesão cabe
   na caixa e aparece fora da peça.
   -------------------------------------------------------------------------- */

export interface Shape {
  /** < 0 dentro da peça, 0 na superfície, > 0 fora. */
  f: (x: number, y: number, z: number) => number
  grad: (x: number, y: number, z: number) => [number, number, number]
  a: number
  b: number
  cFront: number
  cBack: number
  rMax: number
}

const powAbs = (v: number, p: number) => Math.pow(Math.abs(v), p)
const sgn = (v: number) => (v < 0 ? -1 : 1)

export function makeShape(sp: SpecimenState): Shape {
  const a = dim(sp.dims, 'ml') / 2
  const b = dim(sp.dims, 'si') / 2
  const ap = dim(sp.dims, 'ap')
  if (sp.type === 'mastectomy') {
    const cFront = ap * 0.72
    const cBack = ap * 0.28
    const pxy = 2.3
    const pf = 2.0
    const pb = 7
    return {
      a,
      b,
      cFront,
      cBack,
      rMax: 2.5 * Math.max(a, b, cFront),
      f: (x, y, z) => powAbs(x / a, pxy) + powAbs(y / b, pxy) + (z >= 0 ? powAbs(z / cFront, pf) : powAbs(z / cBack, pb)) - 1,
      grad: (x, y, z) => [
        (pxy * sgn(x) * powAbs(x / a, pxy - 1)) / a,
        (pxy * sgn(y) * powAbs(y / b, pxy - 1)) / b,
        z >= 0 ? (pf * powAbs(z / cFront, pf - 1)) / cFront : (-pb * powAbs(z / cBack, pb - 1)) / cBack,
      ],
    }
  }
  const c = ap / 2
  const p = 3.2
  return {
    a,
    b,
    cFront: c,
    cBack: c,
    rMax: 2.5 * Math.max(a, b, c),
    f: (x, y, z) => powAbs(x / a, p) + powAbs(y / b, p) + powAbs(z / c, p) - 1,
    grad: (x, y, z) => [(p * sgn(x) * powAbs(x / a, p - 1)) / a, (p * sgn(y) * powAbs(y / b, p - 1)) / b, (p * sgn(z) * powAbs(z / c, p - 1)) / c],
  }
}

/** Raio r em que f(o + r·d) = 0 (bisseção; f cresce ao longo do raio). */
export function march(shape: Shape, o: [number, number, number], d: [number, number, number], maxR: number): number | null {
  const at = (r: number) => shape.f(o[0] + d[0] * r, o[1] + d[1] * r, o[2] + d[2] * r)
  if (at(0) >= 0) return null
  let lo = 0
  let hi = maxR
  if (at(hi) < 0) return null
  for (let i = 0; i < 34; i++) {
    const mid = (lo + hi) / 2
    if (at(mid) < 0) lo = mid
    else hi = mid
  }
  return (lo + hi) / 2
}

/** 26 direções: os seis eixos, as doze arestas e os oito cantos. */
const CONTAIN_DIRS: Point3[] = (() => {
  const out: Point3[] = []
  for (const x of [-1, 0, 1]) {
    for (const y of [-1, 0, 1]) {
      for (const z of [-1, 0, 1]) {
        if (!x && !y && !z) continue
        const n = Math.hypot(x, y, z)
        out.push({ x: x / n, y: y / n, z: z / n })
      }
    }
  }
  return out
})()

/**
 * Empurra a lesão para dentro da peça: o elipsoide inteiro tem de caber sob a
 * superfície, e não só o centro dentro da caixa. Em cada rodada acha a direção
 * que mais escapa e recua o centro exatamente o que sobrou; poucas rodadas
 * bastam porque a peça é convexa. Encostar na margem continua valendo — o que
 * deixa de acontecer é a lesão flutuar fora da peça.
 */
export function containCenter(l: Lesion, sp: SpecimenState): Point3 {
  const shape = makeShape(sp)
  let c = clampCenter(l, sp.dims)
  for (let round = 0; round < 12; round++) {
    let worst: { dir: Point3; over: number } | null = null
    for (const d of CONTAIN_DIRS) {
      const r = radiusAlong(l, d)
      const px = c.x + d.x * r
      const py = c.y + d.y * r
      const pz = c.z + d.z * r
      if (shape.f(px, py, pz) <= 0) continue
      const len = Math.hypot(px, py, pz)
      if (len < 1e-6) continue
      const surface = march(shape, [0, 0, 0], [px / len, py / len, pz / len], shape.rMax)
      if (surface === null) continue
      const over = len - surface
      if (over > 0 && (!worst || over > worst.over)) worst = { dir: d, over }
    }
    if (!worst) return c
    c = { x: c.x - worst.dir.x * worst.over, y: c.y - worst.dir.y * worst.over, z: c.z - worst.dir.z * worst.over }
  }
  // Lesão maior que a peça: sem posição possível, fica centrada na caixa.
  return clampCenter({ ...l, center: c }, sp.dims)
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
export const sliceRange = (r: { first: number; last: number }) => (r.first === r.last ? String(r.first) : `${r.first}–${r.last}`)

/** Centro proposto para uma lesão nova: um pouco deslocado das existentes. */
export function suggestCenter(m: MacroState): Point3 {
  const n = m.lesions.length
  const hx = half(m.specimen.dims, 'ml')
  const hy = half(m.specimen.dims, 'si')
  if (n === 0) return { x: 0, y: 0, z: 0 }
  const angle = (n * 2 * Math.PI) / 3
  return { x: Math.round(Math.cos(angle) * hx * 0.45), y: Math.round(Math.sin(angle) * hy * 0.45), z: 0 }
}

/**
 * Garante a invariante do mapa: nenhuma lesão fora da peça. Vale para o que
 * chega do navegador, de um código colado ou de uma peça que mudou de tamanho
 * depois que a lesão foi posicionada. Devolve o mesmo objeto quando nada muda,
 * para não provocar renderização à toa.
 */
export function containLesions(m: MacroState): MacroState {
  let changed = false
  const lesions = m.lesions.map((l) => {
    const center = containCenter(l, m.specimen)
    if (Math.abs(center.x - l.center.x) < 1e-6 && Math.abs(center.y - l.center.y) < 1e-6 && Math.abs(center.z - l.center.z) < 1e-6) return l
    changed = true
    return { ...l, center }
  })
  return changed ? { ...m, lesions } : m
}
