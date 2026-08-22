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

// Derivadas dos protocolos CAP (lidas do PDF oficial; ver cabeçalho de cada arquivo)
import ampulla from './calculators/ampulla'
import anus from './calculators/anus'
import appendix from './calculators/appendix'
import bileductDistal from './calculators/bileduct_distal'
import bileductIntrahepatic from './calculators/bileduct_intrahepatic'
import bladder from './calculators/bladder'
import cervix from './calculators/cervix'
import esophagus from './calculators/esophagus'
import gist from './calculators/gist'
import hcc from './calculators/hcc'
import kidney from './calculators/kidney'
import netAppendix from './calculators/net_appendix'
import netStomach from './calculators/net_stomach'
import ovary from './calculators/ovary'
import pancreasExocrine from './calculators/pancreas_exo'
import penis from './calculators/penis'
import prostate from './calculators/prostate'
import smallIntestine from './calculators/small_intestine'
import testis from './calculators/testis'
import thyroid from './calculators/thyroid'
import ureterRenalPelvis from './calculators/ureter_renal_pelvis'
import urethra from './calculators/urethra'
import uterineSarcoma from './calculators/uterine_sarcoma'
import vagina from './calculators/vagina'
import vulva from './calculators/vulva'
import bone from './calculators/bone'
import hnLarynx from './calculators/hn_larynx'
import hnMucosalMelanoma from './calculators/hn_mucosal_melanoma'
import hnNasal from './calculators/hn_nasal'
import hnNasopharynx from './calculators/hn_nasopharynx'
import hnOral from './calculators/hn_oral'
import hnOropharynxHpv from './calculators/hn_oropharynx_hpv'
import hnOropharynxHpvInd from './calculators/hn_oropharynx_hpvind'
import hnSalivary from './calculators/hn_salivary'
import lung from './calculators/lung'
import pleuralMesothelioma from './calculators/pleura_mesothelioma'
import skinCutaneousHn from './calculators/skin_cutaneous_hn'
import skinMelanoma from './calculators/skin_melanoma'
import skinMerkel from './calculators/skin_merkel'
import softTissue from './calculators/soft_tissue'
import thymus from './calculators/thymus'

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

  // CAP — trato gastrointestinal, fígado/vias biliares, pâncreas
  esophagus,
  smallIntestine,
  appendix,
  anus,
  gist,
  netAppendix,
  netStomach,
  ampulla,
  pancreasExocrine,
  bileductIntrahepatic,
  bileductDistal,
  hcc,

  // CAP — trato geniturinário
  kidney,
  bladder,
  ureterRenalPelvis,
  urethra,
  prostate,
  testis,
  penis,

  // CAP — trato ginecológico e endócrino
  cervix,
  ovary,
  vulva,
  vagina,
  uterineSarcoma,
  thyroid,

  // CAP — tórax, pele, osso e partes moles
  lung,
  thymus,
  pleuralMesothelioma,
  skinMelanoma,
  skinMerkel,
  skinCutaneousHn,
  bone,
  softTissue,

  // CAP — cabeça e pescoço
  hnOral,
  hnLarynx,
  hnOropharynxHpv,
  hnOropharynxHpvInd,
  hnNasopharynx,
  hnNasal,
  hnSalivary,
  hnMucosalMelanoma,
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
