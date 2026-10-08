export function drawMap(canvas, world, progress, p) {
  const ctx = canvas.getContext("2d"),
    w = canvas.width,
    h = canvas.height,
    s = w / 4096,
    toX = (x) => (x + 2048) * s,
    toZ = (z) => (z + 2048) * s;
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
      ctx.fillRect((x * w) / 64, (z * h) / 64, w / 64 + 1, h / 64 + 1);
    }
  ctx.save();
  ctx.beginPath();
  for (const key of progress.visited) {
    const [x, z] = key.split(",").map(Number);
    ctx.rect((x * w) / 64, (z * h) / 64, w / 64 + 1, h / 64 + 1);
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
  ctx.font = "12px sans-serif";
  ctx.fillText("N", w / 2, 16);
}
