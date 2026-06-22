// ═══════════════════════════════════════════════════════════
// BuildLetterModule
// The "build the letter" beat. Plays the intro/success dialogue
// and delegates the actual tracing interaction to MagicTraceModule,
// which is reusable on its own for any trace-shaped interaction.
// Driven entirely by letterData.tracePath — no letter-specific code.
// ═══════════════════════════════════════════════════════════

import { MagicTraceModule } from './MagicTraceModule.js';

export class BuildLetterModule {
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
    await this.dialogue.playScript(this.script.letterChallengeIntro, { coNarrate: false });

    const trace = new MagicTraceModule(this.scene, this.letterData.tracePath);
    await trace.run();

    await this.dialogue.playScript(this.script.letterChallengeSuccess, { coNarrate: false });
  }
}
