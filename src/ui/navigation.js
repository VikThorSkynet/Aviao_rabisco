import { relativeWindLabel } from "./soaring.js";
export const degrees = (radians) =>
  ((((radians * 180) / Math.PI) % 360) + 360) % 360;
export const headingBearing = (yaw) => degrees(-yaw);
export const vectorBearing = (x, z) => degrees(Math.atan2(x, -z));
export const cardinal = (bearing) =>
  ["N", "NE", "L", "SE", "S", "SO", "O", "NO"][Math.round(bearing / 45) % 8];
export const nearestAngle = (previous, target) =>
  previous + ((((target - previous + 540) % 360) + 360) % 360) - 180;
const rotations = new WeakMap();
export function navigationState(yaw, wind) {
  const heading = headingBearing(yaw),
    speed = Math.hypot(wind.x, wind.z);
  const flow = speed > 0.01 ? vectorBearing(wind.x, wind.z) : null;
  return {
    heading,
    speed,
    flow,
    relativeFlow:
      flow === null ? 0 : degrees(((flow - heading) * Math.PI) / 180),
  };
}
export function navigationMarkup() {
  return `<div class="navigation-dock" aria-label="Instrumentos de navegação">
    <div class="wind-sketch" role="img" aria-label="Bandeira de vento">
      <svg viewBox="0 0 100 100" aria-hidden="true"><path class="wind-base" d="M43 90 Q50 85 60 90 M50 88 L50 52"/>
      <circle class="wind-pivot" cx="50" cy="50" r="3"/>
      <g id="windFlag" class="wind-flag"><path class="wind-arrow" d="M20 50 L88 50 M78 40 L88 50 L78 60"/><path class="flag-ribbon" d="M50 47 Q62 36 86 42 L80 49 L89 54 Q70 50 50 55 Z"/><path class="flag-stitch" d="M63 43 L64 52 M75 42 L75 51"/><path class="wind-stroke" d="M57 62 Q70 58 83 61"/></g></svg>
      <span id="windSpeed" class="nav-caption">vento</span><span id="windDirection" class="wind-direction">sopra para…</span><span id="windRelative" class="wind-relative"></span>
    </div>
    <div id="compass" class="compass-sketch" role="img" aria-label="Bússola">
      <svg viewBox="0 0 100 100" aria-hidden="true"><path class="compass-paper" d="M49 5 C76 3 97 26 94 51 C98 78 75 97 48 94 C20 97 4 75 6 48 C3 23 22 4 49 5 Z"/><circle class="compass-ring" cx="50" cy="50" r="36"/>
      <g id="compassDial" class="compass-dial"><path class="compass-spokes" d="M50 20 L50 80 M20 50 L80 50 M28 28 L72 72 M28 72 L72 28"/>
      <text x="50" y="20">N</text><text x="83" y="54">L</text><text x="50" y="89">S</text><text x="17" y="54">O</text>
      <path class="compass-north" d="M50 28 L44 51 L50 47 L56 51 Z"/><path class="compass-south" d="M50 73 L44 51 L50 54 L56 51 Z"/></g>
      <circle class="compass-pin" cx="50" cy="50" r="3"/><path class="compass-plane" d="M50 37 L44 58 L50 54 L56 58 Z"/></svg>
      <span id="compassHeading" class="nav-caption">N</span>
    </div>
  </div>`;
}
export function updateNavigation(root, yaw, wind) {
  const state = navigationState(yaw, wind);
  const last = rotations.get(root) || {
    dial: -state.heading,
    flag: state.relativeFlow - 90,
  };
  const next = {
    dial: nearestAngle(last.dial, -state.heading),
    flag: nearestAngle(last.flag, state.relativeFlow - 90),
  };
  rotations.set(root, next);
  root.querySelector("#compassDial").style.transform =
    `rotate(${next.dial}deg)`;
  root.querySelector("#compassHeading").textContent =
    `${cardinal(state.heading)} · ${Math.round(state.heading) % 360}°`;
  root
    .querySelector("#compass")
    .setAttribute(
      "aria-label",
      `Bússola: avião apontando para ${cardinal(state.heading)}, ${Math.round(state.heading) % 360} graus. A agulha coral indica o norte.`,
    );
  root.querySelector("#windFlag").style.transform = `rotate(${next.flag}deg)`;
  root
    .querySelector(".wind-sketch")
    .classList.toggle("calm", state.speed < 0.1);
  root.querySelector("#windSpeed").textContent =
    `${state.speed.toFixed(1)} m/s`;
  root.querySelector("#windDirection").textContent =
    state.flow === null ? "vento calmo" : `sopra para ${cardinal(state.flow)}`;
  root.querySelector("#windRelative").textContent =
    state.flow === null ? "" : relativeWindLabel(state.relativeFlow);
  root
    .querySelector(".wind-sketch")
    .setAttribute(
      "aria-label",
      state.flow === null
        ? "Vento calmo"
        : `Vento soprando para ${cardinal(state.flow)}, ${state.speed.toFixed(1)} metros por segundo; bandeira relativa à direção do avião.`,
    );
  return state;
}
