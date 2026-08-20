import { FirebaseError } from 'firebase/app'

/**
 * Firebase error codes are not user-facing text. Map them to i18n keys so the
 * UI never renders a raw `auth/...` string, and never leaks whether an email
 * is registered on the login screen.
 */
const CODE_TO_KEY: Record<string, string> = {
  'auth/invalid-credential': 'auth.errors.invalidCredentials',
  'auth/invalid-login-credentials': 'auth.errors.invalidCredentials',
  'auth/wrong-password': 'auth.errors.invalidCredentials',
  'auth/user-not-found': 'auth.errors.invalidCredentials',
  'auth/email-already-in-use': 'auth.errors.emailInUse',
  'auth/invalid-email': 'auth.errors.invalidEmail',
  'auth/weak-password': 'auth.errors.weakPassword',
  'auth/too-many-requests': 'auth.errors.tooManyRequests',
  'auth/popup-closed-by-user': 'auth.errors.popupClosed',
  'auth/cancelled-popup-request': 'auth.errors.popupClosed',
  'auth/popup-blocked': 'auth.errors.popupBlocked',
  'auth/network-request-failed': 'auth.errors.network',
}

export function authErrorKey(error: unknown): string {
  if (error instanceof FirebaseError && CODE_TO_KEY[error.code]) {
    return CODE_TO_KEY[error.code]
  }
  return 'auth.errors.generic'
}
