import { useTranslation } from 'react-i18next'
import { Microscope, MonitorPlay } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Setting } from '../flow'

interface SettingPickerProps {
  value: Setting | null
  onChange: (setting: Setting) => void
}

/** A primeira pergunta, em duas caixas grandes: onde você está laudando? */
export function SettingPicker({ value, onChange }: SettingPickerProps) {
  const { t } = useTranslation()
  const options: { id: Setting; icon: typeof Microscope }[] = [
    { id: 'microscope', icon: Microscope },
    { id: 'tele', icon: MonitorPlay },
  ]
  return (
    <div role="radiogroup" aria-label={t('fov.settingLabel')} className="grid gap-3 sm:grid-cols-2">
      {options.map(({ id, icon: Icon }) => {
        const active = value === id
        return (
          <button
            key={id}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(id)}
            className={cn(
              'flex items-start gap-4 rounded-xl border-2 px-5 py-5 text-left transition-colors',
              active ? 'border-accent bg-accent-soft' : 'border-line bg-surface hover:border-line-strong',
            )}
          >
            <span
              className={cn(
                'flex size-12 shrink-0 items-center justify-center rounded-lg',
                active ? 'bg-accent text-white' : 'bg-raised text-ink-muted',
              )}
            >
              <Icon className="size-6" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className={cn('block text-lg font-semibold tracking-tight', active ? 'text-accent-ink' : 'text-ink')}>
                {t(`fov.setting.${id}.name`)}
              </span>
              <span className="mt-0.5 block text-sm leading-relaxed text-ink-muted">{t(`fov.setting.${id}.hint`)}</span>
            </span>
          </button>
        )
      })}
    </div>
  )
}
