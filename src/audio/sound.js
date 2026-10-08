export class Sound {
  constructor(settings, world) {
    this.settings = settings;
    try {
      this.ctx = new AudioContext();
      const c = this.ctx;
      this.master = c.createGain();
      this.master.gain.value = settings.sound ? settings.volume * 0.12 : 0;
      this.master.connect(c.destination);
      const buffer = c.createBuffer(1, c.sampleRate * 2, c.sampleRate),
        data = buffer.getChannelData(0);
      let last = 0;
      for (let i = 0; i < data.length; i++) {
        last = (last + Math.random() * 0.1 - 0.05) * 0.98;
        data[i] = last;
      }
      this.sources = world.falls.slice(0, 3).map((f) => {
        const source = c.createBufferSource(),
          gain = c.createGain(),
          pan = c.createPanner();
        pan.panningModel = "HRTF";
        pan.distanceModel = "inverse";
        pan.refDistance = 20;
        pan.maxDistance = 300;
        pan.positionX.value = f.x;
        pan.positionY.value = f.bottom;
        pan.positionZ.value = f.z;
        source.buffer = buffer;
        source.loop = true;
        source.connect(gain);
        gain.connect(pan);
        pan.connect(this.master);
        source.start();
        return { f, gain, pan };
      });
      this.ctx.resume();
    } catch {}
    this.next = 0;
  }
  tone(frequency, duration = 0.09) {
    if (!this.ctx) return;
    const c = this.ctx,
      o = c.createOscillator(),
      g = c.createGain();
    o.type = "sine";
    o.frequency.value = frequency;
    g.gain.setValueAtTime(0.25, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
    o.connect(g);
    g.connect(this.master);
    o.start();
    o.stop(c.currentTime + duration);
  }
  update(p, vy, time) {
    if (!this.ctx) return;
    const listener = this.ctx.listener;
    listener.positionX.value = p.x;
    listener.positionY.value = p.y;
    listener.positionZ.value = p.z;
    listener.forwardX.value = -Math.sin(p.yaw);
    listener.forwardY.value = 0;
    listener.forwardZ.value = -Math.cos(p.yaw);
    listener.upY.value = 1;
    this.master.gain.value = this.settings.sound
      ? this.settings.volume * 0.16
      : 0;
    for (const { f, gain, pan } of this.sources) {
      const dx = f.x - p.x,
        dz = f.z - p.z,
        d = Math.hypot(dx, dz, p.y - f.bottom);
      gain.gain.value = Math.max(0, 1 - d / 180);
    }
    if (this.settings.vario && vy > 1 && time > this.next) {
      this.tone(550 + vy * 50, 0.08);
      this.next = time + Math.max(0.15, 0.7 - vy * 0.07);
    }
    if (time > this.nextBird) {
      this.tone(1400, 0.07);
      this.nextBird = time + 12;
    }
    if (!this.nextBird) this.nextBird = time + 8;
  }
}
