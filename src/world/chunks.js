import * as T from "three";
import Worker from "./worker.js?worker&inline";
import { CFG_FREE as C } from "../config.js";
export class Chunks {
  constructor(world, scene, material, quality, onChange) {
    this.world = world;
    this.scene = scene;
    this.material = material;
    this.quality = quality;
    this.onChange = onChange;
    this.loaded = new Map();
    this.pending = new Map();
    this.ready = [];
    this.pool = [];
    this.serial = 0;
    this.worker = new Worker();
    this.worker.postMessage({ seed: world.seed });
    this.worker.onmessage = (e) => {
      const p = this.pending.get(e.data.id);
      this.pending.delete(e.data.id);
      if (e.data.error) {
        this.error = e.data.error;
        return;
      }
      if (p) this.ready.push(e.data.chunk);
    };
    this.worker.onerror = (e) => (this.error = e.message);
  }
  update(x, z) {
    const q = C.quality[this.quality],
      cx = Math.floor(x / 128),
      cz = Math.floor(z / 128),
      wanted = new Map();
    for (let dz = -q.radius; dz <= q.radius; dz++)
      for (let dx = -q.radius; dx <= q.radius; dx++) {
        const a = cx + dx,
          b = cz + dz;
        if (a < -16 || a > 15 || b < -16 || b > 15) continue;
        wanted.set(`${a},${b}`, {
          cx: a,
          cz: b,
          segments:
            Math.max(Math.abs(dx), Math.abs(dz)) <= 1
              ? q.nearSegments
              : q.farSegments,
          d: dx * dx + dz * dz,
        });
      }
    let changed = false;
    for (const [key, c] of this.loaded)
      if (!wanted.has(key)) {
        this.scene.remove(c.mesh);
        this.pool.push(c.mesh.geometry);
        if (this.pool.length > 8) this.pool.shift().dispose();
        this.loaded.delete(key);
        changed = true;
      }
    for (let n = 0; n < 2 && this.ready.length; n++) {
      const c = this.ready.shift(),
        key = `${c.cx},${c.cz}`;
      if (!wanted.has(key) || wanted.get(key).segments !== c.segments) continue;
      const old = this.loaded.get(key);
      if (old) {
        this.scene.remove(old.mesh);
        this.pool.push(old.mesh.geometry);
      }
      const g = this.pool.pop() || new T.BufferGeometry();
      if (g.hasAttribute("position")) g.dispose();
      g.setAttribute("position", new T.BufferAttribute(c.vertices, 3));
      g.setAttribute("color", new T.BufferAttribute(c.colors, 3));
      g.setIndex(new T.BufferAttribute(c.indices, 1));
      g.deleteAttribute("normal");
      g.computeVertexNormals();
      g.computeBoundingSphere();
      const mesh = new T.Mesh(g, this.material);
      this.scene.add(mesh);
      this.loaded.set(key, { ...c, mesh });
      changed = true;
    }
    for (const [key, c] of [...wanted].sort((a, b) => a[1].d - b[1].d)) {
      if (this.pending.size >= 2) break;
      if (
        this.loaded.get(key)?.segments === c.segments ||
        [...this.pending.values()].some(
          (p) => p.cx === c.cx && p.cz === c.cz,
        ) ||
        this.ready.some((p) => p.cx === c.cx && p.cz === c.cz)
      )
        continue;
      const id = ++this.serial;
      this.pending.set(id, c);
      this.worker.postMessage({ id, ...c });
    }
    if (changed) this.onChange([...this.loaded.values()]);
  }
  nearby(x, z) {
    const a = Math.floor(x / 128),
      b = Math.floor(z / 128),
      out = [];
    for (let dx = -1; dx <= 1; dx++)
      for (let dz = -1; dz <= 1; dz++) {
        const c = this.loaded.get(`${a + dx},${b + dz}`);
        if (c) out.push(c);
      }
    return out;
  }
}
