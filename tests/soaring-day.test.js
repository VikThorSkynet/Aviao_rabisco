import test from "node:test";
import assert from "node:assert/strict";
import { dayCycle } from "../src/world/day-cycle.js";
import { soaringAdvice, relativeWindLabel } from "../src/ui/soaring.js";
test("wind labels explain where the air goes relative to the aircraft", () => {
  assert.equal(relativeWindLabel(0), "para frente");
  assert.equal(relativeWindLabel(90), "para a direita");
  assert.equal(relativeWindLabel(180), "para trás");
  assert.equal(relativeWindLabel(270), "para a esquerda");
});
test("air lift and natural aircraft descent receive different cues", () => {
  const f = { state: "flying", speed: 12, vy: 2 },
    w = { sun: 1 };
  assert.equal(soaringAdvice({ y: 3, source: "thermal" }, f, w).kind, "lift");
  assert.match(
    soaringAdvice({ y: 3, source: "thermal" }, f, w).hint,
    /círculos/,
  );
  assert.equal(
    soaringAdvice({ y: 2, source: "ridge" }, { ...f, vy: -1 }, w).kind,
    "potential",
  );
  assert.match(soaringAdvice({ y: 0 }, { ...f, vy: -2 }, w).hint, /naturalmente/);
  assert.match(soaringAdvice({ y: 0 }, f, { sun: 0 }).hint, /encostas/);
});
test("day cycle has morning, day, afternoon and night with normalized blends", () => {
  for (const [phase, period] of [
    [0.08, "Manhã"],
    [0.24, "Dia"],
    [0.39, "Tarde"],
    [0.8, "Noite"],
  ])
    assert.equal(dayCycle(phase).period, period);
  for (let i = 0; i <= 1000; i++) {
    const c = dayCycle(i / 1000);
    assert.ok(Math.abs(c.morning + c.day + c.afternoon + c.night - 1) < 1e-10);
    assert.ok(c.brightness >= 0.18 && c.brightness <= 1);
  }
});
test("visual blends stay continuous across period boundaries and midnight wrap", () => {
  for (const phase of [0, 0.08, 0.14, 0.24, 0.31, 0.39, 0.51, 0.52, 1]) {
    const a = dayCycle(phase - 1e-5),
      b = dayCycle(phase + 1e-5);
    for (const key of ["morning", "day", "afternoon", "night", "brightness"])
      assert.ok(Math.abs(a[key] - b[key]) < 0.001, `${phase} ${key}`);
  }
});
