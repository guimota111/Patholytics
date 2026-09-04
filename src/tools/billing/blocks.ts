/* ==========================================================================
   blocks.ts — o que se acrescenta ao caso além da peça: congelação, PAAF,
   imuno, colorações, revisão, molecular e microscopia eletrônica. Cada
   bloco tem poucos campos e sabe se cobrar sozinho.
   ========================================================================== */

import { Atom, ClipboardList, Dna, Layers, Palette, Snowflake, Syringe, type LucideIcon } from 'lucide-react'
import type { CodeKey } from './codes'

export type ParamValue = number | string | number[]
export type Params = Record<string, ParamValue>

export interface LineItem {
  code: CodeKey
  qty: number
  /** Por que esta linha existe ("por margem", "cada 6 linfonodos"…). */
  reason: string
}

export interface Computed {
  items: LineItem[]
  /** Tetos aplicados ou coisas a conferir. */
  warnings: string[]
  /** A regra que justifica, para quem quiser conferir. */
  rule: string
}

export const num = (p: Params, key: string, fallback = 0): number => {
  const v = p[key]
  return typeof v === 'number' && Number.isFinite(v) ? v : fallback
}
export const text = (p: Params, key: string): string => (typeof p[key] === 'string' ? (p[key] as string) : '')
export const numList = (p: Params, key: string): number[] => (Array.isArray(p[key]) ? (p[key] as number[]) : [])
const on = (p: Params, key: string): boolean => num(p, key) >= 1

/** A linha só entra na conta se a quantidade for positiva. */
export const line = (code: CodeKey, qty: number, reason: string): LineItem[] =>
  qty > 0 ? [{ code, qty: Math.floor(qty), reason }] : []

export const ceilDiv = (a: number, b: number) => Math.ceil(a / b)

/* ---------------------------------------------------------------- campos */

interface FieldBase {
  key: string
  label: string
  hint?: string
  /** Campo que só aparece em certas respostas. */
  when?: (p: Params) => boolean
}

export type Field = FieldBase &
  (
    | { kind: 'count'; default: number; min?: number; max?: number }
    | { kind: 'toggle'; default: 0 | 1; yes: string; no: string }
    | { kind: 'choice'; default: string; options: { value: string; label: string; hint?: string }[] }
    /** Uma contagem por unidade: as lâminas de cada lesão puncionada. */
    | { kind: 'perUnit'; unitKey: string; itemLabel: string; default: number }
  )

export type BlockId = 'congelacao' | 'paaf' | 'ihq' | 'coloracao' | 'revisao' | 'molecular' | 'me'

export interface Block {
  id: BlockId
  label: string
  /** Uma linha, no máximo — o resto fica escondido. */
  blurb: string
  icon: LucideIcon
  fields: Field[]
  compute: (p: Params) => Computed
}

export const BLOCKS: Block[] = [
  {
    id: 'ihq',
    label: 'Imuno-histoquímica',
    blurb: 'Painel de 2 a 5 anticorpos, ou reação isolada.',
    icon: Layers,
    fields: [{ kind: 'count', key: 'anticorpos', label: 'Anticorpos realizados', default: 5, min: 1, max: 40 }],
    compute: (p) => {
      const total = Math.max(1, num(p, 'anticorpos', 1))
      let paineis = Math.floor(total / 5)
      const resto = total % 5
      let isoladas = 0
      if (resto === 1) isoladas = 1
      else if (resto >= 2) paineis += 1
      return {
        items: [...line('ihqPainel', paineis, 'painel de 2 a 5 anticorpos'), ...line('ihqIsolada', isoladas, 'anticorpo que sobrou sozinho')],
        warnings: [],
        rule: 'Cap. X — 17-0 painel (2 a 5 reações), 18-8 reação isolada. 8 anticorpos = 2 painéis (5 + 3); 6 anticorpos = 1 painel + 1 isolada.',
      }
    },
  },
  {
    id: 'coloracao',
    label: 'Colorações especiais',
    blurb: 'PAS, Grocott, Giemsa, tricrômico, retículo.',
    icon: Palette,
    fields: [{ kind: 'count', key: 'coloracoes', label: 'Colorações realizadas', hint: 'A mesma coloração em blocos diferentes conta duas vezes.', default: 1, min: 1 }],
    compute: (p) => ({
      items: line('coloracaoEspecial', Math.max(1, num(p, 'coloracoes', 1)), 'por coloração realizada'),
      warnings: [],
      rule: 'Cap. IX — 26-9 a cada coloração feita. Giemsa no antro e no corpo = 2; BAAR + fungos = 2.',
    }),
  },
  {
    id: 'congelacao',
    label: 'Congelação',
    blurb: 'Exame per operatório, durante a cirurgia.',
    icon: Snowflake,
    fields: [
      { kind: 'toggle', key: 'deslocamento', label: 'Você foi até o hospital?', default: 0, yes: 'Sim, houve deslocamento', no: 'Não, foi no laboratório' },
      { kind: 'count', key: 'adicionais', label: 'Espécimes ou margens além do primeiro', hint: 'A cartilha cobra até 5.', default: 0 },
    ],
    compute: (p) => {
      const extras = num(p, 'adicionais')
      return {
        items: [
          ...line(on(p, 'deslocamento') ? 'congelacaoCom' : 'congelacaoSem', 1, 'primeiro espécime'),
          ...line('congelacaoAdicional', Math.min(extras, 5), 'por espécime adicional ou margem'),
        ],
        warnings: extras > 5 ? [`A congelação cobra no máximo 5 adicionais — foram contados 5 dos ${extras}.`] : [],
        rule: 'Cap. IV — 01-3 sem deslocamento, 03-0 com deslocamento (primeiro espécime); 02-1 por peça adicional ou margem, até 5. Os cortes de parafina depois são cobrados à parte, como peça.',
      }
    },
  },
  {
    id: 'paaf',
    label: 'PAAF (punção)',
    blurb: 'O ato de puncionar e a citologia do material.',
    icon: Syringe,
    fields: [
      {
        kind: 'choice',
        key: 'profundidade',
        label: 'A punção foi de quê?',
        default: 'superficial',
        options: [
          { value: 'superficial', label: 'Superficial', hint: 'Tireoide, mama, linfonodo palpável, salivar.' },
          { value: 'profunda', label: 'Profunda', hint: 'Órgão interno, guiada por imagem.' },
        ],
      },
      { kind: 'toggle', key: 'deslocamento', label: 'Você foi até o local?', default: 0, yes: 'Sim, houve deslocamento', no: 'Não' },
      { kind: 'count', key: 'lesoes', label: 'Lesões puncionadas', hint: 'Nódulos ou quadrantes diferentes são punções diferentes.', default: 1, min: 1, max: 12 },
      { kind: 'perUnit', key: 'laminas', unitKey: 'lesoes', itemLabel: 'Lâminas da lesão', label: 'Lâminas de cada lesão', default: 5 },
      { kind: 'count', key: 'cellBlocks', label: 'Cell blocks', default: 0 },
    ],
    compute: (p) => {
      const superficial = text(p, 'profundidade') !== 'profunda'
      const desloc = on(p, 'deslocamento')
      const lesoes = Math.max(1, num(p, 'lesoes', 1))
      const laminas = numList(p, 'laminas').slice(0, lesoes)
      const citoQty = laminas.reduce((sum, q) => sum + ceilDiv(Math.max(1, q), 5), 0)
      const first: CodeKey = desloc ? (superficial ? 'paafSupCom' : 'paafProfCom') : superficial ? 'paafSupSem' : 'paafProfSem'
      const rest: CodeKey = superficial ? 'paafSupSem' : 'paafProfSem'
      return {
        items: [
          ...line(first, 1, desloc ? 'primeira lesão, com deslocamento' : 'primeira lesão'),
          ...line(rest, lesoes - 1, 'demais lesões'),
          ...line('citoPaaf', citoQty, 'citologia: 1 a cada 5 lâminas de cada lesão'),
          ...line('biopsiaSimples', num(p, 'cellBlocks'), 'cell block'),
        ],
        warnings: [],
        rule: 'Cap. V — 07-2 / 08-0 sem deslocamento (superficial / profunda), 09-9 / 10-2 com deslocamento e só na primeira lesão. O ato de puncionar não inclui a leitura: a citologia vai em 25-0, um a cada 5 lâminas de cada lesão; cell block em 11-0.',
      }
    },
  },
  {
    id: 'revisao',
    label: 'Revisão e cortes seriados',
    blurb: 'Caso de fora, ou estudo seriado protocolar.',
    icon: ClipboardList,
    fields: [
      { kind: 'count', key: 'itens', label: 'Itens do mapa de clivagem revisados', hint: 'As letras do laudo original: A, B, C…', default: 1 },
      { kind: 'count', key: 'seriados', label: 'Estudos seriados protocolares', hint: 'Cone, linfonodo sentinela.', default: 0 },
    ],
    compute: (p) => ({
      items: [
        ...line('revisao', num(p, 'itens'), 'por item do mapa de clivagem'),
        ...line('revisao', num(p, 'seriados'), 'por estudo seriado protocolar'),
      ],
      warnings: [],
      rule: 'Cap. VIII — 15-3 por revisão, valorada item a item do mapa de clivagem; também para cortes seriados protocolares (cone, sentinela) e cortes semifinos sem microscopia eletrônica. Reclive entra à parte.',
    }),
  },
  {
    id: 'molecular',
    label: 'Molecular e imunofluorescência',
    blurb: 'Captura híbrida, in situ, citometria, MSI.',
    icon: Dna,
    fields: [
      {
        kind: 'choice',
        key: 'tecnica',
        label: 'Qual técnica?',
        default: 'capturaHibrida',
        options: [
          { value: 'capturaHibrida', label: 'Captura híbrida', hint: 'HPV alto e baixo risco = 2.' },
          { value: 'hibridizacaoInSitu', label: 'Hibridização in situ' },
          { value: 'imunofluorescencia', label: 'Imunofluorescência' },
          { value: 'citometriaFluxo', label: 'Citometria de fluxo', hint: 'Por monoclonal pesquisado.' },
          { value: 'citometriaImagens', label: 'Citometria de imagens' },
          { value: 'msi', label: 'MSI por PCR' },
          { value: 'dnaCitometria', label: 'DNA citometria de fluxo' },
        ],
      },
      { kind: 'count', key: 'unidades', label: 'Sondas, marcadores ou agentes', default: 1, min: 1 },
    ],
    compute: (p) => ({
      items: line((text(p, 'tecnica') || 'capturaHibrida') as CodeKey, Math.max(1, num(p, 'unidades', 1)), 'por sonda, marcador ou agente'),
      warnings: [],
      rule: 'Cap. XII — um código por sonda, marcador ou agente pesquisado: 29-3 captura híbrida, 28-5 in situ, 27-7 imunofluorescência, 30-7 citometria de fluxo, 31-5 de imagens, 43-9 MSI, 38-2 DNA citometria.',
    }),
  },
  {
    id: 'me',
    label: 'Microscopia eletrônica',
    blurb: 'Por espécime, com documentação fotográfica.',
    icon: Atom,
    fields: [{ kind: 'count', key: 'especimes', label: 'Espécimes analisados', default: 1, min: 1 }],
    compute: (p) => ({
      items: line('microscopiaEletronica', Math.max(1, num(p, 'especimes', 1)), 'por espécime'),
      warnings: [],
      rule: 'Cap. XI — 06-4 por espécime analisado, incluindo a documentação fotográfica.',
    }),
  },
]

export const BLOCK_BY_ID: Record<BlockId, Block> = Object.fromEntries(BLOCKS.map((b) => [b.id, b])) as Record<BlockId, Block>

/** Campos visíveis para as respostas atuais (alguns só aparecem depois). */
export const visibleFields = (block: Block, p: Params): Field[] => block.fields.filter((f) => !f.when || f.when(p))

export function defaultParams(id: BlockId): Params {
  const p: Params = {}
  const block = BLOCK_BY_ID[id]
  for (const f of block.fields) if (f.kind !== 'perUnit') p[f.key] = f.default
  for (const f of block.fields) {
    if (f.kind === 'perUnit') p[f.key] = Array.from({ length: Math.max(0, num(p, f.unitKey, 1)) }, () => f.default)
  }
  return p
}

/** Mantém a lista por unidade do tamanho certo quando a contagem muda. */
export function syncPerUnit(id: BlockId, p: Params): Params {
  let out = p
  for (const f of BLOCK_BY_ID[id].fields) {
    if (f.kind !== 'perUnit') continue
    const want = Math.max(0, num(out, f.unitKey, 0))
    const have = numList(out, f.key)
    if (have.length === want) continue
    out = { ...out, [f.key]: Array.from({ length: want }, (_, i) => have[i] ?? f.default) }
  }
  return out
}

export const computeBlock = (id: BlockId, p: Params): Computed => BLOCK_BY_ID[id].compute(p)
