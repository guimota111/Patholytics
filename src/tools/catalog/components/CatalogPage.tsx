import { useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, ArrowUpRight, Camera, Info, Search, X, ZoomIn } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { Lightbox } from '@/components/ui/Lightbox'
import { Button, ButtonLink } from '@/components/ui/Button'
import { ReportButton } from '@/components/feedback/ReportButton'
import { TopicGroup, TopicList } from '@/components/ui/didactic'
import { RichText } from '@/tools/macroscopy/richtext'
import { cn } from '@/lib/cn'
import { FACET_KINDS, facetLabel, filterEntries, findEntry, type Catalog, type CatalogEntry } from '../types'
import { SubmitModal } from './SubmitModal'

/** Capa (busca + filtros) ou verbete, conforme a URL. Uma página para os dois catálogos. */
export function CatalogPage({ catalog }: { catalog: Catalog }) {
  const { entryId } = useParams<{ entryId?: string }>()
  if (!entryId) return <CatalogIndex catalog={catalog} />
  const entry = findEntry(catalog, entryId)
  return entry ? <CatalogEntryView catalog={catalog} entry={entry} /> : <MissingEntry catalog={catalog} />
}

/* ------------------------------------------------------------------ capa */

function CatalogIndex({ catalog }: { catalog: Catalog }) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Set<string>>(() => new Set())
  const [submitting, setSubmitting] = useState(false)

  const results = useMemo(() => filterEntries(catalog, query, selected), [catalog, query, selected])
  const toggle = (id: string) =>
    setSelected((s) => {
      const next = new Set(s)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  const clear = () => {
    setQuery('')
    setSelected(new Set())
  }
  const filtering = query.trim() !== '' || selected.size > 0
  const Icon = catalog.icon

  return (
    <div className="shell py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-start gap-4">
          <span
            className="flex size-12 shrink-0 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${catalog.color}1f`, color: catalog.color }}
          >
            <Icon className="size-6" aria-hidden />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">{t(`catalog.${catalog.id}.title`)}</h1>
            <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-muted">{t(`catalog.${catalog.id}.subtitle`)}</p>
          </div>
        </div>
        <Button type="button" onClick={() => setSubmitting(true)}>
          <Camera className="size-4" aria-hidden />
          {t('catalog.submitButton')}
        </Button>
      </header>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
        <aside className="space-y-5 rounded-lg border border-line bg-elevated p-5 shadow-card lg:sticky lg:top-20">
          <label className="block">
            <span className="sr-only">{t('catalog.search')}</span>
            <span className="relative block">
              <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint" aria-hidden />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t(`catalog.${catalog.id}.searchPlaceholder`)}
                autoFocus
                className="h-10 w-full rounded-md border border-line bg-surface pr-3 pl-9 text-sm text-ink placeholder:text-ink-faint hover:border-line-strong"
              />
            </span>
          </label>

          <TopicList>
            {FACET_KINDS.map((kind) => {
              const facets = catalog[kind]
              if (facets.length === 0) return null
              return (
                <TopicGroup key={kind} label={t(`catalog.facets.${kind}`)} selected={facets.filter((f) => selected.has(f.id)).map((f) => f.label)}>
                  <div className="flex flex-wrap gap-1.5">
                    {facets.map((facet) => {
                      const active = selected.has(facet.id)
                      return (
                        <button
                          key={facet.id}
                          type="button"
                          aria-pressed={active}
                          onClick={() => toggle(facet.id)}
                          className={cn(
                            'rounded-full border px-2.5 py-1 text-xs transition-colors',
                            active
                              ? 'border-accent bg-accent-soft text-accent-ink'
                              : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink',
                          )}
                        >
                          {facet.label}
                        </button>
                      )
                    })}
                  </div>
                </TopicGroup>
              )
            })}
          </TopicList>

          {filtering && (
            <button type="button" onClick={clear} className="inline-flex items-center gap-1.5 text-xs text-ink-muted transition-colors hover:text-ink">
              <X className="size-3.5" aria-hidden />
              {t('catalog.clearFilters')}
            </button>
          )}
        </aside>

        <section>
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-sm font-semibold tracking-tight text-ink">{t('catalog.results')}</h2>
            <Badge>
              <span className="tabular">{results.length}</span>
              {t('catalog.entriesWord', { count: results.length })}
            </Badge>
          </div>

          {catalog.entries.length === 0 ? (
            <Empty title={t('catalog.emptyTitle')} body={t(`catalog.${catalog.id}.emptyBody`)} />
          ) : results.length === 0 ? (
            <Empty title={t('catalog.noMatchTitle')} body={t('catalog.noMatchBody')} />
          ) : (
            <ul className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {results.map((entry) => (
                <li key={entry.id}>
                  <EntryCard catalog={catalog} entry={entry} />
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      <Footer />
      {submitting && <SubmitModal catalog={catalog} onClose={() => setSubmitting(false)} />}
    </div>
  )
}

function EntryCard({ catalog, entry }: { catalog: Catalog; entry: CatalogEntry }) {
  const { t } = useTranslation()
  const cover = entry.photos[0]
  const chips = [...entry.traits, ...entry.sites].slice(0, 4)

  return (
    <Link
      to={`${catalog.path}/${entry.id}`}
      className="group flex h-full flex-col overflow-hidden rounded-lg border border-line bg-elevated shadow-card transition-colors hover:border-accent/40 hover:bg-raised"
    >
      <div className="aspect-[4/3] bg-surface">
        {cover ? (
          <img src={cover.thumb ?? cover.src} alt={entry.name} className="size-full object-cover" loading="lazy" />
        ) : (
          <div className="flex size-full items-center justify-center text-xs text-ink-faint">{t('catalog.noPhoto')}</div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-semibold tracking-tight text-ink">{entry.name}</h3>
          <ArrowUpRight className="size-4 shrink-0 text-ink-faint transition-colors group-hover:text-accent" aria-hidden />
        </div>
        <p className="mt-1 text-sm leading-relaxed text-ink-muted">{entry.summary}</p>
        {chips.length > 0 && (
          <ul className="mt-auto flex flex-wrap gap-1 pt-3">
            {chips.map((id) => (
              <li key={id} className="rounded-full border border-line bg-surface px-2 py-0.5 text-[0.6875rem] text-ink-faint">
                {facetLabel(catalog, id)}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Link>
  )
}

/* --------------------------------------------------------------- verbete */

function CatalogEntryView({ catalog, entry }: { catalog: Catalog; entry: CatalogEntry }) {
  const { t } = useTranslation()
  const [submitting, setSubmitting] = useState(false)
  /** Índice da foto aberta em tela cheia; null quando nenhuma está. */
  const [zoomed, setZoomed] = useState<number | null>(null)
  const Icon = catalog.icon
  const sections = FACET_KINDS.map((kind) => ({ kind, ids: entry[kind] })).filter((s) => s.ids.length > 0)

  return (
    <div className="shell py-10">
      <Link to={catalog.path} className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink">
        <ArrowLeft className="size-4" aria-hidden />
        {t(`catalog.${catalog.id}.back`)}
      </Link>

      <header className="mt-4 flex flex-wrap items-start justify-between gap-4 rounded-xl border border-line bg-elevated p-6 shadow-card">
        <div className="flex items-start gap-4">
          <span
            className="flex size-16 shrink-0 items-center justify-center rounded-xl"
            style={{ backgroundColor: `${catalog.color}1f`, color: catalog.color }}
          >
            <Icon className="size-8" aria-hidden />
          </span>
          <div>
            <h1 className="text-2xl font-semibold tracking-tight text-ink">{entry.name}</h1>
            {entry.aka && entry.aka.length > 0 && <p className="mt-0.5 text-sm text-ink-faint">{entry.aka.join(' · ')}</p>}
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-ink-muted">{entry.summary}</p>
          </div>
        </div>
        <Button type="button" variant="secondary" onClick={() => setSubmitting(true)}>
          <Camera className="size-4" aria-hidden />
          {t('catalog.submitForEntry')}
        </Button>
      </header>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
        <div className="space-y-6">
          {entry.description && (
            <section className="rounded-lg border border-line bg-elevated p-6 shadow-card">
              <RichText source={entry.description} />
            </section>
          )}

          <section className="rounded-lg border border-line bg-elevated shadow-card">
            <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
              <h2 className="text-sm font-semibold tracking-tight text-ink">{t('catalog.photos')}</h2>
              <Badge>
                <span className="tabular">{entry.photos.length}</span>
              </Badge>
            </div>
            {entry.photos.length === 0 ? (
              <p className="px-5 py-10 text-center text-sm text-ink-faint">{t('catalog.noPhotosYet')}</p>
            ) : (
              <ul className="grid gap-4 p-5 sm:grid-cols-2">
                {entry.photos.map((photo, i) => (
                  <li key={i} className="overflow-hidden rounded-md border border-line bg-surface">
                    <button
                      type="button"
                      onClick={() => setZoomed(i)}
                      className="group relative block w-full cursor-zoom-in"
                      aria-label={t('lightbox.open')}
                      title={t('lightbox.open')}
                    >
                      <img src={photo.src} alt={photo.caption ?? entry.name} className="aspect-[4/3] w-full object-cover" loading="lazy" />
                      <span className="absolute right-2 bottom-2 flex size-7 items-center justify-center rounded-md bg-black/55 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                        <ZoomIn className="size-4" aria-hidden />
                      </span>
                    </button>
                    <div className="px-3 py-2 text-xs">
                      {(photo.caption || photo.stain) && (
                        <p className="text-ink">{[photo.caption, photo.stain].filter(Boolean).join(' · ')}</p>
                      )}
                      {photo.credit && <p className="mt-0.5 text-ink-faint">{t('catalog.credit', { name: photo.credit })}</p>}
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <aside className="space-y-5 rounded-lg border border-line bg-elevated p-5 shadow-card">
          {sections.length === 0 && <p className="text-sm text-ink-faint">{t('catalog.noFacets')}</p>}
          {sections.map(({ kind, ids }) => (
            <div key={kind}>
              <p className="mb-2 text-[0.6875rem] font-semibold tracking-wider text-ink-faint uppercase">{t(`catalog.facets.${kind}`)}</p>
              <ul className="flex flex-wrap gap-1.5">
                {ids.map((id) => (
                  <li key={id} className="rounded-full border border-accent/35 bg-accent-soft px-2.5 py-1 text-xs text-accent-ink">
                    {facetLabel(catalog, id)}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </aside>
      </div>

      <div className="mt-6 flex justify-end">
        <ReportButton target={{ tool: catalog.id === 'bugs' ? 'bichos' : 'corpos-estranhos', itemId: entry.id, itemName: entry.name }} />
      </div>

      <Footer />
      {submitting && <SubmitModal catalog={catalog} entry={entry} onClose={() => setSubmitting(false)} />}
      {zoomed !== null && (
        <Lightbox
          photos={entry.photos}
          index={zoomed}
          onIndexChange={setZoomed}
          onClose={() => setZoomed(null)}
          alt={entry.name}
        />
      )}
    </div>
  )
}

/* ---------------------------------------------------------------- comuns */

function Empty({ title, body }: { title: string; body: string }) {
  return (
    <div className="mt-4 rounded-lg border border-dashed border-line bg-surface px-6 py-14 text-center">
      <p className="text-sm font-semibold text-ink">{title}</p>
      <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-ink-muted">{body}</p>
    </div>
  )
}

function MissingEntry({ catalog }: { catalog: Catalog }) {
  const { t } = useTranslation()
  return (
    <div className="shell py-10">
      <div className="rounded-lg border border-dashed border-line bg-surface px-6 py-14 text-center">
        <h1 className="text-sm font-semibold text-ink">{t('catalog.missingTitle')}</h1>
        <p className="mx-auto mt-1.5 max-w-md text-sm leading-relaxed text-ink-muted">{t('catalog.missingBody')}</p>
        <div className="mt-5 flex justify-center">
          <ButtonLink to={catalog.path} variant="secondary">
            {t(`catalog.${catalog.id}.back`)}
          </ButtonLink>
        </div>
      </div>
    </div>
  )
}

function Footer() {
  const { t } = useTranslation()
  return (
    <p className="mt-12 flex items-start gap-2 border-t border-line pt-6 text-xs leading-relaxed text-ink-faint">
      <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
      {t('catalog.footer')}
    </p>
  )
}
