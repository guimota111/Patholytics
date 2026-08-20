import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/** SPA navigation keeps scroll position by default; reset it on route change. */
export function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo(0, 0)
  }, [pathname])

  return null
}
