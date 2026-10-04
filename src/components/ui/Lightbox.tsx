/* ==========================================================================
   Lightbox.tsx — a foto em tela cheia, com aumento.

   Numa foto de lâmina o detalhe é o conteúdo: a miniatura do verbete serve
   para reconhecer, não para examinar. Aqui a imagem abre do tamanho da tela e
   sobe até 8×, com o navegador cuidando da rolagem — é o que faz o arrasto
   funcionar igual no mouse e no toque, sem reimplementar pan.
   ========================================================================== */

import { useCallback, useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { ChevronLeft, ChevronRight, Maximize2, Minus, Plus, X } from 'lucide-react'
import { cn } from '@/lib/cn'

export interface LightboxPhoto {
  src: string
  caption?: string
  credit?: string
  stain?: string
}

interface LightboxProps {
  photos: LightboxPhoto[]
  index: number
  onIndexChange: (index: number) => void
  onClose: () => void
  /** Texto alternativo quando a foto não tem legenda. */
  alt: string
}

const MIN_ZOOM = 1
const MAX_ZOOM = 8
const STEP = 1.5
/** O aumento que um clique na imagem alcança — perto o bastante para ver célula. */
const TAP_ZOOM = 2.5

const clampZoom = (value: number) => Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, value))

export function Lightbox({ photos, index, onIndexChange, onClose, alt }: LightboxProps) {
  const { t } = useTranslation()
  const [zoom, setZoom] = useState(1)
  const scroller = useRef<HTMLDivElement>(null)
  /* Para onde olhar depois de mudar o aumento, em fração do conteúdo: sem isso
     o zoom salta para o canto em vez de crescer em volta do que se olhava. */
  const focus = useRef<{ x: number; y: number } | null>(null)
  const drag = useRef<{ x: number; y: number } | null>(null)

  const photo = photos[index]
  const many = photos.length > 1

  const go = useCallback(
    (delta: number) => {
      if (!many) return
      setZoom(1)
      onIndexChange((index + delta + photos.length) % photos.length)
    },
    [index, many, onIndexChange, photos.length],
  )

  /** Guarda o ponto observado antes de crescer, para recolocá-lo no lugar. */
  const zoomBy = useCallback((factor: number, at?: { clientX: number; clientY: number }) => {
    const box = scroller.current
    if (box) {
      const px = at ? at.clientX - box.getBoundingClientRect().left : box.clientWidth / 2
      const py = at ? at.clientY - box.getBoundingClientRect().top : box.clientHeight / 2
      focus.current = {
        x: (box.scrollLeft + px) / box.scrollWidth,
        y: (box.scrollTop + py) / box.scrollHeight,
      }
    }
    setZoom((z) => clampZoom(z * factor))
  }, [])

  const reset = () => {
    focus.current = null
    setZoom(1)
  }

  // Recoloca o ponto observado no centro depois que o conteúdo mudou de tamanho.
  useEffect(() => {
    const box = scroller.current
    if (!box) return
    if (!focus.current) {
      box.scrollTo({ left: (box.scrollWidth - box.clientWidth) / 2, top: (box.scrollHeight - box.clientHeight) / 2 })
      return
    }
    const { x, y } = focus.current
    box.scrollTo({
      left: x * box.scrollWidth - box.clientWidth / 2,
      top: y * box.scrollHeight - box.clientHeight / 2,
    })
  }, [zoom])

  // Trocar de foto recomeça do tamanho da tela.
  useEffect(() => {
    focus.current = null
    setZoom(1)
  }, [index])

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
      else if (event.key === 'ArrowRight') go(1)
      else if (event.key === 'ArrowLeft') go(-1)
      else if (event.key === '+' || event.key === '=') zoomBy(STEP)
      else if (event.key === '-') zoomBy(1 / STEP)
      else if (event.key === '0') reset()
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [go, onClose, zoomBy])

  // A página atrás não rola enquanto a foto está aberta.
  useEffect(() => {
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [])

  /* Listener nativo, e não `onWheel`: o React registra a roda do mouse como
     passiva, e ali `preventDefault()` não vale — a página rolaria junto com o
     aumento. */
  useEffect(() => {
    const box = scroller.current
    if (!box) return
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      zoomBy(event.deltaY < 0 ? STEP : 1 / STEP, event)
    }
    box.addEventListener('wheel', onWheel, { passive: false })
    return () => box.removeEventListener('wheel', onWheel)
  }, [zoomBy])

  /* Arrastar com o mouse. No toque não entra: a rolagem nativa do container já
     faz o mesmo, e melhor. */
  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (event.pointerType !== 'mouse' || zoom === 1) return
    drag.current = { x: event.clientX, y: event.clientY }
    event.currentTarget.setPointerCapture(event.pointerId)
  }
  const onPointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const from = drag.current
    const box = scroller.current
    if (!from || !box) return
    box.scrollLeft -= event.clientX - from.x
    box.scrollTop -= event.clientY - from.y
    drag.current = { x: event.clientX, y: event.clientY }
  }
  const endDrag = () => {
    drag.current = null
  }

  if (!photo) return null

  const caption = [photo.caption, photo.stain].filter(Boolean).join(' · ')
  const zoomed = zoom > 1

  const control = 'flex size-9 items-center justify-center rounded-md text-white/80 transition-colors hover:bg-white/15 hover:text-white disabled:opacity-35 disabled:hover:bg-transparent'

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-black/95"
      role="dialog"
      aria-modal="true"
      aria-label={photo.caption ?? alt}
    >
      <div className="flex shrink-0 items-center gap-1 px-3 py-2">
        {many && (
          <span className="tabular px-2 text-xs text-white/60">
            {t('lightbox.counter', { i: index + 1, n: photos.length })}
          </span>
        )}
        <span className="ml-auto flex items-center gap-1">
          <button type="button" onClick={() => zoomBy(1 / STEP)} disabled={zoom <= MIN_ZOOM} className={control} aria-label={t('lightbox.zoomOut')}>
            <Minus className="size-4" aria-hidden />
          </button>
          <span className="tabular w-12 text-center text-xs text-white/70">{zoom.toFixed(1)}×</span>
          <button type="button" onClick={() => zoomBy(STEP)} disabled={zoom >= MAX_ZOOM} className={control} aria-label={t('lightbox.zoomIn')}>
            <Plus className="size-4" aria-hidden />
          </button>
          <button type="button" onClick={reset} disabled={!zoomed} className={control} aria-label={t('lightbox.reset')}>
            <Maximize2 className="size-4" aria-hidden />
          </button>
          <button type="button" onClick={onClose} className={control} aria-label={t('lightbox.close')}>
            <X className="size-5" aria-hidden />
          </button>
        </span>
      </div>

      <div className="relative flex min-h-0 flex-1">
        {many && (
          <button
            type="button"
            onClick={() => go(-1)}
            className="absolute top-1/2 left-2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white/80 transition-colors hover:bg-black/70 hover:text-white"
            aria-label={t('lightbox.prev')}
          >
            <ChevronLeft className="size-6" aria-hidden />
          </button>
        )}

        <div
          ref={scroller}
          className={cn('min-h-0 flex-1 overflow-auto overscroll-contain', zoomed && 'cursor-grab active:cursor-grabbing')}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onClick={(event) => {
            // Clicar no vazio em volta da foto fecha; na foto, aproxima.
            if (event.target === event.currentTarget) onClose()
          }}
        >
          <div className="flex items-center justify-center" style={{ width: `${zoom * 100}%`, height: `${zoom * 100}%` }}>
            <img
              src={photo.src}
              alt={photo.caption ?? alt}
              draggable={false}
              onClick={(event) => (zoomed ? reset() : zoomBy(TAP_ZOOM, event))}
              /* `h-full w-full` e não `max-*`: sem tamanho definido a imagem
                 para no tamanho original e `object-contain` não tem o que
                 conter — o aumento mudava o número e não a foto. */
              className={cn('h-full w-full object-contain select-none', zoomed ? 'cursor-zoom-out' : 'cursor-zoom-in')}
            />
          </div>
        </div>

        {many && (
          <button
            type="button"
            onClick={() => go(1)}
            className="absolute top-1/2 right-2 z-10 flex size-11 -translate-y-1/2 items-center justify-center rounded-full bg-black/50 text-white/80 transition-colors hover:bg-black/70 hover:text-white"
            aria-label={t('lightbox.next')}
          >
            <ChevronRight className="size-6" aria-hidden />
          </button>
        )}
      </div>

      <div className="shrink-0 px-4 py-3 text-center">
        {caption && <p className="text-sm text-white">{caption}</p>}
        {photo.credit && <p className="mt-0.5 text-xs text-white/55">{t('catalog.credit', { name: photo.credit })}</p>}
        <p className="mt-1 text-[0.6875rem] text-white/35">{t('lightbox.hint')}</p>
      </div>
    </div>
  )
}
