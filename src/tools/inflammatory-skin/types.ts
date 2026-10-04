/* ==========================================================================
   types.ts — vocabulário fechado da ferramenta de dermatoses inflamatórias.
   Três listas (padrões de reação, dados clínicos, achados histológicos) e o
   tipo Diagnosis. Todo id usado em content/ precisa existir aqui: o
   content/index.ts avisa em DEV quando não existe.
   ========================================================================== */

export type PatternGroup = 'epidermal' | 'dermal' | 'blister' | 'adnexal' | 'deep'
export type ClinicalGroup = 'who' | 'course' | 'lesion' | 'where' | 'context'
export type HistologyGroup = 'corneum' | 'epidermis' | 'junction' | 'infiltrate' | 'stroma' | 'adnexa' | 'subcutis' | 'special'

export interface Pattern {
  id: string
  label: string
  group: PatternGroup
  /** O que define o padrão em uma linha, mostrado no chip. */
  hint: string
}

export interface ClinicalItem {
  id: string
  label: string
  group: ClinicalGroup
}

export interface HistologyItem {
  id: string
  label: string
  group: HistologyGroup
}

export interface Diagnosis {
  id: string
  name: string
  aka?: string[]
  /** Padrões de reação; o primeiro é o principal e vale mais. */
  patterns: string[]
  clinical: string[]
  /** Achados histológicos compatíveis (peso normal). */
  histology: string[]
  /** Subconjunto de `histology` quase definidor: pesa mais e, quando não marcado, vira "o que procurar". */
  hallmarks?: string[]
  /** Dados clínicos ou achados que, presentes, pesam contra. */
  against?: string[]
  /** 3 comum, 2 habitual, 1 raro — só desempata. */
  frequency?: 1 | 2 | 3
  summary: string
  /** O que sustenta o diagnóstico na lâmina e na clínica. */
  clues: string[]
  /** "Entidade: o que separa". */
  mimics: string[]
  /** Colorações, IF, exames e perguntas clínicas que fecham o caso. */
  next?: string[]
  sources?: string[]
}

export const PATTERNS: Pattern[] = [
  { id: 'spongiotic', label: 'Espongiótico', group: 'epidermal', hint: 'Edema intercelular, com ou sem vesículas' },
  { id: 'psoriasiform', label: 'Psoriasiforme', group: 'epidermal', hint: 'Cristas alongadas de forma regular' },
  { id: 'interface-vacuolar', label: 'Interface vacuolar', group: 'epidermal', hint: 'Dano basal com infiltrado escasso' },
  { id: 'interface-lichenoid', label: 'Liquenoide', group: 'epidermal', hint: 'Infiltrado em faixa que oculta a junção' },
  { id: 'invisible', label: 'Dermatose invisível', group: 'epidermal', hint: 'Lâmina quase normal em pequeno aumento' },
  { id: 'perivascular-superficial', label: 'Perivascular superficial', group: 'dermal', hint: 'Só o plexo superficial, epiderme intacta' },
  { id: 'perivascular-deep', label: 'Perivascular superficial e profundo', group: 'dermal', hint: 'Os dois plexos, muitas vezes periadnexal' },
  { id: 'vasculitis', label: 'Vasculite / vasculopatia', group: 'dermal', hint: 'Lesão da parede vascular ou oclusão' },
  { id: 'nodular-diffuse', label: 'Nodular e difuso', group: 'dermal', hint: 'Infiltrado denso que não respeita os vasos' },
  { id: 'granulomatous', label: 'Granulomatoso', group: 'dermal', hint: 'Histiócitos epitelioides organizados' },
  { id: 'neutrophilic', label: 'Neutrofílico', group: 'dermal', hint: 'Neutrófilos dérmicos sem vasculite primária' },
  { id: 'deposition', label: 'Depósito', group: 'dermal', hint: 'Mucina, amiloide, cálcio, urato' },
  { id: 'fibrosing', label: 'Fibrosante / esclerosante', group: 'dermal', hint: 'Colágeno espessado, anexos perdidos' },
  { id: 'intraepidermal-blister', label: 'Vesícula / pústula intraepidérmica', group: 'blister', hint: 'Fenda dentro da epiderme' },
  { id: 'subepidermal-blister', label: 'Bolha subepidérmica', group: 'blister', hint: 'Fenda abaixo da basal' },
  { id: 'folliculitis', label: 'Foliculite / perifoliculite', group: 'adnexal', hint: 'O folículo é o centro da lesão' },
  { id: 'alopecia', label: 'Alopecia', group: 'adnexal', hint: 'Biópsia de couro cabeludo por queda' },
  { id: 'panniculitis-septal', label: 'Paniculite septal', group: 'deep', hint: 'Septos espessados, lóbulos poupados' },
  { id: 'panniculitis-lobular', label: 'Paniculite lobular', group: 'deep', hint: 'Lóbulos infiltrados ou necróticos' },
]

export const CLINICAL: ClinicalItem[] = [
  // Quem
  { id: 'child', label: 'Criança', group: 'who' },
  { id: 'young-adult', label: 'Adulto jovem', group: 'who' },
  { id: 'elderly', label: 'Idoso', group: 'who' },
  { id: 'female', label: 'Mulher', group: 'who' },
  { id: 'male', label: 'Homem', group: 'who' },
  { id: 'pregnancy', label: 'Gestante / puerpério', group: 'who' },
  // Curso e sintomas
  { id: 'acute', label: 'Início agudo (dias)', group: 'course' },
  { id: 'subacute', label: 'Semanas', group: 'course' },
  { id: 'chronic', label: 'Crônico ou recorrente', group: 'course' },
  { id: 'lesion-24h', label: 'Lesão individual dura < 24 h', group: 'course' },
  { id: 'relapsing', label: 'Surtos que somem sozinhos', group: 'course' },
  { id: 'itch', label: 'Prurido importante', group: 'course' },
  { id: 'pain', label: 'Dor / ardor', group: 'course' },
  { id: 'asymptomatic', label: 'Assintomático', group: 'course' },
  { id: 'fever', label: 'Febre / sintomas sistêmicos', group: 'course' },
  { id: 'arthralgia', label: 'Artralgia', group: 'course' },
  { id: 'photosensitive', label: 'Piora com sol', group: 'course' },
  // Lesão elementar
  { id: 'macule', label: 'Máculas / manchas', group: 'lesion' },
  { id: 'papule', label: 'Pápulas', group: 'lesion' },
  { id: 'scaly-plaque', label: 'Placas descamativas', group: 'lesion' },
  { id: 'lichenified', label: 'Liquenificação / escoriações', group: 'lesion' },
  { id: 'violaceous', label: 'Pápulas violáceas poligonais', group: 'lesion' },
  { id: 'wheal', label: 'Urticas', group: 'lesion' },
  { id: 'vesicle', label: 'Vesículas', group: 'lesion' },
  { id: 'bulla', label: 'Bolhas tensas', group: 'lesion' },
  { id: 'flaccid-bulla', label: 'Bolhas flácidas / erosões', group: 'lesion' },
  { id: 'pustule', label: 'Pústulas', group: 'lesion' },
  { id: 'nodule', label: 'Nódulos', group: 'lesion' },
  { id: 'subcutaneous-nodule', label: 'Nódulos subcutâneos dolorosos', group: 'lesion' },
  { id: 'purpura', label: 'Púrpura palpável', group: 'lesion' },
  { id: 'petechiae', label: 'Petéquias / púrpura não palpável', group: 'lesion' },
  { id: 'livedo', label: 'Livedo / retiforme', group: 'lesion' },
  { id: 'ulcer', label: 'Úlcera', group: 'lesion' },
  { id: 'atrophy', label: 'Atrofia / poiquilodermia / cicatriz', group: 'lesion' },
  { id: 'sclerosis', label: 'Endurecimento / esclerose', group: 'lesion' },
  { id: 'annular', label: 'Anulares / figuradas', group: 'lesion' },
  { id: 'target', label: 'Lesões em alvo', group: 'lesion' },
  { id: 'linear', label: 'Linear / Koebner', group: 'lesion' },
  { id: 'follicular', label: 'Pápulas ou pústulas foliculares', group: 'lesion' },
  { id: 'hair-loss', label: 'Queda de cabelo', group: 'lesion' },
  { id: 'hyperpigmented', label: 'Hiperpigmentação', group: 'lesion' },
  { id: 'hypopigmented', label: 'Hipopigmentação / acromia', group: 'lesion' },
  { id: 'telangiectasia', label: 'Telangiectasias / eritema fixo', group: 'lesion' },
  { id: 'erythroderma', label: 'Eritrodermia', group: 'lesion' },
  // Distribuição
  { id: 'face', label: 'Face', group: 'where' },
  { id: 'scalp', label: 'Couro cabeludo', group: 'where' },
  { id: 'photoexposed', label: 'Áreas fotoexpostas', group: 'where' },
  { id: 'seborrheic', label: 'Áreas seborreicas', group: 'where' },
  { id: 'flexural', label: 'Dobras / intertriginosas', group: 'where' },
  { id: 'extensor', label: 'Superfícies extensoras', group: 'where' },
  { id: 'acral', label: 'Palmas / plantas / dedos', group: 'where' },
  { id: 'hands', label: 'Dorso das mãos', group: 'where' },
  { id: 'legs', label: 'Pernas', group: 'where' },
  { id: 'trunk', label: 'Tronco', group: 'where' },
  { id: 'mucosa', label: 'Mucosa oral / genital', group: 'where' },
  { id: 'genital', label: 'Genital / perianal', group: 'where' },
  { id: 'nails', label: 'Unhas', group: 'where' },
  { id: 'generalized', label: 'Generalizado e simétrico', group: 'where' },
  { id: 'dermatomal', label: 'Unilateral / dermatômero', group: 'where' },
  // Contexto
  { id: 'drug', label: 'Medicamento recente', group: 'context' },
  { id: 'infection', label: 'Infecção recente / faringite', group: 'context' },
  { id: 'atopy', label: 'Atopia', group: 'context' },
  { id: 'contact', label: 'Contato / ocupação', group: 'context' },
  { id: 'insect', label: 'Picada / artrópodes', group: 'context' },
  { id: 'sun', label: 'Exposição solar recente', group: 'context' },
  { id: 'cold', label: 'Frio', group: 'context' },
  { id: 'trauma', label: 'Trauma / injeção / procedimento', group: 'context' },
  { id: 'venous', label: 'Insuficiência venosa / estase', group: 'context' },
  { id: 'diabetes', label: 'Diabetes', group: 'context' },
  { id: 'thyroid', label: 'Doença tireoidiana', group: 'context' },
  { id: 'liver', label: 'Hepatopatia / álcool', group: 'context' },
  { id: 'renal', label: 'Doença renal / diálise', group: 'context' },
  { id: 'ibd', label: 'Doença inflamatória intestinal', group: 'context' },
  { id: 'autoimmune', label: 'Doença do tecido conjuntivo', group: 'context' },
  { id: 'malignancy', label: 'Neoplasia / doença hematológica', group: 'context' },
  { id: 'immunosuppression', label: 'Imunossupressão / HIV', group: 'context' },
  { id: 'transplant', label: 'Transplante / TMO', group: 'context' },
  { id: 'travel', label: 'Área endêmica / zona rural', group: 'context' },
  { id: 'family', label: 'História familiar', group: 'context' },
]

export const HISTOLOGY: HistologyItem[] = [
  // Camada córnea
  { id: 'parakeratosis-focal', label: 'Paraceratose focal / em montículos', group: 'corneum' },
  { id: 'parakeratosis-confluent', label: 'Paraceratose confluente', group: 'corneum' },
  { id: 'neutrophils-corneum', label: 'Neutrófilos na córnea (Munro)', group: 'corneum' },
  { id: 'orthokeratosis-compact', label: 'Ortoceratose compacta', group: 'corneum' },
  { id: 'alternating-keratosis', label: 'Orto e paraceratose alternadas (tabuleiro)', group: 'corneum' },
  { id: 'hypergranulosis', label: 'Hipergranulose', group: 'corneum' },
  { id: 'hypogranulosis', label: 'Hipogranulose', group: 'corneum' },
  { id: 'follicular-plug', label: 'Tampões foliculares', group: 'corneum' },
  { id: 'crust', label: 'Crosta sero-hemática / erosão', group: 'corneum' },
  { id: 'hyphae', label: 'Hifas ou leveduras na córnea', group: 'corneum' },
  { id: 'mite', label: 'Ácaro, ovos ou fezes na córnea', group: 'corneum' },
  // Epiderme
  { id: 'spongiosis', label: 'Espongiose', group: 'epidermis' },
  { id: 'spongiotic-vesicle', label: 'Vesículas espongióticas', group: 'epidermis' },
  { id: 'eosinophilic-spongiosis', label: 'Espongiose eosinofílica', group: 'epidermis' },
  { id: 'langerhans-microabscess', label: 'Microabscessos de Langerhans', group: 'epidermis' },
  { id: 'acanthosis-regular', label: 'Acantose psoriasiforme regular', group: 'epidermis' },
  { id: 'acanthosis-irregular', label: 'Acantose irregular', group: 'epidermis' },
  { id: 'thin-suprapapillary', label: 'Placas suprapapilares finas com vasos dilatados', group: 'epidermis' },
  { id: 'papillomatosis', label: 'Papilomatose', group: 'epidermis' },
  { id: 'atrophy-epidermis', label: 'Atrofia epidérmica', group: 'epidermis' },
  { id: 'saw-tooth', label: 'Cristas em dente de serra', group: 'epidermis' },
  { id: 'wedge-hypergranulosis', label: 'Hipergranulose em cunha', group: 'epidermis' },
  { id: 'vacuolar', label: 'Vacuolização da basal', group: 'epidermis' },
  { id: 'necrotic-keratinocytes', label: 'Queratinócitos necróticos / corpos de Civatte', group: 'epidermis' },
  { id: 'satellite-necrosis', label: 'Necrose de célula satélite', group: 'epidermis' },
  { id: 'full-thickness-necrosis', label: 'Necrose epidérmica de espessura total', group: 'epidermis' },
  { id: 'pale-upper-epidermis', label: 'Palidez ou necrose da epiderme superior', group: 'epidermis' },
  { id: 'acantholysis', label: 'Acantólise', group: 'epidermis' },
  { id: 'dyskeratosis', label: 'Disceratose (corpos redondos e grãos)', group: 'epidermis' },
  { id: 'ballooning', label: 'Balonização / multinucleação viral', group: 'epidermis' },
  { id: 'kogoj', label: 'Pústula espongiforme de Kogoj', group: 'epidermis' },
  { id: 'subcorneal-pustule', label: 'Pústula subcórnea', group: 'epidermis' },
  { id: 'exocytosis-neutrophils', label: 'Exocitose de neutrófilos', group: 'epidermis' },
  { id: 'epidermotropism', label: 'Epidermotropismo / linfócitos enfileirados na basal', group: 'epidermis' },
  { id: 'pautrier', label: 'Microabscessos de Pautrier', group: 'epidermis' },
  // Junção e bolhas
  { id: 'bmz-thickening', label: 'Membrana basal espessada (PAS)', group: 'junction' },
  { id: 'pigment-incontinence', label: 'Melanófagos / incontinência pigmentar', group: 'junction' },
  { id: 'max-joseph', label: 'Fendas de Max Joseph', group: 'junction' },
  { id: 'subepidermal-cell-poor', label: 'Bolha subepidérmica pobre em células', group: 'junction' },
  { id: 'subepidermal-eos', label: 'Bolha subepidérmica com eosinófilos', group: 'junction' },
  { id: 'subepidermal-neut', label: 'Bolha subepidérmica com neutrófilos / microabscessos papilares', group: 'junction' },
  { id: 'suprabasal-cleft', label: 'Fenda suprabasal (lápides)', group: 'junction' },
  { id: 'intraepidermal-blister', label: 'Vesícula intraepidérmica alta', group: 'junction' },
  { id: 'festooning', label: 'Festonamento papilar / caterpillar bodies', group: 'junction' },
  // Infiltrado dérmico
  { id: 'lymphocytic-superficial', label: 'Perivascular superficial linfocitário', group: 'infiltrate' },
  { id: 'superficial-and-deep', label: 'Infiltrado superficial e profundo', group: 'infiltrate' },
  { id: 'sparse-infiltrate', label: 'Infiltrado escasso', group: 'infiltrate' },
  { id: 'band-like', label: 'Infiltrado em faixa', group: 'infiltrate' },
  { id: 'wedge-infiltrate', label: 'Infiltrado em cunha', group: 'infiltrate' },
  { id: 'periadnexal', label: 'Infiltrado periadnexal / periécrino', group: 'infiltrate' },
  { id: 'eosinophils', label: 'Eosinófilos', group: 'infiltrate' },
  { id: 'flame-figures', label: 'Figuras em chama', group: 'infiltrate' },
  { id: 'neutrophils-dermis', label: 'Neutrófilos dérmicos / leucocitoclasia sem vasculite', group: 'infiltrate' },
  { id: 'plasma-cells', label: 'Plasmócitos', group: 'infiltrate' },
  { id: 'mast-cells', label: 'Mastócitos aumentados', group: 'infiltrate' },
  { id: 'interstitial-histiocytes', label: 'Histiócitos intersticiais ("derme ocupada")', group: 'infiltrate' },
  { id: 'sarcoidal-granuloma', label: 'Granulomas sarcoidais "nus"', group: 'infiltrate' },
  { id: 'tuberculoid-granuloma', label: 'Granulomas tuberculoides com necrose caseosa', group: 'infiltrate' },
  { id: 'palisaded-granuloma', label: 'Granuloma em paliçada', group: 'infiltrate' },
  { id: 'suppurative-granuloma', label: 'Granuloma supurativo', group: 'infiltrate' },
  { id: 'foreign-body-giant-cells', label: 'Células gigantes de corpo estranho', group: 'infiltrate' },
  { id: 'foamy-histiocytes', label: 'Histiócitos espumosos / xantomizados', group: 'infiltrate' },
  { id: 'atypical-lymphocytes', label: 'Linfócitos atípicos / cerebriformes', group: 'infiltrate' },
  { id: 'lymphoid-follicles', label: 'Folículos linfoides / infiltrado nodular denso', group: 'infiltrate' },
  { id: 'diffuse-dermal-infiltrate', label: 'Infiltrado difuso que ocupa toda a derme', group: 'infiltrate' },
  // Vasos e estroma
  { id: 'papillary-edema', label: 'Edema papilar / subepidérmico', group: 'stroma' },
  { id: 'papillary-fibrosis', label: 'Colágeno papilar em feixes verticais', group: 'stroma' },
  { id: 'mucin', label: 'Mucina dérmica', group: 'stroma' },
  { id: 'lcv', label: 'Vasculite leucocitoclástica (fibrina + poeira nuclear)', group: 'stroma' },
  { id: 'lymphocytic-vasculitis', label: 'Vasculite linfocitária', group: 'stroma' },
  { id: 'medium-vessel-vasculitis', label: 'Vasculite de vaso médio (derme profunda / subcutâneo)', group: 'stroma' },
  { id: 'thrombi', label: 'Trombos / vasculopatia oclusiva', group: 'stroma' },
  { id: 'rbc-extravasation', label: 'Hemácias extravasadas / hemossiderina', group: 'stroma' },
  { id: 'dilated-vessels', label: 'Vasos dilatados / telangiectasias', group: 'stroma' },
  { id: 'sclerosis', label: 'Colágeno hialinizado / esclerose', group: 'stroma' },
  { id: 'thick-collagen', label: 'Feixes colágenos espessados com perda de anexos', group: 'stroma' },
  { id: 'homogenized-papillary', label: 'Homogeneização do colágeno papilar', group: 'stroma' },
  { id: 'necrobiosis', label: 'Colágeno degenerado / necrobiose', group: 'stroma' },
  { id: 'elastophagocytosis', label: 'Elastofagocitose / perda de fibras elásticas', group: 'stroma' },
  { id: 'solar-elastosis', label: 'Elastose solar intensa', group: 'stroma' },
  { id: 'amyloid', label: 'Depósito amiloide / hialino', group: 'stroma' },
  { id: 'calcification', label: 'Calcificação dérmica ou vascular', group: 'stroma' },
  { id: 'transepidermal-elimination', label: 'Eliminação transepidérmica', group: 'stroma' },
  // Anexos
  { id: 'folliculitis-neutrophilic', label: 'Foliculite neutrofílica / pústula folicular', group: 'adnexa' },
  { id: 'folliculitis-lymphocytic', label: 'Foliculite linfocitária', group: 'adnexa' },
  { id: 'follicular-rupture', label: 'Ruptura folicular com reação à queratina', group: 'adnexa' },
  { id: 'perifollicular-fibrosis', label: 'Fibrose perifolicular concêntrica', group: 'adnexa' },
  { id: 'follicular-miniaturization', label: 'Miniaturização folicular / mais velos', group: 'adnexa' },
  { id: 'catagen-telogen', label: 'Mais catágenos e telógenos', group: 'adnexa' },
  { id: 'peribulbar-lymphocytes', label: 'Linfócitos peribulbares (enxame de abelhas)', group: 'adnexa' },
  { id: 'follicular-mucinosis', label: 'Mucinose folicular', group: 'adnexa' },
  { id: 'sebaceous-loss', label: 'Perda de glândulas sebáceas', group: 'adnexa' },
  { id: 'hair-shaft-damage', label: 'Hastes distorcidas / tricomalácia / cilindros pigmentares', group: 'adnexa' },
  { id: 'eccrine-neutrophils', label: 'Hidradenite neutrofílica écrina', group: 'adnexa' },
  { id: 'syringometaplasia', label: 'Metaplasia siringoescamosa', group: 'adnexa' },
  { id: 'demodex', label: 'Demodex no folículo', group: 'adnexa' },
  { id: 'fungal-hair', label: 'Fungos na haste (endo / ectótrix)', group: 'adnexa' },
  // Subcutâneo
  { id: 'septal-panniculitis', label: 'Paniculite septal', group: 'subcutis' },
  { id: 'lobular-panniculitis', label: 'Paniculite lobular', group: 'subcutis' },
  { id: 'fat-necrosis', label: 'Necrose gordurosa / lipofagia', group: 'subcutis' },
  { id: 'miescher', label: 'Granulomas radiais de Miescher', group: 'subcutis' },
  { id: 'lipomembranous', label: 'Alteração lipomembranosa', group: 'subcutis' },
  { id: 'hyaline-fat-necrosis', label: 'Necrose hialina da gordura', group: 'subcutis' },
  { id: 'saponification', label: 'Saponificação / adipócitos fantasma', group: 'subcutis' },
  { id: 'needle-clefts', label: 'Fendas em agulha nos adipócitos', group: 'subcutis' },
  { id: 'rimming-lymphocytes', label: 'Linfócitos atípicos contornando adipócitos', group: 'subcutis' },
  { id: 'septal-fibrosis', label: 'Septos fibrosados com lóbulos atróficos', group: 'subcutis' },
  // Organismos, colorações e IF
  { id: 'polarizable', label: 'Material birrefringente à luz polarizada', group: 'special' },
  { id: 'pas-positive', label: 'PAS / Grocott positivo', group: 'special' },
  { id: 'afb-positive', label: 'BAAR (Ziehl / Fite) positivo', group: 'special' },
  { id: 'bacteria', label: 'Bactérias (Gram)', group: 'special' },
  { id: 'viral-inclusions', label: 'Inclusões virais', group: 'special' },
  { id: 'parasite', label: 'Parasito / amastigotas', group: 'special' },
  { id: 'spirochetes', label: 'Espiroquetas (IHQ Treponema)', group: 'special' },
  { id: 'dif-linear-bmz', label: 'IF: linear IgG / C3 na ZMB', group: 'special' },
  { id: 'dif-linear-iga', label: 'IF: linear IgA na ZMB', group: 'special' },
  { id: 'dif-intercellular', label: 'IF: IgG intercelular', group: 'special' },
  { id: 'dif-granular-iga', label: 'IF: IgA granular nas papilas', group: 'special' },
  { id: 'dif-lupus-band', label: 'IF: banda lúpica granular na ZMB', group: 'special' },
  { id: 'dif-vascular-iga', label: 'IF: IgA na parede vascular', group: 'special' },
  { id: 'dif-cytoid', label: 'IF: corpos citoides / fibrinogênio na ZMB', group: 'special' },
  { id: 'dif-negative', label: 'IF direta negativa', group: 'special' },
]

export const PATTERN_GROUPS: { id: PatternGroup; label: string }[] = [
  { id: 'epidermal', label: 'Epiderme e junção' },
  { id: 'dermal', label: 'Derme' },
  { id: 'blister', label: 'Bolhas' },
  { id: 'adnexal', label: 'Anexos' },
  { id: 'deep', label: 'Subcutâneo' },
]

export const CLINICAL_GROUPS: { id: ClinicalGroup; label: string }[] = [
  { id: 'who', label: 'Quem' },
  { id: 'course', label: 'Curso e sintomas' },
  { id: 'lesion', label: 'Lesão elementar' },
  { id: 'where', label: 'Distribuição' },
  { id: 'context', label: 'Contexto' },
]

export const HISTOLOGY_GROUPS: { id: HistologyGroup; label: string }[] = [
  { id: 'corneum', label: 'Camada córnea' },
  { id: 'epidermis', label: 'Epiderme' },
  { id: 'junction', label: 'Junção e bolhas' },
  { id: 'infiltrate', label: 'Infiltrado dérmico' },
  { id: 'stroma', label: 'Vasos e estroma' },
  { id: 'adnexa', label: 'Anexos' },
  { id: 'subcutis', label: 'Subcutâneo' },
  { id: 'special', label: 'Organismos, colorações e IF' },
]

const patternById = new Map(PATTERNS.map((p) => [p.id, p]))
const clinicalById = new Map(CLINICAL.map((c) => [c.id, c]))
const histologyById = new Map(HISTOLOGY.map((h) => [h.id, h]))

export const findPattern = (id: string) => patternById.get(id)
export const findClinical = (id: string) => clinicalById.get(id)
export const findHistology = (id: string) => histologyById.get(id)

/** Rótulo de qualquer id do vocabulário, para as etiquetas dos resultados. */
export const labelOf = (id: string) => patternById.get(id)?.label ?? clinicalById.get(id)?.label ?? histologyById.get(id)?.label ?? id
