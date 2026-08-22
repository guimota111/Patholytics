import { useTranslation } from 'react-i18next'
import { Info } from 'lucide-react'
import { ConverterCard } from '@/tools/fov/components/ConverterCard'
import { MicroscopeCard } from '@/tools/fov/components/MicroscopeCard'
import { RequirementsCard } from '@/tools/fov/components/RequirementsCard'
import { useMicroscope } from '@/tools/fov/useMicroscope'

export default function FieldConverterPage() {
  const { t } = useTranslation()
  const { config, update, reset, hydrated } = useMicroscope()

  return (
    <div className="shell py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('tools.fieldConverter.name')}</h1>
        <p className="mt-1.5 max-w-3xl text-sm text-ink-muted">{t('fov.subtitle')}</p>
      </header>

      {hydrated && (
        <>
          <div className="mt-8 grid items-start gap-6 xl:grid-cols-2">
            <MicroscopeCard config={config} onChange={update} onReset={reset} />
            <ConverterCard config={config} />
          </div>

          <div className="mt-6">
            <RequirementsCard config={config} />
          </div>
        </>
      )}

      <p className="mt-12 flex items-start gap-2 border-t border-line pt-6 text-xs leading-relaxed text-ink-faint">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        {t('fov.disclaimer')}
      </p>
    </div>
  )
}
