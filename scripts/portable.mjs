import fs from "node:fs";
const js = fs
  .readFileSync("dist/app.js", "utf8")
  .replaceAll("</script", "<\\/script");
const css = fs
  .readdirSync("dist")
  .filter((x) => x.endsWith(".css"))
  .map((x) => fs.readFileSync("dist/" + x, "utf8"))
  .join("\n");
const html = `<!doctype html><html lang="pt-BR"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1"><title>Rabisco Planador — Rota & Livre</title><style>${css}</style></head><body><div id="app"></div><script>${js}</script></body></html>`;
fs.writeFileSync("dist/game3.html", html);
console.log("HTML portátil: dist/game3.html");
