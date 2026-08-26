import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import type { CaseList, OrganizerCase } from '../types'
import { Modal } from '@/components/ui/Modal'

interface Props {
  item: OrganizerCase
  lists: CaseList[]
  currentListId: string
  onClose: () => void
  onMove: (toListId: string, stageId: string) => Promise<void>
}

/**
 * As etapas sao de cada lista, entao mover exige escolher onde o caso pousa —
 * nao existe equivalencia automatica entre fluxos diferentes.
 */
export function MoveCaseDialog({ item, lists, currentListId, onClose, onMove }: Props) {
  const { t } = useTranslation()
  const targets = lists.filter((list) => list.id !== currentListId)
  const [listId, setListId] = useState(targets[0]?.id ?? '')
  const target = targets.find((list) => list.id === listId) ?? targets[0]
  const [stageId, setStageId] = useState(target?.stages[0]?.id ?? '')
  const [saving, setSaving] = useState(false)

  const chooseList = (nextId: string) => {
    setListId(nextId)
    const next = targets.find((list) => list.id === nextId)
    setStageId(next?.stages[0]?.id ?? '')
  }

  return (
    <Modal
      title={t('organizer.move.title')}
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="ghost" size="sm" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            size="sm"
            loading={saving}
            disabled={!target || !stageId}
            onClick={async () => {
              if (!target || !stageId) return
              setSaving(true)
              await onMove(target.id, stageId)
              setSaving(false)
              onClose()
            }}
          >
            {t('organizer.move.confirm')}
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-sm text-ink-muted">{t('organizer.move.description', { title: item.title })}</p>
        <label className="space-y-1 text-xs font-medium text-ink">
          {t('organizer.move.list')}
          <select
            value={listId}
            onChange={(event) => chooseList(event.target.value)}
            className="h-9 w-full rounded-md border border-line bg-surface px-2 text-sm font-normal text-ink"
          >
            {targets.map((list) => (
              <option key={list.id} value={list.id}>
                {list.name}
              </option>
            ))}
          </select>
        </label>
        <label className="space-y-1 text-xs font-medium text-ink">
          {t('organizer.move.stage')}
          <select
            value={stageId}
            onChange={(event) => setStageId(event.target.value)}
            className="h-9 w-full rounded-md border border-line bg-surface px-2 text-sm font-normal text-ink"
          >
            {(target?.stages ?? []).map((stage) => (
              <option key={stage.id} value={stage.id}>
                {stage.emoji ? `${stage.emoji} ` : ''}
                {stage.name}
              </option>
            ))}
          </select>
        </label>
      </div>
    </Modal>
  )
}
