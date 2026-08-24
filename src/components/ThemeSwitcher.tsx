import { useCallback, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Monitor, Moon, Sun, type LucideIcon } from 'lucide-react'
import { useTheme } from '@/hooks/useTheme'
import { useDismiss } from '@/hooks/useClickOutside'
import { THEME_PREFERENCES, type ThemePreference } from '@/lib/theme'
import { cn } from '@/lib/cn'

const ICONS: Record<ThemePreference, LucideIcon> = { light: Sun, dark: Moon, system: Monitor }

/** Light / dark / follow-the-system. Stored per browser, never in the profile. */
export function ThemeSwitcher({ className }: { className?: string }) {
  const { t } = useTranslation()
  const { preference, resolved, setPreference } = useTheme()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setOpen(false), [])
  useDismiss(containerRef, open, close)

  // The trigger shows what is on screen, not the abstract "system" choice.
  const TriggerIcon = ICONS[resolved]

  return (
    <div ref={containerRef} className={cn('relative', className)}>
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={t('common.theme')}
        title={t(`theme.${preference}`)}
        className="inline-flex h-8 items-center rounded-md px-2 text-ink-muted transition-colors hover:bg-elevated hover:text-ink"
      >
        <TriggerIcon className="size-4" aria-hidden />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute right-0 z-50 mt-1.5 w-44 overflow-hidden rounded-md border border-line bg-elevated py-1 shadow-pop"
        >
          {THEME_PREFERENCES.map((option) => {
            const Icon = ICONS[option]
            return (
              <li key={option}>
                <button
                  type="button"
                  role="option"
                  aria-selected={option === preference}
                  onClick={() => {
                    setOpen(false)
                    setPreference(option)
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-sm text-ink-muted transition-colors hover:bg-raised hover:text-ink"
                >
                  <Icon className="size-4" aria-hidden />
                  <span className="flex-1">{t(`theme.${option}`)}</span>
                  {option === preference && <Check className="size-3.5 text-accent" aria-hidden />}
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
