import { Link, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { ChevronLeft } from 'lucide-react'
import { ButtonLink } from '@/components/ui/Button'
import { AlgorithmPage } from '@/tools/algorithms/components/AlgorithmPage'
import { findAlgorithm } from '@/tools/algorithms/content'

/** Um algoritmo diferencial: `/tools/algoritmos/:algorithmId`. */
export default function AlgorithmRoute() {
  const { algorithmId } = useParams()
  const algorithm = findAlgorithm(algorithmId)
  if (!algorithm) return <AlgorithmNotFound />
  // `key` zera as respostas ao trocar de algoritmo.
  return <AlgorithmPage key={algorithm.id} algorithm={algorithm} />
}

function AlgorithmNotFound() {
  const { t } = useTranslation()
  return (
    <div className="shell py-16">
      <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('algorithms.notFound')}</h1>
      <p className="mt-2 max-w-md text-sm text-ink-muted">{t('algorithms.notFoundBody')}</p>
      <ButtonLink to="/tools/algoritmos" className="mt-6" variant="secondary">
        <ChevronLeft className="size-4" aria-hidden />
        {t('algorithms.backToList')}
      </ButtonLink>
      <Link to="/dashboard" className="sr-only">
        {t('nav.dashboard')}
      </Link>
    </div>
  )
}
