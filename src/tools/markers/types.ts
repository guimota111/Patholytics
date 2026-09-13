/* ==========================================================================
   types.ts — modelo do Marker Helper.

   A pergunta da bancada é: "tumor em tal lugar, com tal cara, marcou isto e
   não marcou aquilo — o que é, e o que peço a seguir?". Para responder, o
   vocabulário é fechado: sítios, tipos celulares, arquiteturas, achados,
   faixas etárias e marcadores são listas fixas, e cada tumor do conteúdo
   aponta para ids dessas listas. É isso que permite calcular, para cada
   diagnóstico, o que bate, o que não bate e o que bate por exceção.

   Cada par tumor × marcador guarda a porcentagem de positividade da
   literatura (número ou faixa), o padrão esperado e a fonte. A tela agrupa
   em faixas de leitura ("quase sempre", "geralmente", "variável", "raro",
   "quase nunca") e mostra o número ao lado.

   O conteúdo é escrito em código (content/), como nos catálogos: nunca é
   editado pelo site.
   ========================================================================== */

/* ---- Regiões e sítios ------------------------------------------------------- */

export type RegionId = 'cns' | 'head' | 'jaw' | 'neck' | 'thorax' | 'breast' | 'abdomen' | 'pelvis' | 'skin' | 'bone' | 'hemato'

export interface Region {
  id: RegionId
  label: string
}

export interface Site {
  id: string
  label: string
  region: RegionId
}

export const REGIONS: Region[] = [
  { id: 'cns', label: 'Sistema nervoso e olho' },
  { id: 'head', label: 'Cabeça: nariz, seios e orelha' },
  { id: 'jaw', label: 'Boca, maxilares e salivares' },
  { id: 'neck', label: 'Pescoço, laringe e tireoide' },
  { id: 'thorax', label: 'Tórax' },
  { id: 'breast', label: 'Mama' },
  { id: 'abdomen', label: 'Abdome e retroperitônio' },
  { id: 'pelvis', label: 'Pelve e genitais' },
  { id: 'skin', label: 'Pele' },
  { id: 'bone', label: 'Osso e partes moles' },
  { id: 'hemato', label: 'Linfonodo, medula e baço' },
]

export const SITES: Site[] = [
  { id: 'encefalo', label: 'Encéfalo e ventrículos', region: 'cns' },
  { id: 'meninges', label: 'Meninges', region: 'cns' },
  { id: 'sela', label: 'Região selar e hipófise', region: 'cns' },
  { id: 'medula-espinhal', label: 'Medula, raízes e coluna', region: 'cns' },
  { id: 'nervo-periferico', label: 'Nervo periférico', region: 'cns' },
  { id: 'olho-orbita', label: 'Olho, órbita e pálpebra', region: 'cns' },
  { id: 'nariz-seios', label: 'Cavidade nasal, seios paranasais e nasofaringe', region: 'head' },
  { id: 'orelha', label: 'Orelha e osso temporal', region: 'head' },
  { id: 'boca', label: 'Cavidade oral e orofaringe', region: 'jaw' },
  { id: 'maxilares', label: 'Maxila e mandíbula (odontogênicos)', region: 'jaw' },
  { id: 'salivares', label: 'Glândulas salivares', region: 'jaw' },
  { id: 'laringe', label: 'Laringe e hipofaringe', region: 'neck' },
  { id: 'tireoide', label: 'Tireoide', region: 'neck' },
  { id: 'paratireoide', label: 'Paratireoide', region: 'neck' },
  { id: 'pescoco', label: 'Partes moles do pescoço e paragânglios', region: 'neck' },
  { id: 'pulmao', label: 'Pulmão', region: 'thorax' },
  { id: 'pleura', label: 'Pleura', region: 'thorax' },
  { id: 'mediastino', label: 'Mediastino e timo', region: 'thorax' },
  { id: 'coracao', label: 'Coração e pericárdio', region: 'thorax' },
  { id: 'esofago', label: 'Esôfago', region: 'thorax' },
  { id: 'mama', label: 'Mama', region: 'breast' },
  { id: 'estomago', label: 'Estômago', region: 'abdomen' },
  { id: 'intestino-delgado', label: 'Intestino delgado e ampola', region: 'abdomen' },
  { id: 'colon-reto', label: 'Cólon e reto', region: 'abdomen' },
  { id: 'apendice', label: 'Apêndice', region: 'abdomen' },
  { id: 'anus', label: 'Ânus e canal anal', region: 'abdomen' },
  { id: 'figado', label: 'Fígado', region: 'abdomen' },
  { id: 'vias-biliares', label: 'Vesícula e vias biliares', region: 'abdomen' },
  { id: 'pancreas', label: 'Pâncreas', region: 'abdomen' },
  { id: 'peritoneo', label: 'Peritônio, omento e mesentério', region: 'abdomen' },
  { id: 'retroperitoneo', label: 'Retroperitônio', region: 'abdomen' },
  { id: 'rim', label: 'Rim', region: 'abdomen' },
  { id: 'adrenal', label: 'Adrenal', region: 'abdomen' },
  { id: 'ovario', label: 'Ovário', region: 'pelvis' },
  { id: 'tuba', label: 'Tuba uterina e ligamento largo', region: 'pelvis' },
  { id: 'utero', label: 'Corpo uterino', region: 'pelvis' },
  { id: 'colo', label: 'Colo uterino', region: 'pelvis' },
  { id: 'vulva-vagina', label: 'Vulva e vagina', region: 'pelvis' },
  { id: 'placenta', label: 'Placenta e doença trofoblástica', region: 'pelvis' },
  { id: 'prostata', label: 'Próstata e vesículas seminais', region: 'pelvis' },
  { id: 'bexiga', label: 'Bexiga, ureter e pelve renal', region: 'pelvis' },
  { id: 'testiculo', label: 'Testículo e paratestículo', region: 'pelvis' },
  { id: 'penis', label: 'Pênis e uretra', region: 'pelvis' },
  { id: 'pele', label: 'Pele e subcutâneo', region: 'skin' },
  { id: 'osso', label: 'Osso', region: 'bone' },
  { id: 'partes-moles', label: 'Partes moles (tronco e membros)', region: 'bone' },
  { id: 'articulacao', label: 'Articulação, tendão e sinóvia', region: 'bone' },
  { id: 'linfonodo', label: 'Linfonodo', region: 'hemato' },
  { id: 'medula-ossea', label: 'Medula óssea', region: 'hemato' },
  { id: 'baco', label: 'Baço', region: 'hemato' },
]

/* ---- Morfologia: tipo celular, arquitetura, achados ------------------------ */

export type MorphGroup = 'cell' | 'architecture' | 'feature'

export interface Morph {
  id: string
  label: string
  group: MorphGroup
}

export const CELLS: Morph[] = [
  { id: 'epitelioide', label: 'Epitelioide (poligonais, coesas)', group: 'cell' },
  { id: 'glandular', label: 'Glandular / colunar', group: 'cell' },
  { id: 'escamoso', label: 'Escamoso (pontes, queratina)', group: 'cell' },
  { id: 'urotelial', label: 'Urotelial', group: 'cell' },
  { id: 'fusocelular', label: 'Fusocelular', group: 'cell' },
  { id: 'pequenas-redondas', label: 'Pequenas redondas azuis', group: 'cell' },
  { id: 'claras', label: 'Células claras', group: 'cell' },
  { id: 'pleomorfico', label: 'Pleomórfico / anaplásico', group: 'cell' },
  { id: 'gigantes', label: 'Células gigantes multinucleadas', group: 'cell' },
  { id: 'rabdoide', label: 'Rabdoide', group: 'cell' },
  { id: 'plasmocitoide', label: 'Plasmocitoide', group: 'cell' },
  { id: 'oncocitico', label: 'Oncocítico / eosinofílico granular', group: 'cell' },
  { id: 'anel-sinete', label: 'Anel de sinete / mucinoso', group: 'cell' },
  { id: 'basaloide', label: 'Basaloide', group: 'cell' },
  { id: 'linfoide-grandes', label: 'Grandes discoesas (tipo linfoma)', group: 'cell' },
  { id: 'linfoide-pequenas', label: 'Pequenas linfoides maduras', group: 'cell' },
  { id: 'bifasico', label: 'Bifásico (epitelial + fusocelular)', group: 'cell' },
  { id: 'blastematoso', label: 'Blastematoso / embrionário', group: 'cell' },
  { id: 'neuroendocrino', label: 'Neuroendócrino (sal e pimenta)', group: 'cell' },
  { id: 'hepatocitoide', label: 'Hepatocitoide', group: 'cell' },
  { id: 'adipocitico', label: 'Adipocítico', group: 'cell' },
  { id: 'vasoformativo', label: 'Vasoformativo (canais, fendas)', group: 'cell' },
  { id: 'cartilaginoso', label: 'Cartilaginoso (lacunas)', group: 'cell' },
  { id: 'osteoblastico', label: 'Osteoblástico', group: 'cell' },
  { id: 'histiocitoide', label: 'Histiocitoide / xantomatoso', group: 'cell' },
  { id: 'mioide', label: 'Mioide (eosinofílico fibrilar)', group: 'cell' },
  { id: 'trofoblastico', label: 'Trofoblástico', group: 'cell' },
  { id: 'sincicial', label: 'Sincicial (limites indistintos)', group: 'cell' },
  { id: 'estreladas', label: 'Estreladas em matriz frouxa', group: 'cell' },
]

export const ARCHITECTURES: Morph[] = [
  { id: 'ninhos', label: 'Ninhos e cordões sólidos', group: 'architecture' },
  { id: 'lencois', label: 'Lençóis difusos', group: 'architecture' },
  { id: 'glandulas', label: 'Glândulas e túbulos', group: 'architecture' },
  { id: 'papilar', label: 'Papilar', group: 'architecture' },
  { id: 'micropapilar', label: 'Micropapilar', group: 'architecture' },
  { id: 'cribriforme', label: 'Cribriforme', group: 'architecture' },
  { id: 'trabecular', label: 'Trabecular / cordonal', group: 'architecture' },
  { id: 'fasciculos', label: 'Fascículos', group: 'architecture' },
  { id: 'storiforme', label: 'Estoriforme', group: 'architecture' },
  { id: 'hemangiopericitoma', label: 'Vasos em galhada (HPC-símile)', group: 'architecture' },
  { id: 'organoide', label: 'Organoide / zellballen', group: 'architecture' },
  { id: 'folicular', label: 'Folicular', group: 'architecture' },
  { id: 'cistico', label: 'Cístico', group: 'architecture' },
  { id: 'alveolar', label: 'Alveolar', group: 'architecture' },
  { id: 'rosetas', label: 'Rosetas / pseudorrosetas', group: 'architecture' },
  { id: 'palicada', label: 'Paliçada nuclear', group: 'architecture' },
  { id: 'plexiforme', label: 'Plexiforme', group: 'architecture' },
  { id: 'pseudopapilar', label: 'Perivascular / pseudopapilar', group: 'architecture' },
  { id: 'fila-indiana', label: 'Fila indiana / células isoladas', group: 'architecture' },
  { id: 'lobular', label: 'Lobular', group: 'architecture' },
  { id: 'nodular', label: 'Nodular (folículos neoplásicos)', group: 'architecture' },
  { id: 'infiltrativo', label: 'Infiltrativo entre estruturas normais', group: 'architecture' },
]

export const FEATURES: Morph[] = [
  { id: 'necrose', label: 'Necrose (geográfica ou comedo)', group: 'feature' },
  { id: 'mitoses-raras', label: 'Mitoses raras (≤ 2 por 2 mm²)', group: 'feature' },
  { id: 'mitoses-moderadas', label: 'Mitoses moderadas (3 a 10 por 2 mm²)', group: 'feature' },
  { id: 'mitoses-altas', label: 'Mitoses numerosas (> 10 por 2 mm²) ou atípicas', group: 'feature' },
  { id: 'mucina', label: 'Mucina intra ou extracelular', group: 'feature' },
  { id: 'queratinizacao', label: 'Queratinização / pérolas córneas', group: 'feature' },
  { id: 'melanina', label: 'Pigmento melânico', group: 'feature' },
  { id: 'psamomas', label: 'Corpos psamomatosos', group: 'feature' },
  { id: 'hialinizacao', label: 'Estroma hialinizado / colágeno esferoide', group: 'feature' },
  { id: 'calcificacao', label: 'Calcificação / ossificação', group: 'feature' },
  { id: 'hemorragia', label: 'Hemorragia, lagos de sangue, hemossiderina', group: 'feature' },
  { id: 'linfoide', label: 'Infiltrado linfoide denso / linfoepitelial', group: 'feature' },
  { id: 'eosinofilos', label: 'Eosinófilos abundantes', group: 'feature' },
  { id: 'plasmocitos', label: 'Plasmócitos abundantes', group: 'feature' },
  { id: 'nucleolo', label: 'Nucléolo proeminente', group: 'feature' },
  { id: 'sulcos-inclusoes', label: 'Sulcos e pseudoinclusões nucleares', group: 'feature' },
  { id: 'vacuolos-lipidicos', label: 'Vacúolos lipídicos / lipoblastos', group: 'feature' },
  { id: 'glicogenio', label: 'Glicogênio (PAS+, diastase-lábil)', group: 'feature' },
  { id: 'estroma-mixoide', label: 'Matriz mixoide', group: 'feature' },
  { id: 'condroide', label: 'Matriz condroide', group: 'feature' },
  { id: 'osteoide', label: 'Osteoide', group: 'feature' },
  { id: 'gigantes-osteoclasticas', label: 'Células gigantes osteoclásticas', group: 'feature' },
  { id: 'coloide', label: 'Coloide', group: 'feature' },
  { id: 'schiller-duval', label: 'Corpos de Schiller-Duval', group: 'feature' },
  { id: 'call-exner', label: 'Corpos de Call-Exner / núcleo em grão de café', group: 'feature' },
  { id: 'desmoplasia', label: 'Estroma desmoplásico', group: 'feature' },
  { id: 'granulomas', label: 'Granulomas', group: 'feature' },
  { id: 'emperipolese', label: 'Emperipolese', group: 'feature' },
  { id: 'reed-sternberg', label: 'Células de Reed-Sternberg / Hodgkin', group: 'feature' },
  { id: 'tachinha', label: 'Células em tachinha (hobnail)', group: 'feature' },
  { id: 'globulos-hialinos', label: 'Glóbulos hialinos', group: 'feature' },
  { id: 'cristais-reinke', label: 'Cristais de Reinke', group: 'feature' },
  { id: 'estriacoes', label: 'Estriações cruzadas / rabdomioblastos', group: 'feature' },
  { id: 'perineural', label: 'Invasão perineural', group: 'feature' },
  { id: 'precursor', label: 'Lesão precursora adjacente (in situ, displasia, nevo)', group: 'feature' },
  { id: 'amiloide', label: 'Amiloide', group: 'feature' },
  { id: 'corpos-apoptoticos', label: 'Corpos apoptóticos / céu estrelado', group: 'feature' },
  { id: 'vasos-espessos', label: 'Vasos de parede espessa / hialinizados', group: 'feature' },
]

export const MORPHS: Morph[] = [...CELLS, ...ARCHITECTURES, ...FEATURES]

/* ---- Idade e sexo ------------------------------------------------------------- */

export type AgeBand = 'crianca' | 'jovem' | 'adulto' | 'idoso'

export const AGE_BANDS: { id: AgeBand; label: string }[] = [
  { id: 'crianca', label: 'Criança (0 a 14)' },
  { id: 'jovem', label: 'Jovem (15 a 39)' },
  { id: 'adulto', label: 'Adulto (40 a 64)' },
  { id: 'idoso', label: 'Idoso (65+)' },
]

export type Sex = 'f' | 'm'

/* ---- Marcadores ---------------------------------------------------------------- */

export type MarkerGroup =
  | 'epitelial'
  | 'linhagem'
  | 'neuroendocrino'
  | 'melanocitico'
  | 'mesenquimal'
  | 'hemato'
  | 'germinativo'
  | 'cordao-sexual'
  | 'hormonio'
  | 'molecular'
  | 'outros'

export const MARKER_GROUPS: { id: MarkerGroup; label: string }[] = [
  { id: 'epitelial', label: 'Queratinas e epiteliais' },
  { id: 'linhagem', label: 'Linhagem e sítio de origem' },
  { id: 'neuroendocrino', label: 'Neuroendócrinos' },
  { id: 'melanocitico', label: 'Melanocíticos' },
  { id: 'mesenquimal', label: 'Mesenquimais' },
  { id: 'hemato', label: 'Hematolinfoides' },
  { id: 'germinativo', label: 'Germinativos e trofoblásticos' },
  { id: 'cordao-sexual', label: 'Cordão sexual e esteroidogênicos' },
  { id: 'hormonio', label: 'Hormônios e produtos' },
  { id: 'molecular', label: 'Substitutos moleculares e perdas' },
  { id: 'outros', label: 'Proliferação e outros' },
]

/**
 * Padrão de marcação: N nuclear, C citoplasmático, M membranoso, NC nuclear
 * e citoplasmático, CM citoplasmático e membranoso, dot paranuclear
 * ("dot-like"), perda (o "positivo" é a perda de expressão), var variável.
 */
export type Pattern = 'N' | 'C' | 'M' | 'NC' | 'CM' | 'dot' | 'perda' | 'var'

export const PATTERN_LABELS: Record<Pattern, string> = {
  N: 'nuclear',
  C: 'citoplasmático',
  M: 'membranoso',
  NC: 'nuclear e citoplasmático',
  CM: 'citoplasmático e membranoso',
  dot: 'paranuclear (dot-like)',
  perda: 'perda de expressão',
  var: 'variável',
}

export interface Marker {
  id: string
  label: string
  aka?: string[]
  group: MarkerGroup
  /** Padrão esperado quando positivo. */
  pattern: Pattern
  /**
   * Como ler o resultado. Para a maioria é "Positivo/Negativo"; para os de
   * perda (INI1, SDHB, MMR) é "Perdido/Retido"; para p53 é "Aberrante/
   * Selvagem"; para p16 é "Em bloco/Negativo ou focal". A porcentagem de
   * cada tumor é sempre a frequência do primeiro rótulo.
   */
  readout?: [positive: string, negative: string]
  /** O que marca, numa linha. */
  hint: string
}

export const MARKERS: Marker[] = [
  // Queratinas e epiteliais
  { id: 'ae1ae3', label: 'AE1/AE3', aka: ['pan-queratina', 'pancitoqueratina'], group: 'epitelial', pattern: 'C', hint: 'Coquetel de queratinas: epitelial em geral; também mesotelioma, sarcoma sinovial, epitelioide, alguns melanomas e sarcomas.' },
  { id: 'cam52', label: 'CAM5.2', aka: ['CK8/18'], group: 'epitelial', pattern: 'C', hint: 'Queratinas de baixo peso (8/18): adenocarcinomas, hepatocelular, neuroendócrinos; fraca em escamosos.' },
  { id: 'ck7', label: 'CK7', group: 'epitelial', pattern: 'C', hint: 'Pulmão, mama, ovário seroso, endométrio, pancreatobiliar, urotélio, salivares; negativa em cólon, hepatocelular, rim claras, próstata.' },
  { id: 'ck20', label: 'CK20', group: 'epitelial', pattern: 'C', hint: 'Cólon, mucinoso ovariano, urotélio (umbrella), Merkel (dot); negativa em pulmão, mama, endométrio.' },
  { id: 'ck56', label: 'CK5/6', group: 'epitelial', pattern: 'C', hint: 'Escamoso, basal, mioepitelial, mesotelial, urotelial.' },
  { id: 'ck903', label: 'CK903 (34βE12)', aka: ['HMWCK', 'queratina de alto peso'], group: 'epitelial', pattern: 'C', hint: 'Alto peso: escamoso, basal, células basais prostáticas, urotélio.' },
  { id: 'ck17', label: 'CK17', group: 'epitelial', pattern: 'C', hint: 'Escamoso, basal, pancreatobiliar; ajuda em CEC vs adenocarcinoma e em ampola.' },
  { id: 'ck19', label: 'CK19', group: 'epitelial', pattern: 'C', hint: 'Ductos biliares e pancreáticos, carcinoma papilífero de tireoide, HCC de progenitor; negativa em hepatócitos normais.' },
  { id: 'ck14', label: 'CK14', group: 'epitelial', pattern: 'C', hint: 'Basal e escamosa; mioepitélio.' },
  { id: 'ema', label: 'EMA', aka: ['MUC1'], group: 'epitelial', pattern: 'CM', hint: 'Epitelial ampla; também meningioma, perineurioma, plasmócitos, ALCL, sarcoma epitelioide, sinovial.' },
  { id: 'p63', label: 'p63', group: 'epitelial', pattern: 'N', hint: 'Escamoso, basal, mioepitelial, urotelial, trofoblasto; positiva em alguns linfomas e sarcomas.' },
  { id: 'p40', label: 'p40', aka: ['ΔNp63'], group: 'epitelial', pattern: 'N', hint: 'Escamoso e basal; mais específica que p63 (negativa em adenocarcinomas e linfomas).' },
  { id: 'berep4', label: 'BerEP4', aka: ['EpCAM'], group: 'epitelial', pattern: 'M', hint: 'Adenocarcinomas e carcinoma basocelular; negativa em mesotelioma e CEC.' },
  { id: 'moc31', label: 'MOC-31', group: 'epitelial', pattern: 'M', hint: 'Adenocarcinoma vs mesotelioma (positiva no adenocarcinoma) e vs hepatocelular.' },
  { id: 'claudina4', label: 'Claudina-4', group: 'epitelial', pattern: 'M', hint: 'Carcinoma vs mesotelioma e vs sarcoma: positiva quase só em carcinomas.' },
  { id: 'cea', label: 'CEA', aka: ['CEA policlonal', 'CEA monoclonal'], group: 'epitelial', pattern: 'CM', hint: 'Adenocarcinomas GI, pulmão, medular de tireoide; canalicular no hepatocelular (policlonal).' },
  { id: 'ecaderina', label: 'E-caderina', group: 'epitelial', pattern: 'M', hint: 'Membranosa em epitélios; perdida no carcinoma lobular e no gástrico difuso.' },
  { id: 'p120', label: 'p120 catenina', group: 'epitelial', pattern: 'M', hint: 'Membranosa no ductal; citoplasmática no lobular (redistribui quando E-caderina é perdida).' },
  { id: 'muc5ac', label: 'MUC5AC', group: 'epitelial', pattern: 'C', hint: 'Mucina gástrica foveolar: pancreatobiliar, gástrico, mucinoso pulmonar e ovariano.' },
  { id: 'muc6', label: 'MUC6', group: 'epitelial', pattern: 'C', hint: 'Mucina pilórica e de glândulas profundas: adenocarcinoma endocervical de tipo gástrico, pancreatobiliar, IPMN gástrico.' },
  { id: 'muc2', label: 'MUC2', group: 'epitelial', pattern: 'C', hint: 'Mucina intestinal (caliciformes): colorretal, mucinoso.' },
  { id: 'gcdfp15', label: 'GCDFP-15', group: 'epitelial', pattern: 'C', hint: 'Apócrino: mama, salivares, sudoríparas.' },
  { id: 'mamaglobina', label: 'Mamaglobina', group: 'epitelial', pattern: 'C', hint: 'Mama; também carcinoma secretor salivar e endométrio.' },
  { id: 'mesotelina', label: 'Mesotelina', group: 'epitelial', pattern: 'M', hint: 'Mesotelioma, pancreatobiliar, seroso ovariano.' },
  { id: 'calretinina', label: 'Calretinina', group: 'epitelial', pattern: 'NC', hint: 'Mesotélio, cordão sexual, adrenocortical; também sarcoma sinovial e alguns CEC.' },
  { id: 'd240', label: 'D2-40', aka: ['podoplanina'], group: 'epitelial', pattern: 'M', hint: 'Mesotélio (vs adenocarcinoma), endotélio linfático (linfangioma, Kaposi), seminoma, hemangioblastoma.' },
  { id: 'wt1', label: 'WT1', group: 'epitelial', pattern: 'N', hint: 'Nuclear: mesotélio, seroso ovariano/tubário, cordão sexual, Wilms, DSRCT; citoplasmática em vasculares.' },
  { id: 'hbme1', label: 'HBME-1', group: 'epitelial', pattern: 'M', hint: 'Mesotelioma e carcinoma papilífero de tireoide.' },
  { id: 'bap1', label: 'BAP1', group: 'epitelial', pattern: 'perda', readout: ['Perdido', 'Retido'], hint: 'Perda nuclear: mesotelioma (vs hiperplasia), melanoma uveal, RCC, tumores BAP1.' },
  { id: 'mtap', label: 'MTAP', group: 'epitelial', pattern: 'perda', readout: ['Perdido', 'Retido'], hint: 'Perda citoplasmática substitui deleção de CDKN2A: mesotelioma.' },
  { id: 'uroplaquina', label: 'Uroplaquina II', aka: ['UPII', 'uroplaquina III'], group: 'epitelial', pattern: 'CM', hint: 'Urotelial (específica, sensibilidade moderada).' },
  { id: 'gata3', label: 'GATA3', group: 'linhagem', pattern: 'N', hint: 'Urotélio, mama, paratireoide, trofoblasto, anexos cutâneos, paraganglioma; também alguns CEC e mesoteliomas.' },
  { id: 'ttf1', label: 'TTF-1', group: 'linhagem', pattern: 'N', hint: 'Pulmão (adenocarcinoma, pequenas células) e tireoide; clone SPT24 mais sensível e menos específico que 8G7G3/1.' },
  { id: 'napsina', label: 'Napsina A', group: 'linhagem', pattern: 'C', hint: 'Adenocarcinoma pulmonar; também células claras renal e ovariano/endometrial.' },
  { id: 'cdx2', label: 'CDX2', group: 'linhagem', pattern: 'N', hint: 'Intestinal: colorretal, delgado, ampola, mucinoso; também NET de intestino médio e alguns gástricos e pancreatobiliares.' },
  { id: 'satb2', label: 'SATB2', group: 'linhagem', pattern: 'N', hint: 'Colorretal e apêndice (com CDX2); osteoblástico; NET de reto.' },
  { id: 'vilina', label: 'Vilina', group: 'linhagem', pattern: 'CM', hint: 'Borda em escova: intestinal, também Merkel e endométrio.' },
  { id: 'pax8', label: 'PAX8', group: 'linhagem', pattern: 'N', hint: 'Rim, mülleriano (ovário, endométrio, colo), tireoide, timo (policlonal); negativa em mama, pulmão, GI.' },
  { id: 'pax2', label: 'PAX2', group: 'linhagem', pattern: 'N', hint: 'Rim e mülleriano; perdida em neoplasias endometriais.' },
  { id: 'nkx31', label: 'NKX3.1', group: 'linhagem', pattern: 'N', hint: 'Próstata; também lobular de mama e alguns salivares.' },
  { id: 'psa', label: 'PSA', group: 'linhagem', pattern: 'C', hint: 'Próstata; perde em alto grau e após terapia.' },
  { id: 'psap', label: 'PSAP', group: 'linhagem', pattern: 'C', hint: 'Fosfatase ácida prostática; também NET retal.' },
  { id: 'p501s', label: 'P501S (prosteína)', group: 'linhagem', pattern: 'C', hint: 'Próstata, padrão granular perinuclear.' },
  { id: 'psma', label: 'PSMA', group: 'linhagem', pattern: 'CM', hint: 'Próstata; endotélio de neovasos em outros tumores.' },
  { id: 'amacr', label: 'AMACR (P504S)', group: 'linhagem', pattern: 'C', hint: 'Adenocarcinoma prostático, RCC papilar, endometrioide/claras.' },
  { id: 'ar', label: 'Receptor de androgênio (AR)', group: 'linhagem', pattern: 'N', hint: 'Próstata, mama apócrina, carcinoma de ductos salivares, sebáceo.' },
  { id: 'er', label: 'Receptor de estrogênio (ER)', group: 'linhagem', pattern: 'N', hint: 'Mama e mülleriano (endométrio, ovário, colo); útil contra pulmão e GI, que são negativos.' },
  { id: 'pr', label: 'Receptor de progesterona (PR)', group: 'linhagem', pattern: 'N', hint: 'Mama, mülleriano, meningioma, tumor sólido pseudopapilar, estroma endometrial.' },
  { id: 'her2', label: 'HER2', group: 'linhagem', pattern: 'M', readout: ['3+ (superexpresso)', 'Negativo ou equívoco'], hint: 'Mama, gástrico, ductos salivares, urotelial, seroso endometrial.' },
  { id: 'trps1', label: 'TRPS1', group: 'linhagem', pattern: 'N', hint: 'Mama (incluindo triplo-negativo e metaplásico); também salivar e alguns sarcomas.' },
  { id: 'sox10', label: 'SOX10', group: 'melanocitico', pattern: 'N', hint: 'Melanócitos, Schwann, mioepitélio, salivares (acinar, adenoide cístico), mama triplo-negativa.' },
  { id: 'tireoglobulina', label: 'Tireoglobulina', group: 'linhagem', pattern: 'C', hint: 'Tireoide folicular e papilífero; negativa em medular e anaplásico.' },
  { id: 'calcitonina', label: 'Calcitonina', group: 'hormonio', pattern: 'C', hint: 'Carcinoma medular de tireoide.' },
  { id: 'pth', label: 'PTH', group: 'hormonio', pattern: 'C', hint: 'Paratireoide.' },
  { id: 'heppar1', label: 'HepPar-1', group: 'linhagem', pattern: 'C', hint: 'Hepatocelular; também hepatoide, gástrico, adenocarcinoma pulmonar raro.' },
  { id: 'arginase', label: 'Arginase-1', group: 'linhagem', pattern: 'NC', hint: 'Hepatocelular (mais sensível que HepPar-1 em pouco diferenciados).' },
  { id: 'glipicano3', label: 'Glipicano-3', group: 'linhagem', pattern: 'CM', hint: 'HCC (não em adenoma/cirrose), saco vitelino, coriocarcinoma, hepatoblastoma, alguns CEC e melanomas.' },
  { id: 'afp', label: 'AFP', group: 'germinativo', pattern: 'C', hint: 'Saco vitelino, HCC, hepatoblastoma, hepatoide.' },
  { id: 'cd10', label: 'CD10', group: 'linhagem', pattern: 'M', hint: 'RCC claras, HCC (canalicular), estroma endometrial, folicular/Burkitt, mioepitélio, tumor sólido pseudopapilar.' },
  { id: 'caix', label: 'CA-IX', aka: ['anidrase carbônica IX'], group: 'linhagem', pattern: 'M', hint: 'RCC de células claras (padrão em caixa, difuso); focal perinecrótica em outros.' },
  { id: 'catepsinak', label: 'Catepsina K', group: 'linhagem', pattern: 'C', hint: 'PEComa/angiomiolipoma, RCC de translocação, tumor de células gigantes.' },
  { id: 'tfe3', label: 'TFE3', group: 'molecular', pattern: 'N', hint: 'Forte nuclear: RCC de translocação Xp11, sarcoma alveolar de partes moles, PEComa TFE3.' },
  { id: 'tfeb', label: 'TFEB', group: 'molecular', pattern: 'N', hint: 'RCC t(6;11).' },
  { id: 'hnf1b', label: 'HNF1β', group: 'linhagem', pattern: 'N', hint: 'Carcinoma de células claras ovariano/endometrial; também saco vitelino e renal.' },
  { id: 'inibina', label: 'Inibina α', group: 'cordao-sexual', pattern: 'C', hint: 'Cordão sexual (granulosa, Sertoli, Leydig), adrenocortical, trofoblasto.' },
  { id: 'sf1', label: 'SF-1', group: 'cordao-sexual', pattern: 'N', hint: 'Cordão sexual, adrenocortical, gonadotrofos hipofisários.' },
  { id: 'foxl2', label: 'FOXL2', group: 'cordao-sexual', pattern: 'N', hint: 'Granulosa e outros cordão sexual (proteína), independente da mutação.' },
  { id: 'melana', label: 'Melan-A (MART-1)', aka: ['A103'], group: 'melanocitico', pattern: 'C', hint: 'Melanócitos; A103 também marca adrenocortical, Leydig, PEComa.' },
  { id: 'hmb45', label: 'HMB-45', group: 'melanocitico', pattern: 'C', hint: 'Melanoma (perde em desmoplásico), nevo azul, PEComa/angiomiolipoma, sarcoma de células claras.' },
  { id: 's100', label: 'S100', group: 'melanocitico', pattern: 'NC', hint: 'Melanócitos, Schwann, Langerhans, cartilagem, adipócitos, mioepitélio, dendríticas interdigitantes.' },
  { id: 'mitf', label: 'MITF', group: 'melanocitico', pattern: 'N', hint: 'Melanócitos, PEComa; também histiócitos e mastócitos (cautela).' },
  { id: 'prame', label: 'PRAME', group: 'melanocitico', pattern: 'N', hint: 'Difusa em melanoma (não em nevos); também seminoma, sarcoma sinovial, alguns carcinomas.' },
  { id: 'tirosinase', label: 'Tirosinase', group: 'melanocitico', pattern: 'C', hint: 'Melanocítico.' },
  // Neuroendócrinos
  { id: 'cromogranina', label: 'Cromogranina A', group: 'neuroendocrino', pattern: 'C', hint: 'Grânulos densos: NET bem diferenciados, feocromocitoma; fraca/focal em pequenas células.' },
  { id: 'sinaptofisina', label: 'Sinaptofisina', group: 'neuroendocrino', pattern: 'C', hint: 'NE em geral, incluindo pequenas células e neuronal; também adrenocortical e alguns carcinomas.' },
  { id: 'insm1', label: 'INSM1', group: 'neuroendocrino', pattern: 'N', hint: 'NE nuclear, sensível e específica; neuroblastoma, Merkel, pequenas células.' },
  { id: 'cd56', label: 'CD56 (NCAM)', group: 'neuroendocrino', pattern: 'M', hint: 'NE, NK, neural, alguns carcinomas e mielomas; pouco específica.' },
  { id: 'nse', label: 'NSE', group: 'neuroendocrino', pattern: 'C', hint: 'Pouco específica; uso histórico.' },
  { id: 'cd57', label: 'CD57 (Leu-7)', group: 'neuroendocrino', pattern: 'CM', hint: 'NE, Schwann, NK/T, LGL; folículo linfoide.' },
  { id: 'nf', label: 'Neurofilamento', group: 'neuroendocrino', pattern: 'C', hint: 'Neuronal; dot paranuclear em Merkel.' },
  { id: 'neun', label: 'NeuN', group: 'neuroendocrino', pattern: 'N', hint: 'Neurônios: neurocitoma, ganglioglioma.' },
  { id: 'phox2b', label: 'PHOX2B', group: 'neuroendocrino', pattern: 'N', hint: 'Neuroblastoma, feocromocitoma/paraganglioma.' },
  { id: 'th', label: 'Tirosina hidroxilase', group: 'neuroendocrino', pattern: 'C', hint: 'Feocromocitoma, paraganglioma, neuroblastoma.' },
  { id: 'isl1', label: 'ISL1', group: 'neuroendocrino', pattern: 'N', hint: 'NET pancreático e de reto; também pulmão pequenas células.' },
  { id: 'pdx1', label: 'PDX1', group: 'neuroendocrino', pattern: 'N', hint: 'NET pancreático e duodenal.' },
  { id: 'sstr2', label: 'SSTR2A', group: 'neuroendocrino', pattern: 'M', hint: 'NET bem diferenciados, meningioma.' },
  // Mesenquimais
  { id: 'vimentina', label: 'Vimentina', group: 'mesenquimal', pattern: 'C', hint: 'Mesenquimal, melanoma, linfoma, alguns carcinomas (rim, endométrio, tireoide); pouco específica.' },
  { id: 'desmina', label: 'Desmina', group: 'mesenquimal', pattern: 'C', hint: 'Músculo liso e esquelético, miofibroblastos alguns, DSRCT (dot), mesotelioma reativo.' },
  { id: 'sma', label: 'Actina de músculo liso (SMA)', aka: ['1A4', 'α-SMA'], group: 'mesenquimal', pattern: 'C', hint: 'Músculo liso, miofibroblastos, mioepitélio, pericitos, tumor glômico.' },
  { id: 'msa', label: 'Actina muscular específica (HHF35)', group: 'mesenquimal', pattern: 'C', hint: 'Músculo liso e esquelético.' },
  { id: 'caldesmon', label: 'h-caldesmon', group: 'mesenquimal', pattern: 'C', hint: 'Músculo liso verdadeiro e GIST; negativa em miofibroblastos.' },
  { id: 'calponina', label: 'Calponina', group: 'mesenquimal', pattern: 'C', hint: 'Músculo liso, mioepitélio, miofibroblastos.' },
  { id: 'smmhc', label: 'SMMHC (miosina de cadeia pesada)', group: 'mesenquimal', pattern: 'C', hint: 'Mioepitélio mamário (mais específica que SMA).' },
  { id: 'miogenina', label: 'Miogenina (MYF4)', group: 'mesenquimal', pattern: 'N', hint: 'Rabdomiossarcoma (difusa no alveolar); rabdomioblastos em outros tumores.' },
  { id: 'myod1', label: 'MyoD1', group: 'mesenquimal', pattern: 'N', hint: 'Rabdomiossarcoma (nuclear; ignore citoplasmática).' },
  { id: 'cd34', label: 'CD34', group: 'mesenquimal', pattern: 'M', hint: 'Endotélio, TFS, DFSP, GIST, lipomatosos, sarcoma epitelioide, blastos.' },
  { id: 'cd31', label: 'CD31', group: 'mesenquimal', pattern: 'M', hint: 'Endotélio (também histiócitos e plasmócitos, cautela).' },
  { id: 'erg', label: 'ERG', group: 'mesenquimal', pattern: 'N', hint: 'Endotélio (vasculares), próstata com fusão ERG, alguns Ewing e mieloides.' },
  { id: 'fli1', label: 'FLI1', group: 'mesenquimal', pattern: 'N', hint: 'Endotélio, Ewing, linfócitos.' },
  { id: 'fviii', label: 'Fator VIII (vWF)', group: 'mesenquimal', pattern: 'C', hint: 'Endotélio (menos sensível que CD31/ERG).' },
  { id: 'hhv8', label: 'HHV-8 (LANA-1)', group: 'mesenquimal', pattern: 'N', hint: 'Sarcoma de Kaposi, linfoma primário de efusão, Castleman multicêntrico.' },
  { id: 'camta1', label: 'CAMTA1', group: 'molecular', pattern: 'N', hint: 'Hemangioendotelioma epitelioide (fusão WWTR1-CAMTA1).' },
  { id: 'fosb', label: 'FOSB', group: 'molecular', pattern: 'N', hint: 'Hemangioma epitelioide, hemangioendotelioma pseudomiogênico.' },
  { id: 'cd99', label: 'CD99', group: 'mesenquimal', pattern: 'M', hint: 'Membranosa forte em Ewing; também linfoblástico, sinovial, TFS, meningioma, mesenquimal condrossarcoma.' },
  { id: 'nkx22', label: 'NKX2.2', group: 'molecular', pattern: 'N', hint: 'Ewing (sensível), também NE, olfatório, mesenquimal condrossarcoma.' },
  { id: 'tle1', label: 'TLE1', group: 'molecular', pattern: 'N', hint: 'Sarcoma sinovial (difusa forte); fraca em MPNST e TFS.' },
  { id: 'ss18ssx', label: 'SS18-SSX', group: 'molecular', pattern: 'N', hint: 'Anticorpo de fusão: sarcoma sinovial (específico).' },
  { id: 'stat6', label: 'STAT6', group: 'molecular', pattern: 'N', hint: 'Tumor fibroso solitário (NAB2-STAT6); também alguns lipossarcomas desdiferenciados.' },
  { id: 'betacatenina', label: 'β-catenina (nuclear)', group: 'molecular', pattern: 'N', readout: ['Nuclear', 'Só membranosa'], hint: 'Nuclear: fibromatose desmoide, tumor sólido pseudopapilar, craniofaringioma adamantinomatoso, hepatoblastoma, endometrioide, pilomatricoma.' },
  { id: 'muc4', label: 'MUC4', group: 'molecular', pattern: 'C', hint: 'Sarcoma fibromixoide de baixo grau e sarcoma epitelioide esclerosante.' },
  { id: 'mdm2', label: 'MDM2', group: 'molecular', pattern: 'N', hint: 'Lipossarcoma bem diferenciado/desdiferenciado (amplificação; confirme por FISH), osteossarcoma parosteal, sarcoma intimal.' },
  { id: 'cdk4', label: 'CDK4', group: 'molecular', pattern: 'N', hint: 'Junto com MDM2 nos lipossarcomas bem diferenciado/desdiferenciado.' },
  { id: 'alk', label: 'ALK', group: 'molecular', pattern: 'C', hint: 'Tumor miofibroblástico inflamatório, ALCL ALK+, adenocarcinoma pulmonar com rearranjo, alguns histiocíticos e Spitz.' },
  { id: 'ros1', label: 'ROS1', group: 'molecular', pattern: 'C', hint: 'Adenocarcinoma pulmonar com rearranjo; triagem para molecular.' },
  { id: 'dog1', label: 'DOG1', group: 'mesenquimal', pattern: 'CM', hint: 'GIST (inclusive KIT negativos); também acinar salivar e tumor glômico raro.' },
  { id: 'cd117', label: 'CD117 (KIT)', group: 'mesenquimal', pattern: 'CM', hint: 'GIST, seminoma, mastócitos, adenoide cístico, alguns melanomas e mieloides.' },
  { id: 'sdhb', label: 'SDHB', group: 'molecular', pattern: 'perda', readout: ['Perdido', 'Retido'], hint: 'Perda: GIST SDH-deficiente, paraganglioma/feocromocitoma SDH, RCC SDH.' },
  { id: 'fh', label: 'Fumarato hidratase (FH)', group: 'molecular', pattern: 'perda', readout: ['Perdido', 'Retido'], hint: 'Perda em RCC FH-deficiente e leiomiomas HLRCC (2SC positiva).' },
  { id: 'h3k27me3', label: 'H3K27me3', group: 'molecular', pattern: 'perda', readout: ['Perdido', 'Retido'], hint: 'Perda em MPNST (maioria dos alto grau), glioma difuso de linha média, sarcoma radioinduzido.' },
  { id: 'ini1', label: 'INI1 (SMARCB1)', group: 'molecular', pattern: 'perda', readout: ['Perdido', 'Retido'], hint: 'Perda: tumor rabdoide/ATRT, sarcoma epitelioide, medular renal, carcinoma sinonasal SMARCB1, cordoma pouco diferenciado, mioepitelial parte.' },
  { id: 'brg1', label: 'BRG1 (SMARCA4)', group: 'molecular', pattern: 'perda', readout: ['Perdido', 'Retido'], hint: 'Perda: SCCOHT, tumor torácico SMARCA4-deficiente, alguns carcinomas indiferenciados.' },
  { id: 'bcor', label: 'BCOR', group: 'molecular', pattern: 'N', hint: 'Sarcoma BCOR, sarcoma de células claras do rim, sarcoma do estroma endometrial de alto grau; também sinovial.' },
  { id: 'ccnb3', label: 'CCNB3', group: 'molecular', pattern: 'N', hint: 'Sarcoma BCOR-CCNB3.' },
  { id: 'etv4', label: 'ETV4', group: 'molecular', pattern: 'N', hint: 'Sarcoma CIC-rearranjado (com WT1).' },
  { id: 'dux4', label: 'DUX4', group: 'molecular', pattern: 'N', hint: 'Sarcoma CIC::DUX4.' },
  { id: 'rb1', label: 'RB1', group: 'molecular', pattern: 'perda', readout: ['Perdido', 'Retido'], hint: 'Perda: lipoma de células fusiformes/pleomórfico, mixofibrossarcoma parte, pequenas células, retinoblastoma.' },
  { id: 'pten', label: 'PTEN', group: 'molecular', pattern: 'perda', readout: ['Perdido', 'Retido'], hint: 'Perda em endometrioide endometrial e prostático parte.' },
  { id: 'smad4', label: 'SMAD4 (DPC4)', group: 'molecular', pattern: 'perda', readout: ['Perdido', 'Retido'], hint: 'Perda em ~55% dos adenocarcinomas pancreáticos; retido no colangiocarcinoma na maioria.' },
  { id: 'gfap', label: 'GFAP', group: 'mesenquimal', pattern: 'C', hint: 'Glial (astrocitoma, ependimoma, oligodendroglioma parte), mioepitélio, Schwann parte, condroide.' },
  { id: 'olig2', label: 'OLIG2', group: 'mesenquimal', pattern: 'N', hint: 'Glial (oligodendroglioma, astrocitoma); negativa em ependimoma e neurocitoma.' },
  { id: 'idh1', label: 'IDH1 R132H', group: 'molecular', pattern: 'C', hint: 'Astrocitoma e oligodendroglioma IDH-mutantes (a mutação mais comum).' },
  { id: 'atrx', label: 'ATRX', group: 'molecular', pattern: 'perda', readout: ['Perdido', 'Retido'], hint: 'Perda: astrocitoma IDH-mutante (retido em oligodendroglioma), NET pancreático parte.' },
  { id: 'h3k27m', label: 'H3 K27M', group: 'molecular', pattern: 'N', hint: 'Glioma difuso de linha média H3 K27-alterado.' },
  { id: 'brafv600e', label: 'BRAF V600E (VE1)', group: 'molecular', pattern: 'C', hint: 'Papilífero de tireoide, melanoma, colorretal, PXA, ganglioglioma, LCH, craniofaringioma papilar, tricoleucemia.' },
  { id: 'l1cam', label: 'L1CAM', group: 'molecular', pattern: 'M', hint: 'Ependimoma supratentorial ZFTA; endometrial de alto risco.' },
  { id: 'lin28a', label: 'LIN28A', group: 'germinativo', pattern: 'C', hint: 'ETMR, saco vitelino, carcinoma embrionário.' },
  { id: 'nf-perineurio', label: 'Claudina-1', group: 'mesenquimal', pattern: 'M', hint: 'Perineurioma (com EMA, GLUT1).' },
  { id: 'glut1', label: 'GLUT1', group: 'mesenquimal', pattern: 'M', hint: 'Perineurioma, hemangioma infantil.' },
  { id: 'braquiuria', label: 'Braquiúria', group: 'linhagem', pattern: 'N', hint: 'Cordoma (também hemangioblastoma raro).' },
  { id: 'cd68', label: 'CD68', group: 'hemato', pattern: 'C', hint: 'Histiócitos e macrófagos (também melanoma, tumor de células granulares, mieloides).' },
  { id: 'cd163', label: 'CD163', group: 'hemato', pattern: 'CM', hint: 'Macrófagos (mais específica que CD68).' },
  { id: 'fxiiia', label: 'Fator XIIIa', group: 'mesenquimal', pattern: 'C', hint: 'Dermatofibroma (dendrócitos dérmicos); negativa em DFSP.' },
  { id: 'clusterina', label: 'Clusterina', group: 'hemato', pattern: 'C', hint: 'Sarcoma de células dendríticas foliculares, ALCL.' },
  { id: 'cd21', label: 'CD21', group: 'hemato', pattern: 'M', hint: 'Células dendríticas foliculares (redes em folicular, manto; ausentes em difusos).' },
  { id: 'cd23', label: 'CD23', group: 'hemato', pattern: 'M', hint: 'LLC/SLL, dendríticas foliculares, alguns MALT.' },
  { id: 'cd35', label: 'CD35', group: 'hemato', pattern: 'M', hint: 'Células dendríticas foliculares.' },
  { id: 'cd1a', label: 'CD1a', group: 'hemato', pattern: 'M', hint: 'Langerhans, timócitos (linfoblástico T, timoma).' },
  { id: 'langerina', label: 'Langerina (CD207)', group: 'hemato', pattern: 'C', hint: 'Langerhans (grânulos de Birbeck).' },
  { id: 'cd45', label: 'CD45 (LCA)', group: 'hemato', pattern: 'M', hint: 'Hematolinfoide; negativa em Hodgkin clássico, plasmocitoma parte, ALCL parte, linfoblástico parte.' },
  { id: 'cd20', label: 'CD20', group: 'hemato', pattern: 'M', hint: 'Linfócitos B maduros; perdida após rituximabe e em plasmablástico.' },
  { id: 'pax5', label: 'PAX5', group: 'hemato', pattern: 'N', hint: 'B (inclusive Hodgkin clássico, fraca); também Merkel e pequenas células.' },
  { id: 'cd79a', label: 'CD79a', group: 'hemato', pattern: 'CM', hint: 'B (inclusive precursor e plasmócitos parte).' },
  { id: 'cd19', label: 'CD19', group: 'hemato', pattern: 'M', hint: 'B ampla.' },
  { id: 'cd3', label: 'CD3', group: 'hemato', pattern: 'CM', hint: 'T (também NK citoplasmática).' },
  { id: 'cd2', label: 'CD2', group: 'hemato', pattern: 'M', hint: 'T e NK; perda em linfomas T.' },
  { id: 'cd5', label: 'CD5', group: 'hemato', pattern: 'M', hint: 'T; aberrante em LLC/SLL e manto; timoma.' },
  { id: 'cd7', label: 'CD7', group: 'hemato', pattern: 'M', hint: 'T (perda frequente em micose fungoide e T periférico).' },
  { id: 'cd4', label: 'CD4', group: 'hemato', pattern: 'M', hint: 'T auxiliar, histiócitos, dendríticas plasmocitoides.' },
  { id: 'cd8', label: 'CD8', group: 'hemato', pattern: 'M', hint: 'T citotóxico.' },
  { id: 'bcl2', label: 'BCL2', group: 'hemato', pattern: 'C', hint: 'Folicular (vs hiperplasia), maioria dos B; negativa em Burkitt e hiperplasia folicular.' },
  { id: 'bcl6', label: 'BCL6', group: 'hemato', pattern: 'N', hint: 'Centro germinativo: folicular, DLBCL GCB, Burkitt, angioimunoblástico.' },
  { id: 'mum1', label: 'MUM1 (IRF4)', group: 'hemato', pattern: 'N', hint: 'Pós-centro germinativo: ABC, plasmócitos, Hodgkin clássico, ALCL.' },
  { id: 'cd30', label: 'CD30', group: 'hemato', pattern: 'M', hint: 'Hodgkin clássico, ALCL, carcinoma embrionário, imunoblastos.' },
  { id: 'cd15', label: 'CD15', group: 'hemato', pattern: 'M', hint: 'Reed-Sternberg, mieloide; também alguns adenocarcinomas.' },
  { id: 'ciclinad1', label: 'Ciclina D1', group: 'hemato', pattern: 'N', hint: 'Manto, tricoleucemia, mieloma parte; também histiocitoses, carcinomas e outros tumores não hematolinfoides.' },
  { id: 'sox11', label: 'SOX11', group: 'hemato', pattern: 'N', hint: 'Manto (inclusive ciclina D1 negativo); linfoblástico e Burkitt parte.' },
  { id: 'lef1', label: 'LEF1', group: 'hemato', pattern: 'N', hint: 'LLC/SLL (vs manto e marginal); T normais.' },
  { id: 'cd138', label: 'CD138 (sindecan-1)', group: 'hemato', pattern: 'M', hint: 'Plasmócitos; também muitos carcinomas (cautela).' },
  { id: 'kappa', label: 'Cadeia leve κ', group: 'hemato', pattern: 'C', hint: 'Restrição de cadeia leve em plasmócitos e linfomas B (ISH melhor).' },
  { id: 'lambda', label: 'Cadeia leve λ', group: 'hemato', pattern: 'C', hint: 'Restrição de cadeia leve.' },
  { id: 'myc', label: 'MYC', group: 'hemato', pattern: 'N', hint: '≥40% em duplo expressor; Burkitt quase 100%.' },
  { id: 'tdt', label: 'TdT', group: 'hemato', pattern: 'N', hint: 'Linfoblástico B e T, timoma (timócitos), leucemia mieloide parte.' },
  { id: 'mpo', label: 'Mieloperoxidase', group: 'hemato', pattern: 'C', hint: 'Sarcoma mieloide / leucemia mieloide.' },
  { id: 'cd33', label: 'CD33', group: 'hemato', pattern: 'M', hint: 'Mieloide.' },
  { id: 'cd43', label: 'CD43', group: 'hemato', pattern: 'M', hint: 'T, mieloide; aberrante em LLC, manto, MALT parte.' },
  { id: 'cd123', label: 'CD123', group: 'hemato', pattern: 'M', hint: 'Dendríticas plasmocitoides (BPDCN), tricoleucemia.' },
  { id: 'tcl1', label: 'TCL1', group: 'hemato', pattern: 'N', hint: 'BPDCN, T-PLL, Burkitt.' },
  { id: 'ebv', label: 'EBER (ISH) / LMP1', group: 'hemato', pattern: 'N', hint: 'EBV: nasofaríngeo, NK/T, Hodgkin parte, DLBCL EBV+, linfoepitelial, leiomiossarcoma em imunossuprimido.' },
  { id: 'granzima', label: 'Granzima B / TIA-1 / perforina', group: 'hemato', pattern: 'C', hint: 'Citotóxicos: NK/T, ALCL, T citotóxico, LGL.' },
  { id: 'pd1', label: 'PD-1 (CD279)', group: 'hemato', pattern: 'M', hint: 'T auxiliar folicular: angioimunoblástico; rosetas em Hodgkin predomínio linfocitário.' },
  { id: 'cxcl13', label: 'CXCL13', group: 'hemato', pattern: 'C', hint: 'T auxiliar folicular (angioimunoblástico).' },
  { id: 'cd25', label: 'CD25', group: 'hemato', pattern: 'M', hint: 'Mastocitose sistêmica, tricoleucemia, ATLL.' },
  { id: 'triptase', label: 'Triptase', group: 'hemato', pattern: 'C', hint: 'Mastócitos.' },
  { id: 'anexina', label: 'Anexina A1', group: 'hemato', pattern: 'C', hint: 'Tricoleucemia (específica entre B).' },
  { id: 'ighv', label: 'IgD', group: 'hemato', pattern: 'M', hint: 'Manto e LLC (IgD+); marginal negativa.' },
  { id: 'ki67', label: 'Ki-67', group: 'outros', pattern: 'N', readout: ['Alto (> 30%)', 'Baixo'], hint: 'Proliferação; graduação de NET, Burkitt ~100%, folicular baixo.' },
  { id: 'p53', label: 'p53', group: 'molecular', pattern: 'N', readout: ['Aberrante (mutado)', 'Selvagem'], hint: 'Padrão aberrante (difuso forte, nulo ou citoplasmático): seroso de alto grau ovariano e endometrial, muitos carcinomas de alto grau.' },
  { id: 'p16', label: 'p16', group: 'molecular', pattern: 'NC', readout: ['Em bloco', 'Negativo ou focal'], hint: 'Bloco: HPV de alto risco (colo, orofaringe, anus), seroso ovariano; perda em mesotelioma e melanoma parte.' },
  { id: 'mlh1', label: 'MLH1', group: 'molecular', pattern: 'perda', readout: ['Perdido', 'Retido'], hint: 'Perda (com PMS2): MSI esporádica por hipermetilação ou Lynch.' },
  { id: 'msh2', label: 'MSH2', group: 'molecular', pattern: 'perda', readout: ['Perdido', 'Retido'], hint: 'Perda (com MSH6): Lynch.' },
  { id: 'msh6', label: 'MSH6', group: 'molecular', pattern: 'perda', readout: ['Perdido', 'Retido'], hint: 'Perda isolada: Lynch ou pós-terapia.' },
  { id: 'pms2', label: 'PMS2', group: 'molecular', pattern: 'perda', readout: ['Perdido', 'Retido'], hint: 'Perda isolada: Lynch.' },
  { id: 'arid1a', label: 'ARID1A', group: 'molecular', pattern: 'perda', readout: ['Perdido', 'Retido'], hint: 'Perda: células claras e endometrioide ovariano/endometrial, gástrico parte.' },
  { id: 'p57', label: 'p57 (KIP2)', group: 'molecular', pattern: 'N', readout: ['Retido', 'Perdido'], hint: 'Perdido no citotrofoblasto e estroma viloso da mola completa; retido na parcial e em não molar.' },
  { id: 'nut', label: 'NUT', group: 'molecular', pattern: 'N', hint: 'Carcinoma NUT (rearranjo NUTM1).' },
  { id: 'pdl1', label: 'PD-L1', group: 'outros', pattern: 'M', hint: 'Preditivo, não diagnóstico; alto em Hodgkin, mediastinal primário, pulmão parte.' },
  { id: 'hcg', label: 'β-hCG', group: 'germinativo', pattern: 'C', hint: 'Sinciciotrofoblasto: coriocarcinoma; células isoladas em seminoma e outros.' },
  { id: 'hpl', label: 'hPL', group: 'germinativo', pattern: 'C', hint: 'Trofoblasto intermediário: PSTT.' },
  { id: 'oct4', label: 'OCT4 (OCT3/4)', group: 'germinativo', pattern: 'N', hint: 'Seminoma/disgerminoma/germinoma e carcinoma embrionário; negativa em saco vitelino e corio.' },
  { id: 'sall4', label: 'SALL4', group: 'germinativo', pattern: 'N', hint: 'Todos os germinativos (exceto teratoma maduro); também hepatoide, alguns gástricos e Wilms.' },
  { id: 'plap', label: 'PLAP', group: 'germinativo', pattern: 'M', hint: 'Seminoma e germinativos; histórico.' },
  { id: 'sox2', label: 'SOX2', group: 'germinativo', pattern: 'N', hint: 'Carcinoma embrionário (vs seminoma negativo); escamosos, pequenas células.' },
  { id: 'sox17', label: 'SOX17', group: 'germinativo', pattern: 'N', hint: 'Seminoma e saco vitelino (vs carcinoma embrionário negativo); também mülleriano seroso.' },
  { id: 'gh', label: 'GH', group: 'hormonio', pattern: 'C', hint: 'Somatotrofos (linhagem PIT1).' },
  { id: 'prl', label: 'Prolactina', group: 'hormonio', pattern: 'C', hint: 'Lactotrofos (padrão paranuclear Golgi).' },
  { id: 'acth', label: 'ACTH', group: 'hormonio', pattern: 'C', hint: 'Corticotrofos (linhagem TPIT).' },
  { id: 'pit1', label: 'PIT1', group: 'hormonio', pattern: 'N', hint: 'Linhagem somatotrófica, lactotrófica, tireotrófica.' },
  { id: 'tpit', label: 'TPIT', group: 'hormonio', pattern: 'N', hint: 'Linhagem corticotrófica.' },
  { id: 'insulina', label: 'Insulina / glucagon / gastrina / somatostatina', group: 'hormonio', pattern: 'C', hint: 'Hormônios de NET pancreático e GI; especifique na nota.' },
  { id: 'serotonina', label: 'Serotonina', group: 'hormonio', pattern: 'C', hint: 'NET de intestino médio (íleo, apêndice).' },
  { id: 'adipofilina', label: 'Adipofilina', group: 'outros', pattern: 'C', hint: 'Vacúolos lipídicos membranosos: carcinoma sebáceo, xantomas.' },
  { id: 'phlda1', label: 'PHLDA1', group: 'outros', pattern: 'C', hint: 'Tricoepitelioma (vs carcinoma basocelular negativo).' },
  { id: 'galectina3', label: 'Galectina-3', group: 'linhagem', pattern: 'NC', hint: 'Papilífero de tireoide (com HBME-1 e CK19).' },
  { id: 'nr4a3', label: 'NR4A3', group: 'molecular', pattern: 'N', hint: 'Carcinoma de células acinares salivar (rearranjo NR4A3).' },
  { id: 'plag1', label: 'PLAG1', group: 'molecular', pattern: 'N', hint: 'Adenoma pleomórfico e carcinoma ex-adenoma pleomórfico; lipoblastoma.' },
  { id: 'hmga2', label: 'HMGA2', group: 'molecular', pattern: 'N', hint: 'Adenoma pleomórfico parte; lipomas e leiomiomas com rearranjo.' },
  { id: 'myb', label: 'MYB', group: 'molecular', pattern: 'N', hint: 'Carcinoma adenoide cístico (fusão MYB::NFIB).' },
  { id: 'imp3', label: 'IMP3', group: 'outros', pattern: 'C', hint: 'Adenocarcinoma pancreático e biliar (vs reativo), RCC agressivo, melanoma.' },
  { id: 'maspina', label: 'Maspina', group: 'outros', pattern: 'NC', hint: 'Adenocarcinoma pancreático (vs pâncreas normal negativo).' },
  { id: 's100p', label: 'S100P', group: 'outros', pattern: 'NC', hint: 'Adenocarcinoma pancreático e urotelial (não confundir com S100).' },
  { id: 'tripsina', label: 'Tripsina / quimotripsina', group: 'hormonio', pattern: 'C', hint: 'Carcinoma de células acinares pancreático e pancreatoblastoma.' },
  { id: 'bcl10', label: 'BCL10', group: 'hormonio', pattern: 'C', hint: 'Acinar pancreático (anticorpo reconhece carboxil-éster lipase).' },
  { id: 'reticulina', label: 'Reticulina (histoquímica)', group: 'outros', pattern: 'var', readout: ['Perdida / trabéculas espessas', 'Preservada'], hint: 'Perda da trama reticulínica no HCC vs adenoma/cirrose; trama pericelular no adenoma hipofisário vs hipófise normal.' },
  { id: 'lfabp', label: 'LFABP', group: 'molecular', pattern: 'perda', readout: ['Perdido', 'Retido'], hint: 'Perda: adenoma hepatocelular HNF1A-inativado.' },
  { id: 'saa', label: 'Amiloide sérico A (SAA) / CRP', group: 'molecular', pattern: 'C', hint: 'Adenoma hepatocelular inflamatório.' },
  { id: 'gs', label: 'Glutamina sintetase', group: 'molecular', pattern: 'C', readout: ['Difusa', 'Perivenular / negativa'], hint: 'Difusa: adenoma β-catenina ativado e HCC; perivenular no fígado normal; em mapa na HNF.' },
  { id: 'hsp70', label: 'HSP70', group: 'outros', pattern: 'NC', hint: 'HCC (painel HSP70, GS, glipicano-3: 2 de 3).' },
  { id: 'ssx', label: 'SSX C-terminal', group: 'molecular', pattern: 'N', hint: 'Sarcoma sinovial (alternativa ao SS18-SSX).' },
  { id: 'pan-trk', label: 'Pan-TRK', group: 'molecular', pattern: 'NC', hint: 'Fusões NTRK: carcinoma secretor, fibrossarcoma infantil, tumores NTRK.' },
  { id: 'nestina', label: 'Nestina', group: 'mesenquimal', pattern: 'C', hint: 'Progenitor neural; GIST, alguns melanomas e sarcomas.' },
  { id: 'crx', label: 'CRX', group: 'linhagem', pattern: 'N', hint: 'Retinoblastoma, pineoblastoma, tumores da região pineal.' },
  { id: 'igg4', label: 'IgG4', group: 'hemato', pattern: 'C', hint: 'Doença relacionada a IgG4 (plasmócitos IgG4+ > 40% dos IgG+).' },
  { id: 'spink1', label: 'SPINK1', group: 'outros', pattern: 'C', hint: 'Adenocarcinoma prostático subgrupo; NET.' },
  { id: 'pgp95', label: 'PGP9.5', group: 'neuroendocrino', pattern: 'C', hint: 'Neural, pouco específica.' },
  { id: 'colageno-iv', label: 'Colágeno IV / laminina', group: 'outros', pattern: 'M', hint: 'Membrana basal: pericelular em tumor glômico, schwannoma, PEComa.' },
  { id: 'sox9', label: 'SOX9', group: 'mesenquimal', pattern: 'N', hint: 'Condroide (condrossarcoma, condroblastoma), também mama basal, próstata, colangiocarcinoma.' },
  { id: 'runx2', label: 'RUNX2', group: 'mesenquimal', pattern: 'N', hint: 'Osteoblástico (osteossarcoma).' },
  { id: 'h3g34', label: 'H3.3 G34W', group: 'molecular', pattern: 'N', hint: 'Tumor de células gigantes do osso (vs outros tumores ricos em células gigantes).' },
  { id: 'h3k36m', label: 'H3.3 K36M', group: 'molecular', pattern: 'N', hint: 'Condroblastoma.' },
  { id: 'dnajb1', label: 'DNAJB1-PRKACA', group: 'molecular', pattern: 'C', hint: 'HCC fibrolamelar (FISH ou IHC surrogate).' },
]

/* ---- Tumores --------------------------------------------------------------------- */

export type SiteRole = 'primario' | 'metastase'

export interface TumorSite {
  site: string
  role: SiteRole
  /** 3 = comum neste sítio, 2 = incomum, 1 = raro. Ordena a lista e serve de prior. */
  freq: 1 | 2 | 3
}

export interface MarkerResult {
  /** id de MARKERS. */
  marker: string
  /**
   * Porcentagem de casos com o readout positivo do marcador (0 a 100), como
   * número ou faixa [mín, máx] quando as séries divergem.
   */
  pct: number | [number, number]
  /** Padrão esperado neste tumor quando difere do padrão geral do marcador. */
  pattern?: Pattern
  /** Ressalva curta: "focal e fraca", "só no componente X", "clone SPT24". */
  note?: string
  /** URL (ou DOI/PMID) da série de onde a porcentagem saiu. */
  source?: string
}

export type Behavior = 'benigno' | 'intermediario' | 'maligno'

export interface Tumor {
  id: string
  name: string
  aka?: string[]
  behavior: Behavior
  /** Onde ocorre: primário ou metástase frequente, com a frequência lá. */
  sites: TumorSite[]
  /** ids de CELLS: as caras que o tumor costuma ter (qualquer uma combina). */
  cells: string[]
  /** ids de ARCHITECTURES. */
  architecture?: string[]
  /** ids de FEATURES. */
  features?: string[]
  ages?: AgeBand[]
  /** Só quando a preferência é forte (> 80%). */
  sex?: Sex
  /** O tumor em uma ou duas frases, como o patologista o reconhece. */
  summary: string
  /** Critérios diagnósticos: o que precisa estar presente (WHO ou consenso). */
  criteria: string[]
  /** O perfil: ~12 a 25 marcadores, incluindo os negativos que excluem os mímicos. */
  markers: MarkerResult[]
  /** "Entidade: o que separa". */
  mimics?: string[]
  /** Armadilhas de imuno: marcações aberrantes conhecidas. */
  pitfalls?: string[]
  /** Alteração molecular definidora ou útil. */
  molecular?: string
  sources: string[]
}

/* ---- Utilidades ----------------------------------------------------------------- */

export const REGION_ORDER: RegionId[] = REGIONS.map((r) => r.id)

export const sitesOf = (region: RegionId) => SITES.filter((s) => s.region === region)
export const findSite = (id: string | null | undefined) => SITES.find((s) => s.id === id) ?? null
export const findMarker = (id: string) => MARKERS.find((m) => m.id === id)
export const findMorph = (id: string) => MORPHS.find((m) => m.id === id)

/** Ponto médio de uma faixa, ou o próprio número. */
export const pctMid = (p: number | [number, number]) => (Array.isArray(p) ? (p[0] + p[1]) / 2 : p)

export const pctLabel = (p: number | [number, number]) => (Array.isArray(p) ? `${p[0]}–${p[1]}%` : `${p}%`)

/**
 * Faixas de leitura da porcentagem: "quase sempre" (≥ 90), "geralmente"
 * (70–89), "variável" (30–69), "raro" (10–29), "quase nunca" (< 10).
 */
export type Band = 'sempre' | 'geralmente' | 'variavel' | 'raro' | 'nunca'

export const bandOf = (p: number | [number, number]): Band => {
  const v = pctMid(p)
  if (v >= 90) return 'sempre'
  if (v >= 70) return 'geralmente'
  if (v >= 30) return 'variavel'
  if (v >= 10) return 'raro'
  return 'nunca'
}

export const BAND_LABELS: Record<Band, string> = {
  sempre: 'quase sempre',
  geralmente: 'geralmente',
  variavel: 'variável',
  raro: 'raro',
  nunca: 'quase nunca',
}
