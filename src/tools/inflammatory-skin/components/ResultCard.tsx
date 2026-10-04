/* ==========================================================================
   ResultCard.tsx — um verbete no resultado: cabeçalho com o que bateu e o
   que pesa contra, e, aberto, o que procurar na lâmina, as pistas, com o
   que não confundir, o próximo passo e as fontes.
   ========================================================================== */

import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronUp, ExternalLink, Search } from 'lucide-react'
import { ReportButton } from '@/components/feedback/ReportButton'
import { cn } from '@/lib/cn'
import type { Suggestion } from '../match'
import { labelOf } from '../types'

export function ResultCard({ s, open, onToggle, muted = false }: { s: Suggestion; open: boolean; onToggle: () => void; muted?: boolean }) {
  const { t } = useTranslation()
  const d = s.diagnosis
  const plainHits = s.histologyHits.length - s.hallmarkHits.length
  return (
    <li className={cn('rounded-lg border bg-surface', open ? 'border-accent/50 shadow-card' : 'border-line', muted && 'opacity-90')}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-start gap-3 px-4 py-3 text-left">
        <div className="min-w-0 flex-1">
          <p className="text-base font-semibold text-ink">
            {d.name}
            {d.frequency === 3 && <span className="ml-2 rounded-full bg-success/15 px-2 py-0.5 text-[0.65rem] font-medium text-success uppercase">{t('inflammatorySkin.freq.common')}</span>}
            {d.frequency === 1 && <span className="ml-2 rounded-full bg-elevated px-2 py-0.5 text-[0.65rem] font-medium text-ink-faint uppercase">{t('inflammatorySkin.freq.rare')}</span>}
          </p>
          {d.aka && d.aka.length > 0 && <p className="text-xs text-ink-faint">{d.aka.join(' · ')}</p>}
          <p className="mt-1 text-sm text-ink-muted">{d.summary}</p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {s.primaryPattern && <Match kind="ok" label={t('inflammatorySkin.matchPrimary')} />}
            {!s.primaryPattern && s.patternHits.length > 0 && <Match kind="ok" label={t('inflammatorySkin.matchSecondary')} />}
            {s.hallmarkHits.length > 0 && <Match kind="key" label={t('inflammatorySkin.matchHallmark', { n: s.hallmarkHits.length })} />}
            {plainHits > 0 && <Match kind="ok" label={t('inflammatorySkin.matchHistology', { n: plainHits })} />}
            {s.clinicalHits.length > 0 && <Match kind="ok" label={t('inflammatorySkin.matchClinical', { n: s.clinicalHits.length })} />}
            {s.contradictions.map((id) => (
              <Match key={id} kind="no" label={labelOf(id)} />
            ))}
            {s.missingHallmarks.length > 0 && <Match kind="look" label={t('inflammatorySkin.matchLookFor', { n: s.missingHallmarks.length })} />}
          </div>
        </div>
        {open ? <ChevronUp className="mt-1 size-4 shrink-0 text-ink-faint" aria-hidden /> : <ChevronDown className="mt-1 size-4 shrink-0 text-ink-faint" aria-hidden />}
      </button>

      {open && (
        <div className="space-y-4 border-t border-line px-4 py-4 text-sm leading-relaxed text-ink">
          {s.missingHallmarks.length > 0 && (
            <div className="rounded-md border border-accent/40 bg-accent-soft px-3.5 py-3">
              <p className="flex items-center gap-1.5 text-xs font-medium tracking-wide text-accent-ink uppercase">
                <Search className="size-3.5" aria-hidden />
                {t('inflammatorySkin.rowLookFor')}
              </p>
              <p className="mt-0.5 text-xs text-accent-ink/80">{t('inflammatorySkin.rowLookForHint')}</p>
              <ul className="mt-2 flex flex-wrap gap-1.5">
                {s.missingHallmarks.map((id) => (
                  <li key={id} className="rounded-full border border-accent/40 bg-surface px-2.5 py-0.5 text-xs text-accent-ink">
                    {labelOf(id)}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <Row label={t('inflammatorySkin.rowClues')}>
            <List items={d.clues} />
          </Row>

          {(s.contradictions.length > 0 || s.unexplained.length > 0) && (
            <Row label={t('inflammatorySkin.rowAgainst')}>
              <ul className="space-y-1">
                {s.contradictions.map((id) => (
                  <li key={id} className="text-danger">
                    {labelOf(id)} <span className="text-xs text-ink-faint">({t('inflammatorySkin.againstNote')})</span>
                  </li>
                ))}
                {s.unexplained.map((id) => (
                  <li key={id} className="text-ink-muted">
                    {labelOf(id)} <span className="text-xs text-ink-faint">({t('inflammatorySkin.unexplainedNote')})</span>
                  </li>
                ))}
              </ul>
            </Row>
          )}

          <Row label={t('inflammatorySkin.rowMimics')}>
            <List items={d.mimics} />
          </Row>

          {d.next && d.next.length > 0 && (
            <Row label={t('inflammatorySkin.rowNext')}>
              <List items={d.next} />
            </Row>
          )}

          {d.sources && d.sources.length > 0 && (
            <Row label={t('inflammatorySkin.rowSources')}>
              <ul className="space-y-0.5 text-xs text-ink-muted">
                {d.sources.map((src) =>
                  src.startsWith('http') ? (
                    <li key={src}>
                      <a href={src} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 text-accent hover:underline">
                        {src.replace(/^https?:\/\//, '').slice(0, 80)}
                        <ExternalLink className="size-3" aria-hidden />
                      </a>
                    </li>
                  ) : (
                    <li key={src}>{src}</li>
                  ),
                )}
              </ul>
            </Row>
          )}
          <div className="flex justify-end border-t border-line pt-3">
            <ReportButton target={{ tool: 'peles-inflamatorias', itemId: d.id, itemName: d.name }} />
          </div>
        </div>
      )}
    </li>
  )
}

function Match({ kind, label }: { kind: 'ok' | 'key' | 'no' | 'look'; label: string }) {
  return (
    <span
      className={cn(
        'rounded-full px-2 py-0.5 text-[0.7rem] font-medium',
        kind === 'ok' && 'bg-success/15 text-success',
        kind === 'key' && 'bg-success/25 text-success ring-1 ring-success/40',
        kind === 'no' && 'bg-danger-soft text-danger line-through',
        kind === 'look' && 'border border-dashed border-accent/50 text-accent-ink',
      )}
    >
      {label}
    </span>
  )
}

function List({ items }: { items: string[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5 text-ink-muted">
      {items.map((x, i) => (
        <li key={i}>{x}</li>
      ))}
    </ul>
  )
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[10rem_minmax(0,1fr)]">
      <p className="text-xs font-medium tracking-wide text-ink-muted uppercase">{label}</p>
      <div>{children}</div>
    </div>
  )
}
