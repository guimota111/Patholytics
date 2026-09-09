import { useTranslation } from 'react-i18next'
import { RotateCcw, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Toggle, compactInputClass } from '@/components/ui/fields'
import { cn } from '@/lib/cn'
import { MOHS_TINTAS, buildDivisoes, degToClock, fragRotacao, normDeg, relabelDivisoes, tintaHex } from '../mohs'
import type { MohsDivisao, MohsFrag } from '../types'
import { smallInput, smallSelect } from './inputs'
import { MohsDiagram } from './MohsDiagram'

interface MohsFragSectionProps {
  frag: MohsFrag
  letter: string
  onChange: (frag: MohsFrag) => void
  /** Primeiro cassete ao refazer as divisões. */
  casseteStart: () => number
  /** Depois de trocar o número de divisões (a peça principal ajusta o debulking). */
  afterNumChange?: (frag: MohsFrag) => MohsFrag
}

const NUM_OPTIONS = [1, 2, 3, 4, 5, 6, 8, 12]

/** Medidas, eixo no relógio, desenho e uma linha por divisão. */
export function MohsFragSection({ frag, letter, onChange, casseteStart, afterNumChange }: MohsFragSectionProps) {
  const { t } = useTranslation()
  const rot = fragRotacao(frag)

  const setDivisao = (index: number, next: Partial<MohsDivisao>) =>
    onChange({ ...frag, divisoes: frag.divisoes.map((d, i) => (i === index ? { ...d, ...next } : d)) })

  const setNum = (num: number) => {
    const next: MohsFrag = { ...frag, numDivisoes: num, divisoes: buildDivisoes(frag.shape, num, casseteStart(), rot) }
    onChange(afterNumChange ? afterNumChange(next) : next)
  }

  const rotate = (deg: number) => onChange(relabelDivisoes({ ...frag, rotacao: normDeg(deg) }))

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-3">
        {(['c', 'l', 'a'] as const).map((dim) => (
          <label key={dim} className="block">
            <span className="block text-xs font-medium text-ink">{t(`frozen.mohs.med.${dim}`)}</span>
            <input value={frag.medidas[dim]} onChange={(e) => onChange({ ...frag, medidas: { ...frag.medidas, [dim]: e.target.value } })} placeholder="_" className={cn(compactInputClass, 'mt-1')} />
          </label>
        ))}
      </div>

      <div className="rounded-md border border-line bg-surface p-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <span className="text-sm font-medium text-ink">{t('frozen.mohs.divisoes')}</span>
          <select value={frag.divisoes.length} onChange={(e) => setNum(Number(e.target.value))} className={smallSelect}>
            {NUM_OPTIONS.map((n) => (
              <option key={n} value={n}>
                {n === 1 ? t('frozen.mohs.semDivisao') : t('frozen.mohs.partes', { count: n })}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          <span className="text-xs text-ink-muted">{frag.shape === 'circle' ? t('frozen.mohs.eixoCirculo') : t('frozen.mohs.eixoMeiaLua')}</span>
          <Button type="button" size="sm" variant="ghost" onClick={() => rotate(rot - 15)} aria-label={t('frozen.mohs.girarAnti')}>
            <RotateCcw className="size-4" aria-hidden />
          </Button>
          <select value={Math.round(rot)} onChange={(e) => rotate(Number(e.target.value))} className={cn(smallSelect, 'tabular')}>
            {Array.from({ length: 24 }, (_, i) => i * 15).map((deg) => (
              <option key={deg} value={deg}>
                {degToClock(deg)}h
              </option>
            ))}
          </select>
          <Button type="button" size="sm" variant="ghost" onClick={() => rotate(rot + 15)} aria-label={t('frozen.mohs.girarHorario')}>
            <RotateCw className="size-4" aria-hidden />
          </Button>
        </div>

        <div className="mt-3 rounded-md border border-line bg-elevated p-2">
          <MohsDiagram frag={frag} onToggleTumor={(i) => setDivisao(i, { tumor: !frag.divisoes[i].tumor })} />
        </div>

        <div className="mt-3 space-y-1.5">
          {frag.divisoes.map((d, i) => (
            <div key={i} className="flex flex-wrap items-center gap-1.5">
              <span className="tabular text-xs text-ink-faint">{letter}</span>
              <input
                value={d.cassete}
                onChange={(e) => setDivisao(i, { cassete: e.target.value })}
                placeholder="nº"
                title={t('frozen.mohs.casseteHint')}
                aria-label={t('frozen.mohs.cassete')}
                className={cn(smallInput, 'w-16 text-center')}
              />
              <input
                value={d.label}
                onChange={(e) => setDivisao(i, { label: e.target.value, labelAuto: false })}
                placeholder="Ex: 12-3h"
                aria-label={t('frozen.mohs.rotulo')}
                className={cn(smallInput, 'w-28')}
              />
              <span className="inline-block size-5 shrink-0 rounded border border-line" style={{ background: tintaHex(d.cor) }} aria-hidden />
              <input
                value={d.cor}
                onChange={(e) => setDivisao(i, { cor: e.target.value })}
                list="frozen-mohs-tintas"
                autoComplete="off"
                placeholder={t('frozen.mohs.cor')}
                aria-label={t('frozen.mohs.cor')}
                className={cn(smallInput, 'w-32')}
              />
              <Toggle checked={d.tumor} onChange={(v) => setDivisao(i, { tumor: v })} label={<span className="text-xs">{t('frozen.mohs.tumorMargem')}</span>} />
            </div>
          ))}
        </div>
        <datalist id="frozen-mohs-tintas">
          {MOHS_TINTAS.map((tinta) => (
            <option key={tinta.nome} value={tinta.nome} />
          ))}
        </datalist>
        <p className="mt-2 text-xs leading-relaxed text-ink-faint">{t('frozen.mohs.hint')}</p>
      </div>
    </div>
  )
}
