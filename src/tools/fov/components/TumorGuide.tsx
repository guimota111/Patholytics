import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle } from 'lucide-react'
import { Badge } from '@/components/ui/Badge'
import { ResultBox } from '@/components/ui/didactic'
import { cn } from '@/lib/cn'
import { breastRowFor, breastScore } from '../breastScore'
import { HPF_OBJECTIVE, type FieldRef, type Setting } from '../flow'
import { areaOfDiameter, fieldsToCover, fmt } from '../optics'
import { REQUIREMENTS, type Requirement } from '../requirements'
import { bigInputClass } from './CountToMm2'

interface TumorGuideProps {
  setting: Setting
  field: FieldRef
}

/**
 * "Estou laudando um melanoma": o protocolo pede tantos mm²; no microscópio
 * isso vira "conte N campos na objetiva X", na tele vira "meça N mm²". Com a
 * contagem feita, devolve o valor no denominador do laudo (ou o score, na
 * mama).
 */
export function TumorGuide({ setting, field }: TumorGuideProps) {
  const { t } = useTranslation()
  const [selectedId, setSelectedId] = useState('')
  const selected = REQUIREMENTS.find((r) => r.id === selectedId) ?? null
  const mitoses = REQUIREMENTS.filter((r) => r.group === 'mitoses')
  const other = REQUIREMENTS.filter((r) => r.group === 'other')

  return (
    <div className="space-y-5">
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

      {!selected ? (
        <p className="text-sm text-ink-faint">{t('fov.pickEmpty')}</p>
      ) : (
        <RequirementDetail key={selected.id} req={selected} setting={setting} field={field} />
      )}
    </div>
  )
}

function RequirementDetail({ req, setting, field }: { req: Requirement; setting: Setting; field: FieldRef }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="text-base font-semibold tracking-tight text-ink">{req.name}</h3>
        <Badge tone="accent">{t(`fov.method.${req.method}`)}</Badge>
      </div>

      {req.kind === 'area' && req.areaMm2 && req.reportPerMm2 ? (
        <AreaInstruction req={req} setting={setting} field={field} />
      ) : req.kind === 'tenFields' ? (
        <BreastInstruction setting={setting} field={field} />
      ) : (
        <UndefinedInstruction setting={setting} field={field} />
      )}

      <p className="text-sm leading-relaxed text-ink-muted">{req.thresholds}</p>
      {req.note && <p className="text-xs leading-relaxed text-ink-faint">{req.note}</p>}
      {req.legacy && (
        <p className="tabular text-xs text-ink-faint">
          {setting === 'microscope'
            ? t('fov.reqLegacy', {
                label: req.legacy.label,
                fields: fieldsToCover(areaOfDiameter(req.legacy.diameterMm) * req.legacy.fields, field.area).rounded,
                exact: fmt(fieldsToCover(areaOfDiameter(req.legacy.diameterMm) * req.legacy.fields, field.area).exact, 1, lang),
                objective: field.objective,
              })
            : t('fov.reqLegacyTele', {
                label: req.legacy.label,
                area: fmt(areaOfDiameter(req.legacy.diameterMm) * req.legacy.fields, 2, lang),
              })}
        </p>
      )}
      <p className="text-xs text-ink-faint">
        {t('fov.reqSource')}: {req.source}
      </p>
    </div>
  )
}

/** "Contei [x] nesses campos / nessa área" → valor no denominador do laudo. */
function CountLine({ divisor, unit, label }: { divisor: number; unit: number; label: string }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const [count, setCount] = useState('')
  const c = Number(count)
  const value = count !== '' && divisor > 0 ? c / divisor : NaN
  return (
    <div className="mt-4 border-t border-accent/30 pt-4">
      <p className="flex flex-wrap items-center gap-x-2.5 gap-y-2 text-base text-ink">
        {t('fov.countedPre')}
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={count}
          onChange={(e) => setCount(e.target.value)}
          aria-label={t('fov.count')}
          placeholder="?"
          className={cn(bigInputClass, 'h-10 w-20 text-base')}
        />
        {label}
      </p>
      {Number.isFinite(value) && (
        <p className="tabular mt-2 text-lg font-semibold text-accent-ink">
          {t('fov.countedResult', { value: fmt(value, 1, lang), unit: fmt(unit, 2, lang) })}
        </p>
      )}
    </div>
  )
}

function AreaInstruction({ req, setting, field }: { req: Requirement; setting: Setting; field: FieldRef }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const areaMm2 = req.areaMm2!
  const unit = req.reportPerMm2!

  if (setting === 'tele') {
    const divisor = areaMm2 / unit
    return (
      <ResultBox>
        <p className="text-sm text-ink-muted">{t('fov.protocolAsks', { area: fmt(areaMm2, 2, lang) })}</p>
        <p className="tabular mt-1 text-2xl font-bold text-accent-ink">{t('fov.measureBig', { area: fmt(areaMm2, 2, lang) })}</p>
        {Math.abs(divisor - 1) > 0.05 ? (
          <p className="tabular mt-1 text-lg font-semibold text-ink">{t('fov.divideBig', { divisor: fmt(divisor, 1, lang), unit: fmt(unit, 2, lang) })}</p>
        ) : (
          <p className="mt-1 text-sm text-ink">{t('fov.noDivide', { unit: fmt(unit, 2, lang) })}</p>
        )}
        <p className="mt-2 text-xs leading-relaxed text-ink-faint">{t('fov.teleAreaHint', { fields: fmt(areaMm2 / field.area, 1, lang), diameter: fmt(field.diameter, 3, lang) })}</p>
        <CountLine divisor={divisor} unit={unit} label={t('fov.countedInArea', { area: fmt(areaMm2, 2, lang) })} />
      </ResultBox>
    )
  }

  const cover = fieldsToCover(areaMm2, field.area)
  const covered = cover.rounded * field.area
  const divisor = covered / unit
  return (
    <ResultBox>
      <p className="text-sm text-ink-muted">{t('fov.protocolAsks', { area: fmt(areaMm2, 2, lang) })}</p>
      <p className="tabular mt-1 text-2xl font-bold text-accent-ink">
        {t(req.method === 'consecutive' ? 'fov.countFieldsConsecutive' : 'fov.countFieldsBig', { fields: cover.rounded, objective: field.objective })}
      </p>
      {Math.abs(divisor - 1) > 0.05 ? (
        <p className="tabular mt-1 text-lg font-semibold text-ink">{t('fov.divideBig', { divisor: fmt(divisor, 1, lang), unit: fmt(unit, 2, lang) })}</p>
      ) : (
        <p className="mt-1 text-sm text-ink">{t('fov.noDivide', { unit: fmt(unit, 2, lang) })}</p>
      )}
      <p className="tabular mt-2 text-xs text-ink-muted">
        {t('fov.coverInfo', { covered: fmt(covered, 2, lang), area: fmt(areaMm2, 2, lang), exact: fmt(cover.exact, 1, lang) })}
      </p>
      <CountLine divisor={divisor} unit={unit} label={t('fov.countedInFields', { fields: cover.rounded })} />
    </ResultBox>
  )
}

function BreastInstruction({ setting, field }: { setting: Setting; field: FieldRef }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const [count, setCount] = useState('')
  const row = breastRowFor(field.diameter)
  const wrongObjective = setting === 'microscope' && field.objective !== HPF_OBJECTIVE
  const c = Number(count)
  const score = count !== '' ? breastScore(row, c) : null
  const tenArea = row.area * 10

  return (
    <ResultBox>
      {setting === 'tele' ? (
        <>
          <p className="text-sm text-ink-muted">{t('fov.breastTeleTitle')}</p>
          <p className="tabular mt-1 text-2xl font-bold text-accent-ink">{t('fov.measureBig', { area: fmt(tenArea, 2, lang) })}</p>
          <p className="mt-1 text-sm leading-relaxed text-ink">{t('fov.breastTeleHint', { diameter: fmt(row.diameter, 2, lang), area: fmt(row.area, 3, lang) })}</p>
        </>
      ) : (
        <p className="text-sm leading-relaxed text-ink">{t('fov.breastIntro', { diameter: fmt(row.diameter, 2, lang), area: fmt(row.area, 3, lang) })}</p>
      )}
      <div className="mt-3 flex flex-wrap gap-2">
        <span className={cn('tabular rounded-lg border border-success/40 bg-success/10 px-3 py-1.5 text-sm font-semibold text-success', score === 1 && 'ring-2 ring-success')}>
          {t('fov.score1', { n: row.score1Max })}
        </span>
        <span className={cn('tabular rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-1.5 text-sm font-semibold text-amber-600', score === 2 && 'ring-2 ring-amber-500')}>
          {t('fov.score2', { from: row.score1Max + 1, to: row.score2Max })}
        </span>
        <span className={cn('tabular rounded-lg border border-danger/40 bg-danger-soft px-3 py-1.5 text-sm font-semibold text-danger', score === 3 && 'ring-2 ring-danger')}>
          {t('fov.score3', { n: row.score2Max + 1 })}
        </span>
      </div>
      <p className="mt-2 text-xs text-ink-muted">{t('fov.breastUnit')}</p>
      {wrongObjective && (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-danger">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {t('fov.breastObjective')}
        </p>
      )}
      {row.clamped && (
        <p className="mt-2 flex items-start gap-1.5 text-xs text-danger">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {t('fov.breastClamped', { diameter: fmt(field.diameter, 3, lang) })}
        </p>
      )}
      <div className="mt-4 border-t border-accent/30 pt-4">
        <p className="flex flex-wrap items-center gap-x-2.5 gap-y-2 text-base text-ink">
          {t('fov.countedPre')}
          <input
            type="number"
            inputMode="numeric"
            min={0}
            value={count}
            onChange={(e) => setCount(e.target.value)}
            aria-label={t('fov.count')}
            placeholder="?"
            className={cn(bigInputClass, 'h-10 w-20 text-base')}
          />
          {setting === 'tele' ? t('fov.countedInArea', { area: fmt(tenArea, 2, lang) }) : t('fov.countedInFields', { fields: 10 })}
        </p>
        {score !== null && <p className="tabular mt-2 text-lg font-semibold text-accent-ink">{t('fov.breastResult', { score })}</p>}
      </div>
    </ResultBox>
  )
}

function UndefinedInstruction({ setting, field }: { setting: Setting; field: FieldRef }) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const tenArea = field.area * 10
  return (
    <ResultBox className="border-danger/40 bg-danger-soft">
      <p className="flex items-start gap-2 text-sm leading-relaxed text-ink">
        <AlertTriangle className="mt-0.5 size-4 shrink-0 text-danger" aria-hidden />
        {t('fov.reqUndefined')}
      </p>
      <p className="tabular mt-2 text-sm text-ink-muted">
        {setting === 'microscope'
          ? t('fov.undefinedMicroscope', { objective: field.objective, diameter: fmt(field.diameter, 3, lang), area: fmt(tenArea, 2, lang) })
          : t('fov.undefinedTele', { diameter: fmt(field.diameter, 3, lang), area: fmt(tenArea, 2, lang) })}
      </p>
    </ResultBox>
  )
}
