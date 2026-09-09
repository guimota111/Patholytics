import { useTranslation } from 'react-i18next'
import { formatShort, speedPosition } from '../stats'

/**
 * Meio-arco de velocidade: a média desta sessão contra uma referência do
 * histórico. Verde quando está mais rápido que a referência, vermelho quando
 * mais lento; o traço dourado marca onde a referência fica na escala.
 */
export function Speedometer({
  label,
  icon,
  currentMs,
  refMs,
}: {
  label: string
  icon: string
  currentMs: number
  refMs: number
}) {
  const { t } = useTranslation()
  const R = 62
  const cx = 80
  const cy = 76
  const arcLength = Math.PI * R
  const current = speedPosition(currentMs)
  const reference = speedPosition(refMs)
  const track = `M ${cx - R} ${cy} A ${R} ${R} 0 0 1 ${cx + R} ${cy}`
  const dash = current >= 0 ? (current * arcLength).toFixed(1) : '0'
  const diffPct = refMs > 0 ? Math.round((Math.abs(currentMs - refMs) / refMs) * 100) : 0
  const faster = currentMs > 0 && refMs > 0 && currentMs < refMs && diffPct > 0
  const slower = currentMs > 0 && refMs > 0 && currentMs > refMs && diffPct > 0
  const arcColor = faster ? 'var(--color-success)' : slower ? 'var(--color-danger)' : 'var(--color-accent)'

  const point = (position: number, radius: number) => {
    const angle = Math.PI - position * Math.PI
    return [(cx + radius * Math.cos(angle)).toFixed(1), (cy - radius * Math.sin(angle)).toFixed(1)]
  }
  const [refOuterX, refOuterY] = point(reference, R + 5)
  const [refInnerX, refInnerY] = point(reference, R - 14)
  const [needleX, needleY] = point(current, R - 10)

  return (
    <div className="rounded-md border border-line bg-surface px-3 py-3 text-center">
      <svg viewBox="0 0 160 88" className="mx-auto w-full max-w-[11rem]" aria-hidden>
        <path d={track} fill="none" stroke="var(--color-line)" strokeWidth="11" strokeLinecap="round" />
        <path
          d={track}
          fill="none"
          stroke={arcColor}
          strokeWidth="11"
          strokeLinecap="round"
          strokeDasharray={`${dash} ${arcLength.toFixed(1)}`}
        />
        {reference >= 0 && (
          <line x1={refOuterX} y1={refOuterY} x2={refInnerX} y2={refInnerY} stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />
        )}
        {current >= 0 && (
          <>
            <line x1={cx} y1={cy} x2={needleX} y2={needleY} stroke="var(--color-ink)" strokeWidth="2.5" strokeLinecap="round" />
            <circle cx={cx} cy={cy} r="5" fill="var(--color-elevated)" stroke="var(--color-ink)" strokeWidth="1.5" />
          </>
        )}
        <text x="12" y="87" fill="var(--color-ink-faint)" fontSize="9" fontFamily="system-ui, sans-serif">
          {t('production.speed.slow')}
        </text>
        <text x="119" y="87" fill="var(--color-ink-faint)" fontSize="9" fontFamily="system-ui, sans-serif">
          {t('production.speed.fast')}
        </text>
      </svg>
      <p className="text-xs font-medium text-ink">{label}</p>
      <p className="tabular text-sm font-semibold text-accent-ink">
        {formatShort(currentMs)}
        <span className="font-normal text-ink-faint">/{t('production.speed.perCase')}</span>
      </p>
      <p className="tabular text-xs text-ink-faint">
        {icon} {t('production.speed.ref')} {formatShort(refMs)}
      </p>
      <p className={`mt-1 text-xs font-medium ${faster ? 'text-success' : slower ? 'text-danger' : 'text-ink-faint'}`}>
        {faster
          ? t('production.speed.faster', { pct: diffPct })
          : slower
            ? t('production.speed.slower', { pct: diffPct })
            : t('production.speed.equal')}
      </p>
    </div>
  )
}
