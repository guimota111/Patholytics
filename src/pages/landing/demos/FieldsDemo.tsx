import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NumField, SelectField } from '@/components/ui/fields'
import {
  DEFAULT_CONFIG,
  OBJECTIVES,
  areaOfDiameter,
  fieldDiameter,
  fieldsToCover,
  fmt,
} from '@/tools/fov/optics'
import { REQUIREMENTS } from '@/tools/fov/requirements'
import { cn } from '@/lib/cn'
import { DemoFrame, DemoLabel, DemoStats } from '../SnapSection'

/* Dois tumores em que o número de campos muda mais entre microscópios: o GIST
   pede 5 mm² (os "50 HPF" antigos) e o melanoma, 1 mm². O resto da tabela
   fica na ferramenta. */
const DEMO_IDS = ['gist', 'melanoma']
const DEMO_REQUIREMENTS = DEMO_IDS.map((id) => REQUIREMENTS.find((r) => r.id === id)!)

export default function FieldsDemo() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const [fieldNumber, setFieldNumber] = useState<number | null>(DEFAULT_CONFIG.fieldNumber)
  const [objective, setObjective] = useState(40)
  const [requirementId, setRequirementId] = useState(DEMO_IDS[0])

  const config = { ...DEFAULT_CONFIG, fieldNumber: fieldNumber ?? 0 }
  const valid = (fieldNumber ?? 0) > 0
  const diameter = valid ? fieldDiameter(config, objective) : NaN
  const area = valid ? areaOfDiameter(diameter) : NaN
  const perMm2 = valid ? fieldsToCover(1, area) : null

  const requirement = DEMO_REQUIREMENTS.find((r) => r.id === requirementId)!
  const cover = valid ? fieldsToCover(requirement.areaMm2!, area) : null
  const covered = cover ? cover.rounded * area : NaN
  const divisor = cover ? covered / requirement.reportPerMm2! : NaN
  const needsDivision = cover ? Math.abs(divisor - 1) > 0.005 : false

  const stats = [
    { label: t('fov.colDiameter'), value: valid ? `${fmt(diameter, 3, lang)} mm` : '—' },
    { label: t('fov.colArea'), value: valid ? `${fmt(area, 3, lang)} mm²` : '—' },
    { label: t('fov.colPerMm2'), value: perMm2 ? fmt(perMm2.exact, 1, lang) : '—' },
    { label: t('landing.demo.fields.required'), value: `${fmt(requirement.areaMm2!, 2, lang)} mm²` },
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
        </div>

        <div className="mt-4">
          <DemoLabel>{t('landing.demo.fields.tumorLabel')}</DemoLabel>
          <div className="flex flex-wrap gap-2">
            {DEMO_REQUIREMENTS.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setRequirementId(item.id)}
                aria-pressed={requirementId === item.id}
                className={cn(
                  'rounded-lg border-2 px-4 py-2.5 text-sm font-medium transition-colors',
                  requirementId === item.id
                    ? 'border-accent bg-accent-soft text-accent-ink'
                    : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink',
                )}
              >
                {t(`landing.demo.fields.tumor.${item.id}`)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4">
          <DemoStats items={stats} />
        </div>
      </DemoFrame>

      <DemoFrame className="flex flex-col justify-center">
        <DemoLabel>{t('landing.demo.fields.answerLabel')}</DemoLabel>
        {cover ? (
          <>
            <p className="tabular text-3xl font-bold text-accent-ink">
              {t('fov.countFieldsBig', { fields: cover.rounded, objective })}
            </p>
            {needsDivision ? (
              <p className="tabular mt-2 text-base font-semibold text-ink">
                {t('fov.divideBig', {
                  divisor: fmt(divisor, 1, lang),
                  unit: fmt(requirement.reportPerMm2!, 2, lang),
                })}
              </p>
            ) : (
              <p className="mt-2 text-sm text-ink">
                {t('fov.noDivide', { unit: fmt(requirement.reportPerMm2!, 2, lang) })}
              </p>
            )}

            <p className="tabular mt-3 text-xs leading-relaxed text-ink-muted">
              {t('fov.coverInfo', {
                covered: fmt(covered, 2, lang),
                area: fmt(requirement.areaMm2!, 2, lang),
                exact: fmt(cover.exact, 1, lang),
              })}
            </p>

            <p className="mt-4 border-t border-line pt-4 text-sm leading-relaxed text-ink-muted">
              {requirement.thresholds}
            </p>
            {requirement.legacy && (
              <p className="mt-2 text-xs leading-relaxed text-ink-faint">{requirement.legacy.label}</p>
            )}
            <p className="mt-3 text-xs text-ink-faint">
              {t('fov.reqSource')}: {requirement.source}
            </p>
          </>
        ) : (
          <p className="text-sm text-ink-faint">{t('fov.invalid')}</p>
        )}
      </DemoFrame>
    </div>
  )
}
