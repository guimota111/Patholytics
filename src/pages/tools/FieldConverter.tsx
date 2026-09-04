import { useTranslation } from 'react-i18next'
import { Info } from 'lucide-react'
import { ConverterCard } from '@/tools/fov/components/ConverterCard'
import { MicroscopeCard } from '@/tools/fov/components/MicroscopeCard'
import { RequirementsCard } from '@/tools/fov/components/RequirementsCard'
import { StepCard } from '@/components/ui/didactic'
import { useMicroscope } from '@/tools/fov/useMicroscope'

export default function FieldConverterPage() {
  const { t } = useTranslation()
  const { config, update, reset, hydrated } = useMicroscope()

  return (
    <div className="shell py-10">
      <div className="w-full">
        <header>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('tools.fieldConverter.name')}</h1>
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-ink-muted">{t('fov.subtitle')}</p>
        </header>

        {hydrated && (
          <div className="mt-8 grid items-start gap-6 2xl:grid-cols-2">
            <StepCard number={1} title={t('fov.step1Title')} hint={t('fov.step1Hint')}>
              <MicroscopeCard config={config} onChange={update} onReset={reset} />
            </StepCard>

            <StepCard number={2} title={t('fov.step2Title')} hint={t('fov.step2Hint')}>
              <ConverterCard config={config} />
            </StepCard>

            <div className="2xl:col-span-2">
              <StepCard number={3} title={t('fov.step3Title')} hint={t('fov.step3Hint')}>
                <RequirementsCard config={config} />
              </StepCard>
            </div>
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
