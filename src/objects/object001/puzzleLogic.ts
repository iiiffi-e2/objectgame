import { isWithinAngularTolerance, nearestDetent } from '../../lib/math'
import type { Object001Config } from './object001Config'

export type RingRotations = {
  outer: number
  middle: number
  inner: number
}

export type DiscoveryFlags = {
  rings: boolean
  light: boolean
  shadow: boolean
}

export type AlignmentResult = {
  outerAligned: boolean
  middleAligned: boolean
  innerAligned: boolean
  allAligned: boolean
  alignedCount: number
  nearCount: number
  shadowForming: boolean
}

export function evaluateRingAlignment(
  rotations: RingRotations,
  config: Object001Config,
): AlignmentResult {
  const outerAligned = isWithinAngularTolerance(
    rotations.outer,
    config.rings.outer.target,
    config.tolerance,
  )
  const middleAligned = isWithinAngularTolerance(
    rotations.middle,
    config.rings.middle.target,
    config.tolerance,
  )
  const innerAligned = isWithinAngularTolerance(
    rotations.inner,
    config.rings.inner.target,
    config.tolerance,
  )
  const nearOuter = isWithinAngularTolerance(
    rotations.outer,
    config.rings.outer.target,
    config.nearTolerance,
  )
  const nearMiddle = isWithinAngularTolerance(
    rotations.middle,
    config.rings.middle.target,
    config.nearTolerance,
  )
  const nearInner = isWithinAngularTolerance(
    rotations.inner,
    config.rings.inner.target,
    config.nearTolerance,
  )
  const alignedCount = Number(outerAligned) + Number(middleAligned) + Number(innerAligned)
  const nearCount = Number(nearOuter) + Number(nearMiddle) + Number(nearInner)

  return {
    outerAligned,
    middleAligned,
    innerAligned,
    allAligned: alignedCount === 3,
    alignedCount,
    nearCount,
    shadowForming: nearCount >= 2,
  }
}

export function nearestRingDetent(angle: number, config: Object001Config): number {
  return nearestDetent(angle, config.detentCount)
}

export function countDiscoveries(flags: DiscoveryFlags): number {
  return Number(flags.rings) + Number(flags.light) + Number(flags.shadow)
}
