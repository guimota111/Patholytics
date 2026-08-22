import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowUpRight, Info, Search } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { calculators, groupBySection } from '@/tools/stager/registry'

/** Busca simples por nome, seção e sistema — sem acento e sem caixa. */
const fold = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

export default function StagerIndexPage() {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')

  const groups = useMemo(() => {
    const needle = fold(query.trim())
    if (!needle) return groupBySection()
    const matches = calculators.filter((calc) =>
      fold(`${calc.name} ${calc.section} ${calc.system} ${calc.summary ?? ''}`).includes(needle),
    )
    return groupBySection(matches)
  }, [query])

  const total = groups.reduce((sum, [, items]) => sum + items.length, 0)

  return (
    <div className="shell py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">
            {t('tools.stager.name')}
          </h1>
          <p className="mt-1.5 max-w-2xl text-sm text-ink-muted">{t('stager.subtitle')}</p>
        </div>
        <Badge>
          <span className="tabular">{calculators.length}</span>
          {t('stager.calculators')}
        </Badge>
      </header>

      <div className="relative mt-8 sm:max-w-md">
        <Search
          className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-ink-faint"
          aria-hidden
        />
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t('stager.searchPlaceholder')}
          aria-label={t('stager.searchPlaceholder')}
          className="h-10 w-full rounded-md border border-line bg-surface pr-3 pl-9 text-sm text-ink transition-colors placeholder:text-ink-faint hover:border-line-strong"
        />
      </div>

      {total === 0 ? (
        <p className="mt-10 text-sm text-ink-faint">{t('stager.noResults')}</p>
      ) : (
        <div className="mt-10 space-y-12">
          {groups.map(([section, items]) => (
            <section key={section}>
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
                <h2 className="text-sm font-semibold tracking-tight text-ink">{section}</h2>
                <Badge>
                  <span className="tabular">{items.length}</span>
                </Badge>
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5">
                {items.map((calc) => (
                  <Link
                    key={calc.id}
                    to={`/tools/stager/${calc.id}`}
                    className="group flex h-full flex-col rounded-lg border border-line bg-elevated p-5 shadow-card transition-colors hover:border-accent/40 hover:bg-raised"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-semibold tracking-tight text-ink">{calc.name}</h3>
                      <ArrowUpRight
                        className="size-4 shrink-0 text-ink-faint transition-colors group-hover:text-accent"
                        aria-hidden
                      />
                    </div>
                    <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-faint">
                      {calc.summary}
                    </p>
                    <span className="mt-4 inline-flex w-fit rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs text-ink-muted">
                      {calc.system}
                    </span>
                  </Link>
                ))}
              </div>
            </section>
          ))}
        </div>
      )}

      <p className="mt-14 flex items-start gap-2 border-t border-line pt-6 text-xs leading-relaxed text-ink-faint">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        {t('stager.disclaimer')}
      </p>
    </div>
  )
}
