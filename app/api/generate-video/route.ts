import { NextResponse } from "next/server";
import { generateVideo } from "@/lib/replicate";

export async function POST(request: Request) {
  try {
    const { imageUrls, captions } = await request.json();

    // Validate input
    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return NextResponse.json(
        { error: "imageUrls is required and must be a non-empty array" },
        { status: 400 }
      );
    }

    if (!captions || !Array.isArray(captions) || captions.length === 0) {
      return NextResponse.json(
        { error: "captions is required and must be a non-empty array" },
        { status: 400 }
      );
    }

    if (imageUrls.length !== captions.length) {
      return NextResponse.json(
        { error: "imageUrls and captions arrays must have the same length" },
        { status: 400 }
      );
    }

    // Validate maximum number of images (cost control)
    if (imageUrls.length > 4) {
      return NextResponse.json(
        { error: "Maximum 4 images allowed for video generation" },
        { status: 400 }
      );
    }

    // Validate each imageUrl is a string and looks like a URL
    for (const imageUrl of imageUrls) {
      if (typeof imageUrl !== "string" || !imageUrl.trim()) {
        return NextResponse.json(
          { error: "All imageUrls must be non-empty strings" },
          { status: 400 }
        );
      }

      // Basic URL validation
      try {
        new URL(imageUrl);
      } catch {
        return NextResponse.json(
          { error: `Invalid URL format: ${imageUrl}` },
          { status: 400 }
        );
      }
    }

    // Validate each caption is a string
    for (const caption of captions) {
      if (typeof caption !== "string" || !caption.trim()) {
        return NextResponse.json(
          { error: "All captions must be non-empty strings" },
          { status: 400 }
        );
      }

      if (caption.length > 500) {
        return NextResponse.json(
          { error: "Each caption must be less than 500 characters" },
          { status: 400 }
        );
      }
    }

    // Validate API token exists
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error("REPLICATE_API_TOKEN is not set");
      return NextResponse.json(
        { error: "API configuration error" },
        { status: 500 }
      );
    }

    // Generate videos using Kling v2.1
    const result = await generateVideo(imageUrls, captions);

    return NextResponse.json({
      videoUrls: result.video_urls,
      count: result.video_urls.length,
    });
  } catch (error) {
    console.error("Video generation error:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("authentication")) {
        return NextResponse.json(
          { error: "Authentication failed. Please check API credentials." },
          { status: 401 }
        );
      }

      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          { error: "Rate limit exceeded. Please try again later." },
          { status: 429 }
        );
      }

      if (error.message.includes("same length")) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
