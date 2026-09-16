export type Vec3 = { x: number; y: number; z: number }

export const SHADOW_FLOOR_Y = -1.73

export function projectPointToFloor(point: Vec3, lightDirection: Vec3, floorY: number): Vec3 {
  const dy = lightDirection.y
  if (Math.abs(dy) < 1e-6) {
    return { x: point.x, y: floorY, z: point.z }
  }
  const t = (floorY - point.y) / dy
  return {
    x: point.x + lightDirection.x * t,
    y: floorY,
    z: point.z + lightDirection.z * t,
  }
}

export function lightDirectionTowardFloor(
  light: Vec3,
  target: Vec3 = { x: 0, y: -0.2, z: 0 },
): Vec3 {
  return {
    x: target.x - light.x,
    y: target.y - light.y,
    z: target.z - light.z,
  }
}
