import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Copy, ImageDown, QrCode } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { MoreSection } from '@/components/ui/didactic'

interface MacroTextCardProps {
  text: string
  code: string
  onExport?: () => void
  exporting?: boolean
}

/** Passo 5 da macroscopia: o texto pronto, o botão de imagem e o código do mapa para a laudagem. */
export function MacroTextCard({ text, code, onExport, exporting = false }: MacroTextCardProps) {
  const { t } = useTranslation()
  const [copied, setCopied] = useState<'text' | 'code' | null>(null)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const copy = async (what: 'text' | 'code') => {
    try {
      await navigator.clipboard.writeText(what === 'text' ? text : code)
    } catch {
      return
    }
    setCopied(what)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(null), 1600)
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-tight text-ink">{t('breast.text.title')}</h3>
        <div className="flex flex-wrap gap-2">
          {onExport && (
            <Button type="button" size="sm" variant="secondary" onClick={onExport} loading={exporting}>
              <ImageDown className="size-4" aria-hidden />
              {t(exporting ? 'breast.export.exporting' : 'breast.export.button')}
            </Button>
          )}
          <Button type="button" size="sm" onClick={() => void copy('text')} disabled={!text}>
            {copied === 'text' ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
            {copied === 'text' ? t('breast.text.copied') : t('breast.text.copy')}
          </Button>
        </div>
      </div>
      <textarea
        readOnly
        value={text}
        rows={18}
        className="w-full resize-y rounded-md border border-line bg-surface px-3 py-2 text-sm leading-relaxed text-ink"
      />
      <MoreSection label={t('breast.text.codeToggle')}>
        <p className="text-sm text-ink-muted">{t('breast.text.codeHint')}</p>
        <div className="flex flex-wrap items-start gap-2">
          <code className="tabular max-h-24 min-w-0 flex-1 overflow-auto rounded-md border border-line bg-elevated px-3 py-2 text-[0.65rem] leading-snug break-all text-ink-muted">{code}</code>
          <Button type="button" size="sm" variant="secondary" onClick={() => void copy('code')}>
            {copied === 'code' ? <Check className="size-4" aria-hidden /> : <QrCode className="size-4" aria-hidden />}
            {copied === 'code' ? t('breast.text.codeCopied') : t('breast.text.copyCode')}
          </Button>
        </div>
      </MoreSection>
    </div>
  )
}
