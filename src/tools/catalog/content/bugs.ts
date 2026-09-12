/* ==========================================================================
   bugs.ts — Catálogo de bichos: fungos, parasitas, bactérias e o que mais
   aparecer na lâmina. Os verbetes entram aqui, em código; as facetas abaixo
   são o vocabulário dos filtros e podem crescer conforme os verbetes pedem.
   ========================================================================== */

import { Bug } from 'lucide-react'
import type { Catalog } from '../types'

export const bugs: Catalog = {
  id: 'bugs',
  path: '/tools/bichos',
  icon: Bug,
  color: '#0f9d6e',
  traits: [
    { id: 'esporo', label: 'Faz esporo' },
    { id: 'hifa-verdadeira', label: 'Hifa verdadeira' },
    { id: 'pseudo-hifa', label: 'Pseudo-hifa' },
    { id: 'hifa-septada', label: 'Hifa septada' },
    { id: 'hifa-nao-septada', label: 'Hifa não septada' },
    { id: 'brotamento', label: 'Brotamento' },
    { id: 'brotamento-base-estreita', label: 'Brotamento de base estreita' },
    { id: 'brotamento-base-larga', label: 'Brotamento de base larga' },
    { id: 'capsula', label: 'Cápsula' },
    { id: 'esferula', label: 'Esférula' },
    { id: 'espicula', label: 'Tem espícula' },
    { id: 'intracelular', label: 'Intracelular' },
    { id: 'pigmentado', label: 'Pigmentado (demáceo)' },
    { id: 'ovo', label: 'Ovo' },
    { id: 'larva', label: 'Larva' },
    { id: 'cisto', label: 'Cisto' },
    { id: 'trofozoito', label: 'Trofozoíto' },
    { id: 'granuloma', label: 'Forma granuloma' },
    { id: 'baar', label: 'BAAR (Ziehl positivo)' },
    { id: 'grocott', label: 'Grocott positivo' },
    { id: 'pas', label: 'PAS positivo' },
  ],
  sites: [
    { id: 'pele', label: 'Pele e anexos' },
    { id: 'mucosa-oral', label: 'Mucosa oral' },
    { id: 'esofago', label: 'Esôfago' },
    { id: 'estomago', label: 'Estômago' },
    { id: 'intestino', label: 'Intestino' },
    { id: 'figado', label: 'Fígado' },
    { id: 'pulmao', label: 'Pulmão' },
    { id: 'seios-paranasais', label: 'Seios paranasais' },
    { id: 'snc', label: 'Sistema nervoso central' },
    { id: 'linfonodo', label: 'Linfonodo' },
    { id: 'medula', label: 'Medula óssea' },
    { id: 'colo-uterino', label: 'Colo uterino e vagina' },
    { id: 'trato-urinario', label: 'Trato urinário' },
    { id: 'osso', label: 'Osso e articulação' },
    { id: 'olho', label: 'Olho' },
    { id: 'sangue', label: 'Sangue' },
  ],
  clinical: [
    { id: 'imunossuprimido', label: 'Imunossuprimido' },
    { id: 'hiv', label: 'HIV / aids' },
    { id: 'transplante', label: 'Transplantado' },
    { id: 'diabetes', label: 'Diabetes' },
    { id: 'neutropenia', label: 'Neutropenia' },
    { id: 'imunocompetente', label: 'Imunocompetente' },
    { id: 'zona-rural', label: 'Zona rural / contato com solo' },
    { id: 'viagem', label: 'Viagem a área endêmica' },
    { id: 'trauma', label: 'Trauma / inoculação' },
    { id: 'cronico', label: 'Curso crônico' },
    { id: 'agudo', label: 'Curso agudo' },
  ],
  entries: [],
}
