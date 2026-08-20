import { getFirestore } from 'firebase/firestore'
import { firebaseApp } from './firebase'

/**
 * Deliberately a separate module from `firebase.ts`: only the profile service
 * imports it, and that service is loaded on demand, so the Firestore SDK stays
 * out of the bundle a signed-out visitor downloads.
 */
export const db = getFirestore(firebaseApp())
