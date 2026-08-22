import { useTranslation } from 'react-i18next'
import { RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { cn } from '@/lib/cn'
import {
  COMMON_FIELD_NUMBERS,
  OBJECTIVES,
  fieldArea,
  fieldDiameter,
  fieldsToCover,
  fmt,
  isConfigValid,
  type MicroscopeConfig,
} from '../optics'

interface MicroscopeCardProps {
  config: MicroscopeConfig
  onChange: (patch: Partial<MicroscopeConfig>) => void
  onReset: () => void
}

const num = (value: string) => (value === '' ? NaN : Number(value))

export function MicroscopeCard({ config, onChange, onReset }: MicroscopeCardProps) {
  const { t, i18n } = useTranslation()
  const valid = isConfigValid(config)

  return (
    <div className="rounded-lg border border-line bg-elevated shadow-card">
      <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
        <h2 className="text-sm font-semibold tracking-tight text-ink">{t('fov.setupTitle')}</h2>
        <Button type="button" size="sm" variant="ghost" onClick={onReset}>
          <RotateCcw className="size-4" aria-hidden />
          {t('fov.reset')}
        </Button>
      </div>

      <div className="space-y-5 px-5 py-5">
        <p className="text-sm text-ink-muted">{t('fov.setupHint')}</p>

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
                  : 'border-line bg-surface text-ink-muted hover:border-line-strong hover:text-ink',
              )}
            >
              {mode === 'fieldNumber' ? t('fov.modeFieldNumber') : t('fov.modeMeasured')}
            </button>
          ))}
        </div>

        {config.mode === 'fieldNumber' ? (
          <div className="space-y-3">
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
            <div className="flex flex-wrap gap-1.5">
              {COMMON_FIELD_NUMBERS.map((fn) => (
                <button
                  key={fn}
                  type="button"
                  onClick={() => onChange({ fieldNumber: fn })}
                  className={cn(
                    'tabular rounded-full border px-2.5 py-0.5 text-xs transition-colors',
                    config.fieldNumber === fn
                      ? 'border-accent/50 bg-accent-soft text-accent-ink'
                      : 'border-line bg-surface text-ink-muted hover:border-line-strong',
                  )}
                >
                  FN {fmt(fn, 1, i18n.language)}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="fov-meas-obj" className="block text-sm font-medium text-ink">
                {t('fov.measuredObjective')}
              </label>
              <select
                id="fov-meas-obj"
                value={config.measuredObjective}
                onChange={(e) => onChange({ measuredObjective: Number(e.target.value) })}
                className="h-10 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink transition-colors hover:border-line-strong"
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
            className="h-10 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink transition-colors hover:border-line-strong sm:max-w-40"
          >
            {[1, 1.25, 1.5, 1.6, 2].map((f) => (
              <option key={f} value={f}>
                {f}×
              </option>
            ))}
          </select>
          <p className="text-xs text-ink-faint">{t('fov.tubeFactorHint')}</p>
        </div>

        {!valid ? (
          <p className="text-sm text-danger">{t('fov.invalid')}</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-line text-left text-xs tracking-wider text-ink-faint uppercase">
                  <th className="py-2 pr-3 font-medium">{t('fov.colObjective')}</th>
                  <th className="py-2 pr-3 font-medium">{t('fov.colDiameter')}</th>
                  <th className="py-2 pr-3 font-medium">{t('fov.colArea')}</th>
                  <th className="py-2 pr-3 font-medium">{t('fov.colPerMm2')}</th>
                  <th className="py-2 font-medium">{t('fov.colPer2Mm2')}</th>
                </tr>
              </thead>
              <tbody className="tabular">
                {OBJECTIVES.map((o) => {
                  const d = fieldDiameter(config, o)
                  const a = fieldArea(config, o)
                  const per1 = fieldsToCover(1, a)
                  const per2 = fieldsToCover(2, a)
                  return (
                    <tr
                      key={o}
                      className={cn('border-b border-line/60', o === 40 && 'bg-accent-soft/40')}
                    >
                      <td className="py-2 pr-3 text-ink">
                        {o}× <span className="text-ink-faint">({o * 10}×)</span>
                      </td>
                      <td className="py-2 pr-3 text-ink">{fmt(d, 3, i18n.language)} mm</td>
                      <td className="py-2 pr-3 text-ink">{fmt(a, 3, i18n.language)} mm²</td>
                      <td className="py-2 pr-3 text-ink">
                        {per1.rounded} <span className="text-ink-faint">({fmt(per1.exact, 1, i18n.language)})</span>
                      </td>
                      <td className="py-2 text-ink">
                        {per2.rounded} <span className="text-ink-faint">({fmt(per2.exact, 1, i18n.language)})</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <p className="mt-3 text-xs leading-relaxed text-ink-faint">{t('fov.formula')}</p>
          </div>
        )}
      </div>
    </div>
  )
}
