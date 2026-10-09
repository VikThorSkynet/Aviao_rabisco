import test from "node:test";
import assert from "node:assert/strict";
import { WorldModel } from "../src/world/model.js";
import { Flight, windAt, weather } from "../src/physics/flight.js";
import { Progress } from "../src/ui/progress.js";
import {
  crossedBridge,
  surfaceAt,
  inBridgeCorridor,
} from "../src/world/bridge.js";
test("bridge opening has real clearance and a vegetation-free approach in multiple seeds", () => {
  for (const seed of ["jardim-dos-ventos", "abc", "vento-123"]) {
    const w = new WorldModel(seed);
    for (const b of w.specials.filter((s) => s.type === "bridge")) {
      assert.ok(b.y - surfaceAt(w, b.x, b.z) >= 16);
      for (let x = -1; x <= 1; x++)
        for (let z = -1; z <= 1; z++) {
          const c = w.generateChunk(
            Math.floor(b.x / 128) + x,
            Math.floor(b.z / 128) + z,
            4,
          );
          assert.ok(
            ![...c.trees, ...c.rocks].some((o) => inBridgeCorridor(o, b)),
          );
        }
    }
  }
});
test("mission requires crossing under the bridge, not a crash or stationary position", () => {
  const w = new WorldModel("abc"),
    b = w.specials.find((s) => s.type === "bridge"),
    a = { x: b.x, y: b.guideY, z: b.z - 1 },
    p = { ...a, z: b.z + 1 };
  assert.equal(crossedBridge(a, p, b, w), true);
  assert.equal(crossedBridge(p, a, b, w), true);
  assert.equal(crossedBridge(a, a, b, w), false);
  assert.equal(
    crossedBridge({ ...a, y: b.y + 3 }, { ...p, y: b.y + 3 }, b, w),
    false,
  );
  assert.equal(
    crossedBridge(
      { ...a, y: surfaceAt(w, b.x, b.z) + 0.5 },
      { ...p, y: surfaceAt(w, b.x, b.z) + 0.5 },
      b,
      w,
    ),
    false,
  );
  const progress = new Progress("abc"),
    f = { p: a, state: "flying", airtime: 0, distance: 0, safe: a };
  progress.update(f, { y: 0 }, w);
  f.p = p;
  f.state = "crumpled";
  progress.update(f, { y: 0 }, w);
  assert.equal(progress.challenges.has("ponte"), false);
});
test("practice can cross all three bridges with real flight and wind across twelve seeds", () => {
  for (const seed of [
    "jardim-dos-ventos",
    "abc",
    "vento-123",
    ...Array.from({ length: 9 }, (_, i) => "teste-" + i),
  ]) {
    const w = new WorldModel(seed);
    for (const b of w.specials.filter((s) => s.type === "bridge")) {
      const f = new Flight(w),
        progress = new Progress(seed);
      f.practiceBridge(b);
      const cs = [];
      for (let x = -1; x <= 1; x++)
        for (let z = -1; z <= 1; z++)
          cs.push(
            w.generateChunk(
              Math.floor(b.x / 128) + x,
              Math.floor(b.z / 128) + z,
              4,
            ),
          );
      const chunks = {
        nearby: (x, z) =>
          cs.filter(
            (c) =>
              Math.abs(c.cx - Math.floor(x / 128)) <= 1 &&
              Math.abs(c.cz - Math.floor(z / 128)) <= 1,
          ),
      };
      for (
        let i = 0;
        i < 1000 && !progress.challenges.has("ponte") && f.state === "flying";
        i++
      ) {
        const wind = windAt(
          w,
          chunks,
          f.p,
          i / 120,
          weather(w, i / 120, { dayCycle: false, weather: false }),
        );
        f.step(1 / 120, { turn: 0, pitch: 0, charge: false }, wind, chunks);
        progress.update(f, wind, w);
      }
      assert.equal(progress.challenges.has("ponte"), true, `${seed} ${b.id}`);
      assert.equal(f.state, "flying");
      assert.equal(f.boosts, 5);
      assert.equal(
        progress.newChallenges.filter((id) => id === "ponte").length,
        1,
      );
    }
  }
});
