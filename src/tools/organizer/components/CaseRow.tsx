import { useEffect, useState, type DragEvent } from 'react'
import { useTranslation } from 'react-i18next'
import {
  Archive,
  ArrowRightLeft,
  Check,
  ChevronDown,
  ChevronUp,
  Copy,
  GripVertical,
  Trash2,
} from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { deadlineToInput, formatCountdown, formatStamp, parseDeadlineInput, parseTags } from '../format'
import { lastLogText, type CaseList, type OrganizerCase } from '../types'

export interface CaseRowActions {
  patchCase: (caseId: string, changes: Record<string, unknown>) => Promise<void>
  appendLog: (item: OrganizerCase, text: string) => Promise<void>
  setPending: (item: OrganizerCase, text: string) => Promise<void>
  toggleReviewed: (item: OrganizerCase) => Promise<void>
  archiveCase: (item: OrganizerCase) => Promise<void>
}

interface Props {
  item: OrganizerCase
  list: CaseList
  now: number
  locale: string
  expanded: boolean
  onToggle: () => void
  selectMode: boolean
  selected: boolean
  onSelect: () => void
  draggable: boolean
  onDragStart: (event: DragEvent<HTMLDivElement>) => void
  onDragOver: (event: DragEvent<HTMLDivElement>) => void
  onDrop: (event: DragEvent<HTMLDivElement>) => void
  onDragEnd: () => void
  onMoveUp?: () => void
  onMoveDown?: () => void
  onRequestMove: () => void
  onRequestDelete: () => void
  actions: CaseRowActions
  canMoveBetweenLists: boolean
}

const DEADLINE_TONE = {
  ok: 'border-line text-ink-muted',
  warn: 'border-amber-500/40 text-amber-600 dark:text-amber-400',
  overdue: 'border-danger/40 bg-danger-soft text-danger',
} as const

export function CaseRow({
  item,
  list,
  now,
  locale,
  expanded,
  onToggle,
  selectMode,
  selected,
  onSelect,
  draggable,
  onDragStart,
  onDragOver,
  onDrop,
  onDragEnd,
  onMoveUp,
  onMoveDown,
  onRequestMove,
  onRequestDelete,
  actions,
  canMoveBetweenLists,
}: Props) {
  const { t } = useTranslation()
  const stage = list.stages.find((entry) => entry.id === item.stageId) ?? list.stages[0]

  const [title, setTitle] = useState(item.title)
  const [identifier, setIdentifier] = useState(item.identifier)
  const [deadline, setDeadline] = useState(deadlineToInput(item.deadline))
  const [tags, setTags] = useState(item.tags.join(', '))
  const [notes, setNotes] = useState(item.notes)
  const [logDraft, setLogDraft] = useState('')
  const [pendingDraft, setPendingDraft] = useState(item.pending?.text ?? '')
  const [pendingOpen, setPendingOpen] = useState(false)
  const [deadlineError, setDeadlineError] = useState(false)
  const [saved, setSaved] = useState(false)
  const [copied, setCopied] = useState(false)

  // Um caso editado em outro dispositivo nao pode sobrescrever o que esta
  // sendo digitado aqui — por isso o rascunho so recarrega ao fechar e abrir.
  useEffect(() => {
    if (expanded) return
    setTitle(item.title)
    setIdentifier(item.identifier)
    setDeadline(deadlineToInput(item.deadline))
    setTags(item.tags.join(', '))
    setNotes(item.notes)
    setPendingDraft(item.pending?.text ?? '')
    setPendingOpen(false)
    setDeadlineError(false)
  }, [expanded, item])

  const countdown = item.deadline ? formatCountdown(item.deadline, now) : null
  const summary = lastLogText(item)
  const identifierLabel = list.identifierLabel.trim() || t('organizer.case.identifier')

  const copy = async (value: string) => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      setTimeout(() => setCopied(false), 1400)
    } catch {
      /* area de transferencia bloqueada — o texto continua selecionavel */
    }
  }

  const save = async () => {
    const trimmedTitle = title.trim()
    if (!trimmedTitle) return
    const parsed = deadline.trim() ? parseDeadlineInput(deadline) : null
    if (deadline.trim() && parsed === null) {
      setDeadlineError(true)
      return
    }
    setDeadlineError(false)
    await actions.patchCase(item.id, {
      title: trimmedTitle,
      identifier: identifier.trim(),
      deadline: parsed,
      tags: parseTags(tags),
      notes,
    })
    setSaved(true)
    setTimeout(() => setSaved(false), 1400)
  }

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={cn(
        'rounded-md border border-l-[3px] bg-elevated transition-colors',
        selected ? 'border-accent bg-accent-soft' : 'border-line hover:border-line-strong',
        item.reviewed && !selected && 'opacity-70',
      )}
      style={{ borderLeftColor: stage?.color }}
    >
      <div className="flex items-start gap-2 px-2 py-2 sm:px-3">
        {draggable && (
          <span
            className="mt-1 hidden cursor-grab text-ink-faint sm:block"
            title={t('organizer.row.drag')}
            aria-hidden
          >
            <GripVertical className="size-4" />
          </span>
        )}

        {selectMode ? (
          <button
            type="button"
            onClick={onSelect}
            aria-pressed={selected}
            aria-label={t('organizer.row.select')}
            className={cn(
              'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded border',
              selected ? 'border-accent bg-accent text-white' : 'border-line text-transparent',
            )}
          >
            <Check className="size-4" aria-hidden />
          </button>
        ) : (
          list.showReviewCheck && (
            <button
              type="button"
              onClick={() => void actions.toggleReviewed(item)}
              aria-pressed={item.reviewed}
              title={t('organizer.row.reviewed')}
              className={cn(
                'mt-0.5 flex size-6 shrink-0 items-center justify-center rounded border transition-colors',
                item.reviewed
                  ? 'border-success/40 bg-success/10 text-success'
                  : 'border-line text-ink-faint hover:border-line-strong hover:text-ink',
              )}
            >
              <Check className="size-4" aria-hidden />
            </button>
          )
        )}

        <button
          type="button"
          onClick={selectMode ? onSelect : onToggle}
          className="min-w-0 flex-1 text-left"
          aria-expanded={expanded}
        >
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
            {item.identifier && (
              <span
                onClick={(event) => {
                  if (selectMode) return
                  event.stopPropagation()
                  void copy(item.identifier)
                }}
                className="tabular cursor-pointer text-xs text-ink-muted hover:text-accent"
                title={t('organizer.row.copy')}
              >
                {copied ? t('organizer.row.copied') : item.identifier}
              </span>
            )}
            {countdown && (
              <span
                className={cn(
                  'tabular rounded border px-1.5 py-0.5 text-[0.6875rem]',
                  DEADLINE_TONE[countdown.level],
                )}
              >
                {countdown.text}
              </span>
            )}
            {item.pending && (
              <span className="rounded border border-danger/40 bg-danger-soft px-1.5 py-0.5 text-[0.6875rem] font-medium text-danger">
                {t('organizer.case.pendingShort')}
              </span>
            )}
            {item.tags.map((tag) => (
              <span
                key={tag}
                className="rounded border border-line px-1.5 py-0.5 text-[0.6875rem] text-ink-faint"
              >
                {tag}
              </span>
            ))}
          </div>

          <p className="mt-0.5 truncate text-sm font-medium text-ink">{item.title}</p>
          {(item.pending?.text || summary) && (
            <p className="truncate text-xs text-ink-muted">{item.pending?.text || summary}</p>
          )}
          {item.reviewed && item.reviewedAt && (
            <p className="tabular mt-0.5 text-[0.6875rem] text-ink-faint">
              {t('organizer.row.reviewedAt', { when: formatStamp(item.reviewedAt, locale) })}
            </p>
          )}
        </button>

        <div className="flex shrink-0 items-center gap-1.5">
          {!selectMode && stage && (
            <select
              value={stage.id}
              onChange={(event) => void actions.patchCase(item.id, { stageId: event.target.value })}
              onClick={(event) => event.stopPropagation()}
              aria-label={t('organizer.case.stage')}
              className="h-8 max-w-[7.5rem] rounded-md border border-line bg-surface px-1.5 text-xs text-ink sm:max-w-none sm:px-2"
            >
              {list.stages.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.emoji ? `${entry.emoji} ` : ''}
                  {entry.name}
                </option>
              ))}
            </select>
          )}
          <ChevronDown
            className={cn('size-4 shrink-0 text-ink-faint transition-transform', expanded && 'rotate-180')}
            aria-hidden
          />
        </div>
      </div>

      {expanded && !selectMode && (
        <div className="space-y-4 border-t border-line px-3 py-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="space-y-1 text-xs font-medium text-ink">
              {t('organizer.case.title')}
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                className="h-9 w-full rounded-md border border-line bg-surface px-2.5 text-sm font-normal text-ink"
              />
            </label>
            <label className="space-y-1 text-xs font-medium text-ink">
              {identifierLabel}
              <input
                value={identifier}
                onChange={(event) => setIdentifier(event.target.value)}
                className="tabular h-9 w-full rounded-md border border-line bg-surface px-2.5 text-sm font-normal text-ink"
              />
            </label>
            <label className="space-y-1 text-xs font-medium text-ink">
              {t('organizer.case.deadline')}
              <input
                value={deadline}
                onChange={(event) => {
                  setDeadline(event.target.value)
                  setDeadlineError(false)
                }}
                placeholder={t('organizer.case.deadlinePlaceholder')}
                className={cn(
                  'h-9 w-full rounded-md border bg-surface px-2.5 text-sm font-normal text-ink',
                  deadlineError ? 'border-danger' : 'border-line',
                )}
              />
              <span className={cn('block text-[0.6875rem] font-normal', deadlineError ? 'text-danger' : 'text-ink-faint')}>
                {deadlineError ? t('organizer.case.deadlineInvalid') : t('organizer.case.deadlineHint')}
              </span>
            </label>
            <label className="space-y-1 text-xs font-medium text-ink">
              {t('organizer.case.tags')}
              <input
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder={t('organizer.case.tagsPlaceholder')}
                className="h-9 w-full rounded-md border border-line bg-surface px-2.5 text-sm font-normal text-ink"
              />
            </label>
          </div>

          <div className="space-y-2">
            {item.pending || pendingOpen ? (
              <div className="flex flex-wrap items-end gap-2">
                <label className="min-w-[12rem] flex-1 space-y-1 text-xs font-medium text-ink">
                  {t('organizer.case.pending')}
                  <input
                    value={pendingDraft}
                    onChange={(event) => setPendingDraft(event.target.value)}
                    placeholder={t('organizer.case.pendingPlaceholder')}
                    className="h-9 w-full rounded-md border border-line bg-surface px-2.5 text-sm font-normal text-ink"
                  />
                </label>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() => void actions.setPending(item, pendingDraft)}
                >
                  {t('common.save')}
                </Button>
                {item.pending && (
                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => {
                      setPendingDraft('')
                      setPendingOpen(false)
                      void actions.setPending(item, '')
                    }}
                  >
                    {t('organizer.case.resolvePending')}
                  </Button>
                )}
              </div>
            ) : (
              <Button type="button" size="sm" variant="ghost" onClick={() => setPendingOpen(true)}>
                {t('organizer.case.markPending')}
              </Button>
            )}
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-ink">
              {t('organizer.case.log')}{' '}
              <span className="tabular font-normal text-ink-faint">
                {t('organizer.case.logCount', { count: item.log.length })}
              </span>
            </p>
            <div className="flex gap-2">
              <input
                value={logDraft}
                onChange={(event) => setLogDraft(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key !== 'Enter') return
                  event.preventDefault()
                  void actions.appendLog(item, logDraft)
                  setLogDraft('')
                }}
                placeholder={t('organizer.case.logPlaceholder')}
                className="h-9 min-w-0 flex-1 rounded-md border border-line bg-surface px-2.5 text-sm text-ink"
              />
              <Button
                type="button"
                size="sm"
                onClick={() => {
                  void actions.appendLog(item, logDraft)
                  setLogDraft('')
                }}
              >
                {t('organizer.case.addLog')}
              </Button>
            </div>
            {item.log.length > 0 && (
              <div className="max-h-48 space-y-1 overflow-y-auto rounded-md border border-line bg-surface px-3 py-2">
                {[...item.log].reverse().map((entry, index) => (
                  <div key={`${entry.ts}-${index}`} className="flex gap-2 text-xs">
                    <span className="tabular shrink-0 text-ink-faint">
                      {entry.ts ? formatStamp(entry.ts, locale) : '—'}
                    </span>
                    <span className={index === 0 ? 'text-ink' : 'text-ink-muted'}>{entry.text}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <label className="space-y-1 text-xs font-medium text-ink">
            {t('organizer.case.notes')}
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={6}
              placeholder={t('organizer.case.notesPlaceholder')}
              className="w-full rounded-md border border-line bg-surface px-2.5 py-2 text-sm font-normal text-ink"
            />
          </label>

          <div className="flex flex-wrap gap-2">
            <Button type="button" size="sm" onClick={() => void save()}>
              {saved ? <Check className="size-4" aria-hidden /> : null}
              {saved ? t('common.saved') : t('common.save')}
            </Button>
            <Button type="button" size="sm" variant="secondary" onClick={() => void actions.archiveCase(item)}>
              <Archive className="size-4" aria-hidden />
              {t('organizer.case.archive')}
            </Button>
            {item.identifier && (
              <Button type="button" size="sm" variant="ghost" onClick={() => void copy(item.identifier)}>
                <Copy className="size-4" aria-hidden />
                {identifierLabel}
              </Button>
            )}
            {canMoveBetweenLists && (
              <Button type="button" size="sm" variant="ghost" onClick={onRequestMove}>
                <ArrowRightLeft className="size-4" aria-hidden />
                {t('organizer.case.move')}
              </Button>
            )}
            {onMoveUp && (
              <Button type="button" size="sm" variant="ghost" onClick={onMoveUp} aria-label={t('organizer.row.moveUp')}>
                <ChevronUp className="size-4" aria-hidden />
              </Button>
            )}
            {onMoveDown && (
              <Button type="button" size="sm" variant="ghost" onClick={onMoveDown} aria-label={t('organizer.row.moveDown')}>
                <ChevronDown className="size-4" aria-hidden />
              </Button>
            )}
            <Button type="button" size="sm" variant="danger" onClick={onRequestDelete}>
              <Trash2 className="size-4" aria-hidden />
              {t('organizer.case.delete')}
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
