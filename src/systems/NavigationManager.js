// ═══════════════════════════════════════════════════════════
// NavigationManager — a real history stack for scene transitions.
//
// Ports the proven pattern from the busy-book app: back button
// goes to the ACTUAL previous scene, not a hardcoded destination.
// In Phaser terms this wraps scene.start()/scene.stop() calls
// with a stack so navBack() always works correctly regardless
// of how deep the child has navigated.
// ═══════════════════════════════════════════════════════════

class NavigationManager {
  constructor() {
    this._history = [];
  }

  /**
   * Navigate to a new scene, pushing the current one onto history.
   * @param {Phaser.Scene} currentScene - the scene calling this
   * @param {string} targetKey - the scene key to navigate to
   * @param {Object} [data] - data to pass to the target scene
   */
  goTo(currentScene, targetKey, data = {}) {
    this._history.push({ key: currentScene.scene.key, data: currentScene.scene.settings.data });
    currentScene.scene.start(targetKey, data);
  }

  /**
   * Go back to the actual previous scene. If history is empty,
   * falls back to the provided defaultKey (e.g. the home screen).
   * @param {Phaser.Scene} currentScene
   * @param {string} defaultKey
   */
  goBack(currentScene, defaultKey = 'HomeScene') {
    const previous = this._history.pop();
    if (previous) {
      currentScene.scene.start(previous.key, previous.data);
    } else {
      currentScene.scene.start(defaultKey);
    }
  }

  /** Clear history entirely — use when starting a fresh session from home. */
  reset() {
    this._history = [];
  }

  canGoBack() {
    return this._history.length > 0;
  }
}

// Singleton — one shared navigation stack across the whole game,
// matching the original `_navHistory` pattern (global, not per-scene).
export const navigationManager = new NavigationManager();
