import { createContext } from 'react'
import type { FeedbackTarget } from '@/services/feedback'

export interface FeedbackContextValue {
  /** Abre a caixa de relato, já apontada para um item quando a tela sabe qual. */
  report: (target?: FeedbackTarget) => void
}

export const FeedbackContext = createContext<FeedbackContextValue | null>(null)
