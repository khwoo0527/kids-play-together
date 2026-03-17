class Balloon {
  constructor(canvasWidth, canvasHeight) {
    this.canvasWidth  = canvasWidth;
    this.canvasHeight = canvasHeight;
    this.reset();
  }

  // 풍선을 화면 하단에서 새로 시작
  reset() {
    const { BALLOON_RADIUS_MIN, BALLOON_RADIUS_MAX, BALLOON_COLORS,
            BALLOON_SPEED_MIN, BALLOON_SPEED_MAX,
            BALLOON_WOBBLE_AMP, BALLOON_WOBBLE_FREQ } = CONFIG;

    this.rx = BALLOON_RADIUS_MIN + Math.random() * (BALLOON_RADIUS_MAX - BALLOON_RADIUS_MIN);
    this.ry = this.rx * 1.25; // 세로로 약간 길게

    // x 위치: 좌우 여백 확보
    this.x     = this.rx * 2 + Math.random() * (this.canvasWidth - this.rx * 4);
    this.baseX = this.x; // 흔들림 기준 x
    this.y     = this.canvasHeight + this.ry + 10; // 화면 아래에서 시작

    this.speed   = BALLOON_SPEED_MIN + Math.random() * (BALLOON_SPEED_MAX - BALLOON_SPEED_MIN);
    this.color   = BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)];
    this.wobbleAmp  = BALLOON_WOBBLE_AMP * (0.6 + Math.random() * 0.8);
    this.wobbleFreq = BALLOON_WOBBLE_FREQ * (0.7 + Math.random() * 0.6);
    this.wobbleOffset = Math.random() * Math.PI * 2; // 풍선마다 다른 위상

    this.alive = true;
  }

  update(dt, elapsed) {
    // 위로 이동
    this.y -= this.speed * dt;
    // 좌우 sin 흔들림
    this.x = this.baseX + Math.sin(elapsed * this.wobbleFreq + this.wobbleOffset) * this.wobbleAmp;
  }

  // 화면 절반 이상 올라갔는지 (HUD 아래 기준)
  isPastHalf(canvasHeight, hudHeight) {
    const halfY = hudHeight + (canvasHeight - hudHeight) / 2;
    return this.y - this.ry < halfY;
  }

  // 화면 위로 완전히 벗어났는지
  isOutOfScreen() {
    return this.y + this.ry < 0;
  }

  draw(ctx) {
    const { x, y, rx, ry, color } = this;

    // ── 몸통 그라데이션 ──
    const grd = ctx.createRadialGradient(
      x - rx * 0.3, y - ry * 0.3, rx * 0.08,
      x, y, Math.max(rx, ry)
    );
    grd.addColorStop(0, this._lighten(color, 70));
    grd.addColorStop(0.5, color);
    grd.addColorStop(1, this._darken(color, 50));

    ctx.beginPath();
    ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
    ctx.fillStyle = grd;
    ctx.fill();

    // ── 광택 ──
    ctx.beginPath();
    ctx.ellipse(x - rx * 0.28, y - ry * 0.3, rx * 0.22, ry * 0.18, -0.3, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fill();

    // ── 매듭 ──
    ctx.beginPath();
    ctx.arc(x, y + ry + 2, 5, 0, Math.PI * 2);
    ctx.fillStyle = this._darken(color, 35);
    ctx.fill();

    // ── 실 (아래 방향) ──
    ctx.beginPath();
    ctx.moveTo(x, y + ry + 7);
    ctx.bezierCurveTo(x + 10, y + ry + 30, x - 10, y + ry + 55, x, y + ry + 75);
    ctx.strokeStyle = this._darken(color, 20);
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  // ── 색상 유틸 ──
  _lighten(hex, amt) {
    const c = this._hexToRgb(hex);
    return `rgb(${Math.min(255,c.r+amt)},${Math.min(255,c.g+amt)},${Math.min(255,c.b+amt)})`;
  }
  _darken(hex, amt) {
    const c = this._hexToRgb(hex);
    return `rgb(${Math.max(0,c.r-amt)},${Math.max(0,c.g-amt)},${Math.max(0,c.b-amt)})`;
  }
  _hexToRgb(hex) {
    return {
      r: parseInt(hex.slice(1,3), 16),
      g: parseInt(hex.slice(3,5), 16),
      b: parseInt(hex.slice(5,7), 16),
    };
  }
}
