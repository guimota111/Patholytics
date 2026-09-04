import { Fragment, useRef, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Eraser } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import type { Analysis, CellResult } from '../analysis'
import { cellColor, type Theme } from '../heat'
import { gleasonText } from '../format'
import { groupColor } from '../mapping'
import type { CaseGlobals, CellData, MappingConfig, Pattern } from '../types'
import { Toggle, compactInputClass } from './fields'

interface CassetteTableProps {
  mapping: MappingConfig
  globals: CaseGlobals
  analysis: Analysis
  theme: Theme
  selected: string | null
  onSelect: (id: string | null) => void
  setCell: (id: string, patch: Partial<CellData>) => void
  onClear: () => void
}

/**
 * Uma linha por cassete, agrupadas pelo mapeamento. Por padrão só o que o
 * patologista precisa digitar: tumor, G4, G5 e duas caixas (margem, EEP).
 * O detalhe (mm e Gleason na margem, EEP focal/estabelecida, cribriforme e
 * IDC por cassete) aparece quando "mais colunas" está ligado.
 */
export function CassetteTable({ mapping, globals, analysis, theme, selected, onSelect, setCell, onClear }: CassetteTableProps) {
  const { t } = useTranslation()
  const tableRef = useRef<HTMLTableElement>(null)
  const [more, setMore] = useState(false)
  const perCrib = more && globals.cribMode === 'perCassette'
  const perIdc = more && globals.idcMode === 'perCassette'
  const ofCassette = globals.g45Mode === 'ofCassette'

  const onKey = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return
    e.preventDefault()
    const inputs = Array.from(tableRef.current?.querySelectorAll<HTMLInputElement>('input[data-nav]') ?? [])
    const i = inputs.indexOf(e.currentTarget)
    const next = inputs[(i + 1) % inputs.length]
    next?.focus()
    next?.select()
  }

  const groups: { key: string; title: string; color: string; rows: CellResult[] }[] = mapping.groups.map((g, i) => ({
    key: g.id,
    title: g.name || t('prostate.mapping.namePlaceholder'),
    color: groupColor(i),
    rows: analysis.cells.filter((c) => c.cell.group?.id === g.id),
  }))
  const unmapped = analysis.cells.filter((c) => !c.cell.group)
  if (unmapped.length) groups.push({ key: '__unmapped', title: t('prostate.unmappedGroup'), color: 'var(--color-ink-faint)', rows: unmapped })

  const colSpan = 6 + (more ? 2 : 0) + (perCrib ? 1 : 0) + (perIdc ? 1 : 0)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted">{t(ofCassette ? 'prostate.table.hintOfCassette' : 'prostate.table.hintOfTumor')}</p>
        <div className="flex items-center gap-3">
          <Toggle checked={more} onChange={setMore} label={t('prostate.table.moreColumns')} />
          <Button type="button" size="sm" variant="ghost" onClick={onClear}>
            <Eraser className="size-4" aria-hidden />
            {t('prostate.table.clear')}
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-md border border-line">
        <table ref={tableRef} className="w-full min-w-[640px] text-sm">
          <thead className="bg-surface text-xs tracking-wider text-ink-faint uppercase">
            <tr className="border-b border-line">
              <th className="px-3 py-2 text-left font-medium">{t('prostate.table.cassette')}</th>
              <th className="px-2 py-2 text-left font-medium">{t('prostate.table.tumor')}</th>
              <th className="px-2 py-2 text-left font-medium">{t('prostate.table.g4')}</th>
              <th className="px-2 py-2 text-left font-medium">{t('prostate.table.g5')}</th>
              {perCrib && <th className="px-2 py-2 text-left font-medium">{t('prostate.table.crib')}</th>}
              {perIdc && <th className="px-2 py-2 text-left font-medium">{t('prostate.table.idc')}</th>}
              <th className="px-2 py-2 text-left font-medium">{t('prostate.table.margin')}</th>
              {more && <th className="px-2 py-2 text-left font-medium">{t('prostate.table.marginDetail')}</th>}
              <th className="px-2 py-2 text-left font-medium">{t('prostate.table.epe')}</th>
              {more && <th className="px-2 py-2 text-left font-medium">{t('prostate.table.epeType')}</th>}
              <th className="px-3 py-2 text-right font-medium">Gleason</th>
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => (
              <Fragment key={g.key}>
                <tr className="bg-surface/70">
                  <td colSpan={colSpan} className="px-3 py-1.5 text-xs font-semibold text-ink-muted">
                    <span className="mr-2 inline-block size-2.5 rounded-sm align-middle" style={{ background: g.color }} aria-hidden />
                    {g.title}
                    <span className="tabular ml-2 font-normal">
                      {g.rows.filter((r) => r.tumor > 0).length}/{g.rows.length}
                    </span>
                  </td>
                </tr>
                {g.rows.map((r) => {
                  const d = r.data
                  const id = r.cell.id
                  const isSel = selected === id
                  const nonProstate = r.cell.tissue !== 'prostate'
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
                          <span className="tabular font-medium text-ink">{r.cell.label}</span>
                          {nonProstate && <span className="text-xs text-ink-faint">{t(`prostate.tissue.${r.cell.tissue}`)}</span>}
                          {!r.valid && <AlertTriangle className="size-3.5 text-danger" aria-label={t('prostate.warnings.invalidCell', { label: r.cell.label })} />}
                        </div>
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
                        <td className="px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
                          <input type="checkbox" checked={d.idc} onChange={(e) => setCell(id, { idc: e.target.checked })} className="size-5 accent-[var(--color-accent)]" aria-label={t('prostate.table.idc')} />
                        </td>
                      )}
                      <td className="px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={d.margin}
                          onChange={(e) => setCell(id, { margin: e.target.checked })}
                          className="size-5 accent-[var(--color-danger)]"
                          aria-label={t('prostate.table.margin')}
                        />
                      </td>
                      {more && (
                        <td className="px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
                          {d.margin && (
                            <div className="flex items-center gap-1.5">
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
                            </div>
                          )}
                        </td>
                      )}
                      <td className="px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
                        {!nonProstate && (
                          <input
                            type="checkbox"
                            checked={d.epe !== 'none'}
                            onChange={(e) => setCell(id, { epe: e.target.checked ? 'focal' : 'none' })}
                            className="size-5 accent-[var(--color-accent)]"
                            aria-label={t('prostate.table.epe')}
                          />
                        )}
                      </td>
                      {more && (
                        <td className="px-2 py-1.5" onClick={(e) => e.stopPropagation()}>
                          {d.epe !== 'none' && !nonProstate && (
                            <select
                              value={d.epe}
                              onChange={(e) => setCell(id, { epe: e.target.value as CellData['epe'] })}
                              className="h-8 rounded-md border border-line bg-surface px-1.5 text-sm text-ink"
                              aria-label={t('prostate.table.epeType')}
                            >
                              <option value="focal">{t('prostate.epe.focal')}</option>
                              <option value="established">{t('prostate.epe.established')}</option>
                            </select>
                          )}
                        </td>
                      )}
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
