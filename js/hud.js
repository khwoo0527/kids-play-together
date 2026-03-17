class HUD {
  draw(ctx, W, H, score, timeLeft, timeTotal) {
    const hh = CONFIG.HUD_HEIGHT;

    // ── 배경 ──
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    ctx.beginPath();
    ctx.roundRect(8, 8, W - 16, hh - 4, 18);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.09)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    const mid   = 8 + (hh - 4) / 2;
    const label = Math.min(16, H * 0.021);
    const valFs = Math.min(40, H * 0.052);

    // ── 점수 (좌) ──
    ctx.save();
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    ctx.font      = `${label}px ${CONFIG.FONT_FAMILY}`;
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('점수', 22, mid - 20);

    ctx.font        = `bold ${valFs}px ${CONFIG.FONT_FAMILY}`;
    ctx.fillStyle   = '#ffd700';
    ctx.shadowColor = '#ffaa00';
    ctx.shadowBlur  = 10;
    ctx.fillText(score.score.toLocaleString(), 22, mid + 14);
    ctx.restore();

    // ── 타이머 (중앙) ──
    const barW = Math.min(280, W * 0.38);
    const barH = 28;                          // 바 두께 키움
    const barX = W / 2 - barW / 2;
    const labelY = mid - 24;
    const barY   = labelY + label + 8;
    const numY   = barY + barH + 16;

    ctx.save();
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';

    // 라벨
    ctx.font      = `${label}px ${CONFIG.FONT_FAMILY}`;
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('⏱ 남은 시간', W / 2, labelY);

    // 바 배경
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    ctx.beginPath(); ctx.roundRect(barX, barY, barW, barH, barH / 2); ctx.fill();

    // 바 채움
    const ratio = Math.max(0, (timeLeft ?? 1) / (timeTotal || 1));
    const color = ratio > 0.5 ? '#4d96ff' : ratio > 0.25 ? '#ffd700' : '#ff4444';
    if (ratio > 0) {
      ctx.fillStyle   = color;
      ctx.shadowColor = color;
      ctx.shadowBlur  = 10;
      ctx.beginPath(); ctx.roundRect(barX, barY, barW * ratio, barH, barH / 2); ctx.fill();
      ctx.shadowBlur = 0;
    }

    // 남은 시간 숫자 — 크게
    const timeFs    = Math.min(40, H * 0.052);
    const display   = timeLeft === null ? '∞' : Math.ceil(timeLeft) + '초';
    ctx.font        = `900 ${timeFs}px ${CONFIG.FONT_FAMILY}`;
    ctx.fillStyle   = '#fff';
    ctx.shadowColor = color;
    ctx.shadowBlur  = 12;
    ctx.fillText(display, W / 2, numY);
    ctx.restore();

    // ── 콤보 (우) ──
    ctx.save();
    ctx.textAlign    = 'right';
    ctx.textBaseline = 'middle';
    ctx.font      = `${label}px ${CONFIG.FONT_FAMILY}`;
    ctx.fillStyle = 'rgba(255,255,255,0.5)';
    ctx.fillText('COMBO', W - 22, mid - 20);

    ctx.font        = `bold ${Math.min(36, H * 0.047)}px ${CONFIG.FONT_FAMILY}`;
    ctx.fillStyle   = score.combo >= 3 ? '#ff6b6b' : 'rgba(255,255,255,0.4)';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur  = score.combo >= 3 ? 12 : 0;
    ctx.fillText(score.combo >= 2 ? `×${score.combo} 🔥` : '×1', W - 22, mid + 14);
    ctx.restore();
  }
}
