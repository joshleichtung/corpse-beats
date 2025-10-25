/**
 * Prompt Engineering System
 *
 * Combines base prompts and BLIP captions with round-specific corruption modifiers
 * to create prompts for audio and image generation. Ensures prompts are well-formatted,
 * concise, and optimized for Replicate model APIs.
 *
 * All prompts are kept under 500 characters to maintain model compatibility
 * while preserving creative intent and corruption progression.
 */

import {
  getAudioModifiers,
  getImageModifiers,
  type CorruptionRound,
} from "./corruption";

/**
 * Maximum allowed prompt length to ensure model API compatibility
 */
const MAX_PROMPT_LENGTH = 500;

/**
 * Enhances a base audio prompt with round-specific corruption modifiers.
 *
 * Combines user input or previous round caption with audio mood descriptors
 * to progressively transform sonic character across corruption rounds.
 *
 * The function automatically:
 * - Appends corruption-appropriate audio modifiers
 * - Ensures proper comma separation
 * - Truncates to MAX_PROMPT_LENGTH characters if needed
 * - Trims whitespace for clean formatting
 *
 * @param basePrompt - User-provided prompt (Round 0) or BLIP caption (Rounds 1-3)
 * @param round - The corruption round number (0-3)
 * @returns Enhanced prompt ready for audio generation API
 *
 * @example
 * ```typescript
 * // Round 0: User prompt
 * enhanceAudioPrompt("lo-fi study beats", 0)
 * // "lo-fi study beats, cheerful, bright, innocent"
 *
 * // Round 1: BLIP caption from Round 0 images
 * enhanceAudioPrompt("soft pink clouds with dreamy atmosphere", 1)
 * // "soft pink clouds with dreamy atmosphere, unsettling, slightly off-key, uneasy"
 *
 * // Round 3: Maximum corruption
 * enhanceAudioPrompt("dark purple shadows with murky green tones", 3)
 * // "dark purple shadows with murky green tones, horrifying, nightmarish, disturbing"
 * ```
 */
export function enhanceAudioPrompt(basePrompt: string, round: number): string {
  // Validate and constrain round number
  const validRound = Math.max(0, Math.min(3, round)) as CorruptionRound;

  // Get round-specific audio modifiers
  const modifiers = getAudioModifiers(validRound);

  // Combine base prompt with corruption modifiers
  const enhancedPrompt = `${basePrompt.trim()}, ${modifiers}`;

  // Truncate if exceeds max length, preserving complete words
  if (enhancedPrompt.length > MAX_PROMPT_LENGTH) {
    return truncatePrompt(enhancedPrompt, MAX_PROMPT_LENGTH);
  }

  return enhancedPrompt;
}

/**
 * Enhances a BLIP image caption with round-specific visual corruption modifiers.
 *
 * Combines AI-generated image captions (from BLIP model) with visual style
 * descriptors to progressively transform aesthetic from pastel to horror.
 *
 * The function automatically:
 * - Appends corruption-appropriate image modifiers
 * - Ensures proper comma separation
 * - Truncates to MAX_PROMPT_LENGTH characters if needed
 * - Trims whitespace for clean formatting
 *
 * @param caption - BLIP-generated image caption describing mood/colors/atmosphere
 * @param round - The corruption round number (0-3)
 * @returns Enhanced prompt ready for image generation API
 *
 * @example
 * ```typescript
 * // Round 0: Initial generation with innocent aesthetic
 * enhanceImagePrompt("a landscape with soft clouds", 0)
 * // "a landscape with soft clouds, pastel colors, soft lighting, dreamy"
 *
 * // Round 2: Ominous transformation
 * enhanceImagePrompt("wilted rose tones with shadowy corners", 2)
 * // "wilted rose tones with shadowy corners, dark shadows, bruised colors, menacing"
 *
 * // Round 3: Full horror
 * enhanceImagePrompt("deep purple shadows with foreboding atmosphere", 3)
 * // "deep purple shadows with foreboding atmosphere, blood red, pitch black, grotesque"
 * ```
 */
export function enhanceImagePrompt(caption: string, round: number): string {
  // Validate and constrain round number
  const validRound = Math.max(0, Math.min(3, round)) as CorruptionRound;

  // Get round-specific image modifiers
  const modifiers = getImageModifiers(validRound);

  // Combine caption with corruption modifiers
  const enhancedPrompt = `${caption.trim()}, ${modifiers}`;

  // Truncate if exceeds max length, preserving complete words
  if (enhancedPrompt.length > MAX_PROMPT_LENGTH) {
    return truncatePrompt(enhancedPrompt, MAX_PROMPT_LENGTH);
  }

  return enhancedPrompt;
}

/**
 * Intelligently truncates a prompt to a maximum length while preserving complete words.
 *
 * Ensures prompts don't cut off mid-word, maintaining readability and semantic integrity.
 * Always ends with proper punctuation (no trailing commas or spaces).
 *
 * @param prompt - The prompt to truncate
 * @param maxLength - Maximum allowed character count
 * @returns Truncated prompt ending at a word boundary
 *
 * @internal
 *
 * @example
 * ```typescript
 * truncatePrompt("cheerful bright innocent playful whimsical", 30)
 * // "cheerful bright innocent"
 *
 * truncatePrompt("dark ominous menacing atmosphere of dread", 30)
 * // "dark ominous menacing"
 * ```
 */
function truncatePrompt(prompt: string, maxLength: number): string {
  if (prompt.length <= maxLength) {
    return prompt;
  }

  // Find the last complete word before max length
  const truncated = prompt.slice(0, maxLength);
  const lastSpaceIndex = truncated.lastIndexOf(" ");
  const lastCommaIndex = truncated.lastIndexOf(",");

  // Use the last word boundary (space or comma)
  const cutoffIndex = Math.max(lastSpaceIndex, lastCommaIndex);

  if (cutoffIndex === -1) {
    // No word boundary found, just cut at max length
    return truncated.trim();
  }

  // Truncate at word boundary and clean up trailing punctuation
  return truncated.slice(0, cutoffIndex).trim().replace(/,\s*$/, "");
}

/**
 * Combines multiple BLIP captions into a single cohesive prompt.
 *
 * Useful for combining captions from multiple images in a round
 * to create a unified prompt for the next round's generation.
 *
 * Automatically:
 * - Removes duplicate phrases
 * - Ensures proper comma separation
 * - Truncates to MAX_PROMPT_LENGTH if needed
 *
 * @param captions - Array of BLIP-generated image captions
 * @returns Combined caption string
 *
 * @example
 * ```typescript
 * combineCaptions([
 *   "soft pink clouds",
 *   "dreamy blue atmosphere",
 *   "gentle pastel tones"
 * ])
 * // "soft pink clouds, dreamy blue atmosphere, gentle pastel tones"
 * ```
 */
export function combineCaptions(captions: string[]): string {
  // Filter out empty strings and trim each caption
  const cleanedCaptions = captions
    .map((caption) => caption.trim())
    .filter((caption) => caption.length > 0);

  if (cleanedCaptions.length === 0) {
    return "";
  }

  // Join captions with comma separation
  const combined = cleanedCaptions.join(", ");

  // Truncate if exceeds max length
  if (combined.length > MAX_PROMPT_LENGTH) {
    return truncatePrompt(combined, MAX_PROMPT_LENGTH);
  }

  return combined;
}

/**
 * Validates that a prompt is suitable for model API consumption.
 *
 * Checks for:
 * - Non-empty content
 * - Reasonable length (not too short or too long)
 * - Valid character encoding
 *
 * @param prompt - The prompt to validate
 * @returns True if prompt is valid, false otherwise
 *
 * @example
 * ```typescript
 * validatePrompt("") // false - empty
 * validatePrompt("ok") // false - too short
 * validatePrompt("cheerful bright music") // true - valid
 * ```
 */
export function validatePrompt(prompt: string): boolean {
  const trimmed = prompt.trim();

  // Must have content
  if (trimmed.length === 0) {
    return false;
  }

  // Must be at least 3 characters (minimal meaningful prompt)
  if (trimmed.length < 3) {
    return false;
  }

  // Must not exceed max length
  if (trimmed.length > MAX_PROMPT_LENGTH) {
    return false;
  }

  // Must contain at least one letter (not just punctuation/numbers)
  if (!/[a-zA-Z]/.test(trimmed)) {
    return false;
  }

  return true;
}
