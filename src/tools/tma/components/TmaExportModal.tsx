import { useEffect, useRef, useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, ClipboardCopy, FileSpreadsheet, Image as ImageIcon, Loader2, Printer } from 'lucide-react'
import { Toggle } from '@/components/ui/fields'
import { Modal } from '@/components/ui/Modal'
import { downloadBlob, toBlob } from '@/lib/canvasReport'
import { downloadCsv, fileBaseFor, tsvText, type TableOptions } from '../export'
import type { TmaState } from '../types'
import { TMA_PAPER_CSS, TmaPaper, type PaperLabels } from './TmaPaper'

interface TmaExportModalProps {
  state: TmaState
  onClose: () => void
}

/** Quantas colunas de tabela cabem lado a lado no papel, conforme os campos. */
const paperColumns = (fields: number) => (fields <= 1 ? 3 : fields === 2 ? 2 : 1)

/**
 * Quatro saídas para a mesma tabela: área de transferência (tabulado, cola
 * em colunas na planilha), CSV, PNG do papel e a impressão do navegador,
 * que é onde se salva em PDF.
 */
export function TmaExportModal({ state, onClose }: TmaExportModalProps) {
  const { t, i18n } = useTranslation()
  const paper = useRef<HTMLDivElement>(null)
  const [header, setHeader] = useState(true)
  const [coordinate, setCoordinate] = useState(true)
  const [copied, setCopied] = useState(false)
  const [busy, setBusy] = useState(false)
  const [failed, setFailed] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const options: TableOptions = {
    header,
    coordinate,
    coordinateLabel: t('tma.coordinateColumn'),
    controlLabel: t('tma.controlColumn'),
  }
  const fileBase = fileBaseFor(state)
  // Controles ficam fora da conta: o progresso é sobre os cores de caso.
  const total = state.rows * state.cols - Object.keys(state.controls).length
  const filled = Object.keys(state.results).filter((key) => !(key in state.controls)).length
  const labels: PaperLabels = {
    title: t('tma.paperTitle'),
    dims: t('tma.dimensions', { rows: state.rows, cols: state.cols }),
    progress: t('tma.progress', { filled, total }),
    coordinate: t('tma.coordinateColumn'),
    empty: t('tma.legendEmpty'),
    partial: t('tma.legendPartial'),
    complete: t('tma.legendFilled'),
    control: t('tma.legendControl'),
    footer: t('tma.paperFooter'),
  }

  const copy = async () => {
    setFailed(false)
    try {
      await navigator.clipboard.writeText(tsvText(state, options))
    } catch {
      setFailed(true)
      return
    }
    setCopied(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1600)
  }

  const csv = () => {
    setFailed(false)
    try {
      downloadCsv(state, options, i18n.language, fileBase)
    } catch {
      setFailed(true)
    }
  }

  const print = () => {
    const node = paper.current
    if (!node) return
    setFailed(false)
    const w = window.open('', '_blank', 'width=900,height=1000')
    if (!w) {
      setFailed(true)
      return
    }
    w.document.write(
      `<!DOCTYPE html><html lang="${i18n.language}"><head><meta charset="UTF-8"><title>${fileBase}</title><style>${TMA_PAPER_CSS}@page{margin:12mm;} body{margin:0;background:#fff;} .tma-paper{max-width:none;padding:0;}</style></head><body>${node.outerHTML}</body></html>`,
    )
    w.document.close()
    w.focus()
    setTimeout(() => {
      try {
        w.print()
      } catch {
        // a janela pode ter sido fechada
      }
    }, 400)
  }

  const image = async () => {
    const node = paper.current
    if (!node) return
    setBusy(true)
    setFailed(false)
    try {
      const { default: html2canvas } = await import('html2canvas')
      // O canvas do navegador não passa de ~32k px de altura: mapas enormes saem em escala menor.
      const scale = Math.max(1, Math.min(2, 30000 / Math.max(1, node.scrollHeight)))
      const canvas = await html2canvas(node, { scale, backgroundColor: '#ffffff', useCORS: true })
      downloadBlob(await toBlob(canvas), `${fileBase}.png`)
    } catch {
      setFailed(true)
    } finally {
      setBusy(false)
    }
  }

  return (
    <Modal title={t('tma.exportTitle')} onClose={onClose} wide>
      <style>{TMA_PAPER_CSS}</style>
      <p className="text-sm text-ink-muted">{t('tma.exportHint')}</p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <ExportOption
          icon={copied ? <Check className="size-4" aria-hidden /> : <ClipboardCopy className="size-4" aria-hidden />}
          title={copied ? t('tma.copied') : t('tma.exportClipboard')}
          hint={t('tma.exportClipboardHint')}
          onClick={() => void copy()}
        />
        <ExportOption
          icon={<FileSpreadsheet className="size-4" aria-hidden />}
          title={t('tma.exportCsv')}
          hint={t('tma.exportCsvHint')}
          onClick={csv}
        />
        <ExportOption
          icon={<ImageIcon className="size-4" aria-hidden />}
          title={t('tma.exportImage')}
          hint={t('tma.exportImageHint')}
          onClick={() => void image()}
          busy={busy}
        />
        <ExportOption
          icon={<Printer className="size-4" aria-hidden />}
          title={t('tma.exportPdf')}
          hint={t('tma.exportPdfHint')}
          onClick={print}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2">
        <Toggle checked={header} onChange={setHeader} label={t('tma.optHeader')} />
        <Toggle checked={coordinate} onChange={setCoordinate} label={t('tma.optCoordinate')} />
      </div>
      <p className="mt-1 text-xs text-ink-faint">{t('tma.optHint')}</p>

      {failed && <p className="mt-3 text-sm text-danger">{t('tma.exportFailed')}</p>}

      <p className="mt-5 text-xs font-semibold tracking-wider text-ink-faint uppercase">{t('tma.exportPreview')}</p>
      <div className="mt-2 overflow-auto rounded-md border border-line bg-[#e5e7eb] p-3">
        <TmaPaper ref={paper} state={state} columns={paperColumns(state.fields.length)} locale={i18n.language} labels={labels} />
      </div>
    </Modal>
  )
}

function ExportOption({
  icon,
  title,
  hint,
  onClick,
  busy = false,
}: {
  icon: ReactNode
  title: string
  hint: string
  onClick: () => void
  busy?: boolean
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={busy}
      className="flex items-start gap-3 rounded-md border border-line bg-elevated px-4 py-3 text-left transition-colors hover:border-line-strong hover:bg-raised disabled:cursor-wait disabled:opacity-60"
    >
      <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-md bg-accent-soft text-accent">
        {busy ? <Loader2 className="size-4 animate-spin" aria-hidden /> : icon}
      </span>
      <span className="min-w-0">
        <span className="block text-sm font-medium text-ink">{title}</span>
        <span className="mt-0.5 block text-xs text-ink-muted">{hint}</span>
      </span>
    </button>
  )
}
