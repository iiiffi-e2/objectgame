import { create } from 'zustand'
import { audio } from '../audio/AudioManager'
import {
  clonePersistedState,
  defaultPersistedState,
  type GamePhase,
  type PersistedGameState,
} from './GameState'
import { clearPersistedState, loadPersistedState, savePersistedState } from '../lib/storage'
import type { DiscoveryFlags } from '../objects/object001/puzzleLogic'

export type GameStore = PersistedGameState & {
  phase: GamePhase
  openingProgress: number
  hudPulseAt: number
  sessionOrigin: number
  debug: boolean
  markStarted: () => void
  addInteraction: () => void
  unlockDiscovery: (key: keyof DiscoveryFlags) => void
  setRingRotations: (rings: { outer: number; middle: number; inner: number }) => void
  setLightPosition: (light: PersistedGameState['lightPosition']) => void
  setObjectRotation: (rotation: PersistedGameState['objectRotation']) => void
  setMuted: (muted: boolean) => void
  setPhase: (phase: GamePhase) => void
  setOpeningProgress: (value: number) => void
  completeSolve: () => void
  pulseHud: () => void
  persistNow: () => void
  resetPuzzle: () => void
  getElapsed: () => number
}

function persistable(state: GameStore): PersistedGameState {
  return {
    gameStarted: state.gameStarted,
    startTimestamp: state.startTimestamp,
    elapsedTime: state.elapsedTime,
    interactionCount: state.interactionCount,
    discoveries: { ...state.discoveries },
    outerRingRotation: state.outerRingRotation,
    middleRingRotation: state.middleRingRotation,
    innerRingRotation: state.innerRingRotation,
    lightPosition: { ...state.lightPosition },
    objectRotation: { ...state.objectRotation },
    alignmentSolved: state.alignmentSolved,
    solved: state.solved,
    solveElapsed: state.solveElapsed,
    soundMuted: state.soundMuted,
  }
}

let persistTimer: ReturnType<typeof setTimeout> | null = null

function schedulePersist(state: GameStore): void {
  if (persistTimer) clearTimeout(persistTimer)
  persistTimer = setTimeout(() => {
    savePersistedState(persistable(state))
  }, 180)
}

export const useGameStore = create<GameStore>((set, get) => {
  const loaded = loadPersistedState()
  const phase: GamePhase = loaded.solved
    ? 'solved'
    : loaded.alignmentSolved
      ? 'awaitingCore'
      : 'idle'

  audio.setMuted(loaded.soundMuted)

  return {
    ...clonePersistedState(loaded),
    phase,
    openingProgress: loaded.alignmentSolved ? 1 : 0,
    hudPulseAt: 0,
    sessionOrigin: Date.now(),
    debug: false,
    markStarted: () => {
      const current = get()
      if (current.gameStarted || current.solved) return
      set({
        gameStarted: true,
        startTimestamp: Date.now(),
        elapsedTime: 0,
        sessionOrigin: Date.now(),
      })
      schedulePersist(get())
    },
    addInteraction: () => {
      set({ interactionCount: get().interactionCount + 1 })
      schedulePersist(get())
    },
    unlockDiscovery: (key) => {
      const current = get()
      if (current.discoveries[key]) return
      set({
        discoveries: { ...current.discoveries, [key]: true },
      })
      audio.playDiscovery()
      get().pulseHud()
      schedulePersist(get())
    },
    setRingRotations: (rings) => {
      set({
        outerRingRotation: rings.outer,
        middleRingRotation: rings.middle,
        innerRingRotation: rings.inner,
      })
      schedulePersist(get())
    },
    setLightPosition: (light) => {
      set({ lightPosition: light })
      schedulePersist(get())
    },
    setObjectRotation: (rotation) => {
      set({ objectRotation: rotation })
      schedulePersist(get())
    },
    setMuted: (muted) => {
      audio.setMuted(muted)
      set({ soundMuted: muted })
      schedulePersist(get())
    },
    setPhase: (phase) => {
      const alignmentSolved =
        phase === 'opening' ||
        phase === 'awaitingCore' ||
        phase === 'activating' ||
        phase === 'solved'
          ? true
          : get().alignmentSolved
      set({ phase, alignmentSolved })
      schedulePersist(get())
    },
    setOpeningProgress: (value) => {
      set({ openingProgress: value })
    },
    completeSolve: () => {
      const elapsed = get().getElapsed()
      set({
        phase: 'solved',
        solved: true,
        alignmentSolved: true,
        solveElapsed: elapsed,
        elapsedTime: elapsed,
      })
      savePersistedState(persistable(get()))
    },
    pulseHud: () => {
      set({ hudPulseAt: Date.now() })
    },
    persistNow: () => {
      const current = get()
      if (current.gameStarted && !current.solved) {
        const elapsed = current.getElapsed()
        set({ elapsedTime: elapsed, sessionOrigin: Date.now() })
      }
      savePersistedState(persistable(get()))
    },
    resetPuzzle: () => {
      clearPersistedState()
      const fresh = clonePersistedState(defaultPersistedState)
      set({
        ...fresh,
        phase: 'idle',
        openingProgress: 0,
        hudPulseAt: 0,
        sessionOrigin: Date.now(),
        debug: get().debug,
      })
      audio.setMuted(false)
      audio.setResonance(0)
      audio.stopHum()
    },
    getElapsed: () => {
      const current = get()
      if (current.solveElapsed != null) return current.solveElapsed
      if (!current.gameStarted) return 0
      return current.elapsedTime + (Date.now() - current.sessionOrigin)
    },
  }
})
