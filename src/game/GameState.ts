import { OBJECT_001_CONFIG } from '../objects/object001/object001Config'
import type { DiscoveryFlags } from '../objects/object001/puzzleLogic'

export type LightPosition = {
  x: number
  y: number
  z: number
}

export type ObjectRotation = {
  x: number
  y: number
  z: number
  w: number
}

export type GamePhase =
  | 'idle'
  | 'confirming'
  | 'opening'
  | 'awaitingCore'
  | 'activating'
  | 'solved'

export type PersistedGameState = {
  gameStarted: boolean
  startTimestamp: number | null
  elapsedTime: number
  interactionCount: number
  discoveries: DiscoveryFlags
  outerRingRotation: number
  middleRingRotation: number
  innerRingRotation: number
  lightPosition: LightPosition
  objectRotation: ObjectRotation
  alignmentSolved: boolean
  solved: boolean
  solveElapsed: number | null
  soundMuted: boolean
}

export const defaultPersistedState: PersistedGameState = {
  gameStarted: false,
  startTimestamp: null,
  elapsedTime: 0,
  interactionCount: 0,
  discoveries: { rings: false, light: false, shadow: false },
  outerRingRotation: OBJECT_001_CONFIG.initial.outer,
  middleRingRotation: OBJECT_001_CONFIG.initial.middle,
  innerRingRotation: OBJECT_001_CONFIG.initial.inner,
  lightPosition: { x: 0, y: 0, z: 0 },
  objectRotation: { x: 0, y: 0, z: 0, w: 1 },
  alignmentSolved: false,
  solved: false,
  solveElapsed: null,
  soundMuted: false,
}

export function clonePersistedState(state: PersistedGameState): PersistedGameState {
  return {
    ...state,
    discoveries: { ...state.discoveries },
    lightPosition: { ...state.lightPosition },
    objectRotation: { ...state.objectRotation },
  }
}
