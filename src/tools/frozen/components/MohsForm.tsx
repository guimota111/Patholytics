import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronRight, Plus, Trash2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Toggle, compactInputClass } from '@/components/ui/fields'
import { cn } from '@/lib/cn'
import { ampMaxCassete, buildMohsText, defaultMohsAmpliacao, defaultMohsDoc, defaultMohsFrag, mohsHasTumor, principalMaxDivCassete } from '../mohs'
import type { MohsAmpliacao, MohsDoc, MohsFrag, MohsPrincipal } from '../types'
import type { Frozen } from '../useFrozen'
import { ExportCard } from './ExportCard'
import { IsquemiaCron } from './IsquemiaCron'
import { MohsFragSection } from './MohsFragSection'

const inputClass = 'h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-faint hover:border-line-strong'
const textareaClass = 'w-full resize-y rounded-md border border-line bg-surface px-3 py-2 text-sm leading-relaxed text-ink placeholder:text-ink-faint hover:border-line-strong'

/** A cirurgia de Mohs: peça principal com debulking, ampliações e o laudo. */
export function MohsForm({ frozen }: { frozen: Frozen }) {
  const { t } = useTranslation()
  const { mohs: doc, setMohs: setDoc, now, suggestions, remember } = frozen
  const patch = (next: Partial<MohsDoc>) => setDoc({ ...doc, ...next })
  const setPrincipal = (p: MohsPrincipal) => patch({ pecaPrincipal: p })
  const setAmps = (ampliacoes: MohsAmpliacao[]) => patch({ ampliacoes: ampliacoes.map((a, i) => ({ ...a, letter: String.fromCharCode(66 + i) })) })
  const text = useMemo(() => buildMohsText(doc, new Date(now)), [doc, now])
  const showAmpHint = !mohsHasTumor(doc) && doc.ampliacoes.length === 0

  const rememberAll = () => {
    remember('mohs_cirurgiao', doc.cirurgiao)
    remember('mohs_patologista', doc.patologistas)
    remember('mohs_hospital', doc.hospital)
  }

  const p = doc.pecaPrincipal

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-line bg-elevated shadow-card">
        <header className="border-b border-line px-5 py-3">
          <h2 className="text-sm font-semibold tracking-tight text-ink">{t('frozen.mohs.title')}</h2>
        </header>
        <div className="space-y-4 px-5 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t('frozen.cong.hospital')}>
              <input value={doc.hospital} onChange={(e) => patch({ hospital: e.target.value })} onBlur={(e) => remember('mohs_hospital', e.target.value)} list="frozen-mohs-hospital" autoComplete="off" placeholder="Ex: Hospital Brasília Unidade Águas Claras" className={inputClass} />
              <Datalist id="frozen-mohs-hospital" items={suggestions('mohs_hospital')} />
            </Field>
            <Field label={t('frozen.cong.paciente')}>
              <input value={doc.paciente} onChange={(e) => patch({ paciente: e.target.value })} className={inputClass} />
            </Field>
            <Field label={t('frozen.cong.cirurgiao')}>
              <input value={doc.cirurgiao} onChange={(e) => patch({ cirurgiao: e.target.value })} onBlur={(e) => remember('mohs_cirurgiao', e.target.value)} list="frozen-mohs-cirurgiao" autoComplete="off" className={inputClass} />
              <Datalist id="frozen-mohs-cirurgiao" items={suggestions('mohs_cirurgiao')} />
            </Field>
            <Field label={t('frozen.mohs.patologistas')}>
              <input value={doc.patologistas} onChange={(e) => patch({ patologistas: e.target.value })} onBlur={(e) => remember('mohs_patologista', e.target.value)} list="frozen-mohs-patologista" autoComplete="off" placeholder="Ex: Lara + Guilherme (fellow)" className={inputClass} />
              <Datalist id="frozen-mohs-patologista" items={suggestions('mohs_patologista')} />
            </Field>
            <Field label={t('frozen.mohs.tipoTumor')}>
              <input value={doc.tipoTumor} onChange={(e) => patch({ tipoTumor: e.target.value })} placeholder="Ex: carcinoma basocelular" className={inputClass} />
            </Field>
          </div>
          <div>
            <button type="button" onClick={() => patch({ informeClinicoVisible: !doc.informeClinicoVisible })} className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink">
              {doc.informeClinicoVisible ? <ChevronDown className="size-4" aria-hidden /> : <ChevronRight className="size-4" aria-hidden />}
              {t('frozen.mohs.informe')}
            </button>
            {doc.informeClinicoVisible && <textarea value={doc.informeClinico} onChange={(e) => patch({ informeClinico: e.target.value })} rows={2} placeholder="Ex: carcinoma basocelular." className={cn(textareaClass, 'mt-2')} />}
          </div>
        </div>
      </section>

      {/* Peça principal */}
      <section className="rounded-lg border border-line bg-elevated shadow-card">
        <header className="flex items-center gap-2 border-b border-line px-4 py-3">
          <span className="tabular flex size-8 shrink-0 items-center justify-center rounded-md bg-accent text-sm font-bold text-white">{p.letter}</span>
          <input value={p.nome} onChange={(e) => setPrincipal({ ...p, nome: e.target.value })} placeholder={t('frozen.mohs.principalPlaceholder')} className={cn(inputClass, 'min-w-0 flex-1')} />
        </header>
        <div className="space-y-4 px-4 py-4">
          <IsquemiaCron cron={p.cron} now={now} onChange={(cron) => setPrincipal({ ...p, cron })} hint={t('frozen.mohs.cronHint')} />

          <Toggle
            checked={p.comDebulking}
            onChange={(v) => setPrincipal({ ...p, comDebulking: v, debulkingCassete: v && !p.debulkingCassete.trim() ? String(principalMaxDivCassete(p) + 1) : p.debulkingCassete })}
            label={t('frozen.mohs.comDebulking')}
          />
          {p.comDebulking && (
            <div className="grid gap-3 sm:grid-cols-4">
              <Field label={t('frozen.mohs.debNome')}>
                <input value={p.debulkingNome} onChange={(e) => setPrincipal({ ...p, debulkingNome: e.target.value })} className={compactInputClass} />
              </Field>
              <Field label={t('frozen.mohs.debC')}>
                <input value={p.debulkingMedidas.c} onChange={(e) => setPrincipal({ ...p, debulkingMedidas: { ...p.debulkingMedidas, c: e.target.value } })} placeholder="_" className={compactInputClass} />
              </Field>
              <Field label={t('frozen.mohs.debL')}>
                <input value={p.debulkingMedidas.l} onChange={(e) => setPrincipal({ ...p, debulkingMedidas: { ...p.debulkingMedidas, l: e.target.value } })} placeholder="_" className={compactInputClass} />
              </Field>
              <Field label={t('frozen.mohs.debCassete')}>
                <div className="flex items-center gap-1.5">
                  <span className="tabular text-xs text-ink-faint">{p.letter}</span>
                  <input value={p.debulkingCassete} onChange={(e) => setPrincipal({ ...p, debulkingCassete: e.target.value })} placeholder="ex: 5 ou 5-6" className={compactInputClass} />
                </div>
              </Field>
            </div>
          )}

          <MohsFragSection
            frag={p}
            letter={p.letter}
            onChange={(frag) => setPrincipal({ ...p, ...frag })}
            casseteStart={() => 1}
            afterNumChange={(frag) => ({ ...frag, debulkingCassete: String(principalMaxDivCassete({ ...p, ...frag }) + 1) }) as MohsFrag}
          />
        </div>
      </section>

      {/* Ampliações */}
      <section className="space-y-4">
        <div>
          <h3 className="text-sm font-semibold tracking-tight text-ink">{t('frozen.mohs.ampliacoes')}</h3>
          {showAmpHint && <p className="mt-1 text-xs text-ink-faint">{t('frozen.mohs.ampliacoesHint')}</p>}
        </div>
        {doc.ampliacoes.map((amp, ai) => (
          <AmpCard key={ai} amp={amp} now={now} onChange={(next) => setAmps(doc.ampliacoes.map((a, i) => (i === ai ? next : a)))} onRemove={() => setAmps(doc.ampliacoes.filter((_, i) => i !== ai))} />
        ))}
        <Button type="button" variant="secondary" onClick={() => setAmps([...doc.ampliacoes, defaultMohsAmpliacao(String.fromCharCode(66 + doc.ampliacoes.length))])}>
          <Plus className="size-4" aria-hidden />
          {t('frozen.mohs.addAmpliacao')}
        </Button>
      </section>

      <ExportCard kind="mohs" text={text} doc={doc} fileBase={`Mohs_${doc.paciente || 'Mohs'}`} onBeforeExport={rememberAll} onClear={() => setDoc(defaultMohsDoc())} clearConfirm={t('frozen.mohs.clearConfirm')} frozen={frozen} />
    </div>
  )
}

function AmpCard({ amp, now, onChange, onRemove }: { amp: MohsAmpliacao; now: number; onChange: (amp: MohsAmpliacao) => void; onRemove: () => void }) {
  const { t } = useTranslation()
  const [confirmRemove, setConfirmRemove] = useState(false)
  const multi = amp.fragmentos.length > 1
  const setFrag = (fi: number, frag: MohsFrag) => onChange({ ...amp, fragmentos: amp.fragmentos.map((f, i) => (i === fi ? frag : f)) })

  return (
    <section className="rounded-lg border border-line bg-elevated shadow-card">
      <header className="flex items-center gap-2 border-b border-line px-4 py-3">
        <span className="tabular flex size-8 shrink-0 items-center justify-center rounded-md bg-accent text-sm font-bold text-white">{amp.letter}</span>
        <input value={amp.nome} onChange={(e) => onChange({ ...amp, nome: e.target.value })} placeholder={t('frozen.mohs.ampPlaceholder')} className={cn(inputClass, 'min-w-0 flex-1')} />
        {confirmRemove ? (
          <>
            <Button type="button" size="sm" variant="danger" onClick={onRemove}>
              {t('frozen.peca.removeConfirm')}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmRemove(false)}>
              {t('common.cancel')}
            </Button>
          </>
        ) : (
          <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmRemove(true)} aria-label={t('frozen.mohs.removeAmp')}>
            <Trash2 className="size-4" aria-hidden />
          </Button>
        )}
      </header>
      <div className="space-y-4 px-4 py-4">
        <IsquemiaCron cron={amp.cron} now={now} onChange={(cron) => onChange({ ...amp, cron })} hint={t('frozen.mohs.cronHint')} />
        {amp.fragmentos.map((frag, fi) => (
          <div key={fi} className="rounded-md border border-line p-3">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold tracking-wider text-ink-faint uppercase">{multi ? t('frozen.mohs.fragmentoN', { n: fi + 1 }) : t('frozen.mohs.peca')}</span>
              <input value={frag.nome} onChange={(e) => setFrag(fi, { ...frag, nome: e.target.value })} placeholder={t('frozen.mohs.fragNomePlaceholder')} className={cn(compactInputClass, 'min-w-40 flex-1')} />
              {multi && (
                <button type="button" onClick={() => onChange({ ...amp, fragmentos: amp.fragmentos.filter((_, i) => i !== fi) })} aria-label={t('frozen.mohs.removeFrag')} className="rounded-md p-1 text-ink-faint transition-colors hover:bg-danger-soft hover:text-danger">
                  <X className="size-4" aria-hidden />
                </button>
              )}
            </div>
            <MohsFragSection frag={frag} letter={amp.letter} onChange={(next) => setFrag(fi, next)} casseteStart={() => ampMaxCassete(amp, fi) + 1} />
          </div>
        ))}
        <Button type="button" size="sm" variant="ghost" onClick={() => onChange({ ...amp, fragmentos: [...amp.fragmentos, defaultMohsFrag('halfmoon', ampMaxCassete(amp, -1) + 1)] })}>
          <Plus className="size-4" aria-hidden />
          {t('frozen.mohs.addFrag')}
        </Button>
      </div>
    </section>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-ink">{label}</span>
      {children}
    </label>
  )
}

function Datalist({ id, items }: { id: string; items: string[] }) {
  return (
    <datalist id={id}>
      {items.map((s) => (
        <option key={s} value={s} />
      ))}
    </datalist>
  )
}
