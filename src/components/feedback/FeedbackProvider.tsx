/* ==========================================================================
   FeedbackProvider.tsx — guarda o estado da caixa de relato e a expõe a
   qualquer tela pelo hook `useFeedback`. Fica dentro do layout logado: o
   envio exige usuário, e é lá que estão as ferramentas com conteúdo a
   corrigir.
   ========================================================================== */

import { useCallback, useMemo, useState, type ReactNode } from 'react'
import type { FeedbackTarget } from '@/services/feedback'
import { FeedbackContext } from './feedback-context'
import { FeedbackModal } from './FeedbackModal'

export function FeedbackProvider({ children }: { children: ReactNode }) {
  const [target, setTarget] = useState<FeedbackTarget | null>(null)
  const report = useCallback((next: FeedbackTarget = {}) => setTarget(next), [])
  const value = useMemo(() => ({ report }), [report])

  return (
    <FeedbackContext.Provider value={value}>
      {children}
      {target && <FeedbackModal target={target} onClose={() => setTarget(null)} />}
    </FeedbackContext.Provider>
  )
}
