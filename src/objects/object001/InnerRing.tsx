import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import { useRuntime } from '../../interaction/runtime'
import { useObjectMaterials } from './materials'
import { MechanicalRing } from './MechanicalRing'
import { GlyphArc } from './GlyphCasters'
import { OBJECT_001_CONFIG } from './object001Config'

const { radius, tube, target } = OBJECT_001_CONFIG.rings.inner

export function InnerRing() {
  const materials = useObjectMaterials()
  const runtime = useRuntime()
  const spin = useRef<Group>(null)
  const separate = useRef<Group>(null)

  useFrame(() => {
    if (spin.current) {
      spin.current.rotation.z = runtime.rings.current.inner
      const shake = runtime.ringShake.current.inner
      spin.current.position.set(shake * -0.003, shake * 0.004, 0)
    }
    if (separate.current) {
      const t = Math.max(0, (runtime.opening.current - 0.18) / 0.32)
      const eased = t * t * (3 - 2 * t)
      separate.current.position.z = eased * 0.22
    }
  })

  return (
    <group ref={spin}>
      <group ref={separate}>
        <MechanicalRing
          radius={radius}
          tube={tube}
          notches={14}
          gap={0.3}
          materials={materials}
        />
        <group rotation={[0, 0, -target]}>
          <GlyphArc start={(210 * Math.PI) / 180} arc={(140 * Math.PI) / 180} materials={materials} />
        </group>
        <mesh userData={{ interact: 'ring', ring: 'inner' }} visible={false}>
          <torusGeometry args={[radius, tube * 2.4, 8, 48]} />
          <meshBasicMaterial />
        </mesh>
      </group>
    </group>
  )
}
