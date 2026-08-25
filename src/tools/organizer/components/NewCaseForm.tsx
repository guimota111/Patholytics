import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { parseDeadlineInput, parseTags } from '../format'
import type { CaseList } from '../types'

interface Props {
  list: CaseList
  knownTags: string[]
  onCreate: (input: {
    title: string
    identifier: string
    stageId: string
    tags: string[]
    deadline: number | null
    notes: string
    firstLog: string
  }) => Promise<void>
}

export function NewCaseForm({ list, knownTags, onCreate }: Props) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [stageId, setStageId] = useState(list.stages[0]?.id ?? '')
  const [deadline, setDeadline] = useState('')
  const [tags, setTags] = useState('')
  const [firstLog, setFirstLog] = useState('')
  const [deadlineError, setDeadlineError] = useState(false)
  const [saving, setSaving] = useState(false)

  const identifierLabel = list.identifierLabel.trim() || t('organizer.case.identifier')

  const submit = async () => {
    const trimmed = title.trim()
    if (!trimmed) return
    const parsed = deadline.trim() ? parseDeadlineInput(deadline) : null
    if (deadline.trim() && parsed === null) {
      setDeadlineError(true)
      return
    }
    setSaving(true)
    await onCreate({
      title: trimmed,
      identifier: identifier.trim(),
      stageId: list.stages.some((stage) => stage.id === stageId) ? stageId : list.stages[0].id,
      tags: parseTags(tags),
      deadline: parsed,
      notes: '',
      firstLog: firstLog.trim(),
    })
    setSaving(false)
    setTitle('')
    setIdentifier('')
    setDeadline('')
    setTags('')
    setFirstLog('')
    setDeadlineError(false)
  }

  if (!open) {
    return (
      <Button type="button" variant="secondary" size="sm" onClick={() => setOpen(true)}>
        <Plus className="size-4" aria-hidden />
        {t('organizer.case.new')}
      </Button>
    )
  }

  return (
    <form
      className="w-full rounded-lg border border-line bg-elevated p-4"
      onSubmit={(event) => {
        event.preventDefault()
        void submit()
      }}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="space-y-1 text-xs font-medium text-ink sm:col-span-2">
          {t('organizer.case.title')}
          <input
            autoFocus
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            placeholder={t('organizer.case.titlePlaceholder')}
            className="h-9 w-full rounded-md border border-line bg-surface px-2.5 text-sm font-normal text-ink"
          />
        </label>
        <label className="space-y-1 text-xs font-medium text-ink">
          {identifierLabel}
          <input
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
            className="tabular h-9 w-full rounded-md border border-line bg-surface px-2.5 text-sm font-normal text-ink"
          />
        </label>
        <label className="space-y-1 text-xs font-medium text-ink">
          {t('organizer.case.stage')}
          <select
            value={stageId}
            onChange={(event) => setStageId(event.target.value)}
            className="h-9 w-full rounded-md border border-line bg-surface px-2 text-sm font-normal text-ink"
          >
            {list.stages.map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.emoji ? `${stage.emoji} ` : ''}
                {stage.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs font-medium text-ink">
          {t('organizer.case.deadline')}
          <input
            value={deadline}
            onChange={(event) => {
              setDeadline(event.target.value)
              setDeadlineError(false)
            }}
            placeholder={t('organizer.case.deadlinePlaceholder')}
            className={cn(
              'h-9 w-full rounded-md border bg-surface px-2.5 text-sm font-normal text-ink',
              deadlineError ? 'border-danger' : 'border-line',
            )}
          />
          <span className={cn('block text-[0.6875rem] font-normal', deadlineError ? 'text-danger' : 'text-ink-faint')}>
            {deadlineError ? t('organizer.case.deadlineInvalid') : t('organizer.case.deadlineHint')}
          </span>
        </label>
        <label className="space-y-1 text-xs font-medium text-ink">
          {t('organizer.case.tags')}
          <input
            value={tags}
            onChange={(event) => setTags(event.target.value)}
            list="organizer-known-tags"
            placeholder={t('organizer.case.tagsPlaceholder')}
            className="h-9 w-full rounded-md border border-line bg-surface px-2.5 text-sm font-normal text-ink"
          />
          <datalist id="organizer-known-tags">
            {knownTags.map((tag) => (
              <option key={tag} value={tag} />
            ))}
          </datalist>
        </label>
        <label className="space-y-1 text-xs font-medium text-ink sm:col-span-2">
          {t('organizer.case.firstLog')}
          <input
            value={firstLog}
            onChange={(event) => setFirstLog(event.target.value)}
            placeholder={t('organizer.case.firstLogPlaceholder')}
            className="h-9 w-full rounded-md border border-line bg-surface px-2.5 text-sm font-normal text-ink"
          />
        </label>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button type="submit" size="sm" loading={saving} disabled={!title.trim()}>
          {t('organizer.case.save')}
        </Button>
        <Button type="button" size="sm" variant="ghost" onClick={() => setOpen(false)}>
          {t('common.cancel')}
        </Button>
      </div>
    </form>
  )
}
