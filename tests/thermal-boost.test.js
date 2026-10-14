import test from 'node:test';
import assert from 'node:assert/strict';
import { Progress } from '../src/ui/progress.js';
import { Flight } from '../src/physics/flight.js';
const world = { landmarks: [], falls: [], specials: [], spawn: { x: 0, y: 100, z: 0, yaw: 0 }, heightAt: () => 0, waterAt: () => null };
test('boost lift is smooth, keeps its two metre assistance and ends its animation', () => {
  const a = new Flight(world), b = new Flight(world), chunks = { nearby: () => [] };
  assert.ok(a.boost()); assert.equal(a.p.y, 100); b.speed = a.speed;
  for (let i = 0; i < 72; i++) {
    const input = { turn: 0, pitch: 0, charge: false }, wind = { x: 0, z: 0, y: 0, above: 100 };
    a.step(1/120, input, wind, chunks); b.step(1/120, input, wind, chunks);
    if (!i) assert.ok(a.p.y - b.p.y < 0.1);
  }
  assert.ok(Math.abs(a.p.y - b.p.y - 2) < 1e-8);
  assert.equal(a.boostAnimation, 0); assert.equal(a.boostLift, 0);
});
