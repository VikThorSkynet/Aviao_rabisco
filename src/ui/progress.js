import { crossedBridge } from "../world/bridge.js";
export class Progress {
  constructor(seed) {
    this.key = "rabisco_free_v1_" + seed;
    let s = {};
    try {
      s = JSON.parse(localStorage.getItem(this.key) || "{}");
    } catch {}
    this.album = new Set(s.album || []);
    this.visited = new Set(s.visited || []);
    this.collected = new Set(s.collected || []);
    this.discovered = new Set(s.discovered || []);
    this.thermals = new Set(s.thermals || []);
    this.challenges = new Set(s.challenges || []);
    this.records = s.records || { altitude: 0, airtime: 0, distance: 0 };
    this.safe = s.safe;
    this.time = s.time || 0;
    this.dirty = true;
    this.previousPosition = null;
    this.newChallenges = [];
  }
  update(f, w, world) {
    const p = f.p;
    const vx = Math.floor((p.x + 2048) / 64),
      vz = Math.floor((p.z + 2048) / 64);
    for (let dx = -2; dx <= 2; dx++)
      for (let dz = -2; dz <= 2; dz++)
        if (
          dx * dx + dz * dz <= 5 &&
          vx + dx >= 0 &&
          vx + dx < 64 &&
          vz + dz >= 0 &&
          vz + dz < 64
        )
          this.visited.add(`${vx + dx},${vz + dz}`);
    this.records.altitude = Math.max(this.records.altitude, p.y);
    this.records.airtime = Math.max(this.records.airtime, f.airtime);
    this.records.distance = Math.max(this.records.distance, f.distance);
    if (w.thermal) this.thermals.add(w.thermal);
    for (const l of world.landmarks)
      if (Math.hypot(p.x - l.x, p.z - l.z) < 80 && !this.discovered.has(l.id)) {
        this.discovered.add(l.id);
        f.flash = "Nova descoberta: " + l.name;
      }
    for (const fall of world.falls)
      if (
        Math.abs(p.x - fall.x) < fall.width &&
        Math.abs(p.z - fall.z) < 8 &&
        p.y > fall.bottom + 2 &&
        p.y < fall.top - 2
      )
        this.completeChallenge("cachoeira");
    if (f.state === "flying")
      for (const b of world.specials.filter((s) => s.type === "bridge"))
        if (crossedBridge(this.previousPosition, p, b, world))
          this.completeChallenge("ponte");
    this.previousPosition =
      f.state === "flying" ? { x: p.x, y: p.y, z: p.z } : null;
    if (f.state !== "flying") {
      this.thermalGain = 0;
      this.previousY = p.y;
    }
    if (w.thermal && f.cooldown === 0 && this.previousY !== undefined)
      this.thermalGain =
        (this.thermalGain || 0) + Math.max(0, p.y - this.previousY);
    this.previousY = p.y;
    if (this.thermalGain >= 300) this.completeChallenge("termal");
    this.safe = f.safe;
  }
  completeChallenge(id) {
    if (this.challenges.has(id)) return;
    this.challenges.add(id);
    this.newChallenges.push(id);
  }
  resetTraversal() {
    this.previousPosition = null;
    this.thermalGain = 0;
    this.previousY = undefined;
  }
  observe(view, f, w) {
    const p = f.p;
    for (const d of view.dynamic)
      if (
        d.type === "rainbow" &&
        d.mesh.material.opacity > 0.12 &&
        d.mesh.position.distanceTo(view.player.position) < 70
      )
        this.album.add("Arco-íris de lápis");
    if (
      view.fish.some(
        (b) => b.visible && b.position.distanceTo(view.player.position) < 55,
      )
    )
      this.album.add("Peixe dourado");
    if (p.y - view.world.heightAt(p.x, p.z) < 12)
      this.album.add("Borboleta de rabisco");
    if (
      view.birds
        .slice(4)
        .some(
          (b) => b.visible && b.position.distanceTo(view.player.position) < 50,
        )
    )
      this.album.add("Bando de papel");
  }
  save(time) {
    try {
      localStorage.setItem(
        this.key,
        JSON.stringify({
          album: [...this.album],
          visited: [...this.visited],
          collected: [...this.collected],
          discovered: [...this.discovered],
          thermals: [...this.thermals],
          challenges: [...this.challenges],
          records: this.records,
          safe: this.safe,
          time,
        }),
      );
    } catch {
      this.failed = true;
    }
  }
}
