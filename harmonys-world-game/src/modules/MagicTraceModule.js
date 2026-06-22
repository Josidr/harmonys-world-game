// ═══════════════════════════════════════════════════════════
// MagicTraceModule
// Pure tracing mechanic: renders an ordered sequence of points
// from a tracePath and requires the child to tap them in order.
// No dialogue, no progress logic — just the trace interaction
// itself, reused by BuildLetterModule (and available for any
// other module that needs "trace this shape").
// ═══════════════════════════════════════════════════════════

export class MagicTraceModule {
  /**
   * @param {Phaser.Scene} scene
   * @param {{x:number,y:number}[]} tracePath
   */
  constructor(scene, tracePath) {
    this.scene = scene;
    this.tracePath = tracePath;
  }

  /** @returns {Promise<void>} resolves once every point has been tapped in order */
  run() {
    return this._tracePath();
  }

  _tracePath() {
    return new Promise((resolve) => {
      let nextIndex = 0;
      const dots = this.tracePath.map((p, i) =>
        this.scene.add
          .circle(p.x, p.y, 22, 0x9b59ff, i === 0 ? 0.9 : 0.3)
          .setInteractive({ useHandCursor: true })
          .setDepth(1500)
      );

      dots.forEach((dot, i) => {
        dot.on('pointerdown', () => {
          if (i !== nextIndex) return; // must trace in order
          dot.setFillStyle(0x3bd973, 1);
          nextIndex++;
          if (nextIndex < dots.length) {
            dots[nextIndex].setFillStyle(0x9b59ff, 0.9);
          } else {
            dots.forEach((d) => d.destroy());
            resolve();
          }
        });
      });
    });
  }
}
