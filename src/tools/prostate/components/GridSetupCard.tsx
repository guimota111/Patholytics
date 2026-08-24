import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { BUILTIN_TEMPLATES, clampCone, clampSlices, SECTOR_COUNTS, sectorsOf } from '../grid'
import type { GridConfig, GridTemplate, SectorCount } from '../types'
import { NumField, SectionHeader, SelectField, Toggle, selectClass } from './fields'

interface GridSetupCardProps {
  grid: GridConfig
  setGrid: (patch: Partial<GridConfig> | ((grid: GridConfig) => GridConfig)) => void
  templates: GridTemplate[]
  onSaveTemplate: (name: string, grid: GridConfig) => void
  onDeleteTemplate: (name: string) => void
  cellCount: number
  duplicates: string[]
  editLabels: boolean
  onEditLabels: (on: boolean) => void
}

export function GridSetupCard({
  grid,
  setGrid,
  templates,
  onSaveTemplate,
  onDeleteTemplate,
  cellCount,
  duplicates,
  editLabels,
  onEditLabels,
}: GridSetupCardProps) {
  const { t } = useTranslation()
  const [templateName, setTemplateName] = useState('')
  const [picked, setPicked] = useState('')

  const applyTemplate = (key: string) => {
    setPicked(key)
    if (!key) return
    const [kind, idx] = key.split(':')
    const source = kind === 'b' ? BUILTIN_TEMPLATES : templates
    const tpl = source[Number(idx)]
    if (tpl) setGrid(() => ({ ...tpl.grid, labels: { ...tpl.grid.labels } }))
  }

  const save = () => {
    const name = templateName.trim()
    if (!name) return
    onSaveTemplate(name, grid)
    setTemplateName('')
  }

  const hasCustomLabels = Object.keys(grid.labels).length > 0

  return (
    <div className="rounded-lg border border-line bg-elevated shadow-card">
      <SectionHeader title={t('prostate.setup.title')} hint={t('prostate.setup.hint')}>
        <span className="tabular rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs text-ink-muted">
          {t('prostate.setup.cassettes', { n: cellCount })}
        </span>
      </SectionHeader>

      <div className="space-y-5 px-5 py-5">
        <div className="grid gap-4 sm:grid-cols-2">
          <NumField
            label={t('prostate.setup.slices')}
            value={grid.slices}
            min={1}
            max={20}
            onChange={(v) => setGrid({ slices: clampSlices(v ?? 1) })}
          />
          <SelectField
            label={t('prostate.setup.sectors')}
            value={String(grid.sectors)}
            onChange={(v) => setGrid({ sectors: Number(v) as SectorCount })}
            options={SECTOR_COUNTS.map((n) => ({
              value: String(n),
              label: `${n} — ${sectorsOf(n)
                .map((s) => s.id)
                .join(', ')}`,
            }))}
          />
          <NumField
            label={t('prostate.setup.apex')}
            value={grid.apexCassettes}
            min={0}
            max={8}
            onChange={(v) => setGrid({ apexCassettes: clampCone(v ?? 0) })}
            hint={t('prostate.setup.coneHint')}
          />
          <NumField
            label={t('prostate.setup.base')}
            value={grid.baseCassettes}
            min={0}
            max={8}
            onChange={(v) => setGrid({ baseCassettes: clampCone(v ?? 0) })}
          />
          <SelectField
            label={t('prostate.setup.numbering')}
            value={grid.numbering}
            onChange={(v) => setGrid({ numbering: v as GridConfig['numbering'] })}
            options={[
              { value: 'bySlice', label: t('prostate.setup.bySlice') },
              { value: 'bySector', label: t('prostate.setup.bySector') },
            ]}
          />
          <SelectField
            label={t('prostate.setup.sliceOrder')}
            value={grid.sliceOrder}
            onChange={(v) => setGrid({ sliceOrder: v as GridConfig['sliceOrder'] })}
            options={[
              { value: 'apexToBase', label: t('prostate.setup.apexToBase') },
              { value: 'baseToApex', label: t('prostate.setup.baseToApex') },
            ]}
          />
        </div>

        <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
          <Toggle checked={editLabels} onChange={onEditLabels} label={t('prostate.setup.editLabels')} />
          {hasCustomLabels && (
            <button
              type="button"
              onClick={() => setGrid({ labels: {} })}
              className="text-xs text-ink-muted underline-offset-2 hover:text-ink hover:underline"
            >
              {t('prostate.setup.resetLabels')}
            </button>
          )}
          {duplicates.length > 0 && (
            <span className="text-xs text-danger">{t('prostate.setup.duplicates', { labels: duplicates.join(', ') })}</span>
          )}
        </div>

        <div className="border-t border-line pt-5">
          <h3 className="text-sm font-semibold tracking-tight text-ink">{t('prostate.setup.templates')}</h3>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <div className="space-y-1.5">
              <label htmlFor="prostate-tpl" className="block text-sm font-medium text-ink">
                {t('prostate.setup.applyTemplate')}
              </label>
              <select id="prostate-tpl" value={picked} onChange={(e) => applyTemplate(e.target.value)} className={selectClass}>
                <option value="">—</option>
                <optgroup label={t('prostate.setup.builtin')}>
                  {BUILTIN_TEMPLATES.map((tpl, i) => (
                    <option key={tpl.name} value={`b:${i}`}>
                      {tpl.name}
                    </option>
                  ))}
                </optgroup>
                {templates.length > 0 && (
                  <optgroup label={t('prostate.setup.saved')}>
                    {templates.map((tpl, i) => (
                      <option key={tpl.name} value={`u:${i}`}>
                        {tpl.name}
                      </option>
                    ))}
                  </optgroup>
                )}
              </select>
            </div>
            <div className="space-y-1.5">
              <label htmlFor="prostate-tpl-name" className="block text-sm font-medium text-ink">
                {t('prostate.setup.saveTemplate')}
              </label>
              <div className="flex gap-2">
                <input
                  id="prostate-tpl-name"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') save()
                  }}
                  placeholder={t('prostate.setup.templateName')}
                  className="h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-faint hover:border-line-strong"
                />
                <Button type="button" size="sm" variant="secondary" onClick={save} disabled={!templateName.trim()}>
                  <Save className="size-4" aria-hidden />
                </Button>
              </div>
            </div>
          </div>
          {templates.length > 0 && (
            <ul className="mt-3 flex flex-wrap gap-2">
              {templates.map((tpl) => (
                <li
                  key={tpl.name}
                  className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface py-0.5 pr-1 pl-2.5 text-xs text-ink-muted"
                >
                  {tpl.name}
                  <button
                    type="button"
                    onClick={() => onDeleteTemplate(tpl.name)}
                    aria-label={t('prostate.setup.deleteTemplate', { name: tpl.name })}
                    className="rounded-full p-0.5 hover:bg-raised hover:text-danger"
                  >
                    <Trash2 className="size-3.5" aria-hidden />
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  )
}
