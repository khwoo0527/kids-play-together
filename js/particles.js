// ── 파티클 시스템 ─────────────────────────────────────────
class ParticleSystem {
  constructor() {
    this.particles = [];
  }

  // 풍선 터질 때 파티클 생성
  burst(x, y, color) {
    const count = 18;
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 / count) * i + Math.random() * 0.4;
      const speed = 120 + Math.random() * 200;
      const size  = 4 + Math.random() * 6;
      this.particles.push({
        x, y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 80, // 살짝 위로
        size,
        color: Math.random() < 0.5 ? color : this._randColor(),
        alpha: 1,
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 10,
        shape: Math.random() < 0.5 ? 'rect' : 'circle',
        life: 0.55 + Math.random() * 0.3,
        maxLife: 0,
      });
      this.particles[this.particles.length - 1].maxLife =
        this.particles[this.particles.length - 1].life;
    }
  }

  _randColor() {
    const colors = ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#c77dff','#ff9f1c','#ff85a1','#00d4aa'];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  update(dt) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const p = this.particles[i];
      p.x    += p.vx * dt;
      p.y    += p.vy * dt;
      p.vy   += 420 * dt; // 중력
      p.vx   *= 0.97;
      p.rot  += p.rotV * dt;
      p.life -= dt;
      p.alpha = Math.max(0, p.life / p.maxLife);
      if (p.life <= 0) this.particles.splice(i, 1);
    }
  }

  draw(ctx) {
    this.particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = p.alpha;
      ctx.fillStyle   = p.color;
      ctx.translate(p.x, p.y);
      ctx.rotate(p.rot);

      if (p.shape === 'rect') {
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
      } else {
        ctx.beginPath();
        ctx.arc(0, 0, p.size / 2, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    });
    ctx.globalAlpha = 1;
  }
}

const particles = new ParticleSystem();
