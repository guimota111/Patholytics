import { useTranslation } from 'react-i18next'
import type { CaseGlobals } from '../types'
import { NumField, SectionHeader, SelectField, Toggle } from './fields'

interface GlobalsCardProps {
  globals: CaseGlobals
  setGlobals: (patch: Partial<CaseGlobals>) => void
}

export function GlobalsCard({ globals, setGlobals }: GlobalsCardProps) {
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
    <div className="rounded-lg border border-line bg-elevated shadow-card">
      <SectionHeader title={t('prostate.globals.title')} hint={t('prostate.globals.hint')} />
      <div className="space-y-5 px-5 py-5">
        <div className="grid gap-4 sm:grid-cols-2">
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
          <NumField
            label={t('prostate.globals.weight')}
            value={globals.weightGrams}
            min={0}
            decimals
            onChange={(v) => setGlobals({ weightGrams: v })}
            hint={t('prostate.globals.weightHint')}
          />
          <SelectField
            label={t('prostate.globals.cribMode')}
            value={globals.cribMode}
            onChange={(v) => setGlobals({ cribMode: v as CaseGlobals['cribMode'] })}
            options={modeOptions}
          />
          {globals.cribMode === 'global' ? (
            <NumField
              label={t('prostate.globals.cribriform')}
              value={globals.cribriform}
              min={0}
              max={100}
              onChange={(v) => setGlobals({ cribriform: v })}
              hint={t('prostate.globals.cribriformHint')}
            />
          ) : (
            <p className="self-end pb-2 text-xs text-ink-faint">{t('prostate.globals.cribPerCassetteHint')}</p>
          )}
          <SelectField
            label={t('prostate.globals.idcMode')}
            value={globals.idcMode}
            onChange={(v) => setGlobals({ idcMode: v as CaseGlobals['idcMode'] })}
            options={modeOptions}
          />
          {globals.idcMode === 'global' ? (
            <SelectField
              label={t('prostate.globals.intraductal')}
              value={globals.intraductal}
              onChange={(v) => setGlobals({ intraductal: v as CaseGlobals['intraductal'] })}
              options={presence}
            />
          ) : (
            <p className="self-end pb-2 text-xs text-ink-faint">{t('prostate.globals.idcPerCassetteHint')}</p>
          )}
        </div>

        <div className="grid gap-4 border-t border-line pt-5 sm:grid-cols-2">
          <SelectField
            label={t('prostate.globals.seminalVesicles')}
            value={globals.seminalVesicles}
            onChange={(v) => setGlobals({ seminalVesicles: v as CaseGlobals['seminalVesicles'] })}
            options={(['notIdentified', 'free', 'right', 'left', 'bilateral'] as const).map((v) => ({
              value: v,
              label: t(`prostate.sv.${v}`),
            }))}
          />
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
          <NumField
            label={t('prostate.globals.lnPositive')}
            value={globals.lnPositive}
            min={0}
            onChange={(v) => setGlobals({ lnPositive: v })}
          />
          <NumField
            label={t('prostate.globals.lnTotal')}
            value={globals.lnTotal}
            min={0}
            onChange={(v) => setGlobals({ lnTotal: v })}
          />
        </div>
        <Toggle
          checked={globals.adjacentInvasion}
          onChange={(v) => setGlobals({ adjacentInvasion: v })}
          label={t('prostate.globals.adjacentInvasion')}
        />
      </div>
    </div>
  )
}
