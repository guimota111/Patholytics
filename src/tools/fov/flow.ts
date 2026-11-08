/**
 * O fluxo do conversor: onde o patologista está laudando, qual é o campo de
 * referência dele e o que ele quer saber. As contas ficam em optics.ts; aqui
 * só os tipos e as opções que os passos oferecem.
 */

import { areaOfDiameter, fieldArea, fieldDiameter, isConfigValid, type MicroscopeConfig } from './optics'

export type Setting = 'microscope' | 'tele'

/** No microscópio: o tamanho do campo, converter uma contagem, ou quantos campos um tumor pede. */
export type MicroscopeGoal = 'fieldSize' | 'convertCount' | 'tumor'
/** Na tele: quantos mm² são N campos, converter uma contagem por área, ou quanta área um tumor pede. */
export type TeleGoal = 'fieldsToArea' | 'convertArea' | 'tumor'
export type Goal = MicroscopeGoal | TeleGoal

export const MICROSCOPE_GOALS: MicroscopeGoal[] = ['fieldSize', 'convertCount', 'tumor']
export const TELE_GOALS: TeleGoal[] = ['fieldsToArea', 'convertArea', 'tumor']

/**
 * Campos de referência que as máscaras e os protocolos assumem quando dizem
 * "10 campos de grande aumento" sem medir nada (diâmetro em mm, no 40×).
 */
export const REFERENCE_FIELDS: { id: string; diameter: number; label: string }[] = [
  { id: '0.55', diameter: 0.55, label: 'CAP · NET, útero' },
  { id: '0.50', diameter: 0.5, label: 'ocular 10×/20' },
  { id: '0.47', diameter: 0.47, label: 'FNCLCC' },
  { id: '0.663', diameter: 0.663, label: 'ovário (Silverberg)' },
  { id: '0.45', diameter: 0.45, label: 'linfoma folicular' },
]

export type RefId = 'mine' | 'custom' | (typeof REFERENCE_FIELDS)[number]['id']

/** O "campo" com que todas as contas de um fluxo são feitas. */
export interface FieldRef {
  /** Diâmetro no plano da lâmina (mm). */
  diameter: number
  /** Área do campo (mm²). */
  area: number
  /** Objetiva a que o campo se refere; a referência da tele é sempre "grande aumento" (40×). */
  objective: number
  /** De onde veio: do microscópio configurado ou de um valor de referência. */
  source: 'microscope' | 'reference'
}

export const HPF_OBJECTIVE = 40

export function microscopeField(config: MicroscopeConfig, objective: number): FieldRef | null {
  if (!isConfigValid(config) || !(objective > 0)) return null
  return { diameter: fieldDiameter(config, objective), area: fieldArea(config, objective), objective, source: 'microscope' }
}

export function referenceField(refId: RefId, custom: number, config: MicroscopeConfig): FieldRef | null {
  if (refId === 'mine') return microscopeField(config, HPF_OBJECTIVE)
  const diameter = refId === 'custom' ? custom : (REFERENCE_FIELDS.find((r) => r.id === refId)?.diameter ?? NaN)
  if (!(diameter > 0)) return null
  return { diameter, area: areaOfDiameter(diameter), objective: HPF_OBJECTIVE, source: 'reference' }
}

/** Preferências do fluxo, guardadas com a configuração do microscópio. */
export interface FlowPrefs {
  setting: Setting | null
  objective: number
  refId: RefId
  refCustom: number
}

export const DEFAULT_PREFS: FlowPrefs = { setting: null, objective: HPF_OBJECTIVE, refId: '0.55', refCustom: 0.55 }
