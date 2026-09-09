import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BarChart3, CalendarDays, Info, Timer, Trophy } from 'lucide-react'
import { ErrorAlert } from '@/components/ui/Alert'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/cn'
import { HistoryTree } from '@/tools/production/components/HistoryTree'
import { RecordsPanel } from '@/tools/production/components/RecordsPanel'
import { StatsPanel } from '@/tools/production/components/StatsPanel'
import { TodayPanel } from '@/tools/production/components/TodayPanel'
import { useProduction } from '@/tools/production/useProduction'

const TABS = [
  { id: 'today', icon: Timer },
  { id: 'history', icon: CalendarDays },
  { id: 'records', icon: Trophy },
  { id: 'stats', icon: BarChart3 },
] as const

type Tab = (typeof TABS)[number]['id']

export default function ProductionPage() {
  const { t } = useTranslation()
  const production = useProduction()
  const [tab, setTab] = useState<Tab>('today')

  return (
    <div className="shell py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('tools.production.name')}</h1>
        <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-ink-muted">{t('production.subtitle')}</p>
      </header>

      <nav className="mt-6 flex flex-wrap gap-1 rounded-lg border border-line bg-surface p-1" aria-label={t('production.tabs.label')}>
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            aria-current={tab === item.id ? 'page' : undefined}
            className={cn(
              'inline-flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors',
              tab === item.id ? 'bg-elevated text-ink shadow-subtle' : 'text-ink-muted hover:text-ink',
            )}
          >
            <item.icon className="size-4" aria-hidden />
            {t(`production.tabs.${item.id}`)}
          </button>
        ))}
      </nav>

      {production.error && (
        <div className="mt-4">
          <ErrorAlert>{t('production.loadError')}</ErrorAlert>
        </div>
      )}

      <div className="mt-6">
        {production.loading || !production.session ? (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        ) : tab === 'today' ? (
          <TodayPanel production={production} session={production.session} history={production.history} />
        ) : tab === 'history' ? (
          <HistoryTree history={production.history} production={production} />
        ) : tab === 'records' ? (
          <RecordsPanel history={production.history} />
        ) : (
          <StatsPanel history={production.history} />
        )}
      </div>

      <p className="mt-12 flex items-start gap-2 border-t border-line pt-6 text-xs leading-relaxed text-ink-faint">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        {t('production.privacy')}
      </p>
    </div>
  )
}
