import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NumField, SelectField } from '@/components/ui/fields'
import { breastRowFor, breastScore } from '@/tools/fov/breastScore'
import {
  DEFAULT_CONFIG,
  OBJECTIVES,
  areaOfDiameter,
  densityPerMm2,
  fieldDiameter,
  fieldsToCover,
  fmt,
} from '@/tools/fov/optics'
import { DemoFrame, DemoLabel, DemoStats } from '../SnapSection'

export default function FieldsDemo() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const [fieldNumber, setFieldNumber] = useState<number | null>(DEFAULT_CONFIG.fieldNumber)
  const [objective, setObjective] = useState(40)
  const [count, setCount] = useState<number | null>(14)
  const [fields, setFields] = useState<number | null>(10)

  const config = { ...DEFAULT_CONFIG, fieldNumber: fieldNumber ?? 0 }
  const valid = (fieldNumber ?? 0) > 0
  const diameter = valid ? fieldDiameter(config, objective) : NaN
  const area = valid ? areaOfDiameter(diameter) : NaN
  const perMm2 = valid ? fieldsToCover(1, area) : null

  // A tabela mitótica de mama (CAP/NHSBSP) é lida pelo diâmetro do campo de 40×.
  const at40 = valid ? fieldDiameter(config, 40) : NaN
  const row = valid ? breastRowFor(at40) : null
  const density = valid && count !== null && fields ? densityPerMm2(count, fields, area) : null
  const score = row && count !== null && fields === 10 ? breastScore(row, count) : null

  const stats = [
    { label: t('fov.colDiameter'), value: valid ? `${fmt(diameter, 3, lang)} mm` : '—' },
    { label: t('fov.colArea'), value: valid ? `${fmt(area, 3, lang)} mm²` : '—' },
    { label: t('fov.colPerMm2'), value: perMm2 ? fmt(perMm2.exact, 1, lang) : '—' },
    { label: t('fov.perMm2Label'), value: density !== null ? fmt(density, 2, lang) : '—' },
  ]

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <DemoFrame>
        <DemoLabel>{t('landing.demo.fields.scopeLabel')}</DemoLabel>
        <div className="grid gap-4 sm:grid-cols-2">
          <NumField
            label={t('fov.fieldNumber')}
            hint={t('fov.fieldNumberHint')}
            value={fieldNumber}
            onChange={setFieldNumber}
            decimals
            min={1}
          />
          <SelectField
            label={t('fov.objectiveUsed')}
            value={String(objective)}
            onChange={(value) => setObjective(Number(value))}
            options={OBJECTIVES.map((o) => ({ value: String(o), label: `${o}×` }))}
          />
          <NumField label={t('fov.count')} value={count} onChange={setCount} min={0} />
          <NumField label={t('fov.fieldsCounted')} value={fields} onChange={setFields} min={1} />
        </div>

        <div className="mt-4">
          <DemoStats items={stats} />
        </div>
      </DemoFrame>

      <DemoFrame className="flex flex-col justify-center">
        <DemoLabel>{t('landing.demo.fields.breastLabel')}</DemoLabel>
        {row ? (
          <>
            <p className="text-sm leading-relaxed text-ink-muted">
              {t('fov.breastIntro', { diameter: fmt(row.diameter, 2, lang), area: fmt(row.area, 3, lang) })}
            </p>

            <ul className="mt-3 grid gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-3">
              {[
                { n: 1, label: t('fov.score1', { n: row.score1Max }) },
                { n: 2, label: t('fov.score2', { from: row.score1Max + 1, to: row.score2Max }) },
                { n: 3, label: t('fov.score3', { n: row.score2Max + 1 }) },
              ].map((item) => (
                <li
                  key={item.n}
                  className={
                    score === item.n
                      ? 'bg-accent-soft px-3 py-2.5 text-sm font-medium text-accent-ink'
                      : 'bg-surface px-3 py-2.5 text-sm text-ink-muted'
                  }
                >
                  {item.label}
                </li>
              ))}
            </ul>

            <p className="tabular mt-4 text-lg font-semibold text-ink">
              {count ?? 0} <span className="text-sm font-normal text-ink-muted">{t('fov.breastUnit')}</span>
            </p>
            <p className="mt-1 text-sm text-ink-muted">
              {score ? t('landing.demo.fields.scoreIs', { score }) : t('landing.demo.fields.scoreNeedsTen')}
            </p>

            {row.clamped && (
              <p className="mt-3 text-xs leading-relaxed text-danger">
                {t('fov.breastClamped', { diameter: fmt(at40, 2, lang) })}
              </p>
            )}
          </>
        ) : (
          <p className="text-sm text-ink-faint">{t('fov.invalid')}</p>
        )}
      </DemoFrame>
    </div>
  )
}
