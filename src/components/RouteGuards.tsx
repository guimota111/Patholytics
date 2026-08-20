import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { FullPageSpinner } from '@/components/ui/Spinner'

/**
 * Blocks app routes until auth resolves. Rendering a spinner rather than
 * redirecting during `initializing` is what stops a signed-in user from being
 * bounced to /login on every hard refresh.
 */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, initializing } = useAuth()
  const { t } = useTranslation()
  const location = useLocation()

  if (initializing) return <FullPageSpinner label={t('common.loading')} />

  if (!user) {
    const next = `${location.pathname}${location.search}`
    return <Navigate to={`/login?next=${encodeURIComponent(next)}`} replace />
  }

  return <>{children}</>
}

/** Keeps signed-in users out of the auth screens. */
export function RedirectIfAuthenticated({ children }: { children: ReactNode }) {
  const { user, initializing } = useAuth()
  const { t } = useTranslation()

  if (initializing) return <FullPageSpinner label={t('common.loading')} />
  if (user) return <Navigate to="/dashboard" replace />

  return <>{children}</>
}
