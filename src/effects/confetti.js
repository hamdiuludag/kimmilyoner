// Canvas tabanlı konfeti, parçacık sistemi, ışık patlaması, altın parçacıkları, yıldız animasyonu.

export class Efektler {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.particles = [];
    this.running = false;
    this.dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.resize();
    window.addEventListener('resize', () => this.resize());
  }

  resize() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    this.canvas.width = w * this.dpr;
    this.canvas.height = h * this.dpr;
    this.canvas.style.width = w + 'px';
    this.canvas.style.height = h + 'px';
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.w = w; this.h = h;
  }

  konfeti(adet = 180) {
    const renkler = ['#f5b942', '#e3a823', '#ffffff', '#4a90e2', '#27ae60', '#e74c3c', '#9b59b6'];
    for (let i = 0; i < adet; i++) {
      this.particles.push({
        x: Math.random() * this.w,
        y: -20 - Math.random() * 100,
        vx: (Math.random() - 0.5) * 3,
        vy: 2 + Math.random() * 4,
        size: 4 + Math.random() * 6,
        rot: Math.random() * Math.PI * 2,
        vr: (Math.random() - 0.5) * 0.3,
        color: renkler[Math.floor(Math.random() * renkler.length)],
        life: 1,
        shape: Math.random() < 0.5 ? 'rect' : 'star',
      });
    }
    this.start();
  }

  altin(adet = 60) {
    for (let i = 0; i < adet; i++) {
      this.particles.push({
        x: this.w / 2,
        y: this.h / 2,
        vx: (Math.random() - 0.5) * 12,
        vy: (Math.random() - 0.5) * 12,
        size: 3 + Math.random() * 5,
        rot: 0, vr: 0,
        color: '#f5d77e',
        life: 1,
        decay: 0.012,
        shape: 'gold',
        gravity: 0.15,
      });
    }
    this.start();
  }

  patlama(x, y, renk = '#f5b942', adet = 40) {
    for (let i = 0; i < adet; i++) {
      const a = (Math.PI * 2 * i) / adet;
      const sp = 3 + Math.random() * 5;
      this.particles.push({
        x, y,
        vx: Math.cos(a) * sp,
        vy: Math.sin(a) * sp,
        size: 2 + Math.random() * 4,
        rot: 0, vr: 0,
        color: renk,
        life: 1,
        decay: 0.02,
        shape: 'spark',
        gravity: 0,
      });
    }
    this.start();
  }

  yildiz(adet = 12) {
    for (let i = 0; i < adet; i++) {
      this.particles.push({
        x: Math.random() * this.w,
        y: Math.random() * this.h,
        vx: 0, vy: 0,
        size: 6 + Math.random() * 10,
        rot: 0, vr: 0.02,
        color: '#fff7d6',
        life: 1,
        decay: 0.008,
        shape: 'star',
        twinkle: Math.random() * Math.PI * 2,
      });
    }
    this.start();
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.loop();
  }

  loop() {
    if (!this.running) return;
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.w, this.h);
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x += p.vx;
      p.y += p.vy;
      if (p.gravity) p.vy += p.gravity;
      p.rot += p.vr;
      if (p.decay) p.life -= p.decay;
      else if (p.y > this.h + 40) p.life = 0;
      if (p.life <= 0) { this.particles.splice(i, 1); continue; }
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.life);
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);
      ctx.fillStyle = p.color;
      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
      } else if (p.shape === 'star' || p.shape === 'gold') {
        this.drawStar(ctx, 0, 0, 5, p.size, p.size / 2);
      } else if (p.shape === 'spark') {
        ctx.beginPath();
        ctx.arc(0, 0, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    if (this.particles.length === 0) {
      this.running = false;
      ctx.clearRect(0, 0, this.w, this.h);
      return;
    }
    requestAnimationFrame(() => this.loop());
  }

  drawStar(ctx, cx, cy, spikes, outer, inner) {
    let rot = -Math.PI / 2;
    const step = Math.PI / spikes;
    ctx.beginPath();
    ctx.moveTo(cx, cy - outer);
    for (let i = 0; i < spikes; i++) {
      let x = cx + Math.cos(rot) * outer;
      let y = cy + Math.sin(rot) * outer;
      ctx.lineTo(x, y);
      rot += step;
      x = cx + Math.cos(rot) * inner;
      y = cy + Math.sin(rot) * inner;
      ctx.lineTo(x, y);
      rot += step;
    }
    ctx.closePath();
    ctx.fill();
  }

  temizle() {
    this.particles = [];
    this.running = false;
    this.ctx.clearRect(0, 0, this.w, this.h);
  }
}
