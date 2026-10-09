const { chromium } = require("playwright");
const assert = require("node:assert/strict");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const root = path.resolve(__dirname, "..");
const angle = async (page, id) =>
  page
    .locator(id)
    .evaluate((el) =>
      Number(el.style.transform.match(/rotate\(([-\d.]+)deg\)/)[1]),
    );
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
      const context = await browser.newContext({
        viewport: mobile
          ? { width: 390, height: 844 }
          : { width: 1365, height: 768 },
        isMobile: mobile,
        hasTouch: mobile,
      });
      const page = await context.newPage(),
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
      await page.evaluate(() => {
        __game.paused = true;
        __game.flight.p.yaw = 0;
      });
      await page.waitForFunction(
        () =>
          document.querySelector("#compassHeading").textContent === "N · 0°",
      );
      const first = await angle(page, "#windFlag");
      await page.evaluate(() => (__game.flight.p.yaw = Math.PI / 2));
      await page.waitForFunction(
        () =>
          document.querySelector("#compassHeading").textContent === "O · 270°",
      );
      assert.equal(
        (((await angle(page, "#compassDial")) % 360) + 360) % 360,
        90,
      );
      const second = await angle(page, "#windFlag");
      assert.ok(Math.abs(second - first - 90) < 0.1);
      await page.evaluate(() => {
        __game.flight.p.yaw = 0;
        __game.time = 0;
        __game.paused = false;
      });
      await page.waitForFunction(
        () =>
          document.querySelector("#compassHeading").textContent === "N · 0°",
      );
      await page.evaluate(() => (__game.paused = true));
      const oldWind = await angle(page, "#windFlag");
      await page.evaluate(() => {
        __game.time = 180;
        __game.paused = false;
      });
      await page.waitForTimeout(250);
      await page.evaluate(() => (__game.paused = true));
      const newWind = await angle(page, "#windFlag");
      assert.ok(
        newWind - oldWind < -20 && newWind - oldWind > -40,
        "Wind indicator must follow the actual downwind vector change",
      );
      const layout = await page.evaluate(() => {
        const rect = (s) => {
          const r = document.querySelector(s).getBoundingClientRect();
          return { left: r.left, right: r.right, top: r.top, bottom: r.bottom };
        };
        return {
          hud: rect(".instruments"),
          compass: rect(".compass-sketch"),
          flag: rect(".wind-sketch"),
          width: innerWidth,
          scroll: document.documentElement.scrollWidth,
          oldIndicator: !!document.querySelector(".wind"),
        };
      });
      assert.equal(layout.oldIndicator, false);
      assert.equal(layout.width, layout.scroll);
      assert.ok(layout.compass.top > layout.hud.bottom);
      assert.ok(layout.flag.top > layout.hud.bottom);
      assert.ok(layout.compass.left > layout.flag.right);
      assert.ok(layout.compass.right < layout.width);
      const suffix = mobile ? "mobile" : "desktop";
      await page.screenshot({
        path: path.join(root, "docs/images/navigation-" + suffix + ".png"),
      });
      await page.click("#mapButton");
      await page.click("#mapViewButton");
      assert.equal(await page.evaluate(() => __game.mapOverview), true);
      await page.click("#mapViewButton");
      assert.equal(await page.evaluate(() => __game.mapOverview), false);
      assert.equal(await page.locator(".mission-choice").count(), 3);
      await page.locator('[data-mission="termal"]').click();
      assert.equal(await page.evaluate(() => __game.selectedMission), "termal");
      assert.match(
        await page.locator("#missionGuidance").textContent(),
        /300 m/,
      );
      await page.locator('[data-mission="ponte"]').click();
      await page.locator('[data-mission="termal"]').focus();
      await page.keyboard.press("Space");
      assert.equal(await page.evaluate(() => __game.selectedMission), "termal");
      await page.locator('[data-mission="ponte"]').click();
      assert.equal(await page.evaluate(() => __game.selectedMission), "ponte");
      assert.ok(
        await page.evaluate(() =>
          __game.missionTargets.every(
            (m) => m.target && Number.isFinite(m.meters),
          ),
        ),
      );
      await page.evaluate(() => {
        __game.progress.challenges.add("ponte");
        __game.toggleMap();
        __game.toggleMap();
      });
      assert.equal(
        await page
          .locator('[data-mission="ponte"]')
          .getAttribute("aria-pressed"),
        "false",
      );
      assert.match(
        await page.locator('[data-mission="ponte"]').getAttribute("class"),
        /completed/,
      );
      await page.evaluate(
        () => (document.querySelector(".map-panel").scrollTop = 0),
      );
      await page.screenshot({
        path: path.join(root, "docs/images/mission-map-" + suffix + ".png"),
      });
      await page.keyboard.press("Escape");
      assert.equal(await page.locator(".map-panel").isVisible(), false);
      await page.click("#menuButton");
      await page.waitForSelector("#route");
      await page.click("#route");
      await page.waitForSelector(".play-button");
      assert.deepEqual(errors, []);
      reports.push({
        profile: suffix,
        layout,
        windRotationDelta: newWind - oldWind,
        errors,
      });
      await context.close();
    }
    console.log(JSON.stringify({ passed: true, reports }));
  } finally {
    await browser.close();
  }
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
