export const MODE = {
  route: {
    id: "route",
    combo: true,
    score: true,
    endGame: true,
    routeValidation: true,
  },
  free: {
    id: "free",
    combo: false,
    score: false,
    endGame: false,
    routeValidation: false,
  },
};
export const CFG_FREE = {
  world: { size: 4096, chunk: 128, viewChunks: 3, seed: "jardim-dos-ventos" },
  terrain: { maxHeight: 420, ridgeWeight: 0.6, contourStep: 10 },
  water: { springs: 25, waterfallDrop: 8, lakeMin: 300 },
  windGlobal: { strength: 6, dirChangeSec: 180 },
  ridge: { strength: 1.2, maxAbove: 60 },
  thermal: {
    perChunk: [0, 2],
    radius: [14, 23],
    lift: [4, 9],
    lifeSec: [120, 300],
    ceiling: 240,
  },
  wave: { enabled: true, minMountain: 250, lift: 2.5 },
  groundEffect: { height: 2, factor: 0.5 },
  boosts: { max: 5, featherChance: 0.4, groundRegenSec: 10 },
  relaunch: { maxSpeed: 14, catapultSpeed: 30 },
  life: { birdsPerFlock: [5, 12], flocks: 8, npcPlanes: 4 },
  dayCycleMin: 12,
  step: 1 / 120,
  flight: {
    startSpeed: 14,
    gravity: 9.8,
    drag: 0.0055,
    pitchRest: -0.055,
    pitchRate: 0.95,
    maxRoll: 1,
    turnK: 1.3,
    stallSpeed: 5,
  },
  quality: {
    high: {
      radius: 3,
      nearSegments: 24,
      farSegments: 8,
      creatures: 96,
      pixelRatio: 1.5,
    },
    low: {
      radius: 2,
      nearSegments: 16,
      farSegments: 6,
      creatures: 42,
      pixelRatio: 1,
    },
  },
};
export function readSettings() {
  try {
    return {
      quality: matchMedia("(pointer:coarse)").matches ? "low" : "high",
      sound: true,
      volume: 0.45,
      vario: false,
      dayCycle: true,
      weather: true,
      sensitivity: 1,
      ...JSON.parse(localStorage.getItem("rabisco_settings") || "{}"),
    };
  } catch {
    return {
      quality: "low",
      sound: true,
      volume: 0.45,
      vario: false,
      dayCycle: true,
      weather: true,
      sensitivity: 1,
    };
  }
}
export function saveSettings(value) {
  localStorage.setItem("rabisco_settings", JSON.stringify(value));
}
