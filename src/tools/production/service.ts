/* ==========================================================================
   service.ts — a sessão em curso e o histórico moram no Firestore, sob o
   usuário: a sessão começa no desktop, o caso é registrado do celular na
   bancada, e o histórico acumula por meses.

   users/{uid}/production/current          → CurrentSession
   users/{uid}/productionHistory/{date}    → HistoryDay
   ========================================================================== */

import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  onSnapshot,
  setDoc,
  type DocumentData,
  type Unsubscribe,
} from 'firebase/firestore'
import { db } from '@/lib/firestore'
import {
  sanitizeDay,
  sanitizeSession,
  type CurrentSession,
  type HistoryDay,
  type HistorySession,
} from './types'

const currentDocument = (uid: string) => doc(db, 'users', uid, 'production', 'current')
const historyCollection = (uid: string) => collection(db, 'users', uid, 'productionHistory')
const dayDocument = (uid: string, date: string) => doc(db, 'users', uid, 'productionHistory', date)

export function subscribeToCurrent(
  uid: string,
  onChange: (session: CurrentSession | null) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    currentDocument(uid),
    (snapshot) => onChange(snapshot.exists() ? sanitizeSession(snapshot.data() as DocumentData) : null),
    onError,
  )
}

export function subscribeToHistory(
  uid: string,
  onChange: (days: HistoryDay[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    historyCollection(uid),
    (snapshot) =>
      onChange(
        snapshot.docs
          .map((entry) => sanitizeDay(entry.id, entry.data() as DocumentData))
          .sort((a, b) => a.date.localeCompare(b.date)),
      ),
    onError,
  )
}

export async function saveCurrent(uid: string, session: CurrentSession): Promise<void> {
  await setDoc(currentDocument(uid), session)
}

/**
 * Acrescenta uma sessão encerrada ao dia. Lê o documento antes porque o mesmo
 * dia pode já ter a sessão da manhã — e o formato antigo (sem `sessions[]`)
 * é migrado de passagem.
 */
export async function appendHistorySession(uid: string, date: string, session: HistorySession): Promise<void> {
  const ref = dayDocument(uid, date)
  const existing = await getDoc(ref)
  const sessions = existing.exists() ? sanitizeDay(date, existing.data() as DocumentData).sessions : []
  await setDoc(ref, { date, sessions: [...sessions, session] })
}

export async function replaceHistoryDay(uid: string, day: HistoryDay): Promise<void> {
  if (day.sessions.length === 0) {
    await deleteDoc(dayDocument(uid, day.date))
    return
  }
  await setDoc(dayDocument(uid, day.date), day)
}

export async function deleteHistoryDay(uid: string, date: string): Promise<void> {
  await deleteDoc(dayDocument(uid, date))
}
