import { useTranslation } from 'react-i18next'
import { formatClock, pieSegments } from '../stats'

/** Trabalho contra pausa, numa torta. */
export function SessionPie({ workMs, pauseMs }: { workMs: number; pauseMs: number }) {
  const { t } = useTranslation()
  const total = workMs + pauseMs
  const segments = pieSegments(workMs, pauseMs)
  const workPct = total > 0 ? Math.round((workMs / total) * 100) : 100

  return (
    <div className="flex items-center gap-5 rounded-md border border-line bg-surface px-4 py-3">
      <svg viewBox="0 0 110 110" className="size-24 shrink-0" aria-hidden>
        {segments.pause && <path d={segments.pause} fill="var(--color-ink-faint)" opacity="0.55" />}
        {segments.work && <path d={segments.work} fill="var(--color-accent)" opacity="0.9" />}
        {!segments.work && !segments.pause && (
          <circle cx="55" cy="55" r="48" fill="none" stroke="var(--color-line)" strokeWidth="2" />
        )}
      </svg>
      <dl className="space-y-3">
        <div className="flex items-start gap-2">
          <span className="mt-1 size-2.5 rounded-sm bg-accent" aria-hidden />
          <div>
            <dt className="text-xs text-ink-faint">{t('production.pie.work')}</dt>
            <dd className="tabular text-sm font-semibold text-ink">
              {formatClock(workMs)} <span className="font-normal text-ink-faint">{workPct}%</span>
            </dd>
          </div>
        </div>
        <div className="flex items-start gap-2">
          <span className="mt-1 size-2.5 rounded-sm bg-ink-faint/60" aria-hidden />
          <div>
            <dt className="text-xs text-ink-faint">{t('production.pie.pauses')}</dt>
            <dd className="tabular text-sm font-semibold text-ink">
              {formatClock(pauseMs)} <span className="font-normal text-ink-faint">{100 - workPct}%</span>
            </dd>
          </div>
        </div>
      </dl>
    </div>
  )
}
