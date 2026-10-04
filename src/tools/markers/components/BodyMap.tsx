/* ==========================================================================
   BodyMap.tsx — o boneco clicável do Marker Helper (o mesmo do nomeador de
   cistos, com uma região a mais: a perna direita é "linfonodo · medula",
   para os tumores hematolinfoides). Sobre a imagem do corpo ficam áreas
   sensíveis, uma por região; clicar numa delas seleciona a região e a página
   mostra os sítios dela como chips. É um atalho visual: tudo que o mapa faz
   também dá para fazer pelas listas ao lado, para funcionar no teclado e no
   celular.

   As áreas são posicionadas em porcentagem sobre a imagem (768 × 1376, a
   mesma proporção do quadro), então acompanham qualquer largura. Ao mexer
   nelas, confira com a imagem aberta ao lado: os números abaixo são a
   fração da largura e da altura do quadro, não pixels.
   ========================================================================== */

import { useState } from 'react'
import { cn } from '@/lib/cn'
import { REGIONS, type RegionId } from '../types'

import humanBodyImg from '@/assets/human_body.jpg'

interface BodyMapProps {
  selected: RegionId | null
  onSelect: (region: RegionId) => void
  className?: string
}

/** Área sensível: posição e tamanho em % do quadro, e o rótulo curto que aparece em cima. */
interface Hotspot {
  id: RegionId
  top: string
  left: string
  width: string
  height: string
  /** Só a primeira área de cada região leva rótulo (braços e pernas são duas). */
  label?: string
}

const HOTSPOTS: Hotspot[] = [
  { id: 'cns', top: '6%', left: '40%', width: '20%', height: '5.5%', label: 'SNC' },
  { id: 'head', top: '11.5%', left: '41%', width: '18%', height: '3.3%', label: 'orelha · nariz' },
  { id: 'jaw', top: '14.8%', left: '43%', width: '14%', height: '2.7%', label: 'boca' },
  { id: 'neck', top: '17.5%', left: '44%', width: '12%', height: '2.5%', label: 'pescoço' },
  { id: 'thorax', top: '20%', left: '44%', width: '12%', height: '12%', label: 'tórax' },
  { id: 'breast', top: '23%', left: '36.5%', width: '7.5%', height: '6.5%', label: 'mama' },
  { id: 'breast', top: '23%', left: '56%', width: '7.5%', height: '6.5%' },
  { id: 'abdomen', top: '32%', left: '40%', width: '20%', height: '12%', label: 'abdome' },
  { id: 'pelvis', top: '44%', left: '40%', width: '20%', height: '8%', label: 'pelve' },
  { id: 'skin', top: '21%', left: '23%', width: '15%', height: '29%', label: 'pele' },
  { id: 'skin', top: '21%', left: '62%', width: '15%', height: '29%' },
  { id: 'bone', top: '53%', left: '35%', width: '15%', height: '42%', label: 'osso · partes moles' },
  { id: 'hemato', top: '53%', left: '50%', width: '15%', height: '42%', label: 'linfonodo · medula' },
]

export function BodyMap({ selected, onSelect, className }: BodyMapProps) {
  const [hover, setHover] = useState<RegionId | null>(null)
  const label = (id: RegionId) => REGIONS.find((r) => r.id === id)?.label ?? id
  const shown = hover ?? selected

  return (
    <figure className={cn('space-y-2', className)}>
      <div
        className="relative mx-auto aspect-[768/1376] w-full max-w-[15rem] overflow-hidden rounded-xl border border-line bg-black select-none"
        role="group"
        aria-label="Mapa do corpo"
      >
        <img src={humanBodyImg} alt="" aria-hidden className="absolute inset-0 size-full object-cover" draggable={false} />

        {HOTSPOTS.map((h, i) => {
          const active = selected === h.id
          const hot = hover === h.id
          return (
            <button
              key={`${h.id}-${i}`}
              type="button"
              onClick={() => onSelect(h.id)}
              onMouseEnter={() => setHover(h.id)}
              onMouseLeave={() => setHover(null)}
              onFocus={() => setHover(h.id)}
              onBlur={() => setHover(null)}
              aria-label={label(h.id)}
              aria-pressed={active}
              style={{ top: h.top, left: h.left, width: h.width, height: h.height }}
              className={cn(
                'absolute flex items-center justify-center rounded-[45%] transition-colors duration-200',
                active
                  ? 'bg-accent/40 ring-2 ring-accent/70'
                  : hot
                    ? 'bg-accent/15 ring-1 ring-accent/40'
                    : 'bg-transparent',
              )}
            >
              {h.label && (
                <span
                  className={cn(
                    'pointer-events-none text-[0.625rem] font-semibold tracking-wide whitespace-nowrap text-white transition-opacity duration-200',
                    active || hot ? 'opacity-100' : 'opacity-0',
                  )}
                  style={{ textShadow: '0 1px 3px rgba(0,0,0,0.9)' }}
                >
                  {h.label}
                </span>
              )}
            </button>
          )
        })}
      </div>
      <figcaption className="min-h-5 text-center text-xs font-medium text-ink-muted">{shown ? label(shown) : ' '}</figcaption>
    </figure>
  )
}
