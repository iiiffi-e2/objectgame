import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { MeshStandardMaterial } from 'three'
import { Color } from 'three'
import { useRuntime } from '../interaction/runtime'
import { lerp } from '../lib/math'

const dark = new Color('#171716')
const hint = new Color('#26241f')
const current = new Color('#171716')

export function ShadowSurface() {
  const runtime = useRuntime()
  const material = useRef<MeshStandardMaterial>(null)

  useFrame((_, dt) => {
    if (!material.current) return
    current.copy(dark).lerp(hint, runtime.floorHint.current)
    material.current.color.lerp(current, 1 - Math.exp(-4 * dt))
    material.current.roughness = lerp(0.96, 0.88, runtime.floorHint.current)
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.74, -0.15]} receiveShadow>
      <planeGeometry args={[22, 22]} />
      <meshStandardMaterial ref={material} color="#171716" metalness={0} roughness={0.96} />
    </mesh>
  )
}
