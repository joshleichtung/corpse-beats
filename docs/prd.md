# Corpse Beats Product Requirements Document (PRD)

## Goals and Background Context

### Goals

- Create a fun, interactive exquisite corpse sample pack generator that evolves from pastel aesthetics to horror
- Demonstrate multi-modal AI orchestration (audio generation → image generation → prompt mutation → repeat)
- Build a complete hackathon demo within 6 hours that showcases Replicate and DigitalOcean capabilities
- Generate shareable music video outputs that visualize the evolution from chill beats to nightmare audio
- Maximize development velocity using open source libraries, MCP servers, and Claude Code skills
- Have fun building something creatively "dumb" without pressure to win prizes

### Background Context

Corpse Beats is a hackathon project for the Dumb Things AI Hackathon, focusing on creative misuse of AI for entertainment. The concept combines the traditional "exquisite corpse" art game with modern AI music generation, creating an automated pipeline where AI models iteratively corrupt each other's outputs. Starting from an innocent text prompt like "lo-fi study beats with pastel colors," the system generates audio samples and matching visuals through 4 rounds of generation, with each round interpreting the previous round's images as new prompts. This creates a natural degradation arc from peaceful pastels to nightmare fuel, culminating in an auto-composed beat and music video.

The project targets solo development within a 6-hour window, prioritizing automation over user interaction and leveraging existing tools (Tone.js, P5.js, Replicate models, FFmpeg) to maximize output quality within tight time constraints. The pastel-to-horror aesthetic is core to the concept, not decorative.

### Change Log

| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2025-10-25 | 0.1 | Initial PRD draft | John (PM) |

---

## Requirements

### Functional Requirements

**Core Generation Pipeline:**
- **FR1:** System accepts text prompt input (e.g., "lo-fi study beats with pastel colors") as seed for generation chain
- **FR2:** System generates 4-8 audio samples per generation round using Replicate AI models (kick, snare, bass, melody/pad)
- **FR3:** System generates corresponding visual image for each audio sample using AI image generation
- **FR4:** System executes 4 sequential generation rounds, where each round interprets previous round's images as text prompts for new audio/visual generation
- **FR5:** Each generation round applies progressive "corruption" parameters to shift aesthetic from pastel/chill to dark/horror
- **FR6:** System displays real-time progress indicator showing current generation round and sample status

**Beat Composition & Playback:**
- **FR7:** System auto-composes a 60-90 second beat using samples from all 4 generation rounds
- **FR8:** Beat composition progressively layers samples, starting with Round 1 (chill) and adding corrupted layers (Rounds 2-4)
- **FR9:** System provides playback controls (play, pause, stop, scrub timeline) for composed beat
- **FR10:** Visual timeline displays which samples are active at each point in the beat

**Video Export:**
- **FR11:** System generates music video combining composed beat audio with visual timeline
- **FR12:** Video includes split-screen or grid view showing sample evolution across rounds
- **FR13:** Video applies pastel-to-horror color grading that mirrors audio corruption arc
- **FR14:** System provides download link for exported video file (MP4 format)

**UI & Presentation:**
- **FR15:** Landing page displays project title, description, and prompt input field with "Generate" button
- **FR16:** Generation view displays 4x grid showing each round's samples (audio waveforms + visuals)
- **FR17:** System displays sample metadata (round number, generation parameters, prompt used)
- **FR18:** Pastel horror aesthetic is applied consistently across all UI elements (colors, typography, layout)

**Stretch Goals (Time Permitting):**
- **FR19:** System accepts MIDI input from Minichord device as alternative seed (melody instead of text)
- **FR20:** Live Jam Mode: Load final sample pack into drum machine UI with playback pads
- **FR21:** Live Jam Mode: Record user's Minichord performance over sample pack as bonus video export

### Non-Functional Requirements

**Performance & Reliability:**
- **NFR1:** Total generation pipeline (4 rounds, beat composition, video export) completes within 5 minutes maximum
- **NFR2:** System handles AI model API failures gracefully with retry logic (max 3 retries per call)
- **NFR3:** UI remains responsive during generation with clear progress feedback (no frozen states)

**Technical Constraints:**
- **NFR4:** Frontend runs entirely in browser (no backend server required for deployment)
- **NFR5:** All AI inference calls route through Replicate API or DigitalOcean serverless endpoints
- **NFR6:** Video generation uses browser-based FFmpeg.js (no server-side video processing)
- **NFR7:** Audio playback and sequencing uses Tone.js library exclusively

**Development Velocity:**
- **NFR8:** Leverage existing open source libraries for all non-core functionality (music theory, audio synthesis, visual generation, video compilation)
- **NFR9:** Create custom Claude Code skills for repetitive workflows (sample generation orchestration, Replicate API calls)
- **NFR10:** Use MCP servers where applicable (Replicate MCP for API integration, Playwright for testing)

**Quality & Demo Requirements:**
- **NFR11:** Generated audio samples must be recognizable as musical elements (not pure noise) even in final corrupted round
- **NFR12:** Visual corruption arc must be perceptually clear (pastel → dark pastels → horror) to demo audiences
- **NFR13:** Video export quality sufficient for social media sharing (720p minimum, <50MB file size)

**Scope Management:**
- **NFR14:** All features beyond FR1-FR18 are explicitly marked as stretch goals and deprioritized if time constrained
- **NFR15:** MVP success defined as: working FR1-FR6 (generation pipeline) + FR9 (basic playback) only

---

## User Interface Design Goals

### Overall UX Vision

Corpse Beats embraces a deliberately unsettling aesthetic journey that mirrors the audio corruption arc. The interface starts with soft, inviting pastel colors and clean typography, gradually introducing visual glitches, color shifts, and horror elements as generation progresses. The UX should feel like a playful creative tool that slowly reveals its sinister nature - not scary upfront, but progressively "off" in ways that delight and surprise.

Key UX principles:
- **Immediate gratification:** One text box, one button to start the chaos
- **Transparent magic:** Show the generation process happening in real-time (no black boxes)
- **Passive entertainment:** User watches the corruption unfold, minimal interaction required
- **Shareable moments:** Video export is the trophy, not just a feature

### Key Interaction Paradigms

1. **Single-Action Launch:** One input field + one button triggers entire pipeline
2. **Real-time Progress Theatre:** Generation happens visibly with animated waveforms, loading states, round transitions
3. **Grid-Based Evolution Display:** 4x4 or similar grid layout shows all rounds simultaneously for comparison
4. **Hover Previews:** Hovering over any sample plays a short preview (2-3 seconds)
5. **Auto-Play on Complete:** When beat composition finishes, it auto-plays immediately
6. **One-Click Export:** Video export is a single button - no configuration

### Core Screens and Views

1. **Landing/Input Screen:** Title, tagline, text prompt input, Generate button, optional examples
2. **Generation View:** 4-round grid showing samples being created in real-time, progress indicator
3. **Playback View:** Audio player with timeline, visual representation of beat structure
4. **Video Export View:** Preview of final video, download button
5. **Error State:** Friendly error message with pastel-horror styling if API fails

### Accessibility: None

Hackathon scope - accessibility features removed to maximize development velocity.

### Branding

**Aesthetic Philosophy: "Pastel Nightmare"**

**CRITICAL DESIGN MANDATE:**
- **Use shadcn/ui component library** (https://github.com/birobirobiro/awesome-shadcn-ui) with custom theming
- **NO STANDARD PURPLE AI SLOP** - avoid typical AI app aesthetics entirely
- Architect selects specific components from shadcn/ui ecosystem

**Visual References (PRIMARY INSPIRATION):**
- **Suspiria (1977):** Dario Argento's saturated color horror - vivid reds, blues, greens in unsettling contexts
- **The Neon Demon (2016):** Nicolas Winding Refn's neon pastels meets fashion horror - stark, beautiful, disturbing
- **Earthbound (SNES):** Quirky pastel RPG graphics with psychedelic horror undertones - playful corruption

**Color Palette Evolution:**
- **Round 1 (Innocent):** Soft pastels - bubblegum pink, baby blue, mint cream, warm whites
- **Round 2 (Uneasy):** Muted/dusty pastels - faded rose, wilted sage, aged paper tones
- **Round 3 (Ominous):** Deep pastels shifting dark - bruised plum, murky olive, ash gray
- **Round 4 (Horror):** Saturated nightmare - dried blood red, rotten eggplant, bile green, near-black

**Key Aesthetic Principles:**
- Vibrant saturation (Suspiria) not washed-out pastels
- Neon accents where appropriate (Neon Demon)
- Playful-yet-wrong pixel/retro touches (Earthbound)
- Gradual corruption visible in UI itself (colors shift, subtle glitches appear)

### Target Device and Platforms: Web Responsive

**Primary:** Desktop/laptop browsers (Chrome, Firefox, Safari)
**Secondary:** Tablet landscape mode (bonus if it works)
**Explicitly NOT targeting:** Mobile phones (resource-intensive, screen too small)

**Technical Notes:**
- Modern evergreen browsers only
- shadcn/ui provides responsive utilities

---

## Technical Assumptions

### Repository Structure: Single Repository

Standard single repository containing all project code (Next.js app, config, assets). No monorepo tooling needed.

**Rationale:** Hackathon simplicity - single Next.js app doesn't need multi-package management.

### Service Architecture

**Client-Side Only (Static Web App):**
- Frontend: Next.js (React) deployed as static site
- No backend server or API layer
- All AI inference via direct API calls to Replicate from browser
- Browser-based audio synthesis (Tone.js) and video generation

**API Integration:**
- **Replicate API** for AI model inference (audio, image generation)
- **Use Replicate MCP Server** (@modelcontextprotocol/server-replicate) for API integration
- API key available and ready for `.env.local` configuration

**Rationale:** Zero deployment complexity - host on Vercel/Netlify with one command. Replicate MCP streamlines model discovery and usage.

### Testing Requirements

**Playwright for E2E Validation:**
- Progressive validation as features are built
- Test critical paths: prompt input → generation → playback → export
- Visual regression testing for pastel-horror color shifts
- No unit tests (hackathon speed priority)

**Continuous Validation:**
- TypeScript compilation must pass before each commit (`tsc --noEmit`)
- ESLint must pass before each commit (`eslint .`)
- Playwright smoke tests run before pushing to GitHub
- Use git hooks (Husky) to enforce quality gates

**Rationale:** Playwright catches integration issues early without slowing down development. TypeScript + lint ensure code quality without extensive testing overhead.

### Development Workflow

**Progressive Git Workflow:**
- Commit frequently (every completed feature/component)
- Push to GitHub after each successful commit
- Branch strategy: `main` branch only (no feature branches for solo hackathon)
- Commit messages: Conventional Commits format (`feat:`, `fix:`, `chore:`)

**Quality Gates (Run Before Every Commit):**
1. TypeScript compilation check
2. ESLint validation
3. Playwright critical path tests
4. Only commit if all three pass

**Rationale:** Frequent commits create restore points. Progressive validation prevents broken states from accumulating.

### Technology Stack

**Frontend Framework:**
- **Next.js 14+** (App Router) with TypeScript
- **React 18+** for UI components
- **shadcn/ui** component library (https://github.com/birobirobiro/awesome-shadcn-ui)
- **Tailwind CSS** for styling (comes with shadcn/ui)

**Audio:**
- **Tone.js** - WebAudio synthesis, sequencing, music theory utilities
- **Tonal** - Music theory helpers (chord progressions, scales)
- Browser Web Audio API (via Tone.js abstractions)

**Visuals:**
- **P5.js** or **Canvas API** - Generative visual art for sample visualizations
- **Framer Motion** - Animations (included with shadcn/ui)

**Video:**
- Architect chooses best option: **FFmpeg.js** (WebAssembly) or **MediaRecorder API**
- Decision based on browser compatibility and performance testing

**AI/Inference:**
- **Replicate API** via MCP Server (@modelcontextprotocol/server-replicate)
- **Models:** Architect researches and selects appropriate models for:
  - Audio generation (MusicGen, AudioCraft, ByteDance models, etc.)
  - Image generation (Flux, SDXL, etc.)
  - Video generation (optional stretch - Veo3, etc.)

**Development Tools:**
- **TypeScript 5+** - Type safety (strict mode enabled)
- **ESLint** - Code linting with Next.js + TypeScript rules
- **Prettier** - Code formatting (auto-format on save)
- **Playwright** - E2E testing and validation
- **Husky** - Git hooks for pre-commit quality checks

**MCP Servers & Claude Code Skills:**
- **@modelcontextprotocol/server-replicate** - Replicate API integration (MANDATORY)
- **Playwright MCP** - Browser testing automation
- **Custom Skills** - Build skills for:
  - Sample generation orchestration
  - Replicate API call patterns
  - Video compilation workflows

**Deployment:**
- **Vercel** or **Netlify** - Static site hosting (auto-deploy from GitHub)
- **Environment Variables:**
  - `REPLICATE_API_TOKEN` - API key ready for configuration
  - Store in `.env.local` (gitignored) and platform secrets for deployment

**Rationale for Stack:**
- **Next.js + TypeScript:** Industry standard, excellent DX, instant Vercel deployment
- **shadcn/ui + Tailwind:** Rapid UI development, professional polish
- **Tone.js:** Most mature WebAudio library, extensive documentation
- **Replicate MCP:** Simplifies model discovery, API integration, prompt engineering

### Additional Technical Assumptions and Requests

**Open Source Leverage Strategy:**
- Prioritize existing libraries over custom implementations
- Use npm packages for all non-core functionality
- Leverage awesome-shadcn-ui examples for UI patterns
- Use Replicate MCP for model research and integration

**Performance Targets:**
- Page load: <3 seconds
- Generation pipeline: <5 minutes total (all 4 rounds + beat + video)
- Audio playback latency: <100ms
- Video export: <2 minutes for 90-second video

**Browser Compatibility:**
- Chrome 120+ (primary)
- Firefox 120+ (secondary)
- Safari 17+ (bonus)
- No IE, no legacy browser support

**API Rate Limits & Costs:**
- Use Replicate free tier or hackathon credits
- Implement exponential backoff for rate limit errors
- Cache API responses in session storage where possible

**Code Quality Standards:**
- TypeScript strict mode enabled
- No `any` types except for third-party library integration
- ESLint errors block commits (warnings allowed)
- Prettier auto-format on save

**Security Considerations:**
- API keys never committed to repo (`.env.local` in `.gitignore`)
- Client-side API calls acceptable for hackathon (not production-grade security)
- No user authentication or data persistence required

---

## Epic List

### Epic 1: Foundation & Proof of Concept
Establish project infrastructure, basic UI, and single-round generation to prove the technical feasibility of AI audio/image generation pipeline.

### Epic 2: Multi-Round Corruption Pipeline
Implement the exquisite corpse mechanics with 4 sequential generation rounds, image-to-text interpretation, and progressive pastel-to-horror visual evolution.

### Epic 3: Beat Composition & Video Export
Auto-compose beats from generated samples, implement playback with visual timeline, and export final music video with corruption arc visualization.

---

## Epic 1: Foundation & Proof of Concept

**Goal:** Establish project infrastructure with Next.js, TypeScript, shadcn/ui, and Replicate API integration. Validate technical feasibility by implementing single-round generation (one text prompt → audio sample + visual image). Deliver a working proof-of-concept that demonstrates the core AI generation pipeline, even if multi-round corruption is not yet implemented.

### Story 1.1: Project Setup and Infrastructure

As a **developer**,
I want **a fully configured Next.js project with TypeScript, shadcn/ui, Git, and quality gates**,
so that **I have a solid foundation to build features without configuration overhead**.

#### Acceptance Criteria:
1. Next.js 14+ project initialized with App Router and TypeScript in strict mode
2. shadcn/ui installed and configured with Tailwind CSS
3. Git repository initialized with `.gitignore` (includes `.env.local`)
4. ESLint and Prettier configured with Next.js + TypeScript rules
5. Husky pre-commit hooks installed for TypeScript check, ESLint, and Playwright
6. GitHub repository created and initial commit pushed
7. `package.json` includes scripts: `dev`, `build`, `type-check`, `lint`, `test:smoke`
8. Project runs locally with `npm run dev` showing default Next.js page
9. Vercel or Netlify deployment configured (auto-deploy from main branch)

### Story 1.2: Replicate API Integration

As a **developer**,
I want **Replicate API configured via MCP server with environment variables**,
so that **I can make AI model inference calls without manual API setup**.

#### Acceptance Criteria:
1. `@modelcontextprotocol/server-replicate` MCP server installed and configured
2. `.env.local` file created with `REPLICATE_API_TOKEN` (gitignored)
3. Environment variable loaded in Next.js app config
4. Test API call to Replicate health endpoint succeeds
5. Error handling implemented for API failures (retry logic with exponential backoff)
6. TypeScript types defined for Replicate API responses
7. Playwright test validates API integration (mock or real call)

### Story 1.3: Landing Page with Prompt Input

As a **user**,
I want **a landing page with a text input and Generate button**,
so that **I can enter a prompt to start the generation process**.

#### Acceptance Criteria:
1. Landing page displays project title "Corpse Beats" with tagline
2. Text input field for prompt (shadcn/ui Input component)
3. Generate button (shadcn/ui Button component) below input
4. Placeholder text in input: "lo-fi study beats with pastel colors"
5. Example prompts displayed below input (optional click-to-fill)
6. Pastel color scheme applied (Round 1 colors from Branding section)
7. Responsive layout works on desktop and tablet
8. Button disabled state when prompt is empty
9. Playwright test validates input and button interaction

### Story 1.4: Single Audio Sample Generation

As a **user**,
I want **to generate one audio sample from my text prompt**,
so that **I can validate the AI audio generation works**.

#### Acceptance Criteria:
1. Clicking Generate button triggers Replicate API call for audio generation
2. Audio model selected by architect (e.g., MusicGen, AudioCraft)
3. Loading state displayed while API call in progress (spinner + status text)
4. Generated audio sample received as file/blob
5. Audio waveform visualization displayed (Canvas API or library)
6. Play button allows playback of generated audio sample
7. Error state displayed if API call fails (with retry option)
8. TypeScript strict typing for audio generation flow
9. Playwright test validates end-to-end: prompt → API call → audio received

### Story 1.5: Single Image Generation from Audio

As a **user**,
I want **a visual image generated based on the audio sample**,
so that **I can see the AI interpreting audio as visuals**.

#### Acceptance Criteria:
1. After audio generation completes, trigger image generation API call
2. Image prompt derived from original text prompt (simple pass-through for POC)
3. Image model selected by architect (e.g., Flux, SDXL)
4. Generated image displayed in UI (shadcn/ui Card component)
5. Image uses pastel color palette matching Round 1 aesthetic
6. Loading state for image generation distinct from audio loading
7. Both audio and image displayed side-by-side or stacked
8. Error handling for image generation failures (retry logic)
9. Playwright test validates: prompt → audio → image pipeline

### Story 1.6: Proof of Concept Polish and Validation

As a **developer**,
I want **the POC to be polished, tested, and committed to Git**,
so that **Epic 1 delivers a demo-worthy milestone**.

#### Acceptance Criteria:
1. UI styled with pastel colors from Branding (Round 1 palette)
2. Typography and spacing follow shadcn/ui design system
3. All TypeScript compilation passes (`npm run type-check`)
4. All ESLint rules pass (`npm run lint`)
5. Playwright smoke tests pass (prompt input → generation → display)
6. Code committed to Git with meaningful commit messages
7. Changes pushed to GitHub successfully
8. Vercel/Netlify deployment shows working POC
9. Demo script prepared: "Enter prompt, generate audio + image, show result"

---

## Epic 2: Multi-Round Corruption Pipeline

**Goal:** Implement the exquisite corpse mechanics where AI models iteratively corrupt each other's outputs across 4 sequential rounds. Each round interprets the previous round's images as new text prompts, generating progressively darker audio samples and visuals. Deliver the core concept with clear visual evolution from pastel innocence to horror nightmare.

### Story 2.1: Image-to-Text Prompt Interpretation

As a **developer**,
I want **AI to interpret an image and generate a descriptive text prompt**,
so that **I can chain generation rounds (image → text → new audio/image)**.

#### Acceptance Criteria:
1. Image-to-text model integrated via Replicate API (e.g., BLIP, LLaVA)
2. Function accepts image URL/blob and returns text description
3. Description focuses on mood, color, style (not literal objects)
4. Prompt engineering guides descriptions toward audio-generation context
5. TypeScript types defined for image-to-text flow
6. Error handling for failed image interpretation (retry or fallback)
7. Test case: pastel image → "soft dreamy atmosphere" description
8. Playwright test validates image → text conversion

### Story 2.2: Four-Round Sequential Generation Loop

As a **user**,
I want **the system to automatically run 4 rounds of generation**,
so that **I can watch the corruption evolve without manual intervention**.

#### Acceptance Criteria:
1. Generation loop runs 4 sequential rounds automatically after initial prompt
2. Each round generates 4-8 audio samples (configurable, architect decides count)
3. Each audio sample gets corresponding image generation
4. Round N uses Round N-1 images to generate new text prompts via image-to-text
5. Progress indicator shows current round (1/4, 2/4, 3/4, 4/4)
6. All rounds complete before displaying final results
7. Error in one sample doesn't break entire pipeline (graceful degradation)
8. Total pipeline time tracked and displayed to user
9. Playwright test validates full 4-round completion

### Story 2.3: Corruption Parameter System

As a **developer**,
I want **progressive corruption parameters applied to each round**,
so that **audio/visuals evolve from pastel chill to dark horror**.

#### Acceptance Criteria:
1. Corruption parameters defined per round (architect determines specifics):
   - Round 1: baseline (chill, pastel)
   - Round 2: subtle shift (uneasy, muted)
   - Round 3: noticeable corruption (ominous, dark)
   - Round 4: full horror (nightmare, intense)
2. Audio parameters may include: tempo shifts, dissonance levels, genre shifts
3. Image parameters include: color grading, saturation, darkness, horror keywords
4. Parameters injected into Replicate API prompts for each round
5. Configuration stored in TypeScript constants (easy to tweak)
6. Corruption visibly different between rounds (testable via screenshots)
7. Playwright visual regression test validates color progression

### Story 2.4: Grid UI for Round Comparison

As a **user**,
I want **a grid layout showing all 4 rounds side-by-side**,
so that **I can visually compare the corruption arc**.

#### Acceptance Criteria:
1. Grid layout displays 4 columns (one per round) using shadcn/ui Card components
2. Each round shows: round number, samples (audio waveforms + images), prompts used
3. Samples within round displayed in sub-grid (2x2 or 2x4 layout)
4. Hover over any sample shows metadata (generation parameters, model used)
5. Click any audio waveform to play preview (2-3 seconds)
6. Responsive layout: desktop shows 4 columns, tablet stacks to 2x2, mobile gets scroll
7. Loading states show which round/sample is currently generating
8. Grid uses color-coded borders matching round corruption level
9. Playwright test validates grid displays all rounds correctly

### Story 2.5: Pastel-to-Horror Visual Theming

As a **user**,
I want **the UI itself to shift from pastel to horror as rounds progress**,
so that **the interface mirrors the audio/visual corruption**.

#### Acceptance Criteria:
1. UI background color shifts per round (Round 1 palette → Round 4 palette)
2. Text color adjusts for contrast as backgrounds darken
3. Typography remains readable throughout all corruption stages
4. Subtle visual effects applied progressively:
   - Round 1: clean, soft shadows
   - Round 2: slight grain/noise texture
   - Round 3: blur effects, increased noise
   - Round 4: glitch effects, dramatic shadows
5. Transitions between rounds are smooth (CSS animations)
6. Visual references honored: Suspiria (saturated colors), Neon Demon (neon accents), Earthbound (playful-wrong)
7. No standard purple AI aesthetics used anywhere
8. Playwright visual regression test captures each round's theme
9. UI corruption enhances demo impact (judges see immediate visual evolution)

---

## Epic 3: Beat Composition & Video Export

**Goal:** Transform generated samples into a cohesive musical beat using Tone.js, implement playback controls with visual timeline, and export a shareable music video that visualizes the corruption arc. Deliver the final "trophy" feature that makes Corpse Beats shareable and demo-complete.

### Story 3.1: Tone.js Audio Sequencer Setup

As a **developer**,
I want **Tone.js configured to sequence and playback multiple audio samples**,
so that **I can programmatically compose beats from generated samples**.

#### Acceptance Criteria:
1. Tone.js library installed and initialized in Next.js app
2. All generated audio samples loaded into Tone.js Players
3. Samples assigned to Tone.js Transport timeline
4. Basic playback works (play all samples in sequence)
5. Audio context started on user interaction (browser autoplay restrictions)
6. TypeScript types defined for Tone.js integration
7. Error handling for audio loading failures
8. Playwright test validates Tone.js initialization and playback

### Story 3.2: Auto-Compose Beat from All Samples

As a **user**,
I want **the system to automatically arrange samples into a 60-90 second beat**,
so that **I hear a cohesive musical composition, not random chaos**.

#### Acceptance Criteria:
1. Beat composition algorithm arranges samples across 60-90 second timeline
2. Progressive layering: starts with Round 1 samples (chill), adds corrupted layers (Rounds 2-4)
3. Drum samples (kicks, snares) aligned to tempo grid (BPM detected or set)
4. Bass and melody samples layered appropriately (architect determines arrangement logic)
5. Beat structure has intro (Round 1), build-up (Round 2-3), climax (Round 4)
6. Final beat sounds musical (not just noise concatenation)
7. Composition uses music theory from Tonal library where applicable
8. Beat auto-plays when composition completes (user expects to hear it)
9. Playwright test validates beat composition completes and plays

### Story 3.3: Playback Controls and Visual Timeline

As a **user**,
I want **playback controls (play, pause, scrub) and a visual timeline**,
so that **I can control playback and see which samples are active**.

#### Acceptance Criteria:
1. Playback controls UI: Play/Pause button, Stop button, timeline scrubber
2. Timeline displays 60-90 second duration with visual markers for samples
3. Round-color-coded segments show which round's samples are active
4. Scrubber allows jumping to any point in beat (draggable or clickable)
5. Current playback position updates in real-time (progress bar animation)
6. Waveform visualization syncs with playback (optional: animated frequency bars)
7. Controls use shadcn/ui Button components with custom styling
8. Keyboard shortcuts: Space (play/pause), Arrow keys (scrub)
9. Playwright test validates playback control interactions

### Story 3.4: Video Compilation Setup

As a **developer**,
I want **video export capability using FFmpeg.js or MediaRecorder API**,
so that **I can generate a music video combining audio and visuals**.

#### Acceptance Criteria:
1. Video library chosen by architect (FFmpeg.js or MediaRecorder API)
2. Video compilation combines:
   - Composed beat as audio track
   - Visual timeline showing sample evolution (grid or split-screen)
   - Round-color-coded backgrounds matching corruption arc
3. Video resolution: 720p minimum (1280x720)
4. Video duration matches beat length (60-90 seconds)
5. Encoding settings balance quality and file size (<50MB target)
6. Progress indicator during video generation (encoding can take time)
7. Error handling for video compilation failures
8. TypeScript types for video generation flow
9. Playwright test validates video file generated successfully

### Story 3.5: Video Export with Download

As a **user**,
I want **to download the generated music video**,
so that **I can share it on social media or show it to others**.

#### Acceptance Criteria:
1. "Export Video" button triggers video compilation
2. Loading state shows encoding progress (percentage or spinner)
3. Video preview displayed after compilation completes (HTML5 video player)
4. Download button provides video file (MP4 format)
5. Filename includes timestamp: `corpse-beats-{timestamp}.mp4`
6. Video quality sufficient for social media (720p, acceptable compression)
7. Optional: Social share buttons (copy link, Twitter, etc.)
8. Success message confirms download initiated
9. Playwright test validates: export → compile → download flow
10. Epic 3 complete = fully demo-worthy product with shareable output

---

## Checklist Results Report

*(To be completed after PM checklist execution)*

---

## Next Steps

### UX Expert Prompt

*(To be generated)*

### Architect Prompt

*(To be generated)*
