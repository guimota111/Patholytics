import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Download, FolderPlus, FilePlus, Info, Move, Search, StickyNote, Upload, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/cn'
import { ArchiveTree, type TreeHandlers } from '@/tools/archive/components/ArchiveTree'
import { NodeDialog, type DialogState } from '@/tools/archive/components/NodeDialog'
import { NodePanel } from '@/tools/archive/components/NodePanel'
import { SearchResults } from '@/tools/archive/components/SearchResults'
import { ROOT_NOTES, ROOT_REPORTS, ancestorsOf, isRoot, rootOf, type ArchiveExport, type ArchiveNode } from '@/tools/archive/types'
import { useArchive } from '@/tools/archive/useArchive'

const SEED_KEYS = ['headNeck', 'neuro', 'gi', 'hemato', 'dermato'] as const

export default function ReportArchivePage() {
  const { t } = useTranslation()
  const seedLabels = useMemo(() => SEED_KEYS.map((k) => t(`archive.seed.${k}`)), [t])
  const archive = useArchive(seedLabels)
  const { index, favorites } = archive

  const [expanded, setExpanded] = useState<Set<string>>(() => new Set([ROOT_REPORTS, ROOT_NOTES, 'favorites']))
  const [selectedId, setSelectedId] = useState<string>(ROOT_REPORTS)
  const [viewId, setViewId] = useState<string | null>(null)
  const [query, setQuery] = useState('')
  const [dialog, setDialog] = useState<DialogState | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [dragId, setDragId] = useState<string | null>(null)
  const [dropId, setDropId] = useState<string | null>(null)
  const [notice, setNotice] = useState<{ tone: 'ok' | 'error'; text: string } | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  // Seleção/visualização apontando para nós que deixaram de existir voltam ao topo.
  useEffect(() => {
    if (!isRoot(selectedId) && !index.byId.has(selectedId)) setSelectedId(ROOT_REPORTS)
  }, [index, selectedId])
  useEffect(() => {
    if (viewId && !index.byId.has(viewId)) setViewId(null)
  }, [index, viewId])

  const rootLabel = (id: string) => t(id === ROOT_NOTES ? 'archive.roots.notes' : 'archive.roots.reports')
  const selectedNode = isRoot(selectedId) ? null : index.byId.get(selectedId)
  const targetLabel = selectedNode ? selectedNode.label : rootLabel(selectedId)
  const currentRoot = isRoot(selectedId) ? selectedId : rootOf(selectedId, index)
  const viewNode = viewId ? (index.byId.get(viewId) ?? null) : null

  const pathOf = useCallback(
    (node: ArchiveNode): string[] => {
      const ids = ancestorsOf(node.id, index)
      const labels = ids.map((id) => (isRoot(id) ? rootLabel(id) : (index.byId.get(id)?.label ?? '?')))
      return labels.reverse()
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [index, t],
  )

  const results = useMemo(() => archive.search(query), [archive, query])

  const toggle = (id: string) =>
    setExpanded((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  const expand = (id: string) => setExpanded((s) => new Set(s).add(id))

  const revealCategory = (node: ArchiveNode) => {
    setExpanded((s) => {
      const next = new Set(s)
      ancestorsOf(node.id, index).forEach((id) => next.add(id))
      next.add(node.id)
      return next
    })
    setSelectedId(node.id)
    setQuery('')
  }

  const flash = (tone: 'ok' | 'error', text: string) => {
    setNotice({ tone, text })
    setTimeout(() => setNotice(null), 4000)
  }

  const toggleFav = (node: ArchiveNode) => {
    archive.update(node.id, { favorite: !node.favorite }).catch(() => flash('error', t('archive.dialog.error')))
  }

  const exportJson = () => {
    const data = archive.exportAll()
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `patholytics-laudos-${data.exportedAt.slice(0, 10)}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const importJson = async (file: File) => {
    try {
      const parsed = JSON.parse(await file.text()) as Partial<ArchiveExport>
      if (parsed.format !== 'patholytics.archive' || !Array.isArray(parsed.nodes)) throw new Error('bad format')
      const { created, merged } = await archive.importAll(parsed as ArchiveExport)
      flash('ok', t('archive.toolbar.importResult', { n: created, merged }))
    } catch (e) {
      console.error(e)
      flash('error', t('archive.toolbar.importError'))
    }
  }

  const handlers: TreeHandlers = {
    expanded,
    onToggle: toggle,
    selectedId,
    onSelect: setSelectedId,
    viewId,
    onView: setViewId,
    onRename: (node) => setDialog({ kind: 'rename', node }),
    onDelete: (node) => setDialog({ kind: 'delete', node }),
    onToggleFav: toggleFav,
    editMode,
    dragId,
    dropId,
    onDragStart: setDragId,
    onDragEnd: () => {
      setDragId(null)
      setDropId(null)
    },
    onDragOver: setDropId,
    onDrop: (targetId) => {
      if (dragId) {
        archive.move(dragId, targetId).catch(() => flash('error', t('archive.dialog.error')))
        expand(targetId)
      }
      setDragId(null)
      setDropId(null)
    },
  }

  const isNotes = currentRoot === ROOT_NOTES

  return (
    <div className="shell py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('tools.reportArchive.name')}</h1>
        <p className="mt-1.5 max-w-3xl text-sm text-ink-muted">{t('archive.subtitle')}</p>
      </header>

      <div className="mt-6 flex flex-wrap items-center gap-2">
        <label className="relative min-w-[16rem] flex-1">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('archive.toolbar.search')}
            className="h-10 w-full rounded-md border border-line bg-surface pr-9 pl-9 text-sm text-ink placeholder:text-ink-faint hover:border-line-strong"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-ink-faint hover:text-ink"
              aria-label={t('archive.toolbar.clearSearch')}
            >
              <X className="size-4" aria-hidden />
            </button>
          )}
        </label>
        <Button type="button" size="sm" variant="secondary" onClick={() => setDialog({ kind: 'add-category' })}>
          <FolderPlus className="size-4" aria-hidden />
          {t(selectedNode ? 'archive.toolbar.addSubcategory' : 'archive.toolbar.addCategory')}
        </Button>
        <Button type="button" size="sm" onClick={() => setDialog({ kind: 'add-leaf', leafType: isNotes ? 'note' : 'report' })}>
          {isNotes ? <StickyNote className="size-4" aria-hidden /> : <FilePlus className="size-4" aria-hidden />}
          {t(isNotes ? 'archive.toolbar.addNote' : 'archive.toolbar.addReport')}
        </Button>
        <Button
          type="button"
          size="sm"
          variant={editMode ? 'primary' : 'ghost'}
          onClick={() => {
            setEditMode((m) => !m)
            setDragId(null)
            setDropId(null)
          }}
        >
          <Move className="size-4" aria-hidden />
          {t(editMode ? 'archive.toolbar.moveDone' : 'archive.toolbar.move')}
        </Button>
        <span className="ml-auto flex items-center gap-1">
          <Button type="button" size="sm" variant="ghost" onClick={exportJson} disabled={archive.nodes.length === 0}>
            <Download className="size-4" aria-hidden />
            {t('archive.toolbar.export')}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => fileInput.current?.click()}>
            <Upload className="size-4" aria-hidden />
            {t('archive.toolbar.import')}
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0]
              if (file) void importJson(file)
              e.target.value = ''
            }}
          />
        </span>
      </div>

      <p className="mt-2 text-xs text-ink-faint">
        {t('archive.toolbar.addIn')} <span className="font-medium text-ink">{targetLabel}</span>
        {selectedNode && (
          <button type="button" onClick={() => setSelectedId(currentRoot)} className="ml-2 underline-offset-2 hover:text-ink hover:underline">
            {t('archive.toolbar.backToTop')}
          </button>
        )}
      </p>

      {editMode && (
        <p className="mt-3 rounded-md border border-accent/35 bg-accent-soft px-3 py-2 text-xs text-accent-ink">{t('archive.toolbar.moveBanner')}</p>
      )}
      {notice && (
        <p className={cn('mt-3 rounded-md border px-3 py-2 text-xs', notice.tone === 'ok' ? 'border-success/30 bg-success/10 text-success' : 'border-danger/30 bg-danger-soft text-danger')}>
          {notice.text}
        </p>
      )}

      <div className="mt-4 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div className="rounded-lg border border-line bg-elevated p-2 shadow-card">
          {archive.error ? (
            <p className="flex items-start gap-2 p-3 text-sm text-danger">
              <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
              {t('archive.loadError')}
            </p>
          ) : archive.loading ? (
            <div className="flex justify-center p-6">
              <Spinner />
            </div>
          ) : results ? (
            <SearchResults
              q={results.q}
              hits={results.hits}
              pathOf={pathOf}
              viewId={viewId}
              onOpenCategory={revealCategory}
              onOpenLeaf={(node) => setViewId(node.id)}
              onRename={(node) => setDialog({ kind: 'rename', node })}
              onDelete={(node) => setDialog({ kind: 'delete', node })}
            />
          ) : (
            <ArchiveTree index={index} favorites={favorites} handlers={handlers} />
          )}
        </div>

        <div className="rounded-lg border border-line bg-elevated shadow-card lg:sticky lg:top-20 lg:min-h-[420px]">
          <NodePanel
            node={viewNode}
            path={viewNode ? pathOf(viewNode) : []}
            onEdit={(node) => setDialog({ kind: 'edit', node })}
            onDelete={(node) => setDialog({ kind: 'delete', node })}
            onClose={() => setViewId(null)}
            onTagClick={setQuery}
            onCopied={(node) => archive.countCopy(node.id).catch(() => undefined)}
            onToggleFav={toggleFav}
          />
        </div>
      </div>

      {dialog && (
        <NodeDialog
          key={`${dialog.kind}-${'node' in dialog ? dialog.node.id : ''}`}
          dialog={dialog}
          targetLabel={targetLabel}
          allTags={archive.allTags}
          onAdd={async (input) => {
            const id = await archive.add({ ...input, parentId: selectedId })
            expand(selectedId)
            if (input.type !== 'category') setViewId(id)
          }}
          onUpdate={archive.update}
          onDelete={archive.remove}
          onClose={() => setDialog(null)}
        />
      )}

      <p className="mt-12 flex items-start gap-2 border-t border-line pt-6 text-xs leading-relaxed text-ink-faint">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        {t('archive.privacy')}
      </p>
    </div>
  )
}
