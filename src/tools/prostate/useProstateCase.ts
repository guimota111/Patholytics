import { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAuth } from '@/hooks/useAuth'
import { defaultTemplate, loadReports, newReportId, saveReports } from './report'
import { DEFAULT_CASE, loadCase, loadTemplates, saveCase, saveTemplates } from './storage'
import {
  DEFAULT_REPORT_ID,
  EMPTY_CELL,
  type CaseGlobals,
  type CaseState,
  type CellData,
  type MappingConfig,
  type MappingTemplate,
  type ReportStore,
} from './types'

/** Caso de prostatectomia em andamento, modelos de mapeamento e modelos de laudo, no navegador, por usuário. */
export function useProstateCase() {
  const { t } = useTranslation()
  const { user } = useAuth()
  const uid = user?.uid ?? null

  const [state, setState] = useState<CaseState>(DEFAULT_CASE)
  const [templates, setTemplates] = useState<MappingTemplate[]>([])
  const [reports, setReports] = useState<ReportStore>({ templates: [], selectedId: DEFAULT_REPORT_ID })
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setState(loadCase(uid))
    setTemplates(loadTemplates(uid))
    setReports(loadReports(uid, t))
    setHydrated(true)
  }, [uid, t])

  useEffect(() => {
    if (hydrated) saveCase(uid, state)
  }, [hydrated, uid, state])

  useEffect(() => {
    if (hydrated) saveTemplates(uid, templates)
  }, [hydrated, uid, templates])

  useEffect(() => {
    if (hydrated) saveReports(uid, reports)
  }, [hydrated, uid, reports])

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

  /* ---------------------------------------------------- modelos de laudo */

  const selectReport = useCallback((id: string) => {
    setReports((r) => (r.templates.some((x) => x.id === id) ? { ...r, selectedId: id } : r))
  }, [])

  const setReportText = useCallback((id: string, text: string) => {
    setReports((r) => ({ ...r, templates: r.templates.map((x) => (x.id === id ? { ...x, text } : x)) }))
  }, [])

  const renameReport = useCallback((id: string, name: string) => {
    setReports((r) => ({ ...r, templates: r.templates.map((x) => (x.id === id ? { ...x, name } : x)) }))
  }, [])

  /** Novo modelo a partir do texto atual (ou vazio), já selecionado. */
  const addReport = useCallback((name: string, text: string) => {
    const id = newReportId()
    setReports((r) => ({ templates: [...r.templates, { id, name, text }], selectedId: id }))
    return id
  }, [])

  const deleteReport = useCallback((id: string) => {
    if (id === DEFAULT_REPORT_ID) return
    setReports((r) => {
      const templates = r.templates.filter((x) => x.id !== id)
      return { templates, selectedId: r.selectedId === id ? DEFAULT_REPORT_ID : r.selectedId }
    })
  }, [])

  const resetDefaultReport = useCallback(() => {
    const fresh = defaultTemplate(t)
    setReports((r) => ({ ...r, templates: r.templates.map((x) => (x.id === DEFAULT_REPORT_ID ? fresh : x)) }))
  }, [t])

  return {
    state,
    hydrated,
    setMapping,
    setCell,
    setGlobals,
    clearFindings,
    templates,
    saveTemplate,
    deleteTemplate,
    reports,
    selectReport,
    setReportText,
    renameReport,
    addReport,
    deleteReport,
    resetDefaultReport,
  }
}
