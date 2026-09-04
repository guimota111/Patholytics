import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Check, Copy, ImageDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { Analysis } from '../analysis'
import { fmtN, gleasonText } from '../format'

interface ResultsCardProps {
  analysis: Analysis
  summary: string
  onExport?: () => void
  exporting?: boolean
}

export function ResultsCard({ analysis: a, summary, onExport, exporting = false }: ResultsCardProps) {
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

  const g = a.gleason
  const warnings = a.warnings.map((w) => t(`prostate.warnings.${w.key}`, w.params ?? {}))

  const tiles: { label: string; value: string; sub?: string }[] = [
    {
      label: t('prostate.results.volume'),
      value: `${n(a.volumePct)}%`,
      sub: a.tumorGrams !== null ? `≈ ${n(a.tumorGrams, 2)} g` : t('prostate.results.involved', { n: a.involvedCells, total: a.prostateCells }),
    },
    {
      label: 'Gleason',
      value: g ? gleasonText(g) : '—',
      sub: g ? `${t('prostate.results.gradeGroup')} ${g.gradeGroup}${g.tertiary ? ` · ${t('prostate.results.tertiaryShort', { p: g.tertiary.pattern })}` : ''}` : undefined,
    },
    { label: t('prostate.results.g4'), value: a.shares ? `${n(a.shares.p4)}%` : '—', sub: a.cribriformOfG4 !== null ? t('prostate.results.cribShort', { pct: n(a.cribriformOfG4) }) : undefined },
    { label: t('prostate.results.g5'), value: a.shares ? `${n(a.shares.p5)}%` : '—' },
    {
      label: t('prostate.results.margins'),
      value: a.margins.foci.length ? 'R1' : a.involvedCells ? 'R0' : '—',
      sub: a.margins.foci.length
        ? `${a.margins.foci.length} ${t('prostate.results.foci')}${a.margins.extent && a.margins.totalMm > 0 ? ` · ${t(`prostate.results.${a.margins.extent}`)}` : ''}`
        : undefined,
    },
    {
      label: t('prostate.results.staging'),
      value: a.staging.pT ? `${a.staging.pT} ${a.staging.pN}` : '—',
      sub: a.epe.status !== 'none' ? `${t('prostate.results.epe')}: ${t(`prostate.epe.${a.epe.status}`)}` : undefined,
    },
  ]

  return (
    <div className="space-y-5">
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border-2 border-accent/40 bg-line sm:grid-cols-3">
        {tiles.map((tile) => (
          <div key={tile.label} className="bg-accent-soft px-3 py-3">
            <dt className="text-[0.6875rem] tracking-wider text-ink-muted uppercase">{tile.label}</dt>
            <dd className="tabular mt-1 text-2xl font-bold text-accent-ink">{tile.value}</dd>
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

      <div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-sm font-semibold tracking-tight text-ink">{t('prostate.results.summaryTitle')}</h3>
          <div className="flex flex-wrap gap-2">
            {onExport && (
              <Button type="button" size="sm" variant="secondary" onClick={onExport} loading={exporting} disabled={!summary}>
                <ImageDown className="size-4" aria-hidden />
                {t(exporting ? 'prostate.export.exporting' : 'prostate.export.button')}
              </Button>
            )}
            <Button type="button" size="sm" onClick={() => void copy()} disabled={!summary}>
              {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
              {copied ? t('prostate.results.copied') : t('prostate.results.copy')}
            </Button>
          </div>
        </div>
        <textarea
          readOnly
          value={summary}
          placeholder={t('prostate.results.empty')}
          rows={16}
          className="tabular mt-2 w-full resize-y rounded-md border border-line bg-surface px-3 py-2 text-xs leading-relaxed text-ink placeholder:text-ink-faint"
        />
      </div>
    </div>
  )
}
