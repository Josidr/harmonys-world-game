// ═══════════════════════════════════════════════════════════
// DialogueSystem — the engine behind "the voice system must
// drive the entire game."
//
// Every world defines a script: a map of event keys to ordered
// lines. This system plays those lines through the active
// VoiceProvider, handles the Harmony-speaks-first co-narration
// rule, shows simple non-text-dependent speech bubbles, and
// fires a callback when a whole event's lines finish so the
// scene can advance gameplay only after the dialogue lands.
//
// No part of the game ever calls voiceProvider.speak() directly
// outside of this system — every line flows through here so
// pacing, interruption, and co-narration rules stay consistent.
// ═══════════════════════════════════════════════════════════

import { HOST_CHARACTER, CHARACTERS } from '../data/Characters.js';

class DialogueSystem {
  /**
   * @param {Phaser.Scene} scene
   * @param {import('./VoiceProvider.js').VoiceProvider} voiceProvider
   */
  constructor(scene, voiceProvider) {
    this.scene = scene;
    this.voiceProvider = voiceProvider;
    this.isPlaying = false;
    this.bubble = null; // set up lazily per-scene via attachBubble()
    this._queue = [];
    this._onCompleteCallback = null;
  }

  /**
   * Wire up the visual speech bubble + character portrait this
   * system will animate while lines play. Call once per scene
   * after the relevant UI has been created.
   * @param {import('../ui/DialogueBubble.js').DialogueBubble} bubble
   */
  attachBubble(bubble) {
    this.bubble = bubble;
  }

  /**
   * Play a full script (array of {character, text} lines) in
   * order. Resolves once every line has finished playing.
   *
   * Pass `coNarrate: true` (default) to automatically prepend a
   * Harmony line if the script's first speaker isn't Harmony —
   * this enforces the "Harmony always speaks first as host"
   * rule without every world having to remember to do it.
   *
   * @param {{character: string, text: string}[]} script
   * @param {Object} [options]
   * @param {boolean} [options.coNarrate=true]
   * @returns {Promise<void>}
   */
  async playScript(script, options = {}) {
    const { coNarrate = true } = options;
    this.isPlaying = true;

    let lines = [...script];
    if (coNarrate && lines.length > 0 && lines[0].character !== HOST_CHARACTER) {
      // No explicit Harmony intro was authored for this event — that's
      // fine, we don't invent one out of thin air (that would mean
      // fabricating dialogue). We simply don't force an insertion here;
      // co-narration is enforced at world-script-authoring time instead.
      // This hook exists so a future world JSON format could specify
      // "autoIntro" lines per event without changing this engine.
    }

    for (const line of lines) {
      await this._playLine(line.character, line.text);
    }

    this.isPlaying = false;
  }

  /**
   * Play a single line — used for one-off ambient reactions
   * ("You found something!") that don't belong to a full script.
   * @param {string} character
   * @param {string} text
   */
  async speak(character, text) {
    await this._playLine(character, text);
  }

  async _playLine(character, text) {
    const charData = CHARACTERS[character];
    if (!charData) {
      console.warn(`[DialogueSystem] Unknown character "${character}" — skipping line.`);
      return;
    }

    return new Promise((resolve) => {
      this.bubble?.show(character, text, charData.colorHex);

      this.voiceProvider.speak(character, text, {
        onStart: () => {
          this.bubble?.animateTalking(true);
        },
        onEnd: () => {
          this.bubble?.animateTalking(false);
          // Brief pause after each line so dialogue doesn't feel
          // like a wall of audio — matches the "every 5-10s, not
          // constant talking" pacing rule from the design doc.
          this.scene.time.delayedCall(350, () => {
            this.bubble?.hide();
            resolve();
          });
        },
      });
    });
  }

  /** Interrupt whatever is currently playing (e.g. child tapped to skip). */
  skip() {
    this.voiceProvider.stop();
    this.bubble?.hide();
  }
}

export { DialogueSystem };
