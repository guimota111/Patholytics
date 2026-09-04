/* ==========================================================================
   mapping.ts — do mapeamento definido pelo usuário (grupos + faixas) às
   células (cassetes) que a análise, o mapa 2D e o modelo 3D consomem.
   ========================================================================== */

import {
  MAX_CASSETTES,
  cellIdOf,
  type CassetteGroup,
  type Cell,
  type Span,
  type MappingConfig,
  type MappingTemplate,
  type Region,
  type Side,
  type Tissue,
} from './types'

export interface MappingWarnings {
  /** Cassetes sem grupo (entram na análise como próstata, sem localização). */
  unmapped: number[]
  /** Cassetes citados em mais de um grupo (fica o primeiro). */
  conflicts: number[]
  /** Faixas que não puderam ser lidas ou saem do total. */
  invalidRanges: { groupId: string; range: string }[]
}

/** "1-8", "1,3,5", "1-4, 9", "1 a 8", "9;10" → números válidos em 1..total. */
export function parseRange(raw: string, total: number): { numbers: number[]; invalid: boolean } {
  const set = new Set<number>()
  let invalid = false
  for (const part of String(raw ?? '').split(/[,;]/)) {
    const p = part.trim()
    if (!p) continue
    const m = p.match(/^(\d+)\s*(?:[-–aà]\s*(\d+))?$/i)
    if (!m) {
      invalid = true
      continue
    }
    let a = Number(m[1])
    let b = m[2] !== undefined ? Number(m[2]) : a
    if (a > b) [a, b] = [b, a]
    for (let i = a; i <= b; i++) {
      if (i >= 1 && i <= total) set.add(i)
      else invalid = true
    }
  }
  return { numbers: [...set].sort((x, y) => x - y), invalid }
}

/** Quanto mais restrito o grupo, mais ele "vence" ao pintar o modelo 3D. */
export function specificity(g: Pick<CassetteGroup, 'side' | 'region' | 'span'>): number {
  const cone = g.span === 'apexOnly' || g.span === 'baseOnly'
  return (cone ? 4 : 0) + (g.region !== 'whole' ? 2 : 0) + (g.side !== 'B' ? 1 : 0)
}

export function buildCells(mapping: MappingConfig): { cells: Cell[]; warnings: MappingWarnings } {
  const total = clampTotal(mapping.total)
  const owner = new Map<number, { group: CassetteGroup; index: number; size: number }>()
  const warnings: MappingWarnings = { unmapped: [], conflicts: [], invalidRanges: [] }

  for (const group of mapping.groups) {
    const { numbers, invalid } = parseRange(group.range, total)
    if (invalid) warnings.invalidRanges.push({ groupId: group.id, range: group.range })
    const mine = numbers.filter((n) => {
      if (owner.has(n)) {
        warnings.conflicts.push(n)
        return false
      }
      return true
    })
    mine.forEach((n, index) => owner.set(n, { group, index, size: mine.length }))
  }

  const cells: Cell[] = []
  for (let n = 1; n <= total; n++) {
    const o = owner.get(n)
    if (!o) {
      warnings.unmapped.push(n)
      cells.push({
        id: cellIdOf(n),
        number: n,
        label: String(n),
        group: null,
        indexInGroup: 0,
        groupSize: 1,
        side: 'B',
        region: 'whole',
        span: 'apexToBase',
        tissue: 'prostate',
      })
      continue
    }
    cells.push({
      id: cellIdOf(n),
      number: n,
      label: String(n),
      group: o.group,
      indexInGroup: o.index,
      groupSize: o.size,
      side: o.group.side,
      region: o.group.region,
      span: o.group.span,
      tissue: o.group.tissue,
    })
  }
  warnings.conflicts = [...new Set(warnings.conflicts)].sort((a, b) => a - b)
  return { cells, warnings }
}

export const clampTotal = (n: number) => Math.max(1, Math.min(MAX_CASSETTES, Math.floor(n) || 1))

export function newGroupId(): string {
  return `g${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

export function makeGroup(
  partial: Partial<CassetteGroup> & { name: string; range: string },
): CassetteGroup {
  return {
    id: partial.id ?? newGroupId(),
    name: partial.name,
    range: partial.range,
    side: partial.side ?? 'B',
    region: partial.region ?? 'whole',
    span: partial.span ?? 'apexToBase',
    tissue: partial.tissue ?? 'prostate',
  }
}

/** Divide 1..total em n faixas contíguas quase iguais (sobra vai para as primeiras). */
export function splitEvenly(total: number, n: number): string[] {
  const size = Math.floor(total / n)
  let extra = total % n
  const out: string[] = []
  let start = 1
  for (let i = 0; i < n; i++) {
    const len = size + (extra > 0 ? 1 : 0)
    if (extra > 0) extra--
    const end = start + len - 1
    out.push(len <= 0 ? '' : len === 1 ? String(start) : `${start}-${end}`)
    start = end + 1
  }
  return out
}

/** Cores fixas por posição do grupo, para o editor e o mapa 2D. */
export const GROUP_COLORS = ['#2563eb', '#16a34a', '#d97706', '#9333ea', '#0891b2', '#dc2626', '#4f46e5', '#65a30d', '#db2777', '#0d9488', '#ea580c', '#7c3aed']

export const groupColor = (index: number) => GROUP_COLORS[index % GROUP_COLORS.length]

const g = (name: string, range: string, side: Side, region: Region, span: Span, tissue: Tissue = 'prostate', id?: string): CassetteGroup => ({
  id: id ?? `t-${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${range.replace(/[^0-9]+/g, '_')}`,
  name,
  range,
  side,
  region,
  span,
  tissue,
})

export const DEFAULT_MAPPING: MappingConfig = {
  total: 20,
  groups: [
    g('Lobo direito anterior', '1-4', 'D', 'anterior', 'apexToBase'),
    g('Lobo direito posterior', '5-8', 'D', 'posterior', 'apexToBase'),
    g('Lobo esquerdo anterior', '9-12', 'E', 'anterior', 'apexToBase'),
    g('Lobo esquerdo posterior', '13-16', 'E', 'posterior', 'apexToBase'),
    g('Ápice', '17-18', 'B', 'whole', 'apexOnly'),
    g('Base', '19-20', 'B', 'whole', 'baseOnly'),
  ],
}

export const BUILTIN_TEMPLATES: MappingTemplate[] = [
  { name: 'Genérico — 4 quadrantes + ápice e base (20)', mapping: DEFAULT_MAPPING },
  {
    name: 'HUOL — 34 cassetes',
    mapping: {
      total: 34,
      groups: [
        g('Porção anterior — lobo direito', '1-8', 'D', 'anterior', 'apexToBase'),
        g('Porção posterior — lobo direito', '9-16', 'D', 'posterior', 'apexToBase'),
        g('Porção anterior — lobo esquerdo', '17-24', 'E', 'anterior', 'apexToBase'),
        g('Porção posterior — lobo esquerdo', '25-32', 'E', 'posterior', 'apexToBase'),
        g('Ápice', '33', 'B', 'whole', 'apexOnly'),
        g('Base', '34', 'B', 'whole', 'baseOnly'),
      ],
    },
  },
  {
    name: 'Genérico + vesículas e ductos (26)',
    mapping: {
      total: 26,
      groups: [
        g('Lobo direito anterior', '1-4', 'D', 'anterior', 'apexToBase'),
        g('Lobo direito posterior', '5-8', 'D', 'posterior', 'apexToBase'),
        g('Lobo esquerdo anterior', '9-12', 'E', 'anterior', 'apexToBase'),
        g('Lobo esquerdo posterior', '13-16', 'E', 'posterior', 'apexToBase'),
        g('Ápice', '17-18', 'B', 'whole', 'apexOnly'),
        g('Base', '19-20', 'B', 'whole', 'baseOnly'),
        g('Vesícula seminal direita', '21-22', 'D', 'whole', 'apexToBase', 'seminalVesicle'),
        g('Vesícula seminal esquerda', '23-24', 'E', 'whole', 'apexToBase', 'seminalVesicle'),
        g('Ducto deferente direito', '25', 'D', 'whole', 'apexToBase', 'vasDeferens'),
        g('Ducto deferente esquerdo', '26', 'E', 'whole', 'apexToBase', 'vasDeferens'),
      ],
    },
  },
]
