/* ==========================================================================
   case.ts — o caso em cima da bancada: as peças que o patologista laudou,
   os complementos e o que a recepção já faturou. Tudo somado num só lugar,
   com a diferença entre o que deve ser cobrado e o que está lançado.
   ========================================================================== */

import { ceilDiv, computeBlock, defaultParams as blockDefaults, type BlockId, type Params } from './blocks'
import { CODES, type CodeKey } from './codes'
import { BASES, SPECIMEN_BY_ID, type BaseKind, type Specimen, type StructureKind } from './specimens'

export interface CaseStructure {
  id: string
  label: string
  kind: StructureKind
  on: boolean
  /** Quantos linfonodos naquele grupo (só para kind 'nodes'). */
  nodes?: number
  /** Escrita pelo usuário, não veio do catálogo. */
  custom?: boolean
}

export interface CasePiece {
  uid: string
  specimenId: string
  label: string
  base: BaseKind
  flasks: number
  structures: CaseStructure[]
}

export interface CaseBlock {
  uid: string
  blockId: BlockId
  params: Params
}

export interface BillingCase {
  pieces: CasePiece[]
  blocks: CaseBlock[]
  /** O que a recepção já lançou, por código. */
  billed: Partial<Record<CodeKey, number>>
}

export const EMPTY_CASE: BillingCase = { pieces: [], blocks: [], billed: {} }

let seq = 0
const newUid = () => `i${Date.now().toString(36)}${(seq++).toString(36)}`

export function pieceFromSpecimen(sp: Specimen, saved?: CaseStructure[]): CasePiece {
  const structures: CaseStructure[] =
    saved ??
    (sp.structures ?? []).map((st) => ({ id: st.id, label: st.label, kind: st.kind, on: st.on, nodes: st.nodes }))
  return {
    uid: newUid(),
    specimenId: sp.id,
    label: sp.label,
    base: sp.base,
    flasks: sp.flasks ?? 1,
    structures: structures.map((st) => ({ ...st })),
  }
}

export function blockItem(blockId: BlockId, params?: Params): CaseBlock {
  return { uid: newUid(), blockId, params: { ...blockDefaults(blockId), ...(params ?? {}) } }
}

/* ------------------------------------------------------------------ conta */

export interface BillLine {
  code: CodeKey
  qty: number
  /** De onde saiu, em português curto. */
  reasons: string[]
}

export interface Bill {
  lines: BillLine[]
  warnings: string[]
  total: number
}

const plural = (n: number, one: string, many: string) => `${n} ${n === 1 ? one : many}`

/** O que uma peça do caso rende, com as estruturas marcadas. */
export function pieceLines(piece: CasePiece): { lines: { code: CodeKey; qty: number; reason: string }[]; warnings: string[] } {
  const base = BASES[piece.base]
  const flasks = Math.max(1, piece.flasks)
  const marked = piece.structures.filter((st) => st.on)
  const margins = marked.filter((st) => st.kind === 'margin')
  const extras = marked.filter((st) => st.kind === 'extra')
  const nodeGroups = marked.filter((st) => st.kind === 'nodes')
  const nodeQty = nodeGroups.reduce((sum, st) => sum + ceilDiv(Math.max(1, st.nodes ?? 6), 6), 0)

  const cap = base.marginCap
  const marginQty = cap === null ? margins.length : Math.min(margins.length, cap)
  const warnings: string[] =
    cap !== null && cap > 0 && margins.length > cap
      ? [`${piece.label}: a cartilha admite no máximo ${cap} margens nesta peça — foram contadas ${cap} das ${margins.length} marcadas.`]
      : []
  if (cap === 0 && margins.length > 0) {
    warnings.push(`${piece.label}: biópsias e citologias não têm margem cobrável — as marcadas foram ignoradas.`)
  }

  const adicional = (cap === 0 ? 0 : marginQty) + extras.length + nodeQty
  const reason: string[] = []
  if (cap !== 0 && marginQty > 0) reason.push(plural(marginQty, 'margem', 'margens'))
  if (extras.length > 0) reason.push(plural(extras.length, 'peça extra', 'peças extras'))
  if (nodeQty > 0) reason.push(plural(nodeQty, 'grupo de linfonodos', 'grupos de linfonodos'))

  return {
    lines: [
      { code: base.code, qty: flasks, reason: flasks > 1 ? `${piece.label} (${flasks} frascos)` : piece.label },
      ...(adicional > 0 ? [{ code: 'pecaAdicional' as CodeKey, qty: adicional, reason: `${piece.label}: ${reason.join(', ')}` }] : []),
    ],
    warnings,
  }
}

export function computeBill(state: BillingCase): Bill {
  const totals = new Map<CodeKey, BillLine>()
  const warnings: string[] = []

  const add = (code: CodeKey, qty: number, reason: string) => {
    if (qty <= 0) return
    const found = totals.get(code)
    if (found) {
      found.qty += qty
      if (!found.reasons.includes(reason)) found.reasons.push(reason)
    } else {
      totals.set(code, { code, qty, reasons: [reason] })
    }
  }

  for (const piece of state.pieces) {
    const { lines, warnings: w } = pieceLines(piece)
    for (const l of lines) add(l.code, l.qty, l.reason)
    warnings.push(...w)
  }
  for (const block of state.blocks) {
    const computed = computeBlock(block.blockId, block.params)
    for (const item of computed.items) add(item.code, item.qty, item.reason)
    warnings.push(...computed.warnings)
  }

  const lines = [...totals.values()].sort((a, b) => CODES[a.code].code.localeCompare(CODES[b.code].code))
  return { lines, warnings, total: lines.reduce((sum, l) => sum + l.qty, 0) }
}

/* ------------------------------------------------------------ conferência */

export interface DiffRow {
  code: CodeKey
  /** Quanto deveria estar cobrado. */
  should: number
  /** Quanto a recepção lançou. */
  billed: number
}

export interface Diff {
  rows: DiffRow[]
  missing: number
  extra: number
  ok: boolean
}

export function computeDiff(bill: Bill, billed: BillingCase['billed']): Diff {
  const codes = new Set<CodeKey>([...bill.lines.map((l) => l.code), ...(Object.keys(billed) as CodeKey[])])
  const rows: DiffRow[] = [...codes]
    .map((code) => ({ code, should: bill.lines.find((l) => l.code === code)?.qty ?? 0, billed: billed[code] ?? 0 }))
    .filter((row) => row.should > 0 || row.billed > 0)
    .sort((a, b) => CODES[a.code].code.localeCompare(CODES[b.code].code))
  const missing = rows.reduce((sum, r) => sum + Math.max(0, r.should - r.billed), 0)
  const extra = rows.reduce((sum, r) => sum + Math.max(0, r.billed - r.should), 0)
  return { rows, missing, extra, ok: missing === 0 && extra === 0 }
}

/* ------------------------------------------------------------------ texto */

export function billText(state: BillingCase, bill: Bill): string {
  const head = bill.lines.map((l) => `${CODES[l.code].code} × ${l.qty}`).join(' + ')
  const body = bill.lines.map((l) => `${CODES[l.code].code} × ${l.qty} — ${CODES[l.code].name}\n    ${l.reasons.join('; ')}`)
  const pieces = state.pieces.map((p) => `- ${p.label}`)
  return [head, '', ...body, ...(pieces.length ? ['', 'Peças do caso:', ...pieces] : [])].join('\n')
}

/* -------------------------------------------------------------- guardado */

const CASE_PREFIX = 'patholytics.billing.case.v1'
const TEMPLATE_PREFIX = 'patholytics.billing.templates.v1'
const ROLE_PREFIX = 'patholytics.billing.role.v1'

export type Role = 'pathologist' | 'reception'

const key = (prefix: string, uid: string | null | undefined) => `${prefix}:${uid ?? 'anon'}`

function read<T>(storageKey: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(storageKey)
    return raw ? ({ ...fallback, ...(JSON.parse(raw) as object) } as T) : fallback
  } catch {
    return fallback
  }
}

function write(storageKey: string, value: unknown): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(value))
  } catch {
    /* navegador sem espaço ou em modo privado: o caso segue só na memória. */
  }
}

/** Listas de estruturas que o usuário ajustou e salvou, por peça. */
export type Templates = Record<string, CaseStructure[]>

export const loadCase = (uid: string | null): BillingCase => {
  const raw = read<BillingCase>(key(CASE_PREFIX, uid), EMPTY_CASE)
  const pieces = Array.isArray(raw.pieces) ? raw.pieces.filter((p) => p && SPECIMEN_BY_ID[p.specimenId]) : []
  const blocks = Array.isArray(raw.blocks) ? raw.blocks.filter((b) => b && b.blockId) : []
  return { pieces, blocks, billed: raw.billed && typeof raw.billed === 'object' ? raw.billed : {} }
}
export const saveCase = (uid: string | null, state: BillingCase) => write(key(CASE_PREFIX, uid), state)

export const loadTemplates = (uid: string | null): Templates => read<Templates>(key(TEMPLATE_PREFIX, uid), {})
export const saveTemplates = (uid: string | null, templates: Templates) => write(key(TEMPLATE_PREFIX, uid), templates)

export function loadRole(uid: string | null): Role | null {
  try {
    const raw = localStorage.getItem(key(ROLE_PREFIX, uid))
    return raw === 'pathologist' || raw === 'reception' ? raw : null
  } catch {
    return null
  }
}
export function saveRole(uid: string | null, role: Role | null) {
  try {
    if (role) localStorage.setItem(key(ROLE_PREFIX, uid), role)
    else localStorage.removeItem(key(ROLE_PREFIX, uid))
  } catch {
    /* sem localStorage: a escolha vale só nesta visita. */
  }
}
