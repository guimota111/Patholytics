/* ==========================================================================
   H-score — soma ponderada da intensidade (0 a 300).
   H = 1×(% células 1+) + 2×(% 2+) + 3×(% 3+). Não há ponto de corte
   universal: cada marcador e cada estudo define o seu.
   ========================================================================== */

import type { Calculator } from '@/tools/stager/types'
import { numOf } from '@/tools/stager/types'
import { fmt } from '@/tools/suites/types'

const calculator: Calculator = {
  id: 'h-score',
  name: 'H-score',
  section: 'Semiquantificação',
  system: 'H-score (0–300)',
  reference: 'McCarty KS Jr et al. Arch Pathol Lab Med 1985; ASCO/CAP para RE/RP não usa H-score',
  summary: 'Porcentagem de células em cada intensidade (1+, 2+, 3+) convertida no escore de 0 a 300, com a distribuição para o laudo.',
  fields: [
    { id: 'p3', label: 'Células com marcação forte (3+), %', type: 'number', min: 0, max: 100, default: 0 },
    { id: 'p2', label: 'Células com marcação moderada (2+), %', type: 'number', min: 0, max: 100, default: 0 },
    { id: 'p1', label: 'Células com marcação fraca (1+), %', type: 'number', min: 0, max: 100, default: 0 },
    {
      id: 'marker', label: 'Marcador (opcional, só para o texto)', type: 'text', default: '',
      hint: 'Ex.: RE, RP, AR, EGFR, TROP2.',
    },
  ],
  compute: (v) => {
    const p3 = numOf(v.p3) ?? 0
    const p2 = numOf(v.p2) ?? 0
    const p1 = numOf(v.p1) ?? 0
    const sum = p1 + p2 + p3
    const warnings: string[] = []
    if (sum > 100) warnings.push(`As porcentagens somam ${fmt(sum)}% — o total das três intensidades não pode passar de 100%.`)
    const p0 = Math.max(0, 100 - sum)
    const h = Math.round(p1 + 2 * p2 + 3 * p3)
    const marker = String(v.marker ?? '').trim()
    const label = marker ? `${marker}: ` : ''
    return {
      tnm: [
        { k: 'H-score', v: sum > 100 ? null : String(h) },
        { k: 'Positivas', v: `${fmt(Math.min(100, sum))}%` },
        { k: 'Negativas (0)', v: `${fmt(p0)}%` },
      ],
      warnings,
      report:
        sum > 100
          ? ''
          : `${label}H-score ${h}/300 (3+: ${fmt(p3)}%; 2+: ${fmt(p2)}%; 1+: ${fmt(p1)}%; negativas: ${fmt(p0)}%).`,
    }
  },
}

export default calculator
