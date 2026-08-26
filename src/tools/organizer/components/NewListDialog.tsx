import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { LIST_TEMPLATES, stagesFromTemplate } from '../templates'
import type { Stage } from '../types'
import { Modal } from '@/components/ui/Modal'

interface Props {
  onClose: () => void
  onCreate: (input: { name: string; stages: Stage[]; identifierLabel: string }) => Promise<void>
}

export function NewListDialog({ onClose, onCreate }: Props) {
  const { t } = useTranslation()
  const [name, setName] = useState('')
  const [identifierLabel, setIdentifierLabel] = useState('')
  const [templateId, setTemplateId] = useState(LIST_TEMPLATES[0].id)
  const [saving, setSaving] = useState(false)

  const submit = async () => {
    const trimmed = name.trim()
    if (!trimmed) return
    const template = LIST_TEMPLATES.find((entry) => entry.id === templateId) ?? LIST_TEMPLATES[0]
    setSaving(true)
    await onCreate({
      name: trimmed,
      identifierLabel: identifierLabel.trim(),
      stages: stagesFromTemplate(template, (key) => t(`organizer.stageNames.${key}`)),
    })
    setSaving(false)
    onClose()
  }

  return (
    <Modal
      title={t('organizer.newList.title')}
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="button" size="sm" loading={saving} disabled={!name.trim()} onClick={() => void submit()}>
            {t('organizer.newList.create')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <label className="space-y-1 text-xs font-medium text-ink">
          {t('organizer.settings.name')}
          <input
            autoFocus
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder={t('organizer.newList.namePlaceholder')}
            className="h-9 w-full rounded-md border border-line bg-surface px-2.5 text-sm font-normal text-ink"
          />
        </label>

        <label className="space-y-1 text-xs font-medium text-ink">
          {t('organizer.settings.identifierLabel')}
          <input
            value={identifierLabel}
            onChange={(event) => setIdentifierLabel(event.target.value)}
            placeholder={t('organizer.case.identifier')}
            className="h-9 w-full rounded-md border border-line bg-surface px-2.5 text-sm font-normal text-ink"
          />
          <span className="block text-[0.6875rem] font-normal text-ink-faint">
            {t('organizer.settings.identifierHint')}
          </span>
        </label>

        <div className="space-y-2">
          <p className="text-xs font-medium text-ink">{t('organizer.newList.template')}</p>
          {LIST_TEMPLATES.map((template) => {
            const stages = template.stages.map((stage) => t(`organizer.stageNames.${stage.nameKey}`))
            return (
              <button
                key={template.id}
                type="button"
                onClick={() => setTemplateId(template.id)}
                aria-pressed={templateId === template.id}
                className={cn(
                  'w-full rounded-md border px-3 py-2.5 text-left transition-colors',
                  templateId === template.id
                    ? 'border-accent bg-accent-soft'
                    : 'border-line bg-surface hover:border-line-strong',
                )}
              >
                <span className="block text-sm font-medium text-ink">
                  {t(`organizer.templates.${template.id}`)}
                </span>
                <span className="mt-1 flex flex-wrap gap-1.5">
                  {template.stages.map((stage, index) => (
                    <span
                      key={stage.nameKey}
                      className="flex items-center gap-1 text-[0.6875rem] text-ink-muted"
                    >
                      <span
                        className="size-2 rounded-full"
                        style={{ backgroundColor: stage.color }}
                        aria-hidden
                      />
                      {stages[index]}
                    </span>
                  ))}
                </span>
              </button>
            )
          })}
        </div>
      </div>
    </Modal>
  )
}
