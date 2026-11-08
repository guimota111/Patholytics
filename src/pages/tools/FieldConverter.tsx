import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Info } from 'lucide-react'
import { StepCard } from '@/components/ui/didactic'
import { AreaToFields } from '@/tools/fov/components/AreaToFields'
import { CountToMm2 } from '@/tools/fov/components/CountToMm2'
import { FieldSizeResult } from '@/tools/fov/components/FieldSizeResult'
import { FieldsToArea } from '@/tools/fov/components/FieldsToArea'
import { GoalPicker } from '@/tools/fov/components/GoalPicker'
import { MicroscopeSetup } from '@/tools/fov/components/MicroscopeSetup'
import { ObjectivePicker } from '@/tools/fov/components/ObjectivePicker'
import { ReferenceFieldPicker } from '@/tools/fov/components/ReferenceFieldPicker'
import { SettingPicker } from '@/tools/fov/components/SettingPicker'
import { TumorGuide } from '@/tools/fov/components/TumorGuide'
import { microscopeField, referenceField, type Goal, type Setting } from '@/tools/fov/flow'
import { useMicroscope } from '@/tools/fov/useMicroscope'

/**
 * O conversor como uma conversa em três passos: onde você está laudando, qual
 * é o seu campo, e o que quer saber. Cada resposta abre o passo seguinte.
 */
export default function FieldConverterPage() {
  const { t } = useTranslation()
  const { config, update, reset, prefs, updatePrefs, hydrated } = useMicroscope()
  const [goal, setGoal] = useState<Goal | null>(null)

  const setting = prefs.setting
  const field =
    setting === 'microscope'
      ? microscopeField(config, prefs.objective)
      : setting === 'tele'
        ? referenceField(prefs.refId, prefs.refCustom, config)
        : null

  const pickSetting = (next: Setting) => {
    if (next !== setting) setGoal(null)
    updatePrefs({ setting: next })
  }

  return (
    <div className="shell py-10">
      <div className="w-full">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('tools.fieldConverter.name')}</h1>
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-ink-muted">{t('fov.subtitle')}</p>
        </header>

        {hydrated && (
          <div className="mt-8 space-y-6">
            <StepCard number={1} title={t('fov.step1Title')} hint={t('fov.step1Hint')}>
              <SettingPicker value={setting} onChange={pickSetting} />
            </StepCard>

            {setting === 'microscope' && (
              <StepCard number={2} title={t('fov.step2MicroscopeTitle')} hint={t('fov.step2MicroscopeHint')}>
                <MicroscopeSetup config={config} onChange={update} onReset={reset} />
                <div className="border-t border-line pt-5">
                  <ObjectivePicker objective={prefs.objective} onChange={(objective) => updatePrefs({ objective })} field={field} />
                </div>
              </StepCard>
            )}

            {setting === 'tele' && (
              <StepCard number={2} title={t('fov.step2TeleTitle')} hint={t('fov.step2TeleHint')}>
                <ReferenceFieldPicker
                  refId={prefs.refId}
                  refCustom={prefs.refCustom}
                  onChange={(patch) => updatePrefs(patch)}
                  config={config}
                  onConfig={update}
                  onReset={reset}
                  field={field}
                />
              </StepCard>
            )}

            {setting && (
              <StepCard number={3} title={t('fov.step3Title')} hint={t(`fov.step3Hint.${setting}`)}>
                <GoalPicker setting={setting} value={goal} onChange={setGoal} />
                {goal && !field && <p className="text-sm text-danger">{t('fov.invalid')}</p>}
                {goal && field && (
                  <div className="border-t border-line pt-5">
                    {setting === 'microscope' && goal === 'fieldSize' && <FieldSizeResult config={config} field={field} />}
                    {setting === 'microscope' && goal === 'convertCount' && <CountToMm2 field={field} />}
                    {setting === 'tele' && goal === 'fieldsToArea' && <FieldsToArea field={field} />}
                    {setting === 'tele' && goal === 'convertArea' && <AreaToFields field={field} />}
                    {goal === 'tumor' && <TumorGuide setting={setting} field={field} />}
                  </div>
                )}
              </StepCard>
            )}
          </div>
        )}

        <p className="mt-12 flex items-start gap-2 border-t border-line pt-6 text-xs leading-relaxed text-ink-faint">
          <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {t('fov.disclaimer')}
        </p>
      </div>
    </div>
  )
}
