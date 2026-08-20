import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/cn'

export function Spinner({ className }: { className?: string }) {
  return <Loader2 className={cn('size-5 animate-spin text-ink-faint', className)} aria-hidden />
}

export function FullPageSpinner({ label }: { label: string }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-3 bg-ground">
      <Spinner className="size-6" />
      <p className="text-sm text-ink-faint">{label}</p>
    </div>
  )
}
