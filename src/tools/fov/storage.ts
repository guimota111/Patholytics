import { DEFAULT_CONFIG, type MicroscopeConfig } from './optics'

/**
 * A configuração do microscópio fica no navegador, por usuário — mesma razão
 * do mapa de TMA: estações de trabalho são compartilhadas.
 */
const PREFIX = 'patholytics.fov.v1'

export const storageKey = (uid: string | null | undefined) => `${PREFIX}:${uid ?? 'anon'}`

export function loadConfig(uid: string | null | undefined): MicroscopeConfig {
  try {
    const raw = localStorage.getItem(storageKey(uid))
    if (!raw) return DEFAULT_CONFIG
    const p = JSON.parse(raw) as Partial<MicroscopeConfig>
    return {
      mode: p.mode === 'measured' ? 'measured' : 'fieldNumber',
      fieldNumber: typeof p.fieldNumber === 'number' ? p.fieldNumber : DEFAULT_CONFIG.fieldNumber,
      tubeFactor: typeof p.tubeFactor === 'number' ? p.tubeFactor : DEFAULT_CONFIG.tubeFactor,
      measuredObjective:
        typeof p.measuredObjective === 'number' ? p.measuredObjective : DEFAULT_CONFIG.measuredObjective,
      measuredDiameterMm:
        typeof p.measuredDiameterMm === 'number' ? p.measuredDiameterMm : DEFAULT_CONFIG.measuredDiameterMm,
    }
  } catch {
    return DEFAULT_CONFIG
  }
}

export function saveConfig(uid: string | null | undefined, config: MicroscopeConfig): void {
  try {
    localStorage.setItem(storageKey(uid), JSON.stringify(config))
  } catch {
    // sem persistência a ferramenta continua funcionando na sessão
  }
}
