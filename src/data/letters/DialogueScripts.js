// ═══════════════════════════════════════════════════════════
// DialogueScripts — generates every spoken line from a single
// LetterData entry. This is what makes dialogue reusable too:
// the SAME script generator runs for every letter, just filling
// in {location}, {sound}, {uppercase} etc. from that letter's data.
//
// These are template lines, written once, matching the tone and
// exact beats from the design doc (intro/mission/discovery/
// success/mistake/celebration). Nothing here is invented per
// letter — only the data slots change.
// ═══════════════════════════════════════════════════════════

/**
 * @param {import('./LetterData.js').LetterDataEntry} letterData
 */
export function buildLetterScript(letterData) {
  const { location, uppercase, phonicsSound, rewardName } = letterData;

  return {
    intro: [
      { character: 'Harmony', text: `Wow! Look at ${location}!` },
      { character: 'Brix', text: 'Oh no! The Alphabet Crystal has lost its glow!' },
      { character: 'Harmony', text: 'I think our friend can help us!' },
      { character: 'Brix', text: `Let's explore and find things that start with ${uppercase}!` },
    ],

    mission: [
      { character: 'Harmony', text: 'Touch the things you find!' },
      { character: 'Brix', text: `We're looking for things that start with the letter ${uppercase}.` },
    ],

    firstDiscovery: [{ character: 'Harmony', text: 'You found something!' }],

    discoverySuccess: [{ character: 'Brix', text: `That starts with ${uppercase}!` }],

    mistake: [{ character: 'Harmony', text: "Good try, Friend! Let's keep looking!" }],

    letterChallengeIntro: [
      { character: 'Brix', text: `Now let's build the letter ${uppercase} together!` },
      { character: 'Harmony', text: `Trace the big ${uppercase}, just like this!` },
    ],

    letterChallengeSuccess: [
      { character: 'Brix', text: `Excellent! You built the letter ${uppercase}!` },
      { character: 'Harmony', text: "You're doing amazing, Friend!" },
    ],

    soundQuestIntro: [
      { character: 'Brix', text: `Listen to this sound — ${phonicsSound}` },
      { character: 'Harmony', text: `Can you hear the ${uppercase} sound?` },
    ],

    soundQuestSuccess: [
      { character: 'Brix', text: `That's it! ${uppercase} says ${phonicsSound}!` },
    ],

    miniBossIntro: [
      { character: 'Harmony', text: 'Uh oh! A gust of wind scattered everything!' },
      { character: 'Brix', text: 'Help us catch them before they roll away!' },
    ],

    miniBossSuccess: [{ character: 'Harmony', text: 'You caught them all! Great job, Friend!' }],

    worldTransformation: [
      { character: 'Brix', text: 'The Alphabet Crystal is glowing again!' },
      { character: 'Harmony', text: `Look, you unlocked the ${rewardName}!` },
    ],

    celebration: [
      { character: 'Harmony', text: `You saved ${location}!` },
      { character: 'Brix', text: "You're a true Letter Adventurer!" },
      { character: 'Harmony', text: "Let's see what's next, Friend!" },
    ],
  };
}
