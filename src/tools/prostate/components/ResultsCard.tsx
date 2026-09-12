import type { ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, ImageDown } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import type { Analysis } from '../analysis'
import { fmtN, gleasonText } from '../format'

interface ResultsCardProps {
  analysis: Analysis
  onExport?: () => void
  exporting?: boolean
  /** O montador de laudo, abaixo dos números. */
  children?: ReactNode
}

export function ResultsCard({ analysis: a, onExport, exporting = false, children }: ResultsCardProps) {
  const { t, i18n } = useTranslation()
  const n = (v: number | null | undefined, d = 1) => fmtN(v, d, i18n.language)

  const g = a.gleason
  const warnings = a.warnings.map((w) => t(`prostate.warnings.${w.key}`, w.params ?? {}))

  const marginSites = [...new Set(a.margins.foci.map((f) => f.groupName || t(`prostate.site.${f.site}`)))]
  const tiles: { label: string; value: string; sub?: string; small?: boolean }[] = [
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
      value: a.margins.foci.length
        ? t(a.margins.extent === 'extensive' ? 'prostate.results.marginExtensive' : 'prostate.results.marginFocal')
        : a.involvedCells
          ? t('prostate.results.marginFree')
          : '—',
      sub: a.margins.foci.length ? marginSites.join(' · ') : undefined,
      small: true,
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
            <dd className={tile.small ? 'mt-1 text-base leading-snug font-bold text-accent-ink' : 'tabular mt-1 text-2xl font-bold text-accent-ink'}>
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

      {onExport && (
        <div className="flex justify-end">
          <Button type="button" size="sm" variant="secondary" onClick={onExport} loading={exporting} disabled={!a.involvedCells}>
            <ImageDown className="size-4" aria-hidden />
            {t(exporting ? 'prostate.export.exporting' : 'prostate.export.button')}
          </Button>
        </div>
      )}

      {children && (
        <div className="border-t border-line pt-5">
          <h3 className="text-sm font-semibold tracking-tight text-ink">{t('prostate.report.title')}</h3>
          <p className="mt-0.5 mb-4 text-sm text-ink-muted">{t('prostate.report.hint')}</p>
          {children}
        </div>
      )}
    </div>
  )
}
