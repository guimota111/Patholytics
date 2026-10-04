/* ==========================================================================
   copy.ts — trazer um laudo do catálogo para a biblioteca do usuário.

   A cópia é uma máscara nova, e é esse o ponto: cada serviço tem o seu jeito
   de escrever, e o texto vai ser adaptado. O que não se perde é de quem veio —
   `sourceCredit` sobrevive a qualquer edição da cópia.
   ========================================================================== */

import { createNode, librarySpace } from './service'
import { HOUSE_CREDIT, type ArchiveNode } from './types'

/** O crédito a exibir por um nó do catálogo. */
export const creditOf = (node: ArchiveNode) => node.authorName || HOUSE_CREDIT

export async function copyToLibrary(uid: string, node: ArchiveNode, parentId: string): Promise<string> {
  return createNode(librarySpace(uid), {
    parentId,
    type: node.type,
    label: node.label,
    content: node.content,
    tags: node.tags,
    favorite: true,
    source: { id: node.id, credit: creditOf(node) },
  })
}

/** Uma cópia deste nó do catálogo já está na biblioteca? */
export const findExistingCopy = (libraryNodes: ArchiveNode[], sourceId: string) =>
  libraryNodes.find((n) => n.sourceId === sourceId) ?? null
