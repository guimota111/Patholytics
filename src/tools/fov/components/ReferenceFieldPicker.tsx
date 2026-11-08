import { useTranslation } from 'react-i18next'
import { Input } from '@/components/ui/Input'
import { BigChip, ResultBox } from '@/components/ui/didactic'
import { HPF_OBJECTIVE, REFERENCE_FIELDS, type FieldRef, type RefId } from '../flow'
import { fieldsToCover, fmt, type MicroscopeConfig } from '../optics'
import { FieldIllustration } from './FieldIllustration'
import { MicroscopeSetup } from './MicroscopeSetup'

interface ReferenceFieldPickerProps {
  refId: RefId
  refCustom: number
  onChange: (patch: { refId?: RefId; refCustom?: number }) => void
  config: MicroscopeConfig
  onConfig: (patch: Partial<MicroscopeConfig>) => void
  onReset: () => void
  field: FieldRef | null
}

/**
 * Na tele não há ocular: o "campo de grande aumento" que a máscara pede é
 * uma convenção. Aqui o patologista diz qual — o microscópio da casa ou um
 * dos diâmetros que os protocolos assumem.
 */
export function ReferenceFieldPicker({ refId, refCustom, onChange, config, onConfig, onReset, field }: ReferenceFieldPickerProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  return (
    <div className="space-y-4">
      <p className="text-sm leading-relaxed text-ink-muted">{t('fov.refAsk')}</p>
      <div className="flex flex-wrap items-center gap-2" role="radiogroup" aria-label={t('fov.refDiameter')}>
        <BigChip active={refId === 'mine'} onClick={() => onChange({ refId: 'mine' })}>
          {t('fov.refMine')}
        </BigChip>
        {REFERENCE_FIELDS.map((r) => (
          <BigChip key={r.id} active={refId === r.id} onClick={() => onChange({ refId: r.id })}>
            <span className="tabular">Ø {fmt(r.diameter, 3, lang)} mm</span>
            <span className="ml-1.5 text-xs font-normal text-ink-faint">{r.label}</span>
          </BigChip>
        ))}
        <BigChip active={refId === 'custom'} onClick={() => onChange({ refId: 'custom' })}>
          {t('fov.otherChip')}
        </BigChip>
      </div>

      {refId === 'mine' && (
        <div className="rounded-md border border-line bg-surface px-4 py-4">
          <MicroscopeSetup config={config} onChange={onConfig} onReset={onReset} />
        </div>
      )}
      {refId === 'custom' && (
        <Input
          type="number"
          inputMode="decimal"
          step="0.001"
          min={0.01}
          className="tabular sm:max-w-40"
          label={t('fov.refCustomDiameter')}
          hint={t('fov.refCustomHint')}
          value={Number.isFinite(refCustom) ? String(refCustom) : ''}
          onChange={(e) => onChange({ refCustom: e.target.value === '' ? NaN : Number(e.target.value) })}
        />
      )}

      {!field ? (
        <p className="text-sm text-danger">{t('fov.invalid')}</p>
      ) : (
        <ResultBox>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-ink-muted">{t('fov.refResultTitle')}</p>
              <p className="tabular mt-1 text-2xl font-semibold text-accent-ink">
                Ø {fmt(field.diameter, 3, lang)} mm · {fmt(field.area, 3, lang)} mm²
              </p>
              <p className="mt-1.5 text-sm text-ink">
                {t('fov.refResultFields', { ten: fmt(field.area * 10, 2, lang), perMm2: fieldsToCover(1, field.area).rounded })}
              </p>
            </div>
            <FieldIllustration diameter={field.diameter} label={t('fov.fieldLabel', { objective: HPF_OBJECTIVE })} />
          </div>
        </ResultBox>
      )}
    </div>
  )
}
