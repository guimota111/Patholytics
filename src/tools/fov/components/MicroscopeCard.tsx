import { useState } from 'react'
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
import { BigChip, MoreSection, ResultBox } from '@/components/ui/didactic'

interface MicroscopeCardProps {
  config: MicroscopeConfig
  onChange: (patch: Partial<MicroscopeConfig>) => void
  onReset: () => void
}

const num = (value: string) => (value === '' ? NaN : Number(value))

/** Um quadrado de 1 mm ao lado do círculo do campo, na mesma escala. */
function FieldIllustration({ diameter, label }: { diameter: number; label: string }) {
  const S = 88 // px por mm
  const r = Math.min((diameter * S) / 2, S)
  const cx = S * 1.5 + r + 2
  // Largura mínima para a legenda centrada sob o círculo não ser cortada.
  const width = cx + Math.max(r, 60) + 4
  return (
    <svg width={width} height={S + 26} viewBox={`0 0 ${width} ${S + 26}`} aria-hidden className="max-w-full shrink-0">
      <rect x={1} y={1} width={S} height={S} fill="none" stroke="var(--color-ink-faint)" strokeWidth={1.5} strokeDasharray="4 3" />
      <text x={1 + S / 2} y={S + 18} textAnchor="middle" fontSize="11" fill="var(--color-ink-muted)">
        1 mm²
      </text>
      <circle
        cx={cx}
        cy={1 + S / 2}
        r={r}
        fill="color-mix(in oklab, var(--color-accent) 25%, transparent)"
        stroke="var(--color-accent)"
        strokeWidth={2}
      />
      <text x={cx} y={S + 18} textAnchor="middle" fontSize="11" fill="var(--color-ink-muted)">
        {label}
      </text>
    </svg>
  )
}

/** Objetiva usual de contagem: tudo que aparece em destaque se refere a ela. */
const MAIN_OBJECTIVE = 40

export function MicroscopeCard({ config, onChange, onReset }: MicroscopeCardProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const valid = isConfigValid(config)

  const isCommon = (COMMON_FIELD_NUMBERS as readonly number[]).includes(config.fieldNumber)
  const [customOpen, setCustomOpen] = useState(config.mode === 'fieldNumber' && !isCommon)

  const d = valid ? fieldDiameter(config, MAIN_OBJECTIVE) : NaN
  const a = valid ? fieldArea(config, MAIN_OBJECTIVE) : NaN
  const per1 = valid ? fieldsToCover(1, a) : null

  return (
    <div className="space-y-5">
      {config.mode === 'fieldNumber' && (
        <>
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
      )}

      {!valid ? (
        <p className="text-sm text-danger">{t('fov.invalid')}</p>
      ) : (
        <ResultBox>
          <div className="flex flex-wrap items-center gap-x-6 gap-y-4">
            <div className="min-w-0 flex-1">
              <p className="text-sm text-ink-muted">{t('fov.field40Title')}</p>
              <p className="tabular mt-1 text-2xl font-semibold text-accent-ink">
                Ø {fmt(d, 2, lang)} mm · {fmt(a, 3, lang)} mm²
              </p>
              <p className="mt-1.5 text-sm text-ink">
                {t('fov.field40Fields', { n: per1!.rounded })}
              </p>
            </div>
            <FieldIllustration diameter={d} label={t('fov.fieldLabel')} />
          </div>
        </ResultBox>
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

      {valid && (
        <MoreSection label={t('fov.tableLabel')}>
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
                  const od = fieldDiameter(config, o)
                  const oa = fieldArea(config, o)
                  const p1 = fieldsToCover(1, oa)
                  const p2 = fieldsToCover(2, oa)
                  return (
                    <tr key={o} className={cn('border-b border-line/60', o === MAIN_OBJECTIVE && 'bg-accent-soft/40')}>
                      <td className="py-2 pr-3 text-ink">
                        {o}× <span className="text-ink-faint">({o * 10}×)</span>
                      </td>
                      <td className="py-2 pr-3 text-ink">{fmt(od, 3, lang)} mm</td>
                      <td className="py-2 pr-3 text-ink">{fmt(oa, 3, lang)} mm²</td>
                      <td className="py-2 pr-3 text-ink">
                        {p1.rounded} <span className="text-ink-faint">({fmt(p1.exact, 1, lang)})</span>
                      </td>
                      <td className="py-2 text-ink">
                        {p2.rounded} <span className="text-ink-faint">({fmt(p2.exact, 1, lang)})</span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
            <p className="mt-3 text-xs leading-relaxed text-ink-faint">{t('fov.formula')}</p>
          </div>
        </MoreSection>
      )}
    </div>
  )
}
