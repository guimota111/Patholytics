import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Check, Copy } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import {
  OBJECTIVES,
  areaOfDiameter,
  countInFields,
  densityPerMm2,
  fieldArea,
  fieldDiameter,
  fmt,
  isConfigValid,
  type MicroscopeConfig,
} from '../optics'

interface ConverterCardProps {
  config: MicroscopeConfig
}

/** Campos de referência que aparecem nos protocolos (diâmetro em mm). */
const REFERENCE_FIELDS: { id: string; diameter: number; label: string }[] = [
  { id: '0.55', diameter: 0.55, label: '0,55 mm · 0,24 mm² (CAP: NET, útero)' },
  { id: '0.663', diameter: 0.663, label: '0,663 mm · 0,345 mm² (ovário, Silverberg)' },
  { id: '0.47', diameter: 0.47, label: '0,47 mm · 0,173 mm² (FNCLCC)' },
  { id: '0.45', diameter: 0.45, label: '0,45 mm · 0,159 mm² (linfoma folicular)' },
  { id: '0.50', diameter: 0.5, label: '0,50 mm · 0,196 mm²' },
]

const UNIT_AREAS = [1, 2, 5, 10]

const selectClass =
  'h-10 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink transition-colors hover:border-line-strong'

export function ConverterCard({ config }: ConverterCardProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  const [objective, setObjective] = useState(40)
  const [count, setCount] = useState('')
  const [fields, setFields] = useState('10')
  const [reverseValue, setReverseValue] = useState('')
  const [reverseUnit, setReverseUnit] = useState(2)
  const [refId, setRefId] = useState('0.55')
  const [refCustom, setRefCustom] = useState('0.55')
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const valid = isConfigValid(config)
  const d = valid ? fieldDiameter(config, objective) : NaN
  const a = valid ? fieldArea(config, objective) : NaN
  const n = Number(fields)
  const c = Number(count)
  const areaCounted = n > 0 ? n * a : NaN
  const perMm2 = count !== '' && n > 0 ? densityPerMm2(c, n, a) : NaN

  const rv = Number(reverseValue)
  const reverseCount =
    reverseValue !== '' && n > 0 ? countInFields(rv, reverseUnit, n, a) : NaN

  const refDiameter =
    refId === 'custom' ? Number(refCustom) : (REFERENCE_FIELDS.find((r) => r.id === refId)?.diameter ?? NaN)
  const refArea = areaOfDiameter(refDiameter)
  const per10Ref = Number.isFinite(perMm2) && refDiameter > 0 ? perMm2 * 10 * refArea : NaN

  const summary = Number.isFinite(perMm2)
    ? t('fov.summary', {
        count: fmt(c, 0, lang),
        fields: fmt(n, 0, lang),
        objective,
        diameter: fmt(d, 3, lang),
        fieldArea: fmt(a, 3, lang),
        area: fmt(areaCounted, 2, lang),
        perMm2: fmt(perMm2, 2, lang),
        per2: fmt(perMm2 * 2, 2, lang),
      })
    : ''

  const handleCopy = async () => {
    if (!summary) return
    try {
      await navigator.clipboard.writeText(summary)
    } catch {
      return
    }
    setCopied(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1600)
  }

  return (
    <div className="rounded-lg border border-line bg-elevated shadow-card">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-sm font-semibold tracking-tight text-ink">{t('fov.convTitle')}</h2>
        <p className="mt-1 text-sm text-ink-muted">{t('fov.convHint')}</p>
      </div>

      <div className="space-y-6 px-5 py-5">
        <div className="grid gap-4 sm:grid-cols-3">
          <div className="space-y-1.5">
            <label htmlFor="fov-conv-obj" className="block text-sm font-medium text-ink">
              {t('fov.objectiveUsed')}
            </label>
            <select
              id="fov-conv-obj"
              value={objective}
              onChange={(e) => setObjective(Number(e.target.value))}
              className={selectClass}
            >
              {OBJECTIVES.map((o) => (
                <option key={o} value={o}>
                  {o}×
                </option>
              ))}
            </select>
            {valid && (
              <p className="tabular text-xs text-ink-faint">
                Ø {fmt(d, 3, lang)} mm · {fmt(a, 3, lang)} mm²
              </p>
            )}
          </div>
          <Input
            type="number"
            inputMode="numeric"
            min={0}
            className="tabular"
            label={t('fov.count')}
            value={count}
            onChange={(e) => setCount(e.target.value)}
          />
          <Input
            type="number"
            inputMode="numeric"
            min={1}
            className="tabular"
            label={t('fov.fieldsCounted')}
            value={fields}
            onChange={(e) => setFields(e.target.value)}
          />
        </div>

        {Number.isFinite(perMm2) ? (
          <div className="space-y-3">
            <p className="tabular text-xs text-ink-faint">
              {t('fov.areaCounted', { area: fmt(areaCounted, 3, lang) })}
            </p>
            <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-md border border-line bg-line sm:grid-cols-4">
              {UNIT_AREAS.map((u) => (
                <div key={u} className="bg-surface px-3 py-2.5">
                  <dt className="text-xs tracking-wider text-ink-faint uppercase">
                    {t('fov.resultPer', { unit: u })}
                  </dt>
                  <dd className="tabular mt-1 text-lg font-medium text-accent-ink">
                    {fmt(perMm2 * u, 2, lang)}
                  </dd>
                </div>
              ))}
            </dl>
            <div className="flex items-center gap-2">
              <Button type="button" size="sm" variant="secondary" onClick={() => void handleCopy()}>
                {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
                {copied ? t('fov.copied') : t('fov.copy')}
              </Button>
            </div>
          </div>
        ) : (
          <p className="text-sm text-ink-faint">{t('fov.convEmpty')}</p>
        )}

        <div className="border-t border-line pt-5">
          <h3 className="text-sm font-semibold tracking-tight text-ink">{t('fov.refTitle')}</h3>
          <p className="mt-1 text-xs text-ink-faint">{t('fov.refHint')}</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="fov-ref" className="block text-sm font-medium text-ink">
                {t('fov.refDiameter')}
              </label>
              <select id="fov-ref" value={refId} onChange={(e) => setRefId(e.target.value)} className={selectClass}>
                {REFERENCE_FIELDS.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.label}
                  </option>
                ))}
                <option value="custom">{t('fov.refCustom')}</option>
              </select>
            </div>
            {refId === 'custom' && (
              <Input
                type="number"
                inputMode="decimal"
                step="0.001"
                min={0.01}
                className="tabular"
                label={t('fov.refCustomDiameter')}
                value={refCustom}
                onChange={(e) => setRefCustom(e.target.value)}
              />
            )}
          </div>
          {Number.isFinite(per10Ref) && (
            <p className="tabular mt-3 text-sm text-ink">
              {t('fov.refResult', {
                value: fmt(per10Ref, 1, lang),
                diameter: fmt(refDiameter, 3, lang),
                area: fmt(refArea * 10, 2, lang),
              })}
            </p>
          )}
        </div>

        <div className="border-t border-line pt-5">
          <h3 className="text-sm font-semibold tracking-tight text-ink">{t('fov.reverseTitle')}</h3>
          <p className="mt-1 text-xs text-ink-faint">{t('fov.reverseHint')}</p>
          <div className="mt-3 grid gap-4 sm:grid-cols-2">
            <Input
              type="number"
              inputMode="decimal"
              step="0.1"
              min={0}
              className="tabular"
              label={t('fov.valuePer')}
              value={reverseValue}
              onChange={(e) => setReverseValue(e.target.value)}
            />
            <div className="space-y-1.5">
              <label htmlFor="fov-rev-unit" className="block text-sm font-medium text-ink">
                {t('fov.unitArea')}
              </label>
              <select
                id="fov-rev-unit"
                value={reverseUnit}
                onChange={(e) => setReverseUnit(Number(e.target.value))}
                className={selectClass}
              >
                {UNIT_AREAS.map((u) => (
                  <option key={u} value={u}>
                    {u} mm²
                  </option>
                ))}
              </select>
            </div>
          </div>
          {Number.isFinite(reverseCount) && (
            <p className="tabular mt-3 text-sm text-ink">
              {t('fov.reverseResult', {
                value: fmt(rv, 2, lang),
                unit: reverseUnit,
                count: fmt(reverseCount, 1, lang),
                fields: fmt(n, 0, lang),
                objective,
              })}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
