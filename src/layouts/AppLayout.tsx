import { useCallback, useRef, useState } from 'react'
import { Link, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutGrid, LogOut, Menu, User as UserIcon } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { AppSidebar } from '@/components/AppSidebar'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { ThemeSwitcher } from '@/components/ThemeSwitcher'
import { useAuth } from '@/hooks/useAuth'
import { useDismiss } from '@/hooks/useClickOutside'

/**
 * Signed-in shell: a persistent tool rail on the left, a dense top bar for
 * account controls. Navigation lives entirely in the rail, so the bar stays
 * empty of links and the content column runs the full remaining width.
 */
const COLLAPSED_KEY = 'patholytics.sidebar.v1'

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(COLLAPSED_KEY) === 'collapsed'
  } catch {
    return false
  }
}

export function AppLayout() {
  const { t } = useTranslation()
  const [menuOpen, setMenuOpen] = useState(false)
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  // Read synchronously so a collapsed rail does not flash open on load.
  const [collapsed, setCollapsed] = useState(readCollapsed)
  const toggleCollapsed = useCallback(() => {
    setCollapsed((value) => {
      const next = !value
      try {
        localStorage.setItem(COLLAPSED_KEY, next ? 'collapsed' : 'expanded')
      } catch {
        // sem persistência a escolha vale só para esta sessão
      }
      return next
    })
  }, [])

  return (
    <div className="flex min-h-dvh bg-ground">
      <AppSidebar open={menuOpen} onClose={closeMenu} collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 border-b border-line bg-ground/85 backdrop-blur-sm">
          <div className="shell flex h-14 items-center justify-between gap-4">
            <div className="flex items-center gap-2 lg:hidden">
              <button
                type="button"
                onClick={() => setMenuOpen(true)}
                aria-label={t('nav.openMenu')}
                aria-expanded={menuOpen}
                className="-ml-1.5 rounded-md p-1.5 text-ink-muted transition-colors hover:bg-elevated hover:text-ink"
              >
                <Menu className="size-5" aria-hidden />
              </button>
              <Link to="/dashboard" aria-label={t('common.appName')}>
                <Logo />
              </Link>
            </div>

            <div className="flex items-center gap-1 lg:ml-auto">
              <ThemeSwitcher />
              <LanguageSwitcher />
              <AccountMenu />
            </div>
          </div>
        </header>

        <main className="flex-1">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

function initialsOf(name: string, email: string | null): string {
  const source = name.trim() || email?.split('@')[0] || '?'
  const parts = source.split(/[\s._-]+/).filter(Boolean)
  const letters = parts.length > 1 ? `${parts[0][0]}${parts[parts.length - 1][0]}` : source.slice(0, 2)
  return letters.toUpperCase()
}

function AccountMenu() {
  const { t } = useTranslation()
  const { user, profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setOpen(false), [])
  useDismiss(containerRef, open, close)

  const displayName = profile?.displayName || user?.displayName || ''
  const email = user?.email ?? null

  const handleSignOut = async () => {
    setOpen(false)
    await signOut()
    navigate('/', { replace: true })
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-haspopup="menu"
        aria-expanded={open}
        className="flex items-center gap-2 rounded-md py-1 pl-1 pr-1.5 transition-colors hover:bg-elevated"
      >
        <span className="flex size-7 items-center justify-center rounded-full border border-accent/30 bg-accent-soft text-[0.6875rem] font-semibold text-accent-ink">
          {initialsOf(displayName, email)}
        </span>
        <span className="hidden max-w-32 truncate text-sm text-ink-muted sm:inline">
          {displayName || email}
        </span>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 z-50 mt-1.5 w-60 overflow-hidden rounded-md border border-line bg-elevated shadow-pop"
        >
          <div className="border-b border-line px-3 py-3">
            <p className="truncate text-sm font-medium text-ink">{displayName || '—'}</p>
            <p className="truncate text-xs text-ink-faint">{email}</p>
          </div>

          <div className="py-1">
            <Link
              to="/profile"
              role="menuitem"
              onClick={close}
              className="flex items-center gap-2 px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-raised hover:text-ink"
            >
              <UserIcon className="size-4" aria-hidden />
              {t('nav.profile')}
            </Link>
            <Link
              to="/"
              role="menuitem"
              onClick={close}
              className="flex items-center gap-2 px-3 py-2 text-sm text-ink-muted transition-colors hover:bg-raised hover:text-ink"
            >
              <LayoutGrid className="size-4" aria-hidden />
              {t('nav.backToSite')}
            </Link>
            <button
              type="button"
              role="menuitem"
              onClick={() => void handleSignOut()}
              className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-ink-muted transition-colors hover:bg-raised hover:text-danger"
            >
              <LogOut className="size-4" aria-hidden />
              {t('nav.logout')}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
