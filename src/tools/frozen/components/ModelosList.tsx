import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Copy, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ErrorAlert } from '@/components/ui/Alert'
import { Modal } from '@/components/ui/Modal'
import { Spinner } from '@/components/ui/Spinner'
import { buildModeloText, modeloLabel } from '../congText'
import type { Modelo } from '../types'

interface ModelosListProps {
  items: Modelo[] | null
  error: Error | null
  onUse: (modelo: Modelo) => void
  onRemove: (id: number) => Promise<void>
}

/** Congelações guardadas como ponto de partida — clique para ver, usar ou apagar. */
export function ModelosList({ items, error, onUse, onRemove }: ModelosListProps) {
  const { t } = useTranslation()
  const [open, setOpen] = useState<Modelo | null>(null)
  const [confirmId, setConfirmId] = useState<number | null>(null)
  const [copied, setCopied] = useState(false)

  if (error) return <ErrorAlert>{t('frozen.modelos.loadError')}</ErrorAlert>
  if (items === null) {
    return (
      <div className="flex justify-center py-16">
        <Spinner />
      </div>
    )
  }
  if (items.length === 0) {
    return <p className="rounded-lg border border-dashed border-line px-6 py-12 text-center text-sm text-ink-faint">{t('frozen.modelos.empty')}</p>
  }

  const copy = async () => {
    if (!open) return
    try {
      await navigator.clipboard.writeText(buildModeloText(open))
      setCopied(true)
      setTimeout(() => setCopied(false), 1600)
    } catch {
      // sem clipboard
    }
  }

  return (
    <>
      <ul className="divide-y divide-line overflow-hidden rounded-lg border border-line bg-elevated shadow-card">
        {items.map((m) => (
          <li key={m.id} className="flex items-center gap-2 px-4 py-2.5">
            <button type="button" onClick={() => setOpen(m)} className="min-w-0 flex-1 truncate text-left text-sm text-ink hover:text-accent-ink">
              {modeloLabel(m)}
            </button>
            {confirmId === m.id ? (
              <>
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    void onRemove(m.id)
                    setConfirmId(null)
                  }}
                >
                  {t('frozen.modelos.deleteConfirm')}
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmId(null)}>
                  {t('common.cancel')}
                </Button>
              </>
            ) : (
              <button type="button" onClick={() => setConfirmId(m.id)} aria-label={t('frozen.modelos.delete')} className="rounded-md p-1 text-ink-faint transition-colors hover:bg-danger-soft hover:text-danger">
                <Trash2 className="size-4" aria-hidden />
              </button>
            )}
          </li>
        ))}
      </ul>

      {open && (
        <Modal
          title={modeloLabel(open)}
          onClose={() => setOpen(null)}
          wide
          footer={
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                onClick={() => {
                  onUse(open)
                  setOpen(null)
                }}
              >
                {t('frozen.modelos.use')}
              </Button>
              <Button type="button" variant="secondary" onClick={() => void copy()}>
                {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
                {copied ? t('frozen.export.copied') : t('frozen.modelos.copy')}
              </Button>
              <Button type="button" variant="ghost" className="ml-auto" onClick={() => setOpen(null)}>
                {t('macroscopy.close', { defaultValue: 'Fechar' })}
              </Button>
            </div>
          }
        >
          <pre className="tabular max-h-[60vh] overflow-auto rounded-md border border-line bg-surface px-3.5 py-3 text-xs leading-relaxed whitespace-pre-wrap text-ink-muted">{buildModeloText(open)}</pre>
        </Modal>
      )}
    </>
  )
}
