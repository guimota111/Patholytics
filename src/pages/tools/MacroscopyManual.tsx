import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { MANUAL_PATH, ManualFooter } from '@/tools/macroscopy/components/ManualChrome'
import { SYSTEMS } from '@/tools/macroscopy/content'
import type { MacroSystem } from '@/tools/macroscopy/types'

/** A capa do manual: um cartão grande por sistema. */
export default function MacroscopyManualPage() {
  const { t } = useTranslation()

  return (
    <div className="shell py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('tools.macroscopy.name')}</h1>
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-muted">{t('macroscopy.subtitle')}</p>
        </div>
        <Badge>
          <span className="tabular">{SYSTEMS.length}</span>
          {t('macroscopy.systems')}
        </Badge>
      </header>

      <div className="mt-8 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
        {SYSTEMS.map((system) => (
          <SystemCard key={system.id} system={system} />
        ))}
      </div>

      <ManualFooter />
    </div>
  )
}

const PREVIEW = 4

function SystemCard({ system }: { system: MacroSystem }) {
  const { t } = useTranslation()
  const Icon = system.icon
  const preview = system.protocols.slice(0, PREVIEW)
  const more = system.protocols.length - preview.length

  return (
    <Link
      to={`${MANUAL_PATH}/${system.id}`}
      className="group relative flex min-h-[17rem] flex-col overflow-hidden rounded-xl border border-line bg-elevated p-7 shadow-card transition-colors hover:border-accent/40 hover:bg-raised"
    >
      <span
        aria-hidden
        className="pointer-events-none absolute -top-20 -right-20 size-56 rounded-full opacity-[0.14] blur-3xl transition-opacity group-hover:opacity-25"
        style={{ background: system.color }}
      />

      <div className="relative flex items-start justify-between gap-4">
        <span
          className="flex size-14 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${system.color}1f`, color: system.color }}
        >
          <Icon className="size-7" aria-hidden />
        </span>
        <ArrowUpRight className="size-5 text-ink-faint transition-colors group-hover:text-accent" aria-hidden />
      </div>

      <h2 className="relative mt-6 text-xl font-semibold tracking-tight text-ink">{system.name}</h2>
      <p className="relative mt-2 text-sm leading-relaxed text-ink-muted">{system.description}</p>

      <div className="relative mt-auto pt-6">
        {system.protocols.length === 0 ? (
          <Badge>{t('macroscopy.noProtocols')}</Badge>
        ) : (
          <>
            <ul className="flex flex-wrap gap-1.5">
              {preview.map((protocol) => (
                <li
                  key={protocol.id}
                  className="rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs text-ink-muted"
                >
                  {protocol.name}
                </li>
              ))}
              {more > 0 && (
                <li className="tabular rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs text-ink-faint">
                  +{more}
                </li>
              )}
            </ul>
            <p className="tabular mt-3 text-xs text-ink-faint">
              {t('macroscopy.protocolCount', { count: system.protocols.length })}
            </p>
          </>
        )}
      </div>
    </Link>
  )
}
