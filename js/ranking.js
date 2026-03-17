// ── 랭킹 매니저 (localStorage) ───────────────────────────
const RANKING_KEY = 'balloonPop_ranking';
const RANKING_MAX = 10;

const rankingManager = {
  load() {
    try {
      return JSON.parse(localStorage.getItem(RANKING_KEY)) || [];
    } catch { return []; }
  },

  save(score, maxCombo, accuracy, timeMode, name = '익명', avatar = '🎈') {
    const list = this.load();
    list.push({
      score,
      maxCombo,
      accuracy,
      timeMode,
      name,
      avatar,
      date: new Date().toLocaleDateString('ko-KR'),
    });
    list.sort((a, b) => b.score - a.score);
    list.splice(RANKING_MAX);
    localStorage.setItem(RANKING_KEY, JSON.stringify(list));
    return list.findIndex(r => r.score === score && r.date === list[0]?.date || true) + 1;
  },

  getTop(n = 5) {
    return this.load().slice(0, n);
  },

  clear() {
    localStorage.removeItem(RANKING_KEY);
  },
};
