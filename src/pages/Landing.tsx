import { useTranslation } from 'react-i18next'
import { ArrowRight, ClipboardCheck, Layers, ScanEye, Sigma } from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'
import { ToolCard } from '@/components/ToolCard'
import { Badge } from '@/components/ui/Badge'
import { TOOL_CATEGORIES, TOOLS } from '@/data/tools'
import { useAuth } from '@/hooks/useAuth'

export default function LandingPage() {
  const { user } = useAuth()
  const signedIn = Boolean(user)

  return (
    <>
      <Hero signedIn={signedIn} />
      <Proposition />
      <ToolsPreview />
      <ClosingCta signedIn={signedIn} />
    </>
  )
}

function Hero({ signedIn }: { signedIn: boolean }) {
  const { t } = useTranslation()

  return (
    <section className="relative overflow-hidden border-b border-line">
      <div className="pointer-events-none absolute inset-0 bg-graticule mask-fade-b opacity-50" />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full opacity-[0.16] blur-3xl"
        style={{ background: 'radial-gradient(circle, #7C5CFF 0%, transparent 65%)' }}
      />

      <div className="shell relative py-24 sm:py-32">
        <div className="max-w-2xl">
          <Badge tone="accent">{t('landing.hero.eyebrow')}</Badge>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance text-ink sm:text-5xl">
            {t('landing.hero.title')}
          </h1>

          <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
            {t('landing.hero.subtitle')}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {signedIn ? (
              <ButtonLink to="/dashboard" size="lg">
                {t('nav.dashboard')}
                <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
            ) : (
              <>
                <ButtonLink to="/signup" size="lg">
                  {t('landing.hero.ctaPrimary')}
                  <ArrowRight className="size-4" aria-hidden />
                </ButtonLink>
                <ButtonLink to="/login" size="lg" variant="secondary">
                  {t('landing.hero.ctaSecondary')}
                </ButtonLink>
              </>
            )}
          </div>

          <p className="mt-4 text-sm text-ink-faint">{t('landing.hero.note')}</p>
        </div>

        <SpecimenStrip />
      </div>
    </section>
  )
}

/**
 * A quiet band of sample outputs. Purely illustrative, but it shows the mono
 * face doing the job it exists for before any tool has shipped.
 */
function SpecimenStrip() {
  const samples = [
    { label: 'Gleason', value: '3 + 4 = 7', meta: 'Grade Group 2' },
    { label: 'Ki-67', value: '18.4%', meta: 'hotspot' },
    { label: 'TNM', value: 'pT3b N1 M0', meta: 'stage IIIC' },
    { label: 'Cellularity', value: '45%', meta: 'age-adjusted' },
  ]

  return (
    <div className="mt-16 grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line lg:grid-cols-4">
      {samples.map((sample) => (
        <div key={sample.label} className="bg-elevated px-5 py-4">
          <p className="text-xs tracking-wider text-ink-faint uppercase">{sample.label}</p>
          <p className="tabular mt-1.5 text-lg font-medium text-accent-ink">{sample.value}</p>
          <p className="mt-0.5 text-xs text-ink-faint">{sample.meta}</p>
        </div>
      ))}
    </div>
  )
}

const PROPOSITION_ITEMS = [
  { key: 'scores', icon: Sigma },
  { key: 'staging', icon: Layers },
  { key: 'reporting', icon: ClipboardCheck },
  { key: 'imaging', icon: ScanEye },
]

function Proposition() {
  const { t } = useTranslation()

  return (
    <section id="product" className="scroll-mt-14 border-b border-line">
      <div className="shell py-20 sm:py-24">
        <div className="max-w-2xl">
          <h2 className="text-2xl font-semibold tracking-tight text-balance text-ink sm:text-3xl">
            {t('landing.proposition.title')}
          </h2>
          <p className="mt-3 text-base leading-relaxed text-ink-muted">
            {t('landing.proposition.subtitle')}
          </p>
        </div>

        <div className="mt-12 grid gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {PROPOSITION_ITEMS.map((item) => (
            <div key={item.key} className="bg-elevated p-6">
              <span className="flex size-9 items-center justify-center rounded-md border border-line bg-surface text-accent">
                <item.icon className="size-[1.125rem]" aria-hidden />
              </span>
              <h3 className="mt-4 text-sm font-semibold tracking-tight text-ink">
                {t(`landing.proposition.items.${item.key}.title`)}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-ink-faint">
                {t(`landing.proposition.items.${item.key}.body`)}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

function ToolsPreview() {
  const { t } = useTranslation()

  return (
    <section id="tools" className="scroll-mt-14 border-b border-line">
      <div className="shell py-20 sm:py-24">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div className="max-w-2xl">
            <h2 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              {t('landing.toolsSection.title')}
            </h2>
            <p className="mt-3 text-base text-ink-muted">{t('landing.toolsSection.subtitle')}</p>
          </div>
          <Badge>
            <span className="tabular">{TOOLS.length}</span>
            {t('dashboard.inQueue')}
          </Badge>
        </div>

        <ul className="mt-8 flex flex-wrap gap-2">
          {TOOL_CATEGORIES.map((category) => (
            <li
              key={category.id}
              className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface px-3 py-1 text-xs text-ink-muted"
            >
              <category.icon className="size-3.5 text-ink-faint" aria-hidden />
              {t(`tools.categories.${category.i18nKey}.name`)}
            </li>
          ))}
        </ul>

        {/* Flat grid here on purpose — the dashboard is where the category
            grouping earns its keep; on the landing it just leaves gaps. */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
          {TOOLS.map((tool) => (
            <ToolCard key={tool.id} tool={tool} variant="preview" />
          ))}
        </div>

        <p className="mt-12 max-w-2xl text-xs leading-relaxed text-ink-faint">
          {t('landing.toolsSection.footnote')}
        </p>
      </div>
    </section>
  )
}

function ClosingCta({ signedIn }: { signedIn: boolean }) {
  const { t } = useTranslation()

  return (
    <section className="shell py-20 sm:py-24">
      <div className="rounded-lg border border-line bg-elevated px-6 py-12 text-center shadow-card sm:px-12">
        <h2 className="mx-auto max-w-xl text-2xl font-semibold tracking-tight text-balance text-ink">
          {t('landing.cta.title')}
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-relaxed text-ink-muted">
          {t('landing.cta.subtitle')}
        </p>
        <div className="mt-7 flex justify-center">
          <ButtonLink to={signedIn ? '/dashboard' : '/signup'} size="lg">
            {signedIn ? t('nav.dashboard') : t('landing.cta.button')}
            <ArrowRight className="size-4" aria-hidden />
          </ButtonLink>
        </div>
      </div>
    </section>
  )
}
