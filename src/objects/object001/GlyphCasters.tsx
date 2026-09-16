import { useRef } from 'react'
import type { Mesh } from 'three'
import { needsLiteGraphics } from '../../lib/device'
import { FloorProjection } from '../../scene/FloorProjection'
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
  const source = useRef<Mesh>(null)
  return (
    <>
      <mesh
        ref={source}
        rotation={[Math.PI / 2, start, 0]}
        castShadow={!lite}
        material={materials.glyph}
      >
        <torusGeometry args={[radius, tube, lite ? 6 : 10, lite ? 24 : 48, arc]} />
      </mesh>
      {lite && <FloorProjection source={source} />}
    </>
  )
}

export function GlyphBar({ materials }: { materials: ObjectMaterials }) {
  const source = useRef<Mesh>(null)
  const lite = needsLiteGraphics()
  const { barLength, barWidth, barDepth } = OBJECT_001_CONFIG.glyph
  return (
    <>
      <mesh ref={source} castShadow={!lite} material={materials.glyph}>
        <boxGeometry args={[barWidth, barDepth, barLength]} />
      </mesh>
      {lite && <FloorProjection source={source} />}
    </>
  )
}
