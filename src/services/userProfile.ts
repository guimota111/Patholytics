import type { User } from 'firebase/auth'
import { doc, getDoc, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/lib/firestore'
import { DEFAULT_LANGUAGE, normalizeLanguage, type Language } from '@/i18n'
import type { PlanId, UserProfile } from '@/types/user'

export const USERS_COLLECTION = 'users'

const userRef = (uid: string) => doc(db, USERS_COLLECTION, uid)

function toProfile(uid: string, data: Record<string, unknown>): UserProfile {
  return {
    uid,
    email: (data.email as string | null) ?? null,
    displayName: (data.displayName as string) ?? '',
    photoURL: (data.photoURL as string | null) ?? null,
    language: normalizeLanguage(data.language as string | undefined),
    plan: ((data.plan as PlanId) ?? 'free') satisfies PlanId,
    createdAt: (data.createdAt as UserProfile['createdAt']) ?? null,
    updatedAt: (data.updatedAt as UserProfile['updatedAt']) ?? null,
  }
}

/**
 * Reads `users/{uid}`, creating it on first sight. Google sign-in has no
 * separate "sign up" step, so the document has to be created lazily on any
 * first authenticated load rather than only in the email/password flow.
 */
export async function ensureUserProfile(
  user: User,
  overrides: { displayName?: string; language?: Language } = {},
): Promise<UserProfile> {
  const ref = userRef(user.uid)
  const snapshot = await getDoc(ref)

  if (snapshot.exists()) {
    return toProfile(user.uid, snapshot.data())
  }

  const displayName =
    overrides.displayName?.trim() || user.displayName?.trim() || user.email?.split('@')[0] || ''
  const language = overrides.language ?? DEFAULT_LANGUAGE

  await setDoc(ref, {
    email: user.email ?? null,
    displayName,
    photoURL: user.photoURL ?? null,
    language,
    plan: 'free' satisfies PlanId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })

  const created = await getDoc(ref)
  return toProfile(user.uid, created.data() ?? {})
}

export async function updateUserProfile(
  uid: string,
  changes: Partial<Pick<UserProfile, 'displayName' | 'language' | 'photoURL'>>,
): Promise<void> {
  await updateDoc(userRef(uid), { ...changes, updatedAt: serverTimestamp() })
}
