"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    setIsGenerating(true);
    // Generation logic will be implemented in Story 1.4
    setTimeout(() => {
      setIsGenerating(false);
    }, 2000);
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
              Starting the decay process...
            </p>
          )}
        </CardContent>
      </Card>

      {/* Output Placeholder */}
      <div className="max-w-4xl w-full">
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
      </div>

      {/* Footer */}
      <footer className="mt-12 text-center text-sm text-near-black/40">
        <p>Built for Dumb Things AI Hackathon</p>
      </footer>
    </main>
  );
}
