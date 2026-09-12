/* ==========================================================================
   CystNamerPage.tsx — três passos, como o resto do site: onde está o cisto
   (boneco ou lista), o que o reveste (chips de revestimento e de achados) e
   as sugestões ordenadas, cada uma dizendo por que apareceu. Uma busca por
   nome atalha tudo isso quando o patologista já sabe o que procura.
   ========================================================================== */

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronUp, ExternalLink, Info, Search, X } from 'lucide-react'
import { BigChip, StepCard } from '@/components/ui/didactic'
import { cn } from '@/lib/cn'
import { suggest, type Suggestion } from '../match'
import { CYSTS } from '../content'
import {
  FEATURES,
  LININGS,
  REGIONS,
  findFeature,
  findLining,
  findSite,
  sitesOf,
  type Feature,
  type FeatureGroup,
  type Lining,
  type LiningGroup,
  type RegionId,
} from '../types'
import { BodyMap } from './BodyMap'

const LINING_GROUPS: LiningGroup[] = ['squamous', 'glandular', 'ciliated', 'special', 'none']
const FEATURE_GROUPS: FeatureGroup[] = ['lining', 'wall', 'contents']

export function CystNamerPage() {
  const { t } = useTranslation()
  const [region, setRegion] = useState<RegionId | null>(null)
  const [site, setSite] = useState<string | null>(null)
  const [linings, setLinings] = useState<Set<string>>(() => new Set())
  const [features, setFeatures] = useState<Set<string>>(() => new Set())
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<string | null>(null)

  const toggleIn = (set: (fn: (s: Set<string>) => Set<string>) => void, id: string) =>
    set((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })

  const pickRegion = (r: RegionId) => {
    setRegion(r)
    const list = sitesOf(r)
    // Região com um local só: já escolhe.
    setSite(list.length === 1 ? list[0].id : site && list.some((s) => s.id === site) ? site : null)
  }

  const results = useMemo(() => suggest(CYSTS, { site, linings, features, query }), [site, linings, features, query])
  const primary = results.filter((r) => r.siteMatch || site === null)
  const secondary = results.filter((r) => site !== null && !r.siteMatch)
  const hasChoice = site !== null || linings.size > 0 || features.size > 0 || query.trim() !== ''
  const clearAll = () => {
    setRegion(null)
    setSite(null)
    setLinings(new Set())
    setFeatures(new Set())
    setQuery('')
  }

  return (
    <div className="shell py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('tools.nameThatCyst.name')}</h1>
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-ink-muted">{t('cysts.subtitle')}</p>
        </div>
        <label className="relative block w-full max-w-sm">
          <span className="sr-only">{t('cysts.search')}</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint" aria-hidden />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t('cysts.searchPlaceholder')}
            className="h-10 w-full rounded-md border border-line bg-surface pr-9 pl-9 text-sm text-ink placeholder:text-ink-faint hover:border-line-strong"
          />
          {query && (
            <button type="button" onClick={() => setQuery('')} className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-ink-faint hover:text-ink" aria-label={t('cysts.clearSearch')}>
              <X className="size-4" aria-hidden />
            </button>
          )}
        </label>
      </header>

      <div className="mt-8 space-y-6">
        <StepCard number={1} title={t('cysts.step1Title')} hint={t('cysts.step1Hint')}>
          <div className="grid gap-6 md:grid-cols-[14rem_minmax(0,1fr)]">
            <BodyMap selected={region} onSelect={pickRegion} />
            <div className="space-y-4">
              <div className="flex flex-wrap gap-1.5">
                {REGIONS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => pickRegion(r.id)}
                    aria-pressed={region === r.id}
                    className={cn(
                      'rounded-full border px-3 py-1 text-xs font-medium transition-colors',
                      region === r.id ? 'border-accent bg-accent text-white' : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink',
                    )}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
              {region ? (
                <div>
                  <p className="mb-2 text-xs font-medium text-ink-muted">{t('cysts.siteLabel')}</p>
                  <div className="flex flex-wrap gap-2">
                    {sitesOf(region).map((s) => (
                      <BigChip key={s.id} active={site === s.id} onClick={() => setSite(site === s.id ? null : s.id)} className="px-3 py-2 text-sm">
                        {s.label}
                      </BigChip>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-ink-faint">{t('cysts.pickRegion')}</p>
              )}
            </div>
          </div>
        </StepCard>

        <StepCard number={2} title={t('cysts.step2Title')} hint={t('cysts.step2Hint')}>
          <div className="space-y-5">
            {LINING_GROUPS.map((g) => (
              <div key={g}>
                <p className="mb-2 text-xs font-medium tracking-wide text-ink-muted uppercase">{t(`cysts.liningGroup.${g}`)}</p>
                <div className="flex flex-wrap gap-2">
                  {LININGS.filter((l) => l.group === g).map((l) => (
                    <LiningChip key={l.id} lining={l} active={linings.has(l.id)} onClick={() => toggleIn(setLinings, l.id)} />
                  ))}
                </div>
              </div>
            ))}
            <div className="border-t border-line pt-4">
              <p className="mb-1 text-sm font-medium text-ink">{t('cysts.featuresTitle')}</p>
              <p className="mb-3 text-xs text-ink-muted">{t('cysts.featuresHint')}</p>
              <div className="space-y-3">
                {FEATURE_GROUPS.map((g) => (
                  <div key={g} className="flex flex-wrap items-center gap-1.5">
                    <span className="mr-1 text-xs text-ink-faint">{t(`cysts.featureGroup.${g}`)}</span>
                    {FEATURES.filter((f) => f.group === g).map((f) => (
                      <FeatureChip key={f.id} feature={f} active={features.has(f.id)} onClick={() => toggleIn(setFeatures, f.id)} />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </StepCard>

        <StepCard number={3} title={t('cysts.step3Title')} hint={t('cysts.step3Hint')}>
          {!hasChoice ? (
            <p className="text-sm text-ink-faint">{t('cysts.empty')}</p>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                {site && <Tag onRemove={() => setSite(null)}>{findSite(site)?.label}</Tag>}
                {[...linings].map((id) => (
                  <Tag key={id} onRemove={() => toggleIn(setLinings, id)}>
                    {findLining(id)?.label}
                  </Tag>
                ))}
                {[...features].map((id) => (
                  <Tag key={id} onRemove={() => toggleIn(setFeatures, id)}>
                    {findFeature(id)?.label}
                  </Tag>
                ))}
                <button type="button" onClick={clearAll} className="text-xs text-accent hover:underline">
                  {t('cysts.clearAll')}
                </button>
              </div>

              {primary.length === 0 && secondary.length === 0 && <p className="text-sm text-ink-muted">{t('cysts.noResults')}</p>}

              {primary.length > 0 && (
                <ul className="space-y-3">
                  {primary.map((s) => (
                    <SuggestionCard key={s.cyst.id} s={s} open={open === s.cyst.id} onToggle={() => setOpen(open === s.cyst.id ? null : s.cyst.id)} />
                  ))}
                </ul>
              )}

              {secondary.length > 0 && (
                <div>
                  <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink">
                    <Info className="size-4 text-accent" aria-hidden />
                    {t('cysts.alsoConsider')}
                  </p>
                  <p className="mb-3 text-xs text-ink-muted">{t('cysts.alsoConsiderHint')}</p>
                  <ul className="space-y-3">
                    {secondary.map((s) => (
                      <SuggestionCard key={s.cyst.id} s={s} open={open === s.cyst.id} onToggle={() => setOpen(open === s.cyst.id ? null : s.cyst.id)} muted />
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
        {t('cysts.disclaimer')}
      </p>
    </div>
  )
}

function LiningChip({ lining, active, onClick }: { lining: Lining; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      title={lining.hint}
      className={cn(
        'max-w-xs rounded-lg border-2 px-3 py-2 text-left text-sm leading-snug transition-colors',
        active ? 'border-accent bg-accent-soft text-accent-ink' : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink',
      )}
    >
      <span className="block font-medium">{lining.label}</span>
      {lining.hint && <span className={cn('mt-0.5 block text-xs', active ? 'text-accent-ink/80' : 'text-ink-faint')}>{lining.hint}</span>}
    </button>
  )
}

function FeatureChip({ feature, active, onClick }: { feature: Feature; active: boolean; onClick: () => void }) {
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
      {feature.label}
    </button>
  )
}

function Tag({ children, onRemove }: { children: React.ReactNode; onRemove: () => void }) {
  return (
    <span className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1 text-ink">
      {children}
      <button type="button" onClick={onRemove} className="rounded-full p-0.5 text-ink-faint hover:text-ink" aria-label="remover">
        <X className="size-3" aria-hidden />
      </button>
    </span>
  )
}

function SuggestionCard({ s, open, onToggle, muted = false }: { s: Suggestion; open: boolean; onToggle: () => void; muted?: boolean }) {
  const { t } = useTranslation()
  const c = s.cyst
  return (
    <li className={cn('rounded-lg border bg-surface', open ? 'border-accent/50 shadow-card' : 'border-line', muted && 'opacity-90')}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-start gap-3 px-4 py-3 text-left">
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-ink">
            {c.name}
            {c.pseudocyst && <span className="ml-2 rounded-full border border-line px-2 py-0.5 text-[0.65rem] font-medium text-ink-muted uppercase">{t('cysts.pseudocyst')}</span>}
          </p>
          {c.aka && c.aka.length > 0 && <p className="text-xs text-ink-faint">{c.aka.join(' · ')}</p>}
          <p className="mt-1 text-sm text-ink-muted">{c.lining}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            <Match ok={s.siteMatch} label={t('cysts.matchSite')} />
            <Match ok={s.liningMatch} label={t('cysts.matchLining')} />
            {s.featureHits.length > 0 && <Match ok label={t('cysts.matchFeatures', { n: s.featureHits.length })} />}
            {s.featureMisses > 0 && <Match ok={false} label={t('cysts.missFeatures', { n: s.featureMisses })} />}
          </div>
        </div>
        {open ? <ChevronUp className="mt-1 size-4 shrink-0 text-ink-faint" aria-hidden /> : <ChevronDown className="mt-1 size-4 shrink-0 text-ink-faint" aria-hidden />}
      </button>
      {open && (
        <div className="space-y-3 border-t border-line px-4 py-4 text-sm leading-relaxed text-ink">
          {c.where && <Row label={t('cysts.rowWhere')}>{c.where}</Row>}
          <Row label={t('cysts.rowLining')}>{c.lining}</Row>
          {c.wall && <Row label={t('cysts.rowWall')}>{c.wall}</Row>}
          {c.contents && <Row label={t('cysts.rowContents')}>{c.contents}</Row>}
          {c.clues && c.clues.length > 0 && (
            <Row label={t('cysts.rowClues')}>
              <ul className="list-disc space-y-1 pl-5">
                {c.clues.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </Row>
          )}
          {c.mimics && c.mimics.length > 0 && (
            <Row label={t('cysts.rowMimics')}>
              <ul className="list-disc space-y-1 pl-5">
                {c.mimics.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </Row>
          )}
          {c.sources && c.sources.length > 0 && (
            <Row label={t('cysts.rowSources')}>
              <ul className="space-y-0.5">
                {c.sources.map((u) => (
                  <li key={u}>
                    <a href={u} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-xs text-accent hover:underline">
                      {u.replace(/^https?:\/\//, '').slice(0, 80)}
                      <ExternalLink className="size-3" aria-hidden />
                    </a>
                  </li>
                ))}
              </ul>
            </Row>
          )}
        </div>
      )}
    </li>
  )
}

function Match({ ok, label }: { ok: boolean; label: string }) {
  return (
    <span className={cn('rounded-full px-2 py-0.5 text-[0.7rem] font-medium', ok ? 'bg-success/15 text-success' : 'bg-elevated text-ink-faint line-through')}>
      {label}
    </span>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[9rem_minmax(0,1fr)]">
      <p className="text-xs font-medium tracking-wide text-ink-muted uppercase">{label}</p>
      <div>{children}</div>
    </div>
  )
}
