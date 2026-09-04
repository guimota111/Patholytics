import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import type { Analysis } from '../analysis'
import { cellColor, EPE_HEX, MARGIN_HEX, PATTERN_HEX, type Theme } from '../heat'
import { groupColor } from '../mapping'
import type { MappingConfig } from '../types'

interface CassetteMapProps {
  mapping: MappingConfig
  analysis: Analysis
  theme: Theme
  selected: string | null
  onSelect: (id: string | null) => void
}

/**
 * Mapa 2D: uma tira por grupo, um quadrado por cassete (do ápice para a
 * base), colorido pelo padrão predominante e intensidade de tumor. Margem
 * comprometida = borda vermelha; EEP = ponto roxo.
 */
export function CassetteMap({ mapping, analysis, theme, selected, onSelect }: CassetteMapProps) {
  const { t } = useTranslation()
  const byGroup = new Map<string, typeof analysis.cells>()
  for (const c of analysis.cells) {
    const key = c.cell.group?.id ?? '__unmapped'
    const list = byGroup.get(key)
    if (list) list.push(c)
    else byGroup.set(key, [c])
  }
  const rows: { key: string; name: string; color: string; meta: string; span: string | null; cells: typeof analysis.cells }[] = mapping.groups.map(
    (g, i) => ({
      key: g.id,
      span: g.tissue === 'prostate' && (g.span === 'apexToBase' || g.span === 'baseToApex') ? g.span : null,
      name: g.name || t('prostate.mapping.namePlaceholder'),
      color: groupColor(i),
      meta: [
        g.side !== 'B' ? t(`prostate.side.${g.side}`) : '',
        g.tissue === 'prostate' && g.region !== 'whole' ? t(`prostate.region.${g.region}`) : '',
        g.tissue === 'prostate' ? t(`prostate.span.${g.span}`) : '',
        g.tissue !== 'prostate' ? t(`prostate.tissue.${g.tissue}`) : '',
      ]
        .filter(Boolean)
        .join(' · '),
      cells: byGroup.get(g.id) ?? [],
    }),
  )
  const unmapped = byGroup.get('__unmapped')
  if (unmapped?.length) rows.push({ key: '__unmapped', name: t('prostate.unmappedGroup'), color: 'var(--color-ink-faint)', meta: '', span: null, cells: unmapped })

  return (
    <div>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.key} className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <div className="flex w-56 shrink-0 items-center gap-2">
              <span className="inline-block size-3 shrink-0 rounded-sm" style={{ background: row.color }} aria-hidden />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-ink">{row.name}</p>
                {row.meta && <p className="truncate text-xs text-ink-faint">{row.meta}</p>}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5">
              {row.cells.map((r) => {
                const isSel = selected === r.cell.id
                return (
                  <button
                    key={r.cell.id}
                    type="button"
                    onClick={() => onSelect(isSel ? null : r.cell.id)}
                    title={`${t('prostate.cassetteN', { n: r.cell.label })} · ${r.tumor}%`}
                    className={cn(
                      'tabular relative flex size-9 items-center justify-center rounded-md text-xs font-semibold transition-shadow',
                      isSel ? 'ring-2 ring-accent ring-offset-2 ring-offset-elevated' : 'ring-1 ring-line',
                      r.tumor > 0 ? 'text-neutral-900' : 'text-ink-muted',
                    )}
                    style={{
                      background: cellColor(r.worst, r.tumor, theme),
                      boxShadow: r.data.margin ? `inset 0 0 0 3px ${MARGIN_HEX}` : undefined,
                    }}
                  >
                    {r.cell.label}
                    {r.data.epe !== 'none' && (
                      <span
                        className="absolute -top-1 -right-1 size-3 rounded-full border-2 border-elevated"
                        style={{ background: EPE_HEX }}
                        aria-hidden
                      />
                    )}
                  </button>
                )
              })}
              {row.cells.length > 1 && row.span !== null && (
                <span className="ml-1 text-[0.65rem] text-ink-faint">{t(row.span === 'baseToApex' ? 'prostate.map.baseToApex' : 'prostate.map.apexToBase')}</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-ink-faint">
        {([3, 4, 5] as const).map((p) => (
          <span key={p} className="inline-flex items-center gap-1.5">
            <span className="inline-block size-3 rounded-sm" style={{ background: PATTERN_HEX[p] }} />
            {t('prostate.map.legendPattern', { p })}
          </span>
        ))}
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block size-3 rounded-sm" style={{ boxShadow: `inset 0 0 0 2px ${MARGIN_HEX}` }} />
          {t('prostate.map.legendMargin')}
        </span>
        <span className="inline-flex items-center gap-1.5">
          <span className="inline-block size-2.5 rounded-full" style={{ background: EPE_HEX }} />
          {t('prostate.map.legendEpe')}
        </span>
      </div>
    </div>
  )
}
