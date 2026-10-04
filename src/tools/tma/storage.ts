import { defaultField, type CoreAnswers, type TmaField, type TmaState } from './types'

/**
 * O mapa fica só no navegador — nada de TMA vai para o Firestore.
 *
 * A chave carrega o uid porque estações de trabalho em serviço de patologia
 * são compartilhadas: sem isso, o mapa de um patologista apareceria para o
 * próximo que entrasse no mesmo navegador.
 */
const PREFIX = 'patholytics.tma.v2'
/** Formato anterior: um único texto por core, sem campos. */
const LEGACY_PREFIX = 'patholytics.tma.v1'

export const storageKey = (uid: string | null | undefined) => `${PREFIX}:${uid ?? 'anon'}`
const legacyKey = (uid: string | null | undefined) => `${LEGACY_PREFIX}:${uid ?? 'anon'}`

interface LegacyState {
  rows: number
  cols: number
  results: Record<string, string>
  current: number
}

/** `legacyLabel` dá nome ao campo único que os mapas antigos ganham ao migrar. */
export function loadState(uid: string | null | undefined, legacyLabel: string): TmaState | null {
  try {
    const raw = localStorage.getItem(storageKey(uid))
    if (raw) return parseState(JSON.parse(raw) as Partial<TmaState>, legacyLabel)
    const legacy = localStorage.getItem(legacyKey(uid))
    if (!legacy) return null
    const migrated = migrate(JSON.parse(legacy) as Partial<LegacyState>, legacyLabel)
    if (migrated) {
      localStorage.setItem(storageKey(uid), JSON.stringify(migrated))
      localStorage.removeItem(legacyKey(uid))
    }
    return migrated
  } catch {
    // Storage bloqueado (modo privado, política do navegador) não é fatal.
    return null
  }
}

function parseState(parsed: Partial<TmaState>, legacyLabel: string): TmaState | null {
  if (!parsed || typeof parsed.rows !== 'number' || typeof parsed.cols !== 'number') return null
  const fields = Array.isArray(parsed.fields) ? parsed.fields.filter(isField) : []
  const results: Record<string, CoreAnswers> = {}
  for (const [key, value] of Object.entries(parsed.results ?? {})) {
    if (value && typeof value === 'object') results[key] = value as CoreAnswers
  }
  // Mapas gravados antes dos controles não têm o campo.
  const controls: Record<string, string> = {}
  for (const [key, value] of Object.entries(parsed.controls ?? {})) {
    if (typeof value === 'string') controls[key] = value
  }
  return {
    rows: parsed.rows,
    cols: parsed.cols,
    fields: fields.length > 0 ? fields : [defaultField(legacyLabel)],
    results,
    controls,
    current: typeof parsed.current === 'number' ? parsed.current : 0,
  }
}

function migrate(parsed: Partial<LegacyState>, legacyLabel: string): TmaState | null {
  if (!parsed || typeof parsed.rows !== 'number' || typeof parsed.cols !== 'number') return null
  const field = defaultField(legacyLabel)
  const results: Record<string, CoreAnswers> = {}
  for (const [key, value] of Object.entries(parsed.results ?? {})) {
    if (typeof value === 'string' && value.trim()) results[key] = { [field.id]: value }
  }
  return {
    rows: parsed.rows,
    cols: parsed.cols,
    fields: [field],
    results,
    controls: {},
    current: typeof parsed.current === 'number' ? parsed.current : 0,
  }
}

const isField = (value: unknown): value is TmaField => {
  if (!value || typeof value !== 'object') return false
  const field = value as Partial<TmaField>
  return (
    typeof field.id === 'string' &&
    typeof field.label === 'string' &&
    (field.kind === 'text' || field.kind === 'choice') &&
    Array.isArray(field.options)
  )
}

export function saveState(uid: string | null | undefined, state: TmaState): void {
  try {
    localStorage.setItem(storageKey(uid), JSON.stringify(state))
  } catch {
    // Sem persistência a ferramenta ainda funciona na sessão atual.
  }
}

export function clearState(uid: string | null | undefined): void {
  try {
    localStorage.removeItem(storageKey(uid))
    localStorage.removeItem(legacyKey(uid))
  } catch {
    // idem
  }
}
