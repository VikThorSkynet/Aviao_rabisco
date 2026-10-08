import * as THREE from "three";
import { mergeVertices } from "three/addons/utils/BufferGeometryUtils.js";
import { LineSegments2 } from "three/addons/lines/LineSegments2.js";
import { LineSegmentsGeometry } from "three/addons/lines/LineSegmentsGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
export function startRoute(onExit) {
  document.body.innerHTML =
    '<style>\n  :root{--ink:#1d2a4a;--red:#c0392b;--paper:#f7f3e8;--blue:#1d3b8b}\n  html,body{margin:0;height:100%;overflow:hidden;background:var(--paper);font-family:\'Patrick Hand\',cursive;touch-action:none;user-select:none}\n  canvas{display:block}\n  #grain{position:fixed;inset:0;pointer-events:none;mix-blend-mode:multiply;opacity:.28}\n  #vignette{position:fixed;inset:0;pointer-events:none;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 55%,rgba(90,70,40,.22) 100%)}\n  .sketch{background:#fffdf6;color:var(--ink);border:2px solid var(--ink);\n    border-radius:255px 15px 225px 15px/15px 225px 15px 255px;box-shadow:3px 4px 0 rgba(0,0,0,.08);position:relative}\n  .sketch:before{content:\'\';position:absolute;top:-12px;left:50%;width:74px;height:22px;margin-left:-37px;\n    background:rgba(240,215,110,.75);transform:rotate(3deg)}\n  #hud{position:fixed;top:16px;left:16px;padding:10px 18px 12px;font-size:20px;line-height:1.3;transform:rotate(-1.5deg);pointer-events:none}\n  #hud b{color:var(--red)}\n  #altbar{position:fixed;right:22px;top:24vh;height:50vh;width:14px;border:2px solid var(--ink);\n    border-radius:8px 3px 9px 4px;background:repeating-linear-gradient(0deg,transparent 0 9px,rgba(29,59,139,.35) 9px 11px);pointer-events:none}\n  #altmark{position:absolute;left:-14px;width:40px;text-align:center;font-size:26px;color:var(--red);transform:translateY(50%) rotate(-20deg)}\n  #altlabel{position:absolute;top:-30px;left:-14px;width:44px;text-align:center;color:var(--ink);font-size:16px}\n  #combo{position:fixed;top:64px;right:70px;font-family:\'Caveat\',cursive;font-size:60px;color:var(--red);transform:rotate(-6deg);\n    pointer-events:none;text-decoration:underline;text-decoration-thickness:3px;text-underline-offset:6px;opacity:0;transition:opacity .2s}\n  #combo.on{opacity:1}\n  #combo.pop{animation:pop .3s ease-out}\n  @keyframes pop{0%{transform:rotate(-6deg) scale(1.7)}100%{transform:rotate(-6deg) scale(1)}}\n  .float{position:fixed;font-family:\'Caveat\',cursive;font-size:38px;pointer-events:none;white-space:nowrap;\n    transform:translate(-50%,-50%);animation:floatUp 1s ease-out forwards;text-shadow:0 0 4px #fffdf6}\n  .float.big{font-size:52px}\n  @keyframes floatUp{0%{opacity:0;transform:translate(-50%,-30%) scale(.6) rotate(-6deg)}\n    15%{opacity:1;transform:translate(-50%,-50%) scale(1.15) rotate(-4deg)}\n    100%{opacity:0;transform:translate(-50%,-170%) scale(1) rotate(-2deg)}}\n  #msg{position:fixed;inset:0;display:flex;align-items:center;justify-content:center;pointer-events:none}\n  #msg .card{padding:26px 40px 22px;text-align:center;font-size:24px;transform:rotate(-1deg);max-width:86vw}\n  #msg h1{font-family:\'Caveat\',cursive;font-size:72px;margin:0 0 6px;color:var(--red);transform:rotate(-3deg);\n    text-decoration:underline wavy rgba(192,57,43,.6);text-underline-offset:10px}\n  #msg small{color:#666;font-size:18px}\n  #flash{position:fixed;top:22%;left:0;right:0;text-align:center;font-family:\'Caveat\',cursive;font-size:60px;color:var(--red);\n    pointer-events:none;opacity:0;transition:opacity .2s;transform:rotate(-4deg)}\n  #help{position:fixed;bottom:10px;left:0;right:0;text-align:center;color:#555;font-size:16px;pointer-events:none}\n  #q{position:fixed;top:16px;right:16px;padding:6px 14px;font-family:inherit;font-size:17px;cursor:pointer;transform:rotate(1.5deg)}\n  #q:before{display:none}\n  #collection{position:fixed;top:260px;left:16px;padding:5px 10px;font-size:17px;color:var(--ink);background:#fffdf6d9;pointer-events:none;border:1px dashed var(--ink);border-radius:5px}\n  #debug{position:fixed;bottom:42px;left:16px;padding:8px 12px;font-size:16px;color:var(--ink);background:#fffdf6e8;border:1px dashed var(--ink);pointer-events:none}\n  .regen{display:inline-block;position:relative;width:18px;color:#b3aea3;vertical-align:baseline}\n  .regen i{position:absolute;inset:0;width:var(--progress);overflow:hidden;font-style:normal;color:#418c4c}\n  .missed{font-size:17px;margin-top:8px}\n  .checkpoint-choice{pointer-events:auto;font:inherit;color:var(--blue);background:#fffdf6;border:1px dashed var(--blue);border-radius:5px;padding:4px 8px;cursor:pointer}\n  .complete-badge{color:#418c4c}\n  #msg .card{max-height:82vh;overflow:auto}\n  @media(max-width:600px){#hud{font-size:16px;top:10px;left:8px;padding:8px 12px}#collection{top:218px;left:8px;font-size:14px}#msg h1{font-size:46px}#msg .card{font-size:19px;padding:18px 22px}#debug{font-size:13px;bottom:50px}#help{font-size:12px;padding:0 6px}}\n:root{--ink:#40515b;--red:#d77c62;--paper:#fff8e8;--blue:#4c8897}\nhtml,body{background:#eef4e8}\n#grain{opacity:.06}\n#vignette{background:radial-gradient(ellipse at center,transparent 70%,rgba(108,145,121,.07))}\n.sketch{background:rgba(255,252,240,.94);border:1.5px solid #657c76;box-shadow:2px 3px 0 rgba(86,109,95,.06)}\n.sketch:before{width:48px;margin-left:-24px;height:15px;top:-8px;background:#ecdfa78c}\n#hud{top:22px;left:22px;padding:11px 17px 10px;font-size:18px;line-height:1.25;transform:rotate(-1deg);min-width:114px}\n#hud .score{font:700 32px \'Caveat\',cursive;line-height:1;color:#bf765a}\n#hud .hud-small{font-size:15px;color:#71827d}\n#hud .charges{font-size:21px;color:#a39e52;letter-spacing:3px}\n#collection{top:auto;bottom:48px;left:22px;font-size:16px;background:#fffbefbd;border:0;border-radius:10px;padding:7px 12px;color:#64786b}\n#altbar{width:6px;right:27px;top:auto;bottom:66px;height:90px;border:1px solid #8ba397;background:#dce9d5a6;border-radius:5px}\n#altlabel{font-size:13px;left:-20px;top:-23px;width:46px;color:#71867c}\n#altmark{font-size:19px;left:-13px;width:31px;color:#b78954;transform:translateY(50%)}\n#combo{font-size:32px;top:24px;right:auto;left:185px;color:#bd7d53;text-decoration:none;transform:rotate(-4deg)}\n#combo.pop{animation:gentlePop .25s ease-out}\n@keyframes gentlePop{from{transform:rotate(-4deg) scale(1.14)}to{transform:rotate(-4deg) scale(1)}}\n#flash{top:auto;bottom:94px;font:22px \'Patrick Hand\',cursive;color:#568b6f;transform:none}\n.float{font-size:23px;text-shadow:0 1px 4px #fff8e8;animation:floatUp .7s ease-out forwards}\n.float.big{font-size:29px}\n#msg .card{padding:28px 38px 24px;width:min(410px,80vw);font-size:21px;transform:rotate(-.6deg);border-radius:28px 12px 26px 14px;max-height:80vh}\n#msg h1{font-size:56px;line-height:1.06;color:#bb7557;transform:rotate(-2deg);text-decoration:none;margin-bottom:10px}\n#msg small{font-size:16px;color:#7f9083}\n.welcome-sub{color:#789780;margin:0 0 18px;font-size:22px}\n.welcome-icons{display:flex;justify-content:center;gap:26px;color:#6e8c7c;font-size:16px;margin:18px 0}\n.welcome-icons b{display:block;font-size:30px;font-weight:normal;color:#b39655}\n.play-button{display:block;margin:18px auto 16px;padding:9px 32px;border:1.5px solid #6c9278;background:#dceccb;color:#4c755a;border-radius:20px 12px 18px 12px;cursor:pointer;pointer-events:auto;font:24px \'Caveat\',cursive;box-shadow:0 3px 0 #aec69b66}\n.play-button:hover{background:#cfe4ba;transform:translateY(-1px)}\n#q{top:20px;right:20px;border-color:#acc0ad;background:#fffcf099;color:#6f8d79;font-size:15px;padding:6px 12px;box-shadow:none;border-radius:9px;transform:none}\n#help{font-size:14px;bottom:14px;color:#748c7d;letter-spacing:.2px}\n#journey{position:fixed;top:25px;left:50%;transform:translateX(-50%);width:170px;text-align:center;pointer-events:none;color:#7c9481;font-size:14px}\n#journey .track{height:4px;margin-top:5px;background:#b8cdbf88;border-radius:10px;overflow:hidden}\n#journey .track i{height:100%;display:block;background:#94b891;border-radius:10px;transition:width .15s}\n#debug{font-size:14px;border-color:#8bac91;background:#fffbeaeb;bottom:84px}\n.missed{font-size:15px;color:#728776}.checkpoint-choice{border-color:#a4b7a4;font-size:14px;color:#5b8b74}\n@media(max-width:600px){#hud{top:14px;left:12px;font-size:16px;padding:8px 12px;min-width:94px}#hud .score{font-size:29px}#hud .hud-small{font-size:13px}#collection{left:10px;bottom:57px;font-size:13px}#combo{top:18px;left:141px;font-size:26px}#q{top:12px;right:12px;padding:5px 8px;font-size:13px}#journey{top:119px;width:138px}#msg .card{padding:21px 22px;width:80vw;font-size:18px}#msg h1{font-size:44px}.welcome-icons{gap:18px;font-size:14px}#help{font-size:11px;padding:0 18px;bottom:12px}#altbar{right:18px;bottom:78px;height:75px}#flash{font-size:19px;bottom:95px}}\n\n</style>\n<div id="hud" class="sketch"></div>\n<div id="altbar"><div id="altlabel">altura</div><div id="altmark">✈</div></div>\n<div id="journey"><span>jardim de papel</span><div class="track"><i></i></div></div>\n<div id="collection"></div>\n<div id="debug" hidden></div>\n<div id="combo"></div>\n<div id="flash"></div>\n<div id="msg"></div>\n<button id="q" class="sketch">✎ alta</button>\n<div id="help">← → virar · ↑ ↓ altura · espaço: sopro · C: voltar · H: ajuda</div>\n<div id="grain"></div>\n<div id="vignette"></div>\n\n';

  // ================== CONFIG ==================
  const CFG = {
    startAlt: 145,
    startSpeed: 12,
    gravity: 9.8,
    drag: 0.008,
    minSink: 0.7,
    maxSink: 3.8,
    liftK: 0.18,
    pitchRate: 1.0,
    pitchMin: -0.9,
    pitchMax: 0.55,
    pitchRest: -0.1,
    rollRate: 4.0,
    maxRoll: 0.8,
    turnK: 1.1,
    stallSpeed: 5,
    stallTime: 1.0,
    boost: 8,
    boosts: 3,
    maxBoosts: 5,
    safeLandSpeed: 12,
    step: 1 / 120,
    magnet: 6,
    comboTime: 12,
    assist: { enabled: true, strength: 1.7, lift: 3, drop: 5 },
    glideMeasured: 2.3,
    routeSafety: 0.85,
    recovery: {
      every: 1,
      lift: 10,
      bottom: 2.5,
      radius: 16,
      offset: 12,
      margin: 3,
      safety: 5,
      activationDeficit: 4,
      exitSpeed: 12,
    },
    rescue: {
      floor: 6,
      deficit: 12,
      cooldown: 3,
      duration: 10,
      lookahead: 40,
      pullDistance: 18,
      climbSeconds: 3.5,
    },
    boostRegen: 8,
    secretReturn: true,
    checkpointCost: 0,
    longPressMs: 700,
    spacing: [40, 65], // espaço vazio entre padrões (m)
    gust: { len: 40, rise: 10, r: 10, lift: 6, push: 3 }, // rajada: sobe + empurra
    secrets: 6,
    freeGusts: 3, // rajadas secretas / soltas no mapa
    downdraft: { r: 9, strength: 3, count: 1 },
    turb: { r: 9, jolt: 0.3, count: 1 },
  };

  // Measure the unchanged flight model before map generation, so the first map also
  // uses real flight numbers. F3 repeats this measurement during a stable live flight.
  function measureFreeGlide() {
    let speed = CFG.startSpeed,
      distance = 0,
      fall = 0;
    const pitch = CFG.pitchRest,
      dt = CFG.step;
    for (let i = 0; i < Math.round(33 / dt); i++) {
      speed = Math.max(
        0,
        speed +
          (-Math.sin(pitch) * CFG.gravity - CFG.drag * speed * speed) * dt,
      );
      const sink = Math.max(
        CFG.minSink,
        Math.min(
          CFG.maxSink,
          CFG.maxSink - speed * CFG.liftK * Math.cos(pitch),
        ),
      );
      if (i * dt >= 30) {
        distance += speed * Math.cos(pitch) * dt;
        fall += (sink - speed * Math.sin(pitch)) * dt;
      }
    }
    return distance / fall;
  }
  CFG.glideMeasured = measureFreeGlide();
  const debug = {
    enabled: false,
    stable: 0,
    origin: null,
    measured: null,
    lastSpeed: CFG.startSpeed,
    group: null,
  };
  const LOOK = {
    paper: "#eef4e4",
    ink: "#40515b",
    fogNear: 120,
    fogFar: 550,
    outlinePx: 1.3,
    boilFps: 5,
  };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const rnd = Math.random;
  const pick = (a) => a[Math.floor(rnd() * a.length)];
  const V3 = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
  const _v = V3(),
    _h = V3(),
    _fv = V3();
  function mulberry32(a) {
    return () => {
      a |= 0;
      a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const mkCanvas = (w, h) =>
    Object.assign(document.createElement("canvas"), { width: w, height: h });

  // ================== RENDERER / CENA ==================
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.setSize(innerWidth, innerHeight);
  document.body.prepend(renderer.domElement);
  const scene = new THREE.Scene();
  scene.fog = new THREE.Fog(LOOK.paper, LOOK.fogNear, LOOK.fogFar);
  const camera = new THREE.PerspectiveCamera(
    65,
    innerWidth / innerHeight,
    0.1,
    2500,
  );
  const LIGHT_DIR = V3(0.4, 1, 0.3).normalize();

  // ================== SHADERS: HACHURA + CONTORNO ==================
  const SHARED = {
    uInk: { value: new THREE.Color(LOOK.ink) },
    uPaper: { value: new THREE.Color(LOOK.paper) },
    uLightView: { value: V3() },
    uBoil: { value: 0 },
    uPR: { value: 1 },
    uHatch: { value: 1 },
    uFogNear: { value: LOOK.fogNear },
    uFogFar: { value: LOOK.fogFar },
    uRes: { value: new THREE.Vector2() },
    uThick: { value: LOOK.outlinePx },
  };
  const hatchVert = /* glsl */ `
  varying vec3 vN; varying float vDepth;
  void main(){
    vN = normalize(normalMatrix * normal);
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDepth = -mv.z;
    gl_Position = projectionMatrix * mv;
  }`;
  const hatchFrag = /* glsl */ `
  uniform vec3 uColor, uInk, uPaper, uLightView;
  uniform float uBoil, uPR, uHatch, uFogNear, uFogFar;
  varying vec3 vN; varying float vDepth;
  float hatch(vec2 p, float ang, float sp, float w){
    vec2 d = vec2(cos(ang), sin(ang));
    float v = dot(p, d) + sin(dot(p, vec2(-d.y, d.x)) * 0.04 + uBoil) * 1.5;
    float f = abs(fract(v / sp) - 0.5) * sp;
    return 1.0 - smoothstep(w * 0.5, w * 0.5 + 1.0, f);
  }
  void main(){
    vec3 n = normalize(vN);
    if (!gl_FrontFacing) n = -n;
    float l = clamp(dot(n, normalize(uLightView)), 0.0, 1.0) * 0.8 + 0.2;
    vec2 sp = gl_FragCoord.xy / uPR + vec2(sin(uBoil), cos(uBoil * 1.3)) * 1.2;
    float ink = 0.0;
    if (l < 0.70) ink = max(ink, hatch(sp,  0.8, 6.0, 1.1));
    if (l < 0.45) ink = max(ink, hatch(sp, -0.8, 6.0, 1.1));
    if (l < 0.28) ink = max(ink, hatch(sp,  0.0, 4.0, 1.1));
    vec3 col;
    if (uHatch > 0.5) {
      float tone = l > 0.70 ? 1.0 : (l > 0.45 ? 0.93 : 0.86);
      col = mix(uColor * tone, uInk, ink * 0.6);
    } else {
      col = uColor * mix(0.78, 1.0, step(0.5, l));
    }
    float f = smoothstep(uFogNear, uFogFar, vDepth);
    gl_FragColor = vec4(mix(col, uPaper, f), 1.0);
    #include <colorspace_fragment>
  }`;
  const hullVert = /* glsl */ `
  uniform float uThick, uBoil; uniform vec2 uRes;
  varying float vDepth;
  float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898, 78.233, 37.719))) * 43758.5453); }
  void main(){
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vDepth = -mv.z;
    vec4 clip = projectionMatrix * mv;
    vec3 n = normalize(normalMatrix * normal);
    vec2 dir = (projectionMatrix * vec4(n, 0.0)).xy;
    float len = length(dir);
    dir = len > 1e-5 ? dir / len : vec2(0.0);
    float wob = 0.7 + 0.6 * h(position + uBoil);
    clip.xy += dir * uThick * wob * 2.0 / uRes * clip.w;
    gl_Position = clip;
  }`;
  const hullFrag = /* glsl */ `
  uniform vec3 uInk, uPaper; uniform float uFogNear, uFogFar;
  varying float vDepth;
  void main(){
    float f = smoothstep(uFogNear, uFogFar, vDepth);
    gl_FragColor = vec4(mix(uInk, uPaper, f), 1.0);
    #include <colorspace_fragment>
  }`;
  function hatchMat(color, side = THREE.FrontSide) {
    return new THREE.ShaderMaterial({
      uniforms: { ...SHARED, uColor: { value: new THREE.Color(color) } },
      vertexShader: hatchVert,
      fragmentShader: hatchFrag,
      side,
    });
  }
  const hullMat = new THREE.ShaderMaterial({
    uniforms: SHARED,
    vertexShader: hullVert,
    fragmentShader: hullFrag,
    side: THREE.BackSide,
  });
  const flatten = (geo) => {
    const g = geo.toNonIndexed();
    g.computeVertexNormals();
    return g;
  };
  function hullOf(geo) {
    let g = geo.clone();
    g.deleteAttribute("normal");
    if (g.attributes.uv) g.deleteAttribute("uv");
    g = mergeVertices(g, 1e-4);
    g.computeVertexNormals();
    return g;
  }
  function inked(geo, hullGeo, mat) {
    const m = new THREE.Mesh(geo, mat);
    m.add(new THREE.Mesh(hullGeo, hullMat));
    return m;
  }

  // ================== LINHAS (traço à mão) ==================
  const lineMats = [];
  function lineMat(color, width, opacity = 1, transparent = false) {
    const m = new LineMaterial({
      color,
      linewidth: width,
      transparent: transparent || opacity < 1,
      opacity,
    });
    m.fog = true;
    m.resolution.set(innerWidth, innerHeight);
    lineMats.push(m);
    return m;
  }
  function segsOf(polys) {
    const a = [];
    for (const pts of polys)
      for (let i = 0; i < pts.length - 1; i++) {
        const p0 = pts[i],
          p1 = pts[i + 1];
        a.push(p0.x, p0.y, p0.z, p1.x, p1.y, p1.z);
      }
    return a;
  }
  function makeLines(polys, mat) {
    const g = new LineSegmentsGeometry(),
      arr = segsOf(polys);
    g.setPositions(arr);
    const l = new LineSegments2(g, mat);
    l.userData.segs = arr.length / 6;
    return l;
  }
  // estrela de um traço só (passa do ponto)
  function sketchStarPoints(R = 1, jitter = 0.06, overshoot = 0.25) {
    const pts = [],
      steps = 5 + overshoot,
      n = 60;
    for (let i = 0; i <= n; i++) {
      const t = (i / n) * steps,
        k = Math.floor(t),
        f = t - k;
      const a0 = (k * 4 * Math.PI) / 5 + Math.PI / 2,
        a1 = ((k + 1) * 4 * Math.PI) / 5 + Math.PI / 2;
      pts.push(
        V3(
          THREE.MathUtils.lerp(Math.cos(a0), Math.cos(a1), f) * R +
            (rnd() - 0.5) * jitter,
          THREE.MathUtils.lerp(Math.sin(a0), Math.sin(a1), f) * R +
            (rnd() - 0.5) * jitter,
          0,
        ),
      );
    }
    return pts;
  }
  // círculo à mão (começa em ângulo aleatório e passa do ponto)
  function sketchCirclePoints(r, seg = 56, overshoot = 0.15, jitter = 0.04) {
    const pts = [],
      start = rnd() * Math.PI * 2,
      total = Math.PI * 2 * (1 + overshoot);
    for (let i = 0; i <= seg; i++) {
      const a = start + (i / seg) * total,
        rr = r * (1 + (rnd() - 0.5) * jitter);
      pts.push(
        V3(Math.cos(a) * rr, Math.sin(a) * rr, (rnd() - 0.5) * 0.04 * r),
      );
    }
    return pts;
  }
  function dashedCircle(r, seg = 48) {
    const polys = [],
      st = rnd() * 6.283;
    for (let i = 0; i < seg; i += 2) {
      const a0 = st + (i / seg) * 6.283,
        a1 = st + ((i + 1) / seg) * 6.283;
      polys.push([
        V3(Math.cos(a0) * r, Math.sin(a0) * r, 0),
        V3(Math.cos(a1) * r, Math.sin(a1) * r, 0),
      ]);
    }
    return polys;
  }
  function zigzag() {
    const pts = [];
    for (let i = 0; i < 9; i++)
      pts.push(V3(-0.9 + i * 0.225, i % 2 ? 0.7 : -0.7, 0.12));
    return pts;
  }
  // ✓ espelhado no X (o anel é visto por trás do seu eixo +Z)
  const checkPolys = (s) => [
    [
      V3(0.45 * s, 0, -0.1),
      V3(0.1 * s, -0.4 * s, -0.1),
      V3(-0.55 * s, 0.5 * s, -0.1),
    ],
  ];
  const xPolys = (s) => [
    [V3(-s, -s, -0.1), V3(s, s, -0.1)],
    [V3(-s, s, -0.1), V3(s, -s, -0.1)],
  ];

  // ================== TEXTURAS DESENHADAS (canvas) ==================
  function wobblyLine(g, x1, y1, x2, y2, amp) {
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
  function fibers(g, S, n) {
    for (let i = 0; i < n; i++) {
      g.fillStyle = `rgba(120,100,70,${rnd() * 0.06})`;
      g.fillRect(rnd() * S, rnd() * S, 1 + rnd() * 2, 1);
    }
  }
  function canvasTex(c, repeat = true) {
    const t = new THREE.CanvasTexture(c);
    if (repeat) t.wrapS = t.wrapT = THREE.RepeatWrapping;
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }
  function groundTexture() {
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
    t.anisotropy = renderer.capabilities.getMaxAnisotropy();
    return t;
  }
  function skyTexture() {
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
  function treeTexture(variant) {
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
  const trees = [],
    treeMats = [0, 1, 2, 3].map(
      (i) =>
        new THREE.SpriteMaterial({
          map: treeTexture(i),
          transparent: true,
          depthWrite: false,
          fog: true,
        }),
    );
  function addTree(x, z, height, variant) {
    const sprite = new THREE.Sprite(treeMats[variant % treeMats.length]);
    sprite.center.set(0.5, 0.04);
    sprite.position.set(x, 0.2, z);
    sprite.scale.set(height * 0.67, height, 1);
    scene.add(sprite);
    trees.push({ sprite, x, z });
  }
  function flowerTexture() {
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
  function scatterScenery() {
    const flowerMat = new THREE.MeshBasicMaterial({
      map: flowerTexture(),
      transparent: true,
      depthWrite: false,
    });
    // Small groves flank the route. The centre stays open, with no collision on trees.
    for (let i = 7; i < routeSamples.length; i += 8) {
      const { s, side } = routeFrame(i);
      for (const sign of [-1, 1]) {
        const distance = 65 + rnd() * 70,
          x = s.x + side.x * sign * distance,
          z = s.z + side.z * sign * distance;
        if (!clearOfRoute(x, null, z, 38)) continue;
        addTree(
          x,
          z,
          46 + rnd() * 35,
          Math.floor(i / 16) + (sign === 1 ? 1 : 0),
        );
        if (i % 16 === 7) {
          addTree(x + sign * 17, z - 12, 30 + rnd() * 25, i + 1);
          const flowers = new THREE.Mesh(
            new THREE.PlaneGeometry(24, 24),
            flowerMat,
          );
          flowers.rotation.x = -Math.PI / 2;
          flowers.position.set(x, 0.12, z + 17);
          scene.add(flowers);
        }
      }
    }
    for (let i = 0; i < 10; i++) {
      const index = 15 + Math.floor(rnd() * (routeSamples.length - 25)),
        { s, side } = routeFrame(index),
        sign = i % 2 ? 1 : -1;
      const pos = V3(s.x, Math.max(14, s.y - 25), s.z).addScaledVector(
        side,
        sign * (95 + rnd() * 70),
      );
      if (clearOfRoute(pos.x, pos.y, pos.z, 50)) addCloud(pos);
    }
    // A few pencil props and paper balls preserve the notebook theme.
    for (let i = 0; i < 6; i++) {
      const { s, side } = routeFrame(
          20 + Math.floor(rnd() * (routeSamples.length - 30)),
        ),
        sign = i % 2 ? 1 : -1;
      const pos = V3(s.x, 0, s.z).addScaledVector(side, sign * 160);
      if (clearOfRoute(pos.x, null, pos.z, 40))
        addPencil(pos.x, pos.z, 1.2, 15 + rnd() * 12);
    }
    for (let i = 0; i < 4; i++) {
      const { s, side } = routeFrame(
        20 + Math.floor(rnd() * (routeSamples.length - 30)),
      );
      const pos = V3(s.x, Math.max(5, s.y - 20), s.z).addScaledVector(
        side,
        (i % 2 ? 1 : -1) * 85,
      );
      if (clearOfRoute(pos.x, pos.y, pos.z, 32)) addBall(pos, 2);
    }
  }

  function cloudTexture(variant, frame) {
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
  function shadowTexture() {
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
  function glowTexture() {
    const c = mkCanvas(128, 128),
      g = c.getContext("2d"),
      gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, "rgba(255,240,70,0.9)");
    gr.addColorStop(0.5, "rgba(255,235,60,0.35)");
    gr.addColorStop(1, "rgba(255,235,60,0)");
    g.fillStyle = gr;
    g.fillRect(0, 0, 128, 128);
    return canvasTex(c, false);
  }
  function bitTexture() {
    const c = mkCanvas(32, 32),
      g = c.getContext("2d");
    g.strokeStyle = "#2b2b2b";
    g.lineWidth = 3;
    g.lineCap = "round";
    g.beginPath();
    g.moveTo(6, 24);
    g.lineTo(16, 10);
    g.lineTo(26, 20);
    g.stroke();
    return canvasTex(c, false);
  }
  function discTexture() {
    const S = 128,
      c = mkCanvas(S, S),
      g = c.getContext("2d");
    g.save();
    g.beginPath();
    g.arc(64, 64, 62, 0, 6.283);
    g.clip();
    g.strokeStyle = "rgba(192,57,43,0.8)";
    g.lineWidth = 2.5;
    for (let x = -128; x < 256; x += 9) {
      g.beginPath();
      g.moveTo(x, 128);
      g.lineTo(x + 128, 0);
      g.stroke();
    }
    g.restore();
    return canvasTex(c, false);
  }
  function windTexture(color, up) {
    const c = mkCanvas(64, 128),
      g = c.getContext("2d");
    g.strokeStyle = color;
    g.lineWidth = 5;
    g.lineCap = "round";
    g.lineJoin = "round";
    const X = (y) => 32 + Math.sin(y * 0.12) * 10;
    g.beginPath();
    for (let y = 24; y <= 104; y += 4)
      y === 24 ? g.moveTo(X(y), y) : g.lineTo(X(y), y);
    g.stroke();
    const ty = up ? 10 : 118,
      by = up ? 26 : 102,
      tx = up ? X(24) : X(104);
    g.beginPath();
    g.moveTo(tx - 12, by);
    g.lineTo(tx, ty);
    g.lineTo(tx + 12, by);
    g.stroke();
    return canvasTex(c, false);
  }
  function curlTexture() {
    const c = mkCanvas(64, 64),
      g = c.getContext("2d");
    g.strokeStyle = "rgba(70,70,70,0.9)";
    g.lineWidth = 3.5;
    g.lineCap = "round";
    g.beginPath();
    for (let a = 0; a < 5 * Math.PI; a += 0.2) {
      const r = a * 1.9,
        x = 32 + Math.cos(a) * r,
        y = 32 + Math.sin(a) * r;
      a ? g.lineTo(x, y) : g.moveTo(x, y);
    }
    g.stroke();
    return canvasTex(c, false);
  }
  function landingTexture() {
    const S = 256,
      c = mkCanvas(S, S),
      g = c.getContext("2d");
    g.strokeStyle = "rgba(192,57,43,0.9)";
    g.lineWidth = 6;
    g.lineCap = "round";
    for (const r of [112, 76, 40]) {
      g.beginPath();
      const st = rnd() * 6.28;
      for (let a = 0; a <= 6.28 * 1.12; a += 0.1) {
        const rr = r * (1 + (rnd() - 0.5) * 0.04);
        const x = 128 + Math.cos(st + a) * rr,
          y = 128 + Math.sin(st + a) * rr;
        a ? g.lineTo(x, y) : g.moveTo(x, y);
      }
      g.stroke();
    }
    g.lineWidth = 8;
    g.beginPath();
    g.moveTo(108, 108);
    g.lineTo(148, 148);
    g.moveTo(148, 108);
    g.lineTo(108, 148);
    g.stroke();
    return canvasTex(c, false);
  }

  // ================== MUNDO BASE ==================
  const skyTex = skyTexture();
  scene.background = skyTex;
  const ground = new THREE.Mesh(
    new THREE.PlaneGeometry(6000, 6000),
    new THREE.MeshBasicMaterial({ map: groundTexture() }),
  );
  ground.rotation.x = -Math.PI / 2;
  scene.add(ground);

  // Lápis
  const cylGeo = flatten(new THREE.CylinderGeometry(1, 1, 1, 6)),
    cylHull = hullOf(cylGeo);
  const coneGeo = flatten(new THREE.ConeGeometry(1, 1, 6)),
    coneHull = hullOf(coneGeo);
  const pencilMats = [
    "#f2c230",
    "#e0573e",
    "#3f7fd9",
    "#4caf6a",
    "#9a5bd1",
  ].map((c) => hatchMat(c));
  const woodMat = hatchMat("#e8c9a0"),
    leadMat = hatchMat("#3a3a3a");
  const pencils = [];
  function addPencil(x, z, r, h) {
    const g = new THREE.Group();
    const body = inked(cylGeo, cylHull, pick(pencilMats));
    body.scale.set(r, h, r);
    body.position.y = h / 2;
    const tipH = r * 2.2;
    const tip = inked(coneGeo, coneHull, woodMat);
    tip.scale.set(r, tipH, r);
    tip.position.y = h + tipH / 2;
    const lead = inked(coneGeo, coneHull, leadMat);
    lead.scale.set(r * 0.35, tipH * 0.35, r * 0.35);
    lead.position.y = h + tipH * 0.825;
    g.add(body, tip, lead);
    g.position.set(x, 0, z);
    g.rotation.y = rnd() * Math.PI;
    scene.add(g);
    pencils.push({ x, z, r, top: h + tipH });
  }
  // Bolas de papel
  function crumpledGeo() {
    const g = new THREE.IcosahedronGeometry(1, 1),
      pos = g.attributes.position,
      map = new Map(),
      v = V3();
    for (let i = 0; i < pos.count; i++) {
      v.fromBufferAttribute(pos, i);
      const k = v
        .toArray()
        .map((n) => n.toFixed(3))
        .join();
      if (!map.has(k)) map.set(k, 0.75 + rnd() * 0.45);
      v.multiplyScalar(map.get(k));
      pos.setXYZ(i, v.x, v.y, v.z);
    }
    g.computeVertexNormals();
    return g;
  }
  const ballGeo = crumpledGeo(),
    ballHull = hullOf(ballGeo),
    ballMat = hatchMat("#fbf8ef");
  const balls = [];
  function addBall(pos, r) {
    const m = inked(ballGeo, ballHull, ballMat);
    m.scale.setScalar(r);
    m.position.copy(pos);
    m.rotation.set(rnd() * 6, rnd() * 6, 0);
    scene.add(m);
    balls.push({ mesh: m, base: pos.clone(), r, phase: rnd() * 6.28 });
  }
  // Nuvens
  const cloudTex = [0, 1, 2].map((v) => [
    cloudTexture(v, 0),
    cloudTexture(v, 1),
  ]);
  const cloudMats = cloudTex.map(
    (t) =>
      new THREE.SpriteMaterial({
        map: t[0],
        transparent: true,
        depthWrite: false,
        fog: true,
      }),
  );
  function addCloud(pos) {
    const s = new THREE.Sprite(pick(cloudMats)),
      k = 10 + rnd() * 10;
    s.scale.set(k * 2, k, 1);
    s.position.copy(pos);
    scene.add(s);
  }
  // Sombra do avião
  const shadow = new THREE.Mesh(
    new THREE.PlaneGeometry(1, 1),
    new THREE.MeshBasicMaterial({
      map: shadowTexture(),
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -2,
    }),
  );
  shadow.rotation.x = -Math.PI / 2;
  scene.add(shadow);

  // ================== AVIÃO ==================
  function makePlane() {
    const N = [0, 0, -1.6],
      L = [-1.1, 0.06, 1.0],
      R = [1.1, 0.06, 1.0],
      C = [0, 0, 1.0],
      K = [0, -0.35, 1.0];
    const geo = new THREE.BufferGeometry();
    geo.setAttribute(
      "position",
      new THREE.Float32BufferAttribute([N, C, L, N, R, C, N, K, C].flat(), 3),
    );
    geo.computeVertexNormals();
    const mesh = new THREE.Mesh(geo, hatchMat("#ffffff", THREE.DoubleSide));
    const outline = new LineSegments2(
      new LineSegmentsGeometry().fromEdgesGeometry(
        new THREE.EdgesGeometry(geo, 1),
      ),
      lineMat(LOOK.ink, 3),
    );
    const g = new THREE.Group();
    g.add(mesh, outline);
    g.rotation.order = "YXZ";
    g.userData.outline = outline;
    return g;
  }
  const plane = makePlane();
  scene.add(plane);
  const crumple = inked(ballGeo, ballHull, hatchMat("#ffffff"));
  crumple.scale.setScalar(0.7);
  crumple.visible = false;
  scene.add(crumple);

  const TRAIL_MAX = 10;
  const trailSegs = new Float32Array((TRAIL_MAX - 1) * 6);
  const trailGeo = new LineSegmentsGeometry();
  trailGeo.setPositions(trailSegs);
  const trail = new LineSegments2(
    trailGeo,
    lineMat("#92ad99", 1.3, 0.24, true),
  );
  trail.frustumCulled = false;
  scene.add(trail);
  let trailPts = [],
    trailTimer = 0;
  function updateTrail() {
    const n = trailPts.length;
    trail.visible = n >= 2;
    if (n < 2) return;
    for (let i = 0; i < TRAIL_MAX - 1; i++) {
      const a = trailPts[Math.min(i, n - 1)],
        b = trailPts[Math.min(i + 1, n - 1)];
      trailSegs.set([a.x, a.y, a.z, b.x, b.y, b.z], i * 6);
    }
    const d = trailGeo.attributes.instanceStart.data;
    d.array.set(trailSegs);
    d.needsUpdate = true;
  }

  // ================== ESTRELAS ==================
  const starGeo = (() => {
    const s = new THREE.Shape();
    for (let i = 0; i < 10; i++) {
      const a = Math.PI / 2 + (i * Math.PI) / 5,
        r = i % 2 ? 0.382 : 1;
      i
        ? s.lineTo(Math.cos(a) * r, Math.sin(a) * r)
        : s.moveTo(Math.cos(a) * r, Math.sin(a) * r);
    }
    const g = new THREE.ExtrudeGeometry(s, {
      depth: 0.12,
      bevelEnabled: false,
    });
    g.translate(0, 0, -0.06);
    return g;
  })();
  const STAR = {
    graphite: { pts: 10, size: 1.2 },
    color: { pts: 30, size: 1.35 },
    highlighter: { pts: 100, size: 1.6, boost: 1 },
  };
  const PALETTE = ["#e0573e", "#3f7fd9", "#4caf6a", "#9a5bd1", "#f08a24"];
  const starMats = {
    graphite: [{ fill: hatchMat("#ffdc80"), line: lineMat("#af9050", 2.4) }],
    color: PALETTE.map((c) => ({
      fill: hatchMat(c),
      line: lineMat(new THREE.Color(c).multiplyScalar(0.6), 3.5),
    })),
    highlighter: [{ fill: hatchMat("#fff26a"), line: lineMat("#d9a400", 4) }],
  };
  const glowMat = new THREE.SpriteMaterial({
    map: glowTexture(),
    transparent: true,
    depthWrite: false,
    opacity: 0.75,
  });
  const scribbleMat = lineMat(LOOK.ink, 3);
  const stars = [];
  function makeStar(type, pos) {
    const T = STAR[type],
      M = pick(starMats[type]),
      g = new THREE.Group();
    const mesh = new THREE.Mesh(starGeo, M.fill);
    const lg = new LineSegmentsGeometry(),
      arr = segsOf([sketchStarPoints(1.06, 0.07, 0.25)]);
    lg.setPositions(arr);
    const o1 = new LineSegments2(lg, M.line),
      o2 = new LineSegments2(lg, M.line);
    o1.position.z = 0.08;
    o2.position.z = -0.08;
    g.add(mesh, o1, o2);
    if (type === "highlighter") {
      const gl = new THREE.Sprite(glowMat);
      gl.scale.setScalar(3.2);
      g.add(gl);
    }
    g.scale.setScalar(T.size);
    g.position.copy(pos);
    g.visible = false;
    scene.add(g);
    const s = {
      id: `star-${stars.length}`,
      page: RT.page,
      patternId: RT.pattern?.id ?? null,
      type,
      T,
      g,
      mesh,
      lg,
      segs: arr.length / 6,
      base: pos.clone(),
      pos: pos.clone(),
      state: "hidden",
      t: 0,
      phase: rnd() * 6.28,
      scribble: null,
    };
    stars.push(s);
    if (RT.pattern) RT.pattern.stars.push(s);
    return s;
  }
  function resetStar(s) {
    s.state = "hidden";
    s.t = 0;
    s.pos.copy(s.base);
    s.g.visible = false;
    s.g.scale.setScalar(s.T.size);
    if (s.scribble) {
      s.g.remove(s.scribble);
      s.scribble.geometry.dispose();
      s.scribble = null;
    }
  }

  // ================== CÍRCULOS ==================
  const RING = {
    pen: { color: "#619da8", pts: 25, r: 7 },
    red: { color: "#c0392b", pts: 25, r: 5, boost: 6 },
    binder: { color: "#78a68c", pts: 25, r: 7, checkpoint: true },
    compass: { color: "#1d2a4a", pts: 50, r: 3.6, spin: 0.7 },
    dotted: { color: "#4a4a4a", pts: 75, r: 6, shrink: true },
  };
  const torusGeo = flatten(new THREE.TorusGeometry(1, 0.075, 8, 40)),
    torusHull = hullOf(torusGeo),
    binderMat = hatchMat("#d7d7b6");
  const redMat = lineMat("#c0392b", 4.5),
    compassMat = lineMat("#555555", 2.5);
  const discGeo = new THREE.CircleGeometry(1, 32),
    discTex = discTexture();
  const rings = [],
    seqs = [];
  function newSeq(total) {
    const s = { total, passed: 0, failed: false };
    seqs.push(s);
    return s;
  }
  function makeRing(type, pos, normal, seq, rOverride = 0) {
    const T = RING[type],
      r = rOverride || T.r;
    const g = new THREE.Group();
    g.position.copy(pos);
    scene.add(g);
    g.lookAt(_v.copy(pos).add(normal));
    const spin = new THREE.Group();
    g.add(spin);
    const R = {
      id: `ring-${rings.length}`,
      page: RT.page,
      patternId: RT.pattern?.id ?? null,
      type,
      T,
      g,
      spin,
      pos: pos.clone(),
      normal: normal.clone().normalize(),
      baseR: r,
      r,
      seq,
      state: "hidden",
      t: 0,
      marks: [],
      mat: null,
      lines: [],
      disc: null,
    };
    if (type === "binder") {
      R.mat = lineMat(T.color, 3, 0.9, true);
      R.lines.push(makeLines([sketchCirclePoints(r, 56, 0.04, 0.01)], R.mat));
      spin.add(R.lines[0]);
    } else {
      R.mat = lineMat(T.color, type === "dotted" ? 4 : 5, 1, true);
      R.lines.push(
        makeLines(
          type === "dotted" ? dashedCircle(r) : [sketchCirclePoints(r)],
          R.mat,
        ),
      );
      if (type === "red") {
        // setinhas apontando pro centro
        const polys = [];
        for (let k = 0; k < 4; k++) {
          const a = (k * Math.PI) / 2 + Math.PI / 4,
            d = V3(Math.cos(a), Math.sin(a), 0),
            pp = V3(-d.y, d.x, 0);
          const head = d.clone().multiplyScalar(r + 0.9);
          polys.push([d.clone().multiplyScalar(r + 2.6), head]);
          polys.push([
            head.clone().addScaledVector(d, 0.6).addScaledVector(pp, 0.5),
            head,
            head.clone().addScaledVector(d, 0.6).addScaledVector(pp, -0.5),
          ]);
        }
        R.lines.push(makeLines(polys, R.mat));
      }
      if (type === "compass") {
        // compasso: ponta seca no centro, grafite na borda (só visual)
        const H = V3(0, 0, r * 0.9);
        R.lines.push(
          makeLines(
            [
              [V3(0, 0, 0), H],
              [H, V3(r, 0, 0)],
              [H, V3(0, 0, r * 0.9 + 0.9)],
            ],
            compassMat,
          ),
        );
      }
      R.lines.forEach((l) => spin.add(l));
    }
    g.visible = false;
    rings.push(R);
    if (RT.pattern) RT.pattern.rings.push(R);
    return R;
  }
  function setRingDraw(R, k) {
    if (R.type === "binder") R.spin.scale.setScalar(Math.max(0.01, k));
    else
      R.lines.forEach(
        (l) =>
          (l.geometry.instanceCount = Math.max(
            1,
            Math.ceil(k * l.userData.segs),
          )),
      );
  }
  function addMark(R, polys) {
    const m = makeLines(polys, redMat);
    R.g.add(m);
    R.marks.push(m);
  }
  function ringDisc(R) {
    const m = new THREE.Mesh(
      discGeo,
      new THREE.MeshBasicMaterial({
        map: discTex,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    );
    m.scale.setScalar(R.baseR * 0.95);
    R.spin.add(m);
    R.disc = m;
  }
  function resetRing(R) {
    R.state = "hidden";
    R.t = 0;
    R.r = R.baseR;
    R.g.visible = false;
    R.g.scale.setScalar(1);
    R.spin.scale.setScalar(1);
    R.marks.forEach((m) => {
      R.g.remove(m);
      m.geometry.dispose();
    });
    R.marks = [];
    if (R.disc) {
      R.spin.remove(R.disc);
      R.disc.material.dispose();
      R.disc = null;
    }
    if (R.mat) {
      R.mat.color.set(R.T.color);
      R.mat.opacity = 1;
    }
  }

  // ================== CORRENTES DE VENTO ==================
  const winds = [];
  const X_AXIS = V3(1, 0, 0),
    _wv = V3();
  const downSpriteMat = new THREE.SpriteMaterial({
    map: windTexture("#b0503a", false),
    transparent: true,
    depthWrite: false,
    opacity: 0.7,
  });
  const curlMat = new THREE.SpriteMaterial({
    map: curlTexture(),
    transparent: true,
    depthWrite: false,
    opacity: 0.8,
  });
  const streakGeo = (() => {
    const pts = [];
    for (let i = 0; i <= 14; i++) {
      const x = i * 0.5;
      pts.push(V3(x, Math.sin(x * 1.3) * 0.25, 0));
    }
    for (let a = -Math.PI / 2; a <= -Math.PI / 2 + 5; a += 0.25) {
      const r = 0.9 * (1 - (a + Math.PI / 2) / 7);
      pts.push(V3(7 + Math.cos(a) * r, 0.9 + Math.sin(a) * r, 0));
    }
    const g = new LineSegmentsGeometry();
    g.setPositions(segsOf([pts]));
    return g;
  })();
  const gustMat = lineMat("#69a3b4", 2, 0.4, true),
    gustRingMat = lineMat("#69a3b4", 1.4, 0.25, true);
  const recoveryMat = lineMat("#77a572", 2, 0.35, true),
    recoveryRingMat = lineMat("#77a572", 1.4, 0.22, true);
  function windTunnel(a, b, r, mat, ringMat) {
    const d = b.clone().sub(a),
      len = d.length();
    d.normalize();
    const g = new THREE.Group();
    g.position.copy(a);
    g.quaternion.setFromUnitVectors(X_AXIS, d);
    scene.add(g);
    const entrance = makeLines(
      dashedCircle(Math.min(r, 3.2), 20).map((pp) =>
        pp.map((v) => V3(0, v.x, v.y)),
      ),
      ringMat,
    );
    entrance.userData.windEntrance = true;
    g.add(entrance);
    const streaks = [];
    for (let i = 0, n = 3; i < n; i++) {
      const l = new LineSegments2(streakGeo, mat),
        ang = rnd() * 6.28,
        rad = r * (0.2 + rnd() * 0.55);
      l.position.set(0, Math.cos(ang) * rad, Math.sin(ang) * rad);
      l.rotation.x = rnd() * 6.28;
      l.frustumCulled = false;
      g.add(l);
      streaks.push({ l, off: rnd() * len, len });
    }
    return { g, streaks, len, d };
  }
  function addGust(
    a,
    dir,
    len,
    r = CFG.gust.r,
    lift = CFG.gust.lift,
    push = CFG.gust.push,
  ) {
    const t = windTunnel(
      a,
      a.clone().addScaledVector(dir.clone().normalize(), len),
      r,
      gustMat,
      gustRingMat,
    );
    const w = {
      type: "gust",
      a: a.clone(),
      d: t.d,
      len,
      r,
      lift,
      push,
      g: t.g,
      streaks: t.streaks,
      x: a.x + (t.d.x * len) / 2,
      z: a.z + (t.d.z * len) / 2,
    };
    winds.push(w);
    return w;
  }
  // J: a full-height funnel and a short horizontal exit. The column holds the plane
  // while climbing; without that dwell time a low plane crosses a narrow column too fast.
  function addRecoveryGust(anchor, exit, options = {}) {
    const bottom = options.bottom ?? CFG.recovery.bottom,
      targetY = exit.y + CFG.recovery.margin;
    const r = options.r ?? CFG.recovery.radius,
      g = new THREE.Group();
    scene.add(g);
    const a = V3(anchor.x, bottom, anchor.z),
      top = V3(anchor.x, Math.max(bottom + 1, targetY), anchor.z);
    const green = options.type !== "gust";
    const mat = green ? recoveryMat : gustMat,
      ring = green ? recoveryRingMat : gustRingMat;
    const vertical = windTunnel(a, top, r, mat, ring),
      horizontal = windTunnel(top, exit, r * 0.75, mat, ring);
    g.add(vertical.g, horizontal.g);
    const w = {
      type: options.type || "recovery",
      guided: true,
      a,
      targetY,
      exit: exit.clone(),
      r,
      lift: options.lift ?? CFG.recovery.lift,
      push: CFG.gust.push,
      x: anchor.x,
      z: anchor.z,
      g,
      streaks: [...vertical.streaks, ...horizontal.streaks],
      bottom,
      duration: options.duration || 0,
      born: options.born || 0,
      entered: false,
      phase: "climb",
      role: options.role || "recovery",
      routeS: options.routeS ?? 0,
    };
    winds.push(w);
    if (options.protect !== false) {
      const n = Math.ceil((targetY - bottom) / 6);
      for (let i = 0; i <= n; i++)
        keepClear.push({
          x: anchor.x,
          y: bottom + ((targetY - bottom) * i) / Math.max(1, n),
          z: anchor.z,
          clearance: r + 6,
        });
      protectPath([top, exit], r + 6);
    }
    return w;
  }
  function removeWind(w) {
    scene.remove(w.g);
    w.g.traverse((o) => {
      if (o.isLineSegments2 && o.geometry !== streakGeo) o.geometry.dispose();
    });
    const i = winds.indexOf(w);
    if (i >= 0) winds.splice(i, 1);
    if (p.activeWind === w) p.activeWind = null;
  }
  function clearRescues() {
    winds.filter((w) => w.type === "rescue").forEach(removeWind);
  }
  function addColumn(x, z, top, r, strength) {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    scene.add(g);
    g.add(
      makeLines(
        dashedCircle(r).map((pp) => pp.map((v) => V3(v.x, 0.3, v.y))),
        lineMat("#b0503a", 3, 0.6, true),
      ),
    );
    const sprites = [];
    for (let i = 0; i < 8; i++) {
      const sp = new THREE.Sprite(downSpriteMat);
      sp.scale.set(1.6, 3.2, 1);
      g.add(sp);
      sprites.push({
        sp,
        ang: rnd() * 6.28,
        rad: rnd() * r * 0.8,
        off: rnd() * 70,
      });
    }
    winds.push({ type: "down", x, z, r, top, strength, g, sprites });
  }
  function addTurb(pos, r) {
    const g = new THREE.Group();
    g.position.copy(pos);
    scene.add(g);
    const mat = lineMat("#555555", 2, 0.55, true),
      scr = [];
    for (let s = 0; s < 2; s++) {
      const pts = [],
        q = V3(),
        v = V3();
      for (let i = 0; i < 160; i++) {
        v.multiplyScalar(0.85).add(
          V3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(2.2),
        );
        q.add(v);
        if (q.length() > r * 0.75) q.setLength(r * 0.75);
        pts.push(q.clone());
      }
      const l = makeLines([pts], mat);
      g.add(l);
      scr.push(l);
    }
    const sprites = [];
    for (let i = 0; i < 8; i++) {
      const sp = new THREE.Sprite(curlMat);
      sp.scale.setScalar(2.2);
      g.add(sp);
      sprites.push({
        sp,
        phase: rnd() * 6.28,
        rad: r * (0.4 + rnd() * 0.5),
        sp2: 0.8 + rnd(),
      });
    }
    winds.push({
      type: "turb",
      pos: pos.clone(),
      x: pos.x,
      z: pos.z,
      r,
      g,
      scr,
      sprites,
    });
  }
  function sampleWind(pos) {
    let up = 0,
      turb = 0,
      push = 0,
      zone = "",
      guide = null;
    const pushDir = V3();
    for (const w of winds) {
      if (w.guided) {
        const d2 = (pos.x - w.x) ** 2 + (pos.z - w.z) ** 2;
        const ceiling = w.allowHighEntry
          ? Math.max(w.entryY + w.r, w.targetY - 1)
          : w.targetY - 1;
        const needsHelp =
          w.type !== "recovery" ||
          pos.y < w.exit.y - CFG.recovery.activationDeficit;
        const inside =
          d2 < w.r * w.r &&
          needsHelp &&
          pos.y >= w.bottom - 3 &&
          pos.y < ceiling;
        if ((p.activeWind === w || inside) && w !== p.lastWind) {
          // Emergency wind has priority over a fixed column.
          if (
            !guide ||
            w === p.activeWind ||
            (w.type === "rescue" && guide !== p.activeWind)
          )
            guide = w;
        }
      } else if (w.type === "turb") {
        const d = pos.distanceTo(w.pos);
        if (d < w.r) turb = Math.max(turb, 1 - d / w.r);
      } else if (w.type === "gust") {
        _wv.subVectors(pos, w.a);
        const t = _wv.dot(w.d);
        if (t <= 0 || t >= w.len) continue;
        const d2 = _wv.addScaledVector(w.d, -t).lengthSq();
        if (d2 >= w.r * w.r) continue;
        const k = (1 - d2 / (w.r * w.r)) * Math.min(1, t / 8, (w.len - t) / 8);
        up += w.lift * k;
        if (w.push * k > push) {
          push = w.push * k;
          pushDir.copy(w.d);
        }
        if (k > 0.15) zone = "gust";
      } else if (w.type === "down") {
        const d2 = (pos.x - w.x) ** 2 + (pos.z - w.z) ** 2;
        if (d2 < w.r * w.r && pos.y < w.top) {
          const k = (1 - d2 / (w.r * w.r)) * clamp((w.top - pos.y) / 20, 0, 1);
          up -= w.strength * k;
          if (k > 0.15) zone = "down";
        }
      }
    }
    if (guide) {
      up = guide.lift * clamp((guide.targetY - pos.y) / 5, 0, 1);
      push = guide.push;
      pushDir.copy(guide.exit).sub(pos).normalize();
      zone = guide.type;
      turb = 0;
    } else if (turb > 0.1) zone = "turb";
    return { up, lift: up, turb, push, pushDir, zone, guide };
  }
  function rideRecovery(w, dt) {
    if (p.activeWind !== w) {
      p.activeWind = w;
      w.phase = p.pos.y >= w.targetY - 0.45 ? "exit" : "climb";
      w.entered = true;
    }
    p.stall = 0;
    p.roll *= Math.exp(-4 * dt);
    p.pitch += (CFG.pitchRest - p.pitch) * Math.min(1, 4 * dt);
    // Lift tapers at the target. Supporting the plane's own sink avoids an equilibrium
    // several metres below the exit; the vertical displacement is capped at targetY.
    if (w.phase === "climb") {
      const k = clamp((w.targetY - p.pos.y) / 5, 0, 1);
      p.pos.y = Math.min(w.targetY, p.pos.y + w.lift * k * dt);
      p.pos.x += (w.x - p.pos.x) * Math.min(1, 1.5 * dt);
      p.pos.z += (w.z - p.pos.z) * Math.min(1, 1.5 * dt);
      if (w.targetY - p.pos.y < 0.45) w.phase = "exit";
    } else {
      const delta = w.exit.clone().sub(p.pos),
        d = delta.length(),
        speed = CFG.recovery.exitSpeed;
      if (d <= speed * dt + 0.5) {
        p.pos.copy(w.exit);
        p.activeWind = null;
        p.lastWind = w;
        p.windUp = 0;
        p.speed = Math.min(p.speed, CFG.recovery.exitSpeed);
        p.pitch = CFG.pitchRest;
        if (w.type === "rescue") {
          p.rescueAt = simTime;
          removeWind(w);
        }
      } else {
        p.pos.addScaledVector(delta, Math.min(1, (speed * dt) / d));
        p.yaw +=
          wrapAngle(Math.atan2(-delta.x, -delta.z) - p.yaw) *
          Math.min(1, 3 * dt);
        p.speed = Math.min(p.speed, CFG.recovery.exitSpeed);
      }
    }
    p.windUp = w.lift * clamp((w.targetY - p.pos.y) / 5, 0, 1);
  }
  function checkRescue(dt) {
    p.routeS = routeProgress(p.pos);
    p.deficit = routeY(p.routeS) - p.pos.y;
    for (const w of [...winds])
      if (
        w.type === "rescue" &&
        (simTime - w.born > w.duration || (w.entered && p.activeWind !== w))
      )
        removeWind(w);
    if (
      p.lastWind &&
      Math.hypot(p.pos.x - p.lastWind.x, p.pos.z - p.lastWind.z) >
        p.lastWind.r + 8
    )
      p.lastWind = null;
    if (
      !(p.pos.y < CFG.rescue.floor || p.deficit > CFG.rescue.deficit) ||
      isFinalApproach() ||
      simTime - p.rescueAt < CFG.rescue.cooldown ||
      sampleWind(p.pos).zone === "gust" ||
      p.activeWind ||
      sampleWind(p.pos).guide
    )
      return false;
    const goal = routePoint(
      Math.min(routeLength, p.routeS + CFG.rescue.lookahead),
    );
    // First climb just ahead of the nose; then pull gently towards the route. Limit
    // the horizontal leg so a distant player still exits before the 10-second expiry.
    const heading = V3(-Math.sin(p.yaw), 0, -Math.cos(p.yaw));
    const anchor = p.pos.clone().addScaledVector(heading, 5);
    const exit = anchor.clone(),
      towards = goal.clone().sub(anchor);
    towards.y = 0;
    if (towards.length() > CFG.rescue.pullDistance)
      towards.setLength(CFG.rescue.pullDistance);
    exit.add(towards);
    exit.y = Math.max(CFG.rescue.floor + 4, goal.y);
    const lift = Math.max(
      CFG.recovery.lift,
      (exit.y + CFG.recovery.margin - p.pos.y) / CFG.rescue.climbSeconds,
    );
    const w = addRecoveryGust(anchor, exit, {
      type: "rescue",
      bottom: Math.max(0.3, p.pos.y - 4),
      lift,
      duration: CFG.rescue.duration,
      born: simTime,
      protect: false,
      routeS: p.routeS,
    });
    p.activeWind = w;
    w.entered = true;
    p.rescueAt = simTime;
    comboBreak();
    flash("VENTO DE RESGATE!");
    return true;
  }
  function regenBoost(dt) {
    if (p.deficit > 0 && p.boosts < CFG.boosts) {
      p.boostTimer += dt;
      if (p.boostTimer >= CFG.boostRegen) {
        p.boostTimer -= CFG.boostRegen;
        p.boosts++;
        flash("+1 sopro recarregado");
      }
    } else p.boostTimer = 0;
  }

  // ================== LASCAS DE GRAFITE / TEXTO FLUTUANTE ==================
  const bitMat = new THREE.SpriteMaterial({
    map: bitTexture(),
    transparent: true,
    depthWrite: false,
  });
  const bits = Array.from({ length: 80 }, () => {
    const s = new THREE.Sprite(bitMat);
    s.visible = false;
    scene.add(s);
    return { s, v: V3(), life: 0 };
  });
  function burst(pos, n) {
    let c = 0;
    for (const b of bits) {
      if (b.life > 0) continue;
      b.life = 0.6 + rnd() * 0.3;
      b.s.position.copy(pos);
      b.s.visible = true;
      b.v
        .set(rnd() - 0.5, rnd() - 0.2, rnd() - 0.5)
        .normalize()
        .multiplyScalar(4 + rnd() * 5);
      if (++c >= n) break;
    }
  }
  function floatText(text, worldPos, color = "#c0392b", big = false) {
    _fv.copy(worldPos).project(camera);
    if (_fv.z > 1 || Math.abs(_fv.x) > 1.2 || Math.abs(_fv.y) > 1.2) return;
    const el = document.createElement("div");
    el.className = "float" + (big ? " big" : "");
    el.textContent = text;
    el.style.color = color;
    el.style.left = `${((_fv.x + 1) / 2) * innerWidth}px`;
    el.style.top = `${((1 - _fv.y) / 2) * innerHeight}px`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 1000);
  }

  // ================== ÁUDIO (sintetizado) ==================
  let ac = null,
    master = null,
    noiseBuf = null,
    windGain = null,
    muted = false;
  function initAudio() {
    if (ac) {
      if (ac.state === "suspended") ac.resume();
      return;
    }
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      master = ac.createGain();
      master.gain.value = 0.8;
      master.connect(ac.destination);
      noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = rnd() * 2 - 1;
      const src = ac.createBufferSource();
      src.buffer = noiseBuf;
      src.loop = true;
      const lp = ac.createBiquadFilter();
      lp.type = "lowpass";
      lp.frequency.value = 450;
      windGain = ac.createGain();
      windGain.gain.value = 0;
      src.connect(lp).connect(windGain).connect(master);
      src.start();
    } catch (e) {
      ac = null;
    }
  }
  function noiseHit(freq, q, vol, dur, delay = 0) {
    if (!ac) return;
    const t = ac.currentTime + delay,
      src = ac.createBufferSource(),
      f = ac.createBiquadFilter(),
      g = ac.createGain();
    src.buffer = noiseBuf;
    f.type = "bandpass";
    f.frequency.value = freq;
    f.Q.value = q;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    src.connect(f).connect(g).connect(master);
    src.start(t, rnd() * 0.5, dur + 0.05);
  }
  function tone(freq, dur, type = "triangle", vol = 0.18, delay = 0) {
    if (!ac) return;
    const t = ac.currentTime + delay,
      o = ac.createOscillator(),
      g = ac.createGain();
    o.type = type;
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g).connect(master);
    o.start(t);
    o.stop(t + dur + 0.05);
  }
  const sfxScratch = (p) => {
    noiseHit(2400 * p, 2.5, 0.35, 0.09);
    noiseHit(3000 * p, 2.5, 0.25, 0.07, 0.07);
  };
  const sfxDing = (m) => {
    const f = 520 * Math.pow(1.12, m - 1);
    tone(f, 0.25);
    tone(f * 1.5, 0.3, "triangle", 0.14, 0.08);
  };
  const sfxBuzz = () => tone(120, 0.3, "sawtooth", 0.1);
  const sfxWhoosh = () => noiseHit(700, 0.8, 0.45, 0.35);
  const sfxCrash = () => {
    noiseHit(1200, 0.7, 0.5, 0.25);
    noiseHit(500, 1, 0.4, 0.3, 0.05);
  };
  function toggleMute() {
    muted = !muted;
    if (master) master.gain.value = muted ? 0 : 0.8;
    flash(muted ? "som: off" : "som: on");
  }

  // ================== ROTA + PADRÕES ==================
  const routeSamples = [{ s: 0, x: 0, y: CFG.startAlt, z: 0, page: 1 }],
    keepClear = [...routeSamples];
  const patterns = [],
    secrets = [],
    routeGrid = new Map();
  let routeLength = 0,
    progressIndex = 0,
    landingStartS = Infinity;
  let validation = { ok: false, links: [], inserted: 0, unreachable: [] };
  const RT = {
    pos: V3(0, CFG.startAlt - 4, -16),
    yaw: 0,
    page: 1,
    pattern: null,
  };
  const dirOf = (yaw) => V3(-Math.sin(yaw), 0, -Math.cos(yaw));
  const rightOf = (yaw) => V3(Math.cos(yaw), 0, -Math.sin(yaw));
  const wrapAngle = (a) => Math.atan2(Math.sin(a), Math.cos(a));
  const glideRoute = () => CFG.glideMeasured * CFG.routeSafety;
  function addSamples(curve, len, onRoute = true, clearance = 0) {
    const n = Math.max(1, Math.ceil(len / 4));
    for (let i = 0; i <= n; i++) {
      const q = curve.getPointAt(i / n),
        sample = { x: q.x, y: q.y, z: q.z, page: RT.page, clearance };
      keepClear.push(sample);
      if (onRoute) {
        const last = routeSamples[routeSamples.length - 1],
          ds = Math.hypot(q.x - last.x, q.z - last.z);
        if (ds < 0.001) continue;
        routeLength += ds;
        sample.s = routeLength;
        routeSamples.push(sample);
      }
    }
  }
  function protectPath(pts, clearance = 0) {
    const curve = new THREE.CatmullRomCurve3(pts);
    addSamples(curve, curve.getLength(), false, clearance);
  }
  function seg(len, turnFn = () => 0, drop = len / glideRoute()) {
    const n = Math.max(3, Math.ceil(len / 6)),
      pts = [RT.pos.clone()];
    for (let i = 1; i <= n; i++) {
      RT.yaw += turnFn(i / n) / n;
      RT.pos.addScaledVector(dirOf(RT.yaw), len / n);
      RT.pos.y -= drop / n;
      pts.push(RT.pos.clone());
    }
    const c = new THREE.CatmullRomCurve3(pts);
    addSamples(c, len);
    return c;
  }
  function curveThrough(pts, onRoute = true) {
    const c = new THREE.CatmullRomCurve3(pts);
    addSamples(c, c.getLength(), onRoute);
    return c;
  }
  function ringType() {
    if (RT.page === 1) return "pen";
    return pick(
      RT.page === 2
        ? ["pen", "pen", "red"]
        : ["pen", "red", "compass", "dotted"],
    );
  }
  const bigR = () => (RT.page === 1 ? 8 : 0);
  function routeIndex(s) {
    let lo = 0,
      hi = routeSamples.length - 1;
    while (lo + 1 < hi) {
      const mid = (lo + hi) >> 1;
      if (routeSamples[mid].s <= s) lo = mid;
      else hi = mid;
    }
    return lo;
  }
  function routePoint(s) {
    s = clamp(s, 0, routeLength);
    const i = routeIndex(s),
      a = routeSamples[i],
      b = routeSamples[Math.min(i + 1, routeSamples.length - 1)];
    const t = clamp((s - a.s) / Math.max(0.001, b.s - a.s), 0, 1);
    return V3(
      a.x + (b.x - a.x) * t,
      a.y + (b.y - a.y) * t,
      a.z + (b.z - a.z) * t,
    );
  }
  const routeY = (s) => routePoint(s).y;
  function projectRoute(pos, indexes) {
    let result = {
      s: routeSamples[progressIndex].s,
      index: progressIndex,
      d2: Infinity,
    };
    for (const i of indexes) {
      if (i < 0 || i >= routeSamples.length - 1) continue;
      const a = routeSamples[i],
        b = routeSamples[i + 1],
        dx = b.x - a.x,
        dz = b.z - a.z;
      const t = clamp(
        ((pos.x - a.x) * dx + (pos.z - a.z) * dz) /
          Math.max(0.001, dx * dx + dz * dz),
        0,
        1,
      );
      const d2 = (a.x + t * dx - pos.x) ** 2 + (a.z + t * dz - pos.z) ** 2;
      // At a spiral crossing prefer the matching height, without pulling a low player
      // forward along the route merely because a later point is closer vertically.
      const metric = d2 + 0.01 * (a.y + t * (b.y - a.y) - pos.y) ** 2;
      if (metric < result.d2)
        result = { s: a.s + t * (b.s - a.s), index: i, d2: metric };
    }
    return result;
  }
  function locateOnRoute(pos) {
    return projectRoute(
      pos,
      routeSamples.map((_, i) => i),
    );
  }
  function buildRouteGrid() {
    routeGrid.clear();
    routeSamples.forEach((s, i) => {
      const key = `${Math.floor(s.x / 80)},${Math.floor(s.z / 80)}`;
      if (!routeGrid.has(key)) routeGrid.set(key, []);
      routeGrid.get(key).push(i);
    });
  }
  function routeProgress(pos) {
    const indexes = [];
    for (
      let i = Math.max(0, progressIndex - 24);
      i <= Math.min(routeSamples.length - 2, progressIndex + 24);
      i++
    )
      indexes.push(i);
    let hit = projectRoute(pos, indexes);
    if (hit.d2 > 60 ** 2) {
      const gx = Math.floor(pos.x / 80),
        gz = Math.floor(pos.z / 80),
        candidates = [];
      for (let x = gx - 1; x <= gx + 1; x++)
        for (let z = gz - 1; z <= gz + 1; z++)
          candidates.push(...(routeGrid.get(`${x},${z}`) || []));
      const nearby = projectRoute(pos, candidates);
      if (nearby.d2 < hit.d2) hit = nearby;
    }
    progressIndex = hit.index;
    return hit.s;
  }
  function isFinalApproach() {
    return (
      p.routeS >= Math.max(landingStartS, routeLength - 65) &&
      p.pos.y < 45 &&
      Math.hypot(p.pos.x - landing.x, p.pos.z - landing.z) < 70
    );
  }
  function runPattern(fn) {
    const pattern = {
      id: patterns.length,
      name: fn.name,
      page: RT.page,
      entry: { pos: RT.pos.clone(), s: routeLength },
      exit: null,
      stars: [],
      rings: [],
    };
    patterns.push(pattern);
    RT.pattern = pattern;
    if (fn !== pLanding)
      makeRing("binder", RT.pos.clone(), dirOf(RT.yaw), newSeq(1));
    fn();
    pattern.exit = { pos: RT.pos.clone(), s: routeLength };
    RT.pattern = null;
    return pattern;
  }

  function pTrail() {
    const len = 44 + rnd() * 10,
      turn = (rnd() - 0.5) * 0.9,
      c = seg(len, () => turn),
      n = 4;
    for (let i = 0; i < n; i++)
      makeStar(
        i === n - 1 ? "color" : "graphite",
        c.getPointAt(0.08 + (0.84 * i) / (n - 1)),
      );
  }
  function pCorridor() {
    const n = 2,
      amp = (0.16 + rnd() * 0.12) * (rnd() < 0.5 ? 1 : -1);
    const c = seg(n * 30, (t) => (t < 0.25 || t >= 0.75 ? 4 : -4) * amp),
      sq = newSeq(n);
    for (let i = 0; i < n; i++) {
      const t = (i + 0.5) / n;
      makeRing(ringType(), c.getPointAt(t), c.getTangentAt(t), sq, bigR());
      if (i < n - 1) makeStar("graphite", c.getPointAt(t + 0.5 / n));
    }
  }
  // Rajada na rota: sobe um pouco e termina num checkpoint
  function pGust() {
    const G = CFG.gust,
      a = RT.pos.clone(),
      e = a.clone().addScaledVector(dirOf(RT.yaw), G.len);
    e.y += G.rise;
    const d = e.clone().sub(a).normalize();
    const routeWind = addGust(a.clone().addScaledVector(d, -8), d, G.len + 16);
    routeWind.routeFromS = routeLength;
    routeWind.routeToS = routeLength + G.len;
    const c = curveThrough([a, e]);
    for (let i = 1; i <= 3; i++)
      makeStar(i === 3 ? "color" : "graphite", c.getPointAt(i / 3.5));
    RT.pos.copy(e);
    const out = seg(18);
    makeRing("binder", out.getPointAt(0.5), out.getTangentAt(0.5), newSeq(1));
  }
  function pSpiral() {
    seg(20);
    const s = rnd() < 0.5 ? 1 : -1,
      rad = 9,
      center = RT.pos.clone().addScaledVector(rightOf(RT.yaw), s * rad);
    const drop = (2 * Math.PI * rad) / 1.5;
    addPencil(center.x, center.z, 2.4, RT.pos.y + 12);
    const a0 = Math.atan2(RT.pos.z - center.z, RT.pos.x - center.x),
      pts = [];
    for (let i = 0; i <= 30; i++) {
      const f = i / 30,
        a = a0 + s * f * Math.PI * 2;
      pts.push(
        V3(
          center.x + Math.cos(a) * rad,
          RT.pos.y - f * drop,
          center.z + Math.sin(a) * rad,
        ),
      );
    }
    const c = curveThrough(pts);
    for (let i = 1; i <= 8; i++)
      makeStar(i === 8 ? "color" : "graphite", c.getPointAt(i / 8));
    RT.pos.copy(pts[pts.length - 1]);
  }
  function pDive() {
    const d = dirOf(RT.yaw),
      o = RT.pos.clone();
    const pts = [
      [0, 0],
      [14, -4],
      [30, -20],
      [46, -34],
      [66, -40],
    ].map(([f, y]) =>
      o
        .clone()
        .addScaledVector(d, f)
        .add(V3(0, y, 0)),
    );
    const c = curveThrough(pts),
      sq = newSeq(4);
    for (const t of [0.22, 0.45, 0.68, 0.95])
      makeRing(
        pick(["pen", "red"]),
        c.getPointAt(t),
        c.getTangentAt(t),
        sq,
        bigR(),
      );
    RT.pos.copy(pts[pts.length - 1]);
  }
  function pRisk() {
    const c = seg(50),
      m = c.getPointAt(0.5),
      right = rightOf(RT.yaw);
    for (const s of [-1, 1]) {
      const q = m.clone().addScaledVector(right, s * 5.4);
      addPencil(q.x, q.z, 2, m.y + 25);
    }
    makeStar("highlighter", m);
    for (const t of [0.2, 0.8]) makeStar("graphite", c.getPointAt(t));
  }
  function pTurb() {
    const turn = (rnd() - 0.5) * 0.4,
      c = seg(70, () => turn);
    addTurb(c.getPointAt(0.5), CFG.turb.r);
    for (const t of [0.42, 0.5, 0.58]) makeStar("color", c.getPointAt(t));
    for (const t of [0.15, 0.85]) makeStar("graphite", c.getPointAt(t));
  }
  const landing = V3();
  function pLanding() {
    RT.page = 3;
    landingStartS = routeLength;
    const h = RT.pos.y - 1.5,
      len = h * glideRoute(),
      c = seg(len, () => 0, h),
      n = Math.max(3, Math.ceil(len / 28));
    for (let i = 1; i < n; i++)
      makeStar(
        i === n - 1 ? "color" : "graphite",
        c.getPointAt((i / n) * 0.95),
      );
    const sq = newSeq(2);
    for (const t of [0.35, 0.7])
      makeRing("pen", c.getPointAt(t), c.getTangentAt(t), sq);
    landing.set(RT.pos.x, 0, RT.pos.z);
  }
  function buildRoute(safeMode = false) {
    seg(24);
    const order = [pTrail, pGust, pCorridor, pGust, pTrail];
    for (let i = 0; i < order.length && RT.pos.y > 44; i++) {
      RT.page = i < 2 ? 1 : i < 4 ? 2 : 3;
      runPattern(safeMode ? pTrail : order[i]);
      const [a, b] = CFG.spacing,
        length = a + rnd() * (b - a);
      seg(length, () => (rnd() - 0.5) * 0.2);
    }
    runPattern(pLanding);
  }

  function clearOfRoute(x, y, z, minD) {
    const m2 = minD * minD;
    for (const s of keepClear) {
      const dx = s.x - x,
        dz = s.z - z,
        safeM2 = Math.max(minD, s.clearance || 0) ** 2;
      if (y === null) {
        if (dx * dx + dz * dz < safeM2) return false;
      } else {
        const dy = s.y - y;
        if (dx * dx + dy * dy + dz * dz < safeM2) return false;
      }
    }
    return true;
  }
  const windFar = (x, z, minD) =>
    winds.every((w) => Math.hypot(w.x - x, w.z - z) > minD);
  function routeFrame(i) {
    const s = routeSamples[i],
      n = routeSamples[Math.min(i + 3, routeSamples.length - 1)];
    const f = V3(n.x - s.x, 0, n.z - s.z).normalize();
    return { s, f, side: V3(-f.z, 0, f.x) };
  }
  function scatterSecrets() {
    let tries = 0;
    while (secrets.length < CFG.secrets && tries++ < 1000) {
      const sourceIndex =
        25 + Math.floor(rnd() * Math.max(1, routeSamples.length - 65));
      const { s, f, side } = routeFrame(sourceIndex);
      if (f.lengthSq() < 0.5) continue;
      const next = patterns.find((pattern) => pattern.entry.s > s.s + 55);
      if (!next) continue;
      const out = side.multiplyScalar(rnd() < 0.5 ? 1 : -1);
      const a = V3(s.x, s.y - 3, s.z).addScaledVector(out, 25);
      const d = out
        .clone()
        .multiplyScalar(0.8)
        .addScaledVector(f, 0.6)
        .normalize();
      const prize = a.clone().addScaledVector(d, 75);
      prize.y = a.y + 5;
      if (
        !clearOfRoute(prize.x, prize.y, prize.z, 35) ||
        !windFar(prize.x, prize.z, 45)
      )
        continue;
      const secret = {
        id: `secret-${secrets.length}`,
        page: s.page,
        sourceS: s.s,
        a,
        prize,
        target: next.entry,
        items: [],
      };
      secrets.push(secret);
      // The outbound funnel is blue, like a hidden gust. It supports low explorers too.
      secret.outbound = addRecoveryGust(a, prize, {
        type: "gust",
        role: "secret-out",
        routeS: s.s,
        r: 10,
      });
      protectPath([a, prize], 22);
      for (let k = 0; k < 5; k++) {
        const ang = (k / 5) * Math.PI * 2,
          item = makeStar(
            "color",
            prize.clone().add(V3(Math.cos(ang) * 4, 0, Math.sin(ang) * 4)),
          );
        item.secretId = secret.id;
        item.page = s.page;
        secret.items.push(item);
      }
      const marker = makeStar("highlighter", prize);
      marker.secretId = secret.id;
      marker.page = s.page;
      secret.items.push(marker);
      if (CFG.secretReturn) {
        // Enter it slightly beyond the prize; it never sweeps the player away before
        // they have had a chance to circle around the five reward stars.
        const ret = prize.clone().addScaledVector(d, 16);
        secret.returnWind = addRecoveryGust(ret, next.entry.pos, {
          type: "gust",
          role: "secret-return",
          routeS: next.entry.s,
          bottom: 2.5,
          r: 11,
        });
        secret.returnWind.allowHighEntry = true;
        secret.returnWind.entryY = prize.y;
        protectPath([prize, ret, next.entry.pos], 22);
      }
    }
  }

  // Rajadas soltas pelo mapa: para encadear e ir mais longe
  function scatterFreeGusts() {
    let placed = 0,
      tries = 0;
    while (placed < CFG.freeGusts && tries++ < 400) {
      const s = routeSamples[Math.floor(rnd() * routeSamples.length)];
      const ang = rnd() * 6.283,
        dist = 80 + rnd() * 140,
        len = 90;
      const a = V3(
        s.x + Math.cos(ang) * dist,
        clamp(s.y + (rnd() - 0.4) * 50, 30, CFG.startAlt),
        s.z + Math.sin(ang) * dist,
      );
      const d = dirOf(rnd() * 6.283)
        .add(V3(0, 0.12, 0))
        .normalize();
      const mid = a.clone().addScaledVector(d, len / 2),
        e = a.clone().addScaledVector(d, len);
      if (
        !clearOfRoute(mid.x, mid.y, mid.z, 35) ||
        !clearOfRoute(a.x, a.y, a.z, 25) ||
        !clearOfRoute(e.x, e.y, e.z, 25) ||
        !windFar(mid.x, mid.z, 70)
      )
        continue;
      const w = addGust(a, d, len);
      w.role = "free";
      w.routeFromS = locateOnRoute(a).s;
      w.routeToS = w.routeFromS + len;
      const c = curveThrough([a, e], false);
      for (let k = 1; k <= 4; k++) makeStar("graphite", c.getPointAt(k / 5));
      placed++;
    }
  }
  function scatterHazards() {
    const T = CFG.turb,
      D = CFG.downdraft;
    let nt = 0,
      nd = 0,
      tries = 0;
    while ((nt < T.count || nd < D.count) && tries++ < 600) {
      const s =
        routeSamples[40 + Math.floor(rnd() * (routeSamples.length - 60))];
      const a = rnd() * 6.28,
        dist = 40 + rnd() * 40,
        x = s.x + Math.cos(a) * dist,
        z = s.z + Math.sin(a) * dist;
      if (!windFar(x, z, 60)) continue;
      const turb = nt < T.count && (nd >= D.count || rnd() < 0.5);
      if (turb) {
        const y = s.y + (rnd() - 0.5) * 10;
        if (!clearOfRoute(x, y, z, T.r + 18)) continue;
        addTurb(V3(x, y, z), T.r);
        nt++;
      } else {
        if (!clearOfRoute(x, null, z, D.r + 18)) continue;
        addColumn(x, z, s.y + 40, D.r, D.strength);
        nd++;
      }
    }
  }

  function protectFreeGusts() {
    for (const w of winds.filter((w) => w.role === "free")) {
      w.entryRecovery = addRecoveryGust(
        w.a,
        w.a.clone().addScaledVector(w.d, 2),
        { routeS: w.routeFromS },
      );
    }
  }
  function addLinkRecovery(link, existing) {
    const median = CFG.glideMeasured * 0.6,
      ds = Math.max(0, link.to.s - link.from.s);
    const reachBeforeGround = Math.max(
      0,
      (link.from.pos.y - CFG.recovery.bottom - 5) * median,
    );
    const offsetS = Math.min(Math.max(0, ds - 20), reachBeforeGround);
    const along = link.from.s + offsetS,
      center = routePoint(along);
    const frame = routeFrame(routeIndex(along));
    center.addScaledVector(frame.side, CFG.recovery.offset);
    if (existing) return existing;
    const deficit = Math.max(
      0,
      link.to.pos.y - (link.from.pos.y - ds / median),
    );
    const lift = Math.max(
      CFG.recovery.lift,
      (deficit + CFG.recovery.safety) / 8,
    );
    return addRecoveryGust(center, link.to.pos, { routeS: link.to.s, lift });
  }
  function validateReachability(repair = true) {
    const report = { ok: true, links: [], inserted: 0, unreachable: [] },
      median = CFG.glideMeasured * 0.6;
    const links = patterns.map((b, i) => ({
      label: `${i ? i - 1 : "largada"}→${i}`,
      from: i ? patterns[i - 1].exit : { pos: V3(0, CFG.startAlt, 0), s: 0 },
      to: b.entry,
      pattern: b,
    }));
    for (const secret of secrets)
      if (CFG.secretReturn)
        links.push({
          label: `${secret.id}→rota`,
          from: { pos: secret.prize, s: secret.sourceS },
          to: secret.target,
          secret,
        });
    for (const link of links) {
      const distance = link.secret
        ? link.from.pos.distanceTo(link.to.pos)
        : Math.max(0, link.to.s - link.from.s);
      let arrival = link.from.pos.y - distance / median;
      for (const w of winds)
        if (
          !w.guided &&
          w.type === "gust" &&
          w.routeFromS >= link.from.s &&
          w.routeToS <= link.to.s
        )
          arrival +=
            (Math.max(0, w.lift - CFG.maxSink) * w.len) / CFG.startSpeed;
      const deficit = Math.max(0, link.to.pos.y - arrival),
        margin = CFG.recovery.margin;
      let recovery = link.secret
        ? link.secret.returnWind
        : link.pattern.recovery;
      if (deficit > 0 && !recovery && repair) {
        recovery = addLinkRecovery(link);
        link.pattern.recovery = recovery;
        report.inserted++;
      }
      if (recovery) {
        // A captured plane dwells in the column until the exit is reached. Both the
        // inlet's floor and its horizontal accessibility are checked, not just lift*length.
        const anchorS = locateOnRoute(recovery.a).s;
        const atInlet = link.secret
          ? link.from.pos.y
          : link.from.pos.y - Math.max(0, anchorS - link.from.s) / median;
        const inletPoint = link.secret ? link.from.pos : routePoint(anchorS);
        const accessible = link.secret
          ? !!recovery.allowHighEntry
          : Math.hypot(inletPoint.x - recovery.x, inletPoint.z - recovery.z) <
            recovery.r;
        const floorOK = atInlet >= recovery.bottom;
        const exitOK =
          recovery.exit.distanceTo(link.to.pos) < 0.1 &&
          recovery.targetY >= link.to.pos.y + margin - 0.01;
        if (accessible && floorOK && exitOK) arrival = link.to.pos.y + margin;
      }
      const ok = arrival + 0.01 >= link.to.pos.y;
      report.links.push({
        label: link.label,
        deficit,
        arrival,
        ok,
        recovery: !!recovery,
      });
      if (!ok) report.unreachable.push(link.label);
      if (debug.enabled && deficit > 0)
        console.info(
          `trecho ${link.label}: déficit ${deficit.toFixed(1)}m, ${recovery ? "rajada inserida" : "sem alcance"}`,
        );
    }
    // Each item must lie under the free-glide envelope including reachable gusts.
    // Repair locally at its pattern/branch entrance rather than lowering just the visual.
    for (const item of [...stars, ...rings]) {
      if (item.secretId) continue; // The outbound guided path ends at the six rewards.
      const hit = locateOnRoute(item.base || item.pos),
        pattern = patterns[item.patternId];
      const source = pattern
        ? pattern.entry
        : { pos: routePoint(hit.s), s: hit.s };
      let reachableY =
        source.pos.y - Math.max(0, hit.s - source.s) / CFG.glideMeasured;
      for (const w of winds)
        if (
          !w.guided &&
          w.type === "gust" &&
          w.routeFromS >= source.s &&
          w.routeFromS <= hit.s
        )
          reachableY +=
            (Math.max(0, w.lift - CFG.maxSink) *
              Math.min(w.len, hit.s - w.routeFromS)) /
            CFG.startSpeed;
      if ((item.base || item.pos).y > reachableY + 0.5) {
        const anchor = (item.base || item.pos).clone();
        if (repair && !item.recovery)
          item.recovery = addRecoveryGust(anchor, anchor, { routeS: hit.s });
        if (!item.recovery) report.unreachable.push(item.id);
      }
    }
    report.ok = report.unreachable.length === 0;
    validation = report;
    return report;
  }
  function finalizeItems() {
    const ordered = rings
      .map((r) => ({ r, s: locateOnRoute(r.pos).s }))
      .sort((a, b) => a.s - b.s);
    for (const item of [...stars, ...rings]) {
      item.routeS = item.secretId
        ? secrets.find((secret) => secret.id === item.secretId).sourceS
        : locateOnRoute(item.base || item.pos).s;
      let checkpoint = "launch";
      for (const { r, s } of ordered) {
        if (s >= item.routeS - 0.5) break;
        checkpoint = r.id;
      }
      item.checkpointId = checkpoint;
    }
  }
  function generatePlayableMap() {
    const sceneBase = new Set(scene.children);
    for (let attempt = 0; attempt < 8; attempt++) {
      if (attempt) {
        for (const child of [...scene.children])
          if (!sceneBase.has(child)) scene.remove(child);
        stars.length =
          rings.length =
          seqs.length =
          winds.length =
          patterns.length =
          secrets.length =
          pencils.length =
            0;
        routeSamples.splice(1);
        keepClear.splice(0, keepClear.length, routeSamples[0]);
        routeLength = progressIndex = 0;
        RT.pos.set(0, CFG.startAlt - 4, -16);
        RT.yaw = 0;
        RT.page = 1;
      }
      buildRoute(attempt >= 6);
      buildRouteGrid();
      patterns.forEach((pattern, i) => {
        if (i % Math.max(1, CFG.recovery.every) === 0)
          pattern.recovery = addLinkRecovery({
            from: i
              ? patterns[i - 1].exit
              : { pos: V3(0, CFG.startAlt, 0), s: 0 },
            to: pattern.entry,
          });
      });
      scatterSecrets();
      scatterFreeGusts();
      protectFreeGusts();
      finalizeItems();
      if (validateReachability().ok) return;
    }
    throw new Error(
      "Não foi possível gerar uma rota alcançável. Recarregue o jogo.",
    );
  }

  generatePlayableMap();
  scatterHazards();
  scatterScenery();

  const landingMesh = new THREE.Mesh(
    new THREE.PlaneGeometry(72, 72),
    new THREE.MeshBasicMaterial({
      map: landingTexture(),
      transparent: true,
      depthWrite: false,
      polygonOffset: true,
      polygonOffsetFactor: -1,
    }),
  );
  landingMesh.rotation.x = -Math.PI / 2;
  landingMesh.position.set(landing.x, 0.04, landing.z);
  scene.add(landingMesh);

  // ================== ESTADO / PONTUAÇÃO / COMBO ==================
  const p = {};
  let state = "ready",
    score = 0,
    cp = null,
    lastLanded = false,
    endTime = 0,
    curPage = 1;
  let best = +localStorage.getItem("rabisco_best_pts") || 0;
  let bestDist = +localStorage.getItem("rabisco_best_dist") || 0;
  const collected = new Set(),
    checkpointStore = new Map();
  let bestPct = +localStorage.getItem("rabisco_best_pct") || 0;
  function completionStats() {
    const starCount = stars.filter((s) => collected.has(s.id)).length,
      ringCount = rings.filter((r) => collected.has(r.id)).length;
    const secretCount = secrets.filter((secret) =>
      secret.items.every((item) => collected.has(item.id)),
    ).length;
    const total = stars.length + rings.length,
      done = starCount + ringCount;
    return {
      starCount,
      ringCount,
      secretCount,
      total,
      done,
      pct: total ? Math.floor((done * 100) / total) : 100,
    };
  }
  function saveCompletion() {
    const stats = completionStats();
    if (stats.pct > bestPct) {
      bestPct = stats.pct;
      localStorage.setItem("rabisco_best_pct", String(bestPct));
    }
    if (stats.done === stats.total && !p.completeAnnounced) {
      p.completeAnnounced = true;
      flash("100%! caderno completo");
    }
  }
  function saveCheckpoint(R) {
    const snapshot = {
      id: R.id,
      pos: R.pos.clone().addScaledVector(R.normal, 3),
      yaw: p.yaw,
      pitch: p.pitch,
      speed: Math.max(p.speed, CFG.startSpeed),
      boosts: p.boosts,
      dist: p.dist,
      s: R.routeS,
      page: R.page,
    };
    checkpointStore.set(R.id, snapshot);
    cp = snapshot;
  }
  function checkpointForItem(item) {
    if (checkpointStore.has(item.checkpointId)) return item.checkpointId;
    let candidate = checkpointStore.get("launch");
    for (const snapshot of checkpointStore.values())
      if (snapshot.s < item.routeS && snapshot.s > candidate.s)
        candidate = snapshot;
    return candidate.id;
  }
  function loadCheckpoint(id = cp?.id || "launch", cost = true) {
    const snapshot = checkpointStore.get(id);
    if (!snapshot) return;
    clearRescues();
    Object.assign(p, {
      pos: snapshot.pos.clone(),
      yaw: snapshot.yaw,
      pitch: CFG.pitchRest,
      roll: 0,
      speed: snapshot.speed,
      stall: 0,
      boosts: snapshot.boosts,
      dist: snapshot.dist,
      windUp: 0,
      turb: 0,
      boostTimer: 0,
      activeWind: null,
      lastWind: null,
      routeS: snapshot.s,
      rescueAt: -Infinity,
      deficit: 0,
    });
    progressIndex = routeIndex(snapshot.s);
    cp = snapshot;
    curPage = snapshot.page;
    if (cost) score = Math.max(0, score - CFG.checkpointCost);
    for (const s of stars) {
      if (collected.has(s.id)) {
        s.state = "gone";
        s.g.visible = false;
      } else if (s.routeS >= snapshot.s - 10) resetStar(s);
    }
    for (const r of rings) {
      if (collected.has(r.id)) {
        r.state = "gone";
        r.g.visible = false;
      } else if (r.routeS >= snapshot.s - 10) resetRing(r);
    }
    for (const sequence of seqs) {
      sequence.passed = rings.filter(
        (r) => r.seq === sequence && collected.has(r.id),
      ).length;
      sequence.failed = rings.some(
        (r) => r.seq === sequence && r.state === "fail",
      );
    }
    comboBreak();
    starStreak = 0;
    lastStarT = -9;
    lastZone = "";
    zoneT = -9;
    trailPts = [];
    updateTrail();
    plane.visible = true;
    crumple.visible = false;
    state = "ready";
    keysClear();
    showMsg(
      `<h1>Checkpoint!</h1>suas estrelas continuam com você<br><small>toque ou aperte uma tecla para continuar</small>`,
    );
    camera.position.copy(p.pos).add(V3(0, 2.2, 7).applyAxisAngle(UP, p.yaw));
    debug.stable = 0;
    debug.origin = null;
  }

  const fwd = V3(),
    eul = new THREE.Euler(),
    UP = V3(0, 1, 0);
  const combo = { mult: 1, timer: 0 };
  const comboEl = document.getElementById("combo");
  let starStreak = 0,
    lastStarT = -9;

  function updateComboUI(pop) {
    comboEl.textContent = `x${combo.mult}!`;
    comboEl.classList.toggle("on", combo.mult > 1);
    if (pop) {
      comboEl.classList.remove("pop");
      void comboEl.offsetWidth;
      comboEl.classList.add("pop");
    }
  }
  function comboUp() {
    combo.mult = Math.min(5, combo.mult + 1);
    combo.timer = CFG.comboTime;
    updateComboUI(true);
  }
  function comboBreak(msg) {
    if (combo.mult > 1 && msg) flash(msg);
    combo.mult = 1;
    combo.timer = 0;
    updateComboUI();
  }

  function collectStar(s) {
    if (collected.has(s.id)) return;
    collected.add(s.id);
    saveCompletion();
    s.state = "dying";
    s.t = 0;
    s.scribble = makeLines([zigzag()], scribbleMat);
    s.scribble.geometry.instanceCount = 1;
    s.g.add(s.scribble);
    starStreak = simTime - lastStarT < 1.6 ? starStreak + 1 : 0;
    lastStarT = simTime;
    const pts = s.T.pts * combo.mult;
    score += pts;
    if (completionStats().starCount % 10 === 0)
      flash("10 estrelas! belo voo ★");
    if (combo.mult > 1) combo.timer = CFG.comboTime;
    if (s.T.boost) {
      p.boosts = Math.min(CFG.maxBoosts, p.boosts + 1);
      floatText(`+${pts} · +1 sopro`, s.pos, "#b08a00", true);
    } else
      floatText(`+${pts}`, s.pos, s.type === "graphite" ? "#333" : "#c0392b");
    burst(s.pos, s.type === "graphite" ? 3 : 5);
    tone(620 + Math.min(starStreak, 8) * 65, 0.12, "sine", 0.065);
  }
  function passRing(R, bull) {
    saveCheckpoint(R);
    if (collected.has(R.id)) return;
    collected.add(R.id);
    saveCompletion();
    R.state = "pass";
    R.t = 0;
    let pts = R.T.pts * combo.mult;
    if (bull) pts += 25 * combo.mult;
    score += pts;
    floatText(bull ? `NA MOSCA! +${pts}` : `+${pts}`, R.pos, "#c0392b", bull);
    addMark(R, checkPolys(R.baseR * 0.7));
    ringDisc(R);
    sfxDing(combo.mult);
    comboUp();
    if (R.T.boost) {
      p.speed += R.T.boost;
      p.stall = 0;
      flash("→ impulso!");
    }
    if (R.T.checkpoint) flash("checkpoint ✎");

    const sq = R.seq;
    sq.passed = rings.filter((r) => r.seq === sq && collected.has(r.id)).length;
    sq.failed = rings.some((r) => r.seq === sq && r.state === "fail");
    if (sq.total > 1 && sq.passed === sq.total && !sq.failed && !sq.awarded) {
      sq.awarded = true;
      const b = 100 * combo.mult;
      score += b;
      flash("sequência perfeita!");
      floatText(`+${b}`, p.pos, "#c0392b", true);
    }
  }
  function failRing(R, label, scrape) {
    R.state = "fail";
    if (R.mat) {
      R.mat.color.set("#9a9a9a");
      R.mat.opacity = 0.55;
    }
    addMark(R, xPolys(R.r * 0.6));
    R.seq.failed = true;
    floatText(label, R.pos, "#777");
    comboBreak("combo perdido");
    sfxBuzz();
    if (scrape) {
      p.roll += (rnd() < 0.5 ? -1 : 1) * 0.6;
      p.speed *= 0.85;
    }
  }
  function checkRing(R, a, b) {
    const d0 = _v.subVectors(a, R.pos).dot(R.normal),
      d1 = _v.subVectors(b, R.pos).dot(R.normal);
    if (!(d0 <= 0 && d1 > 0)) return; // só cruzando para frente
    const hit = _h.lerpVectors(a, b, d0 / (d0 - d1)),
      r = hit.distanceTo(R.pos);
    if (r < R.r * 0.3) passRing(R, true);
    else if (r < R.r - 0.4) passRing(R, false);
    else if (r < R.r + 0.5) failRing(R, "raspou!", true);
    else if (r < R.r * 3) failRing(R, "errou!", false);
  }

  function reset() {
    clearRescues();
    collected.clear();
    checkpointStore.clear();
    progressIndex = 0;
    Object.assign(p, {
      pos: V3(0, CFG.startAlt, 0),
      yaw: 0,
      pitch: -0.1,
      roll: 0,
      speed: CFG.startSpeed,
      stall: 0,
      boosts: CFG.boosts,
      dist: 0,
      windUp: 0,
      turb: 0,
      routeS: 0,
      deficit: 0,
      boostTimer: 0,
      rescueAt: -Infinity,
      activeWind: null,
      lastWind: null,
      completeAnnounced: false,
    });
    stars.forEach(resetStar);
    rings.forEach(resetRing);
    seqs.forEach((s) => {
      s.passed = 0;
      s.failed = false;
      s.awarded = false;
    });
    score = 0;
    curPage = 1;
    comboBreak();
    starStreak = 0;
    lastStarT = -9;
    lastZone = "";
    zoneT = -9;
    cp = {
      id: "launch",
      pos: p.pos.clone(),
      yaw: 0,
      pitch: -0.1,
      speed: CFG.startSpeed,
      boosts: CFG.boosts,
      dist: 0,
      s: 0,
      page: 1,
    };
    checkpointStore.set("launch", cp);
    trailPts = [];
    updateTrail();
    plane.visible = true;
    crumple.visible = false;
    state = "ready";
    keysClear();
    debug.stable = 0;
    debug.origin = null;
    showMsg(
      `<h1>Rabisco<br>Planador</h1><p class="welcome-sub">um passeio pelo jardim de papel</p>` +
        '<div class="welcome-icons"><span><b>↔</b>explore</span><span><b>★</b>colecione</span><span><b>♧</b>descubra</span></div>' +
        '<button class="play-button" data-start>Vamos voar!</button>' +
        `<small>${matchMedia("(pointer: coarse)").matches ? "arraste para voar · toque duplo: sopro<br>segure para voltar ao checkpoint" : "← → virar · ↑ ↓ altura · espaço: sopro"}<br>recorde: ${best} pts · ${bestDist} m · ${bestPct}%</small>`,
    );
    camera.position.set(0, CFG.startAlt + 5, 12);
  }
  function respawn() {
    loadCheckpoint(cp?.id || "launch", false);
  }

  // ================== INPUT ==================
  const keys = {},
    input = { pitch: 0, roll: 0 };
  const touch = {
    active: false,
    x0: 0,
    y0: 0,
    dx: 0,
    dy: 0,
    lastTap: 0,
    longTimer: null,
  };
  function keysClear() {
    for (const key in keys) delete keys[key];
    input.pitch = input.roll = 0;
    clearTimeout(touch.longTimer);
    touch.active = false;
    touch.dx = touch.dy = 0;
  }
  function afterEnd() {
    if (performance.now() - endTime < 600) return;
    respawn();
  }
  addEventListener("keydown", (e) => {
    if (e.code === "KeyH") {
      if (!e.repeat) toggleHelp();
      return;
    }
    if (e.code === "F3") {
      e.preventDefault();
      if (!e.repeat) toggleDebug();
      return;
    }
    initAudio();
    if (e.code === "KeyC") {
      e.preventDefault();
      if (!e.repeat) loadCheckpoint();
      return;
    }
    if (e.code === "KeyQ") {
      if (!e.repeat) setQuality(!highQuality);
      return;
    }
    if (e.code === "KeyM") {
      if (!e.repeat) toggleMute();
      return;
    }
    if (e.code === "KeyR") {
      if (!e.repeat) reset();
      return;
    }
    keys[e.code] = true;
    if (e.repeat && state !== "play") return;
    if (state === "ready") start();
    else if (state === "end") return afterEnd();
    if (e.code === "Space") {
      e.preventDefault();
      if (!e.repeat) boost();
    }
  });
  addEventListener("keyup", (e) => {
    keys[e.code] = false;
  });
  addEventListener("blur", keysClear);
  addEventListener("pointerdown", (e) => {
    if (e.target.closest("button")) return;
    initAudio();
    const wasEnd = state === "end";
    if (state === "ready") start();
    const now = performance.now();
    if (!wasEnd && now - touch.lastTap < 280) boost();
    touch.lastTap = now;
    Object.assign(touch, {
      active: true,
      x0: e.clientX,
      y0: e.clientY,
      dx: 0,
      dy: 0,
      wasEnd,
    });
    clearTimeout(touch.longTimer);
    touch.longTimer = setTimeout(() => {
      if (touch.active && Math.hypot(touch.dx, touch.dy) < 0.15) {
        loadCheckpoint();
        touch.lastTap = 0;
      }
    }, CFG.longPressMs);
  });
  addEventListener("pointermove", (e) => {
    if (!touch.active) return;
    touch.dx = clamp((e.clientX - touch.x0) / 80, -1, 1);
    touch.dy = clamp((e.clientY - touch.y0) / 80, -1, 1);
    if (Math.hypot(touch.dx, touch.dy) > 0.15) clearTimeout(touch.longTimer);
  });
  function releaseTouch() {
    const resume = touch.active && touch.wasEnd;
    clearTimeout(touch.longTimer);
    touch.active = false;
    touch.dx = touch.dy = 0;
    if (resume && state === "end") afterEnd();
  }
  addEventListener("pointerup", releaseTouch);
  addEventListener("pointercancel", () => {
    clearTimeout(touch.longTimer);
    touch.active = false;
    touch.dx = touch.dy = 0;
  });
  document.getElementById("msg").addEventListener("pointerdown", (e) => {
    if (e.target.closest("button")) e.stopPropagation();
  });
  document.getElementById("msg").addEventListener("click", (e) => {
    if (e.target.closest("[data-start]")) {
      e.stopPropagation();
      initAudio();
      start();
      return;
    }
    if (e.target.closest("[data-restart]")) {
      e.stopPropagation();
      reset();
      initAudio();
      start();
      return;
    }
    const button = e.target.closest("[data-checkpoint]");
    if (!button) return;
    e.stopPropagation();
    loadCheckpoint(button.dataset.checkpoint);
  });
  function readInput() {
    let pitch =
      (keys.KeyS || keys.ArrowDown ? 1 : 0) -
      (keys.KeyW || keys.ArrowUp ? 1 : 0);
    let roll =
      (keys.KeyA || keys.ArrowLeft ? 1 : 0) -
      (keys.KeyD || keys.ArrowRight ? 1 : 0);
    if (touch.active) {
      pitch = touch.dy;
      roll = -touch.dx;
    }
    input.pitch = pitch;
    input.roll = roll;
  }
  function start() {
    state = "play";
    showMsg("");
  }
  function boost() {
    if (state !== "play" || p.boosts <= 0) return;
    p.boosts--;
    p.speed += CFG.boost;
    p.stall = 0;
    flash("fuuu!");
    sfxWhoosh();
  }

  // ================== FÍSICA (passo fixo) ==================
  let simTime = 0,
    lastZone = "",
    zoneT = -9;
  const prevPos = V3();
  const ZONE_MSG = {
    recovery: "vento amigo",
    rescue: "VENTO DE RESGATE!",
    gust: "~ rajada de vento! ~",
    down: "↓ corrente descendo!",
    turb: "turbulência!",
  };
  function step(dt) {
    simTime += dt;
    for (const b of balls) {
      b.mesh.position.y = b.base.y + Math.sin(simTime * 0.8 + b.phase) * 2;
      b.mesh.rotation.y += dt * 0.2;
    }
    if (state !== "play") return;
    prevPos.copy(p.pos);

    // vento
    let W = sampleWind(p.pos);
    p.windUp += (W.up - p.windUp) * Math.min(1, 3 * dt);
    p.turb = W.turb;
    if (W.zone && W.zone !== lastZone && simTime - zoneT > 1.5) {
      flash(ZONE_MSG[W.zone]);
      zoneT = simTime;
    }
    lastZone = W.zone;

    const ctrl = p.stall > 0 ? 0.25 : 1;
    p.pitch += input.pitch * CFG.pitchRate * ctrl * dt;
    if (input.pitch === 0) p.pitch += (CFG.pitchRest - p.pitch) * 0.8 * dt;

    if (p.turb > 0) {
      p.pitch +=
        (Math.sin(simTime * 7.3) + Math.sin(simTime * 12.7 + 1.3)) *
        p.turb *
        1.4 *
        dt;
      if (p.stall <= 0 && rnd() < p.turb * CFG.turb.jolt * dt) {
        if (p.speed < CFG.stallSpeed + 4) {
          p.stall = CFG.stallTime;
          flash("ESTOL! turbulência");
          sfxBuzz();
        } else {
          p.pitch += 0.35;
          p.speed *= 0.9;
          flash("solavanco!");
        }
      }
    }
    if (p.stall > 0) {
      p.stall -= dt;
      p.pitch += (-0.9 - p.pitch) * 3 * dt;
    } else if (p.speed < CFG.stallSpeed && p.pitch > 0.25) {
      p.stall = CFG.stallTime;
      flash("ESTOL!");
    }
    p.pitch = clamp(p.pitch, CFG.pitchMin, CFG.pitchMax);

    p.roll +=
      (input.roll * CFG.maxRoll * ctrl - p.roll) *
      Math.min(1, CFG.rollRate * dt);
    if (p.turb > 0) p.roll += Math.sin(simTime * 5.1 + 2) * p.turb * 2.5 * dt;
    p.yaw += p.roll * CFG.turnK * clamp(p.speed / 12, 0.3, 1.5) * dt;

    p.speed +=
      (-Math.sin(p.pitch) * CFG.gravity -
        CFG.drag * p.speed * p.speed -
        p.turb * 2) *
      dt;
    p.speed = Math.max(0, p.speed);
    fwd.set(0, 0, -1).applyEuler(eul.set(p.pitch, p.yaw, 0, "YXZ"));

    if (W.push > 0) p.speed += W.push * Math.max(0, fwd.dot(W.pushDir)) * dt; // rajada empurra pra frente
    checkRescue(dt);
    W = sampleWind(p.pos);
    regenBoost(dt);
    let sink = clamp(
      CFG.maxSink - p.speed * CFG.liftK * Math.cos(p.pitch),
      CFG.minSink,
      CFG.maxSink,
    );
    sink *= 1 + Math.abs(p.roll) * 0.4;
    if (p.stall > 0) sink += 4;
    sink += p.turb * 1.5;

    const bx = p.pos.x,
      bz = p.pos.z;
    if (W.guide) rideRecovery(W.guide, dt);
    else {
      p.pos.addScaledVector(fwd, p.speed * dt);
      p.pos.y += (p.windUp - sink) * dt;
    }
    p.dist += Math.hypot(p.pos.x - bx, p.pos.z - bz);
    if (
      CFG.assist.enabled &&
      !debug.enabled &&
      !W.guide &&
      !input.pitch &&
      !isFinalApproach()
    ) {
      const correction = (routeY(p.routeS + 2) - p.pos.y) * CFG.assist.strength;
      p.pos.y += clamp(correction, -CFG.assist.drop, CFG.assist.lift) * dt;
    }
    measureGlide(dt, W);

    if (combo.mult > 1 && (combo.timer -= dt) <= 0) comboBreak();

    // círculos
    for (const R of rings) {
      if (R.state !== "live" && R.state !== "drawing") continue;
      const dsq = R.pos.distanceToSquared(p.pos);
      if (R.T.shrink && dsq < 4900) {
        R.r -= ((R.baseR * 0.65) / 6) * dt;
        R.spin.scale.setScalar(R.r / R.baseR);
        if (R.r <= R.baseR * 0.35) {
          R.state = "closing";
          R.t = 0;
          R.seq.failed = true;
          floatText("fechou!", R.pos, "#555");
          continue;
        }
      }
      if (dsq < 1600) checkRing(R, prevPos, p.pos);
    }
    // estrelas (ímã + coleta)
    for (const s of stars) {
      if (s.state !== "live" && s.state !== "drawing") continue;
      const d = s.pos.distanceTo(p.pos);
      if (d < CFG.magnet) {
        s.pos.lerp(p.pos, Math.min(1, 10 * dt));
        if (d < 2.2) collectStar(s);
      }
    }
    // colisões
    for (const c of pencils)
      if (
        p.pos.y < c.top &&
        Math.hypot(p.pos.x - c.x, p.pos.z - c.z) < c.r + 0.6
      )
        return end(false, "bateu no lápis");
    for (const b of balls)
      if (p.pos.distanceTo(b.mesh.position) < b.r * 0.9 + 0.5)
        return end(false, "bateu na bola de papel");
    if (p.pos.y <= 0.3) {
      p.pos.y = 0.3;
      const ok = p.speed < CFG.safeLandSpeed && p.pitch > -0.45;
      end(ok, ok ? "pouso suave" : "chegou rápido demais");
    }
  }

  function missedItemsHTML() {
    let html = "";
    for (const page of [1, 2, 3]) {
      const missingStars = stars.filter(
        (s) => s.page === page && !collected.has(s.id),
      );
      const missingRings = rings.filter(
        (r) => r.page === page && !collected.has(r.id),
      );
      const all = [...missingStars, ...missingRings].sort(
        (a, b) => a.routeS - b.routeS,
      );
      if (!all.length) continue;
      const id = checkpointForItem(all[0]);
      html +=
        `<div class="missed">Página ${page}: ${missingStars.length} estrelas · ${missingRings.length} argolas ` +
        `<button class="checkpoint-choice" data-checkpoint="${id}">voltar ao checkpoint</button></div>`;
    }
    return html;
  }
  function end(landed, reason) {
    state = "end";
    endTime = performance.now();
    lastLanded = landed;
    if (!landed) {
      plane.visible = false;
      crumple.visible = true;
      crumple.position.copy(p.pos);
      sfxCrash();
    }
    let extra = "";
    if (landed && Math.hypot(p.pos.x - landing.x, p.pos.z - landing.z) < 30) {
      const bonus = 150 * combo.mult;
      score += bonus;
      extra = `<br><b style="color:#c0392b">no alvo! +${bonus}</b>`;
    }
    const rec = score > best,
      recD = Math.round(p.dist) > bestDist;
    if (rec) {
      best = score;
      localStorage.setItem("rabisco_best_pts", String(best));
    }
    if (recD) {
      bestDist = Math.round(p.dist);
      localStorage.setItem("rabisco_best_dist", String(bestDist));
    }
    saveCompletion();
    const stats = completionStats();
    const badge =
      stats.pct === 100
        ? '<br><b class="complete-badge">100%! caderno completo</b>'
        : `<br>coleta: <b>${stats.pct}%</b> · ${stats.done}/${stats.total}`;
    showMsg(
      `<h1>${landed ? "POUSOU!" : "AMASSOU!"}</h1>${reason}${extra}<br>pontos: <b>${score}</b> · distância: ${p.dist.toFixed(0)} m` +
        `${rec ? '<br><b style="color:#c0392b">novo recorde!</b>' : ""}${recD ? '<br><b style="color:#1d3b8b">nova distância recorde!</b>' : ""}` +
        badge +
        '<button class="play-button" data-restart>Voar de novo</button>' +
        missedItemsHTML() +
        "<br><small>C / toque longo: checkpoint · R: novo jogo</small>",
    );
  }

  // ================== VISUAL / CÂMERA / HUD ==================
  const camTarget = V3(),
    look = V3();
  let boilAcc = 0,
    cloudFrame = 0,
    pageTimer = 0;
  const hud = document.getElementById("hud"),
    altmark = document.getElementById("altmark");
  function boilTick() {
    SHARED.uBoil.value = rnd() * 6.28;
    cloudFrame ^= 1;
    cloudMats.forEach((m, i) => (m.map = cloudTex[i][cloudFrame]));
    plane.userData.outline.position.set(
      (rnd() - 0.5) * 0.03,
      (rnd() - 0.5) * 0.03,
      (rnd() - 0.5) * 0.03,
    );
  }
  function updateStars(dt) {
    for (const s of stars) {
      if (s.state === "gone") continue;
      const d = s.pos.distanceTo(p.pos);
      if (s.state === "hidden") {
        if (d < 110) {
          s.state = "drawing";
          s.t = 0;
          s.mesh.visible = false;
        } else continue;
      }
      s.t += dt;
      s.g.visible = d < 150;
      if (s.state === "drawing") {
        const k = Math.min(1, s.t / 0.4);
        s.lg.instanceCount = Math.max(1, Math.ceil(k * s.segs));
        s.mesh.visible = k > 0.6;
        if (k >= 1) s.state = "live";
      }
      if (s.state === "dying") {
        const k = s.t / 0.3;
        if (s.scribble)
          s.scribble.geometry.instanceCount = Math.max(
            1,
            Math.ceil(Math.min(1, k * 2.5) * s.scribble.userData.segs),
          );
        s.g.scale.setScalar(
          s.T.size * Math.max(0.001, 1 - Math.max(0, k - 0.35) / 0.65),
        );
        if (k >= 1) {
          s.state = "gone";
          s.g.visible = false;
        }
      } else {
        s.g.quaternion.copy(camera.quaternion);
        s.g.rotateZ(Math.sin(simTime * 1.3 + s.phase) * 0.09);
        s.g.position.set(
          s.pos.x,
          s.pos.y + Math.sin(simTime * 2 + s.phase) * 0.3,
          s.pos.z,
        );
      }
    }
  }
  function updateRings(dt) {
    for (const R of rings) {
      if (R.state === "gone") continue;
      const d = R.pos.distanceTo(p.pos);
      if (R.state === "hidden") {
        if (d < 115) {
          R.state = "drawing";
          R.t = 0;
          setRingDraw(R, 0);
        } else continue;
      }
      R.g.visible = d < 165;
      R.t += dt;
      if (R.state === "drawing") {
        const k = Math.min(1, R.t / 0.5);
        setRingDraw(R, k);
        if (k >= 1) R.state = "live";
      }
      if (R.T.spin) R.spin.rotation.z += R.T.spin * dt;
      if (R.state === "pass" || R.state === "closing") {
        const k = Math.min(1, R.t / 0.8);
        if (R.disc) R.disc.material.opacity = Math.min(0.55, k * 2);
        if (R.mat) R.mat.opacity = 1 - Math.max(0, k - 0.3) / 0.7;
        R.g.scale.setScalar(1 + k * 0.2);
        if (k >= 1) {
          R.state = "gone";
          R.g.visible = false;
        }
      }
    }
  }
  function updateWinds(dt) {
    const heading = V3(-Math.sin(p.yaw), 0, -Math.cos(p.yaw));
    const ordinary = winds
      .filter(
        (w) =>
          w.type === "gust" &&
          !w.guided &&
          Math.hypot(p.pos.x - w.x, p.pos.z - w.z) < 95,
      )
      .sort(
        (a, b) =>
          Math.hypot(p.pos.x - a.x, p.pos.z - a.z) -
          Math.hypot(p.pos.x - b.x, p.pos.z - b.z),
      )
      .slice(0, 2);
    for (const w of winds) {
      const distance = Math.hypot(p.pos.x - w.x, p.pos.z - w.z);
      const active = p.activeWind === w,
        towards = V3(w.x - p.pos.x, 0, w.z - p.pos.z).normalize();
      const ahead = towards.dot(heading) > 0.2;
      if (w.guided)
        w.g.visible =
          active ||
          (distance < 32 && ahead && (w.type === "gust" || p.deficit > 4)) ||
          (debug.enabled && distance < 90);
      else
        w.g.visible =
          w.type === "gust"
            ? ordinary.includes(w) && ahead
            : distance < 38 && ahead;
      if (!w.g.visible) continue;
      if (w.streaks) {
        w.g.updateMatrixWorld(true);
        for (let i = 0; i < w.streaks.length; i++) {
          const s = w.streaks[i],
            len = s.len || w.len;
          const local = s.l.parent.worldToLocal(p.pos.clone());
          const center = clamp(local.x + 12, 2, Math.max(2, len - 3));
          s.l.position.x = clamp(
            center - 7 + ((simTime * 2.5 + i * 4.5) % 14),
            0,
            len - 1,
          );
          s.l.scale.setScalar(0.24 + 0.12 * Math.sin(simTime * 1.5 + i));
          s.l.visible = Math.abs(local.y) < 28 && Math.abs(local.z) < 28;
        }
        w.g.traverse((obj) => {
          if (obj.userData.windEntrance)
            obj.visible =
              obj.parent.getWorldPosition(V3()).distanceTo(p.pos) < 24;
        });
      } else if (w.type === "turb") {
        w.scr.forEach((l) => {
          l.visible = debug.enabled;
        });
        for (let i = 0; i < w.sprites.length; i++) {
          const s = w.sprites[i];
          s.sp.visible = i < 3;
          const a = s.phase + simTime * 0.5;
          s.sp.position.set(
            Math.cos(a) * s.rad * 0.3,
            Math.sin(a) * 2,
            Math.sin(a) * s.rad * 0.3,
          );
        }
      } else {
        for (let i = 0; i < w.sprites.length; i++) {
          const s = w.sprites[i];
          s.sp.visible = i < 3;
          s.sp.position.set(
            Math.cos(s.ang) * 3,
            clamp(p.pos.y + 7 - ((simTime * 2 + i * 4) % 14), 2, w.top),
            Math.sin(s.ang) * 3,
          );
        }
      }
    }
    for (const tree of trees)
      tree.sprite.visible =
        Math.hypot(p.pos.x - tree.x, p.pos.z - tree.z) < 350;
  }

  function updateBits(dt) {
    for (const b of bits) {
      if (b.life <= 0) continue;
      b.life -= dt;
      if (b.life <= 0) {
        b.s.visible = false;
        continue;
      }
      b.v.y -= 9 * dt;
      b.s.position.addScaledVector(b.v, dt);
      b.s.scale.setScalar(0.5 * b.life);
    }
  }
  function updatePage() {
    const page = routeSamples[routeIndex(p.routeS)].page;
    if (page > curPage) {
      curPage = page;
      flash(`Página ${curPage}`);
    }
  }

  function updateVisuals(dt) {
    plane.position.copy(p.pos);
    if (state === "ready")
      plane.position.y += Math.sin(performance.now() / 300) * 0.15;
    const shake = p.stall > 0 ? (rnd() - 0.5) * 0.3 : 0;
    plane.rotation.set(p.pitch, p.yaw, p.roll + shake);

    boilAcc += dt;
    if (boilAcc >= 1 / LOOK.boilFps) {
      boilAcc = 0;
      boilTick();
    }

    trailTimer += dt;
    if (state === "play" && trailTimer > 0.05) {
      trailTimer = 0;
      trailPts.push(p.pos.clone());
      if (trailPts.length > TRAIL_MAX) trailPts.shift();
      updateTrail();
    }
    updateStars(dt);
    updateRings(dt);
    updateWinds(dt);
    updateBits(dt);
    if (state === "play" && (pageTimer += dt) > 0.3) {
      pageTimer = 0;
      updatePage();
    }

    shadow.position.set(p.pos.x, 0.05, p.pos.z);
    shadow.scale.setScalar(2.5 + p.pos.y * 0.015);
    shadow.material.opacity = clamp(1 - p.pos.y / 250, 0.12, 0.7);

    // câmera
    fwd.set(0, 0, -1).applyEuler(eul.set(p.pitch, p.yaw, 0, "YXZ"));
    camTarget.copy(p.pos).add(V3(0, 4.5, 11).applyAxisAngle(UP, p.yaw));
    camera.position.lerp(camTarget, 1 - Math.exp(-5 * dt));
    if (p.turb > 0)
      camera.position.add(
        V3(rnd() - 0.5, rnd() - 0.5, rnd() - 0.5).multiplyScalar(p.turb * 0.35),
      );
    camera.position.y = Math.max(camera.position.y, 0.8);
    look.copy(p.pos).addScaledVector(fwd, 9);
    camera.lookAt(look);
    camera.updateMatrixWorld();
    SHARED.uLightView.value
      .copy(LIGHT_DIR)
      .transformDirection(camera.matrixWorldInverse);
    skyTex.offset.set((1 - skyTex.repeat.x) * 0.5, 0);

    if (windGain)
      windGain.gain.setTargetAtTime(
        state === "play"
          ? Math.min(
              0.3,
              0.02 +
                p.speed * 0.004 +
                Math.abs(p.windUp) * 0.012 +
                p.turb * 0.25,
            )
          : 0,
        ac.currentTime,
        0.2,
      );

    hud.innerHTML =
      `<div class="score">${score} <small style="font:15px 'Patrick Hand'">pts</small></div>` +
      `<div class="hud-small">${p.dist.toFixed(0)} m · página ${curPage}</div>` +
      `<div class="charges" aria-label="${p.boosts} sopros">${"✎".repeat(p.boosts) || "·"}${p.boostTimer > 0 ? `<span class="regen" style="--progress:${clamp(p.boostTimer / CFG.boostRegen, 0, 1) * 100}%">✎<i>✎</i></span>` : ""}</div>`;
    updateRecoveryHUD();

    altmark.style.bottom = `${clamp(p.pos.y / CFG.startAlt, 0, 1) * 100}%`;
  }

  function measureGlide(dt, W) {
    const stable =
      debug.enabled &&
      !input.pitch &&
      !input.roll &&
      !touch.active &&
      !W.zone &&
      !p.activeWind &&
      p.stall <= 0 &&
      Math.abs(p.roll) < 0.025 &&
      Math.abs(p.pitch - CFG.pitchRest) < 0.015 &&
      Math.abs(p.speed - debug.lastSpeed) < dt * 0.12;
    debug.lastSpeed = p.speed;
    if (!stable) {
      debug.stable = 0;
      debug.origin = null;
      return;
    }
    if (!debug.origin) debug.origin = { dist: p.dist, y: p.pos.y };
    debug.stable += dt;
    if (debug.stable >= 3) {
      const fall = debug.origin.y - p.pos.y;
      if (fall > 0.1) {
        const measured = (p.dist - debug.origin.dist) / fall;
        debug.measured = measured;
        const difference = Math.abs(CFG.glideMeasured - measured);
        CFG.glideMeasured = measured;
        if (difference > 0.03) {
          validateReachability(true);
          refreshDebugCurves();
        }
      }
      debug.origin = { dist: p.dist, y: p.pos.y };
      debug.stable = 0;
    }
  }
  function maximumReachProfile() {
    let height = CFG.startAlt;
    const points = [V3(0, height, 0)];
    for (let i = 1; i < routeSamples.length; i++) {
      const previous = routeSamples[i - 1],
        sample = routeSamples[i],
        ds = sample.s - previous.s;
      height -= ds / CFG.glideMeasured;
      for (const w of winds) {
        if (w.type === "rescue") continue;
        if (
          w.guided &&
          w.type === "recovery" &&
          w.routeS >= previous.s &&
          w.routeS < sample.s
        )
          height = Math.max(height, w.exit.y);
        else if (
          !w.guided &&
          w.routeFromS <= sample.s &&
          w.routeToS >= previous.s
        )
          height += (Math.max(0, w.lift - CFG.maxSink) * ds) / CFG.startSpeed;
      }
      points.push(V3(sample.x, Math.max(0.3, height), sample.z));
    }
    return points;
  }
  function refreshDebugCurves() {
    if (debug.group) {
      scene.remove(debug.group);
      debug.group.traverse((o) => {
        if (o.geometry) o.geometry.dispose();
      });
    }
    const g = new THREE.Group();
    debug.group = g;
    const dashed = (points) => {
      const polys = [];
      for (let i = 0; i < points.length - 1; i += 2)
        polys.push([points[i], points[i + 1]]);
      return polys;
    };
    if (!debug.routeMat) {
      debug.routeMat = lineMat("#7853b5", 2, 0.8, true);
      debug.reachMat = lineMat("#e0952e", 2, 0.8, true);
    }
    g.add(
      makeLines(
        dashed(routeSamples.map((s) => V3(s.x, s.y, s.z))),
        debug.routeMat,
      ),
    );
    g.add(makeLines(dashed(maximumReachProfile()), debug.reachMat));
    g.visible = debug.enabled;
    scene.add(g);
  }
  function toggleDebug() {
    debug.enabled = !debug.enabled;
    if (!debug.group) refreshDebugCurves();
    debug.group.visible = debug.enabled;
    document.getElementById("debug").hidden = !debug.enabled;
    if (debug.enabled) validateReachability(false);
  }
  function updateRecoveryHUD() {
    const stats = completionStats();
    document.getElementById("collection").textContent =
      `★ ${stats.starCount}/${stars.length}   ◯ ${stats.ringCount}/${rings.length}   ♧ ${stats.secretCount}/${secrets.length}`;
    document.querySelector("#journey .track i").style.width =
      `${clamp(p.routeS / routeLength, 0, 1) * 100}%`;
    document.querySelector("#journey span").textContent =
      state === "ready"
        ? "jardim de papel"
        : `passeio · ${Math.round(clamp(p.routeS / routeLength, 0, 1) * 100)}%`;
    if (debug.enabled)
      document.getElementById("debug").innerHTML =
        `F3 · roxo: rota · laranja: alcance<br>glide real: ${debug.measured ? debug.measured.toFixed(2) : CFG.glideMeasured.toFixed(2) + " (simulado)"}<br>` +
        `sem auxílio de altura · ${debug.stable.toFixed(1)}/3 s<br>déficit: ${(p.deficit || 0).toFixed(1)} m<br>` +
        `validação: ${validation.ok ? "OK" : "falhou"} · ${validation.links.length} trechos · ${validation.unreachable.length} impossíveis`;
  }

  let helpExpanded = false;
  function toggleHelp() {
    helpExpanded = !helpExpanded;
    document.getElementById("help").textContent = helpExpanded
      ? "W/S ou ↑↓: altura · A/D ou ←→: virar · espaço: sopro · C: checkpoint · R: recomeçar · M: som · Q: detalhe · F3: medição · celular: arraste, toque duplo sopra, toque longo volta"
      : "← → virar · ↑ ↓ altura · espaço: sopro · C: voltar · H: ajuda";
  }
  // ================== UI ==================
  function showMsg(html) {
    document.getElementById("msg").innerHTML = html
      ? `<div class="card sketch">${html}</div>`
      : "";
  }
  let flashT;
  function flash(text) {
    const f = document.getElementById("flash");
    f.textContent = text;
    f.style.opacity = 1;
    clearTimeout(flashT);
    flashT = setTimeout(() => (f.style.opacity = 0), 800);
  }
  (() => {
    const c = mkCanvas(256, 256),
      g = c.getContext("2d"),
      id = g.createImageData(256, 256);
    for (let i = 0; i < 256 * 256; i++) {
      const v = 205 + rnd() * 50;
      id.data.set([v, v, v - 8, 255], i * 4);
    }
    g.putImageData(id, 0, 0);
    document.getElementById("grain").style.backgroundImage =
      `url(${c.toDataURL()})`;
  })();
  let highQuality = true;
  const qBtn = document.getElementById("q");
  function setQuality(high) {
    highQuality = high;
    SHARED.uHatch.value = high ? 1 : 0;
    hullMat.visible = high;
    renderer.setPixelRatio(high ? Math.min(devicePixelRatio, 2) : 1);
    qBtn.textContent = `✎ ${high ? "alta" : "leve"}`;
    onResize();
  }
  qBtn.addEventListener("pointerdown", (e) => {
    e.stopPropagation();
    setQuality(!highQuality);
  });
  function onResize() {
    camera.aspect = innerWidth / innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(innerWidth, innerHeight);
    SHARED.uPR.value = renderer.getPixelRatio();
    renderer.getDrawingBufferSize(SHARED.uRes.value);
    SHARED.uThick.value = LOOK.outlinePx * renderer.getPixelRatio();
    lineMats.forEach((m) => m.resolution.set(innerWidth, innerHeight));
    skyTex.repeat.set(Math.min(1, innerWidth / innerHeight / 1.5), 1);
    skyTex.offset.set((1 - skyTex.repeat.x) * 0.5, 0);
  }
  addEventListener("resize", onResize);

  // ================== LOOP ==================
  const clock = new THREE.Clock();
  let acc = 0;
  function loop() {
    const dt = Math.min(clock.getDelta(), 0.1);
    readInput();
    acc += dt;
    while (acc >= CFG.step) {
      step(CFG.step);
      acc -= CFG.step;
    }
    updateVisuals(dt);
    renderer.render(scene, camera);
    requestAnimationFrame(loop);
  }
  onResize();
  if (matchMedia("(pointer: coarse)").matches) {
    setQuality(false);
    document.getElementById("help").textContent =
      "arraste para voar · toque duplo: sopro · segure: voltar";
  }
  reset();
  loop();

  const back = document.createElement("button");
  back.textContent = "☰ menu";
  back.style.cssText =
    "position:fixed;right:20px;top:62px;z-index:50;background:#fff9e8;border:1px solid #a4b69c;border-radius:8px;padding:6px 12px;color:#658572;font:inherit";
  back.addEventListener("pointerdown", (e) => e.stopPropagation());
  back.addEventListener("click", onExit);
  document.body.appendChild(back);
  addEventListener("keydown", (e) => {
    if (e.code === "Escape") onExit();
  });
}
