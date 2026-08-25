import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import type { Stage } from '../types'
import type { StageFilter } from '../useOrganizer'

interface Props {
  stages: Stage[]
  counts: { total: number; byStage: Map<string, number>; pending: number }
  active: StageFilter
  onChange: (filter: StageFilter) => void
}

/**
 * Contador e filtro sao a mesma coisa: um numero que nao se pode clicar vira
 * pergunta sem resposta. As faixas saem das etapas da lista, entao renomear
 * uma etapa renomeia o filtro sem nenhuma outra mudanca.
 */
export function StageBar({ stages, counts, active, onChange }: Props) {
  const { t } = useTranslation()

  const chip = (key: StageFilter, label: string, count: number, color?: string) => (
    <button
      key={key}
      type="button"
      onClick={() => onChange(key)}
      aria-pressed={active === key}
      className={cn(
        'flex shrink-0 items-center gap-2 rounded-md border px-3 py-2 text-left text-sm transition-colors',
        active === key
          ? 'border-accent bg-accent-soft text-accent-ink'
          : 'border-line bg-elevated text-ink-muted hover:border-line-strong hover:text-ink',
      )}
    >
      {color && (
        <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden />
      )}
      <span className="truncate">{label}</span>
      <span className="tabular text-xs text-ink-faint">{count}</span>
    </button>
  )

  return (
    <div className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
      {chip('all', t('organizer.filters.all'), counts.total)}
      {stages.map((stage) =>
        chip(stage.id, `${stage.emoji ? `${stage.emoji} ` : ''}${stage.name}`, counts.byStage.get(stage.id) ?? 0, stage.color),
      )}
      {counts.pending > 0 && chip('pending', t('organizer.filters.pending'), counts.pending, '#ef4444')}
    </div>
  )
}
