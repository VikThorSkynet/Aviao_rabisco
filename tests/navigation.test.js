import test from "node:test";
import assert from "node:assert/strict";
import {
  headingBearing,
  vectorBearing,
  cardinal,
  navigationState,
  nearestAngle,
} from "../src/ui/navigation.js";
import { missionTargets, targetLabel } from "../src/ui/missions.js";
import { WorldModel } from "../src/world/model.js";
import { mapBounds } from "../src/ui/map.js";

test("compass follows the real flight axes: north, west, south, east", () => {
  for (const [yaw, bearing, name] of [
    [0, 0, "N"],
    [Math.PI / 2, 270, "O"],
    [Math.PI, 180, "S"],
    [-Math.PI / 2, 90, "L"],
  ]) {
    assert.equal(headingBearing(yaw), bearing);
    assert.equal(cardinal(bearing), name);
  }
});
test("wind flag points downwind relative to the aircraft, including calm wind", () => {
  assert.equal(vectorBearing(1, 0), 90);
  assert.equal(vectorBearing(0, 1), 180);
  assert.equal(vectorBearing(-1, 0), 270);
  assert.equal(vectorBearing(0, -1), 0);
  assert.equal(navigationState(Math.PI, { x: 6, z: 0 }).relativeFlow, 270);
  assert.equal(navigationState(0, { x: 0, z: 6 }).relativeFlow, 180);
  const calm = navigationState(1, { x: 0, z: 0 });
  assert.equal(calm.flow, null);
  assert.equal(calm.speed, 0);
  assert.ok(Number.isFinite(calm.relativeFlow));
});
test("instrument rotations take the short path across north", () => {
  assert.equal(nearestAngle(359, 1), 361);
  assert.equal(nearestAngle(1, 359), -1);
  assert.equal(nearestAngle(-720, 10), -710);
});
test("mission directions lead to seeded, physically existing targets without changing progress", () => {
  const world = new WorldModel("jardim-dos-ventos"),
    p = world.spawn,
    progress = { challenges: new Set(["ponte"]) };
  const chunk = world.generateChunk(
    Math.floor(p.x / 128),
    Math.floor(p.z / 128),
    4,
  );
  const chunks = { loaded: new Map([["spawn", chunk]]) };
  const result = missionTargets(world, chunks, p, progress);
  assert.equal(result.length, 3);
  assert.ok(
    result.every((m) => m.target && Number.isFinite(m.meters) && m.meters >= 0),
  );
  assert.ok(world.falls.some((f) => f.id === result[0].target.id));
  assert.equal(result[1].target.type, "bridge");
  assert.equal(result[2].target, world.village);
  assert.equal(result[1].completed, true);
  assert.equal(result[0].completed, false);
  assert.deepEqual([...progress.challenges], ["ponte"]);
  assert.match(result[2].name, /Vila/);
  const fromEmpty = missionTargets(world, { loaded: new Map() }, p, progress);
  assert.equal(fromEmpty[2].target, world.village);
});

test("mission focus keeps player and goal inside the finite map, including edges", () => {
  for (const [p, target] of [
    [
      { x: 0, z: 0 },
      { x: 30, z: 50 },
    ],
    [
      { x: -2020, z: 1900 },
      { x: -1850, z: 2010 },
    ],
    [
      { x: 2020, z: -1900 },
      { x: -1950, z: 2010 },
    ],
  ]) {
    const bounds = mapBounds(p, target);
    assert.ok(bounds.span >= 512 && bounds.span <= 4096);
    assert.ok(
      bounds.x >= -2048 &&
        bounds.z >= -2048 &&
        bounds.x + bounds.span <= 2048 &&
        bounds.z + bounds.span <= 2048,
    );
    for (const point of [p, target])
      assert.ok(
        point.x >= bounds.x &&
          point.x <= bounds.x + bounds.span &&
          point.z >= bounds.z &&
          point.z <= bounds.z + bounds.span,
      );
  }
  assert.deepEqual(mapBounds({ x: 0, z: 0 }, { x: 10, z: 10 }, true), {
    x: -2048,
    z: -2048,
    span: 4096,
  });
});
