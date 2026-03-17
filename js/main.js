// ── Canvas 초기화 ─────────────────────────────────────────
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');

let W, H, DPR;

function resizeCanvas() {
  DPR = window.devicePixelRatio || 1;
  W   = window.innerWidth;
  H   = window.innerHeight;

  // 실제 픽셀 해상도 (선명하게)
  canvas.width  = W * DPR;
  canvas.height = H * DPR;

  // CSS 크기는 윈도우와 동일
  canvas.style.width  = W + 'px';
  canvas.style.height = H + 'px';

  // DPR 보정: 이후 draw 좌표는 논리 픽셀 기준
  ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
}

window.addEventListener('resize', () => {
  resizeCanvas();
  // 풍선 위치 재계산
  balloons.forEach(b => {
    b.canvasWidth  = W;
    b.canvasHeight = H;
  });
});

// ── 배경 그리기 ───────────────────────────────────────────
function drawBackground() {
  const grd = ctx.createLinearGradient(0, 0, 0, H);
  grd.addColorStop(0, '#0a0a1a');
  grd.addColorStop(1, '#1a1a3e');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, W, H);

  // 별
  for (let i = 0; i < 60; i++) {
    const sx = (i * 137 + 20) % W;
    const sy = (i * 97) % (H * 0.45);
    const sr = 0.5 + (i % 3) * 0.5;
    ctx.beginPath();
    ctx.arc(sx, sy, sr, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(255,255,255,${0.3 + 0.4 * (i % 2)})`;
    ctx.fill();
  }
}

// ── 풍선 생성 ─────────────────────────────────────────────
const balloons = [];

function initBalloons() {
  balloons.length = 0;
  for (let i = 0; i < CONFIG.BALLOON_COUNT; i++) {
    const b = new Balloon(W, H);
    // 처음엔 화면 곳곳에 배치 (바닥 아닌 랜덤 y)
    b.y = H * 0.3 + Math.random() * H * 0.7;
    balloons.push(b);
  }
}

// ── 게임 루프 ─────────────────────────────────────────────
let lastTime = 0;
let elapsed  = 0; // 경과 시간 (초) — 흔들림 애니메이션용

function loop(timestamp) {
  const dt = Math.min((timestamp - lastTime) / 1000, 0.05); // 초 단위, 최대 50ms
  lastTime = timestamp;
  elapsed += dt;

  // 배경
  drawBackground();

  // 풍선 업데이트 & 그리기
  balloons.forEach(b => {
    b.update(dt, elapsed);

    // 화면 위로 벗어나면 하단에서 재생성
    if (b.isOutOfScreen()) {
      b.reset();
    }

    b.draw(ctx);
  });

  requestAnimationFrame(loop);
}

// ── 시작 ─────────────────────────────────────────────────
resizeCanvas();
initBalloons();
requestAnimationFrame(loop);
