import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

/**
 * Dialogo simples o bastante para as quatro caixas do organizador. O foco nao
 * e aprisionado: sao formularios curtos, e o Escape sempre fecha.
 */
export function Modal({
  title,
  onClose,
  children,
  footer,
  wide = false,
}: {
  title: string
  onClose: () => void
  children: ReactNode
  footer?: ReactNode
  wide?: boolean
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="flex max-h-[92dvh] w-full flex-col rounded-t-xl border border-line bg-elevated pb-[env(safe-area-inset-bottom)] shadow-pop sm:max-w-lg sm:rounded-xl sm:pb-0"
        style={wide ? { maxWidth: '44rem' } : undefined}
      >
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
          <h2 className="text-sm font-semibold tracking-tight text-ink">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="-mr-2 flex size-11 shrink-0 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-raised hover:text-ink sm:-mr-1 sm:size-8"
            aria-label={title}
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer && <div className="flex flex-wrap justify-end gap-2 border-t border-line px-5 py-4">{footer}</div>}
      </div>
    </div>
  )
}
