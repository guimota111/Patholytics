import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Clock } from 'lucide-react'
import { cn } from '@/lib/cn'
import { formatCountdown } from '@/tools/organizer/format'
import { DemoFrame, DemoLabel } from '../SnapSection'

const HOUR = 60 * 60 * 1000

interface DemoCase {
  id: string
  title: string
  identifier: string
  stage: number
  /** Prazo em horas a partir de agora; negativo já venceu. */
  dueInHours: number | null
  pending: boolean
}

const STAGE_COLORS = ['#8a93a3', '#eab308', '#6a4cff', '#15905f']

const INITIAL: DemoCase[] = [
  { id: 'c1', title: 'Prostatectomia radical', identifier: 'AP-24-1187', stage: 1, dueInHours: 26, pending: false },
  { id: 'c2', title: 'Segmentectomia de mama', identifier: 'AP-24-1192', stage: 0, dueInHours: 2, pending: true },
  { id: 'c3', title: 'Colectomia direita', identifier: 'AP-24-1201', stage: 2, dueInHours: 72, pending: false },
  { id: 'c4', title: 'Biópsia de pele', identifier: 'AP-24-1204', stage: 3, dueInHours: null, pending: false },
  { id: 'c5', title: 'Curetagem uterina', identifier: 'AP-24-1210', stage: 0, dueInHours: -5, pending: false },
]

/**
 * O organizador de verdade guarda tudo na conta do usuário; aqui as etapas
 * andam só no navegador de quem visita — clique num caso para empurrá-lo.
 */
export default function OrganizerDemo() {
  const { t } = useTranslation()
  const [cases, setCases] = useState(INITIAL)
  const [filter, setFilter] = useState<number | 'all'>('all')
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  const stages = useMemo(
    () => [
      { name: t('organizer.stageNames.notSeen'), emoji: '🔍' },
      { name: t('organizer.stageNames.seenNotReported'), emoji: '👀' },
      { name: t('organizer.stageNames.staining'), emoji: '🧪' },
      { name: t('organizer.stageNames.reported'), emoji: '✅' },
    ],
    [t],
  )

  const advance = (id: string) =>
    setCases((current) =>
      current.map((item) => (item.id === id ? { ...item, stage: (item.stage + 1) % stages.length } : item)),
    )

  const shown = filter === 'all' ? cases : cases.filter((item) => item.stage === filter)

  return (
    <DemoFrame>
      <DemoLabel>{t('landing.demo.organizer.boardLabel')}</DemoLabel>

      <div className="flex flex-wrap gap-2">
        <FilterChip
          label={t('organizer.filters.all')}
          count={cases.length}
          active={filter === 'all'}
          onClick={() => setFilter('all')}
        />
        {stages.map((stage, index) => (
          <FilterChip
            key={stage.name}
            label={`${stage.emoji} ${stage.name}`}
            color={STAGE_COLORS[index]}
            count={cases.filter((item) => item.stage === index).length}
            active={filter === index}
            onClick={() => setFilter(index)}
          />
        ))}
      </div>

      <ul className="mt-4 divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
        {shown.map((item) => {
          const countdown = item.dueInHours === null ? null : formatCountdown(now + item.dueInHours * HOUR, now)
          return (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => advance(item.id)}
                className="flex w-full flex-wrap items-center gap-x-3 gap-y-1 px-3.5 py-2.5 text-left transition-colors hover:bg-raised"
              >
                <span
                  className="size-2.5 shrink-0 rounded-full"
                  style={{ backgroundColor: STAGE_COLORS[item.stage] }}
                  aria-hidden
                />
                <span className="text-sm font-medium text-ink">{item.title}</span>
                <span className="tabular text-xs text-ink-faint">{item.identifier}</span>
                <span className="text-xs text-ink-muted">
                  {stages[item.stage].emoji} {stages[item.stage].name}
                </span>
                {item.pending && (
                  <span className="rounded-full border border-danger/30 bg-danger-soft px-2 py-0.5 text-[0.6875rem] text-danger">
                    {t('organizer.filters.pending')}
                  </span>
                )}
                {countdown && (
                  <span
                    className={cn(
                      'tabular ml-auto inline-flex items-center gap-1 text-xs',
                      countdown.level === 'overdue'
                        ? 'text-danger'
                        : countdown.level === 'warn'
                          ? 'text-accent-ink'
                          : 'text-ink-faint',
                    )}
                  >
                    <Clock className="size-3.5" aria-hidden />
                    {countdown.text}
                  </span>
                )}
                {item.stage === stages.length - 1 && (
                  <Check className="ml-auto size-4 text-success" aria-hidden />
                )}
              </button>
            </li>
          )
        })}
        {shown.length === 0 && (
          <li className="px-3.5 py-6 text-center text-sm text-ink-faint">{t('organizer.list.noMatch')}</li>
        )}
      </ul>

      <p className="mt-3 text-xs leading-relaxed text-ink-faint">{t('landing.demo.organizer.hint')}</p>
    </DemoFrame>
  )
}

function FilterChip({
  label,
  count,
  active,
  color,
  onClick,
}: {
  label: string
  count: number
  active: boolean
  color?: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'flex shrink-0 items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors',
        active
          ? 'border-accent bg-accent-soft text-accent-ink'
          : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink',
      )}
    >
      {color && <span className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} aria-hidden />}
      <span className="truncate">{label}</span>
      <span className="tabular text-xs text-ink-faint">{count}</span>
    </button>
  )
}
