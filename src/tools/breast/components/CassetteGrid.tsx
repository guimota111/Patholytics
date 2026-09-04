import { useEffect, useRef } from 'react'
import { useTranslation } from 'react-i18next'
import { Eraser } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import type { LesionAnalysis } from '../analysis'
import { fmtN } from '../format'
import { caColor, caTextColor, LVI_HEX, MARGIN_HEX, type Theme } from '../heat'
import { lesionColor } from '../inks'
import { CA_STEPS, CIS_STEPS, MARGINS, type Margin, type MicroCell } from '../types'

interface CassetteGridProps {
  analysis: LesionAnalysis[]
  cells: Record<string, MicroCell>
  theme: Theme
  selected: string | null
  onSelect: (id: string | null) => void
  setCell: (id: string, patch: Partial<MicroCell>) => void
  rcbLesionId: string | null
  onRcbLesion: (id: string) => void
  onClear: () => void
}

/**
 * Passo 2 da laudagem: a grade de cassetes de cada lesão como está na fatia
 * (fileiras × colunas do maior corte, mais os cassetes das outras fatias).
 * Clique num cassete e escolha a celularidade nos chips — os valores são os
 * do protocolo (décimos, mais 1 % e 5 %). Setas e Enter andam pela grade.
 */
export function CassetteGrid({ analysis, cells, theme, selected, onSelect, setCell, rcbLesionId, onRcbLesion, onClear }: CassetteGridProps) {
  const { t, i18n } = useTranslation()
  const all = analysis.flatMap((l) => l.cells.map((c) => c.def))
  const current = all.find((d) => d.id === selected) ?? null
  const cell = current ? (cells[current.id] ?? null) : null
  const panelRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (current) panelRef.current?.focus({ preventScroll: true })
  }, [current])

  const step = (delta: number) => {
    if (!current) return
    const i = all.findIndex((d) => d.id === current.id)
    const next = all[(i + delta + all.length) % all.length]
    if (next) onSelect(next.id)
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">{t('breast.micro.gridHint')}</p>
        <Button type="button" size="sm" variant="ghost" onClick={onClear}>
          <Eraser className="size-4" aria-hidden />
          {t('breast.micro.clear')}
        </Button>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <div className="space-y-5">
          {analysis.map((l, idx) => {
            const plan = l.plan
            const isRcb = (rcbLesionId ?? analysis[0]?.plan.lesion.id) === plan.lesion.id
            const bySlice = new Map<number, typeof plan.others>()
            for (const d of plan.others) bySlice.set(d.slice, [...(bySlice.get(d.slice) ?? []), d])
            return (
              <section key={plan.lesion.id} className={cn('rounded-lg border bg-surface', isRcb ? 'border-accent/50' : 'border-line')}>
                <header className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-2.5">
                  <span className="inline-block size-3 rounded-full" style={{ background: lesionColor(idx) }} aria-hidden />
                  <span className="text-sm font-semibold text-ink">{t('breast.map.lesionN', { n: plan.lesion.label })}</span>
                  <span className="tabular text-xs text-ink-faint">
                    {t('breast.micro.gridMeta', { slice: plan.central, rows: plan.lesion.cassettes.rows, cols: plan.lesion.cassettes.cols, u: fmtN(plan.gridSizeU, 0, i18n.language), v: fmtN(plan.gridSizeV, 0, i18n.language) })}
                  </span>
                  {analysis.length > 1 && (
                    <label className="ml-auto inline-flex items-center gap-1.5 text-xs text-ink-muted">
                      <input type="radio" name="rcb-lesion" checked={isRcb} onChange={() => onRcbLesion(plan.lesion.id)} className="accent-[var(--color-accent)]" />
                      {t('breast.micro.rcbLesion')}
                    </label>
                  )}
                  {l.caMean !== null && (
                    <span className="tabular ml-auto text-xs text-ink-muted">
                      {t('breast.micro.meanShort', { ca: fmtN(l.caMean, 0, i18n.language), cis: fmtN(l.cisMean ?? 0, 0, i18n.language) })}
                    </span>
                  )}
                </header>
                <div className="flex flex-wrap items-start gap-6 px-4 py-4">
                  <div>
                    <p className="mb-1 text-[0.65rem] tracking-wider text-ink-faint uppercase">
                      {t('breast.micro.rowsAlong', { from: t(`breast.margin.${plan.rowDirection[0]}`), to: t(`breast.margin.${plan.rowDirection[1]}`) })} ·{' '}
                      {t('breast.micro.colsAlong', { from: t(`breast.margin.${plan.colDirection[0]}`), to: t(`breast.margin.${plan.colDirection[1]}`) })}
                    </p>
                    <div className="inline-grid gap-1.5" style={{ gridTemplateColumns: `repeat(${plan.lesion.cassettes.cols}, auto)` }}>
                      {plan.grid.map((d) => (
                        <CellButton key={d.id} label={d.label} cell={cells[d.id]} theme={theme} selected={selected === d.id} onClick={() => onSelect(selected === d.id ? null : d.id)} />
                      ))}
                    </div>
                  </div>
                  {[...bySlice.entries()].map(([slice, defs]) => (
                    <div key={slice}>
                      <p className="mb-1 text-[0.65rem] tracking-wider text-ink-faint uppercase">{t('breast.map.sliceN', { n: slice })}</p>
                      <div className="flex gap-1.5">
                        {defs.map((d) => (
                          <CellButton key={d.id} label={d.label} cell={cells[d.id]} theme={theme} selected={selected === d.id} onClick={() => onSelect(selected === d.id ? null : d.id)} small />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )
          })}
        </div>

        <div
          ref={panelRef}
          tabIndex={-1}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' || e.key === 'Enter' || e.key === 'Tab') {
              if (e.key === 'Tab' && !e.shiftKey && (e.target as HTMLElement).tagName === 'BUTTON') return
              if (e.key === 'Tab') return
              e.preventDefault()
              step(1)
            } else if (e.key === 'ArrowLeft') {
              e.preventDefault()
              step(-1)
            }
          }}
          className="rounded-lg border border-line bg-elevated shadow-card outline-none xl:sticky xl:top-20"
        >
          {current ? (
            <>
              <div className="border-b border-line px-4 py-3">
                <p className="text-xs tracking-wider text-ink-faint uppercase">{t('breast.micro.currentCassette')}</p>
                <p className="tabular mt-0.5 text-2xl font-semibold tracking-tight text-accent-ink">{current.label}</p>
                <p className="text-xs text-ink-faint">{t('breast.map.sliceN', { n: current.slice })}</p>
              </div>
              <div className="space-y-4 px-4 py-4">
                <div>
                  <p className="text-sm font-medium text-ink">{t('breast.micro.cellCa')}</p>
                  <p className="text-xs text-ink-faint">{t('breast.micro.cellCaHint')}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {CA_STEPS.map((v) => (
                      <Chip key={v} active={cell?.ca === v} onClick={() => setCell(current.id, { ca: v, cis: v === 0 ? 0 : (cell?.cis ?? 0) })} color={caColor(v, theme)} text={caTextColor(v, theme)}>
                        {v}%
                      </Chip>
                    ))}
                    <Chip active={cell?.ca === null || cell?.ca === undefined} onClick={() => setCell(current.id, { ca: null, cis: null })}>
                      —
                    </Chip>
                  </div>
                </div>
                <div className={cn((cell?.ca ?? 0) <= 0 && 'opacity-40')}>
                  <p className="text-sm font-medium text-ink">{t('breast.micro.cellCis')}</p>
                  <p className="text-xs text-ink-faint">{t('breast.micro.cellCisHint')}</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {CIS_STEPS.map((v) => (
                      <Chip key={v} active={(cell?.cis ?? 0) === v && cell?.ca !== null && cell?.ca !== undefined} onClick={() => setCell(current.id, { cis: v })}>
                        {v}%
                      </Chip>
                    ))}
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-line pt-3">
                  <label className="inline-flex items-center gap-2 text-sm text-ink">
                    <input type="checkbox" checked={cell?.lvi ?? false} onChange={(e) => setCell(current.id, { lvi: e.target.checked })} className="size-4 accent-[var(--color-accent)]" />
                    {t('breast.micro.lvi')}
                  </label>
                  <label className="inline-flex items-center gap-2 text-sm text-ink">
                    {t('breast.micro.marginCell')}
                    <select
                      value={cell?.margin ?? ''}
                      onChange={(e) => setCell(current.id, { margin: (e.target.value || null) as Margin | null })}
                      className="h-8 rounded-md border border-line bg-surface px-1.5 text-sm text-ink"
                    >
                      <option value="">—</option>
                      {MARGINS.map((m) => (
                        <option key={m} value={m}>
                          {t(`breast.margin.${m}`)}
                        </option>
                      ))}
                    </select>
                  </label>
                </div>
                <div className="flex justify-between gap-2 border-t border-line pt-3">
                  <Button type="button" size="sm" variant="secondary" onClick={() => step(-1)}>
                    {t('breast.micro.prev')}
                  </Button>
                  <Button type="button" size="sm" onClick={() => step(1)}>
                    {t('breast.micro.next')}
                  </Button>
                </div>
                <p className="text-xs text-ink-faint">{t('breast.micro.keysHint')}</p>
              </div>
            </>
          ) : (
            <p className="px-4 py-6 text-sm text-ink-muted">{t('breast.micro.pickCassette')}</p>
          )}
        </div>
      </div>
    </div>
  )
}

function CellButton({ label, cell, theme, selected, onClick, small = false }: { label: string; cell?: MicroCell; theme: Theme; selected: boolean; onClick: () => void; small?: boolean }) {
  const ca = cell?.ca ?? null
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'tabular relative flex flex-col items-center justify-center rounded-md font-semibold ring-1 ring-line transition-shadow',
        small ? 'h-12 w-14 text-xs' : 'h-16 w-20 text-sm',
        selected && 'ring-2 ring-accent ring-offset-2 ring-offset-elevated',
      )}
      style={{
        background: caColor(ca, theme),
        color: caTextColor(ca, theme),
        boxShadow: cell?.margin ? `inset 0 0 0 3px ${MARGIN_HEX}` : cell?.lvi ? `inset 0 0 0 3px ${LVI_HEX}` : undefined,
      }}
    >
      <span>{label}</span>
      <span className="text-[0.65rem] font-normal opacity-90">{ca === null ? '·' : `${ca}%${(cell?.cis ?? 0) > 0 ? ` / ${cell?.cis}` : ''}`}</span>
    </button>
  )
}

function Chip({ active, onClick, children, color, text }: { active: boolean; onClick: () => void; children: React.ReactNode; color?: string; text?: string }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'tabular rounded-md border-2 px-2.5 py-1 text-sm font-medium transition-transform',
        active ? 'scale-105 border-accent' : 'border-transparent hover:border-line-strong',
        !color && (active ? 'bg-accent-soft text-accent-ink' : 'bg-surface text-ink-muted'),
      )}
      style={color ? { background: color, color: text } : undefined}
    >
      {children}
    </button>
  )
}
