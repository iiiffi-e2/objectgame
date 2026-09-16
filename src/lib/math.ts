export const TAU = Math.PI * 2

export function wrapAngle(radians: number): number {
  const wrapped = radians % TAU
  return wrapped < 0 ? wrapped + TAU : wrapped
}

export function shortestAngleDelta(from: number, to: number): number {
  const diff = wrapAngle(to) - wrapAngle(from)
  if (diff > Math.PI) return diff - TAU
  if (diff < -Math.PI) return diff + TAU
  return diff
}

export function angularDistance(a: number, b: number): number {
  return Math.abs(shortestAngleDelta(a, b))
}

export function isWithinAngularTolerance(
  current: number,
  target: number,
  tolerance: number,
): boolean {
  return angularDistance(current, target) <= tolerance
}

export function nearestDetent(angle: number, detentCount: number): number {
  const step = TAU / detentCount
  const wrapped = wrapAngle(angle)
  const index = Math.round(wrapped / step) % detentCount
  return wrapAngle(index * step)
}

export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value))
}

export function damp(current: number, target: number, lambda: number, dt: number): number {
  return lerp(current, target, 1 - Math.exp(-lambda * dt))
}

export function signedDamp(current: number, target: number, lambda: number, dt: number): number {
  return current + shortestAngleDelta(current, target) * (1 - Math.exp(-lambda * dt))
}
