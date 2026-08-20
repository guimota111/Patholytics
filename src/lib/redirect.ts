/**
 * Only same-origin, path-relative redirects are honoured, so a crafted
 * `?next=https://evil.example` can't turn the login screen into an open
 * redirect.
 */
export function safeRedirect(value: string | null, fallback = '/dashboard'): string {
  if (!value) return fallback
  if (!value.startsWith('/') || value.startsWith('//')) return fallback
  return value
}
