export type LiteGraphicsInput = {
  userAgent?: string
  pointerCoarse?: boolean
  search?: string
}

export function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export function isCoarsePointer(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(pointer: coarse)').matches
}

export function needsLiteGraphics(input: LiteGraphicsInput = {}): boolean {
  const search = input.search ?? (typeof window === 'undefined' ? '' : window.location.search)
  const liteQuery = new URLSearchParams(search).get('lite')
  if (liteQuery === '1' || liteQuery === 'true') return true
  const userAgent = input.userAgent ?? (typeof navigator === 'undefined' ? '' : navigator.userAgent)
  if (/Android/i.test(userAgent)) return true
  if (/iPhone|iPad|iPod/i.test(userAgent)) return true
  const pointerCoarse =
    input.pointerCoarse ??
    (typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches)
  return pointerCoarse
}

export function msUntilNextUtcMidnight(now = Date.now()): number {
  const date = new Date(now)
  const next = Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate() + 1)
  return Math.max(0, next - now)
}
