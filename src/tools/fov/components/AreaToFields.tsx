import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ResultBox } from '@/components/ui/didactic'
import type { FieldRef } from '../flow'
import { countInFields, fmt } from '../optics'
import { bigInputClass } from './CountToMm2'
import { useCopy } from './useCopy'

interface AreaToFieldsProps {
  field: FieldRef
}

/** Na tele: "contei x mitoses em y mm²; a máscara pede em N campos" → x' em N campos do campo de referência. */
export function AreaToFields({ field }: AreaToFieldsProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const [count, setCount] = useState('')
  const [area, setArea] = useState('')
  const [fields, setFields] = useState('10')

  const c = Number(count)
  const a = Number(area)
  const n = Number(fields)
  const perMm2 = count !== '' && area !== '' && a > 0 ? c / a : NaN
  const inFields = Number.isFinite(perMm2) && n > 0 ? countInFields(perMm2, 1, n, field.area) : NaN
  const covered = n * field.area

  const summary = Number.isFinite(inFields)
    ? t('fov.revSummary', {
        count: fmt(c, 0, lang),
        area: fmt(a, 2, lang),
        perMm2: fmt(perMm2, 2, lang),
        result: fmt(inFields, 1, lang),
        fields: fmt(n, 0, lang),
        objective: field.objective,
        diameter: fmt(field.diameter, 3, lang),
        fieldArea: fmt(field.area, 3, lang),
        covered: fmt(covered, 2, lang),
      })
    : ''
  const { copied, copy } = useCopy(summary)

  return (
    <div className="space-y-5">
      {/* "Contei [x] mitoses em [y] mm². A máscara pede o número em [10] campos de grande aumento." */}
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
          inputMode="decimal"
          step="0.01"
          min={0.01}
          value={area}
          onChange={(e) => setArea(e.target.value)}
          aria-label={t('fov.areaMeasured')}
          placeholder="?"
          className={bigInputClass}
        />
        {t('fov.revSentenceArea')}
        <input
          type="number"
          inputMode="numeric"
          min={1}
          value={fields}
          onChange={(e) => setFields(e.target.value)}
          aria-label={t('fov.fieldsCounted')}
          className={bigInputClass}
        />
        {t('fov.revSentenceFields')}
      </p>

      {Number.isFinite(inFields) ? (
        <ResultBox>
          <p className="text-sm text-ink-muted">{t('fov.resultIs')}</p>
          <p className="tabular mt-1 text-3xl font-bold text-accent-ink">
            {fmt(inFields, 1, lang)} <span className="text-xl font-semibold">{t('fov.revResultLabel', { fields: fmt(n, 0, lang) })}</span>
          </p>
          <p className="tabular mt-1.5 text-xs text-ink-faint">
            {t('fov.revFieldInfo', {
              diameter: fmt(field.diameter, 3, lang),
              fieldArea: fmt(field.area, 3, lang),
              fields: fmt(n, 0, lang),
              covered: fmt(covered, 2, lang),
            })}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button type="button" size="sm" variant="secondary" onClick={() => void copy()}>
              {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
              {copied ? t('fov.copied') : t('fov.copy')}
            </Button>
            <span className="tabular text-xs text-ink-faint">{t('fov.revDensity', { perMm2: fmt(perMm2, 2, lang) })}</span>
          </div>
        </ResultBox>
      ) : (
        <p className="text-sm text-ink-faint">{t('fov.revEmpty')}</p>
      )}
    </div>
  )
}
