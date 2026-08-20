import { useEffect, useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { CreditCard, LogOut } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card'
import { Input } from '@/components/ui/Input'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { ErrorAlert } from '@/components/ui/Alert'
import { useAuth } from '@/hooks/useAuth'
import { SUPPORTED_LANGUAGES, normalizeLanguage, type Language } from '@/i18n'

export default function ProfilePage() {
  const { t, i18n } = useTranslation()
  const { user, profile, updateProfile, signOut } = useAuth()
  const navigate = useNavigate()

  const [displayName, setDisplayName] = useState('')
  const [language, setLanguage] = useState<Language>(normalizeLanguage(i18n.language))
  const [status, setStatus] = useState<'idle' | 'saving' | 'saved'>('idle')
  const [errorKey, setErrorKey] = useState<string | null>(null)

  // Seed the form once the profile document arrives.
  useEffect(() => {
    if (!profile) return
    setDisplayName(profile.displayName)
    setLanguage(profile.language)
  }, [profile])

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault()
    setErrorKey(null)
    setStatus('saving')
    try {
      await updateProfile({ displayName: displayName.trim(), language })
      setStatus('saved')
    } catch {
      setErrorKey('auth.errors.generic')
      setStatus('idle')
    }
  }

  const handleSignOut = async () => {
    await signOut()
    navigate('/', { replace: true })
  }

  const createdAt = profile?.createdAt?.toDate()
  const memberSince = createdAt
    ? new Intl.DateTimeFormat(normalizeLanguage(i18n.language), {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(createdAt)
    : '—'

  return (
    <div className="mx-auto max-w-3xl px-5 py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('profile.title')}</h1>
        <p className="mt-1.5 text-sm text-ink-muted">{t('profile.subtitle')}</p>
      </header>

      <form onSubmit={handleSubmit} className="mt-8 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('profile.accountSection')}</CardTitle>
          </CardHeader>
          <CardBody className="space-y-5">
            {errorKey && <ErrorAlert>{t(errorKey)}</ErrorAlert>}

            <Input
              label={t('profile.displayName')}
              value={displayName}
              placeholder={t('profile.displayNamePlaceholder')}
              onChange={(event) => {
                setDisplayName(event.target.value)
                setStatus('idle')
              }}
            />

            <Input
              label={t('common.email')}
              value={user?.email ?? ''}
              hint={t('profile.emailReadOnly')}
              readOnly
              disabled
            />

            <div className="flex items-center justify-between border-t border-line pt-4 text-sm">
              <span className="text-ink-muted">{t('profile.memberSince')}</span>
              <span className="tabular text-ink">{memberSince}</span>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('profile.preferencesSection')}</CardTitle>
          </CardHeader>
          <CardBody className="space-y-1.5">
            <label htmlFor="language" className="block text-sm font-medium text-ink">
              {t('profile.preferredLanguage')}
            </label>
            <select
              id="language"
              value={language}
              onChange={(event) => {
                setLanguage(event.target.value as Language)
                setStatus('idle')
              }}
              className="h-10 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink transition-colors hover:border-line-strong sm:max-w-xs"
            >
              {SUPPORTED_LANGUAGES.map((code) => (
                <option key={code} value={code}>
                  {t(`languages.${code}`)}
                </option>
              ))}
            </select>
            <p className="text-xs text-ink-faint">{t('profile.preferredLanguageHint')}</p>
          </CardBody>
        </Card>

        <div className="flex items-center gap-3">
          <Button type="submit" loading={status === 'saving'}>
            {status === 'saving' ? t('common.saving') : t('common.save')}
          </Button>
          {status === 'saved' && (
            <span className="text-sm text-success" role="status">
              {t('profile.updated')}
            </span>
          )}
        </div>
      </form>

      <div className="mt-6 space-y-6">
        <Card>
          <CardHeader className="flex items-center justify-between gap-3">
            <CardTitle>{t('profile.planSection')}</CardTitle>
            <Badge tone="accent">{t('profile.planFree')}</Badge>
          </CardHeader>
          <CardBody className="space-y-4">
            <div className="flex items-center justify-between text-sm">
              <span className="text-ink-muted">{t('profile.planCurrent')}</span>
              <span className="tabular text-ink">{t('profile.planFree')}</span>
            </div>
            <p className="text-sm leading-relaxed text-ink-faint">{t('profile.planPlaceholder')}</p>
            {/* Billing lands here — the surface is reserved, nothing is wired. */}
            <Button variant="secondary" disabled>
              <CreditCard className="size-4" aria-hidden />
              {t('profile.planCta')}
            </Button>
          </CardBody>
        </Card>

        <div className="border-t border-line pt-6">
          <Button variant="danger" onClick={() => void handleSignOut()}>
            <LogOut className="size-4" aria-hidden />
            {t('profile.signOut')}
          </Button>
        </div>
      </div>
    </div>
  )
}
