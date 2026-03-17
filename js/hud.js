class HUD {
  // score: ScoreManager, timeLeft: 남은 초 (null=무제한)
  draw(ctx, W, H, score, timeLeft, timeTotal) {
    const hh = CONFIG.HUD_HEIGHT;

    // ── 배경 ──
    ctx.save();
    ctx.fillStyle = 'rgba(0,0,0,0.45)';
    ctx.beginPath();
    ctx.roundRect(8, 8, W - 16, hh - 4, 16);
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    const mid = 8 + (hh - 4) / 2;
    const fs  = Math.min(12, H * 0.016);

    // ── 점수 (좌) ──
    ctx.save();
    ctx.textAlign    = 'left';
    ctx.textBaseline = 'middle';
    ctx.font = `${fs}px ${CONFIG.FONT_FAMILY}`;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText('점수', 22, mid - 12);

    ctx.font = `bold ${Math.min(28, H * 0.038)}px ${CONFIG.FONT_FAMILY}`;
    ctx.fillStyle = '#ffd700';
    ctx.shadowColor = '#ffaa00';
    ctx.shadowBlur  = 8;
    ctx.fillText(score.score.toLocaleString(), 22, mid + 10);
    ctx.restore();

    // ── 타이머 (중앙) ──
    const barW = Math.min(160, W * 0.3);
    const barH = 20;
    const barX = W / 2 - barW / 2;
    const barY = mid - barH / 2;

    ctx.save();
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = `${fs}px ${CONFIG.FONT_FAMILY}`;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText('⏱ 남은 시간', W / 2, mid - 16);

    if (timeLeft === null) {
      // 무제한
      ctx.font = `bold ${Math.min(16, H*0.022)}px ${CONFIG.FONT_FAMILY}`;
      ctx.fillStyle = '#80d4ff';
      ctx.fillText('∞', W / 2, mid + 8);
    } else {
      // 타이머 바
      ctx.fillStyle = 'rgba(255,255,255,0.12)';
      ctx.beginPath(); ctx.roundRect(barX, barY, barW, barH, barH/2); ctx.fill();

      const ratio  = Math.max(0, timeLeft / timeTotal);
      const color  = ratio > 0.5 ? '#4d96ff' : ratio > 0.25 ? '#ffd700' : '#ff4444';
      ctx.fillStyle = color;
      ctx.shadowColor = color;
      ctx.shadowBlur  = 6;
      ctx.beginPath(); ctx.roundRect(barX, barY, barW * ratio, barH, barH/2); ctx.fill();
      ctx.shadowBlur = 0;

      ctx.font = `bold ${Math.min(14, H*0.019)}px ${CONFIG.FONT_FAMILY}`;
      ctx.fillStyle = 'white';
      ctx.fillText(Math.ceil(timeLeft) + '초', W / 2, mid + 8);
    }
    ctx.restore();

    // ── 콤보 (우) ──
    ctx.save();
    ctx.textAlign    = 'right';
    ctx.textBaseline = 'middle';
    ctx.font = `${fs}px ${CONFIG.FONT_FAMILY}`;
    ctx.fillStyle = 'rgba(255,255,255,0.55)';
    ctx.fillText('COMBO', W - 22, mid - 12);

    ctx.font = `bold ${Math.min(26, H*0.035)}px ${CONFIG.FONT_FAMILY}`;
    ctx.fillStyle = score.combo >= 3 ? '#ff6b6b' : 'rgba(255,255,255,0.4)';
    ctx.shadowColor = '#ff0000';
    ctx.shadowBlur  = score.combo >= 3 ? 10 : 0;
    ctx.fillText(score.combo >= 2 ? `×${score.combo} 🔥` : '×1', W - 22, mid + 10);
    ctx.restore();
  }
}
