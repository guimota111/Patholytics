import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Play, RotateCcw, Snowflake } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { cronElapsedMs, fmtCronClock, fmtHoraCurta } from '../text'
import { defaultCron, type Cron } from '../types'

interface IsquemiaCronProps {
  cron: Cron
  now: number
  onChange: (cron: Cron) => void
  hint: string
}

/** Cronômetro de isquemia fria: apertado na chegada da peça, parado no formol. */
export function IsquemiaCron({ cron, now, onChange, hint }: IsquemiaCronProps) {
  const { t } = useTranslation()
  const [confirmReset, setConfirmReset] = useState(false)
  const running = Boolean(cron.inicio) && !cron.formol

  return (
    <div
      className={cn(
        'flex flex-wrap items-center gap-x-3 gap-y-2 rounded-md border px-3.5 py-2.5',
        running ? 'border-accent/50 bg-accent-soft/40' : 'border-line bg-surface',
      )}
    >
      <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink">
        <Snowflake className="size-4 text-accent" aria-hidden />
        {t('frozen.cron.label')}
      </span>

      {!cron.inicio ? (
        <>
          <Button type="button" size="sm" variant="secondary" onClick={() => onChange({ inicio: new Date().toISOString(), formol: null })}>
            <Play className="size-4" aria-hidden />
            {t('frozen.cron.start')}
          </Button>
          <span className="text-xs text-ink-faint">{hint}</span>
        </>
      ) : (
        <>
          <span className={cn('tabular text-lg font-semibold', running ? 'text-accent-ink' : 'text-ink')}>{fmtCronClock(cronElapsedMs(cron, now))}</span>
          <span className="tabular text-xs text-ink-faint">
            {t('frozen.cron.startedAt', { time: fmtHoraCurta(cron.inicio) })}
            {cron.formol ? ` → ${t('frozen.cron.formolAt', { time: fmtHoraCurta(cron.formol) })}` : ''}
          </span>
          {running && (
            <Button type="button" size="sm" onClick={() => onChange({ ...cron, formol: new Date().toISOString() })}>
              {t('frozen.cron.formol')}
            </Button>
          )}
          {confirmReset ? (
            <span className="ml-auto flex items-center gap-1">
              <Button
                type="button"
                size="sm"
                variant="danger"
                onClick={() => {
                  onChange(defaultCron())
                  setConfirmReset(false)
                }}
              >
                {t('frozen.cron.resetConfirm')}
              </Button>
              <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmReset(false)}>
                {t('common.cancel')}
              </Button>
            </span>
          ) : (
            <Button type="button" size="sm" variant="ghost" className="ml-auto" onClick={() => setConfirmReset(true)} aria-label={t('frozen.cron.reset')}>
              <RotateCcw className="size-4" aria-hidden />
            </Button>
          )}
        </>
      )}
    </div>
  )
}
