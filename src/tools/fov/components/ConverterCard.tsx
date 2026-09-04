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
import { BigChip, MoreSection, ResultBox } from '@/components/ui/didactic'

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

const UNIT_AREAS = [2, 5, 10]

/** Sentido da conversão: contagem em campos → mm², ou área em mm² (lâmina digital) → campos. */
type Direction = 'toMm2' | 'toFields'

const bigInputClass =
  'tabular h-12 w-24 rounded-lg border-2 border-line bg-surface px-3 text-center text-lg font-semibold text-ink transition-colors hover:border-line-strong focus:border-accent'

const bigSelectClass =
  'h-12 rounded-lg border-2 border-line bg-surface px-3 text-lg font-semibold text-ink transition-colors hover:border-line-strong'

function useCopy(text: string) {
  const [copied, setCopied] = useState(false)
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (timer.current) clearTimeout(timer.current)
  }, [])

  const copy = async () => {
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      return
    }
    setCopied(true)
    if (timer.current) clearTimeout(timer.current)
    timer.current = setTimeout(() => setCopied(false), 1600)
  }

  return { copied, copy }
}

export function ConverterCard({ config }: ConverterCardProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  const [direction, setDirection] = useState<Direction>('toMm2')
  const [objective, setObjective] = useState(40)
  const [count, setCount] = useState('')
  const [fields, setFields] = useState('10')
  const [areaInput, setAreaInput] = useState('')
  const [reverseValue, setReverseValue] = useState('')
  const [reverseUnit, setReverseUnit] = useState(2)
  const [refId, setRefId] = useState('0.55')
  const [refCustom, setRefCustom] = useState('0.55')

  const valid = isConfigValid(config)
  const d = valid ? fieldDiameter(config, objective) : NaN
  const a = valid ? fieldArea(config, objective) : NaN
  const n = Number(fields)
  const c = Number(count)

  // Campos → mm²
  const areaCounted = n > 0 ? n * a : NaN
  const perMm2 = count !== '' && n > 0 ? densityPerMm2(c, n, a) : NaN

  const rv = Number(reverseValue)
  const reverseCount = reverseValue !== '' && n > 0 ? countInFields(rv, reverseUnit, n, a) : NaN

  const refDiameter =
    refId === 'custom' ? Number(refCustom) : (REFERENCE_FIELDS.find((r) => r.id === refId)?.diameter ?? NaN)
  const refArea = areaOfDiameter(refDiameter)
  const per10Ref = Number.isFinite(perMm2) && refDiameter > 0 ? perMm2 * 10 * refArea : NaN

  // mm² → campos (telepatologia: a contagem vem por área, a máscara pede "em 10 campos")
  const areaMm2 = Number(areaInput)
  const digitalPerMm2 = count !== '' && areaInput !== '' && areaMm2 > 0 ? c / areaMm2 : NaN
  const inMyFields = Number.isFinite(digitalPerMm2) && n > 0 ? countInFields(digitalPerMm2, 1, n, a) : NaN

  const summaryToMm2 = Number.isFinite(perMm2)
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

  const summaryToFields = Number.isFinite(inMyFields)
    ? t('fov.revSummary', {
        count: fmt(c, 0, lang),
        area: fmt(areaMm2, 2, lang),
        perMm2: fmt(digitalPerMm2, 2, lang),
        result: fmt(inMyFields, 1, lang),
        fields: fmt(n, 0, lang),
        objective,
        diameter: fmt(d, 3, lang),
        fieldArea: fmt(a, 3, lang),
        covered: fmt(areaCounted, 2, lang),
      })
    : ''

  const { copied, copy } = useCopy(direction === 'toMm2' ? summaryToMm2 : summaryToFields)

  const objectiveSelect = (
    <select
      value={objective}
      onChange={(e) => setObjective(Number(e.target.value))}
      aria-label={t('fov.objectiveUsed')}
      className={bigSelectClass}
    >
      {OBJECTIVES.map((o) => (
        <option key={o} value={o}>
          {o}×
        </option>
      ))}
    </select>
  )

  const countInput = (
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
  )

  const fieldsInput = (
    <input
      type="number"
      inputMode="numeric"
      min={1}
      value={fields}
      onChange={(e) => setFields(e.target.value)}
      aria-label={t('fov.fieldsCounted')}
      className={bigInputClass}
    />
  )

  const copyButton = (
    <Button type="button" size="sm" variant="secondary" onClick={() => void copy()}>
      {copied ? <Check className="size-4" aria-hidden /> : <Copy className="size-4" aria-hidden />}
      {copied ? t('fov.copied') : t('fov.copy')}
    </Button>
  )

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2" role="group" aria-label={t('fov.dirLabel')}>
        <BigChip active={direction === 'toMm2'} onClick={() => setDirection('toMm2')}>
          {t('fov.dirToMm2')}
        </BigChip>
        <BigChip active={direction === 'toFields'} onClick={() => setDirection('toFields')}>
          {t('fov.dirToFields')}
        </BigChip>
      </div>

      {direction === 'toMm2' ? (
        <>
          {/* Frase para preencher: "Contei [x] mitoses em [y] campos, na objetiva [40×]". */}
          <p className="flex flex-wrap items-center gap-x-2.5 gap-y-3 text-lg leading-relaxed text-ink">
            {t('fov.sentencePre')}
            {countInput}
            {t('fov.sentenceMid')}
            {fieldsInput}
            {t('fov.sentenceFields')}
            {objectiveSelect}
          </p>

          {Number.isFinite(perMm2) ? (
            <ResultBox>
              <p className="text-sm text-ink-muted">{t('fov.resultIs')}</p>
              <p className="tabular mt-1 text-3xl font-bold text-accent-ink">
                {fmt(perMm2, 2, lang)} <span className="text-xl font-semibold">{t('fov.perMm2Label')}</span>
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {UNIT_AREAS.map((u) => (
                  <span key={u} className="tabular rounded-full border border-accent/35 bg-elevated px-3 py-1 text-sm text-ink">
                    {fmt(perMm2 * u, 2, lang)} {t('fov.resultPer', { unit: u })}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {copyButton}
                <span className="tabular text-xs text-ink-faint">{t('fov.areaCounted', { area: fmt(areaCounted, 2, lang) })}</span>
              </div>
            </ResultBox>
          ) : (
            <p className="text-sm text-ink-faint">{t('fov.convEmpty')}</p>
          )}

          <MoreSection label={t('fov.refToggle')}>
            <p className="text-xs leading-relaxed text-ink-faint">{t('fov.refHint')}</p>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-1.5">
                <label htmlFor="fov-ref" className="block text-sm font-medium text-ink">
                  {t('fov.refDiameter')}
                </label>
                <select
                  id="fov-ref"
                  value={refId}
                  onChange={(e) => setRefId(e.target.value)}
                  className="h-10 w-full rounded-md border border-line bg-elevated px-3 text-sm text-ink transition-colors hover:border-line-strong"
                >
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
            {Number.isFinite(per10Ref) ? (
              <p className="tabular rounded-md bg-accent-soft px-3 py-2 text-sm font-medium text-accent-ink">
                {t('fov.refResult', {
                  value: fmt(per10Ref, 1, lang),
                  diameter: fmt(refDiameter, 3, lang),
                  area: fmt(refArea * 10, 2, lang),
                })}
              </p>
            ) : (
              <p className="text-xs text-ink-faint">{t('fov.convEmpty')}</p>
            )}
          </MoreSection>

          <MoreSection label={t('fov.reverseToggle')}>
            <p className="text-xs leading-relaxed text-ink-faint">{t('fov.reverseHint')}</p>
            <div className="grid gap-4 sm:grid-cols-2">
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
                  className="h-10 w-full rounded-md border border-line bg-elevated px-3 text-sm text-ink transition-colors hover:border-line-strong"
                >
                  {[1, 2, 5, 10].map((u) => (
                    <option key={u} value={u}>
                      {u} mm²
                    </option>
                  ))}
                </select>
              </div>
            </div>
            {Number.isFinite(reverseCount) && (
              <p className="tabular rounded-md bg-accent-soft px-3 py-2 text-sm font-medium text-accent-ink">
                {t('fov.reverseResult', {
                  value: fmt(rv, 2, lang),
                  unit: reverseUnit,
                  count: fmt(reverseCount, 1, lang),
                  fields: fmt(n, 0, lang),
                  objective,
                })}
              </p>
            )}
          </MoreSection>
        </>
      ) : (
        <>
          <p className="text-xs leading-relaxed text-ink-faint">{t('fov.revIntro')}</p>

          {/* "Contei [x] mitoses em [y] mm². Quero laudar em [10] campos, na objetiva [40×]." */}
          <p className="flex flex-wrap items-center gap-x-2.5 gap-y-3 text-lg leading-relaxed text-ink">
            {t('fov.sentencePre')}
            {countInput}
            {t('fov.sentenceMid')}
            <input
              type="number"
              inputMode="decimal"
              step="0.01"
              min={0.01}
              value={areaInput}
              onChange={(e) => setAreaInput(e.target.value)}
              aria-label={t('fov.areaMeasured')}
              placeholder="?"
              className={bigInputClass}
            />
            {t('fov.revSentenceArea')}
            {fieldsInput}
            {t('fov.sentenceFields')}
            {objectiveSelect}
          </p>

          {Number.isFinite(inMyFields) ? (
            <ResultBox>
              <p className="text-sm text-ink-muted">{t('fov.resultIs')}</p>
              <p className="tabular mt-1 text-3xl font-bold text-accent-ink">
                {fmt(inMyFields, 1, lang)}{' '}
                <span className="text-xl font-semibold">
                  {t('fov.revResultLabel', { fields: fmt(n, 0, lang), objective })}
                </span>
              </p>
              <p className="tabular mt-1 text-xs text-ink-faint">
                {t('fov.revFieldInfo', {
                  diameter: fmt(d, 3, lang),
                  fieldArea: fmt(a, 3, lang),
                  fields: fmt(n, 0, lang),
                  covered: fmt(areaCounted, 2, lang),
                })}
              </p>
              <p className="mt-3 text-sm text-ink-muted">{t('fov.revRefTitle')}</p>
              <div className="mt-1.5 flex flex-wrap gap-2">
                {REFERENCE_FIELDS.map((r) => (
                  <span
                    key={r.id}
                    className="tabular rounded-full border border-accent/35 bg-elevated px-3 py-1 text-sm text-ink"
                  >
                    {t('fov.revRefChip', {
                      value: fmt(digitalPerMm2 * 10 * areaOfDiameter(r.diameter), 1, lang),
                      diameter: fmt(r.diameter, 3, lang),
                    })}
                  </span>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap items-center gap-3">
                {copyButton}
                <span className="tabular text-xs text-ink-faint">
                  {t('fov.revDensity', { perMm2: fmt(digitalPerMm2, 2, lang) })}
                </span>
              </div>
            </ResultBox>
          ) : (
            <p className="text-sm text-ink-faint">{t('fov.revEmpty')}</p>
          )}
        </>
      )}
    </div>
  )
}
