/* ==========================================================================
   masks/index.ts — registro das máscaras e o despacho por tipo. Uma máscara
   nova entra aqui: default, macroscopia e, se souber, nome da peça,
   cassetes e resultado.
   ========================================================================== */

import { casseteFaixa } from '../text'
import type { Cassete } from '../types'
import { buildFragmentosMacro, defaultFragmentosData, type FragmentosData } from './fragmentos'
import { buildLinfonodoMacro, defaultLinfonodoData, linfonodoCassetes, linfonodoNomePeca, linfonodoResultado, type LinfonodoData } from './linfonodo'
import { buildMamaMacro, defaultMamaData, mamaNomePeca, type MamaData } from './mama'
import { buildTireoideMacro, defaultTireoideData, tireoideNomePeca, type TireoideData } from './tireoide'

export type MaskKind = 'tireoide' | 'mama' | 'linfonodo' | 'fragmentos'

export type MaskState =
  | { kind: 'tireoide'; data: TireoideData }
  | { kind: 'mama'; data: MamaData }
  | { kind: 'linfonodo'; data: LinfonodoData }
  | { kind: 'fragmentos'; data: FragmentosData }

export const MASKS: { kind: MaskKind; label: string; icon: string }[] = [
  { kind: 'tireoide', label: 'Tireoide', icon: '🦋' },
  { kind: 'mama', label: 'Mama', icon: '🎀' },
  { kind: 'linfonodo', label: 'Linfonodo sentinela', icon: '🫧' },
  { kind: 'fragmentos', label: 'Fragmentos', icon: '🧫' },
]

export function defaultMask(kind: MaskKind): MaskState {
  switch (kind) {
    case 'tireoide':
      return { kind, data: defaultTireoideData() }
    case 'mama':
      return { kind, data: defaultMamaData() }
    case 'linfonodo':
      return { kind, data: defaultLinfonodoData() }
    case 'fragmentos':
      return { kind, data: defaultFragmentosData() }
  }
}

export function maskMacro(m: MaskState): string {
  switch (m.kind) {
    case 'tireoide':
      return buildTireoideMacro(m.data)
    case 'mama':
      return buildMamaMacro(m.data)
    case 'linfonodo':
      return buildLinfonodoMacro(m.data)
    case 'fragmentos':
      return buildFragmentosMacro(m.data)
  }
}

/** Nome sugerido para a peça; vazio = topografia preenchida pelo usuário. */
export function maskNomePeca(m: MaskState): string {
  if (m.kind === 'tireoide') return tireoideNomePeca(m.data)
  if (m.kind === 'mama') return mamaNomePeca()
  if (m.kind === 'linfonodo') return linfonodoNomePeca(m.data)
  return ''
}

export const maskCassetes = (m: MaskState): Cassete[] | null => (m.kind === 'linfonodo' ? linfonodoCassetes(m.data) : null)

export const maskResultado = (m: MaskState): string => (m.kind === 'linfonodo' ? linfonodoResultado(m.data) : '')

/** Prévia: a macroscopia e, quando a máscara também os preenche, cassetes e resultado. */
export function maskPreview(m: MaskState, letter: string): string {
  const macro = maskMacro(m)
  const cassetes = maskCassetes(m)
  const resultado = maskResultado(m)
  if (!cassetes && !resultado) return macro
  const lines = [macro]
  if (cassetes && cassetes.length) {
    lines.push('')
    for (const c of cassetes) lines.push(`${casseteFaixa(letter, c)} – ${c.descricao}`)
  }
  if (resultado) lines.push('', 'Resultado do exame de congelação', `- ${resultado}`)
  return lines.join('\n')
}
