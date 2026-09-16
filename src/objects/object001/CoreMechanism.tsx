import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group, Mesh } from 'three'
import { useRuntime } from '../../interaction/runtime'
import { TAU } from '../../lib/math'
import { useObjectMaterials } from './materials'
import { OBJECT_001_CONFIG } from './object001Config'

const RADIUS = OBJECT_001_CONFIG.bodyRadius

export function CoreMechanism() {
  const materials = useObjectMaterials()
  const runtime = useRuntime()
  const upper = useRef<Group>(null)
  const lower = useRef<Group>(null)
  const cage = useRef<Group>(null)

  useFrame(() => {
    const t = runtime.opening.current
    const panel = Math.max(0, (t - 0.4) / 0.22)
    const open = Math.max(0, (t - 0.52) / 0.3)
    const p = panel * panel * (3 - 2 * panel)
    const o = open * open * (3 - 2 * open)
    if (upper.current) {
      upper.current.position.y = p * 0.06 + o * 0.14
      upper.current.rotation.x = o * -0.32
    }
    if (lower.current) {
      lower.current.position.y = -(p * 0.04 + o * 0.1)
      lower.current.rotation.x = o * 0.18
    }
    if (cage.current) {
      cage.current.scale.setScalar(0.72 + o * 0.28)
    }
    materials.seam.emissiveIntensity = t > 0.05 ? Math.min(0.55, (t - 0.05) * 1.1) : 0
  })

  const bolts = Array.from({ length: 8 }, (_, index) => {
    const angle = (index / 8) * TAU
    return (
      <mesh
        key={index}
        position={[Math.cos(angle) * 0.72, 0.02, Math.sin(angle) * 0.72]}
        rotation={[Math.PI / 2, 0, angle]}
        castShadow
        material={materials.ceramic}
      >
        <cylinderGeometry args={[0.032, 0.032, 0.03, 6]} />
      </mesh>
    )
  })

  return (
    <group>
      <group ref={upper}>
        <mesh userData={{ interact: 'body' }} castShadow material={materials.titanium}>
          <sphereGeometry args={[RADIUS, 48, 28, 0, TAU, 0, Math.PI / 2]} />
        </mesh>
        <mesh position={[0, RADIUS * 0.78, 0]} material={materials.ceramic}>
          <cylinderGeometry args={[0.16, 0.18, 0.06, 32]} />
        </mesh>
        <mesh position={[0, RADIUS * 0.82, 0]} material={materials.glass}>
          <circleGeometry args={[0.12, 32]} />
        </mesh>
      </group>

      <group ref={lower}>
        <mesh userData={{ interact: 'body' }} castShadow material={materials.titanium}>
          <sphereGeometry args={[RADIUS, 48, 28, 0, TAU, Math.PI / 2, Math.PI / 2]} />
        </mesh>
      </group>

      <mesh rotation={[Math.PI / 2, 0, 0]} castShadow material={materials.ceramic}>
        <torusGeometry args={[0.78, 0.028, 10, 64]} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.seam}>
        <torusGeometry args={[0.62, 0.012, 8, 64]} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} material={materials.seam}>
        <torusGeometry args={[0.7, 0.008, 8, 64]} />
      </mesh>
      <mesh rotation={[Math.PI / 3, 0.4, 0.2]} material={materials.seam}>
        <torusGeometry args={[0.66, 0.007, 8, 48]} />
      </mesh>
      {bolts}

      <group ref={cage}>
        <mesh rotation={[Math.PI / 2, 0, 0]} material={materials.ceramic}>
          <torusGeometry args={[0.34, 0.012, 8, 32]} />
        </mesh>
        <mesh material={materials.ceramic}>
          <torusGeometry args={[0.34, 0.012, 8, 32]} />
        </mesh>
        <mesh rotation={[0, Math.PI / 2, 0]} material={materials.ceramic}>
          <torusGeometry args={[0.34, 0.012, 8, 32]} />
        </mesh>
        <pointLight color="#F1D7A1" intensity={0.35} distance={1.8} />
      </group>

      <FalseLeads />
    </group>
  )
}

function FalseLeads() {
  const materials = useObjectMaterials()
  const hatch = useRef<Group>(null)
  const hatchMesh = useRef<Mesh>(null)
  const switchMesh = useRef<Mesh>(null)
  const runtime = useRuntime()

  useFrame((_, dt) => {
    runtime.hatchKick.current = Math.max(0, runtime.hatchKick.current - dt * 2.4)
    runtime.switchKick.current = Math.max(0, runtime.switchKick.current - dt * 3.2)
    if (hatch.current) {
      hatch.current.rotation.z = runtime.hatchKick.current * 0.18
    }
    const open = runtime.opening.current
    if (switchMesh.current) {
      switchMesh.current.position.x = 0.56 - open * 0.04
      switchMesh.current.position.y = -0.22 - runtime.switchKick.current * 0.012
    }
  })

  return (
    <group>
      <group ref={hatch} position={[0.58, 0.18, 0.42]} rotation={[0.4, -0.7, 0.2]}>
        <mesh
          ref={hatchMesh}
          userData={{ interact: 'hatch' }}
          castShadow
          material={materials.ceramic}
        >
          <cylinderGeometry args={[0.09, 0.1, 0.03, 24]} />
        </mesh>
        <mesh position={[0, 0.018, 0]} material={materials.glass}>
          <circleGeometry args={[0.055, 24]} />
        </mesh>
      </group>
      <mesh
        ref={switchMesh}
        userData={{ interact: 'switch' }}
        position={[0.56, -0.22, 0.48]}
        rotation={[0.3, 0.4, 0.8]}
        castShadow
        material={materials.titanium}
      >
        <boxGeometry args={[0.045, 0.07, 0.03]} />
      </mesh>
    </group>
  )
}
