const anchors = [
  { at: 0, morning: 0, day: 0, afternoon: 0, night: 1, brightness: 0.18 },
  { at: 0.08, morning: 1, day: 0, afternoon: 0, night: 0, brightness: 0.65 },
  { at: 0.24, morning: 0, day: 1, afternoon: 0, night: 0, brightness: 1 },
  { at: 0.39, morning: 0, day: 0, afternoon: 1, night: 0, brightness: 0.78 },
  { at: 0.52, morning: 0, day: 0, afternoon: 0, night: 1, brightness: 0.18 },
  { at: 1, morning: 0, day: 0, afternoon: 0, night: 1, brightness: 0.18 },
];
export function dayCycle(phase) {
  const p = ((phase % 1) + 1) % 1;
  let a = anchors[0],
    b = anchors[1];
  for (let i = 1; i < anchors.length; i++)
    if (p <= anchors[i].at) {
      a = anchors[i - 1];
      b = anchors[i];
      break;
    }
  const raw = (p - a.at) / (b.at - a.at),
    t = raw * raw * (3 - 2 * raw),
    result = {};
  for (const key of ["morning", "day", "afternoon", "night", "brightness"])
    result[key] = a[key] + (b[key] - a[key]) * t;
  const minutes = Math.floor(((p * 24 + 6) % 24) * 60);
  result.brightness = Math.max(0.18, Math.min(1, result.brightness));
  return {
    ...result,
    period:
      p < 0.14 ? "Manhã" : p < 0.31 ? "Dia" : p < 0.51 ? "Tarde" : "Noite",
    clock: `${String(Math.floor(minutes / 60)).padStart(2, "0")}:${String(minutes % 60).padStart(2, "0")}`,
  };
}
