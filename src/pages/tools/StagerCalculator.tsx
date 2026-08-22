import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, Info } from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'
import { CalculatorForm } from '@/tools/stager/components/CalculatorForm'
import { ResultPanel } from '@/tools/stager/components/ResultPanel'
import { getCalculator } from '@/tools/stager/registry'
import { useCalculator } from '@/tools/stager/useCalculator'
import type { Calculator } from '@/tools/stager/types'

export default function StagerCalculatorPage() {
  const { calculatorId } = useParams()
  const calc = getCalculator(calculatorId)

  if (!calc) return <CalculatorNotFound />
  // `key` remonta o estado ao trocar de calculadora pela barra lateral.
  return <CalculatorView key={calc.id} calc={calc} />
}

function CalculatorView({ calc }: { calc: Calculator }) {
  const { t } = useTranslation()
  const { values, setValue, reset, visibleFields, result } = useCalculator(calc)

  return (
    <div className="shell py-10">
      <nav className="flex items-center gap-1.5 text-xs text-ink-faint">
        <Link
          to="/tools/stager"
          className="inline-flex items-center gap-1 rounded-md py-0.5 transition-colors hover:text-ink"
        >
          <ChevronLeft className="size-3.5" aria-hidden />
          {t('tools.stager.name')}
        </Link>
        <span aria-hidden>·</span>
        <span>{calc.section}</span>
      </nav>

      <header className="mt-3 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{calc.name}</h1>
          {calc.summary && (
            <p className="mt-1.5 max-w-2xl text-sm text-ink-muted">{calc.summary}</p>
          )}
        </div>
        <span className="inline-flex rounded-full border border-line bg-surface px-2.5 py-1 text-xs text-ink-muted">
          {calc.system}
        </span>
      </header>

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] 2xl:grid-cols-[minmax(0,1fr)_28rem]">
        <CalculatorForm fields={visibleFields} values={values} onChange={setValue} />

        <div className="lg:sticky lg:top-20">
          <ResultPanel result={result} onReset={reset} />
        </div>
      </div>

      <p className="mt-12 flex items-start gap-2 border-t border-line pt-6 text-xs leading-relaxed text-ink-faint">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        {calc.version ? `${calc.version} · ` : ''}
        {t('stager.disclaimer')}
      </p>
    </div>
  )
}

function CalculatorNotFound() {
  const { t } = useTranslation()

  return (
    <div className="shell py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('stager.notFound')}</h1>
      <p className="mt-2 max-w-md text-sm text-ink-muted">{t('stager.notFoundBody')}</p>
      <ButtonLink to="/tools/stager" className="mt-6" variant="secondary">
        <ChevronLeft className="size-4" aria-hidden />
        {t('stager.backToList')}
      </ButtonLink>
    </div>
  )
}
