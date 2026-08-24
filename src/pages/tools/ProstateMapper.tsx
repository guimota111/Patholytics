import { lazy, Suspense, useCallback, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Info } from 'lucide-react'
import { Spinner } from '@/components/ui/Spinner'
import { useTheme } from '@/hooks/useTheme'
import { analyze } from '@/tools/prostate/analysis'
import { CassetteTable } from '@/tools/prostate/components/CassetteTable'
import { GlobalsCard } from '@/tools/prostate/components/GlobalsCard'
import { GridSetupCard } from '@/tools/prostate/components/GridSetupCard'
import { ResultsCard } from '@/tools/prostate/components/ResultsCard'
import { SliceMap } from '@/tools/prostate/components/SliceMap'
import { SectionHeader } from '@/tools/prostate/components/fields'
import { buildCells, duplicateLabels } from '@/tools/prostate/grid'
import { buildSummary } from '@/tools/prostate/summary'
import { useProstateCase } from '@/tools/prostate/useProstateCase'

// three.js só é baixado quando esta página abre.
const ProstateModel = lazy(() => import('@/tools/prostate/components/ProstateModel'))

export default function ProstateMapperPage() {
  const { t, i18n } = useTranslation()
  const { resolved: theme } = useTheme()
  const { state, hydrated, setGrid, setCell, setGlobals, clearFindings, templates, saveTemplate, deleteTemplate } =
    useProstateCase()
  const [editLabels, setEditLabels] = useState(false)
  const [selected, setSelected] = useState<string | null>(null)

  const analysis = useMemo(() => analyze(state), [state])
  const cells = useMemo(() => buildCells(state.grid), [state.grid])
  const duplicates = useMemo(() => duplicateLabels(cells), [cells])
  const summary = useMemo(() => buildSummary(state, analysis, t, i18n.language), [state, analysis, t, i18n.language])

  const setLabel = useCallback(
    (id: string, label: string) => {
      setGrid((grid) => {
        const labels = { ...grid.labels }
        if (label.trim()) labels[id] = label
        else delete labels[id]
        return { ...grid, labels }
      })
    },
    [setGrid],
  )

  const extraWarnings = duplicates.length ? [t('prostate.setup.duplicates', { labels: duplicates.join(', ') })] : []

  return (
    <div className="shell py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('tools.gleason.name')}</h1>
        <p className="mt-1.5 max-w-3xl text-sm text-ink-muted">{t('prostate.subtitle')}</p>
      </header>

      {hydrated && (
        <>
          <div className="mt-8 grid items-start gap-6 xl:grid-cols-2">
            <GridSetupCard
              grid={state.grid}
              setGrid={setGrid}
              templates={templates}
              onSaveTemplate={saveTemplate}
              onDeleteTemplate={deleteTemplate}
              cellCount={cells.length}
              duplicates={duplicates}
              editLabels={editLabels}
              onEditLabels={setEditLabels}
            />
            <GlobalsCard globals={state.globals} setGlobals={setGlobals} />
          </div>

          <div className="mt-6 grid items-start gap-6 xl:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)]">
            <CassetteTable
              grid={state.grid}
              globals={state.globals}
              analysis={analysis}
              theme={theme}
              editLabels={editLabels}
              selected={selected}
              onSelect={setSelected}
              setCell={setCell}
              setLabel={setLabel}
              onClear={clearFindings}
            />
            <div className="xl:sticky xl:top-20">
              <ResultsCard analysis={analysis} summary={summary} extraWarnings={extraWarnings} />
            </div>
          </div>

          <div className="mt-6 grid items-start gap-6 xl:grid-cols-2">
            <div className="rounded-lg border border-line bg-elevated shadow-card">
              <SectionHeader title={t('prostate.map.title2d')} hint={t('prostate.map.hint2d')} />
              <div className="px-5 py-5">
                <SliceMap grid={state.grid} analysis={analysis} theme={theme} selected={selected} onSelect={setSelected} />
              </div>
            </div>
            <div className="rounded-lg border border-line bg-elevated shadow-card">
              <SectionHeader title={t('prostate.map.title3d')} hint={t('prostate.map.hint3dCard')} />
              <div className="px-5 py-5">
                <Suspense
                  fallback={
                    <div className="flex h-[380px] items-center justify-center">
                      <Spinner />
                    </div>
                  }
                >
                  <ProstateModel grid={state.grid} analysis={analysis} theme={theme} selected={selected} onSelect={setSelected} />
                </Suspense>
              </div>
            </div>
          </div>
        </>
      )}

      <p className="mt-12 flex items-start gap-2 border-t border-line pt-6 text-xs leading-relaxed text-ink-faint">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        {t('prostate.disclaimer')}
      </p>
    </div>
  )
}
