import type { ReactNode } from 'react'
import { cn } from '@/lib/cn'

type Tone = 'neutral' | 'accent' | 'success'

const TONES: Record<Tone, string> = {
  neutral: 'border-line bg-surface text-ink-faint',
  accent: 'border-accent/35 bg-accent-soft text-accent-ink',
  success: 'border-success/30 bg-success/10 text-success',
}

export function Badge({
  tone = 'neutral',
  className,
  children,
}: {
  tone?: Tone
  className?: string
  children: ReactNode
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[0.6875rem] font-medium tracking-wide uppercase',
        TONES[tone],
        className,
      )}
    >
      {children}
    </span>
  )
}
