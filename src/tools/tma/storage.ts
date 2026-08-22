import type { TmaState } from './types'

/**
 * O mapa fica so no navegador — nada de TMA vai para o Firestore.
 *
 * A chave carrega o uid porque estacoes de trabalho em servico de patologia
 * sao compartilhadas: sem isso, o mapa de um patologista apareceria para o
 * proximo que entrasse no mesmo navegador.
 */
const PREFIX = 'patholytics.tma.v1'

export const storageKey = (uid: string | null | undefined) => `${PREFIX}:${uid ?? 'anon'}`

export function loadState(uid: string | null | undefined): TmaState | null {
  try {
    const raw = localStorage.getItem(storageKey(uid))
    if (!raw) return null
    const parsed = JSON.parse(raw) as Partial<TmaState>
    if (!parsed || typeof parsed.rows !== 'number' || typeof parsed.cols !== 'number') return null
    return {
      rows: parsed.rows,
      cols: parsed.cols,
      results: parsed.results ?? {},
      current: typeof parsed.current === 'number' ? parsed.current : 0,
    }
  } catch {
    // Storage bloqueado (modo privado, politica do navegador) nao e fatal.
    return null
  }
}

export function saveState(uid: string | null | undefined, state: TmaState): void {
  try {
    localStorage.setItem(storageKey(uid), JSON.stringify(state))
  } catch {
    // Sem persistencia a ferramenta ainda funciona na sessao atual.
  }
}

export function clearState(uid: string | null | undefined): void {
  try {
    localStorage.removeItem(storageKey(uid))
  } catch {
    // idem
  }
}
