import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { dataCurta } from './text'
import { saveModelos, subscribeToModelos } from './service'
import type { CongDoc, Modelo } from './types'

/** Modelos salvos do usuário, em tempo real. */
export function useModelos() {
  const { user } = useAuth()
  const uid = user?.uid ?? null

  const [items, setItems] = useState<Modelo[] | null>(null)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    if (!uid) return
    setItems(null)
    setError(null)
    return subscribeToModelos(uid, setItems, (e) => setError(e))
  }, [uid])

  const add = useCallback(
    async (doc: CongDoc) => {
      // Nunca sobrescrever a lista sem tê-la carregado — apagaria os anteriores.
      if (!uid || items === null) throw new Error('modelos-not-loaded')
      const now = new Date()
      const modelo: Modelo = {
        id: Date.now(),
        dateStr: dataCurta(now).slice(0, 5),
        pecas: structuredClone(doc.pecas),
        informesClinicosVisible: doc.informesClinicosVisible,
        informesClinicos: doc.informesClinicos,
        patologista: doc.patologista,
      }
      await saveModelos(uid, [modelo, ...items])
    },
    [uid, items],
  )

  const remove = useCallback(
    async (id: number) => {
      if (!uid || items === null) return
      await saveModelos(uid, items.filter((m) => m.id !== id))
    },
    [uid, items],
  )

  return { items, error, add, remove }
}
