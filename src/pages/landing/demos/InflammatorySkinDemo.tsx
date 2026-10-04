import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Search as SearchIcon } from 'lucide-react'
import { suggest, type CaseChoice } from '@/tools/inflammatory-skin/match'
import { findPattern, labelOf } from '@/tools/inflammatory-skin/types'
import { psoriasiform } from '@/tools/inflammatory-skin/content/psoriasiform'
import { interfaceDermatitis } from '@/tools/inflammatory-skin/content/interface'
import { spongiotic } from '@/tools/inflammatory-skin/content/spongiotic'
import { cn } from '@/lib/cn'
import { DemoFrame, DemoLabel } from '../SnapSection'

/* Três padrões de reação bastam para a demonstração; a ferramenta tem os
   dezenove, e os 175 verbetes. */
const DIAGNOSES = [...psoriasiform, ...interfaceDermatitis, ...spongiotic]

const PATTERN_IDS = ['psoriasiform', 'interface-lichenoid', 'spongiotic']

/** Os achados que separam psoríase, líquen plano e eczema uns dos outros. */
const FINDING_IDS = [
  'parakeratosis-confluent',
  'neutrophils-corneum',
  'hypogranulosis',
  'acanthosis-regular',
  'thin-suprapapillary',
  'band-like',
  'wedge-hypergranulosis',
  'saw-tooth',
  'necrotic-keratinocytes',
  'spongiosis',
  'eosinophils',
  'plasma-cells',
]

/** O caso já começado: uma placa escamosa de extensor, em pequeno aumento. */
const START = { pattern: 'psoriasiform', findings: ['acanthosis-regular', 'parakeratosis-confluent'] }

export default function InflammatorySkinDemo() {
  const { t } = useTranslation()
  const [pattern, setPattern] = useState<string | null>(START.pattern)
  const [findings, setFindings] = useState<Set<string>>(new Set(START.findings))

  const toggleFinding = (id: string) =>
    setFindings((current) => {
      const next = new Set(current)
      if (!next.delete(id)) next.add(id)
      return next
    })

  const suggestions = useMemo(() => {
    const choice: CaseChoice = {
      patterns: new Set(pattern ? [pattern] : []),
      clinical: new Set<string>(),
      histology: findings,
      query: '',
    }
    return suggest(DIAGNOSES, choice).slice(0, 4)
  }, [pattern, findings])

  const best = suggestions[0]?.score ?? 0
  const worst = suggestions[suggestions.length - 1]?.score ?? 0
  const span = Math.max(1, best - worst)

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,24rem)_minmax(0,1fr)]">
      <DemoFrame className="flex flex-col">
        <DemoLabel>{t('landing.demo.skin.patternLabel')}</DemoLabel>
        <div className="flex flex-wrap gap-1.5">
          {PATTERN_IDS.map((id) => (
            <Chip key={id} active={pattern === id} onClick={() => setPattern(pattern === id ? null : id)}>
              {findPattern(id)?.label ?? id}
            </Chip>
          ))}
        </div>

        <div className="mt-5">
          <DemoLabel>{t('landing.demo.skin.findingsLabel')}</DemoLabel>
          <div className="flex flex-wrap gap-1.5">
            {FINDING_IDS.map((id) => (
              <Chip key={id} active={findings.has(id)} onClick={() => toggleFinding(id)}>
                {labelOf(id)}
              </Chip>
            ))}
          </div>
        </div>

        <p className="mt-auto pt-4 text-xs leading-relaxed text-ink-faint">
          {t('landing.demo.skin.hint')}
        </p>
      </DemoFrame>

      <DemoFrame className="flex flex-col">
        <DemoLabel>{t('landing.demo.skin.resultsLabel')}</DemoLabel>
        {suggestions.length === 0 ? (
          <p className="rounded-md border border-line bg-surface px-3.5 py-3 text-sm text-ink-faint">
            {t('landing.demo.skin.empty')}
          </p>
        ) : (
          <ol className="max-h-[26rem] space-y-2 overflow-auto pr-1">
            {suggestions.map((item, index) => (
              <li
                key={item.diagnosis.id}
                className={cn(
                  'rounded-md border px-3.5 py-3',
                  index === 0 ? 'border-accent/40 bg-accent-soft/40' : 'border-line bg-surface',
                )}
              >
                <div className="flex items-baseline justify-between gap-3">
                  <p className="text-sm font-semibold text-ink">{item.diagnosis.name}</p>
                  <span className="tabular shrink-0 text-xs text-ink-faint">{item.score.toFixed(1)}</span>
                </div>

                <div className="mt-2 h-1 overflow-hidden rounded-full bg-line">
                  <div
                    className="h-full rounded-full bg-accent"
                    style={{ width: `${Math.max(4, ((item.score - worst) / span) * 100)}%` }}
                  />
                </div>

                {item.histologyHits.length > 0 && (
                  <p className="mt-1.5 flex flex-wrap gap-x-1.5 gap-y-1 text-xs text-ink-muted">
                    {item.histologyHits.map((id) => (
                      <span key={id} className="inline-flex items-center gap-1">
                        <Check className="size-3 text-success" aria-hidden />
                        {labelOf(id)}
                      </span>
                    ))}
                  </p>
                )}

                {item.missingHallmarks.length > 0 && (
                  <p className="mt-2 flex items-start gap-1.5 text-xs leading-relaxed text-ink-faint">
                    <SearchIcon className="mt-0.5 size-3 shrink-0" aria-hidden />
                    <span>
                      {t('landing.demo.skin.lookFor')}{' '}
                      {item.missingHallmarks.map((id) => labelOf(id)).join(' · ')}
                    </span>
                  </p>
                )}
              </li>
            ))}
          </ol>
        )}
      </DemoFrame>
    </div>
  )
}

function Chip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
        active
          ? 'border-accent bg-accent-soft text-accent-ink'
          : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink',
      )}
    >
      {children}
    </button>
  )
}
