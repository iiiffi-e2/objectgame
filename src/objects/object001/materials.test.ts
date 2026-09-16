import { MeshPhysicalMaterial, MeshStandardMaterial } from 'three'
import { describe, expect, it } from 'vitest'
import { createObjectMaterials } from './materials'

describe('createObjectMaterials', () => {
  it('uses Standard materials without Physical shaders on lite devices', () => {
    const materials = createObjectMaterials(true)
    expect(materials.titanium).toBeInstanceOf(MeshStandardMaterial)
    expect(materials.titanium).not.toBeInstanceOf(MeshPhysicalMaterial)
    expect(materials.ceramic).not.toBeInstanceOf(MeshPhysicalMaterial)
    expect(materials.glass).not.toBeInstanceOf(MeshPhysicalMaterial)
    expect(materials.glyph).not.toBeInstanceOf(MeshPhysicalMaterial)
    expect(materials.glass.transparent).toBe(true)
    expect(materials.glass.opacity).toBeLessThan(1)
    Object.values(materials).forEach((material) => material.dispose())
  })

  it('keeps Physical metal and transmissive glass on desktop', () => {
    const materials = createObjectMaterials(false)
    expect(materials.titanium).toBeInstanceOf(MeshPhysicalMaterial)
    expect(materials.glass).toBeInstanceOf(MeshPhysicalMaterial)
    expect((materials.glass as MeshPhysicalMaterial).transmission).toBeGreaterThan(0)
    Object.values(materials).forEach((material) => material.dispose())
  })
})
