import * as T from "three";
import { random } from "../shared/math.js";
export class Life {
  constructor(scene, world, settings) {
    this.world = world;
    this.scene = scene;
    this.quality = settings.quality;
    this.dummy = new T.Object3D();
    const r = random(world.hash ^ 3821),
      stars = [];
    for (let i = 0; i < 250; i++) {
      const a = r() * Math.PI * 2,
        h = r() * 0.8 + 0.2;
      stars.push(Math.cos(a) * 900, 300 + h * 600, Math.sin(a) * 900);
    }
    const g = new T.BufferGeometry();
    g.setAttribute("position", new T.Float32BufferAttribute(stars, 3));
    this.stars = new T.Points(
      g,
      new T.PointsMaterial({
        color: 0xfff9d8,
        size: 2.2,
        transparent: true,
        opacity: 0,
        depthWrite: false,
        fog: false,
      }),
    );
    scene.add(this.stars);
    const lines = new Float32Array(180 * 6);
    this.rainG = new T.BufferGeometry();
    this.rainG.setAttribute("position", new T.BufferAttribute(lines, 3));
    this.rain = new T.LineSegments(
      this.rainG,
      new T.LineBasicMaterial({
        color: 0xc7dae3,
        transparent: true,
        opacity: 0.25,
      }),
    );
    this.rain.frustumCulled = false;
    scene.add(this.rain);
    this.smoke = new T.InstancedMesh(
      new T.SphereGeometry(1, 6, 4),
      new T.MeshBasicMaterial({
        color: 0xf4eee1,
        transparent: true,
        opacity: 0.28,
        depthWrite: false,
      }),
      16,
    );
    this.smoke.frustumCulled = false;
    scene.add(this.smoke);
    this.splashes = new T.InstancedMesh(
      new T.SphereGeometry(0.25, 4, 3),
      new T.MeshBasicMaterial({ color: 0xe9faf8 }),
      96,
    );
    this.splashes.frustumCulled = false;
    scene.add(this.splashes);
    this.margins = new T.LineSegments(
      new T.BufferGeometry(),
      new T.LineBasicMaterial({ color: 0xbd8b86 }),
    );
    const margin = [];
    for (const sign of [-1, 1])
      for (let i = -2048; i < 2048; i += 32) {
        for (const flip of [false, true]) {
          const x = flip ? i : sign * 2040,
            z = flip ? sign * 2040 : i,
            nx = flip ? i + 24 : x,
            nz = flip ? z : i + 24;
          margin.push(
            x,
            world.heightAt(x, z) + 3,
            z,
            nx,
            world.heightAt(nx, nz) + 3,
            nz,
          );
        }
      }
    this.margins.geometry.setAttribute(
      "position",
      new T.Float32BufferAttribute(margin, 3),
    );
    scene.add(this.margins);
    this.boats = [];
    for (const lake of world.lakes.slice(-2)) {
      const b = new T.Mesh(
        new T.ConeGeometry(3, 1.5, 3),
        new T.MeshStandardMaterial({ color: 0xfff0cf, flatShading: true }),
      );
      b.position.set(lake.x + lake.r * 0.4, lake.y + 1, lake.z);
      scene.add(b);
      this.boats.push(b);
    }
  }
  update(p, time, w, dt, thermals) {
    this.stars.position.set(p.x, 0, p.z);
    this.stars.material.opacity = Math.max(0, 1 - w.sun * 5) * 0.8;
    this.rain.visible = w.rain > 0.08;
    if (this.rain.visible) {
      const a = this.rainG.attributes.position.array;
      for (let i = 0; i < 180; i++) {
        const x = p.x + Math.sin(i * 77) * 55,
          z = p.z + Math.cos(i * 91) * 55,
          y = p.y + 35 - ((time * 25 + i * 7) % 70);
        a.set([x, y, z, x + w.x * 0.2, y - 3, z + w.z * 0.2], i * 6);
      }
      this.rainG.attributes.position.needsUpdate = true;
    }
    const v = this.world.village;
    this.smoke.visible = Math.hypot(p.x - v.x, p.z - v.z) < 300;
    for (let i = 0; i < 16; i++) {
      const a = (time * 0.08 + i / 16) % 1;
      this.dummy.position.set(
        v.x + w.x * a * 4,
        v.y + 15 + a * 45,
        v.z + w.z * a * 4,
      );
      this.dummy.scale.setScalar(1 + a * 3);
      this.dummy.updateMatrix();
      this.smoke.setMatrixAt(i, this.dummy.matrix);
    }
    this.smoke.instanceMatrix.needsUpdate = true;
    let count = 0;
    for (const f of this.world.falls) {
      if (Math.hypot(p.x - f.x, p.z - f.z) > 180) continue;
      for (let i = 0; i < 8 && count < 96; i++) {
        const a = (time * 0.7 + i / 8) % 1;
        this.dummy.position.set(
          f.x + Math.sin(i * 8) * a * f.width,
          f.bottom + Math.sin(a * Math.PI) * 3,
          f.z + Math.cos(i * 8) * a * 10,
        );
        this.dummy.scale.setScalar(1 - a * 0.5);
        this.dummy.updateMatrix();
        this.splashes.setMatrixAt(count++, this.dummy.matrix);
      }
    }
    this.splashes.count = count;
    this.splashes.instanceMatrix.needsUpdate = true;
    this.boats.forEach((b, i) => {
      b.rotation.z = Math.sin(time + i) * 0.09;
    });
  }
}
