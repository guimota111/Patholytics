import { lazy, Suspense, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowDown, ArrowRight } from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { Spinner } from '@/components/ui/Spinner'
import { ToolCard } from '@/components/ToolCard'
import { TOOLS } from '@/data/tools'
import { cn } from '@/lib/cn'
import { useAuth } from '@/hooks/useAuth'
import { SnapSection } from './landing/SnapSection'

import landingBgImg from '@/assets/landing_bg.jpg'

/* Cada demonstração é a ferramenta de verdade rodando com um caso já
   começado, então cada uma vira o seu próprio pedaço do bundle. O pedaço é
   buscado antes de a rolagem chegar nele (useDemoPrefetch): esperar a seção
   aparecer para só então baixá-la deixava a tela vazia no meio do caminho. */
const DEMO_IMPORTS = {
  skin: () => import('./landing/demos/InflammatorySkinDemo'),
  markers: () => import('./landing/demos/MarkerHelperDemo'),
  bugs: () => import('./landing/demos/BugCatalogDemo'),
  foreign: () => import('./landing/demos/ForeignCatalogDemo'),
  mohs: () => import('./landing/demos/MohsDemo'),
  prostate: () => import('./landing/demos/ProstateDemo'),
  breast: () => import('./landing/demos/BreastDemo'),
  stager: () => import('./landing/demos/StagerDemo'),
  fields: () => import('./landing/demos/FieldsDemo'),
  billing: () => import('./landing/demos/BillingDemo'),
  archive: () => import('./landing/demos/ArchiveDemo'),
}

const InflammatorySkinDemo = lazy(DEMO_IMPORTS.skin)
const MarkerHelperDemo = lazy(DEMO_IMPORTS.markers)
const BugCatalogDemo = lazy(DEMO_IMPORTS.bugs)
const ForeignCatalogDemo = lazy(DEMO_IMPORTS.foreign)
const MohsDemo = lazy(DEMO_IMPORTS.mohs)
const ProstateDemo = lazy(DEMO_IMPORTS.prostate)
const BreastDemo = lazy(DEMO_IMPORTS.breast)
const StagerDemo = lazy(DEMO_IMPORTS.stager)
const FieldsDemo = lazy(DEMO_IMPORTS.fields)
const BillingDemo = lazy(DEMO_IMPORTS.billing)
const ArchiveDemo = lazy(DEMO_IMPORTS.archive)

/** Uma tela por ferramenta pronta, na ordem em que elas contam a história. */
const SNAPS = [
  { id: 'peles', key: 'skin', to: '/tools/peles-inflamatorias', Demo: InflammatorySkinDemo },
  { id: 'marcadores', key: 'markers', to: '/tools/marcadores', Demo: MarkerHelperDemo },
  { id: 'bichos', key: 'bugs', to: '/tools/bichos', Demo: BugCatalogDemo },
  { id: 'corpos-estranhos', key: 'foreign', to: '/tools/corpos-estranhos', Demo: ForeignCatalogDemo },
  { id: 'mohs', key: 'mohs', to: '/tools/congelacao', Demo: MohsDemo },
  { id: 'prostata', key: 'prostate', to: '/tools/prostate', Demo: ProstateDemo },
  { id: 'mama', key: 'breast', to: '/tools/breast', Demo: BreastDemo },
  { id: 'estadiamento', key: 'stager', to: '/tools/stager', Demo: StagerDemo },
  { id: 'campos', key: 'fields', to: '/tools/fields', Demo: FieldsDemo },
  { id: 'cobranca', key: 'billing', to: '/tools/billing', Demo: BillingDemo },
  { id: 'arquivo', key: 'archive', to: '/tools/archive', Demo: ArchiveDemo },
] as const

const DEMO_ORDER = Object.keys(DEMO_IMPORTS) as (keyof typeof DEMO_IMPORTS)[]

/**
 * Baixa cada demonstração antes de a rolagem chegar nela. As duas primeiras
 * saem assim que o navegador fica ocioso; as outras, quando a seção anterior
 * entra na tela — baixar as onze de uma vez seria mais de um megabyte de
 * conteúdo que talvez ninguém role até lá.
 */
function useDemoPrefetch() {
  useEffect(() => {
    const loaded = new Set<string>()
    const load = (key: string | undefined) => {
      if (!key || loaded.has(key)) return
      loaded.add(key)
      void DEMO_IMPORTS[key as keyof typeof DEMO_IMPORTS]()
    }

    const head = () => DEMO_ORDER.slice(0, 2).forEach(load)
    const idle = window.requestIdleCallback
    const timer =
      typeof idle === 'function' ? idle.call(window, head, { timeout: 2500 }) : window.setTimeout(head, 1200)

    let observer: IntersectionObserver | null = null
    if (typeof IntersectionObserver !== 'undefined') {
      observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            if (!entry.isIntersecting) continue
            const index = SNAPS.findIndex((snap) => snap.id === entry.target.id)
            if (index < 0) continue
            load(DEMO_ORDER[index + 1])
            load(DEMO_ORDER[index + 2])
          }
        },
        { rootMargin: '100% 0px' },
      )
      for (const snap of SNAPS) {
        const section = document.getElementById(snap.id)
        if (section) observer.observe(section)
      }
    }

    return () => {
      if (typeof idle === 'function') window.cancelIdleCallback(timer)
      else window.clearTimeout(timer)
      observer?.disconnect()
    }
  }, [])
}

const SECTION_IDS = ['inicio', ...SNAPS.map((snap) => snap.id), 'ferramentas', 'conta']

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

  useDemoPrefetch()

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

      <AllTools />
      <ClosingCta signedIn={signedIn} />
      <SectionDots />
    </>
  )
}

function DemoFallback() {
  return (
    <div className="flex min-h-[32rem] items-center justify-center rounded-lg border border-line bg-elevated">
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
      {/* Imagem de fundo. A arte é escura e foi feita para o tema escuro, então
          o quanto ela aparece muda com o tema (.hero-photo, em index.css) e o
          véu na cor do fundo garante a leitura do texto nos dois. */}
      <div className="pointer-events-none absolute inset-0 z-0">
        <img
          src={landingBgImg}
          alt=""
          draggable={false}
          className="hero-photo size-full object-cover"
          style={{
            maskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 55%, transparent 100%)',
          }}
        />
        <div className="absolute inset-0 bg-linear-to-r from-ground via-ground/85 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-t from-ground to-transparent" />
      </div>

      <div className="pointer-events-none absolute inset-0 bg-graticule mask-fade-b opacity-30 z-0" />
      <div
        className="pointer-events-none absolute -top-40 right-0 size-[40rem] rounded-full opacity-[0.15] blur-3xl z-0"
        style={{ background: 'radial-gradient(circle, #7C5CFF 0%, transparent 70%)' }}
      />

      <div className="shell relative w-full py-20 z-10">
        <div className="max-w-2xl">
          <Badge tone="accent">{t('landing.hero.eyebrow')}</Badge>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight text-balance text-ink sm:text-5xl lg:text-6xl">
            {t('landing.hero.title')}
          </h1>

          <p className="mt-5 max-w-xl text-base leading-relaxed text-pretty text-ink-muted sm:text-lg">
            {t('landing.hero.subtitle')}
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {signedIn ? (
              <ButtonLink to="/dashboard" size="lg" className="shadow-lg">
                {t('nav.dashboard')}
                <ArrowRight className="size-4" aria-hidden />
              </ButtonLink>
            ) : (
              <>
                <ButtonLink to="/signup" size="lg" className="shadow-lg">
                  {t('landing.hero.ctaPrimary')}
                  <ArrowRight className="size-4" aria-hidden />
                </ButtonLink>
                <ButtonLink to="/login" size="lg" variant="secondary" className="bg-elevated/50 backdrop-blur-md">
                  {t('landing.hero.ctaSecondary')}
                </ButtonLink>
              </>
            )}
          </div>
          
          <a
            href={`#${SNAPS[0].id}`}
            className="mt-16 inline-flex items-center gap-2 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            <span className="flex size-8 items-center justify-center rounded-full border border-line bg-elevated/50 backdrop-blur-md shadow-sm">
              <ArrowDown className="size-4" aria-hidden />
            </span>
            {t('landing.hero.scrollCue')}
          </a>
        </div>
      </div>
    </section>
  )
}

/**
 * Sete ferramentas cabem numa demonstração; as outras — diferencial,
 * catálogos, bancada — só aparecem se a página as listar. Esta seção é o
 * catálogo inteiro, tirado da mesma fonte que o painel.
 */
function AllTools() {
  const { t } = useTranslation()

  return (
    <section
      id="ferramentas"
      className="flex min-h-[calc(100dvh-3.5rem)] scroll-mt-14 snap-start flex-col justify-center border-b border-line py-12"
    >
      <div className="shell w-full">
        <header className="max-w-2xl">
          <Badge tone="accent">{t('landing.tools.eyebrow')}</Badge>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-balance text-ink sm:text-3xl">
            {t('landing.tools.title', { count: TOOLS.length })}
          </h2>
          <p className="mt-2 text-base leading-relaxed text-ink-muted">
            {t('landing.tools.body')}
          </p>
        </header>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {TOOLS.map((tool) => (
            <ToolCard key={tool.id} tool={tool} variant="preview" />
          ))}
        </div>
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
