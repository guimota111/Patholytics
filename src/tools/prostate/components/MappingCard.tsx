import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Plus, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { MoreSection } from '@/components/ui/didactic'
import { cn } from '@/lib/cn'
import {
  BUILTIN_TEMPLATES,
  buildCells,
  clampTotal,
  groupColor,
  makeGroup,
  splitEvenly,
  type MappingWarnings,
} from '../mapping'
import {
  LEVELS,
  REGIONS,
  SIDES,
  TISSUES,
  type CassetteGroup,
  type MappingConfig,
  type MappingTemplate,
} from '../types'
import { compactLabels } from '../format'
import { compactInputClass } from './fields'

interface MappingCardProps {
  mapping: MappingConfig
  setMapping: (patch: Partial<MappingConfig> | ((m: MappingConfig) => MappingConfig)) => void
  templates: MappingTemplate[]
  onSaveTemplate: (name: string, mapping: MappingConfig) => void
  onDeleteTemplate: (name: string) => void
}

const selectSm =
  'h-9 w-full rounded-md border border-line bg-surface px-2 text-sm text-ink transition-colors hover:border-line-strong'

export function MappingCard({ mapping, setMapping, templates, onSaveTemplate, onDeleteTemplate }: MappingCardProps) {
  const { t } = useTranslation()
  const [templateName, setTemplateName] = useState('')
  const [picked, setPicked] = useState('')

  const { cells, warnings } = useMemo(() => buildCells(mapping), [mapping])
  const groupIndex = new Map(mapping.groups.map((g, i) => [g.id, i]))

  const updateGroup = (id: string, patch: Partial<CassetteGroup>) =>
    setMapping((m) => ({ ...m, groups: m.groups.map((g) => (g.id === id ? { ...g, ...patch } : g)) }))
  const removeGroup = (id: string) => setMapping((m) => ({ ...m, groups: m.groups.filter((g) => g.id !== id) }))
  const addGroup = () =>
    setMapping((m) => {
      // Sugere a próxima faixa livre.
      const used = new Set(buildCells(m).cells.filter((c) => c.group).map((c) => c.number))
      const free = Array.from({ length: m.total }, (_, i) => i + 1).filter((n) => !used.has(n))
      const range = free.length ? compactLabels(free.slice(0, Math.min(free.length, 4)).map(String)) : ''
      return { ...m, groups: [...m.groups, makeGroup({ name: '', range })] }
    })
  const splitInto = (n: number) =>
    setMapping((m) => {
      // Mantém nome/lado/região dos grupos existentes; só refaz as faixas.
      const ranges = splitEvenly(m.total, n)
      return {
        ...m,
        groups: ranges.map((range, i) => {
          const prev = m.groups[i]
          return prev ? { ...prev, range } : makeGroup({ name: '', range })
        }),
      }
    })

  const applyTemplate = (key: string) => {
    setPicked(key)
    if (!key) return
    const [kind, idx] = key.split(':')
    const source = kind === 'b' ? BUILTIN_TEMPLATES : templates
    const tpl = source[Number(idx)]
    if (tpl) setMapping(() => ({ total: tpl.mapping.total, groups: tpl.mapping.groups.map((g) => ({ ...g })) }))
  }

  const save = () => {
    const name = templateName.trim()
    if (!name) return
    onSaveTemplate(name, mapping)
    setTemplateName('')
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end gap-4">
        <div className="space-y-1.5">
          <label htmlFor="prostate-total" className="block text-sm font-medium text-ink">
            {t('prostate.mapping.total')}
          </label>
          <input
            id="prostate-total"
            type="number"
            inputMode="numeric"
            min={1}
            max={200}
            value={mapping.total}
            onChange={(e) => setMapping({ total: clampTotal(Number(e.target.value)) })}
            className="tabular h-12 w-28 rounded-lg border-2 border-line bg-surface px-3 text-center text-lg font-semibold text-ink hover:border-line-strong focus:border-accent"
          />
        </div>
        <div className="space-y-1.5">
          <label htmlFor="prostate-tpl" className="block text-sm font-medium text-ink">
            {t('prostate.mapping.applyTemplate')}
          </label>
          <select id="prostate-tpl" value={picked} onChange={(e) => applyTemplate(e.target.value)} className={cn(selectSm, 'h-12 w-auto min-w-64 rounded-lg border-2 text-base')}>
            <option value="">—</option>
            <optgroup label={t('prostate.mapping.builtin')}>
              {BUILTIN_TEMPLATES.map((tpl, i) => (
                <option key={tpl.name} value={`b:${i}`}>
                  {tpl.name}
                </option>
              ))}
            </optgroup>
            {templates.length > 0 && (
              <optgroup label={t('prostate.mapping.saved')}>
                {templates.map((tpl, i) => (
                  <option key={tpl.name} value={`u:${i}`}>
                    {tpl.name}
                  </option>
                ))}
              </optgroup>
            )}
          </select>
        </div>
      </div>

      {/* Régua: um quadradinho por cassete, na cor do grupo. */}
      <div>
        <p className="mb-1.5 text-xs font-medium text-ink-muted">{t('prostate.mapping.ruler')}</p>
        <div className="flex flex-wrap gap-1">
          {cells.map((c) => {
            const idx = c.group ? groupIndex.get(c.group.id)! : -1
            return (
              <span
                key={c.id}
                title={c.group ? `${c.label} · ${c.group.name}` : `${c.label} · ${t('prostate.unmappedGroup')}`}
                className={cn(
                  'tabular flex size-7 items-center justify-center rounded text-[0.7rem] font-semibold',
                  idx < 0 ? 'border border-dashed border-line-strong text-ink-faint' : 'text-white',
                )}
                style={idx >= 0 ? { background: groupColor(idx) } : undefined}
              >
                {c.label}
              </span>
            )
          })}
        </div>
        <MappingWarningsList warnings={warnings} groups={mapping.groups} />
      </div>

      {/* Editor dos grupos. */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[840px] text-sm">
          <thead className="text-xs tracking-wider text-ink-faint uppercase">
            <tr className="border-b border-line">
              <th className="w-8 py-2" />
              <th className="px-2 py-2 text-left font-medium">{t('prostate.mapping.name')}</th>
              <th className="px-2 py-2 text-left font-medium">{t('prostate.mapping.range')}</th>
              <th className="px-2 py-2 text-left font-medium">{t('prostate.mapping.side')}</th>
              <th className="px-2 py-2 text-left font-medium">{t('prostate.mapping.region')}</th>
              <th className="px-2 py-2 text-left font-medium">{t('prostate.mapping.level')}</th>
              <th className="px-2 py-2 text-left font-medium">{t('prostate.mapping.tissue')}</th>
              <th className="w-10 py-2" />
            </tr>
          </thead>
          <tbody>
            {mapping.groups.map((g, i) => {
              const isProstate = g.tissue === 'prostate'
              return (
                <tr key={g.id} className="border-b border-line/70">
                  <td className="py-1.5 pl-1">
                    <span className="inline-block size-4 rounded" style={{ background: groupColor(i) }} aria-hidden />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      value={g.name}
                      onChange={(e) => updateGroup(g.id, { name: e.target.value })}
                      placeholder={t('prostate.mapping.namePlaceholder')}
                      className={cn(compactInputClass, 'min-w-44 font-sans')}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <input
                      value={g.range}
                      onChange={(e) => updateGroup(g.id, { range: e.target.value })}
                      placeholder="1-8"
                      className={cn(compactInputClass, 'w-28')}
                    />
                  </td>
                  <td className="px-2 py-1.5">
                    <select value={g.side} onChange={(e) => updateGroup(g.id, { side: e.target.value as CassetteGroup['side'] })} className={selectSm}>
                      {SIDES.map((s) => (
                        <option key={s} value={s}>
                          {t(`prostate.sideLong.${s}`)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-1.5">
                    <select
                      value={g.region}
                      onChange={(e) => updateGroup(g.id, { region: e.target.value as CassetteGroup['region'] })}
                      className={selectSm}
                      disabled={!isProstate}
                    >
                      {REGIONS.map((r) => (
                        <option key={r} value={r}>
                          {t(`prostate.region.${r}`)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-1.5">
                    <select
                      value={g.level}
                      onChange={(e) => updateGroup(g.id, { level: e.target.value as CassetteGroup['level'] })}
                      className={selectSm}
                      disabled={!isProstate}
                    >
                      {LEVELS.map((l) => (
                        <option key={l} value={l}>
                          {t(`prostate.level.${l}`)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-1.5">
                    <select value={g.tissue} onChange={(e) => updateGroup(g.id, { tissue: e.target.value as CassetteGroup['tissue'] })} className={selectSm}>
                      {TISSUES.map((x) => (
                        <option key={x} value={x}>
                          {t(`prostate.tissue.${x}`)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="py-1.5 pr-1 text-right">
                    <button
                      type="button"
                      onClick={() => removeGroup(g.id)}
                      className="rounded p-1.5 text-ink-faint hover:bg-danger-soft hover:text-danger"
                      aria-label={t('prostate.mapping.deleteGroup')}
                    >
                      <Trash2 className="size-4" aria-hidden />
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" size="sm" variant="secondary" onClick={addGroup}>
          <Plus className="size-4" aria-hidden />
          {t('prostate.mapping.addGroup')}
        </Button>
        <span className="text-xs text-ink-faint">{t('prostate.mapping.splitLabel')}</span>
        {[2, 4, 6, 8].map((n) => (
          <button
            key={n}
            type="button"
            onClick={() => splitInto(n)}
            className="tabular rounded-full border border-line bg-surface px-2.5 py-0.5 text-xs text-ink-muted hover:border-line-strong hover:text-ink"
          >
            {n}
          </button>
        ))}
      </div>

      <MoreSection label={t('prostate.mapping.templates')}>
        <div className="flex flex-wrap items-end gap-3">
          <div className="min-w-64 flex-1 space-y-1.5">
            <label htmlFor="prostate-tpl-name" className="block text-sm font-medium text-ink">
              {t('prostate.mapping.saveTemplate')}
            </label>
            <div className="flex gap-2">
              <input
                id="prostate-tpl-name"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') save()
                }}
                placeholder={t('prostate.mapping.templateName')}
                className="h-9 w-full rounded-md border border-line bg-elevated px-3 text-sm text-ink placeholder:text-ink-faint hover:border-line-strong"
              />
              <Button type="button" size="sm" variant="secondary" onClick={save} disabled={!templateName.trim()}>
                <Save className="size-4" aria-hidden />
                {t('common.save')}
              </Button>
            </div>
          </div>
        </div>
        {templates.length > 0 && (
          <ul className="flex flex-wrap gap-2">
            {templates.map((tpl) => (
              <li
                key={tpl.name}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-elevated py-0.5 pr-1 pl-2.5 text-xs text-ink-muted"
              >
                {tpl.name}
                <button
                  type="button"
                  onClick={() => onDeleteTemplate(tpl.name)}
                  aria-label={t('prostate.mapping.deleteTemplate', { name: tpl.name })}
                  className="rounded-full p-0.5 hover:bg-raised hover:text-danger"
                >
                  <Trash2 className="size-3.5" aria-hidden />
                </button>
              </li>
            ))}
          </ul>
        )}
      </MoreSection>
    </div>
  )
}

function MappingWarningsList({ warnings, groups }: { warnings: MappingWarnings; groups: CassetteGroup[] }) {
  const { t } = useTranslation()
  const lines: string[] = []
  if (warnings.unmapped.length) lines.push(t('prostate.mapping.warnUnmapped', { cells: compactLabels(warnings.unmapped.map(String)) }))
  if (warnings.conflicts.length) lines.push(t('prostate.mapping.warnConflicts', { cells: compactLabels(warnings.conflicts.map(String)) }))
  for (const w of warnings.invalidRanges) {
    const g = groups.find((x) => x.id === w.groupId)
    lines.push(t('prostate.mapping.warnInvalid', { name: g?.name || '?', range: w.range }))
  }
  if (!lines.length) return null
  return (
    <ul className="mt-2 space-y-1">
      {lines.map((l, i) => (
        <li key={i} className="flex items-start gap-1.5 text-xs text-danger">
          <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
          {l}
        </li>
      ))}
    </ul>
  )
}
