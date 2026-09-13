/* ==========================================================================
   content/index.ts — junta os verbetes de cada sistema num só catálogo e,
   em desenvolvimento, confere que todo id de sítio, morfologia e marcador
   existe no vocabulário e que as porcentagens estão entre 0 e 100 (um erro
   de digitação aqui silenciaria um tumor ou um marcador).
   ========================================================================== */

import { MARKERS, MORPHS, SITES, type Tumor } from '../types'
import { boneneural } from './boneneural'
import { breast } from './breast'
import { cns } from './cns'
import { gi } from './gi'
import { headneck } from './headneck'
import { hemato } from './hemato'
import { hepatopancreatic } from './hepatopancreatic'
import { kidneyurothelial } from './kidneyurothelial'
import { ovary } from './ovary'
import { prostatetestis } from './prostatetestis'
import { salivarythyroid } from './salivarythyroid'
import { skin } from './skin'
import { softtissue } from './softtissue'
import { thorax } from './thorax'
import { uterus } from './uterus'

export const TUMORS: Tumor[] = [
  ...skin,
  ...softtissue,
  ...boneneural,
  ...headneck,
  ...salivarythyroid,
  ...thorax,
  ...breast,
  ...gi,
  ...hepatopancreatic,
  ...kidneyurothelial,
  ...prostatetestis,
  ...ovary,
  ...uterus,
  ...cns,
  ...hemato,
]

export const findTumor = (id: string) => TUMORS.find((t) => t.id === id)

if (import.meta.env.DEV) {
  const sites = new Set(SITES.map((s) => s.id))
  const morphs = new Set(MORPHS.map((m) => m.id))
  const markers = new Set(MARKERS.map((m) => m.id))
  const seen = new Set<string>()
  for (const t of TUMORS) {
    if (seen.has(t.id)) console.warn(`[markers] id repetido: ${t.id}`)
    seen.add(t.id)
    for (const s of t.sites) if (!sites.has(s.site)) console.warn(`[markers] ${t.id}: sítio desconhecido "${s.site}"`)
    for (const m of [...t.cells, ...(t.architecture ?? []), ...(t.features ?? [])]) if (!morphs.has(m)) console.warn(`[markers] ${t.id}: morfologia desconhecida "${m}"`)
    const own = new Set<string>()
    for (const m of t.markers) {
      if (!markers.has(m.marker)) console.warn(`[markers] ${t.id}: marcador desconhecido "${m.marker}"`)
      if (own.has(m.marker)) console.warn(`[markers] ${t.id}: marcador repetido "${m.marker}"`)
      own.add(m.marker)
      const [lo, hi] = Array.isArray(m.pct) ? m.pct : [m.pct, m.pct]
      if (lo < 0 || hi > 100 || lo > hi) console.warn(`[markers] ${t.id}: porcentagem inválida em "${m.marker}"`)
    }
  }
}
