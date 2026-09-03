import { useState } from 'react'
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
import { ResultBox } from './didactic'

interface RequirementsCardProps {
  config: MicroscopeConfig
}

export function RequirementsCard({ config }: RequirementsCardProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const [objective, setObjective] = useState(40)
  const [selectedId, setSelectedId] = useState('')
  const valid = isConfigValid(config)

  const d = valid ? fieldDiameter(config, objective) : NaN
  const a = valid ? fieldArea(config, objective) : NaN
  const selected = REQUIREMENTS.find((r) => r.id === selectedId) ?? null
  const mitoses = REQUIREMENTS.filter((r) => r.group === 'mitoses')
  const other = REQUIREMENTS.filter((r) => r.group === 'other')

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_auto]">
        <div className="space-y-1.5">
          <label htmlFor="fov-req-pick" className="block text-sm font-medium text-ink">
            {t('fov.pickDisease')}
          </label>
          <select
            id="fov-req-pick"
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            className="h-12 w-full rounded-lg border-2 border-line bg-surface px-3 text-base text-ink transition-colors hover:border-line-strong"
          >
            <option value="">{t('fov.pickPlaceholder')}</option>
            <optgroup label={t('fov.groupMitoses')}>
              {mitoses.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </optgroup>
            <optgroup label={t('fov.groupOther')}>
              {other.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
        <div className="space-y-1.5">
          <label htmlFor="fov-req-obj" className="block text-sm font-medium text-ink">
            {t('fov.objectiveUsed')}
          </label>
          <select
            id="fov-req-obj"
            value={objective}
            onChange={(e) => setObjective(Number(e.target.value))}
            className="h-12 rounded-lg border-2 border-line bg-surface px-3 text-base text-ink transition-colors hover:border-line-strong"
          >
            {OBJECTIVES.map((o) => (
              <option key={o} value={o}>
                {o}×
              </option>
            ))}
          </select>
        </div>
      </div>

      {!valid ? (
        <p className="text-sm text-danger">{t('fov.invalid')}</p>
      ) : !selected ? (
        <p className="text-sm text-ink-faint">{t('fov.pickEmpty')}</p>
      ) : (
        <RequirementDetail req={selected} diameter={d} area={a} objective={objective} lang={lang} />
      )}
    </div>
  )
}

function RequirementDetail({
  req,
  diameter,
  area,
  objective,
  lang,
}: {
  req: Requirement
  diameter: number
  area: number
  objective: number
  lang: string
}) {
  const { t } = useTranslation()

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-base font-semibold tracking-tight text-ink">{req.name}</h3>
        <Badge tone="accent">{t(`fov.method.${req.method}`)}</Badge>
        {req.areaMm2 && (
          <Badge>
            <span className="tabular">{fmt(req.areaMm2, 2, lang)} mm²</span>
          </Badge>
        )}
      </div>

      {req.kind === 'area' && req.areaMm2 && req.reportPerMm2 ? (
        <AreaInstruction req={req} area={area} objective={objective} lang={lang} />
      ) : req.kind === 'tenFields' ? (
        <BreastInstruction diameter={diameter} lang={lang} />
      ) : (
        <ResultBox className="border-danger/40 bg-danger-soft">
          <p className="flex items-start gap-2 text-sm leading-relaxed text-ink">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
            {t('fov.reqUndefined')}
          </p>
        </ResultBox>
      )}

      <p className="text-sm leading-relaxed text-ink-muted">{req.thresholds}</p>
      {req.note && <p className="text-xs leading-relaxed text-ink-faint">{req.note}</p>}
      {req.legacy && <LegacyLine req={req} area={area} objective={objective} lang={lang} />}
      <p className="text-xs text-ink-faint">
        {t('fov.reqSource')}: {req.source}
      </p>
    </div>
  )
}

function AreaInstruction({
  req,
  area,
  objective,
  lang,
}: {
  req: Requirement
  area: number
  objective: number
  lang: string
}) {
  const { t } = useTranslation()
  const cover = fieldsToCover(req.areaMm2!, area)
  const covered = cover.rounded * area
  const divisor = covered / req.reportPerMm2!
  const needsDivision = Math.abs(divisor - 1) > 0.005

  return (
    <ResultBox>
      <p className="tabular text-2xl font-bold text-accent-ink">
        {t('fov.countFieldsBig', { fields: cover.rounded, objective })}
      </p>
      {needsDivision ? (
        <p className="tabular mt-1 text-lg font-semibold text-ink">
          {t('fov.divideBig', { divisor: fmt(divisor, 1, lang), unit: fmt(req.reportPerMm2!, 2, lang) })}
        </p>
      ) : (
        <p className="mt-1 text-sm text-ink">{t('fov.noDivide', { unit: fmt(req.reportPerMm2!, 2, lang) })}</p>
      )}
      <p className="tabular mt-2 text-xs text-ink-muted">
        {t('fov.coverInfo', {
          covered: fmt(covered, 2, lang),
          area: fmt(req.areaMm2!, 2, lang),
          exact: fmt(cover.exact, 1, lang),
        })}
      </p>
    </ResultBox>
  )
}

function BreastInstruction({ diameter, lang }: { diameter: number; lang: string }) {
  const { t } = useTranslation()
  const row = breastRowFor(diameter)

  return (
    <ResultBox>
      <p className="text-sm leading-relaxed text-ink">
        {t('fov.breastIntro', { diameter: fmt(row.diameter, 2, lang), area: fmt(row.area, 3, lang) })}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <span className="tabular rounded-lg border border-success/40 bg-success/10 px-3 py-1.5 text-sm font-semibold text-success">
          {t('fov.score1', { n: row.score1Max })}
        </span>
        <span className="tabular rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-sm font-semibold text-amber-600">
          {t('fov.score2', { from: row.score1Max + 1, to: row.score2Max })}
        </span>
        <span className="tabular rounded-lg border border-danger/40 bg-danger-soft px-3 py-1.5 text-sm font-semibold text-danger">
          {t('fov.score3', { n: row.score2Max + 1 })}
        </span>
      </div>
      <p className="mt-2 text-xs text-ink-muted">{t('fov.breastUnit')}</p>
      {row.clamped && (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-danger">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {t('fov.breastClamped', { diameter: fmt(diameter, 3, lang) })}
        </p>
      )}
    </ResultBox>
  )
}

function LegacyLine({
  req,
  area,
  objective,
  lang,
}: {
  req: Requirement
  area: number
  objective: number
  lang: string
}) {
  const { t } = useTranslation()
  const refArea = areaOfDiameter(req.legacy!.diameterMm) * req.legacy!.fields
  const cover = fieldsToCover(refArea, area)
  return (
    <p className="tabular text-xs text-ink-faint">
      {t('fov.reqLegacy', {
        label: req.legacy!.label,
        fields: cover.rounded,
        exact: fmt(cover.exact, 1, lang),
        objective,
      })}
    </p>
  )
}
