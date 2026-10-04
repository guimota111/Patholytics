/* ==========================================================================
   Receptores hormonais (RE/RP) — escore de Allred e categoria ASCO/CAP 2020.
   Allred = escore de proporção (0–5) + escore de intensidade (0–3); ≥3 é
   positivo. ASCO/CAP 2020: <1% negativo; 1–10% "baixo positivo"; >10% positivo.
   ========================================================================== */

import type { Calculator } from '@/tools/stager/types'
import { numOf, strOf } from '@/tools/stager/types'
import { fmt } from '@/tools/suites/types'

function proportionScore(pct: number): number {
  if (pct <= 0) return 0
  if (pct < 1) return 1
  if (pct <= 10) return 2
  if (pct <= 33) return 3
  if (pct <= 66) return 4
  return 5
}

const INTENSITY = ['negativa', 'fraca', 'moderada', 'forte']

const calculator: Calculator = {
  id: 'allred',
  name: 'Receptores hormonais — Allred e ASCO/CAP',
  section: 'Receptores hormonais',
  system: 'Allred (0–8) · ASCO/CAP 2020',
  reference: 'Allred DC et al. Mod Pathol 1998; Allison KH et al. ASCO/CAP guideline update, Arch Pathol Lab Med 2020',
  summary: 'Da porcentagem de núcleos positivos e da intensidade saem o escore de Allred e a categoria ASCO/CAP (negativo, baixo positivo, positivo).',
  fields: [
    {
      id: 'receptor', label: 'Receptor', type: 'radio', default: 'RE',
      options: [
        { value: 'RE', label: 'Receptor de estrogênio (RE)' },
        { value: 'RP', label: 'Receptor de progesterona (RP)' },
      ],
    },
    {
      id: 'pct', label: 'Núcleos tumorais positivos, %', type: 'number', min: 0, max: 100, default: 90,
      hint: 'Qualquer intensidade conta. Use 0,5 para "menos de 1%, mas presente".',
    },
    {
      id: 'intensity', label: 'Intensidade predominante', type: 'radio', default: '3',
      options: [
        { value: '0', label: '0 — nenhuma' },
        { value: '1', label: '1 — fraca' },
        { value: '2', label: '2 — moderada' },
        { value: '3', label: '3 — forte' },
      ],
    },
    {
      id: 'control', label: 'Controle interno (epitélio normal) marcou?', type: 'radio', default: 'yes',
      options: [
        { value: 'yes', label: 'Sim' },
        { value: 'no', label: 'Não / ausente' },
      ],
    },
  ],
  compute: (v) => {
    const pct = numOf(v.pct)
    const intensity = Number(strOf(v.intensity))
    const receptor = strOf(v.receptor)
    const warnings: string[] = []
    if (pct === null) return { report: '', warnings }
    const ps = proportionScore(pct)
    const is = ps === 0 ? 0 : intensity
    const total = ps === 0 ? 0 : ps + is
    if (pct > 0 && intensity === 0) warnings.push('Há células positivas com intensidade "nenhuma": ajuste a intensidade ou a porcentagem.')
    if (strOf(v.control) === 'no' && pct < 1) {
      warnings.push('Resultado negativo sem controle interno positivo: o ASCO/CAP pede repetir ou testar em outro bloco antes de laudar como negativo.')
    }
    const category = pct < 1 ? 'negativo' : pct <= 10 ? 'baixo positivo' : 'positivo'
    if (category === 'baixo positivo') {
      warnings.push('ASCO/CAP 2020: 1–10% é "RE baixo positivo" — o laudo deve trazer o comentário padronizado sobre benefício endócrino limitado.')
    }
    return {
      tnm: [
        { k: 'Allred', v: `${total}/8` },
        { k: 'Proporção', v: String(ps) },
        { k: 'Intensidade', v: String(is) },
        { k: 'ASCO/CAP', v: category },
      ],
      warnings,
      report: `${receptor}: ${category} — ${fmt(pct)}% dos núcleos tumorais, intensidade ${INTENSITY[is]} (escore de Allred ${total}/8: proporção ${ps}, intensidade ${is}).`,
    }
  },
}

export default calculator
