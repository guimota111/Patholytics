import { fragRotacao, polarToXY, sectorAngles, sectorPath, tintaHex } from '../mohs'
import type { MohsFrag } from '../types'

interface MohsDiagramProps {
  frag: MohsFrag
  /** Clique num setor marca/desmarca tumor na margem. */
  onToggleTumor?: (index: number) => void
  /** Versão papel: traço escuro sobre branco, sem interação. */
  paper?: boolean
}

/**
 * A peça vista de cima, com o mostrador do relógio em volta para orientar o
 * eixo. Cada divisão é um setor pintado com a tinta da margem; tumor na
 * margem fica com o contorno vermelho.
 */
export function MohsDiagram({ frag, onToggleTumor, paper = false }: MohsDiagramProps) {
  const size = 240
  const cx = size / 2
  const cy = size / 2
  const r = size / 2 - 28
  const n = frag.divisoes.length
  const rot = fragRotacao(frag)

  const tickColor = paper ? '#999' : 'var(--color-line-strong)'
  const tickMajor = paper ? '#555' : 'var(--color-ink-faint)'
  const numColor = paper ? '#666' : 'var(--color-ink-faint)'
  const stroke = paper ? '#333' : 'var(--color-elevated)'
  const labelFill = paper ? '#111' : 'var(--color-ink)'
  const labelHalo = paper ? '#fff' : 'var(--color-elevated)'
  const tumorColor = paper ? '#c00000' : 'var(--color-danger)'

  return (
    <svg viewBox={`0 0 ${size} ${size}`} className={paper ? undefined : 'mx-auto block w-full max-w-[15rem]'} aria-hidden>
      {Array.from({ length: 12 }, (_, h) => {
        const deg = h * 30
        const major = h % 3 === 0
        const a = polarToXY(cx, cy, r + 4, deg)
        const b = polarToXY(cx, cy, r + (major ? 11 : 8), deg)
        const label = major ? polarToXY(cx, cy, r + 20, deg) : null
        return (
          <g key={h}>
            <line x1={a.x.toFixed(2)} y1={a.y.toFixed(2)} x2={b.x.toFixed(2)} y2={b.y.toFixed(2)} stroke={major ? tickMajor : tickColor} strokeWidth={major ? 1.8 : 1.2} />
            {label && (
              <text x={label.x.toFixed(2)} y={label.y.toFixed(2)} textAnchor="middle" dominantBaseline="middle" fill={numColor} fontSize="10" fontWeight="700" fontFamily="Arial, Helvetica, sans-serif">
                {h === 0 ? 12 : h}
              </text>
            )}
          </g>
        )
      })}

      {frag.divisoes.map((d, i) => {
        const ang = sectorAngles(frag.shape, rot, n, i)
        const hex = tintaHex(d.cor)
        const pintado = hex !== 'transparent'
        return (
          <path
            key={`s${i}`}
            d={sectorPath(cx, cy, r, ang.start, ang.end)}
            fill={pintado ? hex : 'rgba(148,163,184,0.16)'}
            fillOpacity={pintado ? 0.82 : 1}
            stroke={d.tumor ? tumorColor : stroke}
            strokeWidth={d.tumor ? (paper ? 2.4 : 2.8) : paper ? 1.4 : 2}
            onClick={onToggleTumor ? () => onToggleTumor(i) : undefined}
            style={onToggleTumor ? { cursor: 'pointer' } : undefined}
          />
        )
      })}

      {frag.divisoes.map((d, i) => {
        const ang = sectorAngles(frag.shape, rot, n, i)
        const mid = (ang.start + ang.end) / 2
        const lp = n === 1 && frag.shape === 'circle' ? { x: cx, y: cy } : polarToXY(cx, cy, r * 0.62, mid)
        return (
          <g key={`l${i}`} pointerEvents="none">
            <text x={lp.x.toFixed(2)} y={lp.y.toFixed(2)} textAnchor="middle" dominantBaseline="middle" fill={labelFill} stroke={labelHalo} strokeWidth="2.6" paintOrder="stroke" fontSize="11" fontWeight="700" fontFamily="Arial, Helvetica, sans-serif">
              {d.label}
            </text>
            {d.tumor && (
              <text x={lp.x.toFixed(2)} y={(lp.y + 15).toFixed(2)} textAnchor="middle" dominantBaseline="middle" fill={tumorColor} stroke={labelHalo} strokeWidth="2.6" paintOrder="stroke" fontSize="10" fontWeight="700" fontFamily="Arial, Helvetica, sans-serif">
                ● tumor
              </text>
            )}
          </g>
        )
      })}
    </svg>
  )
}
