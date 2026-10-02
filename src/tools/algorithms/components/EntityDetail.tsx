/* ==========================================================================
   EntityDetail.tsx — o verbete de uma entidade, aberto num diálogo: o que a
   define, o perfil imuno e molecular, o comportamento, as armadilhas, e,
   resposta a resposta, o que bateu e o que não bateu com ela.
   ========================================================================== */

import { useTranslation } from 'react-i18next'
import { ExternalLink } from 'lucide-react'
import { cn } from '@/lib/cn'
import type { Ranked, Verdict } from '../match'
import { RISK_LABELS, findOption, findQuestion, type Algorithm, type Entity } from '../types'
import { VERDICT_STYLE } from './styles'

export function RiskTag({ risk }: { risk: Entity['risk'] }) {
  const cls = risk === 'alto' ? 'bg-danger/15 text-danger' : risk === 'benigno' ? 'bg-success/15 text-success' : risk === 'baixo' ? 'bg-success/10 text-success' : 'bg-amber-500/15 text-amber-700 dark:text-amber-300'
  return <span className={cn('rounded-full px-2 py-0.5 text-[0.65rem] font-medium uppercase', cls)}>{RISK_LABELS[risk]}</span>
}

export function EntityDetail({ algorithm, ranked }: { algorithm: Algorithm; ranked: Ranked }) {
  const { t } = useTranslation()
  const e = ranked.entity
  const sources = e.sources.map((id) => algorithm.sources.find((s) => s.id === id)).filter((s): s is NonNullable<typeof s> => Boolean(s))

  return (
    <div className="space-y-5 text-sm leading-relaxed text-ink">
      <div className="flex flex-wrap items-center gap-2">
        <RiskTag risk={e.risk} />
        <span className="text-xs text-ink-muted">{e.status}</span>
      </div>
      {e.aka && e.aka.length > 0 && <p className="text-xs text-ink-faint">{e.aka.join(' · ')}</p>}
      <p>{e.summary}</p>

      {ranked.verdicts.length > 0 && (
        <Row label={t('algorithms.rowAnswers')}>
          <ul className="space-y-1.5">
            {[...ranked.verdicts]
              .sort((a, b) => ORDER.indexOf(a.verdict) - ORDER.indexOf(b.verdict))
              .map((v) => {
                const q = findQuestion(algorithm, v.question)
                const o = q && findOption(q, v.option)
                return (
                  <li key={`${v.question}.${v.option}`} className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                    <span className={cn('rounded-full px-2 py-0.5 text-[0.7rem] font-medium', VERDICT_STYLE[v.verdict])}>{t(`algorithms.verdict.${v.verdict}`)}</span>
                    <span className="font-medium">{q?.title ?? v.question}</span>
                    <span className="text-ink-muted">{(o?.label ?? v.option).toLowerCase()}</span>
                    <span className="text-xs text-ink-faint">· {t(`algorithms.likelihood.${v.likelihood}`)}</span>
                  </li>
                )
              })}
          </ul>
        </Row>
      )}

      <Row label={t('algorithms.rowKeys')}>
        <ul className="list-disc space-y-1 pl-5">
          {e.keys.map((k, i) => (
            <li key={i}>{k}</li>
          ))}
        </ul>
      </Row>
      <Row label={t('algorithms.rowIhc')}>{e.ihc}</Row>
      {e.molecular && <Row label={t('algorithms.rowMolecular')}>{e.molecular}</Row>}
      {e.behavior && <Row label={t('algorithms.rowBehavior')}>{e.behavior}</Row>}
      {e.pitfalls && e.pitfalls.length > 0 && (
        <Row label={t('algorithms.rowPitfalls')}>
          <ul className="list-disc space-y-1 pl-5">
            {e.pitfalls.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </Row>
      )}
      {sources.length > 0 && (
        <Row label={t('algorithms.rowSources')}>
          <ul className="space-y-1">
            {sources.map((s) => (
              <li key={s.id} className="text-xs text-ink-muted">
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noreferrer" className="inline-flex items-start gap-1 text-accent hover:underline">
                    <span>{s.label}</span>
                    <ExternalLink className="mt-0.5 size-3 shrink-0" aria-hidden />
                  </a>
                ) : (
                  s.label
                )}
              </li>
            ))}
          </ul>
        </Row>
      )}
    </div>
  )
}

const ORDER: Verdict[] = ['exclui', 'contra', 'bate', 'possivel']

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1 sm:grid-cols-[8rem_minmax(0,1fr)]">
      <p className="text-xs font-medium tracking-wide text-ink-muted uppercase">{label}</p>
      <div className="min-w-0">{children}</div>
    </div>
  )
}
