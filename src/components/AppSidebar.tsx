import { useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutGrid, Lock, User as UserIcon, X } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { TOOL_CATEGORIES, toolsByCategory, type Tool } from '@/data/tools'
import { cn } from '@/lib/cn'

interface AppSidebarProps {
  /** Drawer state. Only meaningful below `lg`, where the rail is off-canvas. */
  open: boolean
  onClose: () => void
}

const rowClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors',
    isActive ? 'bg-elevated text-ink' : 'text-ink-muted hover:bg-elevated hover:text-ink',
  )

/**
 * The signed-in tool rail. Static from `lg` up, an off-canvas drawer below it
 * — one element either way, so there is no second copy of the nav to keep in
 * sync.
 */
export function AppSidebar({ open, onClose }: AppSidebarProps) {
  const { t } = useTranslation()
  const { pathname } = useLocation()

  // Following a link inside the drawer should dismiss it.
  useEffect(() => {
    onClose()
  }, [pathname, onClose])

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  // The page behind an open drawer must not scroll under the finger.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  return (
    <>
      {open && (
        <div
          onClick={onClose}
          aria-hidden
          className="fixed inset-0 z-40 bg-ground/70 backdrop-blur-[2px] lg:hidden"
        />
      )}

      <aside
        aria-label={t('nav.sidebar')}
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-line bg-surface',
          'transition-transform duration-200 ease-out',
          'lg:sticky lg:top-0 lg:bottom-auto lg:z-30 lg:h-dvh lg:shrink-0 lg:translate-x-0',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-line px-4">
          <Link to="/dashboard" aria-label={t('common.appName')}>
            <Logo />
          </Link>
          <button
            type="button"
            onClick={onClose}
            aria-label={t('nav.closeMenu')}
            className="-mr-1 rounded-md p-1.5 text-ink-muted transition-colors hover:bg-elevated hover:text-ink lg:hidden"
          >
            <X className="size-4" aria-hidden />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-3 py-4">
          <ul className="space-y-0.5">
            <li>
              <NavLink to="/dashboard" className={rowClass}>
                <LayoutGrid className="size-4 shrink-0" aria-hidden />
                {t('nav.dashboard')}
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile" className={rowClass}>
                <UserIcon className="size-4 shrink-0" aria-hidden />
                {t('nav.profile')}
              </NavLink>
            </li>
          </ul>

          {TOOL_CATEGORIES.map((category) => {
            const tools = toolsByCategory(category.id)
            if (tools.length === 0) return null

            return (
              <section key={category.id} className="space-y-1">
                <h2 className="px-2.5 text-[0.6875rem] font-semibold tracking-wider text-ink-faint uppercase">
                  {t(`tools.categories.${category.i18nKey}.name`)}
                </h2>
                <ul className="space-y-0.5">
                  {tools.map((tool) => (
                    <li key={tool.id}>
                      <ToolRow tool={tool} />
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </nav>
      </aside>
    </>
  )
}

/**
 * Queued tools stay listed and read as locked instead of disappearing, so the
 * rail shows the whole product surface rather than an empty shell.
 */
function ToolRow({ tool }: { tool: Tool }) {
  const { t } = useTranslation()
  const Icon = tool.icon
  const name = t(`tools.${tool.i18nKey}.name`)
  const { path } = tool

  if (tool.status !== 'available' || !path) {
    return (
      <span
        aria-disabled="true"
        title={t('common.comingSoon')}
        className="flex cursor-not-allowed items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-ink-faint select-none"
      >
        <Icon className="size-4 shrink-0" aria-hidden />
        <span className="truncate">{name}</span>
        <Lock className="ml-auto size-3 shrink-0" aria-hidden />
      </span>
    )
  }

  return (
    <NavLink to={path} className={rowClass}>
      <Icon className="size-4 shrink-0" aria-hidden />
      <span className="truncate">{name}</span>
    </NavLink>
  )
}
