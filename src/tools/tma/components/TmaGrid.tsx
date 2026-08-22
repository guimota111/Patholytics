import { useEffect, useRef, type RefObject } from 'react'
import { useTranslation } from 'react-i18next'
import { colLabel, coordOf, keyOf, rowLabel, type TmaState } from '../types'
import { cn } from '@/lib/cn'

interface TmaGridProps {
  state: TmaState
  onSelect: (index: number) => void
}

export function TmaGrid({ state, onSelect }: TmaGridProps) {
  const { t } = useTranslation()
  const currentRef = useRef<HTMLButtonElement>(null)
  // Desestruturado porque a regra exhaustive-deps trata qualquer `.current`
  // como ref mutavel e recusa `state.current` como dependencia.
  const { current } = state

  // Mapas grandes rolam: manter o core atual sempre a vista.
  useEffect(() => {
    currentRef.current?.scrollIntoView({ block: 'nearest', inline: 'nearest' })
  }, [current])

  return (
    <div className="overflow-x-auto">
      <div
        role="grid"
        aria-label={t('tma.mapLabel')}
        className="inline-grid gap-1"
        style={{ gridTemplateColumns: `auto repeat(${state.cols}, auto)` }}
      >
        <span aria-hidden />
        {Array.from({ length: state.cols }, (_, c) => (
          <span
            key={`col-${c}`}
            aria-hidden
            className="tabular flex size-7 items-center justify-center text-xs text-ink-faint"
          >
            {colLabel(c)}
          </span>
        ))}

        {Array.from({ length: state.rows }, (_, r) => (
          <Row key={`row-${r}`} row={r} state={state} onSelect={onSelect} currentRef={currentRef} />
        ))}
      </div>
    </div>
  )
}

interface RowProps extends TmaGridProps {
  row: number
  currentRef: RefObject<HTMLButtonElement | null>
}

function Row({ row, state, onSelect, currentRef }: RowProps) {
  const { t } = useTranslation()

  return (
    <>
      <span
        aria-hidden
        className="tabular flex size-7 items-center justify-center text-xs text-ink-faint"
      >
        {rowLabel(row)}
      </span>

      {Array.from({ length: state.cols }, (_, col) => {
        const index = row * state.cols + col
        const filled = Boolean(state.results[keyOf(row, col)]?.trim())
        const isCurrent = index === state.current

        return (
          <button
            key={keyOf(row, col)}
            ref={isCurrent ? currentRef : undefined}
            type="button"
            onClick={() => onSelect(index)}
            aria-current={isCurrent ? 'true' : undefined}
            aria-label={t('tma.coreLabel', {
              coord: coordOf(row, col),
              state: filled ? t('tma.legendFilled') : t('tma.legendEmpty'),
            })}
            title={coordOf(row, col)}
            className={cn(
              'size-7 rounded-full border transition-colors',
              filled
                ? 'border-accent/50 bg-accent-soft hover:border-accent'
                : 'border-line bg-surface hover:border-line-strong',
              isCurrent && 'ring-2 ring-accent ring-offset-2 ring-offset-elevated',
            )}
          />
        )
      })}
    </>
  )
}
