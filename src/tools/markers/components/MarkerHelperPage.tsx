/* ==========================================================================
   MarkerHelperPage.tsx — quatro passos: onde está o tumor e em quem (boneco,
   sítio, idade, sexo), como ele é (tipo celular, arquitetura, achados), o
   que a imuno mostrou (marcadores com positivo/negativo e padrão) e os
   diagnósticos ordenados, cada um dizendo o que bate, o que não bate e o
   que bate por exceção. Ao lado dos resultados, "o que pedir a seguir"
   sugere os marcadores que mais separam os candidatos do topo. Uma busca
   por nome atalha tudo quando o patologista já sabe o que procura.
   ========================================================================== */

import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Info, Search, X } from 'lucide-react'
import { BigChip, StepCard } from '@/components/ui/didactic'
import { cn } from '@/lib/cn'
import { compareTumors, emptyChoice, nextMarkers, suggest, type Choice, type MarkerInput, type Result } from '../match'
import { TUMORS, findTumor } from '../content'
import { AGE_BANDS, ARCHITECTURES, CELLS, FEATURES, REGIONS, findMarker, findMorph, findSite, sitesOf, type AgeBand, type Morph, type RegionId, type Sex } from '../types'
import { BodyMap } from './BodyMap'
import { MarkerPicker } from './MarkerPicker'
import { CompareTable, NextMarkersPanel, TumorCard } from './ResultCards'

const PRIORITY_FEATURES = ['mitoses-raras', 'mitoses-moderadas', 'mitoses-altas', 'necrose']

export function MarkerHelperPage() {
  const { t } = useTranslation()
  const [region, setRegion] = useState<RegionId | null>(null)
  const [choice, setChoice] = useState<Choice>(emptyChoice)
  const [open, setOpen] = useState<string | null>(null)
  const [compared, setCompared] = useState<string[]>([])

  const update = (patch: Partial<Choice>) => setChoice((c) => ({ ...c, ...patch }))
  const toggleSet = (key: 'cells' | 'architecture' | 'features', id: string) =>
    setChoice((c) => {
      const next = new Set(c[key])
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return { ...c, [key]: next }
    })
  const setMarker = (id: string, input: MarkerInput | null) =>
    setChoice((c) => {
      const next = new Map(c.markers)
      if (input) next.set(id, input)
      else next.delete(id)
      return { ...c, markers: next }
    })
  const quickSet = (id: string, result: Result) => setMarker(id, { result })

  const pickRegion = (r: RegionId) => {
    setRegion(r)
    const list = sitesOf(r)
    update({ site: list.length === 1 ? list[0].id : choice.site && list.some((s) => s.id === choice.site) ? choice.site : null })
  }

  const { primary, secondary } = useMemo(() => suggest(TUMORS, choice), [choice])
  const next = useMemo(() => (choice.query.trim() ? [] : nextMarkers(primary, new Set(choice.markers.keys()))), [primary, choice.markers, choice.query])
  const hasChoice = choice.site !== null || choice.cells.size + choice.architecture.size + choice.features.size + choice.markers.size > 0 || choice.query.trim() !== ''
  const all = [...primary, ...secondary]
  const best = all.length ? Math.max(...all.map((s) => s.score)) : 0
  const comparedTumors = compared.map(findTumor).filter((x): x is NonNullable<typeof x> => Boolean(x))
  const compareRows = useMemo(() => (comparedTumors.length >= 2 ? compareTumors(comparedTumors) : []), [comparedTumors])

  const toggleCompare = (id: string) => setCompared((c) => (c.includes(id) ? c.filter((x) => x !== id) : [...c.slice(-2), id]))
  const clearAll = () => {
    setRegion(null)
    setChoice(emptyChoice())
    setCompared([])
  }

  const featureList: Morph[] = [...PRIORITY_FEATURES.map((id) => findMorph(id)!), ...FEATURES.filter((f) => !PRIORITY_FEATURES.includes(f.id))]

  return (
    <div className="shell py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('tools.markerHelper.name')}</h1>
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-ink-muted">{t('markers.subtitle')}</p>
        </div>
        <label className="relative block w-full max-w-sm">
          <span className="sr-only">{t('markers.search')}</span>
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint" aria-hidden />
          <input
            value={choice.query}
            onChange={(e) => update({ query: e.target.value })}
            placeholder={t('markers.searchPlaceholder')}
            className="h-10 w-full rounded-md border border-line bg-surface pr-9 pl-9 text-sm text-ink placeholder:text-ink-faint hover:border-line-strong"
          />
          {choice.query && (
            <button type="button" onClick={() => update({ query: '' })} className="absolute top-1/2 right-2 -translate-y-1/2 rounded p-1 text-ink-faint hover:text-ink" aria-label={t('markers.clearSearch')}>
              <X className="size-4" aria-hidden />
            </button>
          )}
        </label>
      </header>

      <div className="mt-8 space-y-6">
        <StepCard number={1} title={t('markers.step1Title')} hint={t('markers.step1Hint')}>
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
                  <p className="mb-2 text-xs font-medium text-ink-muted">{t('markers.siteLabel')}</p>
                  <div className="flex flex-wrap gap-2">
                    {sitesOf(region).map((s) => (
                      <BigChip key={s.id} active={choice.site === s.id} onClick={() => update({ site: choice.site === s.id ? null : s.id })} className="px-3 py-2 text-sm">
                        {s.label}
                      </BigChip>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-ink-faint">{t('markers.pickRegion')}</p>
              )}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 border-t border-line pt-4">
                <span className="text-xs font-medium text-ink-muted">{t('markers.age')}</span>
                {AGE_BANDS.map((a) => (
                  <SmallChip key={a.id} active={choice.age === a.id} onClick={() => update({ age: choice.age === a.id ? null : (a.id as AgeBand) })}>
                    {a.label}
                  </SmallChip>
                ))}
                <span className="ml-2 text-xs font-medium text-ink-muted">{t('markers.sex')}</span>
                {(['f', 'm'] as Sex[]).map((s) => (
                  <SmallChip key={s} active={choice.sex === s} onClick={() => update({ sex: choice.sex === s ? null : s })}>
                    {t(`markers.sexLabel.${s}`)}
                  </SmallChip>
                ))}
              </div>
            </div>
          </div>
        </StepCard>

        <StepCard number={2} title={t('markers.step2Title')} hint={t('markers.step2Hint')}>
          <div className="space-y-5">
            <MorphGroup label={t('markers.cells')} items={CELLS} chosen={choice.cells} onToggle={(id) => toggleSet('cells', id)} big />
            <MorphGroup label={t('markers.architecture')} items={ARCHITECTURES} chosen={choice.architecture} onToggle={(id) => toggleSet('architecture', id)} />
            <MorphGroup label={t('markers.features')} hint={t('markers.featuresHint')} items={featureList} chosen={choice.features} onToggle={(id) => toggleSet('features', id)} />
          </div>
        </StepCard>

        <StepCard number={3} title={t('markers.step3Title')} hint={t('markers.step3Hint')}>
          <MarkerPicker markers={choice.markers} onSet={setMarker} />
        </StepCard>

        <StepCard number={4} title={t('markers.step4Title')} hint={t('markers.step4Hint')}>
          {!hasChoice ? (
            <p className="text-sm text-ink-faint">{t('markers.empty')}</p>
          ) : (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
                {choice.site && <Tag onRemove={() => update({ site: null })}>{findSite(choice.site)?.label}</Tag>}
                {choice.age && <Tag onRemove={() => update({ age: null })}>{AGE_BANDS.find((a) => a.id === choice.age)?.label}</Tag>}
                {choice.sex && <Tag onRemove={() => update({ sex: null })}>{t(`markers.sexLabel.${choice.sex}`)}</Tag>}
                {[...choice.cells, ...choice.architecture, ...choice.features].map((id) => {
                  const key = choice.cells.has(id) ? 'cells' : choice.architecture.has(id) ? 'architecture' : 'features'
                  return (
                    <Tag key={id} onRemove={() => toggleSet(key, id)}>
                      {findMorph(id)?.label}
                    </Tag>
                  )
                })}
                {[...choice.markers.entries()].map(([id, input]) => (
                  <Tag key={id} onRemove={() => setMarker(id, null)}>
                    {findMarker(id)?.label} {input.result === 'pos' ? '+' : '−'}
                  </Tag>
                ))}
                <button type="button" onClick={clearAll} className="text-xs text-accent hover:underline">
                  {t('markers.clearAll')}
                </button>
              </div>

              {comparedTumors.length >= 2 && (
                <div>
                  <p className="mb-2 text-sm font-medium text-ink">{t('markers.compareTitle')}</p>
                  <CompareTable tumors={comparedTumors} rows={compareRows} />
                </div>
              )}

              <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <div className="space-y-6">
                  {primary.length === 0 && secondary.length === 0 && <p className="text-sm text-ink-muted">{t('markers.noResults')}</p>}
                  {primary.length > 0 && (
                    <ul className="space-y-3">
                      {primary.slice(0, 30).map((s, i) => (
                        <TumorCard key={s.tumor.id} s={s} rank={i + 1} open={open === s.tumor.id} onToggle={() => setOpen(open === s.tumor.id ? null : s.tumor.id)} compared={compared.includes(s.tumor.id)} onCompare={() => toggleCompare(s.tumor.id)} best={best} />
                      ))}
                    </ul>
                  )}
                  {secondary.length > 0 && (
                    <div>
                      <p className="mb-2 flex items-center gap-1.5 text-sm font-medium text-ink">
                        <Info className="size-4 text-accent" aria-hidden />
                        {t('markers.alsoConsider')}
                      </p>
                      <p className="mb-3 text-xs text-ink-muted">{t('markers.alsoConsiderHint')}</p>
                      <ul className="space-y-3">
                        {secondary.map((s, i) => (
                          <TumorCard key={s.tumor.id} s={s} rank={i + 1} open={open === s.tumor.id} onToggle={() => setOpen(open === s.tumor.id ? null : s.tumor.id)} compared={compared.includes(s.tumor.id)} onCompare={() => toggleCompare(s.tumor.id)} best={best} muted />
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                <aside className="lg:sticky lg:top-6 lg:self-start">
                  <NextMarkersPanel items={next} onSet={quickSet} />
                </aside>
              </div>
            </div>
          )}
        </StepCard>
      </div>

      <p className="mt-12 flex items-start gap-2 border-t border-line pt-6 text-xs leading-relaxed text-ink-faint">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        {t('markers.disclaimer')}
      </p>
    </div>
  )
}

function MorphGroup({ label, hint, items, chosen, onToggle, big = false }: { label: string; hint?: string; items: Morph[]; chosen: Set<string>; onToggle: (id: string) => void; big?: boolean }) {
  return (
    <div>
      <p className="mb-1 text-xs font-medium tracking-wide text-ink-muted uppercase">{label}</p>
      {hint && <p className="mb-2 text-xs text-ink-muted">{hint}</p>}
      <div className="flex flex-wrap gap-1.5">
        {items.map((m) => (
          <button
            key={m.id}
            type="button"
            onClick={() => onToggle(m.id)}
            aria-pressed={chosen.has(m.id)}
            className={cn(
              'rounded-full border transition-colors',
              big ? 'px-3 py-1.5 text-sm' : 'px-2.5 py-1 text-xs',
              chosen.has(m.id) ? 'border-accent bg-accent text-white' : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink',
            )}
          >
            {m.label}
          </button>
        ))}
      </div>
    </div>
  )
}

function SmallChip({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" onClick={onClick} aria-pressed={active} className={cn('rounded-full border px-2.5 py-1 text-xs transition-colors', active ? 'border-accent bg-accent text-white' : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink')}>
      {children}
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
