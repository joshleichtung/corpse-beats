import Replicate from "replicate";

// Initialize Replicate client
const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

// TypeScript types for API responses
export interface AudioGenerationOutput {
  audio_url: string;
  duration?: number;
}

export interface ImageGenerationOutput {
  image_url: string;
}

export interface ImageCaptionOutput {
  caption: string;
}

export interface VideoGenerationOutput {
  video_urls: string[];
}

export interface GenerationMetadata {
  model: string;
  version?: string;
  input: Record<string, unknown>;
  timestamp: number;
}

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  initialDelayMs: 1000,
  maxDelayMs: 10000,
  backoffMultiplier: 2,
};

/**
 * Exponential backoff delay calculation
 */
function calculateBackoffDelay(attempt: number): number {
  const delay = Math.min(
    RETRY_CONFIG.initialDelayMs * Math.pow(RETRY_CONFIG.backoffMultiplier, attempt),
    RETRY_CONFIG.maxDelayMs
  );
  // Add jitter to prevent thundering herd
  return delay + Math.random() * 1000;
}

/**
 * Sleep utility for retry delays
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Generic retry wrapper with exponential backoff
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  context: string
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt < RETRY_CONFIG.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Don't retry on authentication errors
      if (error instanceof Error && error.message.includes("authentication")) {
        throw error;
      }

      if (attempt < RETRY_CONFIG.maxRetries - 1) {
        const delay = calculateBackoffDelay(attempt);
        console.warn(
          `${context} failed (attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries}). ` +
          `Retrying in ${Math.round(delay)}ms...`,
          error
        );
        await sleep(delay);
      }
    }
  }

  throw new Error(
    `${context} failed after ${RETRY_CONFIG.maxRetries} attempts. ` +
    `Last error: ${lastError?.message}`
  );
}

/**
 * Generate audio from text prompt using MusicGen
 */
export async function generateAudio(
  prompt: string,
  corruptionLevel: number = 0
): Promise<AudioGenerationOutput> {
  return withRetry(async () => {
    const output = await replicate.run(
      "meta/musicgen:b05b1dff1d8c6dc63d14b0cdb42135378dcb87f6373b0d3d341ede46e59e2b38",
      {
        input: {
          prompt,
          duration: 8,
          model_version: "stereo-melody-large",
          output_format: "mp3",
        },
      }
    ) as unknown as string;

    // MusicGen returns audio URL directly as string
    return {
      audio_url: output,
    };
  }, `Audio generation for prompt: "${prompt}"`);
}

/**
 * Generate image from audio-inspired prompt using Flux Schnell
 */
export async function generateImage(
  prompt: string,
  corruptionLevel: number = 0
): Promise<ImageGenerationOutput> {
  return withRetry(async () => {
    const output = await replicate.run(
      "black-forest-labs/flux-schnell:c846a69991daf4c0e5d016514849d14ee5b2e6846ce6b9d6f21369e564cfe51e",
      {
        input: {
          prompt,
          num_inference_steps: corruptionLevel < 0.5 ? 1 : 4, // Faster for early rounds
          aspect_ratio: "1:1", // Square for grid display
        },
      }
    ) as string[];

    // Flux returns array of image URLs
    return {
      image_url: output[0],
    };
  }, `Image generation for prompt: "${prompt}"`);
}

/**
 * Generate caption from image using BLIP
 */
export async function captionImage(imageUrl: string): Promise<ImageCaptionOutput> {
  return withRetry(async () => {
    const output = await replicate.run(
      "salesforce/blip:2e1dddc8621f72155f24cf2e0adbde548458d3cab9f00c0139eea840d0ac4746",
      {
        input: {
          image: imageUrl,
          task: "image_captioning",
        },
      }
    ) as unknown as string;

    return {
      caption: output,
    };
  }, `Image captioning for: ${imageUrl}`);
}

/**
 * Generate a single video from the final horror image using Kling v2.1
 * Uses the last (most corrupted) image to create the final video
 */
export async function generateVideo(
  imageUrls: string[],
  captions: string[]
): Promise<VideoGenerationOutput> {
  if (imageUrls.length !== captions.length) {
    throw new Error("imageUrls and captions arrays must have the same length");
  }

  if (imageUrls.length === 0) {
    throw new Error("At least one image is required for video generation");
  }

  // Use the LAST image (maximum horror) for video generation
  const finalImageUrl = imageUrls[imageUrls.length - 1];
  const finalCaption = captions[captions.length - 1];

  // Craft prompt emphasizing the horror transformation
  const prompt = `${finalCaption}. Nightmarish horror transformation with subtle unsettling movement. Dark atmospheric cinematography with eerie depth and ominous mood.`;

  const videoUrl = await withRetry(async () => {
    const output = await replicate.run(
      "kwaivgi/kling-v2.1:8f1d07f812d87339d7866c94ba2149e8ee456472e5c5ec04ac22795e21b55c68",
      {
        input: {
          prompt,
          start_image: finalImageUrl,
          mode: "standard", // 720p for cost efficiency
          duration: 5, // 5 seconds
        },
      }
    ) as unknown as string;

    return output;
  }, `Video generation from final horror image: "${finalCaption}"`);

  return {
    video_urls: [videoUrl], // Single video in array for consistency
  };
}

/**
 * Health check: verify Replicate API connection
 */
export async function healthCheck(): Promise<boolean> {
  try {
    // Simple test: list available models (lightweight operation)
    const models = await replicate.models.list();
    return models !== null;
  } catch (error) {
    console.error("Replicate health check failed:", error);
    return false;
  }
}

export { replicate };
