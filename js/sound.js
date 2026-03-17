// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  SoundManager
//  BGM : BGM.mp3 (7초~50초 루프)
//  SFX : Web Audio API 합성
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
class SoundManager {
  constructor() {
    this._ctx      = null;
    this._bgmAudio = null;
    this._ready    = false;
    this._bgmOn    = true;
  }

  init() {
    if (this._ready) return;
    this._ctx   = new (window.AudioContext || window.webkitAudioContext)();
    this._ready = true;
    this._startBGM();
  }

  // ─────────────────────────────────────────────────
  //  팝 소리 — 뽁!
  // ─────────────────────────────────────────────────
  pop(combo = 1) {
    if (!this._ready) return;
    const ac  = this._ctx;
    const now = ac.currentTime;
    const base = 320 + combo * 55;

    const nLen  = Math.floor(ac.sampleRate * 0.018);
    const nBuf  = ac.createBuffer(1, nLen, ac.sampleRate);
    const nData = nBuf.getChannelData(0);
    for (let i = 0; i < nLen; i++) nData[i] = Math.random() * 2 - 1;
    const nSrc = ac.createBufferSource();
    const nFlt = ac.createBiquadFilter();
    const nG   = ac.createGain();
    nFlt.type = 'bandpass'; nFlt.frequency.value = 2000; nFlt.Q.value = 0.7;
    nSrc.buffer = nBuf;
    nSrc.connect(nFlt); nFlt.connect(nG); nG.connect(ac.destination);
    nG.gain.setValueAtTime(0.55, now);
    nG.gain.exponentialRampToValueAtTime(0.001, now + 0.045);
    nSrc.start(now);

    const o1 = ac.createOscillator(), g1 = ac.createGain();
    o1.connect(g1); g1.connect(ac.destination);
    o1.type = 'sine';
    o1.frequency.setValueAtTime(base * 1.4, now);
    o1.frequency.exponentialRampToValueAtTime(base * 2.2, now + 0.012);
    o1.frequency.exponentialRampToValueAtTime(base * 0.55, now + 0.11);
    g1.gain.setValueAtTime(0.5, now);
    g1.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
    o1.start(now); o1.stop(now + 0.14);

    const o2 = ac.createOscillator(), g2 = ac.createGain();
    o2.connect(g2); g2.connect(ac.destination);
    o2.type = 'triangle';
    o2.frequency.setValueAtTime(base * 3.8, now);
    o2.frequency.exponentialRampToValueAtTime(base * 5.5, now + 0.035);
    g2.gain.setValueAtTime(0.22, now);
    g2.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
    o2.start(now); o2.stop(now + 0.08);
  }

  // ─────────────────────────────────────────────────
  //  콤보 — 마림바 아르페지오 + 마지막 화음 + 반짝이
  //  콤보 수가 많을수록 음 더 많아지고 빨라짐
  // ─────────────────────────────────────────────────
  combo(count) {
    if (!this._ready) return;
    const ac  = this._ctx;
    const now = ac.currentTime;

    // C 장조 5음계: 도레미솔라도
    const SCALE = [523, 659, 784, 1047, 1319, 1568, 2093];
    const n     = Math.min(count, SCALE.length);
    const STEP  = Math.max(0.045, 0.08 - count * 0.005); // 콤보 높을수록 빠르게

    // 아르페지오
    for (let i = 0; i < n; i++) {
      this._marimba(SCALE[i], now + i * STEP, 0.28 + i * 0.02);
    }

    // 마지막 화음 펀치 (루트 + 5도 + 옥타브)
    const endT = now + n * STEP + 0.02;
    this._marimba(SCALE[0],       endT, 0.45);
    this._marimba(SCALE[0] * 1.5, endT, 0.35);
    this._marimba(SCALE[0] * 2,   endT, 0.30);

    // 반짝이 (고음 sweep)
    this._sparkle(endT);
  }

  // ─────────────────────────────────────────────────
  //  마림바 플럭 한 음 — 탁! 하고 빠르게 감쇠
  // ─────────────────────────────────────────────────
  _marimba(freq, t, vol = 0.30) {
    const ac = this._ctx;
    const o1 = ac.createOscillator();
    const o2 = ac.createOscillator();
    const g  = ac.createGain();
    const g2 = ac.createGain();

    o1.type = 'sine';     o1.frequency.value = freq;
    o2.type = 'triangle'; o2.frequency.value = freq * 2.76; // 비조화 배음 = 목금 느낌
    g2.gain.value = 0.22;

    o1.connect(g); o2.connect(g2); g2.connect(g);
    g.connect(ac.destination);

    g.gain.setValueAtTime(vol, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.30);
    o1.start(t); o1.stop(t + 0.31);
    o2.start(t); o2.stop(t + 0.31);
  }

  // ─────────────────────────────────────────────────
  //  반짝이 효과음 — 고음 피치 업 sweep
  // ─────────────────────────────────────────────────
  _sparkle(t) {
    const ac = this._ctx;
    const o  = ac.createOscillator();
    const g  = ac.createGain();
    o.type = 'sine';
    o.frequency.setValueAtTime(1800, t);
    o.frequency.exponentialRampToValueAtTime(4200, t + 0.18);
    o.connect(g); g.connect(ac.destination);
    g.gain.setValueAtTime(0.18, t);
    g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
    o.start(t); o.stop(t + 0.23);
  }

  // ─────────────────────────────────────────────────
  //  BGM — BGM.mp3, 7초~50초 루프
  // ─────────────────────────────────────────────────
  _startBGM() {
    const BGM_START = 7.0;
    const BGM_END   = 50.0;

    const audio = new Audio('BGM.mp3');
    audio.volume = 0.45;

    // 50초 도달하면 7초로 되돌림
    audio.addEventListener('timeupdate', () => {
      if (audio.currentTime >= BGM_END) {
        audio.currentTime = BGM_START;
      }
    });

    // 로드 완료 후 7초 지점부터 재생
    audio.addEventListener('canplay', () => {
      audio.currentTime = BGM_START;
      if (this._bgmOn) {
        audio.play().catch(e => console.warn('BGM 재생 실패:', e));
      }
    }, { once: true });

    this._bgmAudio = audio;
  }

  // ─────────────────────────────────────────────────
  //  BGM 토글
  // ─────────────────────────────────────────────────
  get bgmOn() { return this._bgmOn !== false; }

  toggleBGM() {
    this._bgmOn = !this.bgmOn;
    if (this._bgmAudio) {
      if (this._bgmOn) {
        this._bgmAudio.play().catch(() => {});
      } else {
        this._bgmAudio.pause();
      }
    }
    return this._bgmOn;
  }

  _resumeForSFX() {
    if (this._ctx && this._ctx.state === 'suspended') {
      this._ctx.resume();
    }
  }
}

const sound = new SoundManager();
