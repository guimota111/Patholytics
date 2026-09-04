import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Check, Copy, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import type { Bill, Diff } from '../case'
import { CODES, type CodeKey } from '../codes'
import { Stepper } from './controls'

export function BillPanel({
  bill,
  diff,
  billed,
  onBilled,
  onCopy,
  onClear,
  empty,
}: {
  bill: Bill
  diff: Diff
  billed: Partial<Record<CodeKey, number>>
  onBilled: (code: CodeKey, qty: number) => void
  onCopy: () => Promise<boolean>
  onClear: () => void
  empty: boolean
}) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const copy = async () => {
    if (!(await onCopy())) return
    setCopied(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1600)
  }

  const expression = bill.lines.map((l) => `${CODES[l.code].code} × ${l.qty}`).join('  +  ')

  return (
    <div className="space-y-4">
      <section className="overflow-hidden rounded-xl border-2 border-accent/40 bg-accent-soft shadow-card">
        <div className="border-b border-accent/20 px-4 py-3.5 sm:px-5">
          <h2 className="text-xs font-semibold tracking-wider text-accent-ink uppercase">{t('billing.shouldTitle')}</h2>
          <p className="tabular mt-1 text-lg leading-snug font-bold break-words text-accent-ink">{expression || '—'}</p>
        </div>

        {empty ? (
          <p className="px-4 py-6 text-center text-sm text-ink-muted sm:px-5">{t('billing.emptyBill')}</p>
        ) : (
          <ul className="divide-y divide-accent/20">
            {bill.lines.map((l) => (
              <li key={l.code} className="px-4 py-3 sm:px-5">
                <div className="flex items-baseline gap-3">
                  <span className="tabular text-sm font-semibold text-ink">{CODES[l.code].code}</span>
                  <span className="tabular text-lg font-bold text-accent-ink">× {l.qty}</span>
                </div>
                <p className="mt-0.5 text-xs leading-relaxed text-ink">{CODES[l.code].name}</p>
                <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{l.reasons.join(' · ')}</p>
              </li>
            ))}
          </ul>
        )}

        <div className="flex flex-wrap gap-2 border-t border-accent/20 px-4 py-3 sm:px-5">
          <Button type="button" size="sm" onClick={() => void copy()} disabled={empty}>
            {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
            {copied ? t('billing.copied') : t('billing.copy')}
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={onClear} disabled={empty}>
            <RotateCcw className="size-4" aria-hidden />
            {t('billing.newCase')}
          </Button>
        </div>
      </section>

      {bill.warnings.length > 0 && (
        <div className="rounded-lg border-2 border-danger/40 bg-danger-soft px-4 py-3">
          <p className="text-xs font-semibold tracking-wider text-danger uppercase">{t('billing.warnings')}</p>
          <ul className="mt-1.5 space-y-1.5 text-xs leading-relaxed text-ink">
            {bill.warnings.map((w, i) => (
              <li key={i} className="flex items-start gap-1.5">
                <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-danger" aria-hidden />
                {w}
              </li>
            ))}
          </ul>
        </div>
      )}

      {!empty && (
        <section className="rounded-xl border-2 border-line bg-elevated shadow-card">
          <div className="border-b border-line px-4 py-3.5 sm:px-5">
            <h2 className="text-xs font-semibold tracking-wider text-ink-faint uppercase">{t('billing.checkTitle')}</h2>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">{t('billing.checkHint')}</p>
          </div>

          <ul className="divide-y divide-line">
            {diff.rows.map((row) => {
              const delta = row.billed - row.should
              return (
                <li key={row.code} className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 sm:px-5">
                  <div className="min-w-0">
                    <p className="tabular text-sm font-semibold text-ink">{CODES[row.code].code}</p>
                    <p className="tabular text-xs text-ink-muted">
                      {t('billing.should', { n: row.should })}
                      {delta !== 0 && (
                        <span className={cn('ml-1.5 font-semibold', delta < 0 ? 'text-danger' : 'text-accent-ink')}>
                          {delta < 0 ? t('billing.missingN', { n: -delta }) : t('billing.extraN', { n: delta })}
                        </span>
                      )}
                      {delta === 0 && <span className="ml-1.5 font-semibold text-success">{t('billing.matches')}</span>}
                    </p>
                  </div>
                  <Stepper
                    value={row.billed}
                    onChange={(v) => onBilled(row.code, v)}
                    min={0}
                    max={99}
                    label={CODES[row.code].code}
                    size="sm"
                  />
                </li>
              )
            })}
          </ul>

          <div
            className={cn(
              'border-t px-4 py-3 text-sm font-semibold sm:px-5',
              diff.ok && Object.keys(billed).length > 0
                ? 'border-success/40 bg-success/10 text-success'
                : diff.missing > 0
                  ? 'border-danger/40 bg-danger-soft text-danger'
                  : 'border-line text-ink-muted',
            )}
          >
            {Object.keys(billed).length === 0
              ? t('billing.checkStart')
              : diff.ok
                ? t('billing.checkOk')
                : [diff.missing > 0 ? t('billing.checkMissing', { n: diff.missing }) : null, diff.extra > 0 ? t('billing.checkExtra', { n: diff.extra }) : null]
                    .filter(Boolean)
                    .join(' · ')}
          </div>
        </section>
      )}
    </div>
  )
}
