import { Link, Outlet } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Logo } from '@/components/ui/Logo'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ButtonLink } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

/** Public shell — deliberately shares nothing with the signed-in chrome. */
export function MarketingLayout() {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <div className="flex min-h-dvh flex-col bg-ground">
      <header className="sticky top-0 z-40 border-b border-line bg-ground/85 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-5">
          <Link to="/" aria-label={t('common.appName')}>
            <Logo />
          </Link>

          <nav className="flex items-center gap-1.5">
            <a
              href="#product"
              className="hidden rounded-md px-3 py-1.5 text-sm text-ink-muted transition-colors hover:text-ink sm:inline-flex"
            >
              {t('nav.product')}
            </a>
            <a
              href="#tools"
              className="hidden rounded-md px-3 py-1.5 text-sm text-ink-muted transition-colors hover:text-ink sm:inline-flex"
            >
              {t('nav.tools')}
            </a>

            <LanguageSwitcher className="mx-1" />

            {user ? (
              <ButtonLink to="/dashboard" size="sm">
                {t('nav.dashboard')}
              </ButtonLink>
            ) : (
              <>
                <Link
                  to="/login"
                  className="rounded-md px-3 py-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
                >
                  {t('nav.login')}
                </Link>
                <ButtonLink to="/signup" size="sm">
                  {t('nav.signup')}
                </ButtonLink>
              </>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>

      <SiteFooter />
    </div>
  )
}

function SiteFooter() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  const columns = [
    {
      title: t('landing.footer.product'),
      links: [t('nav.tools'), t('landing.footer.changelog')],
    },
    {
      title: t('landing.footer.company'),
      links: [t('landing.footer.about'), t('landing.footer.contact')],
    },
    {
      title: t('landing.footer.legal'),
      links: [
        t('landing.footer.privacy'),
        t('landing.footer.terms'),
        t('landing.footer.disclaimer'),
      ],
    },
  ]

  return (
    <footer className="border-t border-line bg-ground">
      <div className="mx-auto max-w-6xl px-5 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div className="space-y-3">
            <Logo />
            <p className="max-w-56 text-sm leading-relaxed text-ink-faint">
              {t('landing.footer.tagline')}
            </p>
            <LanguageSwitcher className="-ml-2" />
          </div>

          {columns.map((column) => (
            <div key={column.title} className="space-y-3">
              <h3 className="text-xs font-semibold tracking-wider text-ink-muted uppercase">
                {column.title}
              </h3>
              <ul className="space-y-2">
                {column.links.map((link) => (
                  <li key={link}>
                    {/* Institutional pages are placeholders until there is content to link to. */}
                    <span className="text-sm text-ink-faint">{link}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-col gap-2 border-t border-line pt-6 text-xs text-ink-faint sm:flex-row sm:items-center sm:justify-between">
          <p>
            <span className="tabular">{year}</span> {t('common.appName')}.{' '}
            {t('landing.footer.rights')}
          </p>
          <p>{t('landing.footer.placeholderNote')}</p>
        </div>
      </div>
    </footer>
  )
}
