import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AlertTriangle, Plus, RotateCcw, Star, Trash2, X } from 'lucide-react'
import { cn } from '@/lib/cn'
import { pieceLines, type CasePiece, type CaseStructure } from '../case'
import { CODES, shortCode } from '../codes'
import { BASES, SPECIMEN_BY_ID, type StructureKind } from '../specimens'
import { CheckRow, Stepper } from './controls'

interface PieceCardProps {
  piece: CasePiece
  hasTemplate: boolean
  onFlasks: (n: number) => void
  onToggle: (structureId: string) => void
  onNodes: (structureId: string, nodes: number) => void
  onAddStructure: (structure: CaseStructure) => void
  onRemoveStructure: (structureId: string) => void
  onRemove: () => void
  onSaveTemplate: () => void
  onResetTemplate: () => void
}

const GROUPS: { kind: StructureKind; titleKey: string }[] = [
  { kind: 'margin', titleKey: 'billing.margins' },
  { kind: 'extra', titleKey: 'billing.extras' },
  { kind: 'nodes', titleKey: 'billing.nodes' },
]

let customSeq = 0

export function PieceCard({
  piece,
  hasTemplate,
  onFlasks,
  onToggle,
  onNodes,
  onAddStructure,
  onRemoveStructure,
  onRemove,
  onSaveTemplate,
  onResetTemplate,
}: PieceCardProps) {
  const { t } = useTranslation()
  const base = BASES[piece.base]
  const { lines, warnings } = pieceLines(piece)
  const specimen = SPECIMEN_BY_ID[piece.specimenId]

  return (
    <section className="rounded-xl border-2 border-line bg-elevated shadow-card">
      <header className="flex flex-wrap items-start justify-between gap-3 border-b border-line px-4 py-3.5 sm:px-5">
        <div className="min-w-0">
          <h3 className="text-base font-semibold tracking-tight text-ink">{piece.label}</h3>
          <p className="mt-0.5 text-xs text-ink-muted">
            <span className="tabular font-semibold text-accent-ink">{CODES[base.code].code}</span> · {base.label}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs text-ink-muted">
            {base.flaskLabel}
            <Stepper value={piece.flasks} onChange={onFlasks} min={1} max={40} label={base.flaskLabel} size="sm" />
          </label>
          <button
            type="button"
            onClick={onRemove}
            aria-label={t('billing.removePiece')}
            className="rounded-md p-1.5 text-ink-faint transition-colors hover:bg-danger-soft hover:text-danger"
          >
            <Trash2 className="size-4" aria-hidden />
          </button>
        </div>
      </header>

      <div className="space-y-4 px-4 py-4 sm:px-5">
        {GROUPS.map(({ kind, titleKey }) => {
          const rows = piece.structures.filter((st) => st.kind === kind)
          const marked = rows.filter((st) => st.on).length
          if (kind === 'margin' && base.marginCap === 0 && rows.length === 0) return null
          return (
            <div key={kind}>
              <div className="mb-2 flex flex-wrap items-baseline justify-between gap-2">
                <h4 className="text-xs font-semibold tracking-wider text-ink-faint uppercase">
                  {t(titleKey)}
                  {rows.length > 0 && <span className="tabular ml-2 text-ink-muted">{marked}/{rows.length}</span>}
                </h4>
                <span className="text-xs text-ink-faint">
                  {kind === 'nodes'
                    ? t('billing.nodesHint', { code: shortCode('pecaAdicional') })
                    : base.marginCap && kind === 'margin'
                      ? t('billing.marginsHint', { code: shortCode('pecaAdicional'), cap: base.marginCap })
                      : t('billing.extrasHint', { code: shortCode('pecaAdicional') })}
                </span>
              </div>

              {rows.length > 0 && (
                <div className="grid gap-2 lg:grid-cols-2">
                  {rows.map((st) => (
                    <CheckRow
                      key={st.id}
                      checked={st.on}
                      onToggle={() => onToggle(st.id)}
                      right={
                        <div className="flex items-center gap-1">
                          {kind === 'nodes' && st.on && (
                            <Stepper
                              value={st.nodes ?? 6}
                              onChange={(v) => onNodes(st.id, v)}
                              min={1}
                              max={60}
                              label={st.label}
                              size="sm"
                            />
                          )}
                          {st.custom && (
                            <button
                              type="button"
                              onClick={() => onRemoveStructure(st.id)}
                              aria-label={t('billing.removeStructure')}
                              className="rounded p-1 text-ink-faint transition-colors hover:text-danger"
                            >
                              <X className="size-4" aria-hidden />
                            </button>
                          )}
                        </div>
                      }
                    >
                      {st.label}
                      {kind === 'nodes' && st.on && (
                        <span className="tabular ml-1.5 text-xs text-ink-muted">
                          {t('billing.nodesCharged', { n: Math.ceil(Math.max(1, st.nodes ?? 6) / 6) })}
                        </span>
                      )}
                    </CheckRow>
                  ))}
                </div>
              )}

              <AddCustom
                kind={kind}
                onAdd={(label) =>
                  onAddStructure({ id: `c${customSeq++}-${kind}-${Date.now().toString(36)}`, label, kind, on: true, nodes: kind === 'nodes' ? 6 : undefined, custom: true })
                }
              />
            </div>
          )
        })}

        {warnings.map((w, i) => (
          <p key={i} className="flex items-start gap-1.5 rounded-md border border-danger/40 bg-danger-soft px-3 py-2 text-xs leading-relaxed text-danger">
            <AlertTriangle className="mt-0.5 size-3.5 shrink-0" aria-hidden />
            {w}
          </p>
        ))}
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-line px-4 py-3 sm:px-5">
        <p className="tabular text-sm font-semibold text-accent-ink">{lines.map((l) => `${shortCode(l.code)} ×${l.qty}`).join('  +  ')}</p>
        {specimen && (
          <div className="flex items-center gap-2">
            {hasTemplate && (
              <button
                type="button"
                onClick={onResetTemplate}
                className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-ink-muted transition-colors hover:text-ink"
              >
                <RotateCcw className="size-3.5" aria-hidden />
                {t('billing.resetTemplate')}
              </button>
            )}
            <button
              type="button"
              onClick={onSaveTemplate}
              className="inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs text-ink-muted transition-colors hover:text-accent-ink"
            >
              <Star className={cn('size-3.5', hasTemplate && 'fill-accent text-accent')} aria-hidden />
              {t('billing.saveTemplate')}
            </button>
          </div>
        )}
      </footer>
    </section>
  )
}

/** "+ Acrescentar" que vira um campo de texto só quando alguém precisa. */
function AddCustom({ kind, onAdd }: { kind: StructureKind; onAdd: (label: string) => void }) {
  const { t } = useTranslation()
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState('')

  if (!open)
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-2 inline-flex items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium text-ink-muted transition-colors hover:text-accent-ink"
      >
        <Plus className="size-3.5" aria-hidden />
        {t(`billing.add.${kind}`)}
      </button>
    )

  return (
    <form
      className="mt-2 flex flex-wrap items-center gap-2"
      onSubmit={(e) => {
        e.preventDefault()
        const label = value.trim()
        if (!label) return
        onAdd(label)
        setValue('')
        setOpen(false)
      }}
    >
      <input
        autoFocus
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t(`billing.add.${kind}`)}
        className="h-10 min-w-0 flex-1 rounded-lg border-2 border-line bg-surface px-3 text-sm text-ink placeholder:text-ink-faint focus:border-accent focus:outline-none"
      />
      <button type="submit" className="h-10 rounded-lg bg-accent px-3 text-sm font-medium text-white transition-colors hover:bg-accent-hover">
        {t('billing.addConfirm')}
      </button>
      <button
        type="button"
        onClick={() => {
          setOpen(false)
          setValue('')
        }}
        className="h-10 rounded-lg px-2 text-sm text-ink-muted transition-colors hover:text-ink"
      >
        {t('billing.cancel')}
      </button>
    </form>
  )
}
