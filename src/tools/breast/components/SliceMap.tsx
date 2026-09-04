import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { planCassettes } from '../cassettes'
import { lesionSlices, slicesWithLesions } from '../geometry'
import { caColor, caTextColor, LVI_HEX, MARGIN_HEX, type Theme } from '../heat'
import { lesionColor } from '../inks'
import { AXIS_MARGINS, MARGIN_SIGN, type MacroState, type MicroCell } from '../types'

interface SliceMapProps {
  map: MacroState
  theme: Theme
  /** Laudagem: pinta os cassetes de cada fatia pela celularidade. */
  cells?: Record<string, MicroCell>
  selectedLesion: string | null
  onSelectLesion: (id: string | null) => void
  selectedCassette?: string | null
  onSelectCassette?: (id: string | null) => void
}

/**
 * Mapa 2D: uma fila de fatias na ordem de numeração; cada fatia mostra as
 * lesões que a atravessam (na cor da lesão, anel no maior corte) e, na
 * laudagem, os cassetes daquela fatia coloridos pela celularidade.
 */
export function SliceMap({ map, theme, cells, selectedLesion, onSelectLesion, selectedCassette, onSelectCassette }: SliceMapProps) {
  const { t } = useTranslation()
  const rows = slicesWithLesions(map)
  const plans = planCassettes(map)
  const index = new Map(map.lesions.map((l, i) => [l.id, i]))
  const centrals = new Map(map.lesions.map((l) => [l.id, lesionSlices(l, map.slicing, map.specimen.dims).central]))
  const [neg, pos] = AXIS_MARGINS[map.slicing.axis]
  const to = MARGIN_SIGN[map.slicing.from] === -1 ? pos : neg

  return (
    <div>
      <p className="mb-2 text-xs text-ink-faint">
        {t('breast.map.direction', { from: t(`breast.margin.${map.slicing.from}`), to: t(`breast.margin.${to}`) })}
      </p>
      <div className="flex flex-wrap gap-2">
        {rows.map((r) => {
          const first = r.lesionIds[0]
          const idx = first ? (index.get(first) ?? 0) : -1
          const cassettes = cells ? plans.flatMap((p) => p.all.filter((c) => c.slice === r.slice)) : []
          const hasSel = selectedLesion !== null && r.lesionIds.includes(selectedLesion)
          return (
            <div key={r.slice} className="flex flex-col items-center gap-1">
              <button
                type="button"
                onClick={() => onSelectLesion(first && first !== selectedLesion ? first : null)}
                title={r.lesionIds.length ? r.lesionIds.map((id) => t('breast.map.lesionN', { n: map.lesions[index.get(id) ?? 0]?.label })).join(', ') : undefined}
                className={cn(
                  'tabular relative flex size-10 items-center justify-center rounded-md text-sm font-semibold ring-1 ring-line transition-shadow',
                  hasSel && 'ring-2 ring-accent ring-offset-2 ring-offset-elevated',
                  idx >= 0 ? 'text-white' : 'bg-surface text-ink-muted',
                )}
                style={idx >= 0 ? { background: lesionColor(idx) } : undefined}
              >
                {r.slice}
                {r.lesionIds.some((id) => centrals.get(id) === r.slice) && (
                  <span className="absolute -top-1 -right-1 size-3 rounded-full border-2 border-elevated bg-ink" aria-hidden />
                )}
                {r.lesionIds.length > 1 && (
                  <span className="absolute -bottom-1 left-1/2 flex -translate-x-1/2 gap-0.5" aria-hidden>
                    {r.lesionIds.map((id) => (
                      <span key={id} className="size-2 rounded-full border border-elevated" style={{ background: lesionColor(index.get(id) ?? 0) }} />
                    ))}
                  </span>
                )}
              </button>
              {cells && cassettes.length > 0 && (
                <div className="flex max-w-24 flex-wrap justify-center gap-0.5">
                  {cassettes.map((c) => {
                    const cell = cells[c.id]
                    const ca = cell?.ca ?? null
                    const sel = selectedCassette === c.id
                    return (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => onSelectCassette?.(sel ? null : c.id)}
                        title={`${c.label}${ca !== null ? ` · ${ca}%` : ''}`}
                        className={cn('tabular flex h-5 min-w-6 items-center justify-center rounded px-1 text-[0.6rem] font-semibold', sel && 'ring-2 ring-accent')}
                        style={{
                          background: caColor(ca, theme),
                          color: caTextColor(ca, theme),
                          boxShadow: cell?.margin ? `inset 0 0 0 2px ${MARGIN_HEX}` : cell?.lvi ? `inset 0 0 0 2px ${LVI_HEX}` : undefined,
                        }}
                      >
                        {c.label}
                      </button>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-faint">
        {map.lesions.map((l, i) => (
          <span key={l.id} className="inline-flex items-center gap-1.5">
            <span className="inline-block size-3 rounded-sm" style={{ background: lesionColor(i) }} />
            {t('breast.map.lesionN', { n: l.label })}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-full bg-ink" />
          {t('breast.map.legendCentral')}
        </span>
        {cells && (
          <>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block size-3 rounded-sm" style={{ background: caColor(60, theme) }} />
              {t('breast.map.legendCa')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="inline-block size-3 rounded-sm" style={{ background: caColor(0, theme) }} />
              {t('breast.map.legendClear')}
            </span>
          </>
        )}
      </div>
    </div>
  )
}
