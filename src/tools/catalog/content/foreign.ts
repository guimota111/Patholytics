/* ==========================================================================
   foreign.ts — Catálogo de corpos estranhos: preenchedores, suturas, talco,
   pólen, medicamentos, material vegetal… Filtra-se por onde aparece e pela
   clínica; não há facetas morfológicas. Os verbetes entram aqui, em código.
   Fotos: Wikimedia Commons (sobretudo o Atlas of Medical Foreign Bodies, de
   Yale Rosen e Mercedes Meseguer), licença livre, crédito em cada uma.
   ========================================================================== */

import { Gem } from 'lucide-react'
import img_sutura_0 from '@/assets/catalog/foreign/sutura-0.jpg'
import img_sutura_0_thumb from '@/assets/catalog/foreign/sutura-0-thumb.jpg'
import img_sutura_1 from '@/assets/catalog/foreign/sutura-1.jpg'
import img_sutura_2 from '@/assets/catalog/foreign/sutura-2.jpg'
import img_sutura_3 from '@/assets/catalog/foreign/sutura-3.jpg'
import img_silicone_0 from '@/assets/catalog/foreign/silicone-0.jpg'
import img_silicone_0_thumb from '@/assets/catalog/foreign/silicone-0-thumb.jpg'
import img_silicone_1 from '@/assets/catalog/foreign/silicone-1.jpg'
import img_silicone_2 from '@/assets/catalog/foreign/silicone-2.jpg'
import img_silicone_3 from '@/assets/catalog/foreign/silicone-3.jpg'
import img_silicone_4 from '@/assets/catalog/foreign/silicone-4.jpg'
import img_silicone_5 from '@/assets/catalog/foreign/silicone-5.jpg'
import img_talco_0 from '@/assets/catalog/foreign/talco-0.jpg'
import img_talco_0_thumb from '@/assets/catalog/foreign/talco-0-thumb.jpg'
import img_talco_1 from '@/assets/catalog/foreign/talco-1.jpg'
import img_talco_2 from '@/assets/catalog/foreign/talco-2.jpg'
import img_talco_3 from '@/assets/catalog/foreign/talco-3.jpg'
import img_silica_0 from '@/assets/catalog/foreign/silica-0.jpg'
import img_silica_0_thumb from '@/assets/catalog/foreign/silica-0-thumb.jpg'
import img_silica_1 from '@/assets/catalog/foreign/silica-1.jpg'
import img_asbesto_0 from '@/assets/catalog/foreign/asbesto-0.jpg'
import img_asbesto_0_thumb from '@/assets/catalog/foreign/asbesto-0-thumb.jpg'
import img_asbesto_1 from '@/assets/catalog/foreign/asbesto-1.jpg'
import img_asbesto_2 from '@/assets/catalog/foreign/asbesto-2.jpg'
import img_asbesto_3 from '@/assets/catalog/foreign/asbesto-3.jpg'
import img_asbesto_4 from '@/assets/catalog/foreign/asbesto-4.jpg'
import img_antracose_0 from '@/assets/catalog/foreign/antracose-0.jpg'
import img_antracose_0_thumb from '@/assets/catalog/foreign/antracose-0-thumb.jpg'
import img_antracose_1 from '@/assets/catalog/foreign/antracose-1.jpg'
import img_antracose_2 from '@/assets/catalog/foreign/antracose-2.jpg'
import img_antracose_3 from '@/assets/catalog/foreign/antracose-3.jpg'
import img_tatuagem_0 from '@/assets/catalog/foreign/tatuagem-0.jpg'
import img_tatuagem_0_thumb from '@/assets/catalog/foreign/tatuagem-0-thumb.jpg'
import img_tatuagem_1 from '@/assets/catalog/foreign/tatuagem-1.jpg'
import img_marcador_endoscopico_0 from '@/assets/catalog/foreign/marcador-endoscopico-0.jpg'
import img_marcador_endoscopico_0_thumb from '@/assets/catalog/foreign/marcador-endoscopico-0-thumb.jpg'
import img_amido_0 from '@/assets/catalog/foreign/amido-0.jpg'
import img_amido_0_thumb from '@/assets/catalog/foreign/amido-0-thumb.jpg'
import img_amido_1 from '@/assets/catalog/foreign/amido-1.jpg'
import img_amido_2 from '@/assets/catalog/foreign/amido-2.jpg'
import img_pelo_0 from '@/assets/catalog/foreign/pelo-0.jpg'
import img_pelo_0_thumb from '@/assets/catalog/foreign/pelo-0-thumb.jpg'
import img_pelo_1 from '@/assets/catalog/foreign/pelo-1.jpg'
import img_pelo_2 from '@/assets/catalog/foreign/pelo-2.jpg'
import img_queratina_0 from '@/assets/catalog/foreign/queratina-0.jpg'
import img_queratina_0_thumb from '@/assets/catalog/foreign/queratina-0-thumb.jpg'
import img_queratina_1 from '@/assets/catalog/foreign/queratina-1.jpg'
import img_queratina_2 from '@/assets/catalog/foreign/queratina-2.jpg'
import img_urato_0 from '@/assets/catalog/foreign/urato-0.jpg'
import img_urato_0_thumb from '@/assets/catalog/foreign/urato-0-thumb.jpg'
import img_urato_1 from '@/assets/catalog/foreign/urato-1.jpg'
import img_urato_2 from '@/assets/catalog/foreign/urato-2.jpg'
import img_urato_3 from '@/assets/catalog/foreign/urato-3.jpg'
import img_pirofosfato_0 from '@/assets/catalog/foreign/pirofosfato-0.jpg'
import img_pirofosfato_0_thumb from '@/assets/catalog/foreign/pirofosfato-0-thumb.jpg'
import img_colesterol_0 from '@/assets/catalog/foreign/colesterol-0.jpg'
import img_colesterol_0_thumb from '@/assets/catalog/foreign/colesterol-0-thumb.jpg'
import img_colesterol_1 from '@/assets/catalog/foreign/colesterol-1.jpg'
import img_colesterol_2 from '@/assets/catalog/foreign/colesterol-2.jpg'
import img_alimento_aspirado_0 from '@/assets/catalog/foreign/alimento-aspirado-0.jpg'
import img_alimento_aspirado_0_thumb from '@/assets/catalog/foreign/alimento-aspirado-0-thumb.jpg'
import img_alimento_aspirado_1 from '@/assets/catalog/foreign/alimento-aspirado-1.jpg'
import img_alimento_aspirado_2 from '@/assets/catalog/foreign/alimento-aspirado-2.jpg'
import img_alimento_aspirado_3 from '@/assets/catalog/foreign/alimento-aspirado-3.jpg'
import img_alimento_aspirado_4 from '@/assets/catalog/foreign/alimento-aspirado-4.jpg'
import img_alimento_aspirado_5 from '@/assets/catalog/foreign/alimento-aspirado-5.jpg'
import img_alimento_aspirado_6 from '@/assets/catalog/foreign/alimento-aspirado-6.jpg'
import img_celulas_de_semente_0 from '@/assets/catalog/foreign/celulas-de-semente-0.jpg'
import img_celulas_de_semente_0_thumb from '@/assets/catalog/foreign/celulas-de-semente-0-thumb.jpg'
import img_celulas_de_semente_1 from '@/assets/catalog/foreign/celulas-de-semente-1.jpg'
import img_celulas_de_semente_2 from '@/assets/catalog/foreign/celulas-de-semente-2.jpg'
import img_celulas_de_semente_3 from '@/assets/catalog/foreign/celulas-de-semente-3.jpg'
import img_sementes_0 from '@/assets/catalog/foreign/sementes-0.jpg'
import img_sementes_0_thumb from '@/assets/catalog/foreign/sementes-0-thumb.jpg'
import img_sementes_1 from '@/assets/catalog/foreign/sementes-1.jpg'
import img_sementes_2 from '@/assets/catalog/foreign/sementes-2.jpg'
import img_sementes_3 from '@/assets/catalog/foreign/sementes-3.jpg'
import img_sementes_4 from '@/assets/catalog/foreign/sementes-4.jpg'
import img_bario_0 from '@/assets/catalog/foreign/bario-0.jpg'
import img_bario_0_thumb from '@/assets/catalog/foreign/bario-0-thumb.jpg'
import img_bario_1 from '@/assets/catalog/foreign/bario-1.jpg'
import img_bario_2 from '@/assets/catalog/foreign/bario-2.jpg'
import img_bario_3 from '@/assets/catalog/foreign/bario-3.jpg'
import img_bario_4 from '@/assets/catalog/foreign/bario-4.jpg'
import img_acido_hialuronico_0 from '@/assets/catalog/foreign/acido-hialuronico-0.jpg'
import img_acido_hialuronico_0_thumb from '@/assets/catalog/foreign/acido-hialuronico-0-thumb.jpg'
import img_acido_hialuronico_1 from '@/assets/catalog/foreign/acido-hialuronico-1.jpg'
import img_acido_hialuronico_2 from '@/assets/catalog/foreign/acido-hialuronico-2.jpg'
import img_pmma_0 from '@/assets/catalog/foreign/pmma-0.jpg'
import img_pmma_0_thumb from '@/assets/catalog/foreign/pmma-0-thumb.jpg'
import img_acido_poli_l_latico_0 from '@/assets/catalog/foreign/acido-poli-l-latico-0.jpg'
import img_acido_poli_l_latico_0_thumb from '@/assets/catalog/foreign/acido-poli-l-latico-0-thumb.jpg'
import img_hidroxiapatita_0 from '@/assets/catalog/foreign/hidroxiapatita-0.jpg'
import img_hidroxiapatita_0_thumb from '@/assets/catalog/foreign/hidroxiapatita-0-thumb.jpg'
import img_hidroxiapatita_1 from '@/assets/catalog/foreign/hidroxiapatita-1.jpg'
import img_hidroxiapatita_2 from '@/assets/catalog/foreign/hidroxiapatita-2.jpg'
import img_celulose_oxidada_0 from '@/assets/catalog/foreign/celulose-oxidada-0.jpg'
import img_celulose_oxidada_0_thumb from '@/assets/catalog/foreign/celulose-oxidada-0-thumb.jpg'
import img_celulose_oxidada_1 from '@/assets/catalog/foreign/celulose-oxidada-1.jpg'
import img_celulose_oxidada_2 from '@/assets/catalog/foreign/celulose-oxidada-2.jpg'
import img_celulose_oxidada_3 from '@/assets/catalog/foreign/celulose-oxidada-3.jpg'
import img_gelfoam_0 from '@/assets/catalog/foreign/gelfoam-0.jpg'
import img_gelfoam_0_thumb from '@/assets/catalog/foreign/gelfoam-0-thumb.jpg'
import img_gelfoam_1 from '@/assets/catalog/foreign/gelfoam-1.jpg'
import img_gelfoam_2 from '@/assets/catalog/foreign/gelfoam-2.jpg'
import img_gelfoam_3 from '@/assets/catalog/foreign/gelfoam-3.jpg'
import img_avitene_0 from '@/assets/catalog/foreign/avitene-0.jpg'
import img_avitene_0_thumb from '@/assets/catalog/foreign/avitene-0-thumb.jpg'
import img_microesferas_embolizacao_0 from '@/assets/catalog/foreign/microesferas-embolizacao-0.jpg'
import img_microesferas_embolizacao_0_thumb from '@/assets/catalog/foreign/microesferas-embolizacao-0-thumb.jpg'
import img_microesferas_embolizacao_1 from '@/assets/catalog/foreign/microesferas-embolizacao-1.jpg'
import img_onyx_0 from '@/assets/catalog/foreign/onyx-0.jpg'
import img_onyx_0_thumb from '@/assets/catalog/foreign/onyx-0-thumb.jpg'
import img_onyx_1 from '@/assets/catalog/foreign/onyx-1.jpg'
import img_polimero_hidrofilico_0 from '@/assets/catalog/foreign/polimero-hidrofilico-0.jpg'
import img_polimero_hidrofilico_0_thumb from '@/assets/catalog/foreign/polimero-hidrofilico-0-thumb.jpg'
import img_polimero_hidrofilico_1 from '@/assets/catalog/foreign/polimero-hidrofilico-1.jpg'
import img_excipientes_0 from '@/assets/catalog/foreign/excipientes-0.jpg'
import img_excipientes_0_thumb from '@/assets/catalog/foreign/excipientes-0-thumb.jpg'
import img_excipientes_1 from '@/assets/catalog/foreign/excipientes-1.jpg'
import img_excipientes_2 from '@/assets/catalog/foreign/excipientes-2.jpg'
import img_excipientes_3 from '@/assets/catalog/foreign/excipientes-3.jpg'
import img_excipientes_4 from '@/assets/catalog/foreign/excipientes-4.jpg'
import img_resinas_0 from '@/assets/catalog/foreign/resinas-0.jpg'
import img_resinas_0_thumb from '@/assets/catalog/foreign/resinas-0-thumb.jpg'
import img_resinas_1 from '@/assets/catalog/foreign/resinas-1.jpg'
import img_resinas_2 from '@/assets/catalog/foreign/resinas-2.jpg'
import img_resinas_3 from '@/assets/catalog/foreign/resinas-3.jpg'
import img_resinas_4 from '@/assets/catalog/foreign/resinas-4.jpg'
import img_ferro_0 from '@/assets/catalog/foreign/ferro-0.jpg'
import img_ferro_0_thumb from '@/assets/catalog/foreign/ferro-0-thumb.jpg'
import img_ferro_1 from '@/assets/catalog/foreign/ferro-1.jpg'
import img_ferro_2 from '@/assets/catalog/foreign/ferro-2.jpg'
import img_algodao_0 from '@/assets/catalog/foreign/algodao-0.jpg'
import img_algodao_0_thumb from '@/assets/catalog/foreign/algodao-0-thumb.jpg'
import img_algodao_1 from '@/assets/catalog/foreign/algodao-1.jpg'
import img_algodao_2 from '@/assets/catalog/foreign/algodao-2.jpg'
import img_algodao_3 from '@/assets/catalog/foreign/algodao-3.jpg'
import img_algodao_4 from '@/assets/catalog/foreign/algodao-4.jpg'
import img_mercurio_0 from '@/assets/catalog/foreign/mercurio-0.jpg'
import img_mercurio_0_thumb from '@/assets/catalog/foreign/mercurio-0-thumb.jpg'
import img_mercurio_1 from '@/assets/catalog/foreign/mercurio-1.jpg'
import img_metalose_0 from '@/assets/catalog/foreign/metalose-0.jpg'
import img_metalose_0_thumb from '@/assets/catalog/foreign/metalose-0-thumb.jpg'
import img_metalose_1 from '@/assets/catalog/foreign/metalose-1.jpg'
import img_ptfe_0 from '@/assets/catalog/foreign/ptfe-0.jpg'
import img_ptfe_0_thumb from '@/assets/catalog/foreign/ptfe-0-thumb.jpg'
import img_ptfe_1 from '@/assets/catalog/foreign/ptfe-1.jpg'
import img_poliuretano_0 from '@/assets/catalog/foreign/poliuretano-0.jpg'
import img_poliuretano_0_thumb from '@/assets/catalog/foreign/poliuretano-0-thumb.jpg'
import img_tela_0 from '@/assets/catalog/foreign/tela-0.jpg'
import img_tela_0_thumb from '@/assets/catalog/foreign/tela-0-thumb.jpg'
import img_vidro_0 from '@/assets/catalog/foreign/vidro-0.jpg'
import img_vidro_0_thumb from '@/assets/catalog/foreign/vidro-0-thumb.jpg'
import img_madeira_espinho_0 from '@/assets/catalog/foreign/madeira-espinho-0.jpg'
import img_madeira_espinho_0_thumb from '@/assets/catalog/foreign/madeira-espinho-0-thumb.jpg'
import img_madeira_espinho_1 from '@/assets/catalog/foreign/madeira-espinho-1.jpg'
import img_madeira_espinho_2 from '@/assets/catalog/foreign/madeira-espinho-2.jpg'
import img_madeira_espinho_3 from '@/assets/catalog/foreign/madeira-espinho-3.jpg'
import img_madeira_espinho_4 from '@/assets/catalog/foreign/madeira-espinho-4.jpg'
import img_ourico_do_mar_0 from '@/assets/catalog/foreign/ourico-do-mar-0.jpg'
import img_ourico_do_mar_0_thumb from '@/assets/catalog/foreign/ourico-do-mar-0-thumb.jpg'
import img_polen_0 from '@/assets/catalog/foreign/polen-0.jpg'
import img_polen_0_thumb from '@/assets/catalog/foreign/polen-0-thumb.jpg'
import img_polen_1 from '@/assets/catalog/foreign/polen-1.jpg'
import img_polen_2 from '@/assets/catalog/foreign/polen-2.jpg'
import img_polen_3 from '@/assets/catalog/foreign/polen-3.jpg'
import img_tricoma_0 from '@/assets/catalog/foreign/tricoma-0.jpg'
import img_tricoma_0_thumb from '@/assets/catalog/foreign/tricoma-0-thumb.jpg'
import img_tricoma_1 from '@/assets/catalog/foreign/tricoma-1.jpg'
import img_oleo_mineral_0 from '@/assets/catalog/foreign/oleo-mineral-0.jpg'
import img_oleo_mineral_0_thumb from '@/assets/catalog/foreign/oleo-mineral-0-thumb.jpg'
import img_oleo_mineral_1 from '@/assets/catalog/foreign/oleo-mineral-1.jpg'
import img_oleo_mineral_2 from '@/assets/catalog/foreign/oleo-mineral-2.jpg'
import img_lipiodol_0 from '@/assets/catalog/foreign/lipiodol-0.jpg'
import img_lipiodol_0_thumb from '@/assets/catalog/foreign/lipiodol-0-thumb.jpg'
import img_monsel_0 from '@/assets/catalog/foreign/monsel-0.jpg'
import img_monsel_0_thumb from '@/assets/catalog/foreign/monsel-0-thumb.jpg'
import img_orise_gel_0 from '@/assets/catalog/foreign/orise-gel-0.jpg'
import img_orise_gel_0_thumb from '@/assets/catalog/foreign/orise-gel-0-thumb.jpg'
import img_orise_gel_1 from '@/assets/catalog/foreign/orise-gel-1.jpg'
import img_orise_gel_2 from '@/assets/catalog/foreign/orise-gel-2.jpg'
import img_oxalato_0 from '@/assets/catalog/foreign/oxalato-0.jpg'
import img_oxalato_0_thumb from '@/assets/catalog/foreign/oxalato-0-thumb.jpg'
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
    { id: 'mucosa-oral', label: 'Mucosa oral e lábio' },
    { id: 'esofago', label: 'Esôfago' },
    { id: 'estomago', label: 'Estômago' },
    { id: 'intestino', label: 'Intestino' },
    { id: 'apendice', label: 'Apêndice' },
    { id: 'pulmao', label: 'Pulmão e brônquios' },
    { id: 'pleura', label: 'Pleura e peritônio' },
    { id: 'figado', label: 'Fígado e vesícula' },
    { id: 'linfonodo', label: 'Linfonodo' },
    { id: 'osso', label: 'Osso e articulação' },
    { id: 'partes-moles', label: 'Partes moles' },
    { id: 'trato-urinario', label: 'Trato urinário' },
    { id: 'rim', label: 'Rim' },
    { id: 'genital', label: 'Trato genital' },
    { id: 'colo-uterino', label: 'Colo uterino' },
    { id: 'utero', label: 'Útero e tubas' },
    { id: 'tireoide', label: 'Tireoide' },
    { id: 'olho', label: 'Olho' },
    { id: 'snc', label: 'Sistema nervoso central' },
    { id: 'vaso', label: 'Vaso (embolia)' },
  ],
  clinical: [
    { id: 'estetico', label: 'Procedimento estético' },
    { id: 'cirurgia-previa', label: 'Cirurgia prévia' },
    { id: 'protese', label: 'Prótese / implante' },
    { id: 'embolizacao', label: 'Embolização / procedimento endovascular' },
    { id: 'endoscopia', label: 'Procedimento endoscópico prévio' },
    { id: 'medicacao', label: 'Medicação oral (comprimidos, resinas)' },
    { id: 'dialise', label: 'Doença renal / diálise' },
    { id: 'drogas-injetaveis', label: 'Uso de drogas injetáveis' },
    { id: 'aspiracao', label: 'Aspiração' },
    { id: 'ingestao', label: 'Ingestão' },
    { id: 'inalacao', label: 'Inalação (poeira, fumaça)' },
    { id: 'trauma', label: 'Trauma / ferimento' },
    { id: 'ocupacional', label: 'Exposição ocupacional' },
    { id: 'artrite', label: 'Artrite / articulação' },
    { id: 'reacao-granulomatosa', label: 'Reação granulomatosa' },
    { id: 'birrefringente', label: 'Birrefringente à luz polarizada' },
    { id: 'nao-birrefringente', label: 'Não birrefringente' },
    { id: 'cristal', label: 'Cristais / material cristalino' },
    { id: 'pigmentado', label: 'Pigmentado (preto, marrom, azul)' },
    { id: 'mimico-tumor', label: 'Simula tumor ou recidiva' },
    { id: 'citologia', label: 'Visto em citologia (Pap, BAL, PAAF)' },
    { id: 'contaminante', label: 'Contaminante da lâmina' },
  ],
  entries: [
    {
      id: 'sutura',
      name: 'Fio de sutura',
      aka: ['Granuloma de sutura', 'Granuloma de fio', 'Reação a corpo estranho de sutura', 'Vicryl', 'Seda', 'Categute'],
      summary: 'Filamentos refringentes, trançados (feixe de pontos redondos em corte transversal) ou monofilamentares (um disco liso), cercados por células gigantes e fibrose.',
      description:
        '## Morfologia\n- Material **acelular, refringente**, homogêneo ou fibrilar; em corte transversal o fio **trançado** (seda, poliéster, poliglactina/Vicryl) aparece como um **feixe de pontos redondos**, e o **monofilamento** (náilon, polipropileno) como um único disco liso.\n- Cercado por **células gigantes tipo corpo estranho**, histiócitos e fibrose concêntrica; pode haver eosinófilos e xantogranuloma.\n- **Birrefringente** à luz polarizada na maioria dos fios sintéticos — polarize todo granuloma "sem causa".\n- Fios absorvíveis (poliglactina, categute cromado) degradam e deixam fragmentos irregulares ou só o granuloma residual; o categute cromado é amorfo, eosinofílico e não polariza bem.\n\n## Onde engana\n- Cicatriz de cirurgia prévia com nódulo palpável: imita recidiva tumoral em cólon, mama, tireoide e cicatriz de orquiectomia.\n- Corte tangencial pode parecer parasita ou fungo — o fio não tem estrutura interna organizada.\n\n## Contexto\n- Sempre há **cirurgia prévia** no sítio; o nódulo surge meses a anos depois.\n- Sem necrose caseosa; se houver, pense em infecção associada.',
      traits: [],
      sites: ['pele', 'partes-moles', 'mama', 'intestino', 'pleura', 'genital', 'utero', 'trato-urinario'],
      clinical: ['cirurgia-previa', 'reacao-granulomatosa', 'birrefringente', 'mimico-tumor'],
      photos: [
        { src: img_sutura_0, thumb: img_sutura_0_thumb, caption: 'Granuloma de sutura: fio refringente (cinza) envolto por células gigantes multinucleadas', stain: 'HE', credit: 'Mikael Häggström, M.D. — Wikimedia Commons, CC0' },
        { src: img_sutura_1, caption: 'Fio trançado em corte transversal (feixe de filamentos), sob luz polarizada', stain: 'HE, polarizado', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Jerad M Gardner — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_sutura_2, caption: 'Mama: granuloma ao redor de categute cromado, com fibrose', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Saul Harari — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_sutura_3, caption: 'Reação gigantocelular a fio de náilon', stain: 'HE', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'silicone',
      name: 'Silicone',
      aka: ['Siliconoma', 'Granuloma de silicone', 'Polidimetilsiloxano', 'Prótese de mama rota'],
      summary: 'Vacúolos redondos e opticamente vazios, de tamanhos variados, entre histiócitos e células gigantes: o aspecto em "queijo suíço"; não birrefringente.',
      description:
        '## Morfologia\n- **Vacúolos redondos, vazios, de tamanhos muito variados** (o silicone dissolve no processamento) dentro de histiócitos, células gigantes e no interstício — o padrão em **queijo suíço**.\n- Células gigantes multinucleadas tipo corpo estranho, fibrose e, no silicone líquido industrial, esclerose densa.\n- **Não birrefringente** à luz polarizada (diferencia de talco, PMMA e outros preenchedores cristalinos). Corpos asteroides dentro das células gigantes são comuns.\n- Em linfonodo: histiocitose sinusal com os mesmos vacúolos — a "linfadenite por silicone" de prótese rota. Embolia pulmonar após injeção ilícita.\n\n## Onde engana\n- Lipoma ou tecido adiposo maduro: os vacúolos do silicone têm tamanhos díspares, ficam dentro de histiócitos e não têm núcleo periférico de adipócito.\n- Preenchedores com esferas (PMMA, hidroxiapatita): partículas uniformes e definidas.\n\n## Contexto\n- **Prótese de mama** (cápsula fibrosa, linfonodo axilar após ruptura), **preenchimento estético** com silicone líquido (glúteo, face, pernas) e injeção clandestina.\n- Migração à distância é comum: linfonodos, pulmão, fígado.',
      traits: [],
      sites: ['mama', 'pele', 'partes-moles', 'linfonodo', 'pulmao', 'figado', 'vaso'],
      clinical: ['estetico', 'protese', 'reacao-granulomatosa', 'nao-birrefringente'],
      photos: [
        { src: img_silicone_0, thumb: img_silicone_0_thumb, caption: 'Granuloma de silicone: vacúolos vazios de tamanhos variados entre histiócitos e células gigantes', stain: 'HE', credit: 'TexasPathologistMSW — Wikimedia Commons, CC BY-SA 4.0' },
        { src: img_silicone_1, caption: 'Mama: vazamento de prótese com reação gigantocelular', stain: 'HE', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_silicone_2, caption: 'Linfonodo axilar quase todo substituído por silicone de prótese rota', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Ana E — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_silicone_3, caption: 'Silicone na mama: vacúolos em queijo suíço (composição do autor)', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Melanie Bourgeau — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_silicone_4, caption: 'Corpos asteroides dentro de células gigantes ao redor do silicone', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Jasmine Vickery — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_silicone_5, caption: 'Macroscopia: prótese de silicone rota e cápsula', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer) — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'talco',
      name: 'Talco',
      aka: ['Silicato de magnésio', 'Pleurodese com talco', 'Granuloma de talco', 'Talcose'],
      summary: 'Placas e agulhas incolores, fortemente birrefringentes, dentro de células gigantes e granulomas; na pleura após pleurodese, no pulmão de quem injeta comprimidos.',
      description:
        '## Morfologia\n- Partículas **em placa, irregulares ou aciculares**, incolores a levemente amareladas no HE, de 5 a 50 µm, **fortemente birrefringentes** (brancas e brilhantes na polarização).\n- Dentro de **células gigantes tipo corpo estranho**, histiócitos e granulomas não necrosantes; fibrose com o tempo.\n- Pleurodese: pleura espessada com granulomas de talco por décadas.\n- Uso injetável de comprimidos: granulomas de talco **dentro e ao redor de arteríolas pulmonares**, com celulose microcristalina e crospovidona; hipertensão pulmonar.\n\n## Onde engana\n- Sarcoidose: os granulomas de talco têm o cristal; polarize.\n- Amido de luva: cruz de Malta, esferas com hilo central.\n\n## Contexto\n- Pleurodese, drogas injetáveis, exposição ocupacional (talcose), talco perineal (ovário, discutido), contaminação de luvas antigas.',
      traits: [],
      sites: ['pleura', 'pulmao', 'vaso', 'genital', 'pele'],
      clinical: ['cirurgia-previa', 'drogas-injetaveis', 'ocupacional', 'reacao-granulomatosa', 'birrefringente', 'cristal'],
      photos: [
        { src: img_talco_0, thumb: img_talco_0_thumb, caption: 'Pleura após pleurodese: cristais de talco em células gigantes', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer) — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_talco_1, caption: 'Talco na pleura, com detalhe sob luz polarizada', stain: 'HE, polarizado', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Siti Richardson — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_talco_2, caption: 'Reação de corpo estranho ao talco após pleurodese', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Ankur Sangoi — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_talco_3, caption: 'Pulmão de usuário de drogas injetáveis: material birrefringente em granulomas perivasculares', stain: 'HE, polarizado', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'silica',
      name: 'Sílica',
      aka: ['Silicose', 'Nódulo silicótico', 'Quartzo'],
      summary: 'Nódulos hialinos concêntricos com poeira negra na periferia e partículas pequenas, poliédricas, fracamente birrefringentes no seu interior.',
      description:
        '## Morfologia\n- **Nódulo silicótico**: centro de **colágeno hialinizado em lamelas concêntricas** (casca de cebola), coroa de macrófagos com poeira e pigmento antracótico.\n- Partículas de **sílica pequenas (1–5 µm), poliédricas, fracamente birrefringentes** dispersas no nódulo — menos brilhantes e menores que os silicatos (talco, mica), que polarizam forte.\n- Nódulos nos linfonodos hilares (calcificação em casca de ovo), fibrose maciça progressiva na doença avançada.\n- Silicoproteinose (exposição maciça, aguda): material PAS-positivo intra-alveolar.\n\n## Onde engana\n- Nódulos de pneumoconiose mista, sarcoidose (granulomas sem hialinização concêntrica), nódulo reumatoide.\n- Anthracose isolada: pigmento sem fibrose nodular.\n\n## Contexto\n- Jateamento de areia, mineração, pedreiras, marmoraria (quartzo artificial), cerâmica; risco de tuberculose e de carcinoma.',
      traits: [],
      sites: ['pulmao', 'linfonodo', 'pele'],
      clinical: ['ocupacional', 'inalacao', 'reacao-granulomatosa', 'birrefringente', 'cristal'],
      photos: [
        { src: img_silica_0, thumb: img_silica_0_thumb, caption: 'Partículas de sílica poliédricas, birrefringentes, dispersas no nódulo silicótico', stain: 'HE, polarizado', credit: 'CDC — Public Health Image Library, domínio público' },
        { src: img_silica_1, caption: 'Cristais finos de silicato brilhando à luz polarizada', stain: 'HE, polarizado', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'asbesto',
      name: 'Asbesto (corpos ferruginosos)',
      aka: ['Amianto', 'Corpo de asbesto', 'Corpo ferruginoso', 'Asbestose'],
      summary: 'Fibra fina e transparente revestida por camadas de ferro e proteína, em halteres ou contas de rosário, marrom-dourada no HE e azul no azul da Prússia.',
      description:
        '## Morfologia\n- **Corpo de asbesto**: fibra **fina, reta e transparente** (a fibra em si) coberta por um **revestimento ferro-proteico marrom-dourado**, segmentado em **contas de rosário**, com **extremidades em bulbo (halteres)**; 20 a 100 µm.\n- **Azul da Prússia** cora o revestimento; a fibra nua não polariza (anfibólios) ou polariza pouco.\n- Asbestose: fibrose intersticial peribronquiolar que avança para favo de mel, com corpos de asbesto no meio; placas pleurais hialinas.\n- Corpos ferruginosos podem se formar em outras fibras (carbono, cerâmica): o núcleo negro ou largo em vez de transparente diz que não é asbesto.\n\n## Onde engana\n- Fibras de carbono revestidas (fumantes, mineiros): núcleo negro.\n- Só a contagem por digestão de tecido quantifica a exposição.\n\n## Contexto\n- Construção civil, freios, telhas e caixas d\'água de fibrocimento, naval; latência de 20 a 40 anos; mesotelioma e carcinoma de pulmão.',
      traits: [],
      sites: ['pulmao', 'pleura', 'linfonodo'],
      clinical: ['ocupacional', 'inalacao', 'pigmentado', 'citologia'],
      photos: [
        { src: img_asbesto_0, thumb: img_asbesto_0_thumb, caption: 'Corpo de asbesto: fibra transparente revestida por ferro, com extremidades em halteres', stain: 'HE', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_asbesto_1, caption: 'Corpos de asbesto em pulmão com asbestose', stain: 'HE', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_asbesto_2, caption: 'Corpo ferruginoso (anotação do autor) ao lado de pigmento antracótico', stain: 'HE', credit: 'Nephron — Wikimedia Commons, CC BY-SA 3.0' },
        { src: img_asbesto_3, caption: 'Corpos ferruginosos em lavado broncoalveolar', stain: 'Papanicolaou', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Tamara Zudaire — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_asbesto_4, caption: 'A seta aponta o segmento nu da fibra de asbesto dentro do corpo ferruginoso', stain: 'HE', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'antracose',
      name: 'Carvão (pigmento antracótico)',
      aka: ['Antracose', 'Pigmento antracótico', 'Pneumoconiose dos mineiros de carvão'],
      summary: 'Pigmento negro, fino, granular, não birrefringente, em macrófagos, ao longo dos linfáticos e nos linfonodos hilares; achado universal em fumantes e moradores de cidade.',
      description:
        '## Morfologia\n- Grânulos **negros, finos, opacos, não birrefringentes**, dentro de **macrófagos** e livres, ao redor de bronquíolos, ao longo dos septos e dos linfáticos pleurais, e nos **linfonodos hilares e mediastinais** ("linfonodo antracótico").\n- Sem fibrose na antracose simples; **mácula do mineiro de carvão** (pigmento com fibras reticulínicas) e fibrose maciça progressiva na pneumoconiose.\n- Macrófagos do fumante: citoplasma dourado com pontilhado negro fino.\n\n## Onde engana\n- Melanoma metastático em linfonodo: o pigmento antracótico é extracelular ou em macrófagos, negro e granular, Fontana-Masson negativo (melanina é positiva); imuno-histoquímica resolve.\n- Tatuagem em linfonodo: pigmento de outras cores ou preto mais grosseiro, na drenagem da tatuagem.\n- Pigmento de marcador endoscópico (carbono): mesmo material, história de tatuagem colonoscópica.\n\n## Contexto\n- Tabagismo, poluição, fogão a lenha, mineração; achado incidental na maioria das biópsias pulmonares.',
      traits: [],
      sites: ['pulmao', 'linfonodo', 'pleura'],
      clinical: ['inalacao', 'ocupacional', 'pigmentado', 'nao-birrefringente'],
      photos: [
        { src: img_antracose_0, thumb: img_antracose_0_thumb, caption: 'Antracose pulmonar: pigmento negro ao longo do interstício', stain: 'HE', credit: 'Mikael Häggström, M.D. — Wikimedia Commons, CC0' },
        { src: img_antracose_1, caption: 'Linfonodo torácico com macrófagos repletos de pigmento antracótico', stain: 'HE', credit: 'Patho — Wikimedia Commons, CC BY-SA 3.0' },
        { src: img_antracose_2, caption: 'Partículas de carbono dentro do citoplasma de macrófagos', stain: 'HE', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_antracose_3, caption: 'Macrófago antracótico na superfície alveolar', stain: 'HE', credit: 'Mikael Häggström, M.D. — Wikimedia Commons, CC0' },
      ],
    },
    {
      id: 'tatuagem',
      name: 'Pigmento de tatuagem',
      aka: ['Tatuagem', 'Granuloma de tatuagem', 'Pigmento em linfonodo'],
      summary: 'Grânulos de pigmento preto, vermelho, azul ou verde, extracelulares e em macrófagos da derme superficial e média, sem reação ou com granulomas; migra para o linfonodo.',
      description:
        '## Morfologia\n- Grânulos **irregulares** de pigmento, **preto** (carbono) ou colorido (**vermelho** de cinábrio/azo, **azul e verde** de cobalto/cromo), livres na derme e dentro de **macrófagos**, ao redor de vasos.\n- Na maioria, **sem reação**. Reações: **liquenoide**, granulomatosa (sarcoide ou corpo estranho), pseudolinfomatosa — mais com o vermelho.\n- Migra pelos linfáticos: **linfonodo regional pigmentado** (axilar, inguinal, pericolônico após marcação endoscópica).\n- Não birrefringente na maioria; alguns pigmentos polarizam fracamente.\n\n## Onde engana\n- Melanoma em linfonodo: Fontana-Masson e S100/SOX10 negativos no pigmento de tatuagem; o pigmento é grosseiro e fica nos seios.\n- Antracose: pigmento fino, contexto pulmonar.\n\n## Contexto\n- Tatuagem decorativa, micropigmentação, marcação para radioterapia, amálgama (mucosa oral).',
      traits: [],
      sites: ['pele', 'linfonodo', 'mucosa-oral'],
      clinical: ['estetico', 'pigmentado', 'reacao-granulomatosa', 'nao-birrefringente', 'mimico-tumor'],
      photos: [
        { src: img_tatuagem_0, thumb: img_tatuagem_0_thumb, caption: 'Pigmento vermelho de tatuagem na epiderme e na derme', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Mary E — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_tatuagem_1, caption: 'Linfonodo pericolônico com pigmento azul-esverdeado de tatuagem endoscópica', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Fabio Tavora — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'marcador-endoscopico',
      name: 'Marcador endoscópico de carbono (Spot, tinta nanquim)',
      aka: ['Tatuagem colonoscópica', 'Spot', 'Tinta nanquim', 'Tatuagem endoscópica'],
      summary: 'Pigmento negro grosseiro na submucosa, subserosa e linfonodos pericolônicos, em macrófagos e células gigantes, no sítio marcado antes da cirurgia.',
      description:
        '## Morfologia\n- **Pigmento negro grosseiro** (carbono), livre e em **macrófagos e células gigantes**, na **submucosa e subserosa** do cólon, com fibrose e inflamação crônica; às vezes abscesso ou peritonite localizada.\n- Chega aos **linfonodos pericolônicos** — pigmento nos seios, sem células tumorais.\n- Não birrefringente; Fontana-Masson negativo.\n\n## Onde engana\n- Antracose de linfonodo: mesmo carbono; a história de tatuagem endoscópica explica o sítio abdominal.\n- Melanoma ou melanose coli: melanose é pigmento lipofuscínico em macrófagos da lâmina própria, marrom, PAS-positivo.\n- Necrose e inflamação ao redor do pigmento podem imitar perfuração tumoral.\n\n## Contexto\n- Colonoscopia com marcação de pólipo ou tumor antes da colectomia laparoscópica; laude o pigmento para não confundir com metástase em linfonodo.',
      traits: [],
      sites: ['intestino', 'linfonodo', 'pleura'],
      clinical: ['endoscopia', 'cirurgia-previa', 'pigmentado', 'nao-birrefringente', 'mimico-tumor'],
      photos: [
        { src: img_marcador_endoscopico_0, thumb: img_marcador_endoscopico_0_thumb, caption: 'Linfonodo pericolônico com pigmento de carbono do marcador endoscópico', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Pascual Meseguer — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'amido',
      name: 'Amido (pó de luva)',
      aka: ['Grânulos de amido', 'Cruz de Malta', 'Granuloma por amido', 'Talco de luva'],
      summary: 'Esferas de 10–20 µm, PAS-positivas, com hilo central e a cruz de Malta à luz polarizada; contaminante de luva ou causa de granulomas peritoneais.',
      description:
        '## Morfologia\n- Grânulos **redondos ou ovais, de 10 a 20 µm**, incolores ou levemente basofílicos, com **hilo central** e estrias concêntricas; **PAS-positivos**.\n- À **luz polarizada**: **cruz de Malta** — a assinatura.\n- Como contaminante (luva, pó de talco de luva, pó de comprimido): soltos na lâmina, sem reação. Como corpo estranho: granulomas de corpo estranho no peritônio ou na ferida operatória, com células gigantes contendo os grânulos.\n\n## Onde engana\n- Ovos de parasitas ou leveduras: o amido não tem parede nem estrutura interna organizada e tem a cruz de Malta.\n- Células de reserva de sementes (aspiradas): muito maiores, com parede celulósica.\n\n## Contexto\n- Contaminação de lâmina, lavado, citologia; peritonite granulomatosa por amido nas luvas de antigamente.',
      traits: [],
      sites: ['pleura', 'pele', 'pulmao', 'colo-uterino'],
      clinical: ['contaminante', 'cirurgia-previa', 'birrefringente', 'reacao-granulomatosa', 'citologia'],
      photos: [
        { src: img_amido_0, thumb: img_amido_0_thumb, caption: 'Grânulos de amido com cruz de Malta à luz polarizada', stain: 'Polarizado', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Padma Priya J — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_amido_1, caption: 'Amido em lavado broncoalveolar, polarizado: contaminante de luva', stain: 'Papanicolaou, polarizado', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Kalyani Bambal — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_amido_2, caption: 'Grânulos de amido na superfície de úlcera cutânea, com e sem polarização', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Dinesh Rakheja — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'pelo',
      name: 'Pelo (haste de pelo)',
      aka: ['Cisto pilonidal', 'Granuloma de pelo', 'Sinus pilonidal', 'Pelo de barbeiro'],
      summary: 'Hastes de pelo livres no tecido, refringentes e amareladas, com córtex fibrilar e às vezes medula, dentro de sinus ou granulomas de corpo estranho.',
      description:
        '## Morfologia\n- **Haste de pelo** sem folículo ao redor: cilindro **amarelado, refringente**, com **córtex fibrilar** e pigmento, cortada longitudinal ou transversalmente.\n- **Células gigantes** e histiócitos aderidos à haste, tecido de granulação, abscesso; **birrefringente** à polarização.\n- **Sinus pilonidal**: trajeto revestido por epitélio escamoso ou tecido de granulação com hastes de pelo soltas no lúmen e granulomas na parede.\n\n## Onde engana\n- Fibras vegetais ou de algodão: estriação diferente, sem córtex de pelo; o pelo tem cutícula em escamas.\n- Cisto epidérmico rompido: queratina laminada, não haste.\n\n## Contexto\n- Região sacrococcígea (pilonidal), espaços interdigitais de barbeiros e tosadores, umbigo; pelo de animais em feridas.',
      traits: [],
      sites: ['pele', 'partes-moles', 'pulmao'],
      clinical: ['reacao-granulomatosa', 'birrefringente', 'trauma', 'ocupacional'],
      photos: [
        { src: img_pelo_0, thumb: img_pelo_0_thumb, caption: 'Sinus pilonidal: haste de pelo solta no trajeto, com tecido de granulação', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer) — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_pelo_1, caption: 'Granuloma de corpo estranho ao redor de haste de pelo na derme', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Saul Harari — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_pelo_2, caption: 'Haste de pelo aspirada no pulmão', stain: 'HE', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'queratina',
      name: 'Queratina (cisto rompido)',
      aka: ['Cisto epidérmico rompido', 'Granuloma de queratina', 'Reação a corpo estranho a queratina'],
      summary: 'Lamelas de queratina eosinofílica, anucleadas, soltas na derme, cercadas por células gigantes, histiócitos e neutrófilos: cisto epidérmico ou pilar rompido.',
      description:
        '## Morfologia\n- **Lamelas de queratina** eosinofílicas, em cesta ou compactas, **fora de um cisto íntegro**, rodeadas por **células gigantes tipo corpo estranho**, histiócitos espumosos, neutrófilos e fibrose.\n- Restos da parede do cisto (epitélio escamoso com camada granulosa) ajudam a nomear a origem.\n- Queratina pilar (tricolemal): homogênea, sem camada granulosa. Pilomatricoma: células fantasma.\n\n## Onde engana\n- Carcinoma escamoso com granulomas de queratina (endométrio, colo, pulmão): a queratina vem do tumor — procure o epitélio neoplásico.\n- Inflamação intensa esconde o cisto: corte níveis.\n\n## Contexto\n- Cisto epidérmico ou pilar inflamado; qualquer lesão com queratina na derme: tumores anexiais, foliculite rota.',
      traits: [],
      sites: ['pele', 'partes-moles', 'utero', 'genital'],
      clinical: ['reacao-granulomatosa', 'nao-birrefringente'],
      photos: [
        { src: img_queratina_0, thumb: img_queratina_0_thumb, caption: 'Cisto epidermoide rompido: células gigantes ao redor de fragmentos de queratina', stain: 'HE', credit: 'Mikael Häggström, M.D. — Wikimedia Commons, CC0' },
        { src: img_queratina_1, caption: 'Reação granulomatosa a queratina com células gigantes de corpo estranho', stain: 'HE', credit: 'Department of Pathology, Calicut Medical College — Wikimedia Commons, CC BY-SA 4.0' },
        { src: img_queratina_2, caption: 'Pilomatricoma: queratina com células fantasma e reação gigantocelular', stain: 'HE', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'urato',
      name: 'Cristais de urato monossódico (gota)',
      aka: ['Gota', 'Tofo gotoso', 'Urato'],
      summary: 'Agulhas finas, em feixes, fortemente birrefringentes com elongação negativa; no tecido fixado em formol ficam como material amorfo acinzentado cercado de histiócitos e células gigantes (tofo).',
      description:
        '## Morfologia\n- **Tofo**: massas de **material amorfo, acinzentado ou eosinofílico pálido**, com aspecto **em feixes ou penas**, cercadas por **histiócitos em paliçada e células gigantes** — os cristais dissolvem no formol e sobra o fantasma.\n- Em material **fixado em álcool** ou no líquido sinovial: **agulhas finas** de 5 a 25 µm, **fortemente birrefringentes**, com **elongação negativa** (amarelas quando paralelas ao compensador vermelho).\n- Fibrose e calcificação nos tofos antigos; erosão óssea.\n\n## Onde engana\n- Pseudogota (pirofosfato): cristais em bastão ou romboides, birrefringência fraca e positiva.\n- Necrobiose e granuloma anular (pele): sem o material em feixes; nódulo reumatoide: necrose fibrinoide.\n\n## Contexto\n- Hiperuricemia; primeira metatarsofalangeana, olécrano, hélice da orelha, rim (nefropatia por urato).',
      traits: [],
      sites: ['osso', 'pele', 'partes-moles', 'rim'],
      clinical: ['artrite', 'cristal', 'birrefringente', 'reacao-granulomatosa', 'citologia'],
      photos: [
        { src: img_urato_0, thumb: img_urato_0_thumb, caption: 'Tofo gotoso: cristais aciculares em feixes com halo de histiócitos (anotação do autor)', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Michael P Lee — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_urato_1, caption: 'Cristais de urato brilhando à luz polarizada', stain: 'Polarizado', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer) — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_urato_2, caption: 'Tofo: material amorfo em feixes cercado por histiócitos e células gigantes', stain: 'HE', credit: 'Nephron — Wikimedia Commons, CC BY-SA 3.0' },
        { src: img_urato_3, caption: 'Líquido sinovial: agulhas de urato com elongação negativa no compensador vermelho', stain: 'Polarizado, compensador', credit: 'Gabriel Caponetti — Wikimedia Commons, CC BY-SA 3.0' },
      ],
    },
    {
      id: 'pirofosfato',
      name: 'Cristais de pirofosfato de cálcio (pseudogota)',
      aka: ['Pseudogota', 'Condrocalcinose', 'CPPD', 'Doença por deposição de pirofosfato'],
      summary: 'Depósitos basofílicos, granulares, em fibrocartilagem, menisco e sinóvia, com cristais em bastão ou romboides de birrefringência fraca e positiva.',
      description:
        '## Morfologia\n- Depósitos **basofílicos, granulares ou cristalinos**, em grumos, na **fibrocartilagem, menisco, cápsula e sinóvia**, com fibrose e metaplasia condroide ao redor; reação de corpo estranho variável.\n- Cristais **em bastão ou romboides**, de 2 a 20 µm, **birrefringência fraca e positiva** (azuis quando paralelos ao compensador) — o oposto do urato.\n- Sobrevivem à fixação em formol, ao contrário do urato.\n- Depósitos massivos (pseudogota tofácea) imitam tumor cartilaginoso na articulação temporomandibular.\n\n## Onde engana\n- Gota: agulhas, birrefringência forte e negativa.\n- Calcificação distrófica: amorfa, sem cristais definidos, von Kossa forte.\n- Condrossarcoma na forma tofácea: os condrócitos não são atípicos.\n\n## Contexto\n- Idoso, joelho e punho, hemocromatose, hiperparatireoidismo.',
      traits: [],
      sites: ['osso'],
      clinical: ['artrite', 'cristal', 'birrefringente'],
      photos: [
        { src: img_pirofosfato_0, thumb: img_pirofosfato_0_thumb, caption: 'Joelho: depósitos de pirofosfato de cálcio em cartilagem e sinóvia, com polarização', stain: 'HE, polarizado', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr Hubert Lau — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'colesterol',
      name: 'Cristais de colesterol (fendas)',
      aka: ['Fendas de colesterol', 'Granuloma de colesterol', 'Êmbolo de colesterol', 'Ateroembolia'],
      summary: 'Fendas alongadas, em agulha ou lanceoladas, vazias (o cristal dissolve), cercadas por células gigantes e histiócitos espumosos; dentro de artérias na ateroembolia.',
      description:
        '## Morfologia\n- **Fendas** vazias, **alongadas, biconvexas ou em agulha**, onde estavam os cristais dissolvidos pelo processamento, com **células gigantes** e macrófagos espumosos ao redor, hemossiderina e fibrose (granuloma de colesterol).\n- **Êmbolo de colesterol**: fendas **dentro da luz de arteríolas** com reação gigantocelular e fibrose intimal — rim, pele, intestino.\n- No material congelado ou não fixado, cristais em placa romboide com canto quebrado, birrefringentes.\n\n## Onde engana\n- Fendas de outros cristais (urato) ou artefato de corte: as de colesterol têm as pontas afiladas e a reação gigantocelular.\n- Xantogranuloma, necrose gordurosa, cisto periapical, colesteatoma: o mesmo achado em contextos distintos.\n\n## Contexto\n- Hemorragia antiga (mama, tireoide, cisto ósseo), orelha média, seio maxilar; ateroembolia após cateterismo ou anticoagulação (livedo, insuficiência renal, eosinofilia).',
      traits: [],
      sites: ['vaso', 'rim', 'mama', 'tireoide', 'osso', 'pele', 'mucosa-oral'],
      clinical: ['cristal', 'reacao-granulomatosa', 'embolizacao', 'nao-birrefringente'],
      photos: [
        { src: img_colesterol_0, thumb: img_colesterol_0_thumb, caption: 'Fendas de colesterol em cisto periapical', stain: 'HE', credit: 'Mikael Häggström, M.D. — Wikimedia Commons, CC0' },
        { src: img_colesterol_1, caption: 'Fendas de colesterol com reação inflamatória ao redor', stain: 'HE', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_colesterol_2, caption: 'Biópsia renal: êmbolo de colesterol com fendas dentro da artéria e reação gigantocelular', stain: 'HE', credit: 'Nephron — Wikimedia Commons, CC BY-SA 3.0' },
      ],
    },
    {
      id: 'alimento-aspirado',
      name: 'Alimento aspirado (vegetal e carne)',
      aka: ['Pneumonia aspirativa', 'Material vegetal', 'Vasos de planta', 'Músculo esquelético aspirado', 'Broncoaspiração'],
      summary: 'Fragmentos de planta com parede celulósica refringente, vasos espiralados birrefringentes, e fibras de músculo esquelético estriado anucleadas, com pneumonia em organização e células gigantes.',
      description:
        '## Morfologia\n- **Vegetal**: células com **parede celulósica espessa e refringente**, em favo; **vasos condutores** em espiral ou anel (birrefringentes); grãos de amido; cutícula pigmentada. Sem núcleos.\n- **Carne**: fibras de **músculo esquelético anucleadas**, eosinofílicas, com **estrias transversais** preservadas, isoladas em meio a pus.\n- Reação: **pneumonia em organização** peribronquiolar, granulomas de corpo estranho com **células gigantes**, abscesso, bronquiolite. Fora do pulmão: peritonite ou diverticulite perfurada com material vegetal, granulomas em fístulas.\n\n## Onde engana\n- Parasitas (a parede vegetal parece cutícula) e ovos: o vegetal tem parede celulósica e vasos, sem órgãos internos.\n- Células de reserva de sementes: veja o verbete próprio, o mímico mais comum.\n\n## Contexto\n- Idosos, disfagia, neuropatias, alcoolismo, anestesia; segmentos posteriores dos lobos superiores e basais dos inferiores.',
      traits: [],
      sites: ['pulmao', 'esofago', 'intestino', 'pleura', 'utero', 'apendice'],
      clinical: ['aspiracao', 'ingestao', 'reacao-granulomatosa', 'birrefringente'],
      photos: [
        { src: img_alimento_aspirado_0, thumb: img_alimento_aspirado_0_thumb, caption: 'Pneumonia aspirativa: vasos e tecido vegetal com reação granulomatosa, com e sem polarização', stain: 'HE, polarizado', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer) — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_alimento_aspirado_1, caption: 'Macroscopia: alimento aspirado dentro do brônquio', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_alimento_aspirado_2, caption: 'Cólon: fragmento vegetal com parede celulósica e pigmento, em célula gigante', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Padma Priya J — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_alimento_aspirado_3, caption: 'Tuba uterina: material vegetal com vasos em espiral (fístula com o intestino)', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Mustafa Abdel El Darawany — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_alimento_aspirado_4, caption: 'Vasos vegetais em espiral aspirados no pulmão', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer) — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_alimento_aspirado_5, caption: 'Fibras de músculo esquelético aspiradas entre células gigantes e pus', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer) — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_alimento_aspirado_6, caption: 'Fragmentos de carne: fibras estriadas anucleadas em meio a neutrófilos', stain: 'HE', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'celulas-de-semente',
      name: 'Células de reserva de sementes (granuloma de pulso)',
      aka: ['Granuloma de pulso', 'Granuloma de anel hialino', 'Leguminosa', 'Lentilha', 'Feijão'],
      summary: 'Estruturas ovais, hialinas, eosinofílicas, com parede espessa e conteúdo em favo ou vazio, cercadas por células gigantes: células de reserva de sementes ingeridas ou aspiradas.',
      description:
        '## Morfologia\n- **Corpos ovais ou redondos, de 50 a 300 µm**, com **parede hialina eosinofílica** espessa e interior **em favo de mel** (as células de reserva do cotilédone) ou vazio, sem núcleos.\n- Reação **gigantocelular e granulomatosa**, fibrose concêntrica — os "anéis hialinos" descritos como granuloma de pulso.\n- PAS-positivos, parcialmente birrefringentes.\n\n## Onde engana\n- Ovos de helmintos e parasitas: o favo interno e a ausência de estruturas do embrião distinguem.\n- Amiloide (pela hialinização): vermelho Congo negativo.\n- Tumor de células gigantes ou granuloma sem causa em cavidade oral, pulmão e apêndice: pense em semente.\n\n## Contexto\n- Aspiração (pulmão), alvéolo dentário após extração, apêndice, divertículo perfurado, peritônio, colostomia.',
      traits: [],
      sites: ['pulmao', 'mucosa-oral', 'apendice', 'intestino', 'pleura'],
      clinical: ['aspiracao', 'ingestao', 'reacao-granulomatosa', 'mimico-tumor'],
      photos: [
        { src: img_celulas_de_semente_0, thumb: img_celulas_de_semente_0_thumb, caption: 'Células de reserva de semente com reação gigantocelular (painéis A–D)', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Bipin Th — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_celulas_de_semente_1, caption: 'Peritônio: anéis hialinos concêntricos do \'granuloma de pulso\' (anotação do autor)', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Monika Vyas — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_celulas_de_semente_2, caption: 'Pulmão: células de reserva aspiradas, em vários aumentos', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer) — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_celulas_de_semente_3, caption: 'Biópsia de cólon: fragmento de semente com células de reserva em favo', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Laurence Galea — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'sementes',
      name: 'Sementes (tomate, gergelim, papoula)',
      aka: ['Semente no apêndice', 'Semente enviada como pólipo', 'Fecalito com semente'],
      summary: 'Semente inteira ou em corte: tegumento espesso e pigmentado com células paliçádicas, endosperma com células cheias de amido ou óleo, embrião; sem núcleos nem reação, salvo perfuração.',
      description:
        '## Morfologia\n- **Tegumento** (casca) com camadas de células **paliçádicas ou esclerenquimatosas** de parede espessa, muitas vezes pigmentado e refringente.\n- **Endosperma/cotilédone**: células poligonais com parede fina cheias de **grânulos de amido** ou de **gotículas de óleo** (gergelim, papoula) — as células de reserva.\n- **Embrião** central com tecidos organizados em pequenas sementes.\n- Sem reação quando está na luz (apêndice, divertículo); granuloma se perfurar.\n\n## Onde engana\n- Enviada como "pólipo" ou como parasita: a parede vegetal e a ausência de núcleos resolvem.\n- Tomate no apêndice imita ovo de verme gigante.\n\n## Contexto\n- Luz apendicular (obstrução?), divertículos, estômago, fístulas; sementes de papoula e gergelim em biópsias de cólon.',
      traits: [],
      sites: ['apendice', 'intestino', 'estomago', 'esofago'],
      clinical: ['ingestao', 'mimico-tumor', 'nao-birrefringente'],
      photos: [
        { src: img_sementes_0, thumb: img_sementes_0_thumb, caption: 'Sementes na luz do apêndice', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr Emily Ryan — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_sementes_1, caption: 'Semente de tomate no apêndice: tegumento com células alongadas e embrião', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Rakesh Gupta — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_sementes_2, caption: 'Semente de tomate enviada como pólipo', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Linda Castillo — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_sementes_3, caption: 'Gergelim: macroscopia e endosperma com gotículas de óleo', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Diego Morales — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_sementes_4, caption: 'Sementes de papoula em corte: tegumento reticulado e embrião', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Diego Morales — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'bario',
      name: 'Sulfato de bário',
      aka: ['Bário', 'Granuloma de bário', 'Enema baritado', 'Aspiração de bário'],
      summary: 'Cristais finos, romboides ou em placa, acinzentados a verde-oliva, birrefringentes, dentro de macrófagos e células gigantes na submucosa ou nos alvéolos.',
      description:
        '## Morfologia\n- Partículas **cristalinas pequenas, romboides ou em placa**, **cinza-esverdeadas** no HE, finamente granulares quando em massa, **birrefringentes**.\n- Dentro de **histiócitos e células gigantes**, com fibrose; no cólon, na **submucosa e pericolônico** após extravasamento por perfuração ou divertículo (granuloma de bário).\n- Aspirado: material granular escuro preenchendo alvéolos, com pneumonia.\n\n## Onde engana\n- Calcificação ou hemossiderina: o bário é cristalino e polariza; von Kossa negativo, azul da Prússia negativo.\n- Bactérias em massa: não polarizam.\n\n## Contexto\n- Enema opaco ou trânsito com bário recente; aspiração durante esofagograma.',
      traits: [],
      sites: ['intestino', 'pulmao', 'esofago', 'pleura'],
      clinical: ['endoscopia', 'aspiracao', 'birrefringente', 'cristal', 'reacao-granulomatosa'],
      photos: [
        { src: img_bario_0, thumb: img_bario_0_thumb, caption: 'Perfuração de cólon: bário na parede e no peritônio', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Raul S — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_bario_1, caption: 'Bário pericolônico, com e sem polarização', stain: 'HE, polarizado', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer) — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_bario_2, caption: 'Aspiração de bário: material granular escuro nos alvéolos', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer) — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_bario_3, caption: 'O mesmo material brilhando à luz polarizada', stain: 'HE, polarizado', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer) — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_bario_4, caption: 'Cristais de sulfato de bário na mucosa do cólon', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Celina Stayerman — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'acido-hialuronico',
      name: 'Ácido hialurônico (preenchedor)',
      aka: ['Hialuronato', 'Preenchedor dérmico', 'Restylane', 'Juvederm'],
      summary: 'Lagos de material amorfo, basofílico ou azul-acinzentado, sem estrutura, na derme profunda ou subcutâneo, Alcian blue positivo; pouca reação, salvo granulomas tardios.',
      description:
        '## Morfologia\n- **Lagos ou fendas de material amorfo, basofílico a azul-acinzentado** (às vezes quase incolor), sem partículas, entre feixes de colágeno ou no subcutâneo, dissecando o tecido.\n- **Alcian blue e azul de toluidina positivos**; não birrefringente.\n- Reação: nenhuma ou histiócitos e células gigantes na borda; granulomas nodulares tardios e abscessos estéreis em alguns casos.\n\n## Onde engana\n- Mucina de tumor (carcinoma mucinoso), mixoma, mucinose: o preenchedor fica em lagos delimitados, acelulares, na topografia da injeção.\n- Silicone: vacúolos, não lagos.\n\n## Contexto\n- Preenchimento de lábios, sulcos, malar, glúteo; injeção acidental em mama; nódulo tardio meses a anos depois.',
      traits: [],
      sites: ['pele', 'mucosa-oral', 'mama', 'partes-moles'],
      clinical: ['estetico', 'nao-birrefringente', 'reacao-granulomatosa'],
      photos: [
        { src: img_acido_hialuronico_0, thumb: img_acido_hialuronico_0_thumb, caption: 'Lábio: lago de ácido hialurônico com material amorfo azul-acinzentado', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Daniel Lozeau — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_acido_hialuronico_1, caption: 'Preenchedor de ácido hialurônico na pele: massas amorfas basofílicas', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer) — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_acido_hialuronico_2, caption: 'Mama: ácido hialurônico injetado dissecando o estroma', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Jordan Baum — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'pmma',
      name: 'Polimetilmetacrilato (PMMA)',
      aka: ['Metacril', 'Microesferas de PMMA', 'Cimento ósseo', 'Bioplastia'],
      summary: 'Microesferas redondas, uniformes (30–40 µm), translúcidas e vazias após o processamento, em favo, cercadas por histiócitos e células gigantes; birrefringentes.',
      description:
        '## Morfologia\n- **Microesferas redondas, de tamanho uniforme (~30–40 µm)**, de parede fina e interior **vazio ou translúcido** (o polímero se dissolve parcialmente), dispostas **em favo** na derme profunda e no subcutâneo.\n- **Histiócitos e células gigantes** entre e ao redor das esferas, fibrose; granulomas nodulares tardios, às vezes com necrose.\n- Vacúolos regulares e homogêneos, ao contrário do silicone.\n- Cimento ósseo (artroplastia, vertebroplastia): massa amorfa vazia com borda de partículas de bário/zircônio e fibrose.\n\n## Onde engana\n- Silicone: vacúolos de tamanhos díspares; o PMMA é monótono.\n- Adipócitos: têm núcleo e formam lóbulos.\n\n## Contexto\n- Bioplastia de glúteo, face e genitália (muito usada no Brasil); nódulos e migração anos depois; cimento ortopédico.',
      traits: [],
      sites: ['pele', 'partes-moles', 'genital', 'osso'],
      clinical: ['estetico', 'protese', 'reacao-granulomatosa', 'birrefringente'],
      photos: [
        { src: img_pmma_0, thumb: img_pmma_0_thumb, caption: 'Microesferas uniformes de PMMA em favo entre histiócitos; ao lado, outro material não identificado', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Zaid Househ — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'acido-poli-l-latico',
      name: 'Ácido poli-L-láctico (Sculptra)',
      aka: ['Sculptra', 'PLLA', 'Bioestimulador'],
      summary: 'Partículas ovais, fusiformes ou em fatia, translúcidas, birrefringentes, dentro de células gigantes e granulomas, no subcutâneo injetado.',
      description:
        '## Morfologia\n- Partículas **ovais, fusiformes ou em fatia**, de **40 a 60 µm**, **translúcidas**, **birrefringentes**, dentro de **células gigantes** e histiócitos em granulomas de corpo estranho, com fibrose progressiva (é esse o efeito desejado).\n- Nódulos e granulomas exuberantes quando a diluição ou a técnica são inadequadas.\n\n## Onde engana\n- PMMA: esferas redondas e uniformes.\n- Hidroxiapatita de cálcio: esferas cinza-azuladas, não birrefringentes.\n- Sarcoidose: os granulomas do PLLA contêm as partículas — polarize.\n\n## Contexto\n- Bioestimulação de colágeno em face, glúteo, braços; combinação com outros preenchedores no mesmo sítio é frequente.',
      traits: [],
      sites: ['pele', 'partes-moles'],
      clinical: ['estetico', 'reacao-granulomatosa', 'birrefringente'],
      photos: [
        { src: img_acido_poli_l_latico_0, thumb: img_acido_poli_l_latico_0_thumb, caption: 'Glúteo: reação granulomatosa a Sculptra (acima, com polarização) e silicone (abaixo) no mesmo caso', stain: 'HE, polarizado', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer) — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'hidroxiapatita',
      name: 'Hidroxiapatita de cálcio (Radiesse, enxerto ósseo)',
      aka: ['Radiesse', 'Hidroxiapatita', 'Bio-Oss', 'Substituto ósseo', 'Enxerto ósseo bovino'],
      summary: 'Microesferas uniformes, cinza-azuladas, refringentes, de 25–45 µm, entre histiócitos e células gigantes (Radiesse); blocos irregulares de material ósseo acelular com osso neoformado ao redor (enxerto).',
      description:
        '## Morfologia\n- **Radiesse**: **microesferas redondas, uniformes, de 25 a 45 µm**, **cinza-azuladas a lilás**, refringentes, **não birrefringentes**, sem cor no von Kossa (cálcio fracamente demonstrável), entre **histiócitos e células gigantes** e colágeno neoformado.\n- **Enxerto ósseo (Bio-Oss, hidroxiapatita sintética)**: **fragmentos irregulares de matriz óssea acelular**, basofílicos ou pálidos, com **osso vivo neoformado aposto** e células gigantes na superfície; lacunas vazias.\n\n## Onde engana\n- PMMA: esferas vazias e birrefringentes.\n- Calcificação distrófica: amorfa, sem esferas.\n- Enxerto ósseo vs. osso necrótico: o enxerto tem forma geométrica e não tem osteócitos nem sistema haversiano organizado.\n\n## Contexto\n- Preenchimento facial e de mãos; enxertos em implantodontia e seio maxilar; anos depois aparece em biópsias de mucosa e osso.',
      traits: [],
      sites: ['pele', 'mucosa-oral', 'osso', 'partes-moles'],
      clinical: ['estetico', 'protese', 'reacao-granulomatosa', 'nao-birrefringente'],
      photos: [
        { src: img_hidroxiapatita_0, thumb: img_hidroxiapatita_0_thumb, caption: 'Vestíbulo labial: microesferas uniformes de hidroxiapatita entre histiócitos', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Aziz Banasser — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_hidroxiapatita_1, caption: 'Enxerto de hidroxiapatita: blocos acelulares com osso neoformado na borda', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer) — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_hidroxiapatita_2, caption: 'Bio-Oss: fragmentos de matriz óssea bovina desproteinizada com reação gigantocelular', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer) — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'celulose-oxidada',
      name: 'Celulose oxidada regenerada (Surgicel)',
      aka: ['Surgicel', 'Celulose oxidada', 'Hemostático absorvível', 'Gelita'],
      summary: 'Fibras e fitas trançadas, refringentes, basofílicas ou vermelho-amareladas, que se degradam em material amorfo com aspecto de "Surgicel em degeneração", com reação gigantocelular; imita abscesso na imagem.',
      description:
        '## Morfologia\n- **Fibras longas, achatadas, em fita ou trançadas**, **refringentes**, **basofílicas a vermelho-alaranjadas** no HE, dispostas em rede ou em feixes, na cavidade cirúrgica.\n- Degradam em dias a semanas: massas **amorfas, granulares, eosinofílicas ou azuladas**, com **células gigantes**, neutrófilos e fibrose ao redor.\n- **Birrefringência** presente nas fibras íntegras, fraca no material degradado. Pó de Surgicel: fragmentos poligonais.\n- Em PAAF de linfonodo: material fibrilar acelular com histiócitos — imita necrose ou tumor.\n\n## Onde engana\n- Abscesso, hematoma ou recidiva tumoral na imagem pós-operatória.\n- Fio de sutura: filamentos redondos regulares; o Surgicel é em fita.\n- Fungos (as fibras degradadas lembram hifas largas): Grocott negativo.\n\n## Contexto\n- Cirurgias de fígado, tireoide, pulmão, neurocirurgia; reoperação ou biópsia da "lesão" semanas depois.',
      traits: [],
      sites: ['figado', 'pulmao', 'linfonodo', 'tireoide', 'snc', 'partes-moles'],
      clinical: ['cirurgia-previa', 'reacao-granulomatosa', 'birrefringente', 'mimico-tumor', 'citologia'],
      photos: [
        { src: img_celulose_oxidada_0, thumb: img_celulose_oxidada_0_thumb, caption: 'Vesícula: fibras de celulose oxidada em vários aumentos', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Mark Ong — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_celulose_oxidada_1, caption: 'Surgicel junto a carcinoma de pulmão: macroscopia, histologia e citologia', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Irene Sansano — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_celulose_oxidada_2, caption: 'Pó de Surgicel: fragmentos poligonais basofílicos em meio a sangue', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Diego Morales — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_celulose_oxidada_3, caption: 'PAAF de linfonodo: reação de corpo estranho ao Surgicel, com polarização', stain: 'Papanicolaou, polarizado', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Lara Pijuan — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'gelfoam',
      name: 'Esponja de gelatina (Gelfoam, Spongostan)',
      aka: ['Gelfoam', 'Spongostan', 'Esponja hemostática', 'Gelatina absorvível'],
      summary: 'Fragmentos angulados, eosinofílicos e homogêneos, em rede de trabéculas com espaços vazios (aspecto de espuma), na cavidade cirúrgica ou dentro de vasos embolizados.',
      description:
        '## Morfologia\n- Material **eosinofílico, homogêneo, em trabéculas anguladas ou em fitas** que formam uma **rede com espaços vazios** — a esponja em corte.\n- Dentro de **vasos** (embolização) ou no leito cirúrgico, envolvido por fibrina, neutrófilos e depois **células gigantes**; reabsorve em 4 a 6 semanas.\n- PAS fracamente positivo, não birrefringente.\n\n## Onde engana\n- Trombo organizado ou fibrina: o Gelfoam tem contornos angulares e espaços regulares.\n- Amiloide ou colágeno hialinizado: o padrão de espuma e a história de cirurgia ou embolização resolvem.\n\n## Contexto\n- Hemostasia em neurocirurgia, otorrino, fígado; embolização de artérias uterinas, brônquicas e de tumores; biópsia semanas depois.',
      traits: [],
      sites: ['vaso', 'rim', 'utero', 'pulmao', 'figado', 'snc'],
      clinical: ['cirurgia-previa', 'embolizacao', 'nao-birrefringente', 'reacao-granulomatosa'],
      photos: [
        { src: img_gelfoam_0, thumb: img_gelfoam_0_thumb, caption: 'Gelfoam: fragmentos angulados eosinofílicos formando uma rede', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer) — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_gelfoam_1, caption: 'Rim: esponja de gelatina no leito cirúrgico (seta)', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Laurence Galea — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_gelfoam_2, caption: 'Artéria ocluída por êmbolo de Gelfoam', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer) — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_gelfoam_3, caption: 'Útero pós-parto embolizado: Gelfoam dentro dos vasos', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Leon Metlay — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'avitene',
      name: 'Colágeno microfibrilar (Avitene)',
      aka: ['Avitene', 'Hemostático de colágeno', 'Colágeno bovino'],
      summary: 'Feixes e fragmentos de colágeno acelular, eosinofílico, fibrilar, de contornos irregulares, sem os núcleos do tecido, com reação de corpo estranho no leito cirúrgico.',
      description:
        '## Morfologia\n- **Feixes irregulares de colágeno acelular**, eosinofílico e finamente **fibrilar**, sem fibroblastos, soltos entre sangue e fibrina no leito cirúrgico.\n- Reação de **células gigantes**, neutrófilos e, depois, fibrose; reabsorção em semanas a meses.\n- Tricrômico cora em azul como colágeno; não birrefringente ou fracamente.\n\n## Onde engana\n- Colágeno hialinizado do próprio tecido ou amiloide: o Avitene é fragmentado, com bordas rasgadas, e não tem células.\n- Gelfoam: rede de trabéculas com espaços; o Avitene é fibrilar.\n\n## Contexto\n- Hemostasia em neurocirurgia, fígado, tireoide, mama (cavidade da biópsia).',
      traits: [],
      sites: ['partes-moles', 'figado', 'mama', 'snc', 'tireoide'],
      clinical: ['cirurgia-previa', 'reacao-granulomatosa', 'nao-birrefringente'],
      photos: [
        { src: img_avitene_0, thumb: img_avitene_0_thumb, caption: 'Avitene: fragmentos fibrilares de colágeno acelular', stain: 'HE', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'microesferas-embolizacao',
      name: 'Microesferas de embolização (PVA, trisacryl-gelatina, Y-90)',
      aka: ['Álcool polivinílico', 'PVA', 'Embosphere', 'Bead Block', 'Ítrio-90', 'Embolização de mioma'],
      summary: 'Esferas ou partículas dentro de vasos: PVA irregular, azul-acinzentado e fibrilar, dividido por septos fibrosos; microesferas de trisacryl-gelatina redondas, rosadas, dobradas como coloide.',
      description:
        '## Morfologia\n- **Partículas de PVA**: **irregulares, azul-acinzentadas, fibrilares ou bolhosas**, dentro de vasos, com o tempo divididas por **septos fibrosos** e cercadas por **células gigantes**; PAS-positivas.\n- **Microesferas de PVA (Contour SE)**: ovais, azul-acinzentadas, com centro degenerado.\n- **Trisacryl-gelatina (Embosphere)**: **esferas redondas, homogêneas, rosadas**, que se dobram como coloide tireoidiano; reação linfocitária e gigantocelular discreta.\n- **Microesferas de ítrio-90 / vidro**: esferas pequenas, refringentes, escuras, em grupos nos vasos portais.\n\n## Onde engana\n- Coloide, mucina ou trombo: a localização intravascular e a regularidade das esferas decidem.\n- Talco ou cristais: as microesferas não polarizam (exceto vidro).\n\n## Contexto\n- Embolização de miomas, próstata, hemoptise, hepatocarcinoma (quimio e radioembolização), malformações; peça cirúrgica ou biópsia meses depois.',
      traits: [],
      sites: ['vaso', 'utero', 'figado', 'pulmao', 'genital', 'rim'],
      clinical: ['embolizacao', 'reacao-granulomatosa', 'nao-birrefringente'],
      photos: [
        { src: img_microesferas_embolizacao_0, thumb: img_microesferas_embolizacao_0_thumb, caption: 'Pulmão: partículas de PVA azul-acinzentadas dentro de vasos, com reação gigantocelular', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr Rajesh Panth Embolization performed by Dr — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_microesferas_embolizacao_1, caption: 'Próstata embolizada: microesferas redondas e homogêneas dentro dos vasos', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Sara E — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'onyx',
      name: 'Onyx (copolímero EVOH com tântalo)',
      aka: ['Onyx', 'Etileno-vinil-álcool', 'Embolização de MAV'],
      summary: 'Material negro, granular e opaco (pó de tântalo) preenchendo a luz de vasos malformados, com esponja de polímero incolor entre os grânulos; reação gigantocelular na parede.',
      description:
        '## Morfologia\n- Luz vascular ocupada por **massa negra, granular, opaca** — o **pó de tântalo** que dá radiopacidade — misturada a um **polímero incolor, espumoso**.\n- Parede do vaso com **células gigantes**, histiócitos e inflamação crônica; necrose angioide focal; extravasamento para o tecido ao redor.\n- Não birrefringente.\n\n## Onde engana\n- Pigmento antracótico ou hemossiderina em vaso: o Onyx é opaco, homogêneo e ocupa a luz inteira.\n- Cola cianoacrilato (Histoacryl): material acelular vazio, sem grânulos negros.\n\n## Contexto\n- Embolização de malformações arteriovenosas cerebrais e de couro cabeludo, fístulas durais, tumores hipervasculares; a peça ressecada vem depois.',
      traits: [],
      sites: ['vaso', 'snc', 'pele'],
      clinical: ['embolizacao', 'pigmentado', 'nao-birrefringente', 'reacao-granulomatosa'],
      photos: [
        { src: img_onyx_0, thumb: img_onyx_0_thumb, caption: 'Couro cabeludo: vasos preenchidos por Onyx negro', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer) — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_onyx_1, caption: 'Malformação arteriovenosa cerebral embolizada com Onyx', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Craig Horbinski — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'polimero-hidrofilico',
      name: 'Polímero hidrofílico (revestimento de cateter)',
      aka: ['Êmbolo de polímero hidrofílico', 'Revestimento de guia', 'Embolia de gel de cateter'],
      summary: 'Material lamelar, serpiginoso ou em bastão, basofílico pálido, não refringente, dentro de pequenos vasos após procedimento endovascular, com trombo e reação gigantocelular.',
      description:
        '## Morfologia\n- **Fragmentos lamelares, serpiginosos ou em bastão, de contornos ondulados**, **basofílicos pálidos a acinzentados**, **não refringentes e não birrefringentes**, dentro de **arteríolas e pequenas artérias** (ou num trombo maior).\n- Trombose, **reação gigantocelular** e endarterite ao redor; microinfartos no órgão a jusante.\n- PAS negativo; não cora pelo tricrômico.\n\n## Onde engana\n- Trombo organizado, mixoma embolizado, amiloide vascular: o polímero tem lamelas concêntricas e bordas serpiginosas, sem células.\n- Corpo estranho de outro tipo: história de cateterismo dias a semanas antes.\n\n## Contexto\n- Cateterismo, angioplastia, embolectomia, implante de TAVI; pele (livedo, úlceras), pulmão, cérebro, rim e extremidades.',
      traits: [],
      sites: ['vaso', 'pele', 'pulmao', 'snc', 'rim', 'partes-moles'],
      clinical: ['embolizacao', 'nao-birrefringente', 'reacao-granulomatosa'],
      photos: [
        { src: img_polimero_hidrofilico_0, thumb: img_polimero_hidrofilico_0_thumb, caption: 'Membro inferior: êmbolo de polímero hidrofílico, lamelar e basofílico pálido, com reação gigantocelular', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Eduardo Alcaraz — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_polimero_hidrofilico_1, caption: 'Fragmentos de polímero hidrofílico dentro de trombo de artéria femoral', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Charles Leduc — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'excipientes',
      name: 'Excipientes de comprimido (crospovidona, celulose microcristalina)',
      aka: ['Crospovidona', 'Celulose microcristalina', 'Talco de comprimido', 'Embolia por comprimido injetado'],
      summary: 'Crospovidona: material coralino ou em coroa, basofílico/roxo, não birrefringente; celulose microcristalina: fibras e placas incolores, fortemente birrefringentes, PAS-positivas; nos vasos pulmonares de quem injeta comprimidos ou na mucosa intestinal.',
      description:
        '## Morfologia\n- **Crospovidona** (polivinilpirrolidona reticulada): agregados **coralinos ou em coroa**, **basofílicos a roxo-escuros** no HE, com halo rosado; **não birrefringente**; cora com azul de Alcian e vermelho Congo (falso amiloide) — na mucosa do intestino delgado ou dentro de vasos pulmonares, renais e cerebrais.\n- **Celulose microcristalina**: **fibras e placas incolores, fortemente birrefringentes**, PAS-positivas, em granulomas intravasculares e perivasculares no pulmão.\n- **Talco**: veja o verbete; os três costumam vir juntos na embolia por comprimido triturado e injetado.\n- Reação: granulomas gigantocelulares angiocêntricos, trombose, hipertensão pulmonar; hemorragia.\n\n## Onde engana\n- Crospovidona na biópsia intestinal imita bactéria, parasita ou amiloide; é inerte e vem do comprimido ingerido.\n- Êmbolos sépticos ou tumorais: o material cristalino e a história de uso de drogas.\n\n## Contexto\n- Injeção intravenosa de comprimidos dissolvidos (metilfenidato, opioides); ingestão de comprimidos com biópsia endoscópica logo depois.',
      traits: [],
      sites: ['vaso', 'pulmao', 'intestino', 'rim', 'snc', 'estomago'],
      clinical: ['drogas-injetaveis', 'medicacao', 'reacao-granulomatosa', 'birrefringente', 'nao-birrefringente'],
      photos: [
        { src: img_excipientes_0, thumb: img_excipientes_0_thumb, caption: 'Crospovidona roxa, coralina, dentro de arteríola pulmonar com célula gigante', stain: 'HE', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_excipientes_1, caption: 'Embolia por crospovidona em pulmão (HE, Alcian blue, EVG), rim e cérebro', stain: 'HE e especiais', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Richard Jones — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_excipientes_2, caption: 'Intestino delgado: crospovidona ingerida, com núcleo rosado e capa roxa', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Pooja Navale — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_excipientes_3, caption: 'Celulose microcristalina brilhando à luz polarizada em vaso pulmonar', stain: 'HE, polarizado', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_excipientes_4, caption: 'Celulose microcristalina em granuloma intravascular pulmonar', stain: 'HE', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'resinas',
      name: 'Resinas medicamentosas (sevelamer, Kayexalate, colestiramina)',
      aka: ['Sevelamer', 'Kayexalate', 'Poliestireno sulfonato', 'Colestiramina', 'Colestipol', 'Cristais de resina'],
      summary: 'Cristais grandes, poligonais ou em fatia, com aspecto de escama de peixe (mosaico) e cores que identificam a droga: sevelamer rosa-amarelado bicolor, Kayexalate roxo, colestiramina vermelho-alaranjada; podem vir com necrose da mucosa.',
      description:
        '## Morfologia\n- Cristais **grandes (50–500 µm), irregulares, poligonais ou em fatia**, com **estriações internas em escama de peixe ou mosaico**, aderidos à superfície da mucosa ou dentro de úlceras e da luz.\n- **Sevelamer**: **bicolor, rosa com bordas amarelo-alaranjadas** (ou amarelo-esverdeado), escamas de peixe largas e curvas; **PAS magenta**.\n- **Kayexalate (poliestireno sulfonato de sódio/cálcio)**: **roxo-basofílico** no HE, **PAS-D preto-violáceo**, mosaico regular; vem com **necrose isquêmica** da mucosa (sorbitol).\n- **Colestiramina**: **vermelho-alaranjada** e homogênea, sem escamas; inerte.\n- Todos são **não birrefringentes**.\n\n## Onde engana\n- Uns com os outros — a cor e o padrão interno separam; a história medicamentosa confirma.\n- Necrose ao lado do cristal: só o Kayexalate e o sevelamer se associam a lesão da mucosa; a colestiramina é inocente.\n\n## Contexto\n- Doença renal crônica (hiperfosfatemia, hipercalemia), hipercolesterolemia; biópsia de cólon, estômago, esôfago, apêndice; aspiração de Kayexalate.',
      traits: [],
      sites: ['intestino', 'estomago', 'esofago', 'apendice', 'pulmao', 'figado'],
      clinical: ['medicacao', 'dialise', 'aspiracao', 'nao-birrefringente', 'cristal'],
      photos: [
        { src: img_resinas_0, thumb: img_resinas_0_thumb, caption: 'Biópsia de cólon: cristal de sevelamer bicolor com escamas de peixe', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Saul Harari — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_resinas_1, caption: 'Apêndice: cristais de sevelamer na luz', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Pooja Navale — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_resinas_2, caption: 'Aspiração de Kayexalate: cristal roxo em mosaico no pulmão', stain: 'HE', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_resinas_3, caption: 'Perfuração de cólon associada a Kayexalate: cristais na parede', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer) — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_resinas_4, caption: 'Sequestrador de ácidos biliares (colestiramina) na luz intestinal', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Christina Arnold — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'ferro',
      name: 'Ferro (comprimido de sulfato ferroso)',
      aka: ['Gastrite por ferro', 'Pílula de ferro', 'Sulfato ferroso', 'Siderose da mucosa'],
      summary: 'Material cristalino marrom-escuro ou amarelo-dourado, refringente, na superfície da mucosa gástrica e na lâmina própria, azul no azul da Prússia, com erosão e necrose ao redor.',
      description:
        '## Morfologia\n- Cristais e grumos **marrom-escuros a amarelo-dourados**, refringentes, **na superfície da mucosa**, no muco, na lâmina própria e dentro das fovéolas, às vezes incrustados em vasos e no epitélio.\n- **Azul da Prússia fortemente positivo**.\n- **Erosão, necrose e regeneração** da mucosa em contato com o comprimido; fibrose e siderose nos casos crônicos.\n- Aspirado: cristais no brônquio com necrose da mucosa.\n\n## Onde engana\n- Hemossiderina de hemorragia: fina, intracelular, sem necrose de contato.\n- Melanose ou lipofuscina: azul da Prússia negativo.\n- Pigmento biliar ou de sangue digerido no lúmen: não é refringente nem forma cristais.\n\n## Contexto\n- Uso oral de sulfato ferroso, comprimido preso no esôfago ou estômago, idoso; aspiração.',
      traits: [],
      sites: ['estomago', 'esofago', 'pulmao', 'intestino'],
      clinical: ['medicacao', 'aspiracao', 'pigmentado', 'cristal'],
      photos: [
        { src: img_ferro_0, thumb: img_ferro_0_thumb, caption: 'Gastrite por ferro: cristais na lâmina própria e nas fovéolas', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr Monika Vyas — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_ferro_1, caption: 'Cristais de ferro no epitélio e na lâmina própria, com azul da Prússia', stain: 'HE e azul da Prússia', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr Adam L Booth — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_ferro_2, caption: 'Aspiração de sulfato ferroso: material marrom no brônquio, positivo no azul da Prússia', stain: 'HE e azul da Prússia', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Sanjay Mukhopadhyay — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'lantanio',
      name: 'Carbonato de lantânio',
      aka: ['Lantânio', 'Lantanose gástrica', 'Fosrenol'],
      summary: 'Histiócitos grandes, eosinofílicos, com material granular fino ou em agulhas marrom-claras na lâmina própria gástrica, que lembram corpos ferruginosos; von Kossa e azul da Prússia negativos.',
      description:
        '## Morfologia\n- **Histiócitos** grandes e **eosinofílicos**, isolados ou em agregados, na **lâmina própria** do estômago e do duodeno, contendo **material granular fino, marrom-claro ou incolor**, às vezes **em agulhas ou bastões** que lembram corpos ferruginosos.\n- **Não birrefringente**; azul da Prússia e von Kossa negativos (é lantânio, não ferro nem cálcio). Detectável por microanálise.\n- Mucosa ao redor com gastrite crônica; endoscopicamente, placas esbranquiçadas.\n\n## Onde engana\n- Gastrite xantomatosa ou infecção por micobactéria atípica: os histiócitos do lantânio têm o material granular refringente e o contexto de diálise.\n- Corpos ferruginosos: azul da Prússia positivo.\n\n## Contexto\n- Quelante de fósforo em diálise; achado incidental em biópsia gástrica.',
      traits: [],
      sites: ['estomago', 'intestino'],
      clinical: ['medicacao', 'dialise', 'nao-birrefringente'],
      photos: [],
    },
    {
      id: 'algodao',
      name: 'Gaze e fibras de algodão (gossipiboma)',
      aka: ['Gossipiboma', 'Textiloma', 'Compressa retida', 'Fibras de algodão', 'Cotonoide'],
      summary: 'Fibras longas, tubulares e achatadas, incolores e fortemente birrefringentes, torcidas como fita, soltas ou em trama, com reação gigantocelular, abscesso e fibrose; a compressa inteira forma um pseudotumor.',
      description:
        '## Morfologia\n- **Fibras de celulose** (algodão) **tubulares, achatadas, torcidas em fita**, incolores ou levemente basofílicas, **fortemente birrefringentes**, sem estrutura interna, isoladas (contaminação de curativo, cotonete, cotonoide) ou **em trama** (compressa).\n- Reação **gigantocelular e granulomatosa**, abscesso, fibrose densa e, com o tempo, **massa encapsulada** com necrose central (gossipiboma).\n- Êmbolos de fibras em pulmão após cateterismo ou cirurgia.\n\n## Onde engana\n- Recidiva tumoral ou abscesso na imagem pós-operatória.\n- Fibras vegetais aspiradas (têm vasos e parede celular) e pelo (córtex fibrilar): a fibra de algodão é lisa e torcida.\n\n## Contexto\n- Cirurgia prévia (abdome, tórax, neurocirurgia, mama); fibras de gaze em úlceras e na pele; contaminante de lâmina.',
      traits: [],
      sites: ['pleura', 'intestino', 'genital', 'snc', 'pele', 'vaso', 'pulmao'],
      clinical: ['cirurgia-previa', 'reacao-granulomatosa', 'birrefringente', 'mimico-tumor', 'contaminante'],
      photos: [
        { src: img_algodao_0, thumb: img_algodao_0_thumb, caption: 'Macroscopia: compressa cirúrgica retida, encapsulada (gossipiboma)', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer) — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_algodao_1, caption: 'Gaze retida junto ao ovário: macroscopia e reação gigantocelular às fibras', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Maribel Donastorg — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_algodao_2, caption: 'Compressa no íleo terminal: imagem, peça e fibras birrefringentes', stain: 'HE, polarizado', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Bipin TH — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_algodao_3, caption: 'Fibras de algodão na pele, refringentes, em meio a reação inflamatória', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Silvija Gottesman — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_algodao_4, caption: 'Êmbolo de fibra de algodão em vaso pulmonar, à luz polarizada', stain: 'HE, polarizado', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'mercurio',
      name: 'Mercúrio metálico',
      aka: ['Mercúrio', 'Granuloma de mercúrio', 'Injeção de mercúrio', 'Termômetro quebrado'],
      summary: 'Glóbulos esféricos, negros e opacos, de tamanhos variados, não birrefringentes, no subcutâneo, com necrose, abscesso e granulomas de corpo estranho ao redor.',
      description:
        '## Morfologia\n- **Esferas negras, opacas, perfeitamente redondas**, de 5 a 200 µm, isoladas ou agrupadas, **não birrefringentes**, que resistem ao processamento.\n- Ao redor: **necrose**, abscesso, granulomas de corpo estranho, fibrose; os glóbulos migram pelo tecido e pelos linfáticos.\n\n## Onde engana\n- Pigmento de tatuagem ou carbono: grânulos irregulares, não esferas perfeitas.\n- Artefato de corte (bolhas): o mercúrio é opaco e vem com a inflamação.\n\n## Contexto\n- Injeção autoprovocada, termômetro quebrado na pele, amálgama; radiografia mostra o metal.',
      traits: [],
      sites: ['pele', 'partes-moles', 'linfonodo'],
      clinical: ['trauma', 'pigmentado', 'nao-birrefringente', 'reacao-granulomatosa'],
      photos: [
        { src: img_mercurio_0, thumb: img_mercurio_0_thumb, caption: 'Pele: glóbulos negros de mercúrio em meio a inflamação e necrose', stain: 'HE', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_mercurio_1, caption: 'Glóbulo de mercúrio dentro de granuloma de corpo estranho', stain: 'HE', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'metalose',
      name: 'Metalose (debris de prótese articular)',
      aka: ['Metalose', 'Debris de desgaste', 'Polietileno', 'Pseudotumor de prótese', 'ALVAL'],
      summary: 'Partículas metálicas negras finas dentro de histiócitos e partículas de polietileno incolores e birrefringentes em células gigantes, na sinóvia e no linfonodo de quem tem prótese.',
      description:
        '## Morfologia\n- **Metal**: partículas **negras, finas, angulares**, em histiócitos e livres, na sinóvia e na cápsula; tecido acinzentado à macroscopia. Não birrefringente.\n- **Polietileno**: fragmentos **incolores, refringentes, em fatia ou fibrilares**, **birrefringentes**, dentro de **células gigantes**.\n- **Cimento (PMMA)**: espaços vazios com borda de partículas de bário.\n- Reação: histiocitose, células gigantes, fibrose; **ALVAL** (metal-metal): infiltrado linfocitário perivascular denso, necrose, pseudotumor. Migração para linfonodos regionais.\n\n## Onde engana\n- Sinovite vilonodular pigmentada: hemossiderina (azul da Prússia positiva), células gigantes osteoclásticas.\n- Melanoma ou tatuagem em linfonodo: o metal é angular, negro e vem com o histórico de prótese.\n\n## Contexto\n- Revisão de artroplastia de quadril e joelho, próteses metal-metal, soltura asséptica.',
      traits: [],
      sites: ['osso', 'partes-moles', 'linfonodo'],
      clinical: ['protese', 'reacao-granulomatosa', 'pigmentado', 'birrefringente'],
      photos: [
        { src: img_metalose_0, thumb: img_metalose_0_thumb, caption: 'Metalose: partículas metálicas finas e reação histiocitária na sinóvia', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Frank Ingram — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_metalose_1, caption: 'Linfonodo: histiócitos com debris de desgaste de prótese de quadril', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Scott Kilpatrick — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'ptfe',
      name: 'Politetrafluoroetileno (Teflon, Gore-Tex)',
      aka: ['Teflon', 'PTFE', 'Gore-Tex', 'Politef', 'Teflonoma'],
      summary: 'Partículas ou membranas de material incolor, refringente, birrefringente, com aspecto fibrilar ou em nó, cercadas por células gigantes e granulomas densos (teflonoma).',
      description:
        '## Morfologia\n- **Injeção (Politef)**: partículas **irregulares, incolores a cinza-pálidas, refringentes, birrefringentes**, de 10 a 100 µm, no meio de **granulomas de corpo estranho** exuberantes com fibrose — o **teflonoma**.\n- **Enxerto vascular / tela (Gore-Tex)**: membrana **microporosa** com estrutura **fibrilar em nós e fibrilas**, cercada por fibrose e células gigantes; os poros são colonizados por fibroblastos.\n- Não se cora; o tricrômico deixa o material claro.\n\n## Onde engana\n- Tumor de laringe, tireoide ou bexiga na imagem (teflonoma imita neoplasia).\n- Outros polímeros: só o contexto e, se preciso, a espectroscopia.\n\n## Contexto\n- Injeção para paralisia de prega vocal (histórica), refluxo vesicoureteral; enxertos vasculares, telas e patches cirúrgicos.',
      traits: [],
      sites: ['partes-moles', 'vaso', 'trato-urinario', 'tireoide'],
      clinical: ['protese', 'cirurgia-previa', 'reacao-granulomatosa', 'birrefringente', 'mimico-tumor'],
      photos: [
        { src: img_ptfe_0, thumb: img_ptfe_0_thumb, caption: 'PTFE: material fibrilar refringente com reação de corpo estranho', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Saul Harari — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_ptfe_1, caption: 'Enxerto de PTFE em corte, com fibrose ao redor', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Saul Harari — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'poliuretano',
      name: 'Poliuretano (revestimento de prótese de mama)',
      aka: ['Prótese de poliuretano', 'Espuma de poliuretano', 'Cápsula de prótese'],
      summary: 'Fragmentos triangulares ou em estrela, incolores e refringentes, da espuma de poliuretano, dentro de células gigantes na cápsula fibrosa da prótese; birrefringentes.',
      description:
        '## Morfologia\n- Fragmentos **pequenos, triangulares, em estrela ou em bastão**, **incolores, refringentes, birrefringentes**, dentro de **células gigantes** e histiócitos na **cápsula fibrosa** ao redor da prótese — restos da espuma que se degrada.\n- Sinóvia-like na superfície interna da cápsula; calcificação com o tempo.\n\n## Onde engana\n- Silicone: vacúolos vazios, não birrefringente.\n- Fio de sutura: filamentos regulares.\n\n## Contexto\n- Próteses de mama texturizadas com poliuretano; capsulectomia por contratura ou por troca.',
      traits: [],
      sites: ['mama', 'partes-moles'],
      clinical: ['protese', 'estetico', 'reacao-granulomatosa', 'birrefringente'],
      photos: [
        { src: img_poliuretano_0, thumb: img_poliuretano_0_thumb, caption: 'Cápsula de prótese: fragmentos triangulares de poliuretano em células gigantes; a prótese à direita', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Celina Stayerman — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'tela',
      name: 'Tela cirúrgica de polipropileno',
      aka: ['Tela de hérnia', 'Marlex', 'Prolene mesh', 'Sling'],
      summary: 'Espaços redondos ou ovais, vazios e regulares, deixados pelos monofilamentos da tela, dispostos em fileiras, cercados por fibrose, histiócitos e células gigantes.',
      description:
        '## Morfologia\n- **Espaços vazios redondos ou ovais, regulares, em fileiras ou trama**, correspondentes aos **monofilamentos** dissolvidos ou arrancados no corte; os filamentos que ficam são incolores e refringentes.\n- **Fibrose densa** entre os fios, **células gigantes e histiócitos** forrando os espaços, inflamação crônica; abscesso ou fístula quando infectada.\n- Birrefringente quando o fio está presente.\n\n## Onde engana\n- Vasos ou glândulas: os espaços da tela são todos iguais e sem revestimento epitelial.\n- Silicone: vacúolos de tamanhos díspares.\n\n## Contexto\n- Hérnia inguinal e incisional, sling uretral, prolapso genital; ressecção por dor, infecção ou erosão.',
      traits: [],
      sites: ['partes-moles', 'pleura', 'genital', 'trato-urinario', 'intestino'],
      clinical: ['protese', 'cirurgia-previa', 'reacao-granulomatosa', 'birrefringente'],
      photos: [
        { src: img_tela_0, thumb: img_tela_0_thumb, caption: 'Saco de hérnia recidivada: fios da tela em fileiras com fibrose e reação gigantocelular', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer) — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'vidro',
      name: 'Vidro',
      aka: ['Fragmento de vidro', 'Corpo estranho de vidro'],
      summary: 'Fragmentos angulados, incolores, refringentes, com bordas cortantes, geralmente arrancados no corte e deixando espaços vazios geométricos, envoltos por cápsula fibrosa com aspecto sinovial.',
      description:
        '## Morfologia\n- **Fragmentos angulares, incolores, refringentes**, com **bordas retas e cortantes**; na maioria das vezes o vidro **cai no corte** e sobra um **espaço vazio geométrico**.\n- **Cápsula fibrosa** ao redor, com revestimento de histiócitos em paliçada (**metaplasia sinovial**), células gigantes escassas; inflamação crônica.\n- Birrefringência ausente ou fraca (vidro é amorfo), ao contrário do que se espera de um cristal.\n\n## Onde engana\n- Cisto sinovial ou bursa: a cápsula do vidro imita sinóvia — procure o fragmento na macroscopia.\n- Talco e sílica: birrefringentes.\n\n## Contexto\n- Acidente com vidro na mão e no pé anos antes; nódulo doloroso; radiografia mostra o fragmento.',
      traits: [],
      sites: ['pele', 'partes-moles'],
      clinical: ['trauma', 'nao-birrefringente', 'reacao-granulomatosa'],
      photos: [
        { src: img_vidro_0, thumb: img_vidro_0_thumb, caption: 'Vidro com cápsula fibrosa de aspecto sinovial: macroscopia e histologia', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Olaleke Folaranmi — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'madeira-espinho',
      name: 'Lasca de madeira e espinho vegetal',
      aka: ['Farpa', 'Lasca', 'Espinho', 'Splinter', 'Granuloma por espinho'],
      summary: 'Material vegetal com células alongadas de parede celulósica, vasos e pigmento marrom, refringente e birrefringente, cercado por abscesso, tecido de granulação e granuloma de corpo estranho; às vezes Splendore-Hoeppli.',
      description:
        '## Morfologia\n- **Madeira**: células **alongadas, em fileiras**, com **parede celulósica espessa**, **vasos com espessamentos em anel ou espiral** e **pigmento marrom**; refringente e **birrefringente**.\n- **Espinho**: cutícula pigmentada, células paliçádicas e esclerênquima; a ponta cônica.\n- Reação: **abscesso** e tecido de granulação, **granuloma de corpo estranho**, fibrose; **Splendore-Hoeppli** (manto eosinofílico) é frequente na madeira; infecção associada (esporotricose, micetoma, micobactéria atípica).\n\n## Onde engana\n- Parasita ou fungo: o vegetal não tem núcleos, tem vasos e polariza.\n- Osso ou queratina: sem parede celular vegetal.\n\n## Contexto\n- Mãos e pés de jardineiros, carpinteiros, crianças; nódulo que não cicatriza; radiografia não mostra madeira.',
      traits: [],
      sites: ['pele', 'partes-moles', 'olho'],
      clinical: ['trauma', 'ocupacional', 'reacao-granulomatosa', 'birrefringente'],
      photos: [
        { src: img_madeira_espinho_0, thumb: img_madeira_espinho_0_thumb, caption: 'Lasca de madeira na pele: células vegetais alongadas com pigmento, ao lado do tecido adiposo', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Ania Henning — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_madeira_espinho_1, caption: 'Fenômeno de Splendore-Hoeppli ao redor de lasca de madeira', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Jerad M Gardner — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_madeira_espinho_2, caption: 'Farpa na derme: parede celulósica e reação inflamatória, com detalhe', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Jeffrey Cloutier — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_madeira_espinho_3, caption: 'Polegar: lasca de madeira com vasos vegetais em espiral', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Steven Adams — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_madeira_espinho_4, caption: 'Espinho vegetal no dorso da mão, cercado por granuloma, em três aumentos', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer) — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'ourico-do-mar',
      name: 'Espinho de ouriço-do-mar',
      aka: ['Ouriço', 'Granuloma por espinho de ouriço'],
      summary: 'Estrutura calcária com padrão radiado e poroso em corte, envolta por granuloma sarcoide ou de corpo estranho; frequente no pé de quem pisou no ouriço.',
      description:
        '## Morfologia\n- Espinho de **carbonato de cálcio** em corte: **estrutura radiada, porosa, em roda ou favo**, basofílica ou descalcificada (fantasma), com pigmento.\n- Reação **granulomatosa sarcoide ou de corpo estranho**, fibrose, às vezes abscesso; nódulo persistente meses depois.\n\n## Onde engana\n- Sarcoidose ou granuloma anular: procure o espinho na macroscopia e corte níveis.\n- Calcificação distrófica: sem arquitetura radiada.\n\n## Contexto\n- Pisada no ouriço em praia de pedras; pé e mão; nódulos múltiplos.',
      traits: [],
      sites: ['pele', 'partes-moles'],
      clinical: ['trauma', 'reacao-granulomatosa', 'nao-birrefringente'],
      photos: [
        { src: img_ourico_do_mar_0, thumb: img_ourico_do_mar_0_thumb, caption: 'Pé: espinho de ouriço-do-mar em corte, com padrão radiado, dentro de granuloma', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer) — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'polen',
      name: 'Pólen',
      aka: ['Grão de pólen', 'Contaminante de lâmina', 'Pólen de pinheiro'],
      summary: 'Grãos redondos ou ovais de 20–100 µm com parede espessa e esculpida (espinhos, poros, sacos aéreos), amarelados ou azul-esverdeados no Papanicolaou; contaminante do ar ou aspirado.',
      description:
        '## Morfologia\n- Grãos **redondos, ovais ou triangulares**, de **20 a 100 µm**, com **parede espessa (exina) esculpida** — espinhos, poros, sulcos; o pólen de pinheiro tem **dois sacos aéreos** laterais.\n- Cor amarelada, marrom ou azul-esverdeada no Papanicolaou; refringentes, parcialmente birrefringentes.\n- Soltos, sem reação: **contaminante** de lâminas, lavados e PAAF. No tecido pulmonar (raro): dentro de célula gigante.\n\n## Onde engana\n- Ovos de parasitas (Ascaris, Toxocara): o pólen tem exina esculpida e não tem embrião.\n- Esférulas de Coccidioides ou Rhinosporidium: sem endósporos.\n- Células neoplásicas em PAAF de tireoide: o grão é acelular.\n\n## Contexto\n- Primavera, laboratório com janela aberta, lâminas secando ao ar.',
      traits: [],
      sites: ['colo-uterino', 'pulmao', 'tireoide'],
      clinical: ['contaminante', 'citologia', 'aspiracao', 'nao-birrefringente'],
      photos: [
        { src: img_polen_0, thumb: img_polen_0_thumb, caption: 'Grão de pólen espinhoso em esfregaço de Papanicolaou', stain: 'Papanicolaou', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Israh — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_polen_1, caption: 'Pólen em lavado broncoalveolar, com e sem polarização', stain: 'Papanicolaou', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Vincent Cockenpot — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_polen_2, caption: 'Grão de pólen como contaminante em corte de pulmão', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer) — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_polen_3, caption: 'PAAF de tireoide: pólen de pinheiro com os dois sacos aéreos', stain: 'Papanicolaou', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Yosep Chong — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'tricoma',
      name: 'Tricoma (pelo vegetal)',
      aka: ['Pelo de planta', 'Tricoma estrelado', 'Contaminante vegetal'],
      summary: 'Pelos de planta em estrela ou em espinho, com parede celulósica espessa e refringente, sem núcleo; contaminantes de lâmina ou corpo estranho na pele após contato com plantas.',
      description:
        '## Morfologia\n- Estruturas **estreladas, ramificadas ou em agulha**, de 50 a 500 µm, com **parede celulósica espessa, refringente**, lúmen central estreito, **sem núcleo**; base bulbosa quando inteiras.\n- Na pele: cravados na epiderme e derme superficial com inflamação e granuloma (dermatite por tricomas).\n- Soltos no esfregaço: contaminante (plantas no laboratório, papel).\n\n## Onde engana\n- Hifas ou fungos ramificados: o tricoma é acelular, com parede uniforme e sem septos.\n- Fibras de algodão: torcidas em fita, não ramificadas.\n\n## Contexto\n- Jardinagem, contato com plantas cobertas de pelos (Tillandsia, malvas), cactos; contaminação de lâmina.',
      traits: [],
      sites: ['pele', 'colo-uterino'],
      clinical: ['contaminante', 'trauma', 'citologia', 'birrefringente'],
      photos: [
        { src: img_tricoma_0, thumb: img_tricoma_0_thumb, caption: 'Tricoma estrelado cravado na epiderme e a planta de origem', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Diego Morales — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_tricoma_1, caption: 'Tricoma como contaminante de lâmina, e a planta com os pelos', stain: 'Papanicolaou', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Emilian Olteanu — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'oleo-mineral',
      name: 'Óleo mineral (pneumonia lipoídica exógena)',
      aka: ['Pneumonia lipoídica', 'Óleo mineral', 'Vaselina líquida', 'Aspiração de óleo'],
      summary: 'Vacúolos lipídicos grandes e vazios, de tamanhos variados, nos alvéolos e no interstício, dentro de macrófagos espumosos e células gigantes, com fibrose; o óleo mineral não cora e não é digerido.',
      description:
        '## Morfologia\n- **Vacúolos vazios, redondos, grandes e de tamanhos variados**, nos alvéolos e no interstício, dentro de **macrófagos espumosos** e **células gigantes**, com septos espessados por fibrose e inflamação crônica.\n- O **óleo mineral** (não digerível) forma vacúolos grandes; a **pneumonia lipoídica endógena** (obstrução) tem macrófagos espumosos finamente vacuolados sem células gigantes.\n- Sudan/oil red O em congelação cora o lipídio; no parafinado só fica o vazio.\n- Macroscopia: consolidação amarelada, gordurosa.\n\n## Onde engana\n- Adenocarcinoma mucinoso ou lipoma na imagem; histologicamente, tumor de células claras — os vacúolos são extracelulares e em células gigantes.\n- Silicone embolizado: também vacúolos, mas dentro de vasos e com histórico de injeção.\n\n## Contexto\n- Laxantes com óleo mineral, gotas nasais oleosas, aspiração em idosos e acamados, "bomba de óleo" em performers.',
      traits: [],
      sites: ['pulmao'],
      clinical: ['aspiracao', 'medicacao', 'reacao-granulomatosa', 'nao-birrefringente', 'mimico-tumor'],
      photos: [
        { src: img_oleo_mineral_0, thumb: img_oleo_mineral_0_thumb, caption: 'Pneumonia lipoídica: vacúolos vazios nos alvéolos com macrófagos espumosos', stain: 'HE', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_oleo_mineral_1, caption: 'Vacúolos lipídicos de tamanhos variados com fibrose e células gigantes', stain: 'HE', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_oleo_mineral_2, caption: 'Macroscopia: consolidação amarelada, gordurosa, por aspiração de óleo', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'lipiodol',
      name: 'Lipiodol (contraste oleoso)',
      aka: ['Lipiodol', 'Óleo iodado', 'Linfangiografia', 'Quimioembolização'],
      summary: 'Vacúolos lipídicos redondos, vazios, de tamanhos variados, nos seios de linfonodos ou dentro de vasos hepáticos, com histiócitos espumosos e células gigantes.',
      description:
        '## Morfologia\n- **Vacúolos redondos, vazios**, de 10 a 200 µm, nos **seios linfáticos** (linfangiografia) ou na luz de **ramos arteriais hepáticos e sinusoides** (quimioembolização), com **histiócitos espumosos, células gigantes** e fibrose.\n- Não cora no parafinado (é óleo); Sudan em congelação.\n- Radiopaco: fica anos no linfonodo.\n\n## Onde engana\n- Metástase de carcinoma em linfonodo (na imagem e na macroscopia).\n- Silicone: vacúolos idênticos — a história (linfangiografia, quimioembolização) resolve.\n\n## Contexto\n- Linfangiografia antiga, quimioembolização de hepatocarcinoma, embolização de varizes gástricas e de fístulas linfáticas.',
      traits: [],
      sites: ['linfonodo', 'figado', 'vaso'],
      clinical: ['embolizacao', 'nao-birrefringente', 'reacao-granulomatosa', 'mimico-tumor'],
      photos: [
        { src: img_lipiodol_0, thumb: img_lipiodol_0_thumb, caption: 'Linfonodo inguinal após linfangiografia: vacúolos de Lipiodol nos seios', stain: 'HE', credit: 'Yale Rosen, MD — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'monsel',
      name: 'Solução de Monsel (subsulfato férrico)',
      aka: ['Monsel', 'Subsulfato férrico', 'Artefato de Monsel', 'Hemostático do colo'],
      summary: 'Material amorfo marrom-escuro a negro, em grumos, incrustado na superfície da úlcera ou da biópsia do colo, com necrose de coagulação e histiócitos carregados de ferro, azul no azul da Prússia.',
      description:
        '## Morfologia\n- Depósitos **amorfos, marrom-escuros a negros, em grumos e placas**, na **superfície** do estroma exposto e nas paredes de vasos, com **necrose de coagulação** superficial e infiltrado de neutrófilos nos primeiros dias.\n- Depois: **histiócitos carregados de pigmento ferro-marrom** em granulomas de corpo estranho, fibrose — **azul da Prússia positivo**.\n- Some em semanas a meses.\n\n## Onde engana\n- Hemossiderina de hemorragia prévia: fina e intracelular, sem o material incrustado.\n- Necrose tumoral ou artefato de cautério: o pigmento e o ferro identificam o Monsel.\n- Pigmento de tatuagem em biópsia de pele: azul da Prússia negativo.\n\n## Contexto\n- Hemostasia após biópsia de colo ou de pele (raspagem) dias a semanas antes da nova biópsia ou da conização.',
      traits: [],
      sites: ['colo-uterino', 'pele', 'genital'],
      clinical: ['endoscopia', 'cirurgia-previa', 'pigmentado', 'reacao-granulomatosa'],
      photos: [
        { src: img_monsel_0, thumb: img_monsel_0_thumb, caption: 'Colo uterino: depósitos de Monsel na superfície, positivos no azul da Prússia', stain: 'HE e azul da Prússia', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr Monika Vyas — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'orise-gel',
      name: 'Gel de elevação submucosa (ORISE)',
      aka: ['ORISE Gel', 'Agente de elevação', 'Injeção submucosa', 'Amiloide falso'],
      summary: 'Material amorfo, eosinofílico pálido e homogêneo, em lagos e nódulos na submucosa do cólon após ressecção endoscópica, com reação gigantocelular tardia; imita amiloide.',
      description:
        '## Morfologia\n- **Lagos e nódulos de material amorfo, eosinofílico pálido, homogêneo**, na **submucosa** (e na muscular), sem estrutura, às vezes com fendas.\n- Semanas depois: **histiócitos e células gigantes** na periferia, fibrose; o material pode ficar por meses e formar massa.\n- **Vermelho Congo negativo** (ou fraco sem birrefringência verde), PAS variável.\n\n## Onde engana\n- **Amiloide**: o grande mímico — vermelho Congo com polarização resolve.\n- Mucina extravasada, necrose, pseudoxantoma, tumor de células granulares: a história de mucosectomia recente e a topografia submucosa.\n\n## Contexto\n- Ressecção endoscópica de lesão serrilhada ou adenoma do cólon com injeção submucosa de ORISE; biópsia da cicatriz ou colectomia depois.',
      traits: [],
      sites: ['intestino', 'estomago', 'esofago'],
      clinical: ['endoscopia', 'reacao-granulomatosa', 'nao-birrefringente', 'mimico-tumor'],
      photos: [
        { src: img_orise_gel_0, thumb: img_orise_gel_0_thumb, caption: 'Cólon: reação de corpo estranho ao ORISE Gel na submucosa', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Rhonda Yantiss — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_orise_gel_1, caption: 'ORISE Gel: lagos de material amorfo eosinofílico na submucosa', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Elizabeth Montgomery — Wikimedia Commons, CC BY-SA 2.0' },
        { src: img_orise_gel_2, caption: 'Lesão serrilhada séssil com o gel de elevação logo abaixo da mucosa', stain: 'HE', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Roger M — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
    {
      id: 'oxalato',
      name: 'Cristais de oxalato de cálcio',
      aka: ['Oxalose', 'Oxalato', 'Cristais em leque', 'Hiperoxalúria'],
      summary: 'Cristais incolores a amarelados, em leque, roseta ou placa, fortemente birrefringentes em cores vivas, em rim, tireoide, mama, pele e vasos; von Kossa negativo ou fraco.',
      description:
        '## Morfologia\n- Cristais **incolores a amarelo-pálidos**, **em leque, roseta, placa ou agulha**, que sobrevivem ao formol e brilham **fortemente à luz polarizada** em cores.\n- Sem reação (tireoide, mama) ou com **células gigantes e granulomas** (pele, osso, vasos na oxalose).\n- **Tireoide** normal tem oxalato nos folículos; **mama**: calcificações que a mamografia vê e o HE não (só na polarização); **rim**: túbulos com cristais na intoxicação por etilenoglicol e na hiperoxalúria.\n- Oxalose sistêmica: depósitos vasculares na pele com livedo e gangrena.\n\n## Onde engana\n- Calcificação por fosfato: amorfa, basofílica, von Kossa forte, não polariza.\n- Talco e outros cristais exógenos: o oxalato é endógeno — contexto renal ou o achado incidental.\n- Aspergillus niger produz oxalato nos seios e no pulmão.\n\n## Contexto\n- Insuficiência renal, hiperoxalúria primária, etilenoglicol, excesso de vitamina C, bypass intestinal; achado incidental em tireoide e mama.',
      traits: [],
      sites: ['rim', 'pele', 'tireoide', 'mama', 'vaso', 'osso'],
      clinical: ['dialise', 'cristal', 'birrefringente', 'reacao-granulomatosa'],
      photos: [
        { src: img_oxalato_0, thumb: img_oxalato_0_thumb, caption: 'Oxalose cutânea: cristais de oxalato na derme e nos vasos, com polarização (notas do autor)', stain: 'HE, polarizado', credit: 'Atlas of Medical Foreign Bodies (Y. Rosen & M. Meseguer); foto: Dr. Silvija Gottesman — Wikimedia Commons, CC BY-SA 2.0' },
      ],
    },
  ],
}
