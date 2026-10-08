import test from "node:test";
import assert from "node:assert/strict";
import { WorldModel } from "../src/world/model.js";
import { Flight, windAt, weather } from "../src/physics/flight.js";
import { MODE } from "../src/config.js";
const world = new WorldModel("jardim-dos-ventos"),
  empty = { nearby: () => [] },
  input = { turn: 0, pitch: 0, charge: false };
test("world is deterministic, bounded and has three major waterfalls", () => {
  for (const seed of ["jardim-dos-ventos", "abc", "vento-123"]) {
    const a = new WorldModel(seed),
      b = new WorldModel(seed);
    assert.ok(a.falls.length >= 3);
    for (let x = -1800; x < 1800; x += 310)
      for (let z = -1800; z < 1800; z += 310) {
        assert.equal(a.heightAt(x, z), b.heightAt(x, z));
        assert.ok(Number.isFinite(a.heightAt(x, z)));
      }
    assert.deepEqual(
      a.generateChunk(1, -2, 8).trees,
      b.generateChunk(1, -2, 16).trees,
    );
    for (const f of a.falls.slice(0, 3)) assert.ok(f.top - f.bottom >= 8);
  }
});
test("terrain meshes agree with physics and chunk borders", () => {
  const a = world.generateChunk(0, 0, 24),
    b = world.generateChunk(1, 0, 8);
  for (let i = 0; i < a.vertices.length; i += 3)
    assert.ok(
      Math.abs(
        a.vertices[i + 1] - world.heightAt(a.vertices[i], a.vertices[i + 2]),
      ) < 0.001,
    );
  for (let z = 0; z <= 8; z++)
    assert.ok(
      Math.abs(
        a.vertices[(z * 3 * 25 + 24) * 3 + 1] - b.vertices[z * 9 * 3 + 1],
      ) < 0.001,
    );
});
test("day and night change thermals and water never creates a thermal", () => {
  const day = weather(world, 0, { dayCycle: true, weather: false }),
    night = weather(world, 400, { dayCycle: true, weather: false });
  assert.ok(day.sun > 0.8);
  assert.equal(night.sun, 0);
  for (let x = -2; x < 2; x++)
    for (let z = -2; z < 2; z++)
      for (const t of world.generateChunk(x, z, 6).thermals)
        if (t.type === "thermal") assert.equal(world.waterAt(t.x, t.z), null);
});
test("soft landing, recharge and relaunch; water and crashes recover", () => {
  const f = new Flight(world);
  let p;
  for (let x = world.village.x - 30; x < world.village.x + 30; x += 5) {
    const z = world.village.z;
    if (world.normalAt(x, z).slope < 0.2 && !world.waterAt(x, z)) {
      p = { x, z, y: world.heightAt(x, z) + 0.66, yaw: 0 };
      break;
    }
  }
  assert.ok(p);
  f.p = p;
  f.speed = 10;
  f.pitch = 0;
  for (let i = 0; i < 60 && f.state === "flying"; i++)
    f.step(1 / 120, input, { x: 0, z: 0, y: 0, above: 0.66 }, empty);
  assert.equal(f.state, "grounded");
  f.boosts = 1;
  for (let i = 0; i < 1201; i++)
    f.step(1 / 120, { ...input, charge: true }, {}, empty);
  assert.equal(f.boosts, 2);
  f.release();
  assert.equal(f.state, "flying");
  assert.equal(f.speed, 14);
  f.recover("test");
  for (let i = 0; i < 180; i++)
    f.step(1 / 120, input, { x: 0, z: 0, y: 0, above: 30 }, empty);
  assert.equal(f.state, "flying");
  const lake = world.lakes.at(-1);
  f.p = { x: lake.x, y: lake.y + 0.2, z: lake.z, yaw: 0 };
  f.step(1 / 120, input, { x: 0, z: 0, y: 0, above: 4 }, empty);
  assert.equal(f.state, "crumpled");
  assert.match(f.flash, /molhado/);
});
test("wind is finite and local, free mode disables score and ending", () => {
  for (let x = -1000; x < 1000; x += 50) {
    const p = { x, z: 800, y: world.heightAt(x, 800) + 30 },
      w = windAt(
        world,
        empty,
        p,
        20,
        weather(world, 20, { dayCycle: true, weather: true }),
      );
    assert.ok(Number.isFinite(w.y));
    assert.ok(Math.abs(w.y) <= 14);
  }
  assert.equal(MODE.free.score, false);
  assert.equal(MODE.free.endGame, false);
});

test("five minutes of thermal soaring without boosts in fixed daylight",()=>{
const w=new WorldModel('jardim-dos-ventos'),cs=[];for(let x=-3;x<=3;x++)for(let z=-11;z<=-7;z++)cs.push(w.generateChunk(x,z,4));const index={nearby:(x,z)=>cs.filter(c=>Math.abs(c.cx-Math.floor(x/128))<=1&&Math.abs(c.cz-Math.floor(z/128))<=1)},t=cs.flatMap(c=>c.thermals).filter(t=>t.type==='thermal').sort((a,b)=>b.lift-a.lift)[0],f=new Flight(w);f.p={x:t.x+10,y:t.y+20,z:t.z,yaw:0};let min=f.p.y,max=min,crashes=0;for(let i=0;i<36000;i++){const time=i/120,we=weather(w,time,{dayCycle:false,weather:false}),above=f.p.y-t.y,cx=t.x+we.x*above*.025,cz=t.z+we.z*above*.025,dx=f.p.x-cx,dz=f.p.z-cz,a=Math.atan2(dz,dx)+.6,tx=cx+Math.cos(a)*10,tz=cz+Math.sin(a)*10,desired=Math.atan2(-(tx-f.p.x),-(tz-f.p.z));let diff=desired-f.p.yaw;diff=Math.atan2(Math.sin(diff),Math.cos(diff));f.step(1/120,{turn:Math.max(-1,Math.min(1,-diff*2)),pitch:0,charge:false},windAt(w,index,f.p,time,we),index);min=Math.min(min,f.p.y);max=Math.max(max,f.p.y);if(f.state!=='flying'){crashes++;break;}}assert.equal(f.state,"flying");assert.ok(f.airtime>299);assert.equal(f.boosts,5);assert.ok(max-min>50);
});
