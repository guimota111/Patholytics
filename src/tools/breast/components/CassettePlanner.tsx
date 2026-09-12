/* ==========================================================================
   CassettePlanner.tsx — a parte dos cassetes desenhada em vez de descrita.

   Mostra a fatia que foi mapeada como ela chega à bancada (as margens nas
   cores da tinta, a lesão no meio) com a grade por cima e o rótulo dentro de
   cada quadrado, para o patologista ver onde cai cada cassete antes de
   cortar. A fila de fatias em cima é onde ele diz qual fatia mapeou.
   ========================================================================== */

import { useTranslation } from 'react-i18next'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/cn'
import { compactInputClass } from '@/components/ui/fields'
import { clampGrid, clampPerSlice, labelSpan, resolveStarts, type LesionCassettes } from '../cassettes'
import { coord, dim, half, planeAxes, sizeOn } from '../geometry'
import { INK_HEX, lesionColor } from '../inks'
import type { CassettePlan, Lesion, MacroState, Margin } from '../types'

interface CassettePlannerProps {
  lesion: Lesion
  map: MacroState
  plan: LesionCassettes
  index: number
  onChange: (patch: Partial<CassettePlan>) => void
}

export function CassettePlanner({ lesion, map, plan, index, onChange }: CassettePlannerProps) {
  const { t } = useTranslation()
  const color = lesionColor(index)
  const rows = clampGrid(lesion.cassettes.rows)
  const cols = clampGrid(lesion.cassettes.cols)
  const per = clampPerSlice(lesion.cassettes.perOtherSlice)
  const start = resolveStarts(map)[lesion.id] ?? 1
  const autoStart = lesion.cassettes.start === null
  const slices: number[] = []
  for (let k = plan.first; k <= plan.last; k++) slices.push(k)

  return (
    <div className="space-y-4 rounded-md border border-line bg-elevated px-3 py-3">
      <div className="flex flex-wrap items-end gap-3">
        <p className="mr-auto text-xs font-medium text-ink-muted">{t('breast.cassette.title')}</p>
        <label className="space-y-1 text-xs text-ink-muted">
          {t('breast.cassette.letter')}
          <input
            value={lesion.cassettes.prefix}
            onChange={(e) => onChange({ prefix: e.target.value.toUpperCase().slice(0, 3) })}
            className={cn(compactInputClass, 'w-14 text-center font-semibold')}
          />
        </label>
        <label className="space-y-1 text-xs text-ink-muted">
          {t('breast.cassette.startAt')}
          <input
            type="number"
            min={1}
            value={start}
            onChange={(e) => onChange({ start: Math.max(1, Number(e.target.value) || 1) })}
            className={cn(compactInputClass, 'w-16', autoStart && 'text-ink-muted')}
          />
        </label>
        {autoStart ? (
          <span className="pb-2 text-xs text-ink-faint">{t('breast.cassette.autoStart')}</span>
        ) : (
          <button type="button" onClick={() => onChange({ start: null })} className="pb-2 text-xs text-accent hover:underline">
            {t('breast.cassette.backToAuto')}
          </button>
        )}
      </div>

      {/* Qual fatia foi mapeada — o patologista escolhe, o sistema só sugere. */}
      <div className="space-y-1.5">
        <p className="text-xs font-medium text-ink-muted">{t('breast.cassette.whichSlice')}</p>
        <div className="flex flex-wrap items-center gap-1.5">
          {slices.map((k) => {
            const isMapped = k === plan.mapped
            const others = plan.others.filter((c) => c.slice === k)
            return (
              <button
                key={k}
                type="button"
                onClick={() => onChange({ slice: k === plan.largest ? null : k })}
                title={isMapped ? labelSpan(plan.grid) : others.length ? labelSpan(others) : undefined}
                className={cn(
                  'tabular flex min-w-11 flex-col items-center rounded-md border px-2 py-1 text-xs transition-colors',
                  isMapped ? 'border-transparent font-semibold text-white' : 'border-line bg-surface text-ink-muted hover:border-line-strong',
                )}
                style={isMapped ? { background: color } : undefined}
              >
                <span>{k}</span>
                <span className={cn('text-[0.6rem]', isMapped ? 'text-white/80' : 'text-ink-faint')}>
                  {isMapped ? `${rows}×${cols}` : per > 0 ? `+${per}` : '—'}
                </span>
              </button>
            )
          })}
          {lesion.cassettes.slice !== null && (
            <button type="button" onClick={() => onChange({ slice: null })} className="ml-1 text-xs text-accent hover:underline">
              {t('breast.cassette.useLargest', { n: plan.largest })}
            </button>
          )}
        </div>
        <p className="text-xs text-ink-faint">
          {plan.mapped === plan.largest ? t('breast.cassette.sliceIsLargest', { n: plan.mapped }) : t('breast.cassette.sliceChosen', { n: plan.mapped, largest: plan.largest })}
        </p>
      </div>

      <div className="flex flex-wrap items-start gap-5">
        <SliceDiagram lesion={lesion} map={map} plan={plan} color={color} />

        <div className="min-w-44 flex-1 space-y-3">
          <Stepper
            label={t('breast.cassette.rows')}
            hint={t('breast.cassette.rowsHint', { from: t(`breast.margin.${plan.rowDirection[0]}`), to: t(`breast.margin.${plan.rowDirection[1]}`) })}
            value={rows}
            min={1}
            max={8}
            onChange={(v) => onChange({ rows: v })}
          />
          <Stepper
            label={t('breast.cassette.cols')}
            hint={t('breast.cassette.colsHint', { from: t(`breast.margin.${plan.colDirection[0]}`), to: t(`breast.margin.${plan.colDirection[1]}`) })}
            value={cols}
            min={1}
            max={8}
            onChange={(v) => onChange({ cols: v })}
          />
          <Stepper
            label={t('breast.cassette.perOtherSlice')}
            hint={t('breast.cassette.perOtherSliceHint', { n: Math.max(0, slices.length - 1) })}
            value={per}
            min={0}
            max={8}
            onChange={(v) => onChange({ perOtherSlice: v })}
          />
        </div>
      </div>

      <p className="tabular text-xs text-ink-muted">
        <span className="font-semibold text-ink">{labelSpan(plan.grid)}</span>{' '}
        {t('breast.cassette.summaryGrid', { slice: plan.mapped, rows, cols })}
        {plan.others.length > 0 && (
          <>
            {' · '}
            <span className="font-semibold text-ink">{labelSpan(plan.others)}</span> {t('breast.cassette.summaryOthers', { n: plan.others.length })}
          </>
        )}
      </p>
    </div>
  )
}

function Stepper({
  label,
  hint,
  value,
  min,
  max,
  onChange,
}: {
  label: string
  hint: string
  value: number
  min: number
  max: number
  onChange: (v: number) => void
}) {
  const step = (delta: number) => onChange(Math.max(min, Math.min(max, value + delta)))
  return (
    <div>
      <div className="flex items-center gap-2">
        <span className="flex-1 text-xs font-medium text-ink">{label}</span>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => step(-1)}
            disabled={value <= min}
            aria-label={`${label} −`}
            className="flex size-7 items-center justify-center rounded-md border border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink disabled:opacity-40"
          >
            <Minus className="size-3.5" aria-hidden />
          </button>
          <span className="tabular w-6 text-center text-sm font-semibold text-ink">{value}</span>
          <button
            type="button"
            onClick={() => step(1)}
            disabled={value >= max}
            aria-label={`${label} +`}
            className="flex size-7 items-center justify-center rounded-md border border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink disabled:opacity-40"
          >
            <Plus className="size-3.5" aria-hidden />
          </button>
        </div>
      </div>
      <p className="mt-0.5 text-[0.7rem] leading-snug text-ink-faint">{hint}</p>
    </div>
  )
}

const W = 240
const PAD = 26

/** A fatia mapeada de frente: margens pintadas, lesão e a grade rotulada. */
function SliceDiagram({ lesion, map, plan, color }: { lesion: Lesion; map: MacroState; plan: LesionCassettes; color: string }) {
  const { t } = useTranslation()
  const dims = map.specimen.dims
  const [uAxis, vAxis] = planeAxes(map.slicing.axis)
  const uLen = dim(dims, uAxis)
  const vLen = dim(dims, vAxis)
  const scale = (W - 2 * PAD) / Math.max(uLen, vLen)
  const rectW = vLen * scale
  const rectH = uLen * scale
  const H = rectH + 2 * PAD
  const x0 = (W - rectW) / 2
  const y0 = PAD
  // O extremo positivo de cada eixo fica no topo e à esquerda: é de lá que a
  // numeração sai, então A1 cai no canto superior esquerdo, como se lê.
  const toX = (v: number) => x0 + (half(dims, vAxis) - v) * scale
  const toY = (u: number) => y0 + (half(dims, uAxis) - u) * scale
  const [topMargin, bottomMargin] = [plan.rowDirection[0], plan.rowDirection[1]]
  const [leftMargin, rightMargin] = [plan.colDirection[0], plan.colDirection[1]]
  const edge = (m: Margin) => INK_HEX[map.inks[m]]

  const cu = coord(lesion.center, uAxis)
  const cv = coord(lesion.center, vAxis)
  const ru = Math.max(2, (sizeOn(lesion, uAxis) / 2) * scale)
  const rv = Math.max(2, (sizeOn(lesion, vAxis) / 2) * scale)
  const cellW = plan.grid.length ? Math.abs(toX(plan.grid[0].v0) - toX(plan.grid[0].v1)) : 0
  const cellH = plan.grid.length ? Math.abs(toY(plan.grid[0].u0) - toY(plan.grid[0].u1)) : 0
  const fontSize = Math.min(11, Math.max(5, Math.min(cellW, cellH) * 0.42))

  return (
    <figure className="space-y-1">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-[260px] select-none rounded-md border border-line bg-surface" role="img" aria-label={t('breast.cassette.diagramAlt', { n: plan.mapped })}>
        <rect x={x0} y={y0} width={rectW} height={rectH} rx={6} fill="#efe1bd" opacity={0.6} />
        <line x1={x0} y1={y0} x2={x0 + rectW} y2={y0} stroke={edge(topMargin)} strokeWidth={5} strokeLinecap="round" />
        <line x1={x0} y1={y0 + rectH} x2={x0 + rectW} y2={y0 + rectH} stroke={edge(bottomMargin)} strokeWidth={5} strokeLinecap="round" />
        <line x1={x0} y1={y0} x2={x0} y2={y0 + rectH} stroke={edge(leftMargin)} strokeWidth={5} strokeLinecap="round" />
        <line x1={x0 + rectW} y1={y0} x2={x0 + rectW} y2={y0 + rectH} stroke={edge(rightMargin)} strokeWidth={5} strokeLinecap="round" />

        <ellipse cx={toX(cv)} cy={toY(cu)} rx={rv} ry={ru} fill={color} opacity={0.28} stroke={color} strokeWidth={1.2} />

        {plan.grid.map((c) => {
          const x = Math.min(toX(c.v0), toX(c.v1))
          const y = Math.min(toY(c.u0), toY(c.u1))
          const w = Math.abs(toX(c.v1) - toX(c.v0))
          const h = Math.abs(toY(c.u1) - toY(c.u0))
          return (
            <g key={c.id}>
              <rect x={x} y={y} width={w} height={h} fill={color} fillOpacity={0.14} stroke={color} strokeWidth={1} />
              {fontSize >= 6 && (
                <text x={x + w / 2} y={y + h / 2 + fontSize * 0.35} textAnchor="middle" fontSize={fontSize} fontWeight={700} fill={color}>
                  {c.label}
                </text>
              )}
            </g>
          )
        })}

        <text x={W / 2} y={y0 - 14} textAnchor="middle" fontSize={9} fill="currentColor" className="text-ink-faint">
          {t(`breast.margin.${topMargin}`)}
        </text>
        <text x={W / 2} y={y0 - 4} textAnchor="middle" fontSize={9} fontWeight={600} fill="currentColor" className="text-ink-muted">
          {t('breast.map.sliceN', { n: plan.mapped })}
        </text>
        <text x={W / 2} y={y0 + rectH + 14} textAnchor="middle" fontSize={9} fill="currentColor" className="text-ink-faint">
          {t(`breast.margin.${bottomMargin}`)}
        </text>
        <text x={x0 - 6} y={y0 + rectH / 2} textAnchor="middle" fontSize={9} fill="currentColor" className="text-ink-faint" transform={`rotate(-90 ${x0 - 6} ${y0 + rectH / 2})`}>
          {t(`breast.margin.${leftMargin}`)}
        </text>
        <text x={x0 + rectW + 8} y={y0 + rectH / 2} textAnchor="middle" fontSize={9} fill="currentColor" className="text-ink-faint" transform={`rotate(90 ${x0 + rectW + 8} ${y0 + rectH / 2})`}>
          {t(`breast.margin.${rightMargin}`)}
        </text>
      </svg>
      <figcaption className="max-w-[260px] text-[0.7rem] leading-snug text-ink-faint">{t('breast.cassette.diagramHint')}</figcaption>
    </figure>
  )
}
