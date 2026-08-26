import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Copy, Pencil, Star, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { LEAF_ICON, type ArchiveNode } from '../types'

interface NodePanelProps {
  node: ArchiveNode | null
  path: string[]
  onEdit: (node: ArchiveNode) => void
  onDelete: (node: ArchiveNode) => void
  onClose: () => void
  onTagClick: (tag: string) => void
  onCopied: (node: ArchiveNode) => void
  onToggleFav: (node: ArchiveNode) => void
}

/** Copia com fallback para contextos sem a API Clipboard. */
async function copyText(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) return navigator.clipboard.writeText(text)
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.position = 'fixed'
  ta.style.opacity = '0'
  document.body.appendChild(ta)
  ta.select()
  const ok = document.execCommand('copy')
  document.body.removeChild(ta)
  if (!ok) throw new Error('copy failed')
}

/** Painel de leitura da máscara aberta: conteúdo, copiar, tags, favorito. */
export function NodePanel({ node, path, onEdit, onDelete, onClose, onTagClick, onCopied, onToggleFav }: NodePanelProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const [copyError, setCopyError] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    setCopied(false)
    setCopyError(false)
  }, [node?.id])
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  if (!node) {
    return (
      <div className="flex h-full min-h-[240px] items-center justify-center p-6 text-center text-sm text-ink-faint">
        {t('archive.panel.empty')}
      </div>
    )
  }

  const copy = async () => {
    try {
      await copyText(node.content)
      onCopied(node)
      setCopied(true)
      setCopyError(false)
      if (timer.current) clearTimeout(timer.current)
      timer.current = setTimeout(() => setCopied(false), 1800)
    } catch {
      setCopyError(true)
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4">
        <div className="min-w-0">
          <p className="truncate text-xs text-ink-faint">{path.join(' › ')}</p>
          <h2 className="mt-1 flex items-center gap-2 text-base font-semibold tracking-tight text-ink">
            <span aria-hidden>{LEAF_ICON[node.type as 'report' | 'note'] ?? '📄'}</span>
            <span className="truncate">{node.label}</span>
          </h2>
          {node.tags.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1.5">
              {node.tags.map((tag) => (
                <button
                  key={tag}
                  type="button"
                  onClick={() => onTagClick(tag)}
                  className="rounded-full border border-accent/35 bg-accent-soft px-2 py-0.5 text-xs text-accent-ink hover:border-accent"
                  title={t('archive.panel.tagSearch')}
                >
                  #{tag}
                </button>
              ))}
            </div>
          )}
        </div>
        <Button type="button" size="sm" onClick={() => void copy()} disabled={!node.content}>
          {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
          {copied ? t('archive.panel.copied') : t('archive.panel.copy')}
        </Button>
      </div>

      <p className="tabular px-5 pt-3 text-xs text-ink-faint">
        {t('archive.panel.copies', { count: node.copyCount })}
        {copyError && <span className="ml-2 text-danger">{t('archive.panel.copyError')}</span>}
      </p>

      <pre className="min-h-0 flex-1 overflow-auto px-5 py-3 font-sans text-sm leading-relaxed whitespace-pre-wrap text-ink">
        {node.content || t(node.type === 'note' ? 'archive.panel.noContentNote' : 'archive.panel.noContentReport')}
      </pre>

      <div className="flex flex-wrap gap-2 border-t border-line px-5 py-3">
        <Button
          type="button"
          size="sm"
          variant="secondary"
          onClick={() => onToggleFav(node)}
          className={cn(node.favorite && 'text-amber-600')}
        >
          <Star className="size-4" fill={node.favorite ? 'currentColor' : 'none'} aria-hidden />
          {t(node.favorite ? 'archive.row.unfavorite' : 'archive.row.favorite')}
        </Button>
        <Button type="button" size="sm" variant="secondary" onClick={() => onEdit(node)}>
          <Pencil className="size-4" aria-hidden />
          {t('archive.panel.edit')}
        </Button>
        <Button type="button" size="sm" variant="danger" onClick={() => onDelete(node)}>
          <Trash2 className="size-4" aria-hidden />
          {t('archive.row.delete')}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={onClose} className="ml-auto">
          <X className="size-4" aria-hidden />
          {t('archive.panel.close')}
        </Button>
      </div>
    </div>
  )
}
