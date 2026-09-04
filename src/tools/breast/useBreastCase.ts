import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import {
  DEFAULT_MACRO,
  DEFAULT_MICRO,
  DEFAULT_MICRO_GLOBALS,
  DEFAULT_NODES,
  EMPTY_OVERRIDES,
  loadInkDefaults,
  loadMacro,
  loadMicro,
  saveInkDefaults as persistInkDefaults,
  saveMacro,
  saveMicro,
  sanitizeMacro,
} from './storage'
import {
  EMPTY_MICRO_CELL,
  type InkColor,
  type MacroState,
  type Margin,
  type MicroCell,
  type MicroGlobals,
  type MicroState,
  type NodesState,
  type RcbOverrides,
} from './types'

type Patch<T> = Partial<T> | ((s: T) => T)
const apply = <T,>(s: T, patch: Patch<T>): T => (typeof patch === 'function' ? (patch as (s: T) => T)(s) : { ...s, ...patch })

/** Caso da macroscopia, caso da laudagem e tintas padrão do laboratório, no navegador, por usuário. */
export function useBreastCase() {
  const { user } = useAuth()
  const uid = user?.uid ?? null

  const [macro, setMacroState] = useState<MacroState>(DEFAULT_MACRO)
  const [micro, setMicroState] = useState<MicroState>(DEFAULT_MICRO)
  const [inkDefaults, setInkDefaults] = useState<Record<Margin, InkColor> | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const inks = loadInkDefaults(uid)
    const loadedMacro = loadMacro(uid)
    setInkDefaults(inks)
    setMacroState(loadedMacro)
    setMicroState(loadMicro(uid))
    setHydrated(true)
  }, [uid])

  useEffect(() => {
    if (hydrated) saveMacro(uid, macro)
  }, [hydrated, uid, macro])

  useEffect(() => {
    if (hydrated) saveMicro(uid, micro)
  }, [hydrated, uid, micro])

  const setMacro = useCallback((patch: Patch<MacroState>) => setMacroState((s) => apply(s, patch)), [])
  const setMicro = useCallback((patch: Patch<MicroState>) => setMicroState((s) => apply(s, patch)), [])
  const setMicroMap = useCallback((patch: Patch<MacroState>) => setMicroState((s) => ({ ...s, map: apply(s.map, patch) })), [])

  const setCell = useCallback((id: string, patch: Partial<MicroCell>) => {
    setMicroState((s) => ({ ...s, cells: { ...s.cells, [id]: { ...EMPTY_MICRO_CELL, ...s.cells[id], ...patch } } }))
  }, [])
  const setNodes = useCallback((patch: Partial<NodesState>) => setMicroState((s) => ({ ...s, nodes: { ...s.nodes, ...patch } })), [])
  const setGlobals = useCallback((patch: Partial<MicroGlobals>) => setMicroState((s) => ({ ...s, globals: { ...s.globals, ...patch } })), [])
  const setOverrides = useCallback((patch: Partial<RcbOverrides>) => setMicroState((s) => ({ ...s, overrides: { ...s.overrides, ...patch } })), [])

  /** Nova peça na macro: volta ao inicial, mantendo as tintas padrão do laboratório. */
  const resetMacro = useCallback(() => {
    setMacroState({ ...sanitizeMacro(DEFAULT_MACRO), inks: inkDefaults ?? DEFAULT_MACRO.inks })
  }, [inkDefaults])

  /** Limpa os achados da laudagem, mantendo o mapa. */
  const clearMicroFindings = useCallback(() => {
    setMicroState((s) => ({ ...s, cells: {}, overrides: EMPTY_OVERRIDES, nodes: DEFAULT_NODES, globals: DEFAULT_MICRO_GLOBALS }))
  }, [])

  /** Substitui o mapa da laudagem (importado da macro deste navegador ou de um código). */
  const replaceMicroMap = useCallback((map: MacroState) => {
    setMicroState((s) => ({ ...s, map, cells: {}, rcbLesionId: null, overrides: EMPTY_OVERRIDES }))
  }, [])

  const importMacroIntoMicro = useCallback(() => replaceMicroMap(sanitizeMacro(macro)), [macro, replaceMicroMap])

  const saveInkDefaults = useCallback(
    (inks: Record<Margin, InkColor> | null) => {
      setInkDefaults(inks)
      persistInkDefaults(uid, inks)
    },
    [uid],
  )

  return {
    hydrated,
    macro,
    setMacro,
    resetMacro,
    micro,
    setMicro,
    setMicroMap,
    setCell,
    setNodes,
    setGlobals,
    setOverrides,
    clearMicroFindings,
    replaceMicroMap,
    importMacroIntoMicro,
    inkDefaults,
    saveInkDefaults,
  }
}
