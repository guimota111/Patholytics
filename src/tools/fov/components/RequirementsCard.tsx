import { useState, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { breastRowFor } from '../breastScore'
import {
  OBJECTIVES,
  areaOfDiameter,
  fieldArea,
  fieldDiameter,
  fieldsToCover,
  fmt,
  isConfigValid,
  type MicroscopeConfig,
} from '../optics'
import { REQUIREMENTS, type Requirement } from '../requirements'

interface RequirementsCardProps {
  config: MicroscopeConfig
}

export function RequirementsCard({ config }: RequirementsCardProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const [objective, setObjective] = useState(40)
  const valid = isConfigValid(config)

  const d = valid ? fieldDiameter(config, objective) : NaN
  const a = valid ? fieldArea(config, objective) : NaN

  return (
    <div className="rounded-lg border border-line bg-elevated shadow-card">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-5 py-4">
        <div>
          <h2 className="text-sm font-semibold tracking-tight text-ink">{t('fov.reqTitle')}</h2>
          <p className="mt-1 text-sm text-ink-muted">{t('fov.reqHint')}</p>
        </div>
        <div className="flex items-center gap-2">
          <label htmlFor="fov-req-obj" className="text-xs text-ink-faint">
            {t('fov.objectiveUsed')}
          </label>
          <select
            id="fov-req-obj"
            value={objective}
            onChange={(e) => setObjective(Number(e.target.value))}
            className="h-8 rounded-md border border-line bg-surface px-2 text-sm text-ink"
          >
            {OBJECTIVES.map((o) => (
              <option key={o} value={o}>
                {o}×
              </option>
            ))}
          </select>
          {valid && (
            <span className="tabular text-xs text-ink-faint">
              Ø {fmt(d, 3, lang)} mm · {fmt(a, 3, lang)} mm²
            </span>
          )}
        </div>
      </div>

      {!valid ? (
        <p className="px-5 py-5 text-sm text-danger">{t('fov.invalid')}</p>
      ) : (
        <ul className="divide-y divide-line">
          {REQUIREMENTS.map((req) => (
            <li key={req.id} className="px-5 py-4">
              <RequirementRow req={req} diameter={d} area={a} objective={objective} />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

function RequirementRow({
  req,
  diameter,
  area,
  objective,
}: {
  req: Requirement
  diameter: number
  area: number
  objective: number
}) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  let instruction: ReactNode = null

  if (req.kind === 'area' && req.areaMm2 && req.reportPerMm2) {
    const cover = fieldsToCover(req.areaMm2, area)
    const covered = cover.rounded * area
    const divisor = covered / req.reportPerMm2
    instruction = (
      <p className="tabular text-sm text-ink">
        {t('fov.reqFields', {
          fields: cover.rounded,
          exact: fmt(cover.exact, 1, lang),
          objective,
          area: fmt(req.areaMm2, 2, lang),
          covered: fmt(covered, 2, lang),
        })}{' '}
        {req.reportPerMm2 !== covered &&
          t('fov.reqDivide', { divisor: fmt(divisor, 2, lang), unit: fmt(req.reportPerMm2, 2, lang) })}
      </p>
    )
  } else if (req.kind === 'tenFields') {
    const row = breastRowFor(diameter)
    instruction = (
      <div className="space-y-1">
        <p className="tabular text-sm text-ink">
          {t('fov.breastScore', {
            diameter: fmt(row.diameter, 2, lang),
            area: fmt(row.area, 3, lang),
            s1: row.score1Max,
            s2from: row.score1Max + 1,
            s2to: row.score2Max,
            s3: row.score2Max + 1,
          })}
        </p>
        {row.clamped && (
          <p className="flex items-start gap-1.5 text-xs text-danger">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            {t('fov.breastClamped', { diameter: fmt(diameter, 3, lang) })}
          </p>
        )}
      </div>
    )
  } else {
    instruction = (
      <p className="flex items-start gap-1.5 text-sm text-ink-muted">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-accent" aria-hidden />
        {t('fov.reqUndefined')}
      </p>
    )
  }

  let legacy: string | null = null
  if (req.legacy) {
    const refArea = areaOfDiameter(req.legacy.diameterMm) * req.legacy.fields
    const cover = fieldsToCover(refArea, area)
    legacy = t('fov.reqLegacy', {
      label: req.legacy.label,
      fields: cover.rounded,
      exact: fmt(cover.exact, 1, lang),
      objective,
    })
  }

  return (
    <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-sm font-semibold tracking-tight text-ink">{req.name}</h3>
          <Badge>{t(`fov.method.${req.method}`)}</Badge>
          {req.areaMm2 && (
            <Badge>
              <span className="tabular">{fmt(req.areaMm2, 2, lang)} mm²</span>
            </Badge>
          )}
        </div>
        <p className="mt-1.5 text-sm leading-relaxed text-ink-muted">{req.thresholds}</p>
        {req.note && <p className="mt-1 text-xs leading-relaxed text-ink-faint">{req.note}</p>}
        <p className="mt-1.5 text-xs text-ink-faint">
          {t('fov.reqSource')}: {req.source}
        </p>
      </div>
      <div className="space-y-1.5 rounded-md border border-line bg-surface px-3 py-2.5">
        {instruction}
        {legacy && <p className="tabular text-xs text-ink-faint">{legacy}</p>}
      </div>
    </div>
  )
}
