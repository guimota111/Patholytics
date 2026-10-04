/* ==========================================================================
   permissions.ts — quem pode o quê, em cada espaço do arquivo.

   A árvore, o painel e a busca são os mesmos nos dois espaços; o que muda é o
   conjunto de botões que aparece. Esconder botão é cortesia com o usuário — a
   fonte de verdade é `firestore.rules`, e uma escrita que passe por fora daqui
   esbarra nela do mesmo jeito.
   ========================================================================== */

import type { ArchiveNode } from './types'

export interface NodeRights {
  canEdit: boolean
  canDelete: boolean
  canMove: boolean
}

export interface SpaceRights {
  /** Criar pasta: livre na biblioteca, só da curadoria no catálogo. */
  canAddCategory: boolean
  canAddLeaf: boolean
  /** Importar um acervo inteiro de uma vez. */
  canImport: boolean
  rightsFor: (node: ArchiveNode) => NodeRights
}

const ALL: NodeRights = { canEdit: true, canDelete: true, canMove: true }
const NONE: NodeRights = { canEdit: false, canDelete: false, canMove: false }

/** Na própria biblioteca o usuário manda em tudo — é o arquivo dele. */
export const LIBRARY_RIGHTS: SpaceRights = {
  canAddCategory: true,
  canAddLeaf: true,
  canImport: true,
  rightsFor: () => ALL,
}

/**
 * No catálogo qualquer pessoa logada publica um laudo e cuida do que é seu;
 * as pastas, que são o mapa que todo mundo usa para se achar, ficam com a
 * curadoria.
 */
export function catalogRights(uid: string | null, curator: boolean): SpaceRights {
  return {
    canAddCategory: curator,
    canAddLeaf: Boolean(uid),
    canImport: curator,
    rightsFor: (node) => {
      if (curator) return ALL
      if (node.type === 'category' || !uid || node.authorUid !== uid) return NONE
      return ALL
    },
  }
}
