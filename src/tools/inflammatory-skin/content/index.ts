/* ==========================================================================
   content/index.ts — junta os verbetes de cada padrão num só catálogo e, em
   desenvolvimento, confere que todo id de padrão, dado clínico e achado
   existe no vocabulário, que os hallmarks estão dentro de histology e que
   não há id repetido (um erro de digitação aqui silenciaria um verbete).
   ========================================================================== */

import { CLINICAL, HISTOLOGY, PATTERNS, type Diagnosis } from '../types'
import { adnexal } from './adnexal'
import { blistering } from './blistering'
import { deposition } from './deposition'
import { fibrosing } from './fibrosing'
import { interfaceDermatitis } from './interface'
import { nodular } from './nodular'
import { panniculitis } from './panniculitis'
import { psoriasiform } from './psoriasiform'
import { spongiotic } from './spongiotic'
import { vascular } from './vascular'

export const DIAGNOSES: Diagnosis[] = [
  ...spongiotic,
  ...psoriasiform,
  ...interfaceDermatitis,
  ...vascular,
  ...nodular,
  ...blistering,
  ...adnexal,
  ...fibrosing,
  ...panniculitis,
  ...deposition,
]

export const findDiagnosis = (id: string) => DIAGNOSES.find((d) => d.id === id)

if (import.meta.env.DEV) {
  const patterns = new Set(PATTERNS.map((p) => p.id))
  const clinical = new Set(CLINICAL.map((c) => c.id))
  const histology = new Set(HISTOLOGY.map((h) => h.id))
  const seen = new Set<string>()
  for (const d of DIAGNOSES) {
    if (seen.has(d.id)) console.warn(`[inflammatory-skin] id repetido: ${d.id}`)
    seen.add(d.id)
    if (d.patterns.length === 0) console.warn(`[inflammatory-skin] ${d.id}: sem padrão`)
    for (const p of d.patterns) if (!patterns.has(p)) console.warn(`[inflammatory-skin] ${d.id}: padrão desconhecido "${p}"`)
    for (const c of d.clinical) if (!clinical.has(c)) console.warn(`[inflammatory-skin] ${d.id}: dado clínico desconhecido "${c}"`)
    for (const h of d.histology) if (!histology.has(h)) console.warn(`[inflammatory-skin] ${d.id}: achado desconhecido "${h}"`)
    for (const h of d.hallmarks ?? []) if (!d.histology.includes(h)) console.warn(`[inflammatory-skin] ${d.id}: hallmark "${h}" fora de histology`)
    for (const a of d.against ?? []) {
      if (!clinical.has(a) && !histology.has(a)) console.warn(`[inflammatory-skin] ${d.id}: "against" desconhecido "${a}"`)
      if (d.histology.includes(a) || d.clinical.includes(a)) console.warn(`[inflammatory-skin] ${d.id}: "${a}" está a favor e contra`)
    }
  }
}
