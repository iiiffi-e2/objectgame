import { Bloom, EffectComposer, Noise, Vignette } from '@react-three/postprocessing'
import { prefersReducedMotion, needsLiteGraphics } from '../lib/device'

export function PostFX() {
  if (needsLiteGraphics()) return null

  const reduced = prefersReducedMotion()
  if (reduced) {
    return (
      <EffectComposer enableNormalPass={false} multisampling={0}>
        <Vignette offset={0.28} darkness={0.42} />
      </EffectComposer>
    )
  }

  return (
    <EffectComposer enableNormalPass={false} multisampling={0}>
      <Bloom intensity={0.22} luminanceThreshold={0.74} luminanceSmoothing={0.2} mipmapBlur />
      <Vignette offset={0.32} darkness={0.55} />
      <Noise opacity={0.028} />
    </EffectComposer>
  )
}
