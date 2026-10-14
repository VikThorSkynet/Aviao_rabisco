import { BRIDGE } from "../world/bridge.js";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { PaperSky } from "./paper-sky.js";
import { dayCycle } from "../world/day-cycle.js";
import {
  treeTexture,
  cloudTexture,
  shadowTexture,
  flowerTexture,
} from "./paper-art.js";
import { paperMaterial, PAPER, LOOK } from "./theme.js";
import * as T from "three";
import {
  plane,
  pickupTexture,
  terrainMaterial,
  liftArrowTexture,
} from "./assets.js";
import { updateFlock } from "../life/flock.js";
import { Life } from "../life/life.js";
import { CFG_FREE as C } from "../config.js";
export class WorldView {
  constructor(world, settings) {
    this.world = world;
    this.settings = settings;
    this.inkObjects = [];
    this.hintLift = new Map();
    this.scene = new T.Scene();
    this.scene.background = null;
    this.sky = new PaperSky(this.scene);
    this.palette = {
      morning: new T.Color("#f8efd9"),
      day: new T.Color(LOOK.paper),
      afternoon: new T.Color("#efcbb8"),
      night: new T.Color("#465b73"),
    };
    this.scene.fog = new T.Fog(
      "#eaf4df",
      settings.quality === "low" ? 100 : 160,
      settings.quality === "low" ? 280 : 390,
    );
    this.camera = new T.PerspectiveCamera(
      65,
      innerWidth / innerHeight,
      0.2,
      1500,
    );
    this.renderer = new T.WebGLRenderer({ antialias: true, alpha: false });
    this.renderer.setPixelRatio(
      Math.min(devicePixelRatio, C.quality[settings.quality].pixelRatio),
    );
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.outputColorSpace = T.SRGBColorSpace;
    document.body.prepend(this.renderer.domElement);
    this.ambient = new T.HemisphereLight(0xfffbe8, 0x96ad7b, 1.6);
    this.scene.add(this.ambient);
    this.sun = new T.DirectionalLight(0xffedbd, 2);
    this.sun.position.set(-200, 400, -200);
    this.scene.add(this.sun);
    this.terrain = terrainMaterial(settings.quality);
    this.player = plane();
    this.scene.add(this.player);
    this.dummy = new T.Object3D();
    this.dynamic = [];
    this.water = [];
    this.decor = [];
    this.pickups = [];
    this.clouds = [];
    const treeMat = new T.MeshBasicMaterial({
      map: this.treeAtlas(),
      transparent: true,
      alphaTest: 0.1,
      side: T.DoubleSide,
      depthWrite: true,
    });
    this.sway = { value: 0 };
    treeMat.onBeforeCompile = (shader) => {
      shader.uniforms.uSway = this.sway;
      shader.vertexShader = shader.vertexShader
        .replace(
          "#include <common>",
          "#include <common>\nuniform float uSway;attribute float treeVariant;varying float vVariant;",
        )
        .replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\nvVariant=treeVariant;transformed.x+=sin(uSway+instanceMatrix[3].x*.1)*.025*(position.y+.5);",
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          "#include <common>\nvarying float vVariant;",
        )
        .replace(
          "#include <map_fragment>",
          "#ifdef USE_MAP\nvec4 sampledDiffuseColor=texture2D(map,vec2((vMapUv.x+vVariant)/4.,vMapUv.y));diffuseColor*=sampledDiffuseColor;\n#endif",
        );
    };
    this.trees = new T.InstancedMesh(new T.PlaneGeometry(1, 1), treeMat, 2400);
    this.trees.geometry.setAttribute(
      "treeVariant",
      new T.InstancedBufferAttribute(new Float32Array(2400), 1),
    );
    this.trees.count = 0;
    this.trees.frustumCulled = false;
    this.scene.add(this.trees);
    this.rocks = new T.InstancedMesh(
      new T.DodecahedronGeometry(1, 0),
      paperMaterial(0xaab2a4),
      400,
    );
    this.rocks.count = 0;
    this.rocks.frustumCulled = false;
    this.scene.add(this.rocks);
    this.pickupMesh = new T.InstancedMesh(
      new T.PlaneGeometry(1.8, 3),
      new T.MeshBasicMaterial({
        map: pickupTexture(),
        transparent: true,
        alphaTest: 0.1,
        side: T.DoubleSide,
      }),
      300,
    );
    this.pickupMesh.count = 0;
    this.pickupMesh.frustumCulled = false;
    this.scene.add(this.pickupMesh);
    this.shadow = new T.Mesh(
      new T.PlaneGeometry(1, 1),
      new T.MeshBasicMaterial({
        map: shadowTexture(),
        transparent: true,
        depthWrite: false,
      }),
    );
    this.shadow.rotation.x = -Math.PI / 2;
    this.scene.add(this.shadow);
    this.boostPuff = new T.Group();
    const puffVertices = [];
    for (const side of [-1, 0, 1])
      for (let i = 0; i < 15; i++) {
        const z = 2 + i * 0.18, next = z + 0.18;
        puffVertices.push(side * 0.7 + Math.sin(z * 4) * 0.12, 0, z,
          side * 0.7 + Math.sin(next * 4) * 0.12, 0, next);
      }
    this.boostPuff.add(new T.LineSegments(
      new T.BufferGeometry().setAttribute("position",
        new T.Float32BufferAttribute(puffVertices, 3)),
      new T.LineBasicMaterial({ color: "#78b8d5", transparent: true,
        opacity: 0, depthWrite: false })));
    this.boostPuff.visible = false;
    this.scene.add(this.boostPuff);
    this.trailPoints = [];
    this.trailGeometry = new T.BufferGeometry();
    this.trailGeometry.setAttribute(
      "position",
      new T.BufferAttribute(new Float32Array(60), 3),
    );
    this.trail = new T.LineSegments(
      this.trailGeometry,
      new T.LineBasicMaterial({
        color: "#92ad99",
        transparent: true,
        opacity: 0.24,
      }),
    );
    this.trail.frustumCulled = false;
    this.scene.add(this.trail);
    this.flowers = new T.InstancedMesh(
      new T.PlaneGeometry(7, 7),
      new T.MeshBasicMaterial({
        map: flowerTexture(),
        transparent: true,
        depthWrite: false,
      }),
      80,
    );
    this.flowers.count = 0;
    this.flowers.frustumCulled = false;
    this.scene.add(this.flowers);
    this.makeWater();
    this.bridgeGates = [];
    this.makeSpecials();
    this.makeLife(settings);
    this.life = new Life(this.scene, world, settings);
    addEventListener("resize", () => {
      this.camera.aspect = innerWidth / innerHeight;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(innerWidth, innerHeight);
    });
  }
  treeAtlas() {
    const c = document.createElement("canvas");
    c.width = 1024;
    c.height = 384;
    const ctx = c.getContext("2d");
    for (let i = 0; i < 4; i++) ctx.drawImage(treeTexture(i).image, i * 256, 0);
    const t = new T.CanvasTexture(c);
    t.colorSpace = T.SRGBColorSpace;
    return t;
  }
  updateTrail(p, time) {
    if (
      this.trailPoints.length &&
      this.trailPoints.at(-1).distanceTo(new T.Vector3(p.x, p.y, p.z)) > 40
    )
      this.trailPoints = [];
    if (!this.trailTime || time - this.trailTime > 0.08) {
      this.trailTime = time;
      this.trailPoints.push(new T.Vector3(p.x, p.y, p.z));
      if (this.trailPoints.length > 11) this.trailPoints.shift();
    }
    const a = this.trailGeometry.attributes.position;
    let n = 0;
    for (let i = 1; i < this.trailPoints.length; i++) {
      const p = this.trailPoints[i - 1],
        q = this.trailPoints[i];
      a.setXYZ(n++, p.x, p.y, p.z);
      a.setXYZ(n++, q.x, q.y, q.z);
    }
    a.needsUpdate = true;
    this.trailGeometry.setDrawRange(0, n);
  }
  makeWater() {
    const mat = paperMaterial(0x79bdd0, {
      transparent: true,
      opacity: 0.8,
      roughness: 0.35,
      side: T.DoubleSide,
    });
    this.waterTime = { value: 0 };
    mat.onBeforeCompile = (shader) => {
      shader.uniforms.waterTime = this.waterTime;
      shader.vertexShader = shader.vertexShader
        .replace("#include <common>", "#include <common>\nvarying vec3 vRiver;")
        .replace(
          "#include <begin_vertex>",
          "#include <begin_vertex>\nvRiver=position;",
        );
      shader.fragmentShader = shader.fragmentShader
        .replace(
          "#include <common>",
          "#include <common>\nvarying vec3 vRiver;uniform float waterTime;",
        )
        .replace(
          "#include <color_fragment>",
          "#include <color_fragment>\nfloat ripple=smoothstep(.93,1.,sin(vRiver.x*2.+sin(vRiver.z*.3+waterTime)*.8));diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.86,.96,.94),ripple*.4);",
        );
    };
    for (const river of this.world.rivers) {
      const pos = [],
        idx = [];
      river.points.forEach((p, i) => {
        const a = river.points[Math.max(0, i - 1)],
          b = river.points[Math.min(river.points.length - 1, i + 1)],
          dx = b.x - a.x,
          dz = b.z - a.z,
          len = Math.hypot(dx, dz) || 1;
        pos.push(
          p.x - (dz / len) * p.width,
          p.y + 0.2,
          p.z + (dx / len) * p.width,
          p.x + (dz / len) * p.width,
          p.y + 0.2,
          p.z - (dx / len) * p.width,
        );
        if (i < river.points.length - 1) {
          const n = i * 2;
          idx.push(n, n + 2, n + 1, n + 1, n + 2, n + 3);
        }
      });
      const g = new T.BufferGeometry();
      g.setAttribute("position", new T.Float32BufferAttribute(pos, 3));
      g.setIndex(idx);
      g.computeVertexNormals();
      this.scene.add(new T.Mesh(g, mat));
    }
    for (const lake of this.world.lakes) {
      const m = new T.Mesh(new T.CircleGeometry(lake.r, 40), mat);
      m.rotation.x = -Math.PI / 2;
      m.position.set(lake.x, lake.y + 0.2, lake.z);
      this.scene.add(m);
    }
    const fallMat = new T.ShaderMaterial({
      transparent: true,
      side: T.DoubleSide,
      uniforms: { time: { value: 0 } },
      vertexShader:
        "varying vec2 v;void main(){v=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}",
      fragmentShader:
        "varying vec2 v;uniform float time;void main(){float line=step(.72,fract(v.x*17.+sin(v.y*14.+time*3.)*.15));float flow=.5+.5*sin(v.y*50.+time*8.);gl_FragColor=vec4(mix(vec3(.39,.70,.83),vec3(.96,.99,.95),line*.7+flow*.1),.85);}",
    });
    this.fallMat = fallMat;
    for (const f of this.world.falls) {
      const m = new T.Mesh(
        new T.PlaneGeometry(f.width * 2, f.top - f.bottom),
        fallMat,
      );
      m.position.set(f.x, (f.top + f.bottom) / 2, f.z + 1);
      this.scene.add(m);
      const mist = new T.Mesh(
        new T.PlaneGeometry(f.width * 2, f.width),
        new T.MeshBasicMaterial({
          map: cloudTexture(0, 0),
          color: 0xffffff,
          transparent: true,
          opacity: 0.2,
          depthWrite: false,
        }),
      );
      mist.material.side = T.DoubleSide;
      mist.position.set(f.x, f.bottom + 2, f.z + 3);
      this.scene.add(mist);
      this.dynamic.push({ type: "mist", mesh: mist, base: f.bottom + 2 });
      const arc = new T.Mesh(
        new T.TorusGeometry(f.width * 1.4, 0.45, 5, 40, Math.PI),
        new T.MeshBasicMaterial({
          color: 0xe8bd85,
          transparent: true,
          opacity: 0.35,
          depthWrite: false,
        }),
      );
      arc.position.set(f.x, f.bottom + 3, f.z + 7);
      this.scene.add(arc);
      this.dynamic.push({ type: "rainbow", mesh: arc });
    }
  }
  mesh(geometry, color, x, y, z) {
    const m = new T.Mesh(geometry, paperMaterial(color));
    m.position.set(x, y, z);
    const outline = new T.LineSegments(
      new T.EdgesGeometry(geometry, 25),
      new T.LineBasicMaterial({
        color: LOOK.ink,
        transparent: true,
        opacity: 0.65,
      }),
    );
    m.add(outline);
    this.inkObjects.push(m);
    this.scene.add(m);
    return m;
  }
  makeSpecials() {
    for (const s of this.world.specials) {
      if (s.type === "bridge") {
        const b = this.mesh(
          new T.BoxGeometry(BRIDGE.halfDeck * 2, 1.1, BRIDGE.halfDepth * 2),
          0xe0c78e,
          s.x,
          s.y,
          s.z,
        );
        const ticks = [];
        for (let i = -30; i <= 30; i += 3)
          ticks.push(
            s.x + i,
            s.y + 0.57,
            s.z - 3,
            s.x + i,
            s.y + 0.57,
            s.z - (i % 6 ? 1 : 0),
          );
        const g = new T.BufferGeometry();
        g.setAttribute("position", new T.Float32BufferAttribute(ticks, 3));
        this.scene.add(
          new T.LineSegments(g, new T.LineBasicMaterial({ color: 0x8b7e62 })),
        );
        for (const dx of [-29, 29])
          this.mesh(
            new T.BoxGeometry(
              1,
              Math.max(2, s.y - this.world.heightAt(s.x + dx, s.z)),
              1,
            ),
            0xb4a380,
            s.x + dx,
            s.y - Math.max(2, s.y - this.world.heightAt(s.x + dx, s.z)) / 2,
            s.z,
          );
      }
      if (s.type === "catapult") {
        this.mesh(new T.BoxGeometry(7, 0.7, 12), 0xd5a777, s.x, s.y + 0.5, s.z);
        const sign = this.mesh(
          new T.ConeGeometry(2, 4, 3),
          0xe3b34d,
          s.x,
          s.y + 3,
          s.z,
        );
        sign.rotation.x = Math.PI / 2;
      }
      if (s.type === "balloon") {
        const b = this.mesh(
          new T.SphereGeometry(9, 12, 10),
          [0xe8af8b, 0xdec56a, 0xa6c5bf][this.dynamic.length % 3],
          s.x,
          s.y + 80,
          s.z,
        );
        b.scale.y = 1.3;
        this.dynamic.push({ type: "balloon", mesh: b, base: s.y + 80 });
        this.mesh(new T.BoxGeometry(3, 3, 3), 0xb49b78, s.x, s.y + 64, s.z);
      }
      if (s.type === "village") {
        for (let i = 0; i < 8; i++) {
          const x = s.x + Math.cos(i * 2.4) * 45,
            z = s.z + Math.sin(i * 2.4) * 45,
            y = this.world.heightAt(x, z);
          this.mesh(new T.BoxGeometry(13, 11, 12), 0xffedcc, x, y + 5, z);
          const roof = this.mesh(
            new T.ConeGeometry(11, 8, 4),
            0xc98772,
            x,
            y + 14,
            z,
          );
          roof.rotation.y = Math.PI / 4;
          this.mesh(new T.BoxGeometry(2, 3, 0.2), 0x6e8d94, x, y + 5, z + 6.1);
        }
        this.mesh(
          new T.CylinderGeometry(1.2, 1.4, 14, 6),
          0xc3b8a0,
          s.x,
          s.y + 7,
          s.z,
        );
      }
      if (s.type === "geyser") {
        const g = this.mesh(
          new T.ConeGeometry(3, 18, 8),
          0xcce9da,
          s.x,
          s.y + 8,
          s.z,
        );
        this.dynamic.push({ type: "geyser", mesh: g });
      }
    }
    for (const b of this.world.specials.filter((s) => s.type === "bridge")) {
      const points = [
        -b.halfOpening,
        -5,
        0,
        b.halfOpening,
        -5,
        0,
        b.halfOpening,
        -5,
        0,
        b.halfOpening,
        5,
        0,
        b.halfOpening,
        5,
        0,
        -b.halfOpening,
        5,
        0,
        -b.halfOpening,
        5,
        0,
        -b.halfOpening,
        -5,
        0,
      ];
      const geometry = new LineSegmentsGeometry();
      geometry.setPositions(points);
      const mat = new LineMaterial({
        color: "#b88a4e",
        linewidth: 2,
        transparent: true,
        opacity: 0.75,
      });
      mat.resolution.set(innerWidth, innerHeight);
      const ring = new LineSegments2(geometry, mat);
      ring.frustumCulled = false;
      ring.position.set(b.x, b.guideY, b.z);
      this.scene.add(ring);
      this.bridgeGates.push({ bridge: b, ring });
    }
    const n = this.world.landmarks.find((l) => l.id === "ninho");
    this.mesh(new T.TorusGeometry(6, 1.5, 6, 12), 0xa29373, n.x, n.y + 3, n.z);
  }
  rebuild(chunks, progress) {
    this.hintLift.clear();
    let ti = 0,
      ri = 0,
      fi = 0;
    this.pickups = [];
    this.clouds = [];
    for (const c of chunks) {
      for (const t of c.trees) {
        if (fi < 80 && Math.floor(t.x + t.z) % 7 === 0) {
          this.dummy.position.set(t.x + 4, t.y + 0.12, t.z);
          this.dummy.rotation.set(-Math.PI / 2, 0, 0);
          this.dummy.scale.set(1, 1, 1);
          this.dummy.updateMatrix();
          this.flowers.setMatrixAt(fi++, this.dummy.matrix);
        }
        for (let side = 0; side < 2; side++) {
          if (ti >= 2400) break;
          this.dummy.position.set(t.x, t.y + t.h / 2, t.z);
          this.dummy.scale.set(t.h * 0.65, t.h, 1);
          this.dummy.rotation.set(0, (side * Math.PI) / 2, 0);
          this.dummy.updateMatrix();
          this.trees.geometry.attributes.treeVariant.setX(ti, t.color % 4);
          this.trees.setMatrixAt(ti++, this.dummy.matrix);
        }
      }
      for (const r of c.rocks) {
        if (ri >= 400) break;
        this.dummy.position.set(r.x, r.y + r.r * 0.35, r.z);
        this.dummy.scale.set(r.r, r.r * 0.8, r.r);
        this.dummy.rotation.set(0, r.x, 0);
        this.dummy.updateMatrix();
        this.rocks.setMatrixAt(ri++, this.dummy.matrix);
      }
      for (const p of c.pickups)
        if (!progress.collected.has(p.id)) this.pickups.push(p);
      for (const t of c.thermals) if (t.type === "thermal") this.clouds.push(t);
    }
    this.flowers.count = fi;
    this.flowers.instanceMatrix.needsUpdate = true;
    this.trees.count = ti;
    this.rocks.count = ri;
    this.trees.instanceMatrix.needsUpdate = true;
    this.trees.geometry.attributes.treeVariant.needsUpdate = true;
    this.rocks.instanceMatrix.needsUpdate = true;
    for (const p of this.decor) {
      this.scene.remove(p);
      for (const child of p.children) {
        child.geometry?.dispose();
        child.material?.dispose();
      }
      p.geometry.dispose();
      p.material.dispose();
    }
    this.inkObjects = this.inkObjects.filter((o) => o.parent);
    this.decor = [];
    for (const c of chunks)
      for (const p of c.props) {
        if (p.type === "windmill") {
          const post = this.mesh(
              new T.ConeGeometry(2, 12, 5),
              0xd7d1b4,
              p.x,
              p.y + 6,
              p.z,
            ),
            rotor = this.mesh(
              new T.BoxGeometry(13, 0.7, 0.4),
              0xe9dba9,
              p.x,
              p.y + 12,
              p.z + 1,
            );
          this.decor.push(post, rotor);
          rotor.userData.rotor = true;
        } else if (p.type === "mushroom") {
          this.decor.push(
            this.mesh(new T.ConeGeometry(3, 2, 8), 0xcc8d78, p.x, p.y + 2, p.z),
          );
        } else
          this.decor.push(
            this.mesh(
              new T.BoxGeometry(9, 1, 0.5),
              0xc7bd9c,
              p.x,
              p.y + 2,
              p.z,
            ),
          );
      }
  }
  makeLife(settings) {
    this.birds = [];
    for (let i = 0; i < (settings.quality === "low" ? 24 : 56); i++) {
      const b = plane(i < 4 ? 0xe9b78b : 0xeeeedd);
      b.scale.setScalar(i < 4 ? 0.6 : 0.25);
      this.scene.add(b);
      this.birds.push(b);
    }
    this.cloudFrames = [cloudTexture(1, 0), cloudTexture(1, 1)];
    this.cloudMesh = new T.InstancedMesh(
      new T.PlaneGeometry(1, 1),
      new T.MeshBasicMaterial({
        map: this.cloudFrames[0],
        side: T.DoubleSide,
        color: 0xfffdf0,
        transparent: true,
        opacity: 0.62,
        depthWrite: false,
      }),
      150,
    );
    this.liftArrows = new T.InstancedMesh(
      new T.PlaneGeometry(3, 5),
      new T.MeshBasicMaterial({
        map: liftArrowTexture(),
        transparent: true,
        opacity: 0.5,
        depthWrite: false,
        side: T.DoubleSide,
      }),
      9,
    );
    this.liftArrows.count = 0;
    this.liftArrows.frustumCulled = false;
    this.scene.add(this.liftArrows);
    this.cloudMesh.count = 0;
    this.cloudMesh.frustumCulled = false;
    this.scene.add(this.cloudMesh);
    this.fish = [];
    for (let i = 0; i < 8; i++) {
      const f = this.mesh(new T.ConeGeometry(0.5, 2, 4), 0xdda772, 0, 0, 0);
      this.fish.push(f);
    }
    this.butterflies = new T.InstancedMesh(
      new T.PlaneGeometry(0.7, 0.5),
      new T.MeshBasicMaterial({ color: 0xe9bd64, side: T.DoubleSide }),
      24,
    );
    this.scene.add(this.butterflies);
  }
  update(f, time, weather, dt) {
    const p = f.p;
    for (const { bridge, ring } of this.bridgeGates) {
      ring.visible = Math.hypot(p.x - bridge.x, p.z - bridge.z) < 180;
      ring.material.resolution.set(innerWidth, innerHeight);
      ring.material.color.set(this.bridgeComplete ? "#77a572" : "#b88a4e");
      ring.material.opacity = 0.55 + Math.sin(time * 2) * 0.1;
    }
    this.sway.value = time * Math.hypot(weather.x, weather.z) * 0.15;
    this.player.position.set(p.x, p.y, p.z);
    this.player.rotation.set(f.pitch, p.yaw, -f.roll, "YXZ");
    const puffAge = 1 - (f.boostAnimation || 0) / 0.6;
    this.boostPuff.visible = f.state === "flying" && f.boostAnimation > 0;
    this.boostPuff.position.copy(this.player.position);
    this.boostPuff.quaternion.copy(this.player.quaternion);
    this.boostPuff.scale.set(1 + puffAge * 0.8, 1, 1 + puffAge * 0.5);
    this.boostPuff.children[0].material.opacity = Math.sin(Math.PI * puffAge) * 0.75;
    this.player.scale.setScalar(
      f.state === "crumpled" ? 0.4 + Math.max(0, f.timer) * 0.25 : 1,
    );
    this.player.visible = f.state !== "crumpled" || Math.sin(time * 18) > -0.2;
    const behind = new T.Vector3(Math.sin(p.yaw) * 19, 8, Math.cos(p.yaw) * 19),
      target = new T.Vector3(p.x, p.y, p.z).add(behind);
    this.camera.position.lerp(target, 1 - Math.exp(-dt * 4));
    this.camera.position.y = Math.max(
      this.camera.position.y,
      this.world.heightAt(this.camera.position.x, this.camera.position.z) + 4,
    );
    this.camera.lookAt(
      p.x - Math.sin(p.yaw) * 10,
      p.y + 1,
      p.z - Math.cos(p.yaw) * 10,
    );
    for (const object of this.inkObjects)
      if (object.children[0])
        object.children[0].visible =
          object.position.distanceTo(this.player.position) <
          (this.settings.quality === "low" ? 80 : 140);
    this.cloudMesh.material.map = this.cloudFrames[Math.floor(time * 5) % 2];
    PAPER.time.value = time;
    const cycle = dayCycle(weather.phase);
    this.cycle = cycle;
    this.sky.update(cycle);
    PAPER.day.value = cycle.brightness;
    PAPER.tint.value.setRGB(
      cycle.morning * 0.99 + cycle.day + cycle.afternoon + cycle.night * 0.9,
      cycle.morning * 0.96 +
        cycle.day +
        cycle.afternoon * 0.88 +
        cycle.night * 0.94,
      cycle.morning * 0.88 + cycle.day + cycle.afternoon * 0.77 + cycle.night,
    );
    PAPER.quality.value = this.settings.quality === "low" ? 0 : 1;
    this.scene.fog.color.setRGB(0, 0, 0);
    for (const key of ["morning", "day", "afternoon", "night"]) {
      this.scene.fog.color.r += this.palette[key].r * cycle[key];
      this.scene.fog.color.g += this.palette[key].g * cycle[key];
      this.scene.fog.color.b += this.palette[key].b * cycle[key];
    }
    this.player.userData.lineMaterial.resolution.set(innerWidth, innerHeight);
    this.player.userData.outline.position.x =
      Math.sin(Math.floor(time * 5) * 17) * 0.008;
    this.shadow.position.set(p.x, this.world.heightAt(p.x, p.z) + 0.15, p.z);
    this.shadow.scale.setScalar(
      3 + Math.min(100, p.y - this.shadow.position.y) * 0.035,
    );
    this.shadow.material.opacity = Math.max(
      0.08,
      0.5 - (p.y - this.shadow.position.y) * 0.004,
    );
    this.updateTrail(p, time);
    this.sun.intensity = 0.15 + weather.sun * 0.85;
    this.ambient.intensity = 0.25 + weather.sun * 1.4;
    this.life.update(p, time, weather, dt, this.clouds);
    this.fallMat.uniforms.time.value = time;
    this.waterTime.value = time;
    for (const d of this.dynamic) {
      if (d.type === "balloon" || d.type === "mist")
        d.mesh.position.y =
          d.base + Math.sin(time * 0.6 + d.mesh.position.x) * 1.5;
      if (d.type === "geyser")
        d.mesh.scale.y = 0.1 + Math.max(0, Math.sin(time * 0.3));
      if (d.type === "rainbow")
        d.mesh.material.opacity =
          Math.max(0, Math.cos(p.yaw - this.world.phase)) * 0.3;
    }
    for (const d of this.decor)
      if (d.userData.rotor)
        d.rotation.z = time * Math.hypot(weather.x, weather.z) * 0.1;
    let count = 0;
    for (const t of this.clouds) {
      if (count >= 150) break;
      this.dummy.position.set(
        t.x + weather.x * 3,
        t.y + 180,
        t.z + weather.z * 3,
      );
      this.dummy.scale.set(32, 16, 1);
      this.dummy.quaternion.copy(this.camera.quaternion);
      this.dummy.updateMatrix();
      this.cloudMesh.setMatrixAt(count++, this.dummy.matrix);
    }
    this.cloudMesh.count = count;
    this.cloudMesh.instanceMatrix.needsUpdate = true;
    let arrows = 0;
    const nearbyThermals = this.clouds
      .filter((t) => Math.hypot(t.x - p.x, t.z - p.z) < 120)
      .sort(
        (a, b) =>
          Math.hypot(a.x - p.x, a.z - p.z) - Math.hypot(b.x - p.x, b.z - p.z),
      )
      .slice(0, this.settings.quality === "low" ? 2 : 3);
    for (const t of nearbyThermals) {
      const life =
        0.35 + 0.65 * Math.sin(Math.PI * ((time / t.life + t.phase) % 1));
      if (t.lift * life * weather.sun * (1 - weather.rain * 0.8) < 2) continue;
      let sample = this.hintLift.get(t.id);
      if (!sample || time < sample.time || time - sample.time > 1) {
        const position = {
          x: t.x + weather.x * 25 * 0.025,
          y: t.y + 25,
          z: t.z + weather.z * 25 * 0.025,
        };
        sample = { time, up: (this.sampleAir?.(position)?.y || 0) > 1 };
        this.hintLift.set(t.id, sample);
      }
      if (!sample.up) continue;
      for (let j = 0; j < 3; j++) {
        const above = 12 + ((time * 2 + j * 9) % 28);
        this.dummy.position.set(
          t.x + weather.x * above * 0.025,
          t.y + above,
          t.z + weather.z * above * 0.025,
        );
        this.dummy.quaternion.copy(this.camera.quaternion);
        this.dummy.scale.set(1, 1, 1);
        this.dummy.updateMatrix();
        this.liftArrows.setMatrixAt(arrows++, this.dummy.matrix);
      }
    }
    this.liftArrows.count = arrows;
    this.liftArrows.instanceMatrix.needsUpdate = true;
    updateFlock(this.birds, this.clouds, p, time, dt);
    this.fish.forEach((f, i) => {
      const l = this.world.lakes[i % this.world.lakes.length],
        a = (time * 0.45 + i) % 6;
      f.visible = Math.hypot(l.x - p.x, l.z - p.z) < 200 && a < 1;
      f.position.set(
        l.x + Math.sin(i * 4) * l.r * 0.6,
        l.y + Math.sin(a * Math.PI) * 3,
        l.z + Math.cos(i * 4) * l.r * 0.6,
      );
      f.rotation.z = a * 3;
    });
    for (let i = 0; i < 24; i++) {
      const x = p.x + Math.sin(i * 8 + time * 0.2) * 24,
        z = p.z + Math.cos(i * 7 + time * 0.2) * 24;
      this.dummy.position.set(
        x,
        this.world.heightAt(x, z) + 2 + Math.sin(time * 2 + i),
        z,
      );
      this.dummy.scale.set(1, 1, 1);
      this.dummy.rotation.set(0, time, Math.sin(time * 15 + i));
      this.dummy.updateMatrix();
      this.butterflies.setMatrixAt(i, this.dummy.matrix);
    }
    this.butterflies.instanceMatrix.needsUpdate = true;
    let n = 0;
    for (const item of this.pickups) {
      if (item.taken) continue;
      this.dummy.position.set(
        item.x,
        item.y + Math.sin(time * 2 + item.x) * 0.5,
        item.z,
      );
      this.dummy.quaternion.copy(this.camera.quaternion);
      this.dummy.rotateZ(Math.sin(time * 0.7 + item.x) * 0.15);
      this.dummy.scale.set(
        item.type === "leaf" ? 0.8 : 1,
        item.type === "leaf" ? 0.8 : 1,
        1,
      );
      this.dummy.updateMatrix();
      this.pickupMesh.setMatrixAt(n, this.dummy.matrix);
      this.pickupMesh.setColorAt(
        n++,
        new T.Color(item.type === "leaf" ? 0xb2d6a4 : 0xffffff),
      );
    }
    this.pickupMesh.count = n;
    this.pickupMesh.instanceMatrix.needsUpdate = true;
    if (this.pickupMesh.instanceColor)
      this.pickupMesh.instanceColor.needsUpdate = true;
    this.renderer.render(this.scene, this.camera);
  }
}
