// ═══════════════════════════════════════════════════════════
// BootScene — loads every asset the game needs before anything
// else runs. Shows a simple progress bar (visual, not text-
// dependent) so pre-readers still understand "loading."
//
// Per-letter assets are derived from LETTER_DATA itself — add a
// new letter's data entry and its background/object/reward art
// paths get queued here automatically. No manual asset list to
// maintain per letter.
// ═══════════════════════════════════════════════════════════

import { LETTER_DATA } from '../data/letters/LetterData.js';

export class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    this._createProgressBar();

    // Character sprites — swap these paths once real processed
    // character art (the 1000px transparent WebP/PNG assets) is
    // exported into game/public/assets/characters/.
    const characters = ['harmony', 'brix', 'mari', 'lila', 'deuce', 'melani', 'eliyah'];
    characters.forEach((c) => {
      this.load.image(`char_${c}`, `assets/characters/${c}.png`);
    });

    // Per-letter assets, derived from LETTER_DATA — this loop is
    // identical no matter how many letters have data entries.
    // Backgrounds/rewards are location-specific (per-letter folder).
    // Object sprites come from a SHARED global library, since the
    // same vocabulary object (e.g. an apple) can appear as a target
    // in one letter's world and a distractor in another's — loading
    // each spriteKey only once avoids collisions and duplicate art.
    const queuedObjectKeys = new Set();
    Object.values(LETTER_DATA).forEach((letterData) => {
      const folder = `assets/letters/${letterData.letter.toLowerCase()}`;
      this.load.image(letterData.backgroundKey, `${folder}/background.png`);
      this.load.image(letterData.rewardKey, `${folder}/reward.png`);

      [...letterData.objects, ...letterData.distractors].forEach((item) => {
        if (!queuedObjectKeys.has(item.spriteKey)) {
          queuedObjectKeys.add(item.spriteKey);
          const objectName = item.spriteKey.replace('obj_', '');
          this.load.image(item.spriteKey, `assets/objects/${objectName}.png`);
        }
      });
    });

    // Map / castle
    this.load.image('bg_map', 'assets/map/map_background.png');
    this.load.image('castle_dormant', 'assets/map/castle_dormant.png');
    this.load.image('castle_complete', 'assets/map/castle_complete.png');
  }

  _createProgressBar() {
    const { width, height } = this.scale;
    const barBg = this.add.rectangle(width / 2, height / 2, 400, 40, 0xffffff, 0.3);
    const bar = this.add.rectangle(width / 2 - 198, height / 2, 4, 32, 0xff6b9d).setOrigin(0, 0.5);

    this.load.on('progress', (value) => {
      bar.width = 396 * value;
    });
    this.load.on('complete', () => {
      barBg.destroy();
      bar.destroy();
    });
  }

  create() {
    this.scene.start('HomeScene');
  }
}
