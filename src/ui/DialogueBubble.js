// ═══════════════════════════════════════════════════════════
// DialogueBubble — the visual companion to spoken lines.
//
// CRITICAL: this is NOT a subtitle system. Per the design rule
// "no text-only instructions" and feedback that "Harmony says:"
// subtitle clutter should be removed, this bubble shows a
// character portrait + an animated talking indicator (simple
// pulsing dots, mouth-flap style scaling) — never the line's
// text. A pre-reader gets everything from the character's
// voice + the bubble's visual "someone is talking" cue, not
// from words on screen.
//
// If you want optional captions for accessibility later, add
// them as a separate opt-in layer — don't make them default.
// ═══════════════════════════════════════════════════════════

export class DialogueBubble {
  /**
   * @param {Phaser.Scene} scene
   * @param {Object} [config]
   * @param {number} [config.x]
   * @param {number} [config.y]
   */
  constructor(scene, config = {}) {
    this.scene = scene;
    this.x = config.x ?? 150;
    this.y = config.y ?? scene.scale.height - 150;

    this.container = scene.add.container(this.x, this.y).setDepth(1000).setVisible(false);

    // Portrait backdrop circle, recolored per-character on show()
    this.portraitBg = scene.add.circle(0, 0, 60, 0xffffff).setStrokeStyle(4, 0xffffff);
    this.portrait = scene.add.sprite(0, 0, 'char_harmony').setScale(0.18);

    // Three small dots that pulse while audio plays — the universal
    // "someone is talking" indicator, no reading required.
    this.dots = [0, 1, 2].map((i) =>
      scene.add.circle(70 + i * 18, 40, 6, 0xffffff)
    );

    this.container.add([this.portraitBg, this.portrait, ...this.dots]);
    this._talkTween = null;
  }

  /**
   * @param {string} character
   * @param {string} _text - intentionally unused for display; voice carries the line
   * @param {string} colorHex
   */
  show(character, _text, colorHex) {
    const spriteKey = `char_${character.toLowerCase()}`;
    if (this.scene.textures.exists(spriteKey)) {
      this.portrait.setTexture(spriteKey);
    }
    this.portraitBg.setStrokeStyle(4, Phaser.Display.Color.HexStringToColor(colorHex).color);

    this.container.setVisible(true);
    this.container.setScale(0.8);
    this.scene.tweens.add({
      targets: this.container,
      scale: 1,
      duration: 200,
      ease: 'Back.easeOut',
    });
  }

  animateTalking(isTalking) {
    this._talkTween?.stop();

    if (isTalking) {
      this._talkTween = this.scene.tweens.add({
        targets: this.dots,
        scaleY: { from: 1, to: 1.6 },
        yoyo: true,
        repeat: -1,
        duration: 220,
        stagger: 80,
      });
    } else {
      this.dots.forEach((d) => d.setScale(1));
    }
  }

  hide() {
    this.scene.tweens.add({
      targets: this.container,
      scale: 0.8,
      alpha: 0,
      duration: 150,
      onComplete: () => {
        this.container.setVisible(false).setAlpha(1);
      },
    });
  }
}
