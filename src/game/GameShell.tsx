import { Canvas } from '@react-three/fiber'
import { motion } from 'framer-motion'
import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ACESFilmicToneMapping,
  BasicShadowMap,
  Group,
  PCFShadowMap,
  Quaternion,
  Vector3,
  type Mesh,
} from 'three'
import { audio } from '../audio/AudioManager'
import { isDebugMode, shouldResetOnBoot } from '../lib/debug'
import { needsLiteGraphics, prefersReducedMotion } from '../lib/device'
import { RuntimeProvider, type RuntimeRefs } from '../interaction/runtime'
import { Scene } from '../scene/Scene'
import { DebugPanel } from '../ui/DebugPanel'
import { HUD } from '../ui/HUD'
import { SolveScreen } from '../ui/SolveScreen'
import { OBJECT_001_CONFIG } from '../objects/object001/object001Config'
import { useGameStore } from './useGameStore'

export function GameShell() {
  const phase = useGameStore((s) => s.phase)
  const debug = isDebugMode()
  const reduced = prefersReducedMotion()
  const lite = needsLiteGraphics()
  const [booted, setBooted] = useState(false)

  const runtime = useCreateRuntime()

  useEffect(() => {
    if (shouldResetOnBoot()) {
      useGameStore.getState().resetPuzzle()
      const url = new URL(window.location.href)
      url.searchParams.delete('reset')
      window.history.replaceState({}, '', url)
    }
    setBooted(true)
    audio.setMuted(useGameStore.getState().soundMuted)
    const persist = () => useGameStore.getState().persistNow()
    window.addEventListener('pagehide', persist)
    document.addEventListener('visibilitychange', persist)
    return () => {
      window.removeEventListener('pagehide', persist)
      document.removeEventListener('visibilitychange', persist)
    }
  }, [])

  useEffect(() => {
    runtime.phase.current = phase
    if (phase === 'awaitingCore' || phase === 'solved') {
      runtime.opening.current = 1
    }
  }, [phase, runtime])

  useEffect(() => {
    if (phase !== 'activating') return
    const id = window.setTimeout(() => {
      useGameStore.getState().completeSolve()
    }, reduced ? 600 : 1650)
    return () => window.clearTimeout(id)
  }, [phase, reduced])

  return (
    <RuntimeProvider value={runtime}>
      <div className="shell">
        {phase !== 'solved' && (
          <Canvas
            className="scene-canvas"
            shadows
            frameloop={lite ? 'demand' : 'always'}
            dpr={lite ? 1 : [1, 1.75]}
            gl={{
              antialias: !lite,
              alpha: false,
              stencil: false,
              depth: true,
              powerPreference: lite ? 'low-power' : 'high-performance',
              failIfMajorPerformanceCaveat: false,
            }}
            camera={{
              fov: OBJECT_001_CONFIG.camera.fov,
              position: [0, 0.22, OBJECT_001_CONFIG.camera.defaultDistance],
              near: 0.1,
              far: 40,
            }}
            onCreated={({ gl, invalidate }) => {
              gl.setClearColor('#050505')
              gl.toneMapping = ACESFilmicToneMapping
              gl.toneMappingExposure = lite ? 0.95 : 1.04
              gl.shadowMap.enabled = true
              gl.shadowMap.type = lite ? BasicShadowMap : PCFShadowMap
              const canvas = gl.domElement
              const onLost = (event: Event) => {
                event.preventDefault()
              }
              const onRestored = () => {
                gl.setClearColor('#050505')
                gl.shadowMap.enabled = true
                gl.shadowMap.needsUpdate = true
                invalidate()
              }
              canvas.addEventListener('webglcontextlost', onLost, false)
              canvas.addEventListener('webglcontextrestored', onRestored, false)
            }}
          >
            <Scene />
          </Canvas>
        )}
        <HUD />
        {debug && phase !== 'solved' && <DebugPanel />}
        {booted && phase !== 'solved' && (
          <motion.div
            className="intro-veil"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: reduced ? 0.2 : 1.6, ease: 'easeOut' }}
          />
        )}
        {phase === 'activating' && (
          <motion.div
            className="white-veil"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: reduced ? 0 : 0.22, duration: reduced ? 0.25 : 0.95, ease: [0.22, 1, 0.36, 1] }}
          />
        )}
        {phase === 'solved' && <SolveScreen />}
      </div>
    </RuntimeProvider>
  )
}

function useCreateRuntime(): RuntimeRefs {
  const initial = useGameStore.getState()
  const objectGroup = useRef<Group>(null)
  const coreMesh = useRef<Mesh>(null)
  const rings = useRef({
    outer: initial.outerRingRotation,
    middle: initial.middleRingRotation,
    inner: initial.innerRingRotation,
  })
  const ringVel = useRef({ outer: 0, middle: 0, inner: 0 })
  const ringShake = useRef({ outer: 0, middle: 0, inner: 0 })
  const objectQuat = useRef(
    new Quaternion(
      initial.objectRotation.x,
      initial.objectRotation.y,
      initial.objectRotation.z,
      initial.objectRotation.w,
    ),
  )
  const yawVel = useRef(0)
  const pitchVel = useRef(0)
  const lightOffset = useRef(
    new Vector3(initial.lightPosition.x, initial.lightPosition.y, initial.lightPosition.z),
  )
  const distance = useRef(OBJECT_001_CONFIG.camera.defaultDistance)
  const opening = useRef(initial.alignmentSolved ? 1 : 0)
  const bloom = useRef(0)
  const corePulse = useRef(0.15)
  const hatchKick = useRef(0)
  const switchKick = useRef(0)
  const drag = useRef<RuntimeRefs['drag']['current']>('none')
  const grabbed = useRef(initial.gameStarted)
  const phase = useRef(initial.phase)
  const floorHint = useRef(0)

  return useMemo(
    () => ({
      objectGroup,
      coreMesh,
      rings,
      ringVel,
      ringShake,
      objectQuat,
      yawVel,
      pitchVel,
      lightOffset,
      distance,
      opening,
      bloom,
      corePulse,
      hatchKick,
      switchKick,
      drag,
      grabbed,
      phase,
      floorHint,
    }),
    [],
  )
}
