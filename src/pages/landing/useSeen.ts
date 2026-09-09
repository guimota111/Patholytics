import { useEffect, useRef, useState } from 'react'

/**
 * `true` a partir do momento em que o elemento chega perto da janela — e
 * nunca volta atrás. É o que segura o three.js: o modelo 3D de um snap só é
 * baixado e montado quando o visitante está prestes a chegar nele.
 */
export function useSeen<T extends HTMLElement>(rootMargin = '300px') {
  const ref = useRef<T | null>(null)
  const [seen, setSeen] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el || seen) return
    if (typeof IntersectionObserver === 'undefined') {
      setSeen(true)
      return
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true)
          observer.disconnect()
        }
      },
      { rootMargin },
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [seen, rootMargin])

  return { ref, seen }
}
