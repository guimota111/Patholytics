import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ErrorAlert } from '@/components/ui/Alert'
import { AuthDivider, GoogleButton } from '@/components/GoogleButton'
import { FirebaseSetupNotice } from '@/components/FirebaseSetupNotice'
import { useAuth } from '@/hooks/useAuth'
import { authErrorKey } from '@/lib/authErrors'
import { isFirebaseConfigured } from '@/lib/firebase'
import { safeRedirect } from '@/lib/redirect'

export default function LoginPage() {
  const { t } = useTranslation()
  const { signInWithEmail, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorKey, setErrorKey] = useState<string | null>(null)
  const [pending, setPending] = useState<'email' | 'google' | null>(null)

  const next = safeRedirect(searchParams.get('next'))

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!email.trim()) return setErrorKey('auth.errors.requiredEmail')
    if (!password) return setErrorKey('auth.errors.requiredPassword')

    setErrorKey(null)
    setPending('email')
    try {
      await signInWithEmail({ email: email.trim(), password })
      navigate(next, { replace: true })
    } catch (error) {
      setErrorKey(authErrorKey(error))
      setPending(null)
    }
  }

  const handleGoogle = async () => {
    setErrorKey(null)
    setPending('google')
    try {
      await signInWithGoogle()
      navigate(next, { replace: true })
    } catch (error) {
      setErrorKey(authErrorKey(error))
      setPending(null)
    }
  }

  return (
    <AuthLayout
      title={t('auth.login.title')}
      subtitle={t('auth.login.subtitle')}
      footer={
        <>
          {t('auth.login.noAccount')}{' '}
          <Link to="/signup" className="font-medium text-accent hover:text-accent-hover">
            {t('auth.login.signupLink')}
          </Link>
        </>
      }
    >
      {!isFirebaseConfigured ? (
        <FirebaseSetupNotice />
      ) : (
        <div className="space-y-5">
          {errorKey && <ErrorAlert>{t(errorKey)}</ErrorAlert>}

          <GoogleButton
            onClick={() => void handleGoogle()}
            loading={pending === 'google'}
            disabled={pending !== null}
          />

          <AuthDivider />

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <Input
              label={t('common.email')}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@lab.org"
            />

            <div className="space-y-1.5">
              <Input
                label={t('common.password')}
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
              />
              <div className="text-right">
                <Link
                  to="/reset-password"
                  className="text-xs text-ink-muted transition-colors hover:text-accent"
                >
                  {t('auth.login.forgot')}
                </Link>
              </div>
            </div>

            <Button type="submit" fullWidth loading={pending === 'email'} disabled={pending !== null}>
              {t('auth.login.submit')}
            </Button>
          </form>
        </div>
      )}
    </AuthLayout>
  )
}
