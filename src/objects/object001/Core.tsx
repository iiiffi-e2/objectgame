import { Sparkles } from '@react-three/drei'
import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import { tryActivateCore } from '../../interaction/activateCore'
import { useRuntime } from '../../interaction/runtime'
import { needsLiteGraphics } from '../../lib/device'
import { useObjectMaterials } from './materials'

export function Core() {
  const materials = useObjectMaterials()
  const runtime = useRuntime()
  const group = useRef<Group>(null)
  const lite = needsLiteGraphics()

  useFrame(({ clock }, dt) => {
    const t = runtime.opening.current
    const reveal = Math.max(0, (t - 0.52) / 0.32)
    const eased = reveal * reveal * (3 - 2 * reveal)
    const pulse = 0.96 + Math.sin(clock.elapsedTime * 1.7) * 0.05
    const hover = runtime.corePulse.current
    runtime.corePulse.current = Math.max(0.2, hover - dt * 0.35)
    const boost = runtime.bloom.current
    if (group.current) {
      group.current.visible = t > 0.5
      group.current.scale.setScalar(Math.max(0.001, eased * pulse * (1 + hover * 0.1)))
      group.current.rotation.y += dt * 0.12
      group.current.rotation.z = Math.sin(clock.elapsedTime * 0.35) * 0.06
    }
    materials.amber.emissiveIntensity =
      1.6 + hover * 1.1 + boost * 4.2 + Math.sin(clock.elapsedTime * 2.1) * 0.25
  })

  return (
    <group
      ref={group}
      visible={false}
      onClick={(event) => {
        event.stopPropagation()
        tryActivateCore(runtime)
      }}
      onPointerOver={(event) => {
        event.stopPropagation()
        runtime.corePulse.current = 1
      }}
    >
      <mesh userData={{ interact: 'core' }} material={materials.amber}>
        <sphereGeometry args={[0.24, lite ? 16 : 32, lite ? 16 : 32]} />
      </mesh>
      <mesh userData={{ interact: 'core' }} material={materials.glass}>
        <sphereGeometry args={[0.32, lite ? 16 : 32, lite ? 16 : 32]} />
      </mesh>
      <mesh userData={{ interact: 'core' }} visible={false}>
        <sphereGeometry args={[0.48, 16, 16]} />
      </mesh>
      {!lite && (
        <Sparkles count={22} scale={0.7} size={1.4} speed={0.28} color="#F1D7A1" opacity={0.7} />
      )}
      {!lite && <pointLight color="#F1D7A1" intensity={1.8} distance={3.2} />}
    </group>
  )
}
