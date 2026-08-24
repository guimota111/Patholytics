/* ==========================================================================
   grid.ts — constrói as células (cassetes) a partir da configuração da grade
   e cuida da numeração automática.
   ========================================================================== */

import {
  MAX_CONE_CASSETTES,
  MAX_SLICES,
  type Cell,
  type GridConfig,
  type GridTemplate,
  type SectorCount,
  type SectorDef,
  type Side,
} from './types'

/* Esquemas de setores. A ordem listada é a ordem "por fatia" (D antes de E,
   anterior antes de posterior). */
const SECTOR_SCHEMES: Record<SectorCount, SectorDef[]> = {
  2: [
    { id: 'D', side: 'D', region: 'hemi', start: 0, end: 180 },
    { id: 'E', side: 'E', region: 'hemi', start: -180, end: 0 },
  ],
  4: [
    { id: 'AD', side: 'D', region: 'anterior', start: 0, end: 90 },
    { id: 'AE', side: 'E', region: 'anterior', start: -90, end: 0 },
    { id: 'PD', side: 'D', region: 'posterior', start: 90, end: 180 },
    { id: 'PE', side: 'E', region: 'posterior', start: -180, end: -90 },
  ],
  6: [
    { id: 'AD', side: 'D', region: 'anterior', start: 0, end: 60 },
    { id: 'AE', side: 'E', region: 'anterior', start: -60, end: 0 },
    { id: 'LD', side: 'D', region: 'lateral', start: 60, end: 120 },
    { id: 'LE', side: 'E', region: 'lateral', start: -120, end: -60 },
    { id: 'PD', side: 'D', region: 'posterior', start: 120, end: 180 },
    { id: 'PE', side: 'E', region: 'posterior', start: -180, end: -120 },
  ],
  8: [
    { id: 'AD', side: 'D', region: 'anterior', start: 0, end: 45 },
    { id: 'AE', side: 'E', region: 'anterior', start: -45, end: 0 },
    { id: 'ALD', side: 'D', region: 'anterolateral', start: 45, end: 90 },
    { id: 'ALE', side: 'E', region: 'anterolateral', start: -90, end: -45 },
    { id: 'PLD', side: 'D', region: 'posterolateral', start: 90, end: 135 },
    { id: 'PLE', side: 'E', region: 'posterolateral', start: -135, end: -90 },
    { id: 'PD', side: 'D', region: 'posterior', start: 135, end: 180 },
    { id: 'PE', side: 'E', region: 'posterior', start: -180, end: -135 },
  ],
}

export const SECTOR_COUNTS: SectorCount[] = [2, 4, 6, 8]

export const sectorsOf = (count: SectorCount): SectorDef[] => SECTOR_SCHEMES[count]

/** Lado de um cassete de cone, cortado da direita para a esquerda. */
export function coneSide(index: number, total: number): Side {
  if (total <= 1) return 'B'
  const half = total / 2
  if (index < Math.floor(half)) return 'D'
  if (index >= Math.ceil(half)) return 'E'
  return 'B'
}

export const cellId = {
  slice: (slice: number, sectorId: string) => `s${slice}-${sectorId}`,
  apex: (index: number) => `apex-${index}`,
  base: (index: number) => `base-${index}`,
}

/** Células na ordem "anatômica": ápice, fatias (ápice → base), base. */
function buildBareCells(config: GridConfig): Omit<Cell, 'label'>[] {
  const cells: Omit<Cell, 'label'>[] = []
  for (let i = 0; i < config.apexCassettes; i++) {
    cells.push({ id: cellId.apex(i), kind: 'apex', index: i, side: coneSide(i, config.apexCassettes) })
  }
  const sectors = sectorsOf(config.sectors)
  for (let s = 1; s <= config.slices; s++) {
    for (const sector of sectors) {
      cells.push({ id: cellId.slice(s, sector.id), kind: 'slice', slice: s, sector, side: sector.side })
    }
  }
  for (let i = 0; i < config.baseCassettes; i++) {
    cells.push({ id: cellId.base(i), kind: 'base', index: i, side: coneSide(i, config.baseCassettes) })
  }
  return cells
}

/** Ordem de numeração automática das células. */
function numberingOrder(config: GridConfig, cells: Omit<Cell, 'label'>[]): string[] {
  const apex = cells.filter((c) => c.kind === 'apex')
  const base = cells.filter((c) => c.kind === 'base')
  const slices = cells.filter((c) => c.kind === 'slice')
  const sliceRank = (c: Omit<Cell, 'label'>) =>
    config.sliceOrder === 'apexToBase' ? c.slice! : config.slices + 1 - c.slice!

  let ordered: Omit<Cell, 'label'>[]
  if (config.numbering === 'bySlice') {
    ordered = [...slices].sort((a, b) => sliceRank(a) - sliceRank(b))
  } else {
    // Por setor (estilo HUOL): todas as fatias de um setor, lado direito
    // primeiro, anterior antes de posterior.
    const sectors = sectorsOf(config.sectors)
    const sectorRank = new Map(
      [...sectors]
        .sort((a, b) => (a.side === b.side ? sectors.indexOf(a) - sectors.indexOf(b) : a.side === 'D' ? -1 : 1))
        .map((s, i) => [s.id, i] as const),
    )
    ordered = [...slices].sort(
      (a, b) => sectorRank.get(a.sector!.id)! - sectorRank.get(b.sector!.id)! || sliceRank(a) - sliceRank(b),
    )
  }

  // Por fatia: os cones entram na sequência anatômica (ápice, fatias, base).
  // Por setor: os cones ficam no fim (ápice, depois base), como no HUOL.
  if (config.numbering === 'bySector') return [...ordered, ...apex, ...base].map((c) => c.id)
  const head = config.sliceOrder === 'apexToBase' ? apex : base
  const tail = config.sliceOrder === 'apexToBase' ? base : apex
  return [...head, ...ordered, ...tail].map((c) => c.id)
}

/** Rótulo automático de cada célula (1..N). */
export function autoLabels(config: GridConfig): Record<string, string> {
  const order = numberingOrder(config, buildBareCells(config))
  const labels: Record<string, string> = {}
  order.forEach((id, i) => {
    labels[id] = String(i + 1)
  })
  return labels
}

export function buildCells(config: GridConfig): Cell[] {
  const auto = autoLabels(config)
  return buildBareCells(config).map((c) => ({ ...c, label: config.labels[c.id]?.trim() || auto[c.id] }))
}

/** Rótulos duplicados (para avisar, não para bloquear). */
export function duplicateLabels(cells: Cell[]): string[] {
  const seen = new Map<string, number>()
  for (const c of cells) seen.set(c.label, (seen.get(c.label) ?? 0) + 1)
  return [...seen.entries()].filter(([, n]) => n > 1).map(([label]) => label)
}

export const clampSlices = (n: number) => Math.max(1, Math.min(MAX_SLICES, Math.floor(n) || 1))
export const clampCone = (n: number) => Math.max(0, Math.min(MAX_CONE_CASSETTES, Math.floor(n) || 0))

export const DEFAULT_GRID: GridConfig = {
  slices: 6,
  sectors: 4,
  apexCassettes: 2,
  baseCassettes: 2,
  numbering: 'bySlice',
  sliceOrder: 'apexToBase',
  labels: {},
}

export const BUILTIN_TEMPLATES: GridTemplate[] = [
  { name: '6 fatias × 4 quadrantes + ápice/base (2+2)', grid: DEFAULT_GRID },
  {
    name: 'HUOL — 8 fatias × 4 quadrantes, numeração por quadrante (34)',
    grid: {
      slices: 8,
      sectors: 4,
      apexCassettes: 1,
      baseCassettes: 1,
      numbering: 'bySector',
      sliceOrder: 'apexToBase',
      labels: {},
    },
  },
  {
    name: '8 fatias × 6 setores + cones (3+3)',
    grid: {
      slices: 8,
      sectors: 6,
      apexCassettes: 3,
      baseCassettes: 3,
      numbering: 'bySlice',
      sliceOrder: 'apexToBase',
      labels: {},
    },
  },
]
