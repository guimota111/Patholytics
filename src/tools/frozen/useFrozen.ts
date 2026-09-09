import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { loadCongDoc, loadMohsDoc, loadSuggestions, rememberSuggestion, saveCongDoc, saveMohsDoc, type SuggestionKey } from './storage'
import type { CongDoc, Cron, MohsDoc } from './types'

const isRunning = (cron: Cron) => Boolean(cron.inicio) && !cron.formol

/**
 * Os dois documentos em curso (congelação e Mohs), gravados no navegador a
 * cada mudança, e um relógio que só anda enquanto algum cronômetro de
 * isquemia fria estiver correndo.
 */
export function useFrozen() {
  const { user } = useAuth()
  const uid = user?.uid ?? null

  const [cong, setCong] = useState<CongDoc>(() => loadCongDoc(uid))
  const [mohs, setMohs] = useState<MohsDoc>(() => loadMohsDoc(uid))
  const [hydrated, setHydrated] = useState(false)
  const [suggestionVersion, setSuggestionVersion] = useState(0)
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    setCong(loadCongDoc(uid))
    setMohs(loadMohsDoc(uid))
    setHydrated(true)
  }, [uid])

  useEffect(() => {
    if (hydrated) saveCongDoc(uid, cong)
  }, [hydrated, uid, cong])

  useEffect(() => {
    if (hydrated) saveMohsDoc(uid, mohs)
  }, [hydrated, uid, mohs])

  const running = isRunning(cong.isquemiaCron) || isRunning(mohs.pecaPrincipal.cron) || mohs.ampliacoes.some((a) => isRunning(a.cron))

  useEffect(() => {
    if (!running) return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [running])

  const suggestions = useCallback(
    (key: SuggestionKey) => loadSuggestions(uid, key),
    // A versão entra só para a lista ser relida depois de gravar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [uid, suggestionVersion],
  )

  const remember = useCallback(
    (key: SuggestionKey, value: string) => {
      rememberSuggestion(uid, key, value)
      setSuggestionVersion((v) => v + 1)
    },
    [uid],
  )

  return { uid, hydrated, cong, setCong, mohs, setMohs, now, suggestions, remember }
}

export type Frozen = ReturnType<typeof useFrozen>
