import { useFrame, useThree } from '@react-three/fiber'
import { PerspectiveCamera } from 'three'
import { useRuntime } from '../interaction/runtime'
import { OBJECT_001_CONFIG } from '../objects/object001/object001Config'
import { damp } from '../lib/math'

export function CameraRig() {
  const runtime = useRuntime()
  const { camera, size } = useThree()

  useFrame((_, dt) => {
    const portrait = size.height > size.width
    const target = runtime.distance.current * (portrait ? 0.86 : 1)
    const cam = camera as PerspectiveCamera
    cam.fov = portrait ? 36 : OBJECT_001_CONFIG.camera.fov
    const z = damp(cam.position.z, target, 6, dt)
    const y = damp(cam.position.y, 0.22, 6, dt)
    cam.position.set(0, y, z)
    cam.lookAt(0, 0.02, 0)
    cam.updateProjectionMatrix()
  })

  return null
}
