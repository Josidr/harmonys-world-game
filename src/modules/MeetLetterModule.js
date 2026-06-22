// ═══════════════════════════════════════════════════════════
// MeetLetterModule
// Plays the intro + mission dialogue for whichever letter is
// active. No letter-specific code — everything comes from the
// script object built by buildLetterScript(letterData).
// ═══════════════════════════════════════════════════════════

export class MeetLetterModule {
  /**
   * @param {Phaser.Scene} scene
   * @param {import('../systems/DialogueSystem.js').DialogueSystem} dialogue
   * @param {ReturnType<typeof import('../data/letters/DialogueScripts.js').buildLetterScript>} script
   */
  constructor(scene, dialogue, script) {
    this.scene = scene;
    this.dialogue = dialogue;
    this.script = script;
  }

  async run() {
    await this.dialogue.playScript(this.script.intro);
    await this.dialogue.playScript(this.script.mission, { coNarrate: false });
  }
}
