"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAudio, setGeneratedAudio] = useState<{url: string, prompt: string} | null>(null);
  const [generatedImage, setGeneratedImage] = useState<{url: string, prompt: string} | null>(null);
  const [error, setError] = useState<string | null>(null);

  const EXAMPLE_PROMPTS = [
    "cheerful music box melody",
    "haunting lullaby in minor key",
    "bright carnival waltz",
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setGeneratedAudio(null);
    setGeneratedImage(null);
    setError(null);

    try {
      // Call both APIs in parallel for speed
      const [audioResponse, imageResponse] = await Promise.all([
        fetch("/api/generate-audio", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: prompt.trim() }),
        }),
        fetch("/api/generate-image", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ prompt: prompt.trim() }),
        }),
      ]);

      // Check for errors
      if (!audioResponse.ok) {
        const errorData = await audioResponse.json();
        throw new Error(errorData.error || "Failed to generate audio");
      }
      if (!imageResponse.ok) {
        const errorData = await imageResponse.json();
        throw new Error(errorData.error || "Failed to generate image");
      }

      // Parse results
      const [audioData, imageData] = await Promise.all([
        audioResponse.json(),
        imageResponse.json(),
      ]);

      // Update state with both results
      setGeneratedAudio({
        url: audioData.audio_url,
        prompt: prompt.trim(),
      });
      setGeneratedImage({
        url: imageData.image_url,
        prompt: prompt.trim(),
      });
    } catch (err) {
      console.error("Generation failed:", err);
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
    setError(null);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 transition-colors duration-1000">
      {/* Header */}
      <div className="max-w-4xl w-full mb-12 text-center">
        <h1 className="text-7xl font-bold mb-4 text-near-black tracking-tight">
          Corpse Beats
        </h1>
        <p className="text-xl text-near-black/70 mb-2">
          Watch music decay into madness
        </p>
        <p className="text-sm text-near-black/50">
          An exquisite corpse AI music generator
        </p>
      </div>

      {/* Prompt Input Card */}
      <Card className="max-w-2xl w-full mb-8 shadow-lg border-2">
        <CardHeader>
          <CardTitle className="text-2xl">Create Your Sound</CardTitle>
          <CardDescription>
            Describe a musical idea, and watch it transform through 4 rounds of AI interpretation
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <Input
              type="text"
              placeholder="e.g., cheerful music box melody..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleGenerate()}
              className="flex-1 text-base"
              disabled={isGenerating}
            />
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !prompt.trim()}
              size="lg"
              className="px-8"
            >
              {isGenerating ? "Generating..." : "Generate"}
            </Button>
          </div>
          {isGenerating && (
            <p className="text-sm text-muted-foreground mt-4 animate-pulse">
              Generating audio and image... this may take 20-30 seconds
            </p>
          )}
          {!isGenerating && !generatedAudio && (
            <div className="mt-4">
              <p className="text-xs text-muted-foreground mb-2">Try an example:</p>
              <div className="flex flex-wrap gap-2">
                {EXAMPLE_PROMPTS.map((example) => (
                  <button
                    key={example}
                    onClick={() => handleExampleClick(example)}
                    className="text-xs px-3 py-1 rounded-full bg-muted hover:bg-muted/80 transition-colors"
                  >
                    {example}
                  </button>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Error Display */}
      {error && (
        <Card className="max-w-2xl w-full mb-8 border-destructive bg-destructive/10">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <svg
                className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div className="flex-1">
                <p className="font-medium text-destructive">Generation failed</p>
                <p className="text-sm text-destructive/80 mt-1">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-destructive hover:text-destructive/80"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Output Display */}
      <div className="max-w-4xl w-full">
        {generatedAudio && generatedImage ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Audio Output */}
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle>Generated Audio</CardTitle>
                <CardDescription className="text-sm italic">
                  &quot;{generatedAudio.prompt}&quot;
                </CardDescription>
              </CardHeader>
              <CardContent>
                <audio
                  controls
                  src={generatedAudio.url}
                  className="w-full"
                >
                  Your browser does not support the audio element.
                </audio>
              </CardContent>
            </Card>

            {/* Image Output */}
            <Card className="border-2 shadow-lg">
              <CardHeader>
                <CardTitle>Generated Image</CardTitle>
                <CardDescription className="text-sm italic">
                  &quot;{generatedImage.prompt}&quot;
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="relative w-full aspect-square rounded-lg overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={generatedImage.url}
                    alt={generatedImage.prompt}
                    className="w-full h-full object-cover"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <Card className="border-dashed border-2 bg-muted/10">
            <CardContent className="p-12 text-center">
              <div className="flex flex-col items-center gap-4 text-muted-foreground">
                <svg
                  className="w-16 h-16 opacity-50"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3"
                  />
                </svg>
                <p className="text-lg font-medium">No generations yet</p>
                <p className="text-sm">Enter a prompt above to begin the corruption</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-sm text-near-black/40">
        <p>Built for Dumb Things AI Hackathon</p>
      </footer>
    </main>
  );
}
