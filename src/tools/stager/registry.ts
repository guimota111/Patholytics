/* ==========================================================================
   registry.ts — registro central das calculadoras de estadiamento.
   Para adicionar um tumor novo: crie `calculators/<nome>.ts` e importe aqui.
   Nenhum outro arquivo precisa mudar.
   ========================================================================== */

import type { Calculator } from './types'

import adrenal from './calculators/adrenal'
import bileductPerihilar from './calculators/bileduct_perihilar'
import breastDcis from './calculators/breast_dcis'
import breastInvasive from './calculators/breast_invasive'
import breastPhyllodes from './calculators/breast_phyllodes'
import colorectal from './calculators/colorectal'
import gallbladder from './calculators/gallbladder'
import gastric from './calculators/gastric'
import netColorectal from './calculators/net_colorectal'
import netDuodAmp from './calculators/net_duodamp'
import netJejIleum from './calculators/net_jejileum'
import netPancreas from './calculators/net_pancreas'
import uterusEndometrium from './calculators/uterus_endometrium'

export const calculators: Calculator[] = [
  breastInvasive,
  breastDcis,
  breastPhyllodes,
  colorectal,
  gastric,
  netColorectal,
  netDuodAmp,
  netJejIleum,
  netPancreas,
  bileductPerihilar,
  gallbladder,
  uterusEndometrium,
  adrenal,
]

/** Ordem das seções na listagem. */
export const sectionOrder = [
  'Trato Gastrointestinal',
  'Fígado e Vias Biliares',
  'Pâncreas e Ampola',
  'Trato Geniturinário',
  'Mama',
  'Trato Ginecológico',
  'Cabeça e Pescoço',
  'Tórax / Pulmão',
  'Pele',
  'Tecidos Moles e Osso',
  'Sistema Endócrino',
  'Sistema Nervoso Central',
  'Sistema Hematolinfoide',
]

export function getCalculator(id: string | undefined): Calculator | null {
  if (!id) return null
  return calculators.find((c) => c.id === id) ?? null
}

/** Agrupa por seção respeitando `sectionOrder`; extras vão para o fim. */
export function groupBySection(items: Calculator[] = calculators): [string, Calculator[]][] {
  const groups = new Map<string, Calculator[]>()
  for (const c of items) {
    const list = groups.get(c.section)
    if (list) list.push(c)
    else groups.set(c.section, [c])
  }

  const ordered: [string, Calculator[]][] = []
  for (const s of sectionOrder) {
    const list = groups.get(s)
    if (list) {
      ordered.push([s, list])
      groups.delete(s)
    }
  }
  for (const [s, items] of groups) ordered.push([s, items])
  ordered.forEach(([, list]) => list.sort((a, b) => a.name.localeCompare(b.name, 'pt')))
  return ordered
}
