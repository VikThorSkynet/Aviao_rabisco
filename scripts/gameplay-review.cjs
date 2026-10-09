const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const path = require("path"),
  fs = require("fs"),
  { pathToFileURL } = require("url");
const root = path.resolve(__dirname, "..");
const results = path.join(root, "test-results");
fs.mkdirSync(results, { recursive: true });
(async () => {
  const browser = await chromium.launch({
    channel:
      process.env.RABISCO_BROWSER === "chromium"
        ? undefined
        : process.env.RABISCO_BROWSER || "msedge",
    headless: true,
    args:
      process.env.RABISCO_SOFTWARE_GPU === "1"
        ? ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"]
        : [],
  });
  const ctx = await browser.newContext({
      viewport: { width: 1365, height: 768 },
    }),
    page = await ctx.newPage(),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => {
    if (m.type() === "error") errors.push(m.text());
  });
  const url = pathToFileURL(path.join(root, "game3.html")).href + "?test=1";
  await page.goto(url);
  await page.click("#free");
  await page.waitForFunction(
    () =>
      window.__game?.chunks.loaded.size === 49 &&
      __game.chunks.pending.size === 0,
  );
  await page.evaluate(() => (__game.paused = true));
  const initial = await page.evaluate(
    () => __game.view.renderer.info.memory.geometries,
  );
  for (const [x, z] of [
    [650, 650],
    [-900, 640],
    [1100, -800],
    [0, -1100],
  ]) {
    await page.evaluate(
      ([x, z]) => {
        const g = __game;
        g.flight.p = { x, z, y: g.world.heightAt(x, z) + 45, yaw: Math.PI };
      },
      [x, z],
    );
    await page.waitForFunction(
      ([x, z]) =>
        __game.chunks.loaded.size === 49 &&
        __game.chunks.loaded.has(
          `${Math.floor(x / 128)},${Math.floor(z / 128)}`,
        ) &&
        __game.chunks.pending.size === 0,
      [x, z],
    );
  }
  const after = await page.evaluate(
    () => __game.view.renderer.info.memory.geometries,
  );
  assert.ok(after < 360, `geometry budget ${after}`);
  const normalValid = await page.evaluate(() =>
    [...__game.chunks.loaded.values()].every(
      (c) =>
        c.mesh.geometry.attributes.normal.count ===
          c.mesh.geometry.attributes.position.count &&
        [...c.mesh.geometry.attributes.normal.array].every(Number.isFinite),
    ),
  );
  assert.ok(normalValid);
  await page.keyboard.press("Tab");
  assert.equal(await page.locator(".map-panel").isVisible(), true);
  await page.screenshot({ path: path.join(results, "free-map.png") });
  await page.keyboard.press("Tab");
  await page.evaluate(() => {
    __game.progress.discovered.add("vila");
    __game.save();
  });
  await page.reload();
  await page.click("#free");
  await page.waitForFunction(() => window.__game);
  assert.equal(
    await page.evaluate(() => __game.progress.discovered.has("vila")),
    true,
  );
  await page.evaluate(() => (__game.paused = true));
  await page.keyboard.press("KeyQ");
  await page.waitForFunction(
    () =>
      window.__game?.chunks.loaded.size === 25 &&
      __game.chunks.pending.size === 0,
  );
  await page.evaluate(() => {
    const g = __game,
      f = g.flight;
    f.state = "grounded";
    f.p = { x: g.world.village.x - 30, z: g.world.village.z, y: 91.65, yaw: 0 };
    g.paused = false;
  });
  await page.keyboard.down("Space");
  await page.waitForTimeout(1600);
  await page.keyboard.up("Space");
  assert.equal(await page.evaluate(() => __game.flight.state), "flying");
  await page.click("#menuButton");
  await page.waitForSelector("#route");
  await page.click("#route");
  await page.waitForSelector(".play-button");
  await page.click(".play-button");
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(results, "free-route.png") });
  assert.ok(await page.locator("#hud").textContent());
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    deviceScaleFactor: 1,
  });
  const mp = await mobile.newPage();
  mp.on("pageerror", (e) => errors.push("mobile " + e.message));
  await mp.goto(url);
  await mp.click("#free");
  await mp.waitForFunction(() => window.__game?.chunks.loaded.size === 25);
  await mp.locator("#touchBoost").tap();
  await mp.screenshot({ path: path.join(results, "free-mobile.png") });
  const mobileState = await mp.evaluate(() => ({
    width: innerWidth,
    scroll: document.documentElement.scrollWidth,
    chunks: __game.chunks.loaded.size,
    boosts: __game.flight.boosts,
  }));
  assert.equal(mobileState.width, mobileState.scroll);
  assert.ok(mobileState.boosts < 5);
  await mp.locator("#mapButton").tap();
  assert.equal(await mp.locator(".map-panel").isVisible(), true);
  assert.deepEqual(errors, []);
  console.log(
    JSON.stringify({
      passed: true,
      geometries: { initial, after },
      mobileState,
      errors,
    }),
  );
  await browser.close();
})();
