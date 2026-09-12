import { useMemo, useState, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TmaGrid } from '@/tools/tma/components/TmaGrid'
import { tsvText } from '@/tools/tma/export'
import { buildOrder, coordOf, keyOf, type TmaState } from '@/tools/tma/types'
import { cn } from '@/lib/cn'
import { DemoFrame, DemoLabel, DemoReport } from '../SnapSection'

const INTENSITY = 'intensity'
const PERCENT = 'percent'

const DEMO_STATE: TmaState = {
  rows: 4,
  cols: 6,
  fields: [
    { id: INTENSITY, label: 'Intensidade', kind: 'choice', options: ['0', '1+', '2+', '3+'] },
    { id: PERCENT, label: '% de células', kind: 'text', options: [] },
  ],
  results: {
    '0-0': { [INTENSITY]: '3+', [PERCENT]: '90' },
    '0-1': { [INTENSITY]: '2+', [PERCENT]: '60' },
    '0-2': { [INTENSITY]: '0' },
    '0-3': { [INTENSITY]: '0', [PERCENT]: 'core ausente' },
    '0-4': { [INTENSITY]: '1+', [PERCENT]: '20' },
    '1-0': { [INTENSITY]: '3+', [PERCENT]: '80' },
    '1-1': { [INTENSITY]: '0' },
  },
  current: 7,
}

/**
 * O mapeador de TMA com uma lâmina já pela metade: o visitante responde os
 * campos do core atual e vê a tabela crescer, pronta para a planilha.
 */
export default function TmaDemo() {
  const { t } = useTranslation()
  const [state, setState] = useState<TmaState>(DEMO_STATE)

  const order = useMemo(() => buildOrder(state.rows, state.cols), [state.rows, state.cols])
  const [row, col] = order[state.current] ?? order[0]
  const key = keyOf(row, col)
  const answers = state.results[key] ?? {}
  const filled = Object.keys(state.results).length
  const resultsText = tsvText(state, { header: true, coordinate: true, coordinateLabel: t('tma.coordinateColumn') })

  const setAnswer = (fieldId: string, next: string) =>
    setState((current) => {
      const core = { ...(current.results[key] ?? {}) }
      if (next.trim()) core[fieldId] = next
      else delete core[fieldId]
      const results = { ...current.results }
      if (Object.keys(core).length > 0) results[key] = core
      else delete results[key]
      return { ...current, results }
    })

  const step = (delta: number) =>
    setState((current) => ({
      ...current,
      current: Math.max(0, Math.min(order.length - 1, current.current + delta)),
    }))

  const onKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
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
          <div className="space-y-3" onKeyDown={onKeyDown}>
            {state.fields.map((field) => (
              <div key={field.id}>
                <p className="mb-1 text-xs font-medium text-ink">{field.label}</p>
                {field.kind === 'choice' ? (
                  <div role="group" aria-label={field.label} className="flex flex-wrap gap-1.5">
                    {field.options.map((option) => {
                      const active = answers[field.id] === option
                      return (
                        <button
                          key={option}
                          type="button"
                          aria-pressed={active}
                          onClick={() => setAnswer(field.id, active ? '' : option)}
                          className={cn(
                            'rounded-md border-2 px-2.5 py-1 text-sm font-medium transition-colors',
                            active
                              ? 'border-accent bg-accent-soft text-accent-ink'
                              : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink',
                          )}
                        >
                          {option}
                        </button>
                      )
                    })}
                  </div>
                ) : (
                  <input
                    value={answers[field.id] ?? ''}
                    onChange={(event) => setAnswer(field.id, event.target.value)}
                    placeholder={t('tma.resultPlaceholder')}
                    aria-label={field.label}
                    className="h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-faint hover:border-line-strong"
                  />
                )}
              </div>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-2">
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
