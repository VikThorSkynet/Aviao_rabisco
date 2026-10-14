import test from 'node:test';
import assert from 'node:assert/strict';
import { Progress } from '../src/ui/progress.js';
import { Flight } from '../src/physics/flight.js';
const world = { landmarks: [], falls: [], specials: [], spawn: { x: 0, y: 100, z: 0, yaw: 0 }, heightAt: () => 0, waterAt: () => null };
test('thermal mission accumulates 30 m, survives landing and reload, excludes boosts', () => {
  const saves = new Map();
  globalThis.localStorage = { getItem: k => saves.get(k), setItem: (k,v) => saves.set(k,v) };
  let p = new Progress('thermal-review');
  const f = { p: { x: 0, z: 0, y: 100 }, state: 'flying', cooldown: 0, airtime: 0, distance: 0 };
  const air = { thermal: 'core' };
  p.update(f, air, world);
  f.p.y += 10; p.update(f, air, world); assert.equal(p.thermalGain, 10);
  f.state = 'grounded'; p.update(f, air, world); assert.equal(p.thermalGain, 10);
  f.state = 'flying'; f.p.y += 50; p.update(f, air, world); assert.equal(p.thermalGain, 10);
  f.cooldown = 0.4; f.p.y += 2; p.update(f, air, world);
  f.cooldown = 0; f.p.y += 2; p.update(f, air, world); assert.equal(p.thermalGain, 10);
  f.p.y += 10; p.update(f, air, world); p.save(0);
  p = new Progress('thermal-review'); assert.equal(p.thermalGain, 20);
  p.update(f, air, world); f.p.y += 10; p.update(f, air, world);
  assert.ok(p.challenges.has('termal')); assert.deepEqual(p.newChallenges, ['termal']);
  p.update(f, air, world); assert.equal(p.newChallenges.length, 1);
  delete globalThis.localStorage;
});
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
