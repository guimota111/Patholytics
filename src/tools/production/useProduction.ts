import { useCallback, useEffect, useRef, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  appendHistorySession,
  deleteHistoryDay,
  replaceHistoryDay,
  saveCurrent,
  subscribeToCurrent,
  subscribeToHistory,
} from './service'
import { caseDurationBetween } from './stats'
import {
  emptySession,
  todayKey,
  toHistorySession,
  type CaseEntry,
  type CurrentSession,
  type HistoryDay,
} from './types'

const iso = () => new Date().toISOString()

/**
 * A sessão do dia e o histórico, em tempo real. Toda ação grava a sessão
 * inteira — é um documento pequeno, e assim o celular e o desktop veem o
 * mesmo relógio.
 */
export function useProduction() {
  const { user } = useAuth()
  const uid = user?.uid ?? null

  const [session, setSession] = useState<CurrentSession | null>(null)
  const [history, setHistory] = useState<HistoryDay[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)
  const [now, setNow] = useState(() => Date.now())
  const rolledOver = useRef(false)

  useEffect(() => {
    if (!uid) return
    setLoading(true)
    setError(null)
    rolledOver.current = false
    const stopCurrent = subscribeToCurrent(
      uid,
      (incoming) => {
        // Abriu num dia novo com a sessão de ontem ainda aberta: ela vai para
        // o histórico e o dia começa limpo — uma vez só por abertura.
        if (incoming && incoming.date !== todayKey() && !rolledOver.current) {
          rolledOver.current = true
          const archive =
            incoming.workStartTime && incoming.cases.length > 0
              ? appendHistorySession(uid, incoming.date, toHistorySession(incoming))
              : Promise.resolve()
          archive
            .then(() => saveCurrent(uid, emptySession()))
            .catch((e: Error) => setError(e))
          return
        }
        setSession(incoming ?? emptySession())
        setLoading(false)
      },
      (e) => {
        setError(e)
        setLoading(false)
      },
    )
    const stopHistory = subscribeToHistory(uid, setHistory, (e) => setError(e))
    return () => {
      stopCurrent()
      stopHistory()
    }
  }, [uid])

  // O relógio só anda enquanto há o que contar.
  const ticking = session?.state === 'working' || session?.state === 'paused'
  useEffect(() => {
    if (!ticking) return
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [ticking])

  const commit = useCallback(
    (next: CurrentSession) => {
      setSession(next)
      if (uid) saveCurrent(uid, next).catch((e: Error) => setError(e))
    },
    [uid],
  )

  const startWork = useCallback(() => {
    const t = iso()
    commit({ ...emptySession(), state: 'working', workStartTime: t, currentCaseStart: t })
  }, [commit])

  const registerCase = useCallback(
    (slides: number, options: { thirdParty?: boolean; frozen?: boolean } = {}) => {
      if (!session || !session.currentCaseStart) return
      const endTime = iso()
      const start = new Date(session.currentCaseStart).getTime()
      const entry: CaseEntry = {
        id: session.cases.length + 1,
        startTime: session.currentCaseStart,
        endTime,
        slides,
        duration: caseDurationBetween(session, start, new Date(endTime).getTime()),
      }
      if (options.thirdParty) entry.thirdParty = true
      if (options.frozen) entry.frozen = true
      commit({
        ...session,
        cases: [...session.cases, entry],
        currentCaseStart: endTime,
        frozenStart: options.frozen ? null : session.frozenStart,
      })
    },
    [session, commit],
  )

  const startFrozen = useCallback(() => session && commit({ ...session, frozenStart: iso() }), [session, commit])
  const stopFrozen = useCallback(() => session && commit({ ...session, frozenStart: null }), [session, commit])

  const pauseWork = useCallback(
    () => session && commit({ ...session, state: 'paused', currentPauseStart: iso() }),
    [session, commit],
  )

  const resumeWork = useCallback(() => {
    if (!session || !session.currentPauseStart) return
    commit({
      ...session,
      state: 'working',
      pauses: [...session.pauses, { start: session.currentPauseStart, end: iso() }],
      currentPauseStart: null,
    })
  }, [session, commit])

  const endSession = useCallback(async () => {
    if (!session || !uid) return
    const t = iso()
    const pauses = session.currentPauseStart
      ? [...session.pauses, { start: session.currentPauseStart, end: t }]
      : session.pauses
    const ended: CurrentSession = { ...session, state: 'ended', pauses, currentPauseStart: null, dayEndTime: t }
    commit(ended)
    if (ended.workStartTime && ended.cases.length > 0) {
      try {
        await appendHistorySession(uid, ended.date, toHistorySession(ended))
      } catch (e) {
        setError(e as Error)
      }
    }
  }, [session, uid, commit])

  const newSession = useCallback(() => commit(emptySession()), [commit])

  const deleteCase = useCallback(
    (caseId: number) => session && commit({ ...session, cases: session.cases.filter((c) => c.id !== caseId) }),
    [session, commit],
  )

  const removeHistoryDay = useCallback(
    (date: string) => (uid ? deleteHistoryDay(uid, date).catch((e: Error) => setError(e)) : undefined),
    [uid],
  )

  const removeHistorySession = useCallback(
    (day: HistoryDay, sessionIndex: number) => {
      if (!uid) return
      const sessions = day.sessions.filter((_, i) => i !== sessionIndex)
      replaceHistoryDay(uid, { ...day, sessions }).catch((e: Error) => setError(e))
    },
    [uid],
  )

  const removeHistoryCase = useCallback(
    (day: HistoryDay, sessionIndex: number, caseIndex: number) => {
      if (!uid) return
      const sessions = day.sessions
        .map((s, i) => (i === sessionIndex ? { ...s, cases: s.cases.filter((_, j) => j !== caseIndex) } : s))
        .filter((s) => s.cases.length > 0)
      replaceHistoryDay(uid, { ...day, sessions }).catch((e: Error) => setError(e))
    },
    [uid],
  )

  return {
    session,
    history,
    loading,
    error,
    now,
    startWork,
    registerCase,
    startFrozen,
    stopFrozen,
    pauseWork,
    resumeWork,
    endSession,
    newSession,
    deleteCase,
    removeHistoryDay,
    removeHistorySession,
    removeHistoryCase,
  }
}

export type Production = ReturnType<typeof useProduction>
