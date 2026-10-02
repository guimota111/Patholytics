/* ==========================================================================
   AlgorithmPage.tsx — um algoritmo diferencial em uso. À esquerda, as
   perguntas em quatro passos (clínica, morfologia, imuno, molecular), que o
   patologista responde na ordem que quiser. À direita, fixo, o painel vivo:
   a conclusão até agora, os candidatos reordenados a cada resposta e o
   próximo passo sugerido. Embaixo, o esquema do algoritmo clássico com os
   ramos acesos, os conselhos de bancada, a categoria de escape e as fontes.
   ========================================================================== */

import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ExternalLink, Info, Lightbulb, X } from 'lucide-react'
import { StepCard } from '@/components/ui/didactic'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/cn'
import { clearQuestion, conclude, countAnswers, emptyAnswers, isAnswered, nextSteps, rank, standingOf, toggleAnswer, type Answers } from '../match'
import { GROUP_LABELS, QUESTION_GROUPS, findOption, findQuestion, questionsOf, type Algorithm, type Question } from '../types'
import { EntityDetail } from './EntityDetail'
import { CandidateList, ConclusionBox, NextStepsPanel } from './LivePanel'
import { SchemaView } from './SchemaView'

export function AlgorithmPage({ algorithm }: { algorithm: Algorithm }) {
  const { t } = useTranslation()
  const [answers, setAnswers] = useState<Answers>(emptyAnswers)
  const [open, setOpen] = useState<string | null>(null)
  const [flash, setFlash] = useState<string | null>(null)
  const flashTimer = useRef<number | null>(null)

  const ranked = useMemo(() => rank(algorithm, answers), [algorithm, answers])
  const steps = useMemo(() => nextSteps(algorithm, ranked, answers), [algorithm, ranked, answers])
  const conclusion = useMemo(() => conclude(ranked, answers), [ranked, answers])
  const answered = countAnswers(answers)
  const alive = ranked.filter((r) => standingOf(r) !== 'excluido').length
  const openRanked = open ? ranked.find((r) => r.entity.id === open) ?? null : null
  const suggested = answered > 0 ? (steps[0]?.question.id ?? null) : null

  const goTo = (questionId: string) => {
    const el = document.getElementById(`q-${questionId}`)
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    setFlash(questionId)
    if (flashTimer.current) window.clearTimeout(flashTimer.current)
    flashTimer.current = window.setTimeout(() => setFlash(null), 1800)
  }
  useEffect(() => () => {
    if (flashTimer.current) window.clearTimeout(flashTimer.current)
  }, [])

  const tags = [...answers.entries()].flatMap(([qid, opts]) => {
    const q = findQuestion(algorithm, qid)
    if (!q) return []
    return [...opts].map((o) => ({ q, o, label: `${q.title}: ${findOption(q, o)?.label ?? o}` }))
  })

  return (
    <div className="shell py-10">
      <nav className="flex items-center gap-1.5 text-xs text-ink-faint">
        <Link to="/tools/algoritmos" className="inline-flex items-center gap-1 rounded-md py-0.5 transition-colors hover:text-ink">
          <ChevronLeft className="size-3.5" aria-hidden />
          {t('tools.algorithms.name')}
        </Link>
        <span aria-hidden>·</span>
        <span>{algorithm.system}</span>
      </nav>

      <header className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div className="max-w-3xl">
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{algorithm.name}</h1>
          <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">
            <span className="font-medium text-ink">{t('algorithms.scopeLabel')}</span> {algorithm.scope}
          </p>
        </div>
        <span className="inline-flex rounded-full border border-line bg-surface px-2.5 py-1 text-xs text-ink-muted">{t('algorithms.revised', { date: algorithm.revised })}</span>
      </header>

      {tags.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
          {tags.map(({ q, o, label }) => (
            <span key={`${q.id}.${o}`} className="inline-flex items-center gap-1 rounded-full border border-line bg-surface px-2.5 py-1 text-ink">
              {label}
              <button type="button" onClick={() => setAnswers((a) => toggleAnswer(a, q, o))} className="rounded-full p-0.5 text-ink-faint hover:text-ink" aria-label={t('algorithms.remove')}>
                <X className="size-3" aria-hidden />
              </button>
            </span>
          ))}
          <button type="button" onClick={() => setAnswers(emptyAnswers())} className="text-xs text-accent hover:underline">
            {t('algorithms.clearAll')}
          </button>
        </div>
      )}

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_23rem] 2xl:grid-cols-[minmax(0,1fr)_26rem]">
        <div className="space-y-6">
          {QUESTION_GROUPS.map((g, i) => {
            const qs = questionsOf(algorithm, g)
            if (qs.length === 0) return null
            const grid = g === 'imuno'
            return (
              <StepCard key={g} number={i + 1} title={GROUP_LABELS[g]} hint={t(`algorithms.groupHint.${g}`)}>
                <div className={cn(grid ? 'grid gap-x-6 gap-y-4 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-5')}>
                  {qs.map((q) => (
                    <QuestionBlock key={q.id} q={q} answers={answers} suggested={suggested === q.id} flash={flash === q.id} onToggle={(o) => setAnswers((a) => toggleAnswer(a, q, o))} onClear={() => setAnswers((a) => clearQuestion(a, q.id))} />
                  ))}
                </div>
              </StepCard>
            )
          })}
        </div>

        <aside className="space-y-4 lg:sticky lg:top-20">
          <ConclusionBox conclusion={conclusion} answered={answered} />
          <NextStepsPanel steps={steps} onGo={goTo} exhausted={answered > 0 && alive <= 1} started={answered > 0} />
          <CandidateList ranked={ranked} onOpen={setOpen} />
        </aside>
      </div>

      <section className="mt-12 rounded-lg border border-line bg-elevated shadow-card">
        <div className="border-b border-line px-5 py-4 sm:px-6">
          <h2 className="text-lg font-semibold tracking-tight text-ink">{t('algorithms.schemaTitle')}</h2>
          <p className="mt-0.5 text-sm leading-relaxed text-ink-muted">{t('algorithms.schemaHint')}</p>
        </div>
        <div className="px-5 py-5 sm:px-6">
          <SchemaView algorithm={algorithm} answers={answers} onOpen={setOpen} />
        </div>
      </section>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-lg border border-line bg-elevated p-5 shadow-card sm:p-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-ink">
            <Lightbulb className="size-4 text-accent" aria-hidden />
            {t('algorithms.adviceTitle')}
          </h2>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-ink">
            {algorithm.advice.map((a, i) => (
              <li key={i}>{a}</li>
            ))}
          </ul>
        </section>
        <section className="rounded-lg border border-line bg-elevated p-5 shadow-card sm:p-6">
          <h2 className="text-sm font-semibold text-ink">{t('algorithms.fallbackTitle')}</h2>
          <p className="mt-3 text-sm leading-relaxed text-ink">{algorithm.fallback}</p>
          <h2 className="mt-6 text-sm font-semibold text-ink">{t('algorithms.sourcesTitle')}</h2>
          <ol className="mt-3 list-decimal space-y-1.5 pl-5 text-xs leading-relaxed text-ink-muted">
            {algorithm.sources.map((s) => (
              <li key={s.id}>
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-start gap-1 text-accent hover:underline">
                    <span>{s.label}</span>
                    <ExternalLink className="mt-0.5 size-3 shrink-0" aria-hidden />
                  </a>
                ) : (
                  s.label
                )}
              </li>
            ))}
          </ol>
        </section>
      </div>

      <p className="mt-12 flex items-start gap-2 border-t border-line pt-6 text-xs leading-relaxed text-ink-faint">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        {t('algorithms.disclaimer')}
      </p>

      {openRanked && (
        <Modal title={openRanked.entity.name} onClose={() => setOpen(null)} wide>
          <EntityDetail algorithm={algorithm} ranked={openRanked} />
        </Modal>
      )}
    </div>
  )
}

function QuestionBlock({ q, answers, suggested, flash, onToggle, onClear }: { q: Question; answers: Answers; suggested: boolean; flash: boolean; onToggle: (option: string) => void; onClear: () => void }) {
  const { t } = useTranslation()
  const chosen = answers.get(q.id)
  const answered = isAnswered(answers, q.id)
  return (
    <div id={`q-${q.id}`} className={cn('rounded-md transition-shadow', flash && 'ring-2 ring-accent ring-offset-2 ring-offset-elevated')}>
      <div className="mb-1.5 flex flex-wrap items-center gap-x-2 gap-y-1">
        <p className="text-xs font-medium tracking-wide text-ink-muted uppercase">{q.title}</p>
        {suggested && !answered && <span className="rounded-full bg-accent px-2 py-0.5 text-[0.6rem] font-medium text-white uppercase">{t('algorithms.suggested')}</span>}
        {answered && (
          <button type="button" onClick={onClear} className="text-[0.7rem] text-ink-faint hover:text-ink">
            {t('algorithms.clearQuestion')}
          </button>
        )}
      </div>
      {q.hint && <p className="mb-2 text-xs leading-relaxed text-ink-muted">{q.hint}</p>}
      <div className="flex flex-wrap gap-1.5">
        {q.options.map((o) => {
          const active = chosen?.has(o.id) ?? false
          return (
            <button
              key={o.id}
              type="button"
              onClick={() => onToggle(o.id)}
              aria-pressed={active}
              title={o.hint}
              className={cn(
                'rounded-full border px-2.5 py-1 text-xs transition-colors',
                q.group === 'morfologia' || q.group === 'clinica' ? 'px-3 py-1.5 text-sm' : '',
                active ? 'border-accent bg-accent text-white' : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink',
              )}
            >
              {o.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
