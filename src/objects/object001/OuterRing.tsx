import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import type { Group } from 'three'
import { useRuntime } from '../../interaction/runtime'
import { useObjectMaterials } from './materials'
import { MechanicalRing } from './MechanicalRing'
import { GlyphArc } from './GlyphCasters'
import { OBJECT_001_CONFIG } from './object001Config'

const { radius, tube, target } = OBJECT_001_CONFIG.rings.outer

export function OuterRing() {
  const materials = useObjectMaterials()
  const runtime = useRuntime()
  const spin = useRef<Group>(null)
  const separate = useRef<Group>(null)

  useFrame(() => {
    if (spin.current) {
      spin.current.rotation.y = runtime.rings.current.outer
      const shake = runtime.ringShake.current.outer
      spin.current.position.set(shake * 0.004, 0, shake * -0.003)
    }
    if (separate.current) {
      const t = Math.max(0, (runtime.opening.current - 0.18) / 0.32)
      const eased = t * t * (3 - 2 * t)
      separate.current.position.y = eased * 0.26
    }
  })

  return (
    <group ref={spin}>
      <group ref={separate}>
        <group rotation={[Math.PI / 2, 0, 0]}>
          <MechanicalRing
            radius={radius}
            tube={tube}
            notches={18}
            gap={0.42}
            materials={materials}
          />
        </group>
        <group rotation={[0, -target, 0]}>
          <GlyphArc start={-0.18} arc={(140 * Math.PI) / 180} materials={materials} />
        </group>
        <mesh
          userData={{ interact: 'ring', ring: 'outer' }}
          rotation={[Math.PI / 2, 0, 0]}
          visible={false}
        >
          <torusGeometry args={[radius, tube * 2.4, 8, 48]} />
          <meshBasicMaterial />
        </mesh>
      </group>
    </group>
  )
}
