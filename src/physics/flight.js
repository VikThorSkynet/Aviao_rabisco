import { clamp } from "../shared/math.js";
export function weather(world, time, settings) {
  const phase = settings.dayCycle ? (time / 720 + 0.18) % 1 : 0.25,
    sun = Math.max(0, Math.sin(phase * Math.PI * 2)),
    rain = settings.weather
      ? Math.max(0, world.noise(time / 300, 73) - 0.35) * 2
      : 0,
    dir = world.phase + Math.sin(time / 180) * 0.65,
    strength = 6 + rain * 4;
  return {
    phase,
    sun,
    rain,
    x: Math.sin(dir) * strength,
    z: Math.cos(dir) * strength,
    dir,
  };
}
export function windAt(world, chunks, p, time, w) {
  const ground = world.heightAt(p.x, p.z),
    above = p.y - ground,
    n = world.windNormal(p.x, p.z),
    face = -(w.x * n.x + w.z * n.z);
  let y = face * 1.2 * Math.exp(-Math.max(0, above) / 60),
    thermal = null;
  for (const c of chunks.nearby(p.x, p.z))
    for (const t of c.thermals) {
      if (t.type === "gust") {
        const d = Math.hypot(p.x - t.x, p.z - t.z);
        if (d < 110) y += Math.exp((-d * d) / 1200) * 2.5;
        continue;
      }
      const dx = p.x - t.x - w.x * above * 0.025,
        dz = p.z - t.z - w.z * above * 0.025,
        life =
          0.35 + 0.65 * Math.sin(Math.PI * ((time / t.life + t.phase) % 1)),
        lift =
          t.lift *
          Math.exp(-(dx * dx + dz * dz) / (t.r * t.r)) *
          life *
          w.sun *
          (1 - w.rain * 0.8) *
          clamp(1 - above / t.ceiling, 0, 1);
      y += lift;
      if (lift > 1) thermal = t.id;
    }
  if (ground > 250 && face < 0 && above > 60)
    y += Math.sin((p.x * w.x + p.z * w.z) / 190) * 2.5 * Math.exp(-above / 400);
  for (const f of world.falls) {
    const d = Math.hypot(p.x - f.x, p.z - f.z);
    if (d < 30)
      y += p.y < f.bottom + 12 ? 1.8 * (1 - d / 30) : -2 * (1 - d / 30);
  }
  for (const s of world.specials) {
    const d = Math.hypot(p.x - s.x, p.z - s.z);
    if (d < 20 && above < 110) {
      if (s.type === "geyser")
        y += Math.max(0, Math.sin(time * 0.3)) * 9 * Math.exp((-d * d) / 80);
      if (s.type === "balloon" || s.type === "village")
        y += 3 * Math.exp((-d * d) / 100);
    }
  }
  const fan =
    Math.hypot(p.x - world.village.x, p.z - world.village.z) < 35 && above < 30
      ? 5
      : 0;
  return { x: w.x + fan, z: w.z, y: clamp(y, -10, 14), thermal, ground, above };
}
export class Flight {
  constructor(world, saved) {
    this.world = world;
    this.p = { ...world.spawn };
    this.safe = saved?.safe || { ...world.spawn };
    this.speed = 14;
    this.pitch = 0;
    this.roll = 0;
    this.vy = 0;
    this.boosts = 5;
    this.state = "flying";
    this.charge = 0;
    this.airtime = 0;
    this.distance = 0;
    this.regen = 0;
    this.cooldown = 0;
    this.flash = "";
  }
  boost() {
    if (this.state !== "flying" || this.boosts < 1 || this.cooldown > 0)
      return false;
    this.boosts--;
    this.speed = Math.min(28, this.speed + 7);
    this.p.y += 2;
    this.cooldown = 0.5;
    return true;
  }
  release() {
    if (this.state !== "grounded") return;
    const cat = this.world.specials.some(
      (s) =>
        s.type === "catapult" &&
        Math.hypot(s.x - this.p.x, s.z - this.p.z) < 15,
    );
    this.speed = cat ? 30 : 9 + Math.min(1, this.charge) * 5;
    this.pitch = 0.35;
    this.p.y += 1.7;
    this.state = "flying";
    this.toss = 1.5;
    this.charge = 0;
    this.airtime = 0;
    this.distance = 0;
  }
  recover(reason) {
    this.state = "crumpled";
    this.timer = 1.4;
    this.airtime = 0;
    this.distance = 0;
    this.flash = reason;
    this.charge = 0;
  }
  step(dt, input, wind, chunks) {
    const p = this.p;
    this.cooldown = Math.max(0, this.cooldown - dt);
    if (this.state === "crumpled") {
      this.timer -= dt;
      if (this.timer <= 0) {
        this.p = { ...this.safe };
        this.speed = 14;
        this.pitch = 0;
        this.roll = 0;
        this.state = "flying";
        this.p.y = Math.max(
          this.p.y,
          this.world.heightAt(this.p.x, this.p.z) + 15,
        );
      }
      return;
    }
    if (this.state === "grounded") {
      p.y = this.world.heightAt(p.x, p.z) + 0.65;
      p.yaw -= input.turn * dt;
      this.charge = input.charge
        ? Math.min(1, this.charge + dt * 0.7)
        : this.charge;
      this.regen += dt;
      if (this.regen >= 10) {
        this.boosts = Math.min(5, this.boosts + 1);
        this.regen = 0;
      }
      return;
    }
    this.roll += (input.turn * 0.85 - this.roll) * Math.min(1, dt * 4);
    this.pitch = clamp(this.pitch + input.pitch * dt * 0.65, -0.7, 0.65);
    if (!input.pitch) this.pitch += (-0.035 - this.pitch) * dt * 0.7;
    p.yaw -= this.roll * dt * 1.3;
    this.speed = clamp(
      this.speed +
        (-Math.sin(this.pitch) * 9.8 - 0.0055 * this.speed * this.speed + 0.8) *
          dt,
      4,
      32,
    );
    const sink =
      (1.1 + 0.008 * (this.speed - 12) ** 2 + 0.6 * Math.abs(this.roll)) *
      (0.5 + 0.5 * clamp(wind.above / 2, 0, 1));
    this.toss = Math.max(0, (this.toss || 0) - dt);
    this.vy =
      Math.sin(this.pitch) * this.speed - sink + wind.y + (this.toss ? 3 : 0);
    const dx = (-Math.sin(p.yaw) * this.speed + wind.x * 0.35) * dt,
      dz = (-Math.cos(p.yaw) * this.speed + wind.z * 0.35) * dt;
    p.x += dx;
    p.z += dz;
    p.y += this.vy * dt;
    this.distance += Math.hypot(dx, dz);
    this.airtime += dt;
    if (Math.abs(p.x) > 2010 || Math.abs(p.z) > 2010) {
      p.yaw = Math.atan2(p.x, p.z);
      p.x = clamp(p.x, -2020, 2020);
      p.z = clamp(p.z, -2020, 2020);
      this.flash = "A borda do caderno • vire para explorar";
    }
    const water = this.world.waterAt(p.x, p.z),
      h = this.world.heightAt(p.x, p.z);
    if (water && p.y < water.y + 1) {
      this.recover("Papel molhado… dobrando outro avião");
      return;
    }
    if (p.y < h + 0.65) {
      const normal = this.world.normalAt(p.x, p.z),
        impact = Math.abs((dx / dt) * normal.x + this.vy * normal.y + (dz / dt) * normal.z);
      if (impact < 5 && this.speed < 17 && normal.slope < 0.7) {
        p.y = h + 0.65;
        this.state = "grounded";
        this.safe = { ...p, y: p.y + 18 };
        this.flash = "Pouso suave! Segure espaço e solte para voar";
      } else if (impact < 3 && normal.slope < 1.2 && this.speed < 14) {
        p.y = h + .7;
        p.x += normal.x * dt * 3;
        p.z += normal.z * dt * 3;
        this.speed = Math.max(4, this.speed - dt * 8);
      } else this.recover("Um amassadinho… e um novo voo");
    }
    for (const s of this.world.specials) {
      if (Math.hypot(p.x-s.x,p.z-s.z)>70) continue;
      if (s.type === 'bridge' && Math.abs(p.x-s.x)<32 && Math.abs(p.z-s.z)<3 && Math.abs(p.y-s.y)<1.2) {
        this.recover('A régua ganhou esta… vamos de novo'); return;
      }
      if (s.type === 'balloon' && Math.hypot((p.x-s.x)/9,(p.y-s.y-80)/12,(p.z-s.z)/9)<1) {
        this.recover('Um encontro com o balão! Redobrando…'); return;
      }
    }
    for (const c of chunks.nearby(p.x, p.z)) {
      for (const t of c.trees)
        if (p.y < t.y + t.h * 0.85 && Math.hypot(p.x - t.x, p.z - t.z) < 1.5) {
          this.recover("Ops, um galho! Vamos de novo");
          return;
        }
      for (const r of c.rocks)
        if (Math.hypot(p.x - r.x, p.z - r.z) < r.r && p.y < r.y + r.r)
          this.recover("Uma nova dobradura, uma nova tentativa");
    }
  }
}
