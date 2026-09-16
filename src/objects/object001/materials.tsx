import { createContext, useContext, useEffect, useMemo, type ReactNode } from 'react'
import { Color, MeshPhysicalMaterial, MeshStandardMaterial } from 'three'

export type ObjectMaterials = {
  titanium: MeshPhysicalMaterial
  ceramic: MeshPhysicalMaterial
  glass: MeshPhysicalMaterial
  amber: MeshStandardMaterial
  seam: MeshStandardMaterial
  glyph: MeshPhysicalMaterial
}

const MaterialsContext = createContext<ObjectMaterials | null>(null)

export function ObjectMaterialsProvider({ children }: { children: ReactNode }) {
  const materials = useMemo<ObjectMaterials>(() => {
    const titanium = new MeshPhysicalMaterial({
      color: new Color('#383B3D'),
      metalness: 0.86,
      roughness: 0.47,
      clearcoat: 0.14,
      clearcoatRoughness: 0.62,
      envMapIntensity: 0.48,
    })
    const ceramic = new MeshPhysicalMaterial({
      color: new Color('#111213'),
      metalness: 0.12,
      roughness: 0.24,
      envMapIntensity: 0.35,
    })
    const glass = new MeshPhysicalMaterial({
      color: new Color('#1c1d1e'),
      metalness: 0.04,
      roughness: 0.16,
      transparent: true,
      opacity: 0.42,
      transmission: 0.22,
      thickness: 0.35,
      ior: 1.45,
      envMapIntensity: 0.8,
    })
    const amber = new MeshStandardMaterial({
      color: new Color('#F1D7A1'),
      emissive: new Color('#F1D7A1'),
      emissiveIntensity: 1.4,
      roughness: 0.35,
      metalness: 0,
    })
    const seam = new MeshStandardMaterial({
      color: new Color('#0a0b0c'),
      roughness: 0.7,
      metalness: 0.2,
      emissive: new Color('#F1D7A1'),
      emissiveIntensity: 0,
    })
    const glyph = new MeshPhysicalMaterial({
      color: new Color('#161718'),
      metalness: 0.18,
      roughness: 0.32,
      envMapIntensity: 0.25,
    })
    return { titanium, ceramic, glass, amber, seam, glyph }
  }, [])

  useEffect(() => {
    return () => {
      Object.values(materials).forEach((material) => material.dispose())
    }
  }, [materials])

  return <MaterialsContext.Provider value={materials}>{children}</MaterialsContext.Provider>
}

export function useObjectMaterials(): ObjectMaterials {
  const value = useContext(MaterialsContext)
  if (!value) {
    throw new Error('useObjectMaterials must be used within ObjectMaterialsProvider')
  }
  return value
}
