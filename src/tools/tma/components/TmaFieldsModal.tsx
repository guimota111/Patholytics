import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { draftsFrom, fieldsFrom } from '../drafts'
import type { TmaField } from '../types'
import { TmaFieldsEditor } from './TmaFieldsEditor'

interface TmaFieldsModalProps {
  fields: TmaField[]
  onSave: (fields: TmaField[]) => void
  onClose: () => void
}

/** Ajustar os campos com o mapa já em andamento — sem perder o que foi lido. */
export function TmaFieldsModal({ fields, onSave, onClose }: TmaFieldsModalProps) {
  const { t } = useTranslation()
  const [drafts, setDrafts] = useState(() => draftsFrom(fields))
  const removed = fields.some((field) => !drafts.some((draft) => draft.id === field.id))

  return (
    <Modal
      title={t('tma.editFieldsTitle')}
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button
            type="button"
            onClick={() => {
              onSave(fieldsFrom(drafts))
              onClose()
            }}
          >
            {t('tma.saveFields')}
          </Button>
        </>
      }
    >
      <p className="text-sm text-ink-muted">{t('tma.fieldsHint')}</p>
      <div className="mt-4">
        <TmaFieldsEditor drafts={drafts} onChange={setDrafts} />
      </div>
      {removed && (
        <p className="mt-4 flex items-start gap-1.5 rounded-md border border-danger/40 bg-danger-soft px-3 py-2 text-xs text-danger">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {t('tma.editFieldsWarning')}
        </p>
      )}
    </Modal>
  )
}
