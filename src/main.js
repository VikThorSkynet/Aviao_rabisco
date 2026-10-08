import "./style.css";
import { readSettings, saveSettings, MODE } from "./config.js";
import { startRoute } from "./modes/route.js";
import { startFree } from "./modes/free.js";
const settings = readSettings();
const root = document.getElementById("app");
function exit() {
  location.hash = "";
  location.reload();
}
function menu() {
  root.innerHTML = `<main class="menu"><div class="eyebrow">UM PEQUENO MUNDO DE PAPEL</div><div class="paperplane">➤</div><h1>Rabisco<br><em>Planador</em></h1><p>Abra o caderno. Deixe o vento levar.</p><div class="choices"><button id="free"><b>Livre</b><span>Explore, pouse e descubra</span></button><button id="route"><b>Rota</b><span>Uma trilha de pequenos desafios</span></button></div><label class="seed-label">Seu mundo <input id="seed" maxlength="64" aria-label="Seed do mundo"></label><div class="small-actions"><button id="newseed">↻ Novo mundo</button><button id="share">Copiar seed</button><button id="settings">Configurações</button></div><p class="fine">Árvores de rabisco, rios de tinta e espaço para respirar.</p><div id="options" hidden></div></main><div class="meadow" aria-hidden="true">♧　♧　　♧　　　♧　♧</div>`;
  const seed = document.getElementById("seed");
  seed.value = localStorage.getItem("rabisco_seed") || "jardim-dos-ventos";
  document.getElementById("newseed").onclick = () =>
    (seed.value = "vento-" + Math.random().toString(36).slice(2, 8));
  document.getElementById("share").onclick = async (e) => {
    try {
      await navigator.clipboard.writeText(seed.value);
      e.target.textContent = "Seed copiada!";
    } catch {
      seed.select();
      e.target.textContent = "Selecione e copie a seed";
    }
  };
  document.getElementById("settings").onclick = () => {
    const box = document.getElementById("options");
    box.hidden = !box.hidden;
    box.innerHTML = `<label>Qualidade <select id="quality"><option value="high">Alta</option><option value="low">Leve</option></select></label><label><input type="checkbox" id="sound"> Sons</label><label><input type="checkbox" id="vario"> Bipes ao subir</label><label><input type="checkbox" id="dayCycle"> Dia e noite</label><label><input type="checkbox" id="weather"> Variação de clima</label><label>Volume <input type="range" id="volume" min="0" max="1" step=".05"></label>`;
    for (const key of [
      "quality",
      "sound",
      "vario",
      "dayCycle",
      "weather",
      "volume",
    ]) {
      const el = document.getElementById(key);
      if (el.type === "checkbox") el.checked = settings[key];
      else el.value = settings[key];
      el.onchange = () => {
        settings[key] =
          el.type === "checkbox"
            ? el.checked
            : key === "volume"
              ? Number(el.value)
              : el.value;
        saveSettings(settings);
      };
    }
  };
  document.getElementById("route").onclick = () => {
    document.body.className = "";
    startRoute(exit);
  };
  document.getElementById("free").onclick = async () => {
    const value = seed.value.trim() || "jardim-dos-ventos";
    localStorage.setItem("rabisco_seed", value);
    root.innerHTML = '<div class="loading">Desenhando seu caderno…</div>';
    await new Promise((r) => setTimeout(r, 30));
    try {
      startFree(value, settings, exit);
    } catch (e) {
      root.innerHTML =
        '<div class="loading">Não foi possível abrir o jogo. ' +
        e.message +
        "</div>";
      console.error(e);
    }
  };
}
window.addEventListener("error", (e) =>
  console.error("Game error:", e.message),
);
menu();
