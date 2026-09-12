/* ==========================================================================
   types.ts — os catálogos (bichos e corpos estranhos). Como no manual de
   macroscopia, o conteúdo é código: cada catálogo é um módulo em `content/`
   com os seus verbetes e as facetas pelas quais se filtra. Nada é editado
   pela interface; o que os usuários enviam pelo modal vai para a curadoria
   e entra aqui depois, com o crédito.
   ========================================================================== */

import type { LucideIcon } from 'lucide-react'

export type CatalogId = 'bugs' | 'foreign'

/** Uma opção de filtro: `id` estável, `label` como aparece na tela. */
export interface Facet {
  id: string
  label: string
}

export interface CatalogPhoto {
  /** URL da foto (import de `@/assets/catalog/...`). */
  src: string
  caption?: string
  /** Quem enviou a foto — aparece junto dela. */
  credit?: string
  /** Coloração ou técnica, se fizer diferença: "PAS", "Grocott", "HE 40×". */
  stain?: string
}

export interface CatalogEntry {
  /** Segmento da URL: minúsculas, sem acento, hífens. */
  id: string
  /** Nome ou gênero: "Candida", "Histoplasma capsulatum", "PMMA". */
  name: string
  /** Outros nomes pelos quais se procura. */
  aka?: string[]
  /** Uma linha para o cartão da busca. */
  summary: string
  /** Texto longo no dialeto de `richtext.tsx` (`##`, `-`, `**`). */
  description?: string
  /** Ids de `Catalog.traits` (só o catálogo de bichos usa). */
  traits: string[]
  /** Ids de `Catalog.sites`. */
  sites: string[]
  /** Ids de `Catalog.clinical`. */
  clinical: string[]
  photos: CatalogPhoto[]
}

export interface Catalog {
  id: CatalogId
  /** Rota da capa: `/tools/bichos`. */
  path: string
  icon: LucideIcon
  /** Cor de acento, hex de seis dígitos. */
  color: string
  /** Características morfológicas — vazio no catálogo de corpos estranhos. */
  traits: Facet[]
  sites: Facet[]
  clinical: Facet[]
  entries: CatalogEntry[]
}

export type FacetKind = 'traits' | 'sites' | 'clinical'
export const FACET_KINDS: FacetKind[] = ['traits', 'sites', 'clinical']

/** Sem acento e em minúsculas, para a busca casar "candida" com "Cândida". */
export const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()

/** Verbetes que casam com a busca por nome e com TODAS as facetas marcadas. */
export function filterEntries(catalog: Catalog, query: string, selected: Set<string>): CatalogEntry[] {
  const q = normalize(query)
  return catalog.entries.filter((entry) => {
    if (q) {
      const hay = [entry.name, ...(entry.aka ?? []), entry.summary].map(normalize).join(' ')
      if (!hay.includes(q)) return false
    }
    for (const id of selected) {
      if (!entry.traits.includes(id) && !entry.sites.includes(id) && !entry.clinical.includes(id)) return false
    }
    return true
  })
}

export const findEntry = (catalog: Catalog, id: string | undefined): CatalogEntry | undefined =>
  catalog.entries.find((entry) => entry.id === id)

export const facetLabel = (catalog: Catalog, id: string): string =>
  [...catalog.traits, ...catalog.sites, ...catalog.clinical].find((f) => f.id === id)?.label ?? id
