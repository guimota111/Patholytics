import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronUp, Plus, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { LIST_TEMPLATES, STAGE_EMOJI_SUGGESTIONS, newStageId, stagesFromTemplate } from '../templates'
import { MAX_STAGES, type CaseList, type Stage } from '../types'
import { Modal } from '@/components/ui/Modal'

export interface ListSettingsResult {
  name: string
  identifierLabel: string
  showReviewCheck: boolean
  stages: Stage[]
  /** Etapa antiga → etapa de destino, para os casos que ficariam orfaos. */
  reassign: Record<string, string>
}

interface Props {
  list: CaseList
  countsByStage: Map<string, number>
  canDelete: boolean
  onClose: () => void
  onSave: (result: ListSettingsResult) => Promise<void>
  onDelete: () => Promise<void>
}

export function ListSettings({ list, countsByStage, canDelete, onClose, onSave, onDelete }: Props) {
  const { t } = useTranslation()
  const [name, setName] = useState(list.name)
  const [identifierLabel, setIdentifierLabel] = useState(list.identifierLabel)
  const [showReviewCheck, setShowReviewCheck] = useState(list.showReviewCheck)
  const [stages, setStages] = useState<Stage[]>(list.stages)
  const [reassign, setReassign] = useState<Record<string, string>>({})
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [saving, setSaving] = useState(false)

  /**
   * Etapas que sumiram do rascunho e ainda tem casos. Enquanto existirem, o
   * usuario precisa dizer para onde esses casos vao — apagar uma etapa nunca
   * apaga caso nenhum.
   */
  const orphaned = useMemo(
    () =>
      list.stages.filter(
        (stage) => !stages.some((draft) => draft.id === stage.id) && (countsByStage.get(stage.id) ?? 0) > 0,
      ),
    [list.stages, stages, countsByStage],
  )

  const patchStage = (id: string, changes: Partial<Stage>) =>
    setStages((current) => current.map((stage) => (stage.id === id ? { ...stage, ...changes } : stage)))

  const moveStage = (index: number, delta: number) =>
    setStages((current) => {
      const target = index + delta
      if (target < 0 || target >= current.length) return current
      const next = [...current]
      const [moved] = next.splice(index, 1)
      next.splice(target, 0, moved)
      return next
    })

  const applyTemplate = (templateId: string) => {
    const template = LIST_TEMPLATES.find((entry) => entry.id === templateId)
    if (!template) return
    const next = stagesFromTemplate(template, (key) => t(`organizer.stageNames.${key}`))
    setStages(next)
    // Mapeamento inicial por posicao: quem estava na 2a etapa tende a
    // pertencer a 2a etapa do novo fluxo.
    const mapping: Record<string, string> = {}
    list.stages.forEach((stage, index) => {
      mapping[stage.id] = (next[index] ?? next[next.length - 1]).id
    })
    setReassign(mapping)
  }

  const destinationFor = (stageId: string) => reassign[stageId] ?? stages[0]?.id ?? ''

  const save = async () => {
    if (!name.trim() || !stages.length) return
    setSaving(true)
    const mapping: Record<string, string> = {}
    for (const stage of orphaned) mapping[stage.id] = destinationFor(stage.id)
    await onSave({
      name: name.trim(),
      identifierLabel: identifierLabel.trim(),
      showReviewCheck,
      stages: stages.map((stage) => ({ ...stage, name: stage.name.trim() || '—' })),
      reassign: mapping,
    })
    setSaving(false)
  }

  return (
    <Modal
      title={t('organizer.settings.title')}
      onClose={onClose}
      wide
      footer={
        <>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="button" size="sm" loading={saving} onClick={() => void save()} disabled={!name.trim()}>
            {t('common.save')}
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="space-y-1 text-xs font-medium text-ink">
            {t('organizer.settings.name')}
            <input
              value={name}
              onChange={(event) => setName(event.target.value)}
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
        </div>

        <label className="flex items-start gap-2 text-xs text-ink">
          <input
            type="checkbox"
            checked={showReviewCheck}
            onChange={(event) => setShowReviewCheck(event.target.checked)}
            className="mt-0.5 size-4"
          />
          <span>
            <span className="font-medium">{t('organizer.settings.reviewCheck')}</span>
            <span className="block text-[0.6875rem] text-ink-faint">
              {t('organizer.settings.reviewCheckHint')}
            </span>
          </span>
        </label>

        <div className="space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-xs font-medium text-ink">{t('organizer.settings.stages')}</p>
            <select
              value=""
              onChange={(event) => applyTemplate(event.target.value)}
              className="h-8 rounded-md border border-line bg-surface px-2 text-xs text-ink-muted"
            >
              <option value="">{t('organizer.settings.applyTemplate')}</option>
              {LIST_TEMPLATES.map((template) => (
                <option key={template.id} value={template.id}>
                  {t(`organizer.templates.${template.id}`)}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-2">
            {stages.map((stage, index) => (
              <div key={stage.id} className="flex items-center gap-2 rounded-md border border-line bg-surface px-2 py-2">
                <input
                  type="color"
                  value={stage.color}
                  onChange={(event) => patchStage(stage.id, { color: event.target.value })}
                  aria-label={t('organizer.settings.stageColor')}
                  className="size-7 shrink-0 cursor-pointer rounded border border-line bg-transparent p-0.5"
                />
                <input
                  value={stage.emoji}
                  onChange={(event) => patchStage(stage.id, { emoji: event.target.value.slice(0, 4) })}
                  list="organizer-stage-emoji"
                  aria-label={t('organizer.settings.stageEmoji')}
                  className="h-8 w-11 shrink-0 rounded-md border border-line bg-elevated px-1 text-center text-sm"
                />
                <input
                  value={stage.name}
                  onChange={(event) => patchStage(stage.id, { name: event.target.value.slice(0, 40) })}
                  aria-label={t('organizer.settings.stageName')}
                  className="h-8 min-w-0 flex-1 rounded-md border border-line bg-elevated px-2 text-sm text-ink"
                />
                <span className="tabular hidden w-8 shrink-0 text-right text-xs text-ink-faint sm:block">
                  {countsByStage.get(stage.id) ?? 0}
                </span>
                <button
                  type="button"
                  onClick={() => moveStage(index, -1)}
                  disabled={index === 0}
                  aria-label={t('organizer.row.moveUp')}
                  className="rounded p-1 text-ink-faint hover:text-ink disabled:opacity-30"
                >
                  <ChevronUp className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => moveStage(index, 1)}
                  disabled={index === stages.length - 1}
                  aria-label={t('organizer.row.moveDown')}
                  className="rounded p-1 text-ink-faint hover:text-ink disabled:opacity-30"
                >
                  <ChevronDown className="size-4" aria-hidden />
                </button>
                <button
                  type="button"
                  onClick={() => setStages((current) => current.filter((entry) => entry.id !== stage.id))}
                  disabled={stages.length === 1}
                  aria-label={t('organizer.settings.removeStage')}
                  className="rounded p-1 text-ink-faint hover:text-danger disabled:opacity-30"
                >
                  <Trash2 className="size-4" aria-hidden />
                </button>
              </div>
            ))}
            <datalist id="organizer-stage-emoji">
              {STAGE_EMOJI_SUGGESTIONS.map((emoji) => (
                <option key={emoji} value={emoji} />
              ))}
            </datalist>
          </div>

          <Button
            type="button"
            size="sm"
            variant="ghost"
            disabled={stages.length >= MAX_STAGES}
            onClick={() =>
              setStages((current) => [
                ...current,
                { id: newStageId(), name: '', color: '#8a93a3', emoji: '' },
              ])
            }
          >
            <Plus className="size-4" aria-hidden />
            {stages.length >= MAX_STAGES
              ? t('organizer.settings.stageLimit', { max: MAX_STAGES })
              : t('organizer.settings.addStage')}
          </Button>
        </div>

        {orphaned.length > 0 && (
          <div className="space-y-2 rounded-md border border-amber-500/40 bg-amber-500/5 px-3 py-3">
            <p className="text-xs font-medium text-ink">{t('organizer.settings.reassignTitle')}</p>
            <p className="text-[0.6875rem] text-ink-muted">{t('organizer.settings.reassignHint')}</p>
            {orphaned.map((stage) => (
              <div key={stage.id} className="flex flex-wrap items-center gap-2 text-xs text-ink">
                <span className="flex items-center gap-1.5">
                  <span className="size-2.5 rounded-full" style={{ backgroundColor: stage.color }} aria-hidden />
                  {stage.name}
                  <span className="tabular text-ink-faint">({countsByStage.get(stage.id) ?? 0})</span>
                </span>
                <span className="text-ink-faint">→</span>
                <select
                  value={destinationFor(stage.id)}
                  onChange={(event) =>
                    setReassign((current) => ({ ...current, [stage.id]: event.target.value }))
                  }
                  className="h-8 rounded-md border border-line bg-surface px-2 text-xs text-ink"
                >
                  {stages.map((entry) => (
                    <option key={entry.id} value={entry.id}>
                      {entry.emoji ? `${entry.emoji} ` : ''}
                      {entry.name || '—'}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>
        )}

        {canDelete && (
          <div className="border-t border-line pt-4">
            <Button
              type="button"
              size="sm"
              variant="danger"
              onClick={() => {
                if (!confirmingDelete) {
                  setConfirmingDelete(true)
                  return
                }
                void onDelete()
              }}
              onBlur={() => setConfirmingDelete(false)}
            >
              <Trash2 className="size-4" aria-hidden />
              {confirmingDelete ? t('organizer.settings.deleteConfirm') : t('organizer.settings.delete')}
            </Button>
          </div>
        )}
      </div>
    </Modal>
  )
}
