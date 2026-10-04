/* ==========================================================================
   ArchiveContributors.tsx — quem alimenta o catálogo compartilhado.

   A contagem é feita aqui, em memória, sobre a mesma coleção que a árvore já
   lê: sem Cloud Functions no projeto, um contador agregado exigiria deixar
   todo usuário escrever num documento de estatística — exatamente o que o
   catálogo evita. Enquanto o acervo couber numa assinatura, contar é exato e
   custa zero escrita.
   ========================================================================== */

import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { ArrowLeft, ClipboardCopy, FileText, Trophy } from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'
import { cn } from '@/lib/cn'
import { CATALOG_SPACE } from '@/tools/archive/service'
import { HOUSE_CREDIT, type ArchiveNode } from '@/tools/archive/types'
import { useArchiveSpace } from '@/tools/archive/useArchive'

interface Contributor {
  key: string
  name: string
  reports: number
  copies: number
  since: Date | null
  house: boolean
}

/**
 * Agrupa por (uid, nome): o curador que publica em nome próprio aparece
 * separado do acervo da casa, e dois homônimos não se fundem numa linha só.
 */
function tally(nodes: ArchiveNode[]): Contributor[] {
  const byKey = new Map<string, Contributor>()
  for (const node of nodes) {
    if (node.type === 'category') continue
    const name = node.authorName || HOUSE_CREDIT
    const key = `${node.authorUid}|${name}`
    const at = node.createdAt?.toDate() ?? null
    const found = byKey.get(key)
    if (found) {
      found.reports += 1
      found.copies += node.copyCount
      if (at && (!found.since || at < found.since)) found.since = at
    } else {
      byKey.set(key, { key, name, reports: 1, copies: node.copyCount, since: at, house: node.authorUid === '' })
    }
  }
  return [...byKey.values()].sort(
    (a, b) => b.reports - a.reports || b.copies - a.copies || a.name.localeCompare(b.name, 'pt-BR'),
  )
}

const MEDALS = ['🥇', '🥈', '🥉']

export default function ArchiveContributorsPage() {
  const { t, i18n } = useTranslation()
  const catalog = useArchiveSpace(CATALOG_SPACE)

  const { house, ranked } = useMemo(() => {
    const all = tally(catalog.nodes)
    return { house: all.filter((c) => c.house), ranked: all.filter((c) => !c.house) }
  }, [catalog.nodes])

  const dateFormat = useMemo(
    () => new Intl.DateTimeFormat(i18n.language, { month: 'long', year: 'numeric' }),
    [i18n.language],
  )

  const stats = (c: Contributor) => (
    <>
      <span className="tabular inline-flex items-center gap-1 text-sm text-ink">
        <FileText className="size-3.5 text-ink-faint" aria-hidden />
        {t('archive.contributors.reports', { count: c.reports })}
      </span>
      <span className="tabular inline-flex items-center gap-1 text-sm text-ink-muted">
        <ClipboardCopy className="size-3.5 text-ink-faint" aria-hidden />
        {t('archive.contributors.copies', { count: c.copies })}
      </span>
    </>
  )

  return (
    <div className="shell py-10">
      <header>
        <Link
          to="/tools/archive"
          className="inline-flex items-center gap-1.5 text-sm text-ink-muted underline-offset-2 hover:text-accent hover:underline"
        >
          <ArrowLeft className="size-4" aria-hidden />
          {t('archive.contributors.back')}
        </Link>
        <h1 className="mt-3 flex items-center gap-2 text-2xl font-semibold tracking-tight text-ink">
          <Trophy className="size-6 text-amber-500" aria-hidden />
          {t('archive.contributors.title')}
        </h1>
        <p className="mt-1.5 max-w-3xl text-sm text-ink-muted">{t('archive.contributors.subtitle')}</p>
      </header>

      {catalog.error ? (
        <p className="mt-8 text-sm text-danger">{t('archive.loadError')}</p>
      ) : catalog.loading ? (
        <div className="mt-10 flex justify-center">
          <Spinner />
        </div>
      ) : (
        <>
          <ol className="mt-8 space-y-2">
            {ranked.length === 0 && (
              <li className="rounded-lg border border-dashed border-line px-4 py-8 text-center text-sm text-ink-faint">
                {t('archive.contributors.empty')}
              </li>
            )}
            {ranked.map((c, i) => (
              <li
                key={c.key}
                className={cn(
                  'flex flex-wrap items-center gap-x-4 gap-y-1 rounded-lg border border-line bg-elevated px-4 py-3 shadow-card',
                  i < 3 && 'border-amber-500/40',
                )}
              >
                <span className="tabular w-8 shrink-0 text-center text-lg" aria-hidden>
                  {MEDALS[i] ?? <span className="text-sm text-ink-faint">{i + 1}</span>}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-ink">{c.name}</span>
                  {c.since && (
                    <span className="block text-xs text-ink-faint">
                      {t('archive.contributors.since', { date: dateFormat.format(c.since) })}
                    </span>
                  )}
                </span>
                {stats(c)}
              </li>
            ))}
          </ol>

          {house.map((c) => (
            <div key={c.key} className="mt-6 rounded-lg border border-line bg-surface px-4 py-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <span className="min-w-0 flex-1">
                  <span className="block truncate font-medium text-ink">{c.name}</span>
                  <span className="block text-xs text-ink-faint">{t('archive.contributors.houseNote')}</span>
                </span>
                {stats(c)}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  )
}
