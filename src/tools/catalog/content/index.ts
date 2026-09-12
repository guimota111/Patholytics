/* ==========================================================================
   content/index.ts — o índice dos catálogos. Para acrescentar um verbete,
   abra o módulo do catálogo (`bugs.ts` ou `foreign.ts`) e adicione um item
   em `entries`:

     {
       id: 'candida',
       name: 'Candida',
       aka: ['Candidíase', 'Monília'],
       summary: 'Leveduras com pseudo-hifas; a mais comum das micoses de mucosa.',
       description: '## Morfologia\n- Leveduras de 3–5 µm com **brotamento**…',
       traits: ['pseudo-hifa', 'brotamento', 'pas', 'grocott'],
       sites: ['mucosa-oral', 'esofago', 'colo-uterino'],
       clinical: ['imunossuprimido', 'diabetes'],
       photos: [{ src: candidaPas, caption: 'Esôfago, PAS', credit: 'Dra. Fulana' }],
     }

   Os ids de `traits`, `sites` e `clinical` são os das facetas do catálogo;
   uma faceta nova entra na lista do módulo. Fotos: arquivo em
   `src/assets/catalog/<catalogo>/` e import no topo do módulo:

     import candidaPas from '@/assets/catalog/bugs/candida-pas.jpg'
   ========================================================================== */

import type { Catalog, CatalogId } from '../types'
import { bugs } from './bugs'
import { foreign } from './foreign'

export const CATALOGS: Record<CatalogId, Catalog> = { bugs, foreign }
