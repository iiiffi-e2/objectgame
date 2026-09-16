import { useFrame, useThree } from '@react-three/fiber'
import { useEffect, useRef } from 'react'
import { Plane, Quaternion, Raycaster, Vector2, Vector3 } from 'three'
import { audio } from '../audio/AudioManager'
import { useGameStore } from '../game/useGameStore'
import { isCoarsePointer, prefersReducedMotion } from '../lib/device'
import { clamp, nearestDetent, shortestAngleDelta, wrapAngle } from '../lib/math'
import { OBJECT_001_CONFIG } from '../objects/object001/object001Config'
import { useRuntime, type RingId } from './runtime'

const pointerNdc = new Vector2()
const hitPoint = new Vector3()
const lastPoint = new Vector3()
const axisWorld = new Vector3()
const plane = new Plane()
const raycaster = new Raycaster()
const qYaw = new Quaternion()
const qPitch = new Quaternion()
const localAxis = {
  outer: new Vector3(0, 1, 0),
  middle: new Vector3(1, 0, 0),
  inner: new Vector3(0, 0, 1),
}

type PointerRec = { x: number; y: number }

function toNdc(
  event: PointerEvent,
  rect: DOMRect,
  target: Vector2,
): Vector2 {
  target.set(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1,
  )
  return target
}

function ringAxis(id: RingId, quat: Quaternion): Vector3 {
  axisWorld.copy(localAxis[id]).applyQuaternion(quat).normalize()
  return axisWorld
}

export function InteractionController() {
  const runtime = useRuntime()
  const { camera, gl } = useThree()
  const pointers = useRef(new Map<number, PointerRec>())
  const lastRingPoint = useRef(new Vector3())
  const lastDetent = useRef({ outer: 0, middle: 0, inner: 0 })
  const pinchStart = useRef(0)
  const pinchDistance = useRef(0)
  const lightMoved = useRef(0)
  const clickStart = useRef({ x: 0, y: 0, t: 0, target: '' })
  const reduced = prefersReducedMotion()
  const coarse = isCoarsePointer()

  useEffect(() => {
    const canvas = gl.domElement
    canvas.style.touchAction = 'none'
    canvas.style.cursor = 'grab'

    const persistRings = () => {
      const rings = runtime.rings.current
      useGameStore.getState().setRingRotations(rings)
    }

    const persistObject = () => {
      const q = runtime.objectQuat.current
      useGameStore.getState().setObjectRotation({ x: q.x, y: q.y, z: q.z, w: q.w })
    }

    const persistLight = () => {
      const o = runtime.lightOffset.current
      useGameStore.getState().setLightPosition({ x: o.x, y: o.y, z: o.z })
    }

    const startMeaningful = () => {
      runtime.grabbed.current = true
      useGameStore.getState().markStarted()
      audio.ensure()
    }

    const pick = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect()
      toNdc(event, rect, pointerNdc)
      raycaster.setFromCamera(pointerNdc, camera)
      const group = runtime.objectGroup.current
      if (!group) return []
      return raycaster.intersectObject(group, true)
    }

    const onDown = (event: PointerEvent) => {
      audio.ensure()
      canvas.setPointerCapture(event.pointerId)
      pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY })
      clickStart.current = {
        x: event.clientX,
        y: event.clientY,
        t: performance.now(),
        target: '',
      }

      if (pointers.current.size === 2) {
        const pts = [...pointers.current.values()]
        pinchStart.current = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
        pinchDistance.current = runtime.distance.current
        runtime.drag.current = 'none'
        canvas.style.cursor = 'grab'
        return
      }

      if (runtime.phase.current === 'opening' || runtime.phase.current === 'activating') {
        return
      }

      const hits = pick(event)
      const ringHit = hits.find((hit) => hit.object.userData.interact === 'ring')
      const coreHit = hits.find((hit) => hit.object.userData.interact === 'core')
      const hatchHit = hits.find((hit) => hit.object.userData.interact === 'hatch')
      const switchHit = hits.find((hit) => hit.object.userData.interact === 'switch')

      if (
        ringHit &&
        runtime.phase.current !== 'awaitingCore' &&
        runtime.phase.current !== 'solved' &&
        !runtime.phase.current.startsWith('open') &&
        runtime.opening.current < 0.05
      ) {
        const ring = ringHit.object.userData.ring as RingId
        runtime.drag.current = ring
        const axis = ringAxis(ring, runtime.objectQuat.current)
        plane.setFromNormalAndCoplanarPoint(axis, new Vector3())
        if (raycaster.ray.intersectPlane(plane, lastRingPoint.current)) {
          lastDetent.current[ring] = Math.round(
            wrapAngle(runtime.rings.current[ring]) / ((Math.PI * 2) / OBJECT_001_CONFIG.detentCount),
          )
        }
        startMeaningful()
        useGameStore.getState().addInteraction()
        useGameStore.getState().unlockDiscovery('rings')
        audio.playGrab()
        runtime.ringShake.current[ring] = 1
        canvas.style.cursor = 'grabbing'
        clickStart.current.target = 'ring'
        return
      }

      if (coreHit && runtime.phase.current === 'awaitingCore') {
        clickStart.current.target = 'core'
        canvas.style.cursor = 'pointer'
        return
      }

      if (hatchHit) {
        clickStart.current.target = 'hatch'
        return
      }
      if (switchHit) {
        clickStart.current.target = 'switch'
        return
      }

      runtime.drag.current = 'object'
      startMeaningful()
      useGameStore.getState().addInteraction()
      audio.playGrab()
      canvas.style.cursor = 'grabbing'
      clickStart.current.target = 'object'
    }

    const onMove = (event: PointerEvent) => {
      const rec = pointers.current.get(event.pointerId)
      const rect = canvas.getBoundingClientRect()
      toNdc(event, rect, pointerNdc)

      if (pointers.current.size === 0 && event.pointerType === 'mouse') {
        const max = OBJECT_001_CONFIG.light.maxOffset
        runtime.lightOffset.current.set(
          clamp(pointerNdc.x * 1.25, -max, max),
          clamp(-pointerNdc.y * 0.45, -max * 0.4, max * 0.55),
          clamp(pointerNdc.y * 0.9, -max, max),
        )
        lightMoved.current += Math.abs(event.movementX) + Math.abs(event.movementY)
        if (lightMoved.current > 420) {
          useGameStore.getState().unlockDiscovery('light')
        }
        persistLight()
        if (runtime.phase.current === 'awaitingCore') {
          const hoverHits = pick(event)
          const overCore = hoverHits.some((hit) => hit.object.userData.interact === 'core')
          canvas.style.cursor = overCore ? 'pointer' : 'grab'
          if (overCore) {
            runtime.corePulse.current = 1
          }
        }
      }

      if (!rec) return
      const dx = event.clientX - rec.x
      const dy = event.clientY - rec.y
      rec.x = event.clientX
      rec.y = event.clientY

      if (pointers.current.size >= 2) {
        const pts = [...pointers.current.values()]
        const dist = Math.hypot(pts[0].x - pts[1].x, pts[0].y - pts[1].y)
        const cam = OBJECT_001_CONFIG.camera
        if (pinchStart.current > 0) {
          const zoom = pinchDistance.current * (pinchStart.current / Math.max(24, dist))
          runtime.distance.current = clamp(zoom, cam.minDistance, cam.maxDistance)
        }
        runtime.lightOffset.current.x = clamp(
          runtime.lightOffset.current.x + dx * 0.01,
          -OBJECT_001_CONFIG.light.maxOffset,
          OBJECT_001_CONFIG.light.maxOffset,
        )
        runtime.lightOffset.current.z = clamp(
          runtime.lightOffset.current.z + dy * 0.01,
          -OBJECT_001_CONFIG.light.maxOffset,
          OBJECT_001_CONFIG.light.maxOffset,
        )
        lightMoved.current += Math.abs(dx) + Math.abs(dy)
        if (lightMoved.current > 28) {
          useGameStore.getState().unlockDiscovery('light')
        }
        persistLight()
        return
      }

      const drag = runtime.drag.current
      if (drag === 'outer' || drag === 'middle' || drag === 'inner') {
        raycaster.setFromCamera(pointerNdc, camera)
        const axis = ringAxis(drag, runtime.objectQuat.current)
        plane.setFromNormalAndCoplanarPoint(axis, new Vector3(0, 0, 0))
        if (!raycaster.ray.intersectPlane(plane, hitPoint)) return
        const prev = lastPoint.copy(lastRingPoint.current).projectOnPlane(axis)
        const next = hitPoint.clone().projectOnPlane(axis)
        if (prev.lengthSq() < 1e-6 || next.lengthSq() < 1e-6) {
          lastRingPoint.current.copy(hitPoint)
          return
        }
        prev.normalize()
        next.normalize()
        const cross = prev.clone().cross(next)
        let delta = prev.angleTo(next) * Math.sign(cross.dot(axis) || 1)
        delta = clamp(delta, -0.18, 0.18)
        runtime.rings.current[drag] = wrapAngle(runtime.rings.current[drag] + delta)
        runtime.ringVel.current[drag] = delta * 60
        const step = (Math.PI * 2) / OBJECT_001_CONFIG.detentCount
        const detent = Math.round(wrapAngle(runtime.rings.current[drag]) / step)
        if (detent !== lastDetent.current[drag]) {
          lastDetent.current[drag] = detent
          audio.playDetent()
          runtime.ringShake.current[drag] = 1
        }
        lastRingPoint.current.copy(hitPoint)
        return
      }

      if (drag === 'object') {
        const sens = coarse ? 0.0055 : 0.0042
        runtime.yawVel.current += dx * sens
        runtime.pitchVel.current += dy * sens
      }
    }

    const onUp = (event: PointerEvent) => {
      const wasDrag = runtime.drag.current
      pointers.current.delete(event.pointerId)
      if (pointers.current.size === 0) {
        canvas.style.cursor = 'grab'
      }

      const moved = Math.hypot(event.clientX - clickStart.current.x, event.clientY - clickStart.current.y)
      const isClick = moved < 10 && performance.now() - clickStart.current.t < 500

      if (isClick && clickStart.current.target === 'core' && runtime.phase.current === 'awaitingCore') {
        useGameStore.getState().addInteraction()
        audio.playCoreActivate()
        runtime.phase.current = 'activating'
        useGameStore.getState().setPhase('activating')
        window.setTimeout(() => {
          runtime.bloom.current = 1
        }, 200)
      }

      if (isClick && clickStart.current.target === 'hatch') {
        startMeaningful()
        useGameStore.getState().addInteraction()
        runtime.hatchKick.current = 1
        audio.playCeramic()
      }
      if (isClick && clickStart.current.target === 'switch') {
        startMeaningful()
        useGameStore.getState().addInteraction()
        runtime.switchKick.current = 1
        audio.playCeramic()
      }

      if (wasDrag === 'outer' || wasDrag === 'middle' || wasDrag === 'inner') {
        audio.playRelease()
        persistRings()
      }
      if (wasDrag === 'object') {
        persistObject()
        audio.playRelease()
      }
      if (pointers.current.size === 0) {
        runtime.drag.current = 'none'
      }
    }

    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      const cam = OBJECT_001_CONFIG.camera
      runtime.distance.current = clamp(
        runtime.distance.current + event.deltaY * 0.0032,
        cam.minDistance,
        cam.maxDistance,
      )
    }

    const onKey = (event: KeyboardEvent) => {
      const step = 0.045
      if (['ArrowLeft', 'a', 'A'].includes(event.key)) runtime.yawVel.current -= step
      if (['ArrowRight', 'd', 'D'].includes(event.key)) runtime.yawVel.current += step
      if (['ArrowUp', 'w', 'W'].includes(event.key)) runtime.pitchVel.current -= step
      if (['ArrowDown', 's', 'S'].includes(event.key)) runtime.pitchVel.current += step
      if (event.key === 'm' || event.key === 'M') {
        const store = useGameStore.getState()
        store.setMuted(!store.soundMuted)
      }
      if (event.shiftKey && event.altKey && event.key.toLowerCase() === 'r') {
        useGameStore.getState().resetPuzzle()
        window.location.reload()
      }
    }

    canvas.addEventListener('pointerdown', onDown)
    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', onUp)
    window.addEventListener('pointercancel', onUp)
    canvas.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)

    return () => {
      canvas.removeEventListener('pointerdown', onDown)
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', onUp)
      window.removeEventListener('pointercancel', onUp)
      canvas.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
    }
  }, [camera, gl, runtime, coarse])

  useFrame((_, dt) => {
    const inertia = reduced ? 16 : 4.4
    const damp = Math.exp(-inertia * dt)
    runtime.yawVel.current *= damp
    runtime.pitchVel.current *= damp
    runtime.yawVel.current = clamp(runtime.yawVel.current, -0.22, 0.22)
    runtime.pitchVel.current = clamp(runtime.pitchVel.current, -0.18, 0.18)

    if (!runtime.grabbed.current && runtime.phase.current === 'idle' && !reduced) {
      runtime.yawVel.current += dt * 0.012
    }

    qYaw.setFromAxisAngle(localAxis.outer, runtime.yawVel.current)
    qPitch.setFromAxisAngle(localAxis.middle, runtime.pitchVel.current)
    runtime.objectQuat.current.premultiply(qYaw).multiply(qPitch).normalize()

    ;(['outer', 'middle', 'inner'] as const).forEach((id) => {
      runtime.ringShake.current[id] *= Math.exp(-8 * dt)
      if (runtime.drag.current === id) return
      if (runtime.opening.current > 0.02) return
      runtime.ringVel.current[id] *= Math.exp(-3.6 * dt)
      runtime.rings.current[id] = wrapAngle(
        runtime.rings.current[id] + runtime.ringVel.current[id] * dt,
      )
      if (Math.abs(runtime.ringVel.current[id]) < 0.35) {
        const snapped = nearestDetent(runtime.rings.current[id], OBJECT_001_CONFIG.detentCount)
        const delta = shortestAngleDelta(runtime.rings.current[id], snapped)
        runtime.rings.current[id] = wrapAngle(runtime.rings.current[id] + delta * (1 - Math.exp(-8 * dt)))
      }
    })
  })

  return null
}
