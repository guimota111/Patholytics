/* ==========================================================================
   curator.ts — quem cuida do conteúdo compartilhado.

   Espelho declarado de `isCurator()` em firestore.rules: mudar a lista aqui
   exige mudar lá. Serve só para esconder botões — a regra é que decide, e um
   usuário que forje este módulo no navegador esbarra nela do mesmo jeito.
   ========================================================================== */

import type { User } from 'firebase/auth'

export const CURATOR_EMAILS: readonly string[] = ['guimota1@gmail.com']

export function isCurator(user: User | null | undefined): boolean {
  return Boolean(user?.emailVerified && user.email && CURATOR_EMAILS.includes(user.email))
}
