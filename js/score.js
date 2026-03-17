class ScoreManager {
  constructor() {
    this.reset();
  }

  reset() {
    this.score       = 0;
    this.combo       = 0;
    this.maxCombo    = 0;
    this.popCount    = 0;   // 터트린 풍선 수
    this.missCount   = 0;   // 절반 넘어 자동 터진 수
    this._lastPopTime = 0;  // 콤보 타이머용
    this.comboText   = null; // { text, x, y, alpha, vy }
  }

  // 풍선 터트렸을 때 (손으로)
  pop(x, y, now) {
    const gap = now - this._lastPopTime;
    this._lastPopTime = now;

    if (gap < CONFIG.COMBO_WINDOW) {
      this.combo++;
    } else {
      this.combo = 1;
    }
    this.maxCombo = Math.max(this.maxCombo, this.combo);

    const mult = CONFIG.COMBO_MULTIPLIERS[Math.min(this.combo - 1, CONFIG.COMBO_MULTIPLIERS.length - 1)];
    const gained = Math.round(CONFIG.SCORE_POP * mult);
    this.score    += gained;
    this.popCount++;

    // 콤보 텍스트 이펙트
    if (this.combo >= 3) {
      const labels = ['','','','콤보!','대박!','최고!','완벽!','천재!','신이다!'];
      this.comboText = {
        text:  (labels[Math.min(this.combo, labels.length-1)] || '🔥') + ` ×${this.combo}`,
        x, y,
        alpha: 1,
        vy:   -60,
        size: Math.min(36, 24 + this.combo * 2),
      };
    }

    return { gained, mult, combo: this.combo };
  }

  // 절반 넘어 자동 터진 경우
  miss() {
    this.missCount++;
    this.combo = 0; // 콤보 리셋
  }

  // 정확도 (%)
  get accuracy() {
    const total = this.popCount + this.missCount;
    return total === 0 ? 100 : Math.round((this.popCount / total) * 100);
  }

  // 콤보 텍스트 업데이트 (dt 초)
  updateComboText(dt) {
    if (!this.comboText) return;
    this.comboText.y     += this.comboText.vy * dt;
    this.comboText.alpha -= dt * 1.5;
    if (this.comboText.alpha <= 0) this.comboText = null;
  }

  // 콤보 텍스트 그리기
  drawComboText(ctx) {
    if (!this.comboText) return;
    const { text, x, y, alpha, size } = this.comboText;
    ctx.save();
    ctx.globalAlpha  = alpha;
    ctx.font         = `bold ${size}px ${CONFIG.FONT_FAMILY}`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor  = '#ff6b00';
    ctx.shadowBlur   = 14;
    ctx.fillStyle    = '#ffd700';
    ctx.fillText(text, x, y);
    ctx.restore();
  }
}
