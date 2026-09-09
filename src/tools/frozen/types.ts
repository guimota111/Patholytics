/* ==========================================================================
   types.ts — congelação: o laudo transoperatório montado na hora, peça a
   peça, e o laudo de cirurgia de Mohs com os quadrantes no relógio.

   Herdado do "Just Cong" (Assistente-trabalho, branch JustCong). Os nomes de
   campo em português são os do documento original — o mesmo modelo salvo lá
   entra aqui sem conversão.
   ========================================================================== */

export interface Cassete {
  inicio: string
  fim: string
  descricao: string
}

export interface Peca {
  letter: string
  nome: string
  macroscopia: string
  /** "V" por padrão — a peça vai inteira ("vários" fragmentos). */
  fragmentos: string
  tudoIncluido: boolean
  /** Prefixa a macroscopia com a frase padrão de recebimento. */
  fraseRecebimento: boolean
  cassetes: Cassete[]
  resultado: string
}

/** Cronômetro de isquemia fria: início da congelação até o formol. */
export interface Cron {
  inicio: string | null
  formol: string | null
}

export const HOSPITAIS: { key: string; label: string; nome: string }[] = [
  { key: 'HAC', label: 'HAC — Hospital Brasília Águas Claras', nome: 'Hospital Brasília Águas Claras' },
  { key: 'HOBRA', label: 'HOBRA — Hospital Brasília Lago Sul', nome: 'Hospital Brasília Lago Sul' },
]

export interface CongDoc {
  hospital: string
  paciente: string
  cirurgiao: string
  patologista: string
  /** Tempo digitado à mão; tem precedência sobre o cronômetro. */
  isquemiaFria: string
  isquemiaCron: Cron
  informesClinicosVisible: boolean
  informesClinicos: string
  pecas: Peca[]
}

export interface Modelo {
  id: number
  dateStr: string
  pecas: Peca[]
  informesClinicosVisible: boolean
  informesClinicos: string
  patologista: string
}

/* ---- Mohs ---------------------------------------------------------------- */

export type MohsShape = 'circle' | 'halfmoon'

export interface MohsDivisao {
  label: string
  /** Rótulo gerado pelo eixo; falso depois que o usuário digitou o dele. */
  labelAuto: boolean
  cor: string
  tumor: boolean
  cassete: string
}

export interface Med3 {
  c: string
  l: string
  a: string
}

export interface MohsFrag {
  shape: MohsShape
  nome: string
  medidas: Med3
  /** Rotação do eixo de corte, em graus (15° = meia hora). */
  rotacao: number
  numDivisoes: number
  divisoes: MohsDivisao[]
}

export interface MohsPrincipal extends MohsFrag {
  letter: string
  comDebulking: boolean
  debulkingNome: string
  debulkingMedidas: { c: string; l: string }
  debulkingCassete: string
  cron: Cron
}

export interface MohsAmpliacao {
  letter: string
  nome: string
  cron: Cron
  fragmentos: MohsFrag[]
}

export interface MohsDoc {
  hospital: string
  paciente: string
  cirurgiao: string
  patologistas: string
  tipoTumor: string
  informeClinicoVisible: boolean
  informeClinico: string
  pecaPrincipal: MohsPrincipal
  ampliacoes: MohsAmpliacao[]
}

/* ---- Defaults ------------------------------------------------------------ */

export const letterOf = (index: number) => String.fromCharCode(65 + index)

export const defaultCron = (): Cron => ({ inicio: null, formol: null })

export function defaultPeca(index: number): Peca {
  return {
    letter: letterOf(index),
    nome: '',
    macroscopia: '',
    fragmentos: 'V',
    tudoIncluido: true,
    fraseRecebimento: true,
    cassetes: [{ inicio: '1', fim: '', descricao: '' }],
    resultado: '',
  }
}

export function defaultCongDoc(): CongDoc {
  return {
    hospital: '',
    paciente: '',
    cirurgiao: '',
    patologista: '',
    isquemiaFria: '',
    isquemiaCron: defaultCron(),
    informesClinicosVisible: false,
    informesClinicos: '',
    pecas: [defaultPeca(0)],
  }
}

/* ---- Sanitização (localStorage e Firestore) ------------------------------ */

const str = (v: unknown, fallback = ''): string => (typeof v === 'string' ? v : fallback)
const bool = (v: unknown, fallback: boolean): boolean => (typeof v === 'boolean' ? v : fallback)
const num = (v: unknown, fallback: number): number => (typeof v === 'number' && Number.isFinite(v) ? v : fallback)

export function sanitizeCron(raw: unknown): Cron {
  const p = (raw ?? {}) as Partial<Cron>
  return { inicio: str(p.inicio) || null, formol: str(p.formol) || null }
}

export function sanitizePeca(raw: unknown, index: number): Peca {
  const p = (raw ?? {}) as Partial<Peca>
  const cassetes = Array.isArray(p.cassetes)
    ? p.cassetes.map((c) => {
        const q = (c ?? {}) as Partial<Cassete>
        return { inicio: str(q.inicio), fim: str(q.fim), descricao: str(q.descricao) }
      })
    : []
  return {
    letter: str(p.letter) || letterOf(index),
    nome: str(p.nome),
    macroscopia: str(p.macroscopia),
    fragmentos: str(p.fragmentos) || 'V',
    tudoIncluido: bool(p.tudoIncluido, true),
    fraseRecebimento: bool(p.fraseRecebimento, true),
    cassetes: cassetes.length ? cassetes : [{ inicio: '1', fim: '', descricao: '' }],
    resultado: str(p.resultado),
  }
}

export function sanitizeCongDoc(raw: unknown): CongDoc {
  const p = (raw ?? {}) as Partial<CongDoc>
  const pecas = Array.isArray(p.pecas) ? p.pecas.map(sanitizePeca) : []
  return {
    hospital: str(p.hospital),
    paciente: str(p.paciente),
    cirurgiao: str(p.cirurgiao),
    patologista: str(p.patologista),
    isquemiaFria: str(p.isquemiaFria),
    isquemiaCron: sanitizeCron(p.isquemiaCron),
    informesClinicosVisible: bool(p.informesClinicosVisible, false),
    informesClinicos: str(p.informesClinicos),
    pecas: pecas.length ? pecas : [defaultPeca(0)],
  }
}

export function sanitizeModelo(raw: unknown): Modelo | null {
  const p = (raw ?? {}) as Partial<Modelo>
  if (!Array.isArray(p.pecas)) return null
  return {
    id: num(p.id, Date.now()),
    dateStr: str(p.dateStr),
    pecas: p.pecas.map(sanitizePeca),
    informesClinicosVisible: bool(p.informesClinicosVisible, false),
    informesClinicos: str(p.informesClinicos),
    patologista: str(p.patologista),
  }
}

function sanitizeMed3(raw: unknown): Med3 {
  const p = (raw ?? {}) as Partial<Med3>
  return { c: str(p.c), l: str(p.l), a: str(p.a) }
}

export function sanitizeDivisao(raw: unknown): MohsDivisao {
  const p = (raw ?? {}) as Partial<MohsDivisao>
  return {
    label: str(p.label),
    // Rótulos antigos foram digitados/gerados sem rotação — ficam como estão.
    labelAuto: bool(p.labelAuto, false),
    cor: str(p.cor),
    tumor: bool(p.tumor, false),
    cassete: str(p.cassete),
  }
}

export function sanitizeFrag(raw: unknown, shape: MohsShape): MohsFrag {
  const p = (raw ?? {}) as Partial<MohsFrag>
  const divisoes = Array.isArray(p.divisoes) ? p.divisoes.map(sanitizeDivisao) : []
  return {
    shape: p.shape === 'halfmoon' || p.shape === 'circle' ? p.shape : shape,
    nome: str(p.nome),
    medidas: sanitizeMed3(p.medidas),
    rotacao: num(p.rotacao, 0),
    numDivisoes: divisoes.length || num(p.numDivisoes, shape === 'circle' ? 4 : 2),
    divisoes,
  }
}
