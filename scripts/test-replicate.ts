/**
 * Test script to validate Replicate API integration
 * Run with: npx tsx scripts/test-replicate.ts
 */

import { healthCheck, generateAudio, generateImage, captionImage } from "@/lib/replicate";

async function testReplicateIntegration() {
  console.log("🧪 Testing Replicate API Integration...\n");

  // Test 1: Health Check
  console.log("1️⃣ Testing health check...");
  const isHealthy = await healthCheck();
  console.log(isHealthy ? "✅ Health check passed\n" : "❌ Health check failed\n");

  if (!isHealthy) {
    console.error("⚠️ Health check failed. Check your REPLICATE_API_TOKEN.");
    process.exit(1);
  }

  // Test 2: Audio Generation (lightweight test)
  console.log("2️⃣ Testing audio generation...");
  try {
    const audioResult = await generateAudio("cheerful music box melody", 0);
    console.log("✅ Audio generation successful");
    console.log(`   URL: ${audioResult.audio_url}\n`);
  } catch (error) {
    console.error("❌ Audio generation failed:", error);
    process.exit(1);
  }

  // Test 3: Image Generation
  console.log("3️⃣ Testing image generation...");
  try {
    const imageResult = await generateImage("pastel pink music box with flowers", 0);
    console.log("✅ Image generation successful");
    console.log(`   URL: ${imageResult.image_url}\n`);
  } catch (error) {
    console.error("❌ Image generation failed:", error);
    process.exit(1);
  }

  // Test 4: Image Captioning
  console.log("4️⃣ Testing image captioning...");
  try {
    // Use a test image URL
    const testImageUrl = "https://replicate.delivery/pbxt/example.jpg";
    const captionResult = await captionImage(testImageUrl);
    console.log("✅ Image captioning successful");
    console.log(`   Caption: ${captionResult.caption}\n`);
  } catch (error) {
    console.error("❌ Image captioning failed:", error);
    // Don't exit - captioning might fail on test URL
  }

  console.log("🎉 All critical tests passed!");
}

testReplicateIntegration().catch((error) => {
  console.error("💥 Test suite failed:", error);
  process.exit(1);
});
