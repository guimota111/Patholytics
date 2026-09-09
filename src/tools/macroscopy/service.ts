/* ==========================================================================
   service.ts — o manual mora no Firestore, sob o próprio usuário: é material
   escrito ao longo de meses e consultado do celular na bancada e do desktop
   na sala. Uma coleção só, um documento por nó.
   ========================================================================== */

import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/lib/firestore'
import { CATALOG } from './catalog'
import { sanitizeNode, type GuideNode, type NodeKind, type Step } from './types'

const guideCollection = (uid: string) => collection(db, 'users', uid, 'macroscopy')
const guideDocument = (uid: string, id: string) => doc(db, 'users', uid, 'macroscopy', id)

export function subscribeToGuide(
  uid: string,
  onChange: (nodes: GuideNode[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    guideCollection(uid),
    (snapshot) => onChange(snapshot.docs.map((entry) => sanitizeNode(entry.id, entry.data() as DocumentData))),
    onError,
  )
}

interface NewNode {
  kind: NodeKind
  parentId: string
  name: string
  icon?: string
  color?: string
  description?: string
  steps?: Step[]
  order: number
}

export async function createNode(uid: string, node: NewNode): Promise<string> {
  const ref = doc(guideCollection(uid))
  await setDoc(ref, {
    kind: node.kind,
    parentId: node.parentId,
    name: node.name,
    icon: node.icon ?? (node.kind === 'system' ? 'clipboardList' : 'clipboardList'),
    color: node.color ?? '',
    description: node.description ?? '',
    steps: node.steps ?? [],
    order: node.order,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateNode(
  uid: string,
  id: string,
  patch: Partial<Pick<GuideNode, 'name' | 'icon' | 'color' | 'description' | 'steps' | 'order' | 'parentId'>>,
): Promise<void> {
  await updateDoc(guideDocument(uid, id), { ...patch, updatedAt: serverTimestamp() })
}

/** Apagar um sistema leva junto os roteiros dentro dele. */
export async function deleteNode(uid: string, id: string, childIds: string[]): Promise<void> {
  if (childIds.length === 0) {
    await deleteDoc(guideDocument(uid, id))
    return
  }
  const batch = writeBatch(db)
  for (const childId of [...childIds, id]) batch.delete(guideDocument(uid, childId))
  await batch.commit()
}

/**
 * Primeira abertura: monta o índice do catálogo em vez de deixar a tela vazia.
 * São ~40 documentos, um lote só.
 */
export async function seedCatalog(uid: string): Promise<void> {
  const batch = writeBatch(db)
  CATALOG.forEach((system, systemIndex) => {
    const systemRef = doc(guideCollection(uid))
    batch.set(systemRef, {
      kind: 'system',
      parentId: '',
      name: system.name,
      icon: system.icon,
      color: system.color,
      description: system.description,
      steps: [],
      order: systemIndex,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
    system.protocols.forEach((protocol, protocolIndex) => {
      const protocolRef = doc(guideCollection(uid))
      batch.set(protocolRef, {
        kind: 'protocol',
        parentId: systemRef.id,
        name: protocol.name,
        icon: 'clipboardList',
        color: '',
        description: '',
        steps: protocol.steps ?? [],
        order: protocolIndex,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    })
  })
  await batch.commit()
}

/** Importa nós de um arquivo exportado, sempre como cópias novas. */
export async function importNodes(uid: string, nodes: Omit<GuideNode, 'createdAt' | 'updatedAt'>[]): Promise<number> {
  const batch = writeBatch(db)
  const idMap = new Map<string, string>()
  for (const node of nodes.filter((n) => n.kind === 'system')) {
    const ref = doc(guideCollection(uid))
    idMap.set(node.id, ref.id)
    batch.set(ref, {
      kind: 'system',
      parentId: '',
      name: node.name,
      icon: node.icon,
      color: node.color,
      description: node.description,
      steps: [],
      order: node.order,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }
  for (const node of nodes.filter((n) => n.kind === 'protocol')) {
    const parentId = idMap.get(node.parentId)
    if (!parentId) continue
    const ref = doc(guideCollection(uid))
    batch.set(ref, {
      kind: 'protocol',
      parentId,
      name: node.name,
      icon: node.icon,
      color: '',
      description: node.description,
      steps: node.steps,
      order: node.order,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }
  await batch.commit()
  return nodes.length
}
