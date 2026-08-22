import { useId } from 'react'
import type { Field, FieldValue } from '../types'
import { cn } from '@/lib/cn'

interface FieldControlProps {
  field: Field
  value: FieldValue
  onChange: (value: FieldValue) => void
}

/** Renderiza um campo do contrato da calculadora com os tokens do app. */
export function FieldControl({ field, value, onChange }: FieldControlProps) {
  const id = useId()
  const hintId = field.hint ? `${id}-hint` : undefined

  const label = (
    <span className="block text-sm font-medium text-ink">{field.label}</span>
  )

  const hint = field.hint ? (
    <p id={hintId} className="text-xs leading-relaxed text-ink-faint">
      {field.hint}
    </p>
  ) : null

  if (field.type === 'radio') {
    return (
      <fieldset className="space-y-1.5">
        <legend className="text-sm font-medium text-ink">{field.label}</legend>
        {hint}
        <div className="flex flex-wrap gap-1.5 pt-0.5">
          {field.options?.map((option) => {
            const checked = value === option.value
            return (
              <label
                key={option.value}
                className={cn(
                  'cursor-pointer rounded-md border px-3 py-1.5 text-sm transition-colors',
                  checked
                    ? 'border-accent/50 bg-accent-soft text-accent-ink'
                    : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink',
                )}
              >
                <input
                  type="radio"
                  name={id}
                  value={option.value}
                  checked={checked}
                  onChange={() => onChange(option.value)}
                  className="sr-only"
                />
                {option.label}
              </label>
            )
          })}
        </div>
      </fieldset>
    )
  }

  if (field.type === 'select') {
    return (
      <div className="space-y-1.5">
        <label htmlFor={id}>{label}</label>
        {hint}
        <select
          id={id}
          value={value == null ? '' : String(value)}
          aria-describedby={hintId}
          onChange={(event) => onChange(event.target.value)}
          className="h-10 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink transition-colors hover:border-line-strong"
        >
          {field.options?.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    )
  }

  if (field.type === 'number') {
    return (
      <div className="space-y-1.5">
        <label htmlFor={id}>{label}</label>
        {hint}
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={field.min}
          max={field.max}
          value={value == null ? '' : String(value)}
          aria-describedby={hintId}
          placeholder="—"
          onChange={(event) => onChange(event.target.value === '' ? null : Number(event.target.value))}
          className="tabular h-10 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink transition-colors hover:border-line-strong sm:max-w-40"
        />
      </div>
    )
  }

  return (
    <div className="space-y-1.5">
      <label htmlFor={id}>{label}</label>
      {hint}
      <input
        id={id}
        type="text"
        value={value == null ? '' : String(value)}
        aria-describedby={hintId}
        onChange={(event) => onChange(event.target.value)}
        className="h-10 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink transition-colors hover:border-line-strong"
      />
    </div>
  )
}
