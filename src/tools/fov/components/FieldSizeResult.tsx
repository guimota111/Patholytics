import { useTranslation } from 'react-i18next'
import { ScrollX } from '@/components/ui/ScrollX'
import { cn } from '@/lib/cn'
import { REFERENCE_FIELDS, type FieldRef } from '../flow'
import { OBJECTIVES, areaOfDiameter, fieldArea, fieldDiameter, fieldsToCover, fmt, type MicroscopeConfig } from '../optics'

interface FieldSizeResultProps {
  config: MicroscopeConfig
  field: FieldRef
}

/** "Quanto mede o meu campo": a tabela com todas as objetivas e a comparação com os campos de referência. */
export function FieldSizeResult({ config, field }: FieldSizeResultProps) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  return (
    <div className="space-y-4">
      <ScrollX>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-line text-left text-xs tracking-wider text-ink-faint uppercase">
              <th className="py-2 pr-3 font-medium">{t('fov.colObjective')}</th>
              <th className="py-2 pr-3 font-medium">{t('fov.colDiameter')}</th>
              <th className="py-2 pr-3 font-medium">{t('fov.colArea')}</th>
              <th className="py-2 pr-3 font-medium">{t('fov.colPerMm2')}</th>
              <th className="py-2 pr-3 font-medium">{t('fov.colPer2Mm2')}</th>
              <th className="py-2 font-medium">{t('fov.colTen')}</th>
            </tr>
          </thead>
          <tbody className="tabular">
            {OBJECTIVES.map((o) => {
              const od = fieldDiameter(config, o)
              const oa = fieldArea(config, o)
              const p1 = fieldsToCover(1, oa)
              const p2 = fieldsToCover(2, oa)
              return (
                <tr key={o} className={cn('border-b border-line/60', o === field.objective && 'bg-accent-soft/40 font-semibold')}>
                  <td className="py-2 pr-3 text-ink">
                    {o}× <span className="font-normal text-ink-faint">({o * 10}×)</span>
                  </td>
                  <td className="py-2 pr-3 text-ink">{fmt(od, 3, lang)} mm</td>
                  <td className="py-2 pr-3 text-ink">{fmt(oa, 3, lang)} mm²</td>
                  <td className="py-2 pr-3 text-ink">
                    {p1.rounded} <span className="font-normal text-ink-faint">({fmt(p1.exact, 1, lang)})</span>
                  </td>
                  <td className="py-2 pr-3 text-ink">
                    {p2.rounded} <span className="font-normal text-ink-faint">({fmt(p2.exact, 1, lang)})</span>
                  </td>
                  <td className="py-2 text-ink">{fmt(oa * 10, 2, lang)} mm²</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </ScrollX>
      <p className="text-xs leading-relaxed text-ink-faint">{t('fov.formula')}</p>

      <div>
        <p className="text-sm font-medium text-ink">{t('fov.compareTitle', { objective: field.objective })}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {REFERENCE_FIELDS.map((r) => {
            const ratio = field.area / areaOfDiameter(r.diameter)
            return (
              <span key={r.id} className="tabular rounded-full border border-line bg-elevated px-3 py-1 text-sm text-ink">
                {t('fov.compareChip', { diameter: fmt(r.diameter, 3, lang), label: r.label, ratio: fmt(ratio, 2, lang) })}
              </span>
            )
          })}
        </div>
        <p className="mt-2 text-xs leading-relaxed text-ink-faint">{t('fov.compareHint')}</p>
      </div>
    </div>
  )
}
