/* ==========================================================================
   content/index.ts — o índice do manual. O conteúdo entra aqui, em código,
   e não pela interface do site.

   Para acrescentar um roteiro, abra o módulo do sistema (ex.: `gastro.ts`) e
   adicione um item em `protocols`:

     {
       id: 'esofago',
       name: 'Esôfago',
       summary: 'Esofagectomia e biópsias endoscópicas.',
       steps: [
         { text: '## Medidas\n- **Comprimento:** …\n- **Diâmetro:** …' },
         { text: 'Abrir pela face oposta ao tumor.', image: esofagoAberto, caption: 'Peça aberta' },
       ],
     }

   Fotos: coloque o arquivo em `src/assets/macroscopy/<sistema>/` e importe no
   topo do módulo:

     import esofagoAberto from '@/assets/macroscopy/gastro/esofago-aberto.jpg'

   O Vite resolve o import para a URL final. Para um sistema novo, crie um
   módulo ao lado, exporte um `MacroSystem` e acrescente-o à lista abaixo, na
   posição em que deve aparecer.
   ========================================================================== */

import type { MacroProtocol, MacroSystem } from '../types'
import { gastro } from './gastro'
import { mama } from './mama'
import { genito } from './genito'
import { gineco } from './gineco'
import { pequenas } from './pequenas'

export const SYSTEMS: MacroSystem[] = [gastro, mama, genito, gineco, pequenas]

export const findSystem = (id: string | undefined): MacroSystem | undefined =>
  SYSTEMS.find((system) => system.id === id)

export const findProtocol = (
  system: MacroSystem | undefined,
  id: string | undefined,
): MacroProtocol | undefined => system?.protocols.find((protocol) => protocol.id === id)
