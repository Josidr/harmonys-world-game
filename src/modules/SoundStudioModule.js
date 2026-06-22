// ═══════════════════════════════════════════════════════════
// SoundStudioModule
// The phonics "which one starts with this sound" beat. Builds
// its picture choices directly from letterData.objects (one
// correct) + letterData.distractors (the wrong picks) — visual
// only, no reading required, works for any letter.
// ═══════════════════════════════════════════════════════════

export class SoundStudioModule {
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
    await this.dialogue.playScript(this.script.soundQuestIntro, { coNarrate: false });
    await this._playRound();
    await this.dialogue.playScript(this.script.soundQuestSuccess, { coNarrate: false });
  }

  _playRound() {
    return new Promise((resolve) => {
      const correct = this.letterData.objects[0];
      const wrongChoices = this.letterData.distractors.slice(0, 2);
      const choices = this._shuffle([correct, ...wrongChoices]);

      const startX = this.scene.scale.width / 2 - 200;
      const sprites = choices.map((item, i) =>
        this.scene.add
          .sprite(startX + i * 200, this.scene.scale.height - 200, item.spriteKey)
          .setInteractive({ useHandCursor: true })
          .setDepth(1500)
      );

      const handleTap = async (item, sprite, i) => {
        if (item.id === correct.id) {
          sprites.forEach((s) => s.disableInteractive());
          sprites.forEach((s) => s.destroy());
          resolve();
        } else {
          sprites.forEach((s) => s.disableInteractive());
          await this.dialogue.playScript(this.script.mistake, { coNarrate: false });
          sprites.forEach((s) => s.setInteractive({ useHandCursor: true }));
        }
      };

      sprites.forEach((sprite, i) => {
        sprite.on('pointerdown', () => handleTap(choices[i], sprite, i));
      });
    });
  }

  _shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}
