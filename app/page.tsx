"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious, type CarouselApi } from "@/components/ui/carousel";
import { generateSampleViaAPI, type GenerationResult } from "@/lib/generation-client";
import { getRoundName, getRoundColor } from "@/lib/corruption";
import { HorrorBackground } from "@/components/horror-background";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentRound, setCurrentRound] = useState<number | null>(null);
  const [allRounds, setAllRounds] = useState<GenerationResult[][]>([]);
  const [error, setError] = useState<string | null>(null);
  const [carouselApi, setCarouselApi] = useState<CarouselApi>();
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [isGeneratingVideo, setIsGeneratingVideo] = useState(false);
  const isGeneratingRef = useRef(false); // Prevent double-clicks
  const audioRefs = useRef<Map<number, HTMLAudioElement>>(new Map());
  const pendingAdvanceRef = useRef<number | null>(null);

  // Advance to a specific round and start playing
  const advanceToRound = useCallback((roundIndex: number) => {
    if (carouselApi) {
      carouselApi.scrollTo(roundIndex);
      pendingAdvanceRef.current = null;
    }
  }, [carouselApi]);

  // When a new round completes, queue it for playback
  useEffect(() => {
    if (carouselApi && allRounds.length > 0) {
      const latestRound = allRounds.length - 1;
      const currentRound = carouselApi.selectedScrollSnap();

      // If we're not on the latest round
      if (currentRound < latestRound) {
        // If audio is playing, queue the latest round for when it finishes
        if (isAudioPlaying) {
          pendingAdvanceRef.current = latestRound;
        } else {
          // No audio playing, advance immediately
          advanceToRound(latestRound);
        }
      }
    }
  }, [allRounds.length, carouselApi, isAudioPlaying, advanceToRound]);

  // Track current carousel slide and handle audio playback
  useEffect(() => {
    if (!carouselApi) return;

    const onSelect = () => {
      const newIndex = carouselApi.selectedScrollSnap();
      setCurrentSlideIndex(newIndex);

      // Stop all audio when navigating
      audioRefs.current.forEach((audio) => {
        audio.pause();
        audio.currentTime = 0;
      });

      // Don't auto-play on manual navigation - let user click play
      setIsAudioPlaying(false);
    };

    carouselApi.on("select", onSelect);
    return () => {
      carouselApi.off("select", onSelect);
    };
  }, [carouselApi]);

  // When audio ends, check if there's a pending round or advance to next
  const handleAudioEnded = useCallback((roundIndex: number) => {
    setIsAudioPlaying(false);

    // If there's a pending round (newer round completed while playing), go there
    if (pendingAdvanceRef.current !== null) {
      advanceToRound(pendingAdvanceRef.current);
    }
    // Otherwise, advance to next round if it exists
    else if (carouselApi && roundIndex < allRounds.length - 1) {
      carouselApi.scrollTo(roundIndex + 1);
    }
  }, [carouselApi, allRounds.length, advanceToRound]);

  // Track when audio starts/stops playing
  const handleAudioPlay = () => {
    setIsAudioPlaying(true);
  };

  const handleAudioPause = () => {
    setIsAudioPlaying(false);
  };

  const EXAMPLE_PROMPTS = [
    "cheerful music box melody",
    "haunting lullaby in minor key",
    "bright carnival waltz",
  ];

  const handleGenerate = async () => {
    if (!prompt.trim() || isGeneratingRef.current) return;

    isGeneratingRef.current = true;
    setIsGenerating(true);
    setAllRounds([]);
    setError(null);
    setCurrentRound(0);
    setGeneratedVideoUrl(null);
    setIsGeneratingVideo(false);

    try {
      const rounds: GenerationResult[][] = [];
      let currentPrompt = prompt.trim();

      // Generate 4 rounds of corruption
      for (let round = 0; round < 4; round++) {
        setCurrentRound(round);

        // Generate samples sequentially to avoid rate limits
        // TODO: Change back to 4 for production, using 1 for testing
        const roundSamples: GenerationResult[] = [];
        for (let i = 0; i < 1; i++) {
          try {
            const sample = await generateSampleViaAPI(currentPrompt, round);
            roundSamples.push(sample);

            // Update UI progressively as each sample completes
            const updatedRounds = [...rounds];
            updatedRounds[round] = [...roundSamples];
            setAllRounds(updatedRounds);
          } catch (err) {
            console.error(`Failed to generate sample ${i + 1}:`, err);
            // Continue with other samples even if one fails
          }
        }

        // Only continue if we got at least one sample
        if (roundSamples.length === 0) {
          throw new Error(`Round ${round + 1} failed - no samples generated`);
        }

        rounds.push(roundSamples);
        setAllRounds([...rounds]); // Final update for this round

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
      isGeneratingRef.current = false;
    }
  };

  const handleExampleClick = (example: string) => {
    setPrompt(example);
    setError(null);
  };

  const handleGenerateVideo = async () => {
    if (allRounds.length !== 4 || isGeneratingVideo) return;

    setIsGeneratingVideo(true);
    setError(null);

    try {
      // Collect all image URLs and captions from rounds
      const imageUrls = allRounds.map(roundSamples => roundSamples[0].imageUrl);
      const captions = allRounds.map(roundSamples => roundSamples[0].caption);

      const response = await fetch('/api/generate-video', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ imageUrls, captions }),
      });

      if (!response.ok) {
        throw new Error(`Video generation failed: ${response.statusText}`);
      }

      const data = await response.json();
      // API returns array of video URLs, use the first one
      setGeneratedVideoUrl(data.videoUrls[0]);
    } catch (err) {
      console.error("Video generation failed:", err);
      setError(err instanceof Error ? err.message : "Video generation failed");
    } finally {
      setIsGeneratingVideo(false);
    }
  };

  const handleDownloadVideo = () => {
    if (!generatedVideoUrl) return;

    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const link = document.createElement('a');
    link.href = generatedVideoUrl;
    link.download = `corpse-beats-${timestamp}.mp4`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const progress = currentRound !== null ? ((currentRound + 1) / 4) * 100 : 0;

  // Determine background color based on current/completed round
  const getBackgroundColor = () => {
    const colors = ["bg-pastel-pink", "bg-dusty-rose", "bg-bruised-plum", "bg-blood-red"];

    if (isGenerating && currentRound !== null) {
      // During generation, use current round's color
      return colors[currentRound];
    }
    if (allRounds.length > 0) {
      // After generation, use the current carousel slide's color
      return colors[Math.min(currentSlideIndex, 3)];
    }
    // Default to pastel pink
    return "bg-pastel-pink";
  };

  return (
    <main className={`flex min-h-screen flex-col items-center justify-center p-8 transition-colors duration-1000 ${getBackgroundColor()} relative`}>
      {/* Animated horror background */}
      <HorrorBackground
        round={currentRound !== null ? currentRound : (allRounds.length > 0 ? allRounds.length - 1 : 0)}
        isGenerating={isGenerating}
      />

      {/* Content with higher z-index */}
      <div className="relative z-10 w-full flex flex-col items-center">
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
                Generating sample... this takes ~45-60 seconds per round (free tier limits)
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

      {/* Output Display - Carousel */}
      <div className="w-full max-w-4xl">
        {allRounds.length > 0 ? (
          <>
            <Carousel setApi={setCarouselApi} className="w-full">
              <CarouselContent>
                {allRounds.map((roundSamples, roundIdx) => (
                  <CarouselItem key={roundIdx}>
                    <div className="space-y-4">
                      <div className="flex items-center justify-center gap-3 mb-6">
                        <Badge
                          variant="outline"
                          className={`text-${getRoundColor(roundIdx)}`}
                        >
                          Round {roundIdx + 1} of 4
                        </Badge>
                        <h3 className="text-3xl font-bold">{getRoundName(roundIdx)}</h3>
                      </div>

                      {roundSamples.map((sample, sampleIdx) => (
                        <Card key={sampleIdx} className="border-2">
                          <CardContent className="pt-6 space-y-4">
                            {/* Image */}
                            <div className="relative w-full aspect-square rounded overflow-hidden bg-muted max-w-2xl mx-auto">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img
                                src={sample.imageUrl}
                                alt={`Round ${roundIdx + 1} Sample ${sampleIdx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </div>

                            {/* Audio */}
                            <audio
                              ref={(el) => {
                                if (el) audioRefs.current.set(roundIdx, el);
                              }}
                              controls
                              src={sample.audioUrl}
                              className="w-full h-10"
                              onPlay={handleAudioPlay}
                              onPause={handleAudioPause}
                              onEnded={() => handleAudioEnded(roundIdx)}
                            >
                              Your browser does not support audio.
                            </audio>

                            {/* Caption for next round */}
                            {sampleIdx === 0 && roundIdx < 3 && (
                              <div className="text-center">
                                <p className="text-sm text-muted-foreground">
                                  <span className="font-semibold">Next round prompt:</span> &quot;{sample.caption}&quot;
                                </p>
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious />
              <CarouselNext />
            </Carousel>

            {/* Video Generation Section */}
            {allRounds.length === 4 && !generatedVideoUrl && (
              <div className="mt-8 flex justify-center">
                <Card className="w-full max-w-2xl border-2">
                  <CardContent className="pt-6">
                    <div className="text-center space-y-4">
                      <h3 className="text-xl font-bold">Ready to Create Your Final Video</h3>
                      <p className="text-sm text-muted-foreground">
                        Combine all 4 rounds into a single video showing the complete musical decay
                      </p>
                      <Button
                        onClick={handleGenerateVideo}
                        disabled={isGeneratingVideo}
                        size="lg"
                        className="px-8"
                      >
                        {isGeneratingVideo ? (
                          <>
                            <svg
                              className="animate-spin -ml-1 mr-3 h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              />
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              />
                            </svg>
                            Generating video...
                          </>
                        ) : (
                          'Generate Final Video'
                        )}
                      </Button>
                      {isGeneratingVideo && (
                        <p className="text-xs text-muted-foreground">
                          This may take 2-3 minutes...
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Video Player Section */}
            {generatedVideoUrl && (
              <div className="mt-8">
                <Card className="w-full max-w-2xl mx-auto border-2">
                  <CardHeader>
                    <CardTitle className="text-2xl text-center">Your Corpse Beats Video</CardTitle>
                    <CardDescription className="text-center">
                      Watch the complete descent into madness
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <video
                      controls
                      autoPlay
                      className="w-full rounded-lg"
                      src={generatedVideoUrl}
                    >
                      Your browser does not support video playback.
                    </video>
                    <div className="flex justify-center">
                      <Button
                        onClick={handleDownloadVideo}
                        variant="outline"
                        size="lg"
                        className="px-8"
                      >
                        <svg
                          className="w-5 h-5 mr-2"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                          />
                        </svg>
                        Download Video
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </>
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
      </div>
    </main>
  );
}
