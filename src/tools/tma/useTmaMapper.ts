import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { clearState, loadState, saveState } from './storage'
import { buildOrder, clampDimension, keyOf, type TmaState } from './types'

/**
 * Estado do mapa de TMA.
 *
 * Diferenca deliberada em relacao ao script de origem: la o texto do core so
 * era gravado ao navegar (Proximo / Anterior / clique no mapa), entao fechar a
 * aba no meio de um core perdia o que estava digitado. Aqui cada tecla ja grava
 * — o texto copiado no fim e identico, e nada se perde.
 */
export function useTmaMapper() {
  const { user } = useAuth()
  const uid = user?.uid ?? null

  const [state, setState] = useState<TmaState | null>(null)
  const [hydrated, setHydrated] = useState(false)

  // Recarrega ao trocar de usuario — o mapa e por conta.
  useEffect(() => {
    setState(loadState(uid))
    setHydrated(true)
  }, [uid])

  useEffect(() => {
    if (!hydrated || !state) return
    saveState(uid, state)
  }, [hydrated, uid, state])

  const order = useMemo(
    () => (state ? buildOrder(state.rows, state.cols) : []),
    [state],
  )

  const start = useCallback((rows: number, cols: number) => {
    setState({
      rows: clampDimension(rows),
      cols: clampDimension(cols),
      results: {},
      current: 0,
    })
  }, [])

  const reset = useCallback(() => {
    clearState(uid)
    setState(null)
  }, [uid])

  const setResult = useCallback((value: string) => {
    setState((current) => {
      if (!current) return current
      const [r, c] = buildOrder(current.rows, current.cols)[current.current]
      const key = keyOf(r, c)
      const results = { ...current.results }
      if (value.trim()) results[key] = value
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

  const filledCount = useMemo(() => {
    if (!state) return 0
    return Object.values(state.results).filter((value) => value.trim()).length
  }, [state])

  /**
   * Resultados empilhados, um por linha, na ordem do mapa. Cores vazios viram
   * linha em branco para que cada linha continue casando com sua posicao ao
   * colar numa coluna de planilha.
   */
  const resultsText = useMemo(
    () => order.map(([r, c]) => (state?.results[keyOf(r, c)] ?? '').trim()).join('\n'),
    [order, state],
  )

  const total = state ? state.rows * state.cols : 0
  const atLast = state ? state.current >= total - 1 : false
  const currentCore = state ? order[state.current] : null
  const currentValue =
    state && currentCore ? (state.results[keyOf(currentCore[0], currentCore[1])] ?? '') : ''

  return {
    hydrated,
    state,
    order,
    total,
    atLast,
    currentCore,
    currentValue,
    filledCount,
    resultsText,
    start,
    reset,
    setResult,
    goTo,
    next,
    previous,
  }
}
