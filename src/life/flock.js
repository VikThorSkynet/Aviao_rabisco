import * as T from "three";
// A small flock uses separation, alignment and cohesion around a thermal orbit.
// Four larger planes move between nearby lift sources instead of scoring routes.
export function updateFlock(birds, thermals, p, time, dt) {
  const sources = thermals
    .filter((t) => Math.hypot(t.x - p.x, t.z - p.z) < 260)
    .sort(
      (a, b) =>
        Math.hypot(a.x - p.x, a.z - p.z) - Math.hypot(b.x - p.x, b.z - p.z),
    );
  for (let i = 0; i < birds.length; i++) {
    const b = birds[i],
      npc = i < 4,
      index = npc
        ? Math.floor(time / 24 + i) % Math.max(1, sources.length)
        : Math.floor((i - 4) / 7) % Math.max(1, sources.length),
      t = sources[index];
    if (b.userData.qualityHidden) { b.visible=false; continue; }
    b.visible = !!t;
    if (!t) continue;
    const u = b.userData;
    u.velocity ||= new T.Vector3();
    if (u.source !== t.id) {
      if (
        !u.source ||
        b.position.distanceTo(new T.Vector3(t.x, t.y + 35, t.z)) > 180
      )
        b.position.set(
          t.x + Math.sin(i) * 20,
          t.y + 35 + (i % 7) * 2,
          t.z + Math.cos(i) * 20,
        );
      u.source = t.id;
    }
    const a = time * 0.24 + i * 0.85,
      r = npc ? 30 : 16 + (i % 3) * 3,
      target = new T.Vector3(
        t.x + Math.cos(a) * r,
        t.y + 38 + (i % 7) * 2,
        t.z + Math.sin(a) * r,
      ),
      force = target.sub(b.position).multiplyScalar(0.35);
    if (!npc) {
      const separation = new T.Vector3(),
        alignment = new T.Vector3(),
        cohesion = new T.Vector3();
      let n = 0;
      for (
        let j = Math.max(4, 4 + Math.floor((i - 4) / 7) * 7);
        j < Math.min(birds.length, 11 + Math.floor((i - 4) / 7) * 7);
        j++
      ) {
        if (i === j) continue;
        const other = birds[j],
          delta = b.position.clone().sub(other.position),
          d = delta.length();
        if (d < 5 && d > 0.01)
          separation.add(delta.multiplyScalar(1 / (d * d)));
        if (d < 30) {
          alignment.add(other.userData.velocity || new T.Vector3());
          cohesion.add(other.position);
          n++;
        }
      }
      force.add(separation.multiplyScalar(6));
      if (n) {
        force.add(
          alignment
            .multiplyScalar(1 / n)
            .sub(u.velocity)
            .multiplyScalar(0.35),
        );
        force.add(
          cohesion
            .multiplyScalar(1 / n)
            .sub(b.position)
            .multiplyScalar(0.025),
        );
      }
    }
    u.velocity.addScaledVector(force, dt).multiplyScalar(Math.exp(-dt * 0.25));
    const max = npc ? 12 : 7;
    if (u.velocity.length() > max) u.velocity.setLength(max);
    b.position.addScaledVector(u.velocity, dt);
    b.rotation.set(
      Math.atan2(u.velocity.y, Math.hypot(u.velocity.x, u.velocity.z)),
      -Math.atan2(u.velocity.x, -u.velocity.z),
      0.2 + Math.sin(time * 4 + i) * 0.08,
    );
  }
}
