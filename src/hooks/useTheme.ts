import { useCallback, useSyncExternalStore } from 'react'
import {
  getPreference,
  resolveTheme,
  setPreference,
  subscribe,
  type ThemePreference,
} from '@/lib/theme'

export function useTheme() {
  const preference = useSyncExternalStore(subscribe, getPreference, () => 'system' as ThemePreference)
  const resolved = useSyncExternalStore(subscribe, () => resolveTheme(), () => 'light' as const)
  const set = useCallback((next: ThemePreference) => setPreference(next), [])
  return { preference, resolved, setPreference: set }
}
