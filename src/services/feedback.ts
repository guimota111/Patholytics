/* ==========================================================================
   feedback.ts — o envio de um relato de erro. Vai para a coleção `feedback`
   do Firestore, no mesmo espírito das fotos dos catálogos: sem backend, só
   a regra que aceita criação de quem está logado, em nome próprio. Quem
   mantém o conteúdo lê os relatos no console do Firebase, corrige o módulo
   em `content/` e marca o documento como resolvido por lá.
   ========================================================================== */

import { addDoc, collection, serverTimestamp } from 'firebase/firestore'

export const FEEDBACK_KINDS = ['content', 'bug', 'suggestion', 'other'] as const
export type FeedbackKind = (typeof FEEDBACK_KINDS)[number]

/** Limites espelhados na regra do Firestore: mudar aqui exige mudar lá. */
export const LIMITS = {
  message: 4000,
  contact: 200,
  itemName: 200,
  itemId: 120,
  tool: 60,
  route: 300,
  agent: 300,
} as const

/** De onde o relato partiu, quando a tela sabe dizer. */
export interface FeedbackTarget {
  /** Slug da ferramenta, normalmente o segmento de `/tools/<slug>`. */
  tool?: string | null
  /** Id do verbete, do tumor, do cisto — o que precisa de correção. */
  itemId?: string | null
  /** Nome legível do mesmo item, para não depender do id na hora de achar. */
  itemName?: string | null
}

export interface FeedbackInput extends FeedbackTarget {
  kind: FeedbackKind
  message: string
  /** Como responder, se a pessoa quiser resposta. */
  contact: string | null
  route: string
  uid: string
  email: string | null
  language: string
}

const clip = (value: string, max: number) => value.slice(0, max)

/** O slug da ferramenta a partir da rota: `/tools/marcadores/x` → `marcadores`. */
export function toolFromRoute(pathname: string): string | null {
  const match = /^\/tools\/([^/]+)/.exec(pathname)
  return match ? match[1] : null
}

export async function sendFeedback(input: FeedbackInput): Promise<void> {
  const { db } = await import('@/lib/firestore')
  await addDoc(collection(db, 'feedback'), {
    kind: input.kind,
    message: clip(input.message.trim(), LIMITS.message),
    tool: input.tool ? clip(input.tool, LIMITS.tool) : null,
    itemId: input.itemId ? clip(input.itemId, LIMITS.itemId) : null,
    itemName: input.itemName ? clip(input.itemName, LIMITS.itemName) : null,
    route: clip(input.route, LIMITS.route),
    contact: input.contact ? clip(input.contact.trim(), LIMITS.contact) : null,
    uid: input.uid,
    email: input.email,
    language: input.language,
    // Navegador e tamanho de tela: o que basta para reproduzir um bug de layout.
    agent: clip(`${navigator.userAgent} | ${window.innerWidth}x${window.innerHeight}`, LIMITS.agent),
    status: 'open',
    createdAt: serverTimestamp(),
  })
}
