import { lazy, Suspense, useCallback, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Info } from 'lucide-react'
import { MoreSection, StepCard } from '@/components/ui/didactic'
import { Spinner } from '@/components/ui/Spinner'
import { useTheme } from '@/hooks/useTheme'
import { analyze } from '@/tools/prostate/analysis'
import { CassetteMap } from '@/tools/prostate/components/CassetteMap'
import { CassetteTable } from '@/tools/prostate/components/CassetteTable'
import { GlobalsFields } from '@/tools/prostate/components/GlobalsFields'
import { MappingCard } from '@/tools/prostate/components/MappingCard'
import type { ProstateModelHandle } from '@/tools/prostate/components/ProstateModel'
import { ResultsCard } from '@/tools/prostate/components/ResultsCard'
import { renderCaseImage } from '@/tools/prostate/exportImage'
import { buildSummary } from '@/tools/prostate/summary'
import { useProstateCase } from '@/tools/prostate/useProstateCase'

// three.js só é baixado quando esta página abre.
const ProstateModel = lazy(() => import('@/tools/prostate/components/ProstateModel'))

export default function ProstateMapperPage() {
  const { t, i18n } = useTranslation()
  const { resolved: theme } = useTheme()
  const { state, hydrated, setMapping, setCell, setGlobals, clearFindings, templates, saveTemplate, deleteTemplate } =
    useProstateCase()
  const [selected, setSelected] = useState<string | null>(null)
  const [exporting, setExporting] = useState(false)
  const modelRef = useRef<ProstateModelHandle>(null)

  const analysis = useMemo(() => analyze(state), [state])
  const summary = useMemo(() => buildSummary(state, analysis, t, i18n.language), [state, analysis, t, i18n.language])
  const svMapped = state.mapping.groups.some((g) => g.tissue === 'seminalVesicle')
  const lnMapped = state.mapping.groups.some((g) => g.tissue === 'lymphNode')

  const exportImage = useCallback(async () => {
    setExporting(true)
    try {
      const views = {
        anterior: modelRef.current?.snapshot('anterior', 1100, 800) ?? null,
        posterior: modelRef.current?.snapshot('posterior', 1100, 800) ?? null,
      }
      const blob = await renderCaseImage({
        state,
        analysis,
        views,
        t,
        locale: i18n.language,
        title: t('tools.gleason.name'),
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `patholytics-prostata-${new Date().toISOString().slice(0, 10)}.png`
      a.click()
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    } catch (error) {
      console.error('export failed', error)
    } finally {
      setExporting(false)
    }
  }, [state, analysis, t, i18n.language])

  return (
    <div className="shell py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('tools.gleason.name')}</h1>
        <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-ink-muted">{t('prostate.subtitle')}</p>
      </header>

      {hydrated && (
        <div className="mt-8 space-y-6">
          <StepCard number={1} title={t('prostate.step1Title')} hint={t('prostate.step1Hint')}>
            <MappingCard
              mapping={state.mapping}
              setMapping={setMapping}
              templates={templates}
              onSaveTemplate={saveTemplate}
              onDeleteTemplate={deleteTemplate}
            />
          </StepCard>

          <StepCard number={2} title={t('prostate.step2Title')} hint={t('prostate.step2Hint')}>
            <CassetteTable
              mapping={state.mapping}
              globals={state.globals}
              analysis={analysis}
              theme={theme}
              selected={selected}
              onSelect={setSelected}
              setCell={setCell}
              onClear={clearFindings}
            />
            <MoreSection label={t('prostate.globals.toggle')}>
              <GlobalsFields globals={state.globals} setGlobals={setGlobals} svMapped={svMapped} lnMapped={lnMapped} />
            </MoreSection>
          </StepCard>

          <div className="grid items-start gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
            <StepCard number={3} title={t('prostate.step3Title')} hint={t('prostate.step3Hint')}>
              <ResultsCard analysis={analysis} summary={summary} onExport={() => void exportImage()} exporting={exporting} />
            </StepCard>

            <div className="space-y-6">
              <section className="rounded-lg border border-line bg-elevated shadow-card">
                <div className="border-b border-line px-5 py-4">
                  <h2 className="text-sm font-semibold tracking-tight text-ink">{t('prostate.map.title3d')}</h2>
                  <p className="mt-0.5 text-sm text-ink-muted">{t('prostate.map.hint3dCard')}</p>
                </div>
                <div className="px-5 py-5">
                  <Suspense
                    fallback={
                      <div className="flex h-[420px] items-center justify-center">
                        <Spinner />
                      </div>
                    }
                  >
                    <ProstateModel
                      ref={modelRef}
                      mapping={state.mapping}
                      analysis={analysis}
                      theme={theme}
                      selected={selected}
                      onSelect={setSelected}
                    />
                  </Suspense>
                </div>
              </section>

              <section className="rounded-lg border border-line bg-elevated shadow-card">
                <div className="border-b border-line px-5 py-4">
                  <h2 className="text-sm font-semibold tracking-tight text-ink">{t('prostate.map.title2d')}</h2>
                  <p className="mt-0.5 text-sm text-ink-muted">{t('prostate.map.hint2d')}</p>
                </div>
                <div className="px-5 py-5">
                  <CassetteMap mapping={state.mapping} analysis={analysis} theme={theme} selected={selected} onSelect={setSelected} />
                </div>
              </section>
            </div>
          </div>
        </div>
      )}

      <p className="mt-12 flex items-start gap-2 border-t border-line pt-6 text-xs leading-relaxed text-ink-faint">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        {t('prostate.disclaimer')}
      </p>
    </div>
  )
}
