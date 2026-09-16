import { describe, expect, it } from 'vitest'
import { OBJECT_001_CONFIG } from './object001Config'
import {
  countDiscoveries,
  evaluateRingAlignment,
  nearestRingDetent,
} from './puzzleLogic'

describe('evaluateRingAlignment', () => {
  it('rejects scrambled starting rotations', () => {
    const result = evaluateRingAlignment(
      {
        outer: OBJECT_001_CONFIG.initial.outer,
        middle: OBJECT_001_CONFIG.initial.middle,
        inner: OBJECT_001_CONFIG.initial.inner,
      },
      OBJECT_001_CONFIG,
    )
    expect(result.allAligned).toBe(false)
    expect(result.alignedCount).toBe(0)
    expect(result.shadowForming).toBe(false)
  })

  it('accepts all three rings within tolerance, including wrap-around', () => {
    const { rings, tolerance } = OBJECT_001_CONFIG
    const result = evaluateRingAlignment(
      {
        outer: rings.outer.target + tolerance * 0.5,
        middle: rings.middle.target - tolerance * 0.4,
        inner: rings.inner.target + Math.PI * 2 - tolerance * 0.2,
      },
      OBJECT_001_CONFIG,
    )
    expect(result.outerAligned).toBe(true)
    expect(result.middleAligned).toBe(true)
    expect(result.innerAligned).toBe(true)
    expect(result.allAligned).toBe(true)
  })

  it('marks the shadow as forming when two rings are near', () => {
    const { rings } = OBJECT_001_CONFIG
    const result = evaluateRingAlignment(
      {
        outer: rings.outer.target,
        middle: rings.middle.target,
        inner: OBJECT_001_CONFIG.initial.inner,
      },
      OBJECT_001_CONFIG,
    )
    expect(result.allAligned).toBe(false)
    expect(result.nearCount).toBeGreaterThanOrEqual(2)
    expect(result.shadowForming).toBe(true)
  })
})

describe('nearestRingDetent', () => {
  it('uses the configured detent count', () => {
    const snapped = nearestRingDetent(0.11, OBJECT_001_CONFIG)
    expect(snapped).toBeCloseTo(0, 5)
  })
})

describe('countDiscoveries', () => {
  it('counts unlocked discoveries once each', () => {
    expect(countDiscoveries({ rings: true, light: false, shadow: true })).toBe(2)
    expect(countDiscoveries({ rings: true, light: true, shadow: true })).toBe(3)
  })
})
