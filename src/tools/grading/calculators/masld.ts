/* ==========================================================================
   Esteatose hepática metabólica (MASLD/MASH) — NAS (NASH CRN) e SAF (FLIP).
   NAS = esteatose (0–3) + inflamação lobular (0–3) + balonização (0–2), 0–8,
   com fibrose à parte (0–4). SAF = S (0–3), A = balonização + inflamação
   lobular (0–4) e F; o algoritmo FLIP diz MASH quando S≥1, balonização ≥1 e
   inflamação ≥1. Na SAF a inflamação lobular vai só até 2 (0 = nenhum foco,
   1 = ≤2 focos por campo de 20×, 2 = >2), por isso o NAS 3 vira 2.
   ========================================================================== */

import type { Calculator, CalculatorResult } from '@/tools/stager/types'
import { strOf } from '@/tools/stager/types'

const FIB: Record<string, string> = {
  '0': 'sem fibrose',
  '1a': 'perissinusoidal leve, zona 3 (só ao tricrômico)',
  '1b': 'perissinusoidal moderada, zona 3',
  '1c': 'só portal/periportal',
  '2': 'perissinusoidal zona 3 + portal/periportal',
  '3': 'em ponte',
  '4': 'cirrose',
}

const calculator: Calculator = {
  id: 'masld-nas-saf',
  name: 'Fígado — MASLD: NAS e SAF',
  section: 'Fígado',
  system: 'NASH CRN (NAS) · SAF/FLIP',
  reference: 'Kleiner DE et al. Hepatology 2005; Bedossa P et al. Hepatology 2012 (SAF/FLIP); Brunt EM et al. Am J Gastroenterol 1999',
  summary: 'Esteatose, inflamação lobular, balonização e fibrose viram o NAS 0–8 e o código SAF, com o veredito de esteato-hepatite pelo algoritmo FLIP.',
  fields: [
    {
      id: 'steatosis', label: 'Esteatose (% de hepatócitos com gordura)', type: 'radio', default: '2',
      options: [
        { value: '0', label: '0 — <5%' },
        { value: '1', label: '1 — 5–33%' },
        { value: '2', label: '2 — 34–66%' },
        { value: '3', label: '3 — >66%' },
      ],
    },
    {
      id: 'inflammation', label: 'Inflamação lobular (focos por campo de 20×)', type: 'radio', default: '1',
      options: [
        { value: '0', label: '0 — nenhum' },
        { value: '1', label: '1 — <2 focos' },
        { value: '2', label: '2 — 2 a 4 focos' },
        { value: '3', label: '3 — >4 focos' },
      ],
    },
    {
      id: 'ballooning', label: 'Balonização hepatocelular', type: 'radio', default: '1',
      hint: 'Hepatócitos aumentados, arredondados, com citoplasma rarefeito; Mallory-Denk reforça. Não confundir com esteatose microvesicular.',
      options: [
        { value: '0', label: '0 — ausente' },
        { value: '1', label: '1 — poucas células' },
        { value: '2', label: '2 — muitas células / proeminente' },
      ],
    },
    {
      id: 'fibrosis', label: 'Fibrose (estádio NASH CRN)', type: 'select', default: '1a',
      options: Object.entries(FIB).map(([value, label]) => ({ value, label: `${value} — ${label}` })),
    },
  ],
  compute: (v): CalculatorResult => {
    const s = Number(strOf(v.steatosis))
    const i = Number(strOf(v.inflammation))
    const b = Number(strOf(v.ballooning))
    const fib = strOf(v.fibrosis)
    const nas = s + i + b
    const safI = Math.min(2, i)
    const safA = b + safI
    const fStage = fib.replace(/[abc]/, '')
    const mash = s >= 1 && b >= 1 && i >= 1
    const warnings: string[] = []
    if (s === 0) warnings.push('Esteatose <5%: não preenche o critério mínimo de esteatose hepática metabólica; se houver balonização e inflamação, pensar em esteato-hepatite em resolução ou outra etiologia.')
    warnings.push(`NAS ${nas}: ≥5 correlaciona com diagnóstico de esteato-hepatite e ≤2 com sua ausência, mas o NAS mede atividade, não faz o diagnóstico — o veredito acima é do algoritmo FLIP.`)
    if (fStage === '3' || fStage === '4') warnings.push('Fibrose avançada (F3–F4) é o principal preditor de desfecho; em cirrose a esteatose pode desaparecer ("cirrose criptogênica").')
    return {
      tnm: [
        { k: 'NAS', v: `${nas}/8` },
        { k: 'SAF', v: `S${s}A${safA}F${fStage}` },
        { k: 'Fibrose', v: fib },
        { k: 'FLIP', v: mash ? 'esteato-hepatite' : s >= 1 ? 'esteatose sem MASH' : '—' },
      ],
      warnings,
      report: `${mash ? 'Esteato-hepatite metabólica (MASH)' : s >= 1 ? 'Esteatose hepática metabólica sem esteato-hepatite' : 'Sem esteatose significativa'}. NAS ${nas}/8 (esteatose ${s}, inflamação lobular ${i}, balonização ${b}); fibrose estádio ${fib} (${FIB[fib]}). SAF: S${s}A${safA}F${fStage}.`,
    }
  },
}

export default calculator
