import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ArrowDown, ArrowUp, Plus, Trash2, Wand2, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Toggle } from '@/components/ui/fields'
import { cn } from '@/lib/cn'
import { FRASE_RECEBIMENTO } from '../congText'
import { computeBlocos, stripCasseteLetter } from '../text'
import type { Cassete, Peca } from '../types'
import { smallInput } from './inputs'

interface PecaCardProps {
  peca: Peca
  index: number
  total: number
  onChange: (peca: Peca) => void
  onRemove: () => void
  onMove: (delta: number) => void
  onMask: () => void
}

const inputClass = 'h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-faint hover:border-line-strong'
const textareaClass = 'w-full resize-y rounded-md border border-line bg-surface px-3 py-2 text-sm leading-relaxed text-ink placeholder:text-ink-faint hover:border-line-strong'

/** Uma peça da congelação: nome, macroscopia, cassetes e resultado. */
export function PecaCard({ peca, index, total, onChange, onRemove, onMove, onMask }: PecaCardProps) {
  const { t } = useTranslation()
  const [confirmRemove, setConfirmRemove] = useState(false)
  const patch = (next: Partial<Peca>) => onChange({ ...peca, ...next })
  const patchCassete = (ci: number, next: Partial<Cassete>) =>
    patch({ cassetes: peca.cassetes.map((c, i) => (i === ci ? { ...c, ...next } : c)) })

  const addCassete = () => {
    const last = peca.cassetes[peca.cassetes.length - 1]
    const ref = last.fim && last.fim.trim() ? last.fim : last.inicio
    const n = parseInt(stripCasseteLetter(peca.letter, ref), 10)
    patch({ cassetes: [...peca.cassetes, { inicio: Number.isNaN(n) ? '' : String(n + 1), fim: '', descricao: '' }] })
  }

  return (
    <section className="rounded-lg border border-line bg-elevated shadow-card">
      <header className="flex flex-wrap items-center gap-2 border-b border-line px-4 py-3">
        <span className="tabular flex size-8 shrink-0 items-center justify-center rounded-md bg-accent text-sm font-bold text-white">{peca.letter}</span>
        <input
          value={peca.nome}
          onChange={(e) => patch({ nome: e.target.value })}
          placeholder={t('frozen.peca.nomePlaceholder')}
          aria-label={t('frozen.peca.nome')}
          className={cn(inputClass, 'min-w-0 flex-1')}
        />
        {total > 1 && (
          <div className="flex items-center gap-1">
            <Button type="button" size="sm" variant="ghost" disabled={index === 0} onClick={() => onMove(-1)} aria-label={t('frozen.peca.moveUp')}>
              <ArrowUp className="size-4" aria-hidden />
            </Button>
            <Button type="button" size="sm" variant="ghost" disabled={index === total - 1} onClick={() => onMove(1)} aria-label={t('frozen.peca.moveDown')}>
              <ArrowDown className="size-4" aria-hidden />
            </Button>
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
              <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmRemove(true)} aria-label={t('frozen.peca.remove')}>
                <Trash2 className="size-4" aria-hidden />
              </Button>
            )}
          </div>
        )}
      </header>

      <div className="space-y-4 px-4 py-4">
        <div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm font-medium text-ink">{t('frozen.peca.macro')}</span>
            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" size="sm" variant="secondary" onClick={onMask}>
                <Wand2 className="size-4" aria-hidden />
                {t('frozen.peca.masks')}
              </Button>
              <Toggle checked={peca.fraseRecebimento} onChange={(v) => patch({ fraseRecebimento: v })} label={t('frozen.peca.frase')} />
            </div>
          </div>
          {peca.fraseRecebimento && <p className="mt-1.5 text-xs text-ink-faint italic">{FRASE_RECEBIMENTO}…</p>}
          <textarea
            value={peca.macroscopia}
            onChange={(e) => patch({ macroscopia: e.target.value })}
            rows={4}
            placeholder={peca.fraseRecebimento ? t('frozen.peca.macroPlaceholderFrase') : t('frozen.peca.macroPlaceholder')}
            aria-label={t('frozen.peca.macro')}
            className={cn(textareaClass, 'mt-1.5')}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          <div>
            <span className="block text-sm font-medium text-ink">{t('frozen.peca.blocos')}</span>
            <p className="tabular mt-1.5 h-9 rounded-md border border-dashed border-line px-3 leading-9 text-ink-muted" title={t('frozen.peca.blocosHint')}>
              {computeBlocos(peca)}
            </p>
          </div>
          <label className="block">
            <span className="block text-sm font-medium text-ink">{t('frozen.peca.fragmentos')}</span>
            <input
              value={peca.fragmentos}
              onChange={(e) => patch({ fragmentos: e.target.value.toUpperCase() || 'V' })}
              placeholder="V"
              className={cn(inputClass, 'tabular mt-1.5')}
            />
          </label>
          <div>
            <span className="block text-sm font-medium text-ink">{t('frozen.peca.inclusao')}</span>
            <div className="mt-2.5">
              <Toggle checked={peca.tudoIncluido} onChange={(v) => patch({ tudoIncluido: v })} label={peca.tudoIncluido ? t('frozen.peca.tudo') : t('frozen.peca.parcial')} />
            </div>
          </div>
        </div>

        <div>
          <span className="block text-sm font-medium text-ink">{t('frozen.peca.cassetes')}</span>
          <div className="mt-1.5 space-y-1.5">
            {peca.cassetes.map((c, ci) => (
              <div key={ci} className="flex flex-wrap items-center gap-1.5">
                <span className="tabular text-xs text-ink-faint">{peca.letter}</span>
                <input
                  value={stripCasseteLetter(peca.letter, c.inicio)}
                  onChange={(e) => patchCassete(ci, { inicio: e.target.value })}
                  placeholder={String(ci + 1)}
                  aria-label={t('frozen.peca.casseteInicio')}
                  className={cn(smallInput, 'w-14 text-center')}
                />
                <span className="text-xs text-ink-faint">a</span>
                <span className="tabular text-xs text-ink-faint">{peca.letter}</span>
                <input
                  value={stripCasseteLetter(peca.letter, c.fim)}
                  onChange={(e) => patchCassete(ci, { fim: e.target.value })}
                  placeholder={t('frozen.peca.casseteFim')}
                  aria-label={t('frozen.peca.casseteFim')}
                  className={cn(smallInput, 'w-20 text-center')}
                />
                <input
                  value={c.descricao}
                  onChange={(e) => patchCassete(ci, { descricao: e.target.value })}
                  placeholder={t('frozen.peca.casseteDesc')}
                  aria-label={t('frozen.peca.casseteDesc')}
                  className={cn(smallInput, 'min-w-40 flex-1')}
                />
                <button
                  type="button"
                  disabled={peca.cassetes.length === 1}
                  onClick={() => patch({ cassetes: peca.cassetes.filter((_, i) => i !== ci) })}
                  aria-label={t('frozen.peca.removeCassete')}
                  className="rounded-md p-1 text-ink-faint transition-colors hover:bg-danger-soft hover:text-danger disabled:opacity-40"
                >
                  <X className="size-4" aria-hidden />
                </button>
              </div>
            ))}
          </div>
          <Button type="button" size="sm" variant="ghost" className="mt-2" onClick={addCassete}>
            <Plus className="size-4" aria-hidden />
            {t('frozen.peca.addCassete')}
          </Button>
        </div>

        <label className="block">
          <span className="block text-sm font-medium text-ink">{t('frozen.peca.resultado')}</span>
          <textarea
            value={peca.resultado}
            onChange={(e) => patch({ resultado: e.target.value })}
            rows={2}
            placeholder={t('frozen.peca.resultadoPlaceholder')}
            className={cn(textareaClass, 'mt-1.5')}
          />
        </label>
      </div>
    </section>
  )
}
