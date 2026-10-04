import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Minus, Plus } from 'lucide-react'
import { nextMarkers, suggest, type Choice, type MarkerInput, type Result } from '@/tools/markers/match'
import { findMarker, pctLabel } from '@/tools/markers/types'
import { thorax } from '@/tools/markers/content/thorax'
import { cn } from '@/lib/cn'
import { DemoFrame, DemoLabel } from '../SnapSection'

/* Um sistema basta para a demonstração — a ferramenta tem os quinze, com 288
   tumores. Aqui é a pergunta de sempre da biópsia pulmonar. */
const PANEL = ['ttf1', 'napsina', 'p40', 'ck7', 'sinaptofisina', 'calretinina', 'wt1', 'cd45']

/** O caso já começado: massa pulmonar, células glandulares, dois anticorpos. */
const START: [string, Result][] = [
  ['ttf1', 'pos'],
  ['p40', 'neg'],
]

export default function MarkerHelperDemo() {
  const { t } = useTranslation()
  const [markers, setMarkers] = useState<Map<string, MarkerInput>>(
    () => new Map(START.map(([id, result]) => [id, { result }])),
  )

  // Um clique marca positivo ou negativo; clicar de novo no mesmo lado desfaz.
  const set = (id: string, result: Result) =>
    setMarkers((current) => {
      const next = new Map(current)
      if (next.get(id)?.result === result) next.delete(id)
      else next.set(id, { result })
      return next
    })

  const { top, next } = useMemo(() => {
    const choice: Choice = {
      site: 'pulmao',
      cells: new Set(['glandular']),
      architecture: new Set<string>(),
      features: new Set(['desmoplasia']),
      age: null,
      sex: null,
      markers,
      query: '',
    }
    const { primary } = suggest(thorax, choice)
    return { top: primary.slice(0, 4), next: nextMarkers(primary, new Set(markers.keys()), 3) }
  }, [markers])

  const best = top[0]?.score ?? 0
  const worst = top[top.length - 1]?.score ?? 0
  const span = Math.max(1, best - worst)

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <DemoFrame className="flex flex-col">
        <DemoLabel>{t('landing.demo.markers.caseLabel')}</DemoLabel>
        <p className="rounded-md border border-line bg-surface px-3.5 py-2.5 text-sm text-ink-muted">
          {t('landing.demo.markers.caseText')}
        </p>

        <div className="mt-4">
          <DemoLabel>{t('landing.demo.markers.panelLabel')}</DemoLabel>
          <ul className="divide-y divide-line overflow-hidden rounded-md border border-line bg-surface">
            {PANEL.map((id) => {
              const marker = findMarker(id)
              const state = markers.get(id)?.result ?? null
              return (
                <li key={id} className="flex items-center justify-between gap-3 px-3 py-2">
                  <span className="truncate text-sm text-ink">{marker?.label ?? id}</span>
                  <span className="flex shrink-0 gap-1">
                    <ResultButton active={state === 'pos'} tone="pos" onClick={() => set(id, 'pos')} label={marker?.readout?.[0] ?? t('landing.demo.markers.positive')}>
                      <Plus className="size-3.5" aria-hidden />
                    </ResultButton>
                    <ResultButton active={state === 'neg'} tone="neg" onClick={() => set(id, 'neg')} label={marker?.readout?.[1] ?? t('landing.demo.markers.negative')}>
                      <Minus className="size-3.5" aria-hidden />
                    </ResultButton>
                  </span>
                </li>
              )
            })}
          </ul>
        </div>

        <p className="mt-auto pt-4 text-xs leading-relaxed text-ink-faint">{t('landing.demo.markers.hint')}</p>
      </DemoFrame>

      <DemoFrame className="flex flex-col">
        <DemoLabel>{t('landing.demo.markers.resultsLabel')}</DemoLabel>
        <ol className="space-y-2">
          {top.map((item, index) => (
            <li
              key={item.tumor.id}
              className={cn(
                'rounded-md border px-3.5 py-3',
                index === 0 ? 'border-accent/40 bg-accent-soft/40' : 'border-line bg-surface',
              )}
            >
              <div className="flex items-baseline justify-between gap-3">
                <p className="text-sm font-semibold text-ink">{item.tumor.name}</p>
                <span className="tabular shrink-0 text-xs text-ink-faint">{item.score.toFixed(1)}</span>
              </div>

              <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
                <div
                  className="h-full rounded-full bg-accent"
                  style={{ width: `${Math.max(4, ((item.score - worst) / span) * 100)}%` }}
                />
              </div>

              <p className="mt-2 flex flex-wrap gap-1">
                {item.markers.map((verdict) => (
                  <span
                    key={verdict.marker}
                    className={cn(
                      'tabular rounded border px-1.5 py-0.5 text-[0.6875rem]',
                      verdict.verdict === 'bate'
                        ? 'border-success/40 bg-success/10 text-success'
                        : verdict.verdict === 'nao-bate'
                          ? 'border-danger/40 bg-danger-soft text-danger'
                          : 'border-line bg-surface text-ink-muted',
                    )}
                  >
                    {findMarker(verdict.marker)?.label ?? verdict.marker}
                    {verdict.input.result === 'pos' ? ' +' : ' −'}
                    {verdict.entry ? ` ${pctLabel(verdict.entry.pct)}` : ''}
                  </span>
                ))}
              </p>
            </li>
          ))}
        </ol>

        {next.length > 0 && (
          <div className="mt-4">
            <DemoLabel>{t('landing.demo.markers.nextLabel')}</DemoLabel>
            <div className="flex flex-wrap gap-1.5">
              {next.map((item) => (
                <button
                  key={item.marker}
                  type="button"
                  onClick={() => set(item.marker, 'pos')}
                  className="rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-medium text-ink-muted transition-colors hover:border-accent/40 hover:text-accent-ink"
                >
                  {findMarker(item.marker)?.label ?? item.marker}
                </button>
              ))}
            </div>
          </div>
        )}
      </DemoFrame>
    </div>
  )
}

function ResultButton({
  active,
  tone,
  onClick,
  label,
  children,
}: {
  active: boolean
  tone: 'pos' | 'neg'
  onClick: () => void
  label: string
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      aria-label={label}
      title={label}
      className={cn(
        'flex size-7 items-center justify-center rounded-md border transition-colors',
        active
          ? tone === 'pos'
            ? 'border-success/50 bg-success/15 text-success'
            : 'border-danger/50 bg-danger-soft text-danger'
          : 'border-line bg-elevated text-ink-faint hover:border-line-strong hover:text-ink',
      )}
    >
      {children}
    </button>
  )
}
