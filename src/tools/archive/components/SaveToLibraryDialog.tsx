/* ==========================================================================
   SaveToLibraryDialog.tsx — escolher em que pasta da biblioteca a cópia entra.

   Um seletor plano, não uma segunda árvore: a lista já vem com o caminho
   inteiro em cada linha, que é o que a pessoa precisa ler para decidir.
   ========================================================================== */

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/cn'
import {
  DEFAULT_FOLDER_ICON,
  ROOT_NOTES,
  ROOT_REPORTS,
  ancestorsOf,
  isRoot,
  type ArchiveIndex,
  type ArchiveNode,
} from '../types'

interface SaveToLibraryDialogProps {
  node: ArchiveNode
  credit: string
  index: ArchiveIndex
  /** Cópia deste mesmo laudo que já está na biblioteca, se houver. */
  existing: ArchiveNode | null
  onSave: (parentId: string) => Promise<unknown>
  onClose: () => void
}

export function SaveToLibraryDialog({ node, credit, index, existing, onSave, onClose }: SaveToLibraryDialogProps) {
  const { t } = useTranslation()
  const [parentId, setParentId] = useState<string>(ROOT_REPORTS)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState(false)

  const rootLabel = (id: string) => t(id === ROOT_NOTES ? 'archive.roots.notes' : 'archive.roots.reports')

  /** Cada pasta da biblioteca, com o caminho completo, em ordem de leitura. */
  const folders = useMemo(() => {
    const out: { id: string; label: string }[] = [
      { id: ROOT_REPORTS, label: rootLabel(ROOT_REPORTS) },
      { id: ROOT_NOTES, label: rootLabel(ROOT_NOTES) },
    ]
    const walk = (parent: string, trail: string[]) => {
      for (const child of index.childrenOf.get(parent) ?? []) {
        if (child.type !== 'category') continue
        const path = [...trail, child.label]
        out.push({ id: child.id, label: path.join(' › ') })
        walk(child.id, path)
      }
    }
    walk(ROOT_REPORTS, [rootLabel(ROOT_REPORTS)])
    walk(ROOT_NOTES, [rootLabel(ROOT_NOTES)])
    return out
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, t])

  const existingPath = existing
    ? ancestorsOf(existing.id, index)
        .map((id) => (isRoot(id) ? rootLabel(id) : (index.byId.get(id)?.label ?? '?')))
        .reverse()
        .join(' › ')
    : ''

  const submit = async () => {
    setBusy(true)
    setError(false)
    try {
      await onSave(parentId)
      onClose()
    } catch (e) {
      console.error(e)
      setError(true)
      setBusy(false)
    }
  }

  return (
    <Modal
      title={t('archive.shared.saveTitle')}
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="button" size="sm" loading={busy} onClick={() => void submit()}>
            {t('archive.shared.save')}
          </Button>
        </>
      }
    >
      <p className="text-sm text-ink">
        {t('archive.shared.saveIntro', { label: node.label, name: credit })}
      </p>
      {existing && (
        <p className="mt-3 rounded-md border border-accent/35 bg-accent-soft px-3 py-2 text-xs text-accent-ink">
          {t('archive.shared.alreadySaved', { path: existingPath })}
        </p>
      )}

      <p className="mt-4 mb-2 text-xs font-medium text-ink-muted">{t('archive.shared.chooseFolder')}</p>
      <div className="max-h-56 overflow-auto rounded-md border border-line">
        {folders.map((folder) => (
          <button
            key={folder.id}
            type="button"
            onClick={() => setParentId(folder.id)}
            className={cn(
              'flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-surface',
              parentId === folder.id ? 'bg-accent-soft text-accent-ink' : 'text-ink',
            )}
            aria-pressed={parentId === folder.id}
          >
            <span aria-hidden>{DEFAULT_FOLDER_ICON}</span>
            <span className="truncate">{folder.label}</span>
          </button>
        ))}
      </div>
      {error && <p className="mt-3 text-xs text-danger">{t('archive.dialog.error')}</p>}
    </Modal>
  )
}
