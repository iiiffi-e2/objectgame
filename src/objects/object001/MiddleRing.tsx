import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import { useRuntime } from '../../interaction/runtime'
import { useObjectMaterials } from './materials'
import { MechanicalRing } from './MechanicalRing'
import { GlyphArc, GlyphBar } from './GlyphCasters'
import { OBJECT_001_CONFIG } from './object001Config'

const { radius, tube, target } = OBJECT_001_CONFIG.rings.middle

export function MiddleRing() {
  const materials = useObjectMaterials()
  const runtime = useRuntime()
  const spin = useRef<Group>(null)
  const separate = useRef<Group>(null)

  useFrame(() => {
    if (spin.current) {
      spin.current.rotation.x = runtime.rings.current.middle
      const shake = runtime.ringShake.current.middle
      spin.current.position.set(0, shake * 0.004, shake * 0.003)
    }
    if (separate.current) {
      const t = Math.max(0, (runtime.opening.current - 0.18) / 0.32)
      const eased = t * t * (3 - 2 * t)
      separate.current.position.x = eased * 0.24
    }
  })

  return (
    <group ref={spin}>
      <group ref={separate}>
        <group rotation={[0, 0, Math.PI / 2]}>
          <MechanicalRing
            radius={radius}
            tube={tube}
            notches={16}
            gap={0.36}
            materials={materials}
          />
        </group>
        <group rotation={[-target, 0, 0]}>
          <GlyphArc start={(160 * Math.PI) / 180} arc={(80 * Math.PI) / 180} materials={materials} />
          <GlyphBar materials={materials} />
        </group>
        <mesh
          userData={{ interact: 'ring', ring: 'middle' }}
          rotation={[0, 0, Math.PI / 2]}
          visible={false}
        >
          <torusGeometry args={[radius, tube * 2.4, 8, 48]} />
          <meshBasicMaterial />
        </mesh>
      </group>
    </group>
  )
}
