/* ==========================================================================
   macroText.ts — a descrição macroscópica pronta para colar, montada a
   partir do mapa: peça, pele, margens pintadas, cortes, cada lesão com as
   distâncias às margens e as fatias, e a chave de cassetes.
   ========================================================================== */

import type { TFunction } from 'i18next'
import { labelSpan, planCassettes } from './cassettes'
import { fmtDims, fmtLen, fmtN, fmtWeight, joinList, marginName } from './format'
import {
  clampSlices,
  clockPosition,
  derivedQuadrant,
  lesionGap,
  lesionSlices,
  marginDistances,
  sliceRange,
  sliceThickness,
} from './geometry'
import { AXIS_MARGINS, MARGIN_SIGN, MARGINS, type Lesion, type MacroState, type Margin } from './types'

export function buildMacroText(m: MacroState, t: TFunction, locale: string): string {
  const { specimen: sp, units, slicing } = m
  const k = (key: string, params?: Record<string, unknown>) => t(`breast.macroText.${key}`, params ?? {})
  const and = t('breast.macroText.and')
  const len = (mm: number | null) => fmtLen(mm, units, locale)
  const L: string[] = []

  // 1. Peça.
  const oriented = sp.orientation.trim() ? k('oriented', { text: sp.orientation.trim() }) : ''
  L.push(
    k('specimen', {
      specimen: t(`breast.specimenTypeText.${sp.type}`),
      side: t(`breast.sideText.${sp.side}`),
      oriented,
      weight: sp.weightGrams !== null ? k('weighing', { weight: fmtWeight(sp.weightGrams, locale) }) : '',
      dims: fmtDims(sp.dims, units, locale),
    }),
  )

  // 2. Pele e plano profundo.
  if (sp.skin.present) {
    const nipple = sp.skin.nipple
      ? k('withNipple', { d: sp.skin.nippleDiameter !== null ? k('nippleDiameter', { d: len(sp.skin.nippleDiameter) }) : '' })
      : k('withoutNipple')
    L.push(
      k('skin', {
        dims: sp.skin.length !== null || sp.skin.width !== null ? k('skinDims', { l: len(sp.skin.length), w: len(sp.skin.width) }) : '',
        change: sp.skin.change !== 'none' ? `, ${t(`breast.skinChange.${sp.skin.change}`)}` : '',
        nipple,
      }),
    )
  }
  if (sp.deep !== 'none') L.push(k(`deep.${sp.deep}`))

  // 3. Tintas.
  const painted = MARGINS.filter((mg) => m.inks[mg] !== 'none')
  const unpainted = MARGINS.filter((mg) => m.inks[mg] === 'none')
  if (painted.length) {
    L.push(
      k('inks', {
        list: joinList(
          painted.map((mg) => k('inkItem', { margin: marginName(mg, t), ink: t(`breast.ink.${m.inks[mg]}`) })),
          and,
        ),
        unpainted: unpainted.length ? k('unpainted', { list: joinList(unpainted.map((mg) => marginName(mg, t)), and) }) : '',
      }),
    )
  } else {
    L.push(k('noInks'))
  }

  // 4. Cortes.
  const n = clampSlices(slicing.count)
  const [neg, pos] = AXIS_MARGINS[slicing.axis]
  const from = slicing.from
  const to: Margin = MARGIN_SIGN[from] === -1 ? pos : neg
  L.push(k('slicing', { n, thickness: len(sliceThickness(slicing, sp.dims)), from: marginName(from, t), to: marginName(to, t) }))

  // 5. Lesões.
  if (!m.lesions.length) L.push(k('noLesion'))
  const plans = planCassettes(m)
  m.lesions.forEach((l, i) => {
    const distances = marginDistances(l, sp.dims)
    const reached = distances.filter((d) => d.reached)
    const closest = distances.reduce((a, b) => (b.mm < a.mm ? b : a))
    const distText = joinList(
      distances.map((d) => (d.reached ? k('distReached', { margin: marginName(d.margin, t) }) : k('distItem', { margin: marginName(d.margin, t), mm: len(d.mm) }))),
      and,
    )
    const slices = lesionSlices(l, slicing, sp.dims)
    const descr =
      (l.color ? k('colorPart', { color: t(`breast.lesionColor.${l.color}`) }) : '') +
      (l.consistency ? k('consistencyPart', { consistency: t(`breast.lesionConsistency.${l.consistency}`) }) : '')
    L.push(
      k('lesion', {
        label: l.label,
        kind: t(`breast.lesionKindText.${l.kind}`),
        shape: t(`breast.lesionShapeText.${l.shape}`),
        descr,
        size: fmtDims(l.size, units, locale),
        location: locationText(l, m, t, locale),
        slices: sliceRange(slices),
        central: slices.central,
      }),
    )
    L.push(k('distances', { list: distText }))
    if (reached.length) {
      L.push(k('reachedNote', { list: joinList(reached.map((d) => marginName(d.margin, t)), and) }))
    } else {
      L.push(k('closest', { margin: marginName(closest.margin, t), mm: len(closest.mm) }))
    }
    if (l.clip) L.push(k('clip'))
    // Distância para as outras lesões (cada par uma vez).
    for (let j = i + 1; j < m.lesions.length; j++) {
      const other = m.lesions[j]
      const gap = lesionGap(l, other)
      L.push(gap <= 0.05 ? k('lesionsTouch', { a: l.label, b: other.label }) : k('lesionGap', { a: l.label, b: other.label, mm: len(gap) }))
    }
  })

  // 6. Restante, axila e observações.
  L.push(k('remaining'))
  if (sp.axilla.present) {
    L.push(
      k('axilla', {
        nodes: sp.axilla.nodes !== null ? k('axillaNodes', { n: sp.axilla.nodes, largest: sp.axilla.largestMm !== null ? k('axillaLargest', { mm: len(sp.axilla.largestMm) }) : '' }) : '',
      }),
    )
  }
  if (sp.notes.trim()) L.push(sp.notes.trim())

  // 7. Chave de cassetes.
  L.push('', k('keyTitle'))
  plans.forEach((p) => {
    const l = p.lesion
    L.push(
      k('keyGrid', {
        span: labelSpan(p.grid),
        label: l.label,
        slice: p.central,
        rows: l.cassettes.rows,
        cols: l.cassettes.cols,
        rowFrom: marginName(p.rowDirection[0], t),
        rowTo: marginName(p.rowDirection[1], t),
        colFrom: marginName(p.colDirection[0], t),
        colTo: marginName(p.colDirection[1], t),
        size: `${fmtN(p.gridSizeU, 0, locale)} × ${fmtN(p.gridSizeV, 0, locale)} mm`,
      }),
    )
    const bySlice = new Map<number, typeof p.others>()
    for (const c of p.others) bySlice.set(c.slice, [...(bySlice.get(c.slice) ?? []), c])
    for (const [slice, defs] of bySlice) L.push(k('keyOther', { span: labelSpan(defs), label: l.label, slice }))
  })
  for (const x of m.extraCassettes) {
    if (!x.label.trim() && !x.description.trim()) continue
    L.push(k('keyExtra', { label: x.label.trim() || '?', description: x.description.trim() }))
  }

  return L.join('\n')
}

/** Onde a lesão está: quadrante/hora (mastectomia) ou quadrante informado (segmento). */
export function locationText(l: Lesion, m: MacroState, t: TFunction, locale: string): string {
  const sp = m.specimen
  const k = (key: string, params?: Record<string, unknown>) => t(`breast.macroText.${key}`, params ?? {})
  if (sp.type === 'mastectomy') {
    const q = derivedQuadrant(l)
    const clock = clockPosition(l, sp.side)
    if (clock.hour === null) return k('locationCentral')
    return k('locationMastectomy', { quadrant: t(`breast.quadrant.${q}`), hour: clock.hour, mm: fmtLen(clock.fromNippleMm, m.units, locale) })
  }
  if (sp.quadrant === 'auto' || sp.quadrant === 'unknown') return ''
  return k('locationSegment', { quadrant: t(`breast.quadrant.${sp.quadrant}`) })
}
