import { formatMmSs } from './format'

export type ShareStats = {
  elapsedMs: number
  interactionCount: number
  discoveryCount: number
}

function mulberry32(seed: number): () => number {
  let t = seed >>> 0
  return () => {
    t += 0x6d2b79f5
    let x = t
    x = Math.imul(x ^ (x >>> 15), x | 1)
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61)
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296
  }
}

export function buildSharePattern(stats: ShareStats): string {
  const seed =
    Math.floor(stats.elapsedMs / 1000) * 13 +
    stats.interactionCount * 31 +
    stats.discoveryCount * 97 +
    17
  const rng = mulberry32(seed)
  return Array.from({ length: 5 }, () => (rng() > 0.42 ? '◼' : '◻')).join(' ')
}

export function buildShareText(input: ShareStats & { objectCode: string }): string {
  return [
    input.objectCode,
    '',
    `Solved in ${formatMmSs(input.elapsedMs)}`,
    '',
    buildSharePattern(input),
    `${input.interactionCount} interactions`,
    `${input.discoveryCount} discoveries`,
    '',
    'OBJECT',
  ].join('\n')
}
