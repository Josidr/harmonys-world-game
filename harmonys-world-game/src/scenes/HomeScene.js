// ═══════════════════════════════════════════════════════════
// HomeScene — brand hero screen. Harmony auto-greets on load,
// per the design rule "auto-engagement over tap-to-start" —
// no tap required to hear the first line.
// ═══════════════════════════════════════════════════════════

import { DialogueSystem } from '../systems/DialogueSystem.js';
import { DialogueBubble } from '../ui/DialogueBubble.js';
import { createVoiceProvider } from '../systems/VoiceProvider.js';
import { GAME_CONFIG } from '../data/GameConfig.js';
import { navigationManager } from '../systems/NavigationManager.js';

export class HomeScene extends Phaser.Scene {
  constructor() {
    super('HomeScene');
  }

  create() {
    navigationManager.reset();
    this.cameras.main.setBackgroundColor('#fff0f5');

    this.add
      .text(this.scale.width / 2, 140, "So Harmony's World", {
        fontSize: '64px',
        fontStyle: 'bold',
        color: '#ff6b9d',
      })
      .setOrigin(0.5);

    const harmonySprite = this.add
      .sprite(this.scale.width / 2, 420, 'char_harmony')
      .setScale(0.5);
    this.tweens.add({
      targets: harmonySprite,
      y: 400,
      duration: 1600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const startBtn = this.add
      .circle(this.scale.width / 2, 600, 70, 0xff6b9d)
      .setInteractive({ useHandCursor: true });
    this.add
      .text(this.scale.width / 2, 600, '▶', { fontSize: '48px', color: '#ffffff' })
      .setOrigin(0.5);

    startBtn.on('pointerdown', () => {
      navigationManager.goTo(this, 'WorldMapScene', {});
    });

    this.voiceProvider = createVoiceProvider({
      mode: GAME_CONFIG.VOICE_MODE,
      supabaseUrl: GAME_CONFIG.SUPABASE_URL,
      supabaseAnonKey: GAME_CONFIG.SUPABASE_ANON_KEY,
    });
    this.dialogue = new DialogueSystem(this, this.voiceProvider);
    this.bubble = new DialogueBubble(this);
    this.dialogue.attachBubble(this.bubble);

    // Auto-greet immediately — no tap required.
    this.dialogue.speak('Harmony', "Hi Friend! Welcome to Harmony's World!");
  }
}
