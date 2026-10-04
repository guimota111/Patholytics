import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/cn'

/**
 * Quadro que rola de lado. Existe por causa do celular: as tabelas largas
 * (mapa de cassetes, comparações, mapa de TMA) não cabem em 390 px e, sem um
 * sinal, a barra de rolagem some no toque e a pessoa não descobre que há mais
 * colunas. Aqui as bordas ganham um esmaecido enquanto houver conteúdo do lado
 * — some sozinho quando a tabela inteira cabe, então no desktop não aparece
 * nada.
 */
export function ScrollX({
  children,
  className,
  innerClassName,
}: {
  children: ReactNode
  className?: string
  innerClassName?: string
}) {
  const ref = useRef<HTMLDivElement>(null)
  const [edges, setEdges] = useState({ start: false, end: false })

  const measure = useCallback(() => {
    const el = ref.current
    if (!el) return
    const max = el.scrollWidth - el.clientWidth
    setEdges({ start: el.scrollLeft > 2, end: max > 2 && el.scrollLeft < max - 2 })
  }, [])

  useEffect(() => {
    const el = ref.current
    if (!el) return
    measure()
    // O conteúdo muda de largura sozinho (colunas a mais, linhas novas), então
    // remedir só na rolagem deixaria o aviso preso no estado antigo.
    const observer = new ResizeObserver(measure)
    observer.observe(el)
    if (el.firstElementChild) observer.observe(el.firstElementChild)
    return () => observer.disconnect()
  }, [measure])

  return (
    <div className={cn('relative', className)}>
      <div ref={ref} onScroll={measure} className={cn('scroll-x', innerClassName)}>
        {children}
      </div>
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-y-0 left-0 w-6 bg-linear-to-r from-ink/15 to-transparent transition-opacity duration-150',
          edges.start ? 'opacity-100' : 'opacity-0',
        )}
      />
      <span
        aria-hidden
        className={cn(
          'pointer-events-none absolute inset-y-0 right-0 w-6 bg-linear-to-l from-ink/15 to-transparent transition-opacity duration-150',
          edges.end ? 'opacity-100' : 'opacity-0',
        )}
      />
    </div>
  )
}
