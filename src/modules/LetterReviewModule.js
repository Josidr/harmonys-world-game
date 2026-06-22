// ═══════════════════════════════════════════════════════════
// LetterReviewModule
// The "mini boss" beat — drifting objects the child must catch
// in time. Uses letterData.objects[0]'s sprite as the thing
// being caught, so it's visually tied to this letter without
// any letter-specific code.
// ═══════════════════════════════════════════════════════════

export class LetterReviewModule {
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
  }

  async run() {
    await this.dialogue.playScript(this.script.miniBossIntro, { coNarrate: false });
    await this._catchRound();
    await this.dialogue.playScript(this.script.miniBossSuccess, { coNarrate: false });
  }

  _catchRound() {
    return new Promise((resolve) => {
      const spriteKey = this.letterData.objects[0].spriteKey;
      const needed = 3;
      let caught = 0;

      const spawnOne = () => {
        const y = 150 + Math.random() * 300;
        const obj = this.scene.add
          .sprite(-50, y, spriteKey)
          .setInteractive({ useHandCursor: true })
          .setDepth(1500);

        this.scene.tweens.add({
          targets: obj,
          x: this.scene.scale.width + 50,
          duration: 3500,
          onComplete: () => obj.destroy(),
        });

        obj.on('pointerdown', () => {
          obj.destroy();
          caught++;
          if (caught >= needed) resolve();
        });
      };

      for (let i = 0; i < needed + 1; i++) {
        this.scene.time.delayedCall(i * 900, spawnOne);
      }
    });
  }
}
