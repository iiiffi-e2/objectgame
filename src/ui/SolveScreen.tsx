import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { formatCountdown, formatMmSs } from '../lib/format'
import { msUntilNextUtcMidnight } from '../lib/device'
import { countDiscoveries } from '../objects/object001/puzzleLogic'
import { OBJECT_001_CONFIG } from '../objects/object001/object001Config'
import { useGameStore } from '../game/useGameStore'
import { ShareResult } from './ShareResult'

export function SolveScreen() {
  const elapsed = useGameStore((s) => s.solveElapsed ?? s.getElapsed())
  const interactions = useGameStore((s) => s.interactionCount)
  const discoveries = useGameStore((s) => countDiscoveries(s.discoveries))
  const [countdown, setCountdown] = useState(() => msUntilNextUtcMidnight())

  useEffect(() => {
    const id = window.setInterval(() => setCountdown(msUntilNextUtcMidnight()), 1000)
    return () => window.clearInterval(id)
  }, [])

  return (
    <motion.div
      className="solve-screen"
      initial={{ opacity: 0, backgroundColor: '#ffffff' }}
      animate={{ opacity: 1, backgroundColor: '#F2F0EB' }}
      transition={{ duration: 1.1, ease: easeOutExpo }}
    >
      <motion.div
        className="solve-inner"
        initial="hidden"
        animate="show"
        variants={{
          hidden: {},
          show: { transition: { staggerChildren: 0.18, delayChildren: 0.35 } },
        }}
      >
        <motion.div className="solve-kicker" variants={fade}>
          SOLVED
        </motion.div>
        <motion.div className="solve-code" variants={fade}>
          {OBJECT_001_CONFIG.code}
        </motion.div>
        <motion.div className="solve-title" variants={fade}>
          {OBJECT_001_CONFIG.title}
        </motion.div>
        <motion.div className="solve-time" variants={fade}>
          {formatMmSs(elapsed)}
        </motion.div>
        <motion.div className="solve-stats" variants={fade}>
          <span>{interactions} INTERACTIONS</span>
          <span>{discoveries} DISCOVERIES</span>
        </motion.div>
        <motion.div variants={fade}>
          <ShareResult
            elapsedMs={elapsed}
            interactionCount={interactions}
            discoveryCount={discoveries}
          />
        </motion.div>
        <motion.div className="solve-next" variants={fade}>
          <div>OBJECT 002</div>
          <div className="solve-tomorrow">TOMORROW</div>
          <div className="solve-countdown">{formatCountdown(countdown)}</div>
        </motion.div>
      </motion.div>
    </motion.div>
  )
}

const easeOutExpo: [number, number, number, number] = [0.22, 1, 0.36, 1]

const fade = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: easeOutExpo } },
}
