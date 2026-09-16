import { useFrame } from '@react-three/fiber'
import { useRuntime } from '../../interaction/runtime'
import { Core } from './Core'
import { CoreMechanism } from './CoreMechanism'
import { InnerRing } from './InnerRing'
import { MiddleRing } from './MiddleRing'
import { ObjectMaterialsProvider } from './materials'
import { OuterRing } from './OuterRing'

export function Object001() {
  const runtime = useRuntime()

  useFrame(() => {
    const group = runtime.objectGroup.current
    if (!group) return
    group.quaternion.copy(runtime.objectQuat.current)
  })

  return (
    <group ref={runtime.objectGroup}>
      <ObjectMaterialsProvider>
        <CoreMechanism />
        <OuterRing />
        <MiddleRing />
        <InnerRing />
        <Core />
      </ObjectMaterialsProvider>
    </group>
  )
}
