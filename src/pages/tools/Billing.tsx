import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowLeft, Check, ChevronRight, Copy, Info, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { MoreSection, ResultBox } from '@/components/ui/didactic'
import { cn } from '@/lib/cn'
import { CODES, SOURCE } from '@/tools/billing/codes'
import {
  parseList,
  resolveNext,
  type Answers,
  type ChoiceStep,
  type FormStep,
  type ResultData,
  type ResultStep,
} from '@/tools/billing/engine'
import { FLOW, PIECE_EXAMPLES } from '@/tools/billing/flow'

const bigInput =
  'tabular h-12 w-32 rounded-lg border-2 border-line bg-surface px-3 text-center text-lg font-semibold text-ink transition-colors hover:border-line-strong focus:border-accent'

export default function BillingPage() {
  const { t } = useTranslation()
  const [history, setHistory] = useState<string[]>([FLOW.start])
  const [answers, setAnswers] = useState<Answers>({})

  const stepId = history[history.length - 1]
  const step = FLOW.steps[stepId]

  const go = (next: string) => setHistory((h) => [...h, next])
  const back = () => setHistory((h) => (h.length > 1 ? h.slice(0, -1) : h))
  const restart = () => {
    setHistory([FLOW.start])
    setAnswers({})
  }

  // Trilha: o que já foi respondido, em texto.
  const trail = history.slice(0, -1).map((id) => {
    const s = FLOW.steps[id]
    if (s.kind === 'choice') {
      const v = answers[id]
      return s.options.find((o) => o.value === v)?.label ?? s.title
    }
    if (s.kind === 'form') {
      return s.fields
        .map((f) => {
          const v = answers[f.key]
          return v === undefined ? null : `${shortLabel(f.label)}: ${Array.isArray(v) ? v.join('/') : v}`
        })
        .filter(Boolean)
        .join(' · ')
    }
    return s.title
  })

  return (
    <div className="shell py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('tools.billing.name')}</h1>
        <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-ink-muted">{t('billing.subtitle')}</p>
      </header>

      <div className="mx-auto mt-8 w-full max-w-5xl">
        {trail.length > 0 && (
          <nav className="mb-4 flex flex-wrap items-center gap-1.5 text-sm" aria-label={t('billing.trail')}>
            {trail.map((label, i) => (
              <span key={i} className="inline-flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setHistory((h) => h.slice(0, i + 1))}
                  className="rounded-full border border-line bg-surface px-3 py-1 text-ink-muted transition-colors hover:border-line-strong hover:text-ink"
                >
                  {label}
                </button>
                <ChevronRight className="size-4 text-ink-faint" aria-hidden />
              </span>
            ))}
          </nav>
        )}

        <section className="rounded-lg border border-line bg-elevated shadow-card">
          <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-5 py-4 sm:px-6">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-ink">{step.title}</h2>
              {'hint' in step && step.hint && <p className="mt-1 max-w-4xl text-sm leading-relaxed text-ink-muted">{step.hint}</p>}
            </div>
            <div className="flex items-center gap-2">
              {history.length > 1 && (
                <Button type="button" size="sm" variant="ghost" onClick={back}>
                  <ArrowLeft className="size-4" aria-hidden />
                  {t('billing.back')}
                </Button>
              )}
              {history.length > 1 && (
                <Button type="button" size="sm" variant="ghost" onClick={restart}>
                  <RotateCcw className="size-4" aria-hidden />
                  {t('billing.restart')}
                </Button>
              )}
            </div>
          </div>

          <div className="px-5 py-5 sm:px-6">
            {step.kind === 'choice' && (
              <ChoiceView
                step={step}
                onPick={(value, next) => {
                  setAnswers((a) => ({ ...a, [step.id]: value }))
                  go(next)
                }}
              />
            )}
            {step.kind === 'form' && (
              <FormView
                key={step.id}
                step={step}
                answers={answers}
                onSubmit={(values) => {
                  const merged = { ...answers, ...values }
                  setAnswers(merged)
                  go(resolveNext(step, merged))
                }}
                onExample={
                  step.id === 'pecaNumeros'
                    ? (values) => {
                        const merged = { ...answers, ...values }
                        setAnswers(merged)
                        // Substitui a escolha simples/complexa pelo tipo do exemplo.
                        setHistory(['start', 'pecaTipo', 'pecaNumeros', 'pecaResultado'])
                      }
                    : undefined
                }
              />
            )}
            {step.kind === 'result' && <ResultView step={step} answers={answers} onRestart={restart} />}
          </div>
        </section>

        <p className="mt-10 flex items-start gap-2 border-t border-line pt-6 text-xs leading-relaxed text-ink-faint">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {t('billing.disclaimer')} {SOURCE}.
        </p>
      </div>
    </div>
  )
}

function shortLabel(label: string): string {
  const cut = label.split(/[(?]/)[0].trim()
  return cut.length > 28 ? `${cut.slice(0, 26)}…` : cut
}

function ChoiceView({ step, onPick }: { step: ChoiceStep; onPick: (value: string, next: string) => void }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {step.options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onPick(o.value, o.next)}
          className="group flex items-start gap-3 rounded-lg border-2 border-line bg-surface px-4 py-3.5 text-left transition-colors hover:border-accent hover:bg-accent-soft"
        >
          <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent-ink group-hover:bg-accent group-hover:text-white">
            <ChevronRight className="size-4" aria-hidden />
          </span>
          <span className="min-w-0">
            <span className="block text-base font-semibold text-ink">{o.label}</span>
            {o.description && <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">{o.description}</span>}
          </span>
        </button>
      ))}
    </div>
  )
}

function FormView({
  step,
  answers,
  onSubmit,
  onExample,
}: {
  step: FormStep
  answers: Answers
  onSubmit: (values: Answers) => void
  onExample?: (values: Answers) => void
}) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState<Record<string, string>>(() => {
    const d: Record<string, string> = {}
    for (const f of step.fields) {
      const prev = answers[f.key]
      d[f.key] = prev === undefined ? (f.default !== undefined ? String(f.default) : '') : Array.isArray(prev) ? prev.join(', ') : String(prev)
    }
    return d
  })
  const firstRef = useRef<HTMLInputElement>(null)
  useEffect(() => {
    firstRef.current?.focus()
    firstRef.current?.select()
  }, [])

  const submit = () => {
    const values: Answers = {}
    for (const f of step.fields) {
      const raw = draft[f.key] ?? ''
      if (f.list) {
        values[f.key] = parseList(raw)
      } else {
        let n = raw === '' ? (f.default ?? 0) : Number(raw)
        if (!Number.isFinite(n)) n = f.default ?? 0
        if (f.min !== undefined) n = Math.max(f.min, n)
        if (f.max !== undefined) n = Math.min(f.max, n)
        values[f.key] = Math.floor(n)
      }
    }
    onSubmit(values)
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        submit()
      }}
      className="space-y-5"
    >
      <div className="grid gap-5 md:grid-cols-2">
        {step.fields.map((f, i) => (
          <label key={f.key} className="block">
            <span className="block text-sm font-medium text-ink">{f.label}</span>
            {f.hint && <span className="mt-0.5 block text-xs leading-relaxed text-ink-faint">{f.hint}</span>}
            <input
              ref={i === 0 ? firstRef : undefined}
              type={f.list ? 'text' : 'number'}
              inputMode={f.list ? 'text' : 'numeric'}
              min={f.min}
              max={f.max}
              value={draft[f.key] ?? ''}
              onChange={(e) => setDraft((d) => ({ ...d, [f.key]: e.target.value }))}
              placeholder={f.list ? '8, 6, 5' : undefined}
              className={cn(bigInput, 'mt-2', f.list && 'w-full text-left sm:max-w-xs')}
            />
          </label>
        ))}
      </div>
      <div className="flex flex-wrap items-center gap-3">
        <Button type="submit" size="lg">
          {t('billing.continue')}
          <ChevronRight className="size-4" aria-hidden />
        </Button>
      </div>

      {onExample && (
        <MoreSection label={t('billing.examples')}>
          <ul className="divide-y divide-line">
            {PIECE_EXAMPLES.map((ex) => (
              <li key={ex.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-ink">
                    {ex.label} <span className="text-xs text-ink-faint">({ex.kind})</span>
                  </p>
                  <p className="text-xs leading-relaxed text-ink-muted">{ex.detail}</p>
                </div>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={() =>
                    onExample({ pecaTipo: ex.kind, frascos: 1, adicionais: ex.extras, margens: ex.margins, linfonodos: ex.lymphGroups * 6 })
                  }
                >
                  {t('billing.useExample')}
                </Button>
              </li>
            ))}
          </ul>
        </MoreSection>
      )}
    </form>
  )
}

function ResultView({ step, answers, onRestart }: { step: ResultStep; answers: Answers; onRestart: () => void }) {
  const { t } = useTranslation()
  const result: ResultData = useMemo(() => step.compute(answers), [step, answers])
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  // Agrega linhas do mesmo código para a expressão final.
  const totals = new Map<string, number>()
  for (const item of result.items) totals.set(item.code, (totals.get(item.code) ?? 0) + item.qty)
  const expression = [...totals.entries()].map(([code, qty]) => `${CODES[code as keyof typeof CODES].code} × ${qty}`).join(' + ')

  const copy = async () => {
    const text = [
      expression,
      '',
      ...[...totals.entries()].map(([code, qty]) => `${CODES[code as keyof typeof CODES].code} × ${qty} — ${CODES[code as keyof typeof CODES].name}`),
    ].join('\n')
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      return
    }
    setCopied(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="space-y-5">
      <ResultBox>
        <p className="text-sm text-ink-muted">{t('billing.resultTitle')}</p>
        <p className="tabular mt-1 text-2xl font-bold text-accent-ink">{expression || '—'}</p>
        <ul className="mt-4 divide-y divide-accent/20">
          {result.items.map((item, i) => {
            const c = CODES[item.code]
            return (
              <li key={i} className="flex flex-wrap items-baseline gap-x-4 gap-y-1 py-2">
                <span className="tabular text-base font-semibold text-ink">{c.code}</span>
                <span className="tabular text-base font-bold text-accent-ink">× {item.qty}</span>
                <span className="min-w-0 flex-1 text-sm text-ink">{c.name}</span>
                <span className="text-xs text-ink-muted">{item.reason}</span>
              </li>
            )
          })}
        </ul>
        <div className="mt-4 flex flex-wrap gap-2">
          <Button type="button" size="sm" onClick={() => void copy()} disabled={!expression}>
            {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
            {copied ? t('billing.copied') : t('billing.copy')}
          </Button>
          <Button type="button" size="sm" variant="secondary" onClick={onRestart}>
            <RotateCcw className="size-4" aria-hidden />
            {t('billing.newCase')}
          </Button>
        </div>
      </ResultBox>

      {result.warnings.length > 0 && (
        <div className="rounded-md border border-danger/40 bg-danger-soft px-4 py-3">
          <p className="text-xs font-semibold tracking-wider text-danger uppercase">{t('billing.warnings')}</p>
          <ul className="mt-1.5 space-y-1 text-sm text-ink">
            {result.warnings.map((w, i) => (
              <li key={i}>{w}</li>
            ))}
          </ul>
        </div>
      )}

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-md border border-line bg-surface px-4 py-3">
          <p className="text-xs font-semibold tracking-wider text-ink-faint uppercase">{t('billing.rule')}</p>
          <p className="mt-1.5 text-sm leading-relaxed text-ink">{result.rule}</p>
        </div>
        {result.notes.length > 0 && (
          <div className="rounded-md border border-line bg-surface px-4 py-3">
            <p className="text-xs font-semibold tracking-wider text-ink-faint uppercase">{t('billing.notes')}</p>
            <ul className="mt-1.5 list-disc space-y-1 pl-4 text-sm leading-relaxed text-ink-muted">
              {result.notes.map((n, i) => (
                <li key={i}>{n}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
