"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { generateSampleViaAPI, type GenerationResult } from "@/lib/generation-chain";
import { getRoundName, getRoundColor } from "@/lib/corruption";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentRound, setCurrentRound] = useState<number | null>(null);
  const [allRounds, setAllRounds] = useState<GenerationResult[][]>([]);
  const [error, setError] = useState<string | null>(null);

  const EXAMPLE_PROMPTS = [
    "cheerful music box melody",
    "haunting lullaby in minor key",
    "bright carnival waltz",
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    setAllRounds([]);
    setError(null);
    setCurrentRound(0);

    try {
      const rounds: GenerationResult[][] = [];
      let currentPrompt = prompt.trim();

      // Generate 4 rounds of corruption
      for (let round = 0; round < 4; round++) {
        setCurrentRound(round);

        // Generate 4 samples for this round in parallel
        const roundSamples = await Promise.all([
          generateSampleViaAPI(currentPrompt, round),
          generateSampleViaAPI(currentPrompt, round),
          generateSampleViaAPI(currentPrompt, round),
          generateSampleViaAPI(currentPrompt, round),
        ]);

        rounds.push(roundSamples);
        setAllRounds([...rounds]); // Update UI progressively

        // Use first sample's caption for next round (exquisite corpse)
        if (round < 3 && roundSamples[0]) {
          currentPrompt = roundSamples[0].caption;
        }
      }

      setCurrentRound(null); // Generation complete
    } catch (err) {
      console.error("Generation failed:", err);
      setError(err instanceof Error ? err.message : "Generation failed");
      setCurrentRound(null);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
    setError(null);
  };

  const progress = currentRound !== null ? ((currentRound + 1) / 4) * 100 : 0;

  // Determine background color based on current/completed round
  const getBackgroundColor = () => {
    if (isGenerating && currentRound !== null) {
      // During generation, use current round's color
      const colors = ["bg-pastel-pink", "bg-dusty-rose", "bg-bruised-plum", "bg-blood-red"];
      return colors[currentRound];
    }
    if (allRounds.length > 0) {
      // After generation, use the last completed round's color
      const colors = ["bg-pastel-pink", "bg-dusty-rose", "bg-bruised-plum", "bg-blood-red"];
      return colors[Math.min(allRounds.length - 1, 3)];
    }
    // Default to pastel pink
    return "bg-pastel-pink";
  };

  return (
    <main className={`flex min-h-screen flex-col items-center justify-center p-8 transition-colors duration-1000 ${getBackgroundColor()}`}>
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
          {isGenerating && currentRound !== null && (
            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">
                  Round {currentRound + 1} of 4: {getRoundName(currentRound)}
                </span>
                <span className="text-muted-foreground">
                  {Math.round(progress)}%
                </span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground">
                Generating 4 samples... this takes ~30 seconds per round
              </p>
            </div>
          )}
          {!isGenerating && allRounds.length === 0 && (
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

      {/* Output Display - 4 Round Grid */}
      <div className="w-full max-w-7xl">
        {allRounds.length > 0 ? (
          <div className="space-y-8">
            {allRounds.map((roundSamples, roundIdx) => (
              <div key={roundIdx}>
                <div className="flex items-center gap-3 mb-4">
                  <Badge
                    variant="outline"
                    className={`text-${getRoundColor(roundIdx)}`}
                  >
                    Round {roundIdx + 1}
                  </Badge>
                  <h3 className="text-2xl font-bold">{getRoundName(roundIdx)}</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {roundSamples.map((sample, sampleIdx) => (
                    <Card key={sampleIdx} className="border-2">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-sm">Sample {sampleIdx + 1}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        {/* Image */}
                        <div className="relative w-full aspect-square rounded overflow-hidden bg-muted">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={sample.imageUrl}
                            alt={`Round ${roundIdx + 1} Sample ${sampleIdx + 1}`}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Audio */}
                        <audio
                          controls
                          src={sample.audioUrl}
                          className="w-full h-8"
                        >
                          Your browser does not support audio.
                        </audio>

                        {/* Caption for next round */}
                        {sampleIdx === 0 && roundIdx < 3 && (
                          <p className="text-xs text-muted-foreground italic">
                            Next: &quot;{sample.caption.slice(0, 50)}...&quot;
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
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
                <p className="text-sm">Enter a prompt above to watch it decay through 4 rounds</p>
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
