/* ==========================================================================
   match.ts — ordena os verbetes pelo que o patologista marcou e explica o
   porquê de cada posição: o que bateu (padrão, clínica, achados, achados-
   chave), o que pesa contra, o que ele marcou e o verbete não prevê, e os
   achados-chave que ainda faltam procurar na lâmina.
   ========================================================================== */

import type { Diagnosis } from './types'

export interface CaseChoice {
  patterns: Set<string>
  clinical: Set<string>
  histology: Set<string>
  query: string
}

export interface Suggestion {
  diagnosis: Diagnosis
  score: number
  /** O padrão principal do verbete foi marcado. */
  primaryPattern: boolean
  patternHits: string[]
  clinicalHits: string[]
  /** Achados marcados que o verbete prevê (inclui os achados-chave). */
  histologyHits: string[]
  hallmarkHits: string[]
  /** Itens marcados que o verbete lista como "pesa contra". */
  contradictions: string[]
  /** Achados-chave do verbete ainda não marcados: o que procurar. */
  missingHallmarks: string[]
  /** Achados marcados que o verbete não prevê nem contraindica. */
  unexplained: string[]
  /** Fração dos itens marcados que este verbete explica (0 a 1). */
  coverage: number
}

const WEIGHT = {
  primaryPattern: 5,
  secondaryPattern: 3,
  patternMiss: -3,
  hallmark: 3,
  histology: 1.5,
  clinical: 1.2,
  against: -2.5,
  unexplained: -0.4,
  unexplainedCap: -3,
  frequency: 0.6,
}

export const normalize = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

const hits = (selected: Set<string>, expected: string[]) => expected.filter((id) => selected.has(id))

export function suggest(diagnoses: Diagnosis[], choice: CaseChoice): Suggestion[] {
  const q = normalize(choice.query.trim())
  const anyPattern = choice.patterns.size > 0
  const totalSelected = choice.patterns.size + choice.clinical.size + choice.histology.size
  const out: Suggestion[] = []

  for (const d of diagnoses) {
    if (q) {
      const hay = normalize([d.name, ...(d.aka ?? [])].join(' '))
      if (!hay.includes(q)) continue
    }

    const patternHits = hits(choice.patterns, d.patterns)
    const primaryPattern = choice.patterns.has(d.patterns[0])
    const clinicalHits = hits(choice.clinical, d.clinical)
    const histologyHits = hits(choice.histology, d.histology)
    const hallmarks = d.hallmarks ?? []
    const hallmarkHits = hits(choice.histology, hallmarks)
    const against = new Set(d.against ?? [])
    const contradictions = [...choice.clinical, ...choice.histology].filter((id) => against.has(id))
    const known = new Set([...d.histology, ...against])
    const unexplained = [...choice.histology].filter((id) => !known.has(id))
    const missingHallmarks = hallmarks.filter((id) => !choice.histology.has(id))

    // Sem busca por nome, algo relevante precisa combinar para o verbete aparecer.
    // Com um único item marcado (só a epidemiologia, por exemplo), basta ele bater.
    const other = clinicalHits.length + histologyHits.length
    const need = totalSelected <= 1 ? 1 : 2
    if (!q && totalSelected > 0 && patternHits.length === 0 && hallmarkHits.length === 0 && other < need) continue
    if (!q && totalSelected === 0) continue

    let score = 0
    if (primaryPattern) score += WEIGHT.primaryPattern
    else if (patternHits.length > 0) score += WEIGHT.secondaryPattern
    else if (anyPattern) score += WEIGHT.patternMiss
    score += hallmarkHits.length * WEIGHT.hallmark
    score += (histologyHits.length - hallmarkHits.length) * WEIGHT.histology
    score += clinicalHits.length * WEIGHT.clinical
    score += contradictions.length * WEIGHT.against
    score += Math.max(WEIGHT.unexplainedCap, unexplained.length * WEIGHT.unexplained)
    score += ((d.frequency ?? 2) - 2) * WEIGHT.frequency

    const explained = patternHits.length + clinicalHits.length + histologyHits.length
    const coverage = totalSelected === 0 ? 0 : explained / totalSelected

    out.push({ diagnosis: d, score, primaryPattern, patternHits, clinicalHits, histologyHits, hallmarkHits, contradictions, missingHallmarks, unexplained, coverage })
  }

  return out.sort(
    (a, b) => b.score - a.score || (b.diagnosis.frequency ?? 2) - (a.diagnosis.frequency ?? 2) || a.diagnosis.name.localeCompare(b.diagnosis.name, 'pt-BR'),
  )
}

export type CompareCell = 'hallmark' | 'yes' | 'against' | 'no'

export interface CompareRow {
  id: string
  selected: boolean
  cells: CompareCell[]
}

/**
 * Tabela lado a lado dos primeiros colocados: uma linha por achado-chave de
 * qualquer um deles, por achado marcado no caso e por achado que pese contra
 * algum deles. Linhas em que todos concordam vão para o fim, porque não
 * ajudam a separar.
 */
export function compare(suggestions: Suggestion[], selected: Set<string>): CompareRow[] {
  const ids = new Set<string>()
  for (const s of suggestions) {
    for (const h of s.diagnosis.hallmarks ?? []) ids.add(h)
    for (const a of s.diagnosis.against ?? []) ids.add(a)
  }
  for (const id of selected) ids.add(id)

  const rows: CompareRow[] = [...ids].map((id) => ({
    id,
    selected: selected.has(id),
    cells: suggestions.map((s) => {
      const d = s.diagnosis
      if (d.hallmarks?.includes(id)) return 'hallmark'
      if (d.against?.includes(id)) return 'against'
      if (d.histology.includes(id) || d.clinical.includes(id)) return 'yes'
      return 'no'
    }),
  }))

  const spread = (r: CompareRow) => new Set(r.cells).size
  return rows.sort((a, b) => spread(b) - spread(a) || Number(b.selected) - Number(a.selected))
}
