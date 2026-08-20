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

export default function SignupPage() {
  const { t } = useTranslation()
  const { signUpWithEmail, signInWithGoogle } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errorKey, setErrorKey] = useState<string | null>(null)
  const [pending, setPending] = useState<'email' | 'google' | null>(null)

  const next = safeRedirect(searchParams.get('next'))

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!name.trim()) return setErrorKey('auth.errors.requiredName')
    if (!email.trim()) return setErrorKey('auth.errors.requiredEmail')
    if (password.length < 6) return setErrorKey('auth.errors.weakPassword')

    setErrorKey(null)
    setPending('email')
    try {
      await signUpWithEmail({ name: name.trim(), email: email.trim(), password })
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
      title={t('auth.signup.title')}
      subtitle={t('auth.signup.subtitle')}
      footer={
        <>
          {t('auth.signup.hasAccount')}{' '}
          <Link to="/login" className="font-medium text-accent hover:text-accent-hover">
            {t('auth.signup.loginLink')}
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
              label={t('common.name')}
              type="text"
              autoComplete="name"
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
            <Input
              label={t('common.email')}
              type="email"
              autoComplete="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@lab.org"
            />
            <Input
              label={t('common.password')}
              type="password"
              autoComplete="new-password"
              hint={t('auth.signup.passwordHint')}
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />

            <Button type="submit" fullWidth loading={pending === 'email'} disabled={pending !== null}>
              {t('auth.signup.submit')}
            </Button>

            <p className="text-xs leading-relaxed text-ink-faint">{t('auth.signup.terms')}</p>
          </form>
        </div>
      )}
    </AuthLayout>
  )
}
