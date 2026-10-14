const { chromium } = require('playwright');
const assert = require('node:assert/strict');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
(async()=>{
 const browser=await chromium.launch({channel:'msedge',headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
 try { for(const mobile of [false,true]){
 const ctx=await browser.newContext({viewport:mobile?{width:390,height:844}:{width:1365,height:768},isMobile:mobile,hasTouch:mobile});
 const page=await ctx.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.goto(pathToFileURL(path.resolve('game3.html')).href+'?test=1');await page.click('#free');
 await page.waitForFunction(()=>window.__game?.chunks.loaded.size >= 25);
 await page.click('#mapButton');await page.locator('[data-mission="termal"]').click();
 assert.match(await page.locator('#missionGuidance').textContent(),/30 m/);
 assert.match(await page.locator('#missionGuidance').textContent(),/Pousar não apaga/);
 await page.click('.map-close');await page.waitForFunction(()=>!document.querySelector('#thermalMission').hidden);
 if(mobile) await page.locator('#touchBoost').click();else await page.keyboard.press('Space');
 await page.waitForFunction(()=>__game.view.boostPuff.visible);
 await page.evaluate(()=>__game.paused=true);
 assert.ok(await page.evaluate(()=>__game.view.boostPuff.children[0].material.opacity>0));
 await page.screenshot({path:path.resolve('test-results/sopro-'+(mobile?'mobile':'desktop')+'.png')});
 await page.evaluate(()=>__game.paused=false);
 await page.waitForFunction(()=>!__game.view.boostPuff.visible);
 assert.deepEqual(errors,[]);await ctx.close();
 } console.log('Sopro e missão 3: desktop/toque passaram.'); }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
