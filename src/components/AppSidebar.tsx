import { useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutGrid, Lock, PanelLeftClose, PanelLeftOpen, User as UserIcon, X } from 'lucide-react'
import { Logo, LogoMark } from '@/components/ui/Logo'
import { TOOL_CATEGORIES, toolsByCategory, type Tool } from '@/data/tools'
import { cn } from '@/lib/cn'

interface AppSidebarProps {
  /** Drawer state. Only meaningful below `lg`, where the rail is off-canvas. */
  open: boolean
  onClose: () => void
  /** Icon-only rail. Only meaningful from `lg` up; the drawer is always full width. */
  collapsed: boolean
  onToggleCollapsed: () => void
}

const rowClass = (collapsed: boolean) =>
  ({ isActive }: { isActive: boolean }) =>
    cn(
      'flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm transition-colors',
      collapsed && 'lg:justify-center lg:px-0',
      isActive ? 'bg-elevated text-ink' : 'text-ink-muted hover:bg-elevated hover:text-ink',
    )

/**
 * The signed-in tool rail. Static from `lg` up, an off-canvas drawer below it
 * — one element either way, so there is no second copy of the nav to keep in
 * sync. From `lg` up it can also collapse to icons, so wide tools (tables,
 * maps) get the full width back; the label then lives in the tooltip.
 */
export function AppSidebar({ open, onClose, collapsed, onToggleCollapsed }: AppSidebarProps) {
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

  const labelClass = cn('truncate', collapsed && 'lg:hidden')

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
          'transition-[transform,width] duration-200 ease-out',
          'lg:sticky lg:top-0 lg:bottom-auto lg:z-30 lg:h-dvh lg:shrink-0 lg:translate-x-0',
          collapsed ? 'lg:w-14' : 'lg:w-64',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        <div
          className={cn(
            'flex h-14 shrink-0 items-center justify-between gap-2 border-b border-line px-4',
            collapsed && 'lg:justify-center lg:px-0',
          )}
        >
          <Link to="/dashboard" aria-label={t('common.appName')}>
            <Logo className={cn(collapsed && 'lg:hidden')} />
            {collapsed && <LogoMark className="hidden size-6 text-accent lg:block" />}
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

        <nav className={cn('flex-1 space-y-6 overflow-x-hidden overflow-y-auto px-3 py-4', collapsed && 'lg:space-y-3 lg:px-2')}>
          <ul className="space-y-0.5">
            <li>
              <NavLink to="/dashboard" className={rowClass(collapsed)} title={collapsed ? t('nav.dashboard') : undefined}>
                <LayoutGrid className="size-4 shrink-0" aria-hidden />
                <span className={labelClass}>{t('nav.dashboard')}</span>
              </NavLink>
            </li>
            <li>
              <NavLink to="/profile" className={rowClass(collapsed)} title={collapsed ? t('nav.profile') : undefined}>
                <UserIcon className="size-4 shrink-0" aria-hidden />
                <span className={labelClass}>{t('nav.profile')}</span>
              </NavLink>
            </li>
          </ul>

          {TOOL_CATEGORIES.map((category) => {
            const tools = toolsByCategory(category.id)
            if (tools.length === 0) return null

            return (
              <section key={category.id} className="space-y-1">
                <h2
                  className={cn(
                    'px-2.5 text-[0.6875rem] font-semibold tracking-wider text-ink-faint uppercase',
                    collapsed && 'lg:sr-only',
                  )}
                >
                  {t(`tools.categories.${category.i18nKey}.name`)}
                </h2>
                {collapsed && <div className="hidden border-t border-line lg:block" aria-hidden />}
                <ul className="space-y-0.5">
                  {tools.map((tool) => (
                    <li key={tool.id}>
                      <ToolRow tool={tool} collapsed={collapsed} />
                    </li>
                  ))}
                </ul>
              </section>
            )
          })}
        </nav>

        <div className="hidden shrink-0 border-t border-line p-2 lg:block">
          <button
            type="button"
            onClick={onToggleCollapsed}
            aria-label={t(collapsed ? 'nav.expandMenu' : 'nav.collapseMenu')}
            title={t(collapsed ? 'nav.expandMenu' : 'nav.collapseMenu')}
            aria-expanded={!collapsed}
            className={cn(
              'flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-ink-muted transition-colors hover:bg-elevated hover:text-ink',
              collapsed && 'justify-center px-0',
            )}
          >
            {collapsed ? <PanelLeftOpen className="size-4 shrink-0" aria-hidden /> : <PanelLeftClose className="size-4 shrink-0" aria-hidden />}
            {!collapsed && <span className="truncate">{t('nav.collapseMenu')}</span>}
          </button>
        </div>
      </aside>
    </>
  )
}

/**
 * Queued tools stay listed and read as locked instead of disappearing, so the
 * rail shows the whole product surface rather than an empty shell.
 */
function ToolRow({ tool, collapsed }: { tool: Tool; collapsed: boolean }) {
  const { t } = useTranslation()
  const Icon = tool.icon
  const name = t(`tools.${tool.i18nKey}.name`)
  const { path } = tool

  if (tool.status !== 'available' || !path) {
    return (
      <span
        aria-disabled="true"
        title={collapsed ? `${name} — ${t('common.comingSoon')}` : t('common.comingSoon')}
        className={cn(
          'flex cursor-not-allowed items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-ink-faint select-none',
          collapsed && 'lg:justify-center lg:px-0',
        )}
      >
        <Icon className="size-4 shrink-0" aria-hidden />
        <span className={cn('truncate', collapsed && 'lg:hidden')}>{name}</span>
        <Lock className={cn('ml-auto size-3 shrink-0', collapsed && 'lg:hidden')} aria-hidden />
      </span>
    )
  }

  return (
    <NavLink to={path} className={rowClass(collapsed)} title={collapsed ? name : undefined}>
      <Icon className="size-4 shrink-0" aria-hidden />
      <span className={cn('truncate', collapsed && 'lg:hidden')}>{name}</span>
    </NavLink>
  )
}
