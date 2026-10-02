/* ==========================================================================
   LivePanel.tsx — o lado "vivo" do algoritmo: a conclusão até agora, a lista
   de candidatos reordenada a cada resposta (com a barra de plausibilidade e
   o que bateu ou não), e o próximo passo: a pergunta ainda não respondida
   que mais separa os candidatos do topo, com o que se espera em cada um.
   ========================================================================== */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowRight, ChevronDown, ChevronUp } from 'lucide-react'
import { ResultBox } from '@/components/ui/didactic'
import { cn } from '@/lib/cn'
import { standingOf, type Conclusion, type NextStep, type Ranked, type Standing, type Verdict } from '../match'
import { findOption } from '../types'
import { RiskTag } from './EntityDetail'
import { VERDICT_STYLE } from './styles'

const STANDING_STYLE: Record<Standing, string> = {
  lider: 'bg-accent text-white',
  'em-jogo': 'bg-accent-soft text-accent-ink',
  improvavel: 'bg-elevated text-ink-muted',
  excluido: 'bg-danger/10 text-danger',
}

export function ConclusionBox({ conclusion, answered }: { conclusion: Conclusion; answered: number }) {
  const { t } = useTranslation()
  const { kind, leader, rivals } = conclusion
  const rivalNames = rivals.slice(0, 3).map((r) => r.entity.name)
  return (
    <ResultBox className={cn(kind === 'nenhuma' && 'border-line bg-surface')}>
      <p className="text-xs font-medium tracking-wide text-ink-muted uppercase">{t('algorithms.conclusionTitle')}</p>
      <p className="mt-1 text-sm leading-relaxed text-ink">
        {kind === 'nenhuma' && t('algorithms.conclusionNone')}
        {kind === 'aberta' && (leader ? t('algorithms.conclusionOpen', { name: leader.entity.name, n: rivals.length }) : t('algorithms.conclusionAllExcluded'))}
        {kind === 'favorece' && leader && t('algorithms.conclusionFavours', { name: leader.entity.name, rivals: rivalNames.join(', ') || t('algorithms.noRivals') })}
        {kind === 'forte' && leader && t('algorithms.conclusionStrong', { name: leader.entity.name })}
      </p>
      {answered > 0 && <p className="mt-1.5 text-xs text-ink-faint">{t('algorithms.nAnswered', { n: answered })}</p>}
    </ResultBox>
  )
}

export function CandidateList({ ranked, onOpen }: { ranked: Ranked[]; onOpen: (id: string) => void }) {
  const { t } = useTranslation()
  const [showExcluded, setShowExcluded] = useState(false)
  const alive = ranked.filter((r) => standingOf(r) !== 'excluido')
  const excluded = ranked.filter((r) => standingOf(r) === 'excluido')
  return (
    <div className="rounded-lg border border-line bg-elevated shadow-card">
      <div className="border-b border-line px-4 py-3">
        <p className="text-sm font-semibold text-ink">{t('algorithms.candidatesTitle')}</p>
        <p className="text-xs text-ink-muted">{t('algorithms.candidatesHint')}</p>
      </div>
      <ul className="divide-y divide-line">
        {alive.map((r, i) => (
          <CandidateRow key={r.entity.id} r={r} rank={i + 1} onOpen={() => onOpen(r.entity.id)} />
        ))}
        {excluded.length > 0 && (
          <li className="px-4 py-2">
            <button type="button" onClick={() => setShowExcluded((v) => !v)} className="inline-flex items-center gap-1 text-xs text-ink-muted hover:text-ink">
              {showExcluded ? <ChevronUp className="size-3.5" aria-hidden /> : <ChevronDown className="size-3.5" aria-hidden />}
              {t('algorithms.nExcluded', { n: excluded.length })}
            </button>
          </li>
        )}
        {showExcluded && excluded.map((r, i) => <CandidateRow key={r.entity.id} r={r} rank={alive.length + i + 1} onOpen={() => onOpen(r.entity.id)} muted />)}
      </ul>
    </div>
  )
}

function CandidateRow({ r, rank, onOpen, muted = false }: { r: Ranked; rank: number; onOpen: () => void; muted?: boolean }) {
  const { t } = useTranslation()
  const standing = standingOf(r)
  const width = Math.max(1, Math.round(r.plausibility * 100))
  const counts = countVerdicts(r.verdicts)
  return (
    <li className={cn('px-4 py-2.5', muted && 'opacity-70')}>
      <button type="button" onClick={onOpen} className="w-full text-left">
        <div className="flex items-start gap-2.5">
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-elevated text-[0.7rem] font-bold text-ink-muted ring-1 ring-line">{rank}</span>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-ink">
              {r.entity.name}
            </p>
            <div className="mt-1 flex flex-wrap items-center gap-1.5">
              <span className={cn('rounded-full px-2 py-0.5 text-[0.65rem] font-medium uppercase', STANDING_STYLE[standing])}>{t(`algorithms.standing.${standing}`)}</span>
              <RiskTag risk={r.entity.risk} />
              {counts.bate > 0 && <Pill cls={VERDICT_STYLE.bate}>{t('algorithms.nFit', { n: counts.bate })}</Pill>}
              {counts.contra > 0 && <Pill cls={VERDICT_STYLE.contra}>{t('algorithms.nAgainst', { n: counts.contra })}</Pill>}
              {counts.exclui > 0 && <Pill cls={VERDICT_STYLE.exclui}>{t('algorithms.nExcludes', { n: counts.exclui })}</Pill>}
            </div>
            <div className="mt-1.5 flex items-center gap-2" title={t('algorithms.plausibilityHint')}>
              <div className="h-1 flex-1 overflow-hidden rounded-full bg-elevated ring-1 ring-line" aria-hidden>
                <div className={cn('h-full rounded-full', width >= 8 ? 'bg-accent' : 'bg-ink-faint/40')} style={{ width: `${width}%` }} />
              </div>
              <span className="tabular shrink-0 text-[0.65rem] text-ink-faint">{r.plausibility >= 0.01 ? `${width}%` : '< 1%'}</span>
            </div>
          </div>
        </div>
      </button>
    </li>
  )
}

function countVerdicts(vs: { verdict: Verdict }[]): Record<Verdict, number> {
  const c: Record<Verdict, number> = { bate: 0, possivel: 0, contra: 0, exclui: 0 }
  for (const v of vs) c[v.verdict]++
  return c
}

function Pill({ cls, children }: { cls: string; children: React.ReactNode }) {
  return <span className={cn('rounded-full px-2 py-0.5 text-[0.65rem] font-medium', cls)}>{children}</span>
}

export function NextStepsPanel({ steps, onGo, exhausted, started }: { steps: NextStep[]; onGo: (questionId: string) => void; exhausted: boolean; started: boolean }) {
  const { t } = useTranslation()
  const maxGain = steps[0]?.gain || 1
  return (
    <div className="rounded-lg border border-accent/40 bg-accent-soft/40 p-4">
      <p className="text-sm font-semibold text-ink">{t('algorithms.nextTitle')}</p>
      <p className="mb-3 text-xs text-ink-muted">{t('algorithms.nextHint')}</p>
      {!started ? (
        <p className="text-xs text-ink-muted">{t('algorithms.nextStart')}</p>
      ) : steps.length === 0 ? (
        <p className="text-xs text-ink-muted">{exhausted ? t('algorithms.nextSettled') : t('algorithms.nextEmpty')}</p>
      ) : (
        <ul className="space-y-2">
          {steps.map((s) => (
            <li key={s.question.id} className="rounded-md border border-line bg-surface px-3 py-2">
              <button type="button" onClick={() => onGo(s.question.id)} className="flex w-full items-center gap-2 text-left">
                <span className="text-sm font-medium text-ink">{s.question.title}</span>
                <span className="h-1.5 w-16 overflow-hidden rounded-full bg-elevated ring-1 ring-line" aria-hidden>
                  <span className="block h-full rounded-full bg-accent" style={{ width: `${Math.round((s.gain / maxGain) * 100)}%` }} />
                </span>
                <ArrowRight className="ml-auto size-3.5 shrink-0 text-accent" aria-hidden />
              </button>
              <p className="mt-1 text-xs leading-relaxed text-ink-muted">
                {s.expected
                  .filter((x) => x.option)
                  .slice(0, 5)
                  .map((x, i) => (
                    <span key={x.entity.id}>
                      {i > 0 && ' · '}
                      {x.entity.short} <span className="font-medium text-ink">{(findOption(s.question, x.option!)?.label ?? x.option!).toLowerCase()}</span>
                    </span>
                  ))}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

