import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Copy, Info, RotateCcw } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/Button'
import { TmaFocus } from '@/tools/tma/components/TmaFocus'
import { TmaGrid } from '@/tools/tma/components/TmaGrid'
import { TmaSetup } from '@/tools/tma/components/TmaSetup'
import { useTmaMapper } from '@/tools/tma/useTmaMapper'

export default function TmaMapperPage() {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const [confirmingReset, setConfirmingReset] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  const {
    hydrated,
    state,
    total,
    atLast,
    currentCore,
    currentValue,
    filledCount,
    resultsText,
    start,
    reset,
    setResult,
    goTo,
    next,
    previous,
  } = useTmaMapper()

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resultsText)
    } catch {
      return
    }
    setCopied(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1600)
  }

  const handleReset = () => {
    if (!confirmingReset) {
      setConfirmingReset(true)
      return
    }
    reset()
    setConfirmingReset(false)
  }

  return (
    <div className="shell py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('tools.tma.name')}</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-ink-muted">{t('tma.subtitle')}</p>
        </div>

        {state && (
          <div className="flex flex-wrap items-center gap-2">
            <Badge>
              <span className="tabular">
                {filledCount}/{total}
              </span>
              {t('tma.filled')}
            </Badge>
            <Button type="button" size="sm" onClick={() => void handleCopy()}>
              {copied ? (
                <Check className="size-4" aria-hidden />
              ) : (
                <Copy className="size-4" aria-hidden />
              )}
              {copied ? t('tma.copied') : t('tma.copy')}
            </Button>
            <Button
              type="button"
              size="sm"
              variant={confirmingReset ? 'danger' : 'secondary'}
              onClick={handleReset}
              onBlur={() => setConfirmingReset(false)}
            >
              <RotateCcw className="size-4" aria-hidden />
              {confirmingReset ? t('tma.newMapConfirm') : t('tma.newMap')}
            </Button>
          </div>
        )}
      </header>

      {!hydrated ? null : !state || !currentCore ? (
        <div className="mt-8">
          <TmaSetup onStart={start} />
        </div>
      ) : (
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_22rem] 2xl:grid-cols-[minmax(0,1fr)_26rem]">
          <div className="rounded-lg border border-line bg-elevated shadow-card">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
              <h2 className="text-sm font-semibold tracking-tight text-ink">{t('tma.mapTitle')}</h2>
              <p className="tabular text-xs text-ink-faint">
                {t('tma.dimensions', { rows: state.rows, cols: state.cols })}
              </p>
            </div>

            <div className="px-5 py-5">
              <TmaGrid state={state} onSelect={goTo} />

              <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-ink-faint">
                <span className="flex items-center gap-1.5">
                  <span className="size-3 rounded-full border border-line bg-surface" aria-hidden />
                  {t('tma.legendEmpty')}
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="size-3 rounded-full border border-accent/50 bg-accent-soft"
                    aria-hidden
                  />
                  {t('tma.legendFilled')}
                </span>
                <span className="flex items-center gap-1.5">
                  <span
                    className="size-3 rounded-full border border-line bg-surface ring-2 ring-accent"
                    aria-hidden
                  />
                  {t('tma.legendCurrent')}
                </span>
              </div>

              <div className="mt-5">
                <div
                  className="h-1 overflow-hidden rounded-full bg-line"
                  role="progressbar"
                  aria-valuenow={filledCount}
                  aria-valuemin={0}
                  aria-valuemax={total}
                >
                  <div
                    className="h-full bg-accent transition-[width] duration-200"
                    style={{ width: `${total ? (filledCount / total) * 100 : 0}%` }}
                  />
                </div>
                <p className="tabular mt-2 text-xs text-ink-faint">
                  {t('tma.progress', { filled: filledCount, total })}
                </p>
              </div>
            </div>
          </div>

          <TmaFocus
            core={currentCore}
            index={state.current}
            total={total}
            value={currentValue}
            atLast={atLast}
            onChange={setResult}
            onPrevious={previous}
            onNext={next}
          />
        </div>
      )}

      <p className="mt-12 flex items-start gap-2 border-t border-line pt-6 text-xs leading-relaxed text-ink-faint">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        {t('tma.privacy')}
      </p>
    </div>
  )
}
