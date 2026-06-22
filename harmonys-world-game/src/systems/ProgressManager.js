// ═══════════════════════════════════════════════════════════
// ProgressManager — Alphabet Crystals + save system.
//
// Replaces a generic "stars" model with the brand's progression
// concept: each completed letter-world restores one Alphabet
// Crystal, which powers Harmony's Alphabet Castle. The castle's
// visual state is derived from this data (not stored separately)
// so it's always consistent with actual progress.
// ═══════════════════════════════════════════════════════════

const STORAGE_KEY = 'harmonys_world_progress_v1';
const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

function defaultProgress() {
  return {
    crystals: {}, // { A: true, B: false, ... } - true once that world is completed
    currentWorld: 'A',
    childName: null, // optional, set if the app ever asks/personalizes
    lastPlayed: null,
  };
}

class ProgressManager {
  constructor() {
    this.data = this._load();
  }

  _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return defaultProgress();
      const parsed = JSON.parse(raw);
      // Merge with defaults so new fields added later don't break old saves.
      return { ...defaultProgress(), ...parsed };
    } catch (err) {
      console.warn('[ProgressManager] Failed to load save, starting fresh:', err);
      return defaultProgress();
    }
  }

  _save() {
    this.data.lastPlayed = new Date().toISOString();
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch (err) {
      console.warn('[ProgressManager] Failed to save progress:', err);
    }
  }

  /** Mark a letter-world as completed, restoring its crystal. */
  completeWorld(letter) {
    this.data.crystals[letter] = true;
    const idx = ALPHABET.indexOf(letter);
    if (idx >= 0 && idx + 1 < ALPHABET.length) {
      this.data.currentWorld = ALPHABET[idx + 1];
    }
    this._save();
  }

  isWorldUnlocked(letter) {
    const idx = ALPHABET.indexOf(letter);
    if (idx <= 0) return true; // A is always unlocked
    const previousLetter = ALPHABET[idx - 1];
    return !!this.data.crystals[previousLetter];
  }

  isWorldCompleted(letter) {
    return !!this.data.crystals[letter];
  }

  getCrystalCount() {
    return Object.values(this.data.crystals).filter(Boolean).length;
  }

  getTotalWorlds() {
    return ALPHABET.length;
  }

  getCurrentWorld() {
    return this.data.currentWorld;
  }

  /** Castle "comes back to life" visual is a pure function of crystal count. */
  getCastleStage() {
    const pct = this.getCrystalCount() / this.getTotalWorlds();
    if (pct === 0) return 'dormant';
    if (pct < 0.25) return 'flickering';
    if (pct < 0.5) return 'glowing';
    if (pct < 1) return 'radiant';
    return 'complete';
  }

  resetAllProgress() {
    this.data = defaultProgress();
    this._save();
  }
}

export const progressManager = new ProgressManager();
export { ALPHABET };
