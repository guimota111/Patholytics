import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { selectClass } from '@/components/ui/fields'
import { cn } from '@/lib/cn'
import { buildCongText, congIsquemiaTexto } from '../congText'
import { HOSPITAIS, defaultCongDoc, defaultPeca, letterOf, type CongDoc, type Peca } from '../types'
import type { Frozen } from '../useFrozen'
import { ExportCard } from './ExportCard'
import { IsquemiaCron } from './IsquemiaCron'
import { MaskModal } from './MaskModal'
import { PecaCard } from './PecaCard'

const inputClass = 'h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-faint hover:border-line-strong'
const textareaClass = 'w-full resize-y rounded-md border border-line bg-surface px-3 py-2 text-sm leading-relaxed text-ink placeholder:text-ink-faint hover:border-line-strong'

interface CongFormProps {
  frozen: Frozen
  onSaveModelo: () => Promise<void>
  canSaveModelo: boolean
}

/** A congelação: cabeçalho, peças e a saída do laudo. */
export function CongForm({ frozen, onSaveModelo, canSaveModelo }: CongFormProps) {
  const { t } = useTranslation()
  const { cong: doc, setCong: setDoc, now, suggestions, remember } = frozen
  const [maskTarget, setMaskTarget] = useState<number | null>(null)

  const patch = (next: Partial<CongDoc>) => setDoc({ ...doc, ...next })
  const setPecas = (pecas: Peca[]) => patch({ pecas: pecas.map((p, i) => ({ ...p, letter: letterOf(i) })) })
  const text = useMemo(() => buildCongText(doc, new Date(now)), [doc, now])

  const rememberAll = () => {
    remember('cirurgiao', doc.cirurgiao)
    remember('patologista', doc.patologista)
  }

  const isquemiaNota = doc.isquemiaFria.trim() && doc.isquemiaCron.inicio ? t('frozen.cong.isquemiaNota') : ''

  return (
    <div className="space-y-5">
      <section className="rounded-lg border border-line bg-elevated shadow-card">
        <header className="border-b border-line px-5 py-3">
          <h2 className="text-sm font-semibold tracking-tight text-ink">{t('frozen.cong.title')}</h2>
        </header>
        <div className="space-y-4 px-5 py-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="block text-sm font-medium text-ink">{t('frozen.cong.hospital')}</span>
              <select value={doc.hospital} onChange={(e) => patch({ hospital: e.target.value })} className={cn(selectClass, 'mt-1.5')}>
                <option value="">{t('frozen.cong.hospitalPick')}</option>
                {HOSPITAIS.map((h) => (
                  <option key={h.key} value={h.key}>
                    {h.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-ink">{t('frozen.cong.paciente')}</span>
              <input value={doc.paciente} onChange={(e) => patch({ paciente: e.target.value })} placeholder={t('frozen.cong.pacientePlaceholder')} className={cn(inputClass, 'mt-1.5')} />
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-ink">{t('frozen.cong.cirurgiao')}</span>
              <input
                value={doc.cirurgiao}
                onChange={(e) => patch({ cirurgiao: e.target.value })}
                onBlur={(e) => remember('cirurgiao', e.target.value)}
                list="frozen-cirurgiao"
                autoComplete="off"
                className={cn(inputClass, 'mt-1.5')}
              />
              <datalist id="frozen-cirurgiao">
                {suggestions('cirurgiao').map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </label>
            <label className="block">
              <span className="block text-sm font-medium text-ink">{t('frozen.cong.patologista')}</span>
              <input
                value={doc.patologista}
                onChange={(e) => patch({ patologista: e.target.value })}
                onBlur={(e) => remember('patologista', e.target.value)}
                list="frozen-patologista"
                autoComplete="off"
                className={cn(inputClass, 'mt-1.5')}
              />
              <datalist id="frozen-patologista">
                {suggestions('patologista').map((s) => (
                  <option key={s} value={s} />
                ))}
              </datalist>
            </label>
          </div>

          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_16rem]">
            <IsquemiaCron cron={doc.isquemiaCron} now={now} onChange={(cron) => patch({ isquemiaCron: cron })} hint={t('frozen.cong.cronHint')} />
            <label className="block">
              <span className="block text-sm font-medium text-ink">{t('frozen.cong.isquemiaManual')}</span>
              <input value={doc.isquemiaFria} onChange={(e) => patch({ isquemiaFria: e.target.value })} placeholder="Ex: 45 min" className={cn(inputClass, 'mt-1.5')} />
              <span className="mt-1 block text-xs text-ink-faint">{isquemiaNota || congIsquemiaTexto(doc, now) || t('frozen.cong.isquemiaManualHint')}</span>
            </label>
          </div>

          <div>
            <button
              type="button"
              onClick={() => patch({ informesClinicosVisible: !doc.informesClinicosVisible })}
              className="inline-flex items-center gap-1.5 text-sm text-ink-muted transition-colors hover:text-ink"
            >
              {doc.informesClinicosVisible ? <ChevronDown className="size-4" aria-hidden /> : <ChevronRight className="size-4" aria-hidden />}
              {t('frozen.cong.informes')}
            </button>
            {doc.informesClinicosVisible && (
              <textarea value={doc.informesClinicos} onChange={(e) => patch({ informesClinicos: e.target.value })} rows={2} placeholder="Ex: adenocarcinoma pulmonar." className={cn(textareaClass, 'mt-2')} />
            )}
          </div>
        </div>
      </section>

      {doc.pecas.map((peca, index) => (
        <PecaCard
          key={index}
          peca={peca}
          index={index}
          total={doc.pecas.length}
          onChange={(next) => setPecas(doc.pecas.map((p, i) => (i === index ? next : p)))}
          onRemove={() => setPecas(doc.pecas.filter((_, i) => i !== index))}
          onMove={(delta) => {
            const target = index + delta
            if (target < 0 || target >= doc.pecas.length) return
            const next = [...doc.pecas]
            ;[next[index], next[target]] = [next[target], next[index]]
            setPecas(next)
          }}
          onMask={() => setMaskTarget(index)}
        />
      ))}

      <Button type="button" variant="secondary" onClick={() => setPecas([...doc.pecas, defaultPeca(doc.pecas.length)])}>
        <Plus className="size-4" aria-hidden />
        {t('frozen.cong.addPeca')}
      </Button>

      <ExportCard
        kind="cong"
        text={text}
        doc={doc}
        fileBase={`Congelacao_${doc.paciente || 'Congelacao'}`}
        onBeforeExport={rememberAll}
        onSaveModelo={canSaveModelo ? onSaveModelo : undefined}
        onClear={() => setDoc(defaultCongDoc())}
        clearConfirm={t('frozen.cong.clearConfirm')}
        frozen={frozen}
      />

      {maskTarget !== null && (
        <MaskModal
          pecas={doc.pecas}
          target={maskTarget}
          onTarget={setMaskTarget}
          onClose={() => setMaskTarget(null)}
          onApply={(pi, result) => {
            const p = doc.pecas[pi]
            if (!p) return
            const next: Peca = {
              ...p,
              macroscopia: result.macro,
              nome: result.nome && !p.nome.trim() ? result.nome : p.nome,
              cassetes: result.cassetes && result.cassetes.length ? result.cassetes : p.cassetes,
              resultado: result.resultado || p.resultado,
              fraseRecebimento: true,
            }
            setPecas(doc.pecas.map((x, i) => (i === pi ? next : x)))
            setMaskTarget(null)
          }}
        />
      )}
    </div>
  )
}
