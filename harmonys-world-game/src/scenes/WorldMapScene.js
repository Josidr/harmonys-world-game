// ═══════════════════════════════════════════════════════════
// WorldMapScene — Harmony's Alphabet Castle.
//
// One map scene for the whole game. Shows all 26 letters as
// locations; tapping an unlocked, built letter sends its letter
// code into LetterMissionScene, which does the rest. This scene
// has zero per-letter logic — it only reads LETTER_DATA to know
// which letters currently have content.
// ═══════════════════════════════════════════════════════════

import { progressManager } from '../systems/ProgressManager.js';
import { navigationManager } from '../systems/NavigationManager.js';
import { ALPHABET, isLetterBuilt } from '../data/letters/LetterData.js';

export class WorldMapScene extends Phaser.Scene {
  constructor() {
    super('WorldMapScene');
  }

  create() {
    this.cameras.main.setBackgroundColor('#d8c4f0');

    const castleStage = progressManager.getCastleStage();
    const castleKey = castleStage === 'complete' ? 'castle_complete' : 'castle_dormant';
    this.add.image(this.scale.width / 2, 220, castleKey).setScale(0.6);

    this.add
      .text(
        this.scale.width / 2,
        40,
        `💎 ${progressManager.getCrystalCount()}/${progressManager.getTotalWorlds()} Alphabet Crystals`,
        { fontSize: '28px', color: '#5a3d8c' }
      )
      .setOrigin(0.5);

    this._renderLetterNodes();
    this._createBackButton();
  }

  _renderLetterNodes() {
    const cols = 7;
    const startX = 120;
    const startY = 420;
    const gapX = 150;
    const gapY = 130;

    ALPHABET.forEach((letter, i) => {
      const col = i % cols;
      const row = Math.floor(i / cols);
      const x = startX + col * gapX;
      const y = startY + row * gapY;

      const unlocked = progressManager.isWorldUnlocked(letter);
      const completed = progressManager.isWorldCompleted(letter);
      const built = isLetterBuilt(letter);

      const playable = unlocked && built;
      const fillColor = completed ? 0x3bd973 : playable ? 0xff9f43 : 0x9b9b9b;

      const node = this.add.circle(x, y, 44, fillColor).setAlpha(playable ? 1 : 0.45);
      this.add
        .text(x, y, letter, { fontSize: '32px', fontStyle: 'bold', color: '#ffffff' })
        .setOrigin(0.5)
        .setAlpha(playable ? 1 : 0.45);

      if (playable) {
        node.setInteractive({ useHandCursor: true });
        node.on('pointerdown', () => {
          navigationManager.goTo(this, 'LetterMissionScene', { letter });
        });
      }
    });
  }

  _createBackButton() {
    const backBtn = this.add
      .circle(60, 60, 36, 0xffffff, 0.9)
      .setStrokeStyle(3, 0xff6b9d)
      .setInteractive({ useHandCursor: true });
    this.add.text(60, 60, '←', { fontSize: '32px', color: '#ff6b9d' }).setOrigin(0.5);

    backBtn.on('pointerdown', () => {
      navigationManager.goBack(this, 'HomeScene');
    });
  }
}
