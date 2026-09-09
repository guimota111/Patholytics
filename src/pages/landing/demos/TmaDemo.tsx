import { useMemo, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TmaGrid } from '@/tools/tma/components/TmaGrid'
import { buildOrder, coordOf, keyOf, type TmaState } from '@/tools/tma/types'
import { DemoFrame, DemoLabel, DemoReport } from '../SnapSection'

const DEMO_STATE: TmaState = {
  rows: 4,
  cols: 6,
  results: {
    '0-0': 'Positivo forte (3+), 90%',
    '0-1': 'Positivo moderado (2+), 60%',
    '0-2': 'Negativo',
    '0-3': 'Core ausente',
    '0-4': 'Positivo fraco (1+), 20%',
    '1-0': 'Positivo forte (3+), 80%',
    '1-1': 'Negativo',
  },
  current: 7,
}

/**
 * O mapeador de TMA com uma lâmina já pela metade: o visitante escreve o
 * resultado do core atual e vê a coluna crescer, pronta para a planilha.
 */
export default function TmaDemo() {
  const { t } = useTranslation()
  const [state, setState] = useState<TmaState>(DEMO_STATE)

  const order = useMemo(() => buildOrder(state.rows, state.cols), [state.rows, state.cols])
  const [row, col] = order[state.current] ?? order[0]
  const key = keyOf(row, col)
  const value = state.results[key] ?? ''
  const filled = Object.values(state.results).filter((item) => item.trim()).length
  const resultsText = order.map(([r, c]) => (state.results[keyOf(r, c)] ?? '').trim()).join('\n')

  const setValue = (next: string) =>
    setState((current) => {
      const results = { ...current.results }
      if (next.trim()) results[key] = next
      else delete results[key]
      return { ...current, results }
    })

  const step = (delta: number) =>
    setState((current) => ({
      ...current,
      current: Math.max(0, Math.min(order.length - 1, current.current + delta)),
    }))

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      step(1)
    }
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <DemoFrame>
        <DemoLabel>{t('tma.mapTitle')}</DemoLabel>
        <TmaGrid state={state} onSelect={(index) => setState((current) => ({ ...current, current: index }))} />
        <p className="tabular mt-3 text-xs text-ink-faint">
          {t('tma.progress', { filled, total: order.length })}
        </p>
      </DemoFrame>

      <div className="grid min-w-0 gap-4">
        <DemoFrame>
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <DemoLabel>{t('tma.currentCore')}</DemoLabel>
            <span className="tabular text-lg font-semibold text-accent-ink">{coordOf(row, col)}</span>
          </div>
          <textarea
            value={value}
            onChange={(event) => setValue(event.target.value)}
            onKeyDown={onKeyDown}
            rows={2}
            placeholder={t('tma.resultPlaceholder')}
            aria-label={t('tma.resultLabel')}
            className="w-full resize-none rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint hover:border-line-strong"
          />
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Button type="button" size="sm" variant="secondary" onClick={() => step(-1)} disabled={state.current === 0}>
              <ChevronLeft className="size-4" aria-hidden />
              {t('tma.previous')}
            </Button>
            <Button type="button" size="sm" onClick={() => step(1)} disabled={state.current >= order.length - 1}>
              {t('tma.next')}
              <ChevronRight className="size-4" aria-hidden />
            </Button>
            <span className="text-xs text-ink-faint">{t('tma.shortcutHint')}</span>
          </div>
        </DemoFrame>

        <DemoFrame>
          <DemoLabel>{t('landing.demo.tma.columnLabel')}</DemoLabel>
          <DemoReport text={resultsText} empty={t('tma.resultPlaceholder')} className="max-h-[9rem]" />
        </DemoFrame>
      </div>
    </div>
  )
}
