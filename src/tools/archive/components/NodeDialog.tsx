import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/cn'
import { DEFAULT_FOLDER_ICON, FOLDER_ICONS, type ArchiveNode, type LeafType, type NodeType } from '../types'
import { TagInput } from './TagInput'

export type DialogState =
  | { kind: 'add-category' }
  | { kind: 'add-leaf'; leafType: LeafType }
  | { kind: 'rename'; node: ArchiveNode }
  | { kind: 'edit'; node: ArchiveNode }
  | { kind: 'delete'; node: ArchiveNode }

interface NodeDialogProps {
  dialog: DialogState
  targetLabel: string
  allTags: string[]
  onAdd: (input: { type: NodeType; label: string; content?: string; icon?: string; tags?: string[] }) => Promise<unknown>
  onUpdate: (id: string, changes: Partial<Pick<ArchiveNode, 'label' | 'content' | 'icon' | 'tags'>>) => Promise<unknown>
  onDelete: (id: string) => Promise<unknown>
  onClose: () => void
}

const fieldClass =
  'h-10 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-faint hover:border-line-strong'

export function NodeDialog({ dialog, targetLabel, allTags, onAdd, onUpdate, onDelete, onClose }: NodeDialogProps) {
  const { t } = useTranslation()
  const node = 'node' in dialog ? dialog.node : null
  const [label, setLabel] = useState(node?.label ?? '')
  const [content, setContent] = useState(node?.content ?? '')
  const [icon, setIcon] = useState(node?.icon || DEFAULT_FOLDER_ICON)
  const [tags, setTags] = useState<string[]>(node?.tags ?? [])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)

  const run = async (fn: () => Promise<unknown>) => {
    setBusy(true)
    setError(false)
    try {
      await fn()
      onClose()
    } catch (e) {
      console.error(e)
      setError(true)
      setBusy(false)
    }
  }

  const errorLine = error && <p className="mt-3 text-xs text-danger">{t('archive.dialog.error')}</p>

  if (dialog.kind === 'delete') {
    const n = dialog.node
    return (
      <Modal
        title={t('archive.dialog.deleteTitle')}
        onClose={onClose}
        footer={
          <>
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="button" variant="danger" size="sm" loading={busy} onClick={() => void run(() => onDelete(n.id))}>
              {t('archive.row.delete')}
            </Button>
          </>
        }
      >
        <p className="text-sm text-ink">
          {t('archive.dialog.deleteConfirm', { label: n.label })}
          {n.type === 'category' && <span className="block pt-1 text-ink-muted">{t('archive.dialog.deleteCascade')}</span>}
        </p>
        {errorLine}
      </Modal>
    )
  }

  if (dialog.kind === 'add-category' || dialog.kind === 'rename') {
    const isRename = dialog.kind === 'rename'
    const isCategory = isRename ? dialog.node.type === 'category' : true
    const submit = () => {
      const name = label.trim()
      if (!name) return
      void run(() =>
        isRename
          ? onUpdate(dialog.node.id, isCategory ? { label: name, icon } : { label: name })
          : onAdd({ type: 'category', label: name, icon }),
      )
    }
    return (
      <Modal
        title={t(isRename ? 'archive.dialog.rename' : 'archive.dialog.newCategory')}
        onClose={onClose}
        footer={
          <>
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              {t('common.cancel')}
            </Button>
            <Button type="button" size="sm" loading={busy} disabled={!label.trim()} onClick={submit}>
              {t(isRename ? 'common.save' : 'archive.dialog.create')}
            </Button>
          </>
        }
      >
        {!isRename && <p className="mb-3 text-xs text-ink-muted">{t('archive.dialog.createdIn', { target: targetLabel })}</p>}
        <input
          autoFocus
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') submit()
          }}
          placeholder={t('archive.dialog.name')}
          className={fieldClass}
        />
        {isCategory && (
          <>
            <p className="mt-4 mb-2 text-xs font-medium text-ink-muted">{t('archive.dialog.icon')}</p>
            <div className="flex flex-wrap gap-1">
              {FOLDER_ICONS.map((emoji) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setIcon(emoji)}
                  className={cn(
                    'flex size-8 items-center justify-center rounded-md border text-base transition-colors',
                    icon === emoji ? 'border-accent bg-accent-soft' : 'border-line bg-surface hover:border-line-strong',
                  )}
                  aria-label={emoji}
                  aria-pressed={icon === emoji}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </>
        )}
        {errorLine}
      </Modal>
    )
  }

  // add-leaf / edit
  const isNew = dialog.kind === 'add-leaf'
  const leafType: LeafType = isNew ? dialog.leafType : (dialog.node.type as LeafType)
  const title = isNew
    ? t(leafType === 'note' ? 'archive.dialog.newNote' : 'archive.dialog.newReport')
    : t(leafType === 'note' ? 'archive.dialog.editNote' : 'archive.dialog.editReport')
  const submit = () => {
    const name = label.trim()
    if (!name) return
    void run(() =>
      isNew
        ? onAdd({ type: leafType, label: name, content, tags })
        : onUpdate(dialog.node.id, { label: name, content, tags }),
    )
  }
  return (
    <Modal
      title={title}
      onClose={onClose}
      wide
      footer={
        <>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="button" size="sm" loading={busy} disabled={!label.trim()} onClick={submit}>
            {t('common.save')}
          </Button>
        </>
      }
    >
      {isNew && <p className="mb-3 text-xs text-ink-muted">{t('archive.dialog.createdIn', { target: targetLabel })}</p>}
      <div className="space-y-4">
        <input
          autoFocus={isNew}
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          placeholder={t('archive.dialog.titlePlaceholder')}
          className={fieldClass}
        />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={t('archive.dialog.contentPlaceholder')}
          rows={14}
          className="w-full resize-y rounded-md border border-line bg-surface px-3 py-2 text-sm leading-relaxed text-ink placeholder:text-ink-faint hover:border-line-strong"
        />
        <div>
          <p className="mb-2 text-xs font-medium text-ink-muted">{t('archive.dialog.tags')}</p>
          <TagInput tags={tags} onChange={setTags} suggestions={allTags} />
        </div>
      </div>
      {errorLine}
    </Modal>
  )
}
