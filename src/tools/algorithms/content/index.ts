/* ==========================================================================
   content/index.ts — junta os algoritmos num só catálogo e, em
   desenvolvimento, confere que cada perfil só cita perguntas e opções que
   existem, que o esquema só aponta para entidades e perguntas conhecidas,
   e que as fontes citadas foram declaradas. Um erro de digitação aqui
   silenciaria uma resposta sem ninguém perceber.
   ========================================================================== */

import type { Algorithm } from '../types'
import { renalOncocytic } from './renalOncocytic'

export const ALGORITHMS: Algorithm[] = [renalOncocytic]

export const findAlgorithm = (id: string | null | undefined) => ALGORITHMS.find((a) => a.id === id) ?? null

if (import.meta.env.DEV) {
  for (const a of ALGORITHMS) {
    const questions = new Map(a.questions.map((q) => [q.id, new Set(q.options.map((o) => o.id))]))
    const entities = new Set(a.entities.map((e) => e.id))
    const sources = new Set(a.sources.map((s) => s.id))
    const seen = new Set<string>()
    for (const e of a.entities) {
      if (seen.has(e.id)) console.warn(`[algorithms] ${a.id}: entidade repetida "${e.id}"`)
      seen.add(e.id)
      for (const [q, opts] of Object.entries(e.profile)) {
        const known = questions.get(q)
        if (!known) {
          console.warn(`[algorithms] ${a.id}/${e.id}: pergunta desconhecida "${q}"`)
          continue
        }
        for (const o of Object.keys(opts)) if (!known.has(o)) console.warn(`[algorithms] ${a.id}/${e.id}: opção desconhecida "${q}.${o}"`)
      }
      for (const s of e.sources) if (!sources.has(s)) console.warn(`[algorithms] ${a.id}/${e.id}: fonte desconhecida "${s}"`)
    }
    for (const g of a.schema)
      for (const b of g.branches) {
        for (const c of b.when) {
          const known = questions.get(c.question)
          if (!known) console.warn(`[algorithms] ${a.id}/ramo ${b.id}: pergunta desconhecida "${c.question}"`)
          else for (const o of c.options) if (!known.has(o)) console.warn(`[algorithms] ${a.id}/ramo ${b.id}: opção desconhecida "${c.question}.${o}"`)
        }
        for (const l of b.leads) if (!entities.has(l)) console.warn(`[algorithms] ${a.id}/ramo ${b.id}: entidade desconhecida "${l}"`)
      }
  }
}
