/* ==========================================================================
   Grau histológico de Nottingham (Elston–Ellis) — carcinoma invasor da mama.
   Túbulos + pleomorfismo nuclear + mitoses, cada um 1–3; total 3–5 = grau 1,
   6–7 = grau 2, 8–9 = grau 3.
   O escore mitótico depende da área do campo: os limiares originais (≤9,
   10–19, ≥20 por 10 campos) valem para o campo de 0,59 mm de diâmetro
   (0,274 mm²); aqui eles são reescalados pela área do seu campo, que é o que a
   tabela do CAP faz. Também aceita mitoses por mm², como o WHO 2019 pede.
   ========================================================================== */

import type { Calculator, CalculatorResult } from '@/tools/stager/types'
import { numOf, strOf } from '@/tools/stager/types'
import { fmt } from '@/tools/suites/types'

/**
 * Limiares por mm²: 10 e 20 mitoses por 10 campos de 0,274 mm² (2,74 mm²).
 * Reproduz a tabela do CAP: campo de 0,40 mm → ≤4 / 5–9 / ≥10; de 0,50 mm →
 * ≤7 / 8–14 / ≥15; de 0,59 mm → ≤9 / 10–19 / ≥20.
 */
const T1_PER_MM2 = 10 / 2.74
const T2_PER_MM2 = 20 / 2.74
/** Menor contagem inteira em 10 campos que atinge o limiar. */
const minCount = (threshold: number, area10: number) => Math.ceil(threshold * area10 - 1e-9)

const calculator: Calculator = {
  id: 'nottingham',
  name: 'Mama — grau de Nottingham',
  section: 'Mama',
  system: 'Elston–Ellis · CAP · WHO 2019',
  reference: 'Elston CW, Ellis IO. Histopathology 1991; CAP Breast Invasive protocol; WHO Breast Tumours 5ª ed.',
  summary: 'Túbulos, pleomorfismo e mitoses (por 10 campos com o diâmetro do seu campo, ou por mm²) somam o grau 1, 2 ou 3.',
  fields: [
    {
      id: 'tubules', label: 'Formação tubular / glandular', type: 'radio', default: '2',
      options: [
        { value: '1', label: '1 — mais de 75% do tumor' },
        { value: '2', label: '2 — 10% a 75%' },
        { value: '3', label: '3 — menos de 10%' },
      ],
    },
    {
      id: 'pleo', label: 'Pleomorfismo nuclear', type: 'radio', default: '2',
      hint: 'Compare com o núcleo do epitélio normal: 1 = pequeno, regular, uniforme; 2 = aumento moderado, nucléolo visível; 3 = marcado, vesicular, nucléolo proeminente.',
      options: [
        { value: '1', label: '1 — leve' },
        { value: '2', label: '2 — moderado' },
        { value: '3', label: '3 — acentuado' },
      ],
    },
    {
      id: 'mode', label: 'Como você contou as mitoses', type: 'radio', default: 'hpf',
      options: [
        { value: 'hpf', label: 'Por 10 campos de grande aumento' },
        { value: 'mm2', label: 'Por mm²' },
      ],
    },
    {
      id: 'count', label: 'Mitoses em 10 campos, na periferia mais ativa', type: 'number', min: 0, default: 8,
      when: (v) => strOf(v.mode) === 'hpf',
    },
    {
      id: 'diameter', label: 'Diâmetro do campo de 40×, mm', type: 'number', min: 0.1, max: 1, default: 0.55,
      hint: 'Número de campo da ocular ÷ aumento da objetiva (ex.: 22/40 = 0,55). O Conversor de campos calcula isso.',
      when: (v) => strOf(v.mode) === 'hpf',
    },
    {
      id: 'perMm2', label: 'Mitoses por mm²', type: 'number', min: 0, default: 3,
      when: (v) => strOf(v.mode) === 'mm2',
    },
  ],
  compute: (v): CalculatorResult => {
    const tubules = Number(strOf(v.tubules))
    const pleo = Number(strOf(v.pleo))
    const warnings: string[] = []
    let density: number | null = null
    let mitoticText = ''

    if (strOf(v.mode) === 'hpf') {
      const count = numOf(v.count)
      const d = numOf(v.diameter)
      if (count === null || d === null || d <= 0) return { report: '' }
      const area10 = 10 * Math.PI * (d / 2) ** 2
      density = count / area10
      const s2 = minCount(T1_PER_MM2, area10)
      const s3 = minCount(T2_PER_MM2, area10)
      mitoticText = `${count} mitoses/10 campos (campo de ${fmt(d, 2)} mm; ${fmt(density)}/mm²)`
      warnings.push(`Para o seu campo (${fmt(area10, 2)} mm² em 10 campos): escore 1 até ${s2 - 1}, escore 2 de ${s2} a ${s3 - 1}, escore 3 a partir de ${s3} mitoses — os mesmos números da tabela do CAP para este diâmetro.`)
    } else {
      density = numOf(v.perMm2)
      if (density === null) return { report: '' }
      mitoticText = `${fmt(density)} mitoses/mm²`
    }

    const mitoses = density < T1_PER_MM2 ? 1 : density < T2_PER_MM2 ? 2 : 3
    const total = tubules + pleo + mitoses
    const grade = total <= 5 ? 1 : total <= 7 ? 2 : 3
    return {
      tnm: [
        { k: 'Grau', v: `${grade} de 3` },
        { k: 'Escore', v: `${total}/9` },
        { k: 'Túbulos', v: String(tubules) },
        { k: 'Pleomorfismo', v: String(pleo) },
        { k: 'Mitoses', v: String(mitoses) },
        { k: 'Mitoses/mm²', v: fmt(density) },
      ],
      warnings,
      report: `Grau histológico de Nottingham: ${grade} (escore ${total}/9 — formação tubular ${tubules}, pleomorfismo nuclear ${pleo}, índice mitótico ${mitoses}: ${mitoticText}).`,
    }
  },
}

export default calculator
