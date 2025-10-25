/**
 * Corruption Parameter System
 *
 * Progressive transformation system that evolves prompts from pastel/innocent
 * aesthetics to horror/disturbing across 4 rounds of generation.
 *
 * Round 0: Innocent baseline (pastel, dreamy, soft)
 * Round 1: Uneasy shift (faded, slightly off)
 * Round 2: Ominous darkness (dark, menacing, brooding)
 * Round 3: Full horror (nightmarish, grotesque, disturbing)
 */

/**
 * Valid corruption round numbers (0-3)
 * - Round 0: Innocent baseline
 * - Round 1: Uneasy shift
 * - Round 2: Ominous darkness
 * - Round 3: Full horror
 */
export type CorruptionRound = 0 | 1 | 2 | 3;

/**
 * Round metadata including name, color theme, and descriptive characteristics
 */
export interface RoundMetadata {
  name: string;
  color: string;
  description: string;
  corruptionLevel: number;
}

/**
 * Gets the corruption level (0.0 to 1.0) for a given round.
 *
 * Corruption levels represent the intensity of horror transformation:
 * - Round 0: 0.0 (innocent, no corruption)
 * - Round 1: 0.33 (subtle unease)
 * - Round 2: 0.66 (ominous darkness)
 * - Round 3: 1.0 (full horror)
 *
 * @param round - The corruption round number (0-3)
 * @returns Corruption intensity from 0.0 (innocent) to 1.0 (horror)
 *
 * @example
 * ```typescript
 * getCorruptionLevel(0) // 0.0 - innocent
 * getCorruptionLevel(1) // 0.33 - uneasy
 * getCorruptionLevel(2) // 0.66 - ominous
 * getCorruptionLevel(3) // 1.0 - horror
 * ```
 */
export function getCorruptionLevel(round: number): number {
  const validRound = Math.max(0, Math.min(3, round)) as CorruptionRound;

  const levels: Record<CorruptionRound, number> = {
    0: 0.0,
    1: 0.33,
    2: 0.66,
    3: 1.0,
  };

  return levels[validRound];
}

/**
 * Gets audio generation prompt modifiers for a given round.
 *
 * These modifiers are appended to base audio prompts to progressively
 * transform the sonic character from cheerful/innocent to horrifying/disturbing.
 *
 * @param round - The corruption round number (0-3)
 * @returns Comma-separated string of audio mood descriptors
 *
 * @example
 * ```typescript
 * getAudioModifiers(0) // "cheerful, bright, innocent"
 * getAudioModifiers(3) // "horrifying, nightmarish, disturbing"
 * ```
 */
export function getAudioModifiers(round: number): string {
  const validRound = Math.max(0, Math.min(3, round)) as CorruptionRound;

  const modifiers: Record<CorruptionRound, string> = {
    0: "cheerful, bright, innocent",
    1: "unsettling, slightly off-key, uneasy",
    2: "dark, dissonant, ominous",
    3: "horrifying, nightmarish, disturbing",
  };

  return modifiers[validRound];
}

/**
 * Gets image generation prompt modifiers for a given round.
 *
 * These modifiers are appended to BLIP captions to progressively
 * transform visual aesthetics from pastel/dreamy to horror/grotesque.
 *
 * @param round - The corruption round number (0-3)
 * @returns Comma-separated string of visual style descriptors
 *
 * @example
 * ```typescript
 * getImageModifiers(0) // "pastel colors, soft lighting, dreamy"
 * getImageModifiers(3) // "blood red, pitch black, grotesque"
 * ```
 */
export function getImageModifiers(round: number): string {
  const validRound = Math.max(0, Math.min(3, round)) as CorruptionRound;

  const modifiers: Record<CorruptionRound, string> = {
    0: "pastel colors, soft lighting, dreamy",
    1: "faded colors, dim lighting, eerie",
    2: "dark shadows, bruised colors, menacing",
    3: "blood red, pitch black, grotesque",
  };

  return modifiers[validRound];
}

/**
 * Gets the human-readable name for a corruption round.
 *
 * @param round - The corruption round number (0-3)
 * @returns Round name descriptor
 *
 * @example
 * ```typescript
 * getRoundName(0) // "Innocent"
 * getRoundName(3) // "Horror"
 * ```
 */
export function getRoundName(round: number): string {
  const validRound = Math.max(0, Math.min(3, round)) as CorruptionRound;

  const names: Record<CorruptionRound, string> = {
    0: "Innocent",
    1: "Uneasy",
    2: "Ominous",
    3: "Horror",
  };

  return names[validRound];
}

/**
 * Gets the color theme identifier for a corruption round.
 *
 * Returns Tailwind CSS color names that correspond to the visual
 * aesthetic of each corruption stage. These colors are defined in
 * tailwind.config.ts and match the pastel-to-horror progression.
 *
 * @param round - The corruption round number (0-3)
 * @returns Tailwind CSS color identifier
 *
 * @example
 * ```typescript
 * getRoundColor(0) // "pastel-pink"
 * getRoundColor(3) // "blood-red"
 * ```
 */
export function getRoundColor(round: number): string {
  const validRound = Math.max(0, Math.min(3, round)) as CorruptionRound;

  const colors: Record<CorruptionRound, string> = {
    0: "pastel-pink",
    1: "dusty-rose",
    2: "bruised-plum",
    3: "blood-red",
  };

  return colors[validRound];
}

/**
 * Gets comprehensive metadata for a corruption round.
 *
 * Convenience function that combines all round information into a single object.
 *
 * @param round - The corruption round number (0-3)
 * @returns Complete round metadata including name, color, description, and level
 *
 * @example
 * ```typescript
 * getRoundMetadata(1)
 * // {
 * //   name: "Uneasy",
 * //   color: "dusty-rose",
 * //   description: "Slightly off, faded nostalgia",
 * //   corruptionLevel: 0.33
 * // }
 * ```
 */
export function getRoundMetadata(round: number): RoundMetadata {
  const validRound = Math.max(0, Math.min(3, round)) as CorruptionRound;

  const descriptions: Record<CorruptionRound, string> = {
    0: "Soft, dreamy, innocent baseline",
    1: "Slightly off, faded nostalgia",
    2: "Dark, brooding, menacing atmosphere",
    3: "Nightmare horror, maximum corruption",
  };

  return {
    name: getRoundName(validRound),
    color: getRoundColor(validRound),
    description: descriptions[validRound],
    corruptionLevel: getCorruptionLevel(validRound),
  };
}
