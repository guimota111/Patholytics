import { useTranslation } from 'react-i18next'
import { ButtonLink } from '@/components/ui/Button'
import { useAuth } from '@/hooks/useAuth'

export default function NotFoundPage() {
  const { t } = useTranslation()
  const { user } = useAuth()

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-ground px-5 text-center">
      <p className="tabular text-sm tracking-widest text-accent">404</p>
      <h1 className="mt-3 text-2xl font-semibold tracking-tight text-ink">{t('notFound.title')}</h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
        {t('notFound.subtitle')}
      </p>
      <div className="mt-7">
        {user ? (
          <ButtonLink to="/dashboard">{t('notFound.dashboard')}</ButtonLink>
        ) : (
          <ButtonLink to="/">{t('notFound.home')}</ButtonLink>
        )}
      </div>
    </div>
  )
}
