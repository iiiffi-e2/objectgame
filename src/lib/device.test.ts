import { describe, expect, it } from 'vitest'
import { needsLiteGraphics } from './device'

describe('needsLiteGraphics', () => {
  it('treats Android phones as lite, including Pixel', () => {
    expect(
      needsLiteGraphics({
        userAgent:
          'Mozilla/5.0 (Linux; Android 16; Pixel 10 Pro XL) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Mobile Safari/537.36',
        pointerCoarse: false,
      }),
    ).toBe(true)
  })

  it('treats coarse pointers as lite', () => {
    expect(
      needsLiteGraphics({
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
        pointerCoarse: true,
      }),
    ).toBe(true)
  })

  it('keeps a typical desktop as full quality', () => {
    expect(
      needsLiteGraphics({
        userAgent:
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36',
        pointerCoarse: false,
      }),
    ).toBe(false)
  })
})
