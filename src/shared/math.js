export const clamp = (x, a, b) => Math.max(a, Math.min(b, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (a, b, x) => {
  const t = clamp((x - a) / (b - a), 0, 1);
  return t * t * (3 - 2 * t);
};
export const angle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
export function hashString(str) {
  let h = 2166136261;
  for (const c of String(str)) {
    h ^= c.charCodeAt(0);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
export function random(seed) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
export function coordinateSeed(seed, x, z) {
  return (seed ^ Math.imul(x, 374761393) ^ Math.imul(z, 668265263)) >>> 0;
}
// Seeded 2-D simplex noise. No global Math.random: main thread and worker agree.
export function simplex(seed) {
  const r = random(seed),
    p = Array.from({ length: 256 }, (_, i) => i);
  for (let i = 255; i > 0; i--) {
    const j = Math.floor(r() * (i + 1));
    [p[i], p[j]] = [p[j], p[i]];
  }
  const perm = new Uint16Array(512);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  const grad = [
    [1, 1],
    [-1, 1],
    [1, -1],
    [-1, -1],
    [1, 0],
    [-1, 0],
    [1, 0],
    [-1, 0],
    [0, 1],
    [0, -1],
    [0, 1],
    [0, -1],
  ];
  return (x, y) => {
    const f = 0.3660254037844386,
      g = 0.2113248654051871,
      s = (x + y) * f,
      i = Math.floor(x + s),
      j = Math.floor(y + s),
      t = (i + j) * g;
    const x0 = x - (i - t),
      y0 = y - (j - t),
      i1 = x0 > y0 ? 1 : 0,
      j1 = x0 > y0 ? 0 : 1;
    const xs = [x0, x0 - i1 + g, x0 - 1 + 2 * g],
      ys = [y0, y0 - j1 + g, y0 - 1 + 2 * g];
    const ii = i & 255,
      jj = j & 255,
      gs = [
        perm[ii + perm[jj]] % 12,
        perm[ii + i1 + perm[jj + j1]] % 12,
        perm[ii + 1 + perm[jj + 1]] % 12,
      ];
    let n = 0;
    for (let k = 0; k < 3; k++) {
      const a = 0.5 - xs[k] * xs[k] - ys[k] * ys[k];
      if (a > 0)
        n += a * a * a * a * (grad[gs[k]][0] * xs[k] + grad[gs[k]][1] * ys[k]);
    }
    return 70 * n;
  };
}
export function segmentDistance(x, z, a, b) {
  const dx = b.x - a.x,
    dz = b.z - a.z,
    t = clamp(
      ((x - a.x) * dx + (z - a.z) * dz) / (dx * dx + dz * dz || 1),
      0,
      1,
    );
  return { d: Math.hypot(x - a.x - t * dx, z - a.z - t * dz), t };
}
