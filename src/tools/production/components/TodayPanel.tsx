import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Pause, Play, Snowflake, Square, Trash2, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import {
  currentCaseDuration,
  currentFrozenDuration,
  currentPauseDuration,
  formatClock,
  formatShort,
  historyRefs,
  liveStats,
} from '../stats'
import { MAX_SLIDES, type CurrentSession, type HistoryDay } from '../types'
import type { Production } from '../useProduction'
import { SessionPie } from './SessionPie'
import { Speedometer } from './Speedometer'

interface TodayPanelProps {
  production: Production
  session: CurrentSession
  history: HistoryDay[]
}

/** A tela que fica aberta ao lado do microscópio: relógio, lâminas, registrar. */
export function TodayPanel({ production, session, history }: TodayPanelProps) {
  const { t, i18n } = useTranslation()
  const { now } = production
  const stats = liveStats(session, now)
  const [slides, setSlides] = useState('')

  const parsedSlides = Math.min(MAX_SLIDES, Math.max(0, Math.round(Number(slides))))
  const canRegister = session.state === 'working' && slides.trim() !== '' && Number.isFinite(parsedSlides)

  const register = (options: { thirdParty?: boolean; frozen?: boolean }) => {
    if (!canRegister) return
    production.registerCase(parsedSlides, options)
    setSlides('')
  }

  const onSubmit = (event: FormEvent) => {
    event.preventDefault()
    register({})
  }

  const refs = historyRefs(history)
  const meters = refs
    ? [
        { key: 'vsBest', icon: '🏆', ref: refs.bestAvg },
        { key: 'vsGeneral', icon: '📊', ref: refs.generalAvg },
        { key: 'vsMonthly', icon: '📅', ref: refs.monthlyAvg },
      ].filter((m) => m.ref > 0)
    : []

  if (session.state === 'idle') {
    return (
      <div className="rounded-lg border border-line bg-elevated px-6 py-14 text-center shadow-card">
        <p className="text-sm text-ink-muted">{t('production.today.idleHint')}</p>
        <Button type="button" size="lg" className="mt-5" onClick={production.startWork}>
          <Play className="size-4" aria-hidden />
          {t('production.today.start')}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* Relógios */}
      <div className="grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
        <Clock
          label={t('production.today.worked')}
          value={formatClock(stats.workMs)}
          tone={session.state === 'working' ? 'accent' : 'muted'}
        />
        {session.state === 'paused' ? (
          <Clock label={t('production.today.pausedFor')} value={formatClock(currentPauseDuration(session, now))} tone="warn" />
        ) : (
          <Clock label={t('production.today.currentCase')} value={formatClock(currentCaseDuration(session, now))} tone="ink" />
        )}
        <Clock label={t('production.today.paused')} value={formatClock(stats.pauseMs)} tone="muted" />
      </div>

      {/* Ações */}
      {session.state === 'ended' ? (
        <div className="rounded-lg border border-line bg-elevated px-5 py-6 text-center shadow-card">
          <p className="text-sm font-medium text-ink">{t('production.today.ended')}</p>
          <p className="mt-1 text-sm text-ink-muted">
            {t('production.today.endedSummary', { cases: stats.totalCases, slides: stats.totalSlides })}
          </p>
          <Button type="button" className="mt-4" onClick={production.newSession}>
            <Play className="size-4" aria-hidden />
            {t('production.today.newSession')}
          </Button>
        </div>
      ) : (
        <div className="rounded-lg border border-line bg-elevated p-5 shadow-card">
          <form onSubmit={onSubmit} className="flex flex-wrap items-end gap-3">
            <label className="flex-1 basis-40 space-y-1.5">
              <span className="block text-sm font-medium text-ink">{t('production.today.slidesLabel')}</span>
              <input
                type="number"
                inputMode="numeric"
                min={0}
                max={MAX_SLIDES}
                value={slides}
                onChange={(event) => setSlides(event.target.value)}
                disabled={session.state !== 'working'}
                placeholder={t('production.today.slidesPlaceholder')}
                className="tabular h-11 w-full rounded-md border border-line bg-surface px-3 text-base text-ink placeholder:text-ink-faint hover:border-line-strong disabled:opacity-50"
              />
            </label>
            <Button type="submit" size="lg" disabled={!canRegister}>
              {t('production.today.register')}
            </Button>
            <Button type="button" size="lg" variant="secondary" disabled={!canRegister} onClick={() => register({ thirdParty: true })}>
              <Users className="size-4" aria-hidden />
              {t('production.today.registerThird')}
            </Button>
          </form>

          {/* Congelação */}
          <div className="mt-4 rounded-md border border-line bg-surface px-4 py-3">
            {session.frozenStart ? (
              <div className="flex flex-wrap items-center gap-3">
                <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink">
                  <Snowflake className="size-4 text-accent" aria-hidden />
                  {t('production.today.frozenRunning')}
                </span>
                <span className="tabular text-sm text-accent-ink">{formatClock(currentFrozenDuration(session, now))}</span>
                <div className="ml-auto flex gap-2">
                  <Button type="button" size="sm" disabled={!canRegister} onClick={() => register({ frozen: true })}>
                    {t('production.today.frozenRegister')}
                  </Button>
                  <Button type="button" size="sm" variant="ghost" onClick={production.stopFrozen}>
                    {t('production.today.frozenCancel')}
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="text-sm text-ink-muted">{t('production.today.frozenHint')}</p>
                <Button type="button" size="sm" variant="secondary" disabled={session.state !== 'working'} onClick={production.startFrozen}>
                  <Snowflake className="size-4" aria-hidden />
                  {t('production.today.frozenStart')}
                </Button>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2 border-t border-line pt-4">
            {session.state === 'working' ? (
              <Button type="button" variant="secondary" onClick={production.pauseWork}>
                <Pause className="size-4" aria-hidden />
                {t('production.today.pause')}
              </Button>
            ) : (
              <Button type="button" onClick={production.resumeWork}>
                <Play className="size-4" aria-hidden />
                {t('production.today.resume')}
              </Button>
            )}
            <Button type="button" variant="danger" onClick={() => void production.endSession()}>
              <Square className="size-4" aria-hidden />
              {t('production.today.end')}
            </Button>
          </div>
        </div>
      )}

      {/* Números da sessão */}
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-4">
        <Stat label={t('production.today.cases')} value={String(stats.totalCases)} />
        <Stat label={t('production.today.slides')} value={String(stats.totalSlides)} />
        <Stat label={t('production.today.avgCase')} value={formatShort(stats.avgPerCase)} />
        <Stat label={t('production.today.avgSlide')} value={formatShort(stats.avgPerSlide)} />
      </dl>

      {/* Velocímetros e torta */}
      {stats.totalCases > 0 && (
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,18rem)]">
          {meters.length > 0 ? (
            <section className="rounded-lg border border-line bg-elevated p-4 shadow-card">
              <h3 className="text-xs font-semibold tracking-wider text-ink-faint uppercase">{t('production.speed.title')}</h3>
              <div className="mt-3 grid gap-3 sm:grid-cols-3">
                {meters.map((m) => (
                  <Speedometer key={m.key} label={t(`production.speed.${m.key}`)} icon={m.icon} currentMs={stats.avgPerCase} refMs={m.ref} />
                ))}
              </div>
            </section>
          ) : (
            <p className="self-center text-sm text-ink-faint">{t('production.speed.noHistory')}</p>
          )}
          <section className="rounded-lg border border-line bg-elevated p-4 shadow-card">
            <h3 className="text-xs font-semibold tracking-wider text-ink-faint uppercase">{t('production.pie.title')}</h3>
            <div className="mt-3">
              <SessionPie workMs={stats.workMs} pauseMs={stats.pauseMs} />
            </div>
          </section>
        </div>
      )}

      {/* Casos da sessão */}
      <section className="rounded-lg border border-line bg-elevated shadow-card">
        <h3 className="border-b border-line px-5 py-3 text-xs font-semibold tracking-wider text-ink-faint uppercase">
          {t('production.today.casesTitle')}
        </h3>
        {session.cases.length === 0 ? (
          <p className="px-5 py-6 text-center text-sm text-ink-faint">{t('production.today.noCases')}</p>
        ) : (
          <ul className="divide-y divide-line">
            {[...session.cases].reverse().map((entry) => (
              <li key={entry.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 px-5 py-2.5 text-sm">
                <span className="tabular font-medium text-ink">{t('production.today.caseN', { n: entry.id })}</span>
                <span className="tabular text-ink-muted">{t('production.today.slidesCount', { count: entry.slides })}</span>
                <span className="tabular text-ink-faint">{formatShort(entry.duration)}</span>
                {entry.thirdParty && (
                  <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2 py-0.5 text-[0.6875rem] font-medium text-amber-600 dark:text-amber-400">
                    {t('production.today.thirdBadge')}
                  </span>
                )}
                {entry.frozen && (
                  <span className="inline-flex items-center gap-1 rounded-full border border-accent/40 bg-accent-soft px-2 py-0.5 text-[0.6875rem] font-medium text-accent-ink">
                    <Snowflake className="size-3" aria-hidden />
                    {t('production.today.frozenBadge')}
                  </span>
                )}
                <span className="tabular ml-auto text-xs text-ink-faint">
                  {new Date(entry.endTime).toLocaleTimeString(i18n.language, { hour: '2-digit', minute: '2-digit' })}
                </span>
                {session.state !== 'ended' && (
                  <button
                    type="button"
                    onClick={() => production.deleteCase(entry.id)}
                    aria-label={t('production.today.deleteCase')}
                    className="rounded-md p-1 text-ink-faint transition-colors hover:bg-danger-soft hover:text-danger"
                  >
                    <Trash2 className="size-4" aria-hidden />
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}

function Clock({ label, value, tone }: { label: string; value: string; tone: 'accent' | 'ink' | 'muted' | 'warn' }) {
  return (
    <div className="bg-elevated px-5 py-4">
      <p className="text-[0.6875rem] tracking-wider text-ink-faint uppercase">{label}</p>
      <p
        className={cn(
          'tabular mt-1 text-3xl font-semibold tracking-tight',
          tone === 'accent' && 'text-accent-ink',
          tone === 'ink' && 'text-ink',
          tone === 'muted' && 'text-ink-muted',
          tone === 'warn' && 'text-amber-600 dark:text-amber-400',
        )}
      >
        {value}
      </p>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-elevated px-4 py-3">
      <dt className="text-[0.6875rem] tracking-wider text-ink-faint uppercase">{label}</dt>
      <dd className="tabular mt-0.5 text-lg font-semibold text-ink">{value}</dd>
    </div>
  )
}
