/* ==========================================================================
   types.ts — arquivo de laudos: uma árvore de categorias com folhas (laudos
   e notas). Cada nó aponta para o pai por `parentId`; as raízes LAUDOS e
   NOTAS são virtuais (não existem no banco).
   ========================================================================== */

import type { DocumentData, Timestamp } from 'firebase/firestore'

export const ROOT_REPORTS = 'root_reports'
export const ROOT_NOTES = 'root_notes'
export const ROOT_IDS: readonly string[] = [ROOT_REPORTS, ROOT_NOTES]
export const isRoot = (id: string) => ROOT_IDS.includes(id)

export type NodeType = 'category' | 'report' | 'note'
export type LeafType = Exclude<NodeType, 'category'>

export interface ArchiveNode {
  id: string
  parentId: string
  type: NodeType
  label: string
  content: string
  /** Emoji da pasta (só categorias). */
  icon: string
  tags: string[]
  copyCount: number
  favorite: boolean
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

/** Ícones disponíveis para as pastas. */
export const FOLDER_ICONS = [
  '📁', '📂', '🗂️', '📋', '🗃️', '📑', '📌', '📎', '⭐', '🏷️',
  '🧠', '🫀', '🫁', '🩺', '🦴', '🩻', '🧬', '🩸', '👁️', '👂',
  '👃', '👄', '🦷', '🦵', '🦶', '🫄', '🤰', '🧒', '👶', '🦻',
  '💊', '💉', '🔬', '🧪', '🩹', '🩼', '🚑', '🏥', '⚕️', '🧫',
  '🔴', '🟠', '🟡', '🟢', '🔵', '🟣', '⚫', '⚪',
  '📝', '📄', '🔖', '📊', '📈', '🗒️', '💡', '❤️', '⚠️', '✅',
]

export const DEFAULT_FOLDER_ICON = '📁'
export const LEAF_ICON: Record<LeafType, string> = { report: '📄', note: '📝' }

const str = (v: unknown, fallback = '') => (typeof v === 'string' ? v : fallback)

export function sanitizeNode(id: string, data: DocumentData): ArchiveNode {
  const type: NodeType =
    data.type === 'category' || data.type === 'report' || data.type === 'note'
      ? data.type
      : data.type === 'laudo'
        ? 'report'
        : data.type === 'nota'
          ? 'note'
          : 'report'
  return {
    id,
    parentId: str(data.parentId, ROOT_REPORTS),
    type,
    label: str(data.label),
    content: str(data.content),
    icon: str(data.icon),
    tags: Array.isArray(data.tags) ? data.tags.filter((t: unknown): t is string => typeof t === 'string') : [],
    copyCount: typeof data.copyCount === 'number' ? data.copyCount : 0,
    favorite: data.favorite === true,
    createdAt: (data.createdAt as Timestamp | undefined) ?? null,
    updatedAt: (data.updatedAt as Timestamp | undefined) ?? null,
  }
}

/** Normaliza texto para busca: sem acentos, minúsculas. */
export const norm = (s: string) =>
  (s || '')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()

const labelCmp = (a: ArchiveNode, b: ArchiveNode) => a.label.localeCompare(b.label, 'pt-BR')

/** Categorias primeiro (alfabéticas); folhas da mais copiada para a menos. */
export function compareSiblings(a: ArchiveNode, b: ArchiveNode): number {
  const aCat = a.type === 'category'
  const bCat = b.type === 'category'
  if (aCat !== bCat) return aCat ? -1 : 1
  if (aCat) return labelCmp(a, b)
  return b.copyCount - a.copyCount || labelCmp(a, b)
}

/** Trecho do conteúdo ao redor do termo (já normalizado). */
export function snippet(content: string, q: string): string {
  const i = norm(content).indexOf(q)
  if (i < 0) return ''
  const start = Math.max(0, i - 30)
  const end = Math.min(content.length, i + q.length + 30)
  return (start > 0 ? '…' : '') + content.slice(start, end) + (end < content.length ? '…' : '')
}

export interface ArchiveIndex {
  byId: Map<string, ArchiveNode>
  childrenOf: Map<string, ArchiveNode[]>
}

export function buildIndex(nodes: ArchiveNode[]): ArchiveIndex {
  const byId = new Map<string, ArchiveNode>()
  const childrenOf = new Map<string, ArchiveNode[]>()
  for (const n of nodes) {
    byId.set(n.id, n)
    const list = childrenOf.get(n.parentId)
    if (list) list.push(n)
    else childrenOf.set(n.parentId, [n])
  }
  for (const list of childrenOf.values()) list.sort(compareSiblings)
  return { byId, childrenOf }
}

/** Raiz (LAUDOS/NOTAS) a que um nó pertence. */
export function rootOf(id: string, index: ArchiveIndex): string {
  let p: string | undefined = id
  const seen = new Set<string>()
  while (p && !isRoot(p) && !seen.has(p)) {
    seen.add(p)
    p = index.byId.get(p)?.parentId
  }
  return p && isRoot(p) ? p : ROOT_REPORTS
}

/** Ids dos ancestrais (do pai até a raiz virtual, inclusive). */
export function ancestorsOf(id: string, index: ArchiveIndex): string[] {
  const out: string[] = []
  let p = index.byId.get(id)?.parentId
  const seen = new Set<string>()
  while (p && !seen.has(p)) {
    seen.add(p)
    out.push(p)
    if (isRoot(p)) break
    p = index.byId.get(p)?.parentId
  }
  return out
}

/** Ids de todos os descendentes de um nó (para exclusão em cascata). */
export function descendantsOf(id: string, index: ArchiveIndex): string[] {
  const out: string[] = []
  const stack = [id]
  while (stack.length) {
    const cur = stack.pop()!
    for (const child of index.childrenOf.get(cur) ?? []) {
      out.push(child.id)
      stack.push(child.id)
    }
  }
  return out
}

/** Um nó pode ser movido para dentro de `targetId`? */
export function canMoveInto(nodeId: string, targetId: string, index: ArchiveIndex): boolean {
  const node = index.byId.get(nodeId)
  if (!node || targetId === node.parentId || targetId === nodeId) return false
  if (!isRoot(targetId)) {
    const target = index.byId.get(targetId)
    if (!target || target.type !== 'category') return false
    if (node.type === 'category' && ancestorsOf(targetId, index).includes(nodeId)) return false
  }
  return true
}

/** Formato do arquivo de exportação/importação. */
export interface ArchiveExport {
  format: 'patholytics.archive'
  version: 1
  exportedAt: string
  nodes: {
    id: string
    parentId: string
    type: NodeType
    label: string
    content: string
    icon: string
    tags: string[]
    copyCount: number
    favorite: boolean
  }[]
}
