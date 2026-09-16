import { useThree } from '@react-three/fiber'
import { useEffect } from 'react'
import { useRuntime } from '../interaction/runtime'
import { needsLiteGraphics } from '../lib/device'

export function LiteLoop() {
  const invalidate = useThree((state) => state.invalidate)
  const gl = useThree((state) => state.gl)
  const runtime = useRuntime()

  useEffect(() => {
    if (!needsLiteGraphics()) return

    gl.shadowMap.autoUpdate = false
    gl.shadowMap.needsUpdate = true

    let frame = 0
    let last = 0
    let raf = 0

    const tick = (now: number) => {
      raf = window.requestAnimationFrame(tick)
      if (document.hidden) return
      if (now - last < 33) return
      last = now
      frame += 1
      const dragging = runtime.drag.current !== 'none'
      gl.shadowMap.needsUpdate = dragging || frame % 3 === 0
      invalidate()
    }

    raf = window.requestAnimationFrame(tick)
    const onVisible = () => {
      if (!document.hidden) {
        gl.shadowMap.needsUpdate = true
        invalidate()
      }
    }
    document.addEventListener('visibilitychange', onVisible)

    return () => {
      window.cancelAnimationFrame(raf)
      document.removeEventListener('visibilitychange', onVisible)
      gl.shadowMap.autoUpdate = true
    }
  }, [gl, invalidate, runtime])

  return null
}
