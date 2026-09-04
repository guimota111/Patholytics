import { useCallback, useEffect, useMemo, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import type { BlockId, Params } from './blocks'
import {
  EMPTY_CASE,
  blockItem,
  computeBill,
  computeDiff,
  loadCase,
  loadRole,
  loadTemplates,
  pieceFromSpecimen,
  saveCase,
  saveRole,
  saveTemplates,
  type BillingCase,
  type CasePiece,
  type CaseStructure,
  type Role,
  type Templates,
} from './case'
import type { CodeKey } from './codes'
import type { Specimen } from './specimens'

/** Caso de cobrança, perfil e modelos próprios ficam no navegador, por usuário. */
export function useBillingCase() {
  const { user } = useAuth()
  const uid = user?.uid ?? null

  const [state, setState] = useState<BillingCase>(EMPTY_CASE)
  const [templates, setTemplates] = useState<Templates>({})
  const [role, setRoleState] = useState<Role | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setState(loadCase(uid))
    setTemplates(loadTemplates(uid))
    setRoleState(loadRole(uid))
    setHydrated(true)
  }, [uid])

  useEffect(() => {
    if (hydrated) saveCase(uid, state)
  }, [hydrated, uid, state])

  const setRole = useCallback(
    (next: Role | null) => {
      setRoleState(next)
      saveRole(uid, next)
    },
    [uid],
  )

  const addPiece = useCallback(
    (specimen: Specimen) => {
      setState((s) => ({ ...s, pieces: [...s.pieces, pieceFromSpecimen(specimen, templates[specimen.id])] }))
    },
    [templates],
  )

  const updatePiece = useCallback((pieceUid: string, patch: Partial<CasePiece>) => {
    setState((s) => ({ ...s, pieces: s.pieces.map((p) => (p.uid === pieceUid ? { ...p, ...patch } : p)) }))
  }, [])

  const toggleStructure = useCallback((pieceUid: string, structureId: string) => {
    setState((s) => ({
      ...s,
      pieces: s.pieces.map((p) =>
        p.uid === pieceUid
          ? { ...p, structures: p.structures.map((st) => (st.id === structureId ? { ...st, on: !st.on } : st)) }
          : p,
      ),
    }))
  }, [])

  const setStructureNodes = useCallback((pieceUid: string, structureId: string, nodes: number) => {
    setState((s) => ({
      ...s,
      pieces: s.pieces.map((p) =>
        p.uid === pieceUid
          ? { ...p, structures: p.structures.map((st) => (st.id === structureId ? { ...st, nodes: Math.max(1, nodes) } : st)) }
          : p,
      ),
    }))
  }, [])

  const addStructure = useCallback((pieceUid: string, structure: CaseStructure) => {
    setState((s) => ({
      ...s,
      pieces: s.pieces.map((p) => (p.uid === pieceUid ? { ...p, structures: [...p.structures, structure] } : p)),
    }))
  }, [])

  const removeStructure = useCallback((pieceUid: string, structureId: string) => {
    setState((s) => ({
      ...s,
      pieces: s.pieces.map((p) =>
        p.uid === pieceUid ? { ...p, structures: p.structures.filter((st) => st.id !== structureId) } : p,
      ),
    }))
  }, [])

  const removePiece = useCallback((pieceUid: string) => {
    setState((s) => ({ ...s, pieces: s.pieces.filter((p) => p.uid !== pieceUid) }))
  }, [])

  const addBlock = useCallback((blockId: BlockId, params?: Params) => {
    setState((s) => ({ ...s, blocks: [...s.blocks, blockItem(blockId, params)] }))
  }, [])

  const setBlockParams = useCallback((blockUid: string, params: Params) => {
    setState((s) => ({ ...s, blocks: s.blocks.map((b) => (b.uid === blockUid ? { ...b, params } : b)) }))
  }, [])

  const removeBlock = useCallback((blockUid: string) => {
    setState((s) => ({ ...s, blocks: s.blocks.filter((b) => b.uid !== blockUid) }))
  }, [])

  const setBilled = useCallback((code: CodeKey, qty: number) => {
    setState((s) => {
      const billed = { ...s.billed }
      if (qty <= 0) delete billed[code]
      else billed[code] = qty
      return { ...s, billed }
    })
  }, [])

  const clearCase = useCallback(() => setState(EMPTY_CASE), [])

  const saveTemplate = useCallback(
    (specimenId: string, structures: CaseStructure[]) => {
      setTemplates((prev) => {
        const next = { ...prev, [specimenId]: structures.map((st) => ({ ...st })) }
        saveTemplates(uid, next)
        return next
      })
    },
    [uid],
  )

  const deleteTemplate = useCallback(
    (specimenId: string) => {
      setTemplates((prev) => {
        const next = { ...prev }
        delete next[specimenId]
        saveTemplates(uid, next)
        return next
      })
    },
    [uid],
  )

  const bill = useMemo(() => computeBill(state), [state])
  const diff = useMemo(() => computeDiff(bill, state.billed), [bill, state.billed])

  return {
    state,
    bill,
    diff,
    hydrated,
    role,
    setRole,
    templates,
    addPiece,
    updatePiece,
    toggleStructure,
    setStructureNodes,
    addStructure,
    removeStructure,
    removePiece,
    addBlock,
    setBlockParams,
    removeBlock,
    setBilled,
    clearCase,
    saveTemplate,
    deleteTemplate,
  }
}
