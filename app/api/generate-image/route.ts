import { NextResponse } from "next/server";
import { generateImage } from "@/lib/replicate";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { prompt } = body;

    // Validate prompt
    if (!prompt || typeof prompt !== "string") {
      return NextResponse.json(
        { error: "Invalid prompt: must be a non-empty string" },
        { status: 400 }
      );
    }

    if (prompt.trim().length === 0) {
      return NextResponse.json(
        { error: "Invalid prompt: cannot be empty" },
        { status: 400 }
      );
    }

    // Generate image with corruption_level = 0 (single generation POC)
    const result = await generateImage(prompt, 0);

    return NextResponse.json({ image_url: result.image_url });
  } catch (error) {
    console.error("Image generation error:", error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes("authentication")) {
        return NextResponse.json(
          { error: "Authentication failed: Invalid Replicate API token" },
          { status: 401 }
        );
      }

      if (error.message.includes("rate limit")) {
        return NextResponse.json(
          { error: "Rate limit exceeded: Please try again later" },
          { status: 429 }
        );
      }
    }

    // Generic error response
    return NextResponse.json(
      { error: "Failed to generate image. Please try again." },
      { status: 500 }
    );
  }
}
