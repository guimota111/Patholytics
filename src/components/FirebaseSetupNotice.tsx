import { useTranslation } from 'react-i18next'
import { TriangleAlert } from 'lucide-react'

/** Shown in place of auth UI when `.env` has not been filled in yet. */
export function FirebaseSetupNotice() {
  const { t } = useTranslation()

  return (
    <div className="flex items-start gap-3 rounded-md border border-line bg-surface px-4 py-3.5 text-sm">
      <TriangleAlert className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
      <div className="space-y-1">
        <p className="font-medium text-ink">{t('setup.title')}</p>
        <p className="leading-relaxed text-ink-faint">{t('setup.body')}</p>
      </div>
    </div>
  )
}
