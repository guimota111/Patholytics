/* ==========================================================================
   BreastModel.tsx — modelo 3D procedural da peça de mama.

   A peça é um superelipsoide (segmento: bloco arredondado de tecido
   fibroadiposo; mastectomia: cúpula com a face profunda plana) descrito por
   uma função implícita; cada face da malha é pintada com a tinta da margem
   que a cobre (o eixo dominante decide), e a elipse de pele com o mamilo
   ocupa a face anterior. A peça é translúcida para deixar ver as lesões —
   elipsoides lisos, espiculados ou mal definidos — as linhas de corte entre
   as fatias, as distâncias até as margens e, na laudagem, os cassetes do
   maior corte coloridos pela celularidade.

   Eixos do mundo: +y = superior, +z = anterior (de frente para quem olha),
   +x = direita de quem olha — na mama esquerda é o lateral, na direita, o
   medial, como na bancada.
   ========================================================================== */

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { Eye, EyeOff, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { planCassettes, type CassetteDef } from '../cassettes'
import { fmtLen } from '../format'
import { closestMargin, cutPlanes, dim, marginDistances, sizeOn, sliceCenter, sliceThickness } from '../geometry'
import { caColor, strokeColor, type Theme } from '../heat'
import { BED_HEX, INK_HEX, MASS_HEX, NIPPLE_HEX, SKIN_HEX } from '../inks'
import { AXIS_COORD, MARGIN_AXIS, MARGIN_SIGN, MARGINS, type Axis, type Lesion, type MacroState, type Margin, type MicroCell, type SpecimenState } from '../types'

/* ---- Superfície implícita da peça ----------------------------------------- */

interface Shape {
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

function makeShape(sp: SpecimenState): Shape {
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
function march(shape: Shape, o: [number, number, number], d: [number, number, number], maxR: number): number | null {
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

/* ---- Utilidades ------------------------------------------------------------ */

function hashSeed(s: string): number {
  let h = 2166136261
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619)
  return h >>> 0
}

function mulberry(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function textSprite(text: string, color: string, scale = 1): THREE.Sprite | null {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64
  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.font = '600 34px Inter, system-ui, sans-serif'
  ctx.textAlign = 'center'
  ctx.textBaseline = 'middle'
  ctx.fillStyle = color
  ctx.fillText(text, 128, 32)
  const texture = new THREE.CanvasTexture(canvas)
  texture.colorSpace = THREE.SRGBColorSpace
  const sprite = new THREE.Sprite(new THREE.SpriteMaterial({ map: texture, depthTest: false, transparent: true }))
  sprite.scale.set(1.6 * scale, 0.4 * scale, 1)
  return sprite
}

/* ---- Construção ------------------------------------------------------------ */

interface Build {
  shell: THREE.Mesh
  shellMaterials: THREE.MeshStandardMaterial[]
  nipple: THREE.Mesh | null
  lesions: { id: string; mesh: THREE.Mesh; material: THREE.MeshStandardMaterial }[]
  clips: THREE.Mesh[]
  lines: THREE.LineSegments
  tiles: { def: CassetteDef; mesh: THREE.Mesh; material: THREE.MeshBasicMaterial; edges: THREE.LineSegments }[]
  distances: THREE.Group
  labels: THREE.Sprite[]
  disposables: { dispose: () => void }[]
  scale: number
  flip: number
}

function buildScene(map: MacroState, theme: Theme, mode: 'macro' | 'micro', t: (k: string, p?: Record<string, unknown>) => string, locale: string): Build {
  const sp = map.specimen
  const shape = makeShape(sp)
  const S = 4.4 / Math.max(dim(sp.dims, 'ml'), dim(sp.dims, 'si'), dim(sp.dims, 'ap'))
  const flip = sp.side === 'right' ? -1 : 1
  const toWorld = (x: number, y: number, z: number) => new THREE.Vector3(flip * x * S, y * S, z * S)
  const disposables: Build['disposables'] = []

  // Elipse de pele na face anterior.
  const skinL = sp.skin.present ? (sp.skin.length ?? dim(sp.dims, 'ml') * (sp.type === 'mastectomy' ? 0.6 : 0.5)) / 2 : 0
  const skinW = sp.skin.present ? (sp.skin.width ?? dim(sp.dims, 'si') * (sp.type === 'mastectomy' ? 0.35 : 0.25)) / 2 : 0
  const inSkin = (x: number, y: number, z: number) => sp.skin.present && z > 0 && (x / Math.max(skinL, 1)) ** 2 + (y / Math.max(skinW, 1)) ** 2 <= 1

  const classify = (x: number, y: number, z: number): string => {
    if (inSkin(x, y, z)) return 'skin'
    const nx = Math.abs(x / shape.a)
    const ny = Math.abs(y / shape.b)
    const nz = Math.abs(z / (z >= 0 ? shape.cFront : shape.cBack))
    if (nx >= ny && nx >= nz) return x >= 0 ? 'lateral' : 'medial'
    if (ny >= nz) return y >= 0 ? 'superior' : 'inferior'
    return z >= 0 ? 'anterior' : 'posterior'
  }

  // Malha latitude × longitude da superfície implícita.
  const LAT = 60
  const LON = 96
  const verts: THREE.Vector3[][] = []
  const norms: THREE.Vector3[][] = []
  for (let i = 0; i <= LAT; i++) {
    const phi = Math.PI * (i / LAT) // 0 = +y (superior)
    const row: THREE.Vector3[] = []
    const nrow: THREE.Vector3[] = []
    for (let j = 0; j <= LON; j++) {
      const th = (2 * Math.PI * j) / LON
      const d: [number, number, number] = [Math.sin(phi) * Math.cos(th), Math.cos(phi), Math.sin(phi) * Math.sin(th)]
      const r = march(shape, [0, 0, 0], d, shape.rMax) ?? 1
      const p: [number, number, number] = [d[0] * r, d[1] * r, d[2] * r]
      row.push(new THREE.Vector3(p[0], p[1], p[2]))
      const g = shape.grad(p[0], p[1], p[2])
      nrow.push(new THREE.Vector3(g[0], g[1], g[2]).normalize())
    }
    verts.push(row)
    norms.push(nrow)
  }
  const buckets = new Map<string, { pos: number[]; nor: number[] }>()
  const pushTri = (pa: THREE.Vector3, pb: THREE.Vector3, pc: THREE.Vector3, na: THREE.Vector3, nb: THREE.Vector3, nc: THREE.Vector3) => {
    if (pa.distanceToSquared(pb) < 1e-8 || pb.distanceToSquared(pc) < 1e-8 || pc.distanceToSquared(pa) < 1e-8) return
    const cx = (pa.x + pb.x + pc.x) / 3
    const cy = (pa.y + pb.y + pc.y) / 3
    const cz = (pa.z + pb.z + pc.z) / 3
    const key = classify(cx, cy, cz)
    let b = buckets.get(key)
    if (!b) buckets.set(key, (b = { pos: [], nor: [] }))
    // Espelhar x inverte a orientação: troca dois vértices para as faces continuarem para fora.
    const order = flip === 1 ? [pa, pb, pc] : [pa, pc, pb]
    const norder = flip === 1 ? [na, nb, nc] : [na, nc, nb]
    for (let k = 0; k < 3; k++) {
      const p = order[k]
      const n = norder[k]
      b.pos.push(flip * p.x * S, p.y * S, p.z * S)
      b.nor.push(flip * n.x, n.y, n.z)
    }
  }
  for (let i = 0; i < LAT; i++) {
    for (let j = 0; j < LON; j++) {
      const p00 = verts[i][j]
      const p01 = verts[i][j + 1]
      const p10 = verts[i + 1][j]
      const p11 = verts[i + 1][j + 1]
      // Sentido anti-horário visto de fora (phi cresce para baixo, theta gira de +x para +z).
      pushTri(p00, p11, p10, norms[i][j], norms[i + 1][j + 1], norms[i + 1][j])
      pushTri(p00, p01, p11, norms[i][j], norms[i][j + 1], norms[i + 1][j + 1])
    }
  }
  let total = 0
  for (const b of buckets.values()) total += b.pos.length
  const positions = new Float32Array(total)
  const normals = new Float32Array(total)
  const geometry = new THREE.BufferGeometry()
  const shellMaterials: THREE.MeshStandardMaterial[] = []
  let offset = 0
  for (const [key, b] of buckets) {
    positions.set(b.pos, offset)
    normals.set(b.nor, offset)
    geometry.addGroup(offset / 3, b.pos.length / 3, shellMaterials.length)
    const color = key === 'skin' ? SKIN_HEX : INK_HEX[map.inks[key as Margin]]
    shellMaterials.push(
      new THREE.MeshStandardMaterial({
        color,
        roughness: 0.78,
        metalness: 0,
        transparent: true,
        opacity: key === 'skin' ? 0.55 : 0.42,
        depthWrite: false,
      }),
    )
    offset += b.pos.length
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3))
  const shell = new THREE.Mesh(geometry, shellMaterials)
  shell.renderOrder = 10
  disposables.push(geometry, ...shellMaterials)

  // Mamilo: calota na face anterior, no centro da elipse de pele.
  let nipple: THREE.Mesh | null = null
  if (sp.skin.present && sp.skin.nipple) {
    const rTop = march(shape, [0, 0, 0], [0, 0, 1], shape.rMax) ?? shape.cFront
    const rad = Math.max(2, (sp.skin.nippleDiameter ?? 10) / 2)
    const g = new THREE.SphereGeometry(rad * S, 24, 16)
    const m = new THREE.MeshStandardMaterial({ color: NIPPLE_HEX, roughness: 0.8 })
    nipple = new THREE.Mesh(g, m)
    nipple.scale.set(1, 1, 0.55)
    nipple.position.copy(toWorld(0, 0, rTop))
    disposables.push(g, m)
  }

  // Lesões.
  const lesions: Build['lesions'] = []
  const clips: THREE.Mesh[] = []
  for (const l of map.lesions) {
    const g = new THREE.SphereGeometry(1, 56, 36)
    displace(g, l)
    const isBed = l.kind === 'tumorBed'
    const m = new THREE.MeshStandardMaterial({
      color: isBed ? BED_HEX : MASS_HEX,
      roughness: isBed ? 0.95 : 0.55,
      metalness: 0,
      transparent: isBed || mode === 'micro',
      opacity: mode === 'micro' ? 0.32 : isBed ? 0.8 : 1,
      depthWrite: mode === 'macro' && !isBed,
    })
    const mesh = new THREE.Mesh(g, m)
    mesh.scale.set(Math.max(0.5, sizeOn(l, 'ml') / 2) * S, Math.max(0.5, sizeOn(l, 'si') / 2) * S, Math.max(0.5, sizeOn(l, 'ap') / 2) * S)
    mesh.position.copy(toWorld(l.center.x, l.center.y, l.center.z))
    mesh.renderOrder = mode === 'micro' ? 5 : 1
    mesh.userData = { lesionId: l.id }
    lesions.push({ id: l.id, mesh, material: m })
    disposables.push(g, m)
    if (l.clip) {
      const cg = new THREE.CylinderGeometry(0.9 * S, 0.9 * S, 3.5 * S, 12)
      const cm = new THREE.MeshStandardMaterial({ color: '#d7dbe2', metalness: 0.9, roughness: 0.25 })
      const clip = new THREE.Mesh(cg, cm)
      clip.position.copy(mesh.position)
      clip.rotation.z = Math.PI / 5
      clip.renderOrder = 2
      clips.push(clip)
      disposables.push(cg, cm)
    }
  }

  // Linhas de corte: anéis na superfície em cada plano entre fatias.
  const seg: number[] = []
  const axis = map.slicing.axis
  const LIFT = 1.004
  const ringAt = (c: number) => {
    const STEPS = 128
    let prev: THREE.Vector3 | null = null
    let first: THREE.Vector3 | null = null
    for (let k = 0; k <= STEPS; k++) {
      const tt = (k / STEPS) * Math.PI * 2
      const cs = Math.cos(tt)
      const sn = Math.sin(tt)
      const o: [number, number, number] = axis === 'ml' ? [c, 0, 0] : axis === 'si' ? [0, c, 0] : [0, 0, c]
      const d: [number, number, number] = axis === 'ml' ? [0, cs, sn] : axis === 'si' ? [cs, 0, sn] : [cs, sn, 0]
      const r = march(shape, o, d, shape.rMax)
      if (r === null) {
        prev = null
        continue
      }
      const p = toWorld(o[0] + d[0] * r, o[1] + d[1] * r, o[2] + d[2] * r).multiplyScalar(LIFT)
      if (prev) seg.push(prev.x, prev.y, prev.z, p.x, p.y, p.z)
      prev = p
      if (!first) first = p
    }
  }
  for (const c of cutPlanes(map.slicing, sp.dims)) ringAt(c)
  const lineGeo = new THREE.BufferGeometry()
  lineGeo.setAttribute('position', new THREE.BufferAttribute(Float32Array.from(seg), 3))
  const lineMat = new THREE.LineBasicMaterial({ color: strokeColor(theme), transparent: true, opacity: 0.85 })
  const lines = new THREE.LineSegments(lineGeo, lineMat)
  lines.renderOrder = 11
  disposables.push(lineGeo, lineMat)

  // Rótulos: numeração das fatias e as direções.
  const ink = theme === 'dark' ? '#e6eaf0' : '#151a22'
  const labels: THREE.Sprite[] = []
  const n = map.slicing.count
  const thick = sliceThickness(map.slicing, sp.dims)
  const labelStep = n > 24 ? Math.ceil(n / 12) : 1
  for (let k = 1; k <= n; k++) {
    if ((k - 1) % labelStep !== 0 && k !== n) continue
    const c = sliceCenter(k, map.slicing, sp.dims)
    const o: [number, number, number] = axis === 'ml' ? [c, 0, 0] : axis === 'si' ? [0, c, 0] : [0, 0, c]
    const d: [number, number, number] = axis === 'si' ? [1, 0, 0] : [0, 1, 0]
    const r = march(shape, o, d, shape.rMax) ?? 0
    const p = toWorld(o[0] + d[0] * (r + thick * 0.15 + 4), o[1] + d[1] * (r + 4), o[2] + d[2] * r)
    const s = textSprite(String(k), ink, 0.55)
    if (!s) continue
    s.position.copy(p)
    labels.push(s)
  }
  const dir: [string, THREE.Vector3][] = [
    [t('breast.margin.superior'), new THREE.Vector3(0, shape.b * S + 0.9, 0)],
    [t(`breast.margin.${flip === 1 ? 'lateral' : 'medial'}`), new THREE.Vector3(shape.a * S + 0.9, -0.2, 0)],
    [t(`breast.margin.${flip === 1 ? 'medial' : 'lateral'}`), new THREE.Vector3(-(shape.a * S + 0.9), -0.2, 0)],
    [t('breast.margin.anterior'), new THREE.Vector3(0, -0.2, shape.cFront * S + 0.9)],
  ]
  for (const [text, p] of dir) {
    const s = textSprite(text, ink, 0.9)
    if (!s) continue
    s.position.copy(p)
    labels.push(s)
  }
  for (const s of labels) disposables.push(s.material.map as THREE.Texture, s.material)

  // Distâncias até as margens (macro): uma linha por margem, na cor da tinta.
  const distances = new THREE.Group()
  if (mode === 'macro') {
    for (const l of map.lesions) {
      const group = new THREE.Group()
      group.userData = { lesionId: l.id }
      const dists = marginDistances(l, sp.dims)
      const closest = closestMargin(l, sp.dims)
      for (const d of dists) {
        const ax: Axis = MARGIN_AXIS[d.margin]
        const sign = MARGIN_SIGN[d.margin]
        const dirV: [number, number, number] = [0, 0, 0]
        dirV[ax === 'ml' ? 0 : ax === 'si' ? 1 : 2] = sign
        const start: [number, number, number] = [l.center.x, l.center.y, l.center.z]
        start[ax === 'ml' ? 0 : ax === 'si' ? 1 : 2] += sign * (sizeOn(l, ax) / 2)
        const color = INK_HEX[map.inks[d.margin]] === INK_HEX.none ? '#8a6d2a' : INK_HEX[map.inks[d.margin]]
        if (d.reached) {
          const g = new THREE.SphereGeometry(1.4 * S, 12, 8)
          const m = new THREE.MeshBasicMaterial({ color: '#e11d48' })
          const dot = new THREE.Mesh(g, m)
          dot.position.copy(toWorld(start[0], start[1], start[2]))
          group.add(dot)
          disposables.push(g, m)
          continue
        }
        const r = march(shape, start, dirV, shape.rMax)
        if (r === null) continue
        const a = toWorld(start[0], start[1], start[2])
        const b = toWorld(start[0] + dirV[0] * r, start[1] + dirV[1] * r, start[2] + dirV[2] * r)
        const g = new THREE.BufferGeometry().setFromPoints([a, b])
        const m = new THREE.LineBasicMaterial({ color, transparent: true, opacity: d.margin === closest.margin ? 1 : 0.7, depthTest: false })
        const line = new THREE.Line(g, m)
        line.renderOrder = 20
        group.add(line)
        disposables.push(g, m)
        const s = textSprite(fmtLen(d.mm, map.units, locale), d.margin === closest.margin ? '#e11d48' : ink, 0.6)
        if (s) {
          s.position.copy(a.clone().lerp(b, 0.5))
          group.add(s)
          disposables.push(s.material.map as THREE.Texture, s.material)
        }
      }
      distances.add(group)
    }
  }

  // Laudagem: cassetes do maior corte como ladrilhos no plano da fatia.
  const tiles: Build['tiles'] = []
  if (mode === 'micro') {
    for (const plan of planCassettes(map)) {
      for (const def of plan.all) {
        const c = sliceCenter(def.slice, map.slicing, sp.dims)
        const corners = [
          [def.u0, def.v0],
          [def.u1, def.v0],
          [def.u1, def.v1],
          [def.u0, def.v1],
        ].map(([u, v]) => {
          const p: Record<'x' | 'y' | 'z', number> = { x: 0, y: 0, z: 0 }
          p[AXIS_COORD[axis]] = c
          p[AXIS_COORD[def.uAxis]] = u
          p[AXIS_COORD[def.vAxis]] = v
          return toWorld(p.x, p.y, p.z)
        })
        const g = new THREE.BufferGeometry()
        const arr = new Float32Array(18)
        const tri = [corners[0], corners[1], corners[2], corners[0], corners[2], corners[3]]
        tri.forEach((p, i) => arr.set([p.x, p.y, p.z], i * 3))
        g.setAttribute('position', new THREE.BufferAttribute(arr, 3))
        g.computeVertexNormals()
        const m = new THREE.MeshBasicMaterial({ color: caColor(null, theme), side: THREE.DoubleSide, transparent: true, opacity: 0.95 })
        const mesh = new THREE.Mesh(g, m)
        mesh.renderOrder = 6
        mesh.userData = { cassetteId: def.id }
        const eg = new THREE.EdgesGeometry(g)
        const em = new THREE.LineBasicMaterial({ color: strokeColor(theme), transparent: true, opacity: 0.9 })
        const edges = new THREE.LineSegments(eg, em)
        edges.renderOrder = 7
        tiles.push({ def, mesh, material: m, edges })
        disposables.push(g, m, eg, em)
      }
    }
  }

  return { shell, shellMaterials, nipple, lesions, clips, lines, tiles, distances, labels, disposables, scale: S, flip }
}

/** Desloca radialmente os vértices da esfera unitária conforme a forma da lesão. */
function displace(g: THREE.SphereGeometry, l: Lesion) {
  const pos = g.attributes.position as THREE.BufferAttribute
  const rnd = mulberry(hashSeed(l.id))
  const spikes: { d: THREE.Vector3; h: number; w: number }[] = []
  if (l.shape === 'spiculated') {
    const K = 14
    for (let k = 0; k < K; k++) {
      const u = rnd() * 2 - 1
      const th = rnd() * Math.PI * 2
      const rr = Math.sqrt(1 - u * u)
      spikes.push({ d: new THREE.Vector3(rr * Math.cos(th), u, rr * Math.sin(th)), h: 0.35 + rnd() * 0.45, w: 0.09 + rnd() * 0.09 })
    }
  }
  const v = new THREE.Vector3()
  for (let i = 0; i < pos.count; i++) {
    v.set(pos.getX(i), pos.getY(i), pos.getZ(i)).normalize()
    let r = 1
    if (l.shape === 'spiculated') {
      for (const s of spikes) {
        const ang = Math.acos(Math.max(-1, Math.min(1, v.dot(s.d))))
        r += s.h * Math.exp(-((ang / s.w) ** 2))
      }
      r += 0.03 * Math.sin(9 * v.x + 3) * Math.cos(7 * v.y - 1) * Math.sin(8 * v.z + 2)
    } else if (l.shape === 'illDefined') {
      r += 0.1 * Math.sin(4 * v.x + 1) * Math.cos(3 * v.y) + 0.06 * Math.sin(5 * v.z + 2) * Math.cos(4 * v.x)
    } else {
      r += 0.015 * Math.sin(6 * v.x) * Math.cos(5 * v.z)
    }
    pos.setXYZ(i, v.x * r, v.y * r, v.z * r)
  }
  pos.needsUpdate = true
  g.computeVertexNormals()
}

/** Só o que muda a geometria: descrições e observações não entram. */
const structuralKey = (m: MacroState) =>
  JSON.stringify([
    m.specimen.type,
    m.specimen.side,
    m.specimen.dims,
    [m.specimen.skin.present, m.specimen.skin.length, m.specimen.skin.width, m.specimen.skin.nipple, m.specimen.skin.nippleDiameter],
    m.inks,
    m.slicing,
    m.units,
    m.lesions.map((l) => [l.id, l.kind, l.shape, l.size, l.center, l.clip, l.cassettes]),
  ])

function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(id)
  }, [value, ms])
  return debounced
}

/* ---- Componente ------------------------------------------------------------ */

export type SnapshotView = 'anterior' | 'slicing' | 'superior'

export interface BreastModelHandle {
  snapshot: (view: SnapshotView, width: number, height: number) => string | null
}

interface BreastModelProps {
  map: MacroState
  theme: Theme
  mode: 'macro' | 'micro'
  cells?: Record<string, MicroCell>
  selectedLesion: string | null
  onSelectLesion: (id: string | null) => void
  selectedCassette?: string | null
  onSelectCassette?: (id: string | null) => void
  className?: string
}

interface SceneRefs {
  build: Build
  controls: OrbitControls
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  container: HTMLDivElement
}

const BreastModel = forwardRef<BreastModelHandle, BreastModelProps>(function BreastModel(
  { map, theme, mode, cells, selectedLesion, onSelectLesion, selectedCassette, onSelectCassette, className },
  ref,
) {
  const { t, i18n } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<SceneRefs | null>(null)
  const [failed, setFailed] = useState(false)
  const [hover, setHover] = useState<{ kind: 'lesion' | 'cassette'; id: string } | null>(null)
  const [translucent, setTranslucent] = useState(true)
  const mapRef = useRef(map)
  mapRef.current = map
  const selectLesionRef = useRef(onSelectLesion)
  selectLesionRef.current = onSelectLesion
  const selectCassetteRef = useRef(onSelectCassette)
  selectCassetteRef.current = onSelectCassette

  const key = useDebounced(structuralKey(map), 250)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    let renderer: THREE.WebGLRenderer
    try {
      renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true })
    } catch {
      setFailed(true)
      return
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.setClearColor(0x000000, 0)
    container.appendChild(renderer.domElement)
    renderer.domElement.style.display = 'block'
    renderer.domElement.style.touchAction = 'none'

    const scene = new THREE.Scene()
    const camera = new THREE.PerspectiveCamera(36, 1, 0.1, 100)
    camera.position.set(3.4, 2.8, 6.6)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.enablePan = false
    controls.minDistance = 3
    controls.maxDistance = 22
    controls.target.set(0, 0, 0)
    controls.saveState()

    scene.add(new THREE.HemisphereLight(0xffffff, theme === 'dark' ? 0x2a3444 : 0x8a94a6, 1.05))
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.3)
    keyLight.position.set(3, 5, 6)
    scene.add(keyLight)
    const fill = new THREE.DirectionalLight(0xffffff, 0.55)
    fill.position.set(-4, -2, -4)
    scene.add(fill)

    const build = buildScene(mapRef.current, theme, mode, (k, p) => t(k, p ?? {}), i18n.language)
    scene.add(build.shell)
    if (build.nipple) scene.add(build.nipple)
    for (const l of build.lesions) scene.add(l.mesh)
    for (const c of build.clips) scene.add(c)
    scene.add(build.lines)
    scene.add(build.distances)
    for (const tile of build.tiles) {
      scene.add(tile.mesh)
      scene.add(tile.edges)
    }
    for (const s of build.labels) scene.add(s)

    sceneRef.current = { build, controls, renderer, scene, camera, container }

    const resize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      if (!w || !h) return
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    const ray = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    const pickables: THREE.Object3D[] = [...build.lesions.map((l) => l.mesh), ...build.tiles.map((x) => x.mesh)]
    const pick = (ev: PointerEvent): { kind: 'lesion' | 'cassette'; id: string } | null => {
      const rect = renderer.domElement.getBoundingClientRect()
      ndc.set(((ev.clientX - rect.left) / rect.width) * 2 - 1, -((ev.clientY - rect.top) / rect.height) * 2 + 1)
      ray.setFromCamera(ndc, camera)
      const hits = ray.intersectObjects(pickables, false)
      // Na laudagem os ladrilhos ficam dentro da lesão translúcida: eles têm prioridade.
      const tile = hits.find((h) => (h.object.userData as { cassetteId?: string }).cassetteId)
      if (tile) return { kind: 'cassette', id: (tile.object.userData as { cassetteId: string }).cassetteId }
      const hit = hits[0]
      if (!hit) return null
      const id = (hit.object.userData as { lesionId?: string }).lesionId
      return id ? { kind: 'lesion', id } : null
    }
    let down: [number, number] | null = null
    const onDown = (ev: PointerEvent) => {
      down = [ev.clientX, ev.clientY]
    }
    const onUp = (ev: PointerEvent) => {
      if (!down) return
      const moved = Math.hypot(ev.clientX - down[0], ev.clientY - down[1])
      down = null
      if (moved > 5) return
      const p = pick(ev)
      if (!p) {
        selectLesionRef.current(null)
        selectCassetteRef.current?.(null)
      } else if (p.kind === 'lesion') selectLesionRef.current(p.id)
      else selectCassetteRef.current?.(p.id)
    }
    const onMove = (ev: PointerEvent) => setHover(pick(ev))
    const onLeave = () => setHover(null)
    renderer.domElement.addEventListener('pointerdown', onDown)
    renderer.domElement.addEventListener('pointerup', onUp)
    renderer.domElement.addEventListener('pointermove', onMove)
    renderer.domElement.addEventListener('pointerleave', onLeave)

    let frame = 0
    const loop = () => {
      controls.update()
      renderer.render(scene, camera)
      frame = requestAnimationFrame(loop)
    }
    loop()

    return () => {
      cancelAnimationFrame(frame)
      ro.disconnect()
      renderer.domElement.removeEventListener('pointerdown', onDown)
      renderer.domElement.removeEventListener('pointerup', onUp)
      renderer.domElement.removeEventListener('pointermove', onMove)
      renderer.domElement.removeEventListener('pointerleave', onLeave)
      controls.dispose()
      for (const d of build.disposables) d.dispose()
      renderer.forceContextLoss()
      renderer.dispose()
      renderer.domElement.remove()
      sceneRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, theme, mode, i18n.language])

  // Seleção, celularidade e translucidez: a cada mudança leve.
  useEffect(() => {
    const s = sceneRef.current
    if (!s) return
    const { build } = s
    for (const m of build.shellMaterials) {
      m.opacity = translucent ? (m.color.getHexString() === SKIN_HEX.slice(1) ? 0.55 : 0.42) : 1
      m.transparent = translucent
      m.depthWrite = !translucent
      m.needsUpdate = true
    }
    for (const l of build.lesions) {
      const sel = l.id === selectedLesion
      l.material.emissive.set(sel ? '#7c5cff' : '#000000')
      l.material.emissiveIntensity = sel ? 0.5 : 0
    }
    build.distances.children.forEach((g) => {
      const id = (g.userData as { lesionId?: string }).lesionId
      g.visible = selectedLesion === null ? build.distances.children.length === 1 || g === build.distances.children[0] : id === selectedLesion
    })
    for (const tile of build.tiles) {
      const ca = cells?.[tile.def.id]?.ca ?? null
      tile.material.color.set(caColor(ca, theme))
      const sel = tile.def.id === selectedCassette
      ;(tile.edges.material as THREE.LineBasicMaterial).color.set(sel ? '#7c5cff' : strokeColor(theme))
      ;(tile.edges.material as THREE.LineBasicMaterial).opacity = sel ? 1 : 0.9
    }
  }, [cells, selectedLesion, selectedCassette, theme, translucent, key])

  useImperativeHandle(ref, () => ({
    snapshot: (view, width, height) => {
      const s = sceneRef.current
      if (!s) return null
      const { renderer, scene, container, build } = s
      const cam = new THREE.PerspectiveCamera(30, width / height, 0.1, 100)
      const D = 12
      const m = mapRef.current
      if (view === 'anterior') {
        cam.up.set(0, 1, 0)
        cam.position.set(0, 0, D)
      } else if (view === 'superior') {
        cam.up.set(0, 0, -1)
        cam.position.set(0, D, 0)
      } else {
        const axis = m.slicing.axis
        const sign = MARGIN_SIGN[m.slicing.from]
        if (axis === 'ml') {
          cam.up.set(0, 1, 0)
          cam.position.set(build.flip * sign * D, 0, 0)
        } else if (axis === 'si') {
          cam.up.set(0, 0, -1)
          cam.position.set(0, sign * D, 0)
        } else {
          cam.up.set(0, 1, 0)
          cam.position.set(0, 0, sign * D)
        }
      }
      cam.lookAt(0, 0, 0)
      const prevW = container.clientWidth
      const prevH = container.clientHeight
      renderer.setSize(width, height, false)
      renderer.render(scene, cam)
      const url = renderer.domElement.toDataURL('image/png')
      renderer.setSize(prevW, prevH)
      renderer.render(scene, s.camera)
      return url
    },
  }))

  const hoverText = (() => {
    if (!hover) return null
    if (hover.kind === 'lesion') {
      const l = map.lesions.find((x) => x.id === hover.id)
      if (!l) return null
      const c = closestMargin(l, map.specimen.dims)
      return `${t('breast.map.lesionN', { n: l.label })} · ${[l.size.ml, l.size.si, l.size.ap].map((v) => fmtLen(v, map.units, i18n.language, false)).join(' × ')} ${map.units} · ${t(`breast.margin.${c.margin}`)} ${fmtLen(c.mm, map.units, i18n.language)}`
    }
    const def = planCassettes(map)
      .flatMap((p) => p.all)
      .find((d) => d.id === hover.id)
    if (!def) return null
    const cell = cells?.[def.id]
    return `${def.label} · ${t('breast.map.sliceN', { n: def.slice })}${cell?.ca !== null && cell?.ca !== undefined ? ` · %CA ${cell.ca}` : ''}`
  })()

  return (
    <div className={cn('relative', className)}>
      <div ref={containerRef} className="h-[460px] w-full overflow-hidden rounded-md border border-line bg-surface" />
      {failed && (
        <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-ink-muted">{t('breast.map.webgl')}</p>
      )}
      <div className="pointer-events-none absolute top-2 left-2 max-w-[70%] rounded-md border border-line bg-elevated/90 px-2.5 py-1.5 text-xs text-ink shadow-subtle backdrop-blur-sm">
        {hoverText ? <span className="tabular">{hoverText}</span> : <span className="text-ink-faint">{t('breast.map.hint3d')}</span>}
      </div>
      <div className="absolute top-2 right-2 flex gap-1">
        <Button type="button" size="sm" variant="ghost" onClick={() => setTranslucent((v) => !v)} title={t('breast.map.translucent')}>
          {translucent ? <Eye className="size-4" aria-hidden /> : <EyeOff className="size-4" aria-hidden />}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => sceneRef.current?.controls.reset()}>
          <RotateCcw className="size-4" aria-hidden />
          {t('breast.map.resetView')}
        </Button>
      </div>
      <div className="pointer-events-none absolute bottom-2 left-2 flex flex-wrap gap-x-3 gap-y-1 text-[0.65rem] text-ink-faint">
        {MARGINS.map((m) => (
          <span key={m} className="inline-flex items-center gap-1">
            <span className="inline-block size-2.5 rounded-full border border-line" style={{ background: INK_HEX[map.inks[m]] }} />
            {t(`breast.marginShort.${m}`)}
          </span>
        ))}
      </div>
    </div>
  )
})

export default BreastModel
