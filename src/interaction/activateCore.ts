import { audio } from '../audio/AudioManager'
import { useGameStore } from '../game/useGameStore'
import type { RuntimeRefs } from './runtime'

export function tryActivateCore(runtime: RuntimeRefs): boolean {
  if (runtime.phase.current !== 'awaitingCore') return false
  runtime.phase.current = 'activating'
  runtime.bloom.current = Math.max(runtime.bloom.current, 0.2)
  useGameStore.getState().addInteraction()
  useGameStore.getState().setPhase('activating')
  audio.playCoreActivate()
  window.setTimeout(() => {
    runtime.bloom.current = 1
  }, 200)
  return true
}
