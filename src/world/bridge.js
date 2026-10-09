export const BRIDGE = {
  halfDeck: 32,
  halfOpening: 16,
  clearance: 16,
  halfDepth: 3,
};
export function surfaceAt(world, x, z) {
  return Math.max(world.heightAt(x, z), world.waterAt(x, z)?.y ?? -Infinity);
}
export function makeBridge(world, fall, index) {
  const z = fall.z - 22,
    x = world.riverX(z);
  let floor = -Infinity;
  for (let dx = -30; dx <= 30; dx += 3)
    for (let dz = -6; dz <= 6; dz += 3)
      floor = Math.max(floor, surfaceAt(world, x + dx, z + dz));
  for (let dx = -18; dx <= 18; dx += 3)
    for (let dz = -60; dz <= 60; dz += 4)
      floor = Math.max(floor, surfaceAt(world, x + dx, z + dz));
  const y = floor + BRIDGE.clearance;
  return {
    type: "bridge",
    id: `ponte-${index}`,
    x,
    y,
    z,
    floor,
    halfOpening: BRIDGE.halfOpening,
    guideY: y - BRIDGE.clearance / 2,
    entry: { x, y: y - 3, z: z - 48, yaw: Math.PI },
  };
}
export function inBridgeCorridor(object, bridge) {
  return (
    Math.abs(object.x - bridge.x) < bridge.halfOpening + 2 &&
    Math.abs(object.z - bridge.z) < 60
  );
}
export function crossedBridge(previous, current, bridge, world) {
  if (!previous || Math.abs(current.z - previous.z) < 1e-6) return false;
  const t = (bridge.z - previous.z) / (current.z - previous.z);
  if (t < 0 || t > 1) return false;
  const x = previous.x + (current.x - previous.x) * t,
    y = previous.y + (current.y - previous.y) * t;
  return (
    Math.abs(x - bridge.x) < bridge.halfOpening &&
    y > surfaceAt(world, x, bridge.z) + 1.2 &&
    y < bridge.y - 1.5
  );
}
