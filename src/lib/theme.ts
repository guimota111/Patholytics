/**
 * Theme preference: light, dark, or follow the OS. The resolved theme is the
 * `dark` class on <html>; the light palette is the default in index.css.
 *
 * index.html carries an inline copy of `resolve` + `apply` so the first paint
 * already uses the right palette — keep the two in sync.
 */

export type ThemePreference = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export const THEME_PREFERENCES: ThemePreference[] = ['light', 'dark', 'system']

const STORAGE_KEY = 'patholytics.theme'
const THEME_COLOR: Record<ResolvedTheme, string> = { light: '#f4f5f7', dark: '#0a0e14' }

const listeners = new Set<() => void>()
const media = typeof window !== 'undefined' ? window.matchMedia('(prefers-color-scheme: dark)') : null

function isPreference(value: unknown): value is ThemePreference {
  return value === 'light' || value === 'dark' || value === 'system'
}

export function getPreference(): ThemePreference {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    return isPreference(stored) ? stored : 'system'
  } catch {
    return 'system'
  }
}

export function resolveTheme(preference: ThemePreference = getPreference()): ResolvedTheme {
  if (preference === 'system') return media?.matches ? 'dark' : 'light'
  return preference
}

function apply() {
  const resolved = resolveTheme()
  document.documentElement.classList.toggle('dark', resolved === 'dark')
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', THEME_COLOR[resolved])
  listeners.forEach((fn) => fn())
}

export function setPreference(preference: ThemePreference) {
  try {
    if (preference === 'system') localStorage.removeItem(STORAGE_KEY)
    else localStorage.setItem(STORAGE_KEY, preference)
  } catch {
    // Private mode or blocked storage: the choice still applies to this tab.
  }
  apply()
}

/** Subscribe to preference or OS changes (for useSyncExternalStore). */
export function subscribe(listener: () => void) {
  listeners.add(listener)
  const onMedia = () => apply()
  const onStorage = (event: StorageEvent) => {
    if (event.key === STORAGE_KEY) apply()
  }
  media?.addEventListener('change', onMedia)
  window.addEventListener('storage', onStorage)
  return () => {
    listeners.delete(listener)
    media?.removeEventListener('change', onMedia)
    window.removeEventListener('storage', onStorage)
  }
}
