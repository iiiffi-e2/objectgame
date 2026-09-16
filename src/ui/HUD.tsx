import { motion } from 'framer-motion'
import { useGameStore } from '../game/useGameStore'
import { Timer } from './Timer'
import { OBJECT_001_CONFIG } from '../objects/object001/object001Config'

export function HUD() {
  const muted = useGameStore((s) => s.soundMuted)
  const pulse = useGameStore((s) => s.hudPulseAt)
  const solved = useGameStore((s) => s.phase === 'solved')

  if (solved) return null

  return (
    <motion.div
      className="hud"
      key={pulse || 'hud'}
      animate={{ opacity: pulse ? [1, 0.32, 1] : 1 }}
      transition={{ duration: 0.28, ease: 'easeOut' }}
    >
      <div className="hud-top">
        <div className="hud-title">
          <div className="hud-code">{OBJECT_001_CONFIG.code}</div>
          <div className="hud-name">{OBJECT_001_CONFIG.title}</div>
        </div>
        <Timer />
      </div>
      <div className="hud-bottom">
        <button
          type="button"
          className={muted ? 'sound-toggle is-muted' : 'sound-toggle'}
          onClick={() => {
            const store = useGameStore.getState()
            store.setMuted(!store.soundMuted)
          }}
          aria-label={muted ? 'Unmute sound' : 'Mute sound'}
        >
          SOUND
        </button>
      </div>
    </motion.div>
  )
}
