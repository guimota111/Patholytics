import { createContext } from 'react'
import type { User } from 'firebase/auth'
import type { Language } from '@/i18n'
import type { UserProfile } from '@/types/user'

export interface AuthContextValue {
  user: User | null
  profile: UserProfile | null
  /** True until the first `onAuthStateChanged` settles — guards route redirects. */
  initializing: boolean
  signUpWithEmail: (input: { name: string; email: string; password: string }) => Promise<void>
  signInWithEmail: (input: { email: string; password: string }) => Promise<void>
  signInWithGoogle: () => Promise<void>
  sendPasswordReset: (email: string) => Promise<void>
  signOut: () => Promise<void>
  updateProfile: (changes: { displayName?: string; language?: Language }) => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
