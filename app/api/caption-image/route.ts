import { NextResponse } from "next/server";
import { captionImage } from "@/lib/replicate";

export async function POST(request: Request) {
  try {
    const { imageUrl } = await request.json();

    // Validate input
    if (!imageUrl || typeof imageUrl !== "string" || imageUrl.trim().length === 0) {
      return NextResponse.json(
        { error: "Image URL is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    // Basic URL validation
    try {
      new URL(imageUrl);
    } catch {
      return NextResponse.json(
        { error: "Invalid image URL format" },
        { status: 400 }
      );
    }

    // Validate API token exists
    if (!process.env.REPLICATE_API_TOKEN) {
      console.error("REPLICATE_API_TOKEN is not set");
      return NextResponse.json(
        { error: "API configuration error" },
        { status: 500 }
      );
    }

    // Generate caption using BLIP
    const result = await captionImage(imageUrl);

    return NextResponse.json({
      caption: result.caption,
    });
  } catch (error) {
    console.error("Image captioning error:", error);

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
