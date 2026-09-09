/* Máscara: fragmentos — quantidade, descrição, maior e menor. */

export interface Med2 {
  a: string
  b: string
}

export interface FragmentosData {
  quantidade: string
  descricao: string
  maior: Med2
  menor: Med2
}

const DESC_PLURAL = 'irregulares, elásticos e amarelados'
const DESC_SINGULAR = 'irregular, elástico e amarelado'

export const defaultFragmentosData = (): FragmentosData => ({
  quantidade: '',
  descricao: DESC_PLURAL,
  maior: { a: '', b: '' },
  menor: { a: '', b: '' },
})

/** Um único fragmento? Aceita "1", "01" e "um". */
export function fragmentoUnico(d: FragmentosData): boolean {
  const q = d.quantidade.trim().toLowerCase()
  return q === '1' || q === '01' || q === 'um'
}

export const fragmentosDescPadrao = (d: FragmentosData) => (fragmentoUnico(d) ? DESC_SINGULAR : DESC_PLURAL)

/** A descrição só é reescrita enquanto for uma das padrão. */
export function syncFragmentosDesc(d: FragmentosData): FragmentosData {
  const atual = d.descricao.trim()
  if (atual && atual !== DESC_PLURAL && atual !== DESC_SINGULAR) return d
  return { ...d, descricao: fragmentosDescPadrao(d) }
}

export function fmtMedidas2(m: Med2): string {
  const a = m.a.trim()
  const b = m.b.trim()
  if (!a && !b) return '[medidas] cm'
  return `${a || '_'} x ${b || '_'} cm`
}

export function buildFragmentosMacro(d: FragmentosData): string {
  const qtd = d.quantidade.trim() || '[quantidade]'
  const desc = d.descricao.trim()
  const unico = fragmentoUnico(d)
  let s = `${qtd} ${unico ? 'fragmento' : 'fragmentos'}`
  if (desc) s += ` ${desc}`
  s += unico ? `, medindo ${fmtMedidas2(d.maior)}.` : `, medindo o maior ${fmtMedidas2(d.maior)}, e o menor ${fmtMedidas2(d.menor)}.`
  return s
}
