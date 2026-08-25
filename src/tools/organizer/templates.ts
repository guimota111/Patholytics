import type { Stage } from './types'

/**
 * Paleta sugerida. A cor da etapa e livre (input type=color), mas comecar de
 * uma lista pronta evita que a primeira lista saia toda cinza.
 */
export const STAGE_PALETTE = [
  '#8a93a3',
  '#f59e0b',
  '#22c55e',
  '#fb923c',
  '#3b82f6',
  '#7c5cff',
  '#ef4444',
  '#ec4899',
  '#14b8a6',
  '#a3a3a3',
] as const

export const STAGE_EMOJI_SUGGESTIONS = ['⬜', '🟡', '✅', '🟠', '🔵', '⏳', '🔴', '🟢', '📌', '🔬']

interface TemplateStage {
  /** Chave em `organizer.stageNames` — o nome so vira dado ao criar a lista. */
  nameKey: string
  color: string
  emoji: string
}

export interface ListTemplate {
  id: string
  stages: TemplateStage[]
}

/**
 * Modelos de fluxo. O usuario escolhe um ao criar a lista e edita as etapas
 * depois; nada aqui volta a ser consultado — as etapas viram dado da lista.
 */
export const LIST_TEMPLATES: ListTemplate[] = [
  {
    id: 'surgicalPathology',
    stages: [
      { nameKey: 'notSeen', color: '#8a93a3', emoji: '⬜' },
      { nameKey: 'seenNotReported', color: '#f59e0b', emoji: '🟡' },
      { nameKey: 'reported', color: '#22c55e', emoji: '✅' },
      { nameKey: 'partiallyEmbedded', color: '#fb923c', emoji: '🟠' },
      { nameKey: 'others', color: '#3b82f6', emoji: '🔵' },
    ],
  },
  {
    id: 'simple',
    stages: [
      { nameKey: 'todo', color: '#8a93a3', emoji: '' },
      { nameKey: 'inProgress', color: '#3b82f6', emoji: '' },
      { nameKey: 'waiting', color: '#f59e0b', emoji: '' },
      { nameKey: 'done', color: '#22c55e', emoji: '' },
    ],
  },
  {
    id: 'research',
    stages: [
      { nameKey: 'selected', color: '#8a93a3', emoji: '' },
      { nameKey: 'blocks', color: '#fb923c', emoji: '' },
      { nameKey: 'staining', color: '#7c5cff', emoji: '' },
      { nameKey: 'analysis', color: '#3b82f6', emoji: '' },
      { nameKey: 'written', color: '#22c55e', emoji: '' },
    ],
  },
  {
    id: 'blank',
    stages: [{ nameKey: 'todo', color: '#8a93a3', emoji: '' }],
  },
]

export function newStageId(): string {
  return `s${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`
}

/** Materializa um modelo em etapas concretas, com os nomes ja traduzidos. */
export function stagesFromTemplate(
  template: ListTemplate,
  translate: (nameKey: string) => string,
): Stage[] {
  return template.stages.map((stage) => ({
    id: newStageId(),
    name: translate(stage.nameKey),
    color: stage.color,
    emoji: stage.emoji,
  }))
}
