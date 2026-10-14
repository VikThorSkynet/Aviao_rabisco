import { cardinal, vectorBearing } from "./navigation.js";
export const THERMAL_GOAL = 30;
export const MISSIONS = [
  {
    id: "cachoeira",
    number: 1,
    name: "Atravesse uma cachoeira",
    short: "Cachoeira",
    hint: "Passe pela cortina de água entre o topo e a base. Se molhar, seu avião volta ao ponto seguro.",
  },
  {
    id: "ponte",
    number: 2,
    name: "Passe sob uma ponte-régua",
    short: "Ponte-régua",
    hint: "Atravesse o aro desenhado por baixo da régua. Alinhe as asas e mantenha o nariz quase nivelado. Use Começar tentativa para treinar perto da ponte.",
  },
  {
    id: "termal",
    number: 3,
    name: "Suba 30 m com as térmicas",
    short: "Térmicas",
    hint: "Voe até uma seta verde e faça curvas suaves dentro da corrente. Acumule 30 m de subida nas térmicas. Pousar não apaga seu avanço; sopros não contam.",
  },
];
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
export function missionTargets(world, chunks, p, progress) {
  const falls = world.falls.slice(0, 3).filter((f) => f.top - f.bottom >= 8);
  const bridges = world.specials.filter((s) => s.type === "bridge");
  let thermals = [...chunks.loaded.values()]
    .flatMap((c) => c.thermals)
    .filter((t) => t.type === "thermal");
  // Reuse the seeded generator only as a fallback before any chunk is available.
  if (!thermals.length) {
    const cx = Math.floor(world.spawn.x / 128),
      cz = Math.floor(world.spawn.z / 128);
    for (let dz = -1; dz <= 1; dz++)
      for (let dx = -1; dx <= 1; dx++)
        thermals.push(
          ...world
            .generateChunk(cx + dx, cz + dz, 4)
            .thermals.filter((t) => t.type === "thermal"),
        );
  }
  return MISSIONS.map((m) => {
    const candidates =
      m.id === "cachoeira" ? falls : m.id === "ponte" ? bridges : thermals;
    const target =
      [...candidates].sort((a, b) => distance(p, a) - distance(p, b))[0] ||
      null;
    const meters = target ? distance(p, target) : null;
    return {
      ...m,
      target,
      meters,
      completed: progress.challenges.has(m.id),
      bearing: target ? vectorBearing(target.x - p.x, target.z - p.z) : null,
    };
  });
}
export function targetLabel(mission) {
  if (!mission.target) return "Localizando um lugar para esta aventura…";
  const distanceText =
    mission.meters >= 1000
      ? `${(mission.meters / 1000).toFixed(1)} km`
      : `${Math.round(mission.meters)} m`;
  return `${distanceText} · ${cardinal(mission.bearing)}${mission.id === "termal" ? " · mais forte durante o dia" : mission.id === "ponte" ? ` · aro a ${Math.round(mission.target.guideY)} m` : ""}`;
}
export function missionListMarkup(missions, selected) {
  return `<div class="mission-list">${missions.map((m) => `<button class="mission-choice ${m.completed ? "completed" : ""} ${m.id === selected ? "selected" : ""}" data-mission="${m.id}" ${m.target ? "" : "disabled"} aria-pressed="${m.id === selected}"><span class="mission-badge">${m.completed ? "✓" : m.number}</span><span><b>${m.name}</b><small>${m.completed ? "Concluída · " : ""}${targetLabel(m)}</small></span></button>`).join("")}</div>`;
}
