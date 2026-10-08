import * as T from "three";
export function plane(color = 0xfff8dc) {
  const group = new T.Group(),
    g = new T.BufferGeometry();
  g.setAttribute(
    "position",
    new T.Float32BufferAttribute(
      [0, 0, -2, -2.6, 0, 1.5, 0, 0.45, 1, 0, 0, -2, 0, 0.45, 1, 2.6, 0, 1.5],
      3,
    ),
  );
  g.computeVertexNormals();
  group.add(
    new T.Mesh(
      g,
      new T.MeshStandardMaterial({ color, side: T.DoubleSide, roughness: 1 }),
    ),
  );
  group.add(
    new T.LineSegments(
      new T.EdgesGeometry(g),
      new T.LineBasicMaterial({ color: 0x52676a }),
    ),
  );
  return group;
}
export function scribbleTexture() {
  const c = document.createElement("canvas");
  c.width = 256;
  c.height = 384;
  const x = c.getContext("2d");
  x.lineCap = "round";
  x.strokeStyle = "#677b62";
  x.lineWidth = 5;
  x.beginPath();
  x.moveTo(128, 376);
  x.bezierCurveTo(119, 295, 141, 216, 125, 125);
  x.stroke();
  x.fillStyle = "#add397";
  x.beginPath();
  x.ellipse(129, 143, 91, 122, 0, 0, 7);
  x.fill();
  x.strokeStyle = "#66936c";
  x.lineWidth = 2.4;
  for (let i = 0; i < 9; i++) {
    x.beginPath();
    for (let j = 0; j < 65; j++) {
      const a = (j / 64) * Math.PI * 2,
        r = 1 + Math.sin(j * 1.7 + i) * 0.09,
        px = 128 + Math.cos(a) * r * (76 + (i % 5) * 3),
        py = 141 + Math.sin(a) * r * (102 + (i % 4) * 4);
      j ? x.lineTo(px, py) : x.moveTo(px, py);
    }
    x.stroke();
  }
  return new T.CanvasTexture(c);
}
export function terrainMaterial(quality = "high") {
  const m = new T.MeshStandardMaterial({ vertexColors: true, roughness: 1 });
  m.userData.quality = quality;
  m.customProgramCacheKey = () => m.userData.quality;
  m.onBeforeCompile = (s) => {
    s.defines.LIGHT_HATCH = m.userData.quality === "low" ? 0 : 1;
    s.vertexShader = s.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec3 vPaper;varying float vSlope;",
      )
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\nvPaper=position;vSlope=1.-abs(normal.y);",
      );
    s.fragmentShader = s.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec3 vPaper;varying float vSlope;",
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
 float contour=abs(fract(vPaper.y/10.)-.5);float line=1.-smoothstep(.012,.045,contour);float steep=vSlope;float hatch=step(.86,fract((gl_FragCoord.x+gl_FragCoord.y)/9.));diffuseColor.rgb*=1.-line*.11*(1.-smoothstep(130.,220.,distance(cameraPosition,vPaper)))-hatch*steep*.13*float(LIGHT_HATCH);diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.96,.97,.91),smoothstep(330.,400.,vPaper.y));`,
      );
  };
  return m;
}
