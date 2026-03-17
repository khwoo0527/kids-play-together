// ── 게임 상태 머신 ────────────────────────────────
const GAME_STATE = {
  READY:     'ready',
  COUNTDOWN: 'countdown',
  PLAYING:   'playing',
  RESULT:    'result',
};

class GameManager {
  constructor() {
    this.state        = GAME_STATE.READY;
    this.selectedTime = CONFIG.DEFAULT_TIME; // 0 = 무제한
    this._cdVal       = CONFIG.COUNTDOWN;
    this._cdTimer     = 0;
    this._onPlay      = null;
    this._onResult    = null;
  }

  onPlay(fn)   { this._onPlay   = fn; }
  onResult(fn) { this._onResult = fn; }

  startCountdown() {
    this.state    = GAME_STATE.COUNTDOWN;
    this._cdVal   = CONFIG.COUNTDOWN;
    this._cdTimer = 1.0;
  }

  update(dt) {
    if (this.state !== GAME_STATE.COUNTDOWN) return;
    this._cdTimer -= dt;
    if (this._cdTimer <= 0) {
      this._cdVal--;
      if (this._cdVal <= 0) {
        this.state = GAME_STATE.PLAYING;
        if (this._onPlay) this._onPlay();
      } else {
        this._cdTimer = 1.0;
      }
    }
  }

  endGame() {
    if (this.state !== GAME_STATE.PLAYING) return;
    this.state = GAME_STATE.RESULT;
    if (this._onResult) this._onResult();
  }

  restart() {
    this.state    = GAME_STATE.READY;
    this._cdVal   = CONFIG.COUNTDOWN;
    this._cdTimer = 0;
  }

  // 카운트다운 숫자 (3,2,1)
  get cdVal()     { return this._cdVal; }
  // 현재 숫자가 남은 비율 (1.0→0.0)
  get cdFrac()    { return this._cdTimer; }

  get isReady()   { return this.state === GAME_STATE.READY; }
  get isCd()      { return this.state === GAME_STATE.COUNTDOWN; }
  get isPlaying() { return this.state === GAME_STATE.PLAYING; }
  get isResult()  { return this.state === GAME_STATE.RESULT; }
}
