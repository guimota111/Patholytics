/* ==========================================================================
   bugs.ts — Catálogo de bichos: fungos, parasitas, bactérias e o que mais
   aparecer na lâmina. Os verbetes entram aqui, em código; as facetas abaixo
   são o vocabulário dos filtros e podem crescer conforme os verbetes pedem.
   ========================================================================== */

import { Bug } from 'lucide-react'
import histoplasmaGms from '@/assets/catalog/bugs/histoplasma-gms.jpg'
import paracoccidioidesGms from '@/assets/catalog/bugs/paracoccidioides-gms.jpg'
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
    { id: 'brotamento-multiplo', label: 'Brotamento múltiplo (roda de leme)' },
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
  entries: [
    {
      id: 'histoplasma',
      name: 'Histoplasma capsulatum',
      aka: ['Histoplasmose'],
      summary: 'Leveduras pequenas (2–4 µm), intracelulares em macrófagos, com brotamento de base estreita; o halo claro no HE é artefato de retração.',
      description:
        '## Morfologia\n- Leveduras ovais de **2 a 4 µm**, uniformes, dentro do citoplasma de macrófagos e histiócitos — em grupos, como "sacos de bolinhas".\n- **Brotamento único de base estreita.**\n- No HE quase não se vê: um ponto basofílico cercado por um halo claro (retração do citoplasma, não cápsula).\n- **Grocott (GMS)** e **PAS** mostram as leveduras com clareza; a mucicarmina é negativa (diferencia de Cryptococcus).\n\n## Diferenciais\n- Leishmania: mesmo tamanho e também intracelular, mas tem cinetoplasto e é **negativa no Grocott**.\n- Cryptococcus: maior e variável (4–15 µm), cápsula mucicarmina-positiva.\n- Candida glabrata: extracelular, sem brotamento de base estreita organizado em macrófagos.\n- Pneumocystis: cistos em "bola amassada", sem brotamento.\n\n## Contexto\n- Inalação de conídios em solo com fezes de aves e morcegos; grutas, galinheiros, obras.\n- Granulomas necrosantes ou não; no imunossuprimido (HIV, transplante) a forma disseminada tem macrófagos repletos de leveduras e pouco granuloma.',
      traits: ['brotamento', 'brotamento-base-estreita', 'intracelular', 'granuloma', 'grocott', 'pas'],
      sites: ['pulmao', 'linfonodo', 'medula', 'figado', 'mucosa-oral', 'intestino', 'pele'],
      clinical: ['imunossuprimido', 'hiv', 'transplante', 'zona-rural', 'imunocompetente'],
      photos: [
        {
          src: histoplasmaGms,
          caption: 'Granuloma de intestino delgado: leveduras com brotamento de base estreita',
          stain: 'Grocott (GMS)',
          credit: 'Mikael Häggström, M.D. — Wikimedia Commons, CC BY 4.0',
        },
      ],
    },
    {
      id: 'paracoccidioides',
      name: 'Paracoccidioides brasiliensis',
      aka: ['Paracoccidioidomicose', 'PCM', 'Blastomicose sul-americana', 'Lutz'],
      summary: 'Levedura grande de parede espessa com brotamentos múltiplos ao redor da célula-mãe: a "roda de leme" (ou orelhas do Mickey, quando são só dois).',
      description:
        '## Morfologia\n- Leveduras redondas de tamanho muito variável, **5 a 30 µm** (algumas até 60 µm), parede espessa e birrefringente.\n- **Brotamentos múltiplos, de base estreita**, distribuídos pela circunferência da célula-mãe: a **roda de leme** é patognomônica. Com dois brotos, a imagem do "Mickey Mouse".\n- Grocott (GMS) e PAS destacam a parede; no HE aparecem como corpos refringentes de parede dupla.\n- Cadeias de leveduras pequenas brotando em sequência também ocorrem.\n\n## Diferenciais\n- Blastomyces: brotamento **único** de base larga.\n- Cryptococcus: cápsula mucicarmina-positiva, brotamento único.\n- Histoplasma: muito menor, intracelular.\n- Procure a roda de leme antes de fechar: leveduras isoladas de P. brasiliensis imitam qualquer um dos três.\n\n## Contexto\n- Micose sistêmica endêmica da América Latina, sobretudo Brasil; trabalhador rural, homem adulto, tabagista.\n- **Forma crônica do adulto**: pulmão, mucosa oral e laríngea (estomatite moriforme), pele, adrenal. **Forma aguda/juvenil**: linfonodos, fígado e baço, medula.\n- Granulomas com células gigantes e microabscessos; hiperplasia pseudoepiteliomatosa na mucosa e na pele.',
      traits: ['brotamento', 'brotamento-multiplo', 'brotamento-base-estreita', 'granuloma', 'grocott', 'pas'],
      sites: ['pulmao', 'mucosa-oral', 'pele', 'linfonodo', 'figado', 'medula'],
      clinical: ['zona-rural', 'imunocompetente', 'cronico', 'imunossuprimido'],
      photos: [
        {
          src: paracoccidioidesGms,
          caption: 'Célula-mãe com brotamentos múltiplos em roda de leme',
          stain: 'Prata metenamina (GMS)',
          credit: 'CDC/Dr. Lucille K. Georg — Public Health Image Library #527, domínio público',
        },
      ],
    },
  ],
}
