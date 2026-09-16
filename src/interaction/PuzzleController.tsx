import { useFrame } from '@react-three/fiber'
import { useRef } from 'react'
import { audio } from '../audio/AudioManager'
import { useGameStore } from '../game/useGameStore'
import { prefersReducedMotion } from '../lib/device'
import { lerp } from '../lib/math'
import { OBJECT_001_CONFIG } from '../objects/object001/object001Config'
import { evaluateRingAlignment } from '../objects/object001/puzzleLogic'
import { useRuntime } from './runtime'

export function PuzzleController() {
  const runtime = useRuntime()
  const confirmMs = useRef(0)
  const lastNear = useRef(0)
  const reduced = prefersReducedMotion()

  useFrame((_, dt) => {
    const phase = runtime.phase.current
    const alignment = evaluateRingAlignment(runtime.rings.current, OBJECT_001_CONFIG)

    if (alignment.shadowForming) {
      useGameStore.getState().unlockDiscovery('shadow')
    }

    if (alignment.nearCount !== lastNear.current) {
      audio.setResonance(alignment.allAligned ? 3 : alignment.nearCount)
      lastNear.current = alignment.nearCount
    }

    const elapsed = useGameStore.getState().getElapsed()
    if (!alignment.allAligned && phase === 'idle') {
      if (elapsed > 90_000) {
        runtime.floorHint.current = lerp(runtime.floorHint.current, 0.72, 1 - Math.exp(-0.4 * dt))
      }
      if (elapsed > 180_000) {
        runtime.lightOffset.current.x = lerp(runtime.lightOffset.current.x, 0.15, 1 - Math.exp(-0.25 * dt))
        runtime.lightOffset.current.y = lerp(runtime.lightOffset.current.y, 1.05, 1 - Math.exp(-0.25 * dt))
        runtime.lightOffset.current.z = lerp(runtime.lightOffset.current.z, 0.35, 1 - Math.exp(-0.25 * dt))
      }
    }

    if (
      alignment.allAligned &&
      (phase === 'idle' || phase === 'confirming') &&
      runtime.opening.current === 0
    ) {
      runtime.phase.current = 'confirming'
      if (useGameStore.getState().phase !== 'confirming') {
        useGameStore.getState().setPhase('confirming')
      }
      confirmMs.current += dt * 1000
      if (confirmMs.current >= OBJECT_001_CONFIG.confirmDelayMs) {
        runtime.rings.current.outer = OBJECT_001_CONFIG.rings.outer.target
        runtime.rings.current.middle = OBJECT_001_CONFIG.rings.middle.target
        runtime.rings.current.inner = OBJECT_001_CONFIG.rings.inner.target
        runtime.ringVel.current = { outer: 0, middle: 0, inner: 0 }
        runtime.drag.current = 'none'
        runtime.phase.current = 'opening'
        useGameStore.getState().setPhase('opening')
        useGameStore.getState().setRingRotations(runtime.rings.current)
        audio.playLock()
        audio.startHum()
        audio.setResonance(3)
      }
    } else if (phase === 'confirming' && !alignment.allAligned) {
      confirmMs.current = 0
      runtime.phase.current = 'idle'
      useGameStore.getState().setPhase('idle')
    } else if (!alignment.allAligned) {
      confirmMs.current = 0
    }

    if (
      phase === 'opening' ||
      (runtime.opening.current > 0 && phase !== 'idle' && phase !== 'confirming')
    ) {
      const duration = reduced ? 0.7 : 6.2
      runtime.opening.current = Math.min(1, runtime.opening.current + dt / duration)
      useGameStore.getState().setOpeningProgress(runtime.opening.current)
      if (runtime.opening.current >= 1 && phase === 'opening') {
        runtime.phase.current = 'awaitingCore'
        useGameStore.getState().setPhase('awaitingCore')
      }
    }

    if (phase === 'activating') {
      runtime.bloom.current = Math.min(1, runtime.bloom.current + dt * 1.15)
    }
  })

  return null
}
