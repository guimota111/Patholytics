import { useTranslation } from 'react-i18next'
import { AlertTriangle, Trash2 } from 'lucide-react'
import { BLOCK_BY_ID, computeBlock, num, numList, syncPerUnit, text, visibleFields, type BlockId, type Params } from '../blocks'
import { shortCode } from '../codes'
import { ChoiceRow, Stepper } from './controls'

export function BlockCard({
  blockId,
  params,
  onChange,
  onRemove,
}: {
  blockId: BlockId
  params: Params
  onChange: (params: Params) => void
  onRemove: () => void
}) {
  const { t } = useTranslation()
  const block = BLOCK_BY_ID[blockId]
  const Icon = block.icon
  const computed = computeBlock(blockId, params)

  const set = (patch: Params) => onChange(syncPerUnit(blockId, { ...params, ...patch }))

  return (
    <section className="rounded-xl border-2 border-line bg-elevated shadow-card">
      <header className="flex items-start justify-between gap-3 border-b border-line px-4 py-3 sm:px-5">
        <h3 className="flex items-center gap-2.5 text-base font-semibold tracking-tight text-ink">
          <Icon className="size-5 text-accent" aria-hidden />
          {block.label}
        </h3>
        <button
          type="button"
          onClick={onRemove}
          aria-label={t('billing.removeBlock')}
          className="rounded-md p-1.5 text-ink-faint transition-colors hover:bg-danger-soft hover:text-danger"
        >
          <Trash2 className="size-4" aria-hidden />
        </button>
      </header>

      <div className="space-y-4 px-4 py-4 sm:px-5">
        {visibleFields(block, params).map((f) => {
          if (f.kind === 'choice')
            return (
              <div key={f.key}>
                <p className="mb-2 text-sm font-medium text-ink">{f.label}</p>
                <ChoiceRow value={text(params, f.key) || f.default} options={f.options} onChange={(v) => set({ [f.key]: v })} />
              </div>
            )
          if (f.kind === 'toggle')
            return (
              <div key={f.key}>
                <p className="mb-2 text-sm font-medium text-ink">{f.label}</p>
                <ChoiceRow
                  value={String(num(params, f.key))}
                  options={[
                    { value: '0', label: f.no },
                    { value: '1', label: f.yes },
                  ]}
                  onChange={(v) => set({ [f.key]: Number(v) })}
                />
              </div>
            )
          if (f.kind === 'perUnit') {
            const list = numList(params, f.key)
            if (!list.length) return null
            return (
              <div key={f.key}>
                <p className="mb-2 text-sm font-medium text-ink">{f.label}</p>
                <div className="flex flex-wrap gap-3">
                  {list.map((v, i) => (
                    <label key={i} className="flex items-center gap-2 rounded-lg border border-line bg-surface px-3 py-2 text-xs text-ink-muted">
                      {f.itemLabel} {i + 1}
                      <Stepper
                        value={v}
                        onChange={(next) => set({ [f.key]: list.map((old, j) => (j === i ? next : old)) })}
                        min={1}
                        max={40}
                        label={`${f.itemLabel} ${i + 1}`}
                        size="sm"
                      />
                    </label>
                  ))}
                </div>
              </div>
            )
          }
          return (
            <div key={f.key} className="flex flex-wrap items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium text-ink">{f.label}</p>
                {f.hint && <p className="mt-0.5 text-xs leading-relaxed text-ink-faint">{f.hint}</p>}
              </div>
              <Stepper
                value={num(params, f.key, f.default)}
                onChange={(v) => set({ [f.key]: v })}
                min={f.min ?? 0}
                max={f.max ?? 99}
                label={f.label}
              />
            </div>
          )
        })}

        {computed.warnings.map((w, i) => (
          <p key={i} className="flex items-start gap-1.5 rounded-md border border-danger/40 bg-danger-soft px-3 py-2 text-xs leading-relaxed text-danger">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            {w}
          </p>
        ))}
      </div>

      <footer className="border-t border-line px-4 py-3 sm:px-5">
        <p className="tabular text-sm font-semibold text-accent-ink">
          {computed.items.length ? computed.items.map((l) => `${shortCode(l.code)} ×${l.qty}`).join('  +  ') : '—'}
        </p>
      </footer>
    </section>
  )
}
