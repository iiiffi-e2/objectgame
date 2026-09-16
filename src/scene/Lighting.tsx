import { useFrame } from '@react-three/fiber'
import { useLayoutEffect, useRef } from 'react'
import type { DirectionalLight } from 'three'
import { useRuntime } from '../interaction/runtime'
import { OBJECT_001_CONFIG } from '../objects/object001/object001Config'
import { needsLiteGraphics } from '../lib/device'

export function Lighting() {
  const runtime = useRuntime()
  const key = useRef<DirectionalLight>(null)
  const fill = useRef<DirectionalLight>(null)
  const { default: rest } = OBJECT_001_CONFIG.light
  const lite = needsLiteGraphics()

  useLayoutEffect(() => {
    key.current?.target.position.set(0, -0.2, 0)
    key.current?.target.updateMatrixWorld()
  }, [])

  useFrame(() => {
    if (!key.current) return
    const o = runtime.lightOffset.current
    key.current.position.set(rest.x + o.x, rest.y + o.y, rest.z + o.z)
    const open = runtime.opening.current
    key.current.intensity = 2.05 + open * 0.25 + runtime.bloom.current * 2.4
    if (fill.current) {
      fill.current.intensity = 0.16 + open * 0.08
    }
  })

  return (
    <>
      <ambientLight intensity={lite ? 0.16 : 0.04} color="#8d8880" />
      <directionalLight
        ref={key}
        color="#f3eee6"
        intensity={lite ? 1.7 : 2.1}
        castShadow
        shadow-mapSize={lite ? [512, 512] : [2048, 2048]}
        shadow-bias={-0.00018}
        shadow-normalBias={0.028}
        shadow-camera-near={1}
        shadow-camera-far={20}
        shadow-camera-left={lite ? -3.4 : -4.4}
        shadow-camera-right={lite ? 3.4 : 4.4}
        shadow-camera-top={lite ? 3.4 : 4.4}
        shadow-camera-bottom={lite ? -3.4 : -4.4}
      />
      {!lite && (
        <>
          <directionalLight ref={fill} color="#c9d4de" intensity={0.16} position={[-5, 1.6, -2.4]} />
          <directionalLight color="#F1D7A1" intensity={0.22} position={[0.2, -0.8, -4.2]} />
        </>
      )}
    </>
  )
}
