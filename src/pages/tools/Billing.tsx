import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Info, Microscope, Plus, Sparkles, UserRound, X } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { StepCard } from '@/components/ui/didactic'
import { BLOCKS, type BlockId, type Params } from '@/tools/billing/blocks'
import { billText, type Role } from '@/tools/billing/case'
import { SOURCE } from '@/tools/billing/codes'
import { BillPanel } from '@/tools/billing/components/BillPanel'
import { BlockCard } from '@/tools/billing/components/BlockCard'
import { MaterialPicker } from '@/tools/billing/components/MaterialPicker'
import { PieceCard } from '@/tools/billing/components/PieceCard'
import { ReceptionView } from '@/tools/billing/components/ReceptionView'
import { SPECIMEN_BY_ID } from '@/tools/billing/specimens'
import { useBillingCase } from '@/tools/billing/useBillingCase'

export default function BillingPage() {
  const { t } = useTranslation()
  const c = useBillingCase()
  const [picking, setPicking] = useState(false)

  const suggestions = useMemo(() => {
    const seen = new Set(c.state.blocks.map((b) => b.blockId))
    const out: { key: string; label: string; block: BlockId; params?: Params }[] = []
    for (const piece of c.state.pieces) {
      for (const sug of SPECIMEN_BY_ID[piece.specimenId]?.suggests ?? []) {
        if (seen.has(sug.block as BlockId)) continue
        out.push({ key: `${piece.uid}-${sug.block}-${sug.label}`, label: sug.label, block: sug.block as BlockId, params: sug.params })
      }
    }
    return out
  }, [c.state.pieces, c.state.blocks])

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(billText(c.state, c.bill))
      return true
    } catch {
      return false
    }
  }

  if (!c.hydrated) return <div className="shell py-10" />

  if (!c.role) return <RoleGate onPick={c.setRole} />

  const empty = c.state.pieces.length === 0 && c.state.blocks.length === 0

  return (
    <div className="shell py-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('tools.billing.name')}</h1>
          <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-ink-muted">
            {t(c.role === 'reception' ? 'billing.subtitleReception' : 'billing.subtitlePathologist')}
          </p>
        </div>
        <button
          type="button"
          onClick={() => c.setRole(null)}
          className="inline-flex items-center gap-2 rounded-full border-2 border-line bg-surface px-3.5 py-1.5 text-sm text-ink-muted transition-colors hover:border-accent hover:text-accent-ink"
        >
          {c.role === 'reception' ? <UserRound className="size-4" aria-hidden /> : <Microscope className="size-4" aria-hidden />}
          {t(c.role === 'reception' ? 'billing.roleReception' : 'billing.rolePathologist')}
          <span className="text-xs text-ink-faint">{t('billing.changeRole')}</span>
        </button>
      </header>

      {c.role === 'reception' ? (
        <div className="mt-8">
          <ReceptionView />
        </div>
      ) : (
        <div className="mt-8 grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_26rem]">
          <div className="space-y-6">
            {empty ? (
              <StepCard number={1} title={t('billing.step1Title')} hint={t('billing.step1Hint')}>
                <MaterialPicker onPick={c.addPiece} autoFocus />
              </StepCard>
            ) : (
              <>
                <StepCard number={1} title={t('billing.step1Title')} hint={t('billing.step2Hint')}>
                  <div className="space-y-4">
                    {c.state.pieces.map((piece) => (
                      <PieceCard
                        key={piece.uid}
                        piece={piece}
                        hasTemplate={Boolean(c.templates[piece.specimenId])}
                        onFlasks={(n) => c.updatePiece(piece.uid, { flasks: n })}
                        onToggle={(id) => c.toggleStructure(piece.uid, id)}
                        onNodes={(id, nodes) => c.setStructureNodes(piece.uid, id, nodes)}
                        onAddStructure={(structure) => c.addStructure(piece.uid, structure)}
                        onRemoveStructure={(id) => c.removeStructure(piece.uid, id)}
                        onRemove={() => c.removePiece(piece.uid)}
                        onSaveTemplate={() => c.saveTemplate(piece.specimenId, piece.structures)}
                        onResetTemplate={() => c.deleteTemplate(piece.specimenId)}
                      />
                    ))}
                    <Button type="button" size="lg" variant="secondary" onClick={() => setPicking(true)}>
                      <Plus className="size-4" aria-hidden />
                      {t('billing.addPiece')}
                    </Button>
                  </div>
                </StepCard>

                <StepCard number={2} title={t('billing.step3Title')} hint={t('billing.step3Hint')}>
                  <div className="space-y-4">
                    {suggestions.length > 0 && (
                      <div className="flex flex-wrap items-center gap-2 rounded-lg border-2 border-accent/40 bg-accent-soft px-3.5 py-3">
                        <Sparkles className="size-4 shrink-0 text-accent" aria-hidden />
                        <span className="text-xs font-semibold tracking-wider text-accent-ink uppercase">{t('billing.suggested')}</span>
                        {suggestions.map((sug) => (
                          <button
                            key={sug.key}
                            type="button"
                            onClick={() => c.addBlock(sug.block, sug.params)}
                            className="rounded-full border-2 border-accent/40 bg-elevated px-3 py-1 text-sm font-medium text-accent-ink transition-colors hover:border-accent"
                          >
                            + {sug.label}
                          </button>
                        ))}
                      </div>
                    )}

                    {c.state.blocks.map((block) => (
                      <BlockCard
                        key={block.uid}
                        blockId={block.blockId}
                        params={block.params}
                        onChange={(params) => c.setBlockParams(block.uid, params)}
                        onRemove={() => c.removeBlock(block.uid)}
                      />
                    ))}

                    <div className="flex flex-wrap gap-2">
                      {BLOCKS.map((block) => {
                        const Icon = block.icon
                        return (
                          <button
                            key={block.id}
                            type="button"
                            onClick={() => c.addBlock(block.id)}
                            className="inline-flex items-center gap-2 rounded-lg border-2 border-line bg-surface px-3.5 py-2.5 text-sm font-medium text-ink transition-colors hover:border-accent hover:bg-accent-soft hover:text-accent-ink"
                          >
                            <Icon className="size-4 text-accent" aria-hidden />
                            {block.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                </StepCard>
              </>
            )}
          </div>

          <div className="xl:sticky xl:top-6">
            <BillPanel
              bill={c.bill}
              diff={c.diff}
              billed={c.state.billed}
              onBilled={c.setBilled}
              onCopy={copy}
              onClear={c.clearCase}
              empty={empty}
            />
          </div>
        </div>
      )}

      <p className="mt-12 flex items-start gap-2 border-t border-line pt-6 text-xs leading-relaxed text-ink-faint">
        <Info className="mt-0.5 size-3.5 shrink-0" aria-hidden />
        {t('billing.disclaimer')} {SOURCE}.
      </p>

      {picking && (
        <div className="fixed inset-0 z-50 flex flex-col bg-ground" role="dialog" aria-modal="true" aria-label={t('billing.addPiece')}>
          <div className="flex items-center justify-between gap-3 border-b border-line bg-elevated px-5 py-4">
            <h2 className="text-lg font-semibold tracking-tight text-ink">{t('billing.addPiece')}</h2>
            <button
              type="button"
              onClick={() => setPicking(false)}
              aria-label={t('billing.close')}
              className="rounded-md p-2 text-ink-muted transition-colors hover:bg-raised hover:text-ink"
            >
              <X className="size-5" aria-hidden />
            </button>
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-5 py-6 sm:px-8">
            <div className="mx-auto w-full max-w-6xl">
              <MaterialPicker
                autoFocus
                onPick={(sp) => {
                  c.addPiece(sp)
                  setPicking(false)
                }}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

/** Primeira tela: quem está usando muda o que a ferramenta pergunta. */
function RoleGate({ onPick }: { onPick: (role: Role) => void }) {
  const { t } = useTranslation()
  return (
    <div className="shell py-10">
      <header>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">{t('tools.billing.name')}</h1>
        <p className="mt-1.5 max-w-3xl text-sm leading-relaxed text-ink-muted">{t('billing.roleQuestion')}</p>
      </header>

      <div className="mt-8 grid gap-4 lg:grid-cols-2">
        {(
          [
            { role: 'pathologist' as const, icon: Microscope, label: t('billing.rolePathologist'), hint: t('billing.rolePathologistHint') },
            { role: 'reception' as const, icon: UserRound, label: t('billing.roleReception'), hint: t('billing.roleReceptionHint') },
          ]
        ).map(({ role, icon: Icon, label, hint }) => (
          <button
            key={role}
            type="button"
            onClick={() => onPick(role)}
            className="flex items-start gap-4 rounded-xl border-2 border-line bg-elevated px-6 py-6 text-left shadow-card transition-colors hover:border-accent hover:bg-accent-soft"
          >
            <span className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-accent/15 text-accent">
              <Icon className="size-7" aria-hidden />
            </span>
            <span className="min-w-0">
              <span className="block text-xl font-semibold tracking-tight text-ink">{label}</span>
              <span className="mt-1 block text-sm leading-relaxed text-ink-muted">{hint}</span>
            </span>
          </button>
        ))}
      </div>
    </div>
  )
}
