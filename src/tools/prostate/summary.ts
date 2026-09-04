/* ==========================================================================
   summary.ts — texto com os parâmetros calculados, para o patologista redigir
   o laudo. Não é um laudo: é o conjunto de números e localizações.
   ========================================================================== */

import type { TFunction } from 'i18next'
import type { Analysis, RegionResult, SiteRef } from './analysis'
import { compactLabels, fmtN, gleasonText, joinList } from './format'
import type { CaseState } from './types'

export function buildSummary(state: CaseState, a: Analysis, t: TFunction, locale: string): string {
  const n = (v: number | null | undefined, d = 1) => fmtN(v, d, locale)
  const L: string[] = []
  const k = (key: string, params?: Record<string, unknown>) => t(`prostate.summary.${key}`, params ?? {})
  const and = t('prostate.summary.and')
  const site = (s: SiteRef) => {
    const name = s.site === 'other' && s.groupName ? s.groupName : t(`prostate.site.${s.site}`)
    return s.side === 'B' ? name : `${name} ${t(`prostate.side.${s.side}`)}`
  }

  if (!a.involvedCells && !a.margins.foci.length && !a.epe.cells.length && !a.svCells.length) return ''

  const { mapping, globals } = state
  L.push(k('header'))
  L.push(k('grid', { cells: mapping.total, groups: mapping.groups.length, prostate: a.prostateCells }))
  L.push(k(globals.g45Mode === 'ofTumor' ? 'modeOfTumor' : 'modeOfCassette'))

  L.push('', k('volumeTitle'))
  L.push(k('involved', { n: a.involvedCells, total: a.prostateCells }))
  L.push(k('volume', { pct: n(a.volumePct) }))
  if (a.tumorGrams !== null) L.push(k('grams', { g: n(a.tumorGrams, 2), weight: n(globals.weightGrams, 1) }))

  L.push('', k('gradeTitle'))
  if (a.gleason && a.shares) {
    const g = a.gleason
    L.push(k('gleason', { text: gleasonText(g), gg: g.gradeGroup }))
    L.push(k('patterns', { p3: n(a.shares.p3), p4: n(a.shares.p4), p5: n(a.shares.p5) }))
    if (g.tertiary) L.push(k('tertiary', { pattern: g.tertiary.pattern, pct: n(g.tertiary.pct) }))
    if (g.ignoredMinor) L.push(k('ignoredMinor', { pattern: g.ignoredMinor.pattern, pct: n(g.ignoredMinor.pct) }))
  } else {
    L.push(k('noTumor'))
  }
  if (a.cribriformOfG4 !== null) {
    L.push(k('cribriform', { pct: n(a.cribriformOfG4), ofTumor: n(a.cribriformOfTumor) }))
  } else {
    L.push(k('cribriformNone'))
  }
  const idcLabel = t(`prostate.presence.${a.idc}`)
  L.push(
    a.idcCells.length
      ? k('idcCells', { value: idcLabel, cells: compactLabels(a.idcCells.map((c) => c.label)) })
      : k('idc', { value: idcLabel }),
  )

  L.push('', k('locationTitle'))
  const regionLine = (r: RegionResult, name: string) =>
    k('region', {
      name,
      involved: r.cellsInvolved,
      total: r.cellsTotal,
      region: n(r.pctOfRegion),
      gland: n(r.pctOfGland),
      gleason: gleasonText(r.gleason),
      gg: r.gleason?.gradeGroup ?? '—',
    })
  const involvedGroups = a.byGroup.filter((r) => r.cellsInvolved)
  involvedGroups.forEach((r) => L.push(regionLine(r, r.name || t('prostate.unmappedGroup'))))
  if (a.laterality) L.push(k('laterality', { value: t(`prostate.laterality.${a.laterality}`) }))
  const involvedCells = a.cells.filter((c) => c.tumor > 0 && c.cell.tissue === 'prostate')
  if (involvedCells.length) L.push(k('cellsList', { cells: compactLabels(involvedCells.map((c) => c.cell.label)) }))

  L.push('', k('marginsTitle'))
  if (a.margins.foci.length) {
    L.push(k('marginsInvolved', { n: a.margins.foci.length }))
    for (const f of a.margins.foci) {
      L.push(
        k('marginFocus', {
          site: site(f),
          label: f.cell.label,
          mm: f.mm !== null ? `${n(f.mm)} mm` : '—',
          pattern: f.pattern ?? '—',
        }),
      )
    }
    if (a.margins.totalMm > 0) {
      L.push(
        k('marginExtent', {
          total: n(a.margins.totalMm),
          max: n(a.margins.maxMm),
          extent: t(`prostate.results.${a.margins.extent}`),
        }),
      )
    }
    if (a.margins.patterns.length) L.push(k('marginPatterns', { patterns: a.margins.patterns.join(', ') }))
  } else {
    L.push(k('marginsFree'))
  }

  L.push('', k('epeTitle'))
  if (a.epe.cells.length) {
    const sites = [...new Set(a.epe.cells.map((e) => site(e.site)))]
    L.push(
      k('epePresent', {
        status: t(`prostate.epe.${a.epe.status}`),
        sites: joinList(sites, and),
        cells: compactLabels(a.epe.cells.map((e) => e.cell.label)),
      }),
    )
  } else {
    L.push(k('epeAbsent'))
  }

  L.push('', k('otherTitle'))
  if (a.svCells.length) {
    L.push(k('seminalVesiclesCells', { cells: compactLabels(a.svCells.map((c) => c.label)) }))
  } else {
    L.push(k('seminalVesicles', { value: t(`prostate.sv.${globals.seminalVesicles}`) }))
  }
  L.push(k('bladderNeck', { value: t(`prostate.bn.${globals.bladderNeck}`) }))
  L.push(k('perineural', { value: t(`prostate.presence.${globals.perineural}`) }))
  L.push(k('lymphovascular', { value: t(`prostate.presence.${globals.lymphovascular}`) }))
  if (globals.adjacentInvasion) L.push(k('adjacentInvasion'))
  if (a.lnCells.length) L.push(k('lymphNodeCells', { cells: compactLabels(a.lnCells.map((c) => c.label)) }))
  if ((globals.lnTotal ?? 0) > 0 || (globals.lnPositive ?? 0) > 0) {
    L.push(k('lymphNodes', { positive: globals.lnPositive ?? 0, total: globals.lnTotal ?? 0 }))
  }

  L.push('', k('stagingTitle'))
  L.push(k('staging', { pT: a.staging.pT ?? '—', pN: a.staging.pN, r: a.staging.r ?? '—' }))

  return L.join('\n')
}
