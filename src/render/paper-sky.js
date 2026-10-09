import * as T from "three";
import { skyTexture } from "./paper-art.js";
export class PaperSky {
  constructor(scene) {
    const day = skyTexture(),
      afternoon = this.tinted(day.image, false),
      night = this.tinted(day.image, true);
    this.material = new T.ShaderMaterial({
      depthTest: false,
      depthWrite: false,
      uniforms: {
        dayMap: { value: day },
        afternoonMap: { value: afternoon },
        nightMap: { value: night },
        weights: { value: new T.Vector3(1, 0, 0) },
        crop: { value: 1 },
        morning: { value: 0 },
      },
      vertexShader:
        "varying vec2 v;void main(){v=uv;gl_Position=vec4(position.xy,1.,1.);}",
      fragmentShader: `varying vec2 v;uniform sampler2D dayMap,afternoonMap,nightMap;uniform vec3 weights;uniform float crop,morning;void main(){vec2 uv=vec2((v.x-.5)*crop+.5,v.y);vec3 d=texture2D(dayMap,uv).rgb*mix(vec3(1.),vec3(1.,.96,.9),morning);vec3 a=texture2D(afternoonMap,uv).rgb;vec3 n=texture2D(nightMap,uv).rgb;gl_FragColor=vec4(d*weights.x+a*weights.y+n*weights.z,1.);
  #include <colorspace_fragment>
  }`,
    });
    this.mesh = new T.Mesh(new T.PlaneGeometry(2, 2), this.material);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = -10000;
    scene.add(this.mesh);
  }
  tinted(image, night) {
    const c = document.createElement("canvas");
    c.width = image.width;
    c.height = image.height;
    const g = c.getContext("2d");
    g.drawImage(image, 0, 0);
    g.globalCompositeOperation = night ? "multiply" : "soft-light";
    const gradient = g.createLinearGradient(0, 0, 0, c.height);
    gradient.addColorStop(0, night ? "#203451" : "#be88ba");
    gradient.addColorStop(1, night ? "#3a5069" : "#ffc882");
    g.fillStyle = gradient;
    g.fillRect(0, 0, c.width, c.height);
    g.globalCompositeOperation = "source-over";
    if (!night) {
      g.globalAlpha = 0.22;
      g.fillStyle = "#efb7a8";
      g.fillRect(0, 0, c.width, c.height);
      g.globalAlpha = 1;
    }
    if (night) {
      g.fillStyle = "#243a54";
      g.beginPath();
      g.arc(1225, 150, 74, 0, 7);
      g.fill();
      g.fillStyle = "#fff1c0";
      g.strokeStyle = "#b6b8a0";
      g.lineWidth = 2;
      g.beginPath();
      g.arc(1225, 150, 37, 0, 7);
      g.fill();
      g.stroke();
      g.fillStyle = "#243a54";
      g.beginPath();
      g.arc(1240, 137, 33, 0, 7);
      g.fill();
    }
    const texture = new T.CanvasTexture(c);
    texture.colorSpace = T.SRGBColorSpace;
    return texture;
  }
  update(cycle) {
    this.material.uniforms.weights.value.set(
      cycle.morning + cycle.day,
      cycle.afternoon,
      cycle.night,
    );
    this.material.uniforms.morning.value = cycle.morning;
    this.material.uniforms.crop.value = Math.min(
      1,
      innerWidth / innerHeight / 1.5,
    );
  }
}
