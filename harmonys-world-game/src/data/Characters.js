// ═══════════════════════════════════════════════════════════
// Character Registry — LOCKED. Names, roles, and colors match
// the established So Harmony's World brand exactly. Do not
// rename or recolor without updating the brand doc too.
// ═══════════════════════════════════════════════════════════

export const CHARACTERS = {
  Harmony: {
    name: 'Harmony',
    role: 'The Helper',
    color: 0xff6b9d,
    colorHex: '#FF6B9D',
    spriteKey: 'char_harmony',
    domain: 'host', // appears in every world as co-narrator
  },
  Brix: {
    name: 'Brix',
    role: 'The Educator',
    color: 0x9b59ff,
    colorHex: '#9B59FF',
    spriteKey: 'char_brix',
    domain: 'literacy', // Alphabet Adventure home character
  },
  Mari: {
    name: 'Mari',
    role: 'The Creator',
    color: 0xff9f43,
    colorHex: '#FF9F43',
    spriteKey: 'char_mari',
    domain: 'creative',
  },
  Lila: {
    name: 'Lila',
    role: 'The Thinker',
    color: 0x4ecbff,
    colorHex: '#4ECBFF',
    spriteKey: 'char_lila',
    domain: 'communication',
  },
  Deuce: {
    name: 'Deuce',
    role: 'The Architect',
    color: 0x3bd973,
    colorHex: '#3BD973',
    spriteKey: 'char_deuce',
    domain: 'stem',
  },
  Melani: {
    name: 'Melani',
    role: 'The Doer',
    color: 0x26d0ce,
    colorHex: '#26D0CE',
    spriteKey: 'char_melani',
    domain: 'life_skills',
  },
  Eliyah: {
    name: 'Eliyah',
    role: 'The Believer',
    color: 0x667eea,
    colorHex: '#667EEA',
    spriteKey: 'char_eliyah',
    domain: 'faith',
  },
};

export const HOST_CHARACTER = 'Harmony';
