const { chromium } = require("playwright"),
  assert = require("node:assert/strict"),
  path = require("node:path"),
  { pathToFileURL } = require("node:url");
const root = path.resolve(__dirname, "..");
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
  const reports = [];
  try {
    for (const mobile of [false, true]) {
      const ctx = await browser.newContext({
        viewport: mobile
          ? { width: 390, height: 844 }
          : { width: 1365, height: 768 },
        isMobile: mobile,
        hasTouch: mobile,
      });
      const page = await ctx.newPage(),
        errors = [];
      page.on("pageerror", (e) => errors.push(e.message));
      page.on("console", (m) => {
        if (m.type() === "error") errors.push(m.text());
      });
      await page.goto(
        pathToFileURL(path.join(root, "game3.html")).href + "?test=1",
      );
      await page.click("#free");
      await page.waitForFunction(
        () =>
          window.__game?.chunks.loaded.size ===
          (matchMedia("(pointer:coarse)").matches ? 25 : 49),
      );
      assert.equal(await page.locator(".wind-arrow").count(), 1);
      const phases = mobile
        ? [[0.39, "Tarde", "afternoon"]]
        : [
            [0.08, "Manhã", "morning"],
            [0.24, "Dia", "day"],
            [0.39, "Tarde", "afternoon"],
            [0.75, "Noite", "night"],
          ];
      for (const [phase, label, name] of phases) {
        await page.evaluate((p) => {
          __game.time = (p - 0.18) * 720;
          __game.paused = false;
        }, phase);
        await page.waitForFunction(
          (label) => __game.view.cycle?.period === label,
          label,
        );
        await page.evaluate(() => (__game.paused = true));
        await page.waitForFunction(
          (label) =>
            document.querySelector("#dayPeriod").textContent.startsWith(label),
          label,
          { timeout: 5000 },
        );
        const weights = await page.evaluate(() =>
          __game.view.sky.material.uniforms.weights.value.toArray(),
        );
        assert.ok(Math.abs(weights.reduce((a, b) => a + b, 0) - 1) < 1e-6);
        await page.screenshot({
          path: path.join(
            root,
            "docs/images/sky-" +
              name +
              "-" +
              (mobile ? "mobile" : "desktop") +
              ".png",
          ),
        });
      }
      if (!mobile) {
        const found = await page.evaluate(() => {
          const g = __game;
          g.time = (0.24 - 0.18) * 720;
          for (const c of g.chunks.loaded.values())
            for (const t of c.thermals) {
              if (t.type !== "thermal") continue;
              const p = { x: t.x, y: t.y + 35, z: t.z, yaw: 0 };
              let w = g.windAt(p, g.time);
              p.x += w.x * 35 * 0.025;
              p.z += w.z * 35 * 0.025;
              w = g.windAt(p, g.time);
              if (
                w.source === "thermal" &&
                w.y > 3 &&
                g.world.normalAt(p.x, p.z).slope < 0.5
              ) {
                g.flight.p = p;
                g.flight.state = "flying";
                g.flight.speed = 14;
                g.flight.pitch = 0;
                g.paused = false;
                return true;
              }
            }
          return false;
        });
        assert.equal(found, true);
        await page.waitForFunction(
          () =>
            __game.view.cycle?.period === "Dia" &&
            __game.air?.source === "thermal" &&
            __game.flight.vy > 0.2,
        );
        await page.evaluate(() => (__game.paused = true));
        await page.waitForFunction(
          () => document.querySelector("#liftCue").dataset.kind === "lift",
        );
        assert.match(await page.locator("#liftHint").textContent(), /círculos/);
        assert.ok(
          (await page.evaluate(() => __game.view.liftArrows.count)) > 0,
        );
        await page.screenshot({
          path: path.join(root, "docs/images/thermal-coach-desktop.png"),
        });
      }
      assert.match(
        await page.locator("#windDirection").textContent(),
        /sopra para/,
      );
      assert.ok((await page.locator("#windRelative").textContent()).length > 0);
      assert.equal(
        await page.evaluate(
          () => innerWidth === document.documentElement.scrollWidth,
        ),
        true,
      );
      assert.deepEqual(errors, []);
      reports.push({
        profile: mobile ? "mobile" : "desktop",
        periods: phases.map((x) => x[1]),
        errors,
      });
      await ctx.close();
    }
    console.log(JSON.stringify({ passed: true, reports }));
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
