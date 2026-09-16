export type RingAxis = 'x' | 'y' | 'z'

export type RingConfig = {
  axis: RingAxis
  target: number
  radius: number
  tube: number
}

export type Object001Config = {
  id: string
  code: string
  title: string
  detentCount: number
  tolerance: number
  nearTolerance: number
  confirmDelayMs: number
  bodyRadius: number
  rings: {
    outer: RingConfig
    middle: RingConfig
    inner: RingConfig
  }
  initial: {
    outer: number
    middle: number
    inner: number
  }
  glyph: {
    radius: number
    tube: number
    barLength: number
    barWidth: number
    barDepth: number
  }
  camera: {
    fov: number
    defaultDistance: number
    minDistance: number
    maxDistance: number
  }
  light: {
    default: { x: number; y: number; z: number }
    maxOffset: number
  }
}

const deg = (value: number) => (value * Math.PI) / 180

export const OBJECT_001_CONFIG: Object001Config = {
  id: '001',
  code: 'OBJECT 001',
  title: 'THE CORE',
  detentCount: 24,
  tolerance: deg(18),
  nearTolerance: deg(38),
  confirmDelayMs: 850,
  bodyRadius: 0.82,
  rings: {
    outer: { axis: 'y', target: deg(105), radius: 1.18, tube: 0.052 },
    middle: { axis: 'x', target: deg(285), radius: 1.04, tube: 0.046 },
    inner: { axis: 'z', target: deg(45), radius: 0.91, tube: 0.04 },
  },
  initial: {
    outer: deg(315),
    middle: deg(90),
    inner: deg(210),
  },
  glyph: {
    radius: 1.24,
    tube: 0.03,
    barLength: 2.62,
    barWidth: 0.048,
    barDepth: 0.02,
  },
  camera: {
    fov: 32,
    defaultDistance: 4.7,
    minDistance: 3.5,
    maxDistance: 6.45,
  },
  light: {
    default: { x: 1.05, y: 6.85, z: 2.2 },
    maxOffset: 1.9,
  },
}
