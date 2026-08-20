import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { MailCheck } from 'lucide-react'
import { AuthLayout } from '@/layouts/AuthLayout'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { ErrorAlert } from '@/components/ui/Alert'
import { FirebaseSetupNotice } from '@/components/FirebaseSetupNotice'
import { useAuth } from '@/hooks/useAuth'
import { authErrorKey } from '@/lib/authErrors'
import { isFirebaseConfigured } from '@/lib/firebase'

export default function ResetPasswordPage() {
  const { t } = useTranslation()
  const { sendPasswordReset } = useAuth()

  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [errorKey, setErrorKey] = useState<string | null>(null)
  const [pending, setPending] = useState(false)

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    if (!email.trim()) return setErrorKey('auth.errors.requiredEmail')

    setErrorKey(null)
    setPending(true)
    try {
      await sendPasswordReset(email.trim())
      setSent(true)
    } catch (error) {
      // "No such user" is deliberately not surfaced — it would confirm whether
      // an address is registered. Only genuine input/transport errors show.
      const key = authErrorKey(error)
      if (key === 'auth.errors.invalidCredentials' || key === 'auth.errors.generic') {
        setSent(true)
      } else {
        setErrorKey(key)
      }
    } finally {
      setPending(false)
    }
  }

  return (
    <AuthLayout
      title={sent ? t('auth.reset.sentTitle') : t('auth.reset.title')}
      subtitle={sent ? '' : t('auth.reset.subtitle')}
      footer={
        <Link to="/login" className="font-medium text-accent hover:text-accent-hover">
          {t('auth.reset.backToLogin')}
        </Link>
      }
    >
      {!isFirebaseConfigured ? (
        <FirebaseSetupNotice />
      ) : sent ? (
        <div className="flex items-start gap-3">
          <MailCheck className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden />
          <p className="text-sm leading-relaxed text-ink-muted">
            {t('auth.reset.sentBody', { email: email.trim() })}
          </p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          {errorKey && <ErrorAlert>{t(errorKey)}</ErrorAlert>}

          <Input
            label={t('common.email')}
            type="email"
            autoComplete="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@lab.org"
          />

          <Button type="submit" fullWidth loading={pending}>
            {t('auth.reset.submit')}
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
