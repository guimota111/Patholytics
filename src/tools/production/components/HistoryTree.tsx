import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronRight, Snowflake, Trash2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { dayStats, formatShort, type DayStats } from '../stats'
import type { HistoryDay } from '../types'
import type { Production } from '../useProduction'

interface HistoryTreeProps {
  history: HistoryDay[]
  production: Production
}

/**
 * Ano → mês → dia → sessão, tudo recolhível. Os totais aparecem em cada
 * nível, e apagar existe em todos: o dia inteiro, uma sessão, um caso.
 */
export function HistoryTree({ history, production }: HistoryTreeProps) {
  const { t, i18n } = useTranslation()
  const [open, setOpen] = useState<Set<string>>(() => {
    const latest = history[history.length - 1]?.date
    return latest ? new Set([latest.slice(0, 4), latest.slice(0, 7)]) : new Set()
  })

  const toggle = (key: string) =>
    setOpen((current) => {
      const next = new Set(current)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })

  const tree = useMemo(() => {
    const years = new Map<string, Map<string, { day: HistoryDay; stats: DayStats }[]>>()
    for (const day of [...history].sort((a, b) => b.date.localeCompare(a.date))) {
      const year = day.date.slice(0, 4)
      const month = day.date.slice(0, 7)
      const months = years.get(year) ?? new Map()
      months.set(month, [...(months.get(month) ?? []), { day, stats: dayStats(day) }])
      years.set(year, months)
    }
    return years
  }, [history])

  const totals = useMemo(() => {
    const all = history.map(dayStats)
    const cases = all.reduce((sum, s) => sum + s.totalCases, 0)
    const slides = all.reduce((sum, s) => sum + s.totalSlides, 0)
    const ms = all.reduce((sum, s) => sum + s.totalMs, 0)
    return { days: all.length, cases, slides, avg: cases ? ms / cases : 0 }
  }, [history])

  const sum = (list: DayStats[], key: 'totalCases' | 'totalSlides' | 'totalMs') => list.reduce((acc, s) => acc + s[key], 0)

  if (history.length === 0) {
    return <p className="rounded-lg border border-dashed border-line px-6 py-12 text-center text-sm text-ink-faint">{t('production.history.empty')}</p>
  }

  const monthLabel = (key: string) => {
    const [y, m] = key.split('-').map(Number)
    const label = new Date(y, m - 1, 1).toLocaleDateString(i18n.language, { month: 'long' })
    return label.charAt(0).toUpperCase() + label.slice(1)
  }
  const dayLabel = (date: string) => {
    const [y, m, d] = date.split('-').map(Number)
    return new Date(y, m - 1, d).toLocaleDateString(i18n.language, { weekday: 'short', day: 'numeric', month: 'short' })
  }
  const time = (iso: string | null) =>
    iso ? new Date(iso).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' }) : '—'

  return (
    <div className="space-y-4">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
        <Total label={t('production.history.totals.days')} value={String(totals.days)} />
        <Total label={t('production.history.totals.cases')} value={String(totals.cases)} />
        <Total label={t('production.history.totals.slides')} value={String(totals.slides)} />
        <Total label={t('production.history.totals.avg')} value={formatShort(totals.avg)} />
      </dl>

      <div className="space-y-2">
        {[...tree.entries()].map(([year, months]) => {
          const yearStats = [...months.values()].flat().map((entry) => entry.stats)
          return (
            <section key={year} className="rounded-lg border border-line bg-elevated shadow-card">
              <Row
                open={open.has(year)}
                onToggle={() => toggle(year)}
                title={year}
                meta={t('production.history.yearMeta', { days: yearStats.length, cases: sum(yearStats, 'totalCases'), slides: sum(yearStats, 'totalSlides') })}
                level={0}
              />
              {open.has(year) &&
                [...months.entries()].map(([month, days]) => {
                  const monthStats = days.map((entry) => entry.stats)
                  const monthCases = sum(monthStats, 'totalCases')
                  return (
                    <div key={month} className="border-t border-line">
                      <Row
                        open={open.has(month)}
                        onToggle={() => toggle(month)}
                        title={monthLabel(month)}
                        meta={t('production.history.monthMeta', {
                          days: days.length,
                          cases: monthCases,
                          slides: sum(monthStats, 'totalSlides'),
                          avg: formatShort(monthCases ? sum(monthStats, 'totalMs') / monthCases : 0),
                        })}
                        level={1}
                      />
                      {open.has(month) &&
                        days.map(({ day, stats }) => (
                          <div key={day.date} className="border-t border-line">
                            <Row
                              open={open.has(day.date)}
                              onToggle={() => toggle(day.date)}
                              title={dayLabel(day.date)}
                              meta={t('production.history.dayMeta', {
                                cases: stats.totalCases,
                                slides: stats.totalSlides,
                                time: formatShort(stats.workMs),
                                sessions: stats.sessionCount,
                              })}
                              level={2}
                              onDelete={() => production.removeHistoryDay(day.date)}
                              deleteLabel={t('production.history.deleteDay')}
                            />
                            {open.has(day.date) &&
                              day.sessions.map((session, sessionIndex) => {
                                const key = `${day.date}-${sessionIndex}`
                                return (
                                  <div key={key} className="border-t border-line">
                                    <Row
                                      open={open.has(key)}
                                      onToggle={() => toggle(key)}
                                      title={t('production.history.sessionN', { n: sessionIndex + 1 })}
                                      meta={`${time(session.workStartTime)} – ${time(session.dayEndTime)} · ${t('production.history.sessionMeta', { cases: session.cases.length })}`}
                                      level={3}
                                      onDelete={() => production.removeHistorySession(day, sessionIndex)}
                                      deleteLabel={t('production.history.deleteSession')}
                                    />
                                    {open.has(key) && (
                                      <ul className="divide-y divide-line border-t border-line bg-surface">
                                        {session.cases.map((entry, caseIndex) => (
                                          <li key={`${key}-${caseIndex}`} className="flex flex-wrap items-center gap-x-3 gap-y-1 py-2 pr-4 pl-16 text-sm">
                                            <span className="tabular text-ink">{t('production.today.caseN', { n: entry.id })}</span>
                                            <span className="tabular text-ink-muted">{t('production.today.slidesCount', { count: entry.slides })}</span>
                                            <span className="tabular text-ink-faint">{formatShort(entry.duration)}</span>
                                            {entry.thirdParty && (
                                              <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[0.6875rem] font-medium text-amber-600 dark:text-amber-400">
                                                {t('production.today.thirdBadge')}
                                              </span>
                                            )}
                                            {entry.frozen && <Snowflake className="size-3.5 text-accent" aria-label={t('production.today.frozenBadge')} />}
                                            <span className="tabular ml-auto text-xs text-ink-faint">{time(entry.endTime)}</span>
                                            <ConfirmDelete label={t('production.history.deleteCase')} onConfirm={() => production.removeHistoryCase(day, sessionIndex, caseIndex)} />
                                          </li>
                                        ))}
                                      </ul>
                                    )}
                                  </div>
                                )
                              })}
                          </div>
                        ))}
                    </div>
                  )
                })}
            </section>
          )
        })}
      </div>
    </div>
  )
}

function Total({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-elevated px-4 py-3">
      <dt className="text-[0.6875rem] tracking-wider text-ink-faint uppercase">{label}</dt>
      <dd className="tabular mt-0.5 text-lg font-semibold text-ink">{value}</dd>
    </div>
  )
}

function Row({
  open,
  onToggle,
  title,
  meta,
  level,
  onDelete,
  deleteLabel,
}: {
  open: boolean
  onToggle: () => void
  title: string
  meta: string
  level: number
  onDelete?: () => void
  deleteLabel?: string
}) {
  return (
    <div className="flex items-center gap-2 pr-3" style={{ paddingLeft: `${0.75 + level * 1}rem` }}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex min-w-0 flex-1 items-center gap-2 py-2.5 text-left">
        {open ? <ChevronDown className="size-4 shrink-0 text-ink-faint" aria-hidden /> : <ChevronRight className="size-4 shrink-0 text-ink-faint" aria-hidden />}
        <span className={cn('truncate text-sm', level === 0 ? 'font-semibold text-ink' : level === 1 ? 'font-medium text-ink' : 'text-ink')}>{title}</span>
        <span className="tabular truncate text-xs text-ink-faint">{meta}</span>
      </button>
      {onDelete && deleteLabel && <ConfirmDelete label={deleteLabel} onConfirm={onDelete} />}
    </div>
  )
}

/** Apagar em dois cliques: o segundo confirma, e um clique fora desiste. */
function ConfirmDelete({ label, onConfirm }: { label: string; onConfirm: () => void }) {
  const { t } = useTranslation()
  const [armed, setArmed] = useState(false)
  if (armed) {
    return (
      <span className="flex items-center gap-1">
        <button type="button" onClick={onConfirm} className="rounded-md bg-danger px-2 py-1 text-xs font-medium text-white">
          {t('production.history.confirm')}
        </button>
        <button type="button" onClick={() => setArmed(false)} className="rounded-md px-2 py-1 text-xs text-ink-muted hover:text-ink">
          {t('common.cancel')}
        </button>
      </span>
    )
  }
  return (
    <button
      type="button"
      onClick={() => setArmed(true)}
      aria-label={label}
      title={label}
      className="rounded-md p-1 text-ink-faint transition-colors hover:bg-danger-soft hover:text-danger"
    >
      <Trash2 className="size-4" aria-hidden />
    </button>
  )
}
