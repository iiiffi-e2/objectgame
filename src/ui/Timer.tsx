import { useEffect, useState } from 'react'
import { formatMmSs } from '../lib/format'
import { useGameStore } from '../game/useGameStore'

export function Timer() {
  const gameStarted = useGameStore((s) => s.gameStarted)
  const solveElapsed = useGameStore((s) => s.solveElapsed)
  const getElapsed = useGameStore((s) => s.getElapsed)
  const [label, setLabel] = useState('00:00')

  useEffect(() => {
    const update = () => setLabel(formatMmSs(getElapsed()))
    update()
    if (!gameStarted || solveElapsed != null) return
    const id = window.setInterval(update, 250)
    return () => window.clearInterval(id)
  }, [gameStarted, getElapsed, solveElapsed])

  return <span className="hud-timer">{label}</span>
}
