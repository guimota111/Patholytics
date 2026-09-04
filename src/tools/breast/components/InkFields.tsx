import { useTranslation } from 'react-i18next'
import { Check, Save, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { cn } from '@/lib/cn'
import { INK_HEX, inkText } from '../inks'
import { INKS, MARGINS, type InkColor, type Margin } from '../types'

interface InkFieldsProps {
  inks: Record<Margin, InkColor>
  onChange: (margin: Margin, ink: InkColor) => void
  /** Padrão do laboratório salvo por este usuário (null = nenhum). */
  defaults?: Record<Margin, InkColor> | null
  onSaveDefaults?: () => void
  onApplyDefaults?: () => void
  onClearDefaults?: () => void
}

/** Uma fileira por margem, um chip por tinta. As mesmas cores pintam o 3D e o pad de posição. */
export function InkFields({ inks, onChange, defaults, onSaveDefaults, onApplyDefaults, onClearDefaults }: InkFieldsProps) {
  const { t } = useTranslation()
  const isDefault = defaults ? MARGINS.every((m) => defaults[m] === inks[m]) : false

  return (
    <div className="space-y-4">
      <div className="grid gap-2 sm:grid-cols-2">
        {MARGINS.map((m) => (
          <div key={m} className="flex flex-wrap items-center gap-3 rounded-md border border-line bg-surface px-3 py-2">
            <span className="w-24 shrink-0 text-sm font-medium text-ink">{t(`breast.margin.${m}`)}</span>
            <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label={t(`breast.margin.${m}`)}>
              {INKS.map((ink) => {
                const active = inks[m] === ink
                return (
                  <button
                    key={ink}
                    type="button"
                    role="radio"
                    aria-checked={active}
                    title={t(`breast.ink.${ink}`)}
                    onClick={() => onChange(m, ink)}
                    className={cn(
                      'flex size-8 items-center justify-center rounded-full border-2 transition-transform',
                      active ? 'scale-110 border-accent shadow-subtle' : 'border-transparent hover:scale-105',
                      ink === 'none' && 'border-dashed border-line-strong',
                    )}
                    style={{ background: INK_HEX[ink] }}
                  >
                    {active && <Check className="size-4" style={{ color: inkText(ink) }} aria-hidden />}
                  </button>
                )
              })}
            </div>
            <span className="ml-auto text-xs text-ink-faint">{t(`breast.ink.${inks[m]}`)}</span>
          </div>
        ))}
      </div>

      {onSaveDefaults && (
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" size="sm" variant="secondary" onClick={onSaveDefaults} disabled={isDefault}>
            <Save className="size-4" aria-hidden />
            {t(isDefault ? 'breast.inks.savedDefault' : 'breast.inks.saveDefault')}
          </Button>
          {defaults && !isDefault && onApplyDefaults && (
            <Button type="button" size="sm" variant="ghost" onClick={onApplyDefaults}>
              {t('breast.inks.useDefault')}
            </Button>
          )}
          {defaults && onClearDefaults && (
            <Button type="button" size="sm" variant="ghost" onClick={onClearDefaults}>
              <Trash2 className="size-4" aria-hidden />
              {t('breast.inks.resetDefault')}
            </Button>
          )}
          <span className="text-xs text-ink-faint">{t('breast.inks.hint')}</span>
        </div>
      )}
    </div>
  )
}
