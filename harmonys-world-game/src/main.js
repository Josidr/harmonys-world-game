// ═══════════════════════════════════════════════════════════
// main.js — Phaser game entry point.
// ═══════════════════════════════════════════════════════════

import Phaser from 'phaser';
import { GAME_CONFIG } from './data/GameConfig.js';
import { BootScene } from './scenes/BootScene.js';
import { HomeScene } from './scenes/HomeScene.js';
import { WorldMapScene } from './scenes/WorldMapScene.js';
import { LetterMissionScene } from './scenes/LetterMissionScene.js';

const config = {
  type: Phaser.AUTO,
  width: GAME_CONFIG.GAME_WIDTH,
  height: GAME_CONFIG.GAME_HEIGHT,
  parent: 'game-container',
  backgroundColor: '#ffffff',
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [BootScene, HomeScene, WorldMapScene, LetterMissionScene],
};

new Phaser.Game(config);
