import { cardinal, vectorBearing } from "./navigation.js";
export const VILLAGE_RADIUS = 90;
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
    id: "visita-vila",
    number: 3,
    name: "Visite a Vila Dobradinha",
    short: "Vila",
    hint: "Siga o marcador 3 e entre no círculo azul da vila, abaixo de 80 m do chão. Não precisa pousar. Use Começar perto da vila para uma viagem curta.",
  },
];
const distance = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);
export function missionTargets(world, chunks, p, progress) {
  const falls = world.falls.slice(0, 3).filter((f) => f.top - f.bottom >= 8);
  const bridges = world.specials.filter((s) => s.type === "bridge");
  return MISSIONS.map((m) => {
    const candidates =
      m.id === "cachoeira" ? falls : m.id === "ponte" ? bridges : [world.village];
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
  return `${distanceText} · ${cardinal(mission.bearing)}${mission.id === "ponte" ? ` · aro a ${Math.round(mission.target.guideY)} m` : ""}`;
}
export function missionListMarkup(missions, selected) {
  return `<div class="mission-list">${missions.map((m) => `<button class="mission-choice ${m.completed ? "completed" : ""} ${m.id === selected ? "selected" : ""}" data-mission="${m.id}" ${m.target ? "" : "disabled"} aria-pressed="${m.id === selected}"><span class="mission-badge">${m.completed ? "✓" : m.number}</span><span><b>${m.name}</b><small>${m.completed ? "Concluída · " : ""}${targetLabel(m)}</small></span></button>`).join("")}</div>`;
}
