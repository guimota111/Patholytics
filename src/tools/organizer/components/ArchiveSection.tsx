import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, RotateCcw, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { formatDate } from '../format'
import { lastLogText, type OrganizerCase } from '../types'

interface Props {
  cases: OrganizerCase[]
  locale: string
  onRestore: (item: OrganizerCase) => Promise<void>
  onDelete: (item: OrganizerCase) => void
}

export function ArchiveSection({ cases, locale, onRestore, onDelete }: Props) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)

  return (
    <section className="mt-6 rounded-lg border border-line bg-elevated">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left"
      >
        <span className="text-sm font-semibold tracking-tight text-ink">
          {t('organizer.archive.title')}{' '}
          <span className="tabular font-normal text-ink-faint">{cases.length}</span>
        </span>
        <ChevronDown
          className={cn('size-4 text-ink-faint transition-transform', open && 'rotate-180')}
          aria-hidden
        />
      </button>

      {open && (
        <div className="border-t border-line px-3 py-3">
          {cases.length === 0 ? (
            <p className="px-1 py-4 text-center text-sm text-ink-faint">{t('organizer.archive.empty')}</p>
          ) : (
            <ul className="space-y-2">
              {cases.map((item) => (
                <li
                  key={item.id}
                  className="flex flex-wrap items-center gap-2 rounded-md border border-line bg-surface px-3 py-2"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm text-ink-muted">
                      {item.identifier && <span className="tabular mr-2 text-xs">{item.identifier}</span>}
                      {item.title}
                    </p>
                    {lastLogText(item) && (
                      <p className="truncate text-xs text-ink-faint">{lastLogText(item)}</p>
                    )}
                  </div>
                  {item.archivedAt && (
                    <span className="tabular text-[0.6875rem] text-ink-faint">
                      {formatDate(item.archivedAt, locale)}
                    </span>
                  )}
                  <Button type="button" size="sm" variant="ghost" onClick={() => void onRestore(item)}>
                    <RotateCcw className="size-4" aria-hidden />
                    {t('organizer.archive.restore')}
                  </Button>
                  <Button type="button" size="sm" variant="danger" onClick={() => onDelete(item)}>
                    <Trash2 className="size-4" aria-hidden />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </section>
  )
}
