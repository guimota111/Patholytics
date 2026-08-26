import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  createNode,
  deleteNodes,
  importNodes,
  incrementCopyCount,
  seedCategories,
  subscribeToArchive,
  updateNode,
} from './service'
import {
  buildIndex,
  canMoveInto,
  descendantsOf,
  norm,
  type ArchiveExport,
  type ArchiveIndex,
  type ArchiveNode,
  type NodeType,
} from './types'

export interface SearchHit {
  node: ArchiveNode
  /** O termo bateu só no conteúdo (mostra trecho). */
  matchContent: boolean
}

/** Estado do arquivo do usuário, sincronizado em tempo real com o Firestore. */
export function useArchive(seedLabels: string[]) {
  const { user } = useAuth()
  const uid = user?.uid ?? null

  const [nodes, setNodes] = useState<ArchiveNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const seeded = useRef(false)

  useEffect(() => {
    if (!uid) return
    setLoading(true)
    setError(null)
    seeded.current = false
    const unsubscribe = subscribeToArchive(
      uid,
      (items) => {
        setNodes(items)
        setLoading(false)
        // Primeira abertura: dá uma estrutura inicial em vez de uma árvore vazia.
        if (items.length === 0 && !seeded.current) {
          seeded.current = true
          seedCategories(uid, seedLabels).catch((e: Error) => setError(e))
        }
      },
      (e) => {
        setError(e)
        setLoading(false)
      },
    )
    return unsubscribe
    // seedLabels só importa na primeira abertura; não reassina ao trocar idioma.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid])

  const index: ArchiveIndex = useMemo(() => buildIndex(nodes), [nodes])

  const favorites = useMemo(
    () => nodes.filter((n) => n.favorite && n.type !== 'category').sort((a, b) => b.copyCount - a.copyCount || a.label.localeCompare(b.label, 'pt-BR')),
    [nodes],
  )

  const allTags = useMemo(() => {
    const set = new Set<string>()
    for (const n of nodes) for (const t of n.tags) set.add(t)
    return [...set].sort((a, b) => a.localeCompare(b, 'pt-BR'))
  }, [nodes])

  const search = useCallback(
    (query: string): { q: string; hits: SearchHit[] } | null => {
      const q = norm(query.trim())
      if (!q) return null
      const hits: SearchHit[] = []
      for (const n of nodes) {
        const inLabel = norm(n.label).includes(q)
        const inContent = n.type !== 'category' && norm(n.content).includes(q)
        const inTags = n.tags.some((t) => norm(t).includes(q))
        if (inLabel || inContent || inTags) hits.push({ node: n, matchContent: !inLabel && inContent })
      }
      hits.sort((a, b) => {
        const ac = a.node.type === 'category'
        const bc = b.node.type === 'category'
        if (ac !== bc) return ac ? -1 : 1
        return b.node.copyCount - a.node.copyCount || a.node.label.localeCompare(b.node.label, 'pt-BR')
      })
      return { q, hits }
    },
    [nodes],
  )

  const requireUid = () => {
    if (!uid) throw new Error('not signed in')
    return uid
  }

  const add = useCallback(
    (input: { parentId: string; type: NodeType; label: string; content?: string; icon?: string; tags?: string[] }) =>
      createNode(requireUid(), input),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uid],
  )

  const update = useCallback(
    (id: string, changes: Partial<Pick<ArchiveNode, 'label' | 'content' | 'icon' | 'tags' | 'favorite'>>) =>
      updateNode(requireUid(), id, changes),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uid],
  )

  const move = useCallback(
    (id: string, targetId: string) => {
      if (!canMoveInto(id, targetId, index)) return Promise.resolve()
      return updateNode(requireUid(), id, { parentId: targetId })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uid, index],
  )

  const remove = useCallback(
    (id: string) => deleteNodes(requireUid(), [id, ...descendantsOf(id, index)]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uid, index],
  )

  const countCopy = useCallback(
    (id: string) => incrementCopyCount(requireUid(), id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uid],
  )

  const exportAll = useCallback((): ArchiveExport => {
    return {
      format: 'patholytics.archive',
      version: 1,
      exportedAt: new Date().toISOString(),
      nodes: nodes.map((n) => ({
        id: n.id,
        parentId: n.parentId,
        type: n.type,
        label: n.label,
        content: n.content,
        icon: n.icon,
        tags: n.tags,
        copyCount: n.copyCount,
        favorite: n.favorite,
      })),
    }
  }, [nodes])

  const importAll = useCallback(
    (data: ArchiveExport) => importNodes(requireUid(), data.nodes, nodes),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uid, nodes],
  )

  return {
    ready: Boolean(uid),
    nodes,
    index,
    favorites,
    allTags,
    loading,
    error,
    search,
    add,
    update,
    move,
    remove,
    countCopy,
    exportAll,
    importAll,
  }
}
