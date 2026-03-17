const CONFIG = {
  // 풍선
  BALLOON_COUNT: 10,
  BALLOON_COLORS: ['#ff6b6b','#ffd93d','#6bcb77','#4d96ff','#c77dff','#ff9f1c','#ff85a1','#00d4aa'],
  BALLOON_RADIUS_MIN: 28,
  BALLOON_RADIUS_MAX: 48,
  BALLOON_SPEED_MIN: 60,   // px/sec
  BALLOON_SPEED_MAX: 130,
  BALLOON_WOBBLE_AMP: 18,  // 좌우 흔들림 진폭 (px)
  BALLOON_WOBBLE_FREQ: 1.2,// 흔들림 주파수
  BALLOON_HIT_MARGIN: 1.2, // 터치 히트박스 20% 확대

  // 게임
  COUNTDOWN: 3,
  DEFAULT_TIME: 60,       // 초 (0 = 무제한)
  TIME_OPTIONS: [30, 60, 0],

  // 점수
  SCORE_POP: 10,
  SCORE_BOMB: -20,
  SCORE_BONUS: 30,
  COMBO_WINDOW: 1500,     // ms — 이 시간 내 연속 터트리면 콤보
  COMBO_MULTIPLIERS: [1, 1.5, 2, 2.5, 3, 4, 5],

  // 특수 풍선 확률 (0~1)
  PROB_BOMB:  0.08,
  PROB_BONUS: 0.06,

  // UI
  HUD_HEIGHT: 70,
  FONT_FAMILY: '"Segoe UI", "Apple SD Gothic Neo", sans-serif',
  AVATARS: ['🐶','🐱','🐸','🦊','🐼','🦄'],
};
