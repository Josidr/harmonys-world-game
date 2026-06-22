// ═══════════════════════════════════════════════════════════
// LetterHuntModule
// The exploration + collection beat. Spawns whatever objects and
// distractors THIS letter's data specifies, reacts the same way
// every time, and resolves once all target objects are found.
//
// Nothing here is Apple-Garden-specific or Butterfly-Meadow-
// specific — it only knows about generic {id, spriteKey, x, y}
// entries from letterData.objects / letterData.distractors.
// ═══════════════════════════════════════════════════════════

export class LetterHuntModule {
  /**
   * @param {Phaser.Scene} scene
   * @param {import('../systems/DialogueSystem.js').DialogueSystem} dialogue
   * @param {import('../data/letters/LetterData.js').LetterDataEntry} letterData
   * @param {ReturnType<typeof import('../data/letters/DialogueScripts.js').buildLetterScript>} script
   */
  constructor(scene, dialogue, letterData, script) {
    this.scene = scene;
    this.dialogue = dialogue;
    this.letterData = letterData;
    this.script = script;
    this.sprites = [];
    this._foundCount = 0;
  }

  /** @returns {Promise<void>} resolves once every target object has been found */
  run() {
    return new Promise((resolve) => {
      this._resolve = resolve;
      this._spawnAll();
    });
  }

  _spawnAll() {
    const all = [
      ...this.letterData.objects.map((o) => ({ ...o, isTarget: true })),
      ...this.letterData.distractors.map((o) => ({ ...o, isTarget: false })),
    ];

    this.sprites = all.map((item) => {
      const sprite = this.scene.add
        .sprite(item.x, item.y, item.spriteKey)
        .setInteractive({ useHandCursor: true })
        .setData('item', item);

      this.scene.tweens.add({
        targets: sprite,
        y: item.y - 8,
        duration: 1400 + Math.random() * 600,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });

      sprite.on('pointerdown', () => this._handleTouch(sprite));
      return sprite;
    });
  }

  async _handleTouch(sprite) {
    if (this.dialogue.isPlaying) return;
    if (sprite.getData('collected')) return;

    const item = sprite.getData('item');
    sprite.setData('collected', true);

    if (this._foundCount === 0 && item.isTarget) {
      await this.dialogue.playScript(this.script.firstDiscovery, { coNarrate: false });
    }

    if (item.isTarget) {
      this._foundCount++;
      await this.dialogue.playScript(this.script.discoverySuccess, { coNarrate: false });
      this._celebrate(sprite);

      const targetTotal = this.letterData.objects.length;
      if (this._foundCount >= targetTotal) {
        this._cleanupDistractors();
        this._resolve();
      }
    } else {
      await this.dialogue.playScript(this.script.mistake, { coNarrate: false });
      sprite.setData('collected', false); // distractors stay tappable
      this._wiggle(sprite);
    }
  }

  _celebrate(sprite) {
    this.scene.tweens.add({
      targets: sprite,
      scale: 1.3,
      alpha: 0,
      duration: 400,
      ease: 'Back.easeIn',
      onComplete: () => sprite.setVisible(false),
    });
  }

  _wiggle(sprite) {
    this.scene.tweens.add({
      targets: sprite,
      x: sprite.x + 10,
      duration: 60,
      yoyo: true,
      repeat: 3,
    });
  }

  _cleanupDistractors() {
    this.sprites.forEach((s) => {
      if (!s.getData('item').isTarget) s.destroy();
    });
  }
}
