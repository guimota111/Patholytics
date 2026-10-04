import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  createNode,
  deleteNodes,
  importNodes,
  incrementCopyCount,
  subscribeToArchive,
  updateNode,
  type ArchiveSpace,
  type CreateInput,
} from './service'
import {
  buildIndex,
  canMoveInto,
  descendantsOf,
  norm,
  type ArchiveExport,
  type ArchiveIndex,
  type ArchiveNode,
} from './types'

export interface SearchHit {
  node: ArchiveNode
  /** O termo bateu só no conteúdo (mostra trecho). */
  matchContent: boolean
}

/** Quem assina o que for publicado neste espaço (só o catálogo usa). */
export interface Signature {
  uid: string
  name: string
}

export type ArchiveSpaceState = ReturnType<typeof useArchiveSpace>

/**
 * Um espaço do arquivo — a biblioteca do usuário ou o catálogo compartilhado —
 * sincronizado em tempo real com o Firestore. A página monta um por espaço; as
 * derivações (índice, favoritos, tags, busca) são as mesmas para os dois.
 */
export function useArchiveSpace(space: ArchiveSpace | null, signature: Signature | null = null) {
  const [nodes, setNodes] = useState<ArchiveNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  // `space` é um objeto novo a cada render; a identidade que importa é a chave.
  const spaceKey = space ? (space.kind === 'catalog' ? 'catalog' : `library:${space.uid}`) : ''

  useEffect(() => {
    if (!space) return
    setLoading(true)
    setError(null)
    const unsubscribe = subscribeToArchive(
      space,
      (items) => {
        setNodes(items)
        setLoading(false)
      },
      (e) => {
        setError(e)
        setLoading(false)
      },
    )
    return unsubscribe
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [spaceKey])

  const index: ArchiveIndex = useMemo(() => buildIndex(nodes), [nodes])

  const favorites = useMemo(
    () =>
      nodes
        .filter((n) => n.favorite && n.type !== 'category')
        .sort((a, b) => b.copyCount - a.copyCount || a.label.localeCompare(b.label, 'pt-BR')),
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
        const inAuthor = norm(n.authorName).includes(q)
        if (inLabel || inContent || inTags || inAuthor) hits.push({ node: n, matchContent: !inLabel && inContent })
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

  const requireSpace = () => {
    if (!space) throw new Error('not signed in')
    return space
  }

  /** No catálogo, toda folha nasce assinada por quem a publicou. */
  const add = useCallback(
    (input: CreateInput) => {
      const target = requireSpace()
      const signed =
        target.kind === 'catalog' && input.type !== 'category' && signature
          ? { ...input, author: { uid: signature.uid, name: signature.name } }
          : input
      return createNode(target, signed)
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spaceKey, signature?.uid, signature?.name],
  )

  const update = useCallback(
    (id: string, changes: Partial<Pick<ArchiveNode, 'label' | 'content' | 'icon' | 'tags' | 'favorite'>>) =>
      updateNode(requireSpace(), id, changes),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spaceKey],
  )

  const move = useCallback(
    (id: string, targetId: string) => {
      if (!canMoveInto(id, targetId, index)) return Promise.resolve()
      return updateNode(requireSpace(), id, { parentId: targetId })
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spaceKey, index],
  )

  const remove = useCallback(
    (id: string) => deleteNodes(requireSpace(), [id, ...descendantsOf(id, index)]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spaceKey, index],
  )

  const countCopy = useCallback(
    (id: string) => incrementCopyCount(requireSpace(), id),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spaceKey],
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
        ...(n.authorName ? { authorUid: n.authorUid, authorName: n.authorName } : {}),
      })),
    }
  }, [nodes])

  const importAll = useCallback(
    (data: ArchiveExport) => importNodes(requireSpace(), data.nodes, nodes),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [spaceKey, nodes],
  )

  return {
    ready: Boolean(space),
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
