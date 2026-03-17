// 터치/클릭 이벤트 → 논리 픽셀 좌표로 변환 후 콜백 호출
class InputHandler {
  constructor(canvas, onTap) {
    this.canvas = canvas;
    this.onTap  = onTap;

    // 터치 (모바일/태블릿)
    canvas.addEventListener('touchstart', e => {
      e.preventDefault();
      Array.from(e.changedTouches).forEach(t => {
        const { x, y } = this._toLogical(t.clientX, t.clientY);
        this.onTap(x, y);
      });
    }, { passive: false });

    // 마우스 (데스크톱)
    canvas.addEventListener('mousedown', e => {
      const { x, y } = this._toLogical(e.clientX, e.clientY);
      this.onTap(x, y);
    });
  }

  // clientX/Y → canvas 논리 픽셀 좌표 (DPR 보정 불필요 — CSS=논리px)
  _toLogical(clientX, clientY) {
    const rect = this.canvas.getBoundingClientRect();
    return {
      x: clientX - rect.left,
      y: clientY - rect.top,
    };
  }
}
