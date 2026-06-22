// ═══════════════════════════════════════════════════════════
// LetterMissionScene — THE single mission scene for every letter.
//
// This is the heart of the "one adventure game, not 26 games"
// architecture. It never contains anything specific to Apple
// Garden, Butterfly Meadow, or any other location. It:
//   1. reads which letter was selected (data.letter)
//   2. looks up that letter's LetterDataEntry
//   3. builds that letter's dialogue script
//   4. runs the same 7 modules, in the same order, every time
//
// Adding letter C means adding a LetterData entry + art. This
// file does not change.
// ═══════════════════════════════════════════════════════════

import { DialogueSystem } from '../systems/DialogueSystem.js';
import { DialogueBubble } from '../ui/DialogueBubble.js';
import { createVoiceProvider } from '../systems/VoiceProvider.js';
import { GAME_CONFIG } from '../data/GameConfig.js';
import { navigationManager } from '../systems/NavigationManager.js';
import { progressManager } from '../systems/ProgressManager.js';
import { LETTER_DATA } from '../data/letters/LetterData.js';
import { buildLetterScript } from '../data/letters/DialogueScripts.js';

import { MeetLetterModule } from '../modules/MeetLetterModule.js';
import { LetterHuntModule } from '../modules/LetterHuntModule.js';
import { BuildLetterModule } from '../modules/BuildLetterModule.js';
import { SoundStudioModule } from '../modules/SoundStudioModule.js';
import { LetterReviewModule } from '../modules/LetterReviewModule.js';
import { RewardModule } from '../modules/RewardModule.js';

export class LetterMissionScene extends Phaser.Scene {
  constructor() {
    super('LetterMissionScene');
  }

  /** @param {{letter: string}} data */
  init(data) {
    this.letterData = LETTER_DATA[data.letter];
    if (!this.letterData) {
      throw new Error(`LetterMissionScene: no LetterData entry for "${data.letter}"`);
    }
    this.script = buildLetterScript(this.letterData);
  }

  create() {
    this.cameras.main.setBackgroundColor('#cdeccd');

    this.add
      .image(this.scale.width / 2, this.scale.height / 2, this.letterData.backgroundKey)
      .setDisplaySize(this.scale.width, this.scale.height);

    this.voiceProvider = createVoiceProvider({
      mode: GAME_CONFIG.VOICE_MODE,
      supabaseUrl: GAME_CONFIG.SUPABASE_URL,
      supabaseAnonKey: GAME_CONFIG.SUPABASE_ANON_KEY,
    });
    this.dialogue = new DialogueSystem(this, this.voiceProvider);
    this.bubble = new DialogueBubble(this);
    this.dialogue.attachBubble(this.bubble);

    this._createBackButton();
    this._createCrystalIndicator();

    this._runMission();
  }

  async _runMission() {
    // Every letter runs through the exact same module sequence.
    await new MeetLetterModule(this, this.dialogue, this.script).run();
    await new LetterHuntModule(this, this.dialogue, this.letterData, this.script).run();
    await new BuildLetterModule(this, this.dialogue, this.letterData, this.script).run();
    await new SoundStudioModule(this, this.dialogue, this.letterData, this.script).run();
    await new LetterReviewModule(this, this.dialogue, this.letterData, this.script).run();
    await new RewardModule(this, this.dialogue, this.letterData, this.script).run();

    this.time.delayedCall(1800, () => {
      navigationManager.goTo(this, 'WorldMapScene', {});
    });
  }

  _createBackButton() {
    const backBtn = this.add
      .circle(60, 60, 36, 0xffffff, 0.9)
      .setStrokeStyle(3, 0xff6b9d)
      .setInteractive({ useHandCursor: true })
      .setDepth(2000);
    this.add.text(60, 60, '←', { fontSize: '32px', color: '#ff6b9d' }).setOrigin(0.5).setDepth(2001);

    backBtn.on('pointerdown', () => {
      this.dialogue.skip();
      navigationManager.goBack(this, 'WorldMapScene');
    });
  }

  _createCrystalIndicator() {
    const count = progressManager.getCrystalCount();
    const total = progressManager.getTotalWorlds();
    this.add
      .text(this.scale.width - 30, 30, `💎 ${count}/${total}`, {
        fontSize: '28px',
        color: '#ffffff',
        backgroundColor: '#9b59ff',
        padding: { x: 14, y: 8 },
      })
      .setOrigin(1, 0)
      .setDepth(2000);
  }
}
