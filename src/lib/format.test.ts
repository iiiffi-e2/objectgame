import { describe, expect, it } from 'vitest'
import { formatCountdown, formatMmSs } from './format'

describe('formatMmSs', () => {
  it('renders zero as 00:00', () => {
    expect(formatMmSs(0)).toBe('00:00')
  })

  it('floors to whole seconds', () => {
    expect(formatMmSs(167_400)).toBe('02:47')
  })

  it('pads minutes past ten', () => {
    expect(formatMmSs(12 * 60_000 + 5_000)).toBe('12:05')
  })
})

describe('formatCountdown', () => {
  it('renders HH:MM:SS', () => {
    expect(formatCountdown(8 * 3600_000 + 13 * 60_000 + 24_000)).toBe('08:13:24')
  })
})
