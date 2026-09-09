import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { Plus, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Toggle, compactInputClass, selectClass } from '@/components/ui/fields'
import { Modal } from '@/components/ui/Modal'
import { cn } from '@/lib/cn'
import { MASKS, defaultMask, maskCassetes, maskMacro, maskNomePeca, maskPreview, maskResultado, type MaskKind, type MaskState } from '../masks'
import { fragmentoUnico, fragmentosDescPadrao, syncFragmentosDesc, type FragmentosData } from '../masks/fragmentos'
import { LINFO_TIPOS, LINFO_TOPOGRAFIAS, linfonodoComprometidos, setLinfonodoQtd, type LinfonodoData } from '../masks/linfonodo'
import { MAMA_MARGENS_DIST, MAMA_MARGENS_TINTA, MAMA_TIPOS, defaultMamaAchado, mamaAchadoNome, mamaDescPadrao, mamaPares, sanitizeMamaDistEntre, syncMamaDesc, type MamaData, type MamaTipoKey } from '../masks/mama'
import { defaultNodulo, sanitizeTireoideNodulos, tireoideRegioesAtivas, type TireoideData, type TireoideRegiao } from '../masks/tireoide'
import type { Cassete, Peca } from '../types'
import { smallInput, smallSelect } from './inputs'

export interface MaskResult {
  macro: string
  nome: string
  cassetes: Cassete[] | null
  resultado: string
}

interface MaskModalProps {
  pecas: Peca[]
  target: number
  onTarget: (index: number) => void
  onClose: () => void
  onApply: (index: number, result: MaskResult) => void
}

/* Os rótulos dos campos são o vocabulário da bancada, em português, como os
   dados das calculadoras do estadiador. Só a moldura passa pelo i18n. */

/** Máscaras: um formulário curto que escreve a macroscopia da peça. */
export function MaskModal({ pecas, target, onTarget, onClose, onApply }: MaskModalProps) {
  const { t } = useTranslation()
  const [mask, setMask] = useState<MaskState | null>(null)
  const letter = pecas[target]?.letter ?? 'A'

  const apply = () => {
    if (!mask) return
    onApply(target, { macro: maskMacro(mask), nome: maskNomePeca(mask), cassetes: maskCassetes(mask), resultado: maskResultado(mask) })
  }

  if (!mask) {
    return (
      <Modal title={t('frozen.mask.title')} onClose={onClose}>
        <p className="text-sm text-ink-muted">{t('frozen.mask.pick')}</p>
        <div className="mt-4 grid grid-cols-2 gap-3">
          {MASKS.map((m) => (
            <button key={m.kind} type="button" onClick={() => setMask(defaultMask(m.kind))} className="rounded-lg border border-line bg-surface px-4 py-5 text-center transition-colors hover:border-accent hover:bg-accent-soft/40">
              <span className="block text-2xl" aria-hidden>
                {m.icon}
              </span>
              <span className="mt-2 block text-sm font-medium text-ink">{m.label}</span>
            </button>
          ))}
        </div>
      </Modal>
    )
  }

  const meta = MASKS.find((m) => m.kind === mask.kind)!

  return (
    <Modal
      title={`${meta.icon} ${t('frozen.mask.form', { name: meta.label })}`}
      onClose={onClose}
      wide
      footer={
        <div className="flex flex-wrap items-center gap-2">
          <label className="flex items-center gap-2 text-sm text-ink-muted">
            {t('frozen.mask.target')}
            <select value={target} onChange={(e) => onTarget(Number(e.target.value))} className={smallSelect}>
              {pecas.map((p, i) => (
                <option key={i} value={i}>
                  {p.letter}
                  {p.nome ? ` — ${p.nome}` : ''}
                </option>
              ))}
            </select>
          </label>
          <Button type="button" className="ml-auto" onClick={apply}>
            {t('frozen.mask.apply')}
          </Button>
          <Button type="button" variant="ghost" onClick={() => setMask(null)}>
            {t('frozen.mask.back')}
          </Button>
        </div>
      }
    >
      <div className="space-y-5">
        {mask.kind === 'tireoide' && <TireoideForm data={mask.data} onChange={(data) => setMask({ kind: 'tireoide', data })} />}
        {mask.kind === 'mama' && <MamaForm data={mask.data} onChange={(data) => setMask({ kind: 'mama', data })} />}
        {mask.kind === 'fragmentos' && <FragmentosForm data={mask.data} onChange={(data) => setMask({ kind: 'fragmentos', data })} />}
        {mask.kind === 'linfonodo' && <LinfonodoForm data={mask.data} onChange={(data) => setMask({ kind: 'linfonodo', data })} />}

        <div>
          <p className="mb-1.5 text-[0.6875rem] font-medium tracking-wider text-ink-faint uppercase">{t('frozen.export.preview')}</p>
          <pre className="tabular max-h-56 overflow-auto rounded-md border border-line bg-surface px-3.5 py-3 text-xs leading-relaxed whitespace-pre-wrap text-ink-muted">{maskPreview(mask, letter)}</pre>
        </div>
      </div>
    </Modal>
  )
}

/* ---- Blocos comuns ------------------------------------------------------- */

function Label({ children }: { children: ReactNode }) {
  return <span className="mb-1 block text-xs font-medium text-ink">{children}</span>
}

function Seg<T extends string>({ value, options, onChange }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void }) {
  return (
    <div className="inline-flex rounded-md border border-line bg-surface p-0.5">
      {options.map((o) => (
        <button key={o.value} type="button" onClick={() => onChange(o.value)} aria-pressed={value === o.value} className={cn('rounded px-3 py-1 text-sm transition-colors', value === o.value ? 'bg-accent text-white' : 'text-ink-muted hover:text-ink')}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

function Medidas({ values, sep, onChange, unit = 'cm' }: { values: string[]; sep: string; onChange: (index: number, v: string) => void; unit?: string }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {values.map((v, i) => (
        <span key={i} className="flex items-center gap-1.5">
          {i > 0 && <span className="text-xs text-ink-faint">{sep}</span>}
          <input value={v} onChange={(e) => onChange(i, e.target.value)} placeholder="__" className={cn(smallInput, 'w-16 text-center')} />
        </span>
      ))}
      <span className="text-xs text-ink-faint">{unit}</span>
    </div>
  )
}

function Hint({ children }: { children: ReactNode }) {
  return <p className="text-xs leading-relaxed text-ink-faint">{children}</p>
}

/* ---- Tireoide ------------------------------------------------------------ */

function TireoideForm({ data: d, onChange }: { data: TireoideData; onChange: (d: TireoideData) => void }) {
  const regioes = tireoideRegioesAtivas(d)
  const set = (next: Partial<TireoideData>) => onChange(sanitizeTireoideNodulos({ ...d, ...next }))

  return (
    <div className="space-y-4">
      <div>
        <Label>Tipo de ressecção</Label>
        <Seg value={d.resseccao} options={[{ value: 'total', label: 'Total' }, { value: 'parcial', label: 'Parcial' }]} onChange={(v) => set({ resseccao: v })} />
      </div>
      {d.resseccao === 'parcial' && (
        <div className="flex flex-wrap gap-6">
          <div>
            <Label>Lobo ressecado</Label>
            <Seg value={d.ladoParcial} options={[{ value: 'direito', label: 'Direito' }, { value: 'esquerdo', label: 'Esquerdo' }]} onChange={(v) => set({ ladoParcial: v })} />
          </div>
          <div>
            <Label>Istmo</Label>
            <Toggle checked={d.istmoParcial} onChange={(v) => set({ istmoParcial: v })} label="Acompanhado do istmo" />
          </div>
        </div>
      )}
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label>Peso{d.resseccao === 'parcial' ? '' : ' total'} (g)</Label>
          <Toggle checked={d.pesar} onChange={(v) => set({ pesar: v })} label="Peça pesada" />
        </div>
        {d.pesar ? <input value={d.peso} onChange={(e) => set({ peso: e.target.value })} placeholder="Ex: 25" className={cn(smallInput, 'w-32')} /> : <Hint>A peça não será pesada — o peso não entra na macroscopia.</Hint>}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <Label>Tinta nanquim — face anterior</Label>
          <input value={d.tintaAnterior} onChange={(e) => set({ tintaAnterior: e.target.value })} placeholder="Ex: azul" className={compactInputClass} />
        </label>
        <label className="block">
          <Label>Tinta nanquim — face posterior</Label>
          <input value={d.tintaPosterior} onChange={(e) => set({ tintaPosterior: e.target.value })} placeholder="Ex: verde" className={compactInputClass} />
        </label>
      </div>
      {regioes.map((reg) => {
        const m = d.lobos[reg.key]
        return (
          <div key={reg.key}>
            <Label>{reg.label} — medidas (cm)</Label>
            <Medidas
              values={[m.c, m.l, m.ap]}
              sep="por"
              onChange={(i, v) => {
                const key = (['c', 'l', 'ap'] as const)[i]
                set({ lobos: { ...d.lobos, [reg.key]: { ...m, [key]: v } } })
              }}
            />
          </div>
        )
      })}
      <div>
        <Label>Nódulos</Label>
        <div className="space-y-3">
          {d.nodulos.length === 0 && <Hint>Nenhum nódulo adicionado.</Hint>}
          {d.nodulos.map((n, i) => (
            <div key={i} className="rounded-md border border-line bg-surface p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink">Nódulo {i + 1}</span>
                <button type="button" onClick={() => set({ nodulos: d.nodulos.filter((_, j) => j !== i) })} aria-label="Remover nódulo" className="rounded-md p-1 text-ink-faint hover:bg-danger-soft hover:text-danger">
                  <X className="size-4" aria-hidden />
                </button>
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <select value={n.regiao} onChange={(e) => set({ nodulos: d.nodulos.map((x, j) => (j === i ? { ...x, regiao: e.target.value as TireoideRegiao } : x)) })} className={selectClass}>
                  {regioes.map((r) => (
                    <option key={r.key} value={r.key}>
                      {r.label}
                    </option>
                  ))}
                </select>
                <input value={n.local} onChange={(e) => set({ nodulos: d.nodulos.map((x, j) => (j === i ? { ...x, local: e.target.value } : x)) })} placeholder="Localização (ex: terço superior)" className={compactInputClass} />
              </div>
              <div className="mt-2">
                <Medidas values={[n.med1, n.med2]} sep="por" onChange={(k, v) => set({ nodulos: d.nodulos.map((x, j) => (j === i ? { ...x, [k === 0 ? 'med1' : 'med2']: v } : x)) })} />
              </div>
              <input value={n.desc} onChange={(e) => set({ nodulos: d.nodulos.map((x, j) => (j === i ? { ...x, desc: e.target.value } : x)) })} placeholder="Características (ex: irregular, brancacento e endurecido)" className={cn(compactInputClass, 'mt-2')} />
            </div>
          ))}
        </div>
        <Button type="button" size="sm" variant="ghost" className="mt-2" onClick={() => set({ nodulos: [...d.nodulos, defaultNodulo(regioes[0].key)] })}>
          <Plus className="size-4" aria-hidden />
          Adicionar nódulo
        </Button>
      </div>
    </div>
  )
}

/* ---- Mama ---------------------------------------------------------------- */

function MamaForm({ data: d, onChange }: { data: MamaData; onChange: (d: MamaData) => void }) {
  const set = (next: Partial<MamaData>) => onChange({ ...d, ...next })
  const setAchado = (i: number, patch: Partial<MamaData['achados'][number]>) => set({ achados: d.achados.map((a, j) => (j === i ? { ...a, ...patch } : a)) })
  const total = d.achados.length
  const pares = mamaPares(d)

  return (
    <div className="space-y-4">
      <Hint>
        A lateralidade entra no campo <strong>Nome da peça</strong>, fora da máscara.
      </Hint>
      <div className="grid gap-3 sm:grid-cols-[8rem_minmax(0,1fr)]">
        <label className="block">
          <Label>Peso (g)</Label>
          <input value={d.peso} onChange={(e) => set({ peso: e.target.value })} placeholder="Ex: 250" className={compactInputClass} />
        </label>
        <div>
          <Label>Medidas da peça (cm)</Label>
          <Medidas values={[d.medidas.c, d.medidas.l, d.medidas.ap]} sep="x" onChange={(i, v) => set({ medidas: { ...d.medidas, [(['c', 'l', 'ap'] as const)[i]]: v } })} />
        </div>
      </div>
      <div>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Label>Marcação cirúrgica prévia</Label>
          <Toggle checked={d.comMarcacao} onChange={(v) => set({ comMarcacao: v })} label="Peça marcada" />
        </div>
        {d.comMarcacao ? <input value={d.marcacao} onChange={(e) => set({ marcacao: e.target.value })} className={compactInputClass} /> : <Hint>Sem marcação — a frase dos fios não entra na macroscopia.</Hint>}
      </div>
      <div>
        <Label>Tinta nanquim por margem</Label>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {MAMA_MARGENS_TINTA.map((m) => (
            <label key={m.key} className="flex items-center gap-2 text-xs text-ink-muted">
              <span className="w-16">{m.label}</span>
              <input value={d.tintas[m.key] ?? ''} onChange={(e) => set({ tintas: { ...d.tintas, [m.key]: e.target.value } })} placeholder={m.cor} className={compactInputClass} />
            </label>
          ))}
        </div>
      </div>
      <div>
        <Label>Achados aos cortes</Label>
        <div className="space-y-3">
          {d.achados.length === 0 && <Hint>Nenhum achado — a frase "Aos cortes" não entra na macroscopia.</Hint>}
          {d.achados.map((a, i) => (
            <div key={a.id} className="rounded-md border border-line bg-surface p-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-ink">{total > 1 ? `${mamaAchadoNome(a).charAt(0).toUpperCase()}${mamaAchadoNome(a).slice(1)} ${i + 1}` : 'Achado'}</span>
                {total > 1 && (
                  <button type="button" onClick={() => onChange(sanitizeMamaDistEntre({ ...d, achados: d.achados.filter((_, j) => j !== i) }))} aria-label="Remover achado" className="rounded-md p-1 text-ink-faint hover:bg-danger-soft hover:text-danger">
                    <X className="size-4" aria-hidden />
                  </button>
                )}
              </div>
              <div className="mt-2 grid gap-2 sm:grid-cols-2">
                <select
                  value={a.tipo}
                  onChange={(e) => {
                    const next = syncMamaDesc({ ...a, tipo: e.target.value as MamaTipoKey })
                    set({ achados: d.achados.map((x, j) => (j === i ? next : x)) })
                  }}
                  className={selectClass}
                >
                  {MAMA_TIPOS.map((tp) => (
                    <option key={tp.key} value={tp.key}>
                      {tp.label}
                    </option>
                  ))}
                </select>
                {a.tipo === 'outro' && <input value={a.tipoCustom} onChange={(e) => setAchado(i, { tipoCustom: e.target.value })} placeholder="Como chamar o achado (ex: espessamento)" className={compactInputClass} />}
              </div>
              <Label>Características</Label>
              <input value={a.desc} onChange={(e) => setAchado(i, { desc: e.target.value })} placeholder={mamaDescPadrao(a)} className={compactInputClass} />
              <div className="mt-2">
                <Label>Medidas (cm)</Label>
                <Medidas values={[a.med.c, a.med.l, a.med.ap]} sep="x" onChange={(k, v) => setAchado(i, { med: { ...a.med, [(['c', 'l', 'ap'] as const)[k]]: v } })} />
              </div>
              <div className="mt-2">
                <Label>Distância até cada margem (cm)</Label>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {MAMA_MARGENS_DIST.map((k) => (
                    <label key={k} className="flex items-center gap-2 text-xs text-ink-muted">
                      <span className="w-16">{k}</span>
                      <input value={a.dist[k] ?? ''} onChange={(e) => setAchado(i, { dist: { ...a.dist, [k]: e.target.value } })} placeholder="__" className={compactInputClass} />
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
        <Button type="button" size="sm" variant="ghost" className="mt-2" onClick={() => set({ achados: [...d.achados, defaultMamaAchado(d.nextId)], nextId: d.nextId + 1 })}>
          <Plus className="size-4" aria-hidden />
          Adicionar achado
        </Button>
      </div>
      {pares.length > 0 && (
        <div>
          <Label>Distância entre os achados (cm)</Label>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
            {pares.map((p) => (
              <label key={p.key} className="flex items-center gap-2 text-xs text-ink-muted">
                <span className="w-12">
                  {p.i + 1} e {p.j + 1}
                </span>
                <input value={d.distEntre[p.key] ?? ''} onChange={(e) => set({ distEntre: { ...d.distEntre, [p.key]: e.target.value } })} placeholder="__" className={compactInputClass} />
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

/* ---- Fragmentos ---------------------------------------------------------- */

function FragmentosForm({ data: d, onChange }: { data: FragmentosData; onChange: (d: FragmentosData) => void }) {
  const unico = fragmentoUnico(d)
  return (
    <div className="space-y-4">
      <Hint>
        A topografia é preenchida no campo <strong>Nome da peça</strong>, fora da máscara.
      </Hint>
      <label className="block">
        <Label>Quantidade de fragmentos</Label>
        <input value={d.quantidade} onChange={(e) => onChange(syncFragmentosDesc({ ...d, quantidade: e.target.value }))} placeholder="Ex: 3" className={cn(smallInput, 'w-32')} />
      </label>
      <label className="block">
        <Label>Descrição {unico ? 'do fragmento' : 'dos fragmentos'}</Label>
        <input value={d.descricao} onChange={(e) => onChange({ ...d, descricao: e.target.value })} placeholder={fragmentosDescPadrao(d)} className={compactInputClass} />
      </label>
      <div>
        <Label>{unico ? 'Medidas (cm)' : 'Maior fragmento — medidas (cm)'}</Label>
        <Medidas values={[d.maior.a, d.maior.b]} sep="x" onChange={(i, v) => onChange({ ...d, maior: { ...d.maior, [i === 0 ? 'a' : 'b']: v } })} />
      </div>
      {!unico && (
        <div>
          <Label>Menor fragmento — medidas (cm)</Label>
          <Medidas values={[d.menor.a, d.menor.b]} sep="x" onChange={(i, v) => onChange({ ...d, menor: { ...d.menor, [i === 0 ? 'a' : 'b']: v } })} />
        </div>
      )}
    </div>
  )
}

/* ---- Linfonodo sentinela ------------------------------------------------- */

function LinfonodoForm({ data: d, onChange }: { data: LinfonodoData; onChange: (d: LinfonodoData) => void }) {
  const set = (next: Partial<LinfonodoData>) => onChange({ ...d, ...next })
  const total = d.linfonodos.length
  const comp = linfonodoComprometidos(d)

  return (
    <div className="space-y-4">
      <Hint>A máscara preenche a macroscopia, o mapeamento dos cassetes e o resultado da peça.</Hint>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <Label>Topografia</Label>
          <input value={d.topografia} onChange={(e) => set({ topografia: e.target.value })} list="frozen-linfo-topo" autoComplete="off" placeholder="Ex: axila direita" className={compactInputClass} />
          <datalist id="frozen-linfo-topo">
            {LINFO_TOPOGRAFIAS.map((tp) => (
              <option key={tp} value={tp} />
            ))}
          </datalist>
        </label>
        <div>
          <Label>Gordura — medidas (cm)</Label>
          <Medidas values={[d.gordura.c, d.gordura.l, d.gordura.ap]} sep="x" onChange={(i, v) => set({ gordura: { ...d.gordura, [(['c', 'l', 'ap'] as const)[i]]: v } })} />
        </div>
      </div>
      <div>
        <Label>Linfonodos dissecados</Label>
        <div className="flex items-center gap-2">
          <Button type="button" size="sm" variant="secondary" disabled={total <= 1} onClick={() => onChange(setLinfonodoQtd(d, total - 1))} aria-label="Menos um linfonodo">
            −
          </Button>
          <span className="tabular w-8 text-center text-lg font-semibold text-ink">{total}</span>
          <Button type="button" size="sm" variant="secondary" onClick={() => onChange(setLinfonodoQtd(d, total + 1))} aria-label="Mais um linfonodo">
            +
          </Button>
        </div>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {d.linfonodos.map((ln, i) => (
            <button
              key={i}
              type="button"
              onClick={() => set({ linfonodos: d.linfonodos.map((x, j) => (j === i ? { ...x, comprometido: !x.comprometido } : x)) })}
              aria-pressed={ln.comprometido}
              title={`Linfonodo sentinela ${i + 1}`}
              className={cn('tabular flex size-9 items-center justify-center rounded-full border text-sm font-semibold transition-colors', ln.comprometido ? 'border-danger bg-danger text-white' : 'border-line bg-surface text-ink hover:border-line-strong')}
            >
              {i + 1}
            </button>
          ))}
        </div>
        <Hint>{comp ? `${comp} de ${total} comprometido${comp > 1 ? 's' : ''} — clique para desmarcar.` : 'Nenhum comprometido — clique nas bolinhas dos linfonodos acometidos.'}</Hint>
      </div>
      <div>
        <Label>{total > 1 ? 'Maior linfonodo — medidas (cm)' : 'Medidas do linfonodo (cm)'}</Label>
        <Medidas values={[d.maior.a, d.maior.b]} sep="x" onChange={(i, v) => set({ maior: { ...d.maior, [i === 0 ? 'a' : 'b']: v } })} />
      </div>
      {total > 1 && (
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Label>Menor linfonodo — medidas (cm)</Label>
            <Toggle checked={d.medirMenor} onChange={(v) => set({ medirMenor: v })} label="Medir o menor" />
          </div>
          {d.medirMenor ? <Medidas values={[d.menor.a, d.menor.b]} sep="x" onChange={(i, v) => set({ menor: { ...d.menor, [i === 0 ? 'a' : 'b']: v } })} /> : <Hint>Só o maior linfonodo entra na macroscopia.</Hint>}
        </div>
      )}
      <div>
        <Label>Cassetes</Label>
        <Hint>Um linfonodo grande ocupa mais de um cassete — ajuste aqui e a numeração se acomoda sozinha.</Hint>
        <div className="mt-2 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {d.linfonodos.map((ln, i) => (
            <label key={i} className="flex items-center gap-2 text-xs text-ink-muted">
              <span className="w-20">Linfonodo {i + 1}</span>
              <input type="number" min={1} value={ln.cassetes} onChange={(e) => set({ linfonodos: d.linfonodos.map((x, j) => (j === i ? { ...x, cassetes: e.target.value } : x)) })} className={cn(smallInput, 'w-16')} />
            </label>
          ))}
          <label className="flex items-center gap-2 text-xs text-ink-muted">
            <span className="w-20">Gordura</span>
            <input type="number" min={0} value={d.gorduraCassetes} onChange={(e) => set({ gorduraCassetes: e.target.value })} className={cn(smallInput, 'w-16')} />
          </label>
        </div>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <Label>Tipo de comprometimento</Label>
          <Seg value={d.tipo} options={LINFO_TIPOS.map((tp) => ({ value: tp.key, label: tp.label }))} onChange={(v) => set({ tipo: v })} />
        </div>
        <label className="block">
          <Label>Neoplasia</Label>
          <input value={d.neoplasia} onChange={(e) => set({ neoplasia: e.target.value })} placeholder="Ex: carcinoma" className={compactInputClass} />
        </label>
      </div>
    </div>
  )
}

export type { MaskKind }
