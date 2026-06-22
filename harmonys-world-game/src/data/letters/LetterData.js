// ═══════════════════════════════════════════════════════════
// LetterData — the ONLY thing that changes per letter.
//
// LetterMissionScene reads one of these objects and renders the
// entire adventure from it. Adding a new letter means adding a
// new object to LETTER_DATA below (plus its art) — never a new
// scene, never a new code file, never a new game.
//
// Vocabulary object art (apple, ball, bee, etc.) lives in ONE
// shared global library — public/assets/objects/<spriteKey>.png
// — because the same object (an apple, a butterfly) can
// legitimately appear as a distractor in one letter's world and
// a target in another's. Only backgrounds and reward art are
// location-specific, since those are unique per letter.
// ═══════════════════════════════════════════════════════════

/**
 * @typedef {Object} LetterDataEntry
 * @property {string} letter            - e.g. 'A'
 * @property {string} uppercase         - e.g. 'A'
 * @property {string} lowercase         - e.g. 'a'
 * @property {string} phonicsSound      - e.g. '/a/' (used for dialogue text, spoken via voice)
 * @property {string} location          - the adventure location name, e.g. 'Apple Garden'
 * @property {string} backgroundKey     - texture key for the location background (location-specific art)
 * @property {string} rewardName        - e.g. 'Apple Tree' — what the world unlocks visually on completion
 * @property {string} rewardKey         - texture key for the reward visual (location-specific art)
 * @property {LetterObject[]} objects       - correct vocabulary objects (start with this letter)
 * @property {LetterObject[]} distractors   - incorrect objects (don't start with this letter)
 * @property {{x:number, y:number}[]} tracePath - ordered points for MagicTraceModule
 */

/**
 * @typedef {Object} LetterObject
 * @property {string} id
 * @property {string} name        - e.g. 'apple' (used only for spoken dialogue, never shown as text)
 * @property {string} spriteKey   - key into the SHARED object art library, e.g. 'obj_apple'
 * @property {number} [x]         - optional fixed position for LetterHuntModule; randomized if omitted
 * @property {number} [y]
 */

export const LETTER_DATA = {
  A: {
    letter: 'A',
    uppercase: 'A',
    lowercase: 'a',
    phonicsSound: '/a/',
    location: 'Apple Garden',
    backgroundKey: 'bg_apple_garden',
    rewardName: 'Apple Tree',
    rewardKey: 'reward_apple_tree',
    objects: [
      { id: 'apple_1', name: 'apple', spriteKey: 'obj_apple', x: 320, y: 420 },
      { id: 'apple_2', name: 'apple', spriteKey: 'obj_apple', x: 980, y: 360 },
      { id: 'acorn', name: 'acorn', spriteKey: 'obj_acorn', x: 640, y: 500 },
    ],
    distractors: [
      { id: 'butterfly', name: 'butterfly', spriteKey: 'obj_butterfly', x: 460, y: 250 },
      { id: 'rock', name: 'rock', spriteKey: 'obj_rock', x: 800, y: 480 },
    ],
    tracePath: [
      { x: 560, y: 250 },
      { x: 640, y: 450 },
      { x: 600, y: 350 },
      { x: 680, y: 350 },
      { x: 720, y: 450 },
    ],
  },

  B: {
    letter: 'B',
    uppercase: 'B',
    lowercase: 'b',
    phonicsSound: '/b/',
    location: 'Butterfly Meadow',
    backgroundKey: 'bg_butterfly_meadow',
    rewardName: 'Butterfly Garden',
    rewardKey: 'reward_butterfly_garden',
    objects: [
      { id: 'ball', name: 'ball', spriteKey: 'obj_ball', x: 320, y: 420 },
      { id: 'bee', name: 'bee', spriteKey: 'obj_bee', x: 980, y: 360 },
      { id: 'butterfly_b', name: 'butterfly', spriteKey: 'obj_butterfly', x: 640, y: 500 },
    ],
    distractors: [
      { id: 'apple_d', name: 'apple', spriteKey: 'obj_apple', x: 460, y: 250 },
      { id: 'fish', name: 'fish', spriteKey: 'obj_fish', x: 800, y: 480 },
    ],
    tracePath: [
      { x: 560, y: 220 },
      { x: 560, y: 450 },
      { x: 560, y: 340 },
      { x: 640, y: 340 },
      { x: 660, y: 280 },
      { x: 640, y: 220 },
      { x: 560, y: 220 },
      { x: 640, y: 340 },
      { x: 660, y: 400 },
      { x: 640, y: 450 },
      { x: 560, y: 450 },
    ],
  },

  // C through Z follow the exact same shape. Add new entries here —
  // no engine code changes, only data + matching art:
  //   - background/reward art → public/assets/letters/<letter>/
  //   - any NEW vocabulary object sprites → public/assets/objects/
  //     (re-use existing spriteKeys for objects that already exist,
  //     like 'obj_apple', instead of duplicating the art)
};

export const ALPHABET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

/** Only letters with a real data entry can currently be played. */
export function isLetterBuilt(letter) {
  return Boolean(LETTER_DATA[letter]);
}
