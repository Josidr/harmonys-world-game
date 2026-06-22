// ═══════════════════════════════════════════════════════════
// RewardModule
// World transformation + celebration beat. Marks the letter
// complete in ProgressManager, plays the closing dialogue, and
// runs the confetti — identical for every letter, driven only
// by letterData.letter and letterData.rewardName/rewardKey.
// ═══════════════════════════════════════════════════════════

import { progressManager } from '../systems/ProgressManager.js';

export class RewardModule {
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
    await this.dialogue.playScript(this.script.worldTransformation, { coNarrate: false });
    this.scene.cameras.main.flash(600, 255, 240, 200);
    this._showReward();

    progressManager.completeWorld(this.letterData.letter);
    await this.dialogue.playScript(this.script.celebration, { coNarrate: false });

    this._confettiBurst();
  }

  _showReward() {
    const reward = this.scene.add
      .image(this.scene.scale.width / 2, this.scene.scale.height / 2, this.letterData.rewardKey)
      .setScale(0.1)
      .setAlpha(0)
      .setDepth(1800);

    this.scene.tweens.add({
      targets: reward,
      scale: 0.6,
      alpha: 1,
      duration: 700,
      ease: 'Back.easeOut',
    });
  }

  _confettiBurst() {
    const colors = [0xff6b9d, 0x9b59ff, 0xff9f43, 0x4ecbff, 0x3bd973];
    for (let i = 0; i < 40; i++) {
      const piece = this.scene.add.rectangle(
        this.scene.scale.width / 2,
        this.scene.scale.height / 2,
        10,
        10,
        colors[i % colors.length]
      );
      this.scene.tweens.add({
        targets: piece,
        x: piece.x + (Math.random() - 0.5) * 800,
        y: piece.y + (Math.random() - 0.5) * 600 + 200,
        rotation: Math.random() * 6,
        alpha: 0,
        duration: 1200 + Math.random() * 600,
        onComplete: () => piece.destroy(),
      });
    }
  }
}
