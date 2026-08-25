import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Info, ListPlus, Search, Settings2, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { FullPageSpinner } from '@/components/ui/Spinner'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/cn'
import { ArchiveSection } from '@/tools/organizer/components/ArchiveSection'
import { CaseRow } from '@/tools/organizer/components/CaseRow'
import { ListSettings, type ListSettingsResult } from '@/tools/organizer/components/ListSettings'
import { Modal } from '@/tools/organizer/components/Modal'
import { MoveCaseDialog } from '@/tools/organizer/components/MoveCaseDialog'
import { NewCaseForm } from '@/tools/organizer/components/NewCaseForm'
import { NewListDialog } from '@/tools/organizer/components/NewListDialog'
import { StageBar } from '@/tools/organizer/components/StageBar'
import {
  ENFORCE_PLAN_LIMITS,
  FREE_CASE_LIMIT,
  SORT_MODES,
  type OrganizerCase,
  type SortMode,
} from '@/tools/organizer/types'
import { useOrganizer } from '@/tools/organizer/useOrganizer'

const PRIVACY_PREFIX = 'patholytics.organizer.privacy.v1'

/**
 * Relogio dos prazos. So corre quando ha algum prazo na tela — uma lista sem
 * prazo nao precisa de um render por segundo.
 */
function useNow(active: boolean): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    if (!active) return
    const id = setInterval(() => setNow(Date.now()), 1000)
    const onVisible = () => {
      if (!document.hidden) setNow(Date.now())
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [active])
  return now
}

export default function CaseOrganizerPage() {
  const { t, i18n } = useTranslation()
  const { user } = useAuth()
  const organizer = useOrganizer()

  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [selectMode, setSelectMode] = useState(false)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [showSettings, setShowSettings] = useState(false)
  const [showNewList, setShowNewList] = useState(false)
  const [movingCase, setMovingCase] = useState<OrganizerCase | null>(null)
  const [pendingDelete, setPendingDelete] = useState<{ ids: string[]; label: string } | null>(null)
  const [privacyDismissed, setPrivacyDismissed] = useState(true)
  const dragId = useRef<string | null>(null)

  const privacyKey = user ? `${PRIVACY_PREFIX}:${user.uid}` : null

  useEffect(() => {
    if (!privacyKey) return
    try {
      setPrivacyDismissed(localStorage.getItem(privacyKey) === 'dismissed')
    } catch {
      setPrivacyDismissed(false)
    }
  }, [privacyKey])

  const dismissPrivacy = () => {
    setPrivacyDismissed(true)
    try {
      if (privacyKey) localStorage.setItem(privacyKey, 'dismissed')
    } catch {
      /* sem persistencia o aviso volta na proxima visita, o que e aceitavel */
    }
  }

  const {
    ready,
    lists,
    activeList,
    visibleCases,
    openCases,
    archivedCases,
    counts,
    knownTags,
    error,
    dismissError,
    stageFilter,
    setStageFilter,
    search,
    setSearch,
    sort,
    setSort,
  } = organizer

  const hasDeadline = useMemo(() => visibleCases.some((item) => item.deadline !== null), [visibleCases])
  const now = useNow(hasDeadline)
  const locale = i18n.language

  /**
   * Arrastar so faz sentido quando a tela mostra a ordem manual inteira: com
   * filtro ou busca ativos, soltar uma linha entre outras duas nao diz nada
   * sobre onde ela ficaria na lista completa.
   */
  const sortable = sort === 'manual' && stageFilter === 'all' && search.trim() === ''

  const atLimit = ENFORCE_PLAN_LIMITS && openCases.length >= FREE_CASE_LIMIT

  const toggleSelected = (caseId: string) =>
    setSelected((current) => {
      const next = new Set(current)
      if (next.has(caseId)) next.delete(caseId)
      else next.add(caseId)
      return next
    })

  const leaveSelectMode = () => {
    setSelectMode(false)
    setSelected(new Set())
  }

  const reorderTo = async (fromId: string, toId: string) => {
    if (fromId === toId) return
    const ids = visibleCases.map((item) => item.id)
    const from = ids.indexOf(fromId)
    const to = ids.indexOf(toId)
    if (from === -1 || to === -1) return
    ids.splice(from, 1)
    ids.splice(to, 0, fromId)
    await organizer.reorder(ids)
  }

  const moveBy = async (item: OrganizerCase, delta: number) => {
    const ids = visibleCases.map((entry) => entry.id)
    const index = ids.indexOf(item.id)
    const target = index + delta
    if (index === -1 || target < 0 || target >= ids.length) return
    ids.splice(index, 1)
    ids.splice(target, 0, item.id)
    await organizer.reorder(ids)
  }

  const saveSettings = async (result: ListSettingsResult) => {
    if (!activeList) return
    // Os casos orfaos mudam de etapa antes das etapas serem gravadas: se a
    // gravacao falhar no meio, nenhum caso fica apontando para uma etapa
    // que nao existe mais.
    for (const [fromStage, toStage] of Object.entries(result.reassign)) {
      const affected = organizer.cases.filter((item) => item.stageId === fromStage)
      for (const item of affected) await organizer.patchCase(item.id, { stageId: toStage })
    }
    await organizer.saveList(activeList.id, {
      name: result.name,
      identifierLabel: result.identifierLabel,
      showReviewCheck: result.showReviewCheck,
      stages: result.stages,
    })
    setShowSettings(false)
  }

  if (!ready) {
    return <FullPageSpinner label={t('common.loading')} />
  }

  return (
    <div className="shell py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('tools.organizer.name')}</h1>
          <p className="mt-1.5 max-w-2xl text-sm text-ink-muted">{t('organizer.subtitle')}</p>
        </div>

        {lists.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <select
              value={activeList?.id ?? ''}
              onChange={(event) => organizer.selectList(event.target.value)}
              aria-label={t('organizer.lists.switch')}
              className="h-9 max-w-[12rem] rounded-md border border-line bg-elevated px-2.5 text-sm text-ink"
            >
              {lists.map((list) => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
            <Button type="button" size="sm" variant="secondary" onClick={() => setShowNewList(true)}>
              <ListPlus className="size-4" aria-hidden />
              {t('organizer.lists.new')}
            </Button>
            {activeList && (
              <Button type="button" size="sm" variant="ghost" onClick={() => setShowSettings(true)}>
                <Settings2 className="size-4" aria-hidden />
                {t('organizer.lists.settings')}
              </Button>
            )}
          </div>
        )}
      </header>

      {error && (
        <div className="mt-6 flex items-start gap-2 rounded-md border border-danger/40 bg-danger-soft px-3 py-2.5 text-sm text-danger">
          <AlertTriangle className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span className="flex-1">{error}</span>
          <button type="button" onClick={dismissError} aria-label={t('common.cancel')}>
            <X className="size-4" aria-hidden />
          </button>
        </div>
      )}

      {!privacyDismissed && (
        <div className="mt-6 flex items-start gap-2 rounded-md border border-line bg-elevated px-3 py-2.5 text-xs leading-relaxed text-ink-muted">
          <Info className="mt-0.5 size-4 shrink-0" aria-hidden />
          <span className="flex-1">{t('organizer.privacy')}</span>
          <button type="button" onClick={dismissPrivacy} aria-label={t('common.cancel')}>
            <X className="size-4" aria-hidden />
          </button>
        </div>
      )}

      {!activeList ? (
        <div className="mt-10 rounded-lg border border-line bg-elevated px-6 py-12 text-center">
          <h2 className="text-sm font-semibold text-ink">{t('organizer.empty.title')}</h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-ink-muted">{t('organizer.empty.description')}</p>
          <div className="mt-5">
            <Button type="button" size="sm" onClick={() => setShowNewList(true)}>
              <ListPlus className="size-4" aria-hidden />
              {t('organizer.empty.action')}
            </Button>
          </div>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <StageBar
              stages={activeList.stages}
              counts={counts}
              active={stageFilter}
              onChange={setStageFilter}
            />
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <div className="relative min-w-[10rem] flex-1 sm:max-w-xs">
              <Search className="absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-ink-faint" aria-hidden />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder={t('organizer.toolbar.search')}
                aria-label={t('organizer.toolbar.search')}
                className="h-9 w-full rounded-md border border-line bg-elevated pr-2.5 pl-8 text-sm text-ink"
              />
            </div>

            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as SortMode)}
              aria-label={t('organizer.toolbar.sort')}
              className="h-9 rounded-md border border-line bg-elevated px-2 text-sm text-ink"
            >
              {SORT_MODES.map((mode) => (
                <option key={mode} value={mode}>
                  {t(`organizer.sort.${mode}`)}
                </option>
              ))}
            </select>

            {activeList.showReviewCheck && openCases.some((item) => item.reviewed) && (
              <Button type="button" size="sm" variant="ghost" onClick={() => void organizer.clearReviewed()}>
                {t('organizer.toolbar.clearReviewed')}
              </Button>
            )}

            {selectMode ? (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  disabled={selected.size === 0}
                  onClick={() =>
                    setPendingDelete({
                      ids: [...selected],
                      label: t('organizer.delete.many', { count: selected.size }),
                    })
                  }
                >
                  <Trash2 className="size-4" aria-hidden />
                  {t('organizer.toolbar.deleteSelected', { count: selected.size })}
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={leaveSelectMode}>
                  {t('common.cancel')}
                </Button>
              </>
            ) : (
              <Button type="button" size="sm" variant="ghost" onClick={() => setSelectMode(true)}>
                {t('organizer.toolbar.select')}
              </Button>
            )}

            <div className="ms-auto">
              <NewCaseForm list={activeList} knownTags={knownTags} onCreate={organizer.addCase} />
            </div>
          </div>

          {atLimit && (
            <p className="mt-3 rounded-md border border-amber-500/40 bg-amber-500/5 px-3 py-2 text-xs text-ink-muted">
              {t('organizer.limit', { limit: FREE_CASE_LIMIT })}
            </p>
          )}

          <div className="mt-4 space-y-2">
            {visibleCases.length === 0 ? (
              <p className="rounded-lg border border-line bg-elevated px-6 py-12 text-center text-sm text-ink-faint">
                {openCases.length === 0 ? t('organizer.list.empty') : t('organizer.list.noMatch')}
              </p>
            ) : (
              visibleCases.map((item, index) => (
                <CaseRow
                  key={item.id}
                  item={item}
                  list={activeList}
                  now={now}
                  locale={locale}
                  expanded={expandedId === item.id}
                  onToggle={() => setExpandedId((current) => (current === item.id ? null : item.id))}
                  selectMode={selectMode}
                  selected={selected.has(item.id)}
                  onSelect={() => toggleSelected(item.id)}
                  draggable={sortable && !selectMode}
                  onDragStart={(event: DragEvent<HTMLDivElement>) => {
                    dragId.current = item.id
                    event.dataTransfer.effectAllowed = 'move'
                  }}
                  onDragOver={(event: DragEvent<HTMLDivElement>) => {
                    if (dragId.current) event.preventDefault()
                  }}
                  onDrop={(event: DragEvent<HTMLDivElement>) => {
                    event.preventDefault()
                    const from = dragId.current
                    dragId.current = null
                    if (from) void reorderTo(from, item.id)
                  }}
                  onDragEnd={() => {
                    dragId.current = null
                  }}
                  onMoveUp={sortable && index > 0 ? () => void moveBy(item, -1) : undefined}
                  onMoveDown={
                    sortable && index < visibleCases.length - 1 ? () => void moveBy(item, 1) : undefined
                  }
                  onRequestMove={() => setMovingCase(item)}
                  onRequestDelete={() =>
                    setPendingDelete({ ids: [item.id], label: t('organizer.delete.one', { title: item.title }) })
                  }
                  canMoveBetweenLists={lists.length > 1}
                  actions={organizer}
                />
              ))
            )}
          </div>

          <ArchiveSection
            cases={archivedCases}
            locale={locale}
            onRestore={organizer.restoreCase}
            onDelete={(item) =>
              setPendingDelete({ ids: [item.id], label: t('organizer.delete.one', { title: item.title }) })
            }
          />
        </>
      )}

      <p className={cn('mt-12 flex items-start gap-2 border-t border-line pt-6 text-xs leading-relaxed text-ink-faint')}>
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        {t('organizer.footer')}
      </p>

      {showNewList && (
        <NewListDialog onClose={() => setShowNewList(false)} onCreate={organizer.addList} />
      )}

      {showSettings && activeList && (
        <ListSettings
          list={activeList}
          countsByStage={counts.byStage}
          canDelete={lists.length > 1}
          onClose={() => setShowSettings(false)}
          onSave={saveSettings}
          onDelete={async () => {
            await organizer.removeList(activeList.id)
            setShowSettings(false)
          }}
        />
      )}

      {movingCase && activeList && (
        <MoveCaseDialog
          item={movingCase}
          lists={lists}
          currentListId={activeList.id}
          onClose={() => setMovingCase(null)}
          onMove={(toListId, stageId) => organizer.moveToList(movingCase, toListId, stageId)}
        />
      )}

      {pendingDelete && (
        <Modal
          title={t('organizer.delete.title')}
          onClose={() => setPendingDelete(null)}
          footer={
            <>
              <Button type="button" variant="ghost" size="sm" onClick={() => setPendingDelete(null)}>
                {t('common.cancel')}
              </Button>
              <Button
                type="button"
                variant="danger"
                size="sm"
                onClick={async () => {
                  await organizer.removeCases(pendingDelete.ids)
                  setPendingDelete(null)
                  leaveSelectMode()
                }}
              >
                {t('organizer.delete.confirm')}
              </Button>
            </>
          }
        >
          <p className="text-sm text-ink-muted">{pendingDelete.label}</p>
        </Modal>
      )}
    </div>
  )
}
