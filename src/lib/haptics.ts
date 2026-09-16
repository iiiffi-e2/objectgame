export function haptic(duration = 10): void {
  if (typeof navigator === 'undefined') return
  if (typeof navigator.vibrate !== 'function') return
  try {
    navigator.vibrate(duration)
  } catch {
    // Some browsers expose vibrate but reject it outside user gestures.
  }
}
