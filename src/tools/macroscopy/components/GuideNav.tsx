import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { iconOf } from '../catalog'
import { filledSteps, type GuideTreeIndex } from '../types'

interface GuideNavProps {
  tree: GuideTreeIndex
  expanded: Set<string>
  onToggle: (systemId: string) => void
  selectedId: string | null
  onSelect: (protocolId: string) => void
  editMode: boolean
  onAddSystem: () => void
  onAddProtocol: (systemId: string) => void
}

/** Sistemas e, dentro deles, as peças. É o índice do manual. */
export function GuideNav({
  tree,
  expanded,
  onToggle,
  selectedId,
  onSelect,
  editMode,
  onAddSystem,
  onAddProtocol,
}: GuideNavProps) {
  const { t } = useTranslation()

  return (
    <nav className="space-y-1" aria-label={t('macroscopy.navLabel')}>
      {tree.systems.map((system) => {
        const Icon = iconOf(system.icon)
        const open = expanded.has(system.id)
        const protocols = tree.protocolsBySystem.get(system.id) ?? []
        return (
          <div key={system.id}>
            <button
              type="button"
              onClick={() => onToggle(system.id)}
              aria-expanded={open}
              className="flex w-full items-center gap-2 rounded-md px-2.5 py-2 text-left text-sm transition-colors hover:bg-raised"
            >
              {open ? (
                <ChevronDown className="size-4 shrink-0 text-ink-faint" aria-hidden />
              ) : (
                <ChevronRight className="size-4 shrink-0 text-ink-faint" aria-hidden />
              )}
              <span
                className="flex size-6 shrink-0 items-center justify-center rounded"
                style={{ backgroundColor: `${system.color}1f`, color: system.color || undefined }}
              >
                <Icon className="size-3.5" aria-hidden />
              </span>
              <span className="min-w-0 flex-1 truncate font-medium text-ink">{system.name}</span>
              <span className="tabular text-xs text-ink-faint">{protocols.length}</span>
            </button>

            {open && (
              <ul className="mt-0.5 mb-1 ml-4 space-y-0.5 border-l border-line pl-2">
                {protocols.map((protocol) => {
                  const done = filledSteps(protocol)
                  return (
                    <li key={protocol.id}>
                      <button
                        type="button"
                        onClick={() => onSelect(protocol.id)}
                        aria-current={selectedId === protocol.id ? 'true' : undefined}
                        className={cn(
                          'flex w-full items-center gap-2 rounded-md px-2.5 py-1.5 text-left text-sm transition-colors',
                          selectedId === protocol.id
                            ? 'bg-accent-soft font-medium text-accent-ink'
                            : 'text-ink-muted hover:bg-raised hover:text-ink',
                        )}
                      >
                        <span className="min-w-0 flex-1 truncate">{protocol.name}</span>
                        {done > 0 && <span className="tabular text-[0.6875rem] text-ink-faint">{done}</span>}
                      </button>
                    </li>
                  )
                })}

                {editMode && (
                  <li>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="w-full justify-start"
                      onClick={() => onAddProtocol(system.id)}
                    >
                      <Plus className="size-4" aria-hidden />
                      {t('macroscopy.addProtocol')}
                    </Button>
                  </li>
                )}
              </ul>
            )}
          </div>
        )
      })}

      {editMode && (
        <Button type="button" size="sm" variant="secondary" className="mt-2 w-full" onClick={onAddSystem}>
          <Plus className="size-4" aria-hidden />
          {t('macroscopy.addSystem')}
        </Button>
      )}
    </nav>
  )
}
