/* ==========================================================================
   types.ts — controle de produção: a sessão de trabalho em andamento e o
   histórico por dia. Um caso é o intervalo entre o fim do caso anterior e o
   momento em que o patologista registra este, descontadas as pausas; o dia
   pode ter várias sessões (manhã e tarde) e cada uma guarda os seus casos.

   Herdado do "Controle de Laudos" (Assistente-trabalho), formato preservado
   para que um histórico exportado de lá entre aqui sem conversão.
   ========================================================================== */

import type { DocumentData } from 'firebase/firestore'

export type SessionState = 'idle' | 'working' | 'paused' | 'ended'

export interface CaseEntry {
  id: number
  startTime: string
  endTime: string
  slides: number
  /** ms, já descontadas as pausas que caíram dentro do caso. */
  duration: number
  /** Segunda assinatura / caso de terceiro. */
  thirdParty?: boolean
  /** Congelação (exame per-operatório). */
  frozen?: boolean
}

export interface Pause {
  start: string
  end: string
}

export interface CurrentSession {
  state: SessionState
  /** YYYY-MM-DD local. */
  date: string
  workStartTime: string | null
  currentCaseStart: string | null
  cases: CaseEntry[]
  pauses: Pause[]
  currentPauseStart: string | null
  dayEndTime: string | null
  /** Marcado quando uma congelação está em curso. */
  frozenStart: string | null
}

export interface HistorySession {
  workStartTime: string | null
  dayEndTime: string | null
  cases: CaseEntry[]
  pauses: Pause[]
}

export interface HistoryDay {
  date: string
  sessions: HistorySession[]
}

export const MAX_SLIDES = 999

const pad = (n: number) => String(n).padStart(2, '0')

/** Data local, não UTC: a sessão da noite não pode virar "amanhã". */
export function todayKey(now: Date = new Date()): string {
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
}

export function emptySession(date = todayKey()): CurrentSession {
  return {
    state: 'idle',
    date,
    workStartTime: null,
    currentCaseStart: null,
    cases: [],
    pauses: [],
    currentPauseStart: null,
    dayEndTime: null,
    frozenStart: null,
  }
}

const str = (v: unknown): string | null => (typeof v === 'string' && v ? v : null)
const num = (v: unknown, fallback = 0): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback)

export function sanitizeCase(raw: unknown, index: number): CaseEntry {
  const p = (raw ?? {}) as Partial<CaseEntry>
  const entry: CaseEntry = {
    id: num(p.id, index + 1),
    startTime: str(p.startTime) ?? '',
    endTime: str(p.endTime) ?? '',
    slides: Math.max(0, Math.round(num(p.slides))),
    duration: Math.max(0, num(p.duration)),
  }
  if (p.thirdParty === true) entry.thirdParty = true
  if (p.frozen === true) entry.frozen = true
  return entry
}

function sanitizePauses(raw: unknown): Pause[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((p) => ({ start: str((p as Pause)?.start) ?? '', end: str((p as Pause)?.end) ?? '' }))
    .filter((p) => p.start && p.end)
}

function sanitizeCases(raw: unknown): CaseEntry[] {
  return Array.isArray(raw) ? raw.map(sanitizeCase) : []
}

export function sanitizeSession(raw: DocumentData | undefined): CurrentSession {
  const p = (raw ?? {}) as Partial<CurrentSession>
  const state: SessionState = p.state === 'working' || p.state === 'paused' || p.state === 'ended' ? p.state : 'idle'
  return {
    state,
    date: str(p.date) ?? todayKey(),
    workStartTime: str(p.workStartTime),
    currentCaseStart: str(p.currentCaseStart),
    cases: sanitizeCases(p.cases),
    pauses: sanitizePauses(p.pauses),
    currentPauseStart: str(p.currentPauseStart),
    dayEndTime: str(p.dayEndTime),
    frozenStart: str(p.frozenStart),
  }
}

/** Aceita o formato novo (`sessions[]`) e o antigo (campos direto no dia). */
export function sanitizeDay(id: string, raw: DocumentData): HistoryDay {
  const date = str(raw.date) ?? id
  const sessions: HistorySession[] = Array.isArray(raw.sessions)
    ? raw.sessions.map((s: Partial<HistorySession>) => ({
        workStartTime: str(s?.workStartTime),
        dayEndTime: str(s?.dayEndTime),
        cases: sanitizeCases(s?.cases),
        pauses: sanitizePauses(s?.pauses),
      }))
    : [
        {
          workStartTime: str(raw.workStartTime),
          dayEndTime: str(raw.dayEndTime),
          cases: sanitizeCases(raw.cases),
          pauses: sanitizePauses(raw.pauses),
        },
      ]
  return { date, sessions }
}

/** Sessão encerrada, no formato em que entra no histórico. */
export function toHistorySession(session: CurrentSession): HistorySession {
  return {
    workStartTime: session.workStartTime,
    dayEndTime: session.dayEndTime ?? new Date().toISOString(),
    cases: session.cases,
    pauses: session.pauses,
  }
}
