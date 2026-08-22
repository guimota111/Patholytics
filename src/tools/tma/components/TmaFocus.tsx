import { useEffect, useRef, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { colLabel, coordOf, rowLabel } from '../types'

interface TmaFocusProps {
  core: [number, number]
  index: number
  total: number
  value: string
  atLast: boolean
  onChange: (value: string) => void
  onPrevious: () => void
  onNext: () => void
}

export function TmaFocus({
  core,
  index,
  total,
  value,
  atLast,
  onChange,
  onPrevious,
  onNext,
}: TmaFocusProps) {
  const { t } = useTranslation()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const [row, col] = core

  // Trocar de core devolve o cursor ao campo — a leitura e core a core.
  useEffect(() => {
    inputRef.current?.focus()
  }, [index])

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      onNext()
    }
  }

  return (
    <div className="rounded-lg border border-line bg-elevated shadow-card">
      <div className="border-b border-line px-5 py-4">
        <p className="text-xs tracking-wider text-ink-faint uppercase">{t('tma.currentCore')}</p>
        <p className="tabular mt-1 text-2xl font-semibold tracking-tight text-accent-ink">
          {coordOf(row, col)}
        </p>
        <p className="mt-1 text-xs text-ink-faint">
          {t('tma.position', {
            index: index + 1,
            total,
            row: rowLabel(row),
            col: colLabel(col),
          })}
        </p>
      </div>

      <div className="space-y-4 px-5 py-5">
        <div className="space-y-1.5">
          <label htmlFor="tma-result" className="block text-sm font-medium text-ink">
            {t('tma.resultLabel')}
          </label>
          <textarea
            id="tma-result"
            ref={inputRef}
            rows={4}
            value={value}
            onChange={(event) => onChange(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t('tma.resultPlaceholder')}
            className="w-full resize-y rounded-md border border-line bg-surface px-3 py-2.5 text-sm leading-relaxed text-ink transition-colors placeholder:text-ink-faint hover:border-line-strong"
          />
          <p className="text-xs text-ink-faint">{t('tma.shortcutHint')}</p>
        </div>

        <div className="flex items-center gap-2">
          <Button type="button" variant="secondary" onClick={onPrevious} disabled={index === 0}>
            <ChevronLeft className="size-4" aria-hidden />
            {t('tma.previous')}
          </Button>
          <Button type="button" onClick={onNext} disabled={atLast}>
            {t('tma.next')}
            <ChevronRight className="size-4" aria-hidden />
          </Button>
        </div>

        {atLast && <p className="text-xs text-success">{t('tma.endOfMap')}</p>}
      </div>
    </div>
  )
}
