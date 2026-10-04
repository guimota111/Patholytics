import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { BigChip } from '@/components/ui/didactic'
import { NumField, SelectField, Toggle, compactInputClass } from '@/components/ui/fields'
import { cn } from '@/lib/cn'
import { inheritedPrefix, planLesionCassettes } from '../cassettes'
import { fmtLen } from '../format'
import { clockPosition, containCenter, derivedQuadrant, lesionGap, marginDistances, sliceRange, suggestCenter } from '../geometry'
import { INK_HEX, lesionColor } from '../inks'
import { makeLesion, NO_MEASURED } from '../storage'
import {
  AXIS_MARGINS,
  LESION_COLORS,
  LESION_CONSISTENCIES,
  LESION_KINDS,
  LESION_SHAPES,
  MAX_LESIONS,
  type Axis,
  type CassettePlan,
  type Lesion,
  type MacroState,
  type Point3,
} from '../types'
import { CassettePlanner } from './CassettePlanner'
import { PositionPad } from './PositionPad'

interface LesionEditorProps {
  map: MacroState
  setMap: (fn: (m: MacroState) => MacroState) => void
  selected: string | null
  onSelect: (id: string | null) => void
  /** Laudagem: sem cor/consistência, só geometria e cassetes. */
  compact?: boolean
}

/** Passo 3: cada lesão com tamanho, posição (pad ou distâncias), descrição e plano de cassetes. */
export function LesionEditor({ map, setMap, selected, onSelect, compact = false }: LesionEditorProps) {
  const { t, i18n } = useTranslation()
  const { specimen, units } = map
  const dims = specimen.dims
  const selectedId = map.lesions.some((l) => l.id === selected) ? (selected as string) : (map.lesions[0]?.id ?? '')

  const update = (id: string, patch: Partial<Lesion> | ((l: Lesion) => Lesion)) =>
    setMap((m) => ({
      ...m,
      lesions: m.lesions.map((l) => (l.id === id ? (typeof patch === 'function' ? patch(l) : { ...l, ...patch }) : l)),
    }))
  const move = (id: string, center: Point3) => update(id, (l) => ({ ...l, center: containCenter({ ...l, center }, specimen) }))
  const setPlan = (id: string, patch: Partial<CassettePlan>) => update(id, (l) => ({ ...l, cassettes: { ...l.cassettes, ...patch } }))
  const remove = (id: string) => {
    setMap((m) => ({ ...m, lesions: m.lesions.filter((l) => l.id !== id) }))
    if (selected === id) onSelect(null)
  }
  const add = () =>
    setMap((m) => {
      if (m.lesions.length >= MAX_LESIONS) return m
      // A lesão nova continua na letra da peça; o número segue de onde a
      // anterior parou, e cabe dentro da peça desde o primeiro desenho.
      const draft = makeLesion({
        label: String(m.lesions.length + 1),
        center: suggestCenter(m),
        size: { ml: 12, si: 10, ap: 8 },
        cassettes: { prefix: inheritedPrefix(m), start: null, slice: null, rows: 1, cols: 2, perOtherSlice: 1 },
      })
      const lesion = { ...draft, center: containCenter(draft, m.specimen) }
      onSelect(lesion.id)
      return { ...m, lesions: [...m.lesions, lesion] }
    })

  return (
    <div className="space-y-4">
      {map.lesions.length === 0 && <p className="text-sm text-ink-muted">{t('breast.lesion.empty')}</p>}

      {map.lesions.map((l, index) => {
        const isSel = l.id === selectedId
        const distances = marginDistances(l, dims)
        const closest = distances.reduce((a, b) => (b.mm < a.mm ? b : a))
        const plan = planLesionCassettes(l, map)
        return (
          <section
            key={l.id}
            onClick={() => onSelect(l.id)}
            className={cn('rounded-lg border bg-surface transition-colors', isSel ? 'border-accent/60 shadow-card' : 'border-line')}
          >
            <header className="flex flex-wrap items-center gap-3 border-b border-line px-4 py-3">
              <span className="inline-block size-3.5 rounded-full" style={{ background: lesionColor(index) }} aria-hidden />
              <label className="flex items-center gap-2 text-sm font-medium text-ink">
                {t('breast.lesion.label')}
                <input
                  value={l.label}
                  onChange={(e) => update(l.id, { label: e.target.value })}
                  className={cn(compactInputClass, 'w-16 text-center')}
                  aria-label={t('breast.lesion.label')}
                />
              </label>
              <span className="tabular text-xs text-ink-faint">
                {t('breast.lesion.slicesShort', { slices: sliceRange(plan), central: plan.mapped })}
              </span>
              <span className="text-xs text-ink-faint">
                · {t('breast.lesion.closestShort', { margin: t(`breast.margin.${closest.margin}`), mm: fmtLen(closest.mm, units, i18n.language) })}
              </span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation()
                  remove(l.id)
                }}
                className="ml-auto rounded p-1.5 text-ink-faint hover:bg-danger-soft hover:text-danger"
                aria-label={t('breast.lesion.remove')}
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </header>

            <div className="grid gap-5 px-4 py-4 xl:grid-cols-[minmax(0,1fr)_auto]">
              <div className="space-y-4">
                <div className="flex flex-wrap gap-6">
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-ink-muted">{t('breast.lesion.kind')}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {LESION_KINDS.map((v) => (
                        <BigChip key={v} active={l.kind === v} onClick={() => update(l.id, { kind: v })} className="px-3 py-1.5 text-sm">
                          {t(`breast.lesionKind.${v}`)}
                        </BigChip>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <p className="text-xs font-medium text-ink-muted">{t('breast.lesion.shape')}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {LESION_SHAPES.map((v) => (
                        <BigChip key={v} active={l.shape === v} onClick={() => update(l.id, { shape: v })} className="px-3 py-1.5 text-sm">
                          {t(`breast.lesionShape.${v}`)}
                        </BigChip>
                      ))}
                    </div>
                  </div>
                </div>

                <div>
                  <p className="mb-1.5 text-xs font-medium text-ink-muted">{t('breast.lesion.size')}</p>
                  <div className="grid grid-cols-3 gap-3">
                    {(['ml', 'si', 'ap'] as Axis[]).map((axis) => (
                      <NumField
                        key={axis}
                        label={t(`breast.axisShort.${axis}`)}
                        value={l.size[axis]}
                        min={0}
                        decimals
                        unit="mm"
                        onChange={(v) =>
                          update(l.id, (cur) => {
                            const grown = { ...cur, size: { ...cur.size, [axis]: v } }
                            return { ...grown, center: containCenter(grown, specimen) }
                          })
                        }
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <div className="mb-1.5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <p className="text-xs font-medium text-ink-muted">{t('breast.lesion.distances')}</p>
                    <button
                      type="button"
                      onClick={() =>
                        update(l.id, (cur) => ({
                          ...cur,
                          measured: Object.fromEntries(
                            marginDistances(cur, dims).map((d) => [d.margin, Math.round(d.modelMm * 10) / 10]),
                          ) as Lesion['measured'],
                        }))
                      }
                      className="inline-flex min-h-9 items-center text-xs text-accent hover:underline sm:min-h-0"
                    >
                      {t('breast.lesion.fillFromModel')}
                    </button>
                    {distances.some((d) => d.fromRuler) && (
                      <button
                        type="button"
                        onClick={() => update(l.id, { measured: { ...NO_MEASURED } })}
                        className="text-xs text-ink-faint hover:text-ink hover:underline"
                      >
                        {t('breast.lesion.clearMeasured')}
                      </button>
                    )}
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {(['si', 'ml', 'ap'] as Axis[]).map((axis) => {
                      const [neg, pos] = AXIS_MARGINS[axis]
                      return (
                        <div key={axis} className="space-y-2 rounded-md border border-line bg-elevated px-3 py-2">
                          {[pos, neg].map((margin) => {
                            const d = distances.find((x) => x.margin === margin)!
                            return (
                              <label key={margin} className="flex items-center gap-2 text-sm">
                                <span className="inline-block size-3 shrink-0 rounded-full border border-line" style={{ background: INK_HEX[map.inks[margin]] }} aria-hidden />
                                <span className="w-20 shrink-0 text-ink-muted">{t(`breast.margin.${margin}`)}</span>
                                <input
                                  type="number"
                                  inputMode="decimal"
                                  step="0.5"
                                  min={0}
                                  value={Math.round(d.mm * 10) / 10}
                                  onChange={(e) => {
                                    // O que ele digita fica; apagar o campo devolve o valor do modelo.
                                    const v = e.target.value === '' ? null : Math.max(0, Number(e.target.value) || 0)
                                    update(l.id, (cur) => ({ ...cur, measured: { ...cur.measured, [margin]: v } }))
                                  }}
                                  onFocus={(e) => e.currentTarget.select()}
                                  title={d.fromRuler ? t('breast.lesion.measuredHint', { mm: Math.round(d.modelMm * 10) / 10 }) : t('breast.lesion.modelHint')}
                                  className={cn(
                                    compactInputClass,
                                    'w-20',
                                    d.fromRuler ? 'border-accent/70 font-semibold text-ink' : 'text-ink-muted',
                                    d.reached && 'border-danger text-danger',
                                  )}
                                  aria-label={`${t('breast.lesion.distanceTo')} ${t(`breast.margin.${margin}`)}`}
                                />
                                <span className="text-xs text-ink-faint">mm</span>
                              </label>
                            )
                          })}
                        </div>
                      )
                    })}
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-ink-faint">{t('breast.lesion.distancesHint')}</p>
                  <p className="mt-1 text-xs text-ink-faint">
                    {closest.reached
                      ? t('breast.lesion.reaches', { margin: t(`breast.margin.${closest.margin}`) })
                      : t('breast.lesion.closest', { margin: t(`breast.margin.${closest.margin}`), mm: fmtLen(closest.mm, units, i18n.language) })}
                    {specimen.type === 'mastectomy' && (
                      <>
                        {' · '}
                        {(() => {
                          const c = clockPosition(l, specimen.side)
                          const q = t(`breast.quadrant.${derivedQuadrant(l)}`)
                          return c.hour === null
                            ? t('breast.lesion.retroareolar')
                            : t('breast.lesion.clock', { quadrant: q, hour: c.hour, mm: fmtLen(c.fromNippleMm, units, i18n.language) })
                        })()}
                      </>
                    )}
                  </p>
                </div>

                {!compact && (
                  <div className="grid gap-3 sm:grid-cols-3">
                    <SelectField
                      label={t('breast.lesion.color')}
                      value={l.color}
                      onChange={(v) => update(l.id, { color: v as Lesion['color'] })}
                      options={LESION_COLORS.map((v) => ({ value: v, label: v ? t(`breast.lesionColor.${v}`) : '—' }))}
                    />
                    <SelectField
                      label={t('breast.lesion.consistency')}
                      value={l.consistency}
                      onChange={(v) => update(l.id, { consistency: v as Lesion['consistency'] })}
                      options={LESION_CONSISTENCIES.map((v) => ({ value: v, label: v ? t(`breast.lesionConsistency.${v}`) : '—' }))}
                    />
                    <div className="flex items-end pb-2">
                      <Toggle checked={l.clip} onChange={(v) => update(l.id, { clip: v })} label={t('breast.lesion.clip')} />
                    </div>
                  </div>
                )}

                <CassettePlanner lesion={l} map={map} plan={plan} index={index} onChange={(patch) => setPlan(l.id, patch)} />

              </div>

              <div className="flex flex-wrap gap-4 xl:flex-col" onClick={(e) => e.stopPropagation()}>
                <PositionPad dims={dims} inks={map.inks} side={specimen.side} lesions={map.lesions} selectedId={l.id} onMove={move} plane="frontal" />
                <PositionPad dims={dims} inks={map.inks} side={specimen.side} lesions={map.lesions} selectedId={l.id} onMove={move} plane="axial" />
              </div>
            </div>
          </section>
        )
      })}

      {map.lesions.length > 1 && (
        <ul className="space-y-1 text-sm text-ink-muted">
          {map.lesions.flatMap((a, i) =>
            map.lesions.slice(i + 1).map((b) => {
              const gap = lesionGap(a, b)
              return (
                <li key={`${a.id}-${b.id}`} className="tabular">
                  {gap <= 0.05
                    ? t('breast.lesion.touch', { a: a.label, b: b.label })
                    : t('breast.lesion.gap', { a: a.label, b: b.label, mm: fmtLen(gap, units, i18n.language) })}
                </li>
              )
            }),
          )}
        </ul>
      )}

      <Button type="button" size="sm" variant="secondary" onClick={add} disabled={map.lesions.length >= MAX_LESIONS}>
        <Plus className="size-4" aria-hidden />
        {t('breast.lesion.add')}
      </Button>
    </div>
  )
}
