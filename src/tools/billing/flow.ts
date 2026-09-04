/* ==========================================================================
   flow.ts — o fluxograma da cobrança CBHPM em patologia, capítulo a
   capítulo da Cartilha de Instruções 2019. Textos em português porque a
   CBHPM é brasileira; a interface em volta é traduzida.
   ⚠️ Conteúdo para conferência: a cartilha indica a codificação, não fixa
   valores, e as operadoras podem ter regras contratuais próprias.
   ========================================================================== */

import { line, list, num, str, type Answers, type Flow, type ResultData, type Step } from './engine'

const ceilDiv = (a: number, b: number) => Math.ceil(a / b)

/* Exemplos de peças da cartilha (capítulo III), para preencher os números. */
export interface PieceExample {
  id: string
  label: string
  kind: 'simples' | 'complexa'
  extras: number
  margins: number
  lymphGroups: number
  detail: string
}

export const PIECE_EXAMPLES: PieceExample[] = [
  { id: 'gdp', label: 'Gastroduodenopancreatectomia', kind: 'complexa', extras: 5, margins: 4, lymphGroups: 1, detail: 'Estômago, duodeno, ampola/pâncreas, colédoco, vesícula (monobloco); margens anterior e posterior do pâncreas, pancreática e do processo uncinado; grupo de linfonodos — 4.06.01.22-6 × 10.' },
  { id: 'histSimples', label: 'Histerectomia simples (corpo e colo) por leiomioma', kind: 'simples', extras: 1, margins: 0, lymphGroups: 0, detail: 'Colo uterino como peça adicional — 4.06.01.20-0 × 1 + 4.06.01.22-6 × 1.' },
  { id: 'histEndometrio', label: 'Histerectomia radical + anexos por neoplasia de endométrio', kind: 'complexa', extras: 6, margins: 0, lymphGroups: 0, detail: 'Colo, istmo, ovário D, tuba D, ovário E, tuba E — 4.06.01.22-6 × 6.' },
  { id: 'histColo', label: 'Histerectomia radical + anexos por neoplasia de colo', kind: 'complexa', extras: 9, margins: 0, lymphGroups: 0, detail: 'Corpo, istmo, canal vaginal, paramétrios D e E, ovários e tubas — 4.06.01.22-6 × 9.' },
  { id: 'retossigmoide', label: 'Retossigmoidectomia por neoplasia', kind: 'complexa', extras: 1, margins: 3, lymphGroups: 1, detail: 'Margens proximal, distal e radial; divertículos (se houver); grupo de linfonodos do mesentério — 4.06.01.22-6 × 5.' },
  { id: 'mastectomia', label: 'Mastectomia', kind: 'complexa', extras: 2, margins: 1, lymphGroups: 1, detail: 'Pele, mamilo, margem profunda, grupo de linfonodos — 4.06.01.22-6 × 4.' },
  { id: 'fusoSimples', label: 'Fuso cutâneo por tumor não melanoma (até 3 cm)', kind: 'simples', extras: 0, margins: 3, lymphGroups: 0, detail: 'Margem profunda, margens do menor eixo, margens do maior eixo — 4.06.01.22-6 × 3.' },
  { id: 'fusoMelanoma', label: 'Fuso cutâneo por melanoma ou tumor > 3 cm', kind: 'complexa', extras: 0, margins: 5, lymphGroups: 0, detail: 'Margem profunda, dois menores eixos, dois maiores eixos — 4.06.01.22-6 × 5.' },
  { id: 'polipo', label: 'Pólipo', kind: 'simples', extras: 0, margins: 1, lymphGroups: 0, detail: 'Margem do pedículo — 4.06.01.20-0 × 1 + 4.06.01.22-6 × 1.' },
  { id: 'mucosectomia', label: 'Mucosectomia', kind: 'simples', extras: 0, margins: 3, lymphGroups: 0, detail: 'Margem profunda, margens do menor e do maior eixo — 4.06.01.22-6 × 3.' },
]

const SIMPLES_EXEMPLOS =
  'Exérese de cisto, fuso cutâneo, pólipo, linfonodo isolado, histerectomia simples, esplenectomia/apendicectomia/colecistectomia/nefrectomia/ooforectomia/orquiectomia/salpingectomia por motivo não tumoral, corneto nasal, gastroplastia, mamoplastia, ampliação de margem isolada, hemorroida, nodulectomia prostática ou mamária isolada, nodulectomia tumoral benigna, saco herniário, segmento ósseo não tumoral, tonsila…'
const COMPLEXA_EXEMPLOS =
  'Penectomia, colectomia, conização de colo, enterectomia, esofagectomia, esvaziamento ganglionar, exenteração ocular, gastrectomia, histerectomia radical, laringectomia, mastectomia, quadrantectomia, nefrectomia/orquiectomia tumoral, pneumectomia/lobectomia, prostatectomia, retossigmoidectomia, segmento ósseo tumoral, tireoidectomia, vulvectomia, fuso para melanoma ou tumor cutâneo > 3 cm, tumores > 7 cm, ressecções de órgãos parenquimatosos, placenta…'

const steps: Step[] = [
  {
    id: 'start',
    kind: 'choice',
    title: 'O que chegou ao laboratório?',
    hint: 'Escolha o tipo de material ou de procedimento. As perguntas seguintes vão até os códigos.',
    options: [
      { value: 'biopsia', label: 'Biópsia (fragmentos em frasco)', description: 'Endoscópica, agulha, punch, próstata, cell block, imprint…', next: 'biopsia' },
      { value: 'peca', label: 'Peça cirúrgica', description: 'Espécime de ressecção, simples ou complexa, com adicionais e margens.', next: 'pecaTipo' },
      { value: 'congelacao', label: 'Congelação (per operatório)', description: 'Exame durante a cirurgia, com ou sem deslocamento.', next: 'congelacao' },
      { value: 'paaf', label: 'PAAF (punção)', description: 'Ato de coleta e a citologia do material aspirado.', next: 'paafTipo' },
      { value: 'citoLiquido', label: 'Citologia de líquidos ou raspados', description: 'Pleural, ascítico, urina, líquor, escovado, raspado cutâneo…', next: 'citoLiquido' },
      { value: 'citoCervico', label: 'Citologia cervicovaginal', description: 'Papanicolaou, meio líquido, citologia hormonal.', next: 'citoCervicoTipo' },
      { value: 'revisao', label: 'Revisão de lâminas / cortes seriados', description: 'Revisão de caso externo ou estudo seriado protocolar.', next: 'revisao' },
      { value: 'coloracao', label: 'Colorações especiais', description: 'Histoquímica: PAS, Grocott, Giemsa, tricrômico, retículo…', next: 'coloracao' },
      { value: 'ihq', label: 'Imuno-histoquímica', description: 'Painel (2 a 5 anticorpos) ou reação isolada.', next: 'ihq' },
      { value: 'me', label: 'Microscopia eletrônica', next: 'me' },
      { value: 'molecular', label: 'Patologia molecular', description: 'Captura híbrida, hibridização in situ, imunofluorescência, citometria, MSI…', next: 'molecularTipo' },
      { value: 'amputacao', label: 'Amputação de membro', next: 'amputacaoTipo' },
      { value: 'necropsia', label: 'Necropsia', next: 'necropsiaTipo' },
    ],
  },

  /* ---------------- Capítulo I — biópsias ---------------- */
  {
    id: 'biopsia',
    kind: 'form',
    title: 'Conte os frascos por número de fragmentos',
    hint: 'Cada frasco (ou topografia identificada dentro do frasco) é uma cobrança. Frascos com até 2 fragmentos usam o código de biópsia simples; com 3 ou mais, o de múltiplos fragmentos. Imprints e cell blocks entram como biópsia simples, um por peça.',
    fields: [
      { key: 'frascosSimples', label: 'Frascos/topografias com até 2 fragmentos', min: 0, default: 1 },
      { key: 'frascosMultiplos', label: 'Frascos/topografias com 3 ou mais fragmentos', min: 0, default: 0 },
      { key: 'cellBlocks', label: 'Cell blocks ou imprints', min: 0, default: 0 },
    ],
    next: 'biopsiaResultado',
  },
  {
    id: 'biopsiaResultado',
    kind: 'result',
    title: 'Biópsias',
    compute: (a) => ({
      items: [
        ...line('biopsiaSimples', num(a, 'frascosSimples'), 'um por frasco/topografia com até 2 fragmentos'),
        ...line('multiplosFragmentos', num(a, 'frascosMultiplos'), 'um por frasco/topografia com 3 ou mais fragmentos'),
        ...line('biopsiaSimples', num(a, 'cellBlocks'), 'um por cell block ou imprint'),
      ],
      notes: [
        'Biópsias de áreas distintas implicam cobranças separadas, mesmo em um único laudo (Parecer SBP 47/2005).',
        'Múltiplos fragmentos de topografias diferentes no mesmo frasco: cada topografia identificada é uma cobrança.',
      ],
      warnings: [],
      rule: 'Capítulo I — 4.06.01.11-0 para amostra única (até 2 fragmentos por frasco), cell block e imprint; 4.06.01.19-6 para 3 ou mais fragmentos. Exemplos: sextante de próstata por topografia = 11-0 cada; lobo direito da próstata com ≥ 3 fragmentos = 19-6; curetagem uterina, RTU de próstata/bexiga = 19-6 por frasco.',
    }),
  },

  /* ---------------- Capítulos II e III — peças ---------------- */
  {
    id: 'pecaTipo',
    kind: 'choice',
    title: 'A peça é simples ou complexa?',
    hint: 'Simples: intervenção de pequeno porte, excisional, não fragmentada. Complexa: médio/grande porte, com finalidade diagnóstico-terapêutica e estadiamento.',
    options: [
      { value: 'simples', label: 'Peça simples', description: SIMPLES_EXEMPLOS, next: 'pecaNumeros' },
      { value: 'complexa', label: 'Peça complexa', description: COMPLEXA_EXEMPLOS, next: 'pecaNumeros' },
    ],
  },
  {
    id: 'pecaNumeros',
    kind: 'form',
    title: 'O que mais veio com a peça?',
    hint: 'Peças adicionais são estruturas do monobloco examinadas separadamente (ligamentos, cordão, ductos, epíplon, pele, lobo/istmo adjacente, cápsula, segmento contíguo…). Margens são cobradas por margem, com limite. Linfonodos são cobrados por grupo de até 6.',
    fields: [
      { key: 'frascos', label: 'Em quantos frascos a peça veio?', hint: 'Peça fracionada em frascos diferentes: o código principal repete por frasco. Nódulos múltiplos (mama, próstata, miomas): um por nódulo.', min: 1, default: 1 },
      { key: 'adicionais', label: 'Peças adicionais (estruturas do monobloco)', min: 0, default: 0 },
      { key: 'margens', label: 'Margens cirúrgicas avaliadas', hint: 'Máximo cobrável: 3 em peça simples, 5 em peça complexa.', min: 0, default: 0 },
      { key: 'linfonodos', label: 'Linfonodos dissecados', hint: 'Cada 6 linfonodos (ou fração) = 1 grupo.', min: 0, default: 0 },
    ],
    next: 'pecaResultado',
  },
  {
    id: 'pecaResultado',
    kind: 'result',
    title: 'Peça cirúrgica',
    compute: (a) => pecaResult(a),
  },

  /* ---------------- Capítulo IV — congelação ---------------- */
  {
    id: 'congelacao',
    kind: 'form',
    title: 'Congelação',
    hint: 'O primeiro espécime usa o código com ou sem deslocamento; cada espécime adicional ou margem usa 4.06.01.02-1 (até 5). Os cortes de parafina posteriores são cobrados à parte, como peça.',
    fields: [
      { key: 'deslocamento', label: 'Houve deslocamento do patologista até o hospital? (1 = sim, 0 = não)', min: 0, max: 1, default: 0 },
      { key: 'adicionais', label: 'Espécimes adicionais ou margens avaliadas na congelação', min: 0, default: 0 },
    ],
    next: 'congelacaoResultado',
  },
  {
    id: 'congelacaoResultado',
    kind: 'result',
    title: 'Congelação',
    compute: (a) => {
      const desloc = num(a, 'deslocamento') >= 1
      const extras = num(a, 'adicionais')
      const capped = Math.min(extras, 5)
      return {
        items: [
          ...line(desloc ? 'congelacaoCom' : 'congelacaoSem', 1, 'primeiro espécime'),
          ...line('congelacaoAdicional', capped, 'por espécime adicional ou margem (máx. 5)'),
        ],
        notes: ['Exemplo da cartilha: setorectomia de mama com tumor + margens = 4.06.01.01-3 × 1 + 4.06.01.02-1 × 5, mesmo havendo seis margens.'],
        warnings: extras > 5 ? [`Você informou ${extras} adicionais/margens; a cartilha limita a 5 em peças oncológicas radicais.`] : [],
        rule: 'Capítulo IV — 4.06.01.01-3 sem deslocamento; 4.06.01.03-0 com deslocamento (primeiro espécime); 4.06.01.02-1 para cada peça adicional ou margem. Não inclui os cortes de parafina posteriores.',
      }
    },
  },

  /* ---------------- Capítulo V — PAAF ---------------- */
  {
    id: 'paafTipo',
    kind: 'choice',
    title: 'A punção foi de estrutura superficial ou profunda?',
    hint: 'Superficial: tireoide, mama, linfonodo palpável, glândula salivar… Profunda: guiada por imagem em órgãos internos.',
    options: [
      { value: 'superficial', label: 'Superficial', next: 'paafNumeros' },
      { value: 'profunda', label: 'Profunda', next: 'paafNumeros' },
    ],
  },
  {
    id: 'paafNumeros',
    kind: 'form',
    title: 'Quantas lesões e quantas lâminas?',
    hint: 'Cada lesão puncionada é um ato (quadrantes diferentes da mama ou nódulos diferentes da tireoide são punções distintas). O deslocamento é cobrado só na primeira lesão. A citologia é cobrada por lesão, a cada 5 lâminas.',
    fields: [
      { key: 'deslocamento', label: 'Houve deslocamento do patologista? (1 = sim, 0 = não)', min: 0, max: 1, default: 0 },
      { key: 'lesoes', label: 'Lesões puncionadas', min: 1, default: 1 },
      { key: 'laminas', label: 'Lâminas de cada lesão (separe por vírgula, ex.: 8, 6, 5)', hint: 'Uma quantidade por lesão, na ordem.', list: true },
      { key: 'cellBlocks', label: 'Cell blocks feitos', min: 0, default: 0 },
    ],
    next: 'paafResultado',
  },
  {
    id: 'paafResultado',
    kind: 'result',
    title: 'PAAF',
    compute: (a) => {
      const superficial = str(a, 'paafTipo') !== 'profunda'
      const desloc = num(a, 'deslocamento') >= 1
      const lesoes = Math.max(1, num(a, 'lesoes', 1))
      const laminas = list(a, 'laminas')
      const citoQty = laminas.reduce((s, n) => s + ceilDiv(n, 5), 0)
      const firstCode = desloc ? (superficial ? 'paafSupCom' : 'paafProfCom') : superficial ? 'paafSupSem' : 'paafProfSem'
      const restCode = superficial ? 'paafSupSem' : 'paafProfSem'
      const warnings: string[] = []
      if (laminas.length && laminas.length !== lesoes) warnings.push(`Você informou ${lesoes} lesão(ões) mas ${laminas.length} quantidade(s) de lâminas; a citologia foi calculada pelas quantidades informadas.`)
      return {
        items: [
          ...line(firstCode, 1, desloc ? 'primeira lesão, com deslocamento' : 'primeira lesão'),
          ...line(restCode, lesoes - 1, 'demais lesões, sem deslocamento'),
          ...line('citoPaaf', citoQty, 'citologia: 1 a cada 5 lâminas, por lesão'),
          ...line('biopsiaSimples', num(a, 'cellBlocks'), 'um por cell block'),
        ],
        notes: [
          'Exemplo da cartilha: 3 nódulos de tireoide com deslocamento = 4.06.01.09-9 × 1 + 4.06.01.07-2 × 2; lâminas 8 / 6 / 5 = 4.06.01.25-0 × 2 + × 2 + × 1.',
          'O ato de puncionar não inclui a análise do material; a citologia vai por 4.06.01.25-0 (até 5 lâminas) e o cell block por 4.06.01.11-0.',
        ],
        warnings,
        rule: 'Capítulo V — 4.06.01.07-2 / 08-0 sem deslocamento (superficial / profunda); 4.06.01.09-9 / 10-2 com deslocamento, apenas para a primeira região puncionada.',
      }
    },
  },

  /* ---------------- Capítulo VI — líquidos ---------------- */
  {
    id: 'citoLiquido',
    kind: 'form',
    title: 'Quantos frascos ou topografias?',
    hint: 'Escovado brônquico, lavado, líquidos pleural/pericárdico/ascítico, líquor, urina, líquido de cisto, secreção mamária, raspado cutâneo ou conjuntival. Topografias distintas são cobranças separadas; cada frasco processado é uma cobrança.',
    fields: [
      { key: 'frascos', label: 'Frascos/topografias de líquido ou raspado', min: 1, default: 1 },
      { key: 'cellBlocks', label: 'Cell blocks feitos', min: 0, default: 0 },
    ],
    next: 'citoLiquidoResultado',
  },
  {
    id: 'citoLiquidoResultado',
    kind: 'result',
    title: 'Citologia de líquidos e raspados',
    compute: (a) => ({
      items: [
        ...line('citoLiquidos', num(a, 'frascos', 1), 'um por frasco/topografia'),
        ...line('biopsiaSimples', num(a, 'cellBlocks'), 'um por cell block'),
      ],
      notes: ['Exemplo da cartilha: líquido pleural D e E com cell block de cada lado = 2 × 4.06.01.12-9 + cell blocks em 4.06.01.11-0.'],
      warnings: [],
      rule: 'Capítulo VI — 4.06.01.12-9 para líquidos e raspados; 4.06.01.11-0 para imprints e cell blocks.',
    }),
  },

  /* ---------------- Capítulo VII — cervicovaginal ---------------- */
  {
    id: 'citoCervicoTipo',
    kind: 'choice',
    title: 'Que exame cervicovaginal?',
    options: [
      { value: 'convencional', label: 'Citologia oncótica convencional (Papanicolaou)', description: 'Colpocitologia oncótica e microflora, colheita tríplice em uma lâmina.', next: 'citoCervicoResultado' },
      { value: 'meioLiquido', label: 'Citologia em meio líquido', description: 'Cobrado por região/frasco enviado em separado.', next: 'citoMeioLiquido' },
      { value: 'hormonal', label: 'Citologia hormonal isolada', description: 'Índice de maturação, citologia da gravidez ou lactação.', next: 'citoCervicoResultado' },
      { value: 'hormonalSeriada', label: 'Citologia hormonal seriada', description: 'Três ou mais lâminas em dias não consecutivos do ciclo — um código para o conjunto.', next: 'citoCervicoResultado' },
    ],
  },
  {
    id: 'citoMeioLiquido',
    kind: 'form',
    title: 'Quantos frascos/regiões?',
    fields: [{ key: 'frascos', label: 'Frascos ou regiões enviados em separado', min: 1, default: 1 }],
    next: 'citoCervicoResultado',
  },
  {
    id: 'citoCervicoResultado',
    kind: 'result',
    title: 'Citologia cervicovaginal',
    compute: (a) => {
      const tipo = str(a, 'citoCervicoTipo')
      if (tipo === 'meioLiquido') {
        return {
          items: line('citoMeioLiquido', num(a, 'frascos', 1), 'um por frasco/região'),
          notes: ['Aplicável a qualquer órgão, não só ao colo uterino.'],
          warnings: [],
          rule: 'Capítulo VII — 4.06.01.32-3, citopatologia em meio líquido, por região/frasco enviado em separado.',
        }
      }
      if (tipo === 'hormonal') {
        return { items: line('citoHormonal', 1, 'por exame'), notes: ['O laudo pode ser combinado com o da citologia oncótica.'], warnings: [], rule: 'Capítulo VII — 4.06.01.16-1, citologia hormonal isolada.' }
      }
      if (tipo === 'hormonalSeriada') {
        return { items: line('citoHormonalSeriada', 1, 'um código para todo o conjunto de lâminas'), notes: ['Três ou mais lâminas colhidas em dias não consecutivos do ciclo.'], warnings: [], rule: 'Capítulo VII — 4.06.01.14-5, citologia hormonal seriada (conjunto).' }
      }
      return {
        items: line('citoCervico', 1, 'por exame'),
        notes: ['Normalmente uma lâmina; ectocérvice, endocérvice e canal vaginal em separado podem chegar a 1–3 lâminas — confira a política contratual antes de cobrar por lâmina.'],
        warnings: [],
        rule: 'Capítulo VII — 4.06.01.13-7, citopatologia cervicovaginal oncótica e microflora.',
      }
    },
  },

  /* ---------------- Capítulo VIII — revisão / seriados ---------------- */
  {
    id: 'revisao',
    kind: 'form',
    title: 'Quantos itens do mapa de clivagem?',
    hint: 'A revisão é cobrada por item descrito no mapa de clivagem do laudo original (ex.: A tumor, B margem profunda, C parênquima, D pele, E mamilo = × 5). Recorte histológico seriado protocolar (cone/CAF, linfonodo sentinela) usa o mesmo código, uma vez, além do código principal.',
    fields: [
      { key: 'itens', label: 'Itens revisados (letras do mapa de clivagem)', min: 0, default: 1 },
      { key: 'seriados', label: 'Estudos seriados protocolares (cone, sentinela…)', min: 0, default: 0 },
    ],
    next: 'revisaoResultado',
  },
  {
    id: 'revisaoResultado',
    kind: 'result',
    title: 'Revisão de lâminas e cortes seriados',
    compute: (a) => ({
      items: [
        ...line('revisao', num(a, 'itens'), 'um por item do mapa de clivagem'),
        ...line('revisao', num(a, 'seriados'), 'um por estudo seriado protocolar'),
      ],
      notes: [
        'Reclive entra separado.',
        'Exemplos da cartilha: linfonodo sentinela = 4.06.01.20-0 × 1 + 4.06.01.15-3 × 1; cone (CAF) = 4.06.01.21-8 × 1 + 4.06.01.22-6 × 2 (margens ecto e endocervical) + 4.06.01.15-3 × 1.',
      ],
      warnings: [],
      rule: 'Capítulo VIII — 4.06.01.15-3 a cada revisão, valorada individualmente pelo mapa de clivagem; também para cortes seriados protocolares e cortes semifinos sem microscopia eletrônica.',
    }),
  },

  /* ---------------- Capítulo IX — colorações ---------------- */
  {
    id: 'coloracao',
    kind: 'form',
    title: 'Quantas colorações foram feitas?',
    hint: 'Uma cobrança por coloração realizada — inclusive a mesma coloração em blocos diferentes (Giemsa em antro e em corpo = 2).',
    fields: [{ key: 'coloracoes', label: 'Colorações especiais realizadas', min: 1, default: 1 }],
    next: 'coloracaoResultado',
  },
  {
    id: 'coloracaoResultado',
    kind: 'result',
    title: 'Colorações especiais',
    compute: (a) => ({
      items: line('coloracaoEspecial', num(a, 'coloracoes', 1), 'uma por coloração realizada'),
      notes: ['Uso protocolar: fígado (tricrômico, picrosírius, retículo), medula óssea (retículo), granulomas (BAAR + fungos = 2).'],
      warnings: [],
      rule: 'Capítulo IX — 4.06.01.26-9 a cada coloração realizada.',
    }),
  },

  /* ---------------- Capítulo X — IHQ ---------------- */
  {
    id: 'ihq',
    kind: 'form',
    title: 'Quantos anticorpos foram usados?',
    hint: 'Painel = 2 a 5 anticorpos (um código por painel). Acima disso, completa-se com outro painel (se sobrarem 2 ou mais) ou com reação isolada (se sobrar 1).',
    fields: [{ key: 'anticorpos', label: 'Anticorpos realizados', min: 1, default: 5 }],
    next: 'ihqResultado',
  },
  {
    id: 'ihqResultado',
    kind: 'result',
    title: 'Imuno-histoquímica',
    compute: (a) => {
      const n = Math.max(1, num(a, 'anticorpos', 1))
      let paineis = Math.floor(n / 5)
      const resto = n % 5
      let isoladas = 0
      if (resto === 1) isoladas = 1
      else if (resto >= 2) paineis += 1
      return {
        items: [
          ...line('ihqPainel', paineis, 'um por painel de 2 a 5 anticorpos'),
          ...line('ihqIsolada', isoladas, 'anticorpo que sobrou sozinho'),
        ],
        notes: [
          'Exemplos da cartilha: 5 anticorpos (CK7, CK20, CDX2, TTF1, Napsin) = 1 painel; 8 anticorpos = 2 painéis (5 + 3); 6 anticorpos = 1 painel + 1 reação isolada.',
        ],
        warnings: [],
        rule: 'Capítulo X — 4.06.01.17-0 painel (2 a 5 reações); 4.06.01.18-8 reação isolada (um único anticorpo, ex.: CMV).',
      }
    },
  },

  /* ---------------- Capítulo XI — ME ---------------- */
  {
    id: 'me',
    kind: 'form',
    title: 'Quantos espécimes na microscopia eletrônica?',
    fields: [{ key: 'especimes', label: 'Espécimes analisados', min: 1, default: 1 }],
    next: 'meResultado',
  },
  {
    id: 'meResultado',
    kind: 'result',
    title: 'Microscopia eletrônica',
    compute: (a) => ({
      items: line('microscopiaEletronica', num(a, 'especimes', 1), 'um por espécime, incluindo documentação fotográfica'),
      notes: [],
      warnings: [],
      rule: 'Capítulo XI — 4.06.01.06-4 para cada espécime analisado; espécimes múltiplos com portes separados.',
    }),
  },

  /* ---------------- Capítulo XII — molecular ---------------- */
  {
    id: 'molecularTipo',
    kind: 'choice',
    title: 'Qual técnica?',
    hint: 'Regra geral: um código por sonda, marcador ou agente pesquisado.',
    options: [
      { value: 'capturaHibrida', label: 'Captura híbrida', description: 'Ex.: HPV baixo risco e alto risco em separado = × 2.', next: 'molecularNumeros' },
      { value: 'hibridizacaoInSitu', label: 'Hibridização in situ (painel)', next: 'molecularNumeros' },
      { value: 'imunofluorescencia', label: 'Imunofluorescência', next: 'molecularNumeros' },
      { value: 'citometriaFluxo', label: 'Citometria de fluxo', description: 'Por monoclonal pesquisado.', next: 'molecularNumeros' },
      { value: 'citometriaImagens', label: 'Citometria de imagens', next: 'molecularNumeros' },
      { value: 'msi', label: 'Instabilidade de microssatélites (MSI) por PCR', next: 'molecularNumeros' },
      { value: 'dnaCitometria', label: 'DNA citometria de fluxo (parafina / outros)', next: 'molecularNumeros' },
    ],
  },
  {
    id: 'molecularNumeros',
    kind: 'form',
    title: 'Quantas sondas, marcadores ou agentes?',
    fields: [{ key: 'unidades', label: 'Sondas / marcadores / agentes pesquisados', min: 1, default: 1 }],
    next: 'molecularResultado',
  },
  {
    id: 'molecularResultado',
    kind: 'result',
    title: 'Patologia molecular',
    compute: (a) => {
      const code = str(a, 'molecularTipo') as 'capturaHibrida' | 'hibridizacaoInSitu' | 'imunofluorescencia' | 'citometriaFluxo' | 'citometriaImagens' | 'msi' | 'dnaCitometria'
      return {
        items: line(code || 'capturaHibrida', num(a, 'unidades', 1), 'um por sonda, marcador ou agente'),
        notes: ['O patologista é o responsável pelo laudo de patologia molecular (Parecer SBP 145/2017).'],
        warnings: [],
        rule: 'Capítulo XII — 4.06.01.29-3 captura híbrida; 28-5 hibridização in situ; 27-7 imunofluorescência; 30-7 citometria de fluxo (por monoclonal); 31-5 citometria de imagens; 43-9 MSI por PCR; 38-2 DNA citometria de fluxo.',
      }
    },
  },

  /* ---------------- Capítulo XIII — amputação ---------------- */
  {
    id: 'amputacaoTipo',
    kind: 'choice',
    title: 'A amputação foi por causa oncológica?',
    options: [
      { value: 'onco', label: 'Sim, causa oncológica', next: 'amputacaoNumeros' },
      { value: 'naoOnco', label: 'Não (vascular, trauma, infecção…)', next: 'amputacaoNumeros' },
    ],
  },
  {
    id: 'amputacaoNumeros',
    kind: 'form',
    title: 'O que foi avaliado além do tumor/lesão?',
    hint: 'Cada estrutura adicional (partes moles, osso, grandes vasos e nervos), cada margem (cutânea, óssea, de partes moles) e cada grupo de até 6 linfonodos é um 4.06.01.22-6.',
    fields: [
      { key: 'adicionais', label: 'Estruturas adicionais (partes moles, osso, vasos/nervos…)', min: 0, default: 0 },
      { key: 'margens', label: 'Margens (cutânea, óssea, partes moles…)', min: 0, default: 0 },
      { key: 'linfonodos', label: 'Linfonodos dissecados', min: 0, default: 0 },
    ],
    next: 'amputacaoResultado',
  },
  {
    id: 'amputacaoResultado',
    kind: 'result',
    title: 'Amputação de membro',
    compute: (a) => {
      const onco = str(a, 'amputacaoTipo') === 'onco'
      const grupos = ceilDiv(num(a, 'linfonodos'), 6)
      return {
        items: [
          ...line(onco ? 'amputacaoOnco' : 'amputacaoNaoOnco', 1, 'peça principal'),
          ...line('pecaAdicional', num(a, 'adicionais'), 'uma por estrutura adicional'),
          ...line('pecaAdicional', num(a, 'margens'), 'uma por margem'),
          ...line('pecaAdicional', grupos, 'um por grupo de até 6 linfonodos'),
        ],
        notes: ['Exemplo da cartilha (câncer de pele avançado): tumor + partes moles + osso + vasos/nervos + margens cutânea, óssea e de partes moles + linfonodos.'],
        warnings: [],
        rule: 'Capítulo XIII — 4.06.01.24-2 causa oncológica; 4.06.01.23-4 sem causa oncológica; estruturas, margens e grupos de linfonodos em 4.06.01.22-6.',
      }
    },
  },

  /* ---------------- Capítulo XIV — necropsia ---------------- */
  {
    id: 'necropsiaTipo',
    kind: 'choice',
    title: 'Que tipo de necropsia?',
    hint: 'Óbito fetal: menos de 20 semanas, ou menos de 500 g, ou menos de 25 cm. Acima de qualquer um desses limites é natimorto.',
    options: [
      { value: 'adulto', label: 'Adulto, criança ou natimorto', next: 'necropsiaNumeros' },
      { value: 'feto', label: 'Embrião ou feto (até 500 g)', next: 'necropsiaNumeros' },
    ],
  },
  {
    id: 'necropsiaNumeros',
    kind: 'form',
    title: 'Quantos corpos?',
    hint: 'Gestação gemelar: um código por embrião/feto/natimorto.',
    fields: [{ key: 'corpos', label: 'Embriões, fetos ou natimortos', min: 1, default: 1 }],
    next: 'necropsiaResultado',
  },
  {
    id: 'necropsiaResultado',
    kind: 'result',
    title: 'Necropsia',
    compute: (a) => ({
      items: line(str(a, 'necropsiaTipo') === 'feto' ? 'necropsiaFeto' : 'necropsiaAdulto', num(a, 'corpos', 1), 'um por corpo'),
      notes: ['Inclui estudo externo, interno, microscopia e laudo.'],
      warnings: [],
      rule: 'Capítulo XIV — 4.06.01.04-8 adulto/criança/natimorto; 4.06.01.05-6 embrião/feto até 500 g.',
    }),
  },
]

function pecaResult(a: Answers): ResultData {
  const complexa = str(a, 'pecaTipo') === 'complexa'
  const frascos = Math.max(1, num(a, 'frascos', 1))
  const adicionais = num(a, 'adicionais')
  const margens = num(a, 'margens')
  const cap = complexa ? 5 : 3
  const margensCobradas = Math.min(margens, cap)
  const grupos = ceilDiv(num(a, 'linfonodos'), 6)
  const warnings: string[] = []
  if (margens > cap) warnings.push(`Você informou ${margens} margens; a cartilha admite no máximo ${cap} em peça ${complexa ? 'complexa' : 'simples'}. Foram consideradas ${cap}.`)
  return {
    items: [
      ...line(complexa ? 'pecaComplexa' : 'pecaSimples', frascos, frascos > 1 ? 'um por frasco em que a peça veio' : 'peça principal'),
      ...line('pecaAdicional', adicionais, 'uma por estrutura do monobloco'),
      ...line('pecaAdicional', margensCobradas, `uma por margem (máx. ${cap})`),
      ...line('pecaAdicional', grupos, 'um por grupo de até 6 linfonodos'),
    ],
    notes: [
      'Fatura-se uma vez o código da peça e, a seguir, o código de peças adicionais para cada estrutura, margem e grupo de linfonodos.',
      'O limite vale para margens; não para peças adicionais nem para grupos de linfonodos.',
      'Vesícula, ovário etc. enviados em frasco separado (não em monobloco) são peça simples à parte.',
    ],
    warnings,
    rule: complexa
      ? 'Capítulos II e III — 4.06.01.21-8 (peça complexa) × 1 + 4.06.01.22-6 por estrutura adicional, margem (até 5) e grupo de até 6 linfonodos.'
      : 'Capítulos II e III — 4.06.01.20-0 (peça simples) × 1 + 4.06.01.22-6 por estrutura adicional, margem (até 3) e grupo de até 6 linfonodos.',
  }
}

export const FLOW: Flow = {
  start: 'start',
  steps: Object.fromEntries(steps.map((s) => [s.id, s])),
}
