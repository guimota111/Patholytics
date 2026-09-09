import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { chartItems, formatShort, periodSummary, PERIODS, SEGMENTS, type Period, type Segment } from '../stats'
import type { HistoryDay } from '../types'

/** Casos por período, com o filtro de segmento (meus, terceiros, congelações). */
export function StatsPanel({ history }: { history: HistoryDay[] }) {
  const { t, i18n } = useTranslation()
  const [period, setPeriod] = useState<Period>('week')
  const [segment, setSegment] = useState<Segment>('all')

  const summary = useMemo(() => periodSummary(history, period, segment), [history, period, segment])
  const items = useMemo(() => chartItems(history, period, segment, i18n.language), [history, period, segment, i18n.language])
  const max = Math.max(1, ...items.map((item) => item.value))

  if (history.length === 0) {
    return <p className="rounded-lg border border-dashed border-line px-6 py-12 text-center text-sm text-ink-faint">{t('production.stats.empty')}</p>
  }

  const segmentCount: Record<Segment, number> = {
    all: summary.ownCases + summary.thirdCases,
    own: summary.ownCases,
    third: summary.thirdCases,
    frozen: summary.frozenCases,
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-1 rounded-lg border border-line bg-surface p-1">
        {PERIODS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPeriod(p)}
            aria-pressed={period === p}
            className={cn(
              'rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
              period === p ? 'bg-elevated text-ink shadow-subtle' : 'text-ink-muted hover:text-ink',
            )}
          >
            {t(`production.stats.period.${p}`)}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {SEGMENTS.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setSegment(s)}
            aria-pressed={segment === s}
            className={cn(
              'rounded-md border px-3 py-2.5 text-left transition-colors',
              segment === s ? 'border-accent bg-accent-soft' : 'border-line bg-elevated hover:border-line-strong',
            )}
          >
            <p className={cn('tabular text-lg font-semibold', segment === s ? 'text-accent-ink' : 'text-ink')}>
              {s === 'frozen' ? '❄ ' : ''}
              {segmentCount[s]}
            </p>
            <p className="text-xs text-ink-muted">{t(`production.stats.segment.${s}`)}</p>
          </button>
        ))}
      </div>

      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3 xl:grid-cols-6">
        {[
          { label: t('production.stats.summary.cases'), value: String(summary.cases) },
          { label: t('production.stats.summary.slides'), value: String(summary.slides) },
          { label: t('production.stats.summary.days'), value: String(summary.days) },
          { label: t('production.stats.summary.avgCase'), value: formatShort(summary.avgPerCase) },
          { label: t('production.stats.summary.avgSlide'), value: formatShort(summary.avgPerSlide) },
          { label: t('production.stats.summary.total'), value: formatShort(summary.workMs) },
        ].map((item) => (
          <div key={item.label} className="bg-elevated px-4 py-3">
            <dt className="text-[0.6875rem] tracking-wider text-ink-faint uppercase">{item.label}</dt>
            <dd className="tabular mt-0.5 text-lg font-semibold text-ink">{item.value}</dd>
          </div>
        ))}
      </dl>

      <section className="rounded-lg border border-line bg-elevated p-4 shadow-card">
        <h3 className="text-xs font-semibold tracking-wider text-ink-faint uppercase">{t('production.stats.chartTitle')}</h3>
        <div className="mt-4 flex h-40 items-end gap-1 overflow-x-auto">
          {items.map((item, index) => {
            const stacked = segment === 'all' && item.own + item.third > 0
            const height = (value: number) => `${Math.round((value / max) * 100)}%`
            return (
              <div key={`${item.label}-${index}`} className="flex h-full min-w-4 flex-1 flex-col items-center justify-end gap-1">
                {item.value > 0 && (
                  <span className="tabular text-[0.625rem] leading-none text-ink-faint">
                    {stacked && item.own > 0 && item.third > 0 ? `${item.own}+${item.third}` : item.value}
                  </span>
                )}
                <div className="flex w-full flex-1 flex-col items-stretch justify-end gap-px">
                  {stacked ? (
                    <>
                      {item.third > 0 && <div className="rounded-t-sm bg-amber-500" style={{ height: height(item.third) }} />}
                      {item.own > 0 && <div className="rounded-t-sm bg-accent" style={{ height: height(item.own) }} />}
                    </>
                  ) : (
                    <div
                      className={cn(
                        'rounded-t-sm',
                        segment === 'frozen' ? 'bg-cyan-500' : segment === 'third' ? 'bg-amber-500' : 'bg-accent',
                      )}
                      style={{ height: item.value > 0 ? height(item.value) : '0%' }}
                    />
                  )}
                </div>
                <span className="h-3 text-[0.625rem] text-ink-faint">{item.label}</span>
              </div>
            )
          })}
        </div>
        {segment === 'all' && (
          <div className="mt-3 flex gap-4 text-xs text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-accent" aria-hidden />
              {t('production.stats.legend.own')}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="size-2.5 rounded-sm bg-amber-500" aria-hidden />
              {t('production.stats.legend.third')}
            </span>
          </div>
        )}
      </section>
    </div>
  )
}
