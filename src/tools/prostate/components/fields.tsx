import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from 'react'
import { cn } from '@/lib/cn'

export const selectClass =
  'h-9 w-full rounded-md border border-line bg-surface px-2 text-sm text-ink transition-colors hover:border-line-strong'

export const compactInputClass =
  'tabular h-8 w-full rounded-md border border-line bg-surface px-2 text-sm text-ink transition-colors hover:border-line-strong placeholder:text-ink-faint'

interface NumFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange' | 'type'> {
  value: number | null
  onChange: (value: number | null) => void
  label?: string
  hint?: ReactNode
  decimals?: boolean
}

/** Campo numérico que guarda `null` quando vazio. */
export function NumField({ value, onChange, label, hint, decimals = false, className, ...props }: NumFieldProps) {
  const id = useId()
  const input = (
    <input
      id={id}
      type="number"
      inputMode={decimals ? 'decimal' : 'numeric'}
      step={decimals ? '0.1' : '1'}
      value={value ?? ''}
      onChange={(e) => {
        const v = e.target.value
        onChange(v === '' ? null : Number(v))
      }}
      className={cn(label ? 'tabular h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink hover:border-line-strong' : compactInputClass, className)}
      {...props}
    />
  )
  if (!label) return input
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      {input}
      {hint && <p className="text-xs text-ink-faint">{hint}</p>}
    </div>
  )
}

interface SelectFieldProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'value' | 'onChange'> {
  value: string
  onChange: (value: string) => void
  label: string
  options: { value: string; label: string }[]
  hint?: ReactNode
}

export function SelectField({ value, onChange, label, options, hint, className, ...props }: SelectFieldProps) {
  const id = useId()
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <select id={id} value={value} onChange={(e) => onChange(e.target.value)} className={cn(selectClass, className)} {...props}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      {hint && <p className="text-xs text-ink-faint">{hint}</p>}
    </div>
  )
}

export function Toggle({
  checked,
  onChange,
  label,
  className,
}: {
  checked: boolean
  onChange: (checked: boolean) => void
  label: ReactNode
  className?: string
}) {
  return (
    <label className={cn('inline-flex cursor-pointer items-center gap-2 text-sm text-ink', className)}>
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="size-4 rounded border-line accent-[var(--color-accent)]"
      />
      {label}
    </label>
  )
}

/** Cabeçalho padrão dos cartões da ferramenta. */
export function SectionHeader({ title, hint, children }: { title: string; hint?: string; children?: ReactNode }) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
      <div>
        <h2 className="text-sm font-semibold tracking-tight text-ink">{title}</h2>
        {hint && <p className="mt-1 text-sm text-ink-muted">{hint}</p>}
      </div>
      {children}
    </div>
  )
}
