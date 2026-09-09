import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { selectClass } from '@/components/ui/fields'
import breastInvasive from '@/tools/stager/calculators/breast_invasive'
import colorectal from '@/tools/stager/calculators/colorectal'
import prostate from '@/tools/stager/calculators/prostate'
import { FieldControl } from '@/tools/stager/components/FieldControl'
import { useCalculator } from '@/tools/stager/useCalculator'
import { DemoFrame, DemoLabel, DemoReport } from '../SnapSection'

// Três sítios frequentes bastam para a demonstração; o registro inteiro (mais
// de cinquenta) fica na ferramenta, sem pesar a página inicial.
const DEMO_CALCULATORS = [breastInvasive, colorectal, prostate]

export default function StagerDemo() {
  const { t } = useTranslation()
  const [index, setIndex] = useState(0)
  const calculator = DEMO_CALCULATORS[index]
  const { values, setValue, visibleFields, result } = useCalculator(calculator)

  const badges = useMemo(() => (result.tnm ?? []).filter((badge) => badge.v), [result.tnm])

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <DemoFrame className="flex flex-col">
        <DemoLabel>{t('landing.demo.stager.pickLabel')}</DemoLabel>
        <select
          value={index}
          onChange={(event) => setIndex(Number(event.target.value))}
          className={selectClass}
          aria-label={t('landing.demo.stager.pickLabel')}
        >
          {DEMO_CALCULATORS.map((item, i) => (
            <option key={item.id} value={i}>
              {item.name}
            </option>
          ))}
        </select>

        <div className="mt-4 max-h-[19rem] space-y-5 overflow-auto rounded-md border border-line bg-surface px-4 py-4">
          {visibleFields.map((field) => (
            <FieldControl
              key={field.id}
              field={field}
              value={values[field.id] ?? null}
              onChange={(value) => setValue(field.id, value)}
            />
          ))}
        </div>
      </DemoFrame>

      <DemoFrame className="flex flex-col">
        <DemoLabel>{t('stager.result')}</DemoLabel>
        {badges.length > 0 ? (
          <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-md border border-line bg-line">
            {badges.map((badge) => (
              <div key={badge.k} className="bg-surface px-3 py-2.5">
                <dt className="text-xs tracking-wider text-ink-faint uppercase">{badge.k}</dt>
                <dd className="tabular mt-1 text-sm font-medium text-accent-ink">{badge.v}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="rounded-md border border-line bg-surface px-3.5 py-3 text-sm text-ink-faint">
            {t('stager.reportPlaceholder')}
          </p>
        )}

        {result.warnings && result.warnings.length > 0 && (
          <ul className="mt-3 space-y-1 text-xs leading-relaxed text-ink-muted">
            {result.warnings.map((warning) => (
              <li key={warning}>{warning}</li>
            ))}
          </ul>
        )}

        <div className="mt-4">
          <DemoLabel>{t('stager.reportLabel')}</DemoLabel>
          <DemoReport
            text={result.report ?? ''}
            empty={t('stager.reportPlaceholder')}
            className="max-h-[14rem]"
          />
        </div>

        <p className="mt-3 text-xs leading-relaxed text-ink-faint">
          {calculator.system}
          {calculator.version ? ` · ${calculator.version}` : ''}
        </p>
      </DemoFrame>
    </div>
  )
}
