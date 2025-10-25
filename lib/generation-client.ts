/**
 * Client-Side Generation Utilities
 *
 * Browser-safe functions for calling generation APIs
 */

import { enhanceAudioPrompt, enhanceImagePrompt } from "./prompt-engineering";

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
 * Includes retry logic for rate limits
 */
export async function generateSampleViaAPI(
  prompt: string,
  round: number
): Promise<GenerationResult> {
  // Enhance prompts client-side - separate for audio and image
  const audioPrompt = enhanceAudioPrompt(prompt, round);
  const imagePrompt = enhanceImagePrompt(prompt, round);

  // Retry configuration
  const maxRetries = 3;
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      // Call APIs sequentially to reduce rate limit pressure
      const audioResponse = await fetch("/api/generate-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: audioPrompt }),
      });

      if (!audioResponse.ok) {
        if (audioResponse.status === 429 && attempt < maxRetries - 1) {
          // Rate limit - wait and retry
          await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
          continue;
        }
        const errorData = await audioResponse.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Audio generation failed");
      }

      const audioData = await audioResponse.json();

      // FREE TIER: Wait 15 seconds between API calls (6/minute limit)
      await new Promise(resolve => setTimeout(resolve, 15000));

      const imageResponse = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: imagePrompt }),
      });

      if (!imageResponse.ok) {
        if (imageResponse.status === 429 && attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
          continue;
        }
        const errorData = await imageResponse.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Image generation failed");
      }

      const imageData = await imageResponse.json();

      // FREE TIER: Wait 15 seconds before captioning
      await new Promise(resolve => setTimeout(resolve, 15000));

      // Caption the generated image
      const captionResponse = await fetch("/api/caption-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageUrl: imageData.image_url }),
      });

      if (!captionResponse.ok) {
        if (captionResponse.status === 429 && attempt < maxRetries - 1) {
          await new Promise(resolve => setTimeout(resolve, 2000 * (attempt + 1)));
          continue;
        }
        const errorData = await captionResponse.json().catch(() => ({ error: "Unknown error" }));
        throw new Error(errorData.error || "Caption generation failed");
      }

      const captionData = await captionResponse.json();

      return {
        audioUrl: audioData.audio_url,
        imageUrl: imageData.image_url,
        caption: captionData.caption,
        prompt: audioPrompt,
        round,
      };
    } catch (err) {
      lastError = err as Error;
      if (attempt < maxRetries - 1) {
        console.log(`Attempt ${attempt + 1} failed, retrying...`);
        await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        continue;
      }
    }
  }

  throw lastError || new Error("Generation failed after retries");
}
