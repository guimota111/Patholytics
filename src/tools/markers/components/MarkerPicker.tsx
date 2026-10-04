/* ==========================================================================
   MarkerPicker.tsx — a entrada da imuno-histoquímica: busca um marcador
   pelo nome (ou sinônimo), um painel rápido com os mais pedidos, e a lista
   do que já foi informado, cada um com positivo/negativo, o padrão
   observado (opcional) e o botão de tirar.
   ========================================================================== */

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Minus, Plus, Search, X } from 'lucide-react'
import { TopicGroup, TopicList } from '@/components/ui/didactic'
import { cn } from '@/lib/cn'
import { normalize, type MarkerInput, type Result } from '../match'
import { MARKERS, PATTERN_LABELS, findMarker, type Marker, type Pattern } from '../types'

const QUICK: string[] = ['ae1ae3', 'ck7', 'ck20', 'ttf1', 'cdx2', 'gata3', 'pax8', 'p40', 'er', 's100', 'sox10', 'cd45', 'sinaptofisina', 'cromogranina', 'vimentina', 'desmina', 'miogenina', 'sma', 'cd34', 'cd31', 'cd117', 'cd99', 'ki67', 'p53', 'p16', 'ini1']
const PATTERNS: Pattern[] = ['N', 'C', 'M', 'NC', 'CM', 'dot']

interface Props {
  markers: Map<string, MarkerInput>
  onSet: (id: string, input: MarkerInput | null) => void
}

export function MarkerPicker({ markers, onSet }: Props) {
  const { t } = useTranslation()
  const [q, setQ] = useState('')
  const [focus, setFocus] = useState(false)

  const hits = useMemo(() => {
    const n = normalize(q.trim())
    if (!n) return []
    return MARKERS.filter((m) => normalize([m.label, ...(m.aka ?? []), m.id].join(' ')).includes(n)).slice(0, 10)
  }, [q])

  const set = (id: string, result: Result) => {
    const cur = markers.get(id)
    onSet(id, { result, pattern: cur?.pattern })
    setQ('')
  }

  const tested = [...markers.entries()]

  return (
    <div className="space-y-4">
      <div className="relative">
        <label className="relative block">
          <span className="sr-only">{t('markers.searchMarker')}</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint" aria-hidden />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => setFocus(true)}
            onBlur={() => setTimeout(() => setFocus(false), 150)}
            placeholder={t('markers.searchMarkerPlaceholder')}
            className="h-10 w-full rounded-md border border-line bg-surface pr-3 pl-9 text-sm text-ink placeholder:text-ink-faint hover:border-line-strong"
          />
        </label>
        {focus && hits.length > 0 && (
          <ul className="absolute z-20 mt-1 w-full overflow-hidden rounded-md border border-line bg-elevated shadow-card">
            {hits.map((m) => (
              <li key={m.id} className="flex items-center gap-2 border-b border-line px-3 py-2 last:border-b-0">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{m.label}</p>
                  <p className="truncate text-xs text-ink-faint">{m.hint}</p>
                </div>
                <ResultButtons marker={m} current={markers.get(m.id)?.result} onPick={(r) => set(m.id, r)} />
              </li>
            ))}
          </ul>
        )}
      </div>

      <TopicList>
        <TopicGroup
          label={t('markers.quickPanel')}
          selected={QUICK.filter((id) => markers.has(id)).map((id) => `${findMarker(id)?.label} ${markers.get(id)?.result === 'pos' ? '+' : '−'}`)}
        >
        <div className="flex flex-wrap gap-1.5">
          {QUICK.map((id) => {
            const m = findMarker(id)
            if (!m) return null
            const cur = markers.get(id)?.result
            return (
              <span key={id} className={cn('inline-flex items-center overflow-hidden rounded-full border text-xs', cur ? 'border-accent' : 'border-line')}>
                <span className={cn('px-2 py-1 font-medium', cur ? 'bg-accent-soft text-accent-ink' : 'bg-surface text-ink-muted')} title={m.hint}>
                  {m.label}
                </span>
                <button type="button" onClick={() => set(id, 'pos')} aria-pressed={cur === 'pos'} className={cn('px-1.5 py-1 hover:bg-success/15', cur === 'pos' ? 'bg-success text-white' : 'text-success')} aria-label={`${m.label} ${t('markers.positive')}`}>
                  <Plus className="size-3" aria-hidden />
                </button>
                <button type="button" onClick={() => set(id, 'neg')} aria-pressed={cur === 'neg'} className={cn('px-1.5 py-1 hover:bg-danger/15', cur === 'neg' ? 'bg-danger text-white' : 'text-danger')} aria-label={`${m.label} ${t('markers.negative')}`}>
                  <Minus className="size-3" aria-hidden />
                </button>
              </span>
            )
          })}
        </div>
        </TopicGroup>
      </TopicList>

      {tested.length > 0 && (
        <ul className="divide-y divide-line rounded-md border border-line bg-surface">
          {tested.map(([id, input]) => {
            const m = findMarker(id)
            if (!m) return null
            const [posLabel, negLabel] = m.readout ?? [t('markers.positive'), t('markers.negative')]
            const askPattern = m.pattern !== 'perda' && !m.readout
            return (
              <li key={id} className="flex flex-wrap items-center gap-2 px-3 py-2">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{m.label}</p>
                  <p className="text-xs text-ink-faint">
                    {t('markers.expectedPattern')}: {PATTERN_LABELS[m.pattern]}
                  </p>
                </div>
                <div className="inline-flex overflow-hidden rounded-md border border-line text-xs">
                  <button type="button" onClick={() => onSet(id, { ...input, result: 'pos' })} aria-pressed={input.result === 'pos'} className={cn('px-2.5 py-1.5 font-medium', input.result === 'pos' ? 'bg-success text-white' : 'bg-surface text-ink-muted hover:text-ink')}>
                    {posLabel}
                  </button>
                  <button type="button" onClick={() => onSet(id, { ...input, result: 'neg' })} aria-pressed={input.result === 'neg'} className={cn('px-2.5 py-1.5 font-medium', input.result === 'neg' ? 'bg-danger text-white' : 'bg-surface text-ink-muted hover:text-ink')}>
                    {negLabel}
                  </button>
                </div>
                {askPattern && input.result === 'pos' && (
                  <select
                    value={input.pattern ?? ''}
                    onChange={(e) => onSet(id, { ...input, pattern: (e.target.value || undefined) as Pattern | undefined })}
                    className="h-8 rounded-md border border-line bg-surface px-2 text-xs text-ink"
                    aria-label={t('markers.observedPattern')}
                  >
                    <option value="">{t('markers.patternAny')}</option>
                    {PATTERNS.map((p) => (
                      <option key={p} value={p}>
                        {PATTERN_LABELS[p]}
                      </option>
                    ))}
                  </select>
                )}
                <button type="button" onClick={() => onSet(id, null)} className="rounded p-1 text-ink-faint hover:text-ink" aria-label={t('markers.remove')}>
                  <X className="size-4" aria-hidden />
                </button>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}

function ResultButtons({ marker, current, onPick }: { marker: Marker; current?: Result; onPick: (r: Result) => void }) {
  const { t } = useTranslation()
  const [posLabel, negLabel] = marker.readout ?? [t('markers.positive'), t('markers.negative')]
  return (
    <div className="inline-flex shrink-0 overflow-hidden rounded-md border border-line text-xs">
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onPick('pos')} className={cn('px-2 py-1 font-medium', current === 'pos' ? 'bg-success text-white' : 'text-success hover:bg-success/15')}>
        {posLabel}
      </button>
      <button type="button" onMouseDown={(e) => e.preventDefault()} onClick={() => onPick('neg')} className={cn('px-2 py-1 font-medium', current === 'neg' ? 'bg-danger text-white' : 'text-danger hover:bg-danger/15')}>
        {negLabel}
      </button>
    </div>
  )
}
