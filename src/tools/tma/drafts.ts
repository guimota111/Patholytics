import { newFieldId, parseOptions, type TmaField, type TmaFieldKind } from './types'

/**
 * Enquanto o usuário edita, as opções ficam numa string só (“0, 1+, 2+”),
 * senão uma vírgula recém-digitada sumiria a cada tecla. Converte-se ao salvar.
 */
export interface FieldDraft {
  id: string
  label: string
  kind: TmaFieldKind
  optionsText: string
}

export const newDraft = (label = '', kind: TmaFieldKind = 'text', optionsText = ''): FieldDraft => ({
  id: newFieldId(),
  label,
  kind,
  optionsText,
})

export const draftsFrom = (fields: TmaField[]): FieldDraft[] =>
  fields.map((field) => ({ id: field.id, label: field.label, kind: field.kind, optionsText: field.options.join(', ') }))

export const fieldsFrom = (drafts: FieldDraft[]): TmaField[] =>
  drafts.map((draft) => ({
    id: draft.id,
    label: draft.label,
    kind: draft.kind,
    options: draft.kind === 'choice' ? parseOptions(draft.optionsText) : [],
  }))
