import { lazy, Suspense, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Spinner } from '@/components/ui/Spinner'
import { useTheme } from '@/hooks/useTheme'
import { analyzeMicro, type CellResult } from '@/tools/breast/analysis'
import { caColor, caTextColor } from '@/tools/breast/heat'
import { buildMicroSummary } from '@/tools/breast/microSummary'
import { DEFAULT_MACRO, DEFAULT_MICRO, makeLesion } from '@/tools/breast/storage'
import { CA_STEPS, EMPTY_MICRO_CELL, type MicroCell, type MicroState } from '@/tools/breast/types'
import { cn } from '@/lib/cn'
import { DemoFrame, DemoLabel, DemoReport, DemoStats } from '../SnapSection'
import { useSeen } from '../useSeen'

const BreastModel = lazy(() => import('@/tools/breast/components/BreastModel'))

const LESION_ID = 'demo-mama-1'

/** Segmentectomia de mama esquerda com um leito tumoral pós-neoadjuvância. */
const DEMO_MAP = {
  ...DEFAULT_MACRO,
  specimen: { ...DEFAULT_MACRO.specimen, type: 'segmentectomy' as const, side: 'left' as const, dims: { ml: 85, si: 62, ap: 32 } },
  slicing: { axis: 'ml' as const, from: 'lateral' as const, count: 8 },
  lesions: [
    makeLesion({
      id: LESION_ID,
      label: '1',
      kind: 'tumorBed',
      shape: 'illDefined',
      size: { ml: 28, si: 22, ap: 18 },
      center: { x: 8, y: 6, z: 2 },
      clip: true,
      cassettes: { prefix: 'A', start: 1, rows: 2, cols: 3, perOtherSlice: 1 },
    }),
  ],
}

/** Celularidade já lançada em parte dos cassetes do maior corte. */
const DEMO_CELLS: Record<string, MicroCell> = {
  [`${LESION_ID}:0`]: { ...EMPTY_MICRO_CELL, ca: 20, cis: 10 },
  [`${LESION_ID}:1`]: { ...EMPTY_MICRO_CELL, ca: 40, cis: 5 },
  [`${LESION_ID}:2`]: { ...EMPTY_MICRO_CELL, ca: 0 },
  [`${LESION_ID}:3`]: { ...EMPTY_MICRO_CELL, ca: 10, lvi: true },
  [`${LESION_ID}:4`]: { ...EMPTY_MICRO_CELL, ca: 30 },
}

const DEMO_STATE: MicroState = {
  ...DEFAULT_MICRO,
  map: DEMO_MAP,
  cells: DEMO_CELLS,
  rcbLesionId: LESION_ID,
  nodes: { examined: 12, positive: 2, largestMm: 4, itcOnly: false, extranodal: 'absent', treatmentEffect: 'present' },
  globals: {
    ...DEFAULT_MICRO.globals,
    histType: 'nst',
    grade: 2,
    largestInvasiveMm: 12,
    treatmentEffect: 'present',
    lvi: 'present',
    marginsInvasive: 'free',
  },
}

export default function BreastDemo() {
  const { t, i18n } = useTranslation()
  const { resolved: theme } = useTheme()
  const { ref, seen } = useSeen<HTMLDivElement>()
  const [state, setState] = useState<MicroState>(DEMO_STATE)
  const [selectedCassette, setSelectedCassette] = useState<string | null>(null)
  const [selectedLesion, setSelectedLesion] = useState<string | null>(null)

  const setCell = (id: string, patch: Partial<MicroCell>) =>
    setState((current) => ({
      ...current,
      cells: { ...current.cells, [id]: { ...EMPTY_MICRO_CELL, ...current.cells[id], ...patch } },
    }))

  const analysis = useMemo(() => analyzeMicro(state), [state])
  const summary = useMemo(() => buildMicroSummary(state, analysis, t, i18n.language), [state, analysis, t, i18n.language])

  const n = (v: number | null | undefined, d = 1) =>
    v === null || v === undefined ? '—' : new Intl.NumberFormat(i18n.language, { maximumFractionDigits: d }).format(v)
  const rcbClass = analysis.invalid ? null : (analysis.forcedClass ?? analysis.rcb?.rcbClass ?? null)

  const lesion = analysis.lesions.find((item) => item.plan.lesion.id === state.rcbLesionId) ?? analysis.lesions[0] ?? null
  const others = lesion ? lesion.cells.filter((result) => result.def.kind === 'other') : []
  const current =
    lesion?.cells.find((result) => result.def.id === selectedCassette) ?? lesion?.gridCells[0] ?? null

  const stats = [
    { label: t('breast.rcb.classLabel'), value: rcbClass ?? '—' },
    { label: t('breast.rcb.index'), value: analysis.rcb && !analysis.invalid && !analysis.forcedClass ? n(analysis.rcb.index, 2) : '—' },
    { label: t('breast.rcb.nodesLabel'), value: `${state.nodes.positive ?? 0}/${state.nodes.examined ?? 0}` },
    { label: t('breast.rcb.stagingLabel'), value: analysis.ypT ? `${analysis.ypT} ${analysis.ypN}` : analysis.ypN },
  ]

  return (
    <div ref={ref} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <DemoFrame className="flex flex-col">
        <DemoLabel>{t('landing.demo.breast.gridLabel')}</DemoLabel>
        <p className="text-sm leading-relaxed text-ink-muted">{t('landing.demo.breast.gridHint')}</p>

        <div className="mt-3 flex flex-wrap items-start gap-5">
          <div>
            <p className="mb-1.5 text-[0.65rem] tracking-wider text-ink-faint uppercase">
              {t('breast.map.sliceN', { n: lesion?.plan.central ?? 1 })} · {t('breast.map.legendCentral')}
            </p>
            <div
              className="inline-grid gap-1.5"
              style={{ gridTemplateColumns: `repeat(${lesion?.plan.lesion.cassettes.cols ?? 3}, auto)` }}
            >
              {(lesion?.gridCells ?? []).map((result) => (
                <Tile
                  key={result.def.id}
                  result={result}
                  theme={theme}
                  selected={selectedCassette === result.def.id}
                  onClick={() => setSelectedCassette(result.def.id)}
                />
              ))}
            </div>
          </div>

          {others.length > 0 && (
            <div>
              <p className="mb-1.5 text-[0.65rem] tracking-wider text-ink-faint uppercase">
                {t('landing.demo.breast.otherSlices')}
              </p>
              <div className="flex flex-wrap gap-1.5">
                {others.map((result) => (
                  <Tile
                    key={result.def.id}
                    result={result}
                    theme={theme}
                    selected={selectedCassette === result.def.id}
                    onClick={() => setSelectedCassette(result.def.id)}
                    small
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="mt-4 rounded-md border border-line bg-surface px-3.5 py-3">
          <p className="text-sm font-medium text-ink">
            {t('breast.micro.cellCa')} — <span className="tabular">{current?.def.label ?? '—'}</span>
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {CA_STEPS.map((step) => {
              const active = current ? (state.cells[current.def.id]?.ca ?? null) === step : false
              return (
                <button
                  key={step}
                  type="button"
                  disabled={!current}
                  onClick={() => current && setCell(current.def.id, { ca: step, cis: step === 0 ? 0 : (state.cells[current.def.id]?.cis ?? 0) })}
                  className={cn(
                    'tabular rounded-md border px-2 py-1 text-xs transition-colors',
                    active ? 'border-accent font-semibold' : 'border-line hover:border-line-strong',
                  )}
                  style={active ? { background: caColor(step, theme), color: caTextColor(step, theme) } : undefined}
                >
                  {step}%
                </button>
              )
            })}
          </div>
        </div>

        <div className="mt-4">
          <DemoStats items={stats} />
        </div>
      </DemoFrame>

      <div className="grid min-w-0 gap-4">
        <DemoFrame>
          <DemoLabel>{t('breast.map.title3d')}</DemoLabel>
          {seen ? (
            <Suspense fallback={<ModelFallback />}>
              <BreastModel
                map={state.map}
                theme={theme}
                mode="micro"
                cells={state.cells}
                selectedLesion={selectedLesion}
                onSelectLesion={setSelectedLesion}
                selectedCassette={selectedCassette}
                onSelectCassette={setSelectedCassette}
                heightClass="h-[15.5rem]"
              />
            </Suspense>
          ) : (
            <ModelFallback />
          )}
        </DemoFrame>

        <DemoFrame>
          <DemoLabel>{t('landing.demo.breast.summaryLabel')}</DemoLabel>
          <DemoReport text={summary} empty={t('landing.demo.emptyReport')} className="max-h-[8.5rem]" />
        </DemoFrame>
      </div>
    </div>
  )
}

function ModelFallback() {
  return (
    <div className="flex h-[15.5rem] items-center justify-center rounded-md border border-line bg-surface">
      <Spinner />
    </div>
  )
}

/** Um cassete do leito: cor pela celularidade, como no mapa da ferramenta. */
function Tile({
  result,
  theme,
  selected,
  onClick,
  small = false,
}: {
  result: CellResult
  theme: 'light' | 'dark'
  selected: boolean
  onClick: () => void
  small?: boolean
}) {
  const ca = result.cell.ca
  return (
    <button
      type="button"
      onClick={onClick}
      style={{ background: caColor(ca, theme), color: caTextColor(ca, theme) }}
      className={cn(
        'flex flex-col items-center justify-center rounded-md border transition-colors',
        small ? 'size-11' : 'size-14',
        selected ? 'border-accent ring-2 ring-accent/40' : 'border-line hover:border-line-strong',
      )}
    >
      <span className="tabular text-xs font-semibold">{result.def.label}</span>
      <span className="tabular text-[0.625rem] opacity-90">{ca === null ? '·' : `${ca}%`}</span>
    </button>
  )
}
