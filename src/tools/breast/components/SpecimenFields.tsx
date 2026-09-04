import { useTranslation } from 'react-i18next'
import { BigChip } from '@/components/ui/didactic'
import { NumField, SelectField, TextField, Toggle } from '@/components/ui/fields'
import { DEEP_PLANES, QUADRANTS, SIDES, SKIN_CHANGES, SPECIMEN_TYPES, type SpecimenState, type TextUnit } from '../types'

interface SpecimenFieldsProps {
  specimen: SpecimenState
  onChange: (patch: Partial<SpecimenState>) => void
  units?: TextUnit
  onUnits?: (u: TextUnit) => void
  /** Laudagem: só o que a geometria precisa (sem peso, orientação, axila, notas). */
  compact?: boolean
}

/** Passo 1 da macroscopia: que peça é, de que lado, quanto mede e pesa, pele e plano profundo. */
export function SpecimenFields({ specimen: sp, onChange, units, onUnits, compact = false }: SpecimenFieldsProps) {
  const { t } = useTranslation()
  const setDims = (axis: 'ml' | 'si' | 'ap', v: number | null) => onChange({ dims: { ...sp.dims, [axis]: v } })
  const setSkin = (patch: Partial<SpecimenState['skin']>) => onChange({ skin: { ...sp.skin, ...patch } })
  const setAxilla = (patch: Partial<SpecimenState['axilla']>) => onChange({ axilla: { ...sp.axilla, ...patch } })

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap gap-6">
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-ink">{t('breast.specimen.type')}</p>
          <div className="flex flex-wrap gap-2">
            {SPECIMEN_TYPES.map((v) => (
              <BigChip key={v} active={sp.type === v} onClick={() => onChange({ type: v })}>
                {t(`breast.specimenType.${v}`)}
              </BigChip>
            ))}
          </div>
        </div>
        <div className="space-y-1.5">
          <p className="text-sm font-medium text-ink">{t('breast.specimen.side')}</p>
          <div className="flex flex-wrap gap-2">
            {SIDES.map((v) => (
              <BigChip key={v} active={sp.side === v} onClick={() => onChange({ side: v })}>
                {t(`breast.side.${v}`)}
              </BigChip>
            ))}
          </div>
        </div>
        {units && onUnits && (
          <div className="space-y-1.5">
            <p className="text-sm font-medium text-ink">{t('breast.specimen.units')}</p>
            <div className="flex flex-wrap gap-2">
              {(['cm', 'mm'] as TextUnit[]).map((u) => (
                <BigChip key={u} active={units === u} onClick={() => onUnits(u)}>
                  {u}
                </BigChip>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <NumField label={t('breast.specimen.ml')} value={sp.dims.ml} min={1} decimals unit="mm" onChange={(v) => setDims('ml', v)} />
        <NumField label={t('breast.specimen.si')} value={sp.dims.si} min={1} decimals unit="mm" onChange={(v) => setDims('si', v)} />
        <NumField label={t('breast.specimen.ap')} value={sp.dims.ap} min={1} decimals unit="mm" onChange={(v) => setDims('ap', v)} />
        {!compact && <NumField label={t('breast.specimen.weight')} value={sp.weightGrams} min={0} decimals unit="g" onChange={(v) => onChange({ weightGrams: v })} />}
      </div>
      <p className="text-xs text-ink-faint">{t('breast.specimen.dimsHint')}</p>

      <div className="rounded-md border border-line bg-surface px-4 py-3">
        <Toggle checked={sp.skin.present} onChange={(v) => setSkin({ present: v, nipple: v ? sp.skin.nipple : false })} label={t('breast.specimen.skinPresent')} />
        {sp.skin.present && (
          <div className="mt-3 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <NumField label={t('breast.specimen.skinLength')} value={sp.skin.length} min={0} decimals unit="mm" onChange={(v) => setSkin({ length: v })} />
            <NumField label={t('breast.specimen.skinWidth')} value={sp.skin.width} min={0} decimals unit="mm" onChange={(v) => setSkin({ width: v })} />
            <div className="space-y-1.5">
              <p className="text-sm font-medium text-ink">{t('breast.specimen.nipple')}</p>
              <div className="flex h-9 items-center">
                <Toggle checked={sp.skin.nipple} onChange={(v) => setSkin({ nipple: v })} label={t('breast.specimen.nipplePresent')} />
              </div>
            </div>
            {sp.skin.nipple && (
              <NumField label={t('breast.specimen.nippleDiameter')} value={sp.skin.nippleDiameter} min={0} decimals unit="mm" onChange={(v) => setSkin({ nippleDiameter: v })} />
            )}
            {!compact && (
              <SelectField
                label={t('breast.specimen.skinChange')}
                value={sp.skin.change}
                onChange={(v) => setSkin({ change: v as SpecimenState['skin']['change'] })}
                options={SKIN_CHANGES.map((v) => ({ value: v, label: t(`breast.skinChange.${v}`) }))}
              />
            )}
          </div>
        )}
      </div>

      {!compact && (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          <SelectField
            label={t('breast.specimen.deep')}
            value={sp.deep}
            onChange={(v) => onChange({ deep: v as SpecimenState['deep'] })}
            options={DEEP_PLANES.map((v) => ({ value: v, label: t(`breast.deep.${v}`) }))}
          />
          {sp.type === 'segmentectomy' && (
            <SelectField
              label={t('breast.specimen.quadrant')}
              value={sp.quadrant}
              onChange={(v) => onChange({ quadrant: v as SpecimenState['quadrant'] })}
              options={QUADRANTS.map((v) => ({ value: v, label: t(`breast.quadrant.${v}`) }))}
              hint={t('breast.specimen.quadrantHint')}
            />
          )}
          <TextField
            label={t('breast.specimen.orientation')}
            value={sp.orientation}
            onChange={(v) => onChange({ orientation: v })}
            placeholder={t('breast.specimen.orientationPlaceholder')}
            hint={t('breast.specimen.orientationHint')}
          />
        </div>
      )}

      {!compact && (
        <div className="rounded-md border border-line bg-surface px-4 py-3">
          <Toggle checked={sp.axilla.present} onChange={(v) => setAxilla({ present: v })} label={t('breast.specimen.axillaPresent')} />
          {sp.axilla.present && (
            <div className="mt-3 grid gap-4 sm:grid-cols-2">
              <NumField label={t('breast.specimen.axillaNodes')} value={sp.axilla.nodes} min={0} onChange={(v) => setAxilla({ nodes: v })} />
              <NumField label={t('breast.specimen.axillaLargest')} value={sp.axilla.largestMm} min={0} decimals unit="mm" onChange={(v) => setAxilla({ largestMm: v })} />
            </div>
          )}
        </div>
      )}

      {!compact && (
        <div className="space-y-1.5">
          <label htmlFor="breast-notes" className="block text-sm font-medium text-ink">
            {t('breast.specimen.notes')}
          </label>
          <textarea
            id="breast-notes"
            value={sp.notes}
            onChange={(e) => onChange({ notes: e.target.value })}
            rows={2}
            placeholder={t('breast.specimen.notesPlaceholder')}
            className="w-full resize-y rounded-md border border-line bg-surface px-3 py-2 text-sm text-ink placeholder:text-ink-faint hover:border-line-strong"
          />
        </div>
      )}
    </div>
  )
}
