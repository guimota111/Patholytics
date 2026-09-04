import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, Search } from 'lucide-react'
import { cn } from '@/lib/cn'
import { pieceFromSpecimen, pieceLines } from '../case'
import { shortCode } from '../codes'
import { BASES, COMMON_SPECIMEN_IDS, SPECIMENS, SPECIMEN_BY_ID, SYSTEMS, searchSpecimens, type Specimen, type SystemId } from '../specimens'

/** "21-8 ×1 + 22-6 ×9" — o que a peça rende com o que já vem marcado. */
function preview(sp: Specimen): string {
  const { lines } = pieceLines(pieceFromSpecimen(sp))
  return lines.map((l) => `${shortCode(l.code)} ×${l.qty}`).join(' + ')
}

function SpecimenButton({ sp, onPick, showPreview }: { sp: Specimen; onPick: (sp: Specimen) => void; showPreview: boolean }) {
  return (
    <button
      type="button"
      onClick={() => onPick(sp)}
      className="group flex w-full items-center gap-3 rounded-lg border-2 border-line bg-surface px-4 py-3 text-left transition-colors hover:border-accent hover:bg-accent-soft"
    >
      <span className="min-w-0 flex-1">
        <span className="block text-[0.9375rem] font-semibold text-ink">{sp.label}</span>
        <span className="mt-0.5 block text-xs text-ink-muted">{BASES[sp.base].label}</span>
      </span>
      {showPreview && <span className="tabular hidden shrink-0 text-xs font-semibold text-accent-ink sm:block">{preview(sp)}</span>}
      <ChevronRight className="size-5 shrink-0 text-ink-faint group-hover:text-accent" aria-hidden />
    </button>
  )
}

/**
 * Achar a peça: uma caixa de busca grande e, para quem não quer digitar,
 * os sistemas do corpo em cartões.
 */
export function MaterialPicker({ onPick, autoFocus = false }: { onPick: (sp: Specimen) => void; autoFocus?: boolean }) {
  const { t } = useTranslation()
  const [query, setQuery] = useState('')
  const [system, setSystem] = useState<SystemId | null>(null)

  const results = useMemo(() => searchSpecimens(query), [query])
  const commons = COMMON_SPECIMEN_IDS.map((id) => SPECIMEN_BY_ID[id]).filter(Boolean)
  const ofSystem = useMemo(() => (system ? SPECIMENS.filter((sp) => sp.system === system) : []), [system])

  return (
    <div className="space-y-5">
      <div className="relative">
        <Search className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-faint" aria-hidden />
        <input
          type="search"
          autoFocus={autoFocus}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setSystem(null)
          }}
          placeholder={t('billing.searchPlaceholder')}
          aria-label={t('billing.searchPlaceholder')}
          className="h-14 w-full rounded-xl border-2 border-line bg-surface pr-4 pl-12 text-lg text-ink transition-colors placeholder:text-ink-faint hover:border-line-strong focus:border-accent focus:outline-none"
        />
      </div>

      {query.trim().length > 0 ? (
        results.length > 0 ? (
          <div className="grid gap-2 lg:grid-cols-2">
            {results.map((sp) => (
              <SpecimenButton key={sp.id} sp={sp} onPick={onPick} showPreview />
            ))}
          </div>
        ) : (
          <p className="rounded-lg border border-line bg-surface px-4 py-6 text-center text-sm text-ink-muted">{t('billing.noResults')}</p>
        )
      ) : system ? (
        <div className="space-y-3">
          <button
            type="button"
            onClick={() => setSystem(null)}
            className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
          >
            <ChevronLeft className="size-4" aria-hidden />
            {t('billing.allSystems')}
          </button>
          <div className="grid gap-2 lg:grid-cols-2">
            {ofSystem.map((sp) => (
              <SpecimenButton key={sp.id} sp={sp} onPick={onPick} showPreview />
            ))}
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          <div>
            <p className="mb-2 text-xs font-semibold tracking-wider text-ink-faint uppercase">{t('billing.common')}</p>
            <div className="flex flex-wrap gap-2">
              {commons.map((sp) => (
                <button
                  key={sp.id}
                  type="button"
                  onClick={() => onPick(sp)}
                  className="rounded-full border-2 border-line bg-surface px-4 py-2 text-sm font-medium text-ink transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent-ink"
                >
                  {sp.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="mb-2 text-xs font-semibold tracking-wider text-ink-faint uppercase">{t('billing.bySystem')}</p>
            <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5">
              {SYSTEMS.map((sys) => {
                const Icon = sys.icon
                const count = SPECIMENS.filter((sp) => sp.system === sys.id).length
                return (
                  <button
                    key={sys.id}
                    type="button"
                    onClick={() => setSystem(sys.id)}
                    className={cn(
                      'flex flex-col items-start gap-2 rounded-xl border-2 border-line bg-surface px-4 py-3.5 text-left transition-colors',
                      'hover:border-accent hover:bg-accent-soft',
                    )}
                  >
                    <Icon className="size-6 text-accent" aria-hidden />
                    <span className="text-sm leading-tight font-semibold text-ink">{sys.label}</span>
                    <span className="tabular text-xs text-ink-faint">{t('billing.systemCount', { n: count })}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
