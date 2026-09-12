import { useState, type FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, ImagePlus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { TextField, Toggle } from '@/components/ui/fields'
import { Modal } from '@/components/ui/Modal'
import { useAuth } from '@/hooks/useAuth'
import { prepareImage, submitPhoto } from '../submissions'
import type { Catalog, CatalogEntry } from '../types'

interface SubmitModalProps {
  catalog: Catalog
  /** Verbete de onde o modal foi aberto, se foi. */
  entry?: CatalogEntry
  onClose: () => void
}

/** "Mande a sua foto": um formulário curto, a foto reduzida no navegador, e o consentimento do crédito. */
export function SubmitModal({ catalog, entry, onClose }: SubmitModalProps) {
  const { t } = useTranslation()
  const { user, profile } = useAuth()
  const [subject, setSubject] = useState(entry?.name ?? '')
  const [site, setSite] = useState('')
  const [notes, setNotes] = useState('')
  const [credit, setCredit] = useState(profile?.displayName || user?.displayName || '')
  const [publish, setPublish] = useState(true)
  const [file, setFile] = useState<File | null>(null)
  const [preview, setPreview] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const pick = (next: File | null) => {
    setFile(next)
    setError(null)
    if (preview) URL.revokeObjectURL(preview)
    setPreview(next ? URL.createObjectURL(next) : null)
  }

  const valid = Boolean(file && subject.trim() && publish && user)

  const send = async (event: FormEvent) => {
    event.preventDefault()
    if (!valid || !file || !user) return
    setBusy(true)
    setError(null)
    try {
      const image = await prepareImage(file)
      await submitPhoto({
        catalog: catalog.id,
        entryId: entry?.id ?? null,
        subject: subject.trim(),
        site: site.trim(),
        notes: notes.trim(),
        credit: credit.trim(),
        uid: user.uid,
        email: user.email ?? null,
        image,
      })
      setDone(true)
    } catch (err) {
      setError(t(err instanceof Error && err.message === 'image too large' ? 'catalog.submit.tooBig' : 'catalog.submit.failed'))
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <Modal title={t('catalog.submit.title')} onClose={onClose}>
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
            <Check className="size-6" aria-hidden />
          </span>
          <p className="text-sm font-medium text-ink">{t('catalog.submit.sentTitle')}</p>
          <p className="max-w-sm text-sm text-ink-muted">{t('catalog.submit.sentBody')}</p>
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('catalog.submit.close')}
          </Button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      title={t('catalog.submit.title')}
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="catalog-submit" loading={busy} disabled={!valid}>
            {t(busy ? 'catalog.submit.sending' : 'catalog.submit.send')}
          </Button>
        </>
      }
    >
      <form id="catalog-submit" onSubmit={(e) => void send(e)} className="space-y-4">
        <p className="text-sm text-ink-muted">{t(`catalog.submit.hint.${catalog.id}`)}</p>

        <label className="block">
          <span className="block text-sm font-medium text-ink">{t('catalog.submit.photo')}</span>
          <span className="mt-1.5 flex cursor-pointer items-center gap-3 rounded-md border border-dashed border-line bg-surface px-3 py-3 transition-colors hover:border-accent">
            <input
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => pick(e.target.files?.[0] ?? null)}
            />
            {preview ? (
              <img src={preview} alt="" className="size-16 shrink-0 rounded object-cover" />
            ) : (
              <span className="flex size-16 shrink-0 items-center justify-center rounded bg-accent-soft text-accent">
                <ImagePlus className="size-6" aria-hidden />
              </span>
            )}
            <span className="min-w-0 text-sm text-ink-muted">
              {file ? <span className="block truncate text-ink">{file.name}</span> : t('catalog.submit.photoPick')}
              <span className="block text-xs text-ink-faint">{t('catalog.submit.photoHint')}</span>
            </span>
          </span>
        </label>

        <TextField label={t(`catalog.submit.subject.${catalog.id}`)} value={subject} onChange={setSubject} placeholder={t(`catalog.submit.subjectPlaceholder.${catalog.id}`)} />
        <TextField label={t('catalog.submit.site')} value={site} onChange={setSite} placeholder={t('catalog.submit.sitePlaceholder')} />
        <label className="block space-y-1.5">
          <span className="block text-sm font-medium text-ink">{t('catalog.submit.notes')}</span>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={3}
            placeholder={t('catalog.submit.notesPlaceholder')}
            className="w-full resize-y rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint hover:border-line-strong"
          />
        </label>
        <TextField label={t('catalog.submit.credit')} value={credit} onChange={setCredit} hint={t('catalog.submit.creditHint')} />
        <Toggle checked={publish} onChange={setPublish} label={t('catalog.submit.consent')} />

        {error && <p className="text-sm text-danger">{error}</p>}
      </form>
    </Modal>
  )
}
