import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDocs,
  onSnapshot,
  serverTimestamp,
  updateDoc,
  writeBatch,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/lib/firestore'
import {
  ORDER_STEP,
  sanitizeCase,
  sanitizeList,
  type CaseList,
  type OrganizerCase,
  type Stage,
} from './types'

/**
 * Diferente das outras ferramentas, que guardam o caso em andamento no
 * navegador: aqui o dado e acumulado ao longo de semanas e consultado do
 * celular e do desktop, entao mora no Firestore sob o proprio usuario.
 */
const listsCollection = (uid: string) => collection(db, 'users', uid, 'caseLists')
const listDocument = (uid: string, listId: string) => doc(db, 'users', uid, 'caseLists', listId)
const casesCollection = (uid: string, listId: string) => collection(listDocument(uid, listId), 'cases')
const caseDocument = (uid: string, listId: string, caseId: string) =>
  doc(casesCollection(uid, listId), caseId)

/** Firestore limita um lote a 500 escritas. */
const BATCH_LIMIT = 450

function chunk<T>(items: T[], size: number): T[][] {
  const out: T[][] = []
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size))
  return out
}

export function subscribeToLists(
  uid: string,
  onChange: (lists: CaseList[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    listsCollection(uid),
    (snapshot) => {
      const lists = snapshot.docs
        .map((entry) => sanitizeList(entry.id, entry.data() as DocumentData))
        .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
      onChange(lists)
    },
    onError,
  )
}

export function subscribeToCases(
  uid: string,
  listId: string,
  onChange: (cases: OrganizerCase[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    casesCollection(uid, listId),
    (snapshot) => {
      onChange(snapshot.docs.map((entry) => sanitizeCase(entry.id, entry.data() as DocumentData)))
    },
    onError,
  )
}

export async function createList(
  uid: string,
  input: { name: string; stages: Stage[]; identifierLabel: string; order: number },
): Promise<string> {
  const created = await addDoc(listsCollection(uid), {
    ...input,
    showReviewCheck: false,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return created.id
}

export async function updateList(
  uid: string,
  listId: string,
  changes: Partial<Pick<CaseList, 'name' | 'stages' | 'identifierLabel' | 'showReviewCheck' | 'order'>>,
): Promise<void> {
  await updateDoc(listDocument(uid, listId), { ...changes, updatedAt: serverTimestamp() })
}

/**
 * Apagar uma lista apaga os casos dela. A subcolecao nao some sozinha quando
 * o documento pai e removido, entao os filhos vao primeiro — se a operacao
 * falhar no meio, a lista continua la e o usuario pode tentar de novo.
 */
export async function deleteList(uid: string, listId: string): Promise<void> {
  const snapshot = await getDocs(casesCollection(uid, listId))
  for (const group of chunk(snapshot.docs, BATCH_LIMIT)) {
    const batch = writeBatch(db)
    group.forEach((entry) => batch.delete(entry.ref))
    await batch.commit()
  }
  await deleteDoc(listDocument(uid, listId))
}

export async function createCase(
  uid: string,
  listId: string,
  input: {
    title: string
    identifier: string
    stageId: string
    tags: string[]
    deadline: number | null
    notes: string
    firstLog: string
    order: number
  },
): Promise<void> {
  const { firstLog, ...rest } = input
  await addDoc(casesCollection(uid, listId), {
    ...rest,
    log: firstLog ? [{ text: firstLog, ts: Date.now() }] : [],
    pending: null,
    archived: false,
    archivedAt: null,
    reviewed: false,
    reviewedAt: null,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
}

export async function updateCase(
  uid: string,
  listId: string,
  caseId: string,
  changes: Record<string, unknown>,
): Promise<void> {
  await updateDoc(caseDocument(uid, listId, caseId), { ...changes, updatedAt: serverTimestamp() })
}

export async function deleteCases(uid: string, listId: string, caseIds: string[]): Promise<void> {
  for (const group of chunk(caseIds, BATCH_LIMIT)) {
    const batch = writeBatch(db)
    group.forEach((caseId) => batch.delete(caseDocument(uid, listId, caseId)))
    await batch.commit()
  }
}

/** Grava a nova ordem inteira: barato, e evita ordens empatadas ao longo do tempo. */
export async function reorderCases(uid: string, listId: string, orderedIds: string[]): Promise<void> {
  for (const [groupIndex, group] of chunk(orderedIds, BATCH_LIMIT).entries()) {
    const batch = writeBatch(db)
    group.forEach((caseId, index) => {
      const position = groupIndex * BATCH_LIMIT + index + 1
      batch.update(caseDocument(uid, listId, caseId), { order: position * ORDER_STEP })
    })
    await batch.commit()
  }
}

/**
 * Mover entre listas e copiar-e-apagar: as etapas sao de cada lista, entao o
 * caso precisa de uma etapa de chegada escolhida na hora. Log, notas e tags
 * seguem junto — e o que torna a operacao melhor do que recadastrar.
 */
export async function moveCaseToList(
  uid: string,
  fromListId: string,
  item: OrganizerCase,
  toListId: string,
  stageId: string,
  order: number,
): Promise<void> {
  const batch = writeBatch(db)
  const target = doc(casesCollection(uid, toListId))
  batch.set(target, {
    title: item.title,
    identifier: item.identifier,
    stageId,
    tags: item.tags,
    deadline: item.deadline,
    archived: item.archived,
    archivedAt: item.archivedAt,
    pending: item.pending,
    log: item.log,
    notes: item.notes,
    order,
    reviewed: false,
    reviewedAt: null,
    createdAt: item.createdAt ?? serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  batch.delete(caseDocument(uid, fromListId, item.id))
  await batch.commit()
}
