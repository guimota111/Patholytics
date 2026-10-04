import { useContext } from 'react'
import { FeedbackContext } from '@/components/feedback/feedback-context'

/**
 * Abre a caixa de relato de erro de qualquer lugar do app logado. Fora do
 * `FeedbackProvider` devolve uma função inerte, para que um componente possa
 * ser montado isolado (testes, harness) sem quebrar.
 */
export function useFeedback() {
  return useContext(FeedbackContext) ?? { report: () => {} }
}
