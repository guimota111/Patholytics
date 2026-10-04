import { useState, type ReactNode } from 'react'
import { ChevronDown, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Blocos do layout didático do conversor: passos numerados grandes e
 * seções recolhidas por padrão, para a página abrir só com o essencial.
 */

export function StepCard({
  number,
  title,
  hint,
  children,
}: {
  number: number
  title: string
  hint: string
  children: ReactNode
}) {
  return (
    <section className="rounded-lg border border-line bg-elevated shadow-card">
      <div className="flex items-start gap-3.5 border-b border-line px-5 py-4 sm:px-6">
        <span
          aria-hidden
          className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-full bg-accent text-lg font-bold text-white"
        >
          {number}
        </span>
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-ink">{title}</h2>
          <p className="mt-0.5 text-sm leading-relaxed text-ink-muted">{hint}</p>
        </div>
      </div>
      <div className="space-y-5 px-5 py-5 sm:px-6">{children}</div>
    </section>
  )
}

/** Conteúdo avançado escondido atrás de um botão claro. */
export function MoreSection({ label, children }: { label: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="rounded-md border border-line bg-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-ink-muted transition-colors hover:text-ink"
      >
        {open ? <ChevronDown className="size-4 shrink-0" aria-hidden /> : <ChevronRight className="size-4 shrink-0" aria-hidden />}
        {label}
      </button>
      {open && <div className="space-y-4 border-t border-line px-3.5 py-4">{children}</div>}
    </div>
  )
}

/** Chip grande de escolha única (bem maior que um botão comum, fácil de acertar). */
export function BigChip({
  active,
  onClick,
  children,
  className,
}: {
  active: boolean
  onClick: () => void
  children: ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-lg border-2 px-4 py-2.5 text-base font-medium transition-colors',
        active
          ? 'border-accent bg-accent-soft text-accent-ink'
          : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink',
        className,
      )}
    >
      {children}
    </button>
  )
}

/** Lista de tópicos recolhidos: cada linha só abre se o usuário quiser. */
export function TopicList({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('divide-y divide-line overflow-hidden rounded-md border border-line bg-surface', className)}>{children}</div>
}

/**
 * Um tópico recolhido. Fechado, mostra o rótulo, quantos itens foram
 * marcados e os primeiros rótulos marcados, para a página ficar curta sem
 * esconder o que já foi escolhido. Aberto, mostra os chips do tópico.
 */
export function TopicGroup({
  label,
  hint,
  selected = [],
  defaultOpen = false,
  children,
}: {
  label: string
  hint?: string
  /** Rótulos dos itens já marcados neste tópico. */
  selected?: string[]
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  const shown = selected.slice(0, 6)
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full flex-wrap items-center gap-x-2 gap-y-1 px-3.5 py-2.5 text-left text-sm transition-colors hover:bg-raised"
      >
        {open ? <ChevronDown className="size-4 shrink-0 text-ink-faint" aria-hidden /> : <ChevronRight className="size-4 shrink-0 text-ink-faint" aria-hidden />}
        <span className={cn('font-medium', selected.length > 0 ? 'text-ink' : 'text-ink-muted')}>{label}</span>
        {selected.length > 0 && (
          <span className="tabular rounded-full bg-accent px-1.5 py-px text-[0.65rem] font-semibold text-white">{selected.length}</span>
        )}
        {!open &&
          shown.map((s) => (
            <span key={s} className="rounded-full border border-accent/40 bg-accent-soft px-2 py-0.5 text-[0.7rem] text-accent-ink">
              {s}
            </span>
          ))}
        {!open && selected.length > shown.length && <span className="text-xs text-ink-faint">+{selected.length - shown.length}</span>}
      </button>
      {open && (
        <div className="border-t border-line bg-elevated px-3.5 py-3">
          {hint && <p className="mb-2 text-xs text-ink-muted">{hint}</p>}
          {children}
        </div>
      )}
    </div>
  )
}

/** Caixa de resultado em destaque. */
export function ResultBox({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('rounded-lg border-2 border-accent/40 bg-accent-soft px-4 py-4 sm:px-5', className)}>
      {children}
    </div>
  )
}
