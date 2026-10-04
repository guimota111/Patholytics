/* Cores dos vereditos, compartilhadas pelo painel vivo e pelo verbete. */
import type { Verdict } from '../match'

export const VERDICT_STYLE: Record<Verdict, string> = {
  bate: 'bg-success/15 text-success',
  possivel: 'bg-elevated text-ink-muted',
  contra: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  exclui: 'bg-danger/15 text-danger',
}
