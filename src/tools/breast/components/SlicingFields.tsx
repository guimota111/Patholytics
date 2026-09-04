import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { BigChip } from '@/components/ui/didactic'
import { compactInputClass } from '@/components/ui/fields'
import { cn } from '@/lib/cn'
import { labelSpan, nextPrefix, planCassettes } from '../cassettes'
import { fmtLen } from '../format'
import { clampSlices, sliceThickness } from '../geometry'
import { newId } from '../storage'
import { AXES, AXIS_MARGINS, MARGINS, type Axis, type ExtraCassette, type MacroState, type Margin } from '../types'

interface SlicingFieldsProps {
  map: MacroState
  setMap: (fn: (m: MacroState) => MacroState) => void
  compact?: boolean
}

/** Passo 4: como a peça foi fatiada e quais outros cassetes foram submetidos. */
export function SlicingFields({ map, setMap, compact = false }: SlicingFieldsProps) {
  const { t, i18n } = useTranslation()
  const { slicing, specimen, units } = map
  const setSlicing = (patch: Partial<MacroState['slicing']>) =>
    setMap((m) => {
      const next = { ...m.slicing, ...patch }
      if (AXIS_MARGINS[next.axis].every((x) => x !== next.from)) next.from = AXIS_MARGINS[next.axis][1]
      return { ...m, slicing: next }
    })
  const setExtras = (fn: (list: ExtraCassette[]) => ExtraCassette[]) => setMap((m) => ({ ...m, extraCassettes: fn(m.extraCassettes) }))

  const plans = planCassettes(map)
  const [neg, pos] = AXIS_MARGINS[slicing.axis]

  const addPreset = (kind: 'margins' | 'nipple' | 'skin' | 'breast' | 'nodes') =>
    setExtras((list) => {
      const prefix = nextPrefixFor(map, list)
      let n = 1
      const mk = (description: string): ExtraCassette => ({ id: newId('x'), label: `${prefix}${n++}`, description })
      const rows: ExtraCassette[] = []
      if (kind === 'margins') MARGINS.forEach((m) => rows.push(mk(t('breast.slicing.presetMarginItem', { margin: t(`breast.margin.${m}`) }))))
      if (kind === 'nipple') rows.push(mk(t('breast.slicing.presetNippleItem')))
      if (kind === 'skin') rows.push(mk(t('breast.slicing.presetSkinItem')))
      if (kind === 'breast') rows.push(mk(t('breast.slicing.presetBreastItem')))
      if (kind === 'nodes') rows.push(mk(t('breast.slicing.presetNodesItem')))
      return [...list, ...rows]
    })

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-6">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-ink">{t('breast.slicing.axis')}</p>
          <div className="flex flex-wrap gap-2">
            {AXES.map((axis: Axis) => (
              <BigChip key={axis} active={slicing.axis === axis} onClick={() => setSlicing({ axis })}>
                {t(`breast.axisPlane.${axis}`)}
              </BigChip>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-ink">{t('breast.slicing.from')}</p>
          <div className="flex flex-wrap gap-2">
            {[pos, neg].map((m: Margin) => (
              <BigChip key={m} active={slicing.from === m} onClick={() => setSlicing({ from: m })}>
                {t(`breast.margin.${m}`)} →
              </BigChip>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="breast-slices" className="block text-sm font-medium text-ink">
            {t('breast.slicing.count')}
          </label>
          <input
            id="breast-slices"
            type="number"
            inputMode="numeric"
            min={1}
            max={60}
            value={slicing.count}
            onChange={(e) => setSlicing({ count: clampSlices(Number(e.target.value)) })}
            className="tabular h-12 w-24 rounded-lg border-2 border-line bg-surface px-3 text-center text-lg font-semibold text-ink hover:border-line-strong focus:border-accent"
          />
        </div>
        <p className="pb-3 text-sm text-ink-muted">
          {t('breast.slicing.thickness', { mm: fmtLen(sliceThickness(slicing, specimen.dims), units, i18n.language) })}
        </p>
      </div>

      <div className="rounded-md border border-line bg-surface px-4 py-3">
        <p className="text-xs font-medium text-ink-muted">{t('breast.slicing.keyTitle')}</p>
        <ul className="tabular mt-1.5 space-y-1 text-sm text-ink">
          {plans.map((p) => (
            <li key={p.lesion.id}>
              <span className="font-semibold">{labelSpan(p.grid)}</span>
              <span className="text-ink-muted">
                {' — '}
                {t('breast.slicing.keyGrid', { label: p.lesion.label, slice: p.central, rows: p.lesion.cassettes.rows, cols: p.lesion.cassettes.cols })}
              </span>
              {p.others.length > 0 && (
                <span className="text-ink-muted">
                  {' · '}
                  <span className="font-semibold text-ink">{labelSpan(p.others)}</span> {t('breast.slicing.keyOthers', { slices: [...new Set(p.others.map((c) => c.slice))].join(', ') })}
                </span>
              )}
            </li>
          ))}
          {map.extraCassettes.map((x) => (
            <li key={x.id}>
              <span className="font-semibold">{x.label || '?'}</span>
              <span className="text-ink-muted"> — {x.description}</span>
            </li>
          ))}
        </ul>
      </div>

      {!compact && (
        <div className="space-y-3">
          <p className="text-sm font-medium text-ink">{t('breast.slicing.extras')}</p>
          <div className="flex flex-wrap gap-2">
            {(['margins', 'nipple', 'skin', 'breast', 'nodes'] as const).map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => addPreset(k)}
                className="rounded-full border border-line bg-surface px-3 py-1 text-xs text-ink-muted hover:border-line-strong hover:text-ink"
              >
                + {t(`breast.slicing.preset.${k}`)}
              </button>
            ))}
          </div>
          {map.extraCassettes.length > 0 && (
            <ul className="space-y-1.5">
              {map.extraCassettes.map((x) => (
                <li key={x.id} className="flex items-center gap-2">
                  <input
                    value={x.label}
                    onChange={(e) => setExtras((list) => list.map((y) => (y.id === x.id ? { ...y, label: e.target.value } : y)))}
                    className={cn(compactInputClass, 'w-20 text-center')}
                    aria-label={t('breast.slicing.extraLabel')}
                  />
                  <input
                    value={x.description}
                    onChange={(e) => setExtras((list) => list.map((y) => (y.id === x.id ? { ...y, description: e.target.value } : y)))}
                    placeholder={t('breast.slicing.extraDescription')}
                    className={cn(compactInputClass, 'font-sans')}
                    aria-label={t('breast.slicing.extraDescription')}
                  />
                  <button
                    type="button"
                    onClick={() => setExtras((list) => list.filter((y) => y.id !== x.id))}
                    className="rounded p-1.5 text-ink-faint hover:bg-danger-soft hover:text-danger"
                    aria-label={t('breast.slicing.removeExtra')}
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => setExtras((list) => [...list, { id: newId('x'), label: `${nextPrefixFor(map, list)}1`, description: '' }])}
          >
            <Plus className="size-4" aria-hidden />
            {t('breast.slicing.addExtra')}
          </Button>
        </div>
      )}
    </div>
  )
}

/** Letra livre considerando as lesões e os extras já rotulados. */
function nextPrefixFor(map: MacroState, extras: ExtraCassette[]): string {
  const used = new Set([...map.lesions.map((l) => l.cassettes.prefix.toUpperCase()), ...extras.map((x) => x.label.replace(/[^A-Za-z]/g, '').toUpperCase())])
  const base = nextPrefix(map)
  if (!used.has(base)) return base
  for (let i = 0; i < 26; i++) {
    const c = String.fromCharCode(65 + i)
    if (!used.has(c)) return c
  }
  return 'Z'
}
