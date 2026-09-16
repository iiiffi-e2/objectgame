import { Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group, Mesh } from 'three'
import { useRuntime } from '../../interaction/runtime'
import { useObjectMaterials } from './materials'

export function Core() {
  const materials = useObjectMaterials()
  const runtime = useRuntime()
  const group = useRef<Group>(null)
  const inner = useRef<Mesh>(null)
  const glass = useRef<Mesh>(null)

  useFrame(({ clock }, dt) => {
    const t = runtime.opening.current
    const reveal = Math.max(0, (t - 0.58) / 0.28)
    const eased = reveal * reveal * (3 - 2 * reveal)
    const pulse = 0.92 + Math.sin(clock.elapsedTime * 1.6) * 0.04
    const hover = runtime.corePulse.current
    runtime.corePulse.current = Math.max(0.15, hover - dt * 0.35)
    const boost = runtime.bloom.current
    if (group.current) {
      const visible = t > 0.55
      group.current.visible = visible
      group.current.scale.setScalar(Math.max(0.001, eased * pulse * (1 + hover * 0.08)))
      group.current.rotation.y += dt * 0.15
      group.current.rotation.z = Math.sin(clock.elapsedTime * 0.4) * 0.08
    }
    if (inner.current) {
      const mat = materials.amber
      mat.emissiveIntensity = 0.35 + hover * 0.5 + boost * 3.8 + Math.sin(clock.elapsedTime * 2.2) * 0.08
    }
    if (glass.current) {
      glass.current.rotation.y -= dt * 0.08
    }
  })

  return (
    <group ref={group} visible={false}>
      <mesh
        ref={inner}
        userData={{ interact: 'core' }}
        castShadow
        material={materials.amber}
      >
        <sphereGeometry args={[0.16, 32, 32]} />
      </mesh>
      <mesh ref={glass} userData={{ interact: 'core' }} material={materials.glass}>
        <sphereGeometry args={[0.22, 32, 32]} />
      </mesh>
      <Sparkles
        count={18}
        scale={0.55}
        size={1.1}
        speed={0.25}
        color="#F1D7A1"
        opacity={0.55}
      />
      <pointLight color="#F1D7A1" intensity={0.8} distance={2.4} />
    </group>
  )
}
