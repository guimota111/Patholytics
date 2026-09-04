import { useTranslation } from 'react-i18next'
import { NumField, SelectField, Toggle } from '@/components/ui/fields'
import { HISTOLOGIC_TYPES, MARGIN_STATUSES, MARGINS, PRESENCES, type Margin, type MicroGlobals, type NodesState } from '../types'

/** Linfonodos regionais: as duas variáveis nodais do RCB e o que mais entra no laudo. */
export function NodesFields({ nodes, onChange }: { nodes: NodesState; onChange: (patch: Partial<NodesState>) => void }) {
  const { t } = useTranslation()
  const presence = PRESENCES.map((v) => ({ value: v, label: t(`breast.presence.${v}`) }))
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <NumField label={t('breast.nodes.examined')} value={nodes.examined} min={0} onChange={(v) => onChange({ examined: v })} />
        <NumField label={t('breast.nodes.positive')} value={nodes.positive} min={0} onChange={(v) => onChange({ positive: v })} hint={t('breast.nodes.positiveHint')} />
        <NumField
          label={t('breast.nodes.largest')}
          value={nodes.largestMm}
          min={0}
          decimals
          unit="mm"
          onChange={(v) => onChange({ largestMm: v })}
          hint={t('breast.nodes.largestHint')}
          disabled={(nodes.positive ?? 0) <= 0}
        />
        <SelectField label={t('breast.nodes.extranodal')} value={nodes.extranodal} onChange={(v) => onChange({ extranodal: v as NodesState['extranodal'] })} options={presence} />
        <SelectField label={t('breast.nodes.treatmentEffect')} value={nodes.treatmentEffect} onChange={(v) => onChange({ treatmentEffect: v as NodesState['treatmentEffect'] })} options={presence} />
      </div>
      <Toggle checked={nodes.itcOnly} onChange={(v) => onChange({ itcOnly: v })} label={t('breast.nodes.itcOnly')} />
    </div>
  )
}

/** Outros achados do caso (tipo, grau, maior foco invasivo, margens, invasões) e as situações que mudam o RCB. */
export function GlobalsFields({ globals, onChange }: { globals: MicroGlobals; onChange: (patch: Partial<MicroGlobals>) => void }) {
  const { t } = useTranslation()
  const presence = PRESENCES.map((v) => ({ value: v, label: t(`breast.presence.${v}`) }))
  const marginStatus = MARGIN_STATUSES.map((v) => ({ value: v, label: t(`breast.marginStatus.${v}`) }))
  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SelectField
          label={t('breast.globals.histType')}
          value={globals.histType}
          onChange={(v) => onChange({ histType: v as MicroGlobals['histType'] })}
          options={HISTOLOGIC_TYPES.map((v) => ({ value: v, label: v ? t(`breast.histType.${v}`) : '—' }))}
        />
        <SelectField
          label={t('breast.globals.grade')}
          value={globals.grade ? String(globals.grade) : ''}
          onChange={(v) => onChange({ grade: v ? (Number(v) as 1 | 2 | 3) : null })}
          options={[
            { value: '', label: '—' },
            { value: '1', label: '1' },
            { value: '2', label: '2' },
            { value: '3', label: '3' },
          ]}
        />
        <NumField
          label={t('breast.globals.largestInvasive')}
          value={globals.largestInvasiveMm}
          min={0}
          decimals
          unit="mm"
          onChange={(v) => onChange({ largestInvasiveMm: v })}
          hint={t('breast.globals.largestInvasiveHint')}
        />
        <SelectField label={t('breast.globals.treatmentEffect')} value={globals.treatmentEffect} onChange={(v) => onChange({ treatmentEffect: v as MicroGlobals['treatmentEffect'] })} options={presence} />
        <SelectField label={t('breast.globals.lvi')} value={globals.lvi} onChange={(v) => onChange({ lvi: v as MicroGlobals['lvi'] })} options={presence} />
        <SelectField label={t('breast.globals.marginsInvasive')} value={globals.marginsInvasive} onChange={(v) => onChange({ marginsInvasive: v as MicroGlobals['marginsInvasive'] })} options={marginStatus} />
        <SelectField label={t('breast.globals.marginsDcis')} value={globals.marginsDcis} onChange={(v) => onChange({ marginsDcis: v as MicroGlobals['marginsDcis'] })} options={marginStatus} />
        <SelectField
          label={t('breast.globals.closestMargin')}
          value={globals.closestMargin ?? ''}
          onChange={(v) => onChange({ closestMargin: (v || null) as Margin | null })}
          options={[{ value: '', label: '—' }, ...MARGINS.map((m) => ({ value: m, label: t(`breast.margin.${m}`) }))]}
        />
        <NumField label={t('breast.globals.closestMarginMm')} value={globals.closestMarginMm} min={0} decimals unit="mm" onChange={(v) => onChange({ closestMarginMm: v })} />
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2">
        <Toggle checked={globals.skinInvolved} onChange={(v) => onChange({ skinInvolved: v })} label={t('breast.globals.skinInvolved')} />
        <Toggle checked={globals.chestWallInvolved} onChange={(v) => onChange({ chestWallInvolved: v })} label={t('breast.globals.chestWallInvolved')} />
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-2 border-t border-line pt-4">
        <Toggle checked={globals.preTreatmentPositiveNode} onChange={(v) => onChange({ preTreatmentPositiveNode: v })} label={t('breast.globals.preTreatmentPositiveNode')} />
        <Toggle checked={globals.inoperable} onChange={(v) => onChange({ inoperable: v })} label={t('breast.globals.inoperable')} />
      </div>
    </div>
  )
}
