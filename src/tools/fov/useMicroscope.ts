import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { DEFAULT_PREFS, type FlowPrefs } from './flow'
import { DEFAULT_CONFIG, type MicroscopeConfig } from './optics'
import { loadConfig, loadPrefs, saveConfig, savePrefs } from './storage'

/** Configuração do microscópio e escolhas do fluxo, persistidas no navegador por usuário. */
export function useMicroscope() {
  const { user } = useAuth()
  const uid = user?.uid ?? null

  const [config, setConfig] = useState<MicroscopeConfig>(DEFAULT_CONFIG)
  const [prefs, setPrefs] = useState<FlowPrefs>(DEFAULT_PREFS)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setConfig(loadConfig(uid))
    setPrefs(loadPrefs(uid))
    setHydrated(true)
  }, [uid])

  useEffect(() => {
    if (!hydrated) return
    saveConfig(uid, config)
  }, [hydrated, uid, config])

  useEffect(() => {
    if (!hydrated) return
    savePrefs(uid, prefs)
  }, [hydrated, uid, prefs])

  const update = useCallback((patch: Partial<MicroscopeConfig>) => {
    setConfig((current) => ({ ...current, ...patch }))
  }, [])

  const updatePrefs = useCallback((patch: Partial<FlowPrefs>) => {
    setPrefs((current) => ({ ...current, ...patch }))
  }, [])

  const reset = useCallback(() => setConfig(DEFAULT_CONFIG), [])

  return { config, update, reset, prefs, updatePrefs, hydrated }
}
