// ── Canvas 초기화 ─────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
let W, H, DPR;

function resizeCanvas() {
  DPR = window.devicePixelRatio || 1;
  W   = window.innerWidth;
  H   = window.innerHeight;
  canvas.width  = W * DPR;
  canvas.height = H * DPR;
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

window.addEventListener('resize', () => {
  resizeCanvas();
  initStars();
  balloons.forEach(b => { b.canvasWidth = W; b.canvasHeight = H; });
});

// ── 게임 매니저 ────────────────────────────────────────────
const gameManager = new GameManager();

// ── 절반선 Y ──────────────────────────────────────────────
function getHalfY() {
  return CONFIG.HUD_HEIGHT + (H - CONFIG.HUD_HEIGHT) / 2;
}

// ── 5각별 path ────────────────────────────────────────────
function drawStarPath(cx, cy, R, r, angle) {
  ctx.beginPath();
  for (let i = 0; i < 10; i++) {
    const a = angle + (i * Math.PI / 5);
    const d = i % 2 === 0 ? R : r;
    i === 0 ? ctx.moveTo(cx + d*Math.cos(a), cy + d*Math.sin(a))
            : ctx.lineTo(cx + d*Math.cos(a), cy + d*Math.sin(a));
  }
  ctx.closePath();
}

// ── 별 데이터 ─────────────────────────────────────────────
const STARS = [];

function initStars() {
  STARS.length = 0;

  function noOverlap(nx, ny, nr) {
    return STARS.every(s => {
      const dx = (nx - s.x) * W;
      const dy = (ny - s.y) * H;
      return Math.sqrt(dx*dx + dy*dy) > (nr + s.r) * 2.8;
    });
  }
  function place(r, tries = 80) {
    for (let t = 0; t < tries; t++) {
      const nx = 0.02 + Math.random() * 0.96;
      const ny = 0.01 + Math.random() * 0.46;
      if (noOverlap(nx, ny, r)) return { x: nx, y: ny };
    }
    return null;
  }

  const COLORS = [
    { fill:'#ffffff', glow:'#aaddff' },
    { fill:'#ffe566', glow:'#ffaa00' },
    { fill:'#ff9de2', glow:'#ff44bb' },
    { fill:'#80d4ff', glow:'#00aaff' },
    { fill:'#aaffaa', glow:'#44cc44' },
    { fill:'#ffb347', glow:'#ff6600' },
    { fill:'#cc99ff', glow:'#8844ff' },
    { fill:'#ff8888', glow:'#ff2222' },
    { fill:'#66ffee', glow:'#00ccaa' },
  ];
  let ci = 0;

  for (let i = 0; i < 12; i++) {
    const r = 10 + Math.random() * 7;
    const pos = place(r);
    if (!pos) continue;
    const c = COLORS[ci++ % COLORS.length];
    STARS.push({ x:pos.x, y:pos.y, r, fill:c.fill, glow:c.glow,
      twinkleSpeed: 1.0 + Math.random() * 1.5,
      twinkleOffset: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.5,
      rot: Math.random() * Math.PI * 2,
    });
  }
  for (let i = 0; i < 28; i++) {
    const r = 4 + Math.random() * 5;
    const pos = place(r, 50);
    if (!pos) continue;
    const c = COLORS[ci++ % COLORS.length];
    STARS.push({ x:pos.x, y:pos.y, r, fill:c.fill, glow:c.glow,
      twinkleSpeed: 1.5 + Math.random() * 2.5,
      twinkleOffset: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 1.0,
      rot: Math.random() * Math.PI * 2,
    });
  }
  for (let i = 0; i < 35; i++) {
    const r = 1.8 + Math.random() * 2.5;
    const pos = place(r, 30);
    if (!pos) continue;
    const c = COLORS[ci++ % COLORS.length];
    STARS.push({ x:pos.x, y:pos.y, r, fill:c.fill, glow:c.glow,
      twinkleSpeed: 2.5 + Math.random() * 3.5,
      twinkleOffset: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 2.0,
      rot: Math.random() * Math.PI * 2,
    });
  }
}

// ── 배경 그리기 ───────────────────────────────────────────
function drawBackground() {
  const grd = ctx.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0,   '#04041a');
  grd.addColorStop(0.5, '#0a0a2e');
  grd.addColorStop(1,   '#1a1a3e');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  const halfY = getHalfY();
  [
    { cx:0.25, cy:0.15, r:0.50, c:'rgba(80,30,160,0.12)' },
    { cx:0.75, cy:0.28, r:0.42, c:'rgba(20,60,180,0.10)' },
    { cx:0.50, cy:0.38, r:0.55, c:'rgba(140,20,90,0.08)' },
  ].forEach(n => {
    const ng = ctx.createRadialGradient(n.cx*W, n.cy*halfY, 0, n.cx*W, n.cy*halfY, n.r*W);
    ng.addColorStop(0, n.c);
    ng.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = ng;
    ctx.fillRect(0, 0, W, halfY);
  });

  STARS.forEach(s => {
    const sx  = s.x * W;
    const sy  = s.y * H;
    const rot = s.rot + elapsed * s.rotSpeed;
    const t   = 0.3 + 0.7 * Math.abs(Math.sin(elapsed * s.twinkleSpeed + s.twinkleOffset));

    ctx.save();
    ctx.globalAlpha = t;
    ctx.shadowColor = s.glow;
    ctx.shadowBlur  = s.r * 4;
    drawStarPath(sx, sy, s.r, s.r * 0.4, rot - Math.PI/2);
    ctx.fillStyle = s.fill;
    ctx.fill();
    ctx.restore();
  });

  ctx.globalAlpha = 1;
  ctx.shadowBlur  = 0;
}

// ── 절반선 ────────────────────────────────────────────────
function drawHalfLine() {
  const halfY = getHalfY();

  ctx.globalAlpha = 0.06;
  ctx.fillStyle = '#ff3333';
  ctx.fillRect(0, 0, W, halfY);
  ctx.globalAlpha = 1;

  ctx.setLineDash([14, 8]);
  ctx.strokeStyle = 'rgba(255,80,80,0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(0, halfY); ctx.lineTo(W, halfY);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.font = `bold ${Math.min(13, H*0.018)}px ${CONFIG.FONT_FAMILY}`;
  ctx.fillStyle = 'rgba(255,110,110,0.75)';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  ctx.fillText('⚡ 여기 넘으면 자동 터짐!', W - 12, halfY - 13);
}

// ── 카운트다운 그리기 ─────────────────────────────────────
function drawCountdown() {
  const val  = gameManager.cdVal;
  const frac = gameManager.cdFrac; // 1.0 → 0.0

  ctx.fillStyle = 'rgba(0,0,0,0.38)';
  ctx.fillRect(0, 0, W, H);

  const scale = 1.0 + (1.0 - frac) * 0.55;
  const alpha = Math.min(1, frac * 2.5);
  const size  = Math.min(W, H) * 0.28 * scale;

  ctx.save();
  ctx.globalAlpha  = alpha;
  ctx.font         = `900 ${size}px ${CONFIG.FONT_FAMILY}`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.shadowColor  = '#ff9f1c';
  ctx.shadowBlur   = 60;
  ctx.fillStyle    = '#ffffff';
  ctx.fillText(val.toString(), W / 2, H / 2);
  ctx.restore();
}

// ── 풍선 ──────────────────────────────────────────────────
const balloons = [];

function initBalloons() {
  balloons.length = 0;
  for (let i = 0; i < CONFIG.BALLOON_COUNT; i++) {
    const b = new Balloon(W, H);
    b.y = H + b.ry * 2;
    b.baseX = b.rx * 2 + Math.random() * (W - b.rx * 4);
    b.x = b.baseX;
    b.wobbleOffset = (i / CONFIG.BALLOON_COUNT) * Math.PI * 2;
    balloons.push(b);
  }
}

function respawnBalloon(b) {
  b.reset();
  let tries = 0;
  while (tries++ < 10) {
    const nx = b.rx * 2 + Math.random() * (W - b.rx * 4);
    const tooClose = balloons.some(other =>
      other !== b && Math.abs(other.x - nx) < b.rx * 2.5 && other.y > H * 0.8
    );
    if (!tooClose) { b.baseX = nx; b.x = nx; break; }
  }
}

// ── 점수 / HUD ────────────────────────────────────────────
const scoreManager = new ScoreManager();
const hud          = new HUD();

let timeTotal = CONFIG.DEFAULT_TIME;
let timeLeft  = null;

const scorePopups = [];

function addScorePopup(x, y, text) {
  scorePopups.push({ x, y, text, alpha: 1, vy: -80 });
}

function updateScorePopups(dt) {
  for (let i = scorePopups.length - 1; i >= 0; i--) {
    const p = scorePopups[i];
    p.y     += p.vy * dt;
    p.alpha -= dt * 2.2;
    if (p.alpha <= 0) scorePopups.splice(i, 1);
  }
}

function drawScorePopups() {
  scorePopups.forEach(p => {
    ctx.save();
    ctx.globalAlpha  = p.alpha;
    ctx.font         = `bold ${Math.min(30, H*0.04)}px ${CONFIG.FONT_FAMILY}`;
    ctx.textAlign    = 'center';
    ctx.textBaseline = 'middle';
    ctx.shadowColor  = '#ffaa00';
    ctx.shadowBlur   = 10;
    ctx.fillStyle    = '#ffffff';
    ctx.fillText(p.text, p.x, p.y);
    ctx.restore();
  });
}

// ── 터치 ──────────────────────────────────────────────────
function onTap(x, y) {
  sound.init();
  if (!gameManager.isPlaying) return;

  for (let i = balloons.length - 1; i >= 0; i--) {
    const b = balloons[i];
    if (!b.alive) continue;
    if (b.hitTest(x, y)) {
      b.alive = false;
      const result = scoreManager.pop(x, y, performance.now());
      addScorePopup(x, y - b.ry - 10, `+${result.gained}`);
      particles.burst(x, y, b.color);
      sound.pop(result.combo);
      if (result.combo >= 3) sound.combo(result.combo);
      respawnBalloon(b);
      break;
    }
  }
}

// ── 게임 시작 / 종료 콜백 ─────────────────────────────────
gameManager.onPlay(() => {
  scoreManager.reset();
  scorePopups.length = 0;
  timeTotal = gameManager.selectedTime;
  timeLeft  = timeTotal || null;
  btnEnd.classList.remove('hidden');
  // 풍선은 카운트다운 중에 이미 올라오고 있으므로 재초기화 안 함
});

gameManager.onResult(() => {
  const score    = scoreManager.score;
  const maxCombo = scoreManager.maxCombo;
  const accuracy = scoreManager.accuracy;
  const timeMode = gameManager.selectedTime === 0 ? '∞'
                 : gameManager.selectedTime + '초';

  document.getElementById('r-score').textContent = score;
  document.getElementById('r-combo').textContent = maxCombo;
  document.getElementById('r-acc').textContent   = accuracy + '%';

  // 플레이어 표시
  document.getElementById('result-player').textContent = `${playerAvatar} ${playerName}`;

  // 랭킹 저장
  rankingManager.save(score, maxCombo, accuracy, timeMode, playerName, playerAvatar);

  // 랭킹 렌더링
  const top  = rankingManager.getTop(5);
  const list = document.getElementById('ranking-list');
  if (top.length === 0) {
    list.innerHTML = '<div class="rank-empty">아직 기록이 없어요!</div>';
  } else {
    const medals = ['gold', 'silver', 'bronze'];
    list.innerHTML = top.map((r, i) => {
      const isNew = i === 0 && r.score === score && r.name === playerName;
      const medal = i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `${i+1}`;
      return `<li>
        <span class="rank-num ${medals[i] || ''}">${medal}</span>
        <span style="font-size:28px">${r.avatar || '🎈'}</span>
        <span class="rank-score ${isNew ? 'new-record' : ''}">${r.score.toLocaleString()}점</span>
        <span class="rank-meta">${r.name || '익명'} · ${r.timeMode} · ${r.date}</span>
      </li>`;
    }).join('');
  }

  btnEnd.classList.add('hidden');
  document.getElementById('screen-result').classList.remove('hidden');
});

// ── 플레이어 정보 ─────────────────────────────────────────
let playerName   = '';
let playerAvatar = '🐶';

document.getElementById('avatarBtns').addEventListener('click', e => {
  const btn = e.target.closest('.avatar-btn');
  if (!btn) return;
  document.querySelectorAll('.avatar-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  playerAvatar = btn.dataset.avatar;
});

// ── 시작/결과 화면 버튼 ───────────────────────────────────
document.querySelectorAll('.time-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.time-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    gameManager.selectedTime = Number(btn.dataset.time);
  });
});

document.getElementById('btn-start').addEventListener('click', () => {
  sound.init();
  playerName = document.getElementById('playerName').value.trim() || '익명';
  document.getElementById('screen-ready').classList.add('hidden');
  initBalloons();
  gameManager.startCountdown();
});

document.getElementById('btn-restart').addEventListener('click', () => {
  document.getElementById('screen-result').classList.add('hidden');
  gameManager.restart();
  document.getElementById('screen-ready').classList.remove('hidden');
});

// ── 끝내기 버튼 ───────────────────────────────────────────
const btnEnd = document.getElementById('btnEnd');
btnEnd.addEventListener('click', () => gameManager.endGame());

// ── BGM 토글 버튼 ─────────────────────────────────────────
const bgmBtn = document.getElementById('bgmToggle');
bgmBtn.addEventListener('click', () => {
  sound.init();
  const on = sound.toggleBGM();
  bgmBtn.textContent = on ? '🎵' : '🔇';
  bgmBtn.classList.toggle('off', !on);
});

// ── 게임 루프 ─────────────────────────────────────────────
let lastTime = 0;
let elapsed  = 0;

function loop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05);
  lastTime = timestamp;
  elapsed += dt;

  gameManager.update(dt);

  // 타이머 감소
  if (gameManager.isPlaying && timeLeft !== null) {
    timeLeft = Math.max(0, timeLeft - dt);
    if (timeLeft <= 0) gameManager.endGame();
  }

  drawBackground();

  if (gameManager.isPlaying || gameManager.isCd) {
    drawHalfLine();

    // 풍선 업데이트
    balloons.forEach(b => {
      b.update(dt, elapsed);
      if (gameManager.isPlaying) {
        if (b.isPastHalf(H, CONFIG.HUD_HEIGHT)) { scoreManager.miss(); respawnBalloon(b); return; }
        if (b.isOutOfScreen()) { respawnBalloon(b); return; }
      } else if (gameManager.isCd) {
        if (b.isOutOfScreen()) respawnBalloon(b); // 카운트다운 중 화면 밖 나가면 재스폰
      }
    });

    // 풍선 그리기
    balloons.forEach(b => {
      if (b.alive && !b.isPastHalf(H, CONFIG.HUD_HEIGHT) && !b.isOutOfScreen()) b.draw(ctx);
    });

    if (gameManager.isPlaying) {
      particles.update(dt);
      particles.draw(ctx);
      updateScorePopups(dt);
      drawScorePopups();
      scoreManager.updateComboText(dt);
      scoreManager.drawComboText(ctx);
      hud.draw(ctx, W, H, scoreManager, timeLeft, timeTotal || 1);
    }

    if (gameManager.isCd) drawCountdown();
  }

  requestAnimationFrame(loop);
}

// ── 시작 ──────────────────────────────────────────────────
resizeCanvas();
initStars();
initBalloons();
new InputHandler(canvas, onTap);
requestAnimationFrame(loop);
