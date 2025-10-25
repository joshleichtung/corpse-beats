import { NextResponse } from "next/server";
import Replicate from "replicate";

export async function GET() {
  try {
    if (!process.env.REPLICATE_API_TOKEN) {
      return NextResponse.json(
        { error: "REPLICATE_API_TOKEN is not set" },
        { status: 500 }
      );
    }

    const replicate = new Replicate({
      auth: process.env.REPLICATE_API_TOKEN,
    });

    // Make a lightweight request to check rate limits
    // We'll list models which is a simple GET request
    const models = await replicate.models.list();

    // Get the first model to check response
    const firstModel = models.results[0];

    return NextResponse.json({
      success: true,
      message: "API connection successful",
      modelExample: firstModel?.name || "No models found",
      note: "If you see this without errors, your API token is working. Rate limits are typically shown in response headers when you hit them.",
    });
  } catch (error) {
    console.error("Rate limit check error:", error);

    if (error instanceof Error) {
      // Check if the error message contains rate limit info
      if (error.message.includes("rate limit")) {
        return NextResponse.json({
          rateLimitStatus: "FREE_TIER",
          message: error.message,
          recommendation: "You're still on the free tier. Payment method may not be fully processed yet.",
        }, { status: 429 });
      }

      return NextResponse.json({
        error: error.message,
        fullError: JSON.stringify(error, null, 2),
      }, { status: 500 });
    }

    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
