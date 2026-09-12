/* ==========================================================================
   content/index.ts — junta os verbetes de cada região num só catálogo e,
   em desenvolvimento, confere que todo id de local, revestimento e achado
   existe no vocabulário (um erro de digitação aqui silenciaria um cisto).
   ========================================================================== */

import { FEATURES, LININGS, SITES, type Cyst } from '../types'
import { abdomen } from './abdomen'
import { cns } from './cns'
import { headneck } from './headneck'
import { pelvis } from './pelvis'
import { skin } from './skin'
import { thorax } from './thorax'

export const CYSTS: Cyst[] = [...skin, ...headneck, ...thorax, ...abdomen, ...pelvis, ...cns]

if (import.meta.env.DEV) {
  const sites = new Set(SITES.map((s) => s.id))
  const linings = new Set(LININGS.map((l) => l.id))
  const features = new Set(FEATURES.map((f) => f.id))
  const seen = new Set<string>()
  for (const c of CYSTS) {
    if (seen.has(c.id)) console.warn(`[cysts] id repetido: ${c.id}`)
    seen.add(c.id)
    for (const s of c.sites) if (!sites.has(s)) console.warn(`[cysts] ${c.id}: local desconhecido "${s}"`)
    for (const l of c.linings) if (!linings.has(l)) console.warn(`[cysts] ${c.id}: revestimento desconhecido "${l}"`)
    for (const f of c.features ?? []) if (!features.has(f)) console.warn(`[cysts] ${c.id}: achado desconhecido "${f}"`)
  }
}
