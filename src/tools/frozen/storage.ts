/* ==========================================================================
   storage.ts — o documento em curso fica no navegador, por usuário: uma
   congelação dura uma hora, o cronômetro precisa sobreviver a um refresh, e
   nada disso é histórico. As sugestões (cirurgião, patologista, hospital,
   e-mail) também ficam aqui.
   ========================================================================== */

import { sanitizeMohsDoc } from './mohs'
import { defaultCongDoc, sanitizeCongDoc, type CongDoc, type MohsDoc } from './types'

const CONG_KEY = 'patholytics.frozen.cong.v1'
const MOHS_KEY = 'patholytics.frozen.mohs.v1'
const SUGGESTION_PREFIX = 'patholytics.frozen.suggest.v1'

const keyFor = (prefix: string, uid: string | null | undefined) => `${prefix}:${uid ?? 'anon'}`

function read(key: string): unknown {
  try {
    const raw = localStorage.getItem(key)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // quota / navegação privada
  }
}

export function loadCongDoc(uid: string | null): CongDoc {
  const raw = read(keyFor(CONG_KEY, uid))
  return raw ? sanitizeCongDoc(raw) : defaultCongDoc()
}

export const saveCongDoc = (uid: string | null, doc: CongDoc) => write(keyFor(CONG_KEY, uid), doc)

export function loadMohsDoc(uid: string | null): MohsDoc {
  return sanitizeMohsDoc(read(keyFor(MOHS_KEY, uid)))
}

export const saveMohsDoc = (uid: string | null, doc: MohsDoc) => write(keyFor(MOHS_KEY, uid), doc)

export type SuggestionKey = 'cirurgiao' | 'patologista' | 'mohs_hospital' | 'mohs_cirurgiao' | 'mohs_patologista' | 'email_para'

export function loadSuggestions(uid: string | null, key: SuggestionKey): string[] {
  const raw = read(`${keyFor(SUGGESTION_PREFIX, uid)}:${key}`)
  return Array.isArray(raw) ? raw.filter((v): v is string => typeof v === 'string') : []
}

/** Guarda os últimos 20, mais recente primeiro. */
export function rememberSuggestion(uid: string | null, key: SuggestionKey, value: string): void {
  const trimmed = value.trim()
  if (!trimmed) return
  const list = loadSuggestions(uid, key).filter((v) => v !== trimmed)
  list.unshift(trimmed)
  write(`${keyFor(SUGGESTION_PREFIX, uid)}:${key}`, list.slice(0, 20))
}
