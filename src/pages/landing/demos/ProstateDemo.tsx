import { lazy, Suspense, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NumField, Toggle } from '@/components/ui/fields'
import { Spinner } from '@/components/ui/Spinner'
import { useTheme } from '@/hooks/useTheme'
import { analyze } from '@/tools/prostate/analysis'
import { fmtN, gleasonText } from '@/tools/prostate/format'
import { cellColor } from '@/tools/prostate/heat'
import { makeGroup } from '@/tools/prostate/mapping'
import { DEFAULT_GLOBALS } from '@/tools/prostate/storage'
import { buildSummary } from '@/tools/prostate/summary'
import { EMPTY_CELL, type CaseState, type CellData } from '@/tools/prostate/types'
import { DemoFrame, DemoLabel, DemoReport, DemoStats } from '../SnapSection'
import { useSeen } from '../useSeen'

// three.js só desce quando este snap se aproxima da janela.
const ProstateModel = lazy(() => import('@/tools/prostate/components/ProstateModel'))

/** Achados já lançados: o visitante chega num caso pela metade, não numa tela vazia. */
const DEMO_CELLS: Record<string, CellData> = {
  c4: { ...EMPTY_CELL, tumor: 30, g4: 20 },
  c5: { ...EMPTY_CELL, tumor: 65, g4: 45, margin: true, marginMm: 4, marginPattern: 4 },
  c6: { ...EMPTY_CELL, tumor: 25, g4: 15, epe: 'established' },
  c10: { ...EMPTY_CELL, tumor: 10 },
}

export default function ProstateDemo() {
  const { t, i18n } = useTranslation()
  const { resolved: theme } = useTheme()
  const { ref, seen } = useSeen<HTMLDivElement>()
  const [selected, setSelected] = useState<string | null>(null)

  const mapping = useMemo(
    () => ({
      total: 12,
      groups: [
        makeGroup({ id: 'd-ra', name: t('landing.demo.prostate.groups.rightAnterior'), range: '1-3', side: 'D' as const, region: 'anterior' as const, span: 'apexToBase' as const }),
        makeGroup({ id: 'd-rp', name: t('landing.demo.prostate.groups.rightPosterior'), range: '4-6', side: 'D' as const, region: 'posterior' as const, span: 'apexToBase' as const }),
        makeGroup({ id: 'd-la', name: t('landing.demo.prostate.groups.leftAnterior'), range: '7-9', side: 'E' as const, region: 'anterior' as const, span: 'apexToBase' as const }),
        makeGroup({ id: 'd-lp', name: t('landing.demo.prostate.groups.leftPosterior'), range: '10-12', side: 'E' as const, region: 'posterior' as const, span: 'apexToBase' as const }),
      ],
    }),
    [t],
  )

  const [cells, setCells] = useState<Record<string, CellData>>(DEMO_CELLS)
  const setCell = (id: string, patch: Partial<CellData>) =>
    setCells((current) => ({ ...current, [id]: { ...EMPTY_CELL, ...current[id], ...patch } }))

  const state: CaseState = useMemo(
    () => ({
      mapping,
      cells,
      globals: { ...DEFAULT_GLOBALS, weightGrams: 45, perineural: 'present', cribriform: 20 },
    }),
    [mapping, cells],
  )

  const analysis = useMemo(() => analyze(state), [state])
  const summary = useMemo(() => buildSummary(state, analysis, t, i18n.language), [state, analysis, t, i18n.language])

  const stats = [
    { label: 'Gleason', value: analysis.gleason ? `${gleasonText(analysis.gleason)} · GG ${analysis.gleason.gradeGroup}` : '—' },
    { label: t('prostate.results.volume'), value: `${fmtN(analysis.volumePct, 1, i18n.language)}%` },
    { label: t('prostate.results.margins'), value: analysis.margins.foci.length ? `${analysis.margins.foci.length} ${t('prostate.results.foci')}` : t('prostate.results.margins') },
    { label: t('prostate.results.staging'), value: `${analysis.staging.pT ?? '—'} ${analysis.staging.pN}` },
  ]

  return (
    <div ref={ref} className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <DemoFrame className="flex flex-col">
        <DemoLabel>{t('landing.demo.prostate.tableLabel')}</DemoLabel>
        <div className="max-h-[23.5rem] min-h-[12rem] flex-1 overflow-auto rounded-md border border-line">
          <table className="w-full min-w-[26rem] text-sm">
            <thead className="sticky top-0 bg-surface text-[0.6875rem] tracking-wider text-ink-faint uppercase">
              <tr className="border-b border-line">
                <th className="px-3 py-2 text-left font-medium">{t('prostate.table.cassette')}</th>
                <th className="px-2 py-2 text-left font-medium">{t('prostate.table.tumor')}</th>
                <th className="px-2 py-2 text-left font-medium">{t('prostate.table.g4')}</th>
                <th className="px-2 py-2 text-left font-medium">{t('prostate.table.margin')}</th>
                <th className="px-2 py-2 text-left font-medium">{t('prostate.table.epe')}</th>
              </tr>
            </thead>
            <tbody>
              {analysis.cells.map((row) => {
                const id = row.cell.id
                const active = selected === id
                return (
                  <tr
                    key={id}
                    onClick={() => setSelected(active ? null : id)}
                    className={active ? 'bg-accent-soft/60' : 'border-b border-line last:border-0'}
                  >
                    <td className="px-3 py-1.5">
                      <span className="flex items-center gap-2">
                        <span
                          className="inline-block size-2.5 shrink-0 rounded-full border border-line"
                          style={{ background: cellColor(row.worst, row.tumor, theme) }}
                          aria-hidden
                        />
                        <span className="tabular text-ink">{row.cell.label}</span>
                        <span className="truncate text-xs text-ink-faint">{row.cell.group?.name}</span>
                      </span>
                    </td>
                    <td className="px-2 py-1.5">
                      <NumField
                        value={row.data.tumor}
                        onChange={(v) => setCell(id, { tumor: v })}
                        min={0}
                        max={100}
                        className="w-16"
                        aria-label={`${t('prostate.table.tumor')} ${row.cell.label}`}
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <NumField
                        value={row.data.g4}
                        onChange={(v) => setCell(id, { g4: v })}
                        min={0}
                        max={100}
                        className="w-16"
                        aria-label={`${t('prostate.table.g4')} ${row.cell.label}`}
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <Toggle
                        checked={row.data.margin}
                        onChange={(v) => setCell(id, { margin: v })}
                        label={<span className="sr-only">{`${t('prostate.table.margin')} ${row.cell.label}`}</span>}
                      />
                    </td>
                    <td className="px-2 py-1.5">
                      <Toggle
                        checked={row.data.epe !== 'none'}
                        onChange={(v) => setCell(id, { epe: v ? 'established' : 'none' })}
                        label={<span className="sr-only">{`${t('prostate.table.epe')} ${row.cell.label}`}</span>}
                      />
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        <p className="mt-2 text-xs leading-relaxed text-ink-faint">{t('prostate.table.hintOfTumor')}</p>

        <div className="mt-4">
          <DemoStats items={stats} />
        </div>
      </DemoFrame>

      <div className="grid min-w-0 gap-4">
        <DemoFrame>
          <DemoLabel>{t('prostate.map.title3d')}</DemoLabel>
          {seen ? (
            <Suspense fallback={<ModelFallback />}>
              <ProstateModel
                mapping={mapping}
                analysis={analysis}
                theme={theme}
                selected={selected}
                onSelect={setSelected}
                heightClass="h-[15.5rem]"
              />
            </Suspense>
          ) : (
            <ModelFallback />
          )}
        </DemoFrame>

        <DemoFrame>
          <DemoLabel>{t('prostate.results.summaryTitle')}</DemoLabel>
          <DemoReport text={summary} empty={t('prostate.results.empty')} className="max-h-[8.5rem]" />
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
