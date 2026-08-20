import { getAnalytics, isSupported } from 'firebase/analytics'
import { firebaseApp, isFirebaseConfigured, measurementId } from './firebase'

/**
 * Analytics is opt-in. `main.tsx` only imports this module when
 * `VITE_FIREBASE_MEASUREMENT_ID` is set, so with measurement off the SDK is
 * never fetched. `isSupported()` additionally skips environments where
 * measurement can't work (no cookies, no IndexedDB, some in-app browsers).
 *
 * Note: when the network blocks Google's endpoints — ad blockers, corporate
 * proxies — the SDK still logs a failed request of its own after this resolves.
 * It is cosmetic, and not something a caller can catch.
 */
export async function initAnalytics(): Promise<void> {
  if (!isFirebaseConfigured || !measurementId) return

  try {
    if (!(await isSupported())) return
    getAnalytics(firebaseApp())
  } catch (error) {
    // Measurement is never worth breaking a page load over.
    console.error('Analytics could not start', error)
  }
}
