import { useEffect } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { LayoutGrid, PanelLeftClose, User as UserIcon, X } from 'lucide-react'
import { Logo } from '@/components/ui/Logo'
import { TOOL_CATEGORIES, isShipped, toolsByCategory, type Tool } from '@/data/tools'
import { cn } from '@/lib/cn'

interface AppSidebarProps {
  /** Drawer state. Only meaningful below `lg`, where the rail is off-canvas. */
  open: boolean
  onClose: () => void
  /** Rail hidden entirely. Only meaningful from `lg` up; the drawer is always full width. */
  collapsed: boolean
  onToggleCollapsed: () => void
}

const rowClass = ({ isActive }: { isActive: boolean }) =>
  cn(
    'flex items-center gap-2.5 rounded-md px-2.5 py-2.5 text-sm transition-colors lg:py-1.5',
    isActive ? 'bg-elevated text-ink' : 'text-ink-muted hover:bg-elevated hover:text-ink',
  )

/**
 * The signed-in tool rail. Static from `lg` up, an off-canvas drawer below it
 * — one element either way, so there is no second copy of the nav to keep in
 * sync. From `lg` up it can also be hidden completely, so wide tools (tables,
 * maps) get the whole viewport; the top bar keeps the button that brings it
 * back. Only shipped tools are listed: the queue lives on the dashboard.
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
        // Hidden rail: nothing inside may take focus or be read out.
        inert={collapsed && !open ? true : undefined}
        className={cn(
          'fixed inset-y-0 left-0 z-50 w-[17.5rem] border-r border-line bg-surface',
          'transition-[transform,width] duration-200 ease-out',
          'lg:sticky lg:top-0 lg:bottom-auto lg:z-30 lg:h-dvh lg:shrink-0 lg:translate-x-0 lg:overflow-hidden',
          collapsed ? 'lg:w-0 lg:border-r-0' : 'lg:w-64',
          open ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Fixed-width inner column, so the content does not reflow while the rail animates shut. */}
        <div className="flex h-full w-[17.5rem] flex-col lg:w-64">
          <div className="flex h-14 shrink-0 items-center justify-between gap-2 border-b border-line px-4">
            <Link to="/dashboard" aria-label={t('common.appName')}>
              <Logo />
            </Link>
            <button
              type="button"
              onClick={onClose}
              aria-label={t('nav.closeMenu')}
              className="-mr-2 flex size-11 items-center justify-center rounded-md text-ink-muted transition-colors hover:bg-elevated hover:text-ink lg:hidden"
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>

          <nav className="flex-1 space-y-6 overflow-x-hidden overflow-y-auto px-3 py-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
            <ul className="space-y-0.5">
              <li>
                <NavLink to="/dashboard" className={rowClass}>
                  <LayoutGrid className="size-4 shrink-0" aria-hidden />
                  <span className="truncate">{t('nav.dashboard')}</span>
                </NavLink>
              </li>
              <li>
                <NavLink to="/profile" className={rowClass}>
                  <UserIcon className="size-4 shrink-0" aria-hidden />
                  <span className="truncate">{t('nav.profile')}</span>
                </NavLink>
              </li>
            </ul>

            {TOOL_CATEGORIES.map((category) => {
              const tools = toolsByCategory(category.id).filter(isShipped)
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

          <div className="hidden shrink-0 border-t border-line p-2 lg:block">
            <button
              type="button"
              onClick={onToggleCollapsed}
              aria-label={t('nav.collapseMenu')}
              title={t('nav.collapseMenu')}
              className="flex w-full items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm text-ink-muted transition-colors hover:bg-elevated hover:text-ink"
            >
              <PanelLeftClose className="size-4 shrink-0" aria-hidden />
              <span className="truncate">{t('nav.collapseMenu')}</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  )
}


function ToolRow({ tool }: { tool: Tool & { path: string } }) {
  const { t } = useTranslation()
  const Icon = tool.icon

  return (
    <NavLink to={tool.path} className={rowClass}>
      <Icon className="size-4 shrink-0" aria-hidden />
      <span className="truncate">{t(`tools.${tool.i18nKey}.name`)}</span>
    </NavLink>
  )
}
