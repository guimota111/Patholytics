/* ==========================================================================
   nodules.ts — separa o tumor em nódulos a partir do mapa.

   A CAP e a ISUP pedem que, numa prostatectomia multifocal, o Gleason do laudo
   seja o do nódulo dominante (o maior; se um nódulo menor tiver grau mais
   alto, ele é relatado à parte). Para isso é preciso saber quais cassetes
   com tumor se comunicam. Cada cassete prostático ocupa um bloco da glândula
   (lado × face × fatia no eixo ápice–base, ver geometry.ts); dois cassetes
   são vizinhos quando os blocos compartilham uma face — não basta um canto:
   lobo direito anterior e lobo esquerdo posterior na mesma fatia se tocam só
   pelo eixo central e ficam separados. Cassetes vizinhos com tumor formam o
   mesmo nódulo; o patologista pode forçar a separação ou a união numerando
   os nódulos na tabela.
   ========================================================================== */

import type { CellResult } from './analysis'
import { cellZRange } from './geometry'
import { gradeGleason, worstPattern, type GleasonResult, type PatternShares } from './gleason'
import type { Cell, EpeStatus, Pattern, Side } from './types'

export interface Nodule {
  /** Estável enquanto o menor cassete do nódulo for o mesmo: `n<número>`. */
  key: string
  /** Posição por volume, 1 = dominante. */
  index: number
  cells: CellResult[]
  /** Soma do % de tumor dos cassetes do nódulo. */
  tumorSum: number
  /** Contribuição para o volume do órgão. */
  pctOfGland: number
  shares: PatternShares
  gleason: GleasonResult
  worst: Pattern
  epe: EpeStatus
  marginFoci: number
  /** Nomes dos grupos que o nódulo atravessa, na ordem do mapeamento. */
  groupNames: string[]
  sides: Side[]
  /** Número que o patologista deu ao nódulo na tabela, se deu. */
  label: number | null
}

type Rel = 'overlap' | 'touch' | 'apart'

const EPS = 1e-6

interface Box {
  xs: Set<'D' | 'E'>
  ys: Set<'anterior' | 'posterior'>
  za: number
  zb: number
}

function boxOf(cell: Cell): Box {
  const xs = new Set<'D' | 'E'>(cell.side === 'B' ? ['D', 'E'] : [cell.side])
  const ys = new Set<'anterior' | 'posterior'>(cell.region === 'whole' ? ['anterior', 'posterior'] : [cell.region])
  return { xs, ys, ...cellZRange(cell) }
}

/** Dois meios (lado ou face): compartilham volume, ou só o plano do meio. */
function relHalves<T>(a: Set<T>, b: Set<T>): Rel {
  for (const v of a) if (b.has(v)) return 'overlap'
  return 'touch'
}

function relZ(a: Box, b: Box): Rel {
  const gap = Math.max(a.za, b.za) - Math.min(a.zb, b.zb)
  if (gap < -EPS) return 'overlap'
  if (gap <= EPS) return 'touch'
  return 'apart'
}

/** Vizinhança por face: nenhuma dimensão separada e no máximo uma só encostada. */
export function adjacentCells(a: Cell, b: Cell): boolean {
  const A = boxOf(a)
  const B = boxOf(b)
  const rels = [relHalves(A.xs, B.xs), relHalves(A.ys, B.ys), relZ(A, B)]
  if (rels.includes('apart')) return false
  return rels.filter((r) => r === 'touch').length <= 1
}

function weightedShares(cells: CellResult[]): { shares: PatternShares; tumorSum: number } {
  let tumorSum = 0
  let w4 = 0
  let w5 = 0
  for (const c of cells) {
    if (!c.shares) continue
    tumorSum += c.tumor
    w4 += c.shares.p4 * c.tumor
    w5 += c.shares.p5 * c.tumor
  }
  const p4 = tumorSum > 0 ? w4 / tumorSum : 0
  const p5 = tumorSum > 0 ? w5 / tumorSum : 0
  return { shares: { p3: 100 - p4 - p5, p4, p5 }, tumorSum }
}

/**
 * Componentes conexos dos cassetes prostáticos com tumor. Cassetes sem grupo
 * não têm lugar na glândula e ficam isolados; o número de nódulo digitado na
 * tabela vence a geometria: números iguais unem, números diferentes separam.
 */
export function findNodules(prostate: CellResult[], glandCells: number): Nodule[] {
  const cells = prostate.filter((c) => c.tumor > 0 && c.shares)
  if (!cells.length) return []

  const parent = cells.map((_, i) => i)
  const find = (i: number): number => {
    while (parent[i] !== i) {
      parent[i] = parent[parent[i]]
      i = parent[i]
    }
    return i
  }
  const union = (i: number, j: number) => {
    const a = find(i)
    const b = find(j)
    if (a !== b) parent[Math.max(a, b)] = Math.min(a, b)
  }

  const labelOf = (c: CellResult): number | null => {
    const v = c.data.nodule
    return v !== null && Number.isInteger(v) && v >= 1 ? v : null
  }

  for (let i = 0; i < cells.length; i++) {
    for (let j = i + 1; j < cells.length; j++) {
      const li = labelOf(cells[i])
      const lj = labelOf(cells[j])
      if (li !== null && lj !== null) {
        if (li === lj) union(i, j)
        continue
      }
      if (!cells[i].cell.group || !cells[j].cell.group) continue
      if (adjacentCells(cells[i].cell, cells[j].cell)) union(i, j)
    }
  }

  const buckets = new Map<number, CellResult[]>()
  cells.forEach((c, i) => {
    const root = find(i)
    const list = buckets.get(root)
    if (list) list.push(c)
    else buckets.set(root, [c])
  })

  const nodules: Nodule[] = [...buckets.values()].map((members) => {
    members.sort((a, b) => a.cell.number - b.cell.number)
    const { shares, tumorSum } = weightedShares(members)
    const groupOrder = new Map<string, number>()
    const groupNames: string[] = []
    for (const m of members) {
      const name = m.cell.group?.name ?? ''
      if (!groupOrder.has(name)) {
        groupOrder.set(name, groupNames.length)
        groupNames.push(name)
      }
    }
    const sides = [...new Set(members.map((m) => m.cell.side))]
    const labels = members.map(labelOf).filter((v): v is number => v !== null)
    return {
      key: `n${members[0].cell.number}`,
      index: 0,
      cells: members,
      tumorSum,
      pctOfGland: glandCells ? tumorSum / glandCells : 0,
      shares,
      gleason: gradeGleason(shares)!,
      worst: worstPattern(shares) ?? 3,
      epe: members.some((m) => m.data.epe === 'established') ? 'established' : members.some((m) => m.data.epe !== 'none') ? 'focal' : 'none',
      marginFoci: members.filter((m) => m.data.margin).length,
      groupNames,
      sides,
      label: labels.length ? Math.min(...labels) : null,
    }
  })

  // Dominante = o maior; em empate, o de grau mais alto; depois o mais apical/baixo.
  nodules.sort(
    (a, b) =>
      b.tumorSum - a.tumorSum ||
      b.gleason.gradeGroup - a.gleason.gradeGroup ||
      b.shares.p5 - a.shares.p5 ||
      a.cells[0].cell.number - b.cells[0].cell.number,
  )
  nodules.forEach((n, i) => (n.index = i + 1))
  return nodules
}

/** O nódulo de maior grau, se ele não for o dominante e tiver grupo de grau maior. */
export function higherGradeThan(nodules: Nodule[], reference: Nodule | null): Nodule | null {
  if (!reference) return null
  let best: Nodule | null = null
  for (const n of nodules) {
    if (n === reference) continue
    if (n.gleason.gradeGroup <= reference.gleason.gradeGroup) continue
    if (!best || n.gleason.gradeGroup > best.gleason.gradeGroup || (n.gleason.gradeGroup === best.gleason.gradeGroup && n.tumorSum > best.tumorSum)) best = n
  }
  return best
}
