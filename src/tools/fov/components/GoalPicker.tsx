import { useTranslation } from 'react-i18next'
import { cn } from '@/lib/cn'
import { MICROSCOPE_GOALS, TELE_GOALS, type Goal, type Setting } from '../flow'

interface GoalPickerProps {
  setting: Setting
  value: Goal | null
  onChange: (goal: Goal) => void
}

/** O que você quer saber? As opções mudam com o lugar onde se lauda. */
export function GoalPicker({ setting, value, onChange }: GoalPickerProps) {
  const { t } = useTranslation()
  const goals: Goal[] = setting === 'microscope' ? MICROSCOPE_GOALS : TELE_GOALS
  return (
    <div role="radiogroup" aria-label={t('fov.goalLabel')} className="grid gap-2 sm:grid-cols-3">
      {goals.map((goal) => {
        const active = value === goal
        return (
          <button
            key={goal}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(goal)}
            className={cn(
              'rounded-lg border-2 px-4 py-3 text-left transition-colors',
              active ? 'border-accent bg-accent-soft' : 'border-line bg-surface hover:border-line-strong',
            )}
          >
            <span className={cn('block text-base font-semibold', active ? 'text-accent-ink' : 'text-ink')}>
              {t(`fov.goal.${setting}.${goal}.name`)}
            </span>
            <span className="mt-0.5 block text-xs leading-relaxed text-ink-muted">{t(`fov.goal.${setting}.${goal}.hint`)}</span>
          </button>
        )
      })}
    </div>
  )
}
