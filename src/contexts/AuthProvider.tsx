import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile as updateAuthProfile,
  type User,
} from 'firebase/auth'
import { useTranslation } from 'react-i18next'
import { firebaseAuth, googleProvider, isFirebaseConfigured } from '@/lib/firebase'
import { normalizeLanguage, type Language } from '@/i18n'
import type { UserProfile } from '@/types/user'
import { AuthContext, type AuthContextValue } from './auth-context'

/**
 * Loaded on demand so the Firestore SDK never reaches a signed-out visitor's
 * bundle — the public landing page has no reason to pay for it.
 */
const profileService = () => import('@/services/userProfile')

export function AuthProvider({ children }: { children: ReactNode }) {
  const { i18n } = useTranslation()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [initializing, setInitializing] = useState(isFirebaseConfigured)

  /**
   * The language chosen while signed out is what a brand-new account should
   * inherit. Kept in a ref so the auth listener doesn't need to re-subscribe
   * every time the user flips the switcher.
   */
  const currentLanguage = useRef<Language>(normalizeLanguage(i18n.language))
  useEffect(() => {
    currentLanguage.current = normalizeLanguage(i18n.language)
  }, [i18n.language])

  useEffect(() => {
    if (!isFirebaseConfigured) return

    return onAuthStateChanged(firebaseAuth(), async (nextUser) => {
      setUser(nextUser)

      if (!nextUser) {
        setProfile(null)
        setInitializing(false)
        return
      }

      try {
        const { ensureUserProfile } = await profileService()
        const nextProfile = await ensureUserProfile(nextUser, { language: currentLanguage.current })
        setProfile(nextProfile)
        // A stored preference outranks browser detection on every device.
        if (nextProfile.language !== normalizeLanguage(i18n.language)) {
          void i18n.changeLanguage(nextProfile.language)
        }
      } catch (error) {
        // A failed profile read must not lock the user out of the app shell.
        console.error('Failed to load user profile', error)
        setProfile(null)
      } finally {
        setInitializing(false)
      }
    })
  }, [i18n])

  const signUpWithEmail = useCallback<AuthContextValue['signUpWithEmail']>(
    async ({ name, email, password }) => {
      const credential = await createUserWithEmailAndPassword(firebaseAuth(), email, password)
      const displayName = name.trim()
      if (displayName) {
        await updateAuthProfile(credential.user, { displayName })
      }
      const { ensureUserProfile } = await profileService()
      const created = await ensureUserProfile(credential.user, {
        displayName,
        language: currentLanguage.current,
      })
      setProfile(created)
    },
    [],
  )

  const signInWithEmail = useCallback<AuthContextValue['signInWithEmail']>(
    async ({ email, password }) => {
      await signInWithEmailAndPassword(firebaseAuth(), email, password)
    },
    [],
  )

  const signInWithGoogle = useCallback(async () => {
    await signInWithPopup(firebaseAuth(), googleProvider)
  }, [])

  const sendPasswordReset = useCallback(async (email: string) => {
    await sendPasswordResetEmail(firebaseAuth(), email)
  }, [])

  const signOut = useCallback(async () => {
    await firebaseSignOut(firebaseAuth())
  }, [])

  const updateProfile = useCallback<AuthContextValue['updateProfile']>(
    async (changes) => {
      if (!user) return

      const { updateUserProfile } = await profileService()
      await updateUserProfile(user.uid, changes)

      if (changes.displayName !== undefined && changes.displayName !== user.displayName) {
        await updateAuthProfile(user, { displayName: changes.displayName })
      }
      if (changes.language) {
        await i18n.changeLanguage(changes.language)
      }

      setProfile((previous) => (previous ? { ...previous, ...changes } : previous))
    },
    [i18n, user],
  )

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profile,
      initializing,
      signUpWithEmail,
      signInWithEmail,
      signInWithGoogle,
      sendPasswordReset,
      signOut,
      updateProfile,
    }),
    [
      user,
      profile,
      initializing,
      signUpWithEmail,
      signInWithEmail,
      signInWithGoogle,
      sendPasswordReset,
      signOut,
      updateProfile,
    ],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
