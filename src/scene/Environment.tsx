import { Environment } from '@react-three/drei'
import { needsLiteGraphics } from '../lib/device'

export function SceneEnvironment() {
  if (needsLiteGraphics()) return null
  return <Environment preset="studio" environmentIntensity={0.14} />
}
