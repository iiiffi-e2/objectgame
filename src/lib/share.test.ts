import { describe, expect, it } from 'vitest'
import { buildSharePattern, buildShareText } from './share'

describe('buildSharePattern', () => {
  it('returns five squares and no digits from ring angles', () => {
    const pattern = buildSharePattern({
      elapsedMs: 167_000,
      interactionCount: 19,
      discoveryCount: 3,
    })
    expect(pattern).toHaveLength(9)
    expect(pattern.replaceAll(' ', '')).toHaveLength(5)
    expect([...pattern].filter((char) => char === '◼' || char === '◻')).toHaveLength(5)
  })

  it('is deterministic for the same stats', () => {
    const input = { elapsedMs: 90_000, interactionCount: 11, discoveryCount: 2 }
    expect(buildSharePattern(input)).toBe(buildSharePattern(input))
  })
})

describe('buildShareText', () => {
  it('includes stats without puzzle spoilers', () => {
    const text = buildShareText({
      objectCode: 'OBJECT 001',
      elapsedMs: 167_400,
      interactionCount: 19,
      discoveryCount: 3,
    })
    expect(text).toContain('OBJECT 001')
    expect(text).toContain('Solved in 02:47')
    expect(text).toContain('19 interactions')
    expect(text).toContain('3 discoveries')
    expect(text).toContain('OBJECT')
    expect(text.toLowerCase()).not.toContain('ring')
    expect(text.toLowerCase()).not.toContain('shadow')
    expect(text.toLowerCase()).not.toContain('light')
    expect(text.toLowerCase()).not.toContain('core')
  })
})
