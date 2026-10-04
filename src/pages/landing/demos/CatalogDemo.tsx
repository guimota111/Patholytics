import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Search } from 'lucide-react'
import { compactInputClass } from '@/components/ui/fields'
import { CATALOGS } from '@/tools/catalog/content'
import { facetLabel, filterEntries, type CatalogEntry, type CatalogId } from '@/tools/catalog/types'
import { cn } from '@/lib/cn'
import { DemoFrame, DemoLabel } from '../SnapSection'

/**
 * O catálogo como ele é usado: marque o que está vendo, ou digite o nome, e a
 * lista encolhe até o verbete. Os dois catálogos compartilham esta tela — o de
 * bichos filtra por morfologia, o de corpos estranhos pela clínica.
 */
export function CatalogDemo({ catalogId, facetIds }: { catalogId: CatalogId; facetIds: string[] }) {
  const { t } = useTranslation()
  const catalog = CATALOGS[catalogId]
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<Set<string>>(new Set())

  const toggle = (id: string) =>
    setSelected((current) => {
      const next = new Set(current)
      if (!next.delete(id)) next.add(id)
      return next
    })

  const entries = useMemo(() => filterEntries(catalog, query, selected), [catalog, query, selected])

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
      <DemoFrame className="flex flex-col">
        <DemoLabel>{t('landing.demo.catalog.filterLabel')}</DemoLabel>

        <div className="relative">
          <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint" aria-hidden />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t('landing.demo.catalog.searchPlaceholder')}
            aria-label={t('landing.demo.catalog.searchPlaceholder')}
            className={cn(compactInputClass, 'pl-9')}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-1.5">
          {facetIds.map((id) => (
            <button
              key={id}
              type="button"
              onClick={() => toggle(id)}
              aria-pressed={selected.has(id)}
              className={cn(
                'rounded-full border px-3 py-1.5 text-xs font-medium transition-colors',
                selected.has(id)
                  ? 'border-accent bg-accent-soft text-accent-ink'
                  : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink',
              )}
            >
              {facetLabel(catalog, id)}
            </button>
          ))}
        </div>

        <p className="tabular mt-auto pt-4 text-xs text-ink-faint">
          {t('landing.demo.catalog.count', { shown: entries.length, total: catalog.entries.length })}
        </p>
      </DemoFrame>

      <DemoFrame className="flex flex-col">
        <DemoLabel>{t('landing.demo.catalog.resultsLabel')}</DemoLabel>
        {entries.length === 0 ? (
          <p className="rounded-md border border-line bg-surface px-3.5 py-3 text-sm text-ink-faint">
            {t('landing.demo.catalog.empty')}
          </p>
        ) : (
          <ul className="grid max-h-[26rem] gap-2 overflow-auto pr-1 sm:grid-cols-2">
            {entries.slice(0, 12).map((entry) => (
              <EntryCard key={entry.id} entry={entry} />
            ))}
          </ul>
        )}
      </DemoFrame>
    </div>
  )
}

function EntryCard({ entry }: { entry: CatalogEntry }) {
  const photo = entry.photos[0]

  return (
    <li className="flex gap-3 rounded-md border border-line bg-surface p-2.5">
      {photo ? (
        <img
          src={photo.thumb ?? photo.src}
          alt=""
          loading="lazy"
          className="size-16 shrink-0 rounded object-cover"
          draggable={false}
        />
      ) : (
        <span className="size-16 shrink-0 rounded border border-line bg-raised" aria-hidden />
      )}
      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-ink">{entry.name}</p>
        <p className="mt-0.5 line-clamp-3 text-xs leading-relaxed text-ink-muted">{entry.summary}</p>
      </div>
    </li>
  )
}
