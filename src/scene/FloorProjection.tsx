import { createPortal, useFrame, useThree } from '@react-three/fiber'
import { useLayoutEffect, useRef, type RefObject } from 'react'
import { BufferAttribute, Mesh, MeshBasicMaterial } from 'three'
import { useRuntime } from '../interaction/runtime'
import { lightDirectionTowardFloor, SHADOW_FLOOR_Y } from '../lib/planarShadow'
import { OBJECT_001_CONFIG } from '../objects/object001/object001Config'
import { Vector3 } from 'three'

const world = new Vector3()

export function FloorProjection({ source }: { source: RefObject<Mesh | null> }) {
  const scene = useThree((state) => state.scene)
  const runtime = useRuntime()
  const mesh = useRef<Mesh>(null)
  const material = useRef(
    new MeshBasicMaterial({
      color: '#000000',
      transparent: true,
      opacity: 0.72,
      depthWrite: false,
      toneMapped: false,
    }),
  )

  useLayoutEffect(() => {
    return () => {
      material.current.dispose()
    }
  }, [])

  useFrame(() => {
    const src = source.current
    const dst = mesh.current
    if (!src || !dst) return
    const srcPos = src.geometry.getAttribute('position')
    if (!srcPos) return
    src.updateWorldMatrix(true, false)

    let dstPos = dst.geometry.getAttribute('position') as BufferAttribute | undefined
    if (!dstPos || dstPos.count !== srcPos.count) {
      dst.geometry.setAttribute('position', new BufferAttribute(new Float32Array(srcPos.count * 3), 3))
      dstPos = dst.geometry.getAttribute('position') as BufferAttribute
      if (src.geometry.index) {
        dst.geometry.setIndex(src.geometry.index.clone())
      }
      dst.geometry.computeBoundingSphere()
    }

    const rest = OBJECT_001_CONFIG.light.default
    const offset = runtime.lightOffset.current
    const dir = lightDirectionTowardFloor({
      x: rest.x + offset.x,
      y: rest.y + offset.y,
      z: rest.z + offset.z,
    })
    const dy = Math.abs(dir.y) < 1e-6 ? -1 : dir.y

    for (let i = 0; i < srcPos.count; i++) {
      world.fromBufferAttribute(srcPos, i)
      world.applyMatrix4(src.matrixWorld)
      const t = (SHADOW_FLOOR_Y - world.y) / dy
      dstPos.setXYZ(i, world.x + dir.x * t, SHADOW_FLOOR_Y, world.z + dir.z * t)
    }
    dstPos.needsUpdate = true
  })

  return createPortal(
    <mesh
      ref={mesh}
      frustumCulled={false}
      renderOrder={-1}
      material={material.current}
      matrixAutoUpdate={false}
    >
      <bufferGeometry />
    </mesh>,
    scene,
  )
}
