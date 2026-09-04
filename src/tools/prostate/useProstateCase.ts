import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { DEFAULT_CASE, loadCase, loadTemplates, saveCase, saveTemplates } from './storage'
import {
  EMPTY_CELL,
  type CaseGlobals,
  type CaseState,
  type CellData,
  type MappingConfig,
  type MappingTemplate,
} from './types'

/** Caso de prostatectomia em andamento + modelos de mapeamento, no navegador, por usuário. */
export function useProstateCase() {
  const { user } = useAuth()
  const uid = user?.uid ?? null

  const [state, setState] = useState<CaseState>(DEFAULT_CASE)
  const [templates, setTemplates] = useState<MappingTemplate[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setState(loadCase(uid))
    setTemplates(loadTemplates(uid))
    setHydrated(true)
  }, [uid])

  useEffect(() => {
    if (hydrated) saveCase(uid, state)
  }, [hydrated, uid, state])

  useEffect(() => {
    if (hydrated) saveTemplates(uid, templates)
  }, [hydrated, uid, templates])

  const setMapping = useCallback(
    (patch: Partial<MappingConfig> | ((mapping: MappingConfig) => MappingConfig)) => {
      setState((s) => ({
        ...s,
        mapping: typeof patch === 'function' ? patch(s.mapping) : { ...s.mapping, ...patch },
      }))
    },
    [],
  )

  const setCell = useCallback((id: string, patch: Partial<CellData>) => {
    setState((s) => ({ ...s, cells: { ...s.cells, [id]: { ...EMPTY_CELL, ...s.cells[id], ...patch } } }))
  }, [])

  const setGlobals = useCallback((patch: Partial<CaseGlobals>) => {
    setState((s) => ({ ...s, globals: { ...s.globals, ...patch } }))
  }, [])

  /** Limpa os achados, mantendo o mapeamento e as opções de modo. */
  const clearFindings = useCallback(() => {
    setState((s) => ({
      ...s,
      cells: {},
      globals: {
        ...DEFAULT_CASE.globals,
        g45Mode: s.globals.g45Mode,
        cribMode: s.globals.cribMode,
        idcMode: s.globals.idcMode,
      },
    }))
  }, [])

  const saveTemplate = useCallback((name: string, mapping: MappingConfig) => {
    setTemplates((list) => [...list.filter((t) => t.name !== name), { name, mapping }])
  }, [])

  const deleteTemplate = useCallback((name: string) => {
    setTemplates((list) => list.filter((t) => t.name !== name))
  }, [])

  return { state, hydrated, setMapping, setCell, setGlobals, clearFindings, templates, saveTemplate, deleteTemplate }
}
