import { describe, expect, it } from 'vitest'
import {
  angularDistance,
  clamp,
  isWithinAngularTolerance,
  lerp,
  nearestDetent,
  shortestAngleDelta,
  wrapAngle,
} from './math'

const TAU = Math.PI * 2

describe('wrapAngle', () => {
  it('keeps an angle already in range', () => {
    expect(wrapAngle(1.2)).toBeCloseTo(1.2)
  })

  it('wraps a full turn back to zero', () => {
    expect(wrapAngle(TAU)).toBeCloseTo(0)
  })

  it('wraps negative angles into [0, tau)', () => {
    expect(wrapAngle(-Math.PI / 2)).toBeCloseTo((3 * Math.PI) / 2)
  })
})

describe('shortestAngleDelta', () => {
  it('returns a small positive step', () => {
    expect(shortestAngleDelta(0, 0.2)).toBeCloseTo(0.2)
  })

  it('wraps the long way around to a short negative step', () => {
    expect(shortestAngleDelta(0.1, TAU - 0.1)).toBeCloseTo(-0.2)
  })
})

describe('angularDistance', () => {
  it('is symmetric across the wrap boundary', () => {
    expect(angularDistance(0.05, TAU - 0.05)).toBeCloseTo(0.1)
  })
})

describe('isWithinAngularTolerance', () => {
  it('accepts values inside the tolerance even across wrap', () => {
    expect(isWithinAngularTolerance(0.05, TAU - 0.04, 0.12)).toBe(true)
  })

  it('rejects values outside the tolerance', () => {
    expect(isWithinAngularTolerance(0, 0.5, 0.2)).toBe(false)
  })
})

describe('nearestDetent', () => {
  it('snaps to the closest of 24 detents', () => {
    const step = TAU / 24
    expect(nearestDetent(step * 3.4, 24)).toBeCloseTo(step * 3)
    expect(nearestDetent(step * 3.6, 24)).toBeCloseTo(step * 4)
  })
})

describe('lerp / clamp', () => {
  it('interpolates and clamps', () => {
    expect(lerp(0, 10, 0.25)).toBeCloseTo(2.5)
    expect(clamp(12, 0, 10)).toBe(10)
    expect(clamp(-1, 0, 10)).toBe(0)
  })
})
