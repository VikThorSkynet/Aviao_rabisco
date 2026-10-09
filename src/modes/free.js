import { soaringAdvice } from "../ui/soaring.js";
import { dayCycle } from "../world/day-cycle.js";
import { navigationMarkup, updateNavigation } from "../ui/navigation.js";
import {
  missionTargets,
  missionListMarkup,
  targetLabel,
} from "../ui/missions.js";
import { WorldModel } from "../world/model.js";
import { Chunks } from "../world/chunks.js";
import { WorldView } from "../render/world.js";
import { Flight, weather, windAt } from "../physics/flight.js";
import { Progress } from "../ui/progress.js";
import { drawMap } from "../ui/map.js";
import { Sound } from "../audio/sound.js";
import { CFG_FREE as C, MODE, saveSettings } from "../config.js";
export function startFree(seed, settings, exit) {
  const root = document.getElementById("app");
  root.innerHTML = `<div class="free-ui"><div class="hud-stack"><div class="instruments"><strong id="alt">0</strong> <small>m de altitude</small><div class="meter-row"><span id="vario"></span><span id="boosts"></span></div></div>${navigationMarkup()}<div id="liftCue" class="lift-cue"><b id="liftTitle"></b><span id="liftHint"></span></div><div id="dayPeriod" class="day-period"></div></div><div class="top-actions"><button id="mapButton">Mapa · Tab</button><button id="helpButton">?</button><button id="menuButton">Menu</button></div><div class="toast" id="toast">Desenhando os arredores…</div><div class="charge" hidden><i></i></div><div class="hint">← → virar · ↑ ↓ inclinar · espaço: sopro · Tab: mapa · H: ajuda</div><div class="touch-controls"><button id="touchBoost">Soprar</button></div><div class="map-panel" hidden><button class="map-close">Fechar ×</button><h2>Seu caderno de viagem</h2><div class="map-layout"><div class="map-sheet"><canvas id="map" width="512" height="512" aria-label="Mapa de exploração com objetivos numerados"></canvas><button id="mapViewButton" class="map-view-toggle" aria-pressed="false">Ver mundo inteiro</button><p class="map-key">➤ você · 1 cachoeira · 2 ponte · 3 térmicas · ✓ concluída</p><div id="missionGuidance" class="mission-guidance"></div></div><div id="album"></div></div></div><div id="freeHelp" hidden><b>Voe sem pressa</b><p>↑ / W: baixar o nariz para ganhar velocidade.<br>↓ / S: levantar o nariz. ← → / A D: virar.<br>Espaço: sopro extra. Penas e folhas recarregam.<br>No chão, segure espaço, escolha a direção e solte.<br>No celular, arraste para guiar. Segure o botão para relançar.</p><p>A bússola indica o norte e a direção do avião. A seta da bandeira mostra para onde o ar vai; a legenda diz se ele leva você para frente, para trás ou para os lados. O vento horizontal desloca, mas é o ar subindo que ajuda a manter altura. O cartão de corrente distingue ar subindo de ar descendo. No mapa, escolha uma aventura para destacar um destino.</p><p>Nuvens e aves circulando indicam térmicas. Procure as setas verdes, entre na corrente e faça círculos para continuar nela. O variômetro mede a subida do avião; o cartão mede a subida do ar. À tarde, as térmicas enfraquecem; à noite, procure as encostas que recebem vento. Pouse suavemente para descansar. As plataformas de madeira são catapultas!</p><button id="closeHelp">Vamos voar</button></div><div class="debug-free" hidden></div></div>`;
  const world = new WorldModel(seed),
    progress = new Progress(seed),
    view = new WorldView(world, settings),
    flight = new Flight(world, progress),
    audio = new Sound(settings, world),
    chunks = new Chunks(
      world,
      view.scene,
      view.terrain,
      settings.quality,
      (c) => view.rebuild(c, progress),
    );
  view.renderer.domElement.className = "free-canvas";
  view.camera.position.set(flight.p.x, flight.p.y + 10, flight.p.z - 20);
  const $ = (s) => root.querySelector(s),
    input = { turn: 0, pitch: 0, charge: false },
    keys = new Set();
  let time = progress.time,
    acc = 0,
    last = performance.now(),
    lastSave = 0,
    paused = false,
    mapOpen = false,
    debug = false,
    ready = false,
    toastUntil = 0,
    lastUI = 0,
    frames = 0,
    fps = 60,
    frameSum = 0,
    w = weather(world, time, settings),
    wind = { x: 0, z: 0, y: 0, above: 45, ground: 0 },
    pointer = null,
    selectedMission = null,
    currentMissions = [],
    mapOverview = false;
  view.sampleAir = (position) => windAt(world, chunks, position, time, w);
  function message(text) {
    $("#toast").textContent = text;
    toastUntil = time + 4;
  }
  function save() {
    progress.save(time);
    if (progress.failed)
      message("O navegador não permitiu salvar o progresso.");
  }
  function toggleMap() {
    mapOpen = !mapOpen;
    paused = mapOpen || !$("#freeHelp").hidden;
    $(".map-panel").hidden = !mapOpen;
    if (mapOpen) {
      if (progress.challenges.has(selectedMission)) selectedMission = null;
      const r = progress.records;
      $("#album").innerHTML =
        `<h3>Pequenas aventuras</h3><div id="missionChoices"></div><h3>Álbum · ${progress.discovered.size}/${world.landmarks.length}</h3><p>${world.landmarks.map((l) => (progress.discovered.has(l.id) ? l.icon + " " + l.name : "◇ Lugar ainda por descobrir")).join("<br>")}</p><h3>Figurinhas · ${progress.album.size}/4</h3><p>${[...progress.album].join("<br>") || "Observe a vida pelo caminho."}</p><h3>Seus recordes</h3><p>${Math.round(r.altitude)} m de altitude · ${Math.round(r.airtime)} s no ar<br>${Math.round(r.distance)} m sem pousar · ${progress.thermals.size} térmicas visitadas<br>${((progress.visited.size / 4096) * 100).toFixed(1)}% explorado</p><p id="seedReadout"></p>`;
      $("#seedReadout").textContent = "Mundo: " + seed;
      renderMissionMap();
      save();
    }
  }
  function renderMissionMap() {
    currentMissions = missionTargets(world, chunks, flight.p, progress);
    if (!selectedMission)
      selectedMission = (
        currentMissions.find((m) => !m.completed) || currentMissions[0]
      )?.id;
    drawMap(
      $("#map"),
      world,
      progress,
      flight.p,
      currentMissions,
      selectedMission,
      mapOverview,
    );
    $("#mapViewButton").textContent = mapOverview
      ? "Focar missão"
      : "Ver mundo inteiro";
    $("#mapViewButton").setAttribute("aria-pressed", String(mapOverview));
    const choice = $("#missionChoices");
    if (choice)
      choice.innerHTML = missionListMarkup(currentMissions, selectedMission);
    const m = currentMissions.find((m) => m.id === selectedMission);
    const thermalProgress =
      m?.id === "termal" && !m.completed
        ? `<span>Subida térmica neste voo: ${Math.min(300, Math.round(progress.thermalGain || 0))}/300 m</span>`
        : "";
    $("#missionGuidance").innerHTML = m
      ? `<b>${m.number}. ${m.name}</b><span>${targetLabel(m)}</span>${thermalProgress}<p>${m.hint}</p><small>${m.completed ? "Missão já concluída. Você pode visitar o local novamente." : "O traço pontilhado indica a direção em linha reta para um local sugerido, mesmo em áreas ainda não exploradas."}</small>`
      : "";
  }
  $("#album").addEventListener("click", (e) => {
    const button = e.target.closest("[data-mission]");
    if (!button) return;
    selectedMission = button.dataset.mission;
    mapOverview = false;
    renderMissionMap();
    $("#missionChoices")
      .querySelector(`[data-mission="${selectedMission}"]`)
      ?.focus({ preventScroll: true });
  });
  $("#mapViewButton").onclick = () => {
    mapOverview = !mapOverview;
    renderMissionMap();
  };
  function help() {
    const e = $("#freeHelp");
    e.hidden = !e.hidden;
    paused = mapOpen || !e.hidden;
  }
  $("#mapButton").onclick = toggleMap;
  $(".map-close").onclick = toggleMap;
  $("#helpButton").onclick = help;
  $("#closeHelp").onclick = help;
  $("#menuButton").onclick = () => {
    save();
    exit();
  };
  function press() {
    if (paused) return;
    if (flight.state === "grounded") input.charge = true;
    else if (flight.boost()) audio.tone(620, 0.15);
  }
  function release() {
    if (input.charge) {
      input.charge = false;
      flight.release();
    }
  }
  addEventListener("keydown", (e) => {
    if (
      mapOpen &&
      e.target.closest?.(".map-panel") &&
      !["Escape", "F3"].includes(e.code)
    )
      return;
    if (
      [
        "ArrowUp",
        "ArrowDown",
        "ArrowLeft",
        "ArrowRight",
        "Space",
        "Tab",
      ].includes(e.code)
    )
      e.preventDefault();
    if (e.repeat) return;
    keys.add(e.code);
    if (e.code === "Space") press();
    if (e.code === "Tab") toggleMap();
    if (e.code === "KeyH") help();
    if (e.code === "F3") {
      e.preventDefault();
      debug = !debug;
      $(".debug-free").hidden = !debug;
    }
    if (e.code === "Escape") {
      if (mapOpen) toggleMap();
      else if (!$("#freeHelp").hidden) help();
      else {
        save();
        exit();
      }
    }
    if (e.code === "KeyM") {
      settings.sound = !settings.sound;
      saveSettings(settings);
    }
    if (e.code === "KeyQ") {
      settings.quality = settings.quality === "high" ? "low" : "high";
      saveSettings(settings);
      chunks.quality = settings.quality;
      view.renderer.setPixelRatio(
        Math.min(devicePixelRatio, C.quality[settings.quality].pixelRatio),
      );
      view.scene.fog.near = settings.quality === "low" ? 100 : 160;
      view.scene.fog.far = settings.quality === "low" ? 280 : 390;
      view.terrain.userData.quality = settings.quality;
      view.birds.forEach(
        (bird, i) =>
          (bird.userData.qualityHidden = settings.quality === "low" && i >= 24),
      );
      view.terrain.needsUpdate = true;
      message("Qualidade " + (settings.quality === "low" ? "leve" : "alta"));
    }
  });
  addEventListener("keyup", (e) => {
    keys.delete(e.code);
    if (e.code === "Space") release();
  });
  addEventListener("blur", () => {
    keys.clear();
    input.turn = input.pitch = 0;
    release();
    save();
  });
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) {
      save();
      keys.clear();
      input.turn = input.pitch = 0;
      input.charge = false;
      acc = 0;
    }
    last = performance.now();
  });
  addEventListener("beforeunload", save);
  const canvas = view.renderer.domElement;
  canvas.addEventListener("pointerdown", (e) => {
    if (paused) return;
    pointer = { id: e.pointerId, x: e.clientX, y: e.clientY };
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener("pointermove", (e) => {
    if (!pointer || pointer.id !== e.pointerId) return;
    input.turn = Math.max(-1, Math.min(1, (e.clientX - pointer.x) / 90));
    input.pitch = Math.max(-1, Math.min(1, (e.clientY - pointer.y) / 90));
  });
  const endPointer = () => {
    pointer = null;
    input.turn = input.pitch = 0;
  };
  canvas.addEventListener("pointerup", endPointer);
  canvas.addEventListener("pointercancel", endPointer);
  const touch = $("#touchBoost");
  touch.addEventListener("pointerdown", (e) => {
    e.preventDefault();
    touch.setPointerCapture(e.pointerId);
    press();
  });
  touch.addEventListener("pointerup", release);
  touch.addEventListener("pointercancel", release);
  function frame(now) {
    requestAnimationFrame(frame);
    const rawDt = (now - last) / 1000,
      dt = Math.min(0.05, rawDt);
    last = now;
    if (document.hidden) return;
    chunks.update(flight.p.x, flight.p.z);
    if (chunks.error) {
      message("Falha ao desenhar o mundo: " + chunks.error);
      paused = true;
      return;
    }
    if (
      !ready &&
      chunks.loaded.has(
        `${Math.floor(flight.p.x / 128)},${Math.floor(flight.p.z / 128)}`,
      )
    ) {
      ready = true;
      message("Seu caderno está aberto. Bom voo!");
    }
    if (!paused && ready) {
      time += dt;
      w = weather(world, time, settings);
      if (!pointer) {
        input.turn =
          (keys.has("ArrowRight") || keys.has("KeyD") ? 1 : 0) -
          (keys.has("ArrowLeft") || keys.has("KeyA") ? 1 : 0);
        input.pitch =
          (keys.has("ArrowDown") || keys.has("KeyS") ? 1 : 0) -
          (keys.has("ArrowUp") || keys.has("KeyW") ? 1 : 0);
      }
      acc += dt;
      while (acc >= C.step) {
        wind = windAt(world, chunks, flight.p, time, w);
        flight.step(C.step, input, wind, chunks);
        acc -= C.step;
      }
      for (const item of view.pickups)
        if (
          !item.taken &&
          Math.hypot(
            flight.p.x - item.x,
            flight.p.y - item.y,
            flight.p.z - item.z,
          ) < 4
        ) {
          item.taken = true;
          progress.collected.add(item.id);
          flight.boosts = Math.min(
            5,
            flight.boosts + (item.type === "feather" ? 1 : 0.5),
          );
          audio.tone(item.type === "feather" ? 880 : 740);
          message(
            item.type === "feather"
              ? "Uma pena! +1 sopro"
              : "Folhinha ao vento · +½ sopro",
          );
        }
      progress.update(flight, wind, world);
      if (flight.flash) {
        message(flight.flash);
        flight.flash = "";
      }
      if (time - lastSave > 5) {
        save();
        lastSave = time;
      }
      audio.update(flight.p, flight.vy, time);
    }
    view.update(flight, time, w, dt);
    if (!paused) progress.observe(view, flight, w);
    frames++;
    frameSum += rawDt;
    if (frameSum > 1) {
      fps = frames / frameSum;
      frames = 0;
      frameSum = 0;
    }
    if (time - lastUI > 0.12 || paused) {
      lastUI = time;
      $("#alt").textContent = Math.round(flight.p.y);
      $("#vario").textContent =
        (flight.vy >= 0 ? "↑ " : "↓ ") +
        Math.abs(flight.vy).toFixed(1) +
        " m/s";
      $("#boosts").textContent =
        flight.boosts.toFixed(flight.boosts % 1 ? 1 : 0) + " sopros";
      updateNavigation(root, flight.p.yaw, ready ? wind : w);
      const advice = soaringAdvice(wind, flight, w);
      $("#liftCue").dataset.kind = advice.kind;
      $("#liftTitle").textContent = advice.title;
      $("#liftHint").textContent = advice.hint;
      const cycle = dayCycle(w.phase);
      $("#dayPeriod").textContent = `${cycle.period} · ${cycle.clock}`;
      $(".charge").hidden = flight.state !== "grounded";
      $(".charge i").style.width = flight.charge * 100 + "%";
      touch.textContent = flight.state === "grounded" ? "Segure" : "Soprar";
      if (time > toastUntil) $("#toast").textContent = "";
      if (debug)
        $(".debug-free").textContent =
          `${fps.toFixed(0)} fps · ${view.renderer.info.render.calls} desenhos\n${chunks.loaded.size} blocos · ${chunks.pending.size} gerando\n${flight.state} · altura do chão ${wind.above.toFixed(1)} m\nar vertical ${wind.y.toFixed(2)} m/s`;
    }
  }
  requestAnimationFrame(frame);
  if (new URLSearchParams(location.search).has("test"))
    window.__game = {
      world,
      progress,
      view,
      flight,
      chunks,
      input,
      mode: MODE.free,
      get air() {
        return wind;
      },
      get time() {
        return time;
      },
      set time(v) {
        time = v;
      },
      get paused() {
        return paused;
      },
      set paused(v) {
        paused = v;
      },
      windAt: (p, t = time) =>
        windAt(world, chunks, p, t, weather(world, t, settings)),
      save,
      toggleMap,
      get missionTargets() {
        return currentMissions;
      },
      get mapOverview() {
        return mapOverview;
      },
      get selectedMission() {
        return selectedMission;
      },
    };
}
