import { useCallback, useRef, useState } from 'react'
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutGrid, LogOut, User as UserIcon } from 'lucide-react'
import { Logo, LogoMark } from '@/components/ui/Logo'
import { LanguageSwitcher } from '@/components/LanguageSwitcher'
import { useAuth } from '@/hooks/useAuth'
import { useDismiss } from '@/hooks/useClickOutside'
import { cn } from '@/lib/cn'

/** Signed-in shell: dense header, no marketing chrome. */
export function AppLayout() {
  const { t } = useTranslation()

  const navItems = [
    { to: '/dashboard', label: t('nav.dashboard'), icon: LayoutGrid },
    { to: '/profile', label: t('nav.profile'), icon: UserIcon },
  ]

  return (
    <div className="flex min-h-dvh flex-col bg-ground">
      <header className="sticky top-0 z-40 border-b border-line bg-ground/85 backdrop-blur-sm">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-5">
          <div className="flex items-center gap-6">
            <Link to="/dashboard" aria-label={t('common.appName')}>
              <Logo className="hidden sm:inline-flex" />
              <LogoMark className="size-6 text-accent sm:hidden" />
            </Link>

            <nav className="flex items-center gap-1">
              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) =>
                    cn(
                      'inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm transition-colors',
                      isActive
                        ? 'bg-elevated text-ink'
                        : 'text-ink-muted hover:bg-elevated hover:text-ink',
                    )
                  }
                >
                  <item.icon className="size-4" aria-hidden />
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-1">
            <LanguageSwitcher />
            <AccountMenu />
          </div>
        </div>
      </header>

      <main className="flex-1">
        <Outlet />
      </main>
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
