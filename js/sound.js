class SoundManager {
  constructor() {
    this._ctx = null;
    this._bgmNode = null;
    this._bgmGain = null;
    this._ready = false;
  }

  // 브라우저 정책 — 첫 터치/클릭 시 초기화
  init() {
    if (this._ready) return;
    this._ctx   = new (window.AudioContext || window.webkitAudioContext)();
    this._ready = true;
    this._startBGM();
  }

  // ── 풍선 팝 소리 ── 귀엽고 통통튀는 소리
  pop(combo = 1) {
    if (!this._ready) return;
    this._resumeForSFX();
    const ac  = this._ctx;
    const now = ac.currentTime;

    // 콤보가 높을수록 음이 올라감
    const baseFreq = 520 + combo * 40;

    const osc  = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain);
    gain.connect(ac.destination);

    osc.type = 'sine';
    osc.frequency.setValueAtTime(baseFreq, now);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.6, now + 0.06);
    osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.5, now + 0.18);

    gain.gain.setValueAtTime(0.38, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);

    osc.start(now);
    osc.stop(now + 0.23);

    // 고음 반짝이 추가 (귀여운 느낌)
    const osc2  = ac.createOscillator();
    const gain2 = ac.createGain();
    osc2.connect(gain2);
    gain2.connect(ac.destination);
    osc2.type = 'triangle';
    osc2.frequency.setValueAtTime(baseFreq * 2.2, now);
    osc2.frequency.exponentialRampToValueAtTime(baseFreq * 3.5, now + 0.08);
    gain2.gain.setValueAtTime(0.18, now);
    gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
    osc2.start(now);
    osc2.stop(now + 0.16);
  }

  // ── 콤보 달성 소리 + 귀여운 보이스 ──
  combo(count) {
    if (!this._ready) return;
    const ac  = this._ctx;
    const now = ac.currentTime;

    // 콤보 레벨별 다른 징글
    if (count === 3) {
      // 3콤보: 짧고 귀여운 띵동띵~
      [[784,0],[1046,0.08],[1318,0.16]].forEach(([f,o]) => this._ding(f, now+o, 0.18));
    } else if (count === 4) {
      // 4콤보: 올라가는 4음
      [[784,0],[1046,0.07],[1318,0.14],[1568,0.21]].forEach(([f,o]) => this._ding(f, now+o, 0.16));
    } else if (count === 5) {
      // 5콤보: 팡파레 느낌
      [[1046,0],[1318,0.06],[1568,0.12],[1318,0.18],[1568,0.24],[2093,0.30]]
        .forEach(([f,o]) => this._ding(f, now+o, 0.14));
    } else {
      // 6콤보+: 화려한 글리산도
      const freqs = [784,880,988,1046,1175,1318,1480,1568,1760,2093];
      const take  = Math.min(count + 2, freqs.length);
      freqs.slice(0, take).forEach((f,i) => this._ding(f, now+i*0.045, 0.13));
    }

    // 보이스 멘트
    if (count >= 3) this._synthVoice('나이스!', now + 0.35);
  }

  // ── 맑은 딩 소리 (자일로폰 한 음) ──
  _ding(freq, startT, dur) {
    const ac = this._ctx;
    const o1 = ac.createOscillator();
    const o2 = ac.createOscillator();
    const g  = ac.createGain();
    o1.type = 'sine';     o1.frequency.value = freq;
    o2.type = 'sine';     o2.frequency.value = freq * 4.0; // 맑은 배음
    o1.connect(g); o2.connect(g);
    g.connect(ac.destination);
    g.gain.setValueAtTime(0.4, startT);
    g.gain.exponentialRampToValueAtTime(0.001, startT + dur);
    o1.start(startT); o1.stop(startT + dur + 0.01);
    o2.start(startT); o2.stop(startT + dur + 0.01);
  }

  // ── 합성 어린이 목소리 (Web Audio 기반) ──
  // 짧은 멜로디 패턴으로 한국어 느낌의 귀여운 소리를 냄
  _synthVoice(word, startTime) {
    const ac  = this._ctx;
    const t   = startTime || ac.currentTime;

    // 단어별 음정 패턴 (어린이 말투 느낌의 음계)
    const patterns = {
      '나이스!': [[880,0.10],[1318,0.10],[1046,0.08],[1760,0.22]],
    };

    const notes = patterns[word] || [[1046,0.15],[1318,0.20]];
    let offset  = 0;

    notes.forEach(([freq, dur]) => {
      // 기본 사인파 (목소리 기음)
      const osc1 = ac.createOscillator();
      // 배음 (목소리 질감 — 홀수 배음)
      const osc2 = ac.createOscillator();
      const osc3 = ac.createOscillator();
      const gain = ac.createGain();
      // 비브라토용 LFO
      const lfo  = ac.createOscillator();
      const lfoG = ac.createGain();

      lfo.frequency.value  = 6.5;  // 비브라토 속도
      lfoG.gain.value      = freq * 0.012; // 비브라토 깊이
      lfo.connect(lfoG);
      lfoG.connect(osc1.frequency);
      lfoG.connect(osc2.frequency);

      osc1.type = 'sine';      osc1.frequency.value = freq;
      osc2.type = 'triangle';  osc2.frequency.value = freq * 2.01;
      osc3.type = 'sine';      osc3.frequency.value = freq * 3.0;

      const mix = ac.createGain();
      osc1.connect(mix); osc2.connect(mix); osc3.connect(mix);
      mix.gain.value = 0.33;
      mix.connect(gain);
      gain.connect(ac.destination);

      const s = t + offset;
      gain.gain.setValueAtTime(0, s);
      gain.gain.linearRampToValueAtTime(0.35, s + 0.015);
      gain.gain.setValueAtTime(0.35, s + dur * 0.7);
      gain.gain.exponentialRampToValueAtTime(0.001, s + dur);

      lfo.start(s); lfo.stop(s + dur + 0.01);
      osc1.start(s); osc1.stop(s + dur + 0.01);
      osc2.start(s); osc2.stop(s + dur + 0.01);
      osc3.start(s); osc3.stop(s + dur + 0.01);

      offset += dur * 0.85;
    });
  }

  // ── 자동 터짐 (절반 넘었을 때) ── 낮고 짧은 소리
  miss() {
    if (!this._ready) return;
    const ac  = this._ctx;
    const now = ac.currentTime;
    const osc  = ac.createOscillator();
    const gain = ac.createGain();
    osc.connect(gain); gain.connect(ac.destination);
    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(180, now);
    osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
    gain.gain.setValueAtTime(0.15, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
    osc.start(now); osc.stop(now + 0.15);
  }

  // ── BGM — 에너지 유지되는 긴 앰비언트 비트 ──
  _startBGM() {
    const ac = this._ctx;

    const master = ac.createGain();
    master.gain.value = 0.13;
    master.connect(ac.destination);
    this._bgmGain = master;

    // ── 킥 드럼 (쿵) ──
    const kick = (t) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.connect(g); g.connect(master);
      o.type = 'sine';
      o.frequency.setValueAtTime(160, t);
      o.frequency.exponentialRampToValueAtTime(40, t + 0.12);
      g.gain.setValueAtTime(0.55, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      o.start(t); o.stop(t + 0.23);
    };

    // ── 하이햇 (치치) ──
    const hihat = (t, vol = 0.06) => {
      const buf = ac.createBuffer(1, ac.sampleRate * 0.05, ac.sampleRate);
      const data = buf.getChannelData(0);
      for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
      const src = ac.createBufferSource();
      const g   = ac.createGain();
      const flt = ac.createBiquadFilter();
      src.buffer = buf;
      flt.type = 'highpass'; flt.frequency.value = 7000;
      src.connect(flt); flt.connect(g); g.connect(master);
      g.gain.setValueAtTime(vol, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.05);
      src.start(t);
    };

    // ── 패드 코드 (부드러운 지속음) ──
    const pad = (freqs, t, dur, vol = 0.06) => {
      freqs.forEach(freq => {
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.connect(g); g.connect(master);
        o.type = 'sine';
        o.frequency.value = freq;
        g.gain.setValueAtTime(0, t);
        g.gain.linearRampToValueAtTime(vol, t + 0.8);
        g.gain.setValueAtTime(vol, t + dur - 0.8);
        g.gain.linearRampToValueAtTime(0, t + dur);
        o.start(t); o.stop(t + dur + 0.1);
      });
    };

    // ── 반짝 악센트 (가끔 한 번씩) ──
    const sparkle = (freq, t) => {
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.connect(g); g.connect(master);
      o.type = 'triangle';
      o.frequency.setValueAtTime(freq, t);
      o.frequency.exponentialRampToValueAtTime(freq * 1.5, t + 0.1);
      g.gain.setValueAtTime(0.12, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      o.start(t); o.stop(t + 0.36);
    };

    // BPM 128 — 적당히 신나고 안 어지러운 속도
    const BPM  = 128;
    const BEAT = 60 / BPM;

    // 코드 진행: C장조 → G → Am → F (각 4박)
    const CHORDS = [
      [130, 165, 196, 262], // C2 E2 G2 C3
      [98,  147, 196, 247], // G1 D2 G2 B2
      [110, 131, 165, 220], // A1 C2 E2 A2
      [87,  131, 175, 220], // F1 C2 F2 A2
    ];

    // 1루프 = 16마디 = 64박 ≈ 30초 (BPM128)
    const LOOP_BEATS = 64;
    const LOOP_DUR   = LOOP_BEATS * BEAT;

    const playSection = (start) => {
      for (let beat = 0; beat < LOOP_BEATS; beat++) {
        const t = start + beat * BEAT;

        // 킥: 매 4박 (1,5,9,...)
        if (beat % 4 === 0) kick(t);

        // 하이햇: 매 2박 (오프비트 느낌)
        if (beat % 2 === 0) hihat(t, 0.055);
        if (beat % 2 === 1) hihat(t, 0.03);

        // 패드 코드: 매 16박마다 전환 (4마디씩)
        if (beat % 16 === 0) {
          const chord = CHORDS[Math.floor(beat / 16) % CHORDS.length];
          pad(chord, t, 16 * BEAT, 0.055);
        }

        // 반짝 악센트: 일정하지 않게 드문드문 (12박 간격 + 오프셋)
        if (beat === 6  || beat === 22 || beat === 38 || beat === 54) sparkle(523, t);
        if (beat === 14 || beat === 30 || beat === 46 || beat === 62) sparkle(659, t);
        if (beat === 10 || beat === 42) sparkle(784, t);
      }
    };

    const loop = (startTime) => {
      playSection(startTime);
      const delay = (startTime + LOOP_DUR - ac.currentTime - 0.2) * 1000;
      setTimeout(() => loop(startTime + LOOP_DUR), Math.max(delay, 10));
    };

    loop(ac.currentTime + 0.15);
  }

  // BGM 온/오프 토글
  get bgmOn() { return this._bgmOn !== false; }
  toggleBGM() {
    this._bgmOn = !this.bgmOn;
    if (this._ctx) {
      if (this._bgmOn) {
        if (this._bgmGain) this._bgmGain.gain.setValueAtTime(0.13, this._ctx.currentTime);
        this._ctx.resume();
      } else {
        // gain을 0으로 + context suspend
        if (this._bgmGain) this._bgmGain.gain.setValueAtTime(0, this._ctx.currentTime);
        this._ctx.suspend();
      }
    }
    return this._bgmOn;
  }

  // BGM suspend 중에도 팝 소리는 재생 (context 잠깐 깨움)
  _resumeForSFX() {
    if (this._ctx && this._ctx.state === 'suspended') {
      this._ctx.resume().then(() => {
        // SFX 재생 후 다시 suspend (BGM꺼진 상태 유지)
        if (!this.bgmOn) {
          setTimeout(() => {
            if (!this.bgmOn && this._ctx) this._ctx.suspend();
          }, 500);
        }
      });
    }
  }

  // BGM 볼륨
  setBGMVolume(v) {
    if (this._bgmGain) this._bgmGain.gain.value = v;
  }
}

const sound = new SoundManager();
