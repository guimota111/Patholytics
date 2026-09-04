import { lazy, Suspense, useCallback, useMemo, useRef, useState } from 'react'
import { Link, Navigate, useParams } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { Info, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { MoreSection, StepCard } from '@/components/ui/didactic'
import { Spinner } from '@/components/ui/Spinner'
import { useTheme } from '@/hooks/useTheme'
import { cn } from '@/lib/cn'
import { downloadBlob } from '@/lib/canvasReport'
import { analyzeMicro } from '@/tools/breast/analysis'
import type { BreastModelHandle } from '@/tools/breast/components/BreastModel'
import { CassetteGrid } from '@/tools/breast/components/CassetteGrid'
import { CellularityGuide } from '@/tools/breast/components/CellularityGuide'
import { InkFields } from '@/tools/breast/components/InkFields'
import { LesionEditor } from '@/tools/breast/components/LesionEditor'
import { MacroTextCard } from '@/tools/breast/components/MacroTextCard'
import { MapBuilder } from '@/tools/breast/components/MapBuilder'
import { GlobalsFields, NodesFields } from '@/tools/breast/components/MicroFields'
import { RcbCard } from '@/tools/breast/components/RcbCard'
import { SliceMap } from '@/tools/breast/components/SliceMap'
import { SlicingFields } from '@/tools/breast/components/SlicingFields'
import { SpecimenFields } from '@/tools/breast/components/SpecimenFields'
import { renderMacroImage, renderMicroImage } from '@/tools/breast/exportImage'
import { buildMacroText } from '@/tools/breast/macroText'
import { buildMicroSummary } from '@/tools/breast/microSummary'
import { DEFAULT_MACRO, encodeMapCode } from '@/tools/breast/storage'
import { useBreastCase } from '@/tools/breast/useBreastCase'
import type { MacroState } from '@/tools/breast/types'

// three.js só é baixado quando esta página abre.
const BreastModel = lazy(() => import('@/tools/breast/components/BreastModel'))

const MODULES = ['macro', 'micro', 'summary'] as const
type Module = (typeof MODULES)[number]

export default function BreastMapperPage() {
  const { module } = useParams()
  if (!module) return <Navigate to="/tools/breast/macro" replace />
  if (!MODULES.includes(module as Module)) return <Navigate to="/tools/breast/macro" replace />
  return <BreastMapper module={module as Module} />
}

function BreastMapper({ module }: { module: Module }) {
  const { t } = useTranslation()
  const c = useBreastCase()

  return (
    <div className="shell py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('tools.breast.name')}</h1>
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-ink-muted">{t('breast.subtitle')}</p>
        </div>
      </header>

      <nav className="mt-6 flex flex-wrap gap-1 rounded-lg border border-line bg-surface p-1" aria-label={t('breast.tabs.label')}>
        {MODULES.map((m) => (
          <Link
            key={m}
            to={`/tools/breast/${m}`}
            aria-current={m === module ? 'page' : undefined}
            className={cn(
              'rounded-md px-4 py-2 text-sm font-medium transition-colors',
              m === module ? 'bg-elevated text-ink shadow-subtle' : 'text-ink-muted hover:text-ink',
            )}
          >
            {t(`breast.tabs.${m}`)}
          </Link>
        ))}
      </nav>

      {c.hydrated && (
        <div className="mt-8">
          {module === 'macro' && <MacroModule c={c} />}
          {module === 'micro' && <MicroModule c={c} />}
          {module === 'summary' && <SummaryModule c={c} />}
        </div>
      )}

      <p className="mt-12 flex items-start gap-2 border-t border-line pt-6 text-xs leading-relaxed text-ink-faint">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        {t('breast.disclaimer')}
      </p>
    </div>
  )
}

type Case = ReturnType<typeof useBreastCase>

function useExport() {
  const [exporting, setExporting] = useState(false)
  const run = useCallback(async (fn: () => Promise<Blob>, name: string) => {
    setExporting(true)
    try {
      downloadBlob(await fn(), `${name}-${new Date().toISOString().slice(0, 10)}.png`)
    } catch (error) {
      console.error('export failed', error)
    } finally {
      setExporting(false)
    }
  }, [])
  return { exporting, run }
}

function ModelCard({ children, title, hint }: { children: React.ReactNode; title: string; hint: string }) {
  return (
    <section className="rounded-lg border border-line bg-elevated shadow-card">
      <div className="border-b border-line px-5 py-4">
        <h2 className="text-sm font-semibold tracking-tight text-ink">{title}</h2>
        <p className="mt-0.5 text-sm text-ink-muted">{hint}</p>
      </div>
      <div className="px-5 py-5">{children}</div>
    </section>
  )
}

const fallback = (
  <div className="flex h-[460px] items-center justify-center">
    <Spinner />
  </div>
)

/* ---- Macroscopia ------------------------------------------------------------ */

function MacroModule({ c }: { c: Case }) {
  const { t, i18n } = useTranslation()
  const { resolved: theme } = useTheme()
  const { macro, setMacro } = c
  const [selected, setSelected] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const modelRef = useRef<BreastModelHandle>(null)
  const { exporting, run } = useExport()

  const text = useMemo(() => buildMacroText(macro, t, i18n.language), [macro, t, i18n.language])
  const code = useMemo(() => encodeMapCode(macro), [macro])
  const setMap = useCallback((fn: (m: MacroState) => MacroState) => setMacro(fn), [setMacro])

  const exportImage = () =>
    run(
      () =>
        renderMacroImage({
          map: macro,
          text,
          views: {
            anterior: modelRef.current?.snapshot('anterior', 1000, 900) ?? null,
            slicing: modelRef.current?.snapshot('slicing', 1000, 900) ?? null,
          },
          t,
          locale: i18n.language,
          title: t('breast.export.macroTitle'),
        }),
      'patholytics-mama-macro',
    )

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        {confirmReset ? (
          <div className="flex items-center gap-2">
            <span className="text-xs text-ink-muted">{t('breast.macro.newCaseHint')}</span>
            <Button
              type="button"
              size="sm"
              variant="danger"
              onClick={() => {
                c.resetMacro()
                setSelected(null)
                setConfirmReset(false)
              }}
            >
              {t('breast.macro.newCaseConfirm')}
            </Button>
            <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmReset(false)}>
              {t('common.cancel')}
            </Button>
          </div>
        ) : (
          <Button type="button" size="sm" variant="ghost" onClick={() => setConfirmReset(true)}>
            <RotateCcw className="size-4" aria-hidden />
            {t('breast.macro.newCase')}
          </Button>
        )}
      </div>

      <StepCard number={1} title={t('breast.macro.step1Title')} hint={t('breast.macro.step1Hint')}>
        <SpecimenFields
          specimen={macro.specimen}
          onChange={(patch) => setMap((m) => ({ ...m, specimen: { ...m.specimen, ...patch } }))}
          units={macro.units}
          onUnits={(u) => setMacro({ units: u })}
        />
      </StepCard>

      <StepCard number={2} title={t('breast.macro.step2Title')} hint={t('breast.macro.step2Hint')}>
        <InkFields
          inks={macro.inks}
          onChange={(margin, ink) => setMap((m) => ({ ...m, inks: { ...m.inks, [margin]: ink } }))}
          defaults={c.inkDefaults}
          onSaveDefaults={() => c.saveInkDefaults(macro.inks)}
          onApplyDefaults={() => c.inkDefaults && setMacro({ inks: c.inkDefaults })}
          onClearDefaults={() => c.saveInkDefaults(null)}
        />
      </StepCard>

      <StepCard number={3} title={t('breast.macro.step3Title')} hint={t('breast.macro.step3Hint')}>
        <LesionEditor map={macro} setMap={setMap} selected={selected} onSelect={setSelected} />
      </StepCard>

      <StepCard number={4} title={t('breast.macro.step4Title')} hint={t('breast.macro.step4Hint')}>
        <SlicingFields map={macro} setMap={setMap} />
      </StepCard>

      <div className="grid items-start gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <StepCard number={5} title={t('breast.macro.step5Title')} hint={t('breast.macro.step5Hint')}>
          <MacroTextCard text={text} code={code} onExport={() => void exportImage()} exporting={exporting} />
        </StepCard>
        <div className="space-y-6">
          <ModelCard title={t('breast.map.title3d')} hint={t('breast.map.hint3dMacro')}>
            <Suspense fallback={fallback}>
              <BreastModel ref={modelRef} map={macro} theme={theme} mode="macro" selectedLesion={selected} onSelectLesion={setSelected} />
            </Suspense>
          </ModelCard>
          <ModelCard title={t('breast.map.title2d')} hint={t('breast.map.hint2dMacro')}>
            <SliceMap map={macro} theme={theme} selectedLesion={selected} onSelectLesion={setSelected} />
          </ModelCard>
        </div>
      </div>
    </div>
  )
}

/* ---- Laudagem --------------------------------------------------------------- */

function MicroModule({ c }: { c: Case }) {
  const { t, i18n } = useTranslation()
  const { resolved: theme } = useTheme()
  const { micro, setMicro, setMicroMap } = c
  const [selectedLesion, setSelectedLesion] = useState<string | null>(null)
  const [selectedCassette, setSelectedCassette] = useState<string | null>(null)
  const modelRef = useRef<BreastModelHandle>(null)
  const { exporting, run } = useExport()

  const analysis = useMemo(() => analyzeMicro(micro), [micro])
  const summary = useMemo(() => buildMicroSummary(micro, analysis, t, i18n.language), [micro, analysis, t, i18n.language])
  const hasLocalMacro = JSON.stringify(c.macro) !== JSON.stringify(DEFAULT_MACRO)
  const currentCa = selectedCassette ? (micro.cells[selectedCassette]?.ca ?? null) : null

  const exportImage = () =>
    run(
      () =>
        renderMicroImage({
          state: micro,
          analysis,
          summary,
          views: {
            anterior: modelRef.current?.snapshot('anterior', 1000, 900) ?? null,
            slicing: modelRef.current?.snapshot('slicing', 1000, 900) ?? null,
          },
          t,
          locale: i18n.language,
          title: t('breast.export.microTitle'),
        }),
      'patholytics-mama-rcb',
    )

  return (
    <div className="space-y-6">
      <StepCard number={1} title={t('breast.micro.step1Title')} hint={t('breast.micro.step1Hint')}>
        <MapBuilder
          map={micro.map}
          setMap={setMicroMap}
          onReplace={c.replaceMicroMap}
          onImportLocal={c.importMacroIntoMicro}
          hasLocalMacro={hasLocalMacro}
          selectedLesion={selectedLesion}
          onSelectLesion={setSelectedLesion}
        />
      </StepCard>

      <StepCard number={2} title={t('breast.micro.step2Title')} hint={t('breast.micro.step2Hint')}>
        <CellularityGuide highlight={currentCa} />
        <CassetteGrid
          analysis={analysis.lesions}
          cells={micro.cells}
          theme={theme}
          selected={selectedCassette}
          onSelect={setSelectedCassette}
          setCell={c.setCell}
          rcbLesionId={micro.rcbLesionId}
          onRcbLesion={(id) => setMicro({ rcbLesionId: id })}
          onClear={c.clearMicroFindings}
        />
      </StepCard>

      <StepCard number={3} title={t('breast.micro.step3Title')} hint={t('breast.micro.step3Hint')}>
        <NodesFields nodes={micro.nodes} onChange={c.setNodes} />
        <MoreSection label={t('breast.globals.toggle')}>
          <GlobalsFields globals={micro.globals} onChange={c.setGlobals} />
        </MoreSection>
      </StepCard>

      <div className="grid items-start gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <StepCard number={4} title={t('breast.micro.step4Title')} hint={t('breast.micro.step4Hint')}>
          <RcbCard analysis={analysis} overrides={micro.overrides} setOverrides={c.setOverrides} summary={summary} onExport={() => void exportImage()} exporting={exporting} />
        </StepCard>
        <div className="space-y-6">
          <ModelCard title={t('breast.map.title3d')} hint={t('breast.map.hint3dMicro')}>
            <Suspense fallback={fallback}>
              <BreastModel
                ref={modelRef}
                map={micro.map}
                theme={theme}
                mode="micro"
                cells={micro.cells}
                selectedLesion={selectedLesion}
                onSelectLesion={setSelectedLesion}
                selectedCassette={selectedCassette}
                onSelectCassette={setSelectedCassette}
              />
            </Suspense>
          </ModelCard>
          <ModelCard title={t('breast.map.title2d')} hint={t('breast.map.hint2dMicro')}>
            <SliceMap
              map={micro.map}
              theme={theme}
              cells={micro.cells}
              selectedLesion={selectedLesion}
              onSelectLesion={setSelectedLesion}
              selectedCassette={selectedCassette}
              onSelectCassette={setSelectedCassette}
            />
          </ModelCard>
        </div>
      </div>
    </div>
  )
}

/* ---- Resumo ----------------------------------------------------------------- */

function SummaryModule({ c }: { c: Case }) {
  const { t, i18n } = useTranslation()
  const { resolved: theme } = useTheme()
  const { macro, micro } = c
  const [selectedLesion, setSelectedLesion] = useState<string | null>(null)
  const [selectedCassette, setSelectedCassette] = useState<string | null>(null)
  const modelRef = useRef<BreastModelHandle>(null)
  const { exporting, run } = useExport()

  const analysis = useMemo(() => analyzeMicro(micro), [micro])
  const summary = useMemo(() => buildMicroSummary(micro, analysis, t, i18n.language), [micro, analysis, t, i18n.language])
  const macroText = useMemo(() => buildMacroText(macro, t, i18n.language), [macro, t, i18n.language])
  const sameCase = encodeMapCode(macro) === encodeMapCode(micro.map)
  const n = (v: number | null | undefined, d = 1) => (v === null || v === undefined ? '—' : new Intl.NumberFormat(i18n.language, { maximumFractionDigits: d }).format(v))
  const cls = analysis.invalid ? null : (analysis.forcedClass ?? analysis.rcb?.rcbClass ?? null)

  const exportImage = () =>
    run(
      () =>
        renderMicroImage({
          state: micro,
          analysis,
          summary,
          views: {
            anterior: modelRef.current?.snapshot('anterior', 1000, 900) ?? null,
            slicing: modelRef.current?.snapshot('slicing', 1000, 900) ?? null,
          },
          t,
          locale: i18n.language,
          title: t('breast.export.summaryTitle'),
        }),
      'patholytics-mama-resumo',
    )

  const facts: { label: string; value: string }[] = [
    { label: t('breast.summary.specimen'), value: `${t(`breast.specimenType.${micro.map.specimen.type}`)} · ${t(`breast.side.${micro.map.specimen.side}`)}` },
    { label: t('breast.summary.lesions'), value: String(micro.map.lesions.length) },
    { label: t('breast.rcb.classLabel'), value: cls ?? '—' },
    { label: t('breast.rcb.index'), value: analysis.rcb && !analysis.invalid && !analysis.forcedClass ? n(analysis.rcb.index, 2) : '—' },
    { label: t('breast.rcb.nodesLabel'), value: micro.nodes.examined !== null ? `${micro.nodes.positive ?? 0}/${micro.nodes.examined}` : '—' },
    { label: t('breast.rcb.stagingLabel'), value: analysis.ypT ? `${analysis.ypT} ${analysis.ypN}` : analysis.ypN },
  ]

  return (
    <div className="space-y-6">
      <p className="text-sm text-ink-muted">{t(sameCase ? 'breast.summary.sameCase' : 'breast.summary.hint')}</p>
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-lg border border-line bg-line sm:grid-cols-3 xl:grid-cols-6">
        {facts.map((f) => (
          <div key={f.label} className="bg-elevated px-4 py-3">
            <dt className="text-[0.6875rem] tracking-wider text-ink-faint uppercase">{f.label}</dt>
            <dd className="tabular mt-1 text-base font-semibold break-words text-ink">{f.value}</dd>
          </div>
        ))}
      </dl>

      <div className="grid items-start gap-6 2xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="space-y-6">
          <ModelCard title={t('breast.map.title3d')} hint={t('breast.map.hint3dMicro')}>
            <Suspense fallback={fallback}>
              <BreastModel
                ref={modelRef}
                map={micro.map}
                theme={theme}
                mode="micro"
                cells={micro.cells}
                selectedLesion={selectedLesion}
                onSelectLesion={setSelectedLesion}
                selectedCassette={selectedCassette}
                onSelectCassette={setSelectedCassette}
              />
            </Suspense>
          </ModelCard>
          <ModelCard title={t('breast.map.title2d')} hint={t('breast.map.hint2dMicro')}>
            <SliceMap
              map={micro.map}
              theme={theme}
              cells={micro.cells}
              selectedLesion={selectedLesion}
              onSelectLesion={setSelectedLesion}
              selectedCassette={selectedCassette}
              onSelectCassette={setSelectedCassette}
            />
          </ModelCard>
        </div>
        <div className="space-y-6">
          <StepCard number={1} title={t('breast.summary.rcbTitle')} hint={t('breast.summary.rcbHint')}>
            <RcbCard analysis={analysis} overrides={micro.overrides} setOverrides={c.setOverrides} summary={summary} onExport={() => void exportImage()} exporting={exporting} />
          </StepCard>
          {sameCase && (
            <StepCard number={2} title={t('breast.summary.macroTitle')} hint={t('breast.summary.macroHint')}>
              <MacroTextCard text={macroText} code={encodeMapCode(macro)} />
            </StepCard>
          )}
        </div>
      </div>
    </div>
  )
}
