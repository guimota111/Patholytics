/* ==========================================================================
   types.ts — manual de macroscopia: sistemas (Gastrointestinal, Mama…) e, dentro
   deles, um roteiro por peça. Cada roteiro é uma sequência de passos, e cada
   passo tem um texto e, opcionalmente, uma foto da bancada.

   A árvore mora numa coleção só, como o arquivo de laudos: um documento por
   nó, apontando para o pai. Sistema tem `parentId` vazio; roteiro aponta para
   o sistema.
   ========================================================================== */

import type { DocumentData, Timestamp } from 'firebase/firestore'

export type NodeKind = 'system' | 'protocol'

export interface Step {
  id: string
  /** Texto do passo no dialeto do `richtext.tsx` (## título, - item, **negrito**). */
  text: string
  /** Foto do passo como data URL. Vazio quando o passo é só texto. */
  image: string
  /** Legenda da foto. */
  caption: string
}

export interface GuideNode {
  id: string
  kind: NodeKind
  /** Vazio nos sistemas; id do sistema nos roteiros. */
  parentId: string
  name: string
  /** Chave do ícone — ver ICONS em `catalog.ts`. */
  icon: string
  /** Cor de acento do sistema (hex). Vazio nos roteiros. */
  color: string
  description: string
  steps: Step[]
  order: number
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}

export const MAX_STEPS = 60
export const MAX_NAME = 120
export const MAX_STEP_TEXT = 8000
/** Teto por documento do Firestore é 1 MiB; a foto é o que pesa. */
export const MAX_IMAGE_BYTES = 700_000

const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback)
const num = (v: unknown, fallback = 0): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback)

export function sanitizeStep(raw: unknown, index: number): Step {
  const p = (raw ?? {}) as Partial<Step>
  return {
    id: str(p.id) || `s${index}`,
    text: str(p.text).slice(0, MAX_STEP_TEXT),
    image: str(p.image).startsWith('data:image/') ? p.image! : '',
    caption: str(p.caption).slice(0, 200),
  }
}

export function sanitizeNode(id: string, raw: DocumentData): GuideNode {
  const kind: NodeKind = raw.kind === 'protocol' ? 'protocol' : 'system'
  const steps = Array.isArray(raw.steps) ? raw.steps.slice(0, MAX_STEPS).map(sanitizeStep) : []
  return {
    id,
    kind,
    parentId: str(raw.parentId),
    name: str(raw.name).slice(0, MAX_NAME),
    icon: str(raw.icon, 'clipboardList'),
    color: str(raw.color),
    description: str(raw.description).slice(0, 400),
    steps,
    order: num(raw.order),
    createdAt: (raw.createdAt as Timestamp) ?? null,
    updatedAt: (raw.updatedAt as Timestamp) ?? null,
  }
}

export interface GuideTreeIndex {
  systems: GuideNode[]
  /** Roteiros de cada sistema, na ordem. */
  protocolsBySystem: Map<string, GuideNode[]>
  byId: Map<string, GuideNode>
}

export function buildTree(nodes: GuideNode[]): GuideTreeIndex {
  const byId = new Map(nodes.map((node) => [node.id, node]))
  const systems = nodes
    .filter((node) => node.kind === 'system')
    .sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
  const protocolsBySystem = new Map<string, GuideNode[]>()
  for (const node of nodes) {
    if (node.kind !== 'protocol') continue
    const list = protocolsBySystem.get(node.parentId) ?? []
    list.push(node)
    protocolsBySystem.set(node.parentId, list)
  }
  for (const list of protocolsBySystem.values()) {
    list.sort((a, b) => a.order - b.order || a.name.localeCompare(b.name))
  }
  return { systems, protocolsBySystem, byId }
}

/** Quantos passos já têm alguma coisa escrita — o que a lista mostra como progresso. */
export const filledSteps = (node: GuideNode): number =>
  node.steps.filter((step) => step.text.trim() || step.image).length

export interface GuideExport {
  tool: 'patholytics.macroscopy'
  version: 1
  nodes: Omit<GuideNode, 'createdAt' | 'updatedAt'>[]
}
