import type { ReactNode } from 'react'
import { Check, Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/cn'

/** Contador grande: menos, número, mais. Nada de teclado obrigatório. */
export function Stepper({
  value,
  onChange,
  min = 0,
  max = 99,
  label,
  size = 'md',
}: {
  value: number
  onChange: (next: number) => void
  min?: number
  max?: number
  label: string
  size?: 'sm' | 'md'
}) {
  const btn =
    size === 'sm'
      ? 'size-8 rounded-md border border-line bg-surface text-ink-muted'
      : 'size-11 rounded-lg border-2 border-line bg-surface text-ink'
  const box = size === 'sm' ? 'w-9 text-base' : 'w-14 text-2xl'
  return (
    <div className="flex items-center gap-1.5">
      <button
        type="button"
        aria-label={`${label} −`}
        onClick={() => onChange(Math.max(min, value - 1))}
        disabled={value <= min}
        className={cn(btn, 'flex items-center justify-center transition-colors hover:border-accent hover:text-accent-ink disabled:opacity-40 disabled:hover:border-line')}
      >
        <Minus className={size === 'sm' ? 'size-3.5' : 'size-5'} aria-hidden />
      </button>
      <span className={cn('tabular text-center font-bold text-ink', box)}>{value}</span>
      <button
        type="button"
        aria-label={`${label} +`}
        onClick={() => onChange(Math.min(max, value + 1))}
        disabled={value >= max}
        className={cn(btn, 'flex items-center justify-center transition-colors hover:border-accent hover:text-accent-ink disabled:opacity-40 disabled:hover:border-line')}
      >
        <Plus className={size === 'sm' ? 'size-3.5' : 'size-5'} aria-hidden />
      </button>
    </div>
  )
}

/** Linha de marcar: alvo grande, cor forte quando marcada. */
export function CheckRow({
  checked,
  onToggle,
  children,
  right,
}: {
  checked: boolean
  onToggle: () => void
  children: ReactNode
  right?: ReactNode
}) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border-2 px-3 py-2.5 transition-colors',
        checked ? 'border-accent bg-accent-soft' : 'border-line bg-surface',
      )}
    >
      <button type="button" role="checkbox" aria-checked={checked} onClick={onToggle} className="flex min-w-0 flex-1 items-center gap-3 text-left">
        <span
          aria-hidden
          className={cn(
            'flex size-6 shrink-0 items-center justify-center rounded-md border-2 transition-colors',
            checked ? 'border-accent bg-accent text-white' : 'border-line-strong bg-elevated text-transparent',
          )}
        >
          <Check className="size-4" strokeWidth={3} aria-hidden />
        </span>
        <span className={cn('min-w-0 text-[0.9375rem] leading-snug', checked ? 'font-medium text-accent-ink' : 'text-ink-muted')}>{children}</span>
      </button>
      {right}
    </div>
  )
}

/** Grupo de escolha única em botões largos. */
export function ChoiceRow({
  value,
  options,
  onChange,
}: {
  value: string
  options: { value: string; label: string; hint?: string }[]
  onChange: (next: string) => void
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2">
      {options.map((o) => {
        const active = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'rounded-lg border-2 px-3.5 py-2.5 text-left transition-colors',
              active ? 'border-accent bg-accent-soft' : 'border-line bg-surface hover:border-line-strong',
            )}
          >
            <span className={cn('block text-[0.9375rem] font-semibold', active ? 'text-accent-ink' : 'text-ink')}>{o.label}</span>
            {o.hint && <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">{o.hint}</span>}
          </button>
        )
      })}
    </div>
  )
}
