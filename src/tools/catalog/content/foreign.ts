/* ==========================================================================
   foreign.ts — Catálogo de corpos estranhos: preenchedores, suturas, talco,
   pólen, material vegetal… Filtra-se por onde aparece e pela clínica; não
   há facetas morfológicas. Os verbetes entram aqui, em código.
   ========================================================================== */

import { Gem } from 'lucide-react'
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
  entries: [],
}
