import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Logo } from '@/components/ui/Logo'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'

interface AuthLayoutProps {
  title: string
  subtitle: string
  children: ReactNode
  footer?: ReactNode
}

export function AuthLayout({ title, subtitle, children, footer }: AuthLayoutProps) {
  const { t } = useTranslation()

  return (
    <div className="relative flex min-h-dvh flex-col bg-ground">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-72 bg-graticule mask-fade-b opacity-40" />

      <header className="relative z-10 flex h-14 items-center justify-between px-5">
        <Link to="/" aria-label={t('common.appName')}>
          <Logo />
        </Link>
        <LanguageSwitcher />
      </header>

      <main className="relative z-10 flex flex-1 items-start justify-center px-5 pt-8 pb-16 sm:items-center sm:pt-0 sm:pb-24">
        <div className="w-full max-w-sm">
          <div className="mb-6 space-y-1.5">
            <h1 className="text-xl font-semibold tracking-tight text-ink">{title}</h1>
            <p className="text-sm text-ink-muted">{subtitle}</p>
          </div>

          <div className="rounded-lg border border-line bg-elevated p-6 shadow-card">{children}</div>

          {footer && <div className="mt-5 text-center text-sm text-ink-muted">{footer}</div>}
        </div>
      </main>
    </div>
  )
}
