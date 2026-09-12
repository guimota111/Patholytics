/* ==========================================================================
   BodyMap.tsx — o boneco clicável. Uma silhueta de frente, dividida em
   regiões; clicar numa região seleciona-a e a página mostra os locais dela
   como chips. É um atalho visual: tudo que o mapa faz também dá para fazer
   pelas listas ao lado, para funcionar no teclado e no celular.

   A silhueta é montada de formas simples (elipse, retângulos arredondados,
   um trapézio para o tronco) e as regiões são desenhadas por cima, recortadas
   pela própria silhueta para nunca vazar do corpo.
   ========================================================================== */

import { useId, useState } from 'react'
import { cn } from '@/lib/cn'
import { REGIONS, type RegionId } from '../types'

interface BodyMapProps {
  selected: RegionId | null
  onSelect: (region: RegionId) => void
  className?: string
}

const W = 240
const H = 470

interface Hotspot {
  id: RegionId
  d: string
  label?: { x: number; y: number; text: string; size?: number }
}

/* Peças da silhueta, em coordenadas do viewBox. */
const HEAD = { cx: 120, cy: 44, rx: 28, ry: 33 }
const NECK = 'M107 70 H133 V94 H107 Z'
const TRUNK = 'M52 104 Q52 96 62 96 H178 Q188 96 188 104 L182 300 H58 Z'
const ARM_L = 'M28 108 Q28 98 38 98 H50 Q56 98 56 108 L54 296 Q54 304 46 304 H36 Q28 304 28 296 Z'
const ARM_R = 'M184 108 Q184 98 190 98 H202 Q212 98 212 108 L212 296 Q212 304 204 304 H194 Q186 304 186 296 Z'
const LEG_L = 'M62 302 H116 L112 450 Q112 458 104 458 H74 Q66 458 66 450 Z'
const LEG_R = 'M124 302 H178 L174 450 Q174 458 166 458 H136 Q128 458 128 450 Z'

const HOTSPOTS: Hotspot[] = [
  { id: 'cns', d: 'M80 8 H160 V44 H80 Z', label: { x: 120, y: 34, text: 'SNC', size: 9 } },
  { id: 'head', d: 'M80 44 H160 V60 H80 Z', label: { x: 120, y: 55, text: 'orelha · nariz', size: 7 } },
  { id: 'jaw', d: 'M80 60 H160 V80 H80 Z', label: { x: 120, y: 71, text: 'boca', size: 7 } },
  { id: 'neck', d: NECK, label: { x: 120, y: 86, text: 'pescoço', size: 7 } },
  { id: 'thorax', d: 'M52 96 H188 L186 176 H54 Z', label: { x: 120, y: 118, text: 'tórax', size: 9 } },
  { id: 'breast', d: 'M96 130 a17 17 0 1 0 0.01 0 Z', label: { x: 96, y: 150, text: 'mama', size: 7 } },
  { id: 'breast', d: 'M144 130 a17 17 0 1 0 0.01 0 Z', label: { x: 144, y: 150, text: 'mama', size: 7 } },
  { id: 'abdomen', d: 'M54 178 H186 L184 246 H56 Z', label: { x: 120, y: 216, text: 'abdome', size: 9 } },
  { id: 'pelvis', d: 'M56 248 H184 L182 300 H58 Z', label: { x: 120, y: 278, text: 'pelve', size: 9 } },
  { id: 'skin', d: ARM_L, label: { x: 42, y: 205, text: 'pele', size: 8 } },
  { id: 'skin', d: ARM_R },
  { id: 'bone', d: `${LEG_L} ${LEG_R}`, label: { x: 120, y: 380, text: 'osso · articulações', size: 7 } },
]

export function BodyMap({ selected, onSelect, className }: BodyMapProps) {
  const [hover, setHover] = useState<RegionId | null>(null)
  const clipId = useId()
  const label = (id: RegionId) => REGIONS.find((r) => r.id === id)?.label ?? id
  const shown = hover ?? selected

  return (
    <figure className={cn('space-y-2', className)}>
      <svg viewBox={`0 0 ${W} ${H}`} className="mx-auto block w-full max-w-[15rem] select-none" role="group" aria-label="Mapa do corpo">
        <defs>
          <clipPath id={clipId}>
            <ellipse cx={HEAD.cx} cy={HEAD.cy} rx={HEAD.rx} ry={HEAD.ry} />
            <path d={NECK} />
            <path d={TRUNK} />
            <path d={ARM_L} />
            <path d={ARM_R} />
            <path d={LEG_L} />
            <path d={LEG_R} />
          </clipPath>
        </defs>

        {/* Silhueta */}
        <g fill="var(--color-elevated)" stroke="var(--color-line-strong)" strokeWidth={1.2}>
          <ellipse cx={HEAD.cx} cy={HEAD.cy} rx={HEAD.rx} ry={HEAD.ry} />
          <path d={NECK} />
          <path d={TRUNK} />
          <path d={ARM_L} />
          <path d={ARM_R} />
          <path d={LEG_L} />
          <path d={LEG_R} />
        </g>

        {/* Regiões, recortadas pela silhueta */}
        <g clipPath={`url(#${clipId})`}>
          {HOTSPOTS.map((h, i) => {
            const active = selected === h.id
            const hot = hover === h.id
            return (
              <path
                key={`${h.id}-${i}`}
                d={h.d}
                fill={active ? 'var(--color-accent)' : hot ? 'var(--color-accent-soft)' : 'transparent'}
                fillOpacity={active ? 0.85 : 1}
                stroke="var(--color-line)"
                strokeWidth={0.8}
                strokeDasharray={active || hot ? undefined : '2 2'}
                style={{ cursor: 'pointer', transition: 'fill 120ms' }}
                onClick={() => onSelect(h.id)}
                onMouseEnter={() => setHover(h.id)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(h.id)}
                onBlur={() => setHover(null)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    onSelect(h.id)
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={label(h.id)}
                aria-pressed={active}
              />
            )
          })}
        </g>

        {/* Rótulos curtos */}
        {HOTSPOTS.map((h, i) =>
          h.label ? (
            <text
              key={`t-${h.id}-${i}`}
              x={h.label.x}
              y={h.label.y}
              textAnchor="middle"
              fontSize={h.label.size ?? 8}
              fontWeight={600}
              fill={selected === h.id ? '#fff' : 'var(--color-ink-muted)'}
              pointerEvents="none"
            >
              {h.label.text}
            </text>
          ) : null,
        )}
      </svg>
      <figcaption className="min-h-5 text-center text-xs text-ink-muted">{shown ? label(shown) : ' '}</figcaption>
    </figure>
  )
}
