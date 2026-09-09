import type { ReactNode } from 'react'
import { ArrowRight } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Badge } from '@/components/ui/Badge'
import { ButtonLink } from '@/components/ui/Button'
import { cn } from '@/lib/cn'

/**
 * Uma tela da página inicial. Título curto à esquerda, atalho para a
 * ferramenta à direita, e embaixo a demonstração — que é a ferramenta de
 * verdade, com um caso já começado, e não uma imagem dela.
 */
export function SnapSection({
  id,
  eyebrow,
  title,
  body,
  to,
  children,
  className,
}: {
  id: string
  eyebrow: string
  title: string
  body: string
  /** Destino do botão: a própria ferramenta (ou o cadastro, para quem não entrou). */
  to: string
  children: ReactNode
  className?: string
}) {
  const { t } = useTranslation()

  return (
    <section
      id={id}
      className={cn(
        'flex min-h-[calc(100dvh-3.5rem)] scroll-mt-14 snap-start flex-col justify-center border-b border-line py-10',
        className,
      )}
    >
      <div className="shell w-full">
        <header className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4">
          <div className="max-w-2xl">
            <Badge tone="accent">{eyebrow}</Badge>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-balance text-ink sm:text-3xl">
              {title}
            </h2>
            <p className="mt-2 text-base leading-relaxed text-ink-muted">{body}</p>
          </div>
          <ButtonLink to={to} variant="secondary">
            {t('landing.openTool')}
            <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
        </header>

        <div className="mt-6">{children}</div>
      </div>
    </section>
  )
}

/** Moldura das demonstrações: o quadro claro onde a ferramenta roda. */
export function DemoFrame({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('min-w-0 rounded-lg border border-line bg-elevated p-4 shadow-card sm:p-5', className)}>
      {children}
    </div>
  )
}

/** Rótulo de bloco dentro de uma demonstração. */
export function DemoLabel({ children }: { children: ReactNode }) {
  return (
    <p className="mb-2 text-[0.6875rem] font-medium tracking-wider text-ink-faint uppercase">
      {children}
    </p>
  )
}

/** Números que a demonstração calculou, na mesma linha. */
export function DemoStats({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-4">
      {items.map((item) => (
        <div key={item.label} className="bg-surface px-3 py-2">
          <dt className="text-[0.6875rem] tracking-wider text-ink-faint uppercase">{item.label}</dt>
          <dd className="tabular mt-0.5 text-sm font-semibold text-accent-ink">{item.value}</dd>
        </div>
      ))}
    </dl>
  )
}

/** O texto que a ferramenta montou sozinho, pronto para o laudo. */
export function DemoReport({ text, empty, className }: { text: string; empty: string; className?: string }) {
  return (
    <pre
      className={cn(
        'tabular max-h-40 overflow-auto rounded-md border border-line bg-surface px-3.5 py-3 text-xs leading-relaxed whitespace-pre-wrap text-ink-muted',
        className,
      )}
    >
      {text.trim() ? text : empty}
    </pre>
  )
}
