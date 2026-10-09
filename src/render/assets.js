import * as T from "three";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { LOOK, paperMaterial, PAPER } from "./theme.js";
export function paperPlaneGeometry() {
  const g = new T.BufferGeometry(),
    N = [0, 0, -1.6],
    L = [-1.1, 0.06, 1],
    R = [1.1, 0.06, 1],
    C = [0, 0, 1],
    K = [0, -0.35, 1];
  g.setAttribute(
    "position",
    new T.Float32BufferAttribute([N, C, L, N, R, C, N, K, C].flat(), 3),
  );
  g.computeVertexNormals();
  return g;
}
export function plane(color = 0xffffff) {
  const group = new T.Group(),
    g = paperPlaneGeometry();
  group.add(new T.Mesh(g, paperMaterial(color)));
  const ink = new LineMaterial({ color: LOOK.ink, linewidth: 3 });
  ink.resolution.set(innerWidth, innerHeight);
  const outline = new LineSegments2(
    new LineSegmentsGeometry().fromEdgesGeometry(new T.EdgesGeometry(g, 1)),
    ink,
  );
  group.add(outline);
  group.userData.outline = outline;
  group.userData.lineMaterial = ink;
  return group;
}
export function terrainMaterial(quality = "high") {
  const m = paperMaterial("#f6f5de", { vertexColors: true });
  m.userData.quality = quality;
  m.customProgramCacheKey = () => m.userData.quality;
  const compile = m.onBeforeCompile;
  m.onBeforeCompile = (s) => {
    compile(s);
    s.fragmentShader = s.fragmentShader.replace(
      "#include <color_fragment>",
      `#include <color_fragment>
 float contour=abs(fract(paperP.y/10.)-.5);float mark=(1.-smoothstep(.015,.07,contour))*(1.-smoothstep(130.,220.,distance(cameraPosition,paperP)));diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.92,.95,.88),.28);diffuseColor.rgb*=1.-mark*.09;diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.98,.97,.91),smoothstep(330.,400.,paperP.y));`,
    );
  };
  return m;
}
export function pickupTexture() {
  const c = document.createElement("canvas");
  c.width = 128;
  c.height = 256;
  const x = c.getContext("2d");
  x.fillStyle = "#fff3c7";
  x.strokeStyle = "#9e8652";
  x.lineWidth = 3;
  x.beginPath();
  x.moveTo(64, 225);
  x.bezierCurveTo(4, 155, 20, 40, 74, 18);
  x.bezierCurveTo(121, 85, 105, 167, 64, 225);
  x.fill();
  x.stroke();
  x.beginPath();
  x.moveTo(54, 246);
  x.lineTo(78, 39);
  x.stroke();
  for (let y = 55; y < 210; y += 17) {
    x.beginPath();
    x.moveTo(68, y + 15);
    x.lineTo(35, y - 5);
    x.moveTo(68, y + 15);
    x.lineTo(95, y - 1);
    x.stroke();
  }
  const t = new T.CanvasTexture(c);
  t.colorSpace = T.SRGBColorSpace;
  return t;
}

export function liftArrowTexture() {
  const c = document.createElement("canvas");
  c.width = 64;
  c.height = 96;
  const g = c.getContext("2d");
  g.strokeStyle = "#66916b";
  g.lineWidth = 5;
  g.lineCap = "round";
  g.lineJoin = "round";
  g.beginPath();
  g.moveTo(32, 80);
  g.lineTo(32, 18);
  g.moveTo(15, 37);
  g.lineTo(32, 18);
  g.lineTo(49, 37);
  g.stroke();
  const texture = new T.CanvasTexture(c);
  texture.colorSpace = T.SRGBColorSpace;
  return texture;
}
