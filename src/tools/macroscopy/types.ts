/* ==========================================================================
   types.ts — manual de macroscopia. O conteúdo é código: cada sistema é um
   módulo em `content/`, e dentro dele os roteiros com os seus passos. Nada
   vem do servidor e nada é editado pela interface do site.
   ========================================================================== */

import type { LucideIcon } from 'lucide-react'

export interface MacroStep {
  /** Texto do passo no dialeto de `richtext.tsx`: `## título`, `- item`, `**negrito**`. */
  text: string
  /** URL da foto (import de `@/assets/macroscopy/...`). Ausente quando o passo é só texto. */
  image?: string
  /** Legenda da foto. */
  caption?: string
}

export interface MacroProtocol {
  /** Segmento da URL: minúsculas, sem acento, hífens. */
  id: string
  name: string
  /** Uma linha para o cartão da peça, opcional. */
  summary?: string
  steps: MacroStep[]
}

export interface MacroSystem {
  /** Segmento da URL: minúsculas, sem acento, hífens. */
  id: string
  name: string
  icon: LucideIcon
  /** Cor de acento do sistema, em hex de seis dígitos. */
  color: string
  description: string
  protocols: MacroProtocol[]
}
