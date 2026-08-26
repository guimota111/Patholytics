import { useTranslation } from 'react-i18next'
import { Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/cn'
import { DEFAULT_FOLDER_ICON, LEAF_ICON, snippet, type ArchiveNode } from '../types'
import type { SearchHit } from '../useArchive'

interface SearchResultsProps {
  q: string
  hits: SearchHit[]
  pathOf: (node: ArchiveNode) => string[]
  viewId: string | null
  onOpenCategory: (node: ArchiveNode) => void
  onOpenLeaf: (node: ArchiveNode) => void
  onRename: (node: ArchiveNode) => void
  onDelete: (node: ArchiveNode) => void
}

/** Lista plana dos resultados, cada um com o caminho na árvore. */
export function SearchResults({ q, hits, pathOf, viewId, onOpenCategory, onOpenLeaf, onRename, onDelete }: SearchResultsProps) {
  const { t } = useTranslation()

  if (hits.length === 0) return <p className="px-2 py-4 text-sm text-ink-faint">{t('archive.results.none')}</p>

  return (
    <div className="space-y-0.5">
      <p className="tabular px-2 pb-1 text-xs text-ink-faint">{t('archive.results.count', { count: hits.length })}</p>
      {hits.map(({ node, matchContent }) => {
        const isCat = node.type === 'category'
        return (
          <div
            key={node.id}
            className={cn(
              'group flex items-start gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-surface',
              viewId === node.id && 'bg-accent-soft/70',
            )}
          >
            <button
              type="button"
              onClick={() => (isCat ? onOpenCategory(node) : onOpenLeaf(node))}
              className="flex min-w-0 flex-1 items-start gap-2 text-left"
            >
              <span aria-hidden className="mt-0.5">
                {isCat ? node.icon || DEFAULT_FOLDER_ICON : LEAF_ICON[node.type as 'report' | 'note']}
              </span>
              <span className="min-w-0 flex-1">
                <span className={cn('block truncate text-ink', isCat && 'font-medium')}>{node.label}</span>
                <span className="block truncate text-xs text-ink-faint">{pathOf(node).join(' › ')}</span>
                {node.tags.length > 0 && (
                  <span className="mt-0.5 block text-xs text-accent-ink">{node.tags.map((x) => `#${x}`).join(' ')}</span>
                )}
                {matchContent && <span className="mt-0.5 block text-xs text-ink-muted italic">{snippet(node.content, q)}</span>}
              </span>
            </button>
            <span className="flex shrink-0 items-center opacity-0 transition-opacity group-hover:opacity-100 focus-within:opacity-100">
              <button type="button" onClick={() => onRename(node)} className="rounded p-1 text-ink-faint hover:bg-raised hover:text-ink" aria-label={t('archive.row.rename')}>
                <Pencil className="size-3.5" aria-hidden />
              </button>
              <button type="button" onClick={() => onDelete(node)} className="rounded p-1 text-ink-faint hover:bg-danger-soft hover:text-danger" aria-label={t('archive.row.delete')}>
                <Trash2 className="size-3.5" aria-hidden />
              </button>
            </span>
          </div>
        )
      })}
    </div>
  )
}
