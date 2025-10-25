import { NextResponse } from "next/server";
import { generateAudio } from "@/lib/replicate";

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json();

    // Validate input
    if (!prompt || typeof prompt !== "string" || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Prompt is required and must be a non-empty string" },
        { status: 400 }
      );
    }

    if (prompt.length > 500) {
      return NextResponse.json(
        { error: "Prompt must be less than 500 characters" },
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

    // Generate audio using Lyria-2
    const result = await generateAudio(prompt, 0);

    return NextResponse.json({
      audio_url: result.audio_url,
    });
  } catch (error) {
    console.error("Audio generation error:", error);

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
