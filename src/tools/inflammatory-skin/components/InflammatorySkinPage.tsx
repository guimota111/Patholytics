/* ==========================================================================
   InflammatorySkinPage.tsx — quatro passos: padrão de reação, clínica,
   achados da lâmina e hipóteses. Cada hipótese explica o que combinou, o
   que pesa contra e o que ainda falta procurar; os primeiros colocados
   podem ser comparados lado a lado. A busca por nome atalha tudo.
   ========================================================================== */

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Columns3, Info, RotateCcw, Search, X } from 'lucide-react'
import { StepCard, TopicGroup, TopicList } from '@/components/ui/didactic'
import { cn } from '@/lib/cn'
import { DIAGNOSES } from '../content'
import { compare, suggest, type CompareCell } from '../match'
import { CLINICAL, CLINICAL_GROUPS, HISTOLOGY, HISTOLOGY_GROUPS, PATTERNS, PATTERN_GROUPS, labelOf, type Pattern } from '../types'
import { ResultCard } from './ResultCard'
import { ScrollX } from '@/components/ui/ScrollX'

type Setter = React.Dispatch<React.SetStateAction<Set<string>>>

/** Quantas hipóteses aparecem antes do "mostrar mais". */
const VISIBLE = 8

export function InflammatorySkinPage() {
  const { t } = useTranslation()
  const [patterns, setPatterns] = useState<Set<string>>(() => new Set())
  const [clinical, setClinical] = useState<Set<string>>(() => new Set())
  const [histology, setHistology] = useState<Set<string>>(() => new Set())
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<string | null>(null)
  const [comparing, setComparing] = useState(false)
  const [showAll, setShowAll] = useState(false)

  const toggle = (setter: Setter, id: string) =>
    setter((previous) => {
      const next = new Set(previous)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const results = useMemo(() => suggest(DIAGNOSES, { patterns, clinical, histology, query }), [patterns, clinical, histology, query])
  const primary = results.filter((r) => patterns.size === 0 || r.patternHits.length > 0)
  const secondary = results.filter((r) => patterns.size > 0 && r.patternHits.length === 0)
  const top = primary.slice(0, 3)
  const compareRows = useMemo(() => (comparing && top.length >= 2 ? compare(top, new Set([...clinical, ...histology])) : []), [comparing, top, clinical, histology])
  const hasChoice = patterns.size + clinical.size + histology.size > 0 || query.trim() !== ''
  const totalSelected = patterns.size + clinical.size + histology.size

  const clear = () => {
    setPatterns(new Set())
    setClinical(new Set())
    setHistology(new Set())
    setQuery('')
    setOpen(null)
    setComparing(false)
    setShowAll(false)
  }

  return (
    <div className="shell py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('tools.ackerman.name')}</h1>
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-ink-muted">{t('inflammatorySkin.subtitle')}</p>
        </div>
        <label className="relative block w-full max-w-sm">
          <span className="sr-only">{t('inflammatorySkin.search')}</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('inflammatorySkin.searchPlaceholder')}
            className="h-10 w-full rounded-md border border-line bg-surface pr-9 pl-9 text-sm text-ink placeholder:text-ink-faint hover:border-line-strong"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-ink-faint hover:text-ink" aria-label={t('inflammatorySkin.clearSearch')}>
              <X className="size-4" aria-hidden />
            </button>
          )}
        </label>
      </header>

      <div className="mt-8 space-y-6">
        <StepCard number={1} title={t('inflammatorySkin.step1Title')} hint={t('inflammatorySkin.step1Hint')}>
          <TopicList>
            {PATTERN_GROUPS.map((g) => {
              const items = PATTERNS.filter((p) => p.group === g.id)
              return (
                <TopicGroup key={g.id} label={t(`inflammatorySkin.patternGroup.${g.id}`)} selected={items.filter((p) => patterns.has(p.id)).map((p) => p.label)}>
                  <div className="flex flex-wrap gap-2">
                    {items.map((p) => (
                      <PatternChip key={p.id} pattern={p} active={patterns.has(p.id)} onClick={() => toggle(setPatterns, p.id)} />
                    ))}
                  </div>
                </TopicGroup>
              )
            })}
          </TopicList>
        </StepCard>

        <StepCard number={2} title={t('inflammatorySkin.step2Title')} hint={t('inflammatorySkin.step2Hint')}>
          <TopicList>
            {CLINICAL_GROUPS.map((g) => {
              const items = CLINICAL.filter((c) => c.group === g.id)
              return (
                <TopicGroup key={g.id} label={t(`inflammatorySkin.clinicalGroup.${g.id}`)} selected={items.filter((c) => clinical.has(c.id)).map((c) => c.label)}>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((c) => (
                      <SmallChip key={c.id} active={clinical.has(c.id)} label={c.label} onClick={() => toggle(setClinical, c.id)} />
                    ))}
                  </div>
                </TopicGroup>
              )
            })}
          </TopicList>
        </StepCard>

        <StepCard number={3} title={t('inflammatorySkin.step3Title')} hint={t('inflammatorySkin.step3Hint')}>
          <TopicList>
            {HISTOLOGY_GROUPS.map((g) => {
              const items = HISTOLOGY.filter((h) => h.group === g.id)
              return (
                <TopicGroup key={g.id} label={t(`inflammatorySkin.histologyGroup.${g.id}`)} selected={items.filter((h) => histology.has(h.id)).map((h) => h.label)}>
                  <div className="flex flex-wrap gap-1.5">
                    {items.map((h) => (
                      <SmallChip key={h.id} active={histology.has(h.id)} label={h.label} onClick={() => toggle(setHistology, h.id)} />
                    ))}
                  </div>
                </TopicGroup>
              )
            })}
          </TopicList>
        </StepCard>

        <StepCard number={4} title={t('inflammatorySkin.step4Title')} hint={t('inflammatorySkin.step4Hint')}>
          {!hasChoice ? (
            <p className="text-sm text-ink-faint">{t('inflammatorySkin.empty')}</p>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                {[...patterns].map((id) => (
                  <Tag key={id} onRemove={() => toggle(setPatterns, id)} strong>
                    {labelOf(id)}
                  </Tag>
                ))}
                {[...clinical].map((id) => (
                  <Tag key={id} onRemove={() => toggle(setClinical, id)}>
                    {labelOf(id)}
                  </Tag>
                ))}
                {[...histology].map((id) => (
                  <Tag key={id} onRemove={() => toggle(setHistology, id)}>
                    {labelOf(id)}
                  </Tag>
                ))}
                <button type="button" onClick={clear} className="inline-flex min-h-9 items-center gap-1 text-xs text-accent hover:underline sm:min-h-0">
                  <RotateCcw className="size-3" aria-hidden />
                  {t('inflammatorySkin.clearAll')}
                </button>
              </div>

              {primary.length === 0 && secondary.length === 0 && <p className="text-sm text-ink-muted">{t('inflammatorySkin.noResults')}</p>}

              {primary.length >= 2 && totalSelected > 0 && (
                <div>
                  <button
                    type="button"
                    onClick={() => setComparing((v) => !v)}
                    aria-pressed={comparing}
                    className={cn(
                      'inline-flex items-center gap-2 rounded-md border px-3 py-1.5 text-sm transition-colors',
                      comparing ? 'border-accent bg-accent-soft text-accent-ink' : 'border-line text-ink-muted hover:border-line-strong hover:text-ink',
                    )}
                  >
                    <Columns3 className="size-4" aria-hidden />
                    {comparing ? t('inflammatorySkin.compareHide') : t('inflammatorySkin.compare', { n: top.length })}
                  </button>
                  {comparing && compareRows.length > 0 && (
                    <div className="mt-3 rounded-lg border border-line bg-surface">
                      <ScrollX innerClassName="rounded-t-lg">
                      <table className="w-full min-w-[32rem] text-left text-xs">
                        <thead>
                          <tr className="border-b border-line">
                            <th className="px-3 py-2 font-medium text-ink-muted">{t('inflammatorySkin.compareHint')}</th>
                            {top.map((s) => (
                              <th key={s.diagnosis.id} className="px-3 py-2 font-semibold text-ink">
                                {s.diagnosis.name}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {compareRows.map((row) => (
                            <tr key={row.id} className={cn('border-b border-line/60', row.selected && 'bg-accent-soft/40')}>
                              <td className="px-3 py-1.5 text-ink">
                                {labelOf(row.id)}
                                {row.selected && <span className="ml-1.5 text-[0.65rem] text-accent-ink">{t('inflammatorySkin.compareSelected')}</span>}
                              </td>
                              {row.cells.map((cell, i) => (
                                <td key={i} className="px-3 py-1.5">
                                  <Cell cell={cell} />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                      </ScrollX>
                      <p className="flex flex-wrap gap-3 border-t border-line px-3 py-2 text-[0.7rem] text-ink-faint">
                        <span>
                          <Cell cell="hallmark" /> {t('inflammatorySkin.legendHallmark')}
                        </span>
                        <span>
                          <Cell cell="yes" /> {t('inflammatorySkin.legendYes')}
                        </span>
                        <span>
                          <Cell cell="against" /> {t('inflammatorySkin.legendAgainst')}
                        </span>
                      </p>
                    </div>
                  )}
                </div>
              )}

              {primary.length > 0 && (
                <ul className="space-y-3">
                  {(showAll ? primary : primary.slice(0, VISIBLE)).map((s) => (
                    <ResultCard key={s.diagnosis.id} s={s} open={open === s.diagnosis.id} onToggle={() => setOpen(open === s.diagnosis.id ? null : s.diagnosis.id)} />
                  ))}
                </ul>
              )}
              {primary.length > VISIBLE && (
                <button type="button" onClick={() => setShowAll((v) => !v)} className="text-sm text-accent hover:underline">
                  {showAll ? t('inflammatorySkin.showLess') : t('inflammatorySkin.showMore', { n: primary.length - VISIBLE })}
                </button>
              )}

              {secondary.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink">
                    <Info className="size-4 text-accent" aria-hidden />
                    {t('inflammatorySkin.alsoConsider')}
                  </p>
                  <p className="mb-3 text-xs text-ink-muted">{t('inflammatorySkin.alsoConsiderHint')}</p>
                  <ul className="space-y-3">
                    {secondary.map((s) => (
                      <ResultCard key={s.diagnosis.id} s={s} open={open === s.diagnosis.id} onToggle={() => setOpen(open === s.diagnosis.id ? null : s.diagnosis.id)} muted />
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </StepCard>
      </div>

      <p className="mt-12 flex items-start gap-2 border-t border-line pt-6 text-xs leading-relaxed text-ink-faint">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        {t('inflammatorySkin.disclaimer')}
      </p>
    </div>
  )
}

function PatternChip({ pattern, active, onClick }: { pattern: Pattern; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'max-w-xs rounded-lg border-2 px-3 py-2 text-left text-sm leading-snug transition-colors',
        active ? 'border-accent bg-accent-soft text-accent-ink' : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink',
      )}
    >
      <span className="block font-medium">{pattern.label}</span>
      <span className={cn('mt-0.5 block text-xs', active ? 'text-accent-ink/80' : 'text-ink-faint')}>{pattern.hint}</span>
    </button>
  )
}

function SmallChip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        'rounded-full border px-2.5 py-1 text-xs transition-colors',
        active ? 'border-accent bg-accent text-white' : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink',
      )}
    >
      {label}
    </button>
  )
}

function Tag({ children, onRemove, strong = false }: { children: React.ReactNode; onRemove: () => void; strong?: boolean }) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full border px-2.5 py-1', strong ? 'border-accent/50 bg-accent-soft text-accent-ink' : 'border-line bg-surface text-ink')}>
      {children}
      <button type="button" onClick={onRemove} className="rounded-full p-0.5 text-ink-faint hover:text-ink" aria-label="remover">
        <X className="size-3" aria-hidden />
      </button>
    </span>
  )
}

function Cell({ cell }: { cell: CompareCell }) {
  return (
    <span
      className={cn(
        'inline-block size-3.5 rounded-full align-middle',
        cell === 'hallmark' && 'bg-success ring-2 ring-success/30',
        cell === 'yes' && 'bg-success/40',
        cell === 'against' && 'bg-danger',
        cell === 'no' && 'border border-line-strong',
      )}
      aria-label={cell}
    />
  )
}
