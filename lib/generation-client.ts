/**
 * Client-Side Generation Utilities
 *
 * Browser-safe functions for calling generation APIs
 */

import { enhanceAudioPrompt } from "./prompt-engineering";

export interface GenerationResult {
  audioUrl: string;
  imageUrl: string;
  caption: string;
  prompt: string;
  round: number;
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
