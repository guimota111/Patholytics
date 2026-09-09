import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { formatShort, records, type RecordEntry } from '../stats'
import type { HistoryDay } from '../types'

/** Os melhores dias, semanas e meses — o que dá vontade de bater. */
export function RecordsPanel({ history }: { history: HistoryDay[] }) {
  const { t, i18n } = useTranslation()
  const data = useMemo(() => records(history), [history])

  if (!data) {
    return <p className="rounded-lg border border-dashed border-line px-6 py-12 text-center text-sm text-ink-faint">{t('production.records.empty')}</p>
  }

  const dateLabel = (date?: string) => {
    if (!date) return ''
    const [y, m, d] = date.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString(i18n.language, { weekday: 'short', day: 'numeric', month: 'short' })
  }
  const monthLabel = (key?: string) => {
    if (!key) return ''
    const [y, m] = key.split('-').map(Number)
    const label = new Date(y, m - 1, 1).toLocaleDateString(i18n.language, { month: 'long', year: 'numeric' })
    return label.charAt(0).toUpperCase() + label.slice(1)
  }
  const daysLabel = (entry: RecordEntry | null) => (entry?.days ? t('production.records.daysCount', { count: entry.days }) : '')

  const sections: { title: string; cards: { icon: string; value: string; label: string; meta: string; gold?: boolean }[] }[] = [
    {
      title: t('production.records.dayTitle'),
      cards: [
        { icon: '🏆', value: String(data.bestDayCases?.value ?? '—'), label: t('production.records.mostCasesDay'), meta: dateLabel(data.bestDayCases?.date), gold: true },
        { icon: '🔬', value: String(data.bestDaySlides?.value ?? '—'), label: t('production.records.mostSlidesDay'), meta: dateLabel(data.bestDaySlides?.date) },
        { icon: '⚡', value: data.bestDaySpeed ? formatShort(data.bestDaySpeed.value) : '—', label: t('production.records.bestAvg'), meta: dateLabel(data.bestDaySpeed?.date) },
        { icon: '📅', value: String(data.totalDays), label: t('production.records.totalDays'), meta: '' },
      ],
    },
    {
      title: t('production.records.weekTitle'),
      cards: [
        { icon: '📈', value: String(data.bestWeekCases?.value ?? '—'), label: t('production.records.mostCasesWeek'), meta: daysLabel(data.bestWeekCases), gold: true },
        { icon: '🔬', value: String(data.bestWeekSlides?.value ?? '—'), label: t('production.records.mostSlidesWeek'), meta: daysLabel(data.bestWeekSlides) },
      ],
    },
    {
      title: t('production.records.monthTitle'),
      cards: [
        { icon: '🏅', value: String(data.bestMonthCases?.value ?? '—'), label: t('production.records.mostCasesMonth'), meta: monthLabel(data.bestMonthCases?.monthKey), gold: true },
        { icon: '🔬', value: String(data.bestMonthSlides?.value ?? '—'), label: t('production.records.mostSlidesMonth'), meta: monthLabel(data.bestMonthSlides?.monthKey) },
      ],
    },
  ]

  return (
    <div className="space-y-6">
      {sections.map((section) => (
        <section key={section.title}>
          <h3 className="text-xs font-semibold tracking-wider text-ink-faint uppercase">{section.title}</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {section.cards.map((card) => (
              <div
                key={card.label}
                className={cn(
                  'rounded-lg border bg-elevated px-4 py-4 text-center shadow-card',
                  card.gold ? 'border-amber-400/60' : 'border-line',
                )}
              >
                <p className="text-2xl" aria-hidden>
                  {card.icon}
                </p>
                <p className="tabular mt-1 text-2xl font-semibold tracking-tight text-ink">{card.value}</p>
                <p className="mt-1 text-xs text-ink-muted">{card.label}</p>
                {card.meta && <p className="tabular mt-1 text-xs text-ink-faint">{card.meta}</p>}
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
