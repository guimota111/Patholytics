import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Globe } from 'lucide-react'
import { SUPPORTED_LANGUAGES, normalizeLanguage, type Language } from '@/i18n'
import { useAuth } from '@/hooks/useAuth'
import { useDismiss } from '@/hooks/useClickOutside'
import { cn } from '@/lib/cn'

const SHORT_LABEL: Record<Language, string> = { en: 'EN', 'pt-BR': 'PT' }

/**
 * Changing language always updates the local session; when signed in it also
 * persists to `users/{uid}` so the choice follows the account across devices.
 */
export function LanguageSwitcher({ className }: { className?: string }) {
  const { t, i18n } = useTranslation()
  const { user, updateProfile } = useAuth()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setOpen(false), [])
  useDismiss(containerRef, open, close)

  const active = normalizeLanguage(i18n.language)

  const select = async (language: Language) => {
    setOpen(false)
    if (language === active) return

    await i18n.changeLanguage(language)
    if (user) {
      try {
        await updateProfile({ language })
      } catch (error) {
        // The UI already switched; a failed write just means it won't persist.
        console.error('Failed to persist language preference', error)
      }
    }
  }

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('common.language')}
        className="inline-flex h-8 items-center gap-1.5 rounded-md px-2 text-sm text-ink-muted transition-colors hover:bg-elevated hover:text-ink"
      >
        <Globe className="size-4" aria-hidden />
        <span className="tabular text-xs font-medium">{SHORT_LABEL[active]}</span>
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-1.5 w-44 overflow-hidden rounded-md border border-line bg-elevated py-1 shadow-pop"
        >
          {SUPPORTED_LANGUAGES.map((language) => (
            <li key={language}>
              <button
                type="button"
                role="option"
                aria-selected={language === active}
                onClick={() => void select(language)}
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm text-ink-muted transition-colors hover:bg-raised hover:text-ink"
              >
                {t(`languages.${language}`)}
                {language === active && <Check className="size-3.5 text-accent" aria-hidden />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
