import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Copy, Eraser, FileDown, Mail, Printer, Save } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { safeFileName } from '../text'
import type { CongDoc, MohsDoc } from '../types'
import type { Frozen } from '../useFrozen'
import { EmailModal } from './EmailModal'
import { ExportModal } from './ExportModal'

export type ExportKind = 'cong' | 'mohs'

interface ExportCardProps {
  kind: ExportKind
  text: string
  doc: CongDoc | MohsDoc
  fileBase: string
  onBeforeExport: () => void
  onSaveModelo?: () => Promise<void>
  onClear: () => void
  clearConfirm: string
  frozen: Frozen
}

/** Copiar, baixar, imprimir, mandar por e-mail, salvar modelo, limpar — e a prévia. */
export function ExportCard({ kind, text, doc, fileBase, onBeforeExport, onSaveModelo, onClear, clearConfirm, frozen }: ExportCardProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState(false)
  const [saved, setSaved] = useState<'idle' | 'saving' | 'ok' | 'error'>('idle')
  const [confirmClear, setConfirmClear] = useState(false)
  const [exportOpen, setExportOpen] = useState(false)
  const [emailOpen, setEmailOpen] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const flash = (set: () => void, reset: () => void) => {
    set()
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(reset, 1800)
  }

  const copy = async () => {
    onBeforeExport()
    try {
      await navigator.clipboard.writeText(text)
      flash(() => setCopied(true), () => setCopied(false))
    } catch {
      // Contextos sem clipboard: o texto continua na prévia para seleção manual.
    }
  }

  const downloadTxt = () => {
    onBeforeExport()
    const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `${safeFileName(fileBase)}.txt`
    a.click()
    setTimeout(() => URL.revokeObjectURL(url), 500)
  }

  const saveModelo = async () => {
    if (!onSaveModelo) return
    setSaved('saving')
    try {
      await onSaveModelo()
      flash(() => setSaved('ok'), () => setSaved('idle'))
    } catch {
      flash(() => setSaved('error'), () => setSaved('idle'))
    }
  }

  return (
    <section className="rounded-lg border border-line bg-elevated shadow-card">
      <header className="border-b border-line px-5 py-3">
        <h2 className="text-sm font-semibold tracking-tight text-ink">{t('frozen.export.title')}</h2>
      </header>
      <div className="space-y-4 px-5 py-4">
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" onClick={() => void copy()}>
            {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
            {copied ? t('frozen.export.copied') : t('frozen.export.copy')}
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={downloadTxt}>
            <FileDown className="size-4" aria-hidden />
            {t('frozen.export.txt')}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => {
              onBeforeExport()
              setExportOpen(true)
            }}
          >
            <Printer className="size-4" aria-hidden />
            {t('frozen.export.paper')}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            onClick={() => {
              onBeforeExport()
              setEmailOpen(true)
            }}
          >
            <Mail className="size-4" aria-hidden />
            {t('frozen.export.email')}
          </Button>
          {onSaveModelo && (
            <Button type="button" size="sm" variant="secondary" loading={saved === 'saving'} onClick={() => void saveModelo()}>
              {saved === 'ok' ? <Check className="size-4" aria-hidden /> : <Save className="size-4" aria-hidden />}
              {saved === 'ok' ? t('frozen.export.saved') : saved === 'error' ? t('frozen.export.saveError') : t('frozen.export.saveModelo')}
            </Button>
          )}
          <span className="ml-auto flex items-center gap-1">
            {confirmClear ? (
              <>
                <span className="text-xs text-ink-muted">{clearConfirm}</span>
                <Button
                  type="button"
                  size="sm"
                  variant="danger"
                  onClick={() => {
                    onClear()
                    setConfirmClear(false)
                  }}
                >
                  {t('frozen.export.clearConfirm')}
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmClear(false)}>
                  {t('common.cancel')}
                </Button>
              </>
            ) : (
              <Button type="button" size="sm" variant="danger" onClick={() => setConfirmClear(true)}>
                <Eraser className="size-4" aria-hidden />
                {t('frozen.export.clear')}
              </Button>
            )}
          </span>
        </div>

        <div>
          <p className="mb-1.5 text-[0.6875rem] font-medium tracking-wider text-ink-faint uppercase">{t('frozen.export.preview')}</p>
          <pre className="tabular max-h-[28rem] overflow-auto rounded-md border border-line bg-surface px-3.5 py-3 text-xs leading-relaxed whitespace-pre-wrap text-ink-muted">{text}</pre>
        </div>
      </div>

      {exportOpen && <ExportModal kind={kind} doc={doc} now={frozen.now} fileBase={fileBase} onClose={() => setExportOpen(false)} />}
      {emailOpen && <EmailModal kind={kind} doc={doc} text={text} frozen={frozen} onClose={() => setEmailOpen(false)} />}
    </section>
  )
}
