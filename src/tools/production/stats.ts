/* ==========================================================================
   stats.ts — toda a conta do controle de produção, em funções puras:
   estatísticas de um dia, referências para os velocímetros, records,
   resumo por período e as barras do gráfico. Nada aqui toca a tela.
   ========================================================================== */

import { todayKey, type CaseEntry, type CurrentSession, type HistoryDay } from './types'

const ts = (iso: string) => new Date(iso).getTime()
const pad = (n: number) => String(n).padStart(2, '0')

/* ---- Formatação --------------------------------------------------------- */

/** "1:05:09" ou "05:09". */
export function formatClock(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000))
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

/** "1h 05m", "5m 09s", "9s" — ou "—" quando não há tempo. */
export function formatShort(ms: number): string {
  if (!ms || ms <= 0) return '—'
  const total = Math.floor(ms / 1000)
  const h = Math.floor(total / 3600)
  const m = Math.floor((total % 3600) / 60)
  const s = total % 60
  if (h > 0) return `${h}h ${pad(m)}m`
  if (m > 0) return `${m}m ${pad(s)}s`
  return `${s}s`
}

/* ---- Sessão em curso ---------------------------------------------------- */

const pauseTotal = (pauses: { start: string; end: string }[]) =>
  pauses.reduce((sum, p) => sum + Math.max(0, ts(p.end) - ts(p.start)), 0)

/** Tempo trabalhado da sessão em curso: do início até agora, sem as pausas. */
export function workingTime(session: CurrentSession, now: number): number {
  if (!session.workStartTime) return 0
  const end = session.dayEndTime ? ts(session.dayEndTime) : now
  let paused = pauseTotal(session.pauses)
  if (session.currentPauseStart) paused += end - ts(session.currentPauseStart)
  return Math.max(0, end - ts(session.workStartTime) - paused)
}

export function pausedTime(session: CurrentSession, now: number): number {
  let paused = pauseTotal(session.pauses)
  if (session.currentPauseStart) paused += now - ts(session.currentPauseStart)
  return paused
}

/** Duração de um caso entre dois instantes, descontadas as pausas sobrepostas. */
export function caseDurationBetween(session: CurrentSession, start: number, end: number): number {
  let duration = end - start
  for (const p of session.pauses) {
    const overlapStart = Math.max(ts(p.start), start)
    const overlapEnd = Math.min(ts(p.end), end)
    if (overlapEnd > overlapStart) duration -= overlapEnd - overlapStart
  }
  if (session.currentPauseStart) {
    const overlapStart = Math.max(ts(session.currentPauseStart), start)
    if (end > overlapStart) duration -= end - overlapStart
  }
  return Math.max(0, duration)
}

export function currentCaseDuration(session: CurrentSession, now: number): number {
  if (!session.currentCaseStart) return 0
  return caseDurationBetween(session, ts(session.currentCaseStart), now)
}

export const currentPauseDuration = (session: CurrentSession, now: number) =>
  session.currentPauseStart ? now - ts(session.currentPauseStart) : 0

export const currentFrozenDuration = (session: CurrentSession, now: number) =>
  session.frozenStart ? now - ts(session.frozenStart) : 0

export interface LiveStats {
  totalCases: number
  totalSlides: number
  workMs: number
  pauseMs: number
  avgPerCase: number
  avgPerSlide: number
}

export function liveStats(session: CurrentSession, now: number): LiveStats {
  const totalCases = session.cases.length
  const totalSlides = session.cases.reduce((sum, c) => sum + c.slides, 0)
  const casesMs = session.cases.reduce((sum, c) => sum + c.duration, 0)
  return {
    totalCases,
    totalSlides,
    workMs: workingTime(session, now),
    pauseMs: pausedTime(session, now),
    avgPerCase: totalCases > 0 ? casesMs / totalCases : 0,
    avgPerSlide: totalSlides > 0 ? casesMs / totalSlides : 0,
  }
}

/* ---- Um dia do histórico ------------------------------------------------ */

export interface DayStats {
  date: string
  totalCases: number
  ownCases: number
  thirdCases: number
  frozenCases: number
  totalSlides: number
  ownSlides: number
  thirdSlides: number
  frozenSlides: number
  totalMs: number
  ownMs: number
  thirdMs: number
  frozenMs: number
  avgPerCase: number
  avgPerSlide: number
  /** Tempo trabalhado = soma das durações dos casos. */
  workMs: number
  pauseMs: number
  sessionCount: number
  allCases: CaseEntry[]
}

export function dayStats(day: HistoryDay): DayStats {
  const allCases = day.sessions.flatMap((s) => s.cases)
  const pauseMs = day.sessions.reduce((sum, s) => sum + pauseTotal(s.pauses), 0)
  const own = allCases.filter((c) => !c.thirdParty)
  const third = allCases.filter((c) => c.thirdParty)
  const frozen = allCases.filter((c) => c.frozen)
  const sumMs = (list: CaseEntry[]) => list.reduce((sum, c) => sum + c.duration, 0)
  const sumSlides = (list: CaseEntry[]) => list.reduce((sum, c) => sum + c.slides, 0)
  const totalMs = sumMs(allCases)
  const totalSlides = sumSlides(allCases)
  return {
    date: day.date,
    totalCases: allCases.length,
    ownCases: own.length,
    thirdCases: third.length,
    frozenCases: frozen.length,
    totalSlides,
    ownSlides: sumSlides(own),
    thirdSlides: sumSlides(third),
    frozenSlides: sumSlides(frozen),
    totalMs,
    ownMs: sumMs(own),
    thirdMs: sumMs(third),
    frozenMs: sumMs(frozen),
    avgPerCase: allCases.length ? totalMs / allCases.length : 0,
    avgPerSlide: totalSlides ? totalMs / totalSlides : 0,
    workMs: totalMs,
    pauseMs,
    sessionCount: day.sessions.length,
    allCases,
  }
}

/* ---- Referências para os velocímetros ---------------------------------- */

export interface HistoryRefs {
  bestAvg: number
  generalAvg: number
  monthlyAvg: number
}

export function historyRefs(days: HistoryDay[], today = todayKey()): HistoryRefs | null {
  const month = today.slice(0, 7)
  let totalMs = 0
  let totalCases = 0
  let monthMs = 0
  let monthCases = 0
  let bestAvg = Infinity
  for (const day of days) {
    const s = dayStats(day)
    if (s.totalCases === 0 || s.avgPerCase <= 0) continue
    totalMs += s.totalMs
    totalCases += s.totalCases
    if (s.avgPerCase < bestAvg) bestAvg = s.avgPerCase
    if (day.date.startsWith(month)) {
      monthMs += s.totalMs
      monthCases += s.totalCases
    }
  }
  if (totalCases === 0) return null
  return {
    bestAvg: bestAvg === Infinity ? 0 : bestAvg,
    generalAvg: totalMs / totalCases,
    monthlyAvg: monthCases > 0 ? monthMs / monthCases : 0,
  }
}

/* ---- Records ------------------------------------------------------------- */

export interface RecordEntry {
  value: number
  /** Data (dia), rótulo da semana/mês, ou quantos dias compõem o período. */
  date?: string
  days?: number
  monthKey?: string
}

export interface Records {
  totalDays: number
  bestDayCases: RecordEntry | null
  bestDaySlides: RecordEntry | null
  bestDaySpeed: RecordEntry | null
  bestWeekCases: RecordEntry | null
  bestWeekSlides: RecordEntry | null
  bestMonthCases: RecordEntry | null
  bestMonthSlides: RecordEntry | null
}

/** Semana ISO: "2026-W37". */
export function weekKey(date: string): string {
  const d = new Date(`${date}T12:00:00`)
  const jan4 = new Date(d.getFullYear(), 0, 4)
  const startOfWeek = new Date(jan4)
  startOfWeek.setDate(jan4.getDate() - jan4.getDay() + 1)
  const week = Math.floor((d.getTime() - startOfWeek.getTime()) / 604_800_000) + 1
  return `${d.getFullYear()}-W${pad(week)}`
}

export function records(days: HistoryDay[]): Records | null {
  if (!days.length) return null
  const stats = days.map(dayStats)
  const maxBy = <T>(list: T[], key: (item: T) => number): T | null =>
    list.length ? list.reduce((best, item) => (key(item) > key(best) ? item : best), list[0]) : null

  const bestCases = maxBy(stats, (s) => s.totalCases)
  const bestSlides = maxBy(stats, (s) => s.totalSlides)
  const withSpeed = stats.filter((s) => s.avgPerCase > 0)
  const bestSpeed = withSpeed.length
    ? withSpeed.reduce((best, s) => (s.avgPerCase < best.avgPerCase ? s : best), withSpeed[0])
    : null

  const group = (key: (date: string) => string) => {
    const map = new Map<string, { cases: number; slides: number; days: number }>()
    for (const s of stats) {
      const k = key(s.date)
      const bucket = map.get(k) ?? { cases: 0, slides: 0, days: 0 }
      bucket.cases += s.totalCases
      bucket.slides += s.totalSlides
      bucket.days += 1
      map.set(k, bucket)
    }
    return [...map.entries()]
  }
  const weeks = group(weekKey)
  const months = group((date) => date.slice(0, 7))
  const bestWeekCases = maxBy(weeks, ([, w]) => w.cases)
  const bestWeekSlides = maxBy(weeks, ([, w]) => w.slides)
  const bestMonthCases = maxBy(months, ([, m]) => m.cases)
  const bestMonthSlides = maxBy(months, ([, m]) => m.slides)

  return {
    totalDays: days.length,
    bestDayCases: bestCases ? { value: bestCases.totalCases, date: bestCases.date } : null,
    bestDaySlides: bestSlides ? { value: bestSlides.totalSlides, date: bestSlides.date } : null,
    bestDaySpeed: bestSpeed ? { value: bestSpeed.avgPerCase, date: bestSpeed.date } : null,
    bestWeekCases: bestWeekCases ? { value: bestWeekCases[1].cases, days: bestWeekCases[1].days } : null,
    bestWeekSlides: bestWeekSlides ? { value: bestWeekSlides[1].slides, days: bestWeekSlides[1].days } : null,
    bestMonthCases: bestMonthCases ? { value: bestMonthCases[1].cases, monthKey: bestMonthCases[0] } : null,
    bestMonthSlides: bestMonthSlides ? { value: bestMonthSlides[1].slides, monthKey: bestMonthSlides[0] } : null,
  }
}

/* ---- Estatísticas por período ------------------------------------------- */

export type Period = 'week' | 'month' | 'year' | 'all'
export type Segment = 'all' | 'own' | 'third' | 'frozen'

export const PERIODS: Period[] = ['week', 'month', 'year', 'all']
export const SEGMENTS: Segment[] = ['all', 'own', 'third', 'frozen']

export interface PeriodSummary {
  cases: number
  slides: number
  days: number
  avgPerCase: number
  avgPerSlide: number
  workMs: number
  /** Totais por segmento, para os chips — independem do segmento escolhido. */
  ownCases: number
  thirdCases: number
  frozenCases: number
}

export interface ChartItem {
  label: string
  value: number
  own: number
  third: number
  frozen: number
}

function inPeriod(date: string, period: Period, now: Date): boolean {
  if (period === 'all') return true
  const today = todayKey(now)
  if (period === 'month') return date.slice(0, 7) === today.slice(0, 7)
  if (period === 'year') return date.slice(0, 4) === today.slice(0, 4)
  const weekAgo = new Date(now)
  weekAgo.setDate(weekAgo.getDate() - 6)
  return new Date(`${date}T12:00:00`) >= weekAgo
}

const segmentCases = (s: DayStats, segment: Segment) =>
  segment === 'own' ? s.ownCases : segment === 'third' ? s.thirdCases : segment === 'frozen' ? s.frozenCases : s.totalCases
const segmentSlides = (s: DayStats, segment: Segment) =>
  segment === 'own' ? s.ownSlides : segment === 'third' ? s.thirdSlides : segment === 'frozen' ? s.frozenSlides : s.totalSlides
const segmentMs = (s: DayStats, segment: Segment) =>
  segment === 'own' ? s.ownMs : segment === 'third' ? s.thirdMs : segment === 'frozen' ? s.frozenMs : s.totalMs

export function periodSummary(days: HistoryDay[], period: Period, segment: Segment, now = new Date()): PeriodSummary {
  const stats = days.filter((d) => inPeriod(d.date, period, now)).map(dayStats)
  let cases = 0
  let slides = 0
  let ms = 0
  let workMs = 0
  let ownCases = 0
  let thirdCases = 0
  let frozenCases = 0
  for (const s of stats) {
    ownCases += s.ownCases
    thirdCases += s.thirdCases
    frozenCases += s.frozenCases
    workMs += s.workMs
    cases += segmentCases(s, segment)
    slides += segmentSlides(s, segment)
    ms += segmentMs(s, segment)
  }
  return {
    cases,
    slides,
    days: stats.length,
    avgPerCase: cases ? ms / cases : 0,
    avgPerSlide: slides ? ms / slides : 0,
    workMs,
    ownCases,
    thirdCases,
    frozenCases,
  }
}

/**
 * Colunas do gráfico: os últimos 7 dias, os dias do mês corrente, ou um mês
 * por coluna (ano / geral). Rótulos vêm prontos no idioma pedido.
 */
export function chartItems(days: HistoryDay[], period: Period, segment: Segment, locale: string, now = new Date()): ChartItem[] {
  const stats = new Map(days.filter((d) => inPeriod(d.date, period, now)).map((d) => [d.date, dayStats(d)]))
  const item = (label: string, s: DayStats | undefined): ChartItem => ({
    label,
    value: s ? segmentCases(s, segment) : 0,
    own: s?.ownCases ?? 0,
    third: s?.thirdCases ?? 0,
    frozen: s?.frozenCases ?? 0,
  })

  if (period === 'week') {
    const out: ChartItem[] = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now)
      d.setDate(d.getDate() - i)
      const key = todayKey(d)
      const label = d.toLocaleDateString(locale, { weekday: 'short' }).replace('.', '')
      out.push(item(label, stats.get(key)))
    }
    return out
  }

  if (period === 'month') {
    const year = now.getFullYear()
    const month = now.getMonth()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const out: ChartItem[] = []
    for (let day = 1; day <= daysInMonth; day++) {
      const key = `${year}-${pad(month + 1)}-${pad(day)}`
      // Só o dia 1 e os múltiplos de 5 levam rótulo, senão o eixo vira ruído.
      out.push(item(day === 1 || day % 5 === 0 ? String(day) : '', stats.get(key)))
    }
    return out
  }

  const byMonth = new Map<string, DayStats[]>()
  for (const s of stats.values()) {
    const key = s.date.slice(0, 7)
    byMonth.set(key, [...(byMonth.get(key) ?? []), s])
  }
  return [...byMonth.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([key, list]) => {
      const [y, m] = key.split('-').map(Number)
      const label = new Date(y, m - 1, 1).toLocaleDateString(locale, { month: 'short' }).replace('.', '')
      const merged = list.reduce(
        (acc, s) => ({
          own: acc.own + s.ownCases,
          third: acc.third + s.thirdCases,
          frozen: acc.frozen + s.frozenCases,
          value: acc.value + segmentCases(s, segment),
        }),
        { own: 0, third: 0, frozen: 0, value: 0 },
      )
      return { label, ...merged }
    })
}

/* ---- Geometria dos gráficos --------------------------------------------- */

/** Dois caminhos SVG (trabalho e pausa) numa torta de raio 48 centrada em 55,55. */
export function pieSegments(workMs: number, pauseMs: number): { work: string; pause: string } {
  const total = workMs + pauseMs
  if (total === 0) return { work: '', pause: '' }
  const cx = 55
  const cy = 55
  const r = 48
  const share = workMs / total
  const full = `M ${cx} ${cy - r} A ${r} ${r} 0 1 1 ${cx - 0.01} ${cy - r} Z`
  if (share >= 0.9999) return { work: full, pause: '' }
  if (share <= 0.0001) return { work: '', pause: full }
  const angle = share * 360
  const rad = ((angle - 90) * Math.PI) / 180
  const ex = +(cx + r * Math.cos(rad)).toFixed(2)
  const ey = +(cy + r * Math.sin(rad)).toFixed(2)
  const large = angle > 180 ? 1 : 0
  return {
    work: `M ${cx} ${cy} L ${cx} ${cy - r} A ${r} ${r} 0 ${large} 1 ${ex} ${ey} Z`,
    pause: `M ${cx} ${cy} L ${ex} ${ey} A ${r} ${r} 0 ${1 - large} 1 ${cx} ${cy - r} Z`,
  }
}

/** Escala do velocímetro: 1 min (rápido) a 30 min (lento) por caso. */
const SPEED_MIN = 60_000
const SPEED_MAX = 1_800_000

/** 0 = lento, 1 = rápido; -1 quando não há valor. */
export function speedPosition(ms: number): number {
  if (!ms || ms <= 0) return -1
  return 1 - (Math.min(Math.max(ms, SPEED_MIN), SPEED_MAX) - SPEED_MIN) / (SPEED_MAX - SPEED_MIN)
}
