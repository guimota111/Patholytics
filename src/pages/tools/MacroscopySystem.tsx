import { useTranslation } from 'react-i18next'
import { Link, useParams } from 'react-router-dom'
import { ArrowUpRight, Hammer } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Crumbs, MANUAL_PATH, ManualFooter, MissingNote } from '@/tools/macroscopy/components/ManualChrome'
import { findSystem } from '@/tools/macroscopy/content'

/** Um sistema do manual: as peças dele, uma por cartão. */
export default function MacroscopySystemPage() {
  const { t } = useTranslation()
  const { systemId } = useParams()
  const system = findSystem(systemId)

  if (!system) return <MissingNote />
  const Icon = system.icon
  const count = system.protocols.length

  return (
    <div className="shell py-10">
      <Crumbs items={[{ label: t('macroscopy.manual'), to: MANUAL_PATH }, { label: system.name }]} />

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <span
            className="flex size-12 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${system.color}1f`, color: system.color }}
          >
            <Icon className="size-6" aria-hidden />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">{system.name}</h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-muted">{system.description}</p>
          </div>
        </div>
        <Badge>
          <span className="tabular">{t('macroscopy.protocolCount', { count })}</span>
        </Badge>
      </header>

      {count === 0 ? (
        <div className="mt-8 rounded-lg border border-dashed border-line bg-surface px-6 py-14 text-center">
          <span className="mx-auto flex size-12 items-center justify-center rounded-full border border-line bg-elevated text-ink-faint">
            <Hammer className="size-5" aria-hidden />
          </span>
          <h2 className="mt-4 text-sm font-semibold text-ink">{t('macroscopy.emptySystemTitle')}</h2>
          <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-ink-muted">
            {t('macroscopy.emptySystemBody', { name: system.name })}
          </p>
        </div>
      ) : (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4">
          {system.protocols.map((protocol) => (
            <Link
              key={protocol.id}
              to={`${MANUAL_PATH}/${system.id}/${protocol.id}`}
              className="group flex h-full min-h-[9rem] flex-col rounded-lg border border-line bg-elevated p-5 shadow-card transition-colors hover:border-accent/40 hover:bg-raised"
            >
              <div className="flex items-start justify-between gap-3">
                <h2 className="text-base font-semibold tracking-tight text-ink">{protocol.name}</h2>
                <ArrowUpRight
                  className="size-4 shrink-0 text-ink-faint transition-colors group-hover:text-accent"
                  aria-hidden
                />
              </div>
              {protocol.summary && <p className="mt-2 text-sm leading-relaxed text-ink-faint">{protocol.summary}</p>}
              <p className="tabular mt-auto pt-4 text-xs text-ink-faint">
                {t('macroscopy.stepCount', { count: protocol.steps.length })}
              </p>
            </Link>
          ))}
        </div>
      )}

      <ManualFooter />
    </div>
  )
}
