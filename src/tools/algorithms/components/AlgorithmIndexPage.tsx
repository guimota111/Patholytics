/* ==========================================================================
   AlgorithmIndexPage.tsx — a lista dos algoritmos diferenciais, agrupada por
   sistema, no mesmo desenho do índice do Estadiador. Cada cartão diz em uma
   frase a situação que o algoritmo cobre.
   ========================================================================== */

import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ArrowUpRight, Info } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { ALGORITHMS } from '../content'

export function AlgorithmIndexPage() {
  const { t } = useTranslation()
  const groups = new Map<string, typeof ALGORITHMS>()
  for (const a of ALGORITHMS) groups.set(a.system, [...(groups.get(a.system) ?? []), a])

  return (
    <div className="shell py-10">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('tools.algorithms.name')}</h1>
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-ink-muted">{t('algorithms.subtitle')}</p>
        </div>
        <Badge>
          <span className="tabular">{ALGORITHMS.length}</span>
          {t('algorithms.count', { count: ALGORITHMS.length })}
        </Badge>
      </header>

      <div className="mt-10 space-y-12">
        {[...groups.entries()].map(([system, items]) => (
          <section key={system}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line pb-3">
              <h2 className="text-sm font-semibold tracking-tight text-ink">{system}</h2>
              <Badge>
                <span className="tabular">{items.length}</span>
              </Badge>
            </div>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {items.map((a) => (
                <Link key={a.id} to={`/tools/algoritmos/${a.id}`} className="group flex h-full flex-col rounded-lg border border-line bg-elevated p-5 shadow-card transition-colors hover:border-accent/40 hover:bg-raised">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-sm font-semibold tracking-tight text-ink">{a.name}</h3>
                    <ArrowUpRight className="size-4 shrink-0 text-ink-faint transition-colors group-hover:text-accent" aria-hidden />
                  </div>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-ink-faint">{a.summary}</p>
                  <div className="mt-4 flex flex-wrap gap-1.5 text-xs text-ink-muted">
                    <span className="rounded-full border border-line bg-surface px-2.5 py-0.5">{t('algorithms.nEntities', { n: a.entities.length })}</span>
                    <span className="rounded-full border border-line bg-surface px-2.5 py-0.5">{t('algorithms.nQuestions', { n: a.questions.length })}</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        ))}
      </div>

      <p className="mt-14 flex items-start gap-2 border-t border-line pt-6 text-xs leading-relaxed text-ink-faint">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        {t('algorithms.disclaimer')}
      </p>
    </div>
  )
}
