import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { DEFAULT_CONFIG, type MicroscopeConfig } from './optics'
import { loadConfig, saveConfig } from './storage'

/** Configuração do microscópio do usuário, persistida no navegador. */
export function useMicroscope() {
  const { user } = useAuth()
  const uid = user?.uid ?? null

  const [config, setConfig] = useState<MicroscopeConfig>(DEFAULT_CONFIG)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setConfig(loadConfig(uid))
    setHydrated(true)
  }, [uid])

  useEffect(() => {
    if (!hydrated) return
    saveConfig(uid, config)
  }, [hydrated, uid, config])

  const update = useCallback((patch: Partial<MicroscopeConfig>) => {
    setConfig((current) => ({ ...current, ...patch }))
  }, [])

  const reset = useCallback(() => setConfig(DEFAULT_CONFIG), [])

  return { config, update, reset, hydrated }
}
