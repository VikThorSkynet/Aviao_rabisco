import * as T from "three";
export const LOOK = Object.freeze({
  paper: "#eef4e4",
  ink: "#40515b",
  fogNear: 120,
  fogFar: 550,
  outlinePx: 1.3,
  boilFps: 5,
});
export const PAPER = {
  time: { value: 0 },
  day: { value: 1 },
  quality: { value: 1 },
  tint: { value: new T.Color(1, 1, 1) },
};
export function paperMaterial(color, options = {}) {
  const m = new T.MeshBasicMaterial({ color, side: T.DoubleSide, ...options });
  m.onBeforeCompile = (s) => {
    s.uniforms.paperTime = PAPER.time;
    s.uniforms.paperDay = PAPER.day;
    s.uniforms.paperQuality = PAPER.quality;
    s.uniforms.paperTint = PAPER.tint;
    s.vertexShader = s.vertexShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec3 paperN;varying vec3 paperP;",
      )
      .replace(
        "#include <begin_vertex>",
        "#include <begin_vertex>\npaperN=normalize(normalMatrix*normal);paperP=position;",
      );
    s.fragmentShader = s.fragmentShader
      .replace(
        "#include <common>",
        "#include <common>\nvarying vec3 paperN;varying vec3 paperP;uniform float paperTime,paperDay,paperQuality;uniform vec3 paperTint;",
      )
      .replace(
        "#include <color_fragment>",
        `#include <color_fragment>
 float light=abs(dot(normalize(paperN),normalize(vec3(.4,1.,.3))));vec2 pixel=gl_FragCoord.xy;float wob=sin(pixel.y*.04+floor(paperTime*5.)*.7)*1.2;float hatch=1.-smoothstep(.7,1.8,abs(fract((pixel.x+pixel.y+wob)/7.)-.5)*7.);float cross=1.-smoothstep(.7,1.8,abs(fract((pixel.x-pixel.y+wob)/7.)-.5)*7.);float ink=hatch*(1.-smoothstep(.35,.7,light))+cross*(1.-smoothstep(.1,.3,light));float grain=fract(sin(dot(pixel,vec2(12.98,78.23)))*43758.54);diffuseColor.rgb*=.94+light*.06;diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.25,.32,.36),ink*.16*paperQuality);diffuseColor.rgb*=.985+grain*.025;diffuseColor.rgb=mix(diffuseColor.rgb*vec3(.44,.53,.68),diffuseColor.rgb,paperDay);diffuseColor.rgb*=paperTint;`,
      );
  };
  return m;
}
