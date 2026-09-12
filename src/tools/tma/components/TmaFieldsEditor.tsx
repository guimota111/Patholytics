import { useTranslation } from 'react-i18next'
import { Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { compactInputClass, selectClass } from '@/components/ui/fields'
import { newDraft, type FieldDraft } from '../drafts'
import { MAX_FIELDS, type TmaFieldKind } from '../types'

/** Atalhos para o que mais se anota num TMA. */
const PRESETS: { key: string; kind: TmaFieldKind; options: string }[] = [
  { key: 'intensity', kind: 'choice', options: '0, 1+, 2+, 3+' },
  { key: 'percent', kind: 'text', options: '' },
  { key: 'posneg', kind: 'choice', options: '' },
  { key: 'missing', kind: 'choice', options: '' },
  { key: 'note', kind: 'text', options: '' },
]

interface TmaFieldsEditorProps {
  drafts: FieldDraft[]
  onChange: (drafts: FieldDraft[]) => void
}

export function TmaFieldsEditor({ drafts, onChange }: TmaFieldsEditorProps) {
  const { t } = useTranslation()
  const full = drafts.length >= MAX_FIELDS

  const update = (id: string, patch: Partial<FieldDraft>) =>
    onChange(drafts.map((draft) => (draft.id === id ? { ...draft, ...patch } : draft)))
  const remove = (id: string) => onChange(drafts.filter((draft) => draft.id !== id))
  const add = (draft: FieldDraft) => {
    if (full) return
    onChange([...drafts, draft])
  }

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {drafts.map((draft, i) => (
          <li key={draft.id} className="rounded-md border border-line bg-surface p-3">
            <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_9rem_auto]">
              <input
                value={draft.label}
                onChange={(event) => update(draft.id, { label: event.target.value })}
                placeholder={t('tma.fieldLabelPlaceholder')}
                aria-label={t('tma.fieldLabel', { n: i + 1 })}
                className={compactInputClass}
              />
              <select
                value={draft.kind}
                onChange={(event) => update(draft.id, { kind: event.target.value as TmaFieldKind })}
                aria-label={t('tma.fieldKind')}
                className={`${selectClass} h-8`}
              >
                <option value="text">{t('tma.kindText')}</option>
                <option value="choice">{t('tma.kindChoice')}</option>
              </select>
              <button
                type="button"
                onClick={() => remove(draft.id)}
                disabled={drafts.length <= 1}
                aria-label={t('tma.removeField')}
                title={t('tma.removeField')}
                className="flex h-8 w-8 items-center justify-center justify-self-end rounded-md text-ink-faint transition-colors hover:bg-raised hover:text-danger disabled:cursor-not-allowed disabled:opacity-40"
              >
                <Trash2 className="size-4" aria-hidden />
              </button>
            </div>
            {draft.kind === 'choice' && (
              <input
                value={draft.optionsText}
                onChange={(event) => update(draft.id, { optionsText: event.target.value })}
                placeholder={t('tma.fieldOptionsPlaceholder')}
                aria-label={t('tma.fieldOptions')}
                className={`${compactInputClass} mt-2`}
              />
            )}
          </li>
        ))}
      </ul>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="secondary" onClick={() => add(newDraft())} disabled={full}>
          <Plus className="size-4" aria-hidden />
          {t('tma.addField')}
        </Button>
        <span className="text-xs text-ink-faint">{t('tma.maxFields', { n: MAX_FIELDS })}</span>
      </div>

      <div className="flex flex-wrap items-center gap-1.5">
        <span className="mr-1 text-xs text-ink-faint">{t('tma.presets')}</span>
        {PRESETS.map((preset) => {
          const label = t(`tma.preset.${preset.key}`)
          const options = preset.options || t(`tma.presetOptions.${preset.key}`, { defaultValue: '' })
          return (
            <button
              key={preset.key}
              type="button"
              disabled={full}
              onClick={() => add(newDraft(label, preset.kind, options))}
              className="rounded-full border border-line bg-surface px-2.5 py-1 text-xs text-ink-muted transition-colors hover:border-accent hover:text-accent-ink disabled:cursor-not-allowed disabled:opacity-40"
            >
              + {label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
