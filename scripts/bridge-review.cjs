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
  const report = [];
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
      const url = pathToFileURL(path.join(root, "game3.html")).href + "?test=1";
      await page.goto(url);
      await page.evaluate(() =>
        localStorage.setItem(
          "rabisco_settings",
          JSON.stringify({ dayCycle: false, weather: false }),
        ),
      );
      await page.reload();
      await page.click("#free");
      await page.waitForFunction(() => window.__game);
      await page.evaluate(() => (__game.paused = true));
      await page.click("#mapButton");
      await page.locator('[data-mission="ponte"]').click();
      await page.locator("#practiceBridge").click();
      assert.equal(await page.locator(".map-panel").isVisible(), false);
      assert.equal(
        await page.evaluate(() => __game.progress.challenges.has("ponte")),
        false,
      );
      await page.waitForFunction(() =>
        __game.chunks.loaded.has(
          `${Math.floor(__game.flight.p.x / 128)},${Math.floor(__game.flight.p.z / 128)}`,
        ),
      );
      await page.waitForTimeout(800);
      await page.screenshot({
        path: path.join(
          root,
          "docs/images/bridge-attempt-" +
            (mobile ? "mobile" : "desktop") +
            ".png",
        ),
      });
      await page.waitForFunction(
        () => __game.progress.challenges.has("ponte"),
        null,
        { timeout: 20000 },
      );
      assert.equal(await page.evaluate(() => __game.flight.state), "flying");
      assert.match(
        await page.locator("#toast").textContent(),
        /Missão 2 concluída/,
      );
      await page.evaluate(() => {
        __game.paused = true;
        __game.save();
      });
      await page.screenshot({
        path: path.join(
          root,
          "docs/images/bridge-success-" +
            (mobile ? "mobile" : "desktop") +
            ".png",
        ),
      });
      await page.reload();
      await page.click("#free");
      await page.waitForFunction(() => window.__game);
      assert.equal(
        await page.evaluate(() => __game.progress.challenges.has("ponte")),
        true,
      );
      assert.equal(
        await page.evaluate(() => __game.progress.newChallenges.length),
        0,
      );
      assert.deepEqual(errors, []);
      report.push({
        profile: mobile ? "mobile" : "desktop",
        completed: true,
        saved: true,
        errors,
      });
      await ctx.close();
    }
    console.log(JSON.stringify({ passed: true, report }));
  } finally {
    await browser.close();
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
