import {
  clonePersistedState,
  defaultPersistedState,
  type PersistedGameState,
} from '../game/GameState'

export const STORAGE_KEY = 'object.001.v1'

export type StorageLike = {
  getItem(key: string): string | null
  setItem(key: string, value: string): void
  removeItem(key: string): void
}

export function getDefaultStorage(): StorageLike | null {
  try {
    if (typeof localStorage === 'undefined') return null
    return localStorage
  } catch {
    return null
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function numberOr(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function boolOr(value: unknown, fallback: boolean): boolean {
  return typeof value === 'boolean' ? value : fallback
}

export function loadPersistedState(
  storage: StorageLike | null = getDefaultStorage(),
): PersistedGameState {
  const fallback = clonePersistedState(defaultPersistedState)
  if (!storage) return fallback

  try {
    const raw = storage.getItem(STORAGE_KEY)
    if (!raw) return fallback
    const parsed: unknown = JSON.parse(raw)
    if (!isRecord(parsed)) return fallback

    const discoveries = isRecord(parsed.discoveries) ? parsed.discoveries : {}
    const light = isRecord(parsed.lightPosition) ? parsed.lightPosition : {}
    const rotation = isRecord(parsed.objectRotation) ? parsed.objectRotation : {}

    return {
      gameStarted: boolOr(parsed.gameStarted, fallback.gameStarted),
      startTimestamp:
        typeof parsed.startTimestamp === 'number' || parsed.startTimestamp === null
          ? parsed.startTimestamp
          : fallback.startTimestamp,
      elapsedTime: numberOr(parsed.elapsedTime, fallback.elapsedTime),
      interactionCount: numberOr(parsed.interactionCount, fallback.interactionCount),
      discoveries: {
        rings: boolOr(discoveries.rings, false),
        light: boolOr(discoveries.light, false),
        shadow: boolOr(discoveries.shadow, false),
      },
      outerRingRotation: numberOr(parsed.outerRingRotation, fallback.outerRingRotation),
      middleRingRotation: numberOr(parsed.middleRingRotation, fallback.middleRingRotation),
      innerRingRotation: numberOr(parsed.innerRingRotation, fallback.innerRingRotation),
      lightPosition: {
        x: numberOr(light.x, 0),
        y: numberOr(light.y, 0),
        z: numberOr(light.z, 0),
      },
      objectRotation: {
        x: numberOr(rotation.x, 0),
        y: numberOr(rotation.y, 0),
        z: numberOr(rotation.z, 0),
        w: numberOr(rotation.w, 1),
      },
      alignmentSolved: boolOr(parsed.alignmentSolved, false),
      solved: boolOr(parsed.solved, false),
      solveElapsed:
        typeof parsed.solveElapsed === 'number' || parsed.solveElapsed === null
          ? parsed.solveElapsed
          : fallback.solveElapsed,
      soundMuted: boolOr(parsed.soundMuted, false),
    }
  } catch {
    return fallback
  }
}

export function savePersistedState(
  state: PersistedGameState,
  storage: StorageLike | null = getDefaultStorage(),
): void {
  if (!storage) return
  storage.setItem(STORAGE_KEY, JSON.stringify(state))
}

export function clearPersistedState(storage: StorageLike | null = getDefaultStorage()): void {
  storage?.removeItem(STORAGE_KEY)
}
