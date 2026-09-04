import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/cn'

/**
 * Guia visual de celularidade do calculador de RCB do MD Anderson: um campo
 * circular com N células = N/10 % de celularidade, em distribuição agrupada
 * ou dispersa. Fica recolhido; aberto, o patologista compara com o campo do
 * microscópio. Um clique amplia o diagrama.
 */
interface Diagram {
  pct: number
  variant: 'grouped' | 'scattered' | null
  file: string
}

const DIAGRAMS: Diagram[] = [
  { pct: 1, variant: 'grouped', file: '1-grouped' },
  { pct: 1, variant: 'scattered', file: '1-scattered' },
  { pct: 5, variant: 'grouped', file: '5-grouped' },
  { pct: 5, variant: 'scattered', file: '5-scattered' },
  { pct: 10, variant: 'grouped', file: '10-grouped' },
  { pct: 10, variant: 'scattered', file: '10-scattered' },
  { pct: 20, variant: 'grouped', file: '20-grouped' },
  { pct: 20, variant: 'scattered', file: '20-scattered' },
  { pct: 30, variant: 'grouped', file: '30-grouped' },
  { pct: 30, variant: 'scattered', file: '30-scattered' },
  { pct: 40, variant: null, file: '40' },
  { pct: 50, variant: null, file: '50' },
  { pct: 60, variant: null, file: '60' },
  { pct: 70, variant: null, file: '70' },
  { pct: 80, variant: null, file: '80' },
  { pct: 90, variant: null, file: '90' },
  { pct: 95, variant: null, file: '95' },
]

const src = (d: Diagram) => `/rcb/cellularity/${d.file}.png`

export function CellularityGuide({ defaultOpen = false, highlight }: { defaultOpen?: boolean; highlight?: number | null }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(defaultOpen)
  const [zoom, setZoom] = useState<Diagram | null>(null)

  return (
    <div className="rounded-md border border-line bg-surface">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-3.5 py-2.5 text-left text-sm text-ink-muted transition-colors hover:text-ink"
      >
        {open ? <ChevronDown className="size-4 shrink-0" aria-hidden /> : <ChevronRight className="size-4 shrink-0" aria-hidden />}
        <span className="font-medium text-ink">{t('breast.guide.title')}</span>
        <span className="hidden text-xs sm:inline">— {t('breast.guide.hint')}</span>
      </button>
      {open && (
        <div className="border-t border-line px-3.5 py-4">
          <div className="grid grid-cols-3 gap-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-9">
            {DIAGRAMS.map((d) => {
              const hl = highlight !== null && highlight !== undefined && d.pct === highlight
              return (
                <button
                  key={d.file}
                  type="button"
                  onClick={() => setZoom(d)}
                  className={cn('group flex flex-col items-center gap-1 rounded-md p-1.5 transition-colors hover:bg-raised', hl && 'bg-accent-soft ring-2 ring-accent')}
                  title={t('breast.guide.zoom')}
                >
                  <img src={src(d)} alt={`${d.pct}%`} width={176} height={176} loading="lazy" className="w-full max-w-[120px] rounded-full bg-white" />
                  <span className="tabular text-xs font-semibold text-ink">{d.pct}%</span>
                  {d.variant && <span className="text-[0.65rem] text-ink-faint">{t(`breast.guide.${d.variant}`)}</span>}
                </button>
              )
            })}
          </div>
          <p className="mt-3 text-xs leading-relaxed text-ink-faint">{t('breast.guide.model')}</p>
          <p className="mt-1 text-xs text-ink-faint">{t('breast.guide.attribution')}</p>
        </div>
      )}
      {zoom && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
          aria-label={`${zoom.pct}%`}
          onClick={() => setZoom(null)}
        >
          <div className="relative flex flex-col items-center gap-3 rounded-xl border border-line bg-elevated p-5 shadow-pop" onClick={(e) => e.stopPropagation()}>
            <button type="button" onClick={() => setZoom(null)} className="absolute top-2 right-2 rounded-md p-1 text-ink-faint hover:bg-raised hover:text-ink" aria-label={t('common.cancel')}>
              <X className="size-4" aria-hidden />
            </button>
            <img src={src(zoom)} alt={`${zoom.pct}%`} className="size-[min(70vw,420px)] rounded-full bg-white" />
            <p className="tabular text-lg font-semibold text-ink">
              {zoom.pct}%{zoom.variant ? ` · ${t(`breast.guide.${zoom.variant}`)}` : ''}
            </p>
            <div className="flex flex-wrap justify-center gap-1.5">
              {DIAGRAMS.map((d) => (
                <button
                  key={d.file}
                  type="button"
                  onClick={() => setZoom(d)}
                  className={cn('tabular rounded-full border px-2 py-0.5 text-xs', d === zoom ? 'border-accent bg-accent-soft text-accent-ink' : 'border-line text-ink-muted hover:text-ink')}
                >
                  {d.pct}{d.variant ? (d.variant === 'grouped' ? 'g' : 's') : ''}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
