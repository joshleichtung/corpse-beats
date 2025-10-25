/**
 * Generation Chain Orchestrator
 *
 * Handles the exquisite corpse chaining of audio → image → caption
 * for progressive corruption across multiple rounds.
 */

import { generateAudio, generateImage, captionImage } from "./replicate";
import { enhanceAudioPrompt, enhanceImagePrompt } from "./prompt-engineering";

export interface GenerationResult {
  audioUrl: string;
  imageUrl: string;
  caption: string;
  prompt: string;
  round: number;
}

/**
 * Generate a single sample with full chain: prompt → audio → image → caption
 *
 * @param prompt - Initial text prompt or previous round's caption
 * @param round - Corruption round (0-3)
 * @returns Complete generation result with all outputs
 *
 * @example
 * ```typescript
 * const result = await generateSample("cheerful music box", 0);
 * // Uses result.caption as input for next round
 * const nextResult = await generateSample(result.caption, 1);
 * ```
 */
export async function generateSample(
  prompt: string,
  round: number
): Promise<GenerationResult> {
  // Step 1: Enhance prompt with corruption parameters
  const audioPrompt = enhanceAudioPrompt(prompt, round);

  // Step 2: Generate audio
  const audioResult = await generateAudio(audioPrompt, round);

  // Step 3: Generate image from the same enhanced prompt
  const imageResult = await generateImage(audioPrompt, round);

  // Step 4: Caption the generated image for next round
  const captionResult = await captionImage(imageResult.image_url);

  return {
    audioUrl: audioResult.audio_url,
    imageUrl: imageResult.image_url,
    caption: captionResult.caption,
    prompt: audioPrompt,
    round,
  };
}

/**
 * Generate multiple samples in parallel for a single round
 *
 * @param prompt - Input prompt for this round
 * @param round - Corruption round (0-3)
 * @param count - Number of samples to generate (default: 4)
 * @returns Array of generation results
 *
 * @example
 * ```typescript
 * const samples = await generateRound("music box melody", 0, 4);
 * // samples[0..3] each have audio, image, and caption
 * ```
 */
export async function generateRound(
  prompt: string,
  round: number,
  count: number = 4
): Promise<GenerationResult[]> {
  // Generate all samples in parallel for speed
  const promises = Array.from({ length: count }, () =>
    generateSample(prompt, round)
  );

  return Promise.all(promises);
}

/**
 * Generate 4 rounds of exquisite corpse corruption
 * Uses the caption from the first sample of each round as input to the next round
 *
 * @param initialPrompt - Starting text prompt
 * @param samplesPerRound - Number of samples per round (default: 4)
 * @returns Nested array of results [round][sample]
 *
 * @example
 * ```typescript
 * const allRounds = await generateFullCorpse("cheerful music box", 4);
 * // allRounds[0] = Round 0 (Innocent) - 4 samples
 * // allRounds[1] = Round 1 (Uneasy) - 4 samples
 * // allRounds[2] = Round 2 (Ominous) - 4 samples
 * // allRounds[3] = Round 3 (Horror) - 4 samples
 * ```
 */
export async function generateFullCorpse(
  initialPrompt: string,
  samplesPerRound: number = 4
): Promise<GenerationResult[][]> {
  const allRounds: GenerationResult[][] = [];
  let currentPrompt = initialPrompt;

  for (let round = 0; round < 4; round++) {
    // Generate all samples for this round
    const roundResults = await generateRound(currentPrompt, round, samplesPerRound);
    allRounds.push(roundResults);

    // Use first sample's caption as prompt for next round
    // This creates the "exquisite corpse" effect
    if (round < 3 && roundResults[0]) {
      currentPrompt = roundResults[0].caption;
    }
  }

  return allRounds;
}

/**
 * Client-side API wrapper for single sample generation
 * Calls the API endpoints instead of using Replicate directly
 */
export async function generateSampleViaAPI(
  prompt: string,
  round: number
): Promise<GenerationResult> {
  // Enhance prompt client-side
  const audioPrompt = enhanceAudioPrompt(prompt, round);

  // Call APIs in parallel
  const [audioResponse, imageResponse] = await Promise.all([
    fetch("/api/generate-audio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: audioPrompt }),
    }),
    fetch("/api/generate-image", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ prompt: audioPrompt }),
    }),
  ]);

  if (!audioResponse.ok || !imageResponse.ok) {
    throw new Error("Generation failed");
  }

  const [audioData, imageData] = await Promise.all([
    audioResponse.json(),
    imageResponse.json(),
  ]);

  // Caption the generated image
  const captionResponse = await fetch("/api/caption-image", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ imageUrl: imageData.image_url }),
  });

  if (!captionResponse.ok) {
    throw new Error("Caption generation failed");
  }

  const captionData = await captionResponse.json();

  return {
    audioUrl: audioData.audio_url,
    imageUrl: imageData.image_url,
    caption: captionData.caption,
    prompt: audioPrompt,
    round,
  };
}
