export function mapBounds(p, target, overview = false) {
  if (overview || !target) return { x: -2048, z: -2048, span: 4096 };
  const span = Math.min(
    4096,
    Math.max(
      512,
      Math.abs(p.x - target.x) + 256,
      Math.abs(p.z - target.z) + 256,
    ),
  );
  const center = (a, b) =>
    Math.max(-2048 + span / 2, Math.min(2048 - span / 2, (a + b) / 2));
  return {
    x: center(p.x, target.x) - span / 2,
    z: center(p.z, target.z) - span / 2,
    span,
  };
}
export function drawMap(
  canvas,
  world,
  progress,
  p,
  missions = [],
  selected = null,
  overview = false,
) {
  const goal = missions.find((m) => m.id === selected && m.target);
  const bounds = mapBounds(p, goal?.target, overview);
  const ctx = canvas.getContext("2d"),
    w = canvas.width,
    h = canvas.height,
    s = w / bounds.span,
    toX = (x) => (x - bounds.x) * s,
    toZ = (z) => (z - bounds.z) * s;
  ctx.fillStyle = "#eee8d6";
  ctx.fillRect(0, 0, w, h);
  for (let z = 0; z < 64; z++)
    for (let x = 0; x < 64; x++) {
      const seen = progress.visited.has(`${x},${z}`);
      if (!seen) continue;
      const wx = x * 64 - 2016,
        wz = z * 64 - 2016,
        y = world.heightAt(wx, wz);
      ctx.fillStyle = `hsl(${95 - y * 0.05} 23% ${83 - y * 0.045}%)`;
      ctx.fillRect(
        toX(x * 64 - 2048),
        toZ(z * 64 - 2048),
        64 * s + 1,
        64 * s + 1,
      );
    }
  ctx.save();
  ctx.beginPath();
  for (const key of progress.visited) {
    const [x, z] = key.split(",").map(Number);
    ctx.rect(toX(x * 64 - 2048), toZ(z * 64 - 2048), 64 * s + 1, 64 * s + 1);
  }
  ctx.clip();
  ctx.strokeStyle = "#80b8c7";
  ctx.lineWidth = 2;
  for (const r of world.rivers) {
    ctx.beginPath();
    r.points.forEach((p, i) =>
      i ? ctx.lineTo(toX(p.x), toZ(p.z)) : ctx.moveTo(toX(p.x), toZ(p.z)),
    );
    ctx.stroke();
  }
  ctx.restore();
  if (goal) {
    ctx.save();
    ctx.strokeStyle = "#bb7557";
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(toX(p.x), toZ(p.z));
    ctx.lineTo(toX(goal.target.x), toZ(goal.target.z));
    ctx.stroke();
    ctx.restore();
  }
  // Mission stickers remain visible over unexplored paper without revealing terrain.
  // Offset overlapping waterfall/bridge pins in screen space and connect to the true point.
  const placed = [{ x: toX(p.x), y: toZ(p.z) }];
  for (const m of missions) {
    if (!m.target) continue;
    const x = toX(m.target.x),
      y = toZ(m.target.z);
    if (x < 0 || y < 0 || x > w || y > h) continue;
    let px = x,
      py = y;
    for (const [dx, dy] of [
      [0, 0],
      [30, -8],
      [-30, 8],
      [0, 30],
    ]) {
      px = Math.min(w - 17, Math.max(17, x + dx));
      py = Math.min(h - 17, Math.max(17, y + dy));
      if (!placed.some((q) => Math.hypot(q.x - px, q.y - py) < 27)) break;
    }
    placed.push({ x: px, y: py });
    ctx.save();
    ctx.strokeStyle = m.completed
      ? "#718d74"
      : m.id === selected
        ? "#b96c4d"
        : "#827b64";
    ctx.lineWidth = m.id === selected ? 3 : 1.5;
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(px, py);
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(px, py, 12, 0, Math.PI * 2);
    ctx.fillStyle = m.completed
      ? "#dce9d6"
      : m.id === selected
        ? "#ffe5b6"
        : "#fff7df";
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = "#40515b";
    ctx.font = 'bold 14px "Comic Sans MS",cursive';
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(m.completed ? "✓" : String(m.number), px, py);
    ctx.restore();
  }
  ctx.font = "18px sans-serif";
  ctx.textAlign = "center";
  for (const l of world.landmarks)
    if (progress.discovered.has(l.id)) {
      ctx.fillStyle = "#b07753";
      ctx.fillText(l.icon, toX(l.x), toZ(l.z));
    }
  ctx.save();
  ctx.translate(toX(p.x), toZ(p.z));
  ctx.rotate(-p.yaw);
  ctx.fillStyle = "#bd785d";
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(-5, 6);
  ctx.lineTo(5, 6);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
  ctx.fillStyle = "#6e8279";
  ctx.font = '12px "Comic Sans MS",cursive';
  ctx.fillText("N", w / 2, 16);
  ctx.fillText("S", w / 2, h - 8);
  ctx.fillText("O", 10, h / 2);
  ctx.fillText("L", w - 10, h / 2);
}
