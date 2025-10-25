/**
 * Corruption System Usage Examples
 *
 * Demonstrates the progressive transformation across 4 rounds
 * from innocent/pastel to horror/disturbing aesthetics.
 */

import {
  getCorruptionLevel,
  getAudioModifiers,
  getImageModifiers,
  getRoundName,
  getRoundColor,
  getRoundMetadata,
} from '../lib/corruption';

import {
  enhanceAudioPrompt,
  enhanceImagePrompt,
  combineCaptions,
  validatePrompt,
} from '../lib/prompt-engineering';

// =============================================================================
// EXAMPLE 1: Complete 4-Round Corruption Pipeline
// =============================================================================

console.log('\n=== EXAMPLE 1: Complete 4-Round Pipeline ===\n');

const userPrompt = 'lo-fi study beats';

// Round 0: Innocent baseline
console.log('ROUND 0: INNOCENT');
console.log('  Corruption Level:', getCorruptionLevel(0)); // 0.0
console.log('  Round Name:', getRoundName(0)); // "Innocent"
console.log('  Theme Color:', getRoundColor(0)); // "pastel-pink"

const round0Audio = enhanceAudioPrompt(userPrompt, 0);
console.log('  Audio Prompt:', round0Audio);
// → "lo-fi study beats, cheerful, bright, innocent"

// Simulate BLIP captions from Round 0 images
const round0Captions = [
  'soft pink clouds floating in dreamy sky',
  'pastel blue atmosphere with gentle highlights',
];
const round0Combined = combineCaptions(round0Captions);

const round0Image = enhanceImagePrompt(round0Combined, 0);
console.log('  Image Prompt:', round0Image);
// → "soft pink clouds..., pastel colors, soft lighting, dreamy"

// Round 1: Uneasy shift
console.log('\nROUND 1: UNEASY');
console.log('  Corruption Level:', getCorruptionLevel(1)); // 0.33
console.log('  Round Name:', getRoundName(1)); // "Uneasy"
console.log('  Theme Color:', getRoundColor(1)); // "dusty-rose"

const round1Captions = [
  'faded rose tones in dim lighting',
  'slightly desaturated colors with soft shadows',
];
const round1Combined = combineCaptions(round1Captions);

const round1Audio = enhanceAudioPrompt(round1Combined, 1);
console.log('  Audio Prompt:', round1Audio);
// → "faded rose tones..., unsettling, slightly off-key, uneasy"

const round1Image = enhanceImagePrompt(round1Combined, 1);
console.log('  Image Prompt:', round1Image);
// → "faded rose tones..., faded colors, dim lighting, eerie"

// Round 2: Ominous darkness
console.log('\nROUND 2: OMINOUS');
console.log('  Corruption Level:', getCorruptionLevel(2)); // 0.66
console.log('  Metadata:', JSON.stringify(getRoundMetadata(2), null, 2));
// → { name: "Ominous", color: "bruised-plum", description: "Dark, brooding...", corruptionLevel: 0.66 }

const round2Captions = [
  'dark bruised colors with heavy shadows',
  'murky olive tones with ominous atmosphere',
];
const round2Combined = combineCaptions(round2Captions);

const round2Audio = enhanceAudioPrompt(round2Combined, 2);
console.log('  Audio Prompt:', round2Audio);
// → "dark bruised colors..., dark, dissonant, ominous"

const round2Image = enhanceImagePrompt(round2Combined, 2);
console.log('  Image Prompt:', round2Image);
// → "dark bruised colors..., dark shadows, bruised colors, menacing"

// Round 3: Full horror
console.log('\nROUND 3: HORROR');
console.log('  Corruption Level:', getCorruptionLevel(3)); // 1.0
console.log('  Round Name:', getRoundName(3)); // "Horror"
console.log('  Theme Color:', getRoundColor(3)); // "blood-red"

const round3Captions = [
  'nightmare imagery with blood red tones',
  'pitch black shadows with disturbing atmosphere',
];
const round3Combined = combineCaptions(round3Captions);

const round3Audio = enhanceAudioPrompt(round3Combined, 3);
console.log('  Audio Prompt:', round3Audio);
// → "nightmare imagery..., horrifying, nightmarish, disturbing"

const round3Image = enhanceImagePrompt(round3Combined, 3);
console.log('  Image Prompt:', round3Image);
// → "nightmare imagery..., blood red, pitch black, grotesque"

// =============================================================================
// EXAMPLE 2: Prompt Validation
// =============================================================================

console.log('\n=== EXAMPLE 2: Prompt Validation ===\n');

console.log('Valid prompts:');
console.log('  "lo-fi study beats":', validatePrompt('lo-fi study beats')); // true
console.log('  "dreamy electronic music":', validatePrompt('dreamy electronic music')); // true

console.log('\nInvalid prompts:');
console.log('  "" (empty):', validatePrompt('')); // false
console.log('  "ok" (too short):', validatePrompt('ok')); // false
console.log('  "123" (no letters):', validatePrompt('123')); // false

// =============================================================================
// EXAMPLE 3: Visual Progression Demo
// =============================================================================

console.log('\n=== EXAMPLE 3: Visual Aesthetic Progression ===\n');

const baseCaption = 'a dreamy landscape scene';

for (let round = 0; round <= 3; round++) {
  const metadata = getRoundMetadata(round);
  const imagePrompt = enhanceImagePrompt(baseCaption, round);

  console.log(`Round ${round} (${metadata.name}):`);
  console.log(`  Color Theme: ${metadata.color}`);
  console.log(`  Corruption: ${(metadata.corruptionLevel * 100).toFixed(0)}%`);
  console.log(`  Description: ${metadata.description}`);
  console.log(`  Image Prompt: ${imagePrompt}`);
  console.log('');
}

// =============================================================================
// EXAMPLE 4: Audio Progression Demo
// =============================================================================

console.log('\n=== EXAMPLE 4: Audio Mood Progression ===\n');

const baseAudioPrompt = 'ambient electronic soundscape';

for (let round = 0; round <= 3; round++) {
  const audioPrompt = enhanceAudioPrompt(baseAudioPrompt, round);
  const modifiers = getAudioModifiers(round);

  console.log(`Round ${round}:`);
  console.log(`  Modifiers: ${modifiers}`);
  console.log(`  Full Prompt: ${audioPrompt}`);
  console.log('');
}

// =============================================================================
// EXAMPLE 5: Caption Combination with Truncation
// =============================================================================

console.log('\n=== EXAMPLE 5: Caption Combination & Truncation ===\n');

// Short captions - no truncation needed
const shortCaptions = [
  'soft pink clouds',
  'dreamy atmosphere',
  'gentle lighting',
];
console.log('Short captions:', combineCaptions(shortCaptions));

// Long captions - will be truncated at word boundary
const longCaptions = [
  'a landscape with soft pastel pink clouds floating in a dreamy sky with ethereal lighting',
  'gentle blue highlights creating a peaceful and serene atmosphere with warm undertones',
  'warm cream tones with soft focus and delicate shadows creating a comforting ambiance',
  'playful whimsical elements scattered throughout the composition with innocent charm',
];
const combined = combineCaptions(longCaptions);
console.log('Long captions (truncated):', combined);
console.log('Length:', combined.length, 'chars (max 500)');

// =============================================================================
// EXAMPLE 6: Round-by-Round Metadata
// =============================================================================

console.log('\n=== EXAMPLE 6: Complete Round Metadata ===\n');

for (let round = 0; round <= 3; round++) {
  const metadata = getRoundMetadata(round);
  console.log(`Round ${round}:`, JSON.stringify(metadata, null, 2));
}
