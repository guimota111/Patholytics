/* ==========================================================================
   types.ts — modelo do nomeador de cistos.

   A pergunta que a ferramenta responde é a da bancada: "cisto em tal lugar,
   revestido por tal epitélio — como se chama?". Por isso o vocabulário é
   fechado em três listas (locais, revestimentos, achados na parede ou no
   conteúdo) e cada cisto do conteúdo aponta para ids dessas listas; é isso
   que permite ordenar as sugestões. O texto livre de cada verbete (parede,
   conteúdo, pistas, com o que confunde) é o que o patologista lê depois.

   O conteúdo é escrito em código (content/), como nos catálogos: nunca é
   editado pelo site.
   ========================================================================== */

import type { LucideIcon } from 'lucide-react'

/** Região do desenho do corpo: agrupa os locais para o clique no mapa. */
export type RegionId = 'cns' | 'head' | 'jaw' | 'neck' | 'thorax' | 'breast' | 'abdomen' | 'pelvis' | 'skin' | 'bone'

export interface Region {
  id: RegionId
  label: string
}

export interface Site {
  id: string
  label: string
  region: RegionId
}

export type LiningGroup = 'squamous' | 'glandular' | 'ciliated' | 'special' | 'none'

export interface Lining {
  id: string
  label: string
  group: LiningGroup
  /** O que olhar na lâmina para reconhecer este revestimento. */
  hint?: string
}

export type FeatureGroup = 'wall' | 'contents' | 'lining'

export interface Feature {
  id: string
  label: string
  group: FeatureGroup
}

export interface Cyst {
  id: string
  name: string
  aka?: string[]
  /** Locais (ids de SITES) onde este cisto ocorre. */
  sites: string[]
  /** Revestimentos (ids de LININGS) que podem ser encontrados; qualquer um combina. */
  linings: string[]
  /** Achados (ids de FEATURES) característicos na parede, no conteúdo ou no próprio epitélio. */
  features?: string[]
  /** O revestimento descrito com precisão, como sai no laudo. */
  lining: string
  wall?: string
  contents?: string
  /** Onde fica exatamente, idade, sexo, imagem. */
  where?: string
  clues?: string[]
  /** "Entidade: o que separa". */
  mimics?: string[]
  /** Sem revestimento epitelial verdadeiro. */
  pseudocyst?: boolean
  sources?: string[]
}

export interface CystTool {
  icon: LucideIcon
  color: string
  regions: Region[]
  sites: Site[]
  linings: Lining[]
  features: Feature[]
  cysts: Cyst[]
}

/* ---- Vocabulário ----------------------------------------------------------- */

export const REGIONS: Region[] = [
  { id: 'cns', label: 'Sistema nervoso e olho' },
  { id: 'head', label: 'Cabeça: orelha, nariz e face' },
  { id: 'jaw', label: 'Boca, maxilares e salivares' },
  { id: 'neck', label: 'Pescoço e tireoide' },
  { id: 'thorax', label: 'Tórax' },
  { id: 'breast', label: 'Mama' },
  { id: 'abdomen', label: 'Abdome e retroperitônio' },
  { id: 'pelvis', label: 'Pelve e genitais' },
  { id: 'skin', label: 'Pele e subcutâneo' },
  { id: 'bone', label: 'Osso, articulações e partes moles' },
]

export const SITES: Site[] = [
  { id: 'encefalo', label: 'Encéfalo e ventrículos', region: 'cns' },
  { id: 'sela', label: 'Região selar e hipófise', region: 'cns' },
  { id: 'coluna', label: 'Coluna, medula e raízes', region: 'cns' },
  { id: 'orbita', label: 'Órbita, olho e pálpebra', region: 'cns' },
  { id: 'orelha', label: 'Orelha e região pré-auricular', region: 'head' },
  { id: 'nariz', label: 'Nariz, seios paranasais e nasofaringe', region: 'head' },
  { id: 'maxilares', label: 'Maxila e mandíbula (ossos gnáticos)', region: 'jaw' },
  { id: 'boca', label: 'Mucosa oral, gengiva e assoalho', region: 'jaw' },
  { id: 'salivares', label: 'Glândulas salivares', region: 'jaw' },
  { id: 'pescoco', label: 'Pescoço (linha média e lateral)', region: 'neck' },
  { id: 'tireoide', label: 'Tireoide e paratireoides', region: 'neck' },
  { id: 'mediastino', label: 'Mediastino e timo', region: 'thorax' },
  { id: 'pulmao', label: 'Pulmão e pleura', region: 'thorax' },
  { id: 'coracao', label: 'Coração e pericárdio', region: 'thorax' },
  { id: 'esofago', label: 'Esôfago', region: 'thorax' },
  { id: 'mama', label: 'Mama', region: 'breast' },
  { id: 'figado', label: 'Fígado e vias biliares', region: 'abdomen' },
  { id: 'pancreas', label: 'Pâncreas', region: 'abdomen' },
  { id: 'baco', label: 'Baço', region: 'abdomen' },
  { id: 'tubo-digestivo', label: 'Estômago, intestinos e reto', region: 'abdomen' },
  { id: 'mesenterio', label: 'Mesentério, omento e retroperitônio', region: 'abdomen' },
  { id: 'rim', label: 'Rim', region: 'abdomen' },
  { id: 'adrenal', label: 'Adrenal', region: 'abdomen' },
  { id: 'ovario', label: 'Ovário', region: 'pelvis' },
  { id: 'tuba', label: 'Tuba uterina e ligamento largo', region: 'pelvis' },
  { id: 'utero', label: 'Útero e colo', region: 'pelvis' },
  { id: 'vulva', label: 'Vagina e vulva', region: 'pelvis' },
  { id: 'prostata', label: 'Próstata e vesículas seminais', region: 'pelvis' },
  { id: 'testiculo', label: 'Testículo, epidídimo e escroto', region: 'pelvis' },
  { id: 'penis', label: 'Pênis e uretra', region: 'pelvis' },
  { id: 'bexiga', label: 'Bexiga e úraco', region: 'pelvis' },
  { id: 'retrorretal', label: 'Região retrorretal, perianal e sacrococcígea', region: 'pelvis' },
  { id: 'pele', label: 'Pele e subcutâneo', region: 'skin' },
  { id: 'osso', label: 'Osso', region: 'bone' },
  { id: 'articulacao', label: 'Articulações, tendões e bursas', region: 'bone' },
  { id: 'partes-moles', label: 'Partes moles profundas', region: 'bone' },
]

export const LININGS: Lining[] = [
  // Escamoso
  { id: 'escamoso-queratinizado', label: 'Escamoso queratinizado com camada granulosa', group: 'squamous', hint: 'Como a epiderme: granulosa evidente e queratina lamelar ("cesto") na luz.' },
  { id: 'triquilemal', label: 'Escamoso sem camada granulosa (queratinização triquilemal)', group: 'squamous', hint: 'Transição abrupta para queratina compacta e homogênea, células periféricas em paliçada.' },
  { id: 'escamoso-nao-queratinizado', label: 'Escamoso não queratinizado', group: 'squamous', hint: 'Estratificado, sem granulosa nem queratina; pode ser fino e regular ou hiperplásico com arcos.' },
  { id: 'paraqueratinizado-corrugado', label: 'Escamoso paraqueratinizado, superfície corrugada, basal em paliçada', group: 'squamous', hint: 'Fino e uniforme (5 a 8 camadas), sem cristas, descola facilmente da cápsula.' },
  { id: 'epitelio-reduzido-esmalte', label: 'Escamoso fino não queratinizado (epitélio reduzido do esmalte)', group: 'squamous', hint: 'Duas a quatro camadas de células cuboidais ou achatadas, ao redor da coroa de um dente incluso.' },
  { id: 'celulas-fantasma', label: 'Escamoso com células fantasma', group: 'squamous', hint: 'Células eosinofílicas sem núcleo ("ghost cells"), que calcificam; camada basal em paliçada como ameloblastoma.' },
  { id: 'linfoepitelial', label: 'Escamoso sobre estroma linfoide denso', group: 'squamous', hint: 'Tecido linfoide com centros germinativos abraçando o epitélio, às vezes infiltrando-o.' },
  // Glandular
  { id: 'cuboidal-simples', label: 'Cuboidal ou colunar baixo simples (biliar, ductal, renal)', group: 'glandular', hint: 'Camada única de células regulares, sem mucina evidente nem cílios.' },
  { id: 'glicogenio-rico', label: 'Cuboidal claro rico em glicogênio', group: 'glandular', hint: 'Citoplasma claro, PAS positivo e diastase lábil, sem mucina; núcleos redondos uniformes.' },
  { id: 'colunar-mucinoso', label: 'Colunar mucinoso (endocervical, gástrico ou intestinal)', group: 'glandular', hint: 'Mucina apical abundante; conte células caliciformes para o tipo intestinal.' },
  { id: 'colunar-nao-ciliado', label: 'Colunar ou cuboidal não ciliado, pseudoestratificado (mesonéfrico, uretral)', group: 'glandular', hint: 'Sem mucina e sem cílios; material eosinofílico denso na luz sugere mesonéfrico.' },
  { id: 'apocrino', label: 'Cuboidal a colunar apócrino', group: 'glandular', hint: 'Citoplasma eosinofílico granular e secreção por decapitação.' },
  { id: 'endometrioide', label: 'Endometrial (glândulas com estroma endometrial)', group: 'glandular', hint: 'Só vale com o estroma endometrial subjacente; procure hemossiderina.' },
  { id: 'folicular-tireoidiano', label: 'Folicular tireoidiano', group: 'glandular', hint: 'Células foliculares, coloide, TTF-1 e tireoglobulina positivos.' },
  { id: 'oncocitico', label: 'Oncocítico (duas camadas, citoplasma granular)', group: 'glandular', hint: 'Células altas eosinofílicas em fileira dupla, como no tumor de Warthin.' },
  { id: 'celulas-granulosas', label: 'Células da granulosa ou luteinizadas', group: 'glandular', hint: 'Camadas de células pequenas com núcleo redondo (granulosa) ou poligonais com citoplasma abundante (luteinizadas).' },
  // Ciliado
  { id: 'respiratorio-ciliado', label: 'Respiratório: pseudoestratificado ciliado com células caliciformes', group: 'ciliated', hint: 'Cílios mais caliciformes; pense em endoderma do intestino anterior ou trato respiratório.' },
  { id: 'ciliado-mulleriano', label: 'Cuboidal ou colunar ciliado simples, tipo tubário', group: 'ciliated', hint: 'Células ciliadas, secretoras e intercalares, sem caliciformes; pense em derivado mülleriano.' },
  // Especial
  { id: 'urotelial', label: 'Urotelial ou transicional', group: 'special', hint: 'Multicamadas com células em guarda-chuva; GATA3 e p63 positivos.' },
  { id: 'mesotelial', label: 'Mesotelial', group: 'special', hint: 'Camada única de células achatadas a cuboidais; calretinina, WT1 e D2-40 positivos.' },
  { id: 'endotelial', label: 'Endotelial (linfático ou vascular)', group: 'special', hint: 'Células muito achatadas; D2-40 e CD31 positivos, linfa ou sangue na luz.' },
  { id: 'glioependimario', label: 'Ependimário ou glial', group: 'special', hint: 'Cuboidal a colunar, às vezes ciliado, sobre tecido glial GFAP positivo.' },
  { id: 'meningotelial', label: 'Meningotelial (aracnoide)', group: 'special', hint: 'Camada única de células achatadas EMA positivas.' },
  { id: 'sinovial', label: 'Sinovial ou fibroso, tipo membrana sinovial', group: 'special', hint: 'Células sinoviais (sinoviócitos) frouxas em uma ou poucas camadas; sem membrana basal.' },
  { id: 'achatado-inespecifico', label: 'Achatado e atenuado, sem tipo definível', group: 'special', hint: 'Uma camada de células achatadas sem características; pode ser epitélio comprimido ou mesotélio.' },
  // Sem revestimento
  { id: 'sem-revestimento', label: 'Sem revestimento epitelial (pseudocisto)', group: 'none', hint: 'Parede de tecido fibroso, granulação ou histiócitos; nenhum epitélio em cortes seriados.' },
  { id: 'parasitario', label: 'Membrana parasitária', group: 'none', hint: 'Membrana laminada acelular PAS positiva, com ou sem protoescólices.' },
]

export const FEATURES: Feature[] = [
  // Na parede
  { id: 'estroma-linfoide', label: 'Tecido linfoide com centros germinativos', group: 'wall' },
  { id: 'estroma-ovariano', label: 'Estroma tipo ovariano (fusocelular denso)', group: 'wall' },
  { id: 'estroma-endometrial', label: 'Estroma endometrial', group: 'wall' },
  { id: 'musculo-liso', label: 'Músculo liso organizado na parede', group: 'wall' },
  { id: 'cartilagem', label: 'Cartilagem', group: 'wall' },
  { id: 'glandulas-seromucosas', label: 'Glândulas seromucosas', group: 'wall' },
  { id: 'anexos-cutaneos', label: 'Anexos cutâneos (pelos, sebáceas, sudoríparas)', group: 'wall' },
  { id: 'tecido-timico', label: 'Tecido tímico (corpúsculos de Hassall)', group: 'wall' },
  { id: 'foliculos-tireoidianos', label: 'Folículos tireoidianos', group: 'wall' },
  { id: 'nervo-vaso', label: 'Feixe neurovascular calibroso na parede', group: 'wall' },
  { id: 'tecido-glial', label: 'Tecido glial ou neural', group: 'wall' },
  { id: 'colesterol', label: 'Fendas de colesterol e células gigantes', group: 'wall' },
  { id: 'hemossiderina', label: 'Hemossiderina e macrófagos', group: 'wall' },
  { id: 'calcificacao', label: 'Calcificação ou ossificação', group: 'wall' },
  { id: 'inflamacao', label: 'Inflamação intensa ou granulação', group: 'wall' },
  { id: 'corpos-rushton', label: 'Corpos hialinos de Rushton', group: 'wall' },
  { id: 'dente', label: 'Relação com um dente (coroa, ápice ou raiz)', group: 'wall' },
  // No revestimento
  { id: 'celulas-caliciformes', label: 'Células caliciformes', group: 'lining' },
  { id: 'celulas-mucosas', label: 'Células mucosas no meio do epitélio escamoso', group: 'lining' },
  { id: 'cilios', label: 'Cílios', group: 'lining' },
  { id: 'palicada-basal', label: 'Camada basal em paliçada', group: 'lining' },
  { id: 'celulas-neuroendocrinas', label: 'Células neuroendócrinas', group: 'lining' },
  { id: 'metaplasia-escamosa', label: 'Metaplasia escamosa focal', group: 'lining' },
  // No conteúdo
  { id: 'queratina-lamelar', label: 'Queratina lamelar (em cesto)', group: 'contents' },
  { id: 'queratina-compacta', label: 'Queratina compacta homogênea', group: 'contents' },
  { id: 'muco', label: 'Mucina', group: 'contents' },
  { id: 'coloide', label: 'Coloide', group: 'contents' },
  { id: 'espermatozoides', label: 'Espermatozoides', group: 'contents' },
  { id: 'sebo-pelos', label: 'Sebo e pelos', group: 'contents' },
  { id: 'sangue', label: 'Sangue ou líquido achocolatado', group: 'contents' },
  { id: 'material-eosinofilico', label: 'Material eosinofílico denso ou coloide-símile', group: 'contents' },
]

export const REGION_ORDER: RegionId[] = REGIONS.map((r) => r.id)

export const sitesOf = (region: RegionId) => SITES.filter((s) => s.region === region)
export const findSite = (id: string | null) => SITES.find((s) => s.id === id) ?? null
export const findLining = (id: string) => LININGS.find((l) => l.id === id)
export const findFeature = (id: string) => FEATURES.find((f) => f.id === id)
