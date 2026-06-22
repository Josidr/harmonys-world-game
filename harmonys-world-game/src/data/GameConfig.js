// ═══════════════════════════════════════════════════════════
// Game Config — the ONE file you touch to flip environments.
//
// VOICE_MODE controls the entire voice system:
//   'browser'  → Web Speech API, no backend needed, works today
//   'supabase' → real ElevenLabs voices via the deployed Edge
//                Function, falls back to browser TTS automatically
//                if the network call ever fails
//
// SUPABASE_ANON_KEY is the PUBLIC anon key — it is safe to ship
// in frontend code by design (Supabase's RLS policies protect the
// data, and the anon key alone can't read secrets or call
// ElevenLabs directly). The actual ElevenLabs/Anthropic keys live
// ONLY in Supabase secrets, never here, never in any frontend file.
// ═══════════════════════════════════════════════════════════

export const GAME_CONFIG = {
  VOICE_MODE: 'browser', // ← change to 'supabase' once the Edge Function is deployed

  SUPABASE_URL: 'https://YOUR-PROJECT-REF.supabase.co',
  SUPABASE_ANON_KEY: 'YOUR-PUBLIC-ANON-KEY',

  // Visual / gameplay tuning
  GAME_WIDTH: 1280,
  GAME_HEIGHT: 720,

  // Voice pacing rule from the design doc: something meaningful
  // should be heard every 5-10s, but the game should never force
  // silence longer than this between ambient character lines.
  MAX_AMBIENT_SILENCE_MS: 10000,
};
