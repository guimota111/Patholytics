/* ==========================================================================
   types.ts — modelo dos algoritmos diferenciais.

   O Marker Helper responde "tumor em tal lugar, com tal cara, marcou isto:
   o que é?" para o corpo inteiro. Um algoritmo diferencial responde a mesma
   pergunta para uma situação só (neoplasia oncocítica do rim, por exemplo),
   e por isso pode ser mais preciso: as perguntas são as que importam
   naquela situação, as opções de resposta são as que o patologista vê de
   fato, e cada entidade candidata diz, pergunta a pergunta, o que é típico
   dela, o que é possível, o que é raro e o que não acontece.

   É um "algoritmo vivo": em vez de uma árvore fixa que se percorre numa
   ordem só, o patologista responde o que tem (na ordem que quiser), a lista
   de candidatos se reordena a cada resposta, e a ferramenta aponta qual
   pergunta ainda não respondida mais separa os candidatos do topo. Um
   esquema do algoritmo clássico (ramos com condições) acompanha, acendendo
   os ramos compatíveis com as respostas dadas.

   O conteúdo é escrito em código (content/), como nos catálogos: nunca é
   editado pelo site.
   ========================================================================== */

/* ---- Perguntas --------------------------------------------------------------- */

export type QuestionGroup = 'clinica' | 'morfologia' | 'imuno' | 'molecular'

export const QUESTION_GROUPS: QuestionGroup[] = ['clinica', 'morfologia', 'imuno', 'molecular']

export interface Option {
  id: string
  label: string
  /** O que olhar para reconhecer esta opção, ou o que ela quer dizer. */
  hint?: string
}

export interface Question {
  id: string
  group: QuestionGroup
  /** Título curto, como aparece no cartão e no "próximo passo". */
  title: string
  hint?: string
  /**
   * `single`: uma só resposta (CK7 é negativa, focal ou difusa).
   * `multi`: várias ao mesmo tempo (achados que coexistem na lâmina).
   */
  kind: 'single' | 'multi'
  options: Option[]
  /** Peso na pontuação (padrão 1). Imuno definidora de entidade pesa mais. */
  weight?: number
}

/* ---- Entidades ---------------------------------------------------------------- */

/**
 * Quão frequente é a opção nesta entidade. Vira probabilidade na pontuação
 * (ver match.ts) e rótulo na tela ("bate", "possível", "contra", "exclui").
 */
export type Likelihood = 'tipico' | 'comum' | 'possivel' | 'raro' | 'nunca'

export const LIKELIHOOD_P: Record<Likelihood, number> = {
  tipico: 0.9,
  comum: 0.65,
  possivel: 0.35,
  raro: 0.1,
  nunca: 0.02,
}

/** Opção não declarada pela entidade: nem a favor nem contra. */
export const DEFAULT_LIKELIHOOD: Likelihood = 'possivel'

/** Pergunta → opção → frequência. */
export type Profile = Record<string, Record<string, Likelihood>>

export type Risk = 'benigno' | 'baixo' | 'intermediario' | 'alto'

export const RISK_LABELS: Record<Risk, string> = {
  benigno: 'benigno',
  baixo: 'baixo risco',
  intermediario: 'risco intermediário',
  alto: 'alto risco',
}

export interface Entity {
  id: string
  name: string
  /** Sigla ou nome curto para listas apertadas (próximo passo, esquema). */
  short: string
  aka?: string[]
  /** Posição na OMS 2022: entidade, emergente, provisória, molecularmente definida… */
  status: string
  risk: Risk
  /** 3 = comum na rotina, 2 = incomum, 1 = raro. Prior pequeno na ordenação. */
  frequency: 1 | 2 | 3
  summary: string
  /** O que define a entidade: morfologia, imuno, molecular, em frases curtas. */
  keys: string[]
  /** Perfil imuno-histoquímico, em uma linha. */
  ihc: string
  molecular?: string
  behavior?: string
  pitfalls?: string[]
  profile: Profile
  /** Ids de SOURCES do algoritmo. */
  sources: string[]
}

/* ---- Esquema do algoritmo ------------------------------------------------------- */

export interface Condition {
  question: string
  /** Qualquer uma destas opções satisfaz (numa `multi`, basta estar marcada). */
  options: string[]
}

/** Um ramo do algoritmo clássico: "se isto e aquilo, pense nestas entidades". */
export interface Branch {
  id: string
  label: string
  when: Condition[]
  /** Entidades para onde o ramo leva. */
  leads: string[]
  /** O que confirmar ou pedir a seguir. */
  note?: string
}

export interface BranchGroup {
  id: string
  title: string
  branches: Branch[]
}

/* ---- Algoritmo ------------------------------------------------------------------- */

export interface Source {
  id: string
  label: string
  url?: string
}

export interface Algorithm {
  id: string
  name: string
  /** Uma frase para o cartão no índice. */
  summary: string
  /** Quando usar: a situação da bancada que este algoritmo cobre. */
  scope: string
  /** Tema, para agrupar no índice (Rim, Pele, …). */
  system: string
  /** Mês/ano da última revisão do conteúdo. */
  revised: string
  /** Conselhos de bancada que valem para o algoritmo inteiro (painel inicial, armadilhas). */
  advice: string[]
  /** O que fazer quando nada bate: a categoria de escape da classificação. */
  fallback: string
  questions: Question[]
  entities: Entity[]
  schema: BranchGroup[]
  sources: Source[]
}

/* ---- Utilidades --------------------------------------------------------------------- */

export const GROUP_LABELS: Record<QuestionGroup, string> = {
  clinica: 'Clínica e macroscopia',
  morfologia: 'Morfologia',
  imuno: 'Imuno-histoquímica',
  molecular: 'Molecular',
}

export const findQuestion = (a: Algorithm, id: string) => a.questions.find((q) => q.id === id)
export const findOption = (q: Question, id: string) => q.options.find((o) => o.id === id)
export const findEntity = (a: Algorithm, id: string) => a.entities.find((e) => e.id === id)
export const questionsOf = (a: Algorithm, group: QuestionGroup) => a.questions.filter((q) => q.group === group)
