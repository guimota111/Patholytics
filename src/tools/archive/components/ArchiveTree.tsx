import type { DragEvent, ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronRight, ClipboardCopy, Pencil, Star, Trash2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import {
  DEFAULT_FOLDER_ICON,
  LEAF_ICON,
  ROOT_NOTES,
  ROOT_REPORTS,
  canMoveInto,
  type ArchiveIndex,
  type ArchiveNode,
} from '../types'

export interface TreeHandlers {
  expanded: Set<string>
  onToggle: (id: string) => void
  selectedId: string
  onSelect: (id: string) => void
  viewId: string | null
  onView: (id: string) => void
  onRename: (node: ArchiveNode) => void
  onDelete: (node: ArchiveNode) => void
  onToggleFav: (node: ArchiveNode) => void
  /** Modo mover: arrastar itens para outra categoria. */
  editMode: boolean
  dragId: string | null
  dropId: string | null
  onDragStart: (id: string) => void
  onDragEnd: () => void
  onDragOver: (targetId: string | null) => void
  onDrop: (targetId: string) => void
}

interface ArchiveTreeProps {
  index: ArchiveIndex
  favorites: ArchiveNode[]
  handlers: TreeHandlers
}


const rowBase =
  'group flex min-h-9 items-center gap-1 rounded-md pr-1 text-sm transition-colors hover:bg-surface'

export function ArchiveTree({ index, favorites, handlers: h }: ArchiveTreeProps) {
  const { t } = useTranslation()

  const dragProps = (node: ArchiveNode) =>
    h.editMode
      ? {
          draggable: true,
          onDragStart: (e: DragEvent) => {
            e.stopPropagation()
            e.dataTransfer.effectAllowed = 'move'
            e.dataTransfer.setData('text/plain', node.id)
            h.onDragStart(node.id)
          },
          onDragEnd: () => h.onDragEnd(),
        }
      : {}

  const dropProps = (targetId: string) =>
    h.editMode
      ? {
          onDragOver: (e: DragEvent) => {
            if (h.dragId && canMoveInto(h.dragId, targetId, index)) {
              e.preventDefault()
              e.dataTransfer.dropEffect = 'move'
              if (h.dropId !== targetId) h.onDragOver(targetId)
            }
          },
          onDragLeave: () => {
            if (h.dropId === targetId) h.onDragOver(null)
          },
          onDrop: (e: DragEvent) => {
            e.preventDefault()
            e.stopPropagation()
            h.onDrop(targetId)
          },
        }
      : {}

  const actions = (node: ArchiveNode) => (
    <span className="ml-auto flex items-center opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
      {node.type !== 'category' && (
        <button
          type="button"
          onClick={() => h.onToggleFav(node)}
          className={cn('rounded p-1 hover:bg-raised', node.favorite ? 'text-amber-500' : 'text-ink-faint hover:text-ink')}
          aria-label={t(node.favorite ? 'archive.row.unfavorite' : 'archive.row.favorite')}
        >
          <Star className="size-3.5" fill={node.favorite ? 'currentColor' : 'none'} aria-hidden />
        </button>
      )}
      <button
        type="button"
        onClick={() => h.onRename(node)}
        className="rounded p-1 text-ink-faint hover:bg-raised hover:text-ink"
        aria-label={t('archive.row.rename')}
      >
        <Pencil className="size-3.5" aria-hidden />
      </button>
      <button
        type="button"
        onClick={() => h.onDelete(node)}
        className="rounded p-1 text-ink-faint hover:bg-danger-soft hover:text-danger"
        aria-label={t('archive.row.delete')}
      >
        <Trash2 className="size-3.5" aria-hidden />
      </button>
    </span>
  )

  const leafRow = (node: ArchiveNode, depth: number, key?: string) => (
    <div
      key={key ?? node.id}
      className={cn(rowBase, h.viewId === node.id && 'bg-accent-soft/70', h.dragId === node.id && 'opacity-40')}
      style={{ paddingLeft: 8 + depth * 18 }}
      {...dragProps(node)}
    >
      <span className="w-5 shrink-0 text-center text-ink-faint">·</span>
      <button type="button" onClick={() => h.onView(node.id)} className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left">
        <span aria-hidden>{LEAF_ICON[node.type as 'report' | 'note']}</span>
        <span className="truncate text-ink">{node.label}</span>
        {node.favorite && <Star className="size-3 shrink-0 text-amber-500" fill="currentColor" aria-hidden />}
        {node.copyCount > 0 && (
          <span className="tabular inline-flex shrink-0 items-center gap-1 text-xs text-ink-faint">
            <ClipboardCopy className="size-3" aria-hidden />
            {node.copyCount}
          </span>
        )}
      </button>
      {actions(node)}
    </div>
  )

  const renderRows = (parentId: string, depth: number): ReactNode =>
    (index.childrenOf.get(parentId) ?? []).map((node) => {
      if (node.type !== 'category') return leafRow(node, depth)
      const isOpen = h.expanded.has(node.id)
      const count = index.childrenOf.get(node.id)?.length ?? 0
      return (
        <div key={node.id}>
          <div
            className={cn(
              rowBase,
              h.selectedId === node.id && 'bg-accent-soft/70',
              h.dragId === node.id && 'opacity-40',
              h.dropId === node.id && 'ring-2 ring-accent ring-inset',
            )}
            style={{ paddingLeft: 8 + depth * 18 }}
            {...dragProps(node)}
            {...dropProps(node.id)}
          >
            <button
              type="button"
              onClick={() => h.onToggle(node.id)}
              className="w-5 shrink-0 rounded text-ink-faint hover:text-ink"
              aria-label={t(isOpen ? 'archive.row.collapse' : 'archive.row.expand')}
            >
              {count > 0 ? (
                isOpen ? <ChevronDown className="mx-auto size-4" aria-hidden /> : <ChevronRight className="mx-auto size-4" aria-hidden />
              ) : (
                '·'
              )}
            </button>
            <button
              type="button"
              onClick={() => h.onSelect(node.id)}
              onDoubleClick={() => h.onToggle(node.id)}
              className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left"
              title={t('archive.row.selectHint')}
            >
              <span aria-hidden>{node.icon || DEFAULT_FOLDER_ICON}</span>
              <span className="truncate font-medium text-ink">{node.label}</span>
              {count > 0 && <span className="tabular shrink-0 text-xs text-ink-faint">{count}</span>}
            </button>
            {actions(node)}
          </div>
          {isOpen && renderRows(node.id, depth + 1)}
        </div>
      )
    })

  const roots = [
    { id: ROOT_REPORTS, label: t('archive.roots.reports'), icon: '📁' },
    { id: ROOT_NOTES, label: t('archive.roots.notes'), icon: '📝' },
  ]

  const favOpen = h.expanded.has('favorites')

  return (
    <div className="space-y-3">
      <div>
        <div className={cn(rowBase, 'pl-2')}>
          <button
            type="button"
            onClick={() => h.onToggle('favorites')}
            className="w-5 shrink-0 text-ink-faint hover:text-ink"
            aria-label={t(favOpen ? 'archive.row.collapse' : 'archive.row.expand')}
          >
            {favOpen ? <ChevronDown className="mx-auto size-4" aria-hidden /> : <ChevronRight className="mx-auto size-4" aria-hidden />}
          </button>
          <span className="flex items-center gap-2 py-1.5 font-medium text-ink">
            <Star className="size-4 text-amber-500" fill="currentColor" aria-hidden />
            {t('archive.roots.favorites')}
            {favorites.length > 0 && <span className="tabular text-xs text-ink-faint">{favorites.length}</span>}
          </span>
        </div>
        {favOpen &&
          (favorites.length === 0 ? (
            <p className="py-1 pl-9 text-xs text-ink-faint">{t('archive.roots.favoritesEmpty')}</p>
          ) : (
            favorites.map((n) => leafRow(n, 1, `fav-${n.id}`))
          ))}
      </div>

      {roots.map((root) => {
        const isOpen = h.expanded.has(root.id)
        const count = index.childrenOf.get(root.id)?.length ?? 0
        return (
          <div key={root.id}>
            <div
              className={cn(
                rowBase,
                'pl-2',
                h.selectedId === root.id && 'bg-accent-soft/70',
                h.dropId === root.id && 'ring-2 ring-accent ring-inset',
              )}
              {...dropProps(root.id)}
            >
              <button
                type="button"
                onClick={() => h.onToggle(root.id)}
                className="w-5 shrink-0 text-ink-faint hover:text-ink"
                aria-label={t(isOpen ? 'archive.row.collapse' : 'archive.row.expand')}
              >
                {isOpen ? <ChevronDown className="mx-auto size-4" aria-hidden /> : <ChevronRight className="mx-auto size-4" aria-hidden />}
              </button>
              <button
                type="button"
                onClick={() => h.onSelect(root.id)}
                onDoubleClick={() => h.onToggle(root.id)}
                className="flex min-w-0 flex-1 items-center gap-2 py-1.5 text-left font-semibold tracking-wide text-ink uppercase"
              >
                <span aria-hidden>{root.icon}</span>
                {root.label}
                {count > 0 && <span className="tabular text-xs font-normal text-ink-faint normal-case">{count}</span>}
              </button>
            </div>
            {isOpen && renderRows(root.id, 1)}
          </div>
        )
      })}
    </div>
  )
}
