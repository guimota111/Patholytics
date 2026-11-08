/** Um quadrado de 1 mm ao lado do círculo do campo, na mesma escala. */
export function FieldIllustration({ diameter, label }: { diameter: number; label: string }) {
  const S = 88 // px por mm
  const r = Math.min((diameter * S) / 2, S)
  const cx = S * 1.5 + r + 2
  // Largura mínima para a legenda centrada sob o círculo não ser cortada.
  const width = cx + Math.max(r, 60) + 4
  return (
    <svg width={width} height={S + 26} viewBox={`0 0 ${width} ${S + 26}`} aria-hidden className="max-w-full shrink-0">
      <rect x={1} y={1} width={S} height={S} fill="none" stroke="var(--color-ink-faint)" strokeWidth={1.5} strokeDasharray="4 3" />
      <text x={1 + S / 2} y={S + 18} textAnchor="middle" fontSize="11" fill="var(--color-ink-muted)">
        1 mm²
      </text>
      <circle
        cx={cx}
        cy={1 + S / 2}
        r={r}
        fill="color-mix(in oklab, var(--color-accent) 25%, transparent)"
        stroke="var(--color-accent)"
        strokeWidth={2}
      />
      <text x={cx} y={S + 18} textAnchor="middle" fontSize="11" fill="var(--color-ink-muted)">
        {label}
      </text>
    </svg>
  )
}
