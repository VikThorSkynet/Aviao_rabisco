import { CFG_FREE as C } from "../config.js";
import {
  clamp,
  lerp,
  smooth,
  hashString,
  random,
  coordinateSeed,
  simplex,
  segmentDistance,
} from "../shared/math.js";
export const BIOMES = [
  "Planície de caderno",
  "Floresta de lápis",
  "Serra de nanquim",
  "Vale das cachoeiras",
  "Lago de tinta",
  "Vila de papel",
];
export class WorldModel {
  constructor(seed) {
    this.seed = String(seed).trim().slice(0, 64) || C.world.seed;
    this.hash = hashString(this.seed);
    this.noise = simplex(this.hash);
    const r = random(this.hash);
    this.phase = r() * 6.28;
    this.rivers = [];
    this.lakes = [];
    this.falls = [];
    this.waterGrid = new Map();
    this.normals = new Map();
    this.village = { x: 780 + r() * 240, z: 640 + r() * 240, y: 91 };
    this.makeWater();
    this.indexWater();
    this.makeLandmarks();
    const z = -1160,
      x = this.riverX(z) + 92;
    this.spawn = { x, y: this.heightAt(x, z) + 45, z, yaw: Math.PI };
  }
  fbm(x, z, octaves = 4) {
    let n = 0,
      a = 1,
      total = 0;
    for (let i = 0; i < octaves; i++) {
      n += this.noise(x, z) * a;
      total += a;
      x = x * 2.07 + 17;
      z = z * 2.07 - 9;
      a *= 0.5;
    }
    return n / total;
  }
  riverX(z) {
    return (
      Math.sin(z * 0.0018 + this.phase) * 170 +
      Math.sin(z * 0.0042 + this.phase) * 35
    );
  }
  riverY(z) {
    let y = 218 - (z + 1800) * 0.037;
    for (const at of [-900, 0, 900]) y -= 18 * smooth(at - 3, at + 3, z);
    return Math.max(9, y);
  }
  rawHeight(x, z) {
    const n = this.fbm(x * 0.0018, z * 0.0018),
      continent = smooth(
        -0.35,
        0.55,
        this.noise(x * 0.00062 + 50, z * 0.00062),
      );
    const ridge = Math.pow(
      1 - Math.abs(this.fbm(x * 0.0028 + 3, z * 0.0028 - 7)),
      3,
    );
    let h = 30 + (n + 0.55) * 76 + continent * (90 + ridge * 210);
    const valley = Math.exp(-Math.pow(Math.abs(x - this.riverX(z)) / 175, 2));
    h = lerp(
      h,
      this.riverY(z) + 10 + Math.abs(x - this.riverX(z)) * 0.14,
      valley * 0.96,
    );
    const v = Math.hypot(x - this.village.x, z - this.village.z);
    h = lerp(h, this.village.y, 1 - smooth(75, 210, v));
    return clamp(h, 8, C.terrain.maxHeight);
  }
  makeWater() {
    const main = [];
    for (let z = -1880; z <= 1880; z += 8)
      main.push({
        x: this.riverX(z),
        z,
        y: this.riverY(z),
        width: 9 + smooth(-1500, 1500, z) * 9,
      });
    this.rivers.push({ id: "rio-principal", points: main });
    for (const z of [-900, 0, 900])
      this.falls.push({
        id: `queda-${z}`,
        x: this.riverX(z),
        z,
        top: this.riverY(z - 4),
        bottom: this.riverY(z + 4),
        width: 14,
      });
    const r = random(this.hash ^ 71831);
    // Tributaries descend the lowest of eight neighbours. A trapped stream becomes
    // a lake; the main seeded valley provides a continuous outlet and three falls.
    for (let k = 0; k < C.water.springs; k++) {
      let x = (r() - 0.5) * 3300,
        z = (r() - 0.5) * 3300;
      for (let tries = 0; tries < 12 && this.rawHeight(x, z) < 170; tries++) {
        x = (r() - 0.5) * 3300;
        z = (r() - 0.5) * 3300;
      }
      const pts = [],
        visited = new Set();
      for (let j = 0; j < 100; j++) {
        const y = this.rawHeight(x, z) - 1;
        pts.push({ x, y, z, width: 2.2 });
        let best = { x, z, y };
        for (let a = 0; a < 8; a++) {
          const nx = x + Math.cos((a * Math.PI) / 4) * 28,
            nz = z + Math.sin((a * Math.PI) / 4) * 28,
            ny = this.rawHeight(nx, nz) - 1;
          if (ny < best.y) best = { x: nx, z: nz, y: ny };
        }
        if (best.y >= y - 0.2) {
          if (j > 2)
            this.lakes.push({
              id: `lago-${k}`,
              x,
              z,
              y: y + 0.5,
              r: 13 + r() * 12,
            });
          break;
        }
        if (
          y - best.y > C.water.waterfallDrop &&
          j > 0 &&
          this.falls.length < 12
        )
          this.falls.push({
            id: `queda-extra-${k}-${j}`,
            x,
            z,
            top: y,
            bottom: best.y,
            width: 4,
          });
        x = best.x;
        z = best.z;
        const key = `${Math.round(x / 20)},${Math.round(z / 20)}`;
        if (
          visited.has(key) ||
          Math.abs(x) > 1980 ||
          Math.abs(z) > 1980 ||
          Math.abs(x - this.riverX(z)) < 18
        )
          break;
        visited.add(key);
      }
      if (pts.length > 2)
        this.rivers.push({ id: `afluente-${k}`, points: pts });
    }
    this.lakes.push({
      id: "lago-tinta",
      x: this.riverX(1610),
      z: 1610,
      y: this.riverY(1610) + 1,
      r: 115,
    });
    const x = -920,
      z = 650;
    this.lakes.push({
      id: "lago-escondido",
      x,
      z,
      y: this.rawHeight(x, z) - 3,
      r: 30,
    });
  }
  indexWater() {
    for (const river of this.rivers)
      for (let i = 0; i < river.points.length - 1; i++) {
        const a = river.points[i],
          b = river.points[i + 1],
          segment = { a, b, width: a.width, id: river.id };
        const minX = Math.floor((Math.min(a.x, b.x) - 35) / 64),
          maxX = Math.floor((Math.max(a.x, b.x) + 35) / 64);
        const minZ = Math.floor((Math.min(a.z, b.z) - 35) / 64),
          maxZ = Math.floor((Math.max(a.z, b.z) + 35) / 64);
        for (let x = minX; x <= maxX; x++)
          for (let z = minZ; z <= maxZ; z++) {
            const key = `${x},${z}`;
            if (!this.waterGrid.has(key)) this.waterGrid.set(key, []);
            this.waterGrid.get(key).push(segment);
          }
      }
  }
  waterAt(x, z) {
    let result = null;
    for (const lake of this.lakes) {
      const d = Math.hypot(x - lake.x, z - lake.z);
      if (d < lake.r)
        result = { y: lake.y, d, width: lake.r, kind: "lake", id: lake.id };
    }
    for (const seg of this.waterGrid.get(
      `${Math.floor(x / 64)},${Math.floor(z / 64)}`,
    ) || []) {
      const q = segmentDistance(x, z, seg.a, seg.b);
      if (q.d < seg.width && (!result || q.d < result.d))
        result = {
          y: lerp(seg.a.y, seg.b.y, q.t),
          d: q.d,
          width: seg.width,
          kind: "river",
          id: seg.id,
        };
    }
    return result;
  }
  heightAt(x, z) {
    let h = this.rawHeight(x, z);
    for (const lake of this.lakes) {
      const d = Math.hypot(x - lake.x, z - lake.z);
      if (d < lake.r + 20)
        h = lerp(h, lake.y - 4, 1 - smooth(lake.r - 5, lake.r + 20, d));
    }
    for (const seg of this.waterGrid.get(
      `${Math.floor(x / 64)},${Math.floor(z / 64)}`,
    ) || []) {
      const q = segmentDistance(x, z, seg.a, seg.b);
      if (q.d < seg.width + 18) {
        const y = lerp(seg.a.y, seg.b.y, q.t) - 2;
        h = Math.min(
          h,
          lerp(h, y, 1 - smooth(seg.width * 0.8, seg.width + 18, q.d)),
        );
      }
    }
    return h;
  }
  normalAt(x, z) {
    const dx = (this.heightAt(x + 2, z) - this.heightAt(x - 2, z)) / 4,
      dz = (this.heightAt(x, z + 2) - this.heightAt(x, z - 2)) / 4,
      len = Math.hypot(dx, 1, dz);
    return {
      x: -dx / len,
      y: 1 / len,
      z: -dz / len,
      slope: Math.hypot(dx, dz),
    };
  }
  windNormal(x, z) {
    const key = `${Math.round(x / 6)},${Math.round(z / 6)}`;
    let n = this.normals.get(key);
    if (!n) {
      if (this.normals.size > 3000) this.normals.clear();
      n = this.normalAt(Math.round(x / 6) * 6, Math.round(z / 6) * 6);
      this.normals.set(key, n);
    }
    return n;
  }
  biomeAt(x, z, h = this.heightAt(x, z), n = this.normalAt(x, z)) {
    if (this.waterAt(x, z)?.kind === "lake") return 4;
    if (Math.hypot(x - this.village.x, z - this.village.z) < 150) return 5;
    if (Math.abs(x - this.riverX(z)) < 70 || this.waterAt(x, z)) return 3;
    if (h > 280 || n.slope > 0.9) return 2;
    if (this.noise(x * 0.002 + 13, z * 0.002) > 0.02 && h > 65) return 1;
    return 0;
  }
  makeLandmarks() {
    let peak = { x: 0, z: 0, y: 0 };
    for (let x = -1850; x < 1900; x += 85)
      for (let z = -1850; z < 1900; z += 85) {
        const y = this.heightAt(x, z);
        if (y > peak.y) peak = { x, y, z };
      }
    this.landmarks = [
      { ...peak, id: "pico", name: "Pico do Nanquim", icon: "△" },
      { ...this.village, id: "vila", name: "Vila Dobradinha", icon: "⌂" },
      {
        x: this.falls[0].x,
        y: this.falls[0].bottom,
        z: this.falls[0].z,
        id: "cachoeira",
        name: "Cachoeira Grande",
        icon: "≋",
      },
      {
        x: this.riverX(1610),
        y: this.riverY(1610),
        z: 1610,
        id: "lago",
        name: "Lago de Tinta",
        icon: "◉",
      },
      {
        x: -920,
        z: 650,
        y: this.heightAt(-920, 650),
        id: "escondido",
        name: "Lago Escondido",
        icon: "◌",
      },
      {
        x: -620,
        z: 460,
        y: this.heightAt(-620, 460),
        id: "ninho",
        name: "Ninho de Papel",
        icon: "♧",
      },
    ];
    this.specials = [
      { type: "village", ...this.village },
      ...this.falls
        .slice(0, 3)
        .map((f, i) => ({
          type: "bridge",
          x: f.x,
          y: f.top + 5,
          z: f.z - 22,
          id: `ponte-${i}`,
        })),
      ...[
        this.landmarks[0],
        { x: this.spawn?.x || this.riverX(-1120) + 110, z: -1120 },
        this.village,
      ].map((s, i) => ({
        type: "catapult",
        x: s.x,
        z: s.z,
        y: this.heightAt(s.x, s.z),
        id: `lancador-${i}`,
      })),
      {
        type: "geyser",
        x: -500,
        z: -460,
        y: this.heightAt(-500, -460),
        id: "geiser",
      },
      ...[0, 1, 2].map((i) => {
        const x = this.village.x + (i - 1) * 100,
          z = this.village.z - 70;
        return {
          type: "balloon",
          x,
          z,
          y: this.heightAt(x, z),
          id: `balao-${i}`,
        };
      }),
    ];
  }
  generateChunk(cx, cz, segments) {
    const size = C.world.chunk,
      x0 = cx * size,
      z0 = cz * size,
      r = random(coordinateSeed(this.hash, cx, cz)),
      vertices = new Float32Array((segments + 1) ** 2 * 3),
      colors = new Float32Array(vertices.length),
      indices = [];
    const palette = [
      [0.84, 0.87, 0.7],
      [0.7, 0.81, 0.66],
      [0.77, 0.79, 0.78],
      [0.75, 0.86, 0.76],
      [0.71, 0.83, 0.87],
      [0.91, 0.84, 0.69],
    ];
    for (let z = 0; z <= segments; z++)
      for (let x = 0; x <= segments; x++) {
        const wx = x0 + (x / segments) * size,
          wz = z0 + (z / segments) * size,
          y = this.heightAt(wx, wz),
          i = (z * (segments + 1) + x) * 3;
        vertices.set([wx, y, wz], i);
        const h = this.rawHeight(wx, wz),
          biome =
            h > 280
              ? 2
              : Math.abs(wx - this.riverX(wz)) < 100
                ? 3
                : this.noise(wx * 0.002 + 13, wz * 0.002) > 0.02
                  ? 1
                  : 0;
        colors.set(palette[biome], i);
        if (x < segments && z < segments) {
          const a = z * (segments + 1) + x,
            b = a + 1,
            c = a + segments + 1,
            d = c + 1;
          indices.push(a, c, b, b, c, d);
        }
      }
    const trees = [],
      rocks = [],
      pickups = [],
      thermals = [],
      props = [],
      points = [];
    for (let tries = 0; tries < 65; tries++) {
      const x = x0 + r() * size,
        z = z0 + r() * size,
        h = this.heightAt(x, z),
        n = this.normalAt(x, z),
        b = this.biomeAt(x, z, h, n);
      if (
        this.waterAt(x, z) ||
        Math.abs(x - this.riverX(z)) < 25 ||
        points.some((p) => Math.hypot(x - p.x, z - p.z) < 11)
      )
        continue;
      points.push({ x, z });
      if (trees.length < (b === 1 ? 20 : 6) && n.slope < 0.9 && h < 310)
        trees.push({
          x,
          y: h,
          z,
          h: 9 + r() * 14,
          color: Math.floor(r() * 4),
          radius: 1.1,
        });
      else if (rocks.length < 5 && b === 2)
        rocks.push({ x, y: h, z, r: 2 + r() * 4 });
    }
    for (let i = 0; i < 4; i++) {
      const x = x0 + 15 + r() * 98,
        z = z0 + 15 + r() * 98,
        y = this.heightAt(x, z) + 8 + r() * 22;
      pickups.push({
        id: `${cx}:${cz}:pena${i}`,
        type: r() < C.boosts.featherChance ? "feather" : "leaf",
        x,
        y,
        z,
      });
    }
    const tx = x0 + 64 + (r() - 0.5) * 55,
      tz = z0 + 64 + (r() - 0.5) * 55,
      th = this.heightAt(tx, tz),
      b = this.biomeAt(tx, tz);
    if (!this.waterAt(tx, tz) && r() < (b === 1 ? 0.4 : 0.93)) {
      const count = b === 0 || b === 5 ? 2 : 1;
      for (let i = 0; i < count; i++) {
        const x = tx + i * 35,
          z = tz - i * 25;
        if (this.waterAt(x, z)) continue;
        thermals.push({
          id: `termal-${cx}:${cz}:${i}`,
          type: "thermal",
          x,
          y: this.heightAt(x, z),
          z,
          r: 14 + r() * 9,
          lift: 4 + r() * 5,
          life: 120 + r() * 180,
          phase: r(),
          ceiling: 240,
        });
      }
    }
    if (b === 0 && r() < 0.35)
      props.push({ type: "windmill", x: tx, y: th, z: tz });
    if (b === 1 && r() < 0.5)
      props.push({ type: "mushroom", x: tx, y: th, z: tz });
    if (b === 0 && r() < 0.22)
      props.push({ type: "fence", x: tx, y: th, z: tz });
    if (r() < 0.08)
      thermals.push({
        type: "gust",
        id: `rajada-${cx}:${cz}`,
        x: tx,
        y: th + 35,
        z: tz,
        r: 16,
        lift: 2.5,
        dir: this.phase + cx * 0.1,
        len: 110,
      });
    return {
      cx,
      cz,
      segments,
      vertices,
      colors,
      indices: new Uint32Array(indices),
      trees,
      rocks,
      pickups,
      thermals,
      props,
    };
  }
}
