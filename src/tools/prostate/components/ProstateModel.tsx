/* ==========================================================================
   ProstateModel.tsx — modelo 3D procedural da próstata com mapa de calor.

   A glândula é uma "noz": mais larga na base do que no ápice, achatada no
   sentido ântero-posterior, com o sulco mediano posterior. Cada face é
   atribuída ao cassete que a cobre, segundo o mapeamento do usuário (lado,
   região, nível e ordem dos cassetes do ápice para a base); as bordas entre
   cassetes vizinhos viram linhas. Vesículas seminais e ductos deferentes
   aparecem atrás da base quando existem grupos desse tecido.

   Eixos: +y = anterior, −x = lado direito do paciente, +z = base.
   Carregado sob demanda (three.js só entra nesta página).
   ========================================================================== */

import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
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

const levelRange = (level: CassetteGroup['level']): [number, number] => {
  if (level === 'apex') return [-Z, -Z / 3]
  if (level === 'mid') return [-Z / 3, Z / 3]
  if (level === 'base') return [Z / 3, Z]
  return [-Z, Z]
}

interface GroupSlots {
  group: CassetteGroup
  cellIds: string[]
  z0: number
  z1: number
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
    .map((g) => {
      const [z0, z1] = levelRange(g.level)
      return {
        group: g,
        cellIds: cells.filter((c) => c.group?.id === g.id).sort((a, b) => a.indexInGroup - b.indexInGroup).map((c) => c.id),
        z0,
        z1,
        score: specificity(g),
      }
    })
    .filter((s) => s.cellIds.length > 0)

  const classify = (c: THREE.Vector3): string => {
    let best: GroupSlots | null = null
    for (const s of slots) {
      const g = s.group
      if (g.side === 'D' && c.x > 0) continue
      if (g.side === 'E' && c.x < 0) continue
      if (g.region === 'anterior' && c.y < 0) continue
      if (g.region === 'posterior' && c.y > 0) continue
      if (c.z < s.z0 || c.z > s.z1) continue
      if (!best || s.score > best.score) best = s
    }
    if (!best) return UNMAPPED
    const n = best.cellIds.length
    const k = Math.max(0, Math.min(n - 1, Math.floor(((c.z - best.z0) / (best.z1 - best.z0)) * n)))
    return best.cellIds[k]
  }

  const sphere = new THREE.SphereGeometry(1, 160, 110).toNonIndexed()
  const pos = sphere.getAttribute('position') as THREE.BufferAttribute
  const buckets = new Map<string, number[]>()
  const sums = new Map<string, { v: THREE.Vector3; n: number }>()
  const edgeOwners = new Map<string, Set<string>>()
  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  const c = new THREE.Vector3()
  const key = (p: THREE.Vector3) => `${p.x.toFixed(4)},${p.y.toFixed(4)},${p.z.toFixed(4)}`
  const edgeKey = (p: THREE.Vector3, q: THREE.Vector3) => {
    const kp = key(p)
    const kq = key(q)
    return kp < kq ? `${kp}|${kq}` : `${kq}|${kp}`
  }
  const edgePoints = new Map<string, [THREE.Vector3, THREE.Vector3]>()

  for (let i = 0; i < pos.count; i += 3) {
    const pa = toSurface(a.fromBufferAttribute(pos, i))
    const pb = toSurface(b.fromBufferAttribute(pos, i + 1))
    const pc = toSurface(c.fromBufferAttribute(pos, i + 2))
    const centroid = new THREE.Vector3().addVectors(pa, pb).add(pc).multiplyScalar(1 / 3)
    const id = classify(centroid)
    let list = buckets.get(id)
    if (!list) buckets.set(id, (list = []))
    list.push(pa.x, pa.y, pa.z, pb.x, pb.y, pb.z, pc.x, pc.y, pc.z)
    const s = sums.get(id) ?? { v: new THREE.Vector3(), n: 0 }
    s.v.add(centroid)
    s.n++
    sums.set(id, s)
    for (const [p, q] of [
      [pa, pb],
      [pb, pc],
      [pc, pa],
    ] as [THREE.Vector3, THREE.Vector3][]) {
      const ek = edgeKey(p, q)
      let owners = edgeOwners.get(ek)
      if (!owners) {
        edgeOwners.set(ek, (owners = new Set()))
        edgePoints.set(ek, [p.clone(), q.clone()])
      }
      owners.add(id)
    }
  }
  sphere.dispose()

  const cellIds: string[] = []
  const positions: number[] = []
  const geometry = new THREE.BufferGeometry()
  for (const [id, list] of buckets) {
    const start = positions.length / 3
    positions.push(...list)
    geometry.addGroup(start, list.length / 3, cellIds.length)
    cellIds.push(id)
  }
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3))
  geometry.computeVertexNormals()

  const centroids = new Map<string, THREE.Vector3>()
  for (const [id, s] of sums) centroids.set(id, s.v.multiplyScalar(1 / s.n).multiplyScalar(1.03))

  // Linhas onde dois cassetes diferentes se encontram.
  const seg: number[] = []
  for (const [ek, owners] of edgeOwners) {
    if (owners.size < 2) continue
    const [p, q] = edgePoints.get(ek)!
    const ps = p.clone().multiplyScalar(1.006)
    const qs = q.clone().multiplyScalar(1.006)
    seg.push(ps.x, ps.y, ps.z, qs.x, qs.y, qs.z)
  }
  const lines = new THREE.BufferGeometry()
  lines.setAttribute('position', new THREE.Float32BufferAttribute(seg, 3))

  return { geometry, cellIds, lines, centroids }
}

function textSprite(text: string, color: string): THREE.Sprite {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 64
  const ctx = canvas.getContext('2d')!
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
  const sx = side === 'D' ? -1 : 1
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
function groupHeat(cells: CellResult[]): { dominant: CellResult['dominant']; tumor: number } {
  if (!cells.length) return { dominant: null, tumor: 0 }
  const top = cells.reduce((m, c) => (c.tumor > m.tumor ? c : m), cells[0])
  return { dominant: top.dominant, tumor: cells.reduce((s, c) => s + c.tumor, 0) / cells.length }
}

interface ProstateModelProps {
  mapping: MappingConfig
  analysis: Analysis
  theme: Theme
  selected: string | null
  onSelect: (id: string | null) => void
}

interface SceneRefs {
  materials: Map<string, THREE.MeshStandardMaterial>
  centroids: Map<string, THREE.Vector3>
  markers: THREE.Group
  controls: OrbitControls
  attachments: { mesh: THREE.Mesh; groupId: string; side: Side }[]
}

export default function ProstateModel({ mapping, analysis, theme, selected, onSelect }: ProstateModelProps) {
  const { t, i18n } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<SceneRefs | null>(null)
  const [failed, setFailed] = useState(false)
  const [hover, setHover] = useState<string | null>(null)
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  // A cena depende só do mapeamento (não dos achados).
  const mappingKey = JSON.stringify(mapping)

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
    const camera = new THREE.PerspectiveCamera(38, 1, 0.1, 100)
    // Vista inicial: face posterior (zona periférica), lado direito e base à frente.
    camera.position.set(-4.6, -3.4, 6.2)
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

    const build = buildGland(mapping)
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

    // Anexos: um por (tecido, lado) presente no mapeamento; lado B cria os dois.
    const attachments: SceneRefs['attachments'] = []
    const pickables: THREE.Object3D[] = [gland]
    for (const g of mapping.groups) {
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
      [t('prostate.side.D'), new THREE.Vector3(-(X + 0.7), 0, 0)],
      [t('prostate.side.E'), new THREE.Vector3(X + 0.7, 0, 0)],
      [t('prostate.level.apex'), new THREE.Vector3(0, 0, -Z - 0.6)],
      [t('prostate.level.base'), new THREE.Vector3(0, 0.3, Z + 0.6)],
    ]
    for (const [text, p] of labels) {
      const s = textSprite(text, ink)
      s.position.copy(p)
      scene.add(s)
    }

    sceneRef.current = { materials, centroids: build.centroids, markers, controls, attachments }

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
    const pick = (ev: PointerEvent): string | null => {
      const rect = renderer.domElement.getBoundingClientRect()
      ndc.set(((ev.clientX - rect.left) / rect.width) * 2 - 1, -((ev.clientY - rect.top) / rect.height) * 2 + 1)
      ray.setFromCamera(ndc, camera)
      const hit = ray.intersectObjects(pickables, false)[0]
      if (!hit) return null
      if (hit.object !== gland) {
        const groupId = (hit.object.userData as { groupId?: string }).groupId
        const first = groupId ? buildCells(mapping).cells.find((c) => c.group?.id === groupId) : undefined
        return first?.id ?? null
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
      mat.color.set(r ? cellColor(r.dominant, r.tumor, theme) : cellColor(null, 0, theme))
      const isSel = id === selected
      mat.emissive.set(isSel ? '#7c5cff' : '#000000')
      mat.emissiveIntensity = isSel ? 0.45 : 0
    }
    for (const att of s.attachments) {
      const cells = analysis.cells.filter((c) => c.cell.group?.id === att.groupId)
      const heat = groupHeat(cells)
      const mat = att.mesh.material as THREE.MeshStandardMaterial
      mat.color.set(cellColor(heat.dominant, heat.tumor, theme))
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

  const hovered = hover ? analysis.cells.find((c) => c.cell.id === hover) : null

  return (
    <div className="relative">
      <div ref={containerRef} className="h-[420px] w-full overflow-hidden rounded-md border border-line bg-surface" />
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
}
