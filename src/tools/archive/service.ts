import {
  addDoc,
  collection,
  doc,
  increment,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  writeBatch,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/lib/firestore'
import {
  ROOT_REPORTS,
  sanitizeNode,
  type ArchiveExport,
  type ArchiveNode,
  type NodeType,
} from './types'

/**
 * O arquivo de laudos é acumulado por anos e consultado de qualquer estação:
 * mora no Firestore, sob o próprio usuário (`users/{uid}/archive`). O acervo
 * de um patologista é pequeno o bastante para uma única assinatura da coleção.
 */
const archiveCollection = (uid: string) => collection(db, 'users', uid, 'archive')
const nodeDocument = (uid: string, id: string) => doc(db, 'users', uid, 'archive', id)

/** Firestore limita um lote a 500 escritas. */
const BATCH_LIMIT = 450

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

export function subscribeToArchive(
  uid: string,
  onChange: (nodes: ArchiveNode[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    archiveCollection(uid),
    (snapshot) => onChange(snapshot.docs.map((d) => sanitizeNode(d.id, d.data() as DocumentData))),
    onError,
  )
}

export async function createNode(
  uid: string,
  input: { parentId: string; type: NodeType; label: string; content?: string; icon?: string; tags?: string[] },
): Promise<string> {
  const created = await addDoc(archiveCollection(uid), {
    parentId: input.parentId,
    type: input.type,
    label: input.label.trim(),
    content: input.content ?? '',
    icon: input.icon ?? '',
    tags: input.tags ?? [],
    copyCount: 0,
    favorite: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return created.id
}

export async function updateNode(
  uid: string,
  id: string,
  changes: Partial<Pick<ArchiveNode, 'label' | 'content' | 'icon' | 'tags' | 'parentId' | 'favorite'>>,
): Promise<void> {
  await updateDoc(nodeDocument(uid, id), { ...changes, updatedAt: serverTimestamp() })
}

/** Contador atômico de cópias — a ordenação premia as máscaras mais usadas. */
export async function incrementCopyCount(uid: string, id: string): Promise<void> {
  await updateDoc(nodeDocument(uid, id), { copyCount: increment(1) })
}

/** Apaga um nó e os descendentes já resolvidos no cliente (a árvore está em memória). */
export async function deleteNodes(uid: string, ids: string[]): Promise<void> {
  for (const group of chunk(ids, BATCH_LIMIT)) {
    const batch = writeBatch(db)
    group.forEach((id) => batch.delete(nodeDocument(uid, id)))
    await batch.commit()
  }
}

/** Categorias iniciais, criadas só quando o arquivo está vazio. */
export async function seedCategories(uid: string, labels: string[]): Promise<void> {
  const batch = writeBatch(db)
  for (const label of labels) {
    batch.set(doc(archiveCollection(uid)), {
      parentId: ROOT_REPORTS,
      type: 'category',
      label,
      content: '',
      icon: '',
      tags: [],
      copyCount: 0,
      favorite: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  }
  await batch.commit()
}

/**
 * Importa nós de um arquivo exportado, gerando ids novos e preservando a
 * hierarquia. Nós cujo pai não está no arquivo (nem é raiz) vão para LAUDOS.
 */
export async function importNodes(uid: string, nodes: ArchiveExport['nodes']): Promise<number> {
  const idMap = new Map<string, string>()
  for (const n of nodes) idMap.set(n.id, doc(archiveCollection(uid)).id)
  const known = new Set(['root_reports', 'root_notes', 'root', 'root_notas'])
  const remapParent = (parentId: string) => {
    if (parentId === 'root') return 'root_reports'
    if (parentId === 'root_notas') return 'root_notes'
    if (known.has(parentId)) return parentId
    return idMap.get(parentId) ?? ROOT_REPORTS
  }
  for (const group of chunk(nodes, BATCH_LIMIT)) {
    const batch = writeBatch(db)
    for (const n of group) {
      batch.set(nodeDocument(uid, idMap.get(n.id)!), {
        parentId: remapParent(n.parentId),
        type: n.type,
        label: n.label,
        content: n.content,
        icon: n.icon,
        tags: n.tags,
        copyCount: n.copyCount,
        favorite: n.favorite,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      })
    }
    await batch.commit()
  }
  return nodes.length
}
