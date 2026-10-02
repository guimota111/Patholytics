/* ==========================================================================
   SchemaView.tsx — o algoritmo clássico desenhado como ramos ("se sólido e
   baixo grau, pense em…"), cada um acendendo conforme as respostas: ativo
   quando todas as condições foram respondidas e batem, parcial quando o que
   foi respondido bate mas falta algo, fechado quando uma resposta o
   contradiz.
   ========================================================================== */

import { useTranslation } from 'react-i18next'
import { Check, CircleDashed, Minus, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { branchState, type Answers, type BranchState } from '../match'
import { findEntity, type Algorithm } from '../types'

const STATE_STYLE: Record<BranchState, { row: string; icon: React.ReactNode }> = {
  ativo: { row: 'border-accent/50 bg-accent-soft/50', icon: <Check className="size-3.5 text-accent" aria-hidden /> },
  parcial: { row: 'border-amber-500/40 bg-amber-500/5', icon: <CircleDashed className="size-3.5 text-amber-700 dark:text-amber-300" aria-hidden /> },
  aberto: { row: 'border-line bg-surface', icon: <Minus className="size-3.5 text-ink-faint" aria-hidden /> },
  fechado: { row: 'border-line bg-surface opacity-55', icon: <X className="size-3.5 text-ink-faint" aria-hidden /> },
}

export function SchemaView({ algorithm, answers, onOpen }: { algorithm: Algorithm; answers: Answers; onOpen: (id: string) => void }) {
  const { t } = useTranslation()
  return (
    <div className="space-y-6">
      {algorithm.schema.map((g) => (
        <div key={g.id}>
          <p className="mb-2 text-xs font-medium tracking-wide text-ink-muted uppercase">{g.title}</p>
          <ul className="space-y-1.5">
            {g.branches.map((b) => {
              const state = branchState(b, answers)
              const s = STATE_STYLE[state]
              return (
                <li key={b.id} className={cn('rounded-md border px-3 py-2 transition-colors', s.row)}>
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                    <span className="inline-flex items-center gap-1.5 text-sm font-medium text-ink">
                      {s.icon}
                      {b.label}
                    </span>
                    <span className="text-[0.65rem] font-medium tracking-wide text-ink-faint uppercase">{t(`algorithms.branch.${state}`)}</span>
                    <span className="flex flex-wrap items-center gap-1 sm:ml-auto">
                      {b.leads.map((id) => {
                        const e = findEntity(algorithm, id)
                        return (
                          <button key={id} type="button" onClick={() => onOpen(id)} className="rounded-full border border-line bg-elevated px-2 py-0.5 text-xs text-ink-muted transition-colors hover:border-accent/40 hover:text-ink">
                            {e ? e.short : id}
                          </button>
                        )
                      })}
                    </span>
                  </div>
                  {b.note && <p className="mt-1 text-xs leading-relaxed text-ink-muted">{b.note}</p>}
                </li>
              )
            })}
          </ul>
        </div>
      ))}
    </div>
  )
}
