# Corpse Beats Architecture Document

**Version:** 1.0
**Date:** 2025-10-25
**Status:** Ready for Implementation

---

## Executive Summary

Corpse Beats is a client-side web application that generates pastel-to-horror audio/visual corruption through multi-modal AI orchestration. The architecture prioritizes **hackathon velocity** (6-hour development window), **single-platform integration** (all models via Replicate MCP), and **demo impact** (Suspiria/Neon Demon/Earthbound aesthetic).

**Core Flow:**
1. User prompt → Round 1 generation (pastel audio + images)
2. Images → BLIP captions → Round 2 prompts (with corruption parameters)
3. Repeat for Rounds 3-4 (progressive horror corruption)
4. Auto-compose beat from all samples
5. Export music video with MediaRecorder API

**Key Architectural Decisions:**
- ✅ Next.js 14 static export (no backend)
- ✅ All AI via Replicate MCP (single integration point)
- ✅ MediaRecorder API for video (native, fast, simple)
- ✅ 4 samples/round (16 total) for speed optimization
- ✅ TypeScript strict mode + quality gates

---

## Table of Contents

1. [Model Selection](#model-selection)
2. [Corruption Parameter System](#corruption-parameter-system)
3. [System Architecture](#system-architecture)
4. [Component Selection](#component-selection)
5. [Data Flow](#data-flow)
6. [Performance Optimization](#performance-optimization)
7. [Implementation Guidance](#implementation-guidance)
8. [Risk Mitigation](#risk-mitigation)

---

## Model Selection

### Audio Generation

**PRIMARY: `google/lyria-2`**

**Rationale:**
- ✅ **Recency**: Updated 1 month ago (October 2025) - current AI capabilities
- ✅ **Quality**: 48kHz stereo output (vs 32kHz for musicgen)
- ✅ **Proven**: 34.8K runs (sufficient battle-testing for hackathon)
- ✅ **Source**: Google DeepMind (highly credible)
- ✅ **Features**: Text-to-music with BPM/key control

**API Usage:**
```typescript
const output = await replicate.run("google/lyria-2", {
  input: {
    prompt: corruptedPrompt,
    duration: 10, // 10-second samples
    // BPM/key params to be determined from API docs
  }
});
```

**BACKUP: `meta/musicgen`**
- 3M runs (extremely battle-tested)
- Fallback if Lyria-2 has issues
- Last updated March 2024 (older but proven)

**STRETCH: `sakemin/musicgen-remixer`**
- Optional Round 4 enhancement
- Remix existing samples into different styles
- Preserves structure while changing genre/mood
- Use case: Create "maximum corruption" versions by remixing Round 1-3 samples with Round 4 horror prompts

---

### Image Generation

**PRIMARY: `black-forest-labs/flux-schnell`**

**Rationale:**
- ✅ **Speed**: 1-4 steps (vs 20-50 for flux-dev) = **3x faster**
- ✅ **Resources**: 40% fewer compute resources than flux-dev
- ✅ **Pipeline fit**: Generating 16 images in 5-minute window requires speed
- ✅ **Quality**: Sufficient for pastel horror aesthetic demos
- ✅ **Cost**: $0.003 per image (extremely cheap)

**API Usage:**
```typescript
const output = await replicate.run("black-forest-labs/flux-schnell", {
  input: {
    prompt: corruptedImagePrompt,
    num_outputs: 1,
    aspect_ratio: "1:1",
    output_format: "webp",
    output_quality: 80,
    num_inference_steps: 4,
    guidance_scale: 7.5,
  }
});
```

**Why not flux-dev?**
- Too slow (20-50 steps) for 16-image pipeline
- Quality improvement not critical for demos

**Why not flux-pro/flux-1.1-pro?**
- Higher cost without significant speed gains
- Overkill for hackathon throwaway project

---

### Image-to-Text (Captioning)

**PRIMARY: `salesforce/blip`**

**Rationale:**
- ✅ **Proven**: 168.4M runs (extremely battle-tested)
- ✅ **Speed**: ~1 second per image
- ✅ **Cost**: $0.00022 per run ($0.0035 for 16 images total)
- ✅ **Simplicity**: Lighter than BLIP-2/LLaVA (perfect for mood/color descriptions)
- ✅ **Single platform**: Everything through Replicate MCP

**API Usage:**
```typescript
const caption = await replicate.run("salesforce/blip", {
  input: {
    image: imageUrl,
    task: "image_captioning",
    question: "Describe the mood, colors, and atmosphere of this image in vivid sensory detail",
  }
});
```

**Why not LLaVA-13b?**
- Overkill for simple mood/color descriptions
- Slower (more complex reasoning we don't need)

**Why not BLIP-2?**
- Heavier computational requirements
- Better quality not needed for prompt generation

---

## Corruption Parameter System

Progressive degradation from pastel innocence to horror nightmare across 4 rounds.

### Round 1: Innocent Baseline

**Audio Parameters (Lyria-2):**
```typescript
{
  prompt: `${userPrompt}, soft pastel tones, gentle dreamy atmosphere, lo-fi chill beats, warm comfortable vibes, relaxing ambient sounds`,
  duration: 10,
  // BPM: 80-100 (slower, relaxed tempo)
  // Key: C major (bright, happy key)
}
```

**Image Parameters (Flux Schnell):**
```typescript
{
  prompt: `${blipDescription}, pastel color palette, bubblegum pink and baby blue tones, soft mint cream accents, warm white highlights, dreamy soft focus, gentle lighting, kawaii aesthetic, Earthbound RPG style, playful and innocent`,
  num_inference_steps: 4,
  guidance_scale: 7.5,
}
```

**Visual Mood**: Sailor Moon meets Studio Ghibli - soft, comforting, inviting

---

### Round 2: Uneasy Shift

**Audio Parameters:**
```typescript
{
  prompt: `${blipDescription}, slightly off-kilter rhythm, dusty muted tones, subtle dissonance, uneasy atmosphere, faded nostalgia, slightly detuned instruments, lo-fi with tension`,
  duration: 10,
  // BPM: 70-90 (slightly slower, dragging feeling)
  // Key: A minor (shift to minor key)
}
```

**Image Parameters:**
```typescript
{
  prompt: `${blipDescription}, muted dusty pastel palette, faded rose and wilted sage tones, aged paper texture, subtle grain and noise, slightly desaturated colors, dim lighting with soft shadows, vaporwave meets decay, something feels slightly wrong`,
  num_inference_steps: 4,
  guidance_scale: 7.5,
}
```

**Visual Mood**: Faded photographs - nostalgic but unsettling, like finding old toys in an abandoned house

---

### Round 3: Ominous Darkness

**Audio Parameters:**
```typescript
{
  prompt: `${blipDescription}, dark brooding atmosphere, deep bass, ominous drones, dissonant chords, industrial undertones, eerie soundscapes, slow menacing rhythm, tension building, horror ambience`,
  duration: 10,
  // BPM: 60-80 (slower, heavier)
  // Key: E minor or F# minor (darker minor keys)
}
```

**Image Parameters:**
```typescript
{
  prompt: `${blipDescription}, deep dark pastel palette, bruised plum and murky olive tones, ash gray shadows, heavy contrast, dramatic lighting, Suspiria-style saturated colors with ominous mood, eerie neon accents, unsettling composition, liminal space aesthetic`,
  num_inference_steps: 4,
  guidance_scale: 8.0, // Slightly higher for dramatic results
}
```

**Visual Mood**: Suspiria lighting meets The Neon Demon - beautiful but deeply wrong, neon-lit nightmares

---

### Round 4: Full Horror

**Audio Parameters:**
```typescript
{
  prompt: `${blipDescription}, nightmare horror soundscape, screaming dissonance, chaotic glitchy percussion, distorted bass, atonal terror, industrial noise, maximum tension, psychological horror atmosphere, corrupted digital artifacts`,
  duration: 10,
  // BPM: 40-60 (dread) or 120-140 (chaotic)
  // Key: Chromatic/Atonal (no traditional key)
}
```

**Image Parameters:**
```typescript
{
  prompt: `${blipDescription}, nightmare horror palette, dried blood red and rotten eggplant tones, bile green highlights, near-black shadows, maximum saturation, harsh dramatic lighting, glitch art corruption, psychological horror imagery, Junji Ito meets vaporwave, visceral disturbing composition, digital decay aesthetic`,
  num_inference_steps: 4,
  guidance_scale: 8.5, // Maximum dramatic effect
}
```

**Visual Mood**: Peak horror - Junji Ito manga meets glitched-out vaporwave, maximum visual violence while maintaining pastel DNA

---

### BLIP Integration Flow

**Exquisite Corpse Chaining:**

```
User Prompt: "lo-fi study beats"
    ↓
Round 1 Generation
    → Audio: Soft pastel lo-fi
    → Images: Pink/blue dreamy clouds
    ↓
BLIP Captions: "soft pink clouds with gentle blue highlights, dreamy atmosphere"
    ↓
Round 2 Generation (BLIP + Round 2 params)
    → Audio: "soft pink clouds... dusty faded tones, uneasy nostalgia"
    → Images: Wilted rose, shadowy corners
    ↓
BLIP Captions: "wilted rose tones, shadowy corners, aged textures"
    ↓
Round 3 Generation (BLIP + Round 3 params)
    → Audio: "wilted rose... bruised plum darkness, ominous lighting"
    → Images: Deep purple shadows, murky green
    ↓
BLIP Captions: "deep purple shadows, murky green undertones, foreboding"
    ↓
Round 4 Generation (BLIP + Round 4 params)
    → Audio: "deep purple shadows... nightmare blood red, glitch corruption"
    → Images: Maximum horror saturation
```

---

### Sample Count Optimization

**Recommended: 4 samples per round** (not 8)

**Breakdown:**
- 4 rounds × 4 samples × 2 models (audio + image) = **32 API calls total**
- vs 8 samples: 4 rounds × 8 samples × 2 models = 64 API calls (slower)

**Time savings**: ~50% faster pipeline completion

**Sample Types per Round:**
1. **Kick** - Percussion foundation
2. **Snare/Hi-hat** - Rhythmic accents
3. **Bass** - Low-end harmony
4. **Melody/Pad** - Harmonic texture

**Rationale:**
- 4 samples provides sufficient variation for demos
- Meets NFR1 (5-minute pipeline target)
- Can increase to 6-8 if generation faster than expected

---

## System Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Browser (Client)                      │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌─────────────┐   ┌──────────────┐   ┌─────────────────┐  │
│  │   Next.js   │   │  shadcn/ui   │   │   Tone.js       │  │
│  │  React App  │◄─►│  Components  │◄─►│  Audio Engine   │  │
│  └──────┬──────┘   └──────────────┘   └────────┬────────┘  │
│         │                                       │            │
│         ▼                                       ▼            │
│  ┌─────────────────────────────────────────────────────┐   │
│  │          Replicate MCP Server Integration           │   │
│  │  (google/lyria-2, flux-schnell, salesforce/blip)   │   │
│  └─────────────────────┬───────────────────────────────┘   │
│                        │                                     │
│                        ▼                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │    MediaRecorder API + Canvas (Video Export)        │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                               │
└───────────────────────────┬───────────────────────────────┘
                            │
                            ▼
                   ┌────────────────┐
                   │  Replicate API  │
                   │  (Cloud Models) │
                   └────────────────┘
```

### Technology Stack

**Frontend Framework:**
- Next.js 14+ (App Router, Static Export)
- React 18+
- TypeScript 5+ (strict mode)

**UI Components:**
- shadcn/ui (Radix UI + Tailwind CSS)
- Framer Motion (animations)

**Audio:**
- Tone.js (synthesis, sequencing, playback)
- Tonal (music theory utilities)
- Web Audio API (via Tone.js)

**Visuals:**
- Canvas API (waveform rendering, video composition)
- P5.js (optional generative art)

**Video:**
- MediaRecorder API (native browser encoding)
- Canvas Stream API (visual composition)

**AI/Inference:**
- Replicate MCP Server (@modelcontextprotocol/server-replicate)
- Replicate JavaScript SDK

**Development Tools:**
- ESLint + Prettier (code quality)
- Husky (pre-commit hooks)
- Playwright (E2E testing)

**Deployment:**
- Vercel or Netlify (static hosting)
- GitHub Actions (CI/CD)

---

### Directory Structure

```
corpse-beats/
├── .env.local                 # REPLICATE_API_TOKEN
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.js
├── tailwind.config.ts
├── components.json            # shadcn/ui config
│
├── docs/
│   ├── prd.md
│   └── architecture.md        # This file
│
├── src/
│   ├── app/
│   │   ├── layout.tsx         # Root layout with pastel horror theming
│   │   ├── page.tsx           # Landing page (prompt input)
│   │   └── globals.css        # Tailwind + custom styles
│   │
│   ├── components/
│   │   ├── ui/                # shadcn/ui components
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── card.tsx
│   │   │   ├── progress.tsx
│   │   │   ├── slider.tsx
│   │   │   └── skeleton.tsx
│   │   │
│   │   ├── generation-grid.tsx    # 4-column round display
│   │   ├── sample-card.tsx        # Individual audio/image sample
│   │   ├── audio-player.tsx       # Playback controls + timeline
│   │   ├── waveform-viz.tsx       # Canvas-based waveform
│   │   └── video-export.tsx       # MediaRecorder integration
│   │
│   ├── lib/
│   │   ├── replicate.ts       # Replicate MCP client setup
│   │   ├── corruption.ts      # Corruption parameter logic
│   │   ├── audio-engine.ts    # Tone.js beat composition
│   │   ├── video-recorder.ts  # MediaRecorder wrapper
│   │   └── utils.ts           # General utilities
│   │
│   ├── types/
│   │   ├── generation.ts      # Sample, Round, GenerationState types
│   │   └── models.ts          # Replicate model response types
│   │
│   └── hooks/
│       ├── use-generation.ts  # Generation pipeline state
│       ├── use-audio.ts       # Tone.js audio playback
│       └── use-video-export.ts # MediaRecorder video export
│
├── public/
│   └── examples/              # Example prompts, images
│
└── tests/
    └── e2e/
        └── generation.spec.ts # Playwright E2E tests
```

---

## Component Selection

### shadcn/ui Components

**Core Components:**
- **Button** - Generate, Play/Pause, Export actions
- **Input** - Text prompt field
- **Card** - Sample containers, round grouping
- **Progress** - Generation/encoding progress bars
- **Slider** - Timeline scrubber, volume control
- **Skeleton** - Loading states during generation
- **Badge** - Round numbers, metadata tags

**Custom Components Built on shadcn/ui:**

1. **Generation Grid** (`generation-grid.tsx`)
   - 4-column responsive layout (desktop)
   - 2x2 grid (tablet)
   - Vertical scroll (mobile - though not primary target)
   - Uses `Card` component for each round

2. **Sample Card** (`sample-card.tsx`)
   - Displays audio waveform (Canvas)
   - Shows generated image
   - Metadata: round number, prompts, generation params
   - Hover preview (2-3 second audio clip)
   - Uses `Card`, `Badge` components

3. **Audio Player** (`audio-player.tsx`)
   - Playback controls (Play/Pause/Stop buttons)
   - Timeline with scrubber (`Slider`)
   - Current time / total duration
   - Volume control
   - Waveform visualization sync
   - Reference: shadcn/ui Music App example

4. **Waveform Visualization** (`waveform-viz.tsx`)
   - Canvas-based rendering
   - Real-time frequency analysis (Web Audio API)
   - Round-color-coded styling (pastel → horror)

5. **Video Export** (`video-export.tsx`)
   - Export button with loading state
   - Encoding progress (`Progress`)
   - Video preview (HTML5 `<video>`)
   - Download link

---

### Theme Configuration

**Tailwind CSS Custom Colors (pastel → horror):**

```typescript
// tailwind.config.ts
export default {
  theme: {
    extend: {
      colors: {
        // Round 1: Innocent
        'pastel-pink': '#FFB3D9',
        'pastel-blue': '#B3E5FC',
        'pastel-mint': '#B5EAD7',
        'pastel-cream': '#FFF8E7',

        // Round 2: Uneasy
        'dusty-rose': '#D4A5A5',
        'wilted-sage': '#A8B8A4',
        'aged-paper': '#F0E6D2',

        // Round 3: Ominous
        'bruised-plum': '#8B5E83',
        'murky-olive': '#6B7A5A',
        'ash-gray': '#C8C8C8',

        // Round 4: Horror
        'blood-red': '#8B0000',
        'rotten-eggplant': '#4A154B',
        'bile-green': '#4A5D23',
        'near-black': '#2C2C2C',
      },
    },
  },
  plugins: [],
};
```

**Dynamic Theme Switching:**
```typescript
// Apply round-specific colors to UI elements
const roundThemes = {
  1: { bg: 'bg-pastel-pink', text: 'text-near-black', border: 'border-pastel-blue' },
  2: { bg: 'bg-dusty-rose', text: 'text-near-black', border: 'border-wilted-sage' },
  3: { bg: 'bg-bruised-plum', text: 'text-pastel-cream', border: 'border-murky-olive' },
  4: { bg: 'bg-blood-red', text: 'text-pastel-cream', border: 'border-bile-green' },
};
```

---

## Data Flow

### State Management

**Use React Context + Hooks** (no Redux/Zustand needed for hackathon scope)

**Generation State:**
```typescript
interface GenerationState {
  status: 'idle' | 'generating' | 'complete' | 'error';
  currentRound: 1 | 2 | 3 | 4 | null;
  rounds: Round[];
  userPrompt: string;
  beatComposed: boolean;
  videoExported: boolean;
}

interface Round {
  roundNumber: 1 | 2 | 3 | 4;
  samples: Sample[];
  blipCaptions: string[];
  status: 'pending' | 'generating' | 'complete';
}

interface Sample {
  id: string;
  type: 'kick' | 'snare' | 'bass' | 'melody';
  audioUrl: string;
  imageUrl: string;
  prompt: string;
  blipCaption?: string;
  roundNumber: 1 | 2 | 3 | 4;
}
```

---

### Generation Pipeline Flow

```typescript
async function executeGenerationPipeline(userPrompt: string) {
  // Round 1: User prompt → Audio + Images
  const round1Samples = await generateRound(1, userPrompt);

  // Round 1 → BLIP captions
  const round1Captions = await Promise.all(
    round1Samples.map(sample => generateBLIPCaption(sample.imageUrl))
  );

  // Round 2: BLIP captions + Round 2 params → Audio + Images
  const round2Prompt = buildCorruptedPrompt(round1Captions, 2);
  const round2Samples = await generateRound(2, round2Prompt);

  // Repeat for Rounds 3 & 4...

  // Auto-compose beat from all samples
  const beat = await composeBeat(allSamples);

  return { rounds: [round1, round2, round3, round4], beat };
}

async function generateRound(roundNumber: number, basePrompt: string) {
  const sampleTypes = ['kick', 'snare', 'bass', 'melody'];

  const samples = await Promise.all(
    sampleTypes.map(async (type) => {
      // Generate audio
      const audioPrompt = buildAudioPrompt(basePrompt, roundNumber, type);
      const audioUrl = await generateAudio(audioPrompt);

      // Generate image
      const imagePrompt = buildImagePrompt(basePrompt, roundNumber, type);
      const imageUrl = await generateImage(imagePrompt);

      return { type, audioUrl, imageUrl, prompt: audioPrompt };
    })
  );

  return samples;
}
```

---

### API Integration Pattern

```typescript
// lib/replicate.ts
import Replicate from 'replicate';

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN,
});

export async function generateAudio(prompt: string, duration: number = 10) {
  try {
    const output = await replicate.run("google/lyria-2", {
      input: { prompt, duration }
    });
    return output; // URL to audio file
  } catch (error) {
    // Retry logic with exponential backoff (NFR2)
    return retryWithBackoff(() => replicate.run(...), 3);
  }
}

export async function generateImage(prompt: string) {
  const output = await replicate.run("black-forest-labs/flux-schnell", {
    input: {
      prompt,
      num_outputs: 1,
      num_inference_steps: 4,
      guidance_scale: 7.5,
      output_format: "webp",
    }
  });
  return output[0]; // URL to image file
}

export async function generateBLIPCaption(imageUrl: string) {
  const output = await replicate.run("salesforce/blip", {
    input: {
      image: imageUrl,
      task: "image_captioning",
      question: "Describe the mood, colors, and atmosphere of this image in vivid sensory detail",
    }
  });
  return output; // Caption string
}

// Exponential backoff retry
async function retryWithBackoff(fn: Function, maxRetries: number) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await fn();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 2 ** i * 1000));
    }
  }
}
```

---

## Performance Optimization

### API Call Strategy

**Parallel Generation Within Rounds:**
```typescript
// Generate 4 samples in parallel (not sequential)
const samples = await Promise.all([
  generateSample('kick'),
  generateSample('snare'),
  generateSample('bass'),
  generateSample('melody'),
]);
```

**Sequential Round Generation:**
```typescript
// Rounds must be sequential (BLIP depends on previous round images)
const round1 = await generateRound(1, userPrompt);
const round2 = await generateRound(2, getBLIPCaptions(round1));
const round3 = await generateRound(3, getBLIPCaptions(round2));
const round4 = await generateRound(4, getBLIPCaptions(round3));
```

**Estimated Timeline:**
- Round 1: ~30 seconds (4 audio + 4 image parallel, then 4 BLIP)
- Round 2: ~30 seconds (same pattern)
- Round 3: ~30 seconds
- Round 4: ~30 seconds
- Beat composition: ~30 seconds (Tone.js local)
- **Total: ~2.5 minutes** (well under 5-minute NFR1 target)

---

### Caching Strategy

**Session Storage Caching:**
```typescript
// Cache generated samples to prevent re-generation on refresh
const cacheKey = `corpse-beats-${userPrompt}-round${roundNumber}`;
sessionStorage.setItem(cacheKey, JSON.stringify(samples));
```

**Image/Audio Blob Caching:**
```typescript
// Convert Replicate URLs to local blobs for faster playback
const blob = await fetch(replicateUrl).then(r => r.blob());
const localUrl = URL.createObjectURL(blob);
```

---

### Video Export Optimization

**MediaRecorder Configuration:**
```typescript
const recorder = new MediaRecorder(combinedStream, {
  mimeType: 'video/webm;codecs=vp9', // VP9 for better compression
  videoBitsPerSecond: 2500000, // 2.5Mbps for 720p quality
  audioBitsPerSecond: 128000, // 128kbps for audio
});

// Target: 90-second video at 2.5Mbps = ~28MB (under 50MB NFR13)
```

**Canvas Rendering Strategy:**
```typescript
// Pre-render grid layout to canvas before recording
const canvas = document.createElement('canvas');
canvas.width = 1280; // 720p
canvas.height = 720;
const ctx = canvas.getContext('2d')!;

// Draw 2x2 grid of round visuals
function renderFrame(currentTime: number) {
  // Clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Draw round 1 (top-left quadrant)
  ctx.drawImage(round1Image, 0, 0, 640, 360);

  // Draw round 2 (top-right quadrant)
  ctx.drawImage(round2Image, 640, 0, 640, 360);

  // Draw round 3 (bottom-left quadrant)
  ctx.drawImage(round3Image, 0, 360, 640, 360);

  // Draw round 4 (bottom-right quadrant)
  ctx.drawImage(round4Image, 640, 360, 640, 360);

  // Add overlays (round numbers, progress bar, etc.)
  drawOverlays(ctx, currentTime);
}

// Capture canvas stream at 30fps
const stream = canvas.captureStream(30);
```

---

## Implementation Guidance

### Epic 1: Foundation & Proof of Concept (2 hours)

**Story 1.1: Project Setup**
```bash
# Initialize Next.js with TypeScript
npx create-next-app@latest corpse-beats --typescript --tailwind --app --no-src-dir

# Install shadcn/ui
npx shadcn@latest init

# Install dependencies
npm install replicate tone tonal

# Install dev dependencies
npm install -D @playwright/test husky lint-staged

# Set up git hooks
npx husky init
```

**Story 1.2: Replicate API Integration**
```typescript
// .env.local
REPLICATE_API_TOKEN=your_replicate_api_token_here

// lib/replicate.ts
import Replicate from 'replicate';

export const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN!,
});

// Test with health check
export async function testReplicateConnection() {
  const output = await replicate.run("google/lyria-2", {
    input: { prompt: "test audio", duration: 5 }
  });
  console.log("Replicate connection successful:", output);
}
```

**Story 1.3-1.5: POC Implementation**
- Use shadcn/ui `Input` + `Button` for landing page
- Single audio generation with Lyria-2
- Single image generation with Flux Schnell
- Display in `Card` components

---

### Epic 2: Multi-Round Corruption (2.5 hours)

**Story 2.1: BLIP Integration**
```typescript
// lib/corruption.ts
export async function generateCorruptedPrompt(
  imageUrls: string[],
  roundNumber: 2 | 3 | 4
): Promise<string> {
  // Get BLIP captions for all images from previous round
  const captions = await Promise.all(
    imageUrls.map(url => generateBLIPCaption(url))
  );

  // Combine captions
  const combinedCaption = captions.join(', ');

  // Apply round-specific corruption parameters
  const corruptionParams = CORRUPTION_PARAMS[roundNumber];

  return `${combinedCaption}, ${corruptionParams.modifiers}`;
}

const CORRUPTION_PARAMS = {
  2: { modifiers: 'slightly off-kilter rhythm, dusty muted tones...' },
  3: { modifiers: 'dark brooding atmosphere, deep bass...' },
  4: { modifiers: 'nightmare horror soundscape, screaming dissonance...' },
};
```

**Story 2.2-2.5: Pipeline + UI**
- Implement 4-round sequential loop
- Build `GenerationGrid` component with round color theming
- Add pastel-to-horror CSS transitions
- Implement loading states with `Skeleton`

---

### Epic 3: Beat Composition & Video Export (1.5 hours)

**Story 3.1-3.2: Tone.js Integration**
```typescript
// lib/audio-engine.ts
import * as Tone from 'tone';

export async function composeBeat(samples: Sample[]): Promise<Tone.Player[]> {
  await Tone.start(); // Required for browser autoplay

  const players: Tone.Player[] = [];

  // Load all samples into Tone.js Players
  for (const sample of samples) {
    const player = new Tone.Player(sample.audioUrl).toDestination();
    await player.load();
    players.push(player);
  }

  // Arrange samples on timeline (progressive layering)
  const timeline = new Tone.Part((time, sample) => {
    sample.player.start(time);
  }, [
    // Round 1 samples (0-20s)
    { time: '0:0', player: players[0] }, // kick
    { time: '0:0', player: players[1] }, // snare

    // Round 2 samples (20-40s) - add to existing
    { time: '20:0', player: players[4] }, // corrupted kick

    // Continue layering...
  ]);

  Tone.Transport.start();
  timeline.start(0);

  return players;
}
```

**Story 3.3: Audio Player UI**
```typescript
// components/audio-player.tsx
export function AudioPlayer({ samples }: { samples: Sample[] }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  const togglePlay = async () => {
    if (isPlaying) {
      Tone.Transport.pause();
    } else {
      await Tone.start();
      Tone.Transport.start();
    }
    setIsPlaying(!isPlaying);
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex gap-2">
        <Button onClick={togglePlay}>
          {isPlaying ? 'Pause' : 'Play'}
        </Button>
        <Button onClick={() => Tone.Transport.stop()}>Stop</Button>
      </div>
      <Slider
        value={[progress]}
        max={90}
        onValueChange={([v]) => Tone.Transport.seconds = v}
      />
    </div>
  );
}
```

**Story 3.4-3.5: Video Export**
```typescript
// lib/video-recorder.ts
export async function exportVideo(
  canvas: HTMLCanvasElement,
  audioStream: MediaStream
): Promise<Blob> {
  const videoStream = canvas.captureStream(30);
  const combinedStream = new MediaStream([
    ...videoStream.getVideoTracks(),
    ...audioStream.getAudioTracks(),
  ]);

  const chunks: Blob[] = [];
  const recorder = new MediaRecorder(combinedStream, {
    mimeType: 'video/webm;codecs=vp9',
    videoBitsPerSecond: 2500000,
    audioBitsPerSecond: 128000,
  });

  recorder.ondataavailable = (e) => chunks.push(e.data);

  return new Promise((resolve) => {
    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' });
      resolve(blob);
    };

    recorder.start();

    // Record for duration of beat (90 seconds)
    setTimeout(() => recorder.stop(), 90000);
  });
}
```

---

## Risk Mitigation

### Technical Risks

**Risk 1: Replicate API Rate Limits**
- **Mitigation**: Exponential backoff retry (NFR2)
- **Fallback**: Reduce samples to 3 per round (12 total vs 16)
- **Monitoring**: Track API response times, alert if >5 seconds

**Risk 2: Lyria-2 API Changes or Downtime**
- **Mitigation**: Backup to `meta/musicgen` model
- **Testing**: Validate both models in Story 1.2
- **Detection**: Try-catch with model fallback logic

**Risk 3: Video Export Encoding Performance**
- **Mitigation**: MediaRecorder API is native (predictable performance)
- **Testing**: Test on target hardware (laptop) in Story 3.4
- **Fallback**: Reduce video duration to 60 seconds if encoding >2 minutes

**Risk 4: Browser Compatibility**
- **Mitigation**: Target modern Chrome/Firefox (primary demo environment)
- **Testing**: Playwright tests on Chrome, Firefox
- **Documentation**: Clearly state browser requirements

---

### Timeline Risks

**Risk 1: Epic 2 Complexity Overruns**
- **Mitigation**: MVP = 3 rounds (not 4) if behind schedule
- **Buffer**: 30-minute buffer built into 2.5-hour estimate
- **Checkpoint**: After Story 2.2, assess if on track

**Risk 2: Video Export (Epic 3) Failure**
- **Mitigation**: Epic 2 delivers playback (acceptable demo without video)
- **Priority**: Stories 3.1-3.3 (playback) before 3.4-3.5 (video)
- **Acceptance**: Playback-only is still impressive for hackathon

---

### Quality Risks

**Risk 1: Corruption Parameters Not Dramatic Enough**
- **Mitigation**: Tweak prompts in real-time during testing
- **Testing**: Generate test samples for each round, validate aesthetic
- **Iteration**: Corruption params in `lib/corruption.ts` (easy to adjust)

**Risk 2: Audio Samples Not Musical**
- **Mitigation**: Lyria-2 is music-focused (vs generic audio models)
- **Fallback**: Manual prompt engineering tweaks
- **Testing**: Story 1.4 validates audio quality early

---

## Success Criteria

### MVP Success (NFR15)
- ✅ Working FR1-FR6 (generation pipeline with 4 rounds)
- ✅ FR9 (basic playback with Tone.js)
- ✅ Pastel-to-horror visual corruption visible in UI
- ✅ Demo-able in 2 minutes (enter prompt → watch corruption → hear beat)

### Full Success
- ✅ All 3 epics complete (16 stories)
- ✅ Video export working (FR11-FR14)
- ✅ Deployed to Vercel/Netlify
- ✅ GitHub repo with meaningful commits
- ✅ Shareable video output (<50MB, 720p)

### Stretch Success
- ✅ Minichord MIDI input (FR19)
- ✅ musicgen-remixer integration (Round 4 enhancement)
- ✅ Live jam mode (FR20-FR21)

---

## Next Steps

1. **Review this architecture document** with stakeholders (you!)
2. **Begin Story 1.1** - Project setup and infrastructure
3. **Validate Replicate models** in Story 1.2 (test all 3 models)
4. **Iterate on corruption parameters** during Story 2.3 testing
5. **Deploy early and often** - Push to Vercel after Epic 1 completion

---

## Appendix

### Estimated API Costs

**Per Generation:**
- Lyria-2: 16 samples × ~$0.05 = **~$0.80**
- Flux Schnell: 16 images × $0.003 = **$0.048**
- BLIP: 12 images (rounds 2-4) × $0.00022 = **$0.0026**
- **Total per generation: ~$0.85**

**Hackathon budget**: 10 test runs = **~$8.50 total** (very affordable)

---

### Reference Documentation

- [Replicate Lyria-2 Model](https://replicate.com/google/lyria-2)
- [Replicate Flux Schnell Model](https://replicate.com/black-forest-labs/flux-schnell)
- [Replicate BLIP Model](https://replicate.com/salesforce/blip)
- [Tone.js Documentation](https://tonejs.github.io/)
- [shadcn/ui Components](https://ui.shadcn.com/)
- [MediaRecorder API (MDN)](https://developer.mozilla.org/en-US/docs/Web/API/MediaRecorder)

---

**Architecture Status:** ✅ **APPROVED FOR IMPLEMENTATION**

**Next Action:** Begin development with Story 1.1 (Project Setup and Infrastructure)
