/* ==========================================================================
   service.ts — os modelos salvos moram no Firestore, um documento só com a
   lista, sob o usuário: users/{uid}/frozen/modelos → { items: Modelo[] }.
   Mesmo formato do Just Cong, para o que já foi salvo lá entrar aqui.
   ========================================================================== */

import { doc, onSnapshot, setDoc, type DocumentData, type Unsubscribe } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import { sanitizeModelo, type Modelo } from './types'

const modelosDocument = (uid: string) => doc(db, 'users', uid, 'frozen', 'modelos')

export function subscribeToModelos(
  uid: string,
  onChange: (items: Modelo[]) => void,
  onError: (error: Error) => void,
): Unsubscribe {
  return onSnapshot(
    modelosDocument(uid),
    (snapshot) => {
      const data = snapshot.exists() ? (snapshot.data() as DocumentData) : {}
      const items = Array.isArray(data.items) ? data.items.map(sanitizeModelo).filter((m): m is Modelo => m !== null) : []
      onChange(items)
    },
    onError,
  )
}

export async function saveModelos(uid: string, items: Modelo[]): Promise<void> {
  await setDoc(modelosDocument(uid), { items })
}
