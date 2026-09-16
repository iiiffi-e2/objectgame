import { needsLiteGraphics } from '../../lib/device'
import type { ObjectMaterials } from './materials'
import { OBJECT_001_CONFIG } from './object001Config'

type GlyphArcProps = {
  start: number
  arc: number
  materials: ObjectMaterials
}

export function GlyphArc({ start, arc, materials }: GlyphArcProps) {
  const { radius, tube } = OBJECT_001_CONFIG.glyph
  const lite = needsLiteGraphics()
  return (
    <mesh rotation={[Math.PI / 2, start, 0]} castShadow material={materials.glyph}>
      <torusGeometry args={[radius, tube, lite ? 6 : 10, lite ? 24 : 48, arc]} />
    </mesh>
  )
}

export function GlyphBar({ materials }: { materials: ObjectMaterials }) {
  const { barLength, barWidth, barDepth } = OBJECT_001_CONFIG.glyph
  return (
    <mesh castShadow material={materials.glyph}>
      <boxGeometry args={[barWidth, barDepth, barLength]} />
    </mesh>
  )
}
