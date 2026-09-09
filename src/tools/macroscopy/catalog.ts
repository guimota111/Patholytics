/* ==========================================================================
   catalog.ts — o índice que a ferramenta cria na primeira abertura: os cinco
   sistemas e as peças de cada um, herdados do Butcher Duck. É só o esqueleto;
   o roteiro de cada peça é escrito pelo próprio patologista.
   ========================================================================== */

import {
  Activity,
  Bone,
  ClipboardList,
  Droplet,
  Flower2,
  HeartPulse,
  Microscope,
  Ribbon,
  Stethoscope,
  type LucideIcon,
} from 'lucide-react'
import type { Step } from './types'

/** Ícones que um nó pode usar. A chave é o que fica gravado no documento. */
export const ICONS: Record<string, LucideIcon> = {
  activity: Activity,
  stethoscope: Stethoscope,
  droplet: Droplet,
  flower2: Flower2,
  microscope: Microscope,
  clipboardList: ClipboardList,
  ribbon: Ribbon,
  heartPulse: HeartPulse,
  bone: Bone,
}

export const ICON_KEYS = Object.keys(ICONS)

export const iconOf = (key: string): LucideIcon => ICONS[key] ?? ClipboardList

export interface CatalogProtocol {
  name: string
  /** Passos que já vêm escritos. Vazio na maioria — o manual é do usuário. */
  steps?: Step[]
}

export interface CatalogSystem {
  key: string
  name: string
  icon: string
  color: string
  description: string
  protocols: CatalogProtocol[]
}

/**
 * Único roteiro que veio escrito do Butcher Duck. O texto original repetia o
 * mesmo bloco seis vezes (efeito de salvar em cima); ficou uma vez só.
 */
const UTERO_PROLAPSO: Step[] = [
  {
    id: 'seed-1',
    text: [
      '## 1. Identificação e Medidas',
      '- **Peso:** Registrar o peso da peça (sem os anexos).',
      '- **Eixos do Útero:** Medir o comprimento (fundo ao colo), a largura (entre as tubas) e a espessura (anteroposterior).',
      '- **Colo Uterino:** Medir o comprimento, o diâmetro e o orifício externo.',
    ].join('\n'),
    image: '',
    caption: '',
  },
  {
    id: 'seed-2',
    text: [
      '## 1. Identificação e Medidas',
      '- **Inspeção do colo uterino** mucosa e fenda',
      '- **Descrever textura da mucosa:** Lisa ou enrugada',
      '- **Orifício externo** Puntiforme, circular, fenda transversa, dilatado, obstruído por exteriorização de pólipo',
    ].join('\n'),
    image: '',
    caption: '',
  },
]

export const CATALOG: CatalogSystem[] = [
  {
    key: 'gastro',
    name: 'Gastrointestinal',
    icon: 'activity',
    color: '#ef4444',
    description: 'Roteiro de macroscopia do trato gastrointestinal e órgãos anexos.',
    protocols: [
      { name: 'Esôfago' },
      { name: 'Estômago' },
      { name: 'Intestino delgado' },
      { name: 'Cólon e reto' },
      { name: 'Apêndice' },
      { name: 'Fígado' },
      { name: 'Vesícula biliar' },
      { name: 'Pâncreas' },
    ],
  },
  {
    key: 'mama',
    name: 'Mama',
    icon: 'ribbon',
    color: '#f97316',
    description: 'Mastectomia, quadrantectomia e demais amostras mamárias.',
    protocols: [
      { name: 'Mastectomia radical modificada' },
      { name: 'Mastectomia simples' },
      { name: 'Quadrantectomia' },
      { name: 'Setorectomia' },
      { name: 'Core biopsy' },
      { name: 'Linfonodo sentinela' },
    ],
  },
  {
    key: 'genito',
    name: 'Geniturinário',
    icon: 'droplet',
    color: '#8b5cf6',
    description: 'Roteiro de macroscopia do sistema geniturinário.',
    protocols: [
      { name: 'Rim — nefrectomia' },
      { name: 'Bexiga — cistectomia' },
      { name: 'Próstata' },
      { name: 'Testículo' },
      { name: 'Pênis' },
      { name: 'Ureter' },
    ],
  },
  {
    key: 'gineco',
    name: 'Ginecológico',
    icon: 'flower2',
    color: '#ec4899',
    description: 'Roteiro de macroscopia de peças ginecológicas.',
    protocols: [
      { name: 'Útero de prolapso uterino', steps: UTERO_PROLAPSO },
      { name: 'Útero de miomatose' },
      { name: 'Útero neoplásico' },
      { name: 'Ovário inocente' },
      { name: 'Ovário cístico' },
      { name: 'Ovário maligno' },
      { name: 'Tuba uterina' },
    ],
  },
  {
    key: 'pequenas',
    name: 'Pequenas peças',
    icon: 'microscope',
    color: '#14b8a6',
    description: 'Roteiro de macroscopia de pequenas peças e biópsias.',
    protocols: [
      { name: 'Pele' },
      { name: 'Linfonodo' },
      { name: 'Partes moles' },
      { name: 'Tireoide' },
      { name: 'Paratireoide' },
      { name: 'Glândula salivar' },
      { name: 'Osso' },
    ],
  },
]
