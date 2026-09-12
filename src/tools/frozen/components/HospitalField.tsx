import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Frozen } from '../useFrozen'

const inputClass = 'h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-faint hover:border-line-strong'

interface HospitalFieldProps {
  value: string
  onChange: (value: string) => void
  frozen: Frozen
}

/**
 * Nenhum hospital vem de fábrica: o usuário escreve o nome, e cada um que já
 * usou vira um chip para o próximo laudo. O x tira da lista.
 */
export function HospitalField({ value, onChange, frozen }: HospitalFieldProps) {
  const { t } = useTranslation()
  const known = frozen.suggestions('hospital')

  return (
    <div className="block">
      <label className="block">
        <span className="block text-sm font-medium text-ink">{t('frozen.cong.hospital')}</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onBlur={(e) => frozen.remember('hospital', e.target.value)}
          list="frozen-hospital"
          autoComplete="off"
          placeholder={t('frozen.cong.hospitalPlaceholder')}
          className={cn(inputClass, 'mt-1.5')}
        />
        <datalist id="frozen-hospital">
          {known.map((s) => (
            <option key={s} value={s} />
          ))}
        </datalist>
      </label>
      {known.length > 0 ? (
        <ul className="mt-1.5 flex flex-wrap gap-1">
          {known.map((name) => (
            <li key={name} className="inline-flex items-center overflow-hidden rounded-full border border-line bg-surface text-xs">
              <button
                type="button"
                onClick={() => onChange(name)}
                className={cn('px-2 py-0.5 transition-colors hover:text-ink', value === name ? 'font-medium text-accent-ink' : 'text-ink-muted')}
              >
                {name}
              </button>
              <button
                type="button"
                onClick={() => frozen.forget('hospital', name)}
                aria-label={t('frozen.cong.hospitalForget', { name })}
                title={t('frozen.cong.hospitalForget', { name })}
                className="border-l border-line px-1.5 py-0.5 text-ink-faint transition-colors hover:bg-raised hover:text-danger"
              >
                <X className="size-3" aria-hidden />
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <span className="mt-1 block text-xs text-ink-faint">{t('frozen.cong.hospitalHint')}</span>
      )}
    </div>
  )
}
