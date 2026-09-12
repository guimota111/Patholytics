/* ==========================================================================
   report.ts — o montador de laudo. O patologista escreve o texto que quiser
   e deixa parâmetros entre colchetes (`[gleason]`, `[margens]`…); cada um é
   trocado pelo valor calculado do caso. Aqui vivem a lista de parâmetros,
   a substituição e os modelos guardados por usuário.
   ========================================================================== */

import type { TFunction } from 'i18next'
import type { Analysis, MarginFocus, SiteRef } from './analysis'
import { fmtN, gleasonText, joinList } from './format'
import { DEFAULT_REPORT_ID, type CaseState, type ReportStore, type ReportTemplate, type Side } from './types'

export type ParamGroup = 'grade' | 'extent' | 'margins' | 'other' | 'staging'

export interface ReportParam {
  /** Vai entre colchetes no texto: `[gleason]`. Estável entre idiomas. */
  key: string
  label: string
  value: string
  group: ParamGroup
}

export const PARAM_GROUPS: ParamGroup[] = ['grade', 'extent', 'margins', 'other', 'staging']

/** Todos os parâmetros que um modelo pode puxar, já com o valor deste caso. */
export function buildParams(state: CaseState, a: Analysis, t: TFunction, locale: string): ReportParam[] {
  const n = (v: number | null | undefined, d = 1) => fmtN(v, d, locale)
  const r = (key: string, params?: Record<string, unknown>) => t(`prostate.report.values.${key}`, params ?? {})
  const { globals } = state
  const has = a.involvedCells > 0

  const sideName = (side: Side) => r(side === 'D' ? 'sideRight' : side === 'E' ? 'sideLeft' : 'sideBoth')
  /** "lobo esquerdo posterior" — o nome que o usuário deu ao grupo, ou o sítio anatômico. */
  const siteName = (s: SiteRef) => {
    if (s.groupName) return s.groupName.charAt(0).toLowerCase() + s.groupName.slice(1)
    const base = t(`prostate.site.${s.site}`)
    return s.side === 'B' ? base : `${base} ${sideName(s.side)}`
  }
  /** Em português o adjetivo concorda: "invasão não detectada" mas "carcinoma não detectado". */
  const presence = (v: 'notAssessed' | 'absent' | 'present', masculine = false) =>
    r(v === 'present' ? 'present' : v === 'absent' ? (masculine ? 'notDetectedM' : 'notDetected') : masculine ? 'notAssessedM' : 'notAssessed')

  /** Uma margem: livre, ou comprometida com extensão, padrão e sítio. */
  const marginText = (foci: MarginFocus[], withSite: boolean) => {
    if (!foci.length) return r('marginFree')
    const maxMm = foci.reduce((m, f) => Math.max(m, f.mm ?? 0), 0)
    const extent = r(maxMm > 3 ? 'marginExtensive' : 'marginFocal')
    const sites = [...new Set(foci.map(siteName))]
    const details: string[] = []
    const totalMm = foci.reduce((s, f) => s + (f.mm ?? 0), 0)
    if (totalMm > 0) details.push(r('marginMm', { mm: n(totalMm) }))
    const patterns = [...new Set(foci.map((f) => f.pattern).filter((p) => p !== null))].sort()
    if (patterns.length) details.push(r('marginPattern', { p: patterns.join(', ') }))
    const where = withSite && sites.length ? ` ${r('in')} ${joinList(sites, t('prostate.summary.and'))}` : ''
    const detail = details.length ? ` (${details.join(', ')})` : ''
    return `${extent}${where}${detail}`
  }
  const foci = a.margins.foci
  const circumferential = foci.filter((f) => !['apical', 'basal', 'seminalVesicle', 'vasDeferens'].includes(f.site))
  const apical = foci.filter((f) => f.site === 'apical')
  const basal = foci.filter((f) => f.site === 'basal')

  const svSides = new Set<Side>(a.svCells.map((c) => c.side))
  if (globals.seminalVesicles === 'right') svSides.add('D')
  if (globals.seminalVesicles === 'left') svSides.add('E')
  if (globals.seminalVesicles === 'bilateral') svSides.add('B')
  const sidesText = (sides: Set<Side>) =>
    sides.has('B') || (sides.has('D') && sides.has('E')) ? r('sideBoth') : sides.has('D') ? r('sideRight') : r('sideLeft')
  const vasSides = new Set<Side>(a.cells.filter((c) => c.cell.tissue === 'vasDeferens' && c.tumor > 0).map((c) => c.cell.side))
  const vasMapped = a.cells.some((c) => c.cell.tissue === 'vasDeferens')

  const epeSites = [...new Set(a.epe.cells.map((e) => siteName(e.site)))]

  const P = (key: string, group: ParamGroup, value: string): ReportParam => ({
    key,
    label: t(`prostate.report.params.${key}`),
    value,
    group,
  })

  return [
    P('gleason', 'grade', a.gleason ? gleasonText(a.gleason) : '—'),
    P('grupo', 'grade', a.gleason ? String(a.gleason.gradeGroup) : '—'),
    P('g4', 'grade', a.shares ? n(a.shares.p4, 0) : '—'),
    P('g5', 'grade', a.shares ? n(a.shares.p5, 0) : '—'),
    P(
      'cribriforme',
      'grade',
      a.cribriformOfG4 === null ? r('notAssessedM') : a.cribriformOfG4 > 0 ? r('cribPresent', { pct: n(a.cribriformOfG4, 0) }) : r('notDetectedM'),
    ),
    P('idc', 'grade', presence(a.idc, true)),
    P('volume', 'extent', has ? n(a.volumePct, 0) : '—'),
    P('cassetes', 'extent', r('cassettes', { n: a.involvedCells, total: a.prostateCells })),
    P('lateralidade', 'extent', a.laterality ? t(`prostate.laterality.${a.laterality}`) : '—'),
    P(
      'nodulo',
      'extent',
      globals.noduleMmA !== null || globals.noduleMmB !== null
        ? [globals.noduleMmA, globals.noduleMmB].filter((v) => v !== null).map((v) => n(v)).join(' × ')
        : '—',
    ),
    P('peso', 'extent', globals.weightGrams !== null ? n(globals.weightGrams) : '—'),
    P('ivl', 'extent', presence(globals.lymphovascular)),
    P('perineural', 'extent', presence(globals.perineural)),
    P(
      'vesiculas',
      'extent',
      svSides.size ? r('svPresent', { side: sidesText(svSides) }) : globals.seminalVesicles === 'notIdentified' && !a.svCells.length ? r('svNotIdentified') : r('notDetected'),
    ),
    P('ductos', 'extent', vasSides.size ? r('svPresent', { side: sidesText(vasSides) }) : vasMapped ? r('notDetected') : r('notAssessed')),
    P(
      'eep',
      'extent',
      a.epe.cells.length
        ? r('epePresent', {
            status: t(`prostate.epe.${a.epe.status}`),
            n: a.epe.cells.length,
            total: a.prostateCells,
            sites: joinList(epeSites, t('prostate.summary.and')),
          })
        : r('notDetected'),
    ),
    P('colo', 'extent', globals.bladderNeck === 'involved' ? r('present') : globals.bladderNeck === 'free' ? r('bladderNeckFree') : r('notAssessed')),
    P('margens', 'margins', foci.length ? `${r('marginWord')} ${marginText(foci, true)}` : r('marginsFree')),
    P('margem_circunferencial', 'margins', marginText(circumferential, true)),
    P('margem_apical', 'margins', marginText(apical, false)),
    P('margem_vesical', 'margins', marginText(basal, false)),
    P('nip', 'other', presence(globals.hgpin)),
    P(
      'linfonodos',
      'other',
      a.lnCells.length || (globals.lnTotal ?? 0) > 0 || (globals.lnPositive ?? 0) > 0
        ? r('lymphNodes', { positive: (globals.lnPositive ?? 0) + a.lnCells.length, total: globals.lnTotal ?? 0 })
        : r('notAssessed'),
    ),
    P('pT', 'staging', a.staging.pT ? a.staging.pT.slice(2) : '—'),
    P('pN', 'staging', a.staging.pN.slice(2)),
  ]
}

const TOKEN = /\[([^[\]\n]{1,40})\]/g

/** Troca cada `[chave]` pelo valor; colchetes sem chave conhecida ficam como estão (são lacunas do usuário). */
export function renderReport(text: string, params: ReportParam[]): string {
  const byKey = new Map(params.map((p) => [p.key.toLowerCase(), p.value]))
  return text.replace(TOKEN, (match, raw: string) => {
    const value = byKey.get(raw.trim().toLowerCase())
    return value === undefined ? match : value
  })
}

/** Chaves usadas no texto que não existem — para avisar o usuário. */
export function unknownTokens(text: string, params: ReportParam[]): string[] {
  const known = new Set(params.map((p) => p.key.toLowerCase()))
  const out = new Set<string>()
  for (const m of text.matchAll(TOKEN)) {
    const key = m[1].trim()
    if (key && !known.has(key.toLowerCase()) && /^[\p{L}_]+$/u.test(key)) out.add(key)
  }
  return [...out]
}

export const defaultTemplate = (t: TFunction): ReportTemplate => ({
  id: DEFAULT_REPORT_ID,
  name: t('prostate.report.defaultName'),
  text: t('prostate.report.defaultTemplate'),
})

/* -------------------------------------------------------------- guardado */

const REPORT_PREFIX = 'patholytics.prostate.reports.v1'
const reportKey = (uid: string | null | undefined) => `${REPORT_PREFIX}:${uid ?? 'anon'}`

let seq = 0
export const newReportId = () => `r${Date.now().toString(36)}${(seq++).toString(36)}`

export function loadReports(uid: string | null | undefined, t: TFunction): ReportStore {
  const fallback: ReportStore = { templates: [defaultTemplate(t)], selectedId: DEFAULT_REPORT_ID }
  try {
    const raw = localStorage.getItem(reportKey(uid))
    if (!raw) return fallback
    const p = JSON.parse(raw) as Partial<ReportStore>
    const templates = (Array.isArray(p.templates) ? p.templates : [])
      .filter((x): x is ReportTemplate => !!x && typeof x.id === 'string' && typeof x.name === 'string' && typeof x.text === 'string')
    if (!templates.some((x) => x.id === DEFAULT_REPORT_ID)) templates.unshift(defaultTemplate(t))
    const selectedId = templates.some((x) => x.id === p.selectedId) ? (p.selectedId as string) : DEFAULT_REPORT_ID
    return { templates, selectedId }
  } catch {
    return fallback
  }
}

export function saveReports(uid: string | null | undefined, store: ReportStore): void {
  try {
    localStorage.setItem(reportKey(uid), JSON.stringify(store))
  } catch {
    // sem persistência o modelo vale só nesta sessão
  }
}
