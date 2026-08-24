import { useTranslation } from 'react-i18next'
import type { Analysis, CellResult } from '../analysis'
import { cellColor, EPE_HEX, MARGIN_HEX, PATTERN_HEX, strokeColor, type Theme } from '../heat'
import { cellName, fmtN, gleasonText } from '../format'
import type { Cell, GridConfig } from '../types'

const R = 40
const C = R + 8
const SIZE = C * 2

interface SliceMapProps {
  grid: GridConfig
  analysis: Analysis
  theme: Theme
  selected: string | null
  onSelect: (id: string | null) => void
}

/** Ponto na borda do disco: θ em graus a partir do anterior (topo), positivo para a
    direita do paciente — desenhada à ESQUERDA do observador (convenção radiológica). */
function pt(theta: number, r = R) {
  const rad = (theta * Math.PI) / 180
  return { x: C - r * Math.sin(rad), y: C - r * Math.cos(rad) }
}

function wedgePath(start: number, end: number): string {
  const a = pt(start)
  const b = pt(end)
  const large = end - start > 180 ? 1 : 0
  return `M ${C} ${C} L ${a.x} ${a.y} A ${R} ${R} 0 ${large} 0 ${b.x} ${b.y} Z`
}

function arcPath(start: number, end: number, r: number): string {
  const a = pt(start, r)
  const b = pt(end, r)
  const large = end - start > 180 ? 1 : 0
  return `M ${a.x} ${a.y} A ${r} ${r} 0 ${large} 0 ${b.x} ${b.y}`
}

/** Faixa vertical i de n dentro do disco (cortes parassagitais; i = 0 à esquerda = direita do paciente). */
function bandPath(i: number, n: number): string {
  const x0 = C - R + (2 * R * i) / n
  const x1 = C - R + (2 * R * (i + 1)) / n
  const dy = (x: number) => Math.sqrt(Math.max(0, R * R - (x - C) * (x - C)))
  return `M ${x0} ${C - dy(x0)} A ${R} ${R} 0 0 1 ${x1} ${C - dy(x1)} L ${x1} ${C + dy(x1)} A ${R} ${R} 0 0 1 ${x0} ${C + dy(x0)} Z`
}

function bandEdgePath(i: number, n: number, r: number): string {
  // Arco superior da faixa, em raio r (marcadores de margem/EEP)
  const x0 = C - R + (2 * R * i) / n
  const x1 = C - R + (2 * R * (i + 1)) / n
  const k = r / R
  const dy = (x: number) => Math.sqrt(Math.max(0, R * R - (x - C) * (x - C)))
  const sx0 = C + (x0 - C) * k
  const sx1 = C + (x1 - C) * k
  return `M ${sx0} ${C - dy(x0) * k} A ${r} ${r} 0 0 1 ${sx1} ${C - dy(x1) * k}`
}

export function SliceMap({ grid, analysis, theme, selected, onSelect }: SliceMapProps) {
  const { t, i18n } = useTranslation()
  const byId = new Map(analysis.cells.map((c) => [c.cell.id, c]))

  const discs: { key: string; caption: string; cells: CellResult[]; cone: boolean }[] = []
  const cellsOf = (pred: (c: Cell) => boolean) => analysis.cells.filter((c) => pred(c.cell))
  if (grid.apexCassettes > 0) {
    discs.push({ key: 'apex', caption: t('prostate.region.apex'), cells: cellsOf((c) => c.kind === 'apex'), cone: true })
  }
  for (let s = 1; s <= grid.slices; s++) {
    discs.push({
      key: `s${s}`,
      caption: t('prostate.region.slice', { n: s }),
      cells: cellsOf((c) => c.slice === s),
      cone: false,
    })
  }
  if (grid.baseCassettes > 0) {
    discs.push({ key: 'base', caption: t('prostate.region.base'), cells: cellsOf((c) => c.kind === 'base'), cone: true })
  }

  const stroke = strokeColor(theme)

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {discs.map((d) => (
          <figure key={d.key} className="flex flex-col items-center">
            <svg viewBox={`0 0 ${SIZE} ${SIZE}`} width={SIZE} height={SIZE} role="img" aria-label={d.caption}>
              {d.cells.map((cr) => {
                const res = byId.get(cr.cell.id)!
                const fill = cellColor(res.dominant, res.tumor, theme)
                const isSel = selected === cr.cell.id
                const path = d.cone ? bandPath(cr.cell.index!, d.cells.length) : wedgePath(cr.cell.sector!.start, cr.cell.sector!.end)
                const label = cr.cell.label
                const centroid = d.cone
                  ? { x: C - R + (2 * R * (cr.cell.index! + 0.5)) / d.cells.length, y: C }
                  : pt((cr.cell.sector!.start + cr.cell.sector!.end) / 2, R * 0.58)
                const title = `${cellName(cr.cell, t)} · #${label}\n${t('prostate.table.tumor')}: ${fmtN(res.tumor, 0, i18n.language)}%` +
                  (res.gleason ? ` · Gleason ${gleasonText(res.gleason)}` : '')
                return (
                  <g key={cr.cell.id} onClick={() => onSelect(isSel ? null : cr.cell.id)} className="cursor-pointer">
                    <title>{title}</title>
                    <path d={path} fill={fill} stroke={isSel ? 'var(--color-accent)' : stroke} strokeWidth={isSel ? 2.5 : 1.5} />
                    {cr.data.margin && (
                      <path
                        d={d.cone ? bandEdgePath(cr.cell.index!, d.cells.length, R + 3) : arcPath(cr.cell.sector!.start, cr.cell.sector!.end, R + 3)}
                        fill="none"
                        stroke={MARGIN_HEX}
                        strokeWidth={3}
                        strokeLinecap="round"
                      />
                    )}
                    {cr.data.epe !== 'none' && (
                      <path
                        d={d.cone ? bandEdgePath(cr.cell.index!, d.cells.length, R + 6.5) : arcPath(cr.cell.sector!.start, cr.cell.sector!.end, R + 6.5)}
                        fill="none"
                        stroke={EPE_HEX}
                        strokeWidth={2}
                        strokeDasharray={cr.data.epe === 'focal' ? '3 3' : undefined}
                      />
                    )}
                    <text
                      x={centroid.x}
                      y={centroid.y}
                      textAnchor="middle"
                      dominantBaseline="central"
                      className="tabular pointer-events-none"
                      fontSize={label.length > 2 ? 9 : 11}
                      fontWeight={600}
                      fill={res.tumor > 0 ? '#111' : 'var(--color-ink-muted)'}
                    >
                      {label}
                    </text>
                  </g>
                )
              })}
            </svg>
            <figcaption className="mt-1 text-xs text-ink-faint">{d.caption}</figcaption>
          </figure>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-faint">
        <span>{t('prostate.map.orientation')}</span>
        {([3, 4, 5] as const).map((p) => (
          <span key={p} className="inline-flex items-center gap-1.5">
            <span className="inline-block size-3 rounded-sm" style={{ background: PATTERN_HEX[p] }} />
            {t('prostate.map.legendPattern', { p })}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-1 w-4 rounded" style={{ background: MARGIN_HEX }} />
          {t('prostate.map.legendMargin')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block h-0.5 w-4 border-t-2 border-dashed" style={{ borderColor: EPE_HEX }} />
          {t('prostate.map.legendEpe')}
        </span>
      </div>
    </div>
  )
}
