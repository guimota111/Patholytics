/* ==========================================================================
   ReportButton.tsx — o "achei um erro aqui" que fica dentro de um verbete.
   É discreto de propósito: quem abriu o cartão para ler é quem vê o erro.
   ========================================================================== */

import { useTranslation } from 'react-i18next'
import { Flag } from 'lucide-react'
import { useFeedback } from '@/hooks/useFeedback'
import { cn } from '@/lib/cn'
import type { FeedbackTarget } from '@/services/feedback'

export function ReportButton({ target, className, label }: { target: FeedbackTarget; className?: string; label?: string }) {
  const { t } = useTranslation()
  const { report } = useFeedback()
  return (
    <button
      type="button"
      onClick={() => report(target)}
      className={cn('inline-flex items-center gap-1.5 text-xs text-ink-faint transition-colors hover:text-accent', className)}
    >
      <Flag className="size-3.5" aria-hidden />
      {label ?? t('feedback.reportItem')}
    </button>
  )
}
