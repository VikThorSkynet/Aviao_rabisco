import test from 'node:test';
import assert from 'node:assert/strict';
import { windAt, Flight } from '../src/physics/flight.js';
const empty = { nearby: () => [{ thermals: [], trees: [], rocks: [] }] };
function world(overrides = {}) {
  return { heightAt: () => 300, windNormal: () => ({ x: 1, z: 0 }),
    falls: [], specials: [], village: { x: 1000, z: 1000 },
    spawn: { x: 0, y: 400, z: 0, yaw: 0 }, waterAt: () => null, ...overrides };
}
const weather = { x: 6, z: 0, sun: 1, rain: 0 };
test('negative ridge, wave and waterfall contributions are neutral without cancelling lift', () => {
  const w = world({ falls: [{ x: -50, z: 0, bottom: 300 }] });
  const p = { x: -50, z: 0, y: 400 };
  const neutral = windAt(w, empty, p, 0, weather);
  assert.equal(neutral.y, 0);
  assert.equal(neutral.source, null);
  assert.equal(neutral.x, 6);
  assert.equal(neutral.z, 0);
  const thermal = { id: 'lift', type: 'thermal', x: p.x - 15,
    z: 0, r: 20, lift: 6, life: 120, phase: 0.5, ceiling: 240 };
  const rising = windAt(w, { nearby: () => [{ thermals: [thermal] }] }, p, 0, weather);
  assert.ok(Math.abs(rising.y - 3.5) < 1e-10);
  assert.equal(rising.source, 'thermal');
});
test('ascending ridge and waterfall mist remain available', () => {
  assert.ok(windAt(world(), empty, { x: 0, z: 0, y: 320 }, 0,
    { ...weather, x: -6 }).y > 0);
  assert.equal(windAt(world({ windNormal: () => ({ x: 0, z: 0 }),
    falls: [{ x: 0, z: 0, bottom: 300 }] }), empty,
    { x: 0, z: 0, y: 305 }, 0, weather).y, 1.8);
});
test('the glider still loses altitude naturally in neutral air', () => {
  const w = world(), flight = new Flight(w);
  const before = flight.p.y;
  flight.step(1 / 120, { turn: 0, pitch: 0, charge: false },
    { x: 0, z: 0, y: 0, above: 100 }, empty);
  assert.ok(flight.vy < 0);
  assert.ok(flight.p.y < before);
});
