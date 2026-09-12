/* ==========================================================================
   bugs.ts — Catálogo de bichos: fungos, parasitas, bactérias, vírus e
   artrópodes que aparecem na lâmina. Os verbetes entram aqui, em código; as
   facetas são o vocabulário dos filtros e crescem conforme os verbetes pedem.
   Fotos: Wikimedia Commons / CDC PHIL, licença livre, crédito em cada uma.
   ========================================================================== */

import { Bug } from 'lucide-react'
import img_histoplasma_0 from '@/assets/catalog/bugs/histoplasma-0.jpg'
import img_histoplasma_0_thumb from '@/assets/catalog/bugs/histoplasma-0-thumb.jpg'
import img_histoplasma_1 from '@/assets/catalog/bugs/histoplasma-1.jpg'
import img_histoplasma_2 from '@/assets/catalog/bugs/histoplasma-2.jpg'
import img_histoplasma_3 from '@/assets/catalog/bugs/histoplasma-3.jpg'
import img_histoplasma_4 from '@/assets/catalog/bugs/histoplasma-4.jpg'
import img_paracoccidioides_0 from '@/assets/catalog/bugs/paracoccidioides-0.jpg'
import img_paracoccidioides_0_thumb from '@/assets/catalog/bugs/paracoccidioides-0-thumb.jpg'
import img_paracoccidioides_1 from '@/assets/catalog/bugs/paracoccidioides-1.jpg'
import img_paracoccidioides_2 from '@/assets/catalog/bugs/paracoccidioides-2.jpg'
import img_candida_0 from '@/assets/catalog/bugs/candida-0.jpg'
import img_candida_0_thumb from '@/assets/catalog/bugs/candida-0-thumb.jpg'
import img_candida_1 from '@/assets/catalog/bugs/candida-1.jpg'
import img_candida_2 from '@/assets/catalog/bugs/candida-2.jpg'
import img_aspergillus_0 from '@/assets/catalog/bugs/aspergillus-0.jpg'
import img_aspergillus_0_thumb from '@/assets/catalog/bugs/aspergillus-0-thumb.jpg'
import img_aspergillus_1 from '@/assets/catalog/bugs/aspergillus-1.jpg'
import img_aspergillus_2 from '@/assets/catalog/bugs/aspergillus-2.jpg'
import img_aspergillus_3 from '@/assets/catalog/bugs/aspergillus-3.jpg'
import img_mucorales_0 from '@/assets/catalog/bugs/mucorales-0.jpg'
import img_mucorales_0_thumb from '@/assets/catalog/bugs/mucorales-0-thumb.jpg'
import img_cryptococcus_0 from '@/assets/catalog/bugs/cryptococcus-0.jpg'
import img_cryptococcus_0_thumb from '@/assets/catalog/bugs/cryptococcus-0-thumb.jpg'
import img_cryptococcus_1 from '@/assets/catalog/bugs/cryptococcus-1.jpg'
import img_cryptococcus_2 from '@/assets/catalog/bugs/cryptococcus-2.jpg'
import img_cryptococcus_3 from '@/assets/catalog/bugs/cryptococcus-3.jpg'
import img_pneumocystis_0 from '@/assets/catalog/bugs/pneumocystis-0.jpg'
import img_pneumocystis_0_thumb from '@/assets/catalog/bugs/pneumocystis-0-thumb.jpg'
import img_pneumocystis_1 from '@/assets/catalog/bugs/pneumocystis-1.jpg'
import img_pneumocystis_2 from '@/assets/catalog/bugs/pneumocystis-2.jpg'
import img_blastomyces_0 from '@/assets/catalog/bugs/blastomyces-0.jpg'
import img_blastomyces_0_thumb from '@/assets/catalog/bugs/blastomyces-0-thumb.jpg'
import img_blastomyces_1 from '@/assets/catalog/bugs/blastomyces-1.jpg'
import img_coccidioides_0 from '@/assets/catalog/bugs/coccidioides-0.jpg'
import img_coccidioides_0_thumb from '@/assets/catalog/bugs/coccidioides-0-thumb.jpg'
import img_coccidioides_1 from '@/assets/catalog/bugs/coccidioides-1.jpg'
import img_coccidioides_2 from '@/assets/catalog/bugs/coccidioides-2.jpg'
import img_trypanosoma_cruzi_0 from '@/assets/catalog/bugs/trypanosoma-cruzi-0.jpg'
import img_trypanosoma_cruzi_0_thumb from '@/assets/catalog/bugs/trypanosoma-cruzi-0-thumb.jpg'
import img_toxoplasma_0 from '@/assets/catalog/bugs/toxoplasma-0.jpg'
import img_toxoplasma_0_thumb from '@/assets/catalog/bugs/toxoplasma-0-thumb.jpg'
import img_toxoplasma_1 from '@/assets/catalog/bugs/toxoplasma-1.jpg'
import img_toxoplasma_2 from '@/assets/catalog/bugs/toxoplasma-2.jpg'
import img_schistosoma_0 from '@/assets/catalog/bugs/schistosoma-0.jpg'
import img_schistosoma_0_thumb from '@/assets/catalog/bugs/schistosoma-0-thumb.jpg'
import img_schistosoma_1 from '@/assets/catalog/bugs/schistosoma-1.jpg'
import img_schistosoma_2 from '@/assets/catalog/bugs/schistosoma-2.jpg'
import img_strongyloides_0 from '@/assets/catalog/bugs/strongyloides-0.jpg'
import img_strongyloides_0_thumb from '@/assets/catalog/bugs/strongyloides-0-thumb.jpg'
import img_strongyloides_1 from '@/assets/catalog/bugs/strongyloides-1.jpg'
import img_strongyloides_2 from '@/assets/catalog/bugs/strongyloides-2.jpg'
import img_enterobius_0 from '@/assets/catalog/bugs/enterobius-0.jpg'
import img_enterobius_0_thumb from '@/assets/catalog/bugs/enterobius-0-thumb.jpg'
import img_enterobius_1 from '@/assets/catalog/bugs/enterobius-1.jpg'
import img_enterobius_2 from '@/assets/catalog/bugs/enterobius-2.jpg'
import img_enterobius_3 from '@/assets/catalog/bugs/enterobius-3.jpg'
import img_echinococcus_0 from '@/assets/catalog/bugs/echinococcus-0.jpg'
import img_echinococcus_0_thumb from '@/assets/catalog/bugs/echinococcus-0-thumb.jpg'
import img_echinococcus_1 from '@/assets/catalog/bugs/echinococcus-1.jpg'
import img_echinococcus_2 from '@/assets/catalog/bugs/echinococcus-2.jpg'
import img_trichinella_0 from '@/assets/catalog/bugs/trichinella-0.jpg'
import img_trichinella_0_thumb from '@/assets/catalog/bugs/trichinella-0-thumb.jpg'
import img_trichinella_1 from '@/assets/catalog/bugs/trichinella-1.jpg'
import img_helicobacter_0 from '@/assets/catalog/bugs/helicobacter-0.jpg'
import img_helicobacter_0_thumb from '@/assets/catalog/bugs/helicobacter-0-thumb.jpg'
import img_helicobacter_1 from '@/assets/catalog/bugs/helicobacter-1.jpg'
import img_helicobacter_2 from '@/assets/catalog/bugs/helicobacter-2.jpg'
import img_mycobacterium_leprae_0 from '@/assets/catalog/bugs/mycobacterium-leprae-0.jpg'
import img_mycobacterium_leprae_0_thumb from '@/assets/catalog/bugs/mycobacterium-leprae-0-thumb.jpg'
import img_mycobacterium_leprae_1 from '@/assets/catalog/bugs/mycobacterium-leprae-1.jpg'
import img_mycobacterium_leprae_2 from '@/assets/catalog/bugs/mycobacterium-leprae-2.jpg'
import img_mycobacterium_leprae_3 from '@/assets/catalog/bugs/mycobacterium-leprae-3.jpg'
import img_actinomyces_0 from '@/assets/catalog/bugs/actinomyces-0.jpg'
import img_actinomyces_0_thumb from '@/assets/catalog/bugs/actinomyces-0-thumb.jpg'
import img_actinomyces_1 from '@/assets/catalog/bugs/actinomyces-1.jpg'
import img_actinomyces_2 from '@/assets/catalog/bugs/actinomyces-2.jpg'
import img_nocardia_0 from '@/assets/catalog/bugs/nocardia-0.jpg'
import img_nocardia_0_thumb from '@/assets/catalog/bugs/nocardia-0-thumb.jpg'
import img_nocardia_1 from '@/assets/catalog/bugs/nocardia-1.jpg'
import img_cmv_0 from '@/assets/catalog/bugs/cmv-0.jpg'
import img_cmv_0_thumb from '@/assets/catalog/bugs/cmv-0-thumb.jpg'
import img_cmv_1 from '@/assets/catalog/bugs/cmv-1.jpg'
import img_cmv_2 from '@/assets/catalog/bugs/cmv-2.jpg'
import img_hsv_0 from '@/assets/catalog/bugs/hsv-0.jpg'
import img_hsv_0_thumb from '@/assets/catalog/bugs/hsv-0-thumb.jpg'
import img_hsv_1 from '@/assets/catalog/bugs/hsv-1.jpg'
import img_hsv_2 from '@/assets/catalog/bugs/hsv-2.jpg'
import img_hpv_0 from '@/assets/catalog/bugs/hpv-0.jpg'
import img_hpv_0_thumb from '@/assets/catalog/bugs/hpv-0-thumb.jpg'
import img_hpv_1 from '@/assets/catalog/bugs/hpv-1.jpg'
import img_hpv_2 from '@/assets/catalog/bugs/hpv-2.jpg'
import img_molluscum_0 from '@/assets/catalog/bugs/molluscum-0.jpg'
import img_molluscum_0_thumb from '@/assets/catalog/bugs/molluscum-0-thumb.jpg'
import img_molluscum_1 from '@/assets/catalog/bugs/molluscum-1.jpg'
import img_molluscum_2 from '@/assets/catalog/bugs/molluscum-2.jpg'
import img_giardia_0 from '@/assets/catalog/bugs/giardia-0.jpg'
import img_giardia_0_thumb from '@/assets/catalog/bugs/giardia-0-thumb.jpg'
import img_giardia_1 from '@/assets/catalog/bugs/giardia-1.jpg'
import img_demodex_0 from '@/assets/catalog/bugs/demodex-0.jpg'
import img_demodex_0_thumb from '@/assets/catalog/bugs/demodex-0-thumb.jpg'
import img_demodex_1 from '@/assets/catalog/bugs/demodex-1.jpg'
import img_demodex_2 from '@/assets/catalog/bugs/demodex-2.jpg'
import img_sarcoptes_0 from '@/assets/catalog/bugs/sarcoptes-0.jpg'
import img_sarcoptes_0_thumb from '@/assets/catalog/bugs/sarcoptes-0-thumb.jpg'
import img_sarcoptes_1 from '@/assets/catalog/bugs/sarcoptes-1.jpg'
import img_sarcoptes_2 from '@/assets/catalog/bugs/sarcoptes-2.jpg'
import img_tunga_0 from '@/assets/catalog/bugs/tunga-0.jpg'
import img_tunga_0_thumb from '@/assets/catalog/bugs/tunga-0-thumb.jpg'
import img_tunga_1 from '@/assets/catalog/bugs/tunga-1.jpg'
import img_tunga_2 from '@/assets/catalog/bugs/tunga-2.jpg'
import img_malassezia_0 from '@/assets/catalog/bugs/malassezia-0.jpg'
import img_malassezia_0_thumb from '@/assets/catalog/bugs/malassezia-0-thumb.jpg'
import img_tropheryma_0 from '@/assets/catalog/bugs/tropheryma-0.jpg'
import img_tropheryma_0_thumb from '@/assets/catalog/bugs/tropheryma-0-thumb.jpg'
import img_tropheryma_1 from '@/assets/catalog/bugs/tropheryma-1.jpg'
import img_treponema_0 from '@/assets/catalog/bugs/treponema-0.jpg'
import img_treponema_0_thumb from '@/assets/catalog/bugs/treponema-0-thumb.jpg'
import img_treponema_1 from '@/assets/catalog/bugs/treponema-1.jpg'
import img_alternaria_0 from '@/assets/catalog/bugs/alternaria-0.jpg'
import img_alternaria_0_thumb from '@/assets/catalog/bugs/alternaria-0-thumb.jpg'
import img_carrapato_0 from '@/assets/catalog/bugs/carrapato-0.jpg'
import img_carrapato_0_thumb from '@/assets/catalog/bugs/carrapato-0-thumb.jpg'
import img_carrapato_1 from '@/assets/catalog/bugs/carrapato-1.jpg'
import img_miiase_0 from '@/assets/catalog/bugs/miiase-0.jpg'
import img_miiase_0_thumb from '@/assets/catalog/bugs/miiase-0-thumb.jpg'
import img_leishmania_0 from '@/assets/catalog/bugs/leishmania-0.jpg'
import img_leishmania_0_thumb from '@/assets/catalog/bugs/leishmania-0-thumb.jpg'
import img_cromoblastomicose_0 from '@/assets/catalog/bugs/cromoblastomicose-0.jpg'
import img_cromoblastomicose_0_thumb from '@/assets/catalog/bugs/cromoblastomicose-0-thumb.jpg'
import img_cromoblastomicose_1 from '@/assets/catalog/bugs/cromoblastomicose-1.jpg'
import img_cromoblastomicose_2 from '@/assets/catalog/bugs/cromoblastomicose-2.jpg'
import img_lacazia_0 from '@/assets/catalog/bugs/lacazia-0.jpg'
import img_lacazia_0_thumb from '@/assets/catalog/bugs/lacazia-0-thumb.jpg'
import img_micetoma_0 from '@/assets/catalog/bugs/micetoma-0.jpg'
import img_micetoma_0_thumb from '@/assets/catalog/bugs/micetoma-0-thumb.jpg'
import img_micetoma_1 from '@/assets/catalog/bugs/micetoma-1.jpg'
import img_micetoma_2 from '@/assets/catalog/bugs/micetoma-2.jpg'
import img_rhinosporidium_0 from '@/assets/catalog/bugs/rhinosporidium-0.jpg'
import img_rhinosporidium_0_thumb from '@/assets/catalog/bugs/rhinosporidium-0-thumb.jpg'
import img_rhinosporidium_1 from '@/assets/catalog/bugs/rhinosporidium-1.jpg'
import img_klebsiella_granulomatis_0 from '@/assets/catalog/bugs/klebsiella-granulomatis-0.jpg'
import img_klebsiella_granulomatis_0_thumb from '@/assets/catalog/bugs/klebsiella-granulomatis-0-thumb.jpg'
import img_klebsiella_granulomatis_1 from '@/assets/catalog/bugs/klebsiella-granulomatis-1.jpg'
import img_dirofilaria_0 from '@/assets/catalog/bugs/dirofilaria-0.jpg'
import img_dirofilaria_0_thumb from '@/assets/catalog/bugs/dirofilaria-0-thumb.jpg'
import img_raiva_0 from '@/assets/catalog/bugs/raiva-0.jpg'
import img_raiva_0_thumb from '@/assets/catalog/bugs/raiva-0-thumb.jpg'
import img_raiva_1 from '@/assets/catalog/bugs/raiva-1.jpg'
import img_raiva_2 from '@/assets/catalog/bugs/raiva-2.jpg'
import img_poliomavirus_bk_0 from '@/assets/catalog/bugs/poliomavirus-bk-0.jpg'
import img_poliomavirus_bk_0_thumb from '@/assets/catalog/bugs/poliomavirus-bk-0-thumb.jpg'
import img_poliomavirus_bk_1 from '@/assets/catalog/bugs/poliomavirus-bk-1.jpg'
import img_virus_jc_0 from '@/assets/catalog/bugs/virus-jc-0.jpg'
import img_virus_jc_0_thumb from '@/assets/catalog/bugs/virus-jc-0-thumb.jpg'
import img_virus_jc_1 from '@/assets/catalog/bugs/virus-jc-1.jpg'
import img_trichomonas_0 from '@/assets/catalog/bugs/trichomonas-0.jpg'
import img_trichomonas_0_thumb from '@/assets/catalog/bugs/trichomonas-0-thumb.jpg'
import img_mycobacterium_tuberculosis_0 from '@/assets/catalog/bugs/mycobacterium-tuberculosis-0.jpg'
import img_mycobacterium_tuberculosis_0_thumb from '@/assets/catalog/bugs/mycobacterium-tuberculosis-0-thumb.jpg'
import img_mycobacterium_tuberculosis_1 from '@/assets/catalog/bugs/mycobacterium-tuberculosis-1.jpg'
import img_mycobacterium_tuberculosis_2 from '@/assets/catalog/bugs/mycobacterium-tuberculosis-2.jpg'
import img_mycobacterium_tuberculosis_3 from '@/assets/catalog/bugs/mycobacterium-tuberculosis-3.jpg'
import type { Catalog } from '../types'

export const bugs: Catalog = {
  id: 'bugs',
  path: '/tools/bichos',
  icon: Bug,
  color: '#0f9d6e',
  traits: [
    { id: 'esporo', label: 'Faz esporo / conídio' },
    { id: 'hifa-verdadeira', label: 'Hifa verdadeira' },
    { id: 'pseudo-hifa', label: 'Pseudo-hifa' },
    { id: 'hifa-septada', label: 'Hifa septada' },
    { id: 'hifa-nao-septada', label: 'Hifa não septada (cenocítica)' },
    { id: 'brotamento', label: 'Brotamento' },
    { id: 'brotamento-base-estreita', label: 'Brotamento de base estreita' },
    { id: 'brotamento-base-larga', label: 'Brotamento de base larga' },
    { id: 'brotamento-multiplo', label: 'Brotamento múltiplo (roda de leme)' },
    { id: 'capsula', label: 'Cápsula' },
    { id: 'esferula', label: 'Esférula / esporângio' },
    { id: 'espicula', label: 'Tem espícula' },
    { id: 'intracelular', label: 'Intracelular' },
    { id: 'pigmentado', label: 'Pigmentado (demáceo)' },
    { id: 'ovo', label: 'Ovo' },
    { id: 'larva', label: 'Larva' },
    { id: 'verme', label: 'Verme em corte' },
    { id: 'cisto', label: 'Cisto' },
    { id: 'trofozoito', label: 'Trofozoíto' },
    { id: 'artropode', label: 'Artrópode (ácaro, inseto, carrapato)' },
    { id: 'bacilo', label: 'Bacilo' },
    { id: 'filamentoso', label: 'Bactéria filamentosa' },
    { id: 'espiroqueta', label: 'Espiroqueta' },
    { id: 'grao', label: 'Grão / grânulo de enxofre' },
    { id: 'splendore', label: 'Fenômeno de Splendore-Hoeppli' },
    { id: 'membrana-laminada', label: 'Membrana laminada' },
    { id: 'inclusao-nuclear', label: 'Inclusão intranuclear' },
    { id: 'inclusao-citoplasmatica', label: 'Inclusão citoplasmática' },
    { id: 'multinucleacao', label: 'Células multinucleadas' },
    { id: 'coilocito', label: 'Coilócito' },
    { id: 'granuloma', label: 'Forma granuloma' },
    { id: 'baar', label: 'BAAR (Ziehl / Fite positivo)' },
    { id: 'grocott', label: 'Grocott (GMS) positivo' },
    { id: 'pas', label: 'PAS positivo' },
    { id: 'giemsa', label: 'Giemsa positivo' },
    { id: 'warthin-starry', label: 'Warthin-Starry positivo' },
    { id: 'mucicarmina', label: 'Mucicarmina positivo' },
    { id: 'ihq', label: 'Imuno-histoquímica específica' },
    { id: 'citologia', label: 'Visto em citologia / esfregaço' },
  ],
  sites: [
    { id: 'pele', label: 'Pele e anexos' },
    { id: 'partes-moles', label: 'Subcutâneo e partes moles' },
    { id: 'mucosa-oral', label: 'Mucosa oral' },
    { id: 'nasofaringe', label: 'Nariz e nasofaringe' },
    { id: 'seios-paranasais', label: 'Seios paranasais' },
    { id: 'esofago', label: 'Esôfago' },
    { id: 'estomago', label: 'Estômago' },
    { id: 'intestino', label: 'Intestino' },
    { id: 'apendice', label: 'Apêndice' },
    { id: 'anus', label: 'Ânus e canal anal' },
    { id: 'figado', label: 'Fígado' },
    { id: 'pulmao', label: 'Pulmão' },
    { id: 'pleura', label: 'Pleura' },
    { id: 'coracao', label: 'Coração' },
    { id: 'snc', label: 'Sistema nervoso central' },
    { id: 'nervo', label: 'Nervo periférico' },
    { id: 'linfonodo', label: 'Linfonodo' },
    { id: 'medula', label: 'Medula óssea' },
    { id: 'colo-uterino', label: 'Colo uterino e vagina' },
    { id: 'genital', label: 'Genitália externa e uretra' },
    { id: 'placenta', label: 'Placenta' },
    { id: 'trato-urinario', label: 'Trato urinário' },
    { id: 'rim', label: 'Rim' },
    { id: 'osso', label: 'Osso e articulação' },
    { id: 'musculo', label: 'Músculo esquelético' },
    { id: 'olho', label: 'Olho' },
    { id: 'sangue', label: 'Sangue' },
  ],
  clinical: [
    { id: 'imunossuprimido', label: 'Imunossuprimido' },
    { id: 'hiv', label: 'HIV / aids' },
    { id: 'transplante', label: 'Transplantado' },
    { id: 'corticoide', label: 'Corticoide / imunobiológico' },
    { id: 'neutropenia', label: 'Neutropenia' },
    { id: 'diabetes', label: 'Diabetes' },
    { id: 'imunocompetente', label: 'Imunocompetente' },
    { id: 'crianca', label: 'Criança' },
    { id: 'zona-rural', label: 'Zona rural / contato com solo' },
    { id: 'viagem', label: 'Viagem a área endêmica' },
    { id: 'animais', label: 'Contato com animais' },
    { id: 'agua', label: 'Água contaminada / saneamento' },
    { id: 'alimento', label: 'Carne ou peixe malcozidos' },
    { id: 'areia', label: 'Praia / solo arenoso, pés descalços' },
    { id: 'trauma', label: 'Trauma / inoculação' },
    { id: 'ist', label: 'IST / contato sexual' },
    { id: 'diu', label: 'Uso de DIU' },
    { id: 'cronico', label: 'Curso crônico' },
    { id: 'agudo', label: 'Curso agudo' },
    { id: 'contaminante', label: 'Contaminante da lâmina / ambiente' },
  ],
  entries: [
    {
      id: 'histoplasma',
      name: 'Histoplasma capsulatum',
      aka: ['Histoplasmose'],
      summary: 'Leveduras pequenas (2–4 µm), intracelulares em macrófagos, com brotamento de base estreita; o halo claro no HE é artefato de retração.',
      description:
        '## Morfologia\n- Leveduras ovais de **2 a 4 µm**, uniformes, dentro do citoplasma de macrófagos e histiócitos — em grupos, como "sacos de bolinhas".\n- **Brotamento único de base estreita.**\n- No HE quase não se vê: um ponto basofílico cercado por um halo claro (retração do citoplasma, não cápsula).\n- **Grocott (GMS)** e **PAS** mostram as leveduras com clareza; a mucicarmina é negativa (diferencia de Cryptococcus).\n\n## Diferenciais\n- Leishmania: mesmo tamanho e também intracelular, mas tem cinetoplasto e é **negativa no Grocott**.\n- Cryptococcus: maior e variável (4–15 µm), cápsula mucicarmina-positiva.\n- Candida glabrata: extracelular, sem brotamento de base estreita organizado em macrófagos.\n- Pneumocystis: cistos em "bola amassada", sem brotamento.\n\n## Contexto\n- Inalação de conídios em solo com fezes de aves e morcegos; grutas, galinheiros, obras.\n- Granulomas necrosantes ou não; no imunossuprimido (HIV, transplante) a forma disseminada tem macrófagos repletos de leveduras e pouco granuloma.',
      traits: ['brotamento', 'brotamento-base-estreita', 'intracelular', 'granuloma', 'grocott', 'pas', 'citologia'],
      sites: ['pulmao', 'linfonodo', 'medula', 'figado', 'mucosa-oral', 'intestino', 'pele'],
      clinical: ['imunossuprimido', 'hiv', 'transplante', 'zona-rural', 'imunocompetente'],
      photos: [
        { src: img_histoplasma_0, thumb: img_histoplasma_0_thumb, caption: 'Granuloma de intestino delgado: leveduras com brotamento de base estreita', stain: 'Grocott (GMS)', credit: 'Mikael Häggström, M.D. — Wikimedia Commons, CC BY 4.0' },
        { src: img_histoplasma_1, caption: 'HE do mesmo granuloma: leveduras dentro de histiócitos, cada uma com halo claro de retração (legendas do autor)', stain: 'HE', credit: 'Mikael Häggström, M.D. — Wikimedia Commons, CC BY 4.0' },
        { src: img_histoplasma_2, caption: 'Biópsia de fígado: grupos de leveduras pequenas coradas em vermelho', stain: 'PAS-D', credit: 'Nephron — Wikimedia Commons, CC BY-SA 3.0' },
        { src: img_histoplasma_3, caption: 'Numerosas leveduras pequenas em brotamento, quase invisíveis no HE do mesmo caso', stain: 'Grocott (GMS)', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_histoplasma_4, caption: 'Linfonodo, esfregaço: macrófagos carregados de leveduras', stain: 'Diff-Quik', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
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
        { src: img_paracoccidioides_0, thumb: img_paracoccidioides_0_thumb, caption: 'Célula-mãe com brotamentos múltiplos em roda de leme', stain: 'Prata metenamina (GMS)', credit: 'CDC/Dr. Lucille K. Georg — Public Health Image Library, domínio público' },
        { src: img_paracoccidioides_1, caption: 'Leveduras de parede espessa, algumas com brotos', stain: 'Prata metenamina (GMS)', credit: 'CDC — Public Health Image Library, domínio público' },
        { src: img_paracoccidioides_2, caption: 'Leveduras grandes de parede espessa; à direita, brotos múltiplos em torno da célula-mãe', credit: 'CDC/Dr. Lucille K. Georg — Public Health Image Library, domínio público' },
      ],
    },
    {
      id: 'candida',
      name: 'Candida',
      aka: ['Candidíase', 'Monilíase', 'Candida albicans'],
      summary: 'Leveduras de 3–5 µm com brotamento, pseudo-hifas e hifas verdadeiras, na superfície de mucosas; a mais comum das micoses.',
      description:
        '## Morfologia\n- Leveduras ovais de **3 a 5 µm** com brotamento, **pseudo-hifas** (cadeias de leveduras alongadas com constrições) e, em C. albicans, **hifas verdadeiras** septadas.\n- Fica na **superfície**: entre as escamas da mucosa esofágica ou oral, na camada córnea da pele, com neutrófilos.\n- PAS e Grocott mostram tudo; no HE as pseudo-hifas são discretas e basofílicas.\n- C. glabrata não forma pseudo-hifas: só leveduras pequenas.\n\n## Diferenciais\n- Aspergillus: hifas septadas uniformes com ramificação em 45°, sem leveduras.\n- Malassezia: leveduras com hifas curtas só na camada córnea, sem invasão.\n- Restos de queratina e fibrina imitam pseudo-hifas no HE — confirme com PAS.\n\n## Contexto\n- Esofagite em imunossuprimido, diabético, usuário de corticoide inalatório ou antibiótico; vaginite; intertrigo; onicomicose.\n- Invasão profunda (hifas no tecido, vasos) indica candidíase invasiva, quase sempre em neutropênico ou em terapia intensiva.',
      traits: ['brotamento', 'pseudo-hifa', 'hifa-verdadeira', 'hifa-septada', 'pas', 'grocott', 'citologia'],
      sites: ['esofago', 'mucosa-oral', 'colo-uterino', 'pele', 'estomago', 'sangue'],
      clinical: ['imunossuprimido', 'diabetes', 'hiv', 'neutropenia', 'corticoide', 'imunocompetente', 'agudo'],
      photos: [
        { src: img_candida_0, thumb: img_candida_0_thumb, caption: 'Esôfago: pseudo-hifas e leveduras na camada superficial do epitélio', stain: 'PAS', credit: 'KGH — Wikimedia Commons, CC BY-SA 3.0' },
        { src: img_candida_1, caption: 'Leveduras e pseudo-hifas entre células escamosas descamadas, com neutrófilos', stain: 'PAS', credit: 'CoRus13 — Wikimedia Commons, CC BY-SA 4.0' },
        { src: img_candida_2, caption: 'Colônia de Candida dentro de um abscesso', stain: 'HE', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'aspergillus',
      name: 'Aspergillus',
      aka: ['Aspergilose', 'Bola fúngica', 'Aspergiloma'],
      summary: 'Hifas septadas, finas e de calibre uniforme, com ramificação dicotômica em ângulo agudo (45°); cabeças conidiais só onde há ar.',
      description:
        '## Morfologia\n- Hifas **septadas**, de **3 a 6 µm**, calibre regular, com **ramificação dicotômica em ângulo agudo** (~45°), muitas vezes paralelas e orientadas na mesma direção.\n- **Cabeças conidiais** (vesícula com fiálides e conídios) aparecem quando o fungo cresce em cavidade aerada: bola fúngica, seio, brônquio. Não ocorrem no tecido invadido.\n- Invasão vascular com infarto e necrose na forma invasiva; hifas em cabelo de anjo dentro da parede do vaso.\n- Cristais de oxalato de cálcio (birrefringentes) acompanham A. niger.\n\n## Diferenciais\n- Mucorales: hifas largas, irregulares, quase sem septos, ramificação em ângulo reto.\n- Fusarium e Scedosporium: idênticos no tecido — só a cultura separa. Laude como "hifas septadas compatíveis com Aspergillus".\n- Candida: tem leveduras e pseudo-hifas.\n\n## Contexto\n- **Invasiva**: neutropenia prolongada, transplante, corticoide.\n- **Aspergiloma**: cavidade prévia (tuberculose, bronquiectasia).\n- **Alérgica (ABPA, sinusite alérgica)**: muco eosinofílico com poucas hifas e cristais de Charcot-Leyden.',
      traits: ['hifa-verdadeira', 'hifa-septada', 'esporo', 'grocott', 'pas'],
      sites: ['pulmao', 'seios-paranasais', 'pele', 'snc', 'olho'],
      clinical: ['neutropenia', 'transplante', 'corticoide', 'imunossuprimido', 'cronico', 'imunocompetente'],
      photos: [
        { src: img_aspergillus_0, thumb: img_aspergillus_0_thumb, caption: 'Aspergilose pulmonar invasiva: hifas densas e paralelas com necrose', stain: 'HE', credit: 'Wellcome Collection — Wikimedia Commons, CC0' },
        { src: img_aspergillus_1, caption: 'Cabeças conidiais (frutificação), vistas quando o fungo cresce em cavidade com ar', stain: 'HE', credit: 'Nephron — Wikimedia Commons, CC BY-SA 3.0' },
        { src: img_aspergillus_2, caption: 'Bola fúngica: hifas em arranjo radiado', stain: 'HE', credit: 'CoRus13 — Wikimedia Commons, CC BY-SA 4.0' },
        { src: img_aspergillus_3, caption: 'Seio paranasal: cabeça conidial de A. niger com conídios pigmentados e cristais de oxalato de cálcio', stain: 'HE', credit: 'OKJaguar — Wikimedia Commons, CC BY-SA 4.0' },
      ],
    },
    {
      id: 'mucorales',
      name: 'Mucorales (Rhizopus, Mucor, Lichtheimia)',
      aka: ['Mucormicose', 'Zigomicose'],
      summary: 'Hifas largas (5–20 µm), em fita, de calibre irregular, quase sem septos, com ramificação em ângulo reto; invadem vasos e causam infarto.',
      description:
        '## Morfologia\n- Hifas **largas, de 5 a 20 µm**, parede fina, **calibre irregular** (dobram e colapsam como fitas), **raros septos** (cenocíticas).\n- **Ramificação em ângulo reto**, não dicotômica.\n- **Angioinvasão** com trombose e infarto: tecido necrótico onde as hifas são mais fáceis de achar na parede dos vasos.\n- Coram mal pelo Grocott (parede fina) — o HE muitas vezes mostra melhor. PAS ajuda.\n\n## Diferenciais\n- Aspergillus: hifas finas, uniformes, septadas, ângulo agudo.\n- Cortes tangenciais de hifas de Aspergillus parecem largos: procure septos e a regularidade do calibre.\n\n## Contexto\n- **Cetoacidose diabética** (forma rino-orbito-cerebral), neutropenia, transplante, ferro/deferoxamina, trauma com solo.\n- Emergência: o diagnóstico na congelação ou no esfregaço muda a conduta cirúrgica.',
      traits: ['hifa-verdadeira', 'hifa-nao-septada', 'grocott', 'pas'],
      sites: ['seios-paranasais', 'pulmao', 'pele', 'intestino', 'snc'],
      clinical: ['diabetes', 'neutropenia', 'transplante', 'imunossuprimido', 'trauma', 'agudo'],
      photos: [
        { src: img_mucorales_0, thumb: img_mucorales_0_thumb, caption: 'Pulmão: hifas largas, de calibre irregular, com ramificação em ângulo reto', stain: 'HE', credit: 'Nephron — Wikimedia Commons, CC BY-SA 3.0' },
      ],
    },
    {
      id: 'cryptococcus',
      name: 'Cryptococcus neoformans / gattii',
      aka: ['Criptococose', 'Torulose'],
      summary: 'Levedura de tamanho variável (4–15 µm) com cápsula mucoide espessa, mucicarmina-positiva, e brotamento único de base estreita.',
      description:
        '## Morfologia\n- Leveduras redondas de **4 a 15 µm**, tamanho **variável** na mesma lâmina, com **cápsula** que aparece como halo claro no HE.\n- **Brotamento único, de base estreita.**\n- **Mucicarmina** cora a cápsula em vermelho; Alcian blue também. **Fontana-Masson** marca a parede (melanina) — útil nas formas com cápsula deficiente.\n- Reação varia de quase nada (lesão "em bolha de sabão" no imunossuprimido) a granuloma.\n\n## Diferenciais\n- Histoplasma: menor, uniforme, sem cápsula, mucicarmina negativa.\n- Blastomyces: base larga, parede espessa, sem cápsula.\n- Cryptococcus capsulodeficiente parece Histoplasma ou Candida glabrata: Fontana-Masson resolve.\n\n## Contexto\n- Meningite e pneumonia no paciente com HIV/aids ou transplantado; C. gattii acomete imunocompetentes.\n- Fezes de pombo, eucaliptos (gattii).',
      traits: ['brotamento', 'brotamento-base-estreita', 'capsula', 'mucicarmina', 'grocott', 'pas', 'granuloma', 'citologia'],
      sites: ['pulmao', 'snc', 'pele', 'linfonodo', 'medula', 'figado'],
      clinical: ['hiv', 'transplante', 'imunossuprimido', 'corticoide', 'imunocompetente'],
      photos: [
        { src: img_cryptococcus_0, thumb: img_cryptococcus_0_thumb, caption: 'Pulmão em paciente com aids: leveduras com cápsula corada em vermelho', stain: 'Mucicarmina', credit: 'CDC/Dr. Edwin P. Ewing, Jr. — Public Health Image Library, domínio público' },
        { src: img_cryptococcus_1, caption: 'Leveduras de tamanhos variados dentro de um alvéolo', stain: 'Prata metenamina (GMS)', credit: 'CDC — Public Health Image Library #963, domínio público' },
        { src: img_cryptococcus_2, caption: 'A cápsula cora em vermelho — o que separa Cryptococcus das outras leveduras', stain: 'Mucicarmina', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_cryptococcus_3, caption: 'Criptococose pulmonar em imunossuprimido', stain: 'Alcian blue-PAS', credit: 'KGH — Wikimedia Commons, CC BY-SA 3.0' },
      ],
    },
    {
      id: 'pneumocystis',
      name: 'Pneumocystis jirovecii',
      aka: ['Pneumocistose', 'PCP', 'Pneumocystis carinii'],
      summary: 'Exsudato alveolar espumoso e eosinofílico no HE; no Grocott, cistos de 4–6 µm em taça ou bola de pingue-pongue amassada, sem brotamento.',
      description:
        '## Morfologia\n- No HE, alvéolos cheios de um **exsudato espumoso, eosinofílico, acelular** — o organismo não se vê.\n- No **Grocott**, cistos redondos ou em **taça / bola amassada**, de **4 a 6 µm**, muitas vezes com um ponto central mais escuro; **não brotam** (cistos justapostos imitam brotamento).\n- Pneumonite intersticial leve; formas granulomatosas e cavitárias existem e têm poucos organismos.\n- Imuno-histoquímica e Giemsa (trofozoítos) são alternativas.\n\n## Diferenciais\n- Histoplasma: brotamento verdadeiro, intracelular em macrófagos.\n- Candida glabrata: leveduras com brotamento, sem o exsudato espumoso.\n- Proteinose alveolar: material granular PAS-positivo, sem cistos no Grocott.\n\n## Contexto\n- HIV com CD4 < 200, transplante, corticoide prolongado, quimioterapia.\n- Diagnóstico frequente em lavado broncoalveolar e escarro induzido.',
      traits: ['cisto', 'grocott', 'citologia'],
      sites: ['pulmao'],
      clinical: ['hiv', 'transplante', 'imunossuprimido', 'corticoide', 'agudo'],
      photos: [
        { src: img_pneumocystis_0, thumb: img_pneumocystis_0_thumb, caption: 'Cistos em taça e bola amassada; cistos justapostos podem imitar brotamento', stain: 'Grocott (GMS)', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_pneumocystis_1, caption: 'Exsudato alveolar espumoso e eosinofílico — o aspecto no HE', stain: 'HE', credit: 'Mark ong — Wikimedia Commons, CC BY-SA 4.0' },
        { src: img_pneumocystis_2, caption: 'Biópsia transbrônquica com poucos moldes alveolares espumosos, mas cistos típicos na prata', stain: 'Grocott (GMS)', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'blastomyces',
      name: 'Blastomyces dermatitidis',
      aka: ['Blastomicose norte-americana'],
      summary: 'Levedura grande (8–15 µm) de parede espessa e refringente, com brotamento único de base larga.',
      description:
        '## Morfologia\n- Leveduras redondas de **8 a 15 µm**, parede **espessa, de duplo contorno**, refringente.\n- **Brotamento único de base larga** — a base do broto é quase tão larga quanto a levedura.\n- Núcleos múltiplos visíveis no HE; frequentemente dentro de células gigantes.\n- Reação **piogranulomatosa**: neutrófilos no centro de granulomas, hiperplasia pseudoepiteliomatosa na pele.\n\n## Diferenciais\n- Paracoccidioides: brotos múltiplos, de base estreita, em roda de leme.\n- Cryptococcus: cápsula mucicarmina-positiva, base estreita.\n- Coccidioides: esférula com endósporos, sem brotamento.\n\n## Contexto\n- Endêmico no vale do Mississippi e Grandes Lagos, na América do Norte; raro no Brasil, pense em viagem.\n- Pulmão, pele, osso e próstata; imunocompetentes.',
      traits: ['brotamento', 'brotamento-base-larga', 'granuloma', 'grocott', 'pas', 'multinucleacao'],
      sites: ['pulmao', 'pele', 'osso', 'trato-urinario', 'snc'],
      clinical: ['imunocompetente', 'viagem', 'zona-rural', 'cronico'],
      photos: [
        { src: img_blastomyces_0, thumb: img_blastomyces_0_thumb, caption: 'Levedura com brotamento de base larga e parede de duplo contorno dentro de célula gigante', stain: 'HE', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_blastomyces_1, caption: 'Célula gigante multinucleada com levedura em brotamento no citoplasma', stain: 'HE', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'coccidioides',
      name: 'Coccidioides immitis / posadasii',
      aka: ['Coccidioidomicose', 'Febre do vale'],
      summary: 'Esférulas grandes (20–80 µm) de parede espessa, cheias de endósporos de 2–5 µm que se libertam quando a esférula rompe; sem brotamento.',
      description:
        '## Morfologia\n- **Esférulas** redondas de **20 a 80 µm**, parede espessa e refringente, com **endósporos** de 2 a 5 µm no interior.\n- Esférula rompida libera endósporos que parecem leveduras pequenas sem brotamento.\n- Hifas e artroconídios só em cavidades ou em cultura — não confundir com Aspergillus.\n- Granulomas necrosantes, eosinófilos abundantes.\n\n## Diferenciais\n- Rhinosporidium: esporângio muito maior (até 300 µm), mucosa nasal/ocular.\n- Blastomyces e Paracoccidioides: brotamento.\n- Endósporos soltos vs. Histoplasma: procure a esférula-mãe.\n\n## Contexto\n- Solo árido: sudoeste dos EUA, norte do México, Argentina e, no Brasil, o **semiárido nordestino** (caçadores de tatu).\n- Pneumonia autolimitada na maioria; disseminação em imunossuprimidos.',
      traits: ['esferula', 'esporo', 'granuloma', 'grocott', 'pas'],
      sites: ['pulmao', 'pele', 'osso', 'snc', 'linfonodo'],
      clinical: ['viagem', 'zona-rural', 'imunocompetente', 'imunossuprimido'],
      photos: [
        { src: img_coccidioides_0, thumb: img_coccidioides_0_thumb, caption: 'Esférulas e endósporos liberados no pulmão', stain: 'Prata metenamina (GMS)', credit: 'CDC — Public Health Image Library #578, domínio público' },
        { src: img_coccidioides_1, caption: 'Esférula madura cheia de endósporos, com neutrófilos ao redor', stain: 'HE', credit: 'CDC — Public Health Image Library #480, domínio público' },
        { src: img_coccidioides_2, caption: 'Esférula corada pelo PAS', stain: 'PAS', credit: 'CDC — Public Health Image Library, domínio público' },
      ],
    },
    {
      id: 'trypanosoma-cruzi',
      name: 'Trypanosoma cruzi',
      aka: ['Doença de Chagas', 'Ninhos de amastigotas'],
      summary: 'Ninhos (pseudocistos) de amastigotas de 2–4 µm dentro de fibras musculares cardíacas, cada uma com núcleo e cinetoplasto em barra.',
      description:
        '## Morfologia\n- **Amastigotas** de 2 a 4 µm, redondas, com núcleo e um **cinetoplasto** em barra, agrupadas num **pseudocisto** intracelular — fibra miocárdica, músculo liso do esôfago e do cólon, glia.\n- Miocardite linfo-histiocitária difusa com fibrose; na fase crônica os ninhos são raros e o achado é a inflamação e a fibrose.\n- Na reativação (HIV, transplante) os ninhos são abundantes, inclusive no cérebro e na pele.\n\n## Diferenciais\n- Toxoplasma: cistos sem cinetoplasto, bradizoítos menores e em forma de banana.\n- Leishmania: também tem cinetoplasto, mas fica em macrófagos, não em fibras musculares.\n- Sarcocystis: cistos muito maiores, com bradizoítos alongados, em músculo.\n\n## Contexto\n- Endêmica na América Latina; transmissão vetorial (barbeiro), oral (açaí, caldo de cana), congênita, transfusional.\n- Megaesôfago e megacólon: destruição do plexo mioentérico.',
      traits: ['intracelular', 'cisto', 'giemsa', 'ihq'],
      sites: ['coracao', 'esofago', 'intestino', 'snc', 'pele'],
      clinical: ['zona-rural', 'hiv', 'transplante', 'cronico', 'agudo'],
      photos: [
        { src: img_trypanosoma_cruzi_0, thumb: img_trypanosoma_cruzi_0_thumb, caption: 'Ninho de amastigotas dentro de fibra miocárdica (coração de macaco, acervo do CDC)', stain: 'HE', credit: 'CDC/Dr. L.L. Moore, Jr. — Public Health Image Library, domínio público' },
      ],
    },
    {
      id: 'toxoplasma',
      name: 'Toxoplasma gondii',
      aka: ['Toxoplasmose'],
      summary: 'Cistos teciduais redondos cheios de bradizoítos e taquizoítos livres em forma de meia-lua; sem cinetoplasto.',
      description:
        '## Morfologia\n- **Cistos** redondos de **20 a 100 µm**, parede fina, repletos de **bradizoítos** pequenos (PAS-positivos); sem inflamação ao redor quando latentes.\n- **Taquizoítos** livres, de 2 a 6 µm, em meia-lua, nas lesões ativas — difíceis no HE; a **imuno-histoquímica** os marca.\n- Encefalite necrosante com vasculite no imunossuprimido.\n- **Linfadenite toxoplásmica** (Piringer-Kuchinka): hiperplasia folicular, agregados de histiócitos epitelioides e hiperplasia de células B monocitoides — quase nunca se vê o parasita.\n\n## Diferenciais\n- Trypanosoma cruzi: amastigotas com cinetoplasto, em músculo.\n- Histoplasma: leveduras em macrófagos, Grocott positivo (Toxoplasma é negativo).\n\n## Contexto\n- Carne malcozida e fezes de gato; infecção congênita (coriorretinite, calcificações cerebrais).\n- Encefalite e miocardite em HIV/aids e transplantados; a maioria é reativação.',
      traits: ['cisto', 'intracelular', 'ihq', 'pas'],
      sites: ['snc', 'linfonodo', 'placenta', 'olho', 'coracao', 'pulmao'],
      clinical: ['hiv', 'transplante', 'imunossuprimido', 'imunocompetente', 'animais', 'alimento'],
      photos: [
        { src: img_toxoplasma_0, thumb: img_toxoplasma_0_thumb, caption: 'Cisto tecidual com bradizoítos em cérebro de camundongo (imagem experimental do CDC/USDA)', credit: 'Jitinder P. Dubey (USDA) — Wikimedia Commons, domínio público' },
        { src: img_toxoplasma_1, caption: 'Biópsia cerebral em paciente com HIV: parasitas marcados pela imuno-histoquímica', stain: 'IHQ anti-Toxoplasma', credit: 'Jensflorian — Wikimedia Commons, CC BY-SA 3.0' },
        { src: img_toxoplasma_2, caption: 'Encefalite toxoplásmica: organismos em marrom na imuno-histoquímica', stain: 'IHQ anti-Toxoplasma', credit: 'Nephron — Wikimedia Commons, CC BY-SA 3.0' },
      ],
    },
    {
      id: 'schistosoma',
      name: 'Schistosoma mansoni (e outros esquistossomos)',
      aka: ['Esquistossomose', 'Ovos de Schistosoma', 'Barriga d\'água'],
      summary: 'Ovos de 100–180 µm com casca refringente e espícula (lateral em S. mansoni, terminal em S. haematobium), cercados por granuloma com eosinófilos.',
      description:
        '## Morfologia\n- **Ovos** ovais de **100 a 180 µm**, casca refringente e acidófila, muitas vezes calcificados ou vazios; **espícula lateral** em S. mansoni, **terminal** em S. haematobium, rudimentar em S. japonicum.\n- **Granuloma** epitelioide com **eosinófilos** ao redor de cada ovo; fibrose concêntrica nas lesões antigas; pigmento esquistossomótico (hemozoína) em macrófagos.\n- Vermes adultos nos vasos mesentéricos raramente aparecem no corte.\n\n## Diferenciais\n- Outros ovos de helmintos em tecido (Ascaris, Enterobius): tamanho, casca e ausência de espícula.\n- Corpo estranho calcificado: procure a casca e a espícula, gire o foco.\n\n## Contexto\n- Endêmica no Nordeste e em Minas Gerais; contato com água doce com caramujos.\n- Fibrose periportal de Symmers, hipertensão portal; pólipos e ovos no reto e no cólon; S. haematobium na bexiga (carcinoma escamoso).',
      traits: ['ovo', 'espicula', 'granuloma', 'pigmentado'],
      sites: ['intestino', 'figado', 'trato-urinario', 'colo-uterino', 'apendice', 'pulmao'],
      clinical: ['zona-rural', 'agua', 'cronico', 'imunocompetente', 'viagem'],
      photos: [
        { src: img_schistosoma_0, thumb: img_schistosoma_0_thumb, caption: 'Ovos calcificados na mucosa do cólon', stain: 'HE', credit: 'Nephron — Wikimedia Commons, CC BY-SA 3.0' },
        { src: img_schistosoma_1, caption: 'Ovos na mucosa colônica, com reação inflamatória ao redor', stain: 'HE', credit: 'Nephron — Wikimedia Commons, CC BY-SA 3.0' },
        { src: img_schistosoma_2, caption: 'Bexiga: ovos de S. haematobium com infiltrado rico em eosinófilos', stain: 'HE', credit: 'CDC/Dr. Edwin P. Ewing, Jr. — Public Health Image Library, domínio público' },
      ],
    },
    {
      id: 'strongyloides',
      name: 'Strongyloides stercoralis',
      aka: ['Estrongiloidíase', 'Hiperinfecção', 'Larva rabditoide'],
      summary: 'Larvas e vermes adultos dentro das criptas duodenais; na hiperinfecção, larvas filarioides em pulmão, parede intestinal e outros órgãos.',
      description:
        '## Morfologia\n- **Fêmeas partenogenéticas e ovos embrionados** nas criptas do duodeno e jejuno, com **larvas rabditoides** eclodindo na mucosa.\n- Eosinofilia tecidual, edema e atrofia vilositária variáveis; pode ser mínima.\n- Na **hiperinfecção**, larvas **filarioides** atravessam a parede intestinal, os vasos e chegam ao pulmão (hemorragia alveolar), fígado, SNC — com bactérias entéricas a reboque.\n\n## Diferenciais\n- Outros nematódeos em corte (Enterobius, Ascaris): localização (luz vs. criptas) e cutícula.\n- Corte tangencial de cripta ou de vaso.\n\n## Contexto\n- Autoinfecção mantém a parasitose por décadas; **corticoide**, HTLV-1, transplante e quimioterapia disparam a hiperinfecção.\n- Rastreie antes de imunossuprimir; eosinofilia periférica pode faltar.',
      traits: ['larva', 'verme', 'ovo'],
      sites: ['intestino', 'estomago', 'pulmao', 'pele'],
      clinical: ['corticoide', 'transplante', 'imunossuprimido', 'zona-rural', 'cronico'],
      photos: [
        { src: img_strongyloides_0, thumb: img_strongyloides_0_thumb, caption: 'Larvas e vermes nas criptas duodenais', stain: 'HE', credit: 'Nephron — Wikimedia Commons, CC BY-SA 3.0' },
        { src: img_strongyloides_1, caption: 'Corte de larva dentro da cripta', stain: 'HE', credit: 'Nephron — Wikimedia Commons, CC BY-SA 3.0' },
        { src: img_strongyloides_2, caption: 'Duodeno: larva na cripta, 40×', stain: 'HE', credit: 'Tissuepathology — Wikimedia Commons, CC BY-SA 3.0' },
      ],
    },
    {
      id: 'enterobius',
      name: 'Enterobius vermicularis',
      aka: ['Oxiúro', 'Oxiuríase', 'Pinworm'],
      summary: 'Verme fino na luz do apêndice, reconhecido em corte pelas duas alas laterais (asas) da cutícula; os ovos são achatados de um lado.',
      description:
        '## Morfologia\n- Verme de **2 a 13 mm**, na **luz** do apêndice ou do cólon, sem invadir a mucosa.\n- No corte transversal, cutícula com **duas alas laterais** (asas) características e intestino central; fêmeas com útero cheio de **ovos** assimétricos, achatados de um lado (50 × 25 µm).\n- Reação inflamatória ausente ou mínima; ocasionalmente eosinófilos ou granuloma quando o verme morre na parede.\n\n## Diferenciais\n- Strongyloides: nas criptas, muito menor.\n- Trichuris, Ascaris: sem alas laterais, tamanhos diferentes.\n\n## Contexto\n- Achado incidental em apendicectomias, sobretudo em crianças; prurido anal.\n- Migração para vagina, endométrio e peritônio produz granulomas com ovos.',
      traits: ['verme', 'ovo'],
      sites: ['apendice', 'intestino', 'anus', 'genital', 'colo-uterino'],
      clinical: ['crianca', 'imunocompetente', 'agudo'],
      photos: [
        { src: img_enterobius_0, thumb: img_enterobius_0_thumb, caption: 'Verme na luz do apêndice: as alas laterais são a assinatura', stain: 'HE', credit: 'Nephron — Wikimedia Commons, CC BY-SA 3.0' },
        { src: img_enterobius_1, caption: 'Detalhe do corte transversal do verme', stain: 'HE', credit: 'Nephron — Wikimedia Commons, CC BY-SA 3.0' },
        { src: img_enterobius_2, caption: 'Corte de oxiúro na luz apendicular', stain: 'HE', credit: 'Patho — Wikimedia Commons, CC BY-SA 3.0' },
        { src: img_enterobius_3, caption: 'Apêndice em pequeno aumento com o verme na luz', stain: 'HE', credit: 'Dr. Roshan Nasimudeen — Wikimedia Commons, CC BY-SA 3.0' },
      ],
    },
    {
      id: 'echinococcus',
      name: 'Echinococcus granulosus',
      aka: ['Cisto hidático', 'Hidatidose', 'Equinococose'],
      summary: 'Cisto com membrana laminada acelular em camadas, camada germinativa interna e protoescólices com ganchos; pericisto fibroso do hospedeiro.',
      description:
        '## Morfologia\n- **Membrana laminada**: acelular, eosinofílica, em camadas concêntricas, **PAS-positiva** — o achado mais constante, mesmo em cistos mortos e calcificados.\n- **Camada germinativa** fina por dentro, com **cápsulas prolígeras** e **protoescólices** (com ganchos refringentes, birrefringentes).\n- **Pericisto**: fibrose e inflamação do hospedeiro, com eosinófilos e células gigantes.\n- Areia hidática no líquido: ganchos e protoescólices.\n\n## Diferenciais\n- Cisto simples ou abscesso: sem membrana laminada.\n- Cisticerco: parede celular fina, escólex único, sem membrana laminada.\n\n## Contexto\n- Cão–ovino; endêmico no Rio Grande do Sul, Uruguai, Argentina.\n- Fígado e pulmão; ruptura causa anafilaxia e disseminação.',
      traits: ['membrana-laminada', 'cisto', 'pas', 'granuloma'],
      sites: ['figado', 'pulmao', 'osso', 'snc', 'pleura'],
      clinical: ['animais', 'zona-rural', 'cronico', 'viagem'],
      photos: [
        { src: img_echinococcus_0, thumb: img_echinococcus_0_thumb, caption: 'Membrana laminada acelular, em camadas, de cisto hidático de pulmão', stain: 'HE', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_echinococcus_1, caption: 'Pericisto fibroso, ectocisto hialino e cápsulas prolígeras com protoescólices (cisto em ovino, CDC)', stain: 'HE', credit: 'CDC — Public Health Image Library #910, domínio público' },
        { src: img_echinococcus_2, caption: 'Panorâmica: parede do cisto à esquerda, conteúdo à direita', stain: 'HE', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'trichinella',
      name: 'Trichinella spiralis',
      aka: ['Triquinose', 'Triquinelose'],
      summary: 'Larva enrolada dentro de uma fibra muscular esquelética transformada em célula-nutridora, com cápsula e infiltrado eosinofílico.',
      description:
        '## Morfologia\n- **Larva** de ~1 mm **enrolada em espiral** dentro da fibra muscular, que perde as estrias e vira **célula-nutridora** com núcleos vesiculosos.\n- Cápsula hialina ao redor; infiltrado de eosinófilos e linfócitos; calcificação nas lesões antigas.\n- Músculos mais ativos: diafragma, língua, masseter, intercostais.\n\n## Diferenciais\n- Cisticerco: muito maior, com escólex.\n- Sarcocystis: bradizoítos numerosos e pequenos, sem larva.\n\n## Contexto\n- Carne de porco ou de caça malcozida; febre, mialgia, edema periorbitário, eosinofilia.\n- Rara no Brasil; surtos ligados a carne de javali e de caça.',
      traits: ['larva', 'verme', 'cisto'],
      sites: ['musculo'],
      clinical: ['alimento', 'agudo', 'imunocompetente'],
      photos: [
        { src: img_trichinella_0, thumb: img_trichinella_0_thumb, caption: 'Larva enrolada dentro da fibra muscular esquelética', stain: 'HE', credit: 'Doc. RNDr. Josef Reischig, CSc. — Wikimedia Commons, CC BY-SA 3.0' },
        { src: img_trichinella_1, caption: 'Complexo célula-nutridora–larva', stain: 'HE', credit: 'Stefan Walkowski — Wikimedia Commons, CC BY-SA 3.0' },
      ],
    },
    {
      id: 'helicobacter',
      name: 'Helicobacter pylori',
      aka: ['H. pylori', 'Gastrite por Helicobacter'],
      summary: 'Bacilos curvos ou em S, de 3 µm, no muco sobre o epitélio foveolar e dentro das fovéolas; gastrite crônica ativa com plasmócitos e neutrófilos.',
      description:
        '## Morfologia\n- Bacilos **curvos, em S ou em gaivota**, de **2 a 4 µm**, no **muco da superfície** e no interior das fovéolas, sem invadir; aderidos ao epitélio.\n- Gastrite **crônica ativa**: plasmócitos na lâmina própria, neutrófilos no epitélio; folículos linfoides; metaplasia intestinal e atrofia com o tempo.\n- HE mostra quando são muitos; **Giemsa modificado**, **Warthin-Starry** e **imuno-histoquímica** para os casos duvidosos ou pós-tratamento.\n- H. heilmannii: espiralado, mais longo (5–10 µm), mais raro.\n\n## Diferenciais\n- Restos de muco e debris: a bactéria tem forma definida e fica sempre no muco, não solta no lúmen.\n- Após inibidor de bomba, migra para o corpo e para dentro das glândulas.\n\n## Contexto\n- Úlcera péptica, adenocarcinoma gástrico e linfoma MALT.',
      traits: ['bacilo', 'giemsa', 'warthin-starry', 'ihq'],
      sites: ['estomago', 'esofago', 'intestino'],
      clinical: ['cronico', 'imunocompetente'],
      photos: [
        { src: img_helicobacter_0, thumb: img_helicobacter_0_thumb, caption: 'Bacilos curvos no muco superficial, corados em azul pelo Giemsa modificado', stain: 'Giemsa', credit: 'Ed Uthman, MD — Wikimedia Commons, CC BY 2.0' },
        { src: img_helicobacter_1, caption: 'Biópsia gástrica: bacilos na superfície e nas fovéolas', stain: 'Giemsa', credit: 'Ed Uthman, MD — Wikimedia Commons, CC BY 2.0' },
        { src: img_helicobacter_2, caption: 'Colonização da superfície do epitélio regenerativo', stain: 'Warthin-Starry', credit: 'Yutaka Tsutsumi, M.D. — Wikimedia Commons, uso livre' },
      ],
    },
    {
      id: 'mycobacterium-leprae',
      name: 'Mycobacterium leprae',
      aka: ['Hanseníase', 'Lepra', 'Bacilo de Hansen'],
      summary: 'Bacilos álcool-ácido resistentes em globias dentro de macrófagos espumosos (Virchow) no polo virchowiano; granulomas em torno de nervos e raros bacilos no tuberculoide.',
      description:
        '## Morfologia\n- **Polo virchowiano (LL)**: derme cheia de **macrófagos espumosos (células de Virchow)** sob uma **faixa de Grenz** subepidérmica; **bacilos numerosos, em globias**, no **Fite-Faraco** (o Ziehl comum descora o M. leprae).\n- **Polo tuberculoide (TT)**: granulomas epitelioides bem formados, **alongados ao redor de nervos e anexos**, poucos ou nenhum bacilo.\n- Formas dimorfas no meio do espectro. **Nervo** com inflamação e destruição é a pista.\n- Hanseníase histoide: nódulos fusocelulares com muitos bacilos.\n\n## Diferenciais\n- Sarcoidose, tuberculose cutânea, leishmaniose: pense em hanseníase sempre que houver granuloma perineural ou infiltrado espumoso — e peça o Fite.\n- Xantoma: espumosos sem bacilos.\n\n## Contexto\n- Brasil é o segundo país em casos; lesões hipocrômicas com perda de sensibilidade, espessamento de nervos.',
      traits: ['baar', 'bacilo', 'granuloma', 'intracelular'],
      sites: ['pele', 'nervo', 'nasofaringe', 'olho'],
      clinical: ['cronico', 'imunocompetente', 'zona-rural'],
      photos: [
        { src: img_mycobacterium_leprae_0, thumb: img_mycobacterium_leprae_0_thumb, caption: 'Hanseníase virchowiana: numerosos bacilos álcool-ácido resistentes', stain: 'Fite-Faraco (Wade-Fite)', credit: 'Department of Pathology, Calicut Medical College — Wikimedia Commons, CC BY-SA 4.0' },
        { src: img_mycobacterium_leprae_1, caption: 'Bacilos em globias dentro de macrófagos', stain: 'Fite-Faraco (Wade-Fite)', credit: 'Department of Pathology, Calicut Medical College — Wikimedia Commons, CC BY-SA 4.0' },
        { src: img_mycobacterium_leprae_2, caption: 'Hanseníase histoide: macrófagos sob a faixa de Grenz repletos de BAAR', stain: 'Fite-Faraco (Wade-Fite)', credit: 'SB Lucas / Wellcome Collection — Wikimedia Commons, CC0' },
        { src: img_mycobacterium_leprae_3, caption: 'HE: epiderme atrófica, faixa de Grenz e macrófagos espumosos (células de Virchow)', stain: 'HE', credit: 'Dr. Roshan Nasimudeen — Wikimedia Commons, CC BY-SA 3.0' },
      ],
    },
    {
      id: 'actinomyces',
      name: 'Actinomyces',
      aka: ['Actinomicose', 'Grânulos de enxofre'],
      summary: 'Colônias basofílicas de filamentos ramificados (grânulos de enxofre) com borda eosinofílica de Splendore-Hoeppli, dentro de abscessos.',
      description:
        '## Morfologia\n- **Grânulos de enxofre**: colônias de **50 a 300 µm**, basofílicas, com **filamentos finos ramificados** que se irradiam para a periferia, onde ganham um manto eosinofílico (**Splendore-Hoeppli**).\n- Cercadas por **neutrófilos**, abscessos e fibrose; fístulas.\n- **Gram-positivos**, Grocott positivo, **não são álcool-ácido resistentes** (diferença de Nocardia).\n\n## Diferenciais\n- Nocardia: filamentos soltos, sem colônia, fracamente ácido-resistentes (Fite).\n- Botriomicose: colônias de cocos (Staphylococcus) com o mesmo manto eosinofílico — o Gram mostra cocos, não filamentos.\n- Micetoma: grão maior, na pele do pé, com hifas (eumicetoma) ou filamentos (actinomicetoma).\n- Colônias em criptas amigdalianas e no apêndice são comensais: só diagnostique actinomicose com invasão e supuração.\n\n## Contexto\n- Cervicofacial (pós-extração dentária), torácica, abdominal (apêndice, ceco), pélvica em usuária de **DIU**.',
      traits: ['filamentoso', 'grao', 'splendore', 'bacilo', 'grocott', 'citologia'],
      sites: ['mucosa-oral', 'pulmao', 'intestino', 'apendice', 'genital', 'colo-uterino'],
      clinical: ['diu', 'cronico', 'imunocompetente'],
      photos: [
        { src: img_actinomyces_0, thumb: img_actinomyces_0_thumb, caption: 'Grânulo de enxofre na mandíbula: filamentos em paliçada na periferia', stain: 'HE', credit: 'Nephron — Wikimedia Commons, CC BY-SA 3.0' },
        { src: img_actinomyces_1, caption: 'Colônia com borda eosinofílica (Splendore-Hoeppli)', stain: 'HE', credit: 'Nephron — Wikimedia Commons, CC BY-SA 3.0' },
        { src: img_actinomyces_2, caption: 'Colônia de Actinomyces dentro de abscesso pulmonar', stain: 'HE', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'nocardia',
      name: 'Nocardia',
      aka: ['Nocardiose'],
      summary: 'Filamentos finos (1 µm), ramificados e fragmentados, soltos em abscessos; Gram-positivos, Grocott-positivos e fracamente ácido-resistentes no Fite.',
      description:
        '## Morfologia\n- Filamentos **finos (~1 µm), ramificados em ângulo reto, em contas**, soltos no pus — **não formam colônias** como Actinomyces.\n- Quase invisíveis no HE; **Gram** e **Grocott** mostram; **Fite-Faraco** (ácido-resistência fraca) confirma.\n- Abscessos com necrose supurativa e tecido de granulação; pouca reação granulomatosa.\n\n## Diferenciais\n- Actinomyces: colônias com Splendore-Hoeppli, Fite negativo.\n- Mycobacterium: bacilos curtos, sem ramificação verdadeira, Ziehl forte.\n- Micetoma por Nocardia brasiliensis: grãos na pele do pé.\n\n## Contexto\n- Pulmão e cérebro em transplantados, corticoterapia, aids; nocardiose cutânea após inoculação em imunocompetente.',
      traits: ['filamentoso', 'bacilo', 'baar', 'grocott'],
      sites: ['pulmao', 'snc', 'pele', 'partes-moles'],
      clinical: ['transplante', 'corticoide', 'imunossuprimido', 'trauma', 'imunocompetente'],
      photos: [
        { src: img_nocardia_0, thumb: img_nocardia_0_thumb, caption: 'Filamentos finos, ramificados, Gram-positivos; sem colônias, ao contrário de Actinomyces', stain: 'Gram', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_nocardia_1, caption: 'Microabscesso cercado por tecido de granulação e fibrose — o padrão da nocardiose', stain: 'HE', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'cmv',
      name: 'Citomegalovírus (CMV)',
      aka: ['Inclusão em olho de coruja', 'Citomegalia'],
      summary: 'Célula aumentada (citomegálica) com inclusão intranuclear grande, basofílica ou anfofílica, cercada de halo, e grânulos citoplasmáticos; endotélio, epitélio e estroma.',
      description:
        '## Morfologia\n- Célula **2 a 4 vezes maior** que as vizinhas, com **inclusão intranuclear** única, grande, com **halo claro** (olho de coruja) e, com frequência, **inclusões citoplasmáticas granulares** basofílicas.\n- Infecta **células endoteliais, estromais e epiteliais** — procure na base das úlceras e nos vasos, não na superfície.\n- Inflamação variável; úlceras no tubo digestivo, pneumonite intersticial, hepatite, retinite.\n- **Imuno-histoquímica** para os casos com poucas células.\n\n## Diferenciais\n- Herpes: multinucleação, moldagem, inclusões em células escamosas superficiais.\n- Adenovírus: inclusão que apaga o núcleo (smudge cell), sem citomegalia.\n- Células de reparo ou de Reed-Sternberg: nucléolo, não inclusão com halo.\n\n## Contexto\n- Transplante, HIV com CD4 baixo, doença inflamatória intestinal em corticoide, infecção congênita.',
      traits: ['inclusao-nuclear', 'inclusao-citoplasmatica', 'ihq'],
      sites: ['intestino', 'esofago', 'pulmao', 'placenta', 'snc', 'figado', 'olho', 'rim'],
      clinical: ['hiv', 'transplante', 'imunossuprimido', 'corticoide', 'agudo'],
      photos: [
        { src: img_cmv_0, thumb: img_cmv_0_thumb, caption: 'Pneumócito citomegálico com inclusão intranuclear e halo', stain: 'HE', credit: 'CDC — Public Health Image Library, domínio público' },
        { src: img_cmv_1, caption: 'Pneumócitos infectados: inclusão nuclear basofílica com halo e grânulos citoplasmáticos', stain: 'HE', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_cmv_2, caption: 'Encefalite congênita: células em olho de coruja', stain: 'HE', credit: 'Jensflorian — Wikimedia Commons, CC BY-SA 4.0' },
      ],
    },
    {
      id: 'hsv',
      name: 'Herpes simples (HSV 1 e 2)',
      aka: ['Herpes', 'Inclusão de Cowdry A', 'Varicela-zóster (mesma morfologia)'],
      summary: 'Células escamosas multinucleadas com moldagem nuclear, cromatina marginada e núcleos em vidro fosco; inclusões eosinofílicas de Cowdry A.',
      description:
        '## Morfologia\n- Os **3 M**: **multinucleação**, **moldagem** dos núcleos uns contra os outros e **marginação** da cromatina, com núcleos em **vidro fosco**.\n- **Inclusões intranucleares eosinofílicas** (Cowdry tipo A) com halo, em fase posterior.\n- Vesícula intraepidérmica por degeneração balonizante; na esofagite, as células infectadas ficam na **borda da úlcera**, no epitélio escamoso.\n- Varicela-zóster tem morfologia idêntica; separa-se por imuno-histoquímica ou clínica.\n\n## Diferenciais\n- CMV: uma célula grande com uma inclusão, no estroma e no endotélio.\n- Células gigantes de reparo ou pênfigo: sem cromatina marginada nem moldagem.\n\n## Contexto\n- Esofagite em imunossuprimido (e ocasionalmente em imunocompetente), herpes genital e labial, hepatite fulminante, encefalite temporal.',
      traits: ['inclusao-nuclear', 'multinucleacao', 'ihq', 'citologia'],
      sites: ['esofago', 'pele', 'mucosa-oral', 'genital', 'colo-uterino', 'figado', 'snc'],
      clinical: ['imunossuprimido', 'hiv', 'imunocompetente', 'ist', 'agudo'],
      photos: [
        { src: img_hsv_0, thumb: img_hsv_0_thumb, caption: 'Os 3 M: marginação da cromatina, multinucleação e moldagem nuclear', stain: 'HE', credit: 'Nephron — Wikimedia Commons, CC BY-SA 3.0' },
        { src: img_hsv_1, caption: 'Células multinucleadas com inclusões eosinofílicas de Cowdry tipo A', stain: 'HE', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_hsv_2, caption: 'Esofagite herpética em paciente sem imunossupressão conhecida', stain: 'HE', credit: 'Ed Uthman, MD — Wikimedia Commons, CC BY 2.0' },
      ],
    },
    {
      id: 'hpv',
      name: 'Papilomavírus humano (HPV)',
      aka: ['Coilócito', 'Condiloma acuminado', 'LSIL', 'Verruga'],
      summary: 'Coilócitos: células escamosas maduras com halo perinuclear amplo e bem delimitado, núcleo aumentado, hipercromático e enrugado, às vezes binucleado.',
      description:
        '## Morfologia\n- **Coilócito**: célula escamosa intermediária ou superficial com **cavidade perinuclear** ampla de borda nítida, citoplasma periférico denso, **núcleo aumentado, hipercromático, de contorno irregular (passa)**, com frequência **binucleação**.\n- Condiloma: papilomatose, acantose, paraceratose e coilocitose nas camadas altas.\n- Verruga vulgar: hiperceratose com paraceratose em colunas e grânulos de querato-hialina grosseiros.\n- Imuno-histoquímica para **p16** marca em bloco as lesões de alto grau (HPV de alto risco).\n\n## Diferenciais\n- Halo de glicogênio (célula navicular): borda difusa, núcleo normal.\n- Atrofia e reparo: sem hipercromasia com halo.\n\n## Contexto\n- IST mais prevalente; rastreio com Papanicolaou; HPV 16 e 18 e o carcinoma do colo, ânus, orofaringe.',
      traits: ['coilocito', 'citologia', 'ihq', 'multinucleacao'],
      sites: ['colo-uterino', 'genital', 'anus', 'pele', 'mucosa-oral'],
      clinical: ['ist', 'hiv', 'imunocompetente', 'cronico'],
      photos: [
        { src: img_hpv_0, thumb: img_hpv_0_thumb, caption: 'Coilócito em citologia cervical: halo perinuclear amplo e núcleo aumentado, hipercromático', stain: 'Papanicolaou', credit: 'Ed Uthman, MD — Wikimedia Commons, CC BY 2.0' },
        { src: img_hpv_1, caption: 'Condiloma acuminado: coilócitos nas camadas superiores', stain: 'HE', credit: 'Nephron — Wikimedia Commons, CC BY-SA 3.0' },
        { src: img_hpv_2, caption: 'Condiloma: papilomatose com coilocitose', stain: 'HE', credit: 'Nephron — Wikimedia Commons, CC BY-SA 3.0' },
      ],
    },
    {
      id: 'molluscum',
      name: 'Molusco contagioso (poxvírus)',
      aka: ['Corpos de Henderson-Paterson', 'Corpos de molusco'],
      summary: 'Lóbulos epidérmicos invertidos, em cratera, cheios de queratinócitos com inclusões citoplasmáticas eosinofílicas enormes (corpos de Henderson-Paterson).',
      description:
        '## Morfologia\n- Lesão **crateriforme** com lóbulos de epiderme hiperplásica voltados para a derme.\n- **Corpos de Henderson-Paterson**: inclusões **citoplasmáticas** eosinofílicas de até 35 µm que comprimem o núcleo para a periferia; ficam basofílicas nas camadas superiores e são eliminadas pelo poro central.\n- Inflamação escassa, exceto na lesão em regressão (infiltrado denso, às vezes granulomatoso).\n\n## Diferenciais\n- Verruga: inclusões intranucleares e grânulos de querato-hialina, sem corpos de molusco.\n- Cisto epidérmico rompido e criptococose cutânea (pápula umbilicada em HIV): morfologia diferente.\n\n## Contexto\n- Crianças (tronco, face), adultos por contato sexual (genital), lesões grandes e numerosas em HIV.',
      traits: ['inclusao-citoplasmatica'],
      sites: ['pele', 'genital'],
      clinical: ['crianca', 'hiv', 'ist', 'imunocompetente'],
      photos: [
        { src: img_molluscum_0, thumb: img_molluscum_0_thumb, caption: 'Lesão crateriforme com inclusões citoplasmáticas eosinofílicas (corpos de Henderson-Paterson)', stain: 'HE', credit: 'CoRus13 — Wikimedia Commons, CC BY-SA 4.0' },
        { src: img_molluscum_1, caption: 'Lóbulos epidérmicos invertidos, em pequeno aumento', stain: 'HE', credit: 'Mikael Häggström, M.D. — Wikimedia Commons, CC0' },
        { src: img_molluscum_2, caption: 'Biópsia de pele das costas de uma menina de 13 anos', stain: 'HE', credit: 'Ed Uthman, MD — Wikimedia Commons, CC BY 2.0' },
      ],
    },
    {
      id: 'giardia',
      name: 'Giardia lamblia (G. duodenalis)',
      aka: ['Giardíase'],
      summary: 'Trofozoítos piriformes, em pera ou em foice, na luz entre as vilosidades duodenais, sem invadir; a mucosa pode ser normal.',
      description:
        '## Morfologia\n- **Trofozoítos** de **10 a 15 µm**, **piriformes** de frente (dois núcleos, "cara de coruja") e **em foice ou meia-lua** de perfil, soltos na luz, entre as vilosidades e nas criptas.\n- **Não invadem**: a mucosa pode ser normal ou ter atrofia vilositária parcial e linfocitose intraepitelial discreta.\n- Giemsa e imuno-histoquímica ajudam quando são poucos.\n\n## Diferenciais\n- Muco e debris celulares: o trofozoíto tem contorno definido e núcleos pareados.\n- Doença celíaca: mesma atrofia, sem organismos.\n\n## Contexto\n- Água contaminada, creches; deficiência de IgA e imunodeficiência comum variável prolongam a infecção.',
      traits: ['trofozoito', 'giemsa', 'citologia'],
      sites: ['intestino'],
      clinical: ['agua', 'crianca', 'imunossuprimido', 'imunocompetente'],
      photos: [
        { src: img_giardia_0, thumb: img_giardia_0_thumb, caption: 'Trofozoítos piriformes e em foice na luz, entre as vilosidades — sem invadir', stain: 'HE', credit: 'Nephron — Wikimedia Commons, CC BY-SA 3.0' },
        { src: img_giardia_1, caption: 'Biópsia duodenal: organismos na superfície da mucosa', stain: 'HE', credit: 'Nephron — Wikimedia Commons, CC BY-SA 3.0' },
      ],
    },
    {
      id: 'demodex',
      name: 'Demodex folliculorum / brevis',
      aka: ['Demodicose', 'Ácaro do folículo'],
      summary: 'Ácaros alongados, de 0,1–0,4 mm, com exoesqueleto refringente e pernas curtas, dentro do infundíbulo folicular e das glândulas sebáceas.',
      description:
        '## Morfologia\n- Ácaro **alongado, em charuto**, com cutícula eosinofílica refringente, estriações e **quatro pares de pernas curtas** na porção anterior; vários por folículo.\n- D. folliculorum no **infundíbulo**, D. brevis na **glândula sebácea**.\n- Achado incidental na maioria das biópsias faciais; inflamação perifolicular e granulomas quando o folículo rompe (demodicose, rosácea).\n\n## Diferenciais\n- Sarcoptes: na camada córnea, não no folículo, corpo arredondado.\n- Fragmento de pelo em corte: sem estrutura interna nem pernas.\n\n## Contexto\n- Face de adultos; blefarite; formas inflamatórias em imunossuprimidos.',
      traits: ['artropode'],
      sites: ['pele'],
      clinical: ['imunocompetente', 'cronico'],
      photos: [
        { src: img_demodex_0, thumb: img_demodex_0_thumb, caption: 'Ácaros dentro do folículo piloso (legendas do autor)', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Steven Adams — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_demodex_1, caption: 'Demodex no infundíbulo folicular', stain: 'HE', credit: 'Patho — Wikimedia Commons, CC BY-SA 3.0' },
        { src: img_demodex_2, caption: 'Vários ácaros num folículo', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Kevin Kuan — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'sarcoptes',
      name: 'Sarcoptes scabiei',
      aka: ['Escabiose', 'Sarna'],
      summary: 'Ácaro arredondado (0,3–0,4 mm), ovos e cíbalas (fezes) dentro de túneis na camada córnea, com espongiose e eosinófilos na derme.',
      description:
        '## Morfologia\n- **Túnel na camada córnea** com o **ácaro** (corpo arredondado com cutícula estriada, espinhos dorsais, pernas curtas), **ovos** ovais e **cíbalas** marrons.\n- Espongiose, exocitose de eosinófilos e infiltrado dérmico perivascular rico em eosinófilos.\n- **Sarna crostosa (norueguesa)**: hiperceratose maciça com centenas de ácaros — imunossuprimido, idoso institucionalizado.\n- "Pink pigtails": fragmentos espiralados de cutícula na camada córnea, pista quando o ácaro não aparece.\n\n## Diferenciais\n- Demodex: dentro do folículo.\n- Dermatite eosinofílica sem ácaro: pense em escabiose e corte mais níveis.\n\n## Contexto\n- Prurido noturno, espaços interdigitais, punhos, genitália; contato domiciliar.',
      traits: ['artropode', 'ovo'],
      sites: ['pele'],
      clinical: ['imunocompetente', 'imunossuprimido', 'crianca', 'cronico'],
      photos: [
        { src: img_sarcoptes_0, thumb: img_sarcoptes_0_thumb, caption: 'Ácaro no interior da camada córnea', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Daniel Lozeau — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_sarcoptes_1, caption: 'Túnel na camada córnea com ácaro e ovos', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Nicole D — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_sarcoptes_2, caption: 'Fêmea com ovos na camada córnea', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Sindy Tu — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'tunga',
      name: 'Tunga penetrans',
      aka: ['Bicho-de-pé', 'Tungíase'],
      summary: 'Pulga fêmea encravada na epiderme do pé: cavidade com exoesqueleto quitinoso, ovos, traqueias e intestino, cercada de hiperplasia epidérmica e inflamação.',
      description:
        '## Morfologia\n- Fêmea grávida (**até 1 cm**) dentro de uma cavidade na epiderme/derme superficial, com **cutícula quitinosa eosinofílica espessa**, **ovos** ovais de ~600 µm, **anéis traqueais** e intestino.\n- Hiperplasia pseudoepiteliomatosa ao redor, infiltrado misto com eosinófilos, infecção bacteriana secundária.\n- Fragmentos de cutícula e ovos são a assinatura quando a pulga foi parcialmente removida.\n\n## Diferenciais\n- Miíase: larva maior, com espinhos cuticulares e musculatura, sem ovos.\n- Cisto epidérmico: sem estruturas do artrópode.\n\n## Contexto\n- Praia, chiqueiro, solo arenoso; pés descalços; periungueal.',
      traits: ['artropode', 'ovo'],
      sites: ['pele'],
      clinical: ['areia', 'zona-rural', 'imunocompetente', 'animais'],
      photos: [
        { src: img_tunga_0, thumb: img_tunga_0_thumb, caption: 'Pulga fêmea encravada na epiderme: exoesqueleto, ovos e traqueias', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Phillip McKee — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_tunga_1, caption: 'Tungíase: lesão clínica e histologia com os ovos', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Cynthia Magro — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_tunga_2, caption: 'Cavidade epidérmica ocupada pela pulga', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Jerad Gardner — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'malassezia',
      name: 'Malassezia (M. furfur, M. globosa)',
      aka: ['Pitiríase versicolor', 'Tinea versicolor', 'Espaguete com almôndegas'],
      summary: 'Leveduras redondas em cachos e hifas curtas, grossas e curvas, restritas à camada córnea: "espaguete com almôndegas"; sem invasão nem inflamação.',
      description:
        '## Morfologia\n- **Leveduras** de 3 a 8 µm, em **cachos**, e **hifas curtas, curvas, septadas**, todas dentro da **camada córnea** — "espaguete com almôndegas".\n- Epiderme e derme quase normais; hiperceratose discreta.\n- Visíveis no HE, óbvias no PAS.\n- Foliculite por Malassezia: leveduras (sem hifas) dentro do folículo dilatado com inflamação.\n\n## Diferenciais\n- Dermatófitos: hifas longas e artroconídios, sem leveduras em cacho.\n- Candida: pseudo-hifas e neutrófilos.\n\n## Contexto\n- Máculas hipo ou hipercrômicas no tronco em clima quente; comensal da pele oleosa.',
      traits: ['brotamento', 'hifa-verdadeira', 'pas', 'grocott'],
      sites: ['pele'],
      clinical: ['imunocompetente', 'cronico'],
      photos: [
        { src: img_malassezia_0, thumb: img_malassezia_0_thumb, caption: 'Escamas com KOH: leveduras e hifas curtas — \'espaguete com almôndegas\'', stain: 'KOH (exame direto)', credit: 'CDC — Public Health Image Library #3938, domínio público' },
      ],
    },
    {
      id: 'tropheryma',
      name: 'Tropheryma whipplei',
      aka: ['Doença de Whipple'],
      summary: 'Lâmina própria do intestino delgado ocupada por macrófagos espumosos com material PAS-positivo diastase-resistente granular; vacúolos lipídicos e linfáticos dilatados.',
      description:
        '## Morfologia\n- Vilosidades alargadas por **macrófagos espumosos** cheios de bacilos degenerados: material **PAS-positivo, diastase-resistente**, granular ou em foice.\n- **Vacúolos lipídicos** extracelulares e linfáticos dilatados na lâmina própria.\n- **Ziehl-Neelsen negativo** — diferencia de Mycobacterium avium, que dá os mesmos macrófagos PAS-positivos mas é BAAR-positivo.\n- Imuno-histoquímica e PCR confirmam.\n\n## Diferenciais\n- Mycobacterium avium-intracellulare (HIV): Ziehl positivo.\n- Histoplasmose, Rhodococcus, malacoplaquia: PAS positivo também — o contexto e as colorações especiais separam.\n\n## Contexto\n- Homem branco de meia-idade, artralgia migratória de anos, diarreia, emagrecimento; endocardite e neurológico.',
      traits: ['intracelular', 'bacilo', 'pas'],
      sites: ['intestino', 'linfonodo', 'snc', 'coracao'],
      clinical: ['cronico', 'imunocompetente'],
      photos: [
        { src: img_tropheryma_0, thumb: img_tropheryma_0_thumb, caption: 'Lâmina própria duodenal ocupada por macrófagos PAS-positivos', stain: 'PAS', credit: 'Dr. Don Xu, Hrach Harutyunyan — Wikimedia Commons, CC BY-SA 4.0' },
        { src: img_tropheryma_1, caption: 'Macrófagos espumosos PAS-positivos nas vilosidades', stain: 'PAS', credit: 'Ed Uthman, MD — Wikimedia Commons, CC BY 2.0' },
      ],
    },
    {
      id: 'treponema',
      name: 'Treponema pallidum',
      aka: ['Sífilis', 'Cancro duro', 'Lues'],
      summary: 'Espiroquetas finas e espiraladas, invisíveis no HE, evidenciadas por imuno-histoquímica ou Warthin-Starry; endarterite com plasmócitos é a pista.',
      description:
        '## Morfologia\n- Espiroqueta de **6 a 15 µm**, espirais regulares, **não se vê no HE**: peça **imuno-histoquímica anti-T. pallidum** (sensível e limpa) ou **Warthin-Starry**.\n- Distribuição: **epiderme (camadas baixas), ao redor de vasos e anexos** na sífilis secundária; no cancro, na base da úlcera.\n- Padrão histológico sugestivo: **plasmócitos** abundantes, **endarterite** com endotélio túrgido, infiltrado liquenoide ou psoriasiforme, granulomas no terciário.\n\n## Diferenciais\n- Outras espiroquetas: Borrelia, treponemas comensais da boca (o anti-T. pallidum cruza com eles — cuidado na mucosa oral).\n- Fibras reticulínicas no Warthin-Starry imitam espiroquetas: a IHQ é melhor.\n\n## Contexto\n- Em ascensão; coinfecção com HIV; qualquer dermatose com plasmócitos merece a pergunta.',
      traits: ['espiroqueta', 'ihq', 'warthin-starry'],
      sites: ['pele', 'mucosa-oral', 'genital', 'linfonodo', 'placenta', 'anus'],
      clinical: ['ist', 'hiv', 'agudo', 'cronico'],
      photos: [
        { src: img_treponema_0, thumb: img_treponema_0_thumb, caption: 'Sífilis secundária: espiroquetas em vermelho na epiderme', stain: 'IHQ anti-T. pallidum', credit: 'Jerad M. Gardner, MD — Wikimedia Commons, CC BY-SA 4.0' },
        { src: img_treponema_1, caption: 'Espiroquetas ao redor dos ductos écrinos', stain: 'IHQ anti-T. pallidum', credit: 'Jerad M. Gardner, MD — Wikimedia Commons, CC BY-SA 4.0' },
      ],
    },
    {
      id: 'alternaria',
      name: 'Alternaria (contaminante)',
      aka: ['Conídios de Alternaria', 'Fungo do ar'],
      summary: 'Macroconídios marrons, multicelulares, em forma de raquete de neve ou clava, com septos transversais e longitudinais; contaminante do ar em esfregaços.',
      description:
        '## Morfologia\n- **Macroconídios** de **20 a 60 µm**, **marrons** (demáceos), em **raquete de neve** ou clava, com **septos transversais e longitudinais** (muriformes) e um bico apical.\n- Aparecem soltos, sem reação inflamatória, em esfregaços de Papanicolaou, lavados e lâminas que ficaram abertas.\n- Feo-hifomicose verdadeira por Alternaria existe (cisto subcutâneo em imunossuprimido): hifas pigmentadas dentro do tecido, com granuloma.\n\n## Diferenciais\n- Corpos escleróticos da cromoblastomicose: menores, redondos, dentro da derme com inflamação.\n- Pólen e outros conídios (Helminthosporium, Curvularia): formas diferentes, mesma lição — sem reação, é contaminante.\n\n## Contexto\n- Não laude como infecção: é o mais frequente contaminante fúngico da citologia.',
      traits: ['esporo', 'pigmentado', 'citologia'],
      sites: ['colo-uterino', 'pulmao', 'pele'],
      clinical: ['contaminante', 'imunossuprimido'],
      photos: [
        { src: img_alternaria_0, thumb: img_alternaria_0_thumb, caption: 'Macroconídios marrons, multicelulares, em raquete de neve, em esfregaço de Papanicolaou', stain: 'Papanicolaou', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Vanda Torous — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'carrapato',
      name: 'Carrapato (Ixodes, Amblyomma, Rhipicephalus)',
      aka: ['Picada de carrapato', 'Ixodidae'],
      summary: 'Artrópode grande com hipostômio denteado enterrado na derme, cercado por cimento eosinofílico e infiltrado dérmico com eosinófilos.',
      description:
        '## Morfologia\n- **Hipostômio** (peça bucal serrilhada) e quelíceras penetrando a epiderme, com um **cimento** eosinofílico amorfo ao redor; o corpo, quando presente, tem cutícula quitinosa, musculatura e intestino cheio de sangue.\n- Derme com infiltrado misto (eosinófilos, neutrófilos, linfócitos), edema, necrose focal; reação granulomatosa persistente quando as peças bucais ficam retidas ("granuloma de carrapato").\n- Pseudolinfoma na picada antiga.\n\n## Diferenciais\n- Outras picadas de artrópodes: sem as peças bucais no corte.\n- Tunga: cavidade epidérmica com ovos.\n\n## Contexto\n- Vetor de febre maculosa (Rickettsia rickettsii, Amblyomma sculptum no Brasil), borreliose e babesiose; zona rural, cavalos e capivaras.',
      traits: ['artropode'],
      sites: ['pele'],
      clinical: ['zona-rural', 'animais', 'imunocompetente'],
      photos: [
        { src: img_carrapato_0, thumb: img_carrapato_0_thumb, caption: 'Carrapato aderido à pele em biópsia por shaving: peças bucais na derme (composição do autor)', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Jerad Gardner — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_carrapato_1, caption: 'Fêmea de Ixodes penetrando a pele, em biópsia por shaving', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Diego Morales — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'miiase',
      name: 'Larva de mosca (miíase)',
      aka: ['Berne', 'Dermatobia hominis', 'Cochliomyia hominivorax', 'Bicheira'],
      summary: 'Larva no subcutâneo com cutícula espessa portando fileiras de espinhos, musculatura estriada e traqueias; cavidade com pus e eosinófilos.',
      description:
        '## Morfologia\n- **Larva** de milímetros a 2 cm numa cavidade dérmica/subcutânea, com **cutícula** eosinofílica **espinhosa**, **musculatura estriada**, **traqueias** e tubo digestivo.\n- Reação inflamatória mista, rica em **eosinófilos**, abscesso e tecido de granulação; poro central de respiração na miíase furunculoide.\n\n## Diferenciais\n- Tunga: fêmea com ovos, na epiderme.\n- Cisticerco ou outro parasita: sem cutícula espinhosa nem traqueias.\n\n## Contexto\n- **Berne** (Dermatobia): nódulo furunculoide único, zona rural, gado. **Bicheira** (Cochliomyia): larvas múltiplas em feridas e cavidades, idosos e acamados.',
      traits: ['artropode', 'larva'],
      sites: ['pele', 'partes-moles'],
      clinical: ['zona-rural', 'animais', 'trauma', 'imunocompetente'],
      photos: [
        { src: img_miiase_0, thumb: img_miiase_0_thumb, caption: 'Miíase: larva no tecido, com cutícula e espinhos (composição do autor)', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer) — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'leishmania',
      name: 'Leishmania (amastigotas)',
      aka: ['Leishmaniose', 'Calazar', 'Úlcera de Bauru', 'Corpúsculos de Leishman-Donovan'],
      summary: 'Amastigotas de 2–4 µm dentro de macrófagos, cada uma com núcleo e um cinetoplasto em barra; Grocott negativo (diferencia de Histoplasma).',
      description:
        '## Morfologia\n- **Amastigotas** redondas ou ovais de **2 a 4 µm**, no citoplasma de **macrófagos**, com **núcleo** e um **cinetoplasto** em barra ao lado — o cinetoplasto é o que Histoplasma não tem.\n- Sem cápsula nem halo verdadeiro; **Giemsa** mostra bem nos esfregaços (medula, aspirado de baço, imprint de pele).\n- **Grocott e PAS negativos** (o Histoplasma é positivo).\n- Pele: infiltrado dérmico difuso de macrófagos, plasmócitos e linfócitos, granulomas tuberculoides nas lesões antigas com poucos parasitas.\n\n## Diferenciais\n- Histoplasma: Grocott positivo, sem cinetoplasto.\n- Toxoplasma e Trypanosoma cruzi: veja os verbetes.\n- Hanseníase virchowiana: macrófagos espumosos com BAAR.\n\n## Contexto\n- Tegumentar (L. braziliensis, L. amazonensis) e visceral (L. infantum) endêmicas no Brasil; cão como reservatório urbano; reativação em HIV.',
      traits: ['intracelular', 'giemsa', 'citologia', 'granuloma'],
      sites: ['pele', 'mucosa-oral', 'nasofaringe', 'medula', 'figado', 'linfonodo'],
      clinical: ['zona-rural', 'hiv', 'imunocompetente', 'cronico', 'animais'],
      photos: [
        { src: img_leishmania_0, thumb: img_leishmania_0_thumb, caption: 'Esfregaço de medula óssea, 1000×: amastigotas dentro e ao redor de um macrófago, cada uma com núcleo e cinetoplasto', stain: 'Esfregaço (Romanowsky)', credit: 'Elikiseleva — Wikimedia Commons, CC BY 4.0' },
      ],
    },
    {
      id: 'cromoblastomicose',
      name: 'Fungos da cromoblastomicose (Fonsecaea, Cladophialophora, Phialophora)',
      aka: ['Cromoblastomicose', 'Corpos escleróticos', 'Células muriformes', 'Corpos de Medlar'],
      summary: 'Corpos escleróticos: células fúngicas redondas, marrons, de parede espessa, com septos em dois planos (muriformes), no meio de granulomas e microabscessos na derme.',
      description:
        '## Morfologia\n- **Corpos escleróticos (muriformes, de Medlar)**: células **redondas, de 5 a 12 µm, marrom-douradas**, parede espessa, divididas por **septos transversais e longitudinais** — não brotam.\n- Visíveis **no HE** pela pigmentação; ficam dentro de células gigantes e em microabscessos de neutrófilos.\n- Hiperplasia pseudoepiteliomatosa, eliminação transepidérmica; hifas pigmentadas curtas na superfície.\n\n## Diferenciais\n- Feo-hifomicose: hifas pigmentadas, sem corpos muriformes.\n- Esporotricose e outras micoses com hiperplasia pseudoepiteliomatosa: os corpos escleróticos definem.\n\n## Contexto\n- Trabalhador rural, membros inferiores, ferimento com madeira ou vegetal; lesões verrucosas de anos.',
      traits: ['pigmentado', 'granuloma', 'pas', 'grocott'],
      sites: ['pele', 'partes-moles'],
      clinical: ['zona-rural', 'trauma', 'imunocompetente', 'cronico'],
      photos: [
        { src: img_cromoblastomicose_0, thumb: img_cromoblastomicose_0_thumb, caption: 'Corpos escleróticos (muriformes) marrons na derme', stain: 'HE', credit: 'Department of Pathology, Calicut Medical College — Wikimedia Commons, CC BY-SA 4.0' },
        { src: img_cromoblastomicose_1, caption: 'Hiperplasia pseudoepiteliomatosa e infiltrado ao redor dos corpos escleróticos', stain: 'HE', credit: 'Department of Pathology, Calicut Medical College — Wikimedia Commons, CC BY-SA 4.0' },
        { src: img_cromoblastomicose_2, caption: 'Corpos escleróticos em exame direto de raspado com KOH', stain: 'KOH (exame direto)', credit: 'Ajay Kumar Chaurasiya — Wikimedia Commons, CC BY 4.0' },
      ],
    },
    {
      id: 'lacazia',
      name: 'Lacazia loboi',
      aka: ['Lobomicose', 'Doença de Jorge Lobo', 'Blastomicose queloidiana'],
      summary: 'Leveduras grandes (6–12 µm), uniformes, de parede espessa, em cadeias unidas por pontes tubulares, lotando histiócitos na derme sob uma faixa de Grenz.',
      description:
        '## Morfologia\n- Leveduras **redondas, uniformes, de 6 a 12 µm**, parede espessa e refringente, em **cadeias** (rosário) conectadas por **pontes estreitas** — brotamento sequencial.\n- Derme preenchida por **histiócitos e células gigantes** repletos de leveduras, com **faixa de Grenz** e epiderme atrófica; fibrose queloidiana.\n- Grocott e PAS realçam; a parede birrefringe à luz polarizada.\n\n## Diferenciais\n- Paracoccidioides: tamanho variável, brotos múltiplos em roda de leme, acomete mucosa e pulmão.\n- Blastomyces: brotamento único de base larga.\n\n## Contexto\n- Amazônia (Brasil, Colômbia), ribeirinhos e golfinhos; nódulos queloidianos de crescimento lento por anos; não cultivável.',
      traits: ['brotamento', 'grocott', 'pas', 'intracelular'],
      sites: ['pele'],
      clinical: ['zona-rural', 'cronico', 'imunocompetente', 'trauma'],
      photos: [
        { src: img_lacazia_0, thumb: img_lacazia_0_thumb, caption: 'Derme com faixa de Grenz e infiltrado histiocitário repleto de leveduras (canto inferior direito)', stain: 'HE', credit: 'CDC — Public Health Image Library, domínio público' },
      ],
    },
    {
      id: 'micetoma',
      name: 'Micetoma (eumicetoma e actinomicetoma)',
      aka: ['Pé de Madura', 'Maduromicose', 'Grãos de micetoma'],
      summary: 'Grãos de 0,2–3 mm dentro de microabscessos no subcutâneo do pé, com manto de Splendore-Hoeppli; hifas largas nos eumicetomas, filamentos finos nos actinomicetomas.',
      description:
        '## Morfologia\n- **Grãos** (grânulos) de **0,2 a 3 mm** no centro de **microabscessos** de neutrófilos, cercados por tecido de granulação e fibrose; fístulas que drenam os grãos.\n- **Eumicetoma** (fungos: Madurella, Scedosporium): grão de **hifas largas (2–6 µm)** com clamidoconídios na periferia; **grãos pretos** em Madurella.\n- **Actinomicetoma** (Nocardia brasiliensis, Actinomadura, Streptomyces): grão de **filamentos finos (~1 µm)**, borda em franja.\n- **Splendore-Hoeppli** ao redor de ambos. Grocott e Gram separam os dois.\n\n## Diferenciais\n- Actinomicose: grãos menores, sem a topografia do pé, sem fístulas cutâneas múltiplas.\n- Botriomicose: cocos.\n\n## Contexto\n- Ferimento com espinho ou madeira no pé, zona rural, semiárido; tumefação com fístulas de anos. O tipo (fúngico ou bacteriano) decide o tratamento.',
      traits: ['grao', 'splendore', 'hifa-verdadeira', 'filamentoso', 'grocott', 'pigmentado'],
      sites: ['pele', 'partes-moles', 'osso'],
      clinical: ['zona-rural', 'trauma', 'cronico', 'imunocompetente'],
      photos: [
        { src: img_micetoma_0, thumb: img_micetoma_0_thumb, caption: 'Actinomicetoma do pé: microabscessos, cada um com o seu grão', stain: 'HE', credit: 'Ed Uthman, MD — Wikimedia Commons, CC BY 2.0' },
        { src: img_micetoma_1, caption: 'Grão de actinomicetoma com manto de Splendore-Hoeppli', stain: 'HE', credit: 'Ed Uthman, MD — Wikimedia Commons, CC BY 2.0' },
        { src: img_micetoma_2, caption: 'Eumicetoma: grão de hifas coradas pela prata', stain: 'Grocott sobre HE', credit: 'Ed Uthman, MD — Wikimedia Commons, CC BY 2.0' },
      ],
    },
    {
      id: 'rhinosporidium',
      name: 'Rhinosporidium seeberi',
      aka: ['Rinosporidiose'],
      summary: 'Esporângios enormes (100–350 µm) de parede espessa, cheios de endósporos, em pólipo vascularizado da mucosa nasal ou conjuntival.',
      description:
        '## Morfologia\n- **Esporângios** de **100 a 350 µm** com parede espessa e **endósporos** de 5 a 10 µm (maiores perto do poro de liberação), em vários estágios de maturação.\n- Pólipo mucoso com estroma frouxo, vasos, infiltrado misto e reação de corpo estranho aos esporângios rompidos.\n- Parede PAS e Grocott positiva; a mucicarmina cora a parede interna.\n\n## Diferenciais\n- Coccidioides: esférulas muito menores (até 80 µm), pulmão, granuloma.\n- Cistos de glândula mucosa: sem endósporos.\n\n## Contexto\n- Banho em água parada; Índia, Sri Lanka e casos no Brasil; pólipo nasal sangrante ou conjuntival. Organismo não cultivável (Mesomycetozoa).',
      traits: ['esferula', 'esporo', 'pas', 'grocott'],
      sites: ['nasofaringe', 'olho', 'genital'],
      clinical: ['agua', 'zona-rural', 'cronico', 'imunocompetente'],
      photos: [
        { src: img_rhinosporidium_0, thumb: img_rhinosporidium_0_thumb, caption: 'Pólipo nasal: esporângios de tamanhos variados com endósporos', stain: 'HE', credit: 'Microrao — Wikimedia Commons, CC BY-SA 4.0' },
        { src: img_rhinosporidium_1, caption: 'Esporângio maduro de R. seeberi', stain: 'HE', credit: 'CDC/Dr. Lucille K. Georg — Public Health Image Library, domínio público' },
      ],
    },
    {
      id: 'klebsiella-granulomatis',
      name: 'Klebsiella granulomatis',
      aka: ['Donovanose', 'Granuloma inguinal', 'Corpos de Donovan', 'Calymmatobacterium'],
      summary: 'Corpos de Donovan: bacilos encapsulados de 1–2 µm dentro de vacúolos no citoplasma de macrófagos grandes, em lesão genital ulcerada rica em plasmócitos.',
      description:
        '## Morfologia\n- **Corpos de Donovan**: bacilos de **1 a 2 µm**, com cápsula que dá aspecto bipolar de "alfinete de segurança", dentro de **vacúolos citoplasmáticos** de **macrófagos grandes** (células de Pund).\n- Melhor no **Giemsa, Warthin-Starry** ou **imprint** da lesão do que no HE.\n- Úlcera com tecido de granulação, **plasmócitos** abundantes, microabscessos de neutrófilos e hiperplasia pseudoepiteliomatosa nas bordas.\n\n## Diferenciais\n- Leishmaniose: amastigotas com cinetoplasto, Giemsa.\n- Rinoscleroma: mesmas células espumosas com bacilos (Klebsiella rhinoscleromatis) — mas no nariz.\n- Carcinoma escamoso: a hiperplasia pseudoepiteliomatosa engana.\n\n## Contexto\n- IST rara, úlcera genital indolor, vegetante, sangrante; regiões tropicais.',
      traits: ['intracelular', 'bacilo', 'giemsa', 'warthin-starry', 'citologia'],
      sites: ['genital', 'pele', 'anus'],
      clinical: ['ist', 'cronico'],
      photos: [
        { src: img_klebsiella_granulomatis_0, thumb: img_klebsiella_granulomatis_0_thumb, caption: 'Corpos de Donovan: bacilos encapsulados dentro de vacúolos de macrófagos', credit: 'CDC/Susan Lindsley — Public Health Image Library, domínio público' },
        { src: img_klebsiella_granulomatis_1, caption: 'Lesão de donovanose: infiltrado de macrófagos e plasmócitos', stain: 'HE', credit: 'SB Lucas / Wellcome Collection — Wikimedia Commons, CC0' },
      ],
    },
    {
      id: 'dirofilaria',
      name: 'Dirofilaria immitis / repens',
      aka: ['Dirofilariose pulmonar', 'Nódulo pulmonar em moeda', 'Verme do coração do cão'],
      summary: 'Nódulo pulmonar necrótico com o verme em corte dentro de uma artéria trombosada: cutícula espessa com cristas longitudinais e musculatura bem desenvolvida.',
      description:
        '## Morfologia\n- **Nódulo** subpleural de 1 a 3 cm com **infarto/necrose coagulativa** central e, no meio, um vaso trombosado contendo o **verme** (100–300 µm de diâmetro).\n- Cutícula **espessa, multilaminada, com cristas longitudinais** externas; musculatura somática abundante; cordões laterais.\n- Granuloma, eosinófilos e fibrose ao redor; o verme costuma estar degenerado — corte vários níveis.\n- D. repens: nódulo subcutâneo ou conjuntival, verme vivo.\n\n## Diferenciais\n- Outros nematódeos em tecido: só a cutícula com cristas e o contexto vascular identificam.\n- Metástase ou granuloma infeccioso: a clínica é de nódulo em moeda assintomático.\n\n## Contexto\n- Mosquito transmite a partir do cão; o homem é hospedeiro acidental e o verme morre na artéria pulmonar.',
      traits: ['verme', 'granuloma'],
      sites: ['pulmao', 'pele', 'olho'],
      clinical: ['animais', 'imunocompetente'],
      photos: [
        { src: img_dirofilaria_0, thumb: img_dirofilaria_0_thumb, caption: 'Nódulo pulmonar necrótico com cortes do verme', stain: 'HE', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'raiva',
      name: 'Vírus da raiva (corpúsculos de Negri)',
      aka: ['Raiva', 'Corpúsculos de Negri', 'Encefalite rábica'],
      summary: 'Corpúsculos de Negri: inclusões citoplasmáticas eosinofílicas, redondas ou ovais, de 2–10 µm, em neurônios do hipocampo e células de Purkinje.',
      description:
        '## Morfologia\n- **Corpúsculos de Negri**: inclusões **citoplasmáticas**, **eosinofílicas**, redondas ou ovais, de **2 a 10 µm**, às vezes com grânulos basofílicos internos, em **neurônios piramidais do hipocampo (corno de Amon)** e **células de Purkinje**.\n- Encefalite discreta para a gravidade clínica: manguitos perivasculares, nódulos microgliais (nódulos de Babes), neuronofagia.\n- Ausentes em até 30% dos casos; a **imunofluorescência/IHQ** para o antígeno rábico é o padrão.\n\n## Diferenciais\n- Inclusões neuronais de outras causas (lipofuscina, corpos de Lewy no tronco): distribuição e contexto.\n- Outras encefalites virais: sem inclusões citoplasmáticas eosinofílicas.\n\n## Contexto\n- Mordida de cão, morcego, gato; letal; diagnóstico post-mortem no SNC.',
      traits: ['inclusao-citoplasmatica', 'ihq'],
      sites: ['snc'],
      clinical: ['animais', 'agudo'],
      photos: [
        { src: img_raiva_0, thumb: img_raiva_0_thumb, caption: 'Corpúsculos de Negri: inclusões citoplasmáticas eosinofílicas em neurônio (anotação do autor)', stain: 'HE', credit: 'CDC/Dr. Daniel P. Perl, anotação de Mikael Häggström — Wikimedia Commons, CC0' },
        { src: img_raiva_1, caption: 'Corpúsculo de Negri em célula de Purkinje do cerebelo', stain: 'HE', credit: 'CDC/Dr. Makonnen Fekadu — Public Health Image Library, domínio público' },
        { src: img_raiva_2, caption: 'Encefalite rábica com corpúsculos de Negri', stain: 'HE', credit: 'CDC/Dr. Daniel P. Perl — Public Health Image Library, domínio público' },
      ],
    },
    {
      id: 'poliomavirus-bk',
      name: 'Poliomavírus BK',
      aka: ['Nefropatia por BK', 'Células decoy (chamariz)', 'Cistite hemorrágica'],
      summary: 'Núcleos tubulares aumentados, em vidro fosco, com inclusão basofílica que ocupa o núcleo todo; na urina, células decoy que imitam carcinoma urotelial.',
      description:
        '## Morfologia\n- Células tubulares (e uroteliais) com **núcleo aumentado, cromatina em vidro fosco** ou **inclusão basofílica homogênea** que apaga o núcleo, sem halo; descamação tubular, tubulite e nefrite intersticial.\n- **Imuno-histoquímica anti-SV40** (antígeno T grande, cruza com BK e JC) confirma.\n- **Células decoy** na citologia urinária: núcleo grande, cromatina homogênea e opaca, sem o pleomorfismo do carcinoma.\n\n## Diferenciais\n- Rejeição celular aguda: tubulite sem inclusões — o SV40 decide.\n- CMV: citomegalia com inclusão com halo e inclusões citoplasmáticas.\n- Carcinoma urotelial de alto grau na urina: cromatina grosseira e irregular.\n\n## Contexto\n- Rim transplantado (imunossupressão intensa); cistite hemorrágica em transplante de medula.',
      traits: ['inclusao-nuclear', 'ihq', 'citologia'],
      sites: ['rim', 'trato-urinario'],
      clinical: ['transplante', 'imunossuprimido'],
      photos: [
        { src: img_poliomavirus_bk_0, thumb: img_poliomavirus_bk_0_thumb, caption: 'Nefropatia por BK pós-transplante: núcleos tubulares aumentados, em vidro fosco', stain: 'PAS', credit: 'Nephron — Wikimedia Commons, CC BY-SA 3.0' },
        { src: img_poliomavirus_bk_1, caption: 'Marcação nuclear pelo anticorpo anti-SV40 (reação cruzada com o BK)', stain: 'IHQ SV40', credit: 'Nephron — Wikimedia Commons, CC BY-SA 3.0' },
      ],
    },
    {
      id: 'virus-jc',
      name: 'Vírus JC (leucoencefalopatia multifocal progressiva)',
      aka: ['LEMP', 'PML', 'Leucoencefalopatia multifocal progressiva'],
      summary: 'Desmielinização multifocal com oligodendrócitos de núcleo aumentado e inclusão em vidro fosco na borda das lesões, astrócitos bizarros e macrófagos espumosos.',
      description:
        '## Morfologia\n- Focos de **desmielinização** na substância branca com **macrófagos espumosos**.\n- **Oligodendrócitos** na periferia com **núcleo aumentado, cromatina em vidro fosco, magenta/anfofílica** (inclusão viral).\n- **Astrócitos bizarros**, hipercromáticos, que imitam glioma.\n- **Imuno-histoquímica anti-SV40** marca os núcleos infectados.\n\n## Diferenciais\n- Glioma: os astrócitos atípicos da LEMP não formam massa e vêm com a desmielinização e os oligodendrócitos com inclusão.\n- Esclerose múltipla: sem inclusões.\n\n## Contexto\n- HIV com CD4 baixo, natalizumab, rituximab, transplante.',
      traits: ['inclusao-nuclear', 'ihq'],
      sites: ['snc'],
      clinical: ['hiv', 'imunossuprimido', 'corticoide'],
      photos: [
        { src: img_virus_jc_0, thumb: img_virus_jc_0_thumb, caption: 'Oligodendrócitos com núcleos aumentados e cromatina em vidro fosco magenta', stain: 'HE', credit: 'Jensflorian — Wikimedia Commons, CC BY-SA 4.0' },
        { src: img_virus_jc_1, caption: 'Inclusões marcadas pelo anti-SV40', stain: 'IHQ SV40', credit: 'Jensflorian — Wikimedia Commons, CC BY-SA 4.0' },
      ],
    },
    {
      id: 'trichomonas',
      name: 'Trichomonas vaginalis',
      aka: ['Tricomoníase'],
      summary: 'Trofozoíto piriforme ou redondo, de 15–30 µm, cinza-esverdeado no Papanicolaou, com núcleo pequeno excêntrico e grânulos citoplasmáticos; os flagelos raramente se veem.',
      description:
        '## Morfologia\n- Organismo **piriforme ou arredondado** de **15 a 30 µm**, citoplasma **cinza-esverdeado ou acinzentado** no Papanicolaou, **núcleo pequeno, pálido e excêntrico**, grânulos eosinofílicos finos; flagelos quase nunca visíveis.\n- Fundo com **neutrófilos**, halos perinucleares nas escamosas e **Leptothrix** (filamentos longos) frequentemente associado.\n- Não confundir com fragmentos citoplasmáticos, células parabasais degeneradas ou muco.\n\n## Diferenciais\n- Célula parabasal degenerada: núcleo maior e mais denso.\n- Citoplasma solto: sem núcleo.\n\n## Contexto\n- IST; corrimento amarelo-esverdeado bolhoso; achado incidental no rastreio.',
      traits: ['trofozoito', 'citologia'],
      sites: ['colo-uterino', 'genital', 'trato-urinario'],
      clinical: ['ist', 'imunocompetente'],
      photos: [
        { src: img_trichomonas_0, thumb: img_trichomonas_0_thumb, caption: 'Papanicolaou: organismo piriforme acinzentado (canto superior direito) entre células escamosas', stain: 'Papanicolaou', credit: 'Nephron — Wikimedia Commons, CC BY-SA 3.0' },
      ],
    },
    {
      id: 'mycobacterium-tuberculosis',
      name: 'Mycobacterium tuberculosis',
      aka: ['Tuberculose', 'BAAR', 'Bacilo de Koch', 'Granuloma caseoso'],
      summary: 'Granulomas epitelioides com necrose caseosa e células gigantes de Langhans; bacilos álcool-ácido resistentes finos, curvos, em vermelho no Ziehl-Neelsen, poucos e na necrose.',
      description:
        '## Morfologia\n- **Granuloma caseoso**: centro de **necrose granular eosinofílica** sem estrutura, margem de **células epitelioides** e **células gigantes de Langhans** (núcleos em ferradura), coroa de linfócitos.\n- Bacilos **finos (0,4 × 3 µm), curvos, em contas**, vermelhos no **Ziehl-Neelsen**, geralmente **poucos** e dentro da necrose ou nas células gigantes — procure com objetiva de imersão.\n- No imunossuprimido: necrose com neutrófilos e muitos bacilos, granuloma mal formado.\n- PCR no bloco quando o Ziehl é negativo.\n\n## Diferenciais\n- Micobactérias não tuberculosas e hanseníase: mesmo Ziehl, contexto diferente.\n- Sarcoidose: granulomas "nus", sem necrose, Ziehl negativo.\n- Fungos: Grocott — todo granuloma necrosante merece Ziehl e Grocott.\n\n## Contexto\n- Pulmão, linfonodo cervical (escrófula), pleura, intestino, epidídimo, osso, meninge; HIV, diabetes, imunobiológicos.',
      traits: ['baar', 'bacilo', 'granuloma', 'multinucleacao'],
      sites: ['pulmao', 'linfonodo', 'pleura', 'intestino', 'osso', 'snc', 'trato-urinario', 'genital', 'placenta', 'pele'],
      clinical: ['hiv', 'imunossuprimido', 'corticoide', 'diabetes', 'imunocompetente', 'cronico'],
      photos: [
        { src: img_mycobacterium_tuberculosis_0, thumb: img_mycobacterium_tuberculosis_0_thumb, caption: 'Bacilos álcool-ácido resistentes em vermelho (trombo placentário)', stain: 'Ziehl-Neelsen', credit: 'CDC — Public Health Image Library, domínio público' },
        { src: img_mycobacterium_tuberculosis_1, caption: 'Granuloma caseoso em linfonodo: necrose granular eosinofílica margeada por células epitelioides', stain: 'HE', credit: 'Department of Pathology, Calicut Medical College — Wikimedia Commons, CC BY-SA 4.0' },
        { src: img_mycobacterium_tuberculosis_2, caption: 'Linfonodo com granulomas caseosos, pequeno aumento', stain: 'HE', credit: 'Department of Pathology, Calicut Medical College — Wikimedia Commons, CC BY-SA 4.0' },
        { src: img_mycobacterium_tuberculosis_3, caption: 'Granuloma tuberculoide: células epitelioides, célula gigante de Langhans e necrose caseosa', stain: 'HE', credit: 'Humpath — Wikimedia Commons, CC BY-SA 3.0' },
      ],
    },
    {
      id: 'cysticercus',
      name: 'Cysticercus (Taenia solium)',
      aka: ['Cisticercose', 'Neurocisticercose', 'Cisticerco'],
      summary: 'Cisto de 5–20 mm com parede fina e membranosa de três camadas e um escólex invaginado com ganchos e ventosas; calcifica quando morre.',
      description:
        '## Morfologia\n- Vesícula de **5 a 20 mm** com **parede fina** de três camadas (cuticular eosinofílica ondulada, celular e reticular) e, no interior, o **escólex invaginado** com **quatro ventosas e rostelo com ganchos** birrefringentes; corpúsculos calcários no parênquima.\n- Cisto vivo: quase nenhuma inflamação. Cisto degenerado: inflamação granulomatosa densa com eosinófilos, depois fibrose e **calcificação**.\n- Forma racemosa (sem escólex) nas cisternas da base.\n\n## Diferenciais\n- Cisto hidático: membrana laminada acelular espessa.\n- Cisto simples ou abscesso: sem parede parasitária.\n\n## Contexto\n- Ingestão de ovos de T. solium (água, hortaliças, autoinfecção); epilepsia de início tardio; nódulos subcutâneos e musculares calcificados.',
      traits: ['cisto', 'verme'],
      sites: ['snc', 'musculo', 'olho', 'pele', 'partes-moles'],
      clinical: ['zona-rural', 'agua', 'alimento', 'cronico'],
      photos: [],
    },
    {
      id: 'sporothrix',
      name: 'Sporothrix schenckii / brasiliensis',
      aka: ['Esporotricose', 'Corpo asteroide', 'Esporotricose zoonótica'],
      summary: 'Leveduras raras, ovais ou em charuto (2–6 µm), difíceis no HE; granulomas supurativos com hiperplasia pseudoepiteliomatosa e, às vezes, corpo asteroide.',
      description:
        '## Morfologia\n- Leveduras **ovais ou em charuto, de 2 a 6 µm**, com brotamento, **escassas** — muitas vezes só o Grocott ou o PAS as encontra, e mesmo assim em poucos campos.\n- **Corpo asteroide**: levedura central com raios eosinofílicos de Splendore-Hoeppli — sugestivo, não exclusivo.\n- Padrão: **granulomas supurativos** (neutrófilos no centro, epitelioides e gigantes ao redor) na derme, com **hiperplasia pseudoepiteliomatosa**; linfangite nodular ascendente.\n- Na esporotricose por S. brasiliensis (transmitida por gatos) as leveduras costumam ser mais numerosas.\n\n## Diferenciais\n- Leishmaniose, cromoblastomicose, micobacteriose atípica e tuberculose cutânea: mesma reação — as colorações especiais decidem.\n- Histoplasma: intracelular e em maior número.\n\n## Contexto\n- Arranhadura ou mordida de **gato** (epidemia urbana no Rio de Janeiro e no Sul), espinho de roseira, jardinagem.',
      traits: ['brotamento', 'granuloma', 'splendore', 'pas', 'grocott'],
      sites: ['pele', 'linfonodo', 'partes-moles', 'osso'],
      clinical: ['animais', 'trauma', 'zona-rural', 'imunocompetente', 'cronico'],
      photos: [],
    },
    {
      id: 'entamoeba',
      name: 'Entamoeba histolytica',
      aka: ['Amebíase', 'Colite amebiana', 'Abscesso hepático amebiano'],
      summary: 'Trofozoítos de 15–40 µm com citoplasma espumoso, núcleo pequeno com cariossoma central e hemácias fagocitadas, na superfície de úlceras em botão de camisa no cólon.',
      description:
        '## Morfologia\n- **Trofozoítos** grandes (**15 a 40 µm**), citoplasma **espumoso e PAS-positivo**, **núcleo pequeno redondo com cariossoma central** e cromatina periférica fina; **hemácias fagocitadas** confirmam E. histolytica.\n- Ficam no **exsudato de fibrina e muco na superfície** e no fundo das úlceras, não invadem a lâmina própria em profundidade.\n- Úlceras **em botão de camisa** (estreitas na mucosa, largas na submucosa) no ceco e reto; necrose com poucos neutrófilos.\n- Abscesso hepático: necrose "em pasta de anchova", trofozoítos na borda.\n\n## Diferenciais\n- Macrófagos: núcleo maior, sem cariossoma central; a ameba é maior e PAS forte.\n- Doença inflamatória intestinal: a amebíase é o grande mímico — procure os trofozoítos antes de fechar Crohn ou retocolite.\n\n## Contexto\n- Água e alimentos contaminados; disenteria; a Entamoeba dispar é idêntica e comensal.',
      traits: ['trofozoito', 'pas', 'citologia'],
      sites: ['intestino', 'figado', 'pele'],
      clinical: ['agua', 'viagem', 'agudo', 'imunocompetente'],
      photos: [],
    },
    {
      id: 'cryptosporidium',
      name: 'Cryptosporidium',
      aka: ['Criptosporidiose'],
      summary: 'Esferas basofílicas de 2–5 µm enfileiradas na borda em escova do enterócito, como se fossem "bolhas" na superfície; intracelulares mas extracitoplasmáticas.',
      description:
        '## Morfologia\n- Corpúsculos **redondos, basofílicos, de 2 a 5 µm**, alinhados na **superfície apical** dos enterócitos e do epitélio das criptas — parecem sentados na borda em escova (na verdade estão dentro de um vacúolo parasitóforo, extracitoplasmático).\n- Atrofia vilositária leve, hiperplasia de criptas, inflamação discreta.\n- Giemsa e imuno-histoquímica ajudam; o HE bem cortado costuma bastar.\n\n## Diferenciais\n- Muco, debris ou cortes tangenciais da borda em escova: o Cryptosporidium tem tamanho uniforme e distribuição em fila.\n- Cystoisospora: intracelular, maior, dentro do citoplasma.\n- Microsporídios: menores (1–2 µm), supranucleares, precisam de Gram modificado ou tricrômico.\n\n## Contexto\n- Diarreia crônica em HIV/aids; surtos por água em imunocompetentes e crianças; vias biliares em imunossuprimidos.',
      traits: ['intracelular', 'giemsa', 'ihq'],
      sites: ['intestino', 'figado', 'estomago'],
      clinical: ['hiv', 'imunossuprimido', 'agua', 'crianca'],
      photos: [],
    },
    {
      id: 'bartonella',
      name: 'Bartonella henselae / quintana',
      aka: ['Angiomatose bacilar', 'Doença da arranhadura do gato', 'Peliose hepática bacilar'],
      summary: 'Proliferação vascular lobular com endotélio epitelioide, neutrófilos e agregados granulares roxos de bacilos, prateados no Warthin-Starry.',
      description:
        '## Morfologia\n- **Angiomatose bacilar**: lóbulos de **capilares com células endoteliais epitelioides**, protuberantes, com **neutrófilos** e **leucocitoclasia** entre os vasos e **agregados granulares anfofílicos** de bactérias no interstício — que viram bacilos pretos no **Warthin-Starry**.\n- **Arranhadura do gato (linfonodo)**: granulomas com **microabscessos estrelados** (necrose supurativa central), histiócitos em paliçada; bacilos raros, Warthin-Starry ou IHQ.\n- Peliose bacilar no fígado e baço.\n\n## Diferenciais\n- Sarcoma de Kaposi: fusocelular, fendas vasculares, HHV-8 positivo, sem neutrófilos nem grânulos bacterianos.\n- Granuloma piogênico: sem os agregados bacterianos.\n- Linfadenites supurativas granulomatosas: linfogranuloma venéreo, tularemia, Yersinia.\n\n## Contexto\n- Angiomatose e peliose: HIV/aids. Arranhadura do gato: imunocompetente, criança, gato filhote.',
      traits: ['bacilo', 'warthin-starry', 'granuloma', 'ihq'],
      sites: ['pele', 'linfonodo', 'figado', 'osso'],
      clinical: ['hiv', 'imunossuprimido', 'animais', 'crianca', 'imunocompetente'],
      photos: [],
    },
    {
      id: 'dermatofitos',
      name: 'Dermatófitos (Trichophyton, Microsporum, Epidermophyton)',
      aka: ['Tinha', 'Onicomicose', 'Tinea', 'Dermatofitose'],
      summary: 'Hifas septadas e artroconídios só na camada córnea, na unha e na haste do pelo; paraceratose com neutrófilos e o "sinal do sanduíche".',
      description:
        '## Morfologia\n- **Hifas septadas** finas e **artroconídios** (cadeias de esporos retangulares) dentro da **camada córnea**, da **lâmina ungueal** ou **ao redor e dentro da haste do pelo** (ecto e endótrix).\n- No HE quase não aparecem: pistas são **neutrófilos na camada córnea**, paraceratose e o **sinal do sanduíche** (hifas entre camada córnea compacta abaixo e ortoqueratose/paraceratose acima). **PAS** confirma.\n- Foliculite e reação granulomatosa quando o folículo rompe (granuloma de Majocchi).\n\n## Diferenciais\n- Candida: leveduras e pseudo-hifas.\n- Malassezia: leveduras em cacho com hifas curtas.\n- Bactérias e fibras na camada córnea: PAS negativas ou sem septos.\n\n## Contexto\n- Tinha do pé, corporal, capitis (Microsporum canis, gatos e cães), onicomicose; peça PAS em toda biópsia de dermatite sem diagnóstico.',
      traits: ['hifa-verdadeira', 'hifa-septada', 'esporo', 'pas', 'grocott'],
      sites: ['pele'],
      clinical: ['imunocompetente', 'cronico', 'animais'],
      photos: [],
    },
  ],
}
