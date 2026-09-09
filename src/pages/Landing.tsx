import { lazy, Suspense, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/cn'
import { useAuth } from '@/hooks/useAuth'
import { SnapSection } from './landing/SnapSection'

/* Cada demonstração é a ferramenta de verdade rodando com um caso já
   começado, então cada uma vira o seu próprio pedaço do bundle: quem chega
   pela home baixa a primeira, e as outras conforme desce. */
const ProstateDemo = lazy(() => import('./landing/demos/ProstateDemo'))
const BreastDemo = lazy(() => import('./landing/demos/BreastDemo'))
const StagerDemo = lazy(() => import('./landing/demos/StagerDemo'))
const FieldsDemo = lazy(() => import('./landing/demos/FieldsDemo'))
const BillingDemo = lazy(() => import('./landing/demos/BillingDemo'))
const ArchiveDemo = lazy(() => import('./landing/demos/ArchiveDemo'))
const TmaDemo = lazy(() => import('./landing/demos/TmaDemo'))

/** Uma tela por ferramenta pronta, na ordem em que elas contam a história. */
const SNAPS = [
  { id: 'prostata', key: 'prostate', to: '/tools/prostate', Demo: ProstateDemo },
  { id: 'mama', key: 'breast', to: '/tools/breast', Demo: BreastDemo },
  { id: 'estadiamento', key: 'stager', to: '/tools/stager', Demo: StagerDemo },
  { id: 'campos', key: 'fields', to: '/tools/fields', Demo: FieldsDemo },
  { id: 'cobranca', key: 'billing', to: '/tools/billing', Demo: BillingDemo },
  { id: 'arquivo', key: 'archive', to: '/tools/archive', Demo: ArchiveDemo },
  { id: 'tma', key: 'tma', to: '/tools/tma', Demo: TmaDemo },
] as const

const SECTION_IDS = ['inicio', ...SNAPS.map((snap) => snap.id), 'conta']

export default function LandingPage() {
  const { user } = useAuth()
  const { t } = useTranslation()
  const signedIn = Boolean(user)

  // O encaixe por seção vale só nesta página; sair dela devolve a rolagem
  // normal ao resto do site.
  useEffect(() => {
    document.documentElement.classList.add('snap-page')
    return () => document.documentElement.classList.remove('snap-page')
  }, [])

  return (
    <>
      <Hero signedIn={signedIn} />

      {SNAPS.map((snap) => (
        <SnapSection
          key={snap.id}
          id={snap.id}
          eyebrow={t(`landing.snaps.${snap.key}.eyebrow`)}
          title={t(`landing.snaps.${snap.key}.title`)}
          body={t(`landing.snaps.${snap.key}.body`)}
          to={snap.to}
        >
          <Suspense fallback={<DemoFallback />}>
            <snap.Demo />
          </Suspense>
        </SnapSection>
      ))}

      <ClosingCta signedIn={signedIn} />
      <SectionDots />
    </>
  )
}

function DemoFallback() {
  return (
    <div className="flex h-[24rem] items-center justify-center rounded-lg border border-line bg-elevated">
      <Spinner />
    </div>
  )
}

function Hero({ signedIn }: { signedIn: boolean }) {
  const { t } = useTranslation()

  return (
    <section
      id="inicio"
      className="relative flex min-h-[calc(100dvh-3.5rem)] scroll-mt-14 snap-start flex-col justify-center overflow-hidden border-b border-line"
    >
      <div className="pointer-events-none absolute inset-0 bg-graticule mask-fade-b opacity-50" />
      <div
        className="pointer-events-none absolute -top-40 left-1/2 size-[36rem] -translate-x-1/2 rounded-full opacity-[0.16] blur-3xl"
        style={{ background: 'radial-gradient(circle, #7C5CFF 0%, transparent 65%)' }}
      />

      <div className="shell relative w-full py-20">
        <div className="max-w-2xl">
          <Badge tone="accent">{t('landing.hero.eyebrow')}</Badge>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance text-ink sm:text-5xl">
            {t('landing.hero.title')}
          </h1>

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
        </div>

        <a
          href={`#${SNAPS[0].id}`}
          className="mt-16 inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
        >
          <span className="flex size-8 items-center justify-center rounded-full border border-line bg-elevated">
            <ArrowDown className="size-4" aria-hidden />
          </span>
          {t('landing.hero.scrollCue')}
        </a>
      </div>
    </section>
  )
}

function ClosingCta({ signedIn }: { signedIn: boolean }) {
  const { t } = useTranslation()

  return (
    <section
      id="conta"
      className="flex min-h-[calc(100dvh-3.5rem)] scroll-mt-14 snap-start flex-col justify-center py-16"
    >
      <div className="shell w-full">
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
          <p className="mx-auto mt-8 max-w-2xl text-xs leading-relaxed text-ink-faint">
            {t('landing.disclaimer')}
          </p>
        </div>
      </div>
    </section>
  )
}

/** Onde o visitante está na página, e um atalho para qualquer outra tela. */
function SectionDots() {
  const { t } = useTranslation()
  const [active, setActive] = useState(SECTION_IDS[0])

  useEffect(() => {
    const sections = SECTION_IDS.map((id) => document.getElementById(id)).filter(
      (el): el is HTMLElement => el !== null,
    )
    if (!sections.length || typeof IntersectionObserver === 'undefined') return

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0]
        if (visible) setActive(visible.target.id)
      },
      { threshold: [0.35, 0.6] },
    )
    sections.forEach((section) => observer.observe(section))
    return () => observer.disconnect()
  }, [])

  return (
    <nav
      aria-label={t('landing.nav.label')}
      className="pointer-events-none fixed top-1/2 right-4 z-30 hidden -translate-y-1/2 flex-col gap-2.5 xl:flex"
    >
      {SECTION_IDS.map((id) => (
        <a
          key={id}
          href={`#${id}`}
          aria-label={t(`landing.nav.${id}`)}
          aria-current={active === id ? 'true' : undefined}
          className={cn(
            'pointer-events-auto size-2.5 rounded-full border transition-colors',
            active === id
              ? 'border-accent bg-accent'
              : 'border-line-strong bg-transparent hover:border-accent hover:bg-accent/40',
          )}
        />
      ))}
    </nav>
  )
}
