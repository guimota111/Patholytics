import { Fragment, useRef, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Eraser } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import type { Analysis, CellResult } from '../analysis'
import { cellColor, type Theme } from '../heat'
import { gleasonText } from '../format'
import type { CaseGlobals, CellData, GridConfig, Pattern } from '../types'
import { SectionHeader, compactInputClass } from './fields'

interface CassetteTableProps {
  grid: GridConfig
  globals: CaseGlobals
  analysis: Analysis
  theme: Theme
  editLabels: boolean
  selected: string | null
  onSelect: (id: string | null) => void
  setCell: (id: string, patch: Partial<CellData>) => void
  setLabel: (id: string, label: string) => void
  onClear: () => void
}

export function CassetteTable({
  grid,
  globals,
  analysis,
  theme,
  editLabels,
  selected,
  onSelect,
  setCell,
  setLabel,
  onClear,
}: CassetteTableProps) {
  const { t } = useTranslation()
  const tableRef = useRef<HTMLTableElement>(null)
  const perCrib = globals.cribMode === 'perCassette'
  const perIdc = globals.idcMode === 'perCassette'
  const ofCassette = globals.g45Mode === 'ofCassette'

  // Enter pula para o próximo campo numérico; a ordem é a do DOM (linha a linha).
  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const inputs = Array.from(tableRef.current?.querySelectorAll<HTMLInputElement>('input[data-nav]') ?? [])
    const i = inputs.indexOf(e.currentTarget)
    const next = inputs[(i + 1) % inputs.length]
    next?.focus()
    next?.select()
  }

  const groups: { key: string; title: string; rows: CellResult[] }[] = []
  const apex = analysis.cells.filter((c) => c.cell.kind === 'apex')
  if (apex.length) groups.push({ key: 'apex', title: t('prostate.region.apex'), rows: apex })
  for (let s = 1; s <= grid.slices; s++) {
    groups.push({ key: `s${s}`, title: t('prostate.region.slice', { n: s }), rows: analysis.cells.filter((c) => c.cell.slice === s) })
  }
  const base = analysis.cells.filter((c) => c.cell.kind === 'base')
  if (base.length) groups.push({ key: 'base', title: t('prostate.region.base'), rows: base })

  const colSpan = 6 + (perCrib ? 1 : 0) + (perIdc ? 1 : 0) + 3

  return (
    <div className="rounded-lg border border-line bg-elevated shadow-card">
      <SectionHeader title={t('prostate.table.title')} hint={t(ofCassette ? 'prostate.table.hintOfCassette' : 'prostate.table.hintOfTumor')}>
        <Button type="button" size="sm" variant="ghost" onClick={onClear}>
          <Eraser className="size-4" aria-hidden />
          {t('prostate.table.clear')}
        </Button>
      </SectionHeader>

      <div className="overflow-x-auto">
        <table ref={tableRef} className="w-full min-w-[760px] text-sm">
          <thead className="text-xs tracking-wider text-ink-faint uppercase">
            <tr className="border-b border-line">
              <th className="px-3 py-2 text-left font-medium">{t('prostate.table.cassette')}</th>
              <th className="px-2 py-2 text-left font-medium">{t('prostate.table.position')}</th>
              <th className="px-2 py-2 text-left font-medium">{t('prostate.table.tumor')}</th>
              <th className="px-2 py-2 text-left font-medium">{t('prostate.table.g4')}</th>
              <th className="px-2 py-2 text-left font-medium">{t('prostate.table.g5')}</th>
              {perCrib && <th className="px-2 py-2 text-left font-medium">{t('prostate.table.crib')}</th>}
              {perIdc && <th className="px-2 py-2 text-left font-medium">{t('prostate.table.idc')}</th>}
              <th className="px-2 py-2 text-left font-medium">{t('prostate.table.margin')}</th>
              <th className="px-2 py-2 text-left font-medium">{t('prostate.table.epe')}</th>
              <th className="px-3 py-2 text-right font-medium">Gleason</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <Fragment key={g.key}>
                <tr className="bg-surface/70">
                  <td colSpan={colSpan} className="px-3 py-1.5 text-xs font-semibold tracking-wide text-ink-muted uppercase">
                    {g.title}
                    <span className="tabular ml-2 font-normal normal-case">
                      {g.rows.filter((r) => r.tumor > 0).length}/{g.rows.length}
                    </span>
                  </td>
                </tr>
                {g.rows.map((r) => {
                  const d = r.data
                  const id = r.cell.id
                  const isSel = selected === id
                  return (
                    <tr
                      key={id}
                      onClick={() => onSelect(isSel ? null : id)}
                      className={cn('border-b border-line/70 transition-colors', isSel ? 'bg-accent-soft/60' : 'hover:bg-surface/60')}
                    >
                      <td className="px-3 py-1.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="inline-block size-3 shrink-0 rounded-sm border border-line"
                            style={{ background: cellColor(r.dominant, r.tumor, theme) }}
                            aria-hidden
                          />
                          {editLabels ? (
                            <input
                              value={grid.labels[id] ?? r.cell.label}
                              onChange={(e) => setLabel(id, e.target.value)}
                              onClick={(e) => e.stopPropagation()}
                              className={cn(compactInputClass, 'w-16')}
                              aria-label={t('prostate.table.cassette')}
                            />
                          ) : (
                            <span className="tabular font-medium text-ink">{r.cell.label}</span>
                          )}
                          {!r.valid && <AlertTriangle className="size-3.5 text-danger" aria-label={t('prostate.warnings.invalidCell', { label: r.cell.label })} />}
                        </div>
                      </td>
                      <td className="px-2 py-1.5 text-xs text-ink-muted">
                        {r.cell.kind === 'slice'
                          ? `${r.cell.sector!.id} · ${t(`prostate.side.${r.cell.side}`)}`
                          : `${t(`prostate.side.${r.cell.side}`)} ${r.cell.index! + 1}`}
                      </td>
                      <td className="w-20 px-2 py-1.5">
                        <Num value={d.tumor} onChange={(v) => setCell(id, { tumor: v })} onKeyDown={onKey} />
                      </td>
                      <td className="w-20 px-2 py-1.5">
                        <Num value={d.g4} onChange={(v) => setCell(id, { g4: v })} onKeyDown={onKey} />
                      </td>
                      <td className="w-20 px-2 py-1.5">
                        <Num value={d.g5} onChange={(v) => setCell(id, { g5: v })} onKeyDown={onKey} />
                      </td>
                      {perCrib && (
                        <td className="w-20 px-2 py-1.5">
                          <Num value={d.crib} onChange={(v) => setCell(id, { crib: v })} onKeyDown={onKey} />
                        </td>
                      )}
                      {perIdc && (
                        <td className="px-2 py-1.5">
                          <input
                            type="checkbox"
                            checked={d.idc}
                            onChange={(e) => setCell(id, { idc: e.target.checked })}
                            onClick={(e) => e.stopPropagation()}
                            className="size-4 accent-[var(--color-accent)]"
                            aria-label={t('prostate.table.idc')}
                          />
                        </td>
                      )}
                      <td className="px-2 py-1.5">
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="checkbox"
                            checked={d.margin}
                            onChange={(e) => setCell(id, { margin: e.target.checked })}
                            className="size-4 accent-[var(--color-accent)]"
                            aria-label={t('prostate.table.margin')}
                          />
                          {d.margin && (
                            <>
                              <input
                                type="number"
                                inputMode="decimal"
                                step="0.1"
                                min={0}
                                value={d.marginMm ?? ''}
                                onChange={(e) => setCell(id, { marginMm: e.target.value === '' ? null : Number(e.target.value) })}
                                placeholder="mm"
                                className={cn(compactInputClass, 'w-16')}
                                aria-label={t('prostate.table.marginMm')}
                              />
                              <select
                                value={d.marginPattern ?? ''}
                                onChange={(e) => setCell(id, { marginPattern: e.target.value ? (Number(e.target.value) as Pattern) : null })}
                                className="h-8 rounded-md border border-line bg-surface px-1.5 text-sm text-ink"
                                aria-label={t('prostate.table.marginPattern')}
                              >
                                <option value="">G?</option>
                                <option value="3">G3</option>
                                <option value="4">G4</option>
                                <option value="5">G5</option>
                              </select>
                            </>
                          )}
                        </div>
                      </td>
                      <td className="px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
                        <select
                          value={d.epe}
                          onChange={(e) => setCell(id, { epe: e.target.value as CellData['epe'] })}
                          className={cn('h-8 rounded-md border bg-surface px-1.5 text-sm', d.epe === 'none' ? 'border-line text-ink-faint' : 'border-accent/40 text-ink')}
                          aria-label={t('prostate.table.epe')}
                        >
                          <option value="none">{t('prostate.epe.none')}</option>
                          <option value="focal">{t('prostate.epe.focal')}</option>
                          <option value="established">{t('prostate.epe.established')}</option>
                        </select>
                      </td>
                      <td className="tabular px-3 py-1.5 text-right text-ink-muted">
                        {r.gleason ? (
                          <>
                            {gleasonText(r.gleason)}
                            <span className="ml-1 text-xs text-ink-faint">GG{r.gleason.gradeGroup}</span>
                          </>
                        ) : (
                          '—'
                        )}
                      </td>
                    </tr>
                  )
                })}
              </Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function Num({
  value,
  onChange,
  onKeyDown,
}: {
  value: number | null
  onChange: (v: number | null) => void
  onKeyDown: (e: KeyboardEvent<HTMLInputElement>) => void
}) {
  return (
    <input
      type="number"
      inputMode="numeric"
      min={0}
      max={100}
      data-nav
      value={value ?? ''}
      onChange={(e) => onChange(e.target.value === '' ? null : Number(e.target.value))}
      onKeyDown={onKeyDown}
      onClick={(e) => e.stopPropagation()}
      onFocus={(e) => e.currentTarget.select()}
      className={compactInputClass}
    />
  )
}
