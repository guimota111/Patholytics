/* ==========================================================================
   ResultCards.tsx — o que a tela mostra depois de calcular: o cartão de
   cada diagnóstico (o que bateu, o que não bateu, o que bateu por exceção,
   critérios, mímicos, fontes, perfil completo), o painel "o que pedir a
   seguir" e a tabela de comparação lado a lado.
   ========================================================================== */

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronDown, ChevronUp, ExternalLink, Minus, Plus } from 'lucide-react'
import { ReportButton } from '@/components/feedback/ReportButton'
import { cn } from '@/lib/cn'
import { plausibility } from '../match'
import type { CompareRow, MarkerVerdict, NextMarker, Result, Suggestion, Verdict } from '../match'
import { BAND_LABELS, PATTERN_LABELS, bandOf, findMarker, findMorph, pctLabel, type Band, type MarkerResult, type Tumor } from '../types'
import { ScrollX } from '@/components/ui/ScrollX'

const VERDICT_ORDER: Verdict[] = ['nao-bate', 'excecao', 'padrao', 'bate', 'compativel', 'sem-dados']

const VERDICT_STYLE: Record<Verdict, string> = {
  bate: 'bg-success/15 text-success',
  compativel: 'bg-elevated text-ink-muted',
  excecao: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  padrao: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  'nao-bate': 'bg-danger/15 text-danger',
  'sem-dados': 'bg-elevated text-ink-faint',
}

const BAND_STYLE: Record<Band, string> = {
  sempre: 'bg-success/20 text-success',
  geralmente: 'bg-success/10 text-success',
  variavel: 'bg-amber-500/15 text-amber-700 dark:text-amber-300',
  raro: 'bg-danger/10 text-danger',
  nunca: 'bg-danger/20 text-danger',
}

/* ---- Cartão de um diagnóstico ---------------------------------------------- */

interface CardProps {
  s: Suggestion
  rank: number
  open: boolean
  onToggle: () => void
  compared: boolean
  onCompare: () => void
  muted?: boolean
  /** Pontuação do primeiro colocado, base da barra de plausibilidade. */
  best: number
}

export function TumorCard({ s, rank, open, onToggle, compared, onCompare, muted = false, best }: CardProps) {
  const { t } = useTranslation()
  const [profile, setProfile] = useState(false)
  const tm = s.tumor
  const counts = countVerdicts(s.markers)
  const share = plausibility(s.score, best)
  const width = Math.round(share * 100)

  return (
    <li className={cn('rounded-lg border bg-surface', open ? 'border-accent/50 shadow-card' : 'border-line', muted && 'opacity-90')}>
      <div className="flex items-start gap-3 px-4 py-3">
        <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-full bg-elevated text-xs font-bold text-ink-muted">{rank}</span>
        <button type="button" onClick={onToggle} aria-expanded={open} className="min-w-0 flex-1 text-left">
          <p className="text-base font-semibold text-ink">
            {tm.name}
            <BehaviorTag behavior={tm.behavior} />
            {s.siteRole === 'metastase' && <span className="ml-2 rounded-full bg-amber-500/15 px-2 py-0.5 text-[0.65rem] font-medium text-amber-700 uppercase dark:text-amber-300">{t('markers.metastasis')}</span>}
            {s.siteFreq === 3 && <span className="ml-2 rounded-full bg-success/15 px-2 py-0.5 text-[0.65rem] font-medium text-success uppercase">{t('markers.common')}</span>}
            {s.siteFreq === 1 && <span className="ml-2 rounded-full bg-elevated px-2 py-0.5 text-[0.65rem] font-medium text-ink-faint uppercase">{t('markers.rare')}</span>}
          </p>
          {tm.aka && tm.aka.length > 0 && <p className="text-xs text-ink-faint">{tm.aka.slice(0, 3).join(' · ')}</p>}
          <p className="mt-1 text-sm text-ink-muted">{tm.summary}</p>
          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            {counts.bate > 0 && <Pill cls={VERDICT_STYLE.bate}>{t('markers.nFit', { n: counts.bate })}</Pill>}
            {counts.excecao + counts.padrao > 0 && <Pill cls={VERDICT_STYLE.excecao}>{t('markers.nException', { n: counts.excecao + counts.padrao })}</Pill>}
            {counts['nao-bate'] > 0 && <Pill cls={VERDICT_STYLE['nao-bate']}>{t('markers.nMisfit', { n: counts['nao-bate'] })}</Pill>}
            {counts.compativel > 0 && <Pill cls={VERDICT_STYLE.compativel}>{t('markers.nVariable', { n: counts.compativel })}</Pill>}
            {counts['sem-dados'] > 0 && <Pill cls={VERDICT_STYLE['sem-dados']}>{t('markers.nNoData', { n: counts['sem-dados'] })}</Pill>}
            {(s.morphHits.length > 0 || s.morphMisses.length > 0) && (
              <Pill cls={s.morphMisses.length === 0 ? VERDICT_STYLE.bate : s.morphHits.length === 0 ? VERDICT_STYLE['nao-bate'] : VERDICT_STYLE.compativel}>
                {t('markers.morphScore', { hit: s.morphHits.length, total: s.morphHits.length + s.morphMisses.length })}
              </Pill>
            )}
            {s.ageHit === false && <Pill cls={VERDICT_STYLE.excecao}>{t('markers.ageOff')}</Pill>}
            {s.sexMismatch && <Pill cls={VERDICT_STYLE['nao-bate']}>{t('markers.sexOff')}</Pill>}
          </div>
          <div className="mt-2 flex items-center gap-2" title={t('markers.plausibilityHint')}>
            <div className="h-1 flex-1 overflow-hidden rounded-full bg-elevated" aria-hidden>
              <div className={cn('h-full rounded-full', width >= 10 ? 'bg-accent' : 'bg-ink-faint/40')} style={{ width: `${Math.max(width, 1)}%` }} />
            </div>
            <span className="shrink-0 text-[0.65rem] font-medium text-ink-faint tabular-nums">
              {width >= 1 ? `${width}%` : '< 1%'}
            </span>
          </div>
        </button>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <button type="button" onClick={onToggle} className="rounded p-1 text-ink-faint hover:text-ink" aria-label={open ? t('markers.collapse') : t('markers.expand')}>
            {open ? <ChevronUp className="size-4" aria-hidden /> : <ChevronDown className="size-4" aria-hidden />}
          </button>
          <label className="flex cursor-pointer items-center gap-1 text-[0.7rem] text-ink-muted">
            <input type="checkbox" checked={compared} onChange={onCompare} className="accent-accent" />
            {t('markers.compare')}
          </label>
        </div>
      </div>

      {open && (
        <div className="space-y-4 border-t border-line px-4 py-4 text-sm leading-relaxed text-ink">
          {s.markers.length > 0 && (
            <Row label={t('markers.rowMarkers')}>
              <ul className="space-y-1.5">
                {[...s.markers]
                  .sort((a, b) => VERDICT_ORDER.indexOf(a.verdict) - VERDICT_ORDER.indexOf(b.verdict))
                  .map((v) => (
                    <VerdictLine key={v.marker} v={v} />
                  ))}
              </ul>
            </Row>
          )}
          {(s.morphHits.length > 0 || s.morphMisses.length > 0) && (
            <Row label={t('markers.rowMorph')}>
              <div className="flex flex-wrap gap-1.5">
                {s.morphHits.map((id) => {
                  const variant = s.morphVariants.includes(id)
                  return (
                    <Pill key={id} cls={variant ? VERDICT_STYLE.compativel : VERDICT_STYLE.bate}>
                      {findMorph(id)?.label ?? id}
                      {variant && ` (${t('markers.morphVariant')})`}
                    </Pill>
                  )
                })}
                {s.morphMisses.map((id) => (
                  <Pill key={id} cls={cn(VERDICT_STYLE['nao-bate'], 'line-through')}>
                    {findMorph(id)?.label ?? id}
                  </Pill>
                ))}
              </div>
            </Row>
          )}
          <Row label={t('markers.rowCriteria')}>
            <ul className="list-disc space-y-1 pl-5">
              {tm.criteria.map((x, i) => (
                <li key={i}>{x}</li>
              ))}
            </ul>
          </Row>
          {tm.mimics && tm.mimics.length > 0 && (
            <Row label={t('markers.rowMimics')}>
              <ul className="list-disc space-y-1 pl-5">
                {tm.mimics.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </Row>
          )}
          {tm.pitfalls && tm.pitfalls.length > 0 && (
            <Row label={t('markers.rowPitfalls')}>
              <ul className="list-disc space-y-1 pl-5">
                {tm.pitfalls.map((x, i) => (
                  <li key={i}>{x}</li>
                ))}
              </ul>
            </Row>
          )}
          {tm.molecular && <Row label={t('markers.rowMolecular')}>{tm.molecular}</Row>}
          <Row label={t('markers.rowProfile')}>
            <button type="button" onClick={() => setProfile((v) => !v)} className="inline-flex min-h-9 items-center text-xs text-accent hover:underline sm:min-h-0">
              {profile ? t('markers.hideProfile') : t('markers.showProfile', { n: tm.markers.length })}
            </button>
            {profile && <Profile tumor={tm} />}
          </Row>
          {tm.sources.length > 0 && (
            <Row label={t('markers.rowSources')}>
              <ul className="space-y-0.5">
                {tm.sources.map((u) =>
                  u.startsWith('http') ? (
                    <li key={u}>
                      <a href={u} target="_blank" rel="noreferrer" className="inline-flex min-h-9 items-center gap-1 text-xs text-accent hover:underline sm:min-h-0">
                        {u.replace(/^https?:\/\//, '').slice(0, 80)}
                        <ExternalLink className="size-3" aria-hidden />
                      </a>
                    </li>
                  ) : (
                    /* Referência de livro ou artigo sem link: texto puro. */
                    <li key={u} className="text-xs text-ink-muted">
                      {u}
                    </li>
                  ),
                )}
              </ul>
            </Row>
          )}
          <div className="flex justify-end border-t border-line pt-3">
            <ReportButton target={{ tool: 'marcadores', itemId: tm.id, itemName: tm.name }} />
          </div>
        </div>
      )}
    </li>
  )
}

function countVerdicts(vs: MarkerVerdict[]): Record<Verdict, number> {
  const c: Record<Verdict, number> = { bate: 0, compativel: 0, excecao: 0, padrao: 0, 'nao-bate': 0, 'sem-dados': 0 }
  for (const v of vs) c[v.verdict]++
  return c
}

function VerdictLine({ v }: { v: MarkerVerdict }) {
  const { t } = useTranslation()
  const m = findMarker(v.marker)
  const [posLabel, negLabel] = m?.readout ?? [t('markers.positive'), t('markers.negative')]
  const result = v.input.result === 'pos' ? posLabel : negLabel
  return (
    <li className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
      <Pill cls={VERDICT_STYLE[v.verdict]}>{t(`markers.verdict.${v.verdict}`)}</Pill>
      <span className="font-medium">{m?.label ?? v.marker}</span>
      <span className="text-ink-muted">{result.toLowerCase()}</span>
      {v.entry ? (
        <span className="text-xs text-ink-muted">
          · {t('markers.pctOf', { pct: pctLabel(v.entry.pct) })}
          {v.entry.pattern && ` · ${PATTERN_LABELS[v.entry.pattern]}`}
          {v.entry.note && ` · ${v.entry.note}`}
          {v.entry.source &&
            (v.entry.source.startsWith('http') ? (
              <a href={v.entry.source} target="_blank" rel="noreferrer" className="ml-1 inline-flex items-center text-accent hover:underline" aria-label={t('markers.source')}>
                <ExternalLink className="size-3" aria-hidden />
              </a>
            ) : (
              <span className="ml-1 text-ink-faint"> ({v.entry.source})</span>
            ))}
        </span>
      ) : (
        <span className="text-xs text-ink-faint">· {t('markers.noDataHint')}</span>
      )}
      {v.verdict === 'padrao' && v.input.pattern && (
        <span className="text-xs text-ink-muted">
          · {t('markers.patternObserved', { obs: PATTERN_LABELS[v.input.pattern], exp: PATTERN_LABELS[v.entry?.pattern ?? m?.pattern ?? 'var'] })}
        </span>
      )}
    </li>
  )
}

/** Perfil completo: todos os marcadores do tumor agrupados por faixa. */
export function Profile({ tumor }: { tumor: Tumor }) {
  const groups: Record<Band, MarkerResult[]> = { sempre: [], geralmente: [], variavel: [], raro: [], nunca: [] }
  for (const m of tumor.markers) groups[bandOf(m.pct)].push(m)
  return (
    <div className="mt-2 space-y-2">
      {(Object.keys(groups) as Band[]).map((b) =>
        groups[b].length === 0 ? null : (
          <div key={b} className="flex flex-wrap items-start gap-1.5">
            <span className={cn('rounded-full px-2 py-0.5 text-[0.7rem] font-medium', BAND_STYLE[b])}>{BAND_LABELS[b]}</span>
            {groups[b].map((m) => (
              <span key={m.marker} className="rounded-md border border-line bg-elevated px-1.5 py-0.5 text-xs text-ink" title={[m.note, m.pattern && PATTERN_LABELS[m.pattern]].filter(Boolean).join(' · ')}>
                {findMarker(m.marker)?.label ?? m.marker} <span className="text-ink-faint">{pctLabel(m.pct)}</span>
              </span>
            ))}
          </div>
        ),
      )}
    </div>
  )
}

/* ---- O que pedir a seguir ------------------------------------------------------ */

export function NextMarkersPanel({ items, onSet }: { items: NextMarker[]; onSet: (id: string, result: Result) => void }) {
  const { t } = useTranslation()
  if (items.length === 0) return null
  const maxGain = items[0].gain || 1
  return (
    <div className="rounded-lg border border-accent/40 bg-accent-soft/40 p-4">
      <p className="text-sm font-semibold text-ink">{t('markers.nextTitle')}</p>
      <p className="mb-3 text-xs text-ink-muted">{t('markers.nextHint')}</p>
      <ul className="space-y-2">
        {items.map((n) => {
          const m = findMarker(n.marker)
          return (
            <li key={n.marker} className="rounded-md border border-line bg-surface px-3 py-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-medium text-ink">{m?.label ?? n.marker}</span>
                <span className="h-1.5 w-24 overflow-hidden rounded-full bg-elevated" aria-hidden>
                  <span className="block h-full rounded-full bg-accent" style={{ width: `${Math.round((n.gain / maxGain) * 100)}%` }} />
                </span>
                <span className="ml-auto inline-flex overflow-hidden rounded-md border border-line text-xs">
                  <button type="button" onClick={() => onSet(n.marker, 'pos')} className="inline-flex items-center gap-1 px-2 py-1 text-success hover:bg-success/15">
                    <Plus className="size-3" aria-hidden /> {m?.readout?.[0] ?? t('markers.positive')}
                  </button>
                  <button type="button" onClick={() => onSet(n.marker, 'neg')} className="inline-flex items-center gap-1 px-2 py-1 text-danger hover:bg-danger/15">
                    <Minus className="size-3" aria-hidden /> {m?.readout?.[1] ?? t('markers.negative')}
                  </button>
                </span>
              </div>
              <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-ink-muted">
                {n.perCandidate.map((c) => (
                  <span key={c.tumor.id}>
                    {shortName(c.tumor.name)} <span className={cn('font-semibold', c.pct === null ? 'text-ink-faint' : c.pct >= 70 ? 'text-success' : c.pct < 30 ? 'text-danger' : 'text-amber-700 dark:text-amber-300')}>{c.pct === null ? '?' : `${Math.round(c.pct)}%`}</span>
                  </span>
                ))}
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const shortName = (n: string) => (n.length > 34 ? n.slice(0, 32) + '…' : n)

/* ---- Comparação lado a lado ---------------------------------------------------- */

export function CompareTable({ tumors, rows }: { tumors: Tumor[]; rows: CompareRow[] }) {
  const { t } = useTranslation()
  return (
    <ScrollX className="rounded-lg border border-line bg-surface" innerClassName="rounded-lg">
      <table className="w-full min-w-[30rem] text-xs">
        <thead>
          <tr className="border-b border-line text-left text-ink-muted">
            <th className="px-3 py-2 font-medium">{t('markers.marker')}</th>
            {tumors.map((tm) => (
              <th key={tm.id} className="px-3 py-2 font-medium text-ink">
                {tm.name}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.marker} className={cn('border-b border-line last:border-b-0', r.spread >= 50 && 'bg-accent-soft/30')}>
              <td className="px-3 py-1.5 font-medium text-ink">{findMarker(r.marker)?.label ?? r.marker}</td>
              {r.pcts.map((p, i) => (
                <td key={i} className="px-3 py-1.5">
                  {p ? (
                    <span className={cn('rounded-full px-2 py-0.5 font-medium', BAND_STYLE[bandOf(p.pct)])} title={p.note}>
                      {pctLabel(p.pct)}
                    </span>
                  ) : (
                    <span className="text-ink-faint">—</span>
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollX>
  )
}

/* ---- Peças ------------------------------------------------------------------------ */

function BehaviorTag({ behavior }: { behavior: Tumor['behavior'] }) {
  const { t } = useTranslation()
  const cls = behavior === 'maligno' ? 'bg-danger/15 text-danger' : behavior === 'benigno' ? 'bg-success/15 text-success' : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
  return <span className={cn('ml-2 rounded-full px-2 py-0.5 text-[0.65rem] font-medium uppercase', cls)}>{t(`markers.behavior.${behavior}`)}</span>
}

function Pill({ cls, children }: { cls: string; children: React.ReactNode }) {
  return <span className={cn('rounded-full px-2 py-0.5 text-[0.7rem] font-medium', cls)}>{children}</span>
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[9rem_minmax(0,1fr)]">
      <p className="text-xs font-medium tracking-wide text-ink-muted uppercase">{label}</p>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
