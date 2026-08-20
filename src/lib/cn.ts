/** Minimal class joiner — no dependency needed for the handful of variants here. */
export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(' ')
}
