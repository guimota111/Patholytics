import { useEffect, useMemo, useRef, useState, type DragEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Check, Copy, Plus, RotateCcw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { NumField, compactInputClass, selectClass } from '@/components/ui/fields'
import { cn } from '@/lib/cn'
import { PARAM_GROUPS, renderReport, unknownTokens, type ReportParam } from '../report'
import { DEFAULT_REPORT_ID, type CaseGlobals, type ReportStore } from '../types'

interface ReportBuilderProps {
  params: ReportParam[]
  reports: ReportStore
  globals: CaseGlobals
  setGlobals: (patch: Partial<CaseGlobals>) => void
  onSelect: (id: string) => void
  onText: (id: string, text: string) => void
  onRename: (id: string, name: string) => void
  onAdd: (name: string, text: string) => void
  onDelete: (id: string) => void
  onResetDefault: () => void
}

/**
 * O montador de laudo: um modelo de texto com `[parâmetros]`, que o usuário
 * edita, e ao lado a lista de parâmetros do caso — clicar insere no cursor,
 * arrastar solta onde o mouse largou (o navegador insere o texto sozinho).
 * Embaixo, o laudo pronto para copiar.
 */
export function ReportBuilder({
  params,
  reports,
  globals,
  setGlobals,
  onSelect,
  onText,
  onRename,
  onAdd,
  onDelete,
  onResetDefault,
}: ReportBuilderProps) {
  const { t } = useTranslation()
  const editor = useRef<HTMLTextAreaElement>(null)
  const [copied, setCopied] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const current = reports.templates.find((x) => x.id === reports.selectedId) ?? reports.templates[0]
  const isDefault = current?.id === DEFAULT_REPORT_ID
  const rendered = useMemo(() => (current ? renderReport(current.text, params) : ''), [current, params])
  const unknown = useMemo(() => (current ? unknownTokens(current.text, params) : []), [current, params])

  if (!current) return null

  const insert = (key: string) => {
    const token = `[${key}]`
    const el = editor.current
    if (!el) {
      onText(current.id, current.text + token)
      return
    }
    const start = el.selectionStart ?? current.text.length
    const end = el.selectionEnd ?? start
    const next = current.text.slice(0, start) + token + current.text.slice(end)
    onText(current.id, next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(start + token.length, start + token.length)
    })
  }

  const dragStart = (event: DragEvent<HTMLButtonElement>, key: string) => {
    event.dataTransfer.setData('text/plain', `[${key}]`)
    event.dataTransfer.effectAllowed = 'copy'
  }

  const copy = async () => {
    if (!rendered.trim()) return
    try {
      await navigator.clipboard.writeText(rendered)
    } catch {
      return
    }
    setCopied(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1600)
  }

  const addNew = () => onAdd(t('prostate.report.newName', { n: reports.templates.length }), current.text)

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-2">
        <label className="min-w-40 flex-1 space-y-1.5">
          <span className="block text-sm font-medium text-ink">{t('prostate.report.template')}</span>
          <select value={current.id} onChange={(e) => onSelect(e.target.value)} className={selectClass}>
            {reports.templates.map((x) => (
              <option key={x.id} value={x.id}>
                {x.name}
              </option>
            ))}
          </select>
        </label>
        <label className="min-w-40 flex-1 space-y-1.5">
          <span className="block text-sm font-medium text-ink">{t('prostate.report.name')}</span>
          <input
            value={current.name}
            onChange={(e) => onRename(current.id, e.target.value)}
            className={cn(compactInputClass, 'h-9 font-sans')}
          />
        </label>
        <Button type="button" size="sm" variant="secondary" onClick={addNew} title={t('prostate.report.newHint')}>
          <Plus className="size-4" aria-hidden />
          {t('prostate.report.new')}
        </Button>
        {isDefault ? (
          <Button type="button" size="sm" variant="ghost" onClick={onResetDefault}>
            <RotateCcw className="size-4" aria-hidden />
            {t('prostate.report.resetDefault')}
          </Button>
        ) : (
          <Button
            type="button"
            size="sm"
            variant={confirmDelete ? 'danger' : 'ghost'}
            onClick={() => {
              if (!confirmDelete) {
                setConfirmDelete(true)
                return
              }
              onDelete(current.id)
              setConfirmDelete(false)
            }}
            onBlur={() => setConfirmDelete(false)}
          >
            <Trash2 className="size-4" aria-hidden />
            {t(confirmDelete ? 'prostate.report.deleteConfirm' : 'prostate.report.delete')}
          </Button>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
        <div className="space-y-1.5">
          <label htmlFor="prostate-report-editor" className="block text-sm font-medium text-ink">
            {t('prostate.report.editor')}
          </label>
          <textarea
            id="prostate-report-editor"
            ref={editor}
            value={current.text}
            onChange={(e) => onText(current.id, e.target.value)}
            rows={22}
            spellCheck={false}
            className="w-full resize-y rounded-md border border-line bg-surface px-3 py-2 font-mono text-xs leading-relaxed text-ink placeholder:text-ink-faint hover:border-line-strong"
          />
          <p className="text-xs text-ink-faint">{t('prostate.report.editorHint')}</p>
          {unknown.length > 0 && (
            <p className="flex items-start gap-1.5 text-xs text-danger">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              {t('prostate.report.unknown', { keys: unknown.map((k) => `[${k}]`).join(', ') })}
            </p>
          )}
        </div>

        <aside className="space-y-3 rounded-md border border-line bg-surface p-3 lg:max-h-[38rem] lg:overflow-y-auto">
          <p className="text-xs font-semibold tracking-wider text-ink-faint uppercase">{t('prostate.report.paramsTitle')}</p>
          <p className="text-xs text-ink-faint">{t('prostate.report.paramsHint')}</p>
          <div className="grid grid-cols-2 gap-2">
            <NumField
              label={t('prostate.report.noduleA')}
              value={globals.noduleMmA}
              min={0}
              decimals
              unit="mm"
              onChange={(v) => setGlobals({ noduleMmA: v })}
            />
            <NumField
              label={t('prostate.report.noduleB')}
              value={globals.noduleMmB}
              min={0}
              decimals
              unit="mm"
              onChange={(v) => setGlobals({ noduleMmB: v })}
            />
          </div>
          {PARAM_GROUPS.map((group) => (
            <div key={group}>
              <p className="mb-1 text-[0.6875rem] font-semibold tracking-wider text-ink-faint uppercase">
                {t(`prostate.report.groups.${group}`)}
              </p>
              <ul className="space-y-1">
                {params
                  .filter((p) => p.group === group)
                  .map((p) => (
                    <li key={p.key}>
                      <button
                        type="button"
                        draggable
                        onDragStart={(e) => dragStart(e, p.key)}
                        onClick={() => insert(p.key)}
                        title={`[${p.key}]`}
                        className="flex w-full cursor-grab flex-col rounded-md border border-line bg-elevated px-2.5 py-1.5 text-left transition-colors hover:border-accent hover:bg-accent-soft active:cursor-grabbing"
                      >
                        <span className="text-xs font-medium text-ink">{p.label}</span>
                        <span className="truncate text-[0.6875rem] text-ink-muted" title={p.value}>
                          {p.value}
                        </span>
                      </button>
                    </li>
                  ))}
              </ul>
            </div>
          ))}
        </aside>
      </div>

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold tracking-tight text-ink">{t('prostate.report.preview')}</h3>
          <Button type="button" size="sm" onClick={() => void copy()} disabled={!rendered.trim()}>
            {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
            {copied ? t('prostate.report.copied') : t('prostate.report.copy')}
          </Button>
        </div>
        <pre className="mt-2 max-h-[32rem] overflow-auto rounded-md border-2 border-accent/40 bg-accent-soft px-4 py-3 font-sans text-sm leading-relaxed whitespace-pre-wrap text-ink">
          {rendered}
        </pre>
      </div>
    </div>
  )
}
