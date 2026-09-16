import { useMemo, type ReactNode } from 'react'
import { TAU } from '../../lib/math'
import type { ObjectMaterials } from './materials'

type MechanicalRingProps = {
  radius: number
  tube: number
  notches: number
  gap: number
  materials: ObjectMaterials
  children?: ReactNode
}

export function MechanicalRing({
  radius,
  tube,
  notches,
  gap,
  materials,
  children,
}: MechanicalRingProps) {
  const notchElements = useMemo(() => {
    return Array.from({ length: notches }, (_, index) => {
      const angle = (index / notches) * TAU
      return (
        <mesh
          key={index}
          position={[Math.cos(angle) * radius, Math.sin(angle) * radius, 0]}
          rotation={[0, 0, angle]}
          castShadow
          material={materials.ceramic}
        >
          <boxGeometry args={[tube * 1.85, tube * 0.32, tube * 0.7]} />
        </mesh>
      )
    })
  }, [materials.ceramic, notches, radius, tube])

  const vents = useMemo(() => {
    return Array.from({ length: 5 }, (_, index) => {
      const angle = (index / 5) * TAU + 0.4
      return (
        <mesh
          key={index}
          position={[Math.cos(angle) * radius, Math.sin(angle) * radius, tube * 0.55]}
          rotation={[Math.PI / 2, 0, angle]}
          castShadow
          material={materials.seam}
        >
          <boxGeometry args={[tube * 1.1, tube * 0.18, tube * 0.42]} />
        </mesh>
      )
    })
  }, [materials.seam, radius, tube])

  return (
    <group>
      <mesh castShadow material={materials.titanium}>
        <torusGeometry args={[radius, tube, 14, 72, TAU - gap]} />
      </mesh>
      <mesh material={materials.ceramic}>
        <torusGeometry args={[radius, tube * 0.38, 8, 64]} />
      </mesh>
      {notchElements}
      {vents}
      {children}
    </group>
  )
}
