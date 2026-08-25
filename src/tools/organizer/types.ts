import type { Timestamp } from 'firebase/firestore'

/**
 * Uma etapa do fluxo. Nome, cor e emoji sao dados do usuario: nada aqui e
 * conhecido pelo codigo, que so sabe que casos ficam em uma etapa por vez.
 */
export interface Stage {
  id: string
  name: string
  /** Hex livre. Usada apenas como acento (ponto, borda), nunca como fundo de texto. */
  color: string
  /** Opcional — string vazia quando a etapa nao tem emoji. */
  emoji: string
}

export interface CaseList {
  id: string
  name: string
  stages: Stage[]
  /** Rotulo do campo de codigo: "FAP", "Acesso", "Requisicao"… */
  identifierLabel: string
  /** O ✓ com carimbo do organizador antigo, agora opcional por lista. */
  showReviewCheck: boolean
  order: number
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

export interface LogEntry {
  text: string
  ts: number
}

/**
 * Pendencia e um marcador transversal, nao uma etapa: um caso pode estar
 * pendente em qualquer ponto do fluxo sem perder onde estava.
 */
export interface PendingFlag {
  text: string
  since: number
}

export interface OrganizerCase {
  id: string
  title: string
  identifier: string
  stageId: string
  tags: string[]
  /** Instante do prazo em ms, ou null quando o caso nao tem prazo. */
  deadline: number | null
  archived: boolean
  archivedAt: number | null
  pending: PendingFlag | null
  log: LogEntry[]
  notes: string
  order: number
  reviewed: boolean
  reviewedAt: number | null
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

export type SortMode = 'manual' | 'deadline' | 'created' | 'alphabetical' | 'stage'

export const SORT_MODES: readonly SortMode[] = [
  'manual',
  'deadline',
  'created',
  'alphabetical',
  'stage',
] as const

/** Passo largo entre ordens para reordenar sem renumerar a lista inteira. */
export const ORDER_STEP = 1000

export const MAX_STAGES = 10

/**
 * Teto do plano gratuito, contando apenas casos ativos. Fica desligado ate
 * existir assinatura: bloquear alguem sem ter para onde mandar seria uma
 * parede sem porta.
 */
export const FREE_CASE_LIMIT = 10
export const ENFORCE_PLAN_LIMITS = false

const str = (v: unknown): string => (typeof v === 'string' ? v : '')
const num = (v: unknown): number | null => (typeof v === 'number' && Number.isFinite(v) ? v : null)

function sanitizeStage(raw: unknown, index: number): Stage {
  const p = (raw ?? {}) as Partial<Stage>
  return {
    id: str(p.id) || `stage-${index}`,
    name: str(p.name).slice(0, 40) || `#${index + 1}`,
    color: /^#[0-9a-f]{6}$/i.test(str(p.color)) ? str(p.color) : '#8a93a3',
    emoji: str(p.emoji).slice(0, 4),
  }
}

export function sanitizeList(id: string, raw: Record<string, unknown>): CaseList {
  const stages = Array.isArray(raw.stages) ? raw.stages.map(sanitizeStage).slice(0, MAX_STAGES) : []
  return {
    id,
    name: str(raw.name).slice(0, 60) || '—',
    // Uma lista sem nenhuma etapa nao teria onde pousar um caso.
    stages: stages.length ? stages : [{ id: 'default', name: '—', color: '#8a93a3', emoji: '' }],
    identifierLabel: str(raw.identifierLabel).slice(0, 24),
    showReviewCheck: raw.showReviewCheck === true,
    order: num(raw.order) ?? 0,
    createdAt: (raw.createdAt as Timestamp | undefined) ?? null,
    updatedAt: (raw.updatedAt as Timestamp | undefined) ?? null,
  }
}

function sanitizeLog(raw: unknown): LogEntry[] {
  if (!Array.isArray(raw)) return []
  return raw
    .map((entry) => {
      const p = (entry ?? {}) as Partial<LogEntry>
      return { text: str(p.text), ts: num(p.ts) ?? 0 }
    })
    .filter((entry) => entry.text.length > 0)
}

export function sanitizeCase(id: string, raw: Record<string, unknown>): OrganizerCase {
  const pending = (raw.pending ?? null) as Partial<PendingFlag> | null
  return {
    id,
    title: str(raw.title),
    identifier: str(raw.identifier),
    stageId: str(raw.stageId),
    tags: Array.isArray(raw.tags) ? raw.tags.filter((t): t is string => typeof t === 'string') : [],
    deadline: num(raw.deadline),
    archived: raw.archived === true,
    archivedAt: num(raw.archivedAt),
    pending: pending && str(pending.text) ? { text: str(pending.text), since: num(pending.since) ?? 0 } : null,
    log: sanitizeLog(raw.log),
    notes: str(raw.notes),
    order: num(raw.order) ?? 0,
    reviewed: raw.reviewed === true,
    reviewedAt: num(raw.reviewedAt),
    createdAt: (raw.createdAt as Timestamp | undefined) ?? null,
    updatedAt: (raw.updatedAt as Timestamp | undefined) ?? null,
  }
}

export function lastLogText(item: OrganizerCase): string {
  return item.log.length ? item.log[item.log.length - 1].text : ''
}
