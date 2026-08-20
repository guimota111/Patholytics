import { initializeApp, type FirebaseApp, type FirebaseOptions } from 'firebase/app'
import { getAuth, GoogleAuthProvider, type Auth } from 'firebase/auth'

const firebaseConfig: FirebaseOptions = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
}

/**
 * True only when every required key is present. A fresh clone with an empty
 * `.env` is a normal state, so the UI checks this and renders a setup notice
 * instead of attempting to authenticate.
 */
export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey && firebaseConfig.authDomain && firebaseConfig.projectId && firebaseConfig.appId,
)

let appInstance: FirebaseApp | null = null
let authInstance: Auth | null = null

/**
 * Initialisation is deferred rather than done at module scope: `getAuth()`
 * throws `auth/invalid-api-key` on an empty config, and at module scope that
 * throw happens before React mounts and blanks the whole page. Every caller
 * below is either behind an `isFirebaseConfigured` check or behind a route
 * guard that implies one.
 */
export function firebaseApp(): FirebaseApp {
  if (!isFirebaseConfigured) {
    throw new Error('Firebase is not configured. Fill in the VITE_FIREBASE_* variables in .env.')
  }
  appInstance ??= initializeApp(firebaseConfig)
  return appInstance
}

export function firebaseAuth(): Auth {
  authInstance ??= getAuth(firebaseApp())
  return authInstance
}

export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({ prompt: 'select_account' })
