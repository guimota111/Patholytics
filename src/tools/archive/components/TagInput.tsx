import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { X } from 'lucide-react'

interface TagInputProps {
  tags: string[]
  onChange: (tags: string[]) => void
  suggestions: string[]
}

/** Chips + campo; Enter ou vírgula adiciona. Sugere tags já usadas no arquivo. */
export function TagInput({ tags, onChange, suggestions }: TagInputProps) {
  const { t } = useTranslation()
  const [draft, setDraft] = useState('')

  const add = (raw: string) => {
    const value = raw.trim().replace(/^#/, '')
    if (value && !tags.some((x) => x.toLowerCase() === value.toLowerCase())) onChange([...tags, value])
    setDraft('')
  }

  const remaining = suggestions.filter(
    (s) => !tags.some((x) => x.toLowerCase() === s.toLowerCase()) && (!draft || s.toLowerCase().includes(draft.toLowerCase())),
  )

  return (
    <div className="space-y-2">
      {tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1 rounded-full border border-accent/35 bg-accent-soft py-0.5 pr-1 pl-2.5 text-xs text-accent-ink"
            >
              #{tag}
              <button
                type="button"
                onClick={() => onChange(tags.filter((x) => x !== tag))}
                className="rounded-full p-0.5 hover:bg-accent/20"
                aria-label={t('archive.dialog.removeTag', { tag })}
              >
                <X className="size-3" aria-hidden />
              </button>
            </span>
          ))}
        </div>
      )}
      <input
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ',') {
            e.preventDefault()
            add(draft)
          }
        }}
        onBlur={() => add(draft)}
        placeholder={t('archive.dialog.tagPlaceholder')}
        className="h-9 w-full rounded-md border border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-faint hover:border-line-strong"
      />
      {remaining.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {remaining.slice(0, 12).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => add(s)}
              className="rounded-full border border-line bg-surface px-2 py-0.5 text-xs text-ink-muted hover:border-line-strong hover:text-ink"
            >
              #{s}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
