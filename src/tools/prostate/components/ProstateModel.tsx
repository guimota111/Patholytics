/* ==========================================================================
   ProstateModel.tsx — modelo 3D procedural da próstata com mapa de calor.

   Um elipsoide levemente cônico (base mais larga que o ápice) é recortado
   em células que coincidem com a grade de cassetes: cones de ápice e base
   em faixas parassagitais, fatias transversais em setores angulares. Cada
   célula é um grupo de faces com o seu próprio material, colorido pelo
   padrão de Gleason predominante e pelo % de tumor.

   Eixos: +y = anterior, −x = lado direito do paciente, +z = base.
   Carregado sob demanda (three.js só entra nesta página).
   ========================================================================== */

import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { Analysis } from '../analysis'
import { cellColor, EPE_HEX, MARGIN_HEX, strokeColor, type Theme } from '../heat'
import { cellName, fmtN, gleasonText } from '../format'
import { cellId, sectorsOf } from '../grid'
import type { GridConfig } from '../types'

const X = 2.0 // meia-largura (D–E)
const Y = 1.5 // meia-altura (anterior–posterior)
const Z = 2.2 // meio-comprimento (ápice–base)
const CONE = 0.6
const taper = (z: number) => 1 + 0.16 * (z / Z)

interface ModelBuild {
  geometry: THREE.BufferGeometry
  cellIds: string[]
  lines: THREE.BufferGeometry
  centroids: Map<string, THREE.Vector3>
}

function toSurface(v: THREE.Vector3): THREE.Vector3 {
  const z = v.z * Z
  const f = taper(z)
  return new THREE.Vector3(v.x * X * f, v.y * Y * f, z)
}

function buildModel(grid: GridConfig): ModelBuild {
  const apexLen = grid.apexCassettes > 0 ? CONE : 0
  const baseLen = grid.baseCassettes > 0 ? CONE : 0
  const zA = -Z + apexLen
  const zB = Z - baseLen
  const sliceLen = (zB - zA) / grid.slices
  const sectors = sectorsOf(grid.sectors)

  const classify = (c: THREE.Vector3): string => {
    if (grid.apexCassettes > 0 && c.z < zA) {
      const xn = c.x / (X * taper(c.z))
      const i = Math.max(0, Math.min(grid.apexCassettes - 1, Math.floor(((xn + 1) / 2) * grid.apexCassettes)))
      return cellId.apex(i)
    }
    if (grid.baseCassettes > 0 && c.z > zB) {
      const xn = c.x / (X * taper(c.z))
      const i = Math.max(0, Math.min(grid.baseCassettes - 1, Math.floor(((xn + 1) / 2) * grid.baseCassettes)))
      return cellId.base(i)
    }
    const s = Math.max(1, Math.min(grid.slices, Math.floor((c.z - zA) / sliceLen) + 1))
    let theta = (Math.atan2(-c.x, c.y) * 180) / Math.PI
    if (theta >= 180) theta = -180
    const sector = sectors.find((d) => theta >= d.start && theta < d.end) ?? sectors[sectors.length - 1]
    return cellId.slice(s, sector.id)
  }

  const sphere = new THREE.SphereGeometry(1, 144, 96).toNonIndexed()
  const pos = sphere.getAttribute('position') as THREE.BufferAttribute
  const buckets = new Map<string, number[]>()
  const sums = new Map<string, { v: THREE.Vector3; n: number }>()
  const a = new THREE.Vector3()
  const b = new THREE.Vector3()
  const c = new THREE.Vector3()
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

  // Linhas de corte: anéis entre fatias, meridianos entre setores, faixas dos cones.
  const seg: number[] = []
  const push = (p: THREE.Vector3, q: THREE.Vector3) => seg.push(p.x, p.y, p.z, q.x, q.y, q.z)
  const ringAt = (z: number) => {
    const zn = z / Z
    const r = Math.sqrt(Math.max(0, 1 - zn * zn)) * 1.006
    const pts: THREE.Vector3[] = []
    for (let k = 0; k <= 96; k++) {
      const th = (k / 96) * Math.PI * 2
      pts.push(toSurface(new THREE.Vector3(-Math.sin(th) * r, Math.cos(th) * r, zn)))
    }
    for (let k = 0; k < 96; k++) push(pts[k], pts[k + 1])
  }
  for (let k = 0; k <= grid.slices; k++) {
    const z = zA + k * sliceLen
    if (z > -Z + 1e-6 && z < Z - 1e-6) ringAt(z)
  }
  const boundaries = [...new Set(sectors.map((s) => s.start))]
  for (const deg of boundaries) {
    const th = (deg * Math.PI) / 180
    let prev: THREE.Vector3 | null = null
    for (let k = 0; k <= 40; k++) {
      const z = zA + ((zB - zA) * k) / 40
      const zn = z / Z
      const r = Math.sqrt(Math.max(0, 1 - zn * zn)) * 1.006
      const p = toSurface(new THREE.Vector3(-Math.sin(th) * r, Math.cos(th) * r, zn))
      if (prev) push(prev, p)
      prev = p
    }
  }
  const coneBands = (count: number, z0: number, z1: number) => {
    for (let i = 1; i < count; i++) {
      const xn = -1 + (2 * i) / count
      for (const sign of [1, -1]) {
        let prev: THREE.Vector3 | null = null
        for (let k = 0; k <= 32; k++) {
          const z = z0 + ((z1 - z0) * k) / 32
          const zn = z / Z
          const yy = 1 - xn * xn - zn * zn
          if (yy < 0) {
            prev = null
            continue
          }
          const p = toSurface(new THREE.Vector3(xn, sign * Math.sqrt(yy), zn)).multiplyScalar(1.006)
          if (prev) push(prev, p)
          prev = p
        }
      }
    }
  }
  if (grid.apexCassettes > 1) coneBands(grid.apexCassettes, -Z, zA)
  if (grid.baseCassettes > 1) coneBands(grid.baseCassettes, zB, Z)
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

interface ProstateModelProps {
  grid: GridConfig
  analysis: Analysis
  theme: Theme
  selected: string | null
  onSelect: (id: string | null) => void
}

export default function ProstateModel({ grid, analysis, theme, selected, onSelect }: ProstateModelProps) {
  const { t, i18n } = useTranslation()
  const containerRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<{
    materials: Map<string, THREE.MeshStandardMaterial>
    centroids: Map<string, THREE.Vector3>
    markers: THREE.Group
    controls: OrbitControls
    mesh: THREE.Mesh
    cellIds: string[]
  } | null>(null)
  const [failed, setFailed] = useState(false)
  const [hover, setHover] = useState<string | null>(null)
  const onSelectRef = useRef(onSelect)
  onSelectRef.current = onSelect

  const gridKey = `${grid.slices}|${grid.sectors}|${grid.apexCassettes}|${grid.baseCassettes}`

  // Cena: reconstruída quando a grade, o tema ou o idioma mudam.
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
    // Vista inicial: face posterior (zona periférica, onde o tumor costuma estar),
    // lado direito do paciente e base mais próximos do observador.
    camera.position.set(-4.4, -3.2, 5.6)
    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enableDamping = true
    controls.enablePan = false
    controls.minDistance = 4
    controls.maxDistance = 16
    controls.saveState()

    scene.add(new THREE.HemisphereLight(0xffffff, theme === 'dark' ? 0x2a3444 : 0x8a94a6, 1.1))
    const key = new THREE.DirectionalLight(0xffffff, 1.4)
    key.position.set(3, 5, 4)
    scene.add(key)
    const fill = new THREE.DirectionalLight(0xffffff, 0.5)
    fill.position.set(-4, -2, -3)
    scene.add(fill)

    const build = buildModel(grid)
    const materials = new Map<string, THREE.MeshStandardMaterial>()
    const matList = build.cellIds.map((id) => {
      const m = new THREE.MeshStandardMaterial({ color: cellColor(null, 0, theme), roughness: 0.7, metalness: 0 })
      materials.set(id, m)
      return m
    })
    const mesh = new THREE.Mesh(build.geometry, matList)
    scene.add(mesh)
    const lineMat = new THREE.LineBasicMaterial({ color: strokeColor(theme), transparent: true, opacity: 0.9 })
    scene.add(new THREE.LineSegments(build.lines, lineMat))
    const markers = new THREE.Group()
    scene.add(markers)

    const ink = theme === 'dark' ? '#e6eaf0' : '#151a22'
    const labels: [string, THREE.Vector3][] = [
      [t('prostate.map.anterior'), new THREE.Vector3(0, Y + 0.55, 0)],
      [t('prostate.side.D'), new THREE.Vector3(-(X + 0.7), 0, 0)],
      [t('prostate.side.E'), new THREE.Vector3(X + 0.7, 0, 0)],
      [t('prostate.region.apex'), new THREE.Vector3(0, 0, -Z - 0.6)],
      [t('prostate.region.base'), new THREE.Vector3(0, 0, Z + 0.6)],
    ]
    for (const [text, p] of labels) {
      const s = textSprite(text, ink)
      s.position.copy(p)
      scene.add(s)
    }

    sceneRef.current = { materials, centroids: build.centroids, markers, controls, mesh, cellIds: build.cellIds }

    const resize = () => {
      const w = container.clientWidth
      const h = container.clientHeight
      if (!w || !h) return
      // updateStyle=true: o canvas precisa ficar em `w`×`h` px de CSS; sem isso,
      // em telas com escala (devicePixelRatio > 1) ele estoura o contêiner e a
      // peça aparece deslocada, mostrando só um canto.
      renderer.setSize(w, h)
      camera.aspect = w / h
      camera.updateProjectionMatrix()
    }
    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    // Clique (sem arrasto) seleciona a célula sob o cursor; hover mostra o nome.
    const ray = new THREE.Raycaster()
    const ndc = new THREE.Vector2()
    const pick = (ev: PointerEvent): string | null => {
      const rect = renderer.domElement.getBoundingClientRect()
      ndc.set(((ev.clientX - rect.left) / rect.width) * 2 - 1, -((ev.clientY - rect.top) / rect.height) * 2 + 1)
      ray.setFromCamera(ndc, camera)
      const hit = ray.intersectObject(mesh, false)[0]
      if (!hit || hit.faceIndex === undefined || hit.faceIndex === null) return null
      const vertex = hit.faceIndex * 3
      const group = build.geometry.groups.find((g) => vertex >= g.start && vertex < g.start + g.count)
      return group ? build.cellIds[group.materialIndex ?? 0] : null
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
      const id = pick(ev)
      onSelectRef.current(id)
    }
    const onMove = (ev: PointerEvent) => {
      setHover(pick(ev))
    }
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
  }, [gridKey, theme, i18n.language])

  // Cores, seleção e marcadores: atualizados a cada mudança nos dados.
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
        const m = new THREE.Mesh(
          new THREE.TorusGeometry(0.17, 0.03, 8, 24),
          new THREE.MeshBasicMaterial({ color: EPE_HEX }),
        )
        m.position.copy(p)
        m.lookAt(p.clone().multiplyScalar(2))
        s.markers.add(m)
      }
    }
  }, [analysis, selected, theme, gridKey])

  const hovered = hover ? analysis.cells.find((c) => c.cell.id === hover) : null

  return (
    <div className="relative">
      <div ref={containerRef} className="h-[380px] w-full overflow-hidden rounded-md border border-line bg-surface" />
      {failed && (
        <p className="absolute inset-0 flex items-center justify-center p-6 text-center text-sm text-ink-muted">
          {t('prostate.map.webgl')}
        </p>
      )}
      <div className="pointer-events-none absolute top-2 left-2 rounded-md border border-line bg-elevated/90 px-2.5 py-1.5 text-xs text-ink shadow-subtle backdrop-blur-sm">
        {hovered ? (
          <>
            <span className="font-medium">#{hovered.cell.label}</span> · {cellName(hovered.cell, t)}
            <span className="tabular ml-2 text-ink-muted">
              {fmtN(hovered.tumor, 0, i18n.language)}%{hovered.gleason ? ` · ${gleasonText(hovered.gleason)}` : ''}
            </span>
          </>
        ) : (
          <span className="text-ink-faint">{t('prostate.map.hint3d')}</span>
        )}
      </div>
      <Button
        type="button"
        size="sm"
        variant="ghost"
        className="absolute top-2 right-2"
        onClick={() => sceneRef.current?.controls.reset()}
      >
        <RotateCcw className="size-4" aria-hidden />
        {t('prostate.map.resetView')}
      </Button>
    </div>
  )
}
