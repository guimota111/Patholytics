import { DEFAULT_PREFS, REFERENCE_FIELDS, type FlowPrefs, type RefId } from './flow'
import { DEFAULT_CONFIG, type MicroscopeConfig } from './optics'

/**
 * A configuração do microscópio e as escolhas do fluxo ficam no navegador,
 * por usuário — mesma razão do mapa de TMA: estações de trabalho são
 * compartilhadas.
 */
const PREFIX = 'patholytics.fov.v1'
const PREFS_PREFIX = 'patholytics.fov.prefs.v1'

export const storageKey = (uid: string | null | undefined) => `${PREFIX}:${uid ?? 'anon'}`
const prefsKey = (uid: string | null | undefined) => `${PREFS_PREFIX}:${uid ?? 'anon'}`

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

const REF_IDS: RefId[] = ['mine', 'custom', ...REFERENCE_FIELDS.map((r) => r.id)]

export function loadPrefs(uid: string | null | undefined): FlowPrefs {
  try {
    const raw = localStorage.getItem(prefsKey(uid))
    if (!raw) return DEFAULT_PREFS
    const p = JSON.parse(raw) as Partial<FlowPrefs>
    return {
      setting: p.setting === 'microscope' || p.setting === 'tele' ? p.setting : null,
      objective: typeof p.objective === 'number' && p.objective > 0 ? p.objective : DEFAULT_PREFS.objective,
      refId: REF_IDS.includes(p.refId as RefId) ? (p.refId as RefId) : DEFAULT_PREFS.refId,
      refCustom: typeof p.refCustom === 'number' && p.refCustom > 0 ? p.refCustom : DEFAULT_PREFS.refCustom,
    }
  } catch {
    return DEFAULT_PREFS
  }
}

export function savePrefs(uid: string | null | undefined, prefs: FlowPrefs): void {
  try {
    localStorage.setItem(prefsKey(uid), JSON.stringify(prefs))
  } catch {
    // idem
  }
}
