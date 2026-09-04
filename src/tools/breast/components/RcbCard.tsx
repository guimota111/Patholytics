import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Check, Copy, ImageDown, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { NumField } from '@/components/ui/fields'
import { cn } from '@/lib/cn'
import type { MicroAnalysis } from '../analysis'
import { fmtN } from '../format'
import { RCB_CLASS_HEX } from '../heat'
import type { RcbOverrides } from '../types'

interface RcbCardProps {
  analysis: MicroAnalysis
  overrides: RcbOverrides
  setOverrides: (patch: Partial<RcbOverrides>) => void
  summary: string
  onExport?: () => void
  exporting?: boolean
}

/** Resultado: as seis variáveis (com a origem de cada uma e ajuste manual), o índice, a classe e o texto. */
export function RcbCard({ analysis: a, overrides, setOverrides, summary, onExport, exporting = false }: RcbCardProps) {
  const { t, i18n } = useTranslation()
  const n = (v: number | null | undefined, d = 1) => fmtN(v, d, i18n.language)
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)
  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const copy = async () => {
    if (!summary) return
    try {
      await navigator.clipboard.writeText(summary)
    } catch {
      return
    }
    setCopied(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1600)
  }

  const cls = a.invalid ? null : (a.forcedClass ?? a.rcb?.rcbClass ?? null)
  const classColor = cls ? RCB_CLASS_HEX[cls] : undefined
  const warnings = a.warnings.map((w) => t(`breast.warnings.${w.key}`, w.params ?? {}))
  const { inputs, sources } = a
  const extent = a.rcbLesion?.positiveExtent ?? null
  const anyOverride = overrides.d1 !== null || overrides.d2 !== null || overrides.ca !== null || overrides.cis !== null

  const tiles: { label: string; value: string; sub?: string; color?: string }[] = [
    {
      label: t('breast.rcb.index'),
      value: a.invalid ? '—' : a.forcedClass ? '—' : a.rcb ? n(a.rcb.index, 2) : '—',
      sub: a.invalid ? t('breast.rcb.invalidShort') : a.forcedClass ? t('breast.rcb.forcedShort') : a.rcb ? t('breast.rcb.terms', { p: n(a.rcb.primaryTerm, 2), nn: n(a.rcb.nodalTerm, 2) }) : t('breast.rcb.incompleteShort'),
    },
    { label: t('breast.rcb.classLabel'), value: cls ?? '—', sub: cls ? t(`breast.rcb.class.${cls}`) : undefined, color: classColor },
    { label: t('breast.rcb.bed'), value: inputs.d1 !== null && inputs.d2 !== null ? `${n(inputs.d1, 0)} × ${n(inputs.d2, 0)}` : '—', sub: `mm · ${t(`breast.rcb.source.${sources.d1}`)}` },
    { label: '%CA', value: inputs.ca !== null ? `${n(inputs.ca, 0)}%` : '—', sub: inputs.cis !== null ? t('breast.rcb.cisShort', { pct: n(inputs.cis, 0) }) : undefined },
    { label: t('breast.rcb.nodesLabel'), value: inputs.ln !== null ? String(inputs.ln) : '—', sub: (inputs.ln ?? 0) > 0 ? t('breast.rcb.dmetShort', { mm: n(inputs.dmet) }) : undefined },
    { label: t('breast.rcb.stagingLabel'), value: a.ypT ? `${a.ypT} ${a.ypN}` : a.ypN, sub: a.pcr === null ? undefined : a.pcr ? t('breast.rcb.pcrYes') : t('breast.rcb.pcrNo') },
  ]

  return (
    <div className="space-y-5">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border-2 border-accent/40 bg-line sm:grid-cols-3">
        {tiles.map((tile) => (
          <div key={tile.label} className="bg-accent-soft px-3 py-3" style={tile.color ? { boxShadow: `inset 6px 0 0 ${tile.color}` } : undefined}>
            <dt className="text-[0.6875rem] tracking-wider text-ink-muted uppercase">{tile.label}</dt>
            <dd className="tabular mt-1 text-2xl font-bold text-accent-ink" style={tile.color ? { color: tile.color } : undefined}>
              {tile.value}
            </dd>
            {tile.sub && <dd className="tabular mt-0.5 text-xs text-ink-muted">{tile.sub}</dd>}
          </div>
        ))}
      </dl>

      {warnings.length > 0 && (
        <ul className="space-y-1">
          {warnings.map((w, i) => (
            <li key={i} className="flex items-start gap-1.5 text-xs text-danger">
              <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
              {w}
            </li>
          ))}
        </ul>
      )}

      <div className="rounded-md border border-line bg-surface px-4 py-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-sm font-medium text-ink">{t('breast.rcb.overrideTitle')}</p>
          {anyOverride && (
            <Button type="button" size="sm" variant="ghost" onClick={() => setOverrides({ d1: null, d2: null, ca: null, cis: null })}>
              <RotateCcw className="size-4" aria-hidden />
              {t('breast.rcb.useComputed')}
            </Button>
          )}
        </div>
        <p className="mt-0.5 text-xs text-ink-faint">{t('breast.rcb.overrideHint')}</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {(['d1', 'd2', 'ca', 'cis'] as const).map((k) => (
            <NumField
              key={k}
              label={t(`breast.rcb.${k}`)}
              value={overrides[k]}
              min={0}
              max={k === 'ca' || k === 'cis' ? 100 : undefined}
              decimals
              unit={k === 'ca' || k === 'cis' ? '%' : 'mm'}
              placeholder={a.computed[k] !== null ? n(a.computed[k], k === 'ca' || k === 'cis' ? 0 : 1) : '—'}
              onChange={(v) => setOverrides({ [k]: v })}
              className={cn(overrides[k] !== null && 'border-accent')}
              hint={t(`breast.rcb.source.${sources[k]}`)}
            />
          ))}
        </div>
        {extent && a.rcbLesion && a.rcbLesion.positive > 0 && (
          <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-ink-muted">
            <span className="tabular">
              {t('breast.rcb.extentHint', { d1: n(extent.d1, 0), d2: n(extent.d2, 0), g1: n(a.rcbLesion.gross.d1, 0), g2: n(a.rcbLesion.gross.d2, 0) })}
            </span>
            <button
              type="button"
              onClick={() => setOverrides({ d1: Math.round(extent.d1), d2: Math.round(extent.d2) })}
              className="rounded-full border border-line bg-elevated px-2.5 py-0.5 text-xs text-ink-muted hover:border-line-strong hover:text-ink"
            >
              {t('breast.rcb.useExtent')}
            </button>
          </div>
        )}
      </div>

      {a.rcb && !a.invalid && !a.forcedClass && (
        <p className="tabular rounded-md border border-line bg-surface px-4 py-2.5 text-xs leading-relaxed text-ink-muted">
          {t('breast.rcb.formulaLine', {
            d1: n(inputs.d1, 0),
            d2: n(inputs.d2, 0),
            dPrim: n(a.rcb.dPrim, 2),
            cis: n(inputs.cis, 0),
            ca: n(inputs.ca, 0),
            fInv: n(a.rcb.fInv, 4),
            ln: inputs.ln ?? 0,
            dmet: n(inputs.dmet ?? 0, 1),
            primary: n(a.rcb.primaryTerm, 3),
            nodal: n(a.rcb.nodalTerm, 3),
            index: n(a.rcb.index, 3),
          })}
        </p>
      )}

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold tracking-tight text-ink">{t('breast.rcb.summaryTitle')}</h3>
          <div className="flex flex-wrap gap-2">
            {onExport && (
              <Button type="button" size="sm" variant="secondary" onClick={onExport} loading={exporting} disabled={!summary}>
                <ImageDown className="size-4" aria-hidden />
                {t(exporting ? 'breast.export.exporting' : 'breast.export.button')}
              </Button>
            )}
            <Button type="button" size="sm" onClick={() => void copy()} disabled={!summary}>
              {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
              {copied ? t('breast.text.copied') : t('breast.text.copy')}
            </Button>
          </div>
        </div>
        <textarea
          readOnly
          value={summary}
          placeholder={t('breast.rcb.empty')}
          rows={16}
          className="tabular mt-2 w-full resize-y rounded-md border border-line bg-surface px-3 py-2 text-xs leading-relaxed text-ink placeholder:text-ink-faint"
        />
      </div>
    </div>
  )
}
