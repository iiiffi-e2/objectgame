import { CURRENT_OBJECT_ID, OBJECT_REGISTRY } from '../objects/registry'
import { InteractionController } from '../interaction/InteractionController'
import { PuzzleController } from '../interaction/PuzzleController'
import { CameraRig } from './CameraRig'
import { SceneEnvironment } from './Environment'
import { Lighting } from './Lighting'
import { LiteLoop } from './LiteLoop'
import { PostFX } from './PostFX'
import { ShadowSurface } from './ShadowSurface'

const CurrentObject = OBJECT_REGISTRY[CURRENT_OBJECT_ID].Component

export function Scene() {
  return (
    <>
      <color attach="background" args={['#050505']} />
      <fog attach="fog" args={['#050505', 9, 20]} />
      <LiteLoop />
      <CameraRig />
      <Lighting />
      <SceneEnvironment />
      <ShadowSurface />
      <CurrentObject />
      <InteractionController />
      <PuzzleController />
      <PostFX />
    </>
  )
}

