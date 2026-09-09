import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { createNode, deleteNode, importNodes, seedCatalog, subscribeToGuide, updateNode } from './service'
import { buildTree, type GuideNode, type Step } from './types'

/** O manual do usuário, em tempo real. */
export function useMacroscopy() {
  const { user } = useAuth()
  const uid = user?.uid ?? null

  const [nodes, setNodes] = useState<GuideNode[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const seeded = useRef(false)

  useEffect(() => {
    if (!uid) return
    setLoading(true)
    setError(null)
    seeded.current = false
    const unsubscribe = subscribeToGuide(
      uid,
      (items) => {
        setNodes(items)
        setLoading(false)
        // Conta nova: monta o índice do catálogo uma única vez.
        if (items.length === 0 && !seeded.current) {
          seeded.current = true
          seedCatalog(uid).catch((e: Error) => setError(e))
        }
      },
      (e) => {
        setError(e)
        setLoading(false)
      },
    )
    return unsubscribe
  }, [uid])

  const tree = useMemo(() => buildTree(nodes), [nodes])

  const addSystem = useCallback(
    (name: string, icon: string, color: string) => {
      if (!uid) return Promise.resolve('')
      const order = tree.systems.length
      return createNode(uid, { kind: 'system', parentId: '', name, icon, color, order })
    },
    [uid, tree.systems.length],
  )

  const addProtocol = useCallback(
    (systemId: string, name: string) => {
      if (!uid) return Promise.resolve('')
      const order = (tree.protocolsBySystem.get(systemId) ?? []).length
      return createNode(uid, { kind: 'protocol', parentId: systemId, name, order })
    },
    [uid, tree.protocolsBySystem],
  )

  const rename = useCallback(
    (id: string, name: string) => (uid ? updateNode(uid, id, { name }) : Promise.resolve()),
    [uid],
  )

  const setSteps = useCallback(
    (id: string, steps: Step[]) => (uid ? updateNode(uid, id, { steps }) : Promise.resolve()),
    [uid],
  )

  const remove = useCallback(
    (id: string) => {
      if (!uid) return Promise.resolve()
      const children = (tree.protocolsBySystem.get(id) ?? []).map((node) => node.id)
      return deleteNode(uid, id, children)
    },
    [uid, tree.protocolsBySystem],
  )

  const importAll = useCallback(
    (incoming: Omit<GuideNode, 'createdAt' | 'updatedAt'>[]) =>
      uid ? importNodes(uid, incoming) : Promise.resolve(0),
    [uid],
  )

  return { nodes, tree, loading, error, addSystem, addProtocol, rename, setSteps, remove, importAll }
}
