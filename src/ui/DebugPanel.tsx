import { useEffect, useState } from 'react'
import { useGameStore } from '../game/useGameStore'
import { OBJECT_001_CONFIG } from '../objects/object001/object001Config'
import { evaluateRingAlignment } from '../objects/object001/puzzleLogic'
import { angularDistance } from '../lib/math'
import { useRuntime } from '../interaction/runtime'

export function DebugPanel() {
  const runtime = useRuntime()
  const store = useGameStore()
  const [fps, setFps] = useState(0)
  const [, bump] = useState(0)

  useEffect(() => {
    let frames = 0
    let last = performance.now()
    let raf = 0
    const loop = (now: number) => {
      frames += 1
      if (now - last >= 500) {
        setFps(Math.round((frames * 1000) / (now - last)))
        frames = 0
        last = now
        bump((n) => n + 1)
      }
      raf = requestAnimationFrame(loop)
    }
    raf = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(raf)
  }, [])

  const rings = runtime.rings.current
  const alignment = evaluateRingAlignment(rings, OBJECT_001_CONFIG)
  const light = runtime.lightOffset.current

  return (
    <div className="debug-panel">
      <div>FPS {fps}</div>
      <div>phase {store.phase}</div>
      <div>outer {rings.outer.toFixed(3)} tgt {OBJECT_001_CONFIG.rings.outer.target.toFixed(3)} Δ {angularDistance(rings.outer, OBJECT_001_CONFIG.rings.outer.target).toFixed(3)}</div>
      <div>mid {rings.middle.toFixed(3)} tgt {OBJECT_001_CONFIG.rings.middle.target.toFixed(3)} Δ {angularDistance(rings.middle, OBJECT_001_CONFIG.rings.middle.target).toFixed(3)}</div>
      <div>inner {rings.inner.toFixed(3)} tgt {OBJECT_001_CONFIG.rings.inner.target.toFixed(3)} Δ {angularDistance(rings.inner, OBJECT_001_CONFIG.rings.inner.target).toFixed(3)}</div>
      <div>aligned {String(alignment.allAligned)} near {alignment.nearCount}</div>
      <div>light {light.x.toFixed(2)} {light.y.toFixed(2)} {light.z.toFixed(2)}</div>
      <div>discoveries r:{Number(store.discoveries.rings)} l:{Number(store.discoveries.light)} s:{Number(store.discoveries.shadow)}</div>
      <div>interactions {store.interactionCount}</div>
      <div>opening {runtime.opening.current.toFixed(2)}</div>
      <button type="button" onClick={() => {
        runtime.rings.current.outer = OBJECT_001_CONFIG.rings.outer.target
        runtime.rings.current.middle = OBJECT_001_CONFIG.rings.middle.target
        runtime.rings.current.inner = OBJECT_001_CONFIG.rings.inner.target
        runtime.ringVel.current = { outer: 0, middle: 0, inner: 0 }
      }}>
        ALIGN
      </button>
      <button type="button" onClick={() => {
        useGameStore.getState().resetPuzzle()
        window.location.reload()
      }}>
        RESET
      </button>
    </div>
  )
}
