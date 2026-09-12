/* ==========================================================================
   foreign.ts — Catálogo de corpos estranhos: preenchedores, suturas, talco,
   pólen, material vegetal… Filtra-se por onde aparece e pela clínica; não
   há facetas morfológicas. Os verbetes entram aqui, em código.
   ========================================================================== */

import { Gem } from 'lucide-react'
import siliconeHe from '@/assets/catalog/foreign/silicone-he.jpg'
import suturaHe from '@/assets/catalog/foreign/sutura-he.jpg'
import type { Catalog } from '../types'

export const foreign: Catalog = {
  id: 'foreign',
  path: '/tools/corpos-estranhos',
  icon: Gem,
  color: '#c2410c',
  traits: [],
  sites: [
    { id: 'pele', label: 'Pele e subcutâneo' },
    { id: 'mama', label: 'Mama' },
    { id: 'mucosa-oral', label: 'Mucosa oral' },
    { id: 'esofago', label: 'Esôfago' },
    { id: 'estomago', label: 'Estômago' },
    { id: 'intestino', label: 'Intestino' },
    { id: 'apendice', label: 'Apêndice' },
    { id: 'pulmao', label: 'Pulmão' },
    { id: 'pleura', label: 'Pleura e peritônio' },
    { id: 'figado', label: 'Fígado' },
    { id: 'linfonodo', label: 'Linfonodo' },
    { id: 'osso', label: 'Osso e articulação' },
    { id: 'partes-moles', label: 'Partes moles' },
    { id: 'trato-urinario', label: 'Trato urinário' },
    { id: 'genital', label: 'Trato genital' },
    { id: 'olho', label: 'Olho' },
    { id: 'vaso', label: 'Vaso (embolia)' },
  ],
  clinical: [
    { id: 'estetico', label: 'Procedimento estético' },
    { id: 'cirurgia-previa', label: 'Cirurgia prévia' },
    { id: 'protese', label: 'Prótese / implante' },
    { id: 'drogas-injetaveis', label: 'Uso de drogas injetáveis' },
    { id: 'aspiracao', label: 'Aspiração' },
    { id: 'ingestao', label: 'Ingestão' },
    { id: 'trauma', label: 'Trauma / ferimento' },
    { id: 'ocupacional', label: 'Exposição ocupacional' },
    { id: 'reacao-granulomatosa', label: 'Reação granulomatosa' },
    { id: 'birrefringente', label: 'Birrefringente à luz polarizada' },
  ],
  entries: [
    {
      id: 'sutura',
      name: 'Fio de sutura',
      aka: ['Granuloma de sutura', 'Granuloma de fio', 'Reação a corpo estranho de sutura'],
      summary: 'Filamentos refringentes, muitas vezes trançados ou em corte transversal com múltiplos pontos, cercados por células gigantes multinucleadas e fibrose.',
      description:
        '## Morfologia\n- Material **acelular, refringente**, homogêneo ou finamente fibrilar; em corte transversal o fio trançado (seda, poliéster) aparece como um feixe de pontos redondos, e o monofilamento (náilon, polipropileno) como um único disco liso.\n- Cercado por **células gigantes tipo corpo estranho**, histiócitos e fibrose concêntrica; pode haver eosinófilos.\n- **Birrefringente** à luz polarizada na maioria dos fios sintéticos — vale polarizar toda vez que aparecer um granuloma "sem causa".\n- Fios absorvíveis (poliglactina, categute) degradam e deixam fragmentos irregulares, às vezes só o granuloma residual.\n\n## Onde engana\n- Cicatriz de cirurgia prévia com nódulo palpável: imita recidiva tumoral em cólon, mama, tireoide e cicatriz de orquiectomia.\n- Corte tangencial pode parecer parasita ou fungo — o fio não tem estrutura interna organizada nem cora no Grocott como célula.\n\n## Contexto\n- Sempre há **cirurgia prévia** no sítio; o nódulo surge meses a anos depois.\n- Sem necrose caseosa; se houver, pense em infecção associada.',
      traits: [],
      sites: ['pele', 'partes-moles', 'mama', 'intestino', 'pleura', 'genital', 'trato-urinario'],
      clinical: ['cirurgia-previa', 'reacao-granulomatosa', 'birrefringente'],
      photos: [
        {
          src: suturaHe,
          caption: 'Granuloma de sutura: fio refringente (cinza) envolto por células gigantes multinucleadas',
          stain: 'HE',
          credit: 'Mikael Häggström, M.D. — Wikimedia Commons, CC0',
        },
      ],
    },
    {
      id: 'silicone',
      name: 'Silicone',
      aka: ['Siliconoma', 'Granuloma de silicone', 'Polidimetilsiloxano'],
      summary: 'Vacúolos redondos e opticamente vazios, de tamanhos variados, entre histiócitos e células gigantes: o aspecto em "queijo suíço".',
      description:
        '## Morfologia\n- **Vacúolos redondos, vazios, de tamanhos muito variados** (o silicone dissolve no processamento) dentro de histiócitos, células gigantes e no interstício — o padrão em **queijo suíço**.\n- Células gigantes multinucleadas tipo corpo estranho, fibrose e, no silicone líquido industrial, esclerose densa.\n- **Não birrefringente** à luz polarizada (diferencia de talco, PMMA e outros preenchedores cristalinos).\n- Em linfonodo: histiocitose sinusal com os mesmos vacúolos — a "linfadenite por silicone" de prótese rota.\n\n## Onde engana\n- Lipoma ou tecido adiposo maduro: os vacúolos do silicone têm tamanhos díspares, ficam dentro de histiócitos e não têm núcleo periférico de adipócito.\n- Preenchedores com esferas (PMMA, hidroxiapatita): partículas uniformes e definidas, muitas vezes birrefringentes.\n\n## Contexto\n- **Prótese de mama** (cápsula fibrosa, linfonodo axilar após ruptura), **preenchimento estético** com silicone líquido (glúteo, face, pernas) e injeção clandestina.\n- Migração à distância é comum: linfonodos, pulmão, fígado.',
      traits: [],
      sites: ['mama', 'pele', 'partes-moles', 'linfonodo', 'pulmao', 'figado'],
      clinical: ['estetico', 'protese', 'reacao-granulomatosa'],
      photos: [
        {
          src: siliconeHe,
          caption: 'Granuloma de silicone: vacúolos vazios de tamanhos variados entre histiócitos e células gigantes',
          stain: 'HE',
          credit: 'TexasPathologistMSW — Wikimedia Commons, CC BY-SA 4.0',
        },
      ],
    },
  ],
}
