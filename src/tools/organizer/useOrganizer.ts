import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  createCase,
  createList,
  deleteCases,
  deleteList,
  moveCaseToList,
  reorderCases,
  subscribeToCases,
  subscribeToLists,
  updateCase,
  updateList,
} from './service'
import {
  ORDER_STEP,
  lastLogText,
  type CaseList,
  type OrganizerCase,
  type SortMode,
  type Stage,
} from './types'

const LAST_LIST_PREFIX = 'patholytics.organizer.lastList.v1'
const lastListKey = (uid: string) => `${LAST_LIST_PREFIX}:${uid}`

function readLastList(uid: string | null): string | null {
  if (!uid) return null
  try {
    return localStorage.getItem(lastListKey(uid))
  } catch {
    return null
  }
}

function rememberLastList(uid: string, listId: string): void {
  try {
    localStorage.setItem(lastListKey(uid), listId)
  } catch {
    /* sem persistencia a ferramenta continua funcionando na sessao */
  }
}

/** `all` mostra tudo; `pending` corta pelo marcador, nao por etapa. */
export type StageFilter = 'all' | 'pending' | (string & {})

function matchesSearch(item: OrganizerCase, needle: string): boolean {
  if (!needle) return true
  const haystack = [
    item.title,
    item.identifier,
    item.notes,
    item.pending?.text ?? '',
    item.tags.join(' '),
    item.log.map((entry) => entry.text).join(' '),
  ]
    .join(' ')
    .toLowerCase()
  return haystack.includes(needle)
}

function compareBy(mode: SortMode, stageOrder: Map<string, number>) {
  return (a: OrganizerCase, b: OrganizerCase): number => {
    switch (mode) {
      case 'deadline':
        // Sem prazo vai para o fim: quem tem relogio correndo interessa antes.
        if (a.deadline === b.deadline) return a.order - b.order
        if (a.deadline === null) return 1
        if (b.deadline === null) return -1
        return a.deadline - b.deadline
      case 'created':
        return (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0)
      case 'alphabetical':
        return a.title.localeCompare(b.title)
      case 'stage': {
        const diff = (stageOrder.get(a.stageId) ?? 99) - (stageOrder.get(b.stageId) ?? 99)
        return diff !== 0 ? diff : a.order - b.order
      }
      default:
        return a.order - b.order
    }
  }
}

export function useOrganizer() {
  const { user } = useAuth()
  const uid = user?.uid ?? null

  const [lists, setLists] = useState<CaseList[]>([])
  const [listsLoaded, setListsLoaded] = useState(false)
  const [activeListId, setActiveListId] = useState<string | null>(null)
  const [cases, setCases] = useState<OrganizerCase[]>([])
  const [casesLoaded, setCasesLoaded] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [stageFilter, setStageFilter] = useState<StageFilter>('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState<SortMode>('manual')

  // O id da lista ativa e lido do navegador, mas so vale depois que as listas
  // chegam — a lista lembrada pode ter sido apagada em outro dispositivo.
  const restoredFor = useRef<string | null>(null)

  useEffect(() => {
    if (!uid) {
      setLists([])
      setListsLoaded(false)
      setActiveListId(null)
      return
    }
    setListsLoaded(false)
    const unsubscribe = subscribeToLists(
      uid,
      (next) => {
        setLists(next)
        setListsLoaded(true)
      },
      (err) => {
        setError(err.message)
        setListsLoaded(true)
      },
    )
    return unsubscribe
  }, [uid])

  useEffect(() => {
    if (!uid || !listsLoaded) return
    setActiveListId((current) => {
      if (current && lists.some((list) => list.id === current)) return current
      if (restoredFor.current !== uid) {
        restoredFor.current = uid
        const remembered = readLastList(uid)
        if (remembered && lists.some((list) => list.id === remembered)) return remembered
      }
      return lists[0]?.id ?? null
    })
  }, [uid, lists, listsLoaded])

  useEffect(() => {
    if (!uid || !activeListId) {
      setCases([])
      setCasesLoaded(!activeListId)
      return
    }
    rememberLastList(uid, activeListId)
    setCasesLoaded(false)
    const unsubscribe = subscribeToCases(
      uid,
      activeListId,
      (next) => {
        setCases(next)
        setCasesLoaded(true)
      },
      (err) => {
        setError(err.message)
        setCasesLoaded(true)
      },
    )
    return unsubscribe
  }, [uid, activeListId])

  // Trocar de lista nao deve carregar filtro nem busca da lista anterior:
  // as etapas sao outras, e um filtro invisivel esconderia casos sem motivo.
  useEffect(() => {
    setStageFilter('all')
    setSearch('')
  }, [activeListId])

  const activeList = useMemo(
    () => lists.find((list) => list.id === activeListId) ?? null,
    [lists, activeListId],
  )

  const stageOrder = useMemo(() => {
    const map = new Map<string, number>()
    activeList?.stages.forEach((stage, index) => map.set(stage.id, index))
    return map
  }, [activeList])

  const openCases = useMemo(() => cases.filter((item) => !item.archived), [cases])
  const archivedCases = useMemo(
    () =>
      cases
        .filter((item) => item.archived)
        .sort((a, b) => (b.archivedAt ?? 0) - (a.archivedAt ?? 0)),
    [cases],
  )

  const visibleCases = useMemo(() => {
    const needle = search.trim().toLowerCase()
    return openCases
      .filter((item) => {
        if (stageFilter === 'pending') return item.pending !== null
        if (stageFilter !== 'all' && item.stageId !== stageFilter) return false
        return true
      })
      .filter((item) => matchesSearch(item, needle))
      .sort(compareBy(sort, stageOrder))
  }, [openCases, stageFilter, search, sort, stageOrder])

  const counts = useMemo(() => {
    const byStage = new Map<string, number>()
    for (const item of openCases) byStage.set(item.stageId, (byStage.get(item.stageId) ?? 0) + 1)
    return {
      total: openCases.length,
      byStage,
      pending: openCases.filter((item) => item.pending !== null).length,
      archived: archivedCases.length,
    }
  }, [openCases, archivedCases])

  const knownTags = useMemo(() => {
    const seen = new Map<string, string>()
    for (const item of cases) for (const tag of item.tags) seen.set(tag.toLowerCase(), tag)
    return [...seen.values()].sort((a, b) => a.localeCompare(b))
  }, [cases])

  const run = useCallback(async (action: () => Promise<unknown>) => {
    try {
      await action()
      setError(null)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
      return false
    }
  }, [])

  const nextOrder = useCallback(
    () => openCases.reduce((max, item) => Math.max(max, item.order), 0) + ORDER_STEP,
    [openCases],
  )

  const actions = useMemo(
    () => ({
      selectList: (listId: string) => setActiveListId(listId),

      addList: async (input: { name: string; stages: Stage[]; identifierLabel: string }) => {
        if (!uid) return
        const order = lists.reduce((max, list) => Math.max(max, list.order), 0) + 1
        await run(async () => {
          const listId = await createList(uid, { ...input, order })
          setActiveListId(listId)
        })
      },

      saveList: async (listId: string, changes: Partial<CaseList>) => {
        if (!uid) return
        await run(() => updateList(uid, listId, changes))
      },

      removeList: async (listId: string) => {
        if (!uid) return
        await run(() => deleteList(uid, listId))
      },

      addCase: async (input: {
        title: string
        identifier: string
        stageId: string
        tags: string[]
        deadline: number | null
        notes: string
        firstLog: string
      }) => {
        if (!uid || !activeListId) return
        await run(() => createCase(uid, activeListId, { ...input, order: nextOrder() }))
      },

      patchCase: async (caseId: string, changes: Record<string, unknown>) => {
        if (!uid || !activeListId) return
        await run(() => updateCase(uid, activeListId, caseId, changes))
      },

      appendLog: async (item: OrganizerCase, text: string) => {
        if (!uid || !activeListId || !text.trim()) return
        const log = [...item.log, { text: text.trim(), ts: Date.now() }]
        await run(() => updateCase(uid, activeListId, item.id, { log }))
      },

      setPending: async (item: OrganizerCase, text: string) => {
        if (!uid || !activeListId) return
        const trimmed = text.trim()
        await run(() =>
          updateCase(uid, activeListId, item.id, {
            pending: trimmed ? { text: trimmed, since: item.pending?.since ?? Date.now() } : null,
          }),
        )
      },

      toggleReviewed: async (item: OrganizerCase) => {
        if (!uid || !activeListId) return
        const reviewed = !item.reviewed
        await run(() =>
          updateCase(uid, activeListId, item.id, {
            reviewed,
            reviewedAt: reviewed ? Date.now() : null,
          }),
        )
      },

      clearReviewed: async () => {
        if (!uid || !activeListId) return
        const marked = openCases.filter((item) => item.reviewed)
        await run(async () => {
          for (const item of marked) {
            await updateCase(uid, activeListId, item.id, { reviewed: false, reviewedAt: null })
          }
        })
      },

      archiveCase: async (item: OrganizerCase) => {
        if (!uid || !activeListId) return
        await run(() =>
          updateCase(uid, activeListId, item.id, {
            archived: true,
            archivedAt: Date.now(),
            reviewed: false,
            reviewedAt: null,
          }),
        )
      },

      // Reabrir devolve o caso a etapa em que ele estava — arquivar nunca foi
      // uma etapa, so um estado por cima dela.
      restoreCase: async (item: OrganizerCase) => {
        if (!uid || !activeListId) return
        await run(() =>
          updateCase(uid, activeListId, item.id, {
            archived: false,
            archivedAt: null,
            order: nextOrder(),
          }),
        )
      },

      removeCases: async (caseIds: string[]) => {
        if (!uid || !activeListId || !caseIds.length) return
        await run(() => deleteCases(uid, activeListId, caseIds))
      },

      reorder: async (orderedIds: string[]) => {
        if (!uid || !activeListId) return
        await run(() => reorderCases(uid, activeListId, orderedIds))
      },

      moveToList: async (item: OrganizerCase, toListId: string, stageId: string) => {
        if (!uid || !activeListId || toListId === activeListId) return
        // Os casos da lista de destino nao estao carregados aqui, entao a
        // ordem vem do relogio: sempre maior que as existentes, o caso pousa
        // no fim e o usuario reordena de la se quiser.
        await run(() => moveCaseToList(uid, activeListId, item, toListId, stageId, Date.now()))
      },
    }),
    [uid, activeListId, lists, openCases, nextOrder, run],
  )

  return {
    ready: listsLoaded && (activeListId === null || casesLoaded),
    lists,
    activeList,
    cases,
    openCases,
    visibleCases,
    archivedCases,
    counts,
    knownTags,
    error,
    dismissError: () => setError(null),
    stageFilter,
    setStageFilter,
    search,
    setSearch,
    sort,
    setSort,
    lastLogText,
    ...actions,
  }
}
