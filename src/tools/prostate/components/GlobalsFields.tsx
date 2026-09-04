import { useTranslation } from 'react-i18next'
import type { CaseGlobals } from '../types'
import { NumField, SelectField, Toggle } from './fields'

interface GlobalsFieldsProps {
  globals: CaseGlobals
  setGlobals: (patch: Partial<CaseGlobals>) => void
  /** Vesículas já descritas por cassete: o seletor global fica escondido. */
  svMapped: boolean
  lnMapped: boolean
}

/** Achados que não pertencem a um cassete e as opções de leitura dos percentuais. */
export function GlobalsFields({ globals, setGlobals, svMapped, lnMapped }: GlobalsFieldsProps) {
  const { t } = useTranslation()
  const presence = (['notAssessed', 'absent', 'present'] as const).map((v) => ({
    value: v,
    label: t(`prostate.presence.${v}`),
  }))
  const modeOptions = [
    { value: 'global', label: t('prostate.globals.modeGlobal') },
    { value: 'perCassette', label: t('prostate.globals.modePerCassette') },
  ]

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <NumField
          label={t('prostate.globals.weight')}
          value={globals.weightGrams}
          min={0}
          decimals
          onChange={(v) => setGlobals({ weightGrams: v })}
          hint={t('prostate.globals.weightHint')}
        />
        {!svMapped && (
          <SelectField
            label={t('prostate.globals.seminalVesicles')}
            value={globals.seminalVesicles}
            onChange={(v) => setGlobals({ seminalVesicles: v as CaseGlobals['seminalVesicles'] })}
            options={(['notIdentified', 'free', 'right', 'left', 'bilateral'] as const).map((v) => ({
              value: v,
              label: t(`prostate.sv.${v}`),
            }))}
          />
        )}
        <SelectField
          label={t('prostate.globals.bladderNeck')}
          value={globals.bladderNeck}
          onChange={(v) => setGlobals({ bladderNeck: v as CaseGlobals['bladderNeck'] })}
          options={(['notAssessed', 'free', 'involved'] as const).map((v) => ({
            value: v,
            label: t(`prostate.bn.${v}`),
          }))}
        />
        <SelectField
          label={t('prostate.globals.perineural')}
          value={globals.perineural}
          onChange={(v) => setGlobals({ perineural: v as CaseGlobals['perineural'] })}
          options={presence}
        />
        <SelectField
          label={t('prostate.globals.lymphovascular')}
          value={globals.lymphovascular}
          onChange={(v) => setGlobals({ lymphovascular: v as CaseGlobals['lymphovascular'] })}
          options={presence}
        />
        {!lnMapped && (
          <>
            <NumField label={t('prostate.globals.lnPositive')} value={globals.lnPositive} min={0} onChange={(v) => setGlobals({ lnPositive: v })} />
            <NumField label={t('prostate.globals.lnTotal')} value={globals.lnTotal} min={0} onChange={(v) => setGlobals({ lnTotal: v })} />
          </>
        )}
      </div>
      <Toggle
        checked={globals.adjacentInvasion}
        onChange={(v) => setGlobals({ adjacentInvasion: v })}
        label={t('prostate.globals.adjacentInvasion')}
      />

      <div className="grid gap-4 border-t border-line pt-5 sm:grid-cols-2 xl:grid-cols-3">
        <SelectField
          label={t('prostate.globals.g45Mode')}
          value={globals.g45Mode}
          onChange={(v) => setGlobals({ g45Mode: v as CaseGlobals['g45Mode'] })}
          options={[
            { value: 'ofTumor', label: t('prostate.globals.g45OfTumor') },
            { value: 'ofCassette', label: t('prostate.globals.g45OfCassette') },
          ]}
          hint={t('prostate.globals.g45Hint')}
        />
        <SelectField
          label={t('prostate.globals.cribMode')}
          value={globals.cribMode}
          onChange={(v) => setGlobals({ cribMode: v as CaseGlobals['cribMode'] })}
          options={modeOptions}
          hint={globals.cribMode === 'perCassette' ? t('prostate.globals.cribPerCassetteHint') : undefined}
        />
        {globals.cribMode === 'global' && (
          <NumField
            label={t('prostate.globals.cribriform')}
            value={globals.cribriform}
            min={0}
            max={100}
            onChange={(v) => setGlobals({ cribriform: v })}
            hint={t('prostate.globals.cribriformHint')}
          />
        )}
        <SelectField
          label={t('prostate.globals.idcMode')}
          value={globals.idcMode}
          onChange={(v) => setGlobals({ idcMode: v as CaseGlobals['idcMode'] })}
          options={modeOptions}
          hint={globals.idcMode === 'perCassette' ? t('prostate.globals.idcPerCassetteHint') : undefined}
        />
        {globals.idcMode === 'global' && (
          <SelectField
            label={t('prostate.globals.intraductal')}
            value={globals.intraductal}
            onChange={(v) => setGlobals({ intraductal: v as CaseGlobals['intraductal'] })}
            options={presence}
          />
        )}
      </div>
    </div>
  )
}
