import { useTranslation } from 'react-i18next'
import { Info } from 'lucide-react'
import { ToolCard } from '@/components/ToolCard'
import { Badge } from '@/components/ui/Badge'
import { TOOL_CATEGORIES, availableTools, comingSoonTools, toolsByCategory } from '@/data/tools'
import { useAuth } from '@/hooks/useAuth'

export default function DashboardPage() {
  const { t } = useTranslation()
  const { user, profile } = useAuth()

  const firstName = (profile?.displayName || user?.displayName || '').split(' ')[0]
  const available = availableTools().length
  const queued = comingSoonTools().length

  const stats = [
    { label: t('dashboard.statLabelAvailable'), value: String(available) },
    { label: t('dashboard.statLabelQueue'), value: String(queued) },
    { label: t('dashboard.statLabelPlan'), value: t('profile.planFree') },
  ]

  return (
    <div className="shell py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">
          {firstName ? t('dashboard.greeting', { name: firstName }) : t('dashboard.greetingFallback')}
        </h1>
        <p className="mt-1.5 text-sm text-ink-muted">{t('dashboard.subtitle')}</p>
      </header>

      <div className="mt-8 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-elevated px-5 py-4">
            <p className="text-xs tracking-wider text-ink-faint uppercase">{stat.label}</p>
            <p className="tabular mt-1.5 text-xl font-medium text-ink">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 space-y-12">
        {TOOL_CATEGORIES.map((category) => {
          const tools = toolsByCategory(category.id)

          return (
            <section key={category.id}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
                <div className="flex items-start gap-2.5">
                  <category.icon className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
                  <div>
                    <h2 className="text-sm font-semibold tracking-tight text-ink">
                      {t(`tools.categories.${category.i18nKey}.name`)}
                    </h2>
                    <p className="mt-0.5 text-xs text-ink-faint">
                      {t(`tools.categories.${category.i18nKey}.description`)}
                    </p>
                  </div>
                </div>

                <Badge>
                  <span className="tabular">{tools.length}</span>
                </Badge>
              </div>

              {tools.length === 0 ? (
                <p className="mt-4 text-sm text-ink-faint">{t('dashboard.emptyCategory')}</p>
              ) : (
                <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                  {tools.map((tool) => (
                    <ToolCard key={tool.id} tool={tool} />
                  ))}
                </div>
              )}
            </section>
          )
        })}
      </div>

      <p className="mt-14 flex items-start gap-2 border-t border-line pt-6 text-xs leading-relaxed text-ink-faint">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        {t('dashboard.disclaimer')}
      </p>
    </div>
  )
}
