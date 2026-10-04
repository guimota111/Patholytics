import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import App from '@/App'
import { AuthProvider } from '@/contexts/AuthProvider'
import { ToolErrorBoundary, reloadOnceForStaleChunk } from '@/components/ToolErrorBoundary'
import '@/i18n'
import '@/index.css'

// Gating the import (not just the call) is what keeps the Analytics SDK from
// being fetched at all when measurement is switched off.
if (import.meta.env.VITE_FIREBASE_MEASUREMENT_ID) {
  void import('@/lib/analytics').then(({ initAnalytics }) => initAnalytics())
}

// O Vite avisa quando o preload de um chunk (JS ou CSS) falha — quase sempre
// uma aba aberta antes do último deploy. Recarregar pega o build novo.
window.addEventListener('vite:preloadError', (event) => {
  if (reloadOnceForStaleChunk()) event.preventDefault()
})

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <ToolErrorBoundary resetKey="root">
          <App />
        </ToolErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)
