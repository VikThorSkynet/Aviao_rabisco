import test from 'node:test';
import assert from 'node:assert/strict';
import { Progress } from '../src/ui/progress.js';
import { WorldModel } from '../src/world/model.js';
import { Flight, windAt, weather } from '../src/physics/flight.js';
test('village visit requires arrival at low altitude, excludes crashes and preserves legacy achievements',()=>{
 const saves=new Map();globalThis.localStorage={getItem:k=>saves.get(k),setItem:(k,v)=>saves.set(k,v)};
 saves.set('rabisco_free_v1_visit',JSON.stringify({challenges:['termal']}));
 const progress=new Progress('visit'),world={landmarks:[],falls:[],specials:[],village:{x:0,z:0},heightAt:()=>0};
 const f={p:{x:0,z:0,y:100},state:'flying',airtime:0,distance:0};
 progress.update(f,{},world);assert.equal(progress.challenges.has('visita-vila'),false);
 f.p.y=30;f.state='crumpled';progress.update(f,{},world);assert.equal(progress.challenges.has('visita-vila'),false);
 f.state='flying';f.p.x=91;progress.update(f,{},world);assert.equal(progress.challenges.has('visita-vila'),false);
 f.p.x=89;progress.update(f,{},world);progress.update(f,{},world);
 assert.deepEqual(progress.newChallenges,['visita-vila']);progress.save(0);
 const restored=new Progress('visit');assert.ok(restored.challenges.has('termal'));assert.ok(restored.challenges.has('visita-vila'));
 delete globalThis.localStorage;
});
test('short village approach succeeds with real flight in twelve seeds without boosts',()=>{
 for(let i=0;i<12;i++){
 const world=new WorldModel('village-review-'+i),v=world.village,f=new Flight(world),progress=new Progress('sim-'+i);
 f.practiceBridge({entry:{x:v.x,z:v.z-110,y:Math.max(world.heightAt(v.x,v.z-110),v.y)+35,yaw:Math.PI}});
 const chunks={nearby:()=>[]};
 for(let j=0;j<1200&&!progress.challenges.has('visita-vila');j++){
 const time=j/120,w=windAt(world,chunks,f.p,time,weather(world,time,{dayCycle:false,weather:false}));
 f.step(1/120,{turn:0,pitch:0,charge:false},w,chunks);progress.update(f,w,world);
 }
 assert.ok(progress.challenges.has('visita-vila'),'seed '+i);assert.equal(f.state,'flying');assert.equal(f.boosts,5);
 }
});
