import { afterEach, describe, expect, it } from 'vitest'
import { STORAGE_KEY, clearPersistedState, loadPersistedState, savePersistedState } from './storage'
import { defaultPersistedState } from '../game/GameState'

describe('persisted game state', () => {
  afterEach(() => {
    globalThis.localStorage?.clear()
  })

  it('returns defaults when nothing is stored', () => {
    const memory = new Map<string, string>()
    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value)
      },
      removeItem: (key: string) => {
        memory.delete(key)
      },
    }

    expect(loadPersistedState(storage)).toEqual(defaultPersistedState)
  })

  it('round-trips a mid-game snapshot', () => {
    const memory = new Map<string, string>()
    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value)
      },
      removeItem: (key: string) => {
        memory.delete(key)
      },
    }

    const snapshot = {
      ...defaultPersistedState,
      gameStarted: true,
      startTimestamp: 1_700_000_000_000,
      elapsedTime: 12_345,
      interactionCount: 7,
      discoveries: { rings: true, light: false, shadow: true },
      outerRingRotation: 1.2,
      middleRingRotation: 2.4,
      innerRingRotation: 0.3,
      lightPosition: { x: 0.2, y: 0.1, z: -0.15 },
    }

    savePersistedState(snapshot, storage)
    expect(memory.has(STORAGE_KEY)).toBe(true)
    expect(loadPersistedState(storage)).toEqual(snapshot)
  })

  it('clears stored progress', () => {
    const memory = new Map<string, string>()
    const storage = {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value)
      },
      removeItem: (key: string) => {
        memory.delete(key)
      },
    }

    savePersistedState({ ...defaultPersistedState, solved: true }, storage)
    clearPersistedState(storage)
    expect(loadPersistedState(storage)).toEqual(defaultPersistedState)
  })
})
