import { describe, expect, it } from 'vitest'
import { lightDirectionTowardFloor, projectPointToFloor } from './planarShadow'

describe('projectPointToFloor', () => {
  it('drops a point straight down under a vertical light', () => {
    expect(
      projectPointToFloor({ x: 0.4, y: 2, z: -0.2 }, { x: 0, y: -1, z: 0 }, -1.74),
    ).toEqual({ x: 0.4, y: -1.74, z: -0.2 })
  })

  it('slides along an angled light ray onto the floor', () => {
    const projected = projectPointToFloor(
      { x: 0, y: 1, z: 0 },
      { x: 1, y: -1, z: 0 },
      -1,
    )
    expect(projected.x).toBeCloseTo(2)
    expect(projected.y).toBeCloseTo(-1)
    expect(projected.z).toBeCloseTo(0)
  })
})

describe('lightDirectionTowardFloor', () => {
  it('points downward from a high studio light', () => {
    const dir = lightDirectionTowardFloor({ x: 1.05, y: 6.85, z: 2.2 })
    expect(dir.y).toBeLessThan(0)
  })
})
