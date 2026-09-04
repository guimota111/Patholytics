/* ==========================================================================
   specimens.ts — o catálogo de peças do jeito que o patologista vê na
   bancada: escolhida a peça, aparecem as estruturas com nome (margens,
   peças extras do monobloco, grupos de linfonodos) já marcadas nas
   habituais. Ele desmarca o que não fez e acrescenta o que falta.
   Textos em português porque a CBHPM é brasileira; a interface é traduzida.
   ⚠️ Para conferência: a cartilha indica a codificação, não fixa valores,
   e as operadoras podem ter regras contratuais próprias.
   Fonte: Cartilha de Instruções CBHPM – Patologia 2019 (SBP/ABRALAPAC).
   ========================================================================== */

import { Baby, Bone, Brain, Droplets, Hand, HeartPulse, Ribbon, Skull, TestTube, Utensils, type LucideIcon } from 'lucide-react'
import type { CodeKey } from './codes'

/* ---------------------------------------------------------------- bases */

export interface Base {
  code: CodeKey
  label: string
  /** Quantas margens a cartilha admite cobrar; null = sem teto declarado. */
  marginCap: number | null
  /** Rótulo do contador de frascos ("frascos da peça", "frascos"). */
  flaskLabel: string
}

export const BASES = {
  pecaSimples: { code: 'pecaSimples', label: 'Peça simples', marginCap: 3, flaskLabel: 'Frascos da peça' },
  pecaComplexa: { code: 'pecaComplexa', label: 'Peça complexa', marginCap: 5, flaskLabel: 'Frascos da peça' },
  biopsiaSimples: { code: 'biopsiaSimples', label: 'Biópsia (até 2 fragmentos)', marginCap: 0, flaskLabel: 'Frascos ou topografias' },
  biopsiaMultipla: { code: 'multiplosFragmentos', label: 'Biópsia com 3 fragmentos ou mais', marginCap: 0, flaskLabel: 'Frascos ou topografias' },
  citoLiquidos: { code: 'citoLiquidos', label: 'Citologia de líquidos e raspados', marginCap: 0, flaskLabel: 'Frascos ou topografias' },
  citoCervico: { code: 'citoCervico', label: 'Citologia cervicovaginal', marginCap: 0, flaskLabel: 'Exames' },
  citoMeioLiquido: { code: 'citoMeioLiquido', label: 'Citologia em meio líquido', marginCap: 0, flaskLabel: 'Frascos ou regiões' },
  citoHormonal: { code: 'citoHormonal', label: 'Citologia hormonal', marginCap: 0, flaskLabel: 'Exames' },
  amputacaoOnco: { code: 'amputacaoOnco', label: 'Amputação — causa oncológica', marginCap: null, flaskLabel: 'Peças' },
  amputacaoNaoOnco: { code: 'amputacaoNaoOnco', label: 'Amputação — sem causa oncológica', marginCap: null, flaskLabel: 'Peças' },
  necropsiaAdulto: { code: 'necropsiaAdulto', label: 'Necropsia de adulto, criança ou natimorto', marginCap: null, flaskLabel: 'Corpos' },
  necropsiaFeto: { code: 'necropsiaFeto', label: 'Necropsia de embrião ou feto', marginCap: null, flaskLabel: 'Corpos' },
} as const satisfies Record<string, Base>

export type BaseKind = keyof typeof BASES

/* ----------------------------------------------------------- estruturas */

export type StructureKind = 'margin' | 'extra' | 'nodes'

export interface Structure {
  id: string
  label: string
  kind: StructureKind
  /** Já vem marcada (é o habitual naquela peça). */
  on: boolean
  /** Só para grupos de linfonodos: quantos costumam vir. */
  nodes?: number
}

const slug = (v: string): string =>
  v
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')

/** Margem cirúrgica. */
const m = (label: string, on = true): Structure => ({ id: `m-${slug(label)}`, label, kind: 'margin', on })
/** Peça adicional do monobloco. */
const x = (label: string, on = true): Structure => ({ id: `x-${slug(label)}`, label, kind: 'extra', on })
/** Grupo de linfonodos (cobrado a cada 6). */
const ln = (label: string, on = false, nodes = 6): Structure => ({ id: `n-${slug(label)}`, label, kind: 'nodes', on, nodes })

/* -------------------------------------------------------------- sistemas */

export type SystemId = 'uro' | 'mama' | 'gineco' | 'digestivo' | 'pele' | 'cabeca' | 'torax' | 'osso' | 'cito' | 'outros'

export interface System {
  id: SystemId
  label: string
  icon: LucideIcon
}

export const SYSTEMS: System[] = [
  { id: 'uro', label: 'Urológico', icon: Droplets },
  { id: 'mama', label: 'Mama', icon: Ribbon },
  { id: 'gineco', label: 'Ginecológico', icon: Baby },
  { id: 'digestivo', label: 'Digestivo', icon: Utensils },
  { id: 'pele', label: 'Pele e partes moles', icon: Hand },
  { id: 'cabeca', label: 'Cabeça e pescoço', icon: Brain },
  { id: 'torax', label: 'Tórax', icon: HeartPulse },
  { id: 'osso', label: 'Osso, linfonodo e medula', icon: Bone },
  { id: 'cito', label: 'Citologias', icon: TestTube },
  { id: 'outros', label: 'Outros e necropsia', icon: Skull },
]

/* -------------------------------------------------------------- peças */

export interface Specimen {
  id: string
  label: string
  system: SystemId
  base: BaseKind
  /** Sinônimos e jeitos de escrever, para a busca achar. */
  terms: string
  /** Quantos frascos a peça costuma ocupar. */
  flasks?: number
  structures?: Structure[]
  /** O que a recepção precisa saber ao dar entrada. */
  receptionNote?: string
  /** Complementos que costumam vir junto, sugeridos com um clique. */
  suggests?: { block: string; params?: Record<string, number | string | number[]>; label: string }[]
}

export const SPECIMENS: Specimen[] = [
  /* ------------------------------------------------------------ urológico */
  {
    id: 'prostatectomia',
    label: 'Prostatectomia radical',
    system: 'uro',
    base: 'pecaComplexa',
    terms: 'prostata radical retropubica robotica adenocarcinoma gleason',
    structures: [
      m('Margem do colo vesical'),
      m('Margem uretral (apical)'),
      m('Margem circunferencial'),
      x('Vesícula seminal direita'),
      x('Vesícula seminal esquerda'),
      x('Ducto deferente direito'),
      x('Ducto deferente esquerdo'),
      ln('Linfonodos obturadores direitos'),
      ln('Linfonodos obturadores esquerdos'),
      ln('Linfonodos ilíacos direitos'),
      ln('Linfonodos ilíacos esquerdos'),
    ],
    receptionNote: 'Entra como peça complexa; margens, vesículas e linfonodos o patologista acrescenta depois da macroscopia.',
  },
  {
    id: 'cistectomia',
    label: 'Cistectomia radical / cistoprostatectomia',
    system: 'uro',
    base: 'pecaComplexa',
    terms: 'bexiga vesical cistoprostatectomia urotelial derivacao',
    structures: [
      m('Margem uretral'),
      m('Margem ureteral direita'),
      m('Margem ureteral esquerda'),
      m('Margem circunferencial', false),
      x('Próstata e vesículas seminais'),
      x('Útero e anexos', false),
      ln('Linfonodos obturadores direitos', true),
      ln('Linfonodos obturadores esquerdos', true),
      ln('Linfonodos ilíacos', false),
    ],
  },
  {
    id: 'nefrectomiaTumor',
    label: 'Nefrectomia por tumor',
    system: 'uro',
    base: 'pecaComplexa',
    terms: 'rim renal carcinoma celulas claras radical parcial nefrectomia',
    structures: [
      m('Margem ureteral'),
      m('Margem vascular do hilo'),
      m('Margem da gordura perirrenal', false),
      x('Ureter'),
      x('Glândula suprarrenal'),
      x('Gordura perirrenal (Gerota)', false),
      ln('Linfonodos hilares'),
    ],
  },
  { id: 'nefrectomiaBenigna', label: 'Nefrectomia não tumoral', system: 'uro', base: 'pecaSimples', terms: 'rim renal pielonefrite hidronefrose atrofia', structures: [x('Ureter', false)] },
  {
    id: 'orquiectomiaTumor',
    label: 'Orquiectomia por tumor',
    system: 'uro',
    base: 'pecaComplexa',
    terms: 'testiculo testicular seminoma germinativo cordao espermatico',
    structures: [m('Margem do cordão espermático'), x('Cordão espermático'), x('Túnica vaginal', false)],
  },
  { id: 'orquiectomiaBenigna', label: 'Orquiectomia não tumoral', system: 'uro', base: 'pecaSimples', terms: 'testiculo torcao atrofia hormonal orquiectomia', structures: [x('Cordão espermático', false)] },
  {
    id: 'penectomia',
    label: 'Penectomia',
    system: 'uro',
    base: 'pecaComplexa',
    terms: 'penis peniana glande amputacao',
    structures: [m('Margem uretral'), m('Margem dos corpos cavernosos'), m('Margem cutânea'), ln('Linfonodos inguinais direitos'), ln('Linfonodos inguinais esquerdos')],
  },
  { id: 'rtuProstata', label: 'RTU de próstata', system: 'uro', base: 'biopsiaMultipla', terms: 'rtu resseccao transuretral prostata raspas hiperplasia', receptionNote: 'Frasco com múltiplos fragmentos: 19-6, um por frasco.' },
  { id: 'rtuBexiga', label: 'RTU de bexiga', system: 'uro', base: 'biopsiaMultipla', terms: 'rtu bexiga vesical tumor raspas', receptionNote: 'Frasco com múltiplos fragmentos: 19-6, um por frasco.' },
  { id: 'biopsiaProstata', label: 'Biópsia de próstata por sextantes', system: 'uro', base: 'biopsiaSimples', terms: 'prostata agulha sextante fragmentos topografia 12', flasks: 6, receptionNote: 'Cada topografia identificada é uma cobrança: conte os frascos.' },
  { id: 'biopsiaProstataLobos', label: 'Biópsia de próstata por lobos', system: 'uro', base: 'biopsiaMultipla', terms: 'prostata lobo direito esquerdo multiplos fragmentos', flasks: 2 },
  { id: 'biopsiaRenal', label: 'Biópsia renal (nefropatia)', system: 'uro', base: 'biopsiaSimples', terms: 'rim renal glomerulo nefropatia agulha', suggests: [{ block: 'molecular', params: { tecnica: 'imunofluorescencia', unidades: 6 }, label: 'Imunofluorescência (6 marcadores)' }, { block: 'me', params: { especimes: 1 }, label: 'Microscopia eletrônica' }] },
  { id: 'nodulectomiaProstata', label: 'Nodulectomia prostática', system: 'uro', base: 'pecaSimples', terms: 'prostata adenomectomia millin nodulo' },

  /* ----------------------------------------------------------------- mama */
  {
    id: 'mastectomia',
    label: 'Mastectomia',
    system: 'mama',
    base: 'pecaComplexa',
    terms: 'mama seio radical madden patey adenomastectomia carcinoma',
    structures: [
      m('Margem profunda'),
      m('Margem superficial (pele)', false),
      x('Pele'),
      x('Complexo aréolo-papilar'),
      x('Prolongamento axilar', false),
      x('Músculo peitoral', false),
      ln('Linfonodos axilares nível I', true),
      ln('Linfonodos axilares nível II', false),
      ln('Linfonodos axilares nível III', false),
    ],
    receptionNote: 'Peça complexa; pele, mamilo, margens e linfonodos entram depois, pelo laudo.',
  },
  {
    id: 'quadrantectomia',
    label: 'Quadrantectomia / setorectomia de mama',
    system: 'mama',
    base: 'pecaComplexa',
    terms: 'mama segmentectomia tumorectomia conservadora nodulo maligno',
    structures: [m('Margem superior'), m('Margem inferior'), m('Margem medial'), m('Margem lateral'), m('Margem profunda'), m('Margem superficial', false), x('Pele', false), ln('Linfonodos axilares', false)],
  },
  { id: 'nodulectomiaMama', label: 'Nodulectomia de mama (benigna)', system: 'mama', base: 'pecaSimples', terms: 'mama fibroadenoma nodulo exerese benigno', structures: [m('Margem cirúrgica', false)] },
  { id: 'mamoplastia', label: 'Mamoplastia redutora', system: 'mama', base: 'pecaSimples', terms: 'mama plastica reducao estetica gigantomastia', flasks: 2, receptionNote: 'Uma cobrança por lado, se vierem em frascos separados.' },
  { id: 'biopsiaMama', label: 'Core biopsy de mama', system: 'mama', base: 'biopsiaMultipla', terms: 'mama agulha grossa core fragmentos mamotomia', receptionNote: 'Frasco com 3 ou mais fragmentos: 19-6.' },

  /* ---------------------------------------------------------- ginecológico */
  {
    id: 'histerectomiaSimples',
    label: 'Histerectomia simples (mioma)',
    system: 'gineco',
    base: 'pecaSimples',
    terms: 'utero uterina leiomioma miomatose total abdominal vaginal',
    structures: [x('Colo uterino'), x('Ovário direito', false), x('Tuba direita', false), x('Ovário esquerdo', false), x('Tuba esquerda', false)],
    receptionNote: 'Peça simples; o colo e os anexos são cobrados como peças adicionais no laudo.',
  },
  {
    id: 'histerectomiaEndometrio',
    label: 'Histerectomia radical + anexos (endométrio)',
    system: 'gineco',
    base: 'pecaComplexa',
    terms: 'utero endometrio anexectomia ooforectomia salpingectomia radical carcinoma',
    structures: [x('Colo uterino'), x('Istmo'), x('Ovário direito'), x('Tuba direita'), x('Ovário esquerdo'), x('Tuba esquerda'), m('Margem vaginal', false), ln('Linfonodos pélvicos', false)],
  },
  {
    id: 'histerectomiaColo',
    label: 'Histerectomia radical + anexos (colo)',
    system: 'gineco',
    base: 'pecaComplexa',
    terms: 'utero colo cervice wertheim meigs parametrio radical',
    structures: [x('Corpo uterino'), x('Istmo'), x('Canal vaginal'), x('Paramétrio direito'), x('Paramétrio esquerdo'), x('Ovário direito'), x('Tuba direita'), x('Ovário esquerdo'), x('Tuba esquerda'), ln('Linfonodos pélvicos', false)],
  },
  {
    id: 'cone',
    label: 'Cone / CAF de colo uterino',
    system: 'gineco',
    base: 'pecaComplexa',
    terms: 'conizacao caf leep alca colo cervice nic',
    structures: [m('Margem ectocervical'), m('Margem endocervical')],
    suggests: [{ block: 'revisao', params: { itens: 0, seriados: 1 }, label: 'Estudo seriado protocolar do cone' }],
  },
  { id: 'curetagem', label: 'Curetagem uterina / AMIU', system: 'gineco', base: 'biopsiaMultipla', terms: 'curetagem amiu aspirado endometrial restos abortamento', receptionNote: 'Frasco com múltiplos fragmentos: 19-6.' },
  { id: 'biopsiaEndometrio', label: 'Biópsia de endométrio (pipelle)', system: 'gineco', base: 'biopsiaSimples', terms: 'endometrio pipelle biopsia ambulatorial' },
  { id: 'placenta', label: 'Placenta', system: 'gineco', base: 'pecaComplexa', terms: 'placenta cordao membranas gestacao corioamnionite', structures: [x('Cordão umbilical', false), x('Membranas', false)] },
  {
    id: 'vulvectomia',
    label: 'Vulvectomia',
    system: 'gineco',
    base: 'pecaComplexa',
    terms: 'vulva vulvar radical inguinal carcinoma',
    structures: [m('Margem vaginal'), m('Margem uretral'), m('Margem perineal'), m('Margem profunda'), ln('Linfonodos inguinais direitos', true), ln('Linfonodos inguinais esquerdos', true)],
  },
  { id: 'salpingectomia', label: 'Salpingectomia / ooforectomia (não tumoral)', system: 'gineco', base: 'pecaSimples', terms: 'tuba trompa ovario cisto laqueadura ectopica anexo', structures: [x('Anexo contralateral', false)] },
  {
    id: 'ooforectomiaTumor',
    label: 'Ooforectomia por tumor',
    system: 'gineco',
    base: 'pecaComplexa',
    terms: 'ovario ovariano tumor cistoadenoma carcinoma anexo',
    structures: [x('Tuba ipsilateral'), x('Epíplon', false), x('Útero', false), ln('Linfonodos pélvicos', false)],
  },

  /* ------------------------------------------------------------ digestivo */
  {
    id: 'retossigmoide',
    label: 'Retossigmoidectomia',
    system: 'digestivo',
    base: 'pecaComplexa',
    terms: 'reto sigmoide colorretal miles hartmann rai adenocarcinoma',
    structures: [m('Margem proximal'), m('Margem distal'), m('Margem radial (circunferencial)'), x('Divertículos', false), x('Apêndices epiplóicos', false), ln('Linfonodos do mesorreto', true)],
  },
  {
    id: 'colectomia',
    label: 'Colectomia',
    system: 'digestivo',
    base: 'pecaComplexa',
    terms: 'colon intestino grosso hemicolectomia direita esquerda ileo',
    structures: [m('Margem proximal'), m('Margem distal'), m('Margem radial'), x('Apêndice cecal', false), x('Íleo terminal', false), ln('Linfonodos mesocólicos', true, 12)],
  },
  {
    id: 'gastrectomia',
    label: 'Gastrectomia',
    system: 'digestivo',
    base: 'pecaComplexa',
    terms: 'estomago gastrica subtotal total antro adenocarcinoma',
    structures: [m('Margem proximal'), m('Margem distal'), m('Margem radial', false), x('Epíplon'), x('Baço', false), ln('Linfonodos perigástricos', true, 12)],
  },
  {
    id: 'gdp',
    label: 'Gastroduodenopancreatectomia (Whipple)',
    system: 'digestivo',
    base: 'pecaComplexa',
    terms: 'whipple pancreas duodeno coledoco ampola vesicula monobloco uncinado',
    structures: [
      m('Margem anterior do pâncreas'),
      m('Margem posterior do pâncreas'),
      m('Margem pancreática (secção)'),
      m('Margem do processo uncinado'),
      m('Margem biliar', false),
      x('Estômago'),
      x('Duodeno'),
      x('Ampola / pâncreas'),
      x('Colédoco'),
      x('Vesícula biliar'),
      ln('Linfonodos peripancreáticos', true),
    ],
  },
  {
    id: 'esofagectomia',
    label: 'Esofagectomia',
    system: 'digestivo',
    base: 'pecaComplexa',
    terms: 'esofago esofagica cardia barrett',
    structures: [m('Margem proximal'), m('Margem distal'), m('Margem radial'), x('Estômago proximal', false), ln('Linfonodos periesofágicos', true, 12)],
  },
  {
    id: 'hepatectomia',
    label: 'Hepatectomia / segmentectomia hepática',
    system: 'digestivo',
    base: 'pecaComplexa',
    terms: 'figado hepatica segmentectomia metastase hepatocarcinoma',
    structures: [m('Margem parenquimatosa'), m('Margem vascular', false), x('Vesícula biliar', false)],
  },
  { id: 'apendicectomia', label: 'Apendicectomia', system: 'digestivo', base: 'pecaSimples', terms: 'apendice apendicite ceco', structures: [m('Margem de secção', false)] },
  { id: 'colecistectomia', label: 'Colecistectomia', system: 'digestivo', base: 'pecaSimples', terms: 'vesicula biliar colelitiase colecistite calculo', structures: [m('Margem do ducto cístico', false), ln('Linfonodo do cístico', false, 1)] },
  { id: 'esplenectomia', label: 'Esplenectomia', system: 'digestivo', base: 'pecaSimples', terms: 'baco esplenica trauma hiperesplenismo' },
  { id: 'gastroplastia', label: 'Gastroplastia (bariátrica)', system: 'digestivo', base: 'pecaSimples', terms: 'bariatrica sleeve manga bypass estomago obesidade' },
  { id: 'hemorroida', label: 'Hemorroidectomia / plicoma', system: 'digestivo', base: 'pecaSimples', terms: 'hemorroida plicoma anal fissura' },
  { id: 'hernia', label: 'Saco herniário', system: 'digestivo', base: 'pecaSimples', terms: 'hernia inguinal umbilical incisional saco' },
  { id: 'polipo', label: 'Pólipo com pedículo', system: 'digestivo', base: 'pecaSimples', terms: 'polipo polipectomia adenoma pediculo colon', structures: [m('Margem do pedículo')] },
  { id: 'mucosectomia', label: 'Mucosectomia (EMR/ESD)', system: 'digestivo', base: 'pecaSimples', terms: 'mucosectomia emr esd endoscopica dissecao submucosa', structures: [m('Margem profunda'), m('Margens do menor eixo'), m('Margens do maior eixo')] },
  { id: 'biopsiaGastrica', label: 'Biópsia gástrica (antro e corpo)', system: 'digestivo', base: 'biopsiaSimples', terms: 'endoscopia estomago helicobacter gastrite antro corpo eda', flasks: 2, suggests: [{ block: 'coloracao', params: { coloracoes: 2 }, label: 'Giemsa no antro e no corpo' }] },
  { id: 'biopsiaColon', label: 'Biópsias de colonoscopia', system: 'digestivo', base: 'biopsiaSimples', terms: 'colonoscopia intestino biopsias multiplas frascos polipo', flasks: 3, receptionNote: 'Uma cobrança por frasco/topografia identificada.' },
  { id: 'biopsiaHepatica', label: 'Biópsia hepática', system: 'digestivo', base: 'biopsiaSimples', terms: 'figado hepatica agulha hepatite cirrose esteatose', suggests: [{ block: 'coloracao', params: { coloracoes: 3 }, label: 'Tricrômico, picrosírius e retículo' }] },

  /* ----------------------------------------------------- pele e partes moles */
  { id: 'fusoSimples', label: 'Fuso cutâneo (tumor não melanoma até 3 cm)', system: 'pele', base: 'pecaSimples', terms: 'pele cutaneo basocelular espinocelular cbc cec exerese fuso elipse', structures: [m('Margem profunda'), m('Margens do menor eixo'), m('Margens do maior eixo')] },
  { id: 'fusoMelanoma', label: 'Fuso cutâneo (melanoma ou > 3 cm)', system: 'pele', base: 'pecaComplexa', terms: 'melanoma pele cutaneo grande ampliado fuso', structures: [m('Margem profunda'), m('Margem do menor eixo 1'), m('Margem do menor eixo 2'), m('Margem do maior eixo 1'), m('Margem do maior eixo 2')] },
  { id: 'ampliacao', label: 'Ampliação de margem', system: 'pele', base: 'pecaSimples', terms: 'ampliacao margem reexcisao cicatriz alargamento', structures: [m('Margem cirúrgica')] },
  { id: 'cisto', label: 'Cisto, lipoma ou nevo', system: 'pele', base: 'pecaSimples', terms: 'cisto lipoma nevo verruga queratose exerese benigno' },
  { id: 'punch', label: 'Punch de pele', system: 'pele', base: 'biopsiaSimples', terms: 'punch biopsia pele dermatologia incisional shaving' },
  { id: 'sarcoma', label: 'Ressecção de sarcoma de partes moles', system: 'pele', base: 'pecaComplexa', terms: 'sarcoma partes moles tumor mesenquimal lipossarcoma', structures: [m('Margem profunda'), m('Margem proximal'), m('Margem distal'), m('Margem lateral', false), x('Pele', false), x('Osso adjacente', false)] },

  /* ------------------------------------------------------- cabeça e pescoço */
  { id: 'tireoidectomiaTotal', label: 'Tireoidectomia total', system: 'cabeca', base: 'pecaComplexa', terms: 'tireoide tiroide bocio papilifero carcinoma', structures: [x('Istmo'), x('Lobo piramidal', false), x('Paratireoide', false), ln('Linfonodos do compartimento central', false)] },
  { id: 'tireoidectomiaParcial', label: 'Lobectomia de tireoide', system: 'cabeca', base: 'pecaComplexa', terms: 'tireoide tiroide lobectomia istmectomia nodulo', structures: [x('Istmo', false)] },
  { id: 'esvaziamento', label: 'Esvaziamento cervical', system: 'cabeca', base: 'pecaComplexa', terms: 'esvaziamento ganglionar cervical pescoco niveis linfadenectomia', structures: [ln('Linfonodos nível I'), ln('Linfonodos nível II', true), ln('Linfonodos nível III', true), ln('Linfonodos nível IV', false), ln('Linfonodos nível V', false), x('Glândula submandibular', false)] },
  { id: 'laringectomia', label: 'Laringectomia', system: 'cabeca', base: 'pecaComplexa', terms: 'laringe laringea corda vocal supraglotica', structures: [m('Margem mucosa proximal'), m('Margem traqueal'), m('Margem de partes moles'), x('Tireoide'), x('Traqueia'), x('Osso hióide', false), ln('Linfonodos cervicais', false)] },
  { id: 'glossectomia', label: 'Glossectomia / ressecção de cavidade oral', system: 'cabeca', base: 'pecaComplexa', terms: 'lingua boca oral glossectomia mandibula assoalho', structures: [m('Margem anterior'), m('Margem posterior'), m('Margem profunda'), m('Margem lateral', false), x('Mandíbula', false), ln('Linfonodos cervicais', false)] },
  { id: 'parotidectomia', label: 'Parotidectomia / glândula salivar', system: 'cabeca', base: 'pecaComplexa', terms: 'parotida salivar submandibular pleomorfico glandula', structures: [m('Margem profunda'), x('Linfonodo intraparotídeo', false)] },
  { id: 'tonsila', label: 'Tonsilectomia (amígdalas)', system: 'cabeca', base: 'pecaSimples', terms: 'amigdala tonsila adenoide garganta', flasks: 2, receptionNote: 'Uma cobrança por lado, se vierem em frascos separados.' },
  { id: 'corneto', label: 'Corneto nasal / pólipo nasal', system: 'cabeca', base: 'pecaSimples', terms: 'corneto nasal septo polipo turbinectomia sinusite' },
  { id: 'exenteracao', label: 'Exenteração ocular', system: 'cabeca', base: 'pecaComplexa', terms: 'olho ocular enucleacao exenteracao retinoblastoma melanoma', structures: [m('Margem do nervo óptico'), x('Pálpebra', false)] },

  /* ---------------------------------------------------------------- tórax */
  { id: 'lobectomiaPulmao', label: 'Lobectomia / pneumectomia', system: 'torax', base: 'pecaComplexa', terms: 'pulmao pulmonar lobectomia pneumectomia toracica adenocarcinoma', structures: [m('Margem brônquica'), m('Margem vascular'), m('Margem parenquimatosa', false), x('Pleura parietal', false), ln('Linfonodos hilares', true), ln('Linfonodos mediastinais', false)] },
  { id: 'segmentectomiaPulmao', label: 'Segmentectomia / nódulo pulmonar (cunha)', system: 'torax', base: 'pecaComplexa', terms: 'pulmao cunha wedge nodulo segmentectomia', structures: [m('Margem parenquimatosa')] },
  { id: 'timectomia', label: 'Timectomia', system: 'torax', base: 'pecaComplexa', terms: 'timo timoma miastenia mediastino', structures: [m('Margem cirúrgica'), x('Gordura mediastinal', false)] },
  { id: 'biopsiaPulmao', label: 'Biópsia transbrônquica / pulmonar', system: 'torax', base: 'biopsiaMultipla', terms: 'pulmao transbronquica broncoscopia criobiopsia fragmentos' },

  /* --------------------------------------------------- osso, linfonodo, medula */
  { id: 'sentinela', label: 'Linfonodo sentinela', system: 'osso', base: 'pecaSimples', terms: 'sentinela linfonodo seriado protocolo mama melanoma', suggests: [{ block: 'revisao', params: { itens: 0, seriados: 1 }, label: 'Estudo seriado do sentinela' }] },
  { id: 'linfonodoIsolado', label: 'Linfonodo isolado (biópsia excisional)', system: 'osso', base: 'pecaSimples', terms: 'linfonodo ganglio biopsia excisional linfoma' },
  { id: 'medulaOssea', label: 'Biópsia de medula óssea', system: 'osso', base: 'biopsiaMultipla', terms: 'medula ossea crista iliaca hematologia mieloma', suggests: [{ block: 'coloracao', params: { coloracoes: 1 }, label: 'Retículo' }] },
  { id: 'osso', label: 'Segmento ósseo não tumoral', system: 'osso', base: 'pecaSimples', terms: 'osso femoral cabeca femur artroplastia protese', structures: [x('Cartilagem / sinóvia', false)] },
  { id: 'ossoTumor', label: 'Ressecção óssea por tumor', system: 'osso', base: 'pecaComplexa', terms: 'osso tumor osteossarcoma condrossarcoma resseccao segmentar', structures: [m('Margem óssea proximal'), m('Margem óssea distal'), m('Margem de partes moles'), x('Partes moles'), x('Pele', false)] },
  { id: 'amputacaoVascular', label: 'Amputação por causa vascular', system: 'osso', base: 'amputacaoNaoOnco', terms: 'amputacao diabetico pe vascular isquemia trauma perna', structures: [m('Margem cirúrgica'), x('Partes moles', false), x('Osso', false)] },
  { id: 'amputacaoOnco', label: 'Amputação oncológica', system: 'osso', base: 'amputacaoOnco', terms: 'amputacao tumor sarcoma osteossarcoma membro oncologica', structures: [m('Margem cutânea'), m('Margem óssea'), m('Margem de partes moles'), x('Partes moles'), x('Osso'), x('Grandes vasos e nervos'), ln('Linfonodos inguinais', false)] },

  /* ------------------------------------------------------------ citologias */
  { id: 'papanicolau', label: 'Papanicolau (citologia oncótica)', system: 'cito', base: 'citoCervico', terms: 'papanicolau preventivo colpocitologia oncotica cervicovaginal microflora', receptionNote: 'Um exame, normalmente uma lâmina: 13-7.' },
  { id: 'meioLiquido', label: 'Citologia em meio líquido', system: 'cito', base: 'citoMeioLiquido', terms: 'meio liquido surepath thinprep citologia base liquida', receptionNote: 'Cobrado por frasco/região enviada em separado: 32-3.' },
  { id: 'hormonal', label: 'Citologia hormonal', system: 'cito', base: 'citoHormonal', terms: 'hormonal maturacao gravidez lactacao colpocitologia funcional' },
  { id: 'liquidoPleural', label: 'Líquido pleural, ascítico ou pericárdico', system: 'cito', base: 'citoLiquidos', terms: 'derrame pleural ascite peritoneal pericardico liquido cavitario' },
  { id: 'urina', label: 'Urina, lavado ou escovado', system: 'cito', base: 'citoLiquidos', terms: 'urina urinaria lavado broncoalveolar escovado bronquico licor raspado' },

  /* --------------------------------------------------- outros e necropsia */
  { id: 'necropsiaAdulto', label: 'Necropsia de adulto ou criança', system: 'outros', base: 'necropsiaAdulto', terms: 'necropsia autopsia obito adulto crianca natimorto' },
  { id: 'necropsiaFetal', label: 'Necropsia de embrião ou feto', system: 'outros', base: 'necropsiaFeto', terms: 'necropsia autopsia feto embriao obito fetal 500' },
  { id: 'pecaSimplesGenerica', label: 'Outra peça simples', system: 'outros', base: 'pecaSimples', terms: 'generica outra peca simples pequena benigna qualquer', structures: [m('Margem cirúrgica', false), x('Estrutura adicional', false)], receptionNote: 'Pequeno porte, excisional, não fragmentada.' },
  { id: 'pecaComplexaGenerica', label: 'Outra peça complexa', system: 'outros', base: 'pecaComplexa', terms: 'generica outra peca complexa grande oncologica qualquer', structures: [m('Margem cirúrgica', false), x('Estrutura adicional', false), ln('Grupo de linfonodos', false)], receptionNote: 'Médio ou grande porte, oncológica ou de estadiamento.' },
  { id: 'biopsiaGenerica', label: 'Outra biópsia', system: 'outros', base: 'biopsiaSimples', terms: 'generica outra biopsia fragmento frasco qualquer' },
]

export const SPECIMEN_BY_ID: Record<string, Specimen> = Object.fromEntries(SPECIMENS.map((sp) => [sp.id, sp]))

/** As que aparecem sem digitar nada, por serem o pão de cada dia. */
export const COMMON_SPECIMEN_IDS = ['prostatectomia', 'mastectomia', 'histerectomiaSimples', 'colecistectomia', 'fusoSimples', 'biopsiaGastrica', 'retossigmoide', 'papanicolau']

const fold = (v: string): string =>
  v
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

const HAY = new Map(SPECIMENS.map((sp) => [sp.id, fold(`${sp.label} ${sp.terms}`)]))

/** Busca tolerante: sem acento, por pedaços de palavra, em qualquer ordem. */
export function searchSpecimens(query: string, limit = 12): Specimen[] {
  const terms = fold(query).split(/\s+/).filter(Boolean)
  if (!terms.length) return []
  const hits = SPECIMENS.filter((sp) => {
    const hay = HAY.get(sp.id) ?? ''
    return terms.every((term) => hay.includes(term))
  })
  // Quem casa no nome vem antes de quem casa só nos sinônimos; peça comum
  // ganha um degrau; empate resolve pela ordem curada do catálogo.
  const common = new Set(COMMON_SPECIMEN_IDS)
  const rank = (sp: Specimen): number => {
    const label = fold(sp.label)
    const bucket = label.startsWith(terms[0]) ? 0 : label.includes(terms[0]) ? 1 : 2
    return bucket - (common.has(sp.id) ? 1 : 0)
  }
  const order = new Map(SPECIMENS.map((sp, i) => [sp.id, i]))
  hits.sort((a, b) => rank(a) - rank(b) || (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0))
  return hits.slice(0, limit)
}
