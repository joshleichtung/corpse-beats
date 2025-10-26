# Corpse Beats

> An AI exquisite corpse that turns pastel lo-fi prompts into horror soundtracks

**Hackathon:** Dumb Things AI Hackathon 2025  
**Live Demo:** [https://corpsebeats-5zrnj.ondigitalocean.app/](https://corpsebeats-5zrnj.ondigitalocean.app/)

---

## Highlights
- Four-round “pastel to nightmare” pipeline chaining audio, image, and caption models
- Rate-limit-aware orchestration with retries so Replicate free tier survives the demo
- shadcn/ui dashboard with round-aware theming, carousel playback, and inline progress
- Optional Kling v2.1 video export that leans into the final round’s horror aesthetic
- Deep documentation: see `docs/prd.md` for product scope and `docs/architecture.md` for system design

---

## How It Works
1. **Seed Prompt:** User supplies an innocent idea (`app/page.tsx` Input). The client enhances it per round using `lib/prompt-engineering.ts` and `lib/corruption.ts` for audio vs. image modifiers.
2. **Round Generation:** `lib/generation-client.ts` calls `/api/generate-audio`, waits out Replicate’s six-requests-per-minute limit, hits `/api/generate-image`, then `/api/caption-image`. All endpoints share token validation, retry logic, and 500-character guardrails.
3. **Exquisite Corpse Loop:** The BLIP caption from each round becomes the seed for the next, steadily increasing corruption metadata (Innocent → Uneasy → Ominous → Horror).
4. **Playback UI:** Results stream into a carousel with color-coded badges, audio controls, and round summaries so viewers can watch corruption unfold live.
5. **Video Export (Optional):** `/api/generate-video` feeds the final-round prompt and imagery to `kwaivgi/kling-v2.1`, returning shareable horror snippets.

> **Note:** The UI currently generates one sample per round to keep cost predictable; raise the sample loop limit in `app/page.tsx` when you have more credits.

---

## Tech Stack
- **Framework:** Next.js 14 App Router, React 18, TypeScript (strict)
- **UI:** shadcn/ui, Tailwind CSS, Embla carousel, lucide icons, custom pastel-horror palette
- **Audio:** Tone.js sequencing + Tonal utilities for key-aware playback
- **AI Models (Replicate):**
  - `meta/musicgen:b05b...` for 8s stereo music clips
  - `black-forest-labs/flux-schnell:c846...` for rapid image renders
  - `salesforce/blip:2e1d...` for caption handoff
  - `kwaivgi/kling-v2.1:8f1d...` for optional video exports
- **Tooling:** ESLint, Playwright smoke tests, Husky hooks, tsx scripts, DigitalOcean App Platform deploy

---

## Local Development
**Prerequisites:** Node.js ≥ 18, npm, Replicate API token

1. Clone and install
   ```bash
   git clone <repo-url>
   cd dumbthings
   npm install
   ```
2. Configure environment variables
   ```bash
   cp .env.local.example .env.local
   # Set REPLICATE_API_TOKEN
   ```
3. Run the dev server
   ```bash
   npm run dev
   # visit http://localhost:3000
   ```

### Useful Scripts
- `npm run lint` – ESLint
- `npm run type-check` – TypeScript in `--noEmit` mode
- `npm run test:smoke` – Playwright sanity suite
- `npx tsx scripts/test-replicate.ts` – end-to-end Replicate connectivity check (audio → image → caption)

### Working with Rate Limits
- Replicate free tier allows ~6 requests/min; client waits 15s between model calls.
- Need faster runs? Remove the throttling delays in `lib/generation-client.ts` and upgrade your Replicate plan.

---

## Repository Tour
- `app/page.tsx` – main UI, round loop, audio/video controls
- `app/api/*` – Next.js Route Handlers for audio/image/caption/video generation and rate-limit checks
- `lib/replicate.ts` – shared client with exponential backoff, health checks, model wrappers
- `lib/corruption.ts` – round metadata, color palette, corruption helpers
- `lib/prompt-engineering.ts` – prompt enhancement, caption combining, validation utilities
- `claudedocs/` – implementation logs for corruption system + video features
- `docs/prd.md` & `docs/architecture.md` – hackathon planning artifacts
- `scripts/test-replicate.ts` – quick Replicate smoke test

---

## Hackathon Context
- Built solo in a 6-hour window for the Dumb Things AI Hackathon 2025
- Optimized for spectacle: pastel horror mood board references include *Suspiria*, *The Neon Demon*, and *Earthbound*
- Success metrics favor “wow factor” over polish; see PRD for full functional + non-functional scope

---

## Future Ideas
- Reinstate 4 samples per round with batching and caching once credits allow
- Live jam mode that loads generated samples into a drum machine UI
- Minichord MIDI seed input for tactile prompt control
- Post-processing FX pass for the exported video (chromatic aberration, jitter, grain)
- Social sharing pipeline that posts the final nightmare clip with round metadata

---

## Sponsors & Credits

### 🙏 Special Thanks

**[Replicate](https://replicate.com/)** - Core AI infrastructure sponsor
- Provides the API platform powering all four AI models
- Seamless model orchestration with automatic scaling
- Developer-friendly API with excellent TypeScript support
- Free tier perfect for hackathon prototyping

**[DigitalOcean](https://www.digitalocean.com/)** - Hosting & deployment sponsor
- App Platform for automated GitHub deployments
- Server-side rendering support for Next.js API routes
- Environment variable management for secure API tokens
- Live at: https://corpsebeats-5zrnj.ondigitalocean.app/

### 🤖 AI Models (via Replicate)

**Meta MusicGen** (`meta/musicgen:b05b1dff...`)
- 8-second stereo audio generation
- Model: `stereo-melody-large` (highest quality)
- Powers the musical corruption from cheerful to nightmarish

**Black Forest Labs Flux Schnell** (`black-forest-labs/flux-schnell:c846a699...`)
- Ultra-fast image generation (1-4 inference steps)
- 1:1 aspect ratio for carousel display
- Transforms audio-inspired prompts into pastel-horror visuals

**Salesforce BLIP** (`salesforce/blip:2e1dddc8...`)
- Image-to-text captioning model
- The "exquisite corpse" connector between rounds
- Interprets generated images as new prompts for mutation

**Kuaishou Kling v2.1** (`kwaivgi/kling-v2.1:8f1d07f8...`)
- Image-to-video generation (720p, 5 seconds)
- Brings final horror image to life with cinematic movement
- Standard mode for cost-efficient quality

### 🛠️ Built With
- **[Next.js](https://nextjs.org/)** - React framework for production
- **[shadcn/ui](https://ui.shadcn.com/)** - Beautiful component library
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first styling
- **[Embla Carousel](https://www.embla-carousel.com/)** - Smooth carousel navigation
- **[Tone.js](https://tonejs.github.io/)** - Web Audio sequencing

### 📄 License
MIT License – see `LICENSE`

---

*Happy corrupting!* 🎵👻
