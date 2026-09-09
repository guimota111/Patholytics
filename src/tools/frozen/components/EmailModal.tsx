import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { iniciaisPaciente, siglaHospital } from '../congText'
import { dataCurta } from '../text'
import type { CongDoc, MohsDoc } from '../types'
import type { Frozen } from '../useFrozen'
import type { ExportKind } from './ExportCard'

interface EmailModalProps {
  kind: ExportKind
  doc: CongDoc | MohsDoc
  text: string
  frozen: Frozen
  onClose: () => void
}

const inputClass = 'h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-faint hover:border-line-strong'

/** "Congelação HAC - 26/08/2026 - J.C.S." no assunto; o laudo em texto no corpo. */
export function EmailModal({ doc, text, frozen, onClose }: EmailModalProps) {
  const { t } = useTranslation()
  const sigla = siglaHospital(doc.hospital)
  const iniciais = iniciaisPaciente(doc.paciente)
  const [para, setPara] = useState('')
  const [assunto, setAssunto] = useState(['Congelação' + (sigla ? ` ${sigla}` : ''), dataCurta(), iniciais].filter(Boolean).join(' - '))
  const [corpo, setCorpo] = useState(text)
  const [flash, setFlash] = useState<string | null>(null)

  const copy = async (value: string, label: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setFlash(label)
      setTimeout(() => setFlash(null), 1600)
    } catch {
      // sem clipboard
    }
  }

  const open = () => {
    const to = para.trim()
    if (to) frozen.remember('email_para', to)
    const url = `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}`
    // Âncora em vez de location.href: não deixa a página em branco sem app de e-mail.
    const a = document.createElement('a')
    a.href = url
    a.click()
  }

  return (
    <Modal title={t('frozen.email.title')} onClose={onClose} wide>
      <div className="space-y-4">
        <label className="block">
          <span className="block text-sm font-medium text-ink">{t('frozen.email.to')}</span>
          <input value={para} onChange={(e) => setPara(e.target.value)} placeholder="destinatario@exemplo.com" list="frozen-email-para" autoComplete="off" className={`${inputClass} mt-1.5`} />
          <datalist id="frozen-email-para">
            {frozen.suggestions('email_para').map((s) => (
              <option key={s} value={s} />
            ))}
          </datalist>
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-ink">{t('frozen.email.subject')}</span>
          <input value={assunto} onChange={(e) => setAssunto(e.target.value)} className={`${inputClass} mt-1.5`} />
        </label>
        <label className="block">
          <span className="block text-sm font-medium text-ink">{t('frozen.email.body')}</span>
          <textarea
            value={corpo}
            onChange={(e) => setCorpo(e.target.value)}
            rows={12}
            className="tabular mt-1.5 w-full resize-y rounded-md border border-line bg-surface px-3 py-2 text-xs leading-relaxed text-ink hover:border-line-strong"
          />
        </label>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" onClick={open}>
            {t('frozen.email.open')}
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => void copy(assunto, 'subject')}>
            {flash === 'subject' ? t('frozen.export.copied') : t('frozen.email.copySubject')}
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={() => void copy(corpo, 'body')}>
            {flash === 'body' ? t('frozen.export.copied') : t('frozen.email.copyBody')}
          </Button>
        </div>
        <p className="text-xs leading-relaxed text-ink-faint">{t('frozen.email.hint')}</p>
      </div>
    </Modal>
  )
}
