import { useTranslation } from 'react-i18next'
import { BigChip, ResultBox } from '@/components/ui/didactic'
import type { FieldRef } from '../flow'
import { OBJECTIVES, fieldsToCover, fmt } from '../optics'
import { FieldIllustration } from './FieldIllustration'

interface ObjectivePickerProps {
  objective: number
  onChange: (objective: number) => void
  /** O campo nessa objetiva; `null` enquanto o microscópio não está válido. */
  field: FieldRef | null
}

/** A objetiva em uso, em chips, e logo abaixo o tamanho do campo nela. */
export function ObjectivePicker({ objective, onChange, field }: ObjectivePickerProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-muted">{t('fov.objectiveAsk')}</p>
      <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label={t('fov.objectiveUsed')}>
        {OBJECTIVES.map((o) => (
          <BigChip key={o} active={objective === o} onClick={() => onChange(o)}>
            <span className="tabular">{o}×</span>
            {o === 40 && <span className="ml-1.5 text-xs font-normal text-ink-faint">{t('fov.hpfTag')}</span>}
          </BigChip>
        ))}
      </div>

      {!field ? (
        <p className="text-sm text-danger">{t('fov.invalid')}</p>
      ) : (
        <ResultBox>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-ink-muted">{t('fov.fieldAtTitle', { objective })}</p>
              <p className="tabular mt-1 text-2xl font-semibold text-accent-ink">
                Ø {fmt(field.diameter, 2, lang)} mm · {fmt(field.area, 3, lang)} mm²
              </p>
              <p className="mt-1.5 text-sm text-ink">
                {t('fov.fieldAtFields', { n: fieldsToCover(1, field.area).rounded, two: fieldsToCover(2, field.area).rounded })}
              </p>
            </div>
            <FieldIllustration diameter={field.diameter} label={t('fov.fieldLabel', { objective })} />
          </div>
        </ResultBox>
      )}
    </div>
  )
}
