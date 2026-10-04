/* ==========================================================================
   FeedbackModal.tsx — "achei um erro": o tipo do relato, o que está errado,
   e um contato opcional. A tela de onde o botão foi clicado, o item apontado
   e o navegador vão junto sem o usuário precisar digitar.
   ========================================================================== */

import { useState, type FormEvent } from 'react'
import { useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Check, Info } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { TextField } from '@/components/ui/fields'
import { useAuth } from '@/hooks/useAuth'
import { cn } from '@/lib/cn'
import { FEEDBACK_KINDS, LIMITS, sendFeedback, toolFromRoute, type FeedbackKind, type FeedbackTarget } from '@/services/feedback'

export function FeedbackModal({ target, onClose }: { target: FeedbackTarget; onClose: () => void }) {
  const { t, i18n } = useTranslation()
  const { pathname } = useLocation()
  const { user } = useAuth()
  const [kind, setKind] = useState<FeedbackKind>(target.itemId ? 'content' : 'bug')
  const [message, setMessage] = useState('')
  const [wantsReply, setWantsReply] = useState(false)
  const [contact, setContact] = useState(user?.email ?? '')
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const valid = message.trim().length >= 3 && Boolean(user) && !busy

  const send = async (event: FormEvent) => {
    event.preventDefault()
    if (!valid || !user) return
    setBusy(true)
    setError(null)
    try {
      await sendFeedback({
        kind,
        message,
        tool: target.tool ?? toolFromRoute(pathname),
        itemId: target.itemId ?? null,
        itemName: target.itemName ?? null,
        contact: wantsReply ? contact : null,
        route: pathname,
        uid: user.uid,
        email: user.email ?? null,
        language: i18n.language,
      })
      setDone(true)
    } catch {
      setError(t('feedback.failed'))
    } finally {
      setBusy(false)
    }
  }

  if (done) {
    return (
      <Modal title={t('feedback.title')} onClose={onClose}>
        <div className="flex flex-col items-center gap-3 py-6 text-center">
          <span className="flex size-12 items-center justify-center rounded-full bg-success/10 text-success">
            <Check className="size-6" aria-hidden />
          </span>
          <p className="text-sm font-medium text-ink">{t('feedback.sentTitle')}</p>
          <p className="max-w-sm text-sm text-ink-muted">{t('feedback.sentBody')}</p>
          <Button type="button" variant="secondary" onClick={onClose}>
            {t('feedback.close')}
          </Button>
        </div>
      </Modal>
    )
  }

  return (
    <Modal
      title={t('feedback.title')}
      onClose={onClose}
      footer={
        <>
          <Button type="button" variant="secondary" onClick={onClose} disabled={busy}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="feedback-form" loading={busy} disabled={!valid}>
            {t(busy ? 'feedback.sending' : 'feedback.send')}
          </Button>
        </>
      }
    >
      <form id="feedback-form" onSubmit={(e) => void send(e)} className="space-y-4">
        {target.itemName && (
          <p className="rounded-md border border-accent/40 bg-accent-soft px-3 py-2 text-sm text-accent-ink">
            {t('feedback.about')} <span className="font-medium">{target.itemName}</span>
          </p>
        )}

        <fieldset>
          <legend className="text-sm font-medium text-ink">{t('feedback.kindLabel')}</legend>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {FEEDBACK_KINDS.map((k) => (
              <button
                key={k}
                type="button"
                onClick={() => setKind(k)}
                aria-pressed={kind === k}
                className={cn(
                  'rounded-full border px-3 py-1.5 text-sm transition-colors',
                  kind === k ? 'border-accent bg-accent text-white' : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink',
                )}
              >
                {t(`feedback.kind.${k}`)}
              </button>
            ))}
          </div>
        </fieldset>

        <label className="block space-y-1.5">
          <span className="block text-sm font-medium text-ink">{t('feedback.messageLabel')}</span>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={6}
            maxLength={LIMITS.message}
            autoFocus
            placeholder={t(`feedback.placeholder.${kind}`)}
            className="w-full rounded-md border border-line bg-surface px-3 py-2 text-sm leading-relaxed text-ink placeholder:text-ink-faint hover:border-line-strong"
          />
          <span className="block text-xs text-ink-faint">{t('feedback.messageHint')}</span>
        </label>

        <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-ink">
          <input type="checkbox" checked={wantsReply} onChange={(e) => setWantsReply(e.target.checked)} className="size-4 rounded border-line accent-[var(--color-accent)]" />
          {t('feedback.wantsReply')}
        </label>

        {wantsReply && (
          <TextField
            value={contact}
            onChange={setContact}
            label={t('feedback.contactLabel')}
            type="email"
            maxLength={LIMITS.contact}
            placeholder="voce@exemplo.com"
          />
        )}

        <p className="flex items-start gap-2 border-t border-line pt-3 text-xs leading-relaxed text-ink-faint">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {t('feedback.privacy')}
        </p>

        {error && <p className="text-sm text-danger">{error}</p>}
      </form>
    </Modal>
  )
}
