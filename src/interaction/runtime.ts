import { createContext, useContext, type MutableRefObject, type RefObject } from 'react'
import { Quaternion, Vector3, type Group, type Mesh } from 'three'
import type { GamePhase } from '../game/GameState'

export type RingId = 'outer' | 'middle' | 'inner'

export type RuntimeRefs = {
  objectGroup: RefObject<Group | null>
  coreMesh: RefObject<Mesh | null>
  rings: MutableRefObject<{ outer: number; middle: number; inner: number }>
  ringVel: MutableRefObject<{ outer: number; middle: number; inner: number }>
  ringShake: MutableRefObject<{ outer: number; middle: number; inner: number }>
  objectQuat: MutableRefObject<Quaternion>
  yawVel: MutableRefObject<number>
  pitchVel: MutableRefObject<number>
  lightOffset: MutableRefObject<Vector3>
  distance: MutableRefObject<number>
  opening: MutableRefObject<number>
  bloom: MutableRefObject<number>
  corePulse: MutableRefObject<number>
  hatchKick: MutableRefObject<number>
  switchKick: MutableRefObject<number>
  drag: MutableRefObject<RingId | 'object' | 'none'>
  grabbed: MutableRefObject<boolean>
  phase: MutableRefObject<GamePhase>
  floorHint: MutableRefObject<number>
}

const RuntimeContext = createContext<RuntimeRefs | null>(null)

export const RuntimeProvider = RuntimeContext.Provider

export function useRuntime(): RuntimeRefs {
  const value = useContext(RuntimeContext)
  if (!value) {
    throw new Error('useRuntime must be used within RuntimeProvider')
  }
  return value
}
