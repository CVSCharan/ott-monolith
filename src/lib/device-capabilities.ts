/**
 * Device capability and network guards.
 * Source of truth: docs/design/design-tokens.md & docs/design/motion-and-interaction.md
 */

/**
 * Determines whether a trailer video can autoplay on the current client.
 * Returns false if:
 * 1. User has Data Saver enabled (Save-Data header / API).
 * 2. Network connection is slow (slow-2g or 2g).
 * 3. User prefers reduced motion.
 */
export function shouldAutoplayTrailer(): boolean {
  if (typeof window === 'undefined') return false

  // 1. Check Data Saver (Save-Data API) and low-bandwidth connections
  const conn = (
    navigator as unknown as { connection?: { saveData?: boolean; effectiveType?: string } }
  ).connection
  if (conn?.saveData || conn?.effectiveType === 'slow-2g' || conn?.effectiveType === '2g') {
    return false
  }

  // 2. Check Reduced Motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  if (prefersReducedMotion) {
    return false
  }

  return true
}
