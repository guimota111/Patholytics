import { useEffect, useRef, type KeyboardEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, FlaskConical, SlidersHorizontal } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { CONTROL_PRESETS, MAX_CONTROL_LABEL, colLabel, coordOf, rowLabel, type CoreAnswers, type TmaField } from '../types'

interface TmaFocusProps {
  core: [number, number]
  index: number
  total: number
  fields: TmaField[]
  answers: CoreAnswers
  /** Rótulo do controle quando este core é um; null quando é caso. */
  control: string | null
  atLast: boolean
  onAnswer: (fieldId: string, value: string) => void
  onControl: (label: string | null) => void
  onPrevious: () => void
  onNext: () => void
  onEditFields: () => void
}

/**
 * O core atual e uma pergunta por campo: texto livre vira caixa de texto,
 * opções viram botões de um clique. Ctrl/Cmd+Enter avança de qualquer campo.
 */
export function TmaFocus({
  core,
  index,
  total,
  fields,
  answers,
  control,
  atLast,
  onAnswer,
  onControl,
  onPrevious,
  onNext,
  onEditFields,
}: TmaFocusProps) {
  const { t } = useTranslation()
  const textRef = useRef<HTMLTextAreaElement>(null)
  const chipRef = useRef<HTMLButtonElement>(null)
  const [row, col] = core

  // Trocar de core devolve o cursor ao primeiro campo — a leitura é core a core.
  useEffect(() => {
    ;(textRef.current ?? chipRef.current)?.focus()
  }, [index])

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault()
      onNext()
    }
  }

  const single = fields.length === 1
  const isControl = control !== null
  const defaultControl = t('tma.controlDefault')

  return (
    <div className="rounded-lg border border-line bg-elevated shadow-card">
      <div className="flex items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <p className="text-xs tracking-wider text-ink-faint uppercase">{t('tma.currentCore')}</p>
          <p className="tabular mt-1 flex items-center gap-2 text-2xl font-semibold tracking-tight text-accent-ink">
            {coordOf(row, col)}
            {isControl && (
              <span className="rounded-full border border-warning/40 bg-warning-soft px-2 py-0.5 text-xs font-medium tracking-normal text-warning">
                {t('tma.controlTitle', { label: control })}
              </span>
            )}
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
        <button
          type="button"
          onClick={onEditFields}
          className="inline-flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-ink-muted transition-colors hover:bg-raised hover:text-ink"
        >
          <SlidersHorizontal className="size-3.5" aria-hidden />
          {t('tma.editFields')}
        </button>
      </div>

      <div className="space-y-4 px-5 py-5" onKeyDown={handleKeyDown}>
        <div className="space-y-1.5">
          <p className="flex items-center gap-1.5 text-sm font-medium text-ink">
            <FlaskConical className="size-3.5 text-ink-faint" aria-hidden />
            {t('tma.controlLabel')}
          </p>
          <div role="group" aria-label={t('tma.controlLabel')} className="flex flex-wrap items-center gap-1.5">
            {CONTROL_PRESETS.map((preset) => {
              const label = `${defaultControl} ${preset}`
              const active = control === label
              return (
                <button
                  key={preset}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onControl(active ? null : label)}
                  className={cn(
                    'rounded-md border-2 px-3 py-1.5 text-sm font-medium transition-colors',
                    active
                      ? 'border-warning bg-warning-soft text-warning'
                      : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink',
                  )}
                >
                  {label}
                </button>
              )
            })}
            <input
              type="text"
              value={isControl && !CONTROL_PRESETS.some((preset) => control === `${defaultControl} ${preset}`) ? control : ''}
              maxLength={MAX_CONTROL_LABEL}
              onChange={(event) => onControl(event.target.value.trim() ? event.target.value : null)}
              placeholder={t('tma.controlPlaceholder')}
              aria-label={t('tma.controlOther')}
              className="min-w-40 flex-1 rounded-md border border-line bg-surface px-3 py-1.5 text-sm text-ink transition-colors placeholder:text-ink-faint hover:border-line-strong"
            />
            {isControl && (
              <button
                type="button"
                onClick={() => onControl(null)}
                className="rounded-md px-2 py-1.5 text-xs text-ink-muted transition-colors hover:bg-raised hover:text-ink"
              >
                {t('tma.controlClear')}
              </button>
            )}
          </div>
          <p className="text-xs text-ink-faint">{t('tma.controlHint')}</p>
        </div>

        {fields.map((field, i) => {
          const value = answers[field.id] ?? ''
          const inputId = `tma-field-${field.id}`
          return (
            <div key={field.id} className="space-y-1.5">
              <label htmlFor={field.kind === 'text' ? inputId : undefined} className="block text-sm font-medium text-ink">
                {field.label}
              </label>
              {field.kind === 'text' ? (
                <textarea
                  id={inputId}
                  ref={i === 0 ? textRef : undefined}
                  rows={single ? 4 : 2}
                  value={value}
                  onChange={(event) => onAnswer(field.id, event.target.value)}
                  placeholder={t('tma.resultPlaceholder')}
                  className="w-full resize-y rounded-md border border-line bg-surface px-3 py-2.5 text-sm leading-relaxed text-ink transition-colors placeholder:text-ink-faint hover:border-line-strong"
                />
              ) : (
                <div role="group" aria-label={field.label} className="flex flex-wrap gap-1.5">
                  {field.options.map((option, j) => {
                    const active = value === option
                    return (
                      <button
                        key={option}
                        ref={i === 0 && j === 0 ? chipRef : undefined}
                        type="button"
                        aria-pressed={active}
                        onClick={() => onAnswer(field.id, active ? '' : option)}
                        className={cn(
                          'rounded-md border-2 px-3 py-1.5 text-sm font-medium transition-colors',
                          active
                            ? 'border-accent bg-accent-soft text-accent-ink'
                            : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink',
                        )}
                      >
                        {option}
                      </button>
                    )
                  })}
                  {field.options.length === 0 && (
                    <p className="text-xs text-ink-faint">{t('tma.noOptions')}</p>
                  )}
                </div>
              )}
            </div>
          )
        })}
        <p className="text-xs text-ink-faint">{t('tma.shortcutHint')}</p>

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
