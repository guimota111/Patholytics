import { Activity } from 'lucide-react'
import type { MacroProtocol, MacroSystem } from '../types'

/* ==========================================================================
   gastro.ts — roteiros de macroscopia do trato gastrointestinal e anexos.

   Cada roteiro é uma sequência de passos como se usa na bancada: receber e
   orientar, medir, pintar, abrir e fixar, descrever, cortar e distribuir nos cassetes,
   e por fim o modelo de descrição e as armadilhas. Fontes: protocolos do
   CAP (cólon e reto 4.4, esôfago 4.2, estômago 4.3, apêndice 5.1), dataset
   G049 do RCPath (colorretal, 2023), AAPA Macroscopic Examination
   Guidelines (apêndice, 3ª ed.), Gross Pathology Manual da University of
   Chicago (2024–25) e Manual de Macroscopia SERPAT-HCRP/USP (2018), este
   último para a terminologia em português. Números entre parênteses são os
   das fontes; adapte ao serviço.
   ========================================================================== */

const biopsias: MacroProtocol = {
  id: 'biopsias-endoscopicas',
  name: 'Biópsias endoscópicas',
  summary: 'Esôfago, estômago, duodeno, cólon: contar, medir, um frasco por sítio, até três fragmentos por cassete.',
  steps: [
    {
      text: `## Recepção
- Confira **cada frasco** com a requisição: sítio, número de frascos, nome. Divergência de sítio é a causa mais comum de laudo errado em biópsia — resolva antes de abrir.
- Fragmentos vêm em formol. Se chegarem a fresco por engano, formol na hora.
- Leia a indicação endoscópica: pesquisa de H. pylori, Barrett, doença celíaca, colite, pólipo, mapeamento de displasia. Ela decide os níveis e as colorações que você já pede na macroscopia.`,
    },
    {
      text: `## Contagem e medidas
- Conte os fragmentos de cada frasco e dê a **faixa de tamanho** ("quatro fragmentos de 0,1 a 0,3 cm").
- Fragmentos minúsculos ou friáveis: envolva em **papel de filtro** ou coloque entre **esponjas** para não perder no processamento; marque com **eosina** os muito pequenos.
- Descreva o que fugir do comum: fragmento de mucosa com pólipo, tecido esbranquiçado e firme, muco espesso.`,
    },
    {
      text: `## Cassetes
- **No máximo três fragmentos por cassete**, entre esponjas; um frasco nunca se mistura com outro.
- Sequência do laudo segue a da endoscopia: esôfago → junção → cárdia → corpo → antro → duodeno; e íleo terminal → ceco → ascendente → transverso → descendente → sigmoide → reto.
- Fragmentos grandes (mucosectomia enviada como "biópsia", pólipo inteiro): tratam-se pelo roteiro de pólipo ou de mucosectomia.`,
    },
    {
      text: `## Orientação e níveis
- Biópsias de mucosa são pequenas demais para orientar na bancada; o histotécnico as embebe de canto e corta **níveis** (2 a 3 HE) para achar a superfície bem orientada.
- Peça de saída, quando a indicação justifica: **Giemsa ou IHQ** para H. pylori, **PAS/Alcian** em Barrett ou displasia, **CD3** em linfocitose intraepitelial, **CMV** em colite grave de imunossuprimido.
- Mapeamento de Barrett ou de colite (múltiplos frascos numerados): mantenha a numeração do endoscopista no laudo.`,
    },
    {
      text: `## Modelo de descrição
Frasco 1 (antro): três fragmentos irregulares de mucosa, pardo-claros, de 0,2 a 0,4 cm. Inclusão total, 1 cassete.

Frasco 2 (corpo): dois fragmentos de 0,2 e 0,3 cm. Inclusão total, 1 cassete.

## Armadilhas
- Frasco vazio: procure o fragmento na tampa e no formol antes de laudar "sem material".
- Dois sítios no mesmo cassete inviabilizam a sinóptica de mapeamento: nunca junte.`,
    },
  ],
}

const polipectomia: MacroProtocol = {
  id: 'polipectomia',
  name: 'Pólipos (polipectomia)',
  summary: 'Pediculado: pinte a base do pedículo e corte no eixo. Séssil ou grande: cortes seriados perpendiculares. Inclusão total sempre.',
  steps: [
    {
      text: `## Recepção
- Um pólipo por frasco, com o sítio. Se vierem vários no mesmo frasco, laude "pólipos do (sítio), em conjunto".
- Ressecção em **fragmentos (piecemeal)**: conte, meça em conjunto e inclua tudo, na ordem em que vieram; avise no laudo que a margem não é avaliável.
- Leia se o endoscopista suspeita de **invasão** (depressão, ulceração, pólipo grande, "não elevou" com injeção): isso muda a pressa e a orientação.`,
    },
    {
      text: `## Medidas e descrição
- **Três dimensões** da cabeça; **comprimento e diâmetro do pedículo**.
- Tipo: **pediculado, séssil, plano/deprimido**; superfície lisa, lobulada, vilosa, ulcerada; cor e consistência.
- Pólipos até 0,5 cm: inclusão total inteira, sem cortar; entre 0,5 e 1 cm: bissecção pelo eixo.`,
    },
    {
      text: `## Pediculado
- **Pinte a base do pedículo** (margem de ressecção) — é ela que define se um carcinoma invasivo está livre.
- Pedículo até 1 cm: **corte coronal pelo pedículo e pela cabeça**, no eixo maior, e inclua as duas metades (e as fatias laterais se sobrarem).
- Pedículo maior que 1 cm: retire primeiro um **corte transversal da base pintada** (cassete próprio), depois faça o corte coronal do restante.
- Não corte tangencialmente ao pedículo: o eixo mal orientado é a causa clássica de "invasão da submucosa" falsa (deslocamento epitelial) ou de margem não avaliável.`,
    },
    {
      text: `## Séssil e grande
- Pinte a base (superfície de ressecção, geralmente irregular ou cauterizada).
- **Cortes seriados perpendiculares** à mucosa, a cada 2 a 3 mm, em sequência; inclua tudo em cassetes numerados, avisando o histotécnico para embeber de canto.
- Lesão maior que 3 cm ou ressecção transanal de tumor viloso: fotografe, pinte, cortes paralelos numerados; margem lateral e profunda em relação a cada corte.`,
    },
    {
      text: `## Cassetes e modelo de descrição
- A: base do pedículo pintada (se pedículo > 1 cm). B: corte coronal com cabeça e pedículo. C em diante: demais fatias.
- Modelo: "Formação polipoide **pediculada**, de superfície lobulada, pardo-avermelhada, medindo 1,8 × 1,4 × 1,2 cm, com pedículo de 0,8 × 0,5 cm. Base pintada. Corte coronal pelo eixo e inclusão total em 2 cassetes."

## Armadilhas
- Pólipo sem pedículo identificável: diga "base não identificada" em vez de inventar margem.
- Fragmento de mucosa normal solto no frasco: inclua junto, é a "margem" que o endoscopista mandou.`,
    },
  ],
}

const mucosectomia: MacroProtocol = {
  id: 'mucosectomia',
  name: 'Mucosectomia e dissecção submucosa (EMR/ESD)',
  summary: 'Peça estendida e fixada com alfinetes; margem lateral e profunda com tintas diferentes; cortes seriados de 2 mm e inclusão total mapeada.',
  steps: [
    {
      text: `## Recepção
- O ideal é a peça chegar **estendida e alfinetada** pelo endoscopista, mucosa para cima, em placa de cortiça/isopor, já em formol. Se vier solta, estenda com cuidado e alfinete pelas bordas antes de fixar (24 a 48 h), sem esticar demais.
- Peça a **foto endoscópica** e a orientação (proximal, anal, lado): sem elas a margem lateral positiva não tem endereço.
- Fotografe a peça estendida com régua antes de pintar.`,
    },
    {
      text: `## Descrição
- Três dimensões da peça e da lesão; aspecto (elevada, plana, deprimida, ulcerada, Paris/Kudo se informado).
- **Distância da lesão à margem lateral mais próxima** e a impressão da margem profunda (fibras da submucosa, cautério).
- Tipo: mucosectomia (mucosa e parte da submucosa), dissecção submucosa (submucosa inteira, fibras da muscular própria às vezes na face profunda), ressecção transanal (parede completa).`,
    },
    {
      text: `## Tintas
- **Margem profunda em preto**; **margem lateral** com uma segunda cor — ou duas cores para marcar a orientação (por exemplo, proximal azul, distal verde).
- Tinta seca antes de cortar, para não migrar para a mucosa.
- Ponta (tip) muito fina de uma margem lateral pode ser cortada separadamente e incluída como fragmento próprio, se o patologista preferir.`,
    },
    {
      text: `## Cortes
- **Cortes seriados paralelos a cada 2 mm**, perpendiculares à mucosa, de preferência perpendiculares à margem lateral mais próxima da lesão.
- Numere as fatias na ordem, com um esquema (foto ou desenho) mostrando onde cada cassete veio — **inclusão total, mapeada**.
- As fatias das extremidades podem ser embebidas viradas 180° em lâmina adicional para avaliar a margem lateral de frente.`,
    },
    {
      text: `## Cassetes e modelo de descrição
- A1 a An: fatias sequenciais; anote no laudo o lado de embebimento.
- Modelo: "Mucosectomia endoscópica de reto, recebida estendida em placa e fixada, de 3,2 × 2,5 × 0,4 cm. Na mucosa, lesão plana levemente elevada, granular, de 1,6 × 1,2 cm, que dista 0,4 cm da margem lateral mais próxima. Margem profunda pintada de preto e lateral de azul. Cortes seriados de 2 mm, inclusão total em 12 cassetes (A1–A12), fatia A1 e A12 embebidas com a margem para o corte."

## Armadilhas
- Não separe a "lesão" das bordas: a margem lateral é avaliada em continuidade com o tumor.
- Enrolamento da peça na fixação torna as margens inavaliáveis: alfinete antes.`,
    },
  ],
}

const esofagectomia: MacroProtocol = {
  id: 'esofagectomia',
  name: 'Esofagectomia',
  summary: 'Pinte a adventícia sobre o tumor, abra pela face oposta, alfinete e fixe; meça o tumor em relação à junção (regra dos 2 cm); linfonodos por estação (meta 15).',
  steps: [
    {
      text: `## Recepção e orientação
- Peça a fresco de preferência: fotografe, oriente (o estômago anexo indica o distal; a face anterior é a que o cirurgião marca), e **palpe o tumor** com o esôfago fechado.
- **Pinte a adventícia** sobre o tumor (margem radial) antes de abrir; a margem radial é o tecido mole adventicial mais próximo da invasão mais profunda.
- Anote se veio linfadenectomia à parte (frascos por estação: paraesofágicos, junção, gástricos, celíacos).`,
    },
    {
      text: `## Abertura e fixação
- Abra longitudinalmente **pela face oposta ao tumor**, com o dedo guiando a tesoura para não cortar a lesão.
- **Alfinete estendida** em isopor/cortiça, mucosa para cima, e fixe de um dia para o outro (mínimo 12 h).
- Se o tumor está na junção, não corte a junção antes de fixar: ela precisa estar reconhecível para a regra dos 2 cm.`,
    },
    {
      text: `## Medidas
- Comprimento e perímetro do esôfago; grande e pequena curvatura do segmento gástrico.
- Perímetro nas margens, no tumor e na junção; espessura da parede.
- **Junção esofagogástrica macroscópica** = onde o tubo esofágico encontra o estômago, no topo das pregas gástricas (não é a linha Z, que pode estar deslocada por Barrett).
- Tumor: três medidas, aspecto (vegetante, ulcerado, úlcero-infiltrativo, plano), **distância do centro do tumor à junção** e distâncias às margens proximal, distal e radial.
- **Barrett**: mucosa salmão, granular, acima da junção; meça a extensão a partir da junção.`,
    },
    {
      text: `## Regra dos 2 cm (CAP/AJCC 8)
- Tumor que envolve a junção com **centro até 2 cm dentro do estômago** → estadia como **esôfago**.
- Centro **além de 2 cm** no estômago, ou tumor de cárdia sem envolver a junção → estadia como **estômago**.
- Registre no laudo a proporção do tumor no esôfago e no estômago e a distância do ponto médio à junção; a classificação de Siewert (I distal, II junção, III subcárdia) usa o mesmo ponto médio.`,
    },
    {
      text: `## Cortes do tumor e das margens
- Fatias transversais do tumor após fixação; fotografe o corte mais profundo.
- Tumor: **pelo menos 3 cassetes** (centro, periferia com mucosa adjacente, **maior profundidade em relação à margem radial pintada**). Adenocarcinoma em Barrett: **todo o segmento de Barrett** com o tumor, em blocos sequenciais.
- Pós-neoadjuvância sem tumor evidente: incluir **toda a área de mucosa alterada** (cicatriz, úlcera, retração), em cassetes mapeados.
- Margens proximal e distal: **até 2 cm do tumor → perpendiculares**, incluindo toda a distância entre o tumor e a margem; **mais de 2 cm → en face** (anel completo se o calibre for pequeno).
- Junção gastroesofágica e mucosa distante do tumor: um cassete cada.`,
    },
    {
      text: `## Linfonodos
- Disseque toda a gordura periesofágica e da junção e as estações que vieram identificadas, cada uma em cassete próprio.
- O CAP não fixa um mínimo para o esôfago; a meta prática é **15 linfonodos** (NCCN). Se ficar longe disso, inclua toda a gordura periesofágica e da junção.
- Nódulos com menos de 4 mm inteiros; maiores, um corte pelo maior eixo.`,
    },
    {
      text: `## Modelo de descrição
"Produto de esofagectomia distal com segmento gástrico, recebido a fresco, fechado, orientado. Esôfago de 9 cm × 3,5 cm de perímetro; segmento gástrico de 5 cm (grande curvatura) × 4 cm (pequena curvatura). Adventícia sobre o tumor pintada de preto. Na abertura pela face oposta ao tumor, lesão úlcero-infiltrativa de 4,0 × 3,2 cm, centrada 1,0 cm acima da junção esofagogástrica e estendendo-se 0,8 cm para o estômago (centro a 1,0 cm proximal à junção → estadiamento esofágico). Dista 3,5 cm da margem proximal, 3,8 cm da distal e 0,3 cm da radial. Aos cortes, infiltra toda a parede até a adventícia. Mucosa salmão acima da junção em 3 cm (Barrett). Dissecados 14 linfonodos periesofágicos e da junção (0,3 a 1,5 cm) e 6 da pequena curvatura."

## Armadilhas
- Não confunda linha Z deslocada com junção: use as pregas gástricas.
- Tumor de junção: fotografe antes de abrir e não corte a junção no eixo errado.`,
    },
  ],
}

const gastrectomia: MacroProtocol = {
  id: 'gastrectomia',
  name: 'Gastrectomia por câncer',
  summary: 'Abrir pela grande curvatura (sem cortar o tumor), alfinetar e fixar; margens radiais são os omentos; linfonodos da grande e da pequena curvatura, meta 16.',
  steps: [
    {
      text: `## Recepção e orientação
- Oriente pela **grande curvatura e pelo piloro**; identifique cárdia, fundo, corpo, antro e canal pilórico, e os segmentos de esôfago e duodeno.
- Tipo: gastrectomia total, subtotal distal, proximal, em cunha; com esplenectomia ou omentectomia?
- **Palpe o tumor com o estômago fechado** e pinte a serosa sobre ele; se o tumor está na pequena curvatura, pinte também o **tecido do pequeno omento** (margem radial).
- **Margens radiais do estômago** (CAP): as margens de ressecção do **pequeno omento** (ligamentos hepatogástrico e hepatoduodenal) e do **grande omento** — o restante é serosa peritonealizada, que se descreve, mas não é margem.`,
    },
    {
      text: `## Abertura e fixação
- Abra **pela grande curvatura**, do duodeno ao esôfago, desviando do tumor. Tumor na grande curvatura: abra pela pequena.
- Lave delicadamente o conteúdo, fotografe, **alfinete estendida** (mucosa para cima) e fixe de um dia para o outro.
- Antes de fixar, colha os linfonodos que se destacam da gordura se houver protocolo de pesquisa; senão, disseque depois de fixado (mais fácil).`,
    },
    {
      text: `## Medidas
- Grande curvatura, pequena curvatura, diâmetro médio; comprimento e diâmetro do esôfago e do duodeno anexos.
- Tumor: **três dimensões, incluindo a espessura de invasão**; localização (região, curvatura, parede anterior/posterior, circunferencial); aspecto (**Borrmann** I vegetante, II ulcerado de bordas elevadas, III úlcero-infiltrativo, IV infiltrativo difuso/linite; câncer precoce tipo 0).
- **Distâncias** às margens proximal, distal e radial (pequeno omento); distância à serosa no ponto mais profundo.
- Tumor na cárdia envolvendo a junção: aplique a **regra dos 2 cm** (centro até 2 cm no estômago → protocolo de esôfago).`,
    },
    {
      text: `## Cortes do tumor
- Fatias transversais do tumor após fixação; fotografe a maior profundidade.
- Cassetes: **centro do tumor**, **periferia com mucosa adjacente** (transição), **maior profundidade com a serosa pintada** e, se aplicável, com a **margem radial do omento**. Mínimo 3, de preferência 1 por centímetro de tumor.
- **Linite plástica** ou tumor difuso sem lesão nítida: cortes em toda a extensão da parede espessada, mapeados; a espessura da parede é o dado.
- Pós-neoadjuvância: todo o leito tumoral se não houver tumor evidente.
- **Úlcera péptica** enviada como "câncer?": inclusão total da úlcera.`,
    },
    {
      text: `## Margens, mucosa e linfonodos
- Margens proximal e distal: perpendiculares se a menos de 2 cm; en face (anel) se longe.
- Um cassete de mucosa de cada região (fundo/corpo, antro) e da junção e do duodeno anexos — gastrite, metaplasia e H. pylori entram no laudo.
- **Linfonodos**: disseque separadamente **grande curvatura** e **pequena curvatura** (e as estações enviadas à parte pelo cirurgião: 1–7 perigástricas, 8–12 celíacas/hepáticas/esplênicas). Meta **16 linfonodos** (CAP/AJCC 8; 30 é o desejável); todo linfonodo achado vai para o cassete.
- Baço anexo: descreva hilo e cápsula; um cassete de polpa e os linfonodos do hilo.`,
    },
    {
      text: `## Modelo de descrição
"Produto de gastrectomia subtotal distal com omentectomia, recebido a fresco, fechado. Grande curvatura de 18 cm, pequena curvatura de 10 cm, duodeno de 2 cm. Serosa lisa, com retração sobre o antro (pintada de preto); pequeno omento pintado de azul. Aberto pela grande curvatura, apresenta na parede posterior do antro tumor úlcero-infiltrativo (Borrmann III) de 5,0 × 4,0 × 1,5 cm, que dista 6,0 cm da margem proximal, 2,5 cm da distal (duodenal) e 1,0 cm da margem do pequeno omento. Aos cortes, infiltra toda a parede e atinge a serosa. Mucosa restante com pregas preservadas. Grande curvatura: 11 linfonodos (0,2–1,2 cm); pequena curvatura: 9 linfonodos (0,3–2,0 cm, um deles firme e branco)."

## Armadilhas
- Margem duodenal curta e tumor antral: sempre perpendicular.
- Serosa retraída sobre o tumor não é margem: descreva como envolvimento serosal (pT4a) e pinte para achar no corte.`,
    },
  ],
}

const gastrectomiaVertical: MacroProtocol = {
  id: 'gastrectomia-vertical',
  name: 'Gastrectomia vertical (sleeve) e peças gástricas benignas',
  summary: 'Abrir junto à linha de grampos, procurar lesão, dois a três cortes representativos com H. pylori em mente; qualquer lesão muda para o roteiro de câncer.',
  steps: [
    {
      text: `## Recepção
- Peça bariátrica: segmento tubular de grande curvatura com **linha de grampos** ao longo de toda a extensão; retire da bolsa laparoscópica e meça em três dimensões, incluindo o comprimento da linha de grampos.
- Confira a endoscopia pré-operatória (H. pylori, gastrite, pólipos) — a maioria dos achados relevantes no sleeve é gastrite por H. pylori, gastrite atrófica/autoimune e pólipos de glândulas fúndicas; tumores são raros, mas ocorrem (GIST, neuroendócrino).`,
    },
    {
      text: `## Abertura e inspeção
- Abra **ao lado da linha de grampos**, ao longo de toda a peça, sem cortar sobre os grampos; lave e inspecione toda a mucosa com boa luz.
- Descreva pregas, cor, erosões, pólipos, nódulos submucosos (palpe toda a parede), espessamento.
- Fixe estendida por algumas horas ou de um dia para o outro se for cortar depois.`,
    },
    {
      text: `## Cortes
- Sem lesão: **um a três cassetes** de parede completa (mucosa a serosa) de regiões diferentes (fundo/corpo proximal, corpo, antro se houver) — o suficiente para gastrite, metaplasia e H. pylori.
- Com lesão: fotografe, meça, distância à linha de grampos, e siga o **roteiro de gastrectomia por câncer** (tintas, cortes do tumor, margens).
- Gastrectomia por úlcera/perfuração: inclusão total da úlcera com a borda e a serosa; um cassete de mucosa distante.

## Modelo de descrição
"Produto de gastrectomia vertical, recebido a fresco, de 22 × 6 × 3 cm, com linha de grampos íntegra de 20 cm. Mucosa com pregas preservadas, sem lesões. Três cassetes representativos (fundo, corpo, antro)."`,
    },
  ],
}

const enterectomia: MacroProtocol = {
  id: 'enterectomia',
  name: 'Intestino delgado: enterectomia',
  summary: 'Abrir pela borda antimesentérica, pintar a margem mesentérica; para tumor: 3 cortes com a profundidade e todos os linfonodos; para Crohn: transições e a cada 10 cm.',
  steps: [
    {
      text: `## Recepção e orientação
- Segmento de jejuno/íleo, ileocecectomia, hemicolectomia direita com íleo: identifique as partes e a **margem mesentérica** (superfície de secção do meso, rugosa ou cauterizada) e a serosa lisa.
- Palpe o segmento fechado: tumor, estenose, espessamento, fístula.
- **Pinte a margem mesentérica** (margem radial) e a serosa sobre qualquer retração.`,
    },
    {
      text: `## Abertura, medidas e fixação
- Abra **pela borda antimesentérica**, desviando de tumor ou perfuração.
- Comprimento, perímetro/diâmetro nas margens e no ponto mais estreito; espessura da parede; comprimento do meso.
- Conteúdo luminal; serosa (fibrina, aderências, **gordura envolvente — fat wrapping**, perfuração, implantes).
- Alfinete e fixe de um dia para o outro; segmentos longos e sem lesão podem ser cortados no mesmo dia após lavagem.`,
    },
    {
      text: `## Tumor (adenocarcinoma, neuroendócrino, GIST, linfoma)
- Três dimensões; tipo (vegetante, ulcerado, anular, submucoso); distâncias às margens proximal, distal e mesentérica; profundidade e distância à serosa pintada.
- Cassetes: **mínimo 3 do tumor** (maior profundidade, relação com serosa/margem mesentérica, transição com mucosa); **margens** perpendiculares se a menos de 2 cm, en face se longe; **margem mesentérica** en face no ponto mais próximo.
- **Neuroendócrino de íleo é multifocal**: palpe e corte todo o segmento em fatias de 5 mm, inclua cada nódulo; a desmoplasia mesentérica com retração é achado típico — inclua.
- GIST: tumor submucoso/muscular; anote se há ruptura da cápsula (muda o risco); 1 cassete por cm até 10, contagem de mitoses depende de amostra boa.
- **Todos os linfonodos** do meso (meta 12 em hemicolectomia direita).`,
    },
    {
      text: `## Doença de Crohn e outras não tumorais
- Descreva cada segmento: extensão do acometimento, **lesões salteadas**, úlceras lineares/serpiginosas, **pedra de calçamento**, fissuras, **fístulas** (sondar), estenoses (perímetro e comprimento), espessamento, gordura envolvente, aderências, anastomose prévia.
- Cassetes: **margens proximal e distal longitudinais** (o cirurgião quer saber se estão livres de doença ativa), lesões representativas, fístulas e estenoses, **transições normal–doente**, e cortes sequenciais **a cada 10 cm** em peças longas; apêndice se houver (ponta bissecada, meio, base); um cassete com vários linfonodos (dissecção completa só se houver displasia ou tumor).
- Isquemia: transição viável–necrótico, vasos do meso (trombo, vasculite), margens; perfuração.
- Divertículos de delgado, Meckel: divertículo inteiro com a base; procure mucosa gástrica ectópica (úlcera no colo do divertículo).`,
    },
    {
      text: `## Modelo de descrição
"Produto de enterectomia segmentar (íleo), recebido a fresco, de 25 cm de comprimento e 3,0 cm de diâmetro, com meso de até 6 cm. Serosa lisa, exceto por área de retração de 2 cm sobre lesão (pintada). Margem mesentérica pintada de azul. Aberto pela borda antimesentérica, apresenta a 8 cm da margem proximal lesão anular ulcerada de 3,5 × 3,0 cm, que estenosa a luz (perímetro 2,5 cm) e dista 14 cm da margem distal e 1,2 cm da margem mesentérica. Aos cortes, infiltra a parede até a subserosa. Meso com 9 linfonodos de 0,2 a 0,9 cm."

## Armadilhas
- Tumor neuroendócrino "único" quase nunca é único: corte o segmento todo.
- Margem de Crohn: longitudinal, não en face — o que interessa é ver mucosa e parede ao longo da margem.`,
    },
  ],
}

const apendicectomia: MacroProtocol = {
  id: 'apendicectomia',
  name: 'Apendicectomia',
  summary: 'Margem proximal en face pintada, ponta bissecada, cortes transversais de 3 mm; apêndice normal ou com muco: inclusão total.',
  steps: [
    {
      text: `## Recepção e descrição externa
- Meça **comprimento e diâmetro** (faixa); mesoapêndice (comprimento × largura); linha de grampos ou fio na base.
- Serosa: congesta, fosca, com fibrina ou pus, perfurada (meça e localize a perfuração e diga se é na ponta, no corpo ou na base). **Muco na superfície** ou mesoapêndice gelatinoso é sinal de alarme para neoplasia mucinosa.
- Retire os grampos da base rente e **pinte a margem proximal**; pinte também o mesoapêndice se houver lesão (é a margem radial).`,
    },
    {
      text: `## Cortes
- **Margem proximal en face** (corte transversal da base pintada) — primeiro cassete; perpendicular só se houver lesão a menos de 1 cm.
- **Ponta: bissecada longitudinalmente** nos 1,5 a 2 cm distais (é onde a apendicite e as neoplasias neuroendócrinas mais aparecem).
- Restante: **cortes transversais a cada 3 mm**; descreva espessura da parede, luz (diâmetro, fecalito, pus, muco, obliteração fibrosa), divertículos, nódulos.
- Fixação prévia facilita; apêndice pequeno e friável, corte após algumas horas de formol.`,
    },
    {
      text: `## Quantos cassetes
- Apendicite típica: **1 a 2 cassetes** (margem en face + cortes transversais + ponta bissecada). Acima de 50 anos, garanta a ponta e a base bem representadas (neoplasias incidentais).
- Apêndice **macroscopicamente normal** enviado por "apendicite" e apêndice incidental: **inclusão total** — a apendicite inicial e a neoplasia neuroendócrina são achados de lâmina.
- **Suspeita de neoplasia mucinosa** (dilatação, muco, parede fina ou calcificada): não corte a fresco; fixe inteiro de um dia para o outro, pinte a serosa e o mesoapêndice, depois **inclusão total sequencial da ponta para a base**, margem proximal en face à parte; todo muco extra-apendicular vai para cassete com a serosa correspondente.
- Massa ou espessamento: três dimensões, localização (terço/metade proximal ou distal, **envolve a base?**), profundidade, distância à margem proximal e à mesentérica; inclusão total do tumor; todos os linfonodos do mesoapêndice.`,
    },
    {
      text: `## Modelo de descrição
Apendicite: "Apêndice cecal de 7,0 cm de comprimento e 0,8 a 1,2 cm de diâmetro, com mesoapêndice de 4 × 1 cm. Serosa congesta, com exsudato fibrinopurulento na ponta; sem perfuração. Aos cortes, parede espessada (0,4 cm), luz com pus e fecalito de 0,6 cm. Margem proximal pintada, en face; ponta bissecada; cortes transversais do restante. 2 cassetes."

Neoplasia mucinosa: "Apêndice dilatado (2,5 cm de diâmetro) com parede fina, luz preenchida por muco; serosa com material mucoide aderido na ponta (pintada de azul; mesoapêndice pintado de preto). Fixado inteiro; inclusão total sequencial da ponta para a base em 9 cassetes (A2–A10); margem proximal en face (A1)."

## Armadilhas
- Corte en face grosso da base pintada "some" com a margem: fatia fina, um lado só para baixo no cassete.
- Neuroendócrino de ponta com menos de 1 cm sem base envolvida costuma ser incidental e curado pela apendicectomia — mas só se a ponta estiver no cassete.`,
    },
  ],
}

const colectomia: MacroProtocol = {
  id: 'colectomia',
  name: 'Colectomia por câncer',
  summary: 'Pinte a margem radial não peritonealizada, abra pela tênia sem cortar o tumor, fixe 24–48 h, fatias transversais de 3–4 mm, 5 cassetes de tumor e todos os linfonodos (mínimo 12).',
  steps: [
    {
      text: `## Recepção e orientação
- Identifique os segmentos (íleo, ceco, apêndice, cólon, reto) e a topografia com o pedido; se o sítio não bate com a peça, pergunte ao cirurgião.
- Inspecione a serosa **antes de abrir**: retração, fibrina, implantes, **perfuração** (no tumor ou distante — a distal ao tumor obstrutivo também conta).
- **Margem radial (CRM)** = a superfície **não peritonealizada**, rugosa, de secção do meso e do retroperitônio. No ascendente e descendente é a face posterior; no transverso e sigmoide é o meso estreito; no ceco varia; no reto é tudo abaixo da reflexão peritoneal. **Pinte só ela** (tinta ou gelatina colorida), não a serosa lisa.
- Localize a ligadura vascular alta: o primeiro linfonodo abaixo dela é o **linfonodo apical**, que vai em cassete próprio.`,
    },
    {
      text: `## Abertura e fixação
- Abra longitudinalmente **pela tênia livre/borda antimesentérica**, poupando um segmento de **1 a 2 cm acima e abaixo do tumor** (deixe o tumor fechado para não confundir serosa com margem radial e para preservar a comparação com a imagem); passe uma **mecha de gaze** pela luz do segmento fechado para o formol entrar.
- Tumor pequeno, polipoide: pode abrir também sobre ele, com cuidado.
- Alfinete frouxamente em placa e fixe **24 a 48 h**; solte da placa depois de 24 h para fixar a face de baixo. Só então corte: fatias finas e linfonodos dependem de boa fixação.`,
    },
    {
      text: `## Medidas e descrição
- Comprimento de cada segmento, perímetros das margens e no tumor (estenose?), espessura da parede, extensão do meso/gordura pericólica.
- Tumor: três dimensões, aspecto (vegetante, ulcerado, anular/constritivo, plano), **percentual da circunferência**, **distâncias às margens proximal, distal e radial**, e em cólon a **distância ao ponto de serosa mais próximo**.
- Outras lesões: pólipos (número, tamanho, sítio, distância ao tumor), divertículos, lesão precursora adjacente ao tumor.
- Apêndice e íleo anexos: descrever; ileal só precisa de cassete se houver lesão ou tumor próximo.`,
    },
    {
      text: `## Fatias e cortes do tumor
- Após fixar, **fatias transversais de 3 a 4 mm** do segmento fechado com o tumor, o cólon adjacente e o meso; disponha em ordem, fotografe (foto anotada vira índice de cassetes).
- Nas fatias, meça a **profundidade além da muscular própria** e a **distância do tumor à margem radial pintada**; procure **invasão venosa** (cordões pálidos perpendiculares à base do tumor) e envolvimento peritoneal (áreas foscas, fibróticas, hemorrágicas, nas reflexões e fendas entre lóbulos de gordura).
- **Pelo menos 5 cassetes de tumor** (ou 1 por cm): maior profundidade; **2 cassetes onde o tumor está mais perto da serosa**; relação com a **margem radial** (tumor, depósito ou linfonodo mais próximo — só se estiver perto; se estiver a centímetros, a distância macroscópica basta); veias suspeitas; órgão aderido; tumor com mucosa adjacente e lesão precursora; um cassete de tumor "limpo" reservado para IHQ/molecular (o de maior tumor viável, sem ser megabloco).
- Pós-neoadjuvância sem tumor visível: **5 cassetes do leito** e, se negativos com níveis, todo o leito.`,
    },
    {
      text: `## Margens, anéis e linfonodos
- Margens proximal e distal: se o tumor está a **menos de 3 cm**, perpendiculares mostrando a menor distância (inclua os **anéis de grampeador** se vieram e o tumor chega ao fim da peça); se está longe (mais de 3 cm), shave en face ou nem precisa, registrando a distância macroscópica.
- Um cassete de mucosa normal; apêndice (se presente) e íleo (se lesão ou tumor próximo).
- **Linfonodos**: comece pelo **apical** (cassete próprio), depois todos os que aparecerem nas fatias do meso; os menores que 4 mm inteiros, os maiores com um corte pelo maior eixo. **Todos**, não pare em 12; 12 é o mínimo aceitável, e se não chegar, volte à peça (clareamento de gordura por 24 h ajuda). Nódulos junto à margem radial: embeba de modo a medir a distância à tinta.
- **Depósitos tumorais** no meso (nódulos sem estrutura ganglionar) contam separado (pN1c se sem linfonodo positivo): registre e inclua.`,
    },
    {
      text: `## Modelo de descrição
"Produto de hemicolectomia direita, recebido a fresco, fechado, com íleo de 10 cm, ceco e cólon ascendente de 18 cm e apêndice de 6 cm. Serosa lisa, com área fosca e retraída de 2 cm sobre o tumor. Margem radial (face posterior não peritonealizada) pintada de preto. Aberto pela tênia, poupando 2 cm de cada lado do tumor; fixado 36 h. No ceco, tumor vegetante-ulcerado de 5,5 × 4,5 cm, que ocupa 60% da circunferência, dista 12 cm da margem ileal, 11 cm da margem cólica e 2,5 cm da margem radial. Fatias transversais de 4 mm: tumor infiltra além da muscular própria por 0,8 cm, chegando a 0,1 cm da serosa retraída. Sem outras lesões. Linfonodo apical isolado; 17 linfonodos pericólicos de 0,2 a 1,1 cm; um nódulo de 0,5 cm no meso, sem aspecto ganglionar (depósito?)."

## Armadilhas
- Pintar a serosa lisa como se fosse margem: a serosa é pT4a, não R1.
- Abrir o tumor a fresco e fatiar no mesmo dia: perde a margem radial, a profundidade e metade dos linfonodos.`,
    },
  ],
}

const reto: MacroProtocol = {
  id: 'reto',
  name: 'Reto: ressecção anterior e amputação abdominoperineal',
  summary: 'Primeiro a qualidade do mesorreto (completo, quase completo, incompleto) e fotos das quatro faces; depois margem radial pintada, tumor fechado, fatias transversais e a distância tumor–margem radial (positiva se 1 mm ou menos).',
  steps: [
    {
      text: `## Recepção: avalie o mesorreto antes de tudo
- Peça a fresco, fechada. Fotografe **anterior, posterior e as duas laterais**. A avaliação da superfície é feita na peça **intacta**, e a peça inteira recebe o **pior** grau.
- **Completo (plano mesorretal)**: mesorreto volumoso, superfície lisa e brilhante; irregularidades mínimas, **nenhum defeito com mais de 5 mm** de profundidade; sem afunilamento (coning) para a margem distal; nas fatias, margem radial lisa.
- **Quase completo (plano intramesorretal)**: volume moderado, superfície irregular, **defeitos maiores que 5 mm que não chegam à muscular própria**; muscular própria não visível, exceto na inserção dos levantadores; margem radial moderadamente irregular.
- **Incompleto (plano da muscular própria)**: pouco mesorreto, **defeitos até a muscular própria**, margem radial muito irregular.
- Na **amputação abdominoperineal**, avalie também o plano abaixo do mesorreto: **extralevantador** (levantadores em bloco, peça cilíndrica, sem defeitos no esfíncter), **esfinctérico** (sem levantadores ou só um colar; cintura na altura do puborretal; sem entrar no esfíncter) ou **intraesfinctérico/submucoso/perfuração** (defeitos no esfíncter, ou qualquer perfuração abaixo da reflexão peritoneal).`,
    },
    {
      text: `## Reflexão peritoneal e margem radial
- Localize a **reflexão peritoneal**: anteriormente o peritônio desce mais baixo; abaixo dela o reto não tem serosa e **toda a circunferência é margem radial**. Acima, a face posterior e as laterais são margem (área nua, triangular, com os vasos, contínua com o mesossigmoide) e a anterior é serosa.
- Registre se o tumor está **acima, ao nível ou abaixo** da reflexão (abaixo: maior recidiva local; anterior baixo: sítio mais comum de margem positiva).
- **Pinte a margem radial** (superfície não peritonealizada) em toda a extensão próxima ao tumor; não pinte a serosa.
- Na amputação, meça a **distância do tumor à linha pectínea** de fora, sem abrir o canal anal pelo tumor.`,
    },
    {
      text: `## Abertura, fixação e fatias
- Abra pela face anterior a partir da margem proximal **até 2 cm do tumor** e da distal **até 1 a 2 cm do tumor**; deixe o segmento do tumor **fechado**, com mecha de gaze na luz. Fixe **24 a 48 h**.
- Depois: **fatias transversais de 3 a 5 mm** de todo o segmento fechado, em ordem, fotografadas (ficam na apresentação da reunião multidisciplinar).
- Reavalie o mesorreto nas fatias (regularidade da margem radial) e meça, em cada fatia, a **menor distância entre tumor (ou depósito/linfonodo) e a tinta**.`,
    },
    {
      text: `## Cortes
- Tumor: **5 ou mais cassetes**, com a maior profundidade, a **menor distância à margem radial** (em especial a **anterior** nos tumores baixos), veias suspeitas, envolvimento da serosa acima da reflexão, transição com mucosa, e um bloco para IHQ/molecular.
- Pós-neoadjuvância (a maioria dos retos): tumor pouco ou não visível → **5 cassetes do leito/úlcera/cicatriz**; se negativos, **todo o leito** em níveis antes de chamar resposta completa.
- Margem distal: perpendicular sempre que a menos de 3 cm (e o anel do grampeador, se o tumor chega ao fim da peça); em amputação, a margem distal é a pele perianal — cassete só se o tumor estiver perto.
- Mucosa retal normal proximal e distal; canal anal com a linha pectínea na amputação.
- Linfonodos: apical e todos os do mesorreto (menos numerosos e menores após radioterapia — procure em todas as fatias), embebidos de modo a medir a distância à margem radial quando estiverem perto.`,
    },
    {
      text: `## Modelo de descrição
"Produto de ressecção anterior do reto com excisão total do mesorreto, recebido a fresco, fechado, de 22 cm, com sigmoide proximal. Mesorreto de superfície lisa e brilhante, com defeito único de 3 mm na face posterior, sem afunilamento: **excisão completa**. Reflexão peritoneal anterior a 9 cm da margem distal; tumor centrado 4 cm abaixo dela. Margem radial não peritonealizada pintada de preto. Aberto até 2 cm do tumor de cada lado e fixado 48 h. Fatias transversais de 4 mm: lesão ulcerada de 3,5 × 3,0 cm, ocupando 40% da circunferência, que infiltra a parede e o mesorreto por 0,6 cm além da muscular; **menor distância à margem radial: 0,4 cm (fatia 6, face anterior)**. Dista 2,0 cm da margem distal e 14 cm da proximal. Linfonodo apical isolado; 13 linfonodos mesorretais de 0,2 a 0,8 cm, o mais próximo da margem radial a 0,3 cm."

## Armadilhas
- Avaliar o mesorreto depois de aberto ou fatiado: impossível; faça antes e fotografe.
- Radial positiva é tumor, depósito, veia ou linfonodo comprometido a **1 mm ou menos** da tinta; diga qual deles no laudo.
- Não abra pelo tumor "para ver melhor": a distância à margem radial vai junto.`,
    },
  ],
}

const colectomiaNaoTumoral: MacroProtocol = {
  id: 'colectomia-nao-tumoral',
  name: 'Cólon: doença inflamatória, diverticular e isquêmica',
  summary: 'Retocolite: cortes a cada 10 cm do distal ao proximal com as transições; diverticulite: distender com formol antes de abrir; isquemia: transição viável–necrótica e vasos.',
  steps: [
    {
      text: `## Recepção e abertura
- Segmentos e orientação como na colectomia por câncer; identifique anastomoses prévias e ostomias.
- **Diverticulite**: se a peça vier fechada, **amarre as extremidades e injete formol na luz** até distender; fixe de um dia para o outro e só então abra — os divertículos ficam rígidos e visíveis. Aderências serosas e áreas escurecidas marcam o divertículo sintomático.
- **Retocolite ulcerativa / Crohn**: abra pela tênia, inclusive o íleo terminal (fica grampeado); lave sem esfregar a mucosa; fixe estendida.
- **Isquemia**: processe a fresco ou no mesmo dia; não deixe para o dia seguinte sem abrir.`,
    },
    {
      text: `## Descrição
- Comprimento e perímetro de cada segmento; ceco no ponto mais largo; segmentos dilatados ou estenosados (perímetro e comprimento); espessura da parede.
- **Retocolite**: extensão contínua a partir do reto; mucosa granular, hemorrágica, com **pseudopólipos**; ileíte de refluxo; **lesões elevadas, aveludadas ou granulares** (displasia?) — meça e localize.
- **Crohn**: salteado, transmural, fissuras, fístulas, gordura envolvente (veja o roteiro de delgado).
- **Divertículos**: número, localização (três fileiras longitudinais), conteúdo, sinais de inflamação, abscesso pericólico, perfuração, fístula, estenose; procure sempre um tumor "escondido" na estenose.
- **Isquemia**: mucosa achatada, escura/verde/preta, parede fina, perfuração; **meso** com trombos ou vasculite.`,
    },
    {
      text: `## Cortes
- **Margens proximal e distal longitudinais** (em Crohn e retocolite, o estado da margem interessa ao cirurgião).
- Retocolite/Crohn: **cortes sequenciais a cada 10 cm, do distal ao proximal**, com as transições normal–quiescente–ativo; pseudopólipos representativos; **toda lesão suspeita de displasia** (mais cortes); apêndice (ponta, meio, base); íleo terminal; um cassete com os linfonodos (dissecção completa só se houver displasia ou tumor).
- Diverticulite: divertículo inflamado com a parede, abscesso/perfuração, cólon distante, margens; **qualquer área espessada ou estenosada com cortes generosos** (carcinoma pode se esconder na diverticulite).
- Isquemia: **transição viável–necrótica**, área necrótica, perfuração, **vasos do meso** (vários cortes), margens.

## Modelo de descrição
"Produto de sigmoidectomia, recebido fechado; extremidades ligadas e luz distendida com formol; fixado 24 h. Segmento de 20 cm × 3,5 cm, com serosa fosca e aderências na face mesentérica de 5 cm. Aberto pela tênia: numerosos divertículos em três fileiras, de 0,3 a 0,8 cm, um deles com abscesso pericólico de 1,5 cm; sem tumor. Parede de 0,8 cm na área inflamada. Margens livres de divertículos (a 4 e 6 cm)."`,
    },
  ],
}

const anus: MacroProtocol = {
  id: 'canal-anal',
  name: 'Canal anal: hemorroidectomia, fissura, fístula e lesões',
  summary: 'Peças pequenas mas com armadilha: hemorroidas podem esconder displasia/HPV; lesão anal suspeita ganha margens pintadas e inclusão total.',
  steps: [
    {
      text: `## Hemorroidectomia
- Número de mamilos, medidas de cada um, pele/mucosa que os reveste, trombose, ulceração.
- Um a dois cortes por mamilo, **incluindo a transição mucosa–pele**; inclusão total se houver área branca, verrucosa ou endurecida.
- Displasia anal (AIN) e condiloma são achados incidentais frequentes: não descarte peça sem cortar.

## Fissura e fístula
- Fissura: fragmento de mucosa/pele com a base; inclusão total (descartar Crohn, tuberculose, carcinoma).
- Trajeto fistuloso: meça, sonde, corte transversal em vários níveis; inclusão total.`,
    },
    {
      text: `## Lesão anal (condiloma, tumor, ressecção local)
- Oriente pela marcação do cirurgião; **pinte as margens** (cores diferentes por lado se houver orientação); fotografe.
- Três dimensões da lesão e distâncias às margens; **cortes seriados perpendiculares** de 2 a 3 mm, inclusão total mapeada.
- Carcinoma de canal anal em amputação: siga o roteiro de reto (planos dos esfíncteres, distância à linha pectínea, margem radial).

## Modelo de descrição
"Produto de hemorroidectomia: três mamilos de 2,0 × 1,5 × 1,0 cm, 1,8 × 1,2 × 0,8 cm e 1,5 × 1,0 × 0,8 cm, revestidos por mucosa violácea e pele, o primeiro com trombo. Um corte de cada, incluindo a transição mucocutânea (3 cassetes)."`,
    },
  ],
}

const colecistectomia: MacroProtocol = {
  id: 'colecistectomia',
  name: 'Vesícula biliar',
  summary: 'Um corte longitudinal do fundo ao colo com a margem do ducto cístico, mais linfonodo cístico; lesão suspeita: pintar o leito hepático, cístico en face e inclusão total.',
  steps: [
    {
      text: `## Recepção
- Vesícula fechada ou aberta; meça **comprimento e diâmetro máximo**; serosa (lisa, espessada, hemorrágica, fibrina); **leito hepático** = face rugosa sem serosa (pinte se houver lesão).
- Retire o clipe do ducto cístico; **pinte a margem do cístico** e retire um **corte en face** dela antes de abrir (mesmo em casos benignos, é a rotina mais segura).
- Abra longitudinalmente do fundo ao colo; conte e meça os **cálculos** (o maior), cor e tipo; bile (cor, consistência). Se a requisição diz "colelitíase" e não há cálculos, registre como negativo pertinente.`,
    },
    {
      text: `## Descrição e cortes de rotina
- Espessura da parede; mucosa (aveludada, verde-amarelada com estrias — colesterolose —, granular, ulcerada, esbranquiçada, plana); pólipos (número, tamanho); **linfonodo cístico** se houver.
- Cassete único de rotina: **um corte longitudinal do fundo ao colo (sem enrolar)** + a margem do ducto cístico + linfonodo cístico. Acima de 50 anos, ou parede espessada, ou mucosa granular: **mais 2 a 3 cortes representativos**.
- **Pólipos**: inclusão total. Material solto no frasco: procure e inclua.
- Fixe por algumas horas antes de cortar se vier a fresco.`,
    },
    {
      text: `## Lesão suspeita (espessamento, massa, pólipo séssil > 1 cm, vesícula em porcelana)
- Antes de abrir: pinte o **leito hepático** e a serosa sobre a lesão; margem do ducto cístico en face à parte.
- Meça a lesão (três dimensões), localização (fundo, corpo, colo, face hepática ou peritoneal — muda o T), profundidade, distância ao leito hepático e ao cístico.
- Cortes: **inclusão total da lesão** (ou 1 por cm, mínimo 7 cassetes em tumor grande) com o ponto mais próximo do leito pintado; mucosa restante (2 cassetes); cístico en face; todos os linfonodos.
- Colecistectomia com **segmento hepático** (leito): pinte a superfície de secção hepática, corte perpendicular mostrando a menor distância.

## Modelo de descrição
"Vesícula biliar, recebida fechada, de 8,0 × 3,0 cm, serosa lisa. Margem do ducto cístico pintada e retirada en face. Parede de 0,3 cm; mucosa aveludada, verde, com estrias amareladas (colesterolose); 12 cálculos facetados, pardo-escuros, de 0,3 a 1,0 cm. Linfonodo cístico de 0,5 cm. Um corte longitudinal fundo–colo, cístico e linfonodo em 1 cassete."`,
    },
  ],
}

const hepatectomia: MacroProtocol = {
  id: 'hepatectomia',
  name: 'Fígado: segmentectomia e hepatectomia',
  summary: 'Pese, pinte só a superfície de secção parenquimatosa (a cápsula não), fatias de 5 a 10 mm perpendiculares à margem; cada nódulo com a menor distância à margem e o parênquima ao redor.',
  steps: [
    {
      text: `## Recepção e orientação
- Tipo: segmentectomia, setorectomia, hepatectomia direita (V–VIII) ou esquerda (II–IV ± I), metastasectomia em cunha, explante. Peça a imagem (número de lesões, segmentos, relação com vasos e hilo).
- **Pese** e meça em três dimensões; descreva a cápsula (lisa, retraída, nodular de cirrose, aderências) e os vasos e ductos do hilo, se presentes.
- **Pinte a superfície de secção cirúrgica** (parênquima cortado, superfície rugosa, com clipes) — **não pinte a cápsula lisa**: cápsula íntegra é superfície, não margem.
- Fotografe.`,
    },
    {
      text: `## Fatias
- **Fatias paralelas de 5 a 10 mm**, perpendiculares à margem de secção nas ressecções parciais, e perpendiculares ao maior eixo no explante; disponha em ordem e fotografe a fatia mais representativa.
- Pode cortar a fresco ou após fixação curta; explantes fixam melhor fatiados.
- Meça cada lesão (três dimensões), cor, consistência, necrose, hemorragia, cicatriz central, cápsula, satélites, **trombo tumoral em veia** (porta, hepática); **menor distância à margem pintada** e à cápsula; distância ao hilo.
- Parênquima não tumoral: cirrose (nódulos, tamanho), esteatose, colestase, congestão.`,
    },
    {
      text: `## Cortes
- Lesão: cortes com a **relação à margem pintada** (o mais próximo), à cápsula e ao parênquima adjacente; hepatocarcinoma e colangiocarcinoma: 1 cassete por cm (mínimo 4), incluindo interface com o parênquima e vasos suspeitos; metástase conhecida: 1 a 2 cassetes bastam (mais a margem).
- **Parênquima não tumoral** longe da lesão: 1 a 2 cassetes (fibrose, esteatose, hepatite — importam para o prognóstico e para a cirurgia seguinte).
- **Margens vascular e biliar** do hilo (veia porta, artéria, ducto), en face, quando a peça as inclui; **tumores intraductais: inclusão total** com a margem.
- Linfonodos do hilo e do ligamento hepatoduodenal; vesícula anexa pelo roteiro dela.
- Explante: hilo em cubo de ~2 cm com cortes transversais dos ductos e vasos; todo nódulo que difere dos demais (cor, tamanho ≥ 1 cm) vai ao cassete.

## Modelo de descrição
"Produto de segmentectomia hepática (segmentos VI–VII), recebido a fresco, de 240 g e 11 × 8 × 6 cm; cápsula lisa. Superfície de secção cirúrgica pintada de preto. Fatias de 8 mm perpendiculares à margem: nódulo único, esbranquiçado, firme, de 3,2 × 2,8 × 2,5 cm, de limites nítidos, com necrose central, que dista 0,7 cm da margem pintada e 1,0 cm da cápsula. Parênquima restante pardo, sem nódulos. 4 cassetes do nódulo (um com a margem), 2 de parênquima distante."`,
    },
  ],
}

const duodenopancreatectomia: MacroProtocol = {
  id: 'duodenopancreatectomia',
  name: 'Duodenopancreatectomia (Whipple) e pancreatectomia distal',
  summary: 'Oriente, pinte as margens com cores (colo, ducto biliar, sulco da mesentérica, uncinado/mesentérica superior, posterior, anterior), sonde os ductos, fatias axiais de 3 a 5 mm; todos os linfonodos (mínimo 12).',
  steps: [
    {
      text: `## Recepção e orientação
- Componentes: segmento gastroduodenal (ou só duodeno, se preservação pilórica), cabeça do pâncreas com processo uncinado, ducto biliar (colédoco) seccionado, vesícula às vezes. Oriente: duodeno em C envolvendo a cabeça; o **colo** é a superfície de secção lisa do pâncreas (margem pancreática), o **sulco da veia mesentérica superior** é a concavidade lisa, medial; o **uncinado/margem da artéria mesentérica superior** é a face posteromedial rugosa e vascular; a **face posterior** é a superfície retroperitoneal rugosa; a **face anterior** é lisa (peritônio; superfície, não margem, para a maioria).
- Peça a fresco: fotografe as faces; margem do **ducto biliar en face** e **colo pancreático en face** logo na recepção (antes de qualquer corte), cada uma em cassete próprio.`,
    },
    {
      text: `## Tintas (proponha o esquema do serviço e não mude)
- Colo pancreático: **azul**; ducto biliar: **verde** (margem en face); sulco da mesentérica superior: **laranja**; uncinado / mesentérica superior: **preto**; face posterior: **amarelo**; face anterior: **vermelho** (superfície).
- O que importa é ter cores diferentes para **sulco da VMS, AMS/uncinado e posterior**, que são as margens onde o R1 acontece; anote a legenda no laudo.
- Duodeno proximal e distal (ou gástrico): margens longitudinais.`,
    },
    {
      text: `## Abertura, sondagem e fatias
- Abra o duodeno **pela face oposta ao pâncreas** (antimesentérica), sem passar pela **ampola**; localize a ampola e a papila menor.
- **Sonde o ducto biliar** pela margem até a ampola e o **ducto pancreático principal** pelo colo; anote calibre, estenose, tumor intraductal, cálculos.
- Método **axial** (recomendado para carcinoma de pâncreas): **fatias de 3 a 5 mm perpendiculares ao eixo do duodeno**, da cabeça inteira com a parede duodenal e a ampola, mantendo as sondas; cada fatia mostra todas as margens circunferenciais. Alternativa: bivalvar pelos dois ductos e fatiar a partir daí (melhor para ampola e lesões intraductais).
- Fixe as fatias de um dia para o outro em ordem (ou a peça inteira após abrir o duodeno) antes de distribuir nos cassetes.`,
    },
    {
      text: `## Tumor: origem, medidas e cortes
- Determine o **epicentro**: pâncreas (massa mal delimitada, firme, esbranquiçada, com ducto pancreático dilatado a montante), **ampola** (lesão na papila, ducto biliar e pancreático dilatados), **colédoco distal** (espessamento circunferencial da parede do ducto) ou **duodeno** (lesão mucosa periampular). Diga em qual estrutura está centrado e o que envolve.
- Três dimensões; distâncias a cada margem pintada; relação com a ampola, o colédoco, o ducto pancreático, o duodeno, a veia mesentérica (se veio segmento venoso, pinte-o e corte transversal).
- Cortes: tumor com **cada margem** (sulco da VMS, uncinado/AMS, posterior, anterior, colo), tumor com ampola e ducto biliar, tumor com duodeno, 1 cassete por cm (mínimo 4); pós-neoadjuvância: toda a área de fibrose/leito.
- **R1 = tumor até 1 mm** da margem pintada (convenção europeia/RCPath; alguns serviços usam 0 mm — diga qual está usando).
- Pâncreas não tumoral (2 cassetes: pancreatite obstrutiva, PanIN), duodeno e estômago longe do tumor, vesícula (1 a 2 cassetes).`,
    },
    {
      text: `## Linfonodos e pancreatectomia distal
- Linfonodos peripancreáticos (anteriores, posteriores, ao longo do sulco), perigástricos, do ligamento hepatoduodenal, da artéria hepática se enviados: **todos** — o AJCC pede ao menos **12**, e o consenso cirúrgico (ISGPS) **15**.
- **Pancreatectomia distal** (corpo/cauda ± baço): pinte a **margem de secção pancreática** (transecção), a face **anterior** e a **posterior**; fatias de 5 a 10 mm perpendiculares ao ducto; tumor sólido: 1 cassete por cm com as faces; **cistos (IPMN, neoplasia mucinosa cística)**: inclusão **total** da lesão cística (ou da parede, se enorme) com a relação ao ducto principal e ramos; hilo esplênico e baço (cápsula íntegra?) com cortes representativos e os linfonodos do hilo.

## Modelo de descrição
"Produto de duodenopancreatectomia cefálica com preservação pilórica, recebido a fresco: duodeno de 22 cm, cabeça pancreática de 6 × 4,5 × 3 cm, colédoco de 2,5 cm de comprimento e 1,2 cm de diâmetro (dilatado), vesícula de 7 × 3 cm. Margens pintadas: colo azul (en face), ducto biliar verde (en face), sulco da VMS laranja, uncinado/AMS preto, posterior amarelo, anterior vermelho. Duodeno aberto pela face antimesentérica; sondagem: colédoco estenosado 1 cm acima da ampola; ducto pancreático dilatado (0,5 cm). Fatias axiais de 4 mm: tumor esbranquiçado, firme, mal delimitado, de 3,2 × 2,8 × 2,5 cm, **centrado no parênquima pancreático**, que envolve o colédoco distal, dista 0,1 cm da margem do uncinado/AMS, 0,3 cm do sulco da VMS, 0,8 cm da posterior e 1,5 cm do colo; não atinge o duodeno nem a ampola. Pâncreas restante firme (pancreatite obstrutiva). 18 linfonodos peripancreáticos de 0,2 a 1,4 cm."

## Armadilhas
- Não colha o colo e o ducto biliar depois de fatiar: colha en face na recepção.
- "Margem posterior livre" sem ter pintado o uncinado separadamente é a causa mais comum de R0 falso.`,
    },
  ],
}

/** Trato gastrointestinal e órgãos anexos. */
export const gastro: MacroSystem = {
  id: 'gastrointestinal',
  name: 'Gastrointestinal',
  icon: Activity,
  color: '#ef4444',
  description:
    'Do frasco de biópsias à duodenopancreatectomia: como receber, pintar, abrir, fixar, medir, cortar e descrever cada peça do tubo digestivo, do fígado, das vias biliares e do pâncreas.',
  protocols: [
    biopsias,
    polipectomia,
    mucosectomia,
    esofagectomia,
    gastrectomia,
    gastrectomiaVertical,
    enterectomia,
    apendicectomia,
    colectomia,
    reto,
    colectomiaNaoTumoral,
    anus,
    colecistectomia,
    hepatectomia,
    duodenopancreatectomia,
  ],
}
