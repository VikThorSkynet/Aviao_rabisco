import * as THREE from "three";
import { random as mulberry32 } from "../shared/math.js";
import { LOOK } from "./theme.js";
const rnd = Math.random;
const mkCanvas = (w, h) =>
  Object.assign(document.createElement("canvas"), { width: w, height: h });
export function wobblyLine(g, x1, y1, x2, y2, amp) {
  const n = Math.ceil(Math.hypot(x2 - x1, y2 - y1) / 12);
  g.beginPath();
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    let x = x1 + (x2 - x1) * t,
      y = y1 + (y2 - y1) * t;
    if (i > 0 && i < n) {
      x += (rnd() - 0.5) * amp;
      y += (rnd() - 0.5) * amp;
    }
    i ? g.lineTo(x, y) : g.moveTo(x, y);
  }
  g.stroke();
}

export function fibers(g, S, n) {
  for (let i = 0; i < n; i++) {
    g.fillStyle = `rgba(120,100,70,${rnd() * 0.06})`;
    g.fillRect(rnd() * S, rnd() * S, 1 + rnd() * 2, 1);
  }
}

export function canvasTex(c, repeat = true) {
  const t = new THREE.CanvasTexture(c);
  if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

export function groundTexture(anisotropy = 1) {
  const S = 512,
    c = mkCanvas(S, S),
    g = c.getContext("2d");
  g.fillStyle = "#f6f5de";
  g.fillRect(0, 0, S, S);
  fibers(g, S, 280);
  const random = mulberry32(712);
  for (let i = 0; i < 55; i++) {
    const x = random() * S,
      y = random() * S;
    g.strokeStyle = "rgba(91,144,107,.15)";
    g.lineWidth = 1.4;
    g.beginPath();
    g.moveTo(x - 3, y);
    g.lineTo(x, y - 5);
    g.lineTo(x + 3, y);
    g.stroke();
  }
  g.strokeStyle = "rgba(104,162,193,.07)";
  g.lineWidth = 1;
  for (let y = 32; y < S; y += 96) wobblyLine(g, 0, y, S, y, 0.6);
  const t = canvasTex(c);
  t.repeat.set(90, 90);
  t.anisotropy = anisotropy;
  return t;
}

export function skyTexture() {
  const W = 1536,
    H = 1024,
    c = mkCanvas(W, H),
    g = c.getContext("2d");
  const gradient = g.createLinearGradient(0, 0, 0, H);
  gradient.addColorStop(0, "#cfeaf2");
  gradient.addColorStop(0.55, "#eaf4ed");
  gradient.addColorStop(1, "#fff5da");
  g.fillStyle = gradient;
  g.fillRect(0, 0, W, H);
  fibers(g, W, 400);
  // A little pencilled sun, away from the central flight path.
  g.save();
  g.translate(1225, 150);
  g.strokeStyle = "#ccac58";
  g.lineWidth = 3;
  g.lineCap = "round";
  g.fillStyle = "#ffe8a0";
  g.beginPath();
  for (let i = 0; i <= 50; i++) {
    const a = (i / 50) * Math.PI * 2,
      r = 45 + Math.sin(a * 7) * 1.2;
    const x = Math.cos(a) * r,
      y = Math.sin(a) * r;
    i ? g.lineTo(x, y) : g.moveTo(x, y);
  }
  g.fill();
  g.stroke();
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    g.beginPath();
    g.moveTo(Math.cos(a) * 57, Math.sin(a) * 57);
    g.lineTo(Math.cos(a) * 69, Math.sin(a) * 69);
    g.stroke();
  }
  g.strokeStyle = "#9b854c";
  g.lineWidth = 2.4;
  for (const x of [-12, 12]) {
    g.beginPath();
    g.arc(x, -3, 2, 0, Math.PI * 2);
    g.fillStyle = "#9b854c";
    g.fill();
  }
  g.beginPath();
  g.arc(0, 5, 12, 0.2, Math.PI - 0.2);
  g.stroke();
  g.restore();
  for (const [x, y, scale] of [
    [200, 200, 1],
    [490, 100, 0.65],
    [1360, 340, 0.7],
  ]) {
    g.save();
    g.translate(x, y);
    g.scale(scale, scale);
    g.fillStyle = "rgba(255,255,249,.72)";
    g.strokeStyle = "rgba(117,150,159,.23)";
    g.lineWidth = 2.5;
    g.beginPath();
    g.moveTo(-70, 20);
    g.bezierCurveTo(-105, -5, -65, -50, -33, -28);
    g.bezierCurveTo(-20, -72, 48, -65, 52, -25);
    g.bezierCurveTo(97, -40, 115, 26, 67, 28);
    g.bezierCurveTo(25, 31, -36, 31, -70, 20);
    g.fill();
    g.stroke();
    g.restore();
  }
  return canvasTex(c, false);
}

export function treeTexture(variant) {
  const W = 256,
    H = 384,
    c = mkCanvas(W, H),
    g = c.getContext("2d"),
    random = mulberry32(270 + variant * 17);
  const palettes = [
    ["#b2d6a4", "#477e63"],
    ["#efd696", "#ad9355"],
    ["#efb4a9", "#b77772"],
    ["#bfc9e6", "#7b83ab"],
  ];
  const [fill, ink] = palettes[variant % 4];
  g.lineCap = "round";
  g.lineJoin = "round";
  g.strokeStyle = "rgba(82,125,82,.24)";
  g.lineWidth = 3;
  g.beginPath();
  g.ellipse(128, 365, 78, 8, 0, 0, Math.PI * 2);
  g.stroke();
  g.fillStyle = "#c4a47f";
  g.strokeStyle = "#866f5a";
  g.lineWidth = 4;
  g.beginPath();
  g.moveTo(117, 357);
  g.lineTo(112, 176);
  g.lineTo(143, 180);
  g.lineTo(137, 357);
  g.closePath();
  g.fill();
  g.stroke();
  g.lineWidth = 2;
  g.beginPath();
  g.moveTo(124, 350);
  g.bezierCurveTo(118, 280, 135, 240, 127, 194);
  g.stroke();
  // One irregular outline and pencil loops inside: recognisably a scribbled tree,
  // with a quiet solid silhouette that remains readable from a distance.
  const points = [];
  for (let i = 0; i <= 64; i++) {
    const a = (i / 64) * Math.PI * 2,
      r = 1 + Math.sin(a * 7 + variant) * 0.05 + (random() - 0.5) * 0.025;
    points.push([128 + Math.cos(a) * 101 * r, 133 + Math.sin(a) * 110 * r]);
  }
  g.beginPath();
  points.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
  g.closePath();
  g.fillStyle = fill;
  g.fill();
  g.strokeStyle = ink;
  g.lineWidth = 4;
  g.stroke();
  g.save();
  g.clip();
  g.globalAlpha = 0.35;
  g.lineWidth = 1.5;
  for (let i = 0; i < 45; i++) {
    const x = 30 + random() * 200,
      y = 28 + random() * 205,
      r = 7 + random() * 12;
    g.beginPath();
    g.ellipse(x, y, r, r * 0.65, random() * Math.PI, 0, Math.PI * 2.4);
    g.stroke();
  }
  g.restore();
  g.strokeStyle = ink;
  g.globalAlpha = 0.35;
  g.lineWidth = 1.3;
  g.beginPath();
  points.forEach(([x, y], i) =>
    i ? g.lineTo(x + 3, y - 2) : g.moveTo(x + 3, y - 2),
  );
  g.stroke();
  g.globalAlpha = 1;
  return canvasTex(c, false);
}

export function flowerTexture() {
  const c = mkCanvas(256, 256),
    g = c.getContext("2d"),
    random = mulberry32(91);
  for (let i = 0; i < 13; i++) {
    const x = 30 + random() * 196,
      y = 30 + random() * 196;
    g.strokeStyle = "#8ba578";
    g.lineWidth = 2;
    g.beginPath();
    g.moveTo(x, y + 9);
    g.lineTo(x, y - 5);
    g.stroke();
    g.fillStyle = ["#f2b5b7", "#e7cf81", "#c1b4dc"][i % 3];
    for (let k = 0; k < 5; k++) {
      const a = (k / 5) * Math.PI * 2;
      g.beginPath();
      g.arc(x + Math.cos(a) * 5, y + Math.sin(a) * 5, 4, 0, Math.PI * 2);
      g.fill();
    }
    g.fillStyle = "#fff7d3";
    g.beginPath();
    g.arc(x, y, 2.5, 0, Math.PI * 2);
    g.fill();
  }
  return canvasTex(c, false);
}

export function cloudTexture(variant, frame) {
  const W = 256,
    H = 128,
    c = mkCanvas(W, H),
    g = c.getContext("2d");
  const shape = mulberry32(variant * 97 + 3),
    jit = mulberry32(variant * 1000 + frame * 31 + 7);
  const circles = [],
    n = 5 + Math.floor(shape() * 3);
  for (let i = 0; i < n; i++)
    circles.push({
      x: 55 + shape() * 146,
      y: 58 + shape() * 22,
      r: 22 + shape() * 18,
    });
  const pts = circles.map((cc) => {
    const arr = [];
    for (let k = 0; k < 28; k++) {
      const a = (k / 28) * Math.PI * 2,
        r = cc.r * (1 + (jit() - 0.5) * 0.08);
      arr.push([cc.x + Math.cos(a) * r, cc.y + Math.sin(a) * r]);
    }
    return arr;
  });
  const path = (arr) => {
    g.beginPath();
    arr.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y)));
    g.closePath();
  };
  g.strokeStyle = LOOK.ink;
  g.lineWidth = 7;
  g.lineJoin = "round";
  pts.forEach((a) => {
    path(a);
    g.stroke();
  });
  g.fillStyle = "#fffdf6";
  pts.forEach((a) => {
    path(a);
    g.fill();
  });
  g.save();
  g.beginPath();
  pts.forEach((a) =>
    a.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))),
  );
  g.clip();
  g.strokeStyle = "rgba(29,42,74,0.45)";
  g.lineWidth = 1.6;
  for (let x = -60; x < W; x += 7) {
    g.beginPath();
    g.moveTo(x + jit() * 2, H);
    g.lineTo(x + 45, 78 + jit() * 4);
    g.stroke();
  }
  g.restore();
  return canvasTex(c, false);
}

export function shadowTexture() {
  const S = 128,
    c = mkCanvas(S, S),
    g = c.getContext("2d");
  g.save();
  g.beginPath();
  g.ellipse(64, 64, 58, 34, 0, 0, Math.PI * 2);
  g.clip();
  g.strokeStyle = "rgba(40,40,60,0.7)";
  g.lineWidth = 2;
  for (let x = -64; x < 192; x += 6) {
    g.beginPath();
    g.moveTo(x, 128);
    g.lineTo(x + 64, 0);
    g.stroke();
  }
  g.restore();
  return canvasTex(c, false);
}
