import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { ResultBox } from '@/components/ui/didactic'
import type { FieldRef } from '../flow'
import { fmt } from '../optics'
import { bigInputClass } from './CountToMm2'
import { useCopy } from './useCopy'

interface FieldsToAreaProps {
  field: FieldRef
}

/** Na tele: "a máscara pede N campos de grande aumento" → quantos mm² medir na lâmina digital. */
export function FieldsToArea({ field }: FieldsToAreaProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const [fields, setFields] = useState('10')
  const n = Number(fields)
  const area = n > 0 ? n * field.area : NaN

  const summary = Number.isFinite(area)
    ? t('fov.ftaSummary', {
        fields: fmt(n, 0, lang),
        diameter: fmt(field.diameter, 3, lang),
        fieldArea: fmt(field.area, 3, lang),
        area: fmt(area, 2, lang),
      })
    : ''
  const { copied, copy } = useCopy(summary)

  return (
    <div className="space-y-5">
      {/* "A máscara pede a contagem em [10] campos de grande aumento." */}
      <p className="flex flex-wrap items-center gap-x-2.5 gap-y-3 text-lg leading-relaxed text-ink">
        {t('fov.ftaPre')}
        <input
          type="number"
          inputMode="numeric"
          min={1}
          value={fields}
          onChange={(e) => setFields(e.target.value)}
          aria-label={t('fov.fieldsCounted')}
          className={bigInputClass}
          autoFocus
        />
        {t('fov.ftaPost')}
      </p>

      {Number.isFinite(area) ? (
        <ResultBox>
          <p className="text-sm text-ink-muted">{t('fov.ftaResultTitle')}</p>
          <p className="tabular mt-1 text-3xl font-bold text-accent-ink">
            {fmt(area, 2, lang)} <span className="text-xl font-semibold">mm²</span>
          </p>
          <p className="tabular mt-1.5 text-sm text-ink">
            {t('fov.ftaResultHint', { fields: fmt(n, 0, lang), diameter: fmt(field.diameter, 3, lang), fieldArea: fmt(field.area, 3, lang) })}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-faint">{t('fov.ftaSquare', { side: fmt(Math.sqrt(area), 2, lang) })}</p>
          <div className="mt-4">
            <Button type="button" size="sm" variant="secondary" onClick={() => void copy()}>
              {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
              {copied ? t('fov.copied') : t('fov.copy')}
            </Button>
          </div>
        </ResultBox>
      ) : (
        <p className="text-sm text-ink-faint">{t('fov.invalid')}</p>
      )}
    </div>
  )
}
