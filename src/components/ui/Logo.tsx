import { cn } from '@/lib/cn'

/**
 * Aperture-style mark: an iris ring with a centred field stop. Reads as optics
 * at 16px without being a literal microscope.
 */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn('size-7', className)} aria-hidden focusable="false">
      <circle cx="16" cy="16" r="9.5" fill="none" stroke="currentColor" strokeWidth="2" opacity="0.35" />
      <circle cx="16" cy="16" r="4.5" fill="none" stroke="currentColor" strokeWidth="2" />
      <circle cx="16" cy="16" r="1.5" fill="currentColor" />
      <path
        d="M16 2.5v4M16 25.5v4M2.5 16h4M25.5 16h4"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  )
}

export function Logo({ className, labelClassName }: { className?: string; labelClassName?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2', className)}>
      <LogoMark className="size-6 shrink-0 text-accent" />
      {/* As barras do topo escondem o nome nos aparelhos mais estreitos
          (`labelClassName`); a gaveta e o rodapé, que têm espaço, mantêm. */}
      <span className={cn('text-[0.9375rem] font-semibold tracking-tight text-ink', labelClassName)}>
        Patholytics
      </span>
    </span>
  )
}
