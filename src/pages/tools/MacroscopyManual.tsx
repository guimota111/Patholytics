import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, ChevronRight, Download, Info, Pencil, Trash2, Upload } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ErrorAlert } from '@/components/ui/Alert'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { SelectField, TextField } from '@/components/ui/fields'
import { GuideNav } from '@/tools/macroscopy/components/GuideNav'
import { StepEditor } from '@/tools/macroscopy/components/StepEditor'
import { StepViewer } from '@/tools/macroscopy/components/StepViewer'
import { ICON_KEYS, iconOf } from '@/tools/macroscopy/catalog'
import { fromLegacyHtml } from '@/tools/macroscopy/legacy'
import { sanitizeNode, type GuideExport, type GuideNode, type Step } from '@/tools/macroscopy/types'
import { useMacroscopy } from '@/tools/macroscopy/useMacroscopy'

const SYSTEM_COLORS = ['#ef4444', '#f97316', '#eab308', '#14b8a6', '#3b82f6', '#8b5cf6', '#ec4899']

type Dialog =
  | { kind: 'system' }
  | { kind: 'protocol'; systemId: string }
  | { kind: 'rename'; node: GuideNode }
  | { kind: 'delete'; node: GuideNode }

export default function MacroscopyManualPage() {
  const { t } = useTranslation()
  const guide = useMacroscopy()
  const { tree } = guide

  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [editMode, setEditMode] = useState(false)
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const [draftName, setDraftName] = useState('')
  const [draftIcon, setDraftIcon] = useState(ICON_KEYS[0])
  const [notice, setNotice] = useState<string | null>(null)
  const fileInput = useRef<HTMLInputElement>(null)

  // Primeira carga: abre o primeiro sistema para a tela não nascer vazia.
  useEffect(() => {
    if (tree.systems.length && expanded.size === 0) setExpanded(new Set([tree.systems[0].id]))
  }, [tree.systems, expanded.size])

  // Uma peça apagada em outro dispositivo não pode continuar selecionada.
  useEffect(() => {
    if (selectedId && !tree.byId.has(selectedId)) setSelectedId(null)
  }, [tree, selectedId])

  const selected = selectedId ? (tree.byId.get(selectedId) ?? null) : null
  const parentSystem = selected ? (tree.byId.get(selected.parentId) ?? null) : null

  const counts = useMemo(() => {
    const protocols = guide.nodes.filter((node) => node.kind === 'protocol')
    return {
      systems: tree.systems.length,
      protocols: protocols.length,
      written: protocols.filter((protocol) => protocol.steps.length > 0).length,
    }
  }, [guide.nodes, tree.systems.length])

  const toggle = (id: string) =>
    setExpanded((current) => {
      const next = new Set(current)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const openDialog = (next: Dialog) => {
    setDialog(next)
    setDraftName(next.kind === 'rename' ? next.node.name : '')
    setDraftIcon(ICON_KEYS[0])
  }

  const confirmDialog = async () => {
    if (!dialog) return
    const name = draftName.trim()
    if (dialog.kind === 'system' && name) {
      const color = SYSTEM_COLORS[tree.systems.length % SYSTEM_COLORS.length]
      const id = await guide.addSystem(name, draftIcon, color)
      setExpanded((current) => new Set(current).add(id))
    } else if (dialog.kind === 'protocol' && name) {
      const id = await guide.addProtocol(dialog.systemId, name)
      setSelectedId(id)
    } else if (dialog.kind === 'rename' && name) {
      await guide.rename(dialog.node.id, name)
    } else if (dialog.kind === 'delete') {
      await guide.remove(dialog.node.id)
      if (dialog.node.id === selectedId) setSelectedId(null)
    }
    setDialog(null)
  }

  const exportGuide = () => {
    const payload: GuideExport = {
      tool: 'patholytics.macroscopy',
      version: 1,
      nodes: guide.nodes.map((node) => ({
        id: node.id,
        kind: node.kind,
        parentId: node.parentId,
        name: node.name,
        icon: node.icon,
        color: node.color,
        description: node.description,
        steps: node.steps,
        order: node.order,
      })),
    }
    const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `patholytics-macroscopia-${new Date().toISOString().slice(0, 10)}.json`
    link.click()
    URL.revokeObjectURL(url)
  }

  const importGuide = async (file: File | undefined) => {
    if (!file) return
    try {
      const parsed = JSON.parse(await file.text()) as unknown
      const nodes = readImport(parsed)
      if (!nodes.length) throw new Error('empty')
      const total = await guide.importAll(nodes)
      setNotice(t('macroscopy.importResult', { n: total }))
    } catch {
      setNotice(t('macroscopy.importError'))
    }
  }

  const setSteps = (steps: Step[]) => {
    if (selected) void guide.setSteps(selected.id, steps)
  }

  return (
    <div className="shell py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('tools.macroscopy.name')}</h1>
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-ink-muted">{t('macroscopy.subtitle')}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            size="sm"
            variant={editMode ? 'primary' : 'secondary'}
            onClick={() => setEditMode((value) => !value)}
          >
            {editMode ? <Check className="size-4" aria-hidden /> : <Pencil className="size-4" aria-hidden />}
            {editMode ? t('macroscopy.doneEditing') : t('macroscopy.edit')}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={exportGuide}>
            <Download className="size-4" aria-hidden />
            {t('macroscopy.export')}
          </Button>
          <Button type="button" size="sm" variant="ghost" onClick={() => fileInput.current?.click()}>
            <Upload className="size-4" aria-hidden />
            {t('macroscopy.import')}
          </Button>
          <input
            ref={fileInput}
            type="file"
            accept="application/json"
            className="hidden"
            onChange={(event) => {
              void importGuide(event.target.files?.[0])
              event.target.value = ''
            }}
          />
        </div>
      </header>

      {notice && <p className="mt-4 text-sm text-ink-muted">{notice}</p>}
      {guide.error && (
        <div className="mt-4">
          <ErrorAlert>{t('macroscopy.loadError')}</ErrorAlert>
        </div>
      )}

      {guide.loading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : (
        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <aside className="rounded-lg border border-line bg-elevated p-3 shadow-card lg:sticky lg:top-20">
            <p className="px-2.5 pb-2 text-[0.6875rem] tracking-wider text-ink-faint uppercase">
              {t('macroscopy.indexLabel', { systems: counts.systems, protocols: counts.protocols })}
            </p>
            <GuideNav
              tree={tree}
              expanded={expanded}
              onToggle={toggle}
              selectedId={selectedId}
              onSelect={setSelectedId}
              editMode={editMode}
              onAddSystem={() => openDialog({ kind: 'system' })}
              onAddProtocol={(systemId) => openDialog({ kind: 'protocol', systemId })}
            />
          </aside>

          <section>
            {selected && parentSystem ? (
              <>
                <div className="flex flex-wrap items-center gap-1.5 text-xs text-ink-faint">
                  <span>{parentSystem.name}</span>
                  <ChevronRight className="size-3.5" aria-hidden />
                  <span className="font-medium text-ink">{selected.name}</span>
                </div>

                <div className="mt-2 mb-5 flex flex-wrap items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold tracking-tight text-ink">{selected.name}</h2>
                  {editMode && (
                    <div className="flex items-center gap-2">
                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        onClick={() => openDialog({ kind: 'rename', node: selected })}
                      >
                        <Pencil className="size-4" aria-hidden />
                        {t('macroscopy.rename')}
                      </Button>
                      <Button
                        type="button"
                        size="sm"
                        variant="danger"
                        onClick={() => openDialog({ kind: 'delete', node: selected })}
                      >
                        <Trash2 className="size-4" aria-hidden />
                        {t('macroscopy.remove')}
                      </Button>
                    </div>
                  )}
                </div>

                {editMode ? (
                  <StepEditor protocol={selected} onChange={setSteps} />
                ) : (
                  <StepViewer protocol={selected} systemName={parentSystem.name} />
                )}
              </>
            ) : (
              <SystemsOverview
                tree={tree}
                written={counts.written}
                onOpenSystem={(id) => setExpanded((current) => new Set(current).add(id))}
              />
            )}
          </section>
        </div>
      )}

      <p className="mt-12 flex items-start gap-2 border-t border-line pt-6 text-xs leading-relaxed text-ink-faint">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        {t('macroscopy.privacy')}
      </p>

      {dialog && (
        <Modal
          title={t(`macroscopy.dialog.${dialog.kind}`)}
          onClose={() => setDialog(null)}
          footer={
            <div className="flex justify-end gap-2">
              <Button type="button" variant="ghost" onClick={() => setDialog(null)}>
                {t('common.cancel')}
              </Button>
              <Button
                type="button"
                variant={dialog.kind === 'delete' ? 'danger' : 'primary'}
                onClick={() => void confirmDialog()}
              >
                {dialog.kind === 'delete' ? t('macroscopy.remove') : t('common.save')}
              </Button>
            </div>
          }
        >
          {dialog.kind === 'delete' ? (
            <p className="text-sm leading-relaxed text-ink-muted">
              {t(dialog.node.kind === 'system' ? 'macroscopy.deleteSystemBody' : 'macroscopy.deleteProtocolBody', {
                name: dialog.node.name,
              })}
            </p>
          ) : (
            <div className="space-y-4">
              <TextField
                label={t('macroscopy.nameLabel')}
                value={draftName}
                onChange={setDraftName}
                autoFocus
                placeholder={t('macroscopy.namePlaceholder')}
              />
              {dialog.kind === 'system' && (
                <SelectField
                  label={t('macroscopy.iconLabel')}
                  value={draftIcon}
                  onChange={setDraftIcon}
                  options={ICON_KEYS.map((key) => ({ value: key, label: t(`macroscopy.icons.${key}`) }))}
                />
              )}
            </div>
          )}
        </Modal>
      )}
    </div>
  )
}

/** Tela inicial: os sistemas como cartões, para escolher por onde começar. */
function SystemsOverview({
  tree,
  written,
  onOpenSystem,
}: {
  tree: ReturnType<typeof useMacroscopy>['tree']
  written: number
  onOpenSystem: (id: string) => void
}) {
  const { t } = useTranslation()

  return (
    <div>
      <h2 className="text-xl font-semibold tracking-tight text-ink">{t('macroscopy.overviewTitle')}</h2>
      <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{t('macroscopy.overviewBody', { written })}</p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {tree.systems.map((system) => {
          const Icon = iconOf(system.icon)
          const protocols = tree.protocolsBySystem.get(system.id) ?? []
          return (
            <button
              key={system.id}
              type="button"
              onClick={() => onOpenSystem(system.id)}
              className="rounded-lg border border-line bg-elevated p-5 text-left shadow-card transition-colors hover:border-line-strong"
            >
              <span
                className="flex size-9 items-center justify-center rounded-md"
                style={{ backgroundColor: `${system.color}1f`, color: system.color || undefined }}
              >
                <Icon className="size-[1.125rem]" aria-hidden />
              </span>
              <h3 className="mt-3.5 text-sm font-semibold tracking-tight text-ink">{system.name}</h3>
              <p className="mt-1.5 text-sm leading-relaxed text-ink-faint">{system.description}</p>
              <p className="tabular mt-3 text-xs text-ink-faint">
                {t('macroscopy.protocolCount', { count: protocols.length })}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/** Aceita o export desta ferramenta e o JSON do Butcher Duck antigo. */
function readImport(parsed: unknown): Omit<GuideNode, 'createdAt' | 'updatedAt'>[] {
  const payload = parsed as { tool?: string; nodes?: unknown }
  if (payload?.tool === 'patholytics.macroscopy' && Array.isArray(payload.nodes)) {
    return payload.nodes.map((raw, index) => {
      const node = sanitizeNode(`import-${index}`, raw as Record<string, unknown>)
      return { ...node, id: (raw as { id?: string }).id ?? node.id }
    })
  }

  // Butcher Duck: { sysKey: { nome, cor, desc, itens: { itemKey: { nome, conteudo } } } }
  const legacy = parsed as Record<
    string,
    { nome?: string; cor?: string; desc?: string; itens?: Record<string, { nome?: string; conteudo?: string }> }
  >
  const out: Omit<GuideNode, 'createdAt' | 'updatedAt'>[] = []
  let systemOrder = 0
  for (const [sysKey, system] of Object.entries(legacy ?? {})) {
    if (!system || typeof system !== 'object' || !system.nome) continue
    out.push({
      id: sysKey,
      kind: 'system',
      parentId: '',
      name: system.nome,
      icon: 'clipboardList',
      color: system.cor ?? '',
      description: system.desc ?? '',
      steps: [],
      order: systemOrder++,
    })
    let protocolOrder = 0
    for (const [itemKey, item] of Object.entries(system.itens ?? {})) {
      out.push({
        id: `${sysKey}:${itemKey}`,
        kind: 'protocol',
        parentId: sysKey,
        name: item?.nome ?? itemKey,
        icon: 'clipboardList',
        color: '',
        description: '',
        steps: legacySteps(item?.conteudo ?? ''),
        order: protocolOrder++,
      })
    }
  }
  return out
}

function legacySteps(conteudo: string): Step[] {
  if (!conteudo.trim()) return []
  try {
    if (conteudo.trim().startsWith('[')) {
      const blocks = JSON.parse(conteudo) as { texto?: string; imgBase64?: string }[]
      return blocks.map((block, index) => ({
        id: `import-${index}`,
        text: fromLegacyHtml(block.texto ?? ''),
        image: (block.imgBase64 ?? '').startsWith('data:image/') ? (block.imgBase64 as string) : '',
        caption: '',
      }))
    }
  } catch {
    // Conteúdo antigo que não era JSON entra como um passo só.
  }
  return [{ id: 'import-0', text: fromLegacyHtml(conteudo), image: '', caption: '' }]
}
