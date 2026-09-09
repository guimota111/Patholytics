import { useTranslation } from 'react-i18next'
import { useParams } from 'react-router-dom'
import { Crumbs, MANUAL_PATH, ManualFooter, MissingNote } from '@/tools/macroscopy/components/ManualChrome'
import { StepViewer } from '@/tools/macroscopy/components/StepViewer'
import { findProtocol, findSystem } from '@/tools/macroscopy/content'

/** O roteiro de uma peça, passo a passo. */
export default function MacroscopyProtocolPage() {
  const { t } = useTranslation()
  const { systemId, protocolId } = useParams()
  const system = findSystem(systemId)
  const protocol = findProtocol(system, protocolId)

  if (!system || !protocol) return <MissingNote />

  return (
    <div className="shell py-10">
      <Crumbs
        items={[
          { label: t('macroscopy.manual'), to: MANUAL_PATH },
          { label: system.name, to: `${MANUAL_PATH}/${system.id}` },
          { label: protocol.name },
        ]}
      />

      <header className="mt-4">
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{protocol.name}</h1>
        {protocol.summary && (
          <p className="mt-1.5 max-w-2xl text-sm leading-relaxed text-ink-muted">{protocol.summary}</p>
        )}
      </header>

      <div className="mx-auto mt-6 max-w-3xl">
        <StepViewer protocol={protocol} systemName={system.name} />
        {protocol.steps.length > 1 && (
          <p className="mt-3 text-center text-xs text-ink-faint">{t('macroscopy.keyboardHint')}</p>
        )}
      </div>

      <ManualFooter />
    </div>
  )
}
