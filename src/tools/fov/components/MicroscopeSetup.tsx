import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { BigChip, MoreSection } from '@/components/ui/didactic'
import { cn } from '@/lib/cn'
import { COMMON_FIELD_NUMBERS, OBJECTIVES, fmt, type MicroscopeConfig } from '../optics'

interface MicroscopeSetupProps {
  config: MicroscopeConfig
  onChange: (patch: Partial<MicroscopeConfig>) => void
  onReset: () => void
}

const num = (value: string) => (value === '' ? NaN : Number(value))

/**
 * Qual é o microscópio: o número de campo da ocular, em chips, e atrás de um
 * botão o resto (lente intermediária, diâmetro medido com micrômetro).
 */
export function MicroscopeSetup({ config, onChange, onReset }: MicroscopeSetupProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const isCommon = (COMMON_FIELD_NUMBERS as readonly number[]).includes(config.fieldNumber)
  const [customOpen, setCustomOpen] = useState(config.mode === 'fieldNumber' && !isCommon)

  return (
    <div className="space-y-4">
      {config.mode === 'fieldNumber' ? (
        <>
          <p className="text-sm text-ink-muted">{t('fov.fieldNumberAsk')}</p>
          <div className="flex flex-wrap items-center gap-2">
            {COMMON_FIELD_NUMBERS.map((fn) => (
              <BigChip
                key={fn}
                active={!customOpen && config.fieldNumber === fn}
                onClick={() => {
                  setCustomOpen(false)
                  onChange({ fieldNumber: fn })
                }}
              >
                <span className="tabular">{fmt(fn, 1, lang)}</span>
              </BigChip>
            ))}
            <BigChip active={customOpen} onClick={() => setCustomOpen(true)}>
              {t('fov.otherChip')}
            </BigChip>
          </div>
          {customOpen && (
            <Input
              type="number"
              inputMode="decimal"
              step="0.5"
              min={1}
              className="tabular sm:max-w-40"
              label={t('fov.fieldNumber')}
              hint={t('fov.fieldNumberHint')}
              value={Number.isFinite(config.fieldNumber) ? String(config.fieldNumber) : ''}
              onChange={(e) => onChange({ fieldNumber: num(e.target.value) })}
            />
          )}
        </>
      ) : (
        <p className="text-sm text-ink-muted">
          {t('fov.measuredSummary', {
            diameter: fmt(config.measuredDiameterMm, 3, lang),
            objective: config.measuredObjective,
          })}
        </p>
      )}

      <MoreSection label={t('fov.advancedLabel')}>
        <div className="flex flex-wrap gap-1.5">
          {(['fieldNumber', 'measured'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => onChange({ mode })}
              className={cn(
                'rounded-md border px-3 py-1.5 text-sm transition-colors',
                config.mode === mode
                  ? 'border-accent/50 bg-accent-soft text-accent-ink'
                  : 'border-line bg-elevated text-ink-muted hover:border-line-strong hover:text-ink',
              )}
            >
              {mode === 'fieldNumber' ? t('fov.modeFieldNumber') : t('fov.modeMeasured')}
            </button>
          ))}
        </div>

        {config.mode === 'measured' && (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="fov-meas-obj" className="block text-sm font-medium text-ink">
                {t('fov.measuredObjective')}
              </label>
              <select
                id="fov-meas-obj"
                value={config.measuredObjective}
                onChange={(e) => onChange({ measuredObjective: Number(e.target.value) })}
                className="h-10 w-full rounded-md border border-line bg-elevated px-3 text-sm text-ink transition-colors hover:border-line-strong"
              >
                {OBJECTIVES.map((o) => (
                  <option key={o} value={o}>
                    {o}×
                  </option>
                ))}
              </select>
            </div>
            <Input
              type="number"
              inputMode="decimal"
              step="0.01"
              min={0.01}
              className="tabular"
              label={t('fov.measuredDiameter')}
              hint={t('fov.measuredHint')}
              value={Number.isFinite(config.measuredDiameterMm) ? String(config.measuredDiameterMm) : ''}
              onChange={(e) => onChange({ measuredDiameterMm: num(e.target.value) })}
            />
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="fov-tube" className="block text-sm font-medium text-ink">
            {t('fov.tubeFactor')}
          </label>
          <select
            id="fov-tube"
            value={config.tubeFactor}
            onChange={(e) => onChange({ tubeFactor: Number(e.target.value) })}
            className="h-10 w-full rounded-md border border-line bg-elevated px-3 text-sm text-ink transition-colors hover:border-line-strong sm:max-w-40"
          >
            {[1, 1.25, 1.5, 1.6, 2].map((f) => (
              <option key={f} value={f}>
                {f}×
              </option>
            ))}
          </select>
          <p className="text-xs text-ink-faint">{t('fov.tubeFactorHint')}</p>
        </div>

        <Button type="button" size="sm" variant="ghost" onClick={onReset}>
          <RotateCcw className="size-4" aria-hidden />
          {t('fov.reset')}
        </Button>
      </MoreSection>
    </div>
  )
}
