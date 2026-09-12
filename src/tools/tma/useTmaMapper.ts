import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { clearState, loadState, saveState } from './storage'
import {
  answeredCount,
  buildOrder,
  clampDimension,
  keyOf,
  sanitizeFields,
  type CoreAnswers,
  type TmaField,
  type TmaState,
} from './types'

/**
 * Estado do mapa de TMA.
 *
 * Diferença deliberada em relação ao script de origem: lá o texto do core só
 * era gravado ao navegar (Próximo / Anterior / clique no mapa), então fechar a
 * aba no meio de um core perdia o que estava digitado. Aqui cada tecla já grava
 * — o texto copiado no fim é idêntico, e nada se perde.
 */
export function useTmaMapper() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const uid = user?.uid ?? null
  const defaultLabel = t('tma.defaultField')

  const [state, setState] = useState<TmaState | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // Recarrega ao trocar de usuário — o mapa é por conta.
  useEffect(() => {
    setState(loadState(uid, defaultLabel))
    setHydrated(true)
  }, [uid, defaultLabel])

  useEffect(() => {
    if (!hydrated || !state) return
    saveState(uid, state)
  }, [hydrated, uid, state])

  const order = useMemo(() => (state ? buildOrder(state.rows, state.cols) : []), [state])

  const start = useCallback(
    (rows: number, cols: number, fields: TmaField[]) => {
      setState({
        rows: clampDimension(rows),
        cols: clampDimension(cols),
        fields: sanitizeFields(fields, defaultLabel),
        results: {},
        current: 0,
      })
    },
    [defaultLabel],
  )

  const reset = useCallback(() => {
    clearState(uid)
    setState(null)
  }, [uid])

  /** Troca os campos de um mapa em andamento; respostas de campos removidos são descartadas. */
  const setFields = useCallback(
    (fields: TmaField[]) => {
      setState((current) => {
        if (!current) return current
        const next = sanitizeFields(fields, defaultLabel)
        const keep = new Set(next.map((field) => field.id))
        const results: Record<string, CoreAnswers> = {}
        for (const [key, answers] of Object.entries(current.results)) {
          const kept: CoreAnswers = {}
          for (const [fieldId, value] of Object.entries(answers)) {
            if (keep.has(fieldId) && value.trim()) kept[fieldId] = value
          }
          if (Object.keys(kept).length > 0) results[key] = kept
        }
        return { ...current, fields: next, results }
      })
    },
    [defaultLabel],
  )

  const setAnswer = useCallback((fieldId: string, value: string) => {
    setState((current) => {
      if (!current) return current
      const [r, c] = buildOrder(current.rows, current.cols)[current.current]
      const key = keyOf(r, c)
      const answers: CoreAnswers = { ...(current.results[key] ?? {}) }
      if (value.trim()) answers[fieldId] = value
      else delete answers[fieldId]
      const results = { ...current.results }
      if (Object.keys(answers).length > 0) results[key] = answers
      else delete results[key]
      return { ...current, results }
    })
  }, [])

  const goTo = useCallback((index: number) => {
    setState((current) => {
      if (!current) return current
      const total = current.rows * current.cols
      if (index < 0 || index >= total) return current
      return { ...current, current: index }
    })
  }, [])

  const next = useCallback(() => {
    setState((current) => {
      if (!current) return current
      const total = current.rows * current.cols
      if (current.current >= total - 1) return current
      return { ...current, current: current.current + 1 }
    })
  }, [])

  const previous = useCallback(() => {
    setState((current) => {
      if (!current || current.current <= 0) return current
      return { ...current, current: current.current - 1 }
    })
  }, [])

  /** Cores com pelo menos um campo respondido. */
  const filledCount = useMemo(() => {
    if (!state) return 0
    return Object.values(state.results).filter((answers) => answeredCount(answers, state.fields) > 0).length
  }, [state])

  const total = state ? state.rows * state.cols : 0
  const atLast = state ? state.current >= total - 1 : false
  const currentCore = state ? order[state.current] : null
  const currentAnswers: CoreAnswers =
    state && currentCore ? (state.results[keyOf(currentCore[0], currentCore[1])] ?? {}) : {}

  return {
    hydrated,
    state,
    order,
    total,
    atLast,
    currentCore,
    currentAnswers,
    filledCount,
    start,
    reset,
    setFields,
    setAnswer,
    goTo,
    next,
    previous,
  }
}
