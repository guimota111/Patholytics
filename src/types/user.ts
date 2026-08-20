import type { Timestamp } from 'firebase/firestore'
import type { Language } from '@/i18n'

/** Placeholder until billing exists — every account is created on "free". */
export type PlanId = 'free'

/** Shape of the `users/{uid}` document. */
export interface UserProfile {
  uid: string
  email: string | null
  displayName: string
  photoURL: string | null
  language: Language
  plan: PlanId
  createdAt: Timestamp | null
  updatedAt: Timestamp | null
}
