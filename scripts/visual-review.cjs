// Review snapshots use the test hook for stable scene positions; this is not a flight skill test.
const { chromium } = require("playwright");
const fs = require("fs");
const path = require("path");
const { pathToFileURL } = require("url");
const root = path.resolve(__dirname, "..").replaceAll("\\", "/");
(async () => {
  const b = await chromium.launch({
      channel:
        process.env.RABISCO_BROWSER === "chromium"
          ? undefined
          : process.env.RABISCO_BROWSER || "msedge",
      headless: true,
      args:
        process.env.RABISCO_SOFTWARE_GPU === "1"
          ? ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
          : [],
    }),
    report = {};
  for (const mobile of [false, true]) {
    const ctx = await b.newContext({
      viewport: mobile
        ? { width: 390, height: 844 }
        : { width: 1365, height: 768 },
      isMobile: mobile,
      hasTouch: mobile,
    });
    const p = await ctx.newPage(),
      errors = [];
    p.on("pageerror", (e) => errors.push(e.message));
    p.on("console", (m) => {
      if (m.type() === "error") errors.push(m.text());
    });
    const base = pathToFileURL(path.join(root, "game3.html")).href + "?test=1";
    await p.goto(base);
    await p.click("#route");
    await p.waitForSelector(".play-button");
    await p.click(".play-button");
    await p.waitForTimeout(450);
    await p.screenshot({
      path:
        root +
        "/docs/images/review-route-" +
        (mobile ? "mobile" : "desktop") +
        ".png",
    });
    await p.goto(base);
    await p.click("#free");
    await p.waitForFunction(
      () =>
        window.__game?.chunks.loaded.size >=
        (matchMedia("(pointer:coarse)").matches ? 25 : 49),
    );
    await p.evaluate(() => (__game.paused = true));
    const stats = [];
    for (const name of [
      "start",
      "forest",
      "waterfall",
      "village",
      "map",
      "night",
    ]) {
      if (name !== "start" && name !== "map") {
        await p.evaluate((name) => {
          const g = __game;
          let a;
          if (name === "forest") {
            const c = [...g.chunks.loaded.values()].sort(
              (a, b) => b.trees.length - a.trees.length,
            )[0];
            a = { x: c.cx * 128 + 64, z: c.cz * 128 + 64 };
            a.y = g.world.heightAt(a.x, a.z) + 35;
          }
          if (name === "waterfall") {
            const f = g.world.falls[0];
            a = { x: f.x, z: f.z - 50, y: f.top + 10 };
          }
          if (name === "village")
            a = {
              ...g.world.village,
              y: g.world.village.y + 50,
              z: g.world.village.z - 60,
            };
          if (name === "night") {
            g.time = 400;
            g.paused = false;
            return;
          }
          g.flight.p = { ...a, yaw: Math.PI };
        }, name);
        await p.waitForTimeout(name === "night" ? 150 : 2200);
        await p.waitForFunction(
          () =>
            __game.chunks.pending.size === 0 &&
            __game.chunks.ready.length === 0,
        );
        if (name === "night") await p.evaluate(() => (__game.paused = true));
      }
      if (name === "map") await p.keyboard.press("Tab");
      await p.screenshot({
        path:
          root +
          "/docs/images/review-free-" +
          name +
          "-" +
          (mobile ? "mobile" : "desktop") +
          ".png",
      });
      if (name === "map") await p.keyboard.press("Tab");
      stats.push(
        await p.evaluate(() => ({
          calls: __game.view.renderer.info.render.calls,
          triangles: __game.view.renderer.info.render.triangles,
          geometries: __game.view.renderer.info.memory.geometries,
          chunks: __game.chunks.loaded.size,
        })),
      );
    }
    if (errors.length) throw new Error(errors.join("\n"));
    report[mobile ? "mobile" : "desktop"] = {
      seed: "jardim-dos-ventos",
      viewport: mobile ? "390x844" : "1365x768",
      quality: mobile ? "low" : "high",
      scenes: ["start", "forest", "waterfall", "village", "map", "night"],
      stats,
      errors,
    };
    await ctx.close();
  }
  report.environment = {
    browser: process.env.RABISCO_BROWSER || "msedge",
    softwareGPU: process.env.RABISCO_SOFTWARE_GPU === "1",
    version: require("../package.json").version,
  };
  fs.writeFileSync(
    root + "/docs/visual-review.json",
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report));
  await b.close();
})();
