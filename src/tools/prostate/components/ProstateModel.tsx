/* ==========================================================================
   ProstateModel.tsx — modelo 3D procedural da próstata com mapa de calor.

   A glândula é uma "noz": mais larga na base do que no ápice, achatada no
   sentido ântero-posterior, com o sulco mediano posterior. Cada face é
   atribuída ao cassete que a cobre, segundo o mapeamento do usuário (lado,
   região, sentido e ordem dos cassetes); as bordas entre cassetes vizinhos
   viram linhas. Vesículas seminais e ductos deferentes aparecem atrás da
   base quando existem grupos desse tecido.

   Eixos: +y = anterior, +x = lado direito do paciente, +z = base (quadro
   anatômico destro: visto de frente, a direita do paciente fica à esquerda
   de quem olha; visto por trás, à direita).
   Carregado sob demanda (three.js só entra nesta página).
   ========================================================================== */

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import type { Analysis, CellResult } from '../analysis'
import { cellColor, EPE_HEX, MARGIN_HEX, strokeColor, type Theme } from '../heat'
import { buildCells, specificity } from '../mapping'
import { cellName, fmtN, gleasonText } from '../format'
import type { CassetteGroup, MappingConfig, Side } from '../types'

const X = 2.0 // meia-largura (D–E)
const Y = 1.45 // meia-altura (anterior–posterior)
const Z = 2.2 // meio-comprimento (ápice–base)
const UNMAPPED = '__unmapped'
const taper = (z: number) => 1 + 0.16 * (z / Z)

/** Ponto da esfera unitária → superfície da glândula. */
function toSurface(v: THREE.Vector3): THREE.Vector3 {
  const z = v.z * Z
  const f = taper(z)
  const x = v.x * X * f
  let y: number
  if (v.y < 0) {
    // Face posterior mais plana, com o sulco mediano.
    const groove = 0.12 * Math.exp(-((v.x / 0.28) ** 2)) * (1 - v.z * v.z)
    y = v.y * Y * 0.78 * f + groove
  } else {
    y = v.y * Y * f
  }
  return new THREE.Vector3(x, y, z)
}

/** Os cones de ápice e base são só as pontinhas: ~9 % do comprimento cada. */
const CONE = 0.18 * Z

/** Faixa de z do grupo e se os cassetes correm do ápice para a base. */
const spanRange = (span: CassetteGroup['span']): { z0: number; z1: number; reversed: boolean } => {
  if (span === 'apexOnly') return { z0: -Z, z1: -Z + CONE, reversed: false }
  if (span === 'baseOnly') return { z0: Z - CONE, z1: Z, reversed: false }
  return { z0: -Z, z1: Z, reversed: span === 'baseToApex' }
}

interface GroupSlots {
  group: CassetteGroup
  cellIds: string[]
  z0: number
  z1: number
  reversed: boolean
  score: number
}

interface ModelBuild {
  geometry: THREE.BufferGeometry
  cellIds: string[]
  lines: THREE.BufferGeometry
  centroids: Map<string, THREE.Vector3>
}

function buildGland(mapping: MappingConfig): ModelBuild {
  const { cells } = buildCells(mapping)
  const slots: GroupSlots[] = mapping.groups
    .filter((g) => g.tissue === 'prostate')
    .map((g) => ({
      group: g,
      cellIds: cells.filter((c) => c.group?.id === g.id).sort((a, b) => a.indexInGroup - b.indexInGroup).map((c) => c.id),
      ...spanRange(g.span),
      score: specificity(g),
    }))
    .filter((s) => s.cellIds.length > 0)

  const classify = (c: THREE.Vector3): string => {
    let best: GroupSlots | null = null
    for (const s of slots) {
      const g = s.group
      if (g.side === 'D' && c.x < 0) continue
      if (g.side === 'E' && c.x > 0) continue
      if (g.region === 'anterior' && c.y < 0) continue
      if (g.region === 'posterior' && c.y > 0) continue
      if (c.z < s.z0 || c.z > s.z1) continue
      if (!best || s.score > best.score) best = s
    }
    if (!best) return UNMAPPED
    const n = best.cellIds.length
    let k = Math.max(0, Math.min(n - 1, Math.floor(((c.z - best.z0) / (best.z1 - best.z0)) * n)))
    if (best.reversed) k = n - 1 - k
    return best.cellIds[k]
  }

  // Malha própria (latitude × longitude) com um anel em cada corte entre
  // cassetes e meridianos exatos em 0°/90°/180°/270°: nenhuma face cruza uma
  // divisória, então a cor termina rente à linha, sem escadinha.
  const latSet = new Set<number>()
  const LAT_STEPS = 72
  for (let k = 0; k <= LAT_STEPS; k++) latSet.add(Number((-1 + (2 * k) / LAT_STEPS).toFixed(6)))
  for (const s of slots) {
    const n = s.cellIds.length
    for (let k = 0; k <= n; k++) {
      const z = s.z0 + ((s.z1 - s.z0) * k) / n
      latSet.add(Number(Math.max(-1, Math.min(1, z / Z)).toFixed(6)))
    }
  }
  const lats = [...latSet].sort((p, q) => p - q)
  const LON_STEPS = 128
  const unit = (sz: number, j: number) => {
    const r = Math.sqrt(Math.max(0, 1 - sz * sz))
    const th = (j / LON_STEPS) * Math.PI * 2
    return new THREE.Vector3(Math.sin(th) * r, Math.cos(th) * r, sz)
  }

  const buckets = new Map<string, number[]>()
  const sums = new Map<string, { v: THREE.Vector3; n: number }>()
  const addTriangle = (ua: THREE.Vector3, ub: THREE.Vector3, uc: THREE.Vector3) => {
    const pa = toSurface(ua)
    const pb = toSurface(ub)
    const pc = toSurface(uc)
    if (pa.distanceToSquared(pb) < 1e-10 || pb.distanceToSquared(pc) < 1e-10 || pc.distanceToSquared(pa) < 1e-10) return
    const centroid = new THREE.Vector3().addVectors(pa, pb).add(pc).multiplyScalar(1 / 3)
    const id = classify(centroid)
    let list = buckets.get(id)
    if (!list) buckets.set(id, (list = []))
    list.push(pa.x, pa.y, pa.z, pb.x, pb.y, pb.z, pc.x, pc.y, pc.z)
    const s = sums.get(id) ?? { v: new THREE.Vector3(), n: 0 }
    s.v.add(centroid)
    s.n++
    sums.set(id, s)
  }
  for (let i = 0; i < lats.length - 1; i++) {
    for (let j = 0; j < LON_STEPS; j++) {
      const p00 = unit(lats[i], j)
      const p01 = unit(lats[i], j + 1)
      const p10 = unit(lats[i + 1], j)
      const p11 = unit(lats[i + 1], j + 1)
      // Sentido anti-horário visto de fora (faces frontais para fora): com
      // +x = direita do paciente, a ordem é latitude primeiro, depois longitude.
      addTriangle(p00, p10, p11)
      addTriangle(p00, p11, p01)
    }
  }

  // Concatena os grupos num único buffer. Sem spread: uma célula grande tem
  // centenas de milhares de números e `push(...list)` estoura a pilha.
  const cellIds: string[] = []
  let total = 0
  for (const list of buckets.values()) total += list.length
  const positions = new Float32Array(total)
  const geometry = new THREE.BufferGeometry()
  let offset = 0
  for (const [id, list] of buckets) {
    positions.set(list, offset)
    geometry.addGroup(offset / 3, list.length / 3, cellIds.length)
    cellIds.push(id)
    offset += list.length
  }
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3))
  // Normais analíticas do elipsoide (gradiente de x²/a² + y²/b² + z²/c²):
  // sombreamento liso, sem as faixas que as normais por face deixariam.
  const normals = new Float32Array(total)
  const nv = new THREE.Vector3()
  for (let i = 0; i < total; i += 3) {
    const z = positions[i + 2]
    const f = taper(z)
    const ax = X * f
    const ay = positions[i + 1] < 0 ? Y * 0.78 * f : Y * f
    nv.set(positions[i] / (ax * ax), positions[i + 1] / (ay * ay), z / (Z * Z)).normalize()
    normals[i] = nv.x
    normals[i + 1] = nv.y
    normals[i + 2] = nv.z
  }
  geometry.setAttribute('normal', new THREE.BufferAttribute(normals, 3))

  const centroids = new Map<string, THREE.Vector3>()
  for (const [id, s] of sums) centroids.set(id, s.v.multiplyScalar(1 / s.n).multiplyScalar(1.03))

  return { geometry, cellIds, lines: buildLines(slots), centroids }
}

/**
 * Divisórias como curvas calculadas na superfície (e não como arestas dos
 * triângulos, que ondulam): anéis nos cortes entre cassetes de cada grupo,
 * limitados ao setor do grupo, mais o meridiano D/E e o equador
 * anterior/posterior quando algum grupo os usa.
 */
function buildLines(slots: GroupSlots[]): THREE.BufferGeometry {
  const seg: number[] = []
  const LIFT = 1.006
  const push = (p: THREE.Vector3, q: THREE.Vector3) =>
    seg.push(p.x * LIFT, p.y * LIFT, p.z * LIFT, q.x * LIFT, q.y * LIFT, q.z * LIFT)
  const polyline = (points: (THREE.Vector3 | null)[]) => {
    for (let i = 1; i < points.length; i++) {
      const p = points[i - 1]
      const q = points[i]
      if (p && q) push(p, q)
    }
  }

  // Anel em z, restrito ao setor (lado × região) do grupo.
  const ring = (z: number, g: CassetteGroup) => {
    const sz = Math.max(-1, Math.min(1, z / Z))
    const r = Math.sqrt(Math.max(0, 1 - sz * sz))
    if (r < 1e-3) return
    const pts: (THREE.Vector3 | null)[] = []
    const STEPS = 144
    for (let k = 0; k <= STEPS; k++) {
      const th = (k / STEPS) * Math.PI * 2
      const sx = Math.sin(th) * r
      const sy = Math.cos(th) * r
      const inside =
        (g.side === 'D' ? sx >= -1e-6 : g.side === 'E' ? sx <= 1e-6 : true) &&
        (g.region === 'anterior' ? sy >= -1e-6 : g.region === 'posterior' ? sy <= 1e-6 : true)
      pts.push(inside ? toSurface(new THREE.Vector3(sx, sy, sz)) : null)
    }
    polyline(pts)
  }

  const zCuts = new Set<string>()
  for (const s of slots) {
    const n = s.cellIds.length
    for (let k = 1; k < n; k++) ring(s.z0 + ((s.z1 - s.z0) * k) / n, s.group)
    // Limites de cones (ápice/base) também são cortes visíveis.
    for (const z of [s.z0, s.z1]) {
      if (Math.abs(Math.abs(z) - Z) < 1e-6) continue
      const key = z.toFixed(4)
      if (zCuts.has(key)) continue
      zCuts.add(key)
      ring(z, { ...s.group, side: 'B', region: 'whole' })
    }
  }

  const STEPS_Z = 80
  const alongZ = (fn: (sz: number, r: number) => THREE.Vector3) => {
    const pts: THREE.Vector3[] = []
    for (let k = 0; k <= STEPS_Z; k++) {
      const sz = -1 + (2 * k) / STEPS_Z
      const r = Math.sqrt(Math.max(0, 1 - sz * sz))
      pts.push(fn(sz, r))
    }
    polyline(pts)
  }
  if (slots.some((s) => s.group.side !== 'B')) {
    // Meridiano D/E: linha média anterior e posterior.
    alongZ((sz, r) => toSurface(new THREE.Vector3(0, r, sz)))
    alongZ((sz, r) => toSurface(new THREE.Vector3(0, -r, sz)))
  }
  if (slots.some((s) => s.group.region !== 'whole')) {
    // Equador anterior/posterior: linhas laterais direita e esquerda.
    alongZ((sz, r) => toSurface(new THREE.Vector3(-r, 0, sz)))
    alongZ((sz, r) => toSurface(new THREE.Vector3(r, 0, sz)))
  }

  const lines = new THREE.BufferGeometry()
  lines.setAttribute('position', new THREE.BufferAttribute(Float32Array.from(seg), 3))
  return lines
}

function textSprite(text: string, color: string): THREE.Sprite | null {
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
  sprite.scale.set(1.6, 0.4, 1)
  return sprite
}

/** Anexos posteriores à base: vesículas seminais e ductos deferentes, por lado. */
function attachmentMesh(tissue: 'seminalVesicle' | 'vasDeferens', side: 'D' | 'E'): THREE.Mesh {
  const sx = side === 'D' ? 1 : -1
  const isSv = tissue === 'seminalVesicle'
  const geometry = isSv ? new THREE.CapsuleGeometry(0.3, 1.3, 6, 16) : new THREE.CylinderGeometry(0.08, 0.08, 1.7, 12)
  const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ roughness: 0.7, metalness: 0 }))
  const dir = isSv ? new THREE.Vector3(sx * 0.5, -0.35, 1) : new THREE.Vector3(sx * 0.12, -0.25, 1)
  dir.normalize()
  const origin = isSv ? new THREE.Vector3(sx * 0.6, -0.75, Z - 0.35) : new THREE.Vector3(sx * 0.28, -0.6, Z - 0.2)
  mesh.position.copy(origin).addScaledVector(dir, isSv ? 0.85 : 0.9)
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), dir)
  return mesh
}

/** Cor de um grupo não prostático: célula com mais tumor dita o padrão. */
function groupHeat(cells: CellResult[]): { worst: CellResult['worst']; tumor: number } {
  if (!cells.length) return { worst: null, tumor: 0 }
  const worst = cells.reduce<CellResult['worst']>((m, c) => (c.worst && (!m || c.worst > m) ? c.worst : m), null)
  return { worst, tumor: cells.reduce((s, c) => s + c.tumor, 0) / cells.length }
}

/** Só o que muda a geometria: nomes de grupo, por exemplo, não entram. */
const structuralKey = (m: MappingConfig) =>
  JSON.stringify([m.total, m.groups.map((g) => [g.id, g.range, g.side, g.region, g.span, g.tissue])])

/** Valor atrasado: digitar uma faixa não reconstrói o modelo a cada tecla. */
function useDebounced<T>(value: T, ms: number): T {
  const [debounced, setDebounced] = useState(value)
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), ms)
    return () => clearTimeout(id)
  }, [value, ms])
  return debounced
}

interface ProstateModelProps {
  mapping: MappingConfig
  analysis: Analysis
  theme: Theme
  selected: string | null
  onSelect: (id: string | null) => void
  /** Altura da tela do modelo. A página inicial pede uma menor que a da ferramenta. */
  heightClass?: string
}

interface SceneRefs {
  materials: Map<string, THREE.MeshStandardMaterial>
  centroids: Map<string, THREE.Vector3>
  markers: THREE.Group
  controls: OrbitControls
  attachments: { mesh: THREE.Mesh; groupId: string; side: Side }[]
  renderer: THREE.WebGLRenderer
  scene: THREE.Scene
  camera: THREE.PerspectiveCamera
  container: HTMLDivElement
  anteriorLabel: THREE.Sprite | null
}

export type SnapshotView = 'anterior' | 'posterior'

export interface ProstateModelHandle {
  /** Renderiza a peça de uma vista fixa e devolve um PNG (data URL). */
  snapshot: (view: SnapshotView, width: number, height: number) => string | null
}

const ProstateModel = forwardRef<ProstateModelHandle, ProstateModelProps>(function ProstateModel(
  { mapping, analysis, theme, selected, onSelect, heightClass = 'h-[420px]' },
  ref,
) {
  const { t, i18n } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<SceneRefs | null>(null)
  const [failed, setFailed] = useState(false)
  const [hover, setHover] = useState<string | null>(null)
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect
  const mappingRef = useRef(mapping)
  mappingRef.current = mapping

  const mappingKey = useDebounced(structuralKey(mapping), 300)

  useEffect(() => {
    const container = containerRef.current
    if (!container) return
    const built = mappingRef.current
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
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    // Vista inicial: face posterior (zona periférica), lado direito e base à frente.
    camera.position.set(4.6, -3.4, 6.2)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.enablePan = false
    controls.minDistance = 4
    controls.maxDistance = 18
    controls.target.set(0, -0.2, 0.6)
    controls.saveState()

    scene.add(new THREE.HemisphereLight(0xffffff, theme === 'dark' ? 0x2a3444 : 0x8a94a6, 1.1))
    const keyLight = new THREE.DirectionalLight(0xffffff, 1.4)
    keyLight.position.set(3, 5, 4)
    scene.add(keyLight)
    const fill = new THREE.DirectionalLight(0xffffff, 0.6)
    fill.position.set(-4, -3, -3)
    scene.add(fill)

    const build = buildGland(built)
    const materials = new Map<string, THREE.MeshStandardMaterial>()
    const matList = build.cellIds.map((id) => {
      const m = new THREE.MeshStandardMaterial({ color: cellColor(null, 0, theme), roughness: 0.7, metalness: 0 })
      materials.set(id, m)
      return m
    })
    const gland = new THREE.Mesh(build.geometry, matList)
    scene.add(gland)
    const lineMat = new THREE.LineBasicMaterial({ color: strokeColor(theme), transparent: true, opacity: 0.9 })
    scene.add(new THREE.LineSegments(build.lines, lineMat))
    const markers = new THREE.Group()
    scene.add(markers)

    const attachments: SceneRefs['attachments'] = []
    const pickables: THREE.Object3D[] = [gland]
    for (const g of built.groups) {
      if (g.tissue !== 'seminalVesicle' && g.tissue !== 'vasDeferens') continue
      const sides: ('D' | 'E')[] = g.side === 'B' ? ['D', 'E'] : [g.side]
      for (const side of sides) {
        const mesh = attachmentMesh(g.tissue, side)
        mesh.userData = { groupId: g.id }
        scene.add(mesh)
        pickables.push(mesh)
        attachments.push({ mesh, groupId: g.id, side })
      }
    }

    const ink = theme === 'dark' ? '#e6eaf0' : '#151a22'
    const labels: [string, THREE.Vector3][] = [
      [t('prostate.map.anterior'), new THREE.Vector3(0, Y + 0.55, 0)],
      [t('prostate.side.D'), new THREE.Vector3(X + 0.7, 0, 0)],
      [t('prostate.side.E'), new THREE.Vector3(-(X + 0.7), 0, 0)],
      [t('prostate.map.apex'), new THREE.Vector3(0, 0, -Z - 0.6)],
      [t('prostate.map.base'), new THREE.Vector3(0, 0.3, Z + 0.6)],
    ]
    let anteriorLabel: THREE.Sprite | null = null
    for (const [text, p] of labels) {
      const s = textSprite(text, ink)
      if (!s) continue
      s.position.copy(p)
      scene.add(s)
      if (text === t('prostate.map.anterior')) anteriorLabel = s
    }

    sceneRef.current = { materials, centroids: build.centroids, markers, controls, attachments, renderer, scene, camera, container, anteriorLabel }

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
    const firstCellOf = new Map<string, string>()
    for (const cell of buildCells(built).cells) if (cell.group && !firstCellOf.has(cell.group.id)) firstCellOf.set(cell.group.id, cell.id)
    const pick = (ev: PointerEvent): string | null => {
      const rect = renderer.domElement.getBoundingClientRect()
      ndc.set(((ev.clientX - rect.left) / rect.width) * 2 - 1, -((ev.clientY - rect.top) / rect.height) * 2 + 1)
      ray.setFromCamera(ndc, camera)
      const hit = ray.intersectObjects(pickables, false)[0]
      if (!hit) return null
      if (hit.object !== gland) {
        const groupId = (hit.object.userData as { groupId?: string }).groupId
        return (groupId && firstCellOf.get(groupId)) ?? null
      }
      if (hit.faceIndex === undefined || hit.faceIndex === null) return null
      const vertex = hit.faceIndex * 3
      const group = build.geometry.groups.find((gr) => vertex >= gr.start && vertex < gr.start + gr.count)
      const id = group ? build.cellIds[group.materialIndex ?? 0] : null
      return id === UNMAPPED ? null : id
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
      onSelectRef.current(pick(ev))
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
      build.geometry.dispose()
      build.lines.dispose()
      lineMat.dispose()
      matList.forEach((m) => m.dispose())
      attachments.forEach(({ mesh }) => {
        mesh.geometry.dispose()
        ;(mesh.material as THREE.Material).dispose()
      })
      scene.traverse((o) => {
        if (o instanceof THREE.Sprite) {
          o.material.map?.dispose()
          o.material.dispose()
        }
      })
      // Libera o contexto WebGL de imediato: reconstruções seguidas não acumulam contextos.
      renderer.forceContextLoss()
      renderer.dispose()
      renderer.domElement.remove()
      sceneRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mappingKey, theme, i18n.language])

  // Cores, seleção e marcadores: a cada mudança nos achados.
  useEffect(() => {
    const s = sceneRef.current
    if (!s) return
    const byId = new Map(analysis.cells.map((c) => [c.cell.id, c]))
    for (const [id, mat] of s.materials) {
      const r = byId.get(id)
      mat.color.set(r ? cellColor(r.worst, r.tumor, theme) : cellColor(null, 0, theme))
      const isSel = id === selected
      mat.emissive.set(isSel ? '#7c5cff' : '#000000')
      mat.emissiveIntensity = isSel ? 0.45 : 0
    }
    for (const att of s.attachments) {
      const cells = analysis.cells.filter((c) => c.cell.group?.id === att.groupId)
      const heat = groupHeat(cells)
      const mat = att.mesh.material as THREE.MeshStandardMaterial
      mat.color.set(cellColor(heat.worst, heat.tumor, theme))
      const isSel = cells.some((c) => c.cell.id === selected)
      mat.emissive.set(isSel ? '#7c5cff' : '#000000')
      mat.emissiveIntensity = isSel ? 0.45 : 0
    }
    s.markers.clear()
    for (const r of analysis.cells) {
      const p = s.centroids.get(r.cell.id)
      if (!p) continue
      if (r.data.margin) {
        const m = new THREE.Mesh(new THREE.SphereGeometry(0.11, 16, 12), new THREE.MeshBasicMaterial({ color: MARGIN_HEX }))
        m.position.copy(p)
        s.markers.add(m)
      }
      if (r.data.epe !== 'none') {
        const m = new THREE.Mesh(new THREE.TorusGeometry(0.17, 0.03, 8, 24), new THREE.MeshBasicMaterial({ color: EPE_HEX }))
        m.position.copy(p)
        m.lookAt(p.clone().multiplyScalar(2))
        s.markers.add(m)
      }
    }
  }, [analysis, selected, theme, mappingKey])

  useImperativeHandle(ref, () => ({
    snapshot: (view, width, height) => {
      const s = sceneRef.current
      if (!s) return null
      const { renderer, scene, container } = s
      const cam = new THREE.PerspectiveCamera(30, width / height, 0.1, 100)
      // Base para cima; de frente (anterior) a direita do paciente fica à esquerda
      // de quem olha, por trás (posterior) fica à direita — como na bancada.
      cam.up.set(0, 0, 1)
      cam.position.set(0, view === 'anterior' ? 11 : -11, 0.4)
      cam.lookAt(0, 0, 0.3)
      const prevW = container.clientWidth
      const prevH = container.clientHeight
      // O rótulo "Anterior" só faz sentido quando essa face está de frente.
      if (s.anteriorLabel) s.anteriorLabel.visible = view === 'anterior'
      renderer.setSize(width, height, false)
      renderer.render(scene, cam)
      const url = renderer.domElement.toDataURL('image/png')
      if (s.anteriorLabel) s.anteriorLabel.visible = true
      renderer.setSize(prevW, prevH)
      renderer.render(scene, s.camera)
      return url
    },
  }))

  const hovered = hover ? analysis.cells.find((c) => c.cell.id === hover) : null

  return (
    <div className="relative">
      <div ref={containerRef} className={cn(heightClass, 'w-full overflow-hidden rounded-md border border-line bg-surface')} />
      {failed && (
        <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-ink-muted">
          {t('prostate.map.webgl')}
        </p>
      )}
      <div className="pointer-events-none absolute top-2 left-2 rounded-md border border-line bg-elevated/90 px-2.5 py-1.5 text-xs text-ink shadow-subtle backdrop-blur-sm">
        {hovered ? (
          <>
            <span className="font-medium">{cellName(hovered.cell, t)}</span>
            <span className="tabular ml-2 text-ink-muted">
              {fmtN(hovered.tumor, 0, i18n.language)}%{hovered.gleason ? ` · ${gleasonText(hovered.gleason)}` : ''}
            </span>
          </>
        ) : (
          <span className="text-ink-faint">{t('prostate.map.hint3d')}</span>
        )}
      </div>
      <Button type="button" size="sm" variant="ghost" className="absolute top-2 right-2" onClick={() => sceneRef.current?.controls.reset()}>
        <RotateCcw className="size-4" aria-hidden />
        {t('prostate.map.resetView')}
      </Button>
    </div>
  )
})

export default ProstateModel
