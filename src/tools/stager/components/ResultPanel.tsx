import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Check, Copy, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SHOW_STAGE_GROUP } from '../config'
import type { CalculatorResult } from '../types'

interface ResultPanelProps {
  result: CalculatorResult
  onReset: () => void
}

export function ResultPanel({ result, onReset }: ResultPanelProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  const report = result.report ?? ''

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const handleCopy = async () => {
    if (!report) return
    try {
      await navigator.clipboard.writeText(report)
    } catch {
      // Contextos sem permissao de clipboard (http, iframe) caem aqui.
      return
    }
    setCopied(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="rounded-lg border border-line bg-elevated shadow-card">
      <div className="flex items-center gap-2 border-b border-line px-5 py-4">
        <span className="size-1.5 rounded-full bg-accent" aria-hidden />
        <h2 className="text-sm font-semibold tracking-tight text-ink">{t('stager.result')}</h2>
      </div>

      <div className="space-y-5 px-5 py-5">
        {result.tnm && result.tnm.length > 0 && (
          <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-md border border-line bg-line">
            {result.tnm.map((badge) => (
              <div key={badge.k} className="bg-surface px-3 py-2.5">
                <dt className="text-xs tracking-wider text-ink-faint uppercase">{badge.k}</dt>
                <dd className="tabular mt-1 text-sm font-medium text-accent-ink">
                  {badge.v ?? '—'}
                </dd>
              </div>
            ))}
          </dl>
        )}

        {SHOW_STAGE_GROUP && result.stageGroup && (
          <div className="flex items-center justify-between rounded-md border border-line bg-surface px-3 py-2.5">
            <span className="text-xs tracking-wider text-ink-faint uppercase">
              {t('stager.stageGroup')}
            </span>
            <span className="tabular text-sm font-medium text-ink">{result.stageGroup}</span>
          </div>
        )}

        {result.warnings?.map((warning) => (
          <p
            key={warning}
            className="flex items-start gap-2 rounded-md border border-line-strong bg-surface px-3 py-2.5 text-xs leading-relaxed text-ink-muted"
          >
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-accent" aria-hidden />
            {warning}
          </p>
        ))}

        <div className="space-y-1.5">
          <label
            htmlFor="stager-report"
            className="block text-xs tracking-wider text-ink-faint uppercase"
          >
            {t('stager.reportLabel')}
          </label>
          <textarea
            id="stager-report"
            readOnly
            rows={4}
            value={report}
            placeholder={t('stager.reportPlaceholder')}
            className="w-full resize-y rounded-md border border-line bg-surface px-3 py-2.5 text-sm leading-relaxed text-ink placeholder:text-ink-faint"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" onClick={() => void handleCopy()} disabled={!report}>
            {copied ? (
              <Check className="size-4" aria-hidden />
            ) : (
              <Copy className="size-4" aria-hidden />
            )}
            {copied ? t('stager.copied') : t('stager.copy')}
          </Button>
          <Button type="button" variant="secondary" onClick={onReset}>
            <RotateCcw className="size-4" aria-hidden />
            {t('stager.reset')}
          </Button>
        </div>
      </div>
    </div>
  )
}
