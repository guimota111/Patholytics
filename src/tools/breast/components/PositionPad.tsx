import { useRef, type PointerEvent as ReactPointerEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { INK_HEX, lesionColor } from '../inks'
import { dim, sizeOn } from '../geometry'
import type { Axis, Dims3, InkColor, Lesion, Margin, Point3, Side } from '../types'

interface PositionPadProps {
  dims: Dims3
  inks: Record<Margin, InkColor>
  side: Side
  lesions: Lesion[]
  selectedId: string
  onMove: (id: string, center: Point3) => void
  /** Plano: frontal (ML × SI) ou axial (ML × AP). */
  plane: 'frontal' | 'axial'
}

const W = 240
const PAD = 22

/**
 * Corte 2D da peça com as margens desenhadas nas cores da tinta e as lesões
 * como elipses; a lesão selecionada arrasta com o mouse. Vista de frente:
 * na mama esquerda o lateral fica à direita de quem olha, na direita, à
 * esquerda — como na bancada e no modelo 3D.
 */
export function PositionPad({ dims, inks, side, lesions, selectedId, onMove, plane }: PositionPadProps) {
  const { t } = useTranslation()
  const svgRef = useRef<SVGSVGElement>(null)
  const dragging = useRef(false)

  const hAxis: Axis = 'ml'
  const vAxis: Axis = plane === 'frontal' ? 'si' : 'ap'
  const mlLen = dim(dims, hAxis)
  const vLen = dim(dims, vAxis)
  const scale = (W - 2 * PAD) / Math.max(mlLen, vLen)
  const rectW = mlLen * scale
  const rectH = vLen * scale
  const H = rectH + 2 * PAD
  const x0 = (W - rectW) / 2
  const y0 = PAD
  // Espelha o x para a mama direita: lateral à esquerda de quem olha.
  const flip = side === 'right' ? -1 : 1
  const toPx = (mmX: number, mmV: number) => ({ px: x0 + rectW / 2 + flip * mmX * scale, py: y0 + rectH / 2 - mmV * scale })
  const fromPx = (px: number, py: number) => ({ x: (flip * (px - x0 - rectW / 2)) / scale, v: (y0 + rectH / 2 - py) / scale })

  const leftMargin: Margin = flip === 1 ? 'medial' : 'lateral'
  const rightMargin: Margin = flip === 1 ? 'lateral' : 'medial'
  const topMargin: Margin = plane === 'frontal' ? 'superior' : 'anterior'
  const bottomMargin: Margin = plane === 'frontal' ? 'inferior' : 'posterior'
  const edge = (m: Margin) => INK_HEX[inks[m]]

  const clientToLocal = (e: ReactPointerEvent) => {
    const svg = svgRef.current
    if (!svg) return null
    const rect = svg.getBoundingClientRect()
    return { px: ((e.clientX - rect.left) / rect.width) * W, py: ((e.clientY - rect.top) / rect.height) * H }
  }

  const moveTo = (e: ReactPointerEvent) => {
    const p = clientToLocal(e)
    const l = lesions.find((x) => x.id === selectedId)
    if (!p || !l) return
    const { x, v } = fromPx(p.px, p.py)
    const hx = mlLen / 2
    const hv = vLen / 2
    const nx = Math.max(-hx, Math.min(hx, Math.round(x)))
    const nv = Math.max(-hv, Math.min(hv, Math.round(v)))
    onMove(l.id, plane === 'frontal' ? { ...l.center, x: nx, y: nv } : { ...l.center, x: nx, z: nv })
  }

  return (
    <div className="space-y-1">
      <p className="text-xs font-medium text-ink-muted">{t(plane === 'frontal' ? 'breast.lesion.padFrontal' : 'breast.lesion.padAxial')}</p>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        className="w-full max-w-[260px] touch-none select-none rounded-md border border-line bg-surface"
        onPointerDown={(e) => {
          dragging.current = true
          e.currentTarget.setPointerCapture(e.pointerId)
          moveTo(e)
        }}
        onPointerMove={(e) => {
          if (dragging.current) moveTo(e)
        }}
        onPointerUp={(e) => {
          dragging.current = false
          e.currentTarget.releasePointerCapture(e.pointerId)
        }}
        onPointerCancel={() => {
          dragging.current = false
        }}
        role="img"
        aria-label={t('breast.lesion.padHint')}
      >
        <rect x={x0} y={y0} width={rectW} height={rectH} rx={6} fill="#efe1bd" opacity={0.6} />
        {/* Margens: uma linha grossa por lado, na cor da tinta. */}
        <line x1={x0} y1={y0} x2={x0 + rectW} y2={y0} stroke={edge(topMargin)} strokeWidth={5} strokeLinecap="round" />
        <line x1={x0} y1={y0 + rectH} x2={x0 + rectW} y2={y0 + rectH} stroke={edge(bottomMargin)} strokeWidth={5} strokeLinecap="round" />
        <line x1={x0} y1={y0} x2={x0} y2={y0 + rectH} stroke={edge(leftMargin)} strokeWidth={5} strokeLinecap="round" />
        <line x1={x0 + rectW} y1={y0} x2={x0 + rectW} y2={y0 + rectH} stroke={edge(rightMargin)} strokeWidth={5} strokeLinecap="round" />
        <text x={W / 2} y={y0 - 8} textAnchor="middle" fontSize={10} fill="currentColor" className="text-ink-faint">
          {t(`breast.margin.${topMargin}`)}
        </text>
        <text x={W / 2} y={y0 + rectH + 15} textAnchor="middle" fontSize={10} fill="currentColor" className="text-ink-faint">
          {t(`breast.margin.${bottomMargin}`)}
        </text>
        <text x={x0 - 6} y={y0 + rectH / 2} textAnchor="end" fontSize={10} fill="currentColor" className="text-ink-faint" transform={`rotate(-90 ${x0 - 6} ${y0 + rectH / 2})`}>
          {t(`breast.margin.${leftMargin}`)}
        </text>
        <text x={x0 + rectW + 10} y={y0 + rectH / 2} textAnchor="middle" fontSize={10} fill="currentColor" className="text-ink-faint" transform={`rotate(90 ${x0 + rectW + 10} ${y0 + rectH / 2})`}>
          {t(`breast.margin.${rightMargin}`)}
        </text>
        {lesions.map((l, i) => {
          const c = toPx(l.center.x, plane === 'frontal' ? l.center.y : l.center.z)
          const rx = Math.max(2, (sizeOn(l, hAxis) / 2) * scale)
          const ry = Math.max(2, (sizeOn(l, vAxis) / 2) * scale)
          const sel = l.id === selectedId
          return (
            <g key={l.id} style={{ cursor: sel ? 'grab' : 'default' }}>
              <ellipse cx={c.px} cy={c.py} rx={rx} ry={ry} fill={lesionColor(i)} opacity={sel ? 0.85 : 0.45} stroke={sel ? '#151a22' : 'none'} strokeWidth={sel ? 1.5 : 0} />
              <text x={c.px} y={c.py + 3.5} textAnchor="middle" fontSize={10} fontWeight={600} fill="#fff">
                {l.label}
              </text>
            </g>
          )
        })}
      </svg>
    </div>
  )
}
