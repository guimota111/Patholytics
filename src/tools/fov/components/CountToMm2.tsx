import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { MoreSection, ResultBox } from '@/components/ui/didactic'
import { REFERENCE_FIELDS, type FieldRef } from '../flow'
import { areaOfDiameter, countInFields, densityPerMm2, fmt } from '../optics'
import { useCopy } from './useCopy'

interface CountToMm2Props {
  field: FieldRef
}

const UNIT_AREAS = [2, 5, 10]

export const bigInputClass =
  'tabular h-12 w-24 rounded-lg border-2 border-line bg-surface px-3 text-center text-lg font-semibold text-ink transition-colors hover:border-line-strong focus:border-accent'

/** No microscópio: "contei x em y campos" → por mm² (e por 2, 5, 10 mm²). */
export function CountToMm2({ field }: CountToMm2Props) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const [count, setCount] = useState('')
  const [fields, setFields] = useState('10')
  const [threshold, setThreshold] = useState('')
  const [thresholdUnit, setThresholdUnit] = useState(2)

  const c = Number(count)
  const n = Number(fields)
  const areaCounted = n > 0 ? n * field.area : NaN
  const perMm2 = count !== '' && n > 0 ? densityPerMm2(c, n, field.area) : NaN

  const tv = Number(threshold)
  const thresholdCount = threshold !== '' && n > 0 ? countInFields(tv, thresholdUnit, n, field.area) : NaN

  const summary = Number.isFinite(perMm2)
    ? t('fov.summary', {
        count: fmt(c, 0, lang),
        fields: fmt(n, 0, lang),
        objective: field.objective,
        diameter: fmt(field.diameter, 3, lang),
        fieldArea: fmt(field.area, 3, lang),
        area: fmt(areaCounted, 2, lang),
        perMm2: fmt(perMm2, 2, lang),
        per2: fmt(perMm2 * 2, 2, lang),
      })
    : ''
  const { copied, copy } = useCopy(summary)

  return (
    <div className="space-y-5">
      {/* "Contei [x] mitoses em [y] campos na objetiva 40×." */}
      <p className="flex flex-wrap items-center gap-x-2.5 gap-y-3 text-lg leading-relaxed text-ink">
        {t('fov.sentencePre')}
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={count}
          onChange={(e) => setCount(e.target.value)}
          aria-label={t('fov.count')}
          placeholder="?"
          className={bigInputClass}
          autoFocus
        />
        {t('fov.sentenceMid')}
        <input
          type="number"
          inputMode="numeric"
          min={1}
          value={fields}
          onChange={(e) => setFields(e.target.value)}
          aria-label={t('fov.fieldsCounted')}
          className={bigInputClass}
        />
        {t('fov.sentenceAtObjective', { objective: field.objective })}
      </p>

      {Number.isFinite(perMm2) ? (
        <ResultBox>
          <p className="text-sm text-ink-muted">{t('fov.resultIs')}</p>
          <p className="tabular mt-1 text-3xl font-bold text-accent-ink">
            {fmt(perMm2, 2, lang)} <span className="text-xl font-semibold">{t('fov.perMm2Label')}</span>
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {UNIT_AREAS.map((u) => (
              <span key={u} className="tabular rounded-full border border-accent/35 bg-elevated px-3 py-1 text-sm text-ink">
                {fmt(perMm2 * u, 2, lang)} {t('fov.resultPer', { unit: u })}
              </span>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button type="button" size="sm" variant="secondary" onClick={() => void copy()}>
              {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
              {copied ? t('fov.copied') : t('fov.copy')}
            </Button>
            <span className="tabular text-xs text-ink-faint">{t('fov.areaCounted', { area: fmt(areaCounted, 2, lang) })}</span>
          </div>
        </ResultBox>
      ) : (
        <p className="text-sm text-ink-faint">{t('fov.convEmpty')}</p>
      )}

      <MoreSection label={t('fov.refToggle')}>
        <p className="text-xs leading-relaxed text-ink-faint">{t('fov.refHint')}</p>
        {Number.isFinite(perMm2) ? (
          <div className="flex flex-wrap gap-2">
            {REFERENCE_FIELDS.map((r) => (
              <span key={r.id} className="tabular rounded-full border border-accent/35 bg-elevated px-3 py-1 text-sm text-ink">
                {t('fov.revRefChip', { value: fmt(perMm2 * 10 * areaOfDiameter(r.diameter), 1, lang), diameter: fmt(r.diameter, 3, lang) })}
                <span className="ml-1 text-xs text-ink-faint">{r.label}</span>
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-ink-faint">{t('fov.convEmpty')}</p>
        )}
      </MoreSection>

      <MoreSection label={t('fov.reverseToggle')}>
        <p className="text-xs leading-relaxed text-ink-faint">{t('fov.reverseHint')}</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            type="number"
            inputMode="decimal"
            step="0.1"
            min={0}
            className="tabular"
            label={t('fov.valuePer')}
            value={threshold}
            onChange={(e) => setThreshold(e.target.value)}
          />
          <div className="space-y-1.5">
            <label htmlFor="fov-rev-unit" className="block text-sm font-medium text-ink">
              {t('fov.unitArea')}
            </label>
            <select
              id="fov-rev-unit"
              value={thresholdUnit}
              onChange={(e) => setThresholdUnit(Number(e.target.value))}
              className="h-10 w-full rounded-md border border-line bg-elevated px-3 text-sm text-ink transition-colors hover:border-line-strong"
            >
              {[1, 2, 5, 10].map((u) => (
                <option key={u} value={u}>
                  {u} mm²
                </option>
              ))}
            </select>
          </div>
        </div>
        {Number.isFinite(thresholdCount) && (
          <p className="tabular rounded-md bg-accent-soft px-3 py-2 text-sm font-medium text-accent-ink">
            {t('fov.reverseResult', {
              value: fmt(tv, 2, lang),
              unit: thresholdUnit,
              count: fmt(thresholdCount, 1, lang),
              fields: fmt(n, 0, lang),
              objective: field.objective,
            })}
          </p>
        )}
      </MoreSection>
    </div>
  )
}
