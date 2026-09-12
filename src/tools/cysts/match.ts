/* ==========================================================================
   match.ts — das escolhas (local, revestimento, achados, texto) à lista
   ordenada de sugestões. Função pura: recebe o conteúdo e as escolhas,
   devolve cada cisto com a pontuação e o que combinou, para a tela mostrar
   por que ele apareceu ali.
   ========================================================================== */

import type { Cyst } from './types'

export interface Choice {
  site: string | null
  linings: Set<string>
  features: Set<string>
  query: string
}

export interface Suggestion {
  cyst: Cyst
  score: number
  siteMatch: boolean
  liningMatch: boolean
  featureHits: string[]
  /** Quantos achados escolhidos este cisto não tem. */
  featureMisses: number
}

export const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

/**
 * Pontuação: o revestimento é o que mais pesa, depois o local, depois cada
 * achado. Um cisto sem o local escolhido só entra quando também combina no
 * revestimento — é o "considere também", que evita esquecer uma lesão que
 * ocorre em mais de um lugar.
 */
export function suggest(cysts: Cyst[], choice: Choice): Suggestion[] {
  const q = normalize(choice.query.trim())
  const anyLining = choice.linings.size > 0
  const anyFeature = choice.features.size > 0
  const out: Suggestion[] = []

  for (const cyst of cysts) {
    if (q) {
      const hay = normalize([cyst.name, ...(cyst.aka ?? [])].join(' '))
      if (!hay.includes(q)) continue
    }
    const siteMatch = choice.site !== null && cyst.sites.includes(choice.site)
    const liningMatch = anyLining && cyst.linings.some((l) => choice.linings.has(l))
    const featureHits = [...choice.features].filter((f) => cyst.features?.includes(f))
    const featureMisses = choice.features.size - featureHits.length

    // Sem texto de busca, algo precisa combinar para o cisto aparecer.
    if (!q) {
      if (choice.site !== null && !siteMatch && !liningMatch) continue
      if (choice.site === null && anyLining && !liningMatch) continue
      if (choice.site === null && !anyLining && !anyFeature) continue
    }

    let score = 0
    if (siteMatch) score += 3
    if (liningMatch) score += 4
    // O primeiro revestimento listado é o típico do cisto: desempata a favor dele.
    if (liningMatch && choice.linings.has(cyst.linings[0])) score += 0.5
    score += featureHits.length * 1.5
    score -= featureMisses * 0.5
    out.push({ cyst, score, siteMatch, liningMatch, featureHits, featureMisses })
  }

  return out.sort((a, b) => b.score - a.score || a.cyst.name.localeCompare(b.cyst.name, 'pt-BR'))
}
