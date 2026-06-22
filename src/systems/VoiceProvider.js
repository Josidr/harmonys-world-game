// ═══════════════════════════════════════════════════════════
// VoiceProvider — the swappable voice abstraction.
//
// Every part of the game calls ONE function:
//     voiceProvider.speak(character, text)
//
// It never knows or cares whether that's browser TTS or the real
// Supabase-backed ElevenLabs voices. Swapping providers later is
// a one-line config change, not a rebuild.
// ═══════════════════════════════════════════════════════════

/**
 * @typedef {Object} SpeakOptions
 * @property {() => void} [onStart]   - called right before audio begins
 * @property {() => void} [onEnd]     - called when audio finishes (or fails)
 * @property {boolean}    [interrupt] - if true, stops any currently playing line first
 */

/**
 * Base interface. Both real providers implement this shape.
 * @interface
 */
class VoiceProvider {
  /**
   * @param {string} character - e.g. "Harmony", "Brix"
   * @param {string} text - the line to speak
   * @param {SpeakOptions} [options]
   * @returns {Promise<void>}
   */
  async speak(character, text, options = {}) {
    throw new Error('speak() not implemented');
  }

  /** Stop whatever is currently playing, if anything. */
  stop() {
    throw new Error('stop() not implemented');
  }

  /** Is audio currently playing? */
  isSpeaking() {
    throw new Error('isSpeaking() not implemented');
  }
}

// ─────────────────────────────────────────────────────────────
// BrowserTTSProvider
// Uses the Web Speech API (SpeechSynthesis). Zero setup, zero
// cost, works offline — the right default while the game is in
// development or as an offline fallback in production.
//
// Limitation: voice quality is whatever the device offers, and
// per-character voice differentiation is approximate (we map
// each character to a pitch/rate combo rather than a real
// distinct voice, since most devices only expose a handful of
// system voices).
// ─────────────────────────────────────────────────────────────

const BROWSER_VOICE_PROFILES = {
  Harmony: { pitch: 1.25, rate: 1.05 },
  Brix:    { pitch: 0.95, rate: 1.0 },
  Mari:    { pitch: 1.15, rate: 1.1 },
  Lila:    { pitch: 1.1,  rate: 0.95 },
  Deuce:   { pitch: 0.85, rate: 0.95 },
  Melani:  { pitch: 1.0,  rate: 1.05 },
  Eliyah:  { pitch: 0.9,  rate: 0.9 },
};

class BrowserTTSProvider extends VoiceProvider {
  constructor() {
    super();
    this._currentUtterance = null;
    this._speaking = false;
  }

  async speak(character, text, options = {}) {
    if (!('speechSynthesis' in window)) {
      console.warn('[BrowserTTSProvider] speechSynthesis not supported on this device.');
      options.onEnd?.();
      return;
    }

    if (options.interrupt) this.stop();

    return new Promise((resolve) => {
      const utterance = new SpeechSynthesisUtterance(text);
      const profile = BROWSER_VOICE_PROFILES[character] || { pitch: 1.0, rate: 1.0 };
      utterance.pitch = profile.pitch;
      utterance.rate = profile.rate;

      utterance.onstart = () => {
        this._speaking = true;
        options.onStart?.();
      };

      const finish = () => {
        this._speaking = false;
        this._currentUtterance = null;
        options.onEnd?.();
        resolve();
      };

      utterance.onend = finish;
      utterance.onerror = (e) => {
        console.warn('[BrowserTTSProvider] utterance error:', e.error);
        finish();
      };

      this._currentUtterance = utterance;
      window.speechSynthesis.speak(utterance);
    });
  }

  stop() {
    if ('speechSynthesis' in window) window.speechSynthesis.cancel();
    this._speaking = false;
    this._currentUtterance = null;
  }

  isSpeaking() {
    return this._speaking;
  }
}

// ─────────────────────────────────────────────────────────────
// SupabaseVoiceProvider
// Calls the deployed generate-character-audio Edge Function,
// plays back the returned MP3 URL via the HTML5 Audio API.
// This is the production provider once the backend is deployed.
// ─────────────────────────────────────────────────────────────

class SupabaseVoiceProvider extends VoiceProvider {
  /**
   * @param {Object} config
   * @param {string} config.supabaseUrl - e.g. https://xxxx.supabase.co
   * @param {string} config.supabaseAnonKey - the public anon key (safe for frontend)
   * @param {VoiceProvider} [config.fallback] - provider to use if the network call fails
   */
  constructor({ supabaseUrl, supabaseAnonKey, fallback = null }) {
    super();
    this.endpoint = `${supabaseUrl}/functions/v1/generate-character-audio`;
    this.anonKey = supabaseAnonKey;
    this.fallback = fallback;
    this._audioEl = null;
    this._speaking = false;

    // Simple in-memory session cache so repeated lines within one
    // play session don't even hit the network — the Edge Function
    // already caches server-side, but this avoids the round trip too.
    this._sessionCache = new Map();
  }

  _cacheKey(character, text) {
    return `${character}::${text}`;
  }

  async speak(character, text, options = {}) {
    if (options.interrupt) this.stop();

    try {
      const audioUrl = await this._resolveAudioUrl(character, text);
      await this._playUrl(audioUrl, options);
    } catch (err) {
      console.warn('[SupabaseVoiceProvider] falling back due to error:', err.message);
      if (this.fallback) {
        await this.fallback.speak(character, text, options);
      } else {
        options.onEnd?.();
      }
    }
  }

  async _resolveAudioUrl(character, text) {
    const key = this._cacheKey(character, text);
    if (this._sessionCache.has(key)) return this._sessionCache.get(key);

    const res = await fetch(this.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.anonKey}`,
      },
      body: JSON.stringify({ character, text }),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || `Voice request failed (${res.status})`);
    }

    const { audioUrl } = await res.json();
    this._sessionCache.set(key, audioUrl);
    return audioUrl;
  }

  _playUrl(url, options) {
    return new Promise((resolve, reject) => {
      const audio = new Audio(url);
      this._audioEl = audio;

      audio.onplay = () => {
        this._speaking = true;
        options.onStart?.();
      };

      const finish = () => {
        this._speaking = false;
        this._audioEl = null;
        options.onEnd?.();
        resolve();
      };

      audio.onended = finish;
      audio.onerror = () => {
        reject(new Error('Audio playback failed (NotSupportedError or network issue)'));
      };

      // Browsers can throw on play() if called outside a user gesture
      // chain in rare cases — catch and surface to the fallback path.
      audio.play().catch((playErr) => reject(playErr));
    });
  }

  stop() {
    if (this._audioEl) {
      this._audioEl.pause();
      this._audioEl.currentTime = 0;
      this._audioEl = null;
    }
    this._speaking = false;
  }

  isSpeaking() {
    return this._speaking;
  }
}

// ─────────────────────────────────────────────────────────────
// Factory — this is the single place that decides which provider
// is active. Change ONE line here (or pass a different mode in
// from config) to flip the whole game's voice system.
// ─────────────────────────────────────────────────────────────

/**
 * @param {Object} options
 * @param {'browser'|'supabase'} options.mode
 * @param {string} [options.supabaseUrl]
 * @param {string} [options.supabaseAnonKey]
 */
function createVoiceProvider({ mode, supabaseUrl, supabaseAnonKey } = {}) {
  const browserProvider = new BrowserTTSProvider();

  if (mode === 'supabase') {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn(
        '[createVoiceProvider] mode is "supabase" but supabaseUrl/supabaseAnonKey missing — falling back to browser TTS.'
      );
      return browserProvider;
    }
    return new SupabaseVoiceProvider({
      supabaseUrl,
      supabaseAnonKey,
      fallback: browserProvider,
    });
  }

  // Default / dev mode
  return browserProvider;
}

export { VoiceProvider, BrowserTTSProvider, SupabaseVoiceProvider, createVoiceProvider };
