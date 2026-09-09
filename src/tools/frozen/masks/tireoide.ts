/* Máscara: tireoide — total ou parcial, com nódulos por região. */

import { capitalize, fmtMedidasPor } from '../text'

export type TireoideRegiao = 'direito' | 'istmo' | 'esquerdo'

export interface Nodulo {
  regiao: TireoideRegiao
  local: string
  med1: string
  med2: string
  desc: string
}

export interface Med3Por {
  c: string
  l: string
  ap: string
}

export interface TireoideData {
  resseccao: 'total' | 'parcial'
  ladoParcial: 'direito' | 'esquerdo'
  istmoParcial: boolean
  pesar: boolean
  peso: string
  tintaAnterior: string
  tintaPosterior: string
  lobos: Record<TireoideRegiao, Med3Por>
  nodulos: Nodulo[]
}

export const TIREOIDE_REGIOES: { key: TireoideRegiao; label: string; gen: string }[] = [
  { key: 'direito', label: 'Lobo direito', gen: 'lobo direito' },
  { key: 'istmo', label: 'Istmo', gen: 'istmo' },
  { key: 'esquerdo', label: 'Lobo esquerdo', gen: 'lobo esquerdo' },
]

export const emptyMed3Por = (): Med3Por => ({ c: '', l: '', ap: '' })

export function defaultTireoideData(): TireoideData {
  return {
    resseccao: 'total',
    ladoParcial: 'direito',
    istmoParcial: false,
    pesar: true,
    peso: '',
    tintaAnterior: '',
    tintaPosterior: '',
    lobos: { direito: emptyMed3Por(), istmo: emptyMed3Por(), esquerdo: emptyMed3Por() },
    nodulos: [],
  }
}

export const defaultNodulo = (regiao: TireoideRegiao): Nodulo => ({ regiao, local: '', med1: '', med2: '', desc: '' })

/** Regiões que existem na peça; na parcial vem o lobo e depois o istmo. */
export function tireoideRegioesAtivas(d: TireoideData) {
  if (d.resseccao !== 'parcial') return TIREOIDE_REGIOES
  const out = [TIREOIDE_REGIOES.find((r) => r.key === d.ladoParcial)!]
  if (d.istmoParcial) out.push(TIREOIDE_REGIOES.find((r) => r.key === 'istmo')!)
  return out
}

/** Nódulos presos a regiões que saíram da peça vão para a primeira ativa. */
export function sanitizeTireoideNodulos(d: TireoideData): TireoideData {
  const keys = tireoideRegioesAtivas(d).map((r) => r.key)
  return { ...d, nodulos: d.nodulos.map((n) => (keys.includes(n.regiao) ? n : { ...n, regiao: keys[0] })) }
}

function tireoidePecaDesc(d: TireoideData): string {
  if (d.resseccao !== 'parcial') return 'tireoide'
  const lado = d.ladoParcial === 'esquerdo' ? 'esquerdo' : 'direito'
  return `lobo ${lado} de tireoide${d.istmoParcial ? ' com istmo' : ''}`
}

export const tireoideNomePeca = (d: TireoideData) => capitalize(tireoidePecaDesc(d))

export function buildTireoideMacro(d: TireoideData): string {
  const ta = d.tintaAnterior.trim() || '[cor]'
  const tp = d.tintaPosterior.trim() || '[cor]'
  const lines: string[] = []
  let cabecalho = tireoidePecaDesc(d)
  if (d.pesar) cabecalho += ` pesando ${d.peso.trim() || '[peso]'} gramas`
  lines.push(`${cabecalho}. A peça foi pintada com tinta nanquim ${ta} em face anterior e ${tp} em face posterior.`)
  let contador = 0
  for (const reg of tireoideRegioesAtivas(d)) {
    const m = d.lobos[reg.key]
    const med = fmtMedidasPor([m.c, m.l, m.ap])
    const nods = d.nodulos.filter((n) => n.regiao === reg.key)
    if (nods.length) {
      const frases = nods.map((n) => {
        contador++
        const local = n.local.trim()
        const localFull = local ? `${local} do ${reg.gen}` : reg.gen
        return `Nódulo ${contador} em ${localFull} medindo ${n.med1.trim() || '[medida]'} por ${n.med2.trim() || '[medida]'} cm, ${n.desc.trim() || '[características]'}.`
      })
      lines.push(`${reg.label} mede ${med}. ${frases.join(' ')} Restante do parênquima acastanhado e homogêneo.`)
    } else {
      lines.push(`${reg.label} mede ${med}. Aos cortes apresenta parênquima acastanhado e homogêneo.`)
    }
  }
  return lines.join('\n')
}
