/* ==========================================================================
   microSummary.ts — texto com os parâmetros calculados na laudagem: mapa,
   celularidade por cassete, as seis variáveis do RCB com a origem de cada
   uma, o índice e a classe, linfonodos e a sugestão de ypT/ypN. Não é o
   laudo: é o conjunto de números para o patologista redigir o dele.
   ========================================================================== */

import type { TFunction } from 'i18next'
import type { MicroAnalysis } from './analysis'
import { labelSpan } from './cassettes'
import { fmtN, marginName } from './format'
import { AXIS_MARGINS, MARGIN_SIGN, type MicroState } from './types'

export function buildMicroSummary(state: MicroState, a: MicroAnalysis, t: TFunction, locale: string): string {
  const n = (v: number | null | undefined, d = 1) => fmtN(v, d, locale)
  const k = (key: string, params?: Record<string, unknown>) => t(`breast.microSummary.${key}`, params ?? {})
  const { map, nodes, globals } = state
  const L: string[] = []
  const anyAssessed = a.lesions.some((l) => l.cells.some((c) => c.assessed))
  const anyNodes = nodes.examined !== null || nodes.positive !== null
  if (!anyAssessed && !anyNodes && !a.rcb) return ''

  const [neg, pos] = AXIS_MARGINS[map.slicing.axis]
  const to = MARGIN_SIGN[map.slicing.from] === -1 ? pos : neg
  L.push(k('header'))
  L.push(
    k('map', {
      specimen: t(`breast.specimenType.${map.specimen.type}`),
      side: t(`breast.side.${map.specimen.side}`),
      n: map.slicing.count,
      from: marginName(map.slicing.from, t),
      to: marginName(to, t),
    }),
  )

  L.push('', k('cellsTitle'))
  for (const l of a.lesions) {
    const p = l.plan
    L.push(k('lesionLine', { label: p.lesion.label, span: labelSpan(p.grid), slice: p.central, others: p.others.length ? k('lesionOthers', { span: labelSpan(p.others) }) : '' }))
    const parts = l.cells
      .filter((c) => c.assessed)
      .map((c) => `${c.def.label}: ${n(c.cell.ca, 0)}%${(c.cell.ca ?? 0) > 0 ? ` (${k('cisShort', { pct: n(c.cell.cis ?? 0, 0) })})` : ''}${c.cell.lvi ? ` ${k('lviMark')}` : ''}${c.cell.margin ? ` ${k('marginMark', { margin: marginName(c.cell.margin, t) })}` : ''}`)
    if (parts.length) L.push(`  ${parts.join(' · ')}`)
    else L.push(`  ${k('noCells')}`)
    if (l.caMean !== null) {
      L.push(k('lesionMean', { ca: n(l.caMean), cis: n(l.cisMean ?? 0), assessed: l.assessed, total: l.gridCells.length }))
    }
    if (l.positiveExtent && l.positive > 0) {
      L.push(k('lesionExtent', { d1: n(l.positiveExtent.d1, 0), d2: n(l.positiveExtent.d2, 0), gross1: n(l.gross.d1, 0), gross2: n(l.gross.d2, 0) }))
    }
  }

  L.push('', k('rcbTitle'))
  const src = (s: MicroAnalysis['sources']['d1']) => t(`breast.rcb.source.${s}`)
  const { inputs } = a
  L.push(k('inputD', { d1: n(inputs.d1), d2: n(inputs.d2), source: src(a.sources.d1) }))
  L.push(k('inputCa', { ca: n(inputs.ca), source: src(a.sources.ca) }))
  L.push(k('inputCis', { cis: n(inputs.cis), source: src(a.sources.cis) }))
  L.push(k('inputLn', { ln: inputs.ln ?? '—', dmet: (inputs.ln ?? 0) > 0 ? n(inputs.dmet) : '0' }))
  if (a.invalid) {
    L.push(k('invalid'))
  } else if (a.forcedClass) {
    L.push(k('forced', { cls: a.forcedClass }))
  } else if (a.rcb) {
    L.push(
      k('formula', {
        dPrim: n(a.rcb.dPrim, 2),
        fInv: n(a.rcb.fInv, 4),
        primary: n(a.rcb.primaryTerm, 3),
        nodal: n(a.rcb.nodalTerm, 3),
      }),
    )
    L.push(k('result', { index: n(a.rcb.index, 3), cls: a.rcb.rcbClass, meaning: t(`breast.rcb.class.${a.rcb.rcbClass}`) }))
  } else {
    L.push(k('incomplete'))
  }

  L.push('', k('nodesTitle'))
  if (anyNodes) {
    L.push(k('nodes', { positive: nodes.positive ?? 0, total: nodes.examined ?? 0 }))
    if ((nodes.positive ?? 0) > 0) {
      L.push(k('nodesLargest', { mm: n(nodes.largestMm) }))
      L.push(k('nodesEne', { value: t(`breast.presence.${nodes.extranodal}`) }))
    }
    if (nodes.itcOnly) L.push(k('nodesItc'))
    L.push(k('nodesEffect', { value: t(`breast.presence.${nodes.treatmentEffect}`) }))
  } else {
    L.push(k('nodesNone'))
  }

  L.push('', k('otherTitle'))
  if (globals.histType) L.push(k('histType', { value: t(`breast.histType.${globals.histType}`) }))
  if (globals.grade) L.push(k('grade', { value: globals.grade }))
  if (globals.largestInvasiveMm !== null) L.push(k('largestInvasive', { mm: n(globals.largestInvasiveMm) }))
  L.push(k('treatmentEffect', { value: t(`breast.presence.${globals.treatmentEffect}`) }))
  L.push(k('lvi', { value: t(`breast.presence.${globals.lvi}`) }))
  L.push(k('marginsInvasive', { value: t(`breast.marginStatus.${globals.marginsInvasive}`) }))
  L.push(k('marginsDcis', { value: t(`breast.marginStatus.${globals.marginsDcis}`) }))
  if (globals.closestMargin) {
    L.push(k('closestMargin', { margin: marginName(globals.closestMargin, t), mm: globals.closestMarginMm !== null ? `${n(globals.closestMarginMm)} mm` : '—' }))
  }
  const lviCells = a.lesions.flatMap((l) => l.lviCells.map((d) => d.label))
  if (lviCells.length) L.push(k('lviCells', { cells: lviCells.join(', ') }))
  const marginCells = a.lesions.flatMap((l) => l.marginCells.map((mc) => `${mc.def.label} (${marginName(mc.margin, t)})`))
  if (marginCells.length) L.push(k('marginCells', { cells: marginCells.join(', ') }))

  L.push('', k('stagingTitle'))
  L.push(k('staging', { ypT: a.ypT ?? '—', ypN: a.ypN }))
  if (a.pcr !== null) L.push(k(a.pcr ? 'pcrYes' : 'pcrNo'))

  return L.join('\n')
}
