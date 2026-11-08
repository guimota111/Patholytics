import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Analysis } from '../analysis'
import { compactLabels, fmtN, gleasonText } from '../format'
import { PATTERN_HEX } from '../heat'
import type { Nodule } from '../nodules'
import type { CaseGlobals } from '../types'

interface NodulesPanelProps {
  analysis: Analysis
  globals: CaseGlobals
  setGlobals: (patch: Partial<CaseGlobals>) => void
}

/**
 * Os nódulos que o mapa separou, do maior para o menor, e de qual deles sai
 * o Gleason do laudo. Só aparece quando há mais de um: com um só nódulo não
 * há escolha a fazer.
 */
export function NodulesPanel({ analysis: a, globals, setGlobals }: NodulesPanelProps) {
  const { t, i18n } = useTranslation()
  const n = (v: number | null | undefined, d = 1) => fmtN(v, d, i18n.language)
  if (a.nodules.length < 2) return null

  const glandScope = globals.gradeScope === 'gland'
  const pick = (nodule: Nodule) => setGlobals({ gradeScope: 'nodule', indexNodule: nodule.index === 1 ? null : nodule.key })

  return (
    <div className="space-y-3 rounded-lg border border-line bg-surface px-4 py-4">
      <div>
        <h3 className="text-sm font-semibold tracking-tight text-ink">{t('prostate.nodules.title', { n: a.nodules.length })}</h3>
        <p className="mt-0.5 text-xs leading-relaxed text-ink-muted">{t('prostate.nodules.hint')}</p>
      </div>

      <div role="radiogroup" aria-label={t('prostate.nodules.gradeBy')} className="space-y-2">
        {a.nodules.map((nodule) => {
          const active = !glandScope && a.index?.key === nodule.key
          const where = nodule.groupNames.filter(Boolean).join(', ') || t('prostate.unmappedGroup')
          return (
            <button
              key={nodule.key}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => pick(nodule)}
              className={cn(
                'flex w-full flex-wrap items-center gap-x-4 gap-y-1.5 rounded-md border px-3 py-2.5 text-left text-sm transition-colors',
                active ? 'border-accent bg-accent-soft' : 'border-line bg-elevated hover:border-line-strong',
              )}
            >
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    'tabular flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-bold',
                    active ? 'bg-accent text-white' : 'bg-raised text-ink-muted',
                  )}
                >
                  {nodule.index}
                </span>
                <span className="font-medium text-ink">
                  {nodule.index === 1 ? t('prostate.nodules.dominant') : t('prostate.nodules.nodule', { n: nodule.index })}
                  {nodule.label !== null && <span className="ml-1 text-xs font-normal text-ink-faint">{t('prostate.nodules.labelled', { n: nodule.label })}</span>}
                </span>
              </span>
              <span className="tabular text-ink-muted">
                {t('prostate.nodules.cassettes', { cells: compactLabels(nodule.cells.map((c) => c.cell.label)) })} · {where}
              </span>
              <span className="tabular ml-auto flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="text-ink-muted">{n(nodule.pctOfGland)}%</span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-ink">
                  <span className="inline-block size-2.5 rounded-sm" style={{ background: PATTERN_HEX[nodule.worst] }} aria-hidden />
                  {gleasonText(nodule.gleason)}
                  <span className="text-xs font-normal text-ink-faint">GG{nodule.gleason.gradeGroup}</span>
                </span>
                {nodule.epe !== 'none' && <span className="text-xs text-ink-faint">{t('prostate.results.epe')}</span>}
                {nodule.marginFoci > 0 && <span className="text-xs text-danger">{t('prostate.nodules.margin')}</span>}
              </span>
            </button>
          )
        })}

        <button
          type="button"
          role="radio"
          aria-checked={glandScope}
          onClick={() => setGlobals({ gradeScope: 'gland' })}
          className={cn(
            'flex w-full flex-wrap items-center gap-x-4 gap-y-1 rounded-md border px-3 py-2.5 text-left text-sm transition-colors',
            glandScope ? 'border-accent bg-accent-soft' : 'border-dashed border-line bg-elevated hover:border-line-strong',
          )}
        >
          <span className="font-medium text-ink">{t('prostate.nodules.wholeGland')}</span>
          <span className="text-xs text-ink-muted">{t('prostate.nodules.wholeGlandHint')}</span>
          <span className="tabular ml-auto font-semibold text-ink">
            {gleasonText(a.global.gleason)}
            {a.global.gleason && <span className="ml-1 text-xs font-normal text-ink-faint">GG{a.global.gleason.gradeGroup}</span>}
          </span>
        </button>
      </div>

      {a.higherGradeNodule && (
        <p className="flex items-start gap-1.5 text-xs leading-relaxed text-ink-muted">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-danger" aria-hidden />
          {t('prostate.nodules.higherGrade', {
            n: a.higherGradeNodule.index,
            gleason: gleasonText(a.higherGradeNodule.gleason),
            gg: a.higherGradeNodule.gleason.gradeGroup,
          })}
        </p>
      )}
      <p className="text-xs leading-relaxed text-ink-faint">{t('prostate.nodules.fixHint')}</p>
    </div>
  )
}
